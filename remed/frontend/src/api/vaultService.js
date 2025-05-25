import api from './config';

// Vault (medicine inventory) management services
const vaultService = {
  // Get vault items for a patient
  getPatientVault: async (patientId) => {
    try {
      const response = await api.get(`/vaults/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get patient vault' };
    }
  },

  // Update vault item quantity
  updateVaultQuantity: async (vaultId, quantity) => {
    try {
      const response = await api.put(`/vaults/${vaultId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update vault quantity' };
    }
  },

  // Get low inventory medicines
  getLowInventory: async (patientId) => {
    try {
      const response = await api.get(`/vaults/patient/${patientId}/low`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get low inventory medicines' };
    }
  }
};

export default vaultService; 