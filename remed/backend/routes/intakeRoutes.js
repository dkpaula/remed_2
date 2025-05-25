const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intakeController');
const { verifyToken } = require('../middlewares/auth');

// Test route without controller
router.get('/test', (req, res) => {
  res.json({ message: 'Intake routes working' });
});

// Add direct implementation for streak endpoint
router.get('/patient/:patientId/streak', verifyToken, (req, res) => {
  // Simple mock implementation
  console.log('Streak endpoint hit for patient:', req.params.patientId);
  res.json({
    currentStreak: 3,
    longestStreak: 7
  });
});

// Add direct implementation for missed endpoint
router.get('/patient/:patientId/missed', verifyToken, (req, res) => {
  // Simple mock implementation
  console.log('Missed endpoint hit for patient:', req.params.patientId);
  const days = req.query.days || 7;
  res.json({
    missed: [
      {
        Medicine_ID: 1,
        Medicine_Name: 'Ibuprofen',
        Dosage: '200mg',
        Category: 'Pain Relief',
        Missed_Count: 2,
        Last_Missed: '2023-05-14T12:00:00Z'
      }
    ]
  });
});

// Add direct implementation for record endpoint
router.post('/record', verifyToken, (req, res) => {
  // Simple mock implementation
  console.log('Record intake endpoint hit with data:', req.body);
  res.status(201).json({
    message: 'Intake recorded successfully',
    intakeId: Math.floor(Math.random() * 1000) + 1
  });
});

// Add direct implementation for adherence stats endpoint
router.get('/patient/:patientId/adherence', verifyToken, (req, res) => {
  // Simple mock implementation
  console.log('Adherence stats endpoint hit for patient:', req.params.patientId);
  res.json({
    medicines: [
      {
        Medicine_ID: 1,
        Medicine_Name: 'Ibuprofen',
        Dosage: '200mg',
        Total_Frequencies: 14,
        Total_Recorded: 10,
        Total_Taken: 8,
        Total_Skipped: 1,
        Total_Missed: 1,
        Adherence_Percentage: 80
      }
    ],
    overall: {
      totalMedicines: 1,
      totalTaken: 8,
      totalRecorded: 10,
      adherencePercentage: 80
    }
  });
});

// Add direct implementation for history endpoint
router.get('/patient/:patientId/history', verifyToken, (req, res) => {
  // Simple mock implementation
  console.log('History endpoint hit for patient:', req.params.patientId);
  res.json({
    intakes: [
      {
        Intake_ID: 1,
        Frequency_ID: 1,
        Status: 'Taken',
        Taken_At: '2023-05-15T12:00:00Z',
        Scheduled_For: '2023-05-15T12:00:00Z',
        Notes: '',
        Medicine_ID: 1,
        Medicine_Name: 'Ibuprofen',
        Dosage: '200mg',
        Category: 'Pain Relief',
        Form: 'Tablet'
      }
    ]
  });
});

module.exports = router; 