import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  CardActions,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Medication as MedicationIcon,
  Notifications as NotificationsIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import reminderService from '../../api/reminderService';
import vaultService from '../../api/vaultService';
import reportService from '../../api/reportService';
import intakeService from '../../api/intakeService';
import PatientSelector from '../layout/PatientSelector';
import MedisafeStats from './MedisafeStats';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const Dashboard = () => {
  const { user, patients } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [todayReminders, setTodayReminders] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [missedMedications, setMissedMedications] = useState([]);
  const [loading, setLoading] = useState({
    reminders: true,
    inventory: true,
    reports: true,
    missed: true
  });
  const [error, setError] = useState({
    reminders: null,
    inventory: null,
    reports: null,
    missed: null
  });
  const navigate = useNavigate();

  // Helper to get the selected patient name from the patients array
  const getSelectedPatientName = () => {
    if (!user || !user.selectedPatientId) return '';
    
    const selectedPatient = patients.find(p => p.User_ID === user.selectedPatientId);
    return selectedPatient ? selectedPatient.Name : '';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch data for patients or if a caretaker has patients linked
      if (user) {
        try {
          // Fetch today's reminders
          setLoading(prev => ({ ...prev, reminders: true }));
          const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
          if (patientId) {
            const reminderData = await reminderService.getTodayReminders(patientId);
            setTodayReminders(reminderData.reminders || []);
          } else {
            setTodayReminders([]);
          }
        } catch (err) {
          setError(prev => ({ ...prev, reminders: err.message }));
        } finally {
          setLoading(prev => ({ ...prev, reminders: false }));
        }

        try {
          // Fetch low inventory medicines
          setLoading(prev => ({ ...prev, inventory: true }));
          const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
          if (patientId) {
            const inventoryData = await vaultService.getLowInventory(patientId);
            setLowInventory(inventoryData.lowInventory || []);
          } else {
            setLowInventory([]);
          }
        } catch (err) {
          setError(prev => ({ ...prev, inventory: err.message }));
        } finally {
          setLoading(prev => ({ ...prev, inventory: false }));
        }

        try {
          // Fetch recent reports
          setLoading(prev => ({ ...prev, reports: true }));
          const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
          if (patientId) {
            const reportData = await reportService.getPatientReports(patientId);
            setRecentReports(reportData.reports?.slice(0, 5) || []);
          } else {
            setRecentReports([]);
          }
        } catch (err) {
          setError(prev => ({ ...prev, reports: err.message }));
        } finally {
          setLoading(prev => ({ ...prev, reports: false }));
        }
        
        try {
          // Fetch missed medications
          setLoading(prev => ({ ...prev, missed: true }));
          const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
          if (patientId) {
            const missedData = await intakeService.getMissedMedications(patientId, 7);
            setMissedMedications(missedData.missed || []);
          } else {
            setMissedMedications([]);
          }
        } catch (err) {
          setError(prev => ({ ...prev, missed: err.message }));
        } finally {
          setLoading(prev => ({ ...prev, missed: false }));
        }
      }
    };

    fetchDashboardData();
  }, [user, user?.selectedPatientId]);
  
  const markAsTaken = async (reminder) => {
    try {
      const today = new Date();
      
      await intakeService.recordIntake({
        frequencyId: reminder.Frequency_ID,
        status: 'Taken',
        scheduledFor: today.toISOString(),
        notes: `Marked as taken from dashboard on ${today.toLocaleString()}`
      });
      
      // Update the reminder in the list
      setTodayReminders(prev => 
        prev.map(r => 
          r.Frequency_ID === reminder.Frequency_ID 
            ? { ...r, Status: 'Taken' } 
            : r
        )
      );
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      // Could show an error toast here
    }
  };
  
  const markAsSkipped = async (reminder) => {
    try {
      const today = new Date();
      
      await intakeService.recordIntake({
        frequencyId: reminder.Frequency_ID,
        status: 'Skipped',
        scheduledFor: today.toISOString(),
        notes: `Marked as skipped from dashboard on ${today.toLocaleString()}`
      });
      
      // Update the reminder in the list
      setTodayReminders(prev => 
        prev.map(r => 
          r.Frequency_ID === reminder.Frequency_ID 
            ? { ...r, Status: 'Skipped' } 
            : r
        )
      );
    } catch (error) {
      console.error('Error marking medication as skipped:', error);
      // Could show an error toast here
    }
  };

  return (
    <>
      {/* Patient Selector for Family and Nurse users */}
      {(user?.userType === 'Family' || user?.userType === 'Nurse') && <PatientSelector />}
      
      {/* Show instructions if caregiver has no patient selected */}
      {(user?.userType === 'Family' || user?.userType === 'Nurse') && !user?.selectedPatientId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select or link a patient to manage their medications.
        </Alert>
      )}
    
      {/* Only show dashboard content if user is a patient or a caretaker with selected patient */}
      {(user?.userType === 'Patient' || (user?.selectedPatientId && (user?.userType === 'Family' || user?.userType === 'Nurse'))) && (
        <Box sx={{ position: 'relative', pb: 8 }}>
          <Grid container spacing={3}>
            {/* Welcome Section */}
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: 6,
                  mb: 2
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: 'primary.main', mr: 2, boxShadow: 2 }}>
                    <MedicationIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
                      {user?.userType === 'Patient' 
                        ? `Welcome, ${user?.name || 'User'}!`
                        : `Managing medications for ${getSelectedPatientName()}`
                      }
                    </Typography>
                    <Typography variant="body1" color="white">
                      {user?.userType === 'Patient' 
                        ? 'Manage your medications and stay on track with your health journey.'
                        : `You are helping ${getSelectedPatientName()} stay on track with their medications.`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Medisafe Stats */}
            <Grid item xs={12} md={4}>
              <MedisafeStats />
            </Grid>

            {/* Today's Reminders */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 4 }}>
                <CardHeader
                  title={<Typography variant="h6" fontWeight="bold">Today's Medications</Typography>}
                  avatar={<NotificationsIcon color="primary" />}
                  action={
                    <Button
                      component={Link}
                      to="/reminders"
                      size="small"
                      color="primary"
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      sx={{ borderRadius: 50, fontWeight: 600 }}
                    >
                      All Reminders
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ overflow: 'auto', maxHeight: isMobile ? 400 : 500 }}>
                  {loading.reminders ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : error.reminders ? (
                    <Alert severity="error">{error.reminders}</Alert>
                  ) : todayReminders.length > 0 ? (
                    <List>
                      {todayReminders.map((reminder) => (
                        <React.Fragment key={reminder.Frequency_ID}>
                          <ListItem>
                            <Grid container spacing={1} alignItems="center">
                              <Grid item xs={12} sm={4}>
                                <Box display="flex" alignItems="center">
                                  <Box 
                                    sx={{ 
                                      bgcolor: reminder.Color ? reminder.Color.toLowerCase() : 'primary.light',
                                      width: 16,
                                      height: 16,
                                      borderRadius: '50%',
                                      mr: 1
                                    }} 
                                  />
                                  <ListItemText
                                    primary={reminder.Medicine_Name}
                                    secondary={`${reminder.Dosage} - ${reminder.Form || 'Tablet'}`}
                                    primaryTypographyProps={{ 
                                      fontWeight: reminder.Status === 'Active' ? 'bold' : 'regular',
                                      color: reminder.Status === 'Active' ? 'primary.main' : 'text.primary'
                                    }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(`2000-01-01T${reminder.Time}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={5}>
                                {reminder.Status === 'Active' ? (
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Tooltip title="Mark as taken" arrow>
                                      <IconButton 
                                        color="success" 
                                        size="small"
                                        onClick={() => markAsTaken(reminder)}
                                        sx={{ borderRadius: 50 }}
                                      >
                                        <CheckCircleIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Skip" arrow>
                                      <IconButton 
                                        color="warning" 
                                        size="small"
                                        onClick={() => markAsSkipped(reminder)}
                                        sx={{ borderRadius: 50 }}
                                      >
                                        <CancelIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                ) : (
                                  <Chip 
                                    label={reminder.Status} 
                                    color={reminder.Status === 'Taken' ? 'success' : 'warning'} 
                                    size="small"
                                    sx={{ float: 'right', borderRadius: 50 }}
                                  />
                                )}
                              </Grid>
                            </Grid>
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box p={3} textAlign="center">
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', mb: 2, mx: 'auto' }}>
                        <SentimentSatisfiedAltIcon sx={{ color: '#009688', fontSize: 32 }} />
                      </Avatar>
                      <Typography color="textSecondary" gutterBottom>No medications scheduled for today</Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate('/medicines/add')}
                        startIcon={<MedicationIcon />}
                        sx={{ mt: 1, borderRadius: 50, fontWeight: 600 }}
                      >
                        Add Medicine
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory Alerts */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 4 }}>
                <CardHeader
                  title={<Typography variant="h6" fontWeight="bold">Inventory Alerts</Typography>}
                  avatar={<WarningIcon color="warning" />}
                  action={
                    <Button
                      component={Link}
                      to="/inventory"
                      size="small"
                      color="primary"
                      variant="outlined"
                      startIcon={<InventoryIcon />}
                      sx={{ borderRadius: 50, fontWeight: 600 }}
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {loading.inventory ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : error.inventory ? (
                    <Alert severity="error">{error.inventory}</Alert>
                  ) : lowInventory.length > 0 ? (
                    <List>
                      {lowInventory.map((item) => (
                        <React.Fragment key={item.Medicine_ID}>
                          <ListItem>
                            <Box flexGrow={1}>
                              <Typography variant="subtitle1" fontWeight="medium">{item.Medicine_Name}</Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                  {item.Quantity} {item.Quantity === 1 ? 'unit' : 'units'} remaining
                                </Typography>
                                <Chip 
                                  label={`${item.Quantity} Left`} 
                                  color={item.Quantity <= 3 ? 'error' : 'warning'} 
                                  size="small" 
                                  sx={{ borderRadius: 50 }}
                                />
                              </Box>
                            </Box>
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box p={2} textAlign="center">
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', mb: 2, mx: 'auto' }}>
                        <SentimentSatisfiedAltIcon sx={{ color: '#009688', fontSize: 32 }} />
                      </Avatar>
                      <Typography color="textSecondary">No low inventory alerts</Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    to="/inventory"
                    sx={{ borderRadius: 50, fontWeight: 600 }}
                  >
                    Manage Inventory
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Missed Medications */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 4 }}>
                <CardHeader
                  title={<Typography variant="h6" fontWeight="bold">Missed Medications</Typography>}
                  avatar={<HistoryIcon color="error" />}
                  action={
                    <Tooltip title="Shows medications missed in the past 7 days">
                      <IconButton size="small">
                        <TrendingUpIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {loading.missed ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : error.missed ? (
                    <Alert severity="error">{error.missed}</Alert>
                  ) : missedMedications.length > 0 ? (
                    <List>
                      {missedMedications.map((item) => (
                        <React.Fragment key={item.Medicine_ID}>
                          <ListItem>
                            <Box flexGrow={1}>
                              <Typography variant="subtitle1" fontWeight="medium">{item.Medicine_Name}</Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                  {item.Dosage}
                                </Typography>
                                <Chip 
                                  label={`Missed ${item.Missed_Count} times`} 
                                  color="error" 
                                  size="small" 
                                  sx={{ borderRadius: 50 }}
                                />
                              </Box>
                            </Box>
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box p={2} textAlign="center">
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', mb: 2, mx: 'auto' }}>
                        <SentimentSatisfiedAltIcon sx={{ color: '#009688', fontSize: 32 }} />
                      </Avatar>
                      <Typography color="textSecondary">No missed medications in the past 7 days</Typography>
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label="Great job with medication adherence!" 
                        color="success" 
                        variant="outlined"
                        sx={{ mt: 1, borderRadius: 50 }}
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    to="/reminders"
                    sx={{ borderRadius: 50, fontWeight: 600 }}
                  >
                    View Reminders
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          {/* Floating Action Button for Add Medicine */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 40 },
              right: { xs: 24, sm: 40 },
              zIndex: 1200,
              boxShadow: 6
            }}
            onClick={() => navigate('/medicines/add')}
          >
            <AddIcon fontSize="large" />
          </Fab>
        </Box>
      )}
    </>
  );
};

export default Dashboard; 