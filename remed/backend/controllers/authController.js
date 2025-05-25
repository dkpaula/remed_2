const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { jwtConfig } = require('../config');


// Register a new user
exports.register = async (req, res) => {
  // Log the entire request body for debugging
  console.log('Registration request body:', req.body);
  
  // Extract fields with proper names
  const { 
    fullName: name = req.body.name, 
    email, 
    password, 
    contactNumber, 
    accountType: userType = req.body.userType 
  } = req.body;
  
  try {
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM USER WHERE Email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO USER (Name, Email, Password, Contact_Number, User_Type) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, contactNumber, userType]
    );
    
    const userId = result.insertId;
    
    // Create user type specific record (Patient, Family, Nurse)
    if (userType === 'Patient') {
      const healthCondition = req.body.healthCondition || '';
      await pool.query('INSERT INTO PATIENT (User_ID, Health_Condition) VALUES (?, ?)', [userId, healthCondition]);
    } else if (userType === 'Family') {
      const relationToPatient = req.body.relationToPatient || 'Not specified';
      await pool.query('INSERT INTO FAMILY (User_ID, Relation_to_Patient) VALUES (?, ?)', [userId, relationToPatient]);
    } else if (userType === 'Nurse') {
      const assignedHospital = req.body.assignedHospital || 'Not specified';
      await pool.query('INSERT INTO NURSE (User_ID, Assigned_Hospital) VALUES (?, ?)', [userId, assignedHospital]);
    }
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: userId,
        name,
        email,
        userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Get user from database
    const [users] = await pool.query('SELECT * FROM USER WHERE Email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.User_ID, 
        email: user.Email, 
        user_type: user.User_Type 
      }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );
    
    // Get additional user data based on user type
    let additionalData = {};
    
    if (user.User_Type === 'Patient') {
      const [patientData] = await pool.query('SELECT * FROM PATIENT WHERE User_ID = ?', [user.User_ID]);
      if (patientData.length > 0) {
        additionalData = { healthCondition: patientData[0].Health_Condition };
      }
    } else if (user.User_Type === 'Family') {
      const [familyData] = await pool.query('SELECT * FROM FAMILY WHERE User_ID = ?', [user.User_ID]);
      if (familyData.length > 0) {
        additionalData = { relationToPatient: familyData[0].Relation_to_Patient };
      }
    } else if (user.User_Type === 'Nurse') {
      const [nurseData] = await pool.query('SELECT * FROM NURSE WHERE User_ID = ?', [user.User_ID]);
      if (nurseData.length > 0) {
        additionalData = { assignedHospital: nurseData[0].Assigned_Hospital };
      }
    }
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.User_ID,
        name: user.Name,
        email: user.Email,
        contactNumber: user.Contact_Number,
        userType: user.User_Type,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT User_ID, Name, Email, Contact_Number, User_Type FROM USER WHERE User_ID = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get additional user data based on user type
    let additionalData = {};
    
    if (user.User_Type === 'Patient') {
      const [patientData] = await pool.query('SELECT * FROM PATIENT WHERE User_ID = ?', [user.User_ID]);
      if (patientData.length > 0) {
        additionalData = { healthCondition: patientData[0].Health_Condition };
      }
    } else if (user.User_Type === 'Family') {
      const [familyData] = await pool.query('SELECT * FROM FAMILY WHERE User_ID = ?', [user.User_ID]);
      if (familyData.length > 0) {
        additionalData = { relationToPatient: familyData[0].Relation_to_Patient };
      }
    } else if (user.User_Type === 'Nurse') {
      const [nurseData] = await pool.query('SELECT * FROM NURSE WHERE User_ID = ?', [user.User_ID]);
      if (nurseData.length > 0) {
        additionalData = { assignedHospital: nurseData[0].Assigned_Hospital };
      }
    }
    
    res.status(200).json({
      user: {
        id: user.User_ID,
        name: user.Name,
        email: user.Email,
        contactNumber: user.Contact_Number,
        userType: user.User_Type,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
}; 