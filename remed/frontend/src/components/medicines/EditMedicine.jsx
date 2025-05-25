import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../api/medicineService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const EditMedicine = () => {
  const { medicineId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    dosage: '',
    description: '',
    expirationDate: null
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setFetchLoading(true);
        // Normally we would have a getMedicineById API call
        // For now we'll get all medicines and filter
        const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
        
        if (patientId) {
          const data = await medicineService.getPatientMedicines(patientId);
          const medicine = data.medicines?.find(med => med.Medicine_ID.toString() === medicineId);
          
          if (medicine) {
            setFormData({
              medicineName: medicine.Medicine_Name,
              genericName: medicine.Generic_Name || '',
              dosage: medicine.Dosage,
              description: medicine.Description || '',
              expirationDate: medicine.Expiration_Date ? new Date(medicine.Expiration_Date) : null
            });
          } else {
            setError('Medicine not found');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch medicine details');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchMedicine();
  }, [medicineId, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      expirationDate: date
    });
    
    if (formErrors.expirationDate) {
      setFormErrors({
        ...formErrors,
        expirationDate: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.medicineName.trim()) {
      errors.medicineName = 'Medicine name is required';
    }
    
    if (!formData.dosage.trim()) {
      errors.dosage = 'Dosage is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format expiration date if provided
      const expirationDate = formData.expirationDate 
        ? new Date(formData.expirationDate).toISOString().split('T')[0] 
        : null;
      
      // Create medicine data object
      const medicineData = {
        medicineName: formData.medicineName,
        genericName: formData.genericName,
        dosage: formData.dosage,
        description: formData.description,
        expirationDate
      };
      
      await medicineService.updateMedicine(medicineId, medicineData);
      setSuccess(true);
      
      // Redirect to medicines list after short delay
      setTimeout(() => {
        navigate('/medicines');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Edit Medicine
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Medicine updated successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Medicine Name"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              error={!!formErrors.medicineName}
              helperText={formErrors.medicineName}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Generic Name"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Dosage (e.g., 500mg)"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              error={!!formErrors.dosage}
              helperText={formErrors.dosage}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiration Date"
                value={formData.expirationDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!formErrors.expirationDate}
                    helperText={formErrors.expirationDate}
                  />
                )}
                disabled={loading}
                disablePast
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={() => navigate('/medicines')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Medicine'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default EditMedicine; 