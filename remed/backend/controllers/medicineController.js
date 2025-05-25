const { pool } = require('../db');

// Add new medicine to a patient's med cabinet
exports.addMedicine = async (req, res) => {
  const { 
    medicineName, 
    genericName, 
    dosage, 
    description, 
    expirationDate, 
    patientId, 
    initialQuantity,
    category,
    form,
    color,
    shape,
    imagePath,
    asNeeded,
    notes
  } = req.body;
  const loggedById = req.user.id;
  
  try {
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get all available columns in MED_CABINET table
      const [medCabinetColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'MED_CABINET'
      `, [process.env.DB_NAME || 'remed']);
      
      const medCabinetColumnNames = medCabinetColumns.map(col => col.COLUMN_NAME);
      
      // Build column list and values dynamically
      const columns = [
        'Medicine_Name', 
        'Generic_Name', 
        'Dosage', 
        'Description', 
        'Expiration_Date', 
        'Logged_By_ID', 
        'Patient_ID'
      ];
      
      const values = [
        medicineName, 
        genericName, 
        dosage, 
        description, 
        expirationDate, 
        loggedById, 
        patientId
      ];
      
      // Add optional columns if they exist in the database
      if (medCabinetColumnNames.includes('Category') && category) {
        columns.push('Category');
        values.push(category);
      }
      
      if (medCabinetColumnNames.includes('Form') && form) {
        columns.push('Form');
        values.push(form);
      }
      
      if (medCabinetColumnNames.includes('Color') && color) {
        columns.push('Color');
        values.push(color);
      }
      
      if (medCabinetColumnNames.includes('Shape') && shape) {
        columns.push('Shape');
        values.push(shape);
      }
      
      if (medCabinetColumnNames.includes('Image_Path') && imagePath) {
        columns.push('Image_Path');
        values.push(imagePath);
      }
      
      if (medCabinetColumnNames.includes('As_Needed') && asNeeded !== undefined) {
        columns.push('As_Needed');
        values.push(asNeeded);
      }
      
      if (medCabinetColumnNames.includes('Notes') && notes) {
        columns.push('Notes');
        values.push(notes);
      }
      
      // Create placeholders for prepared statement
      const placeholders = values.map(() => '?').join(', ');
      
      // Add medicine to med cabinet with only the columns that exist in the database
      const [result] = await connection.query(
        `INSERT INTO MED_CABINET (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const medicineId = result.insertId;
      
      // Add medicine to vault with initial quantity
      if (initialQuantity > 0) {
        await connection.query(
          'INSERT INTO VAULT (Medicine_ID, Medicine_Pieces, Created_By, Patient_ID) VALUES (?, ?, ?, ?)',
          [medicineId, initialQuantity, loggedById, patientId]
        );
      }
      
      // Add frequencies if provided
      if (req.body.frequencies && Array.isArray(req.body.frequencies)) {
        // Get all available columns in FREQUENCY table
        const [freqColumns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY'
        `, [process.env.DB_NAME || 'remed']);
        
        const freqColumnNames = freqColumns.map(col => col.COLUMN_NAME);
        
        for (const freq of req.body.frequencies) {
          const freqColumns = [
            'Medicine_ID',
            'Time',
            'Day',
            'Status'
          ];
          
          const freqValues = [
            medicineId,
            freq.time,
            freq.day,
            'Active'
          ];
          
          // Add optional frequency fields if they exist in the database
          if (freqColumnNames.includes('Custom_Sound') && freq.customSound) {
            freqColumns.push('Custom_Sound');
            freqValues.push(freq.customSound);
          }
          
          if (freqColumnNames.includes('Flexible_Window') && freq.flexibleWindow !== undefined) {
            freqColumns.push('Flexible_Window');
            freqValues.push(freq.flexibleWindow);
          }
          
          if (freqColumnNames.includes('Description') && freq.description) {
            freqColumns.push('Description');
            freqValues.push(freq.description);
          }
          
          if (freqColumnNames.includes('Period') && freq.period) {
            freqColumns.push('Period');
            freqValues.push(freq.period);
          }
          
          if (freqColumnNames.includes('Options') && freq.options) {
            freqColumns.push('Options');
            freqValues.push(JSON.stringify({
              alarmSound: freq.options.alarmSound || 'default',
              snoozeEnabled: freq.options.snoozeEnabled || false,
              snoozeInterval: freq.options.snoozeInterval || 5,
              vibration: freq.options.vibration || false,
              critical: freq.options.critical || false
            }));
          }
          
          // Create placeholders for prepared statement
          const freqPlaceholders = freqValues.map(() => '?').join(', ');
          
          await connection.query(
            `INSERT INTO FREQUENCY (${freqColumns.join(', ')}) VALUES (${freqPlaceholders})`,
            freqValues
          );
        }
      }
      
      // Create report for new medicine
      await connection.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Medication Log', loggedById, patientId, `Added new medicine: ${medicineName}, Initial quantity: ${initialQuantity || 0}`]
      );
      
      // Commit transaction
      await connection.commit();
      
      res.status(201).json({ 
        message: 'Medicine added successfully',
        medicineId
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ message: 'Server error adding medicine' });
  }
};

// Get all medicines for a patient
exports.getPatientMedicines = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    // Get all available columns in MED_CABINET table
    const [medCabinetColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'MED_CABINET'
    `, [process.env.DB_NAME || 'remed']);
    
    const medCabinetColumnNames = medCabinetColumns.map(col => col.COLUMN_NAME);
    
    // Build SELECT statement dynamically based on available columns
    let selectColumns = [
      'm.Medicine_ID', 
      'm.Medicine_Name', 
      'm.Generic_Name', 
      'm.Dosage', 
      'm.Description', 
      'm.Expiration_Date',
      'v.Medicine_Pieces as Quantity',
      'v.Vault_ID'
    ];
    
    // Add optional columns if they exist
    if (medCabinetColumnNames.includes('Category')) {
      selectColumns.push('m.Category');
    }
    if (medCabinetColumnNames.includes('Form')) {
      selectColumns.push('m.Form');
    }
    if (medCabinetColumnNames.includes('Color')) {
      selectColumns.push('m.Color');
    }
    if (medCabinetColumnNames.includes('Shape')) {
      selectColumns.push('m.Shape');
    }
    if (medCabinetColumnNames.includes('Image_Path')) {
      selectColumns.push('m.Image_Path');
    }
    if (medCabinetColumnNames.includes('As_Needed')) {
      selectColumns.push('m.As_Needed');
    }
    if (medCabinetColumnNames.includes('Notes')) {
      selectColumns.push('m.Notes');
    }
    
    // Get medicines
    const [medicines] = await pool.query(`
      SELECT 
        ${selectColumns.join(', ')}
      FROM MED_CABINET m
      LEFT JOIN VAULT v ON m.Medicine_ID = v.Medicine_ID
      WHERE m.Patient_ID = ?
    `, [patientId]);
    
    // Get all available columns in FREQUENCY table
    const [freqColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY'
    `, [process.env.DB_NAME || 'remed']);
    
    const freqColumnNames = freqColumns.map(col => col.COLUMN_NAME);
    
    // Build frequency SELECT statement dynamically based on available columns
    let freqSelectColumns = [
      'Frequency_ID', 
      'Time', 
      'Day', 
      'Status'
    ];
    
    // Add optional frequency columns if they exist
    if (freqColumnNames.includes('Custom_Sound')) {
      freqSelectColumns.push('Custom_Sound');
    }
    if (freqColumnNames.includes('Flexible_Window')) {
      freqSelectColumns.push('Flexible_Window');
    }
    if (freqColumnNames.includes('Description')) {
      freqSelectColumns.push('Description');
    }
    if (freqColumnNames.includes('Period')) {
      freqSelectColumns.push('Period');
    }
    if (freqColumnNames.includes('Options')) {
      freqSelectColumns.push('Options');
    }
    
    // Get frequencies for each medicine
    for (let medicine of medicines) {
      const [frequencies] = await pool.query(
        `SELECT 
          ${freqSelectColumns.join(', ')}
        FROM FREQUENCY 
        WHERE Medicine_ID = ?`,
        [medicine.Medicine_ID]
      );
      
      medicine.Frequencies = frequencies;
    }
    
    console.log('Retrieved medicines for patient:', patientId, 'Count:', medicines.length);
    res.status(200).json({ medicines });
  } catch (error) {
    console.error('Get patient medicines error:', error);
    res.status(500).json({ message: 'Server error retrieving patient medicines' });
  }
};

// Update medicine details
exports.updateMedicine = async (req, res) => {
  const medicineId = req.params.medicineId;
  const { 
    medicineName, 
    genericName, 
    dosage, 
    description, 
    expirationDate,
    category,
    form,
    color,
    shape,
    imagePath,
    asNeeded,
    notes
  } = req.body;
  
  try {
    // Get the current medicine data
    const [medicines] = await pool.query('SELECT * FROM MED_CABINET WHERE Medicine_ID = ?', [medicineId]);
    
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const medicine = medicines[0];
    
    // Check authorization (only the logger or a nurse assigned to the patient can update)
    if (req.user.id !== medicine.Logged_By_ID && req.user.user_type !== 'Nurse') {
      // Check if the nurse is assigned to this patient
      if (req.user.user_type === 'Nurse') {
        const [assignments] = await pool.query(
          'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
          [req.user.id, medicine.Patient_ID]
        );
        
        if (assignments.length === 0) {
          return res.status(403).json({ message: 'You are not authorized to update this medicine' });
        }
      } else {
        return res.status(403).json({ message: 'You are not authorized to update this medicine' });
      }
    }
    
    // Update medicine - only include columns that exist in the database
    await pool.query(
      `UPDATE MED_CABINET SET 
        Medicine_Name = ?, 
        Generic_Name = ?, 
        Dosage = ?, 
        Description = ?, 
        Expiration_Date = ?
      WHERE Medicine_ID = ?`,
      [
        medicineName, 
        genericName, 
        dosage, 
        description, 
        expirationDate,
        medicineId
      ]
    );
    
    // Update frequencies if provided
    if (req.body.frequencies && Array.isArray(req.body.frequencies)) {
      // Delete existing frequencies
      await pool.query('DELETE FROM FREQUENCY WHERE Medicine_ID = ?', [medicineId]);
      
      // Add new frequencies
      for (const freq of req.body.frequencies) {
        await pool.query(
          `INSERT INTO FREQUENCY (
            Medicine_ID, 
            Time, 
            Day
          ) VALUES (?, ?, ?)`,
          [
            medicineId, 
            freq.time, 
            freq.day
          ]
        );
      }
    }
    
    // Update vault quantity if provided
    if (req.body.quantity !== undefined) {
      const [vaults] = await pool.query('SELECT * FROM VAULT WHERE Medicine_ID = ?', [medicineId]);
      
      if (vaults.length > 0) {
        await pool.query(
          'UPDATE VAULT SET Medicine_Pieces = ? WHERE Medicine_ID = ?',
          [req.body.quantity, medicineId]
        );
      } else {
        await pool.query(
          'INSERT INTO VAULT (Medicine_ID, Medicine_Pieces, Created_By, Patient_ID) VALUES (?, ?, ?, ?)',
          [medicineId, req.body.quantity, req.user.id, medicine.Patient_ID]
        );
      }
      
      // Create inventory update report
      await pool.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Inventory Update', req.user.id, medicine.Patient_ID, `Updated quantity for ${medicineName} to ${req.body.quantity}`]
      );
    }
    
    res.status(200).json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: 'Server error updating medicine' });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  const medicineId = req.params.medicineId;
  
  try {
    // Get the current medicine data
    const [medicines] = await pool.query('SELECT * FROM MED_CABINET WHERE Medicine_ID = ?', [medicineId]);
    
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const medicine = medicines[0];
    
    // Check authorization (only the logger or a nurse assigned to the patient can delete)
    if (req.user.id !== medicine.Logged_By_ID && req.user.user_type !== 'Nurse') {
      // Check if the nurse is assigned to this patient
      if (req.user.user_type === 'Nurse') {
        const [assignments] = await pool.query(
          'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
          [req.user.id, medicine.Patient_ID]
        );
        
        if (assignments.length === 0) {
          return res.status(403).json({ message: 'You are not authorized to delete this medicine' });
        }
      } else {
        return res.status(403).json({ message: 'You are not authorized to delete this medicine' });
      }
    }
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete frequencies
      await connection.query('DELETE FROM FREQUENCY WHERE Medicine_ID = ?', [medicineId]);
      
      // Delete vault entries
      await connection.query('DELETE FROM VAULT WHERE Medicine_ID = ?', [medicineId]);
      
      // Create report for deleted medicine
      await connection.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Medication Log', req.user.id, medicine.Patient_ID, `Removed medicine: ${medicine.Medicine_Name}`]
      );
      
      // Delete medicine
      await connection.query('DELETE FROM MED_CABINET WHERE Medicine_ID = ?', [medicineId]);
      
      // Commit transaction
      await connection.commit();
      
      res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Server error deleting medicine' });
  }
}; 