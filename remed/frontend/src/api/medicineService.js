import api from './config';

// Medicine management services
const medicineService = {
  // Add new medicine
  addMedicine: async (medicineData) => {
    console.log('Medicine API - addMedicine called with:', medicineData);
    try {
      const response = await api.post('/medicines', medicineData);
      console.log('Medicine API - addMedicine response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Medicine API - addMedicine error:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      console.error('Error status:', error.response?.status);
      throw error.response?.data || { message: 'Failed to add medicine' };
    }
  },

  // Get all medicines for a patient
  getPatientMedicines: async (patientId) => {
    console.log('Medicine API - getPatientMedicines called for patientId:', patientId);
    try {
      // Add timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const response = await api.get(`/medicines/patient/${patientId}?_t=${timestamp}`);
      console.log('Medicine API - getPatientMedicines response:', response.data);
      
      // Validate the response structure
      if (!response.data || !response.data.medicines) {
        console.error('Medicine API - Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Medicine API - getPatientMedicines error:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Rethrow with more descriptive message
      throw error.response?.data || { 
        message: `Failed to get patient medicines: ${error.message}` 
      };
    }
  },

  // Update medicine
  updateMedicine: async (medicineId, medicineData) => {
    try {
      const response = await api.put(`/medicines/${medicineId}`, medicineData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update medicine' };
    }
  },

  // Delete medicine
  deleteMedicine: async (medicineId) => {
    try {
      const response = await api.delete(`/medicines/${medicineId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete medicine' };
    }
  }
};

export default medicineService; 