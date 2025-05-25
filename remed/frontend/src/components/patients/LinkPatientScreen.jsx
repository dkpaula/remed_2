import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider
} from '@mui/material';
import { Search as SearchIcon, LinkOff as LinkOffIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../api/userService';

const LinkPatientScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Make sure only Family or Nurse can access this page
  if (!user || (user.userType !== 'Family' && user.userType !== 'Nurse')) {
    navigate('/dashboard');
    return null;
  }
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter a patient email');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await userService.searchPatient(email);
      setSearchResults(response.patient);
    } catch (err) {
      setError(err.message || 'Patient not found');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLinkPatient = async (patientId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.linkPatient(patientId);
      setSuccess('Patient linked successfully! You can now manage their medications.');
      setSearchResults(null);
      setEmail('');
      
      // Navigate back to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to link patient');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Link a Patient
      </Typography>
      
      <Typography variant="body1" paragraph>
        {user.userType === 'Family' 
          ? 'Link a family member to your account to help manage their medications.' 
          : 'Link a patient to your account to help manage their medications.'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Patient Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ height: '100%' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {searchResults && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle1">
                  <strong>{searchResults.Name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchResults.Email}
                </Typography>
                {searchResults.Health_Condition && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Health Condition:</strong> {searchResults.Health_Condition}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleLinkPatient(searchResults.User_ID)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Link Patient'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/dashboard')}
          startIcon={<LinkOffIcon />}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

export default LinkPatientScreen; 