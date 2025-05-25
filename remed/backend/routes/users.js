const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Get all patients for a caretaker (requires Family or Nurse role)
router.get('/patients', verifyToken, checkRole(['Family', 'Nurse']), userController.getPatients);

// Search for a patient by email (requires Family or Nurse role)
router.get('/search-patient', verifyToken, checkRole(['Family', 'Nurse']), userController.searchPatient);

// Link patient to caretaker (requires Family or Nurse role)
router.post('/link-patient', verifyToken, checkRole(['Family', 'Nurse']), userController.linkPatientToCaretaker);

// Get all caretakers for a patient (requires Patient role)
router.get('/caretakers', verifyToken, checkRole(['Patient']), userController.getCaretakers);

// Update user profile (for any authenticated user)
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router; 