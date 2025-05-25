const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { verifyToken } = require('../middlewares/auth');

// Get reminders for a patient for the current day
router.get('/patient/:patientId/today', verifyToken, reminderController.getPatientReminders);

// Get all reminders for a patient
router.get('/patient/:patientId/all', verifyToken, reminderController.getAllPatientReminders);

// Update reminder status (take medicine)
router.post('/:frequencyId/take', verifyToken, reminderController.takeMedicine);

// Update medicine reminders
router.post('/medicine/:medicineId', verifyToken, reminderController.updateMedicineReminders);

module.exports = router; 