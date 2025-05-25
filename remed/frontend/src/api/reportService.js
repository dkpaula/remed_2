import api from './config';

// Report management services
const reportService = {
  // Get reports for a patient
  getPatientReports: async (patientId, reportType = null) => {
    try {
      let url = `/reports/patient/${patientId}`;
      if (reportType) {
        url += `?type=${reportType}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get patient reports' };
    }
  },

  // Create a new report
  createReport: async (reportData) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create report' };
    }
  },

  // Get report summary for a patient
  getPatientReportSummary: async (patientId) => {
    try {
      const response = await api.get(`/reports/patient/${patientId}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get patient report summary' };
    }
  }
};

export default reportService; 