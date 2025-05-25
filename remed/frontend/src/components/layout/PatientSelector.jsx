import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Grid,
  Stack
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientSelector = () => {
  const { user, patients, patientsLoading, selectPatient } = useAuth();
  const navigate = useNavigate();

  // Only show for Family and Nurse users
  if (!user || (user.userType !== 'Family' && user.userType !== 'Nurse')) {
    return null;
  }

  const handlePatientChange = (e) => {
    selectPatient(e.target.value);
  };

  const handleAddPatient = () => {
    navigate('/link-patient');
  };

  if (patientsLoading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>Loading patients...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (patients.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography>You don't have any patients linked to your account yet.</Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={handleAddPatient}
            >
              Link Patient
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8} md={9}>
          <FormControl fullWidth>
            <InputLabel id="patient-select-label">Managing Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              id="patient-select"
              value={user.selectedPatientId || ''}
              label="Managing Patient"
              onChange={handlePatientChange}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.User_ID} value={patient.User_ID}>
                  {patient.Name} {patient.Health_Condition ? `(${patient.Health_Condition})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button 
            fullWidth
            variant="outlined" 
            startIcon={<PersonAddIcon />}
            onClick={handleAddPatient}
          >
            Link New Patient
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PatientSelector; 