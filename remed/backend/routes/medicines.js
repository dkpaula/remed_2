const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Add new medicine (allow Patient, Family or Nurse role)
router.post('/', verifyToken, checkRole(['Patient', 'Family', 'Nurse']), medicineController.addMedicine);

// Get all medicines for a patient
router.get('/patient/:patientId', verifyToken, medicineController.getPatientMedicines);

// Update medicine
router.put('/:medicineId', verifyToken, medicineController.updateMedicine);

// Delete medicine
router.delete('/:medicineId', verifyToken, medicineController.deleteMedicine);

module.exports = router; 