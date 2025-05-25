import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  MenuItem
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    userType: 'Patient',
    healthCondition: '',
    relationToPatient: '',
    assignedHospital: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    }
    
    // User type specific validations
    if (formData.userType === 'Family' && !formData.relationToPatient) {
      newErrors.relationToPatient = 'Relation to patient is required';
    }
    
    if (formData.userType === 'Nurse' && !formData.assignedHospital) {
      newErrors.assignedHospital = 'Assigned hospital is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    // Create registration data object (excluding confirmPassword)
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      contactNumber: formData.contactNumber,
      userType: formData.userType
    };
    
    // Add user type specific data
    if (formData.userType === 'Patient') {
      registrationData.healthCondition = formData.healthCondition;
    } else if (formData.userType === 'Family') {
      registrationData.relationToPatient = formData.relationToPatient;
    } else if (formData.userType === 'Nurse') {
      registrationData.assignedHospital = formData.assignedHospital;
    }
    
    try {
      await register(registrationData);
      navigate('/login');
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Create your ReMed Account
        </Typography>
        
        {apiError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {apiError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="contactNumber"
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                error={!!errors.contactNumber}
                helperText={errors.contactNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Account Type</FormLabel>
                <RadioGroup
                  row
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Patient" control={<Radio />} label="Patient" />
                  <FormControlLabel value="Family" control={<Radio />} label="Family Member" />
                  <FormControlLabel value="Nurse" control={<Radio />} label="Nurse" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {/* Conditional fields based on user type */}
            {formData.userType === 'Patient' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="healthCondition"
                  label="Health Condition (Optional)"
                  name="healthCondition"
                  multiline
                  rows={2}
                  value={formData.healthCondition}
                  onChange={handleChange}
                />
              </Grid>
            )}
            
            {formData.userType === 'Family' && (
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="relationToPatient"
                  label="Relation to Patient"
                  name="relationToPatient"
                  select
                  value={formData.relationToPatient}
                  onChange={handleChange}
                  error={!!errors.relationToPatient}
                  helperText={errors.relationToPatient}
                >
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Child">Child</MenuItem>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Sibling">Sibling</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            )}
            
            {formData.userType === 'Nurse' && (
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="assignedHospital"
                  label="Assigned Hospital"
                  name="assignedHospital"
                  value={formData.assignedHospital}
                  onChange={handleChange}
                  error={!!errors.assignedHospital}
                  helperText={errors.assignedHospital}
                />
              </Grid>
            )}
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 