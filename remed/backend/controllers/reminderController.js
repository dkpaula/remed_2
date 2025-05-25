const { pool } = require('../db');

// Get reminders for a patient for the current day
exports.getPatientReminders = async (req, res) => {
  const patientId = req.params.patientId;
  const today = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  
  try {
    // Get today's reminders and daily reminders
    const [reminders] = await pool.query(`
      SELECT 
        f.Frequency_ID,
        f.Time,
        f.Day,
        f.Status,
        m.Medicine_ID,
        m.Medicine_Name,
        m.Generic_Name,
        m.Dosage,
        m.Description,
        v.Medicine_Pieces as Quantity
      FROM FREQUENCY f
      JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
      LEFT JOIN VAULT v ON m.Medicine_ID = v.Medicine_ID
      WHERE m.Patient_ID = ? AND (f.Day = ? OR f.Day = 'Daily') AND f.Status = 'Active'
      ORDER BY f.Time
    `, [patientId, dayOfWeek]);
    
    res.status(200).json({ reminders });
  } catch (error) {
    console.error('Get patient reminders error:', error);
    res.status(500).json({ message: 'Server error retrieving patient reminders' });
  }
};

// Get all reminders for a patient
exports.getAllPatientReminders = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    // Get all reminders
    const [reminders] = await pool.query(`
      SELECT 
        f.Frequency_ID,
        f.Time,
        f.Day,
        f.Status,
        m.Medicine_ID,
        m.Medicine_Name,
        m.Generic_Name,
        m.Dosage,
        m.Description
      FROM FREQUENCY f
      JOIN MED_CABINET m ON f.Medicine_ID = m.Medicine_ID
      WHERE m.Patient_ID = ?
      ORDER BY f.Day, f.Time
    `, [patientId]);
    
    res.status(200).json({ reminders });
  } catch (error) {
    console.error('Get all patient reminders error:', error);
    res.status(500).json({ message: 'Server error retrieving all patient reminders' });
  }
};

// Update reminder status (take medicine)
exports.takeMedicine = async (req, res) => {
  const frequencyId = req.params.frequencyId;
  const { taken, notes } = req.body;
  
  try {
    // Get frequency data
    const [frequencies] = await pool.query('SELECT * FROM FREQUENCY WHERE Frequency_ID = ?', [frequencyId]);
    
    if (frequencies.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    const frequency = frequencies[0];
    
    // Get medicine data
    const [medicines] = await pool.query('SELECT * FROM MED_CABINET WHERE Medicine_ID = ?', [frequency.Medicine_ID]);
    
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const medicine = medicines[0];
    
    // Check authorization (the patient or a caretaker assigned to the patient can take medicine)
    let isAuthorized = false;
    
    if (req.user.id === medicine.Patient_ID) {
      isAuthorized = true;
    } else {
      // Check if the user is a caretaker for this patient
      const [caretakers] = await pool.query(
        'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
        [req.user.id, medicine.Patient_ID]
      );
      
      if (caretakers.length > 0) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to update this reminder' });
    }
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // If medicine was taken, update inventory
      if (taken) {
        // Check if medicine exists in vault
        const [vaults] = await connection.query('SELECT * FROM VAULT WHERE Medicine_ID = ?', [medicine.Medicine_ID]);
        
        if (vaults.length > 0) {
          const vault = vaults[0];
          
          // Decrease quantity by 1
          if (vault.Medicine_Pieces > 0) {
            await connection.query(
              'UPDATE VAULT SET Medicine_Pieces = Medicine_Pieces - 1 WHERE Vault_ID = ?',
              [vault.Vault_ID]
            );
          }
          
          // Check if inventory is low (less than 7 pieces)
          if (vault.Medicine_Pieces <= 7 && vault.Medicine_Pieces > 0) {
            // Create low inventory report
            await connection.query(
              'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
              ['Inventory Update', req.user.id, medicine.Patient_ID, `Low inventory for ${medicine.Medicine_Name}: ${vault.Medicine_Pieces - 1} remaining`]
            );
          }
          
          // Check if inventory is empty
          if (vault.Medicine_Pieces <= 1) {
            // Create empty inventory report
            await connection.query(
              'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
              ['Inventory Update', req.user.id, medicine.Patient_ID, `Empty inventory for ${medicine.Medicine_Name}. Please refill.`]
            );
          }
        }
      }
      
      // Create medication log report
      await connection.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Medication Log', req.user.id, medicine.Patient_ID, `${taken ? 'Taken' : 'Skipped'} ${medicine.Medicine_Name}: ${notes || 'No notes'}`]
      );
      
      // Commit transaction
      await connection.commit();
      
      res.status(200).json({ message: `Medicine ${taken ? 'taken' : 'skipped'} successfully` });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Take medicine error:', error);
    res.status(500).json({ message: 'Server error updating reminder status' });
  }
};

// Update medicine reminders
exports.updateMedicineReminders = async (req, res) => {
  const medicineId = req.params.medicineId;
  const { frequencies } = req.body;
  
  if (!frequencies || !Array.isArray(frequencies)) {
    return res.status(400).json({ message: 'Invalid request format. Frequencies array is required.' });
  }
  
  try {
    // Get medicine data to check authorization
    const [medicines] = await pool.query('SELECT * FROM MED_CABINET WHERE Medicine_ID = ?', [medicineId]);
    
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const medicine = medicines[0];
    
    // Check authorization (the patient or a caretaker assigned to the patient can update reminders)
    let isAuthorized = false;
    
    if (req.user.id === medicine.Patient_ID) {
      isAuthorized = true;
    } else {
      // Check if the user is a caretaker for this patient
      const [caretakers] = await pool.query(
        'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
        [req.user.id, medicine.Patient_ID]
      );
      
      if (caretakers.length > 0) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to update this medicine\'s reminders' });
    }
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // First check if Options column exists in FREQUENCY table
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Options'
      `, [process.env.DB_NAME || 'remed']);
      
      const optionsColumnExists = columns.length > 0;
      
      // Delete existing frequencies first
      await connection.query('DELETE FROM FREQUENCY WHERE Medicine_ID = ?', [medicineId]);
      
      // Insert new frequencies
      for (const freq of frequencies) {
        // Store reminder options as JSON in the database
        const options = JSON.stringify({
          alarmSound: freq.options?.alarmSound || 'default',
          snoozeEnabled: freq.options?.snoozeEnabled || false,
          snoozeInterval: freq.options?.snoozeInterval || 5,
          vibration: freq.options?.vibration || false,
          critical: freq.options?.critical || false
        });
        
        if (optionsColumnExists) {
          await connection.query(
            `INSERT INTO FREQUENCY (
              Medicine_ID, 
              Time, 
              Day, 
              Status,
              Options
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              medicineId, 
              freq.time, 
              freq.day, 
              'Active',
              options
            ]
          );
        } else {
          // Insert without Options column
          await connection.query(
            `INSERT INTO FREQUENCY (
              Medicine_ID, 
              Time, 
              Day, 
              Status
            ) VALUES (?, ?, ?, ?)`,
            [
              medicineId, 
              freq.time, 
              freq.day, 
              'Active'
            ]
          );
          console.log("Options column doesn't exist in FREQUENCY table. Using basic insert.");
        }
      }
      
      // Create a log entry
      await connection.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Reminder Update', req.user.id, medicine.Patient_ID, `Updated reminder schedule for ${medicine.Medicine_Name}`]
      );
      
      // Commit transaction
      await connection.commit();
      
      res.status(200).json({ 
        message: 'Reminder schedule updated successfully',
        count: frequencies.length
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update medicine reminders error:', error);
    res.status(500).json({ message: 'Server error updating reminder schedule' });
  }
}; 