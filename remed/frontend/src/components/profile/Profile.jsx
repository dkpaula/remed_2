import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import userService from '../../api/userService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber || '',
    healthCondition: user?.healthCondition || '',
    relationToPatient: user?.relationToPatient || '',
    assignedHospital: user?.assignedHospital || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleEditToggle = () => {
    setEditing(!editing);
    setError(null);
    setSuccess(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Create update data with only the fields relevant to the user type
      const updateData = {
        name: formData.name,
        contactNumber: formData.contactNumber
      };
      
      if (user.userType === 'Patient') {
        updateData.healthCondition = formData.healthCondition;
      } else if (user.userType === 'Family') {
        updateData.relationToPatient = formData.relationToPatient;
      } else if (user.userType === 'Nurse') {
        updateData.assignedHospital = formData.assignedHospital;
      }
      
      const response = await userService.updateProfile(updateData);
      
      // Update user context with new data
      updateUser({
        ...user,
        ...updateData
      });
      
      setSuccess(true);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        <Button
          variant={editing ? 'outlined' : 'contained'}
          color={editing ? 'error' : 'primary'}
          startIcon={editing ? null : <EditIcon />}
          onClick={handleEditToggle}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  bgcolor: 'primary.main',
                  fontSize: 40
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Chip
                label={user?.userType}
                color="primary"
                sx={{ mt: 1 }}
              />
              <List sx={{ mt: 2 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Email" secondary={user?.email} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Contact" secondary={user?.contactNumber || 'Not provided'} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {editing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  Edit Profile
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  {user?.userType === 'Patient' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Health Condition"
                        name="healthCondition"
                        value={formData.healthCondition}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        disabled={loading}
                      />
                    </Grid>
                  )}
                  
                  {user?.userType === 'Family' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Relation to Patient"
                        name="relationToPatient"
                        value={formData.relationToPatient}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Grid>
                  )}
                  
                  {user?.userType === 'Nurse' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Assigned Hospital"
                        name="assignedHospital"
                        value={formData.assignedHospital}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Profile Details
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {user?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {user?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Contact Number
                    </Typography>
                    <Typography variant="body1">
                      {user?.contactNumber || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Account Type
                    </Typography>
                    <Typography variant="body1">
                      {user?.userType}
                    </Typography>
                  </Grid>
                  
                  {user?.userType === 'Patient' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Health Condition
                      </Typography>
                      <Typography variant="body1">
                        {user?.healthCondition || 'None specified'}
                      </Typography>
                    </Grid>
                  )}
                  
                  {user?.userType === 'Family' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Relation to Patient
                      </Typography>
                      <Typography variant="body1">
                        {user?.relationToPatient || 'Not specified'}
                      </Typography>
                    </Grid>
                  )}
                  
                  {user?.userType === 'Nurse' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Assigned Hospital
                      </Typography>
                      <Typography variant="body1">
                        {user?.assignedHospital || 'Not specified'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 