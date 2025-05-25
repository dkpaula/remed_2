const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/auth');

// Get reports for a patient
router.get('/patient/:patientId', verifyToken, reportController.getPatientReports);

// Create a new report
router.post('/', verifyToken, reportController.createReport);

// Get report summary for a patient
router.get('/patient/:patientId/summary', verifyToken, reportController.getPatientReportSummary);

module.exports = router; 