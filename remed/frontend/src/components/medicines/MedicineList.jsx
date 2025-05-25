import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  ListItemIcon,
  ListItemText,
  List,
  ListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Medication as MedicationIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  LocalPharmacy as PharmacyIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../api/medicineService';
import Fab from '@mui/material/Fab';

// Helper function to generate pill color avatars
const PillAvatar = ({ color = '#f0f0f0', form = 'Tablet' }) => {
  return (
    <Avatar 
      sx={{ 
        bgcolor: color || '#f0f0f0',
        width: 36,
        height: 36
      }}
    >
      <PharmacyIcon />
    </Avatar>
  );
};

const MedicineList = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Group medicines by type - simplified to just "All Medicines" since Category field isn't in the database
  const groupedMedicines = {
    "All Medicines": medicines
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        console.log("Fetching medicines for patient:", patientId);
        const data = await medicineService.getPatientMedicines(patientId);
        console.log("Medicines fetched:", data);
        setMedicines(data.medicines || []);
      } else {
        setMedicines([]);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  const handleRetry = () => {
    setRetrying(true);
    fetchMedicines();
  };

  const handleDeleteClick = (medicine) => {
    setMedicineToDelete(medicine);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await medicineService.deleteMedicine(medicineToDelete.Medicine_ID);
      setMedicines(medicines.filter(med => med.Medicine_ID !== medicineToDelete.Medicine_ID));
      setDeleteDialogOpen(false);
      setMedicineToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete medicine');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMedicineToDelete(null);
  };

  const handleSetReminder = (medicineId) => {
    // Navigate to the reminder form for this medicine
    navigate(`/reminders/medicine/${medicineId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} sx={{ color: '#009688' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />} 
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? 'Retrying...' : 'Retry'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header with gradient background */}
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
              component={Link} 
              to="/dashboard" 
              sx={{ color: 'white', mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Medicine Cabinet
            </Typography>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {medicines.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 4,
            boxShadow: 'none',
            border: '1px dashed #009688',
            mx: 2,
            bgcolor: '#f8f9fa'
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3
            }}
          >
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#e3f2fd', 
                mb: 2 
              }}
            >
              <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#009688' }} />
            </Avatar>
            <Typography variant="h6" color="#009688" gutterBottom fontWeight="medium">
              No medicines found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add your first medicine to get started
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicines/add')}
              sx={{ mt: 2, borderRadius: 50, px: 4, fontWeight: 600 }}
            >
              Add Medicine
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          {/* Medicine Categories */}
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            {Object.keys(groupedMedicines).map((category) => (
              <Box key={category} sx={{ mb: 4 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pl: 1
                  }}
                >
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {category}
                  </Typography>
                </Box>
                
                <Card 
                  elevation={4} 
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {groupedMedicines[category].map((medicine, index) => (
                      <React.Fragment key={medicine.Medicine_ID}>
                        {index > 0 && <Divider />}
                        <ListItem
                          sx={{ 
                            px: 3, 
                            py: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#f5f5f5'
                            },
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                          }}
                        >
                          <Box 
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              mb: { xs: 2, sm: 0 }
                            }}
                          >
                            <PillAvatar 
                              color="#e3f2fd" 
                              form="Tablet" 
                            />
                            <Box sx={{ ml: 2, flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {medicine.Medicine_Name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {medicine.Generic_Name || medicine.Medicine_Name} | {medicine.Dosage}
                              </Typography>
                            </Box>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                              <Chip 
                                icon={<MedicationIcon />} 
                                label={`${medicine.Quantity || 0} left`}
                                color={medicine.Quantity > 5 ? "primary" : "warning"}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            </Box>
                          </Box>
                          
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                            }}
                          >
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                              <Chip 
                                icon={<MedicationIcon />} 
                                label={`${medicine.Quantity || 0} left`}
                                color={medicine.Quantity > 5 ? "primary" : "warning"}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            </Box>
                            
                            <Box sx={{ ml: 'auto', display: 'flex' }}>
                              <Tooltip title="Set Reminder">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleSetReminder(medicine.Medicine_ID)}
                                  sx={{ mr: 1 }}
                                >
                                  <NotificationsIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Medicine">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component={Link}
                                  to={`/medicines/edit/${medicine.Medicine_ID}`}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Medicine">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(medicine)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              </Box>
            ))}
          </Box>
        </>
      )}
      
      {/* Floating Add Button */}
      <Fab 
        color="primary"
        aria-label="add medicine"
        sx={{ 
          position: 'fixed', 
          bottom: 72,
          right: 16,
          boxShadow: 3
        }}
        onClick={() => navigate('/medicines/add')}
      >
        <AddIcon />
      </Fab>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          Delete Medicine
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {medicineToDelete?.Medicine_Name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicineList; 