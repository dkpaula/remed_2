const { pool } = require('../db');

// Get all patients for a caretaker
exports.getPatients = async (req, res) => {
  const caretakerId = req.user.id;
  
  try {
    const [patients] = await pool.query(`
      SELECT u.User_ID, u.Name, u.Email, u.Contact_Number, p.Health_Condition
      FROM USER u
      JOIN PATIENT p ON u.User_ID = p.User_ID
      JOIN CARETAKER_PATIENT cp ON p.User_ID = cp.Patient_ID
      WHERE cp.Caretaker_ID = ?
    `, [caretakerId]);
    
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error retrieving patients' });
  }
};

// Search for a patient by email
exports.searchPatient = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // First check if user exists and is a patient
    const [users] = await pool.query(`
      SELECT u.User_ID, u.Name, u.Email, u.Contact_Number, p.Health_Condition
      FROM USER u
      JOIN PATIENT p ON u.User_ID = p.User_ID
      WHERE u.Email = ? AND u.User_Type = 'Patient'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const patient = users[0];
    
    // Check if patient is already linked to this caretaker
    const [existingLinks] = await pool.query(
      'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
      [req.user.id, patient.User_ID]
    );
    
    if (existingLinks.length > 0) {
      return res.status(400).json({ message: 'Patient is already linked to your account' });
    }
    
    res.status(200).json({ patient });
  } catch (error) {
    console.error('Search patient error:', error);
    res.status(500).json({ message: 'Server error searching for patient' });
  }
};

// Link patient to caretaker
exports.linkPatientToCaretaker = async (req, res) => {
  const caretakerId = req.user.id;
  const { patientId } = req.body;
  
  try {
    // Check if patient exists
    const [patients] = await pool.query('SELECT * FROM PATIENT WHERE User_ID = ?', [patientId]);
    
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if link already exists
    const [existingLinks] = await pool.query(
      'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
      [caretakerId, patientId]
    );
    
    if (existingLinks.length > 0) {
      return res.status(400).json({ message: 'Patient already linked to this caretaker' });
    }
    
    // Create link
    await pool.query(
      'INSERT INTO CARETAKER_PATIENT (Caretaker_ID, Patient_ID) VALUES (?, ?)',
      [caretakerId, patientId]
    );
    
    res.status(201).json({ message: 'Patient linked to caretaker successfully' });
  } catch (error) {
    console.error('Link patient error:', error);
    res.status(500).json({ message: 'Server error linking patient to caretaker' });
  }
};

// Get all caretakers for a patient
exports.getCaretakers = async (req, res) => {
  const patientId = req.user.id;
  
  try {
    // Get family members
    const [familyMembers] = await pool.query(`
      SELECT u.User_ID, u.Name, u.Email, u.Contact_Number, f.Relation_to_Patient, 'Family' as Type
      FROM USER u
      JOIN FAMILY f ON u.User_ID = f.User_ID
      JOIN CARETAKER_PATIENT cp ON u.User_ID = cp.Caretaker_ID
      WHERE cp.Patient_ID = ?
    `, [patientId]);
    
    // Get nurses
    const [nurses] = await pool.query(`
      SELECT u.User_ID, u.Name, u.Email, u.Contact_Number, n.Assigned_Hospital, 'Nurse' as Type
      FROM USER u
      JOIN NURSE n ON u.User_ID = n.User_ID
      JOIN CARETAKER_PATIENT cp ON u.User_ID = cp.Caretaker_ID
      WHERE cp.Patient_ID = ?
    `, [patientId]);
    
    res.status(200).json({ 
      caretakers: {
        familyMembers,
        nurses
      } 
    });
  } catch (error) {
    console.error('Get caretakers error:', error);
    res.status(500).json({ message: 'Server error retrieving caretakers' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, contactNumber } = req.body;
  
  try {
    await pool.query(
      'UPDATE USER SET Name = ?, Contact_Number = ? WHERE User_ID = ?',
      [name, contactNumber, userId]
    );
    
    // Update specific user type data
    if (req.user.user_type === 'Patient' && req.body.healthCondition) {
      await pool.query(
        'UPDATE PATIENT SET Health_Condition = ? WHERE User_ID = ?',
        [req.body.healthCondition, userId]
      );
    } else if (req.user.user_type === 'Family' && req.body.relationToPatient) {
      await pool.query(
        'UPDATE FAMILY SET Relation_to_Patient = ? WHERE User_ID = ?',
        [req.body.relationToPatient, userId]
      );
    } else if (req.user.user_type === 'Nurse' && req.body.assignedHospital) {
      await pool.query(
        'UPDATE NURSE SET Assigned_Hospital = ? WHERE User_ID = ?',
        [req.body.assignedHospital, userId]
      );
    }
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
}; 