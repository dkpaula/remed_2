import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as SkipIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import reminderService from '../../api/reminderService';
import { Link } from 'react-router-dom';

// Helper to format time
const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ReminderList = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reminders, setReminders] = useState({
    today: [],
    all: []
  });
  const [loading, setLoading] = useState({
    today: true,
    all: false
  });
  const [error, setError] = useState({
    today: null,
    all: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    frequencyId: null
  });

  useEffect(() => {
    fetchTodayReminders();
  }, [user]);

  const fetchTodayReminders = async () => {
    try {
      setLoading(prev => ({ ...prev, today: true }));
      setError(prev => ({ ...prev, today: null }));
      
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        const data = await reminderService.getTodayReminders(patientId);
        setReminders(prev => ({ ...prev, today: data.reminders || [] }));
      } else {
        setReminders(prev => ({ ...prev, today: [] }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, today: err.message || 'Failed to fetch today reminders' }));
    } finally {
      setLoading(prev => ({ ...prev, today: false }));
    }
  };

  const fetchAllReminders = async () => {
    try {
      setLoading(prev => ({ ...prev, all: true }));
      setError(prev => ({ ...prev, all: null }));
      
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        const data = await reminderService.getAllReminders(patientId);
        setReminders(prev => ({ ...prev, all: data.reminders || [] }));
      } else {
        setReminders(prev => ({ ...prev, all: [] }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, all: err.message || 'Failed to fetch all reminders' }));
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load all reminders if switching to that tab and we haven't loaded them yet
    if (newValue === 1 && reminders.all.length === 0 && !loading.all) {
      fetchAllReminders();
    }
  };

  const handleTakeMedicineConfirm = (frequencyId) => {
    setConfirmDialog({
      open: true,
      type: 'take',
      frequencyId
    });
  };

  const handleSkipMedicineConfirm = (frequencyId) => {
    setConfirmDialog({
      open: true,
      type: 'skip',
      frequencyId
    });
  };

  const handleDialogClose = () => {
    setConfirmDialog({
      open: false,
      type: null,
      frequencyId: null
    });
  };

  const handleActionConfirm = async () => {
    const { type, frequencyId } = confirmDialog;
    
    if (type === 'take') {
      await handleTakeMedicine(frequencyId);
    } else if (type === 'skip') {
      await handleSkipMedicine(frequencyId);
    }
    
    handleDialogClose();
  };

  const handleTakeMedicine = async (frequencyId) => {
    try {
      await reminderService.takeMedicine(frequencyId, { status: 'Taken' });
      
      // Update today's reminders to mark this one as taken
      setReminders(prev => ({
        ...prev,
        today: prev.today.map(reminder => 
          reminder.Frequency_ID === frequencyId 
            ? { ...reminder, Status: 'Taken' } 
            : reminder
        )
      }));

      setSnackbar({
        open: true,
        message: 'Medicine marked as taken!',
        severity: 'success'
      });
    } catch (err) {
      setError(prev => ({ ...prev, today: err.message || 'Failed to update reminder status' }));
      setSnackbar({
        open: true,
        message: 'Failed to update status: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  const handleSkipMedicine = async (frequencyId) => {
    try {
      await reminderService.takeMedicine(frequencyId, { status: 'Skipped' });
      
      // Update today's reminders to mark this one as skipped
      setReminders(prev => ({
        ...prev,
        today: prev.today.map(reminder => 
          reminder.Frequency_ID === frequencyId 
            ? { ...reminder, Status: 'Skipped' } 
            : reminder
        )
      }));

      setSnackbar({
        open: true,
        message: 'Medicine marked as skipped',
        severity: 'info'
      });
    } catch (err) {
      setError(prev => ({ ...prev, today: err.message || 'Failed to update reminder status' }));
      setSnackbar({
        open: true,
        message: 'Failed to update status: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchTodayReminders();
    } else {
      fetchAllReminders();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            component={Link} 
            to="/dashboard" 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Dashboard
          </Button>
          <Typography variant="h4" component="h1">
            Medication Reminders
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab 
          label={
            <Badge 
              color="primary" 
              badgeContent={reminders.today.filter(r => r.Status === 'Active').length} 
              showZero={false}
            >
              Today's Reminders
            </Badge>
          } 
        />
        <Tab label="All Schedules" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {error.today && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.today}
            </Alert>
          )}
          
          {loading.today ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : reminders.today.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                No medication reminders for today.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/medicines/add"
                sx={{ mt: 2 }}
              >
                Add Medicine
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List>
                    {reminders.today.map((reminder) => (
                      <React.Fragment key={reminder.Frequency_ID}>
                        <ListItem
                          sx={{
                            backgroundColor: 
                              reminder.Status === 'Taken' 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : reminder.Status === 'Skipped' 
                                  ? 'rgba(244, 67, 54, 0.1)' 
                                  : 'inherit'
                          }}
                          secondaryAction={
                            reminder.Status === 'Active' ? (
                              <Box>
                                <Tooltip title="Mark as Taken">
                                  <IconButton
                                    edge="end"
                                    color="success"
                                    onClick={() => handleTakeMedicineConfirm(reminder.Frequency_ID)}
                                    sx={{ mr: 1 }}
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Skip This Dose">
                                  <IconButton
                                    edge="end"
                                    color="error"
                                    onClick={() => handleSkipMedicineConfirm(reminder.Frequency_ID)}
                                  >
                                    <SkipIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Chip 
                                label={reminder.Status} 
                                color={reminder.Status === 'Taken' ? 'success' : 'error'} 
                                size="small" 
                                variant="outlined"
                              />
                            )
                          }
                        >
                          <ListItemText
                            primary={
                              <Typography variant="h6">
                                {reminder.Medicine_Name} ({reminder.Dosage})
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography component="span" variant="body2">
                                  <ScheduleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {formatTime(reminder.Time)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {tabValue === 1 && (
        <>
          {error.all && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.all}
            </Alert>
          )}
          
          {loading.all ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : reminders.all.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No medication schedules found.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper>
                  <List>
                    {reminders.all.map((reminder) => (
                      <React.Fragment key={reminder.Frequency_ID}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="h6">
                                {reminder.Medicine_Name} ({reminder.Dosage})
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography component="span" variant="body2">
                                  <ScheduleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {formatTime(reminder.Time)} - {reminder.Day}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleDialogClose}
      >
        <DialogTitle>
          {confirmDialog.type === 'take' ? 'Confirm Medication Taken' : 'Skip Medication?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'take' 
              ? 'Are you sure you have taken this medication?' 
              : 'Are you sure you want to skip this dose?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleActionConfirm}
            color={confirmDialog.type === 'take' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmDialog.type === 'take' ? 'Yes, I took it' : 'Yes, Skip it'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReminderList; 