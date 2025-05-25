import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  Stack,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Category as CategoryIcon,
  ColorLens as ColorLensIcon,
  TabletMac as TabletIcon,
  Image as ImageIcon,
  FormatShapes as ShapeIcon,
  Notes as NotesIcon,
  NoteAdd as NoteAddIcon,
  Medication as MedicationIcon,
  SentimentSatisfiedAlt as SentimentSatisfiedAltIcon,
  CalendarMonth as CalendarIcon,
  Alarm as AlarmIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../api/medicineService';
import reminderService from '../../api/reminderService';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// List of common medications for autocomplete
const commonMedicines = [
  { name: 'Acetaminophen (Tylenol)', generic: 'Acetaminophen' },
  { name: 'Ibuprofen (Advil, Motrin)', generic: 'Ibuprofen' },
  { name: 'Aspirin (Bayer)', generic: 'Acetylsalicylic acid' },
  { name: 'Amoxicillin', generic: 'Amoxicillin' },
  { name: 'Lisinopril', generic: 'Lisinopril' },
  { name: 'Atorvastatin (Lipitor)', generic: 'Atorvastatin' },
  { name: 'Metformin (Glucophage)', generic: 'Metformin' },
  { name: 'Amlodipine (Norvasc)', generic: 'Amlodipine' },
  { name: 'Omeprazole (Prilosec)', generic: 'Omeprazole' },
  { name: 'Simvastatin (Zocor)', generic: 'Simvastatin' },
  { name: 'Levothyroxine (Synthroid)', generic: 'Levothyroxine' },
  { name: 'Metoprolol (Lopressor)', generic: 'Metoprolol' },
  { name: 'Losartan (Cozaar)', generic: 'Losartan' },
  { name: 'Albuterol (Ventolin)', generic: 'Albuterol' },
  { name: 'Gabapentin (Neurontin)', generic: 'Gabapentin' },
  { name: 'Hydrochlorothiazide', generic: 'Hydrochlorothiazide' },
  { name: 'Azithromycin (Zithromax)', generic: 'Azithromycin' },
  { name: 'Citalopram (Celexa)', generic: 'Citalopram' },
  { name: 'Fluoxetine (Prozac)', generic: 'Fluoxetine' },
  { name: 'Sertraline (Zoloft)', generic: 'Sertraline' },
  { name: 'Escitalopram (Lexapro)', generic: 'Escitalopram' },
  { name: 'Trazodone', generic: 'Trazodone' },
  { name: 'Prednisone', generic: 'Prednisone' },
  { name: 'Furosemide (Lasix)', generic: 'Furosemide' },
  { name: 'Pantoprazole (Protonix)', generic: 'Pantoprazole' },
  { name: 'Cetirizine (Zyrtec)', generic: 'Cetirizine' },
  { name: 'Loratadine (Claritin)', generic: 'Loratadine' },
  { name: 'Montelukast (Singulair)', generic: 'Montelukast' },
  { name: 'Carvedilol (Coreg)', generic: 'Carvedilol' },
  { name: 'Tamsulosin (Flomax)', generic: 'Tamsulosin' },
  { name: 'Cyclobenzaprine (Flexeril)', generic: 'Cyclobenzaprine' },
  { name: 'Tramadol (Ultram)', generic: 'Tramadol' },
  { name: 'Alprazolam (Xanax)', generic: 'Alprazolam' },
  { name: 'Clonazepam (Klonopin)', generic: 'Clonazepam' },
  { name: 'Warfarin (Coumadin)', generic: 'Warfarin' },
  { name: 'Clopidogrel (Plavix)', generic: 'Clopidogrel' },
  { name: 'Duloxetine (Cymbalta)', generic: 'Duloxetine' },
  { name: 'Metronidazole (Flagyl)', generic: 'Metronidazole' },
  { name: 'Meloxicam (Mobic)', generic: 'Meloxicam' },
  { name: 'Naproxen (Aleve)', generic: 'Naproxen' }
];

// Pill colors
const pillColors = [
  'White', 'Yellow', 'Orange', 'Pink', 'Red', 
  'Purple', 'Blue', 'Green', 'Brown', 'Black', 'Gray'
];

// Pill shapes
const pillShapes = [
  'Round', 'Oval', 'Oblong', 'Rectangle', 'Diamond', 
  'Triangle', 'Square', 'Hexagon', 'Pentagon', 'Capsule'
];

// Days of the week for reminders
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Daily'];

// Alarm sounds options
const ALARM_SOUNDS = [
  { id: 'default', name: 'Default' },
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'alert', name: 'Alert' },
  { id: 'gentle', name: 'Gentle' },
];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AddMedicine = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    dosage: '',
    description: '',
    expirationDate: null,
    initialQuantity: '',
    category: 'Other',
    form: 'Tablet',
    color: '',
    shape: '',
    imagePath: '',
    asNeeded: false,
    notes: ''
  });
  
  // State for reminders
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
  
  const [formErrors, setFormErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleMedicineChange = (event, newValue) => {
    if (newValue) {
      setFormData({
        ...formData,
        medicineName: newValue.name,
        genericName: newValue.generic || ''
      });
      
      // Clear validation errors
      if (formErrors.medicineName) {
        setFormErrors({
          ...formErrors,
          medicineName: ''
        });
      }
    } else {
      setFormData({
        ...formData,
        medicineName: '',
        genericName: ''
      });
    }
  };
  
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
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      expirationDate: e.target.value // Will be in YYYY-MM-DD format
    });
    
    if (formErrors.expirationDate) {
      setFormErrors({
        ...formErrors,
        expirationDate: ''
      });
    }
  };
  
  // Reminder handlers
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
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.medicineName.trim()) {
      errors.medicineName = 'Medicine name is required';
    }
    
    if (!formData.dosage.trim()) {
      errors.dosage = 'Dosage is required';
    }
    
    if (!formData.initialQuantity.trim()) {
      errors.initialQuantity = 'Initial quantity is required';
    } else if (isNaN(formData.initialQuantity) || parseInt(formData.initialQuantity) <= 0) {
      errors.initialQuantity = 'Quantity must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const continueToReminders = () => {
    if (validateForm()) {
      setTabValue(1);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      console.log("Patient ID:", patientId);
      
      if (!patientId) {
        throw new Error('No patient selected');
      }
      
      // Format expiration date if provided
      const expirationDate = formData.expirationDate || null;
      
      // Create medicine data object
      const medicineData = {
        medicineName: formData.medicineName,
        genericName: formData.genericName,
        dosage: formData.dosage,
        description: formData.description,
        expirationDate,
        patientId,
        initialQuantity: parseInt(formData.initialQuantity),
        category: formData.category,
        form: formData.form,
        color: formData.color,
        shape: formData.shape,
        imagePath: formData.imagePath,
        asNeeded: formData.asNeeded,
        notes: formData.notes
      };
      
      console.log('Submitting medicine data:', medicineData);
      
      // Add the medicine first to get the medicine ID
      const result = await medicineService.addMedicine(medicineData);
      console.log('Medicine added successfully:', result);
      
      // Now add the reminders if we have any
      if (reminders.length > 0 && result.medicineId) {
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
        
        // Add reminders for the medicine
        await reminderService.updateMedicineReminders(result.medicineId, { frequencies: apiReminders });
        console.log('Reminders added successfully');
      }
      
      // Update success state
      setSuccess(true);
      setLoading(false);
      
      alert("Medicine and reminders added successfully!");
      
      // Navigate immediately
      navigate('/medicines');
      
    } catch (error) {
      console.error('Error adding medicine:', error);
      setError(error.message || 'Failed to add medicine. Please try again.');
      setLoading(false);
      setSuccess(false);
      alert("Failed to add medicine: " + (error.message || "Server error"));
    }
  };
  
  return (
    <Box sx={{ pb: 8 }}>
      {/* Header with gradient and icon */}
      <Box
        sx={{
          width: '100%',
          py: 4,
          px: 2,
          mb: 3,
          background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
          boxShadow: 3
        }}
      >
        <Avatar sx={{ width: 72, height: 72, bgcolor: 'white', color: 'primary.main', mb: 2, boxShadow: 2 }}>
          <MedicationIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
          Add New Medicine
        </Typography>
        <Typography variant="body1" color="white" align="center">
          Enter details and set reminders for your medication.
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, width: '100%', maxWidth: 800 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success ? (
            <Box textAlign="center" py={6}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: '#e3f2fd', color: '#009688', mb: 2, mx: 'auto' }}>
                <SentimentSatisfiedAltIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                Medicine added successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Redirecting to your medicine cabinet...
              </Typography>
            </Box>
          ) : (
            <Box>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth" 
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  icon={<MedicationIcon />} 
                  label="Medicine Details" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<AlarmIcon />} 
                  label="Set Reminders" 
                  iconPosition="start"
                />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <Box component="form">
                  <Grid container spacing={2}>
                    {/* Medicine Search */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        id="medicine-search"
                        options={commonMedicines}
                        getOptionLabel={(option) => option.name}
                        fullWidth
                        onChange={handleMedicineChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Medicine Name"
                            variant="outlined"
                            name="medicineName"
                            error={!!formErrors.medicineName}
                            helperText={formErrors.medicineName}
                            required
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MedicationIcon color="primary" />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    {/* Generic Name */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Generic Name"
                        name="genericName"
                        value={formData.genericName}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NotesIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {/* Dosage */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Dosage (e.g., 500mg, 10ml)"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        variant="outlined"
                        error={!!formErrors.dosage}
                        helperText={formErrors.dosage}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TabletIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {/* Initial Quantity */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Initial Quantity"
                        name="initialQuantity"
                        type="number"
                        value={formData.initialQuantity}
                        onChange={handleChange}
                        variant="outlined"
                        error={!!formErrors.initialQuantity}
                        helperText={formErrors.initialQuantity}
                        required
                        InputProps={{
                          inputProps: { min: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {/* Medication Category */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          label="Category"
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="Prescription">Prescription</MenuItem>
                          <MenuItem value="OTC">Over-the-Counter</MenuItem>
                          <MenuItem value="Vitamin">Vitamin</MenuItem>
                          <MenuItem value="Supplement">Supplement</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Medication Form */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="form-label">Form</InputLabel>
                        <Select
                          labelId="form-label"
                          id="form"
                          name="form"
                          value={formData.form}
                          onChange={handleChange}
                          label="Form"
                          startAdornment={
                            <InputAdornment position="start">
                              <TabletIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="Tablet">Tablet</MenuItem>
                          <MenuItem value="Capsule">Capsule</MenuItem>
                          <MenuItem value="Liquid">Liquid</MenuItem>
                          <MenuItem value="Injection">Injection</MenuItem>
                          <MenuItem value="Inhaler">Inhaler</MenuItem>
                          <MenuItem value="Patch">Patch</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* As Needed Switch */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.asNeeded}
                            onChange={handleSwitchChange}
                            name="asNeeded"
                            color="primary"
                          />
                        }
                        label="Take as needed (PRN)"
                      />
                    </Grid>
                    {/* Expiration Date */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Expiration Date"
                        name="expirationDate"
                        type="date"
                        value={formData.expirationDate || ''}
                        onChange={handleDateChange}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {/* Description */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Short Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={1}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NotesIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {/* Advanced Options Toggle */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" my={1}>
                        <Divider sx={{ flexGrow: 1, mr: 2 }} />
                        <Button
                          variant="outlined"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          startIcon={<NoteAddIcon />}
                          sx={{ borderRadius: 50, fontWeight: 600 }}
                        >
                          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                        </Button>
                        <Divider sx={{ flexGrow: 1, ml: 2 }} />
                      </Box>
                    </Grid>
                    {/* Advanced Options */}
                    {showAdvanced && (
                      <>
                        {/* Color */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel id="color-label">Pill Color</InputLabel>
                            <Select
                              labelId="color-label"
                              id="color"
                              name="color"
                              value={formData.color}
                              onChange={handleChange}
                              label="Pill Color"
                              startAdornment={
                                <InputAdornment position="start">
                                  <ColorLensIcon />
                                </InputAdornment>
                              }
                            >
                              {pillColors.map(color => (
                                <MenuItem key={color} value={color}>{color}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {/* Shape */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel id="shape-label">Shape</InputLabel>
                            <Select
                              labelId="shape-label"
                              id="shape"
                              name="shape"
                              value={formData.shape}
                              onChange={handleChange}
                              label="Shape"
                              startAdornment={
                                <InputAdornment position="start">
                                  <ShapeIcon />
                                </InputAdornment>
                              }
                            >
                              {pillShapes.map(shape => (
                                <MenuItem key={shape} value={shape}>{shape}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {/* Image Path */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Image URL (optional)"
                            name="imagePath"
                            value={formData.imagePath}
                            onChange={handleChange}
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ImageIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        {/* Detailed Notes */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Detailed Notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            variant="outlined"
                            multiline
                            rows={4}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <NotesIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/medicines')}
                      startIcon={<ArrowBackIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={continueToReminders}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Continue to Set Reminders
                    </Button>
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Set Medication Reminder Schedule
                  </Typography>
                  
                  <Box mb={4}>
                    {reminders.map((reminder, index) => (
                      <Paper key={index} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AlarmIcon sx={{ mr: 1, color: 'primary.main' }} />
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

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={() => setTabValue(0)}
                      startIcon={<ArrowBackIcon />}
                    >
                      Back to Details
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Saving...' : 'Save Medicine & Reminders'}
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AddMedicine; 