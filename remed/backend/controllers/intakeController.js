const { pool } = require('../db');

// Record medicine intake (taken, skipped, or missed)
exports.recordIntake = async (req, res) => {
  const { frequencyId, status, scheduledFor, notes } = req.body;
  
  try {
    // Validate frequency exists and belongs to patient
    const [frequencies] = await pool.query(`
      SELECT f.*, m.Patient_ID 
      FROM FREQUENCY f
      JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
      WHERE f.Frequency_ID = ?
    `, [frequencyId]);
    
    if (frequencies.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    const frequency = frequencies[0];
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Record intake
      const [result] = await connection.query(
        'INSERT INTO MED_INTAKE (Frequency_ID, Status, Taken_At, Scheduled_For, Notes) VALUES (?, ?, NOW(), ?, ?)',
        [frequencyId, status, scheduledFor, notes]
      );
      
      // Update frequency status
      await connection.query(
        'UPDATE FREQUENCY SET Status = ? WHERE Frequency_ID = ?',
        [status === 'Taken' ? 'Active' : status, frequencyId]
      );
      
      // If taken, decrement inventory
      if (status === 'Taken') {
        const [medicines] = await pool.query(
          'SELECT Medicine_ID FROM FREQUENCY WHERE Frequency_ID = ?',
          [frequencyId]
        );
        
        if (medicines.length > 0) {
          const medicineId = medicines[0].Medicine_ID;
          
          // Update inventory (decrement by 1)
          await connection.query(`
            UPDATE VAULT
            SET Medicine_Pieces = GREATEST(Medicine_Pieces - 1, 0)
            WHERE Medicine_ID = ?
          `, [medicineId]);
        }
      }
      
      // Commit transaction
      await connection.commit();
      
      res.status(201).json({
        message: 'Intake recorded successfully',
        intakeId: result.insertId
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record intake error:', error);
    res.status(500).json({ message: 'Server error recording intake' });
  }
};

// Get adherence statistics for a patient
exports.getAdherenceStats = async (req, res) => {
  const patientId = req.params.patientId;
  const { startDate, endDate } = req.query;
  
  try {
    // Get adherence statistics
    const [result] = await pool.query(`
      SELECT 
        m.Medicine_ID,
        m.Medicine_Name,
        m.Dosage,
        COUNT(DISTINCT f.Frequency_ID) as Total_Frequencies,
        COUNT(DISTINCT mi.Intake_ID) as Total_Recorded,
        SUM(CASE WHEN mi.Status = 'Taken' THEN 1 ELSE 0 END) as Total_Taken,
        SUM(CASE WHEN mi.Status = 'Skipped' THEN 1 ELSE 0 END) as Total_Skipped,
        SUM(CASE WHEN mi.Status = 'Missed' THEN 1 ELSE 0 END) as Total_Missed,
        ROUND((SUM(CASE WHEN mi.Status = 'Taken' THEN 1 ELSE 0 END) / COUNT(DISTINCT mi.Intake_ID)) * 100, 2) as Adherence_Percentage
      FROM MED_CABINET m
      JOIN FREQUENCY f ON m.Medicine_ID = f.Medicine_ID
      LEFT JOIN MED_INTAKE mi ON f.Frequency_ID = mi.Frequency_ID
      WHERE m.Patient_ID = ?
        ${startDate ? 'AND mi.Scheduled_For >= ?' : ''}
        ${endDate ? 'AND mi.Scheduled_For <= ?' : ''}
      GROUP BY m.Medicine_ID
    `, [
      patientId, 
      ...(startDate ? [startDate] : []),
      ...(endDate ? [endDate] : [])
    ]);
    
    // Calculate overall adherence
    let totalTaken = 0;
    let totalRecorded = 0;
    
    result.forEach(med => {
      totalTaken += med.Total_Taken || 0;
      totalRecorded += med.Total_Recorded || 0;
    });
    
    const overallAdherence = totalRecorded > 0 
      ? Math.round((totalTaken / totalRecorded) * 100)
      : 0;
    
    // Store adherence stats for reporting
    if (result.length > 0 && startDate && endDate) {
      await Promise.all(result.map(med => 
        pool.query(
          `INSERT INTO ADHERENCE_STATS (
            Patient_ID, Medicine_ID, Period_Start, Period_End, 
            Total_Scheduled, Total_Taken, Adherence_Percentage
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            Total_Scheduled = VALUES(Total_Scheduled),
            Total_Taken = VALUES(Total_Taken),
            Adherence_Percentage = VALUES(Adherence_Percentage)`,
          [
            patientId,
            med.Medicine_ID,
            startDate,
            endDate,
            med.Total_Recorded || 0,
            med.Total_Taken || 0,
            (med.Total_Taken / med.Total_Recorded) * 100 || 0
          ]
        )
      ));
    }
    
    res.status(200).json({
      medicines: result,
      overall: {
        totalMedicines: result.length,
        totalTaken,
        totalRecorded,
        adherencePercentage: overallAdherence
      }
    });
  } catch (error) {
    console.error('Get adherence stats error:', error);
    res.status(500).json({ message: 'Server error retrieving adherence stats' });
  }
};

// Get streak information for a patient
exports.getStreak = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    // Get the current streak (consecutive days with all medications taken)
    const [result] = await pool.query(`
      WITH dates AS (
        SELECT DISTINCT DATE(Scheduled_For) as date
        FROM MED_INTAKE mi
        JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
        JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
        WHERE m.Patient_ID = ?
        ORDER BY date DESC
      ),
      date_medicines AS (
        SELECT 
          DATE(mi.Scheduled_For) as date,
          COUNT(DISTINCT f.Medicine_ID) as total_meds,
          SUM(CASE WHEN mi.Status = 'Taken' THEN 1 ELSE 0 END) as taken_meds
        FROM MED_INTAKE mi
        JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
        JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
        WHERE m.Patient_ID = ?
        GROUP BY DATE(mi.Scheduled_For)
      ),
      streak_calc AS (
        SELECT 
          d.date,
          CASE WHEN dm.total_meds = dm.taken_meds THEN 1 ELSE 0 END as perfect_day
        FROM dates d
        JOIN date_medicines dm ON d.date = dm.date
        ORDER BY d.date DESC
      )
      SELECT 
        COUNT(*) as current_streak
      FROM (
        SELECT 
          date, 
          perfect_day,
          SUM(CASE WHEN perfect_day = 0 THEN 1 ELSE 0 END) OVER (ORDER BY date DESC) as streak_break
        FROM streak_calc
      ) s
      WHERE streak_break = 0 AND perfect_day = 1
    `, [patientId, patientId]);
    
    const currentStreak = result[0]?.current_streak || 0;
    
    // Get longest streak
    const [longestResult] = await pool.query(`
      WITH dates AS (
        SELECT DISTINCT DATE(Scheduled_For) as date
        FROM MED_INTAKE mi
        JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
        JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
        WHERE m.Patient_ID = ?
        ORDER BY date
      ),
      date_medicines AS (
        SELECT 
          DATE(mi.Scheduled_For) as date,
          COUNT(DISTINCT f.Medicine_ID) as total_meds,
          SUM(CASE WHEN mi.Status = 'Taken' THEN 1 ELSE 0 END) as taken_meds
        FROM MED_INTAKE mi
        JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
        JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
        WHERE m.Patient_ID = ?
        GROUP BY DATE(mi.Scheduled_For)
      ),
      streak_calc AS (
        SELECT 
          date,
          CASE WHEN dm.total_meds = dm.taken_meds THEN 1 ELSE 0 END as perfect_day,
          CASE WHEN dm.total_meds = dm.taken_meds THEN 0 ELSE 1 END as break_day
        FROM dates d
        JOIN date_medicines dm ON d.date = dm.date
        ORDER BY d.date
      ),
      streak_groups AS (
        SELECT 
          date,
          perfect_day,
          SUM(break_day) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) as streak_group
        FROM streak_calc
      )
      SELECT 
        MAX(streak_count) as longest_streak
      FROM (
        SELECT 
          streak_group,
          COUNT(*) as streak_count
        FROM streak_groups
        WHERE perfect_day = 1
        GROUP BY streak_group
      ) s
    `, [patientId, patientId]);
    
    const longestStreak = longestResult[0]?.longest_streak || 0;
    
    res.status(200).json({
      currentStreak,
      longestStreak
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ message: 'Server error retrieving streak information' });
  }
};

// Get history of medication intake for a patient
exports.getIntakeHistory = async (req, res) => {
  const patientId = req.params.patientId;
  const { startDate, endDate, medicineId } = req.query;
  
  try {
    // Build query conditions
    const conditions = ['m.Patient_ID = ?'];
    const params = [patientId];
    
    if (startDate) {
      conditions.push('mi.Scheduled_For >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push('mi.Scheduled_For <= ?');
      params.push(endDate);
    }
    
    if (medicineId) {
      conditions.push('m.Medicine_ID = ?');
      params.push(medicineId);
    }
    
    // Get intake history
    const [intakes] = await pool.query(`
      SELECT 
        mi.Intake_ID,
        mi.Frequency_ID,
        mi.Status,
        mi.Taken_At,
        mi.Scheduled_For,
        mi.Notes,
        m.Medicine_ID,
        m.Medicine_Name,
        m.Dosage,
        m.Category,
        m.Form
      FROM MED_INTAKE mi
      JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
      JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
      WHERE ${conditions.join(' AND ')}
      ORDER BY mi.Scheduled_For DESC
    `, params);
    
    res.status(200).json({ intakes });
  } catch (error) {
    console.error('Get intake history error:', error);
    res.status(500).json({ message: 'Server error retrieving intake history' });
  }
};

// Get missed medications for a patient
exports.getMissedMedications = async (req, res) => {
  const patientId = req.params.patientId;
  const days = req.query.days || 7; // Default to 7 days
  
  try {
    const [missed] = await pool.query(`
      SELECT 
        m.Medicine_ID,
        m.Medicine_Name,
        m.Dosage,
        m.Category,
        COUNT(*) as Missed_Count,
        MAX(mi.Scheduled_For) as Last_Missed
      FROM MED_INTAKE mi
      JOIN FREQUENCY f ON mi.Frequency_ID = f.Frequency_ID
      JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
      WHERE m.Patient_ID = ?
        AND mi.Status = 'Missed'
        AND mi.Scheduled_For >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY m.Medicine_ID
      ORDER BY Missed_Count DESC
    `, [patientId, days]);
    
    res.status(200).json({ missed });
  } catch (error) {
    console.error('Get missed medications error:', error);
    res.status(500).json({ message: 'Server error retrieving missed medications' });
  }
}; 