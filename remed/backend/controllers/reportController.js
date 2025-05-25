const { pool } = require('../db');

// Get reports for a patient
exports.getPatientReports = async (req, res) => {
  const patientId = req.params.patientId;
  const reportType = req.query.type; // Optional filter by report type
  
  try {
    let query = `
      SELECT 
        r.Report_ID,
        r.Date_Created,
        r.Report_Type,
        r.Notes,
        u.Name as Creator_Name,
        u.User_Type as Creator_Type
      FROM REPORT r
      JOIN USER u ON r.Creator_ID = u.User_ID
      WHERE r.Patient_ID = ?
    `;
    
    const queryParams = [patientId];
    
    // Add report type filter if provided
    if (reportType) {
      query += ' AND r.Report_Type = ?';
      queryParams.push(reportType);
    }
    
    // Order by date (most recent first)
    query += ' ORDER BY r.Date_Created DESC';
    
    const [reports] = await pool.query(query, queryParams);
    
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ message: 'Server error retrieving patient reports' });
  }
};

// Create a new report
exports.createReport = async (req, res) => {
  const { patientId, reportType, notes } = req.body;
  const creatorId = req.user.id;
  
  try {
    // Insert report
    const [result] = await pool.query(
      'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
      [reportType, creatorId, patientId, notes]
    );
    
    res.status(201).json({ 
      message: 'Report created successfully',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error creating report' });
  }
};

// Get report summary for a patient (counts by type)
exports.getPatientReportSummary = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    // Get counts by report type
    const [summary] = await pool.query(`
      SELECT 
        Report_Type, 
        COUNT(*) as Count
      FROM REPORT
      WHERE Patient_ID = ?
      GROUP BY Report_Type
    `, [patientId]);
    
    // Get latest report of each type
    const [latest] = await pool.query(`
      SELECT r.*
      FROM REPORT r
      INNER JOIN (
        SELECT Report_Type, MAX(Date_Created) as MaxDate
        FROM REPORT
        WHERE Patient_ID = ?
        GROUP BY Report_Type
      ) rm ON r.Report_Type = rm.Report_Type AND r.Date_Created = rm.MaxDate
      WHERE r.Patient_ID = ?
    `, [patientId, patientId]);
    
    res.status(200).json({ 
      summary,
      latest
    });
  } catch (error) {
    console.error('Get patient report summary error:', error);
    res.status(500).json({ message: 'Server error retrieving patient report summary' });
  }
}; 