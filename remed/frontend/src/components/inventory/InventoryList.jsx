import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slider,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import vaultService from '../../api/vaultService';
import reportService from '../../api/reportService';

const InventoryList = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    item: null,
    newQuantity: 0,
    updating: false
  });

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        const data = await vaultService.getPatientVault(patientId);
        setInventory(data.vaultItems || []);
      } else {
        setInventory([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (item) => {
    setUpdateDialog({
      open: true,
      item,
      newQuantity: item.Medicine_Pieces,
      updating: false
    });
  };

  const handleDialogClose = () => {
    setUpdateDialog({
      ...updateDialog,
      open: false,
      updating: false
    });
  };

  const handleQuantityChange = (event, newValue) => {
    setUpdateDialog({
      ...updateDialog,
      newQuantity: newValue
    });
  };

  const handleUpdateInventory = async () => {
    try {
      setUpdateDialog({
        ...updateDialog,
        updating: true
      });
      
      await vaultService.updateVaultQuantity(
        updateDialog.item.Vault_ID,
        updateDialog.newQuantity
      );
      
      // Log inventory update in reports
      const reportData = {
        reportType: 'Inventory Update',
        patientId: user.userType === 'Patient' ? user.id : user.selectedPatientId,
        notes: `Updated ${updateDialog.item.Medicine_Name} quantity to ${updateDialog.newQuantity} pieces`
      };
      
      await reportService.createReport(reportData);
      
      // Update local state
      setInventory(inventory.map(item => 
        item.Vault_ID === updateDialog.item.Vault_ID
          ? { ...item, Medicine_Pieces: updateDialog.newQuantity }
          : item
      ));
      
      handleDialogClose();
    } catch (err) {
      setError(err.message || 'Failed to update inventory');
    }
  };

  // Calculate stock level for visual indicators
  const getStockLevel = (quantity) => {
    if (quantity <= 3) return 'critical';
    if (quantity <= 7) return 'low';
    return 'normal';
  };

  const getStockColor = (level) => {
    switch (level) {
      case 'critical': return 'error';
      case 'low': return 'warning';
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Medication Inventory
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchInventory}
        >
          Refresh
        </Button>
      </Box>

      {inventory.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No medication inventory found. Add medicines to see your inventory.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {inventory.map((item) => {
            const stockLevel = getStockLevel(item.Medicine_Pieces);
            const stockColor = getStockColor(stockLevel);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={item.Vault_ID}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.Medicine_Name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Dosage: {item.Dosage}
                    </Typography>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          Quantity:
                        </Typography>
                        <Chip 
                          label={`${item.Medicine_Pieces} pieces`} 
                          color={stockColor} 
                          size="small" 
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((item.Medicine_Pieces / 30) * 100, 100)} 
                        color={stockColor}
                        sx={{ mt: 1, height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    
                    {stockLevel === 'critical' && (
                      <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                        Critical low stock!
                      </Alert>
                    )}
                    {stockLevel === 'low' && (
                      <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                        Running low, refill soon.
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdateClick(item)}
                      fullWidth
                    >
                      Update Quantity
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Update Quantity Dialog */}
      <Dialog
        open={updateDialog.open}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Update {updateDialog.item?.Medicine_Name} Quantity
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Adjust the quantity to reflect your current inventory:
          </DialogContentText>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Current quantity: {updateDialog.item?.Medicine_Pieces} pieces
            </Typography>
            <Box display="flex" alignItems="center">
              <IconButton 
                onClick={() => setUpdateDialog({
                  ...updateDialog,
                  newQuantity: Math.max(0, updateDialog.newQuantity - 1)
                })}
              >
                <RemoveIcon />
              </IconButton>
              <Slider
                value={updateDialog.newQuantity}
                onChange={handleQuantityChange}
                aria-labelledby="quantity-slider"
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                sx={{ mx: 2 }}
              />
              <IconButton 
                onClick={() => setUpdateDialog({
                  ...updateDialog,
                  newQuantity: updateDialog.newQuantity + 1
                })}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <TextField
              margin="dense"
              label="New Quantity"
              type="number"
              fullWidth
              value={updateDialog.newQuantity}
              onChange={(e) => setUpdateDialog({
                ...updateDialog,
                newQuantity: parseInt(e.target.value) || 0
              })}
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={updateDialog.updating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateInventory} 
            color="primary" 
            disabled={updateDialog.updating || updateDialog.newQuantity === updateDialog.item?.Medicine_Pieces}
          >
            {updateDialog.updating ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryList; 