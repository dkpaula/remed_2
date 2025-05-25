import api from './config';

// Reminder management services
const reminderService = {
  // Get today's reminders for a patient
  getTodayReminders: async (patientId) => {
    try {
      const response = await api.get(`/reminders/patient/${patientId}/today`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get today\'s reminders' };
    }
  },

  // Get all reminders for a patient
  getAllReminders: async (patientId) => {
    try {
      const response = await api.get(`/reminders/patient/${patientId}/all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get all reminders' };
    }
  },

  // Take medicine (update reminder status)
  takeMedicine: async (frequencyId, data) => {
    try {
      const response = await api.post(`/reminders/${frequencyId}/take`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update reminder status' };
    }
  },
  
  // Update medicine reminders
  updateMedicineReminders: async (medicineId, data) => {
    try {
      const response = await api.post(`/reminders/medicine/${medicineId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update medicine reminders' };
    }
  }
};

export default reminderService; 