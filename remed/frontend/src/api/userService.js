import api from './config';

// User management services
const userService = {
  // Get patients for a caretaker
  getPatients: async () => {
    try {
      const response = await api.get('/users/patients');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get patients' };
    }
  },

  // Search for a patient by email
  searchPatient: async (email) => {
    try {
      const response = await api.get(`/users/search-patient?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to find patient' };
    }
  },

  // Link patient to caretaker
  linkPatient: async (patientId) => {
    try {
      const response = await api.post('/users/link-patient', { patientId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to link patient' };
    }
  },

  // Get caretakers for a patient
  getCaretakers: async () => {
    try {
      const response = await api.get('/users/caretakers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get caretakers' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update stored user data if profile update is successful
      if (response.data) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  }
};

export default userService; 