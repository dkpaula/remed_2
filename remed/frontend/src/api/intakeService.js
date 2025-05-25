import axios from 'axios';
import api from './config';
import authService from './authService';

// Get API URL for mobile compatibility
const getApiUrl = () => {
  // For iOS/Android apps, use the explicit IP address
  if (window.Capacitor && window.Capacitor.isNative) {
    console.log('IntakeService: Running in Capacitor/mobile');
    return 'http://192.168.254.104:5000/api';
  }
  // When running in browser/local development
  console.log('IntakeService: Running in browser');
  return '/api';
};

// Create axios instance
const intakeApi = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000 // 10 second timeout
});

// Log configuration
console.log('IntakeService API URL:', getApiUrl());

// Add token to each request
intakeApi.interceptors.request.use(
  (config) => {
    console.log('IntakeService Request:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
intakeApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('IntakeService Error:', error);
    if (error.response && error.response.status === 401) {
      // Unauthorized - redirect to login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// Intake service functions
const intakeService = {
  // Record medication intake
  recordIntake: async (intakeData) => {
    return intakeApi.post('/intake/record', intakeData);
  },
  
  // Get adherence statistics
  getAdherenceStats: async (patientId, startDate, endDate) => {
    let url = `/intake/patient/${patientId}/adherence`;
    
    // Add query params if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return intakeApi.get(url);
  },
  
  // Get streak information
  getStreak: async (patientId) => {
    return intakeApi.get(`/intake/patient/${patientId}/streak`);
  },
  
  // Get history of medication intake
  getIntakeHistory: async (patientId, options = {}) => {
    let url = `/intake/patient/${patientId}/history`;
    
    // Add query params if provided
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.medicineId) params.append('medicineId', options.medicineId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return intakeApi.get(url);
  },
  
  // Get missed medications
  getMissedMedications: async (patientId, days) => {
    let url = `/intake/patient/${patientId}/missed`;
    
    // Add days param if provided
    if (days) {
      url += `?days=${days}`;
    }
    
    return intakeApi.get(url);
  }
};

export default intakeService; 