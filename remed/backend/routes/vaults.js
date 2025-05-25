const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const { verifyToken } = require('../middlewares/auth');

// Get vault (medicine inventory) for a patient
router.get('/patient/:patientId', verifyToken, vaultController.getPatientVault);

// Update medicine quantity in vault
router.put('/:vaultId', verifyToken, vaultController.updateVaultQuantity);

// Get low inventory medicines
router.get('/patient/:patientId/low', verifyToken, vaultController.getLowInventory);

module.exports = router; 