import axios from 'axios';

// Base API configuration
// Using relative URL for mobile apps

// Detect environment and get appropriate API URL
const getApiUrl = () => {
  // For iOS/Android apps, use the explicit IP address
  // For development on the same machine, use localhost
  if (window.Capacitor) {
    // Using localhost with explicit port for iOS simulators
    // This will be translated to the Mac host's localhost
    return 'http://localhost:5000/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 second timeout (extended for debugging)
});

// Log the current API URL for debugging
console.log('API URL being used:', getApiUrl());

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging
    console.error('API Response Error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 