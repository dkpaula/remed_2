import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Alarm as AlarmIcon,
  Save as SaveIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../api/medicineService';
import reminderService from '../../api/reminderService';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Daily'];

const ALARM_SOUNDS = [
  { id: 'default', name: 'Default' },
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'alert', name: 'Alert' },
  { id: 'gentle', name: 'Gentle' },
];

const ReminderForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { medicineId } = useParams();
  const { user } = useAuth();
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [reminders, setReminders] = useState([
    { 
      time: new Date(), 
      days: ['Daily'], 
      alarmSound: 'default',
      flexible: true,
      flexibleWindow: 30, // minutes
      snoozeEnabled: true,
      snoozeInterval: 5, // minutes
      vibration: true,
      critical: false
    }
  ]);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setError(null);
        const data = await medicineService.getMedicine(medicineId);
        setMedicine(data);
        
        // If there are existing reminders, load them
        if (data.frequencies && data.frequencies.length > 0) {
          const formattedReminders = data.frequencies.map(freq => {
            // Parse time string to Date object
            const timeStr = freq.Time;
            const [hours, minutes] = timeStr.split(':').map(Number);
            const timeObj = new Date();
            timeObj.setHours(hours, minutes, 0);
            
            return {
              id: freq.Frequency_ID,
              time: timeObj,
              days: freq.Day === 'Daily' ? ['Daily'] : [freq.Day],
              alarmSound: 'default',
              flexible: true,
              flexibleWindow: 30,
              snoozeEnabled: true,
              snoozeInterval: 5,
              vibration: true,
              critical: false
            };
          });
          setReminders(formattedReminders);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch medicine details');
        setLoading(false);
      }
    };
    
    if (medicineId) {
      fetchMedicineDetails();
    } else {
      setLoading(false);
    }
  }, [medicineId]);

  const handleTimeChange = (index, newValue) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].time = newValue;
    setReminders(updatedReminders);
  };

  const handleDayToggle = (index, day) => {
    const updatedReminders = [...reminders];
    const currentDays = updatedReminders[index].days;
    
    // Handle "Daily" special case
    if (day === 'Daily') {
      if (currentDays.includes('Daily')) {
        updatedReminders[index].days = [];
      } else {
        updatedReminders[index].days = ['Daily'];
      }
    } else {
      // If "Daily" is selected, remove it
      if (currentDays.includes('Daily')) {
        updatedReminders[index].days = [day];
      } else {
        if (currentDays.includes(day)) {
          updatedReminders[index].days = currentDays.filter(d => d !== day);
        } else {
          updatedReminders[index].days = [...currentDays, day];
        }
      }
    }
    
    setReminders(updatedReminders);
  };

  const handleAlarmSoundChange = (index, sound) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].alarmSound = sound;
    setReminders(updatedReminders);
  };

  const handleFlexibleChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].flexible = event.target.checked;
    setReminders(updatedReminders);
  };

  const handleFlexibleWindowChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].flexibleWindow = event.target.value;
    setReminders(updatedReminders);
  };

  const handleSnoozeEnabledChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].snoozeEnabled = event.target.checked;
    setReminders(updatedReminders);
  };

  const handleSnoozeIntervalChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].snoozeInterval = event.target.value;
    setReminders(updatedReminders);
  };

  const handleVibrationChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].vibration = event.target.checked;
    setReminders(updatedReminders);
  };

  const handleCriticalChange = (index, event) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].critical = event.target.checked;
    setReminders(updatedReminders);
  };

  const addReminder = () => {
    setReminders([
      ...reminders,
      {
        time: new Date(),
        days: ['Daily'],
        alarmSound: 'default',
        flexible: true,
        flexibleWindow: 30,
        snoozeEnabled: true,
        snoozeInterval: 5,
        vibration: true,
        critical: false
      }
    ]);
  };

  const removeReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Format reminders for API
      const apiReminders = reminders.map(reminder => {
        // For each day in the days array, create a separate frequency
        return reminder.days.map(day => ({
          time: `${reminder.time.getHours().toString().padStart(2, '0')}:${reminder.time.getMinutes().toString().padStart(2, '0')}`,
          day: day,
          flexibleWindow: reminder.flexible ? reminder.flexibleWindow : 0,
          options: {
            alarmSound: reminder.alarmSound,
            snoozeEnabled: reminder.snoozeEnabled,
            snoozeInterval: reminder.snoozeInterval,
            vibration: reminder.vibration,
            critical: reminder.critical
          }
        }));
      }).flat();
      
      // Clear existing reminders and set new ones
      await reminderService.updateMedicineReminders(medicineId, { frequencies: apiReminders });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/medicines`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save reminders');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: { xs: 0, sm: 4 },
          background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => navigate('/medicines')}
              sx={{ color: 'white', mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Set Medication Reminders
            </Typography>
          </Box>
        </Box>
        {medicine && (
          <Typography variant="subtitle1" sx={{ mt: 1, ml: 4, opacity: 0.9 }}>
            {medicine.Medicine_Name} - {medicine.Dosage}
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Reminders saved successfully!
        </Alert>
      )}

      <Box mb={4}>
        {reminders.map((reminder, index) => (
          <Paper key={index} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AlarmIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Reminder {index + 1}
              </Typography>
              {reminders.length > 1 && (
                <IconButton color="error" onClick={() => removeReminder(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Time"
                    value={reminder.time}
                    onChange={(newValue) => handleTimeChange(index, newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Alarm Sound</InputLabel>
                  <Select
                    value={reminder.alarmSound}
                    onChange={(e) => handleAlarmSoundChange(index, e.target.value)}
                    label="Alarm Sound"
                  >
                    {ALARM_SOUNDS.map(sound => (
                      <MenuItem key={sound.id} value={sound.id}>
                        {sound.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Days
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      clickable
                      color={reminder.days.includes(day) ? "primary" : "default"}
                      onClick={() => handleDayToggle(index, day)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder.flexible}
                      onChange={(e) => handleFlexibleChange(index, e)}
                      color="primary"
                    />
                  }
                  label="Flexible timing"
                />
                {reminder.flexible && (
                  <TextField
                    label="Flexible window (minutes)"
                    type="number"
                    value={reminder.flexibleWindow}
                    onChange={(e) => handleFlexibleWindowChange(index, e)}
                    fullWidth
                    margin="normal"
                    InputProps={{ inputProps: { min: 5, max: 120 } }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder.snoozeEnabled}
                      onChange={(e) => handleSnoozeEnabledChange(index, e)}
                      color="primary"
                    />
                  }
                  label="Enable snooze"
                />
                {reminder.snoozeEnabled && (
                  <TextField
                    label="Snooze interval (minutes)"
                    type="number"
                    value={reminder.snoozeInterval}
                    onChange={(e) => handleSnoozeIntervalChange(index, e)}
                    fullWidth
                    margin="normal"
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder.vibration}
                      onChange={(e) => handleVibrationChange(index, e)}
                      color="primary"
                    />
                  }
                  label="Vibration"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder.critical}
                      onChange={(e) => handleCriticalChange(index, e)}
                      color="primary"
                    />
                  }
                  label="Critical medication (priority notification)"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addReminder}
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
        >
          Add Another Time
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => navigate('/medicines')}
          startIcon={<ArrowBackIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<SaveIcon />}
          disabled={saving || reminders.length === 0}
          color="primary"
        >
          {saving ? <CircularProgress size={24} /> : 'Save Reminders'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReminderForm; 