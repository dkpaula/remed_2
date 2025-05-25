import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/authService';
import userService from '../api/userService';
import jwt_decode from 'jwt-decode';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Check if token exists and is not expired
        if (token && !isTokenExpired(token)) {
          const userData = authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If user data not found, fetch it
            const { user: freshUserData } = await authService.refreshUser();
            setUser(freshUserData);
          }
        } else if (token) {
          // If token is expired, logout
          authService.logout();
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize authentication');
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch patients when user changes
  useEffect(() => {
    const fetchPatients = async () => {
      if (user && (user.userType === 'Nurse' || user.userType === 'Family')) {
        try {
          setPatientsLoading(true);
          const { patients: patientsList } = await userService.getPatients();
          setPatients(patientsList || []);
          
          // If we have patients but no selected patient, select the first one
          if (patientsList?.length > 0 && !user.selectedPatientId) {
            selectPatient(patientsList[0].User_ID);
          }
        } catch (error) {
          console.error('Failed to fetch patients:', error);
          setPatients([]);
        } finally {
          setPatientsLoading(false);
        }
      }
    };

    fetchPatients();
  }, [user?.id, user?.userType]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setPatients([]);
  };

  // Update user profile
  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  // Select a patient (for Family and Nurse users)
  const selectPatient = (patientId) => {
    if (user && (user.userType === 'Family' || user.userType === 'Nurse')) {
      const updatedUser = {
        ...user,
        selectedPatientId: patientId
      };
      setUser(updatedUser);
      
      // Update in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    patients,
    patientsLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    selectPatient
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 