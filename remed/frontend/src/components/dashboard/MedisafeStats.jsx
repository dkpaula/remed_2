import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  CalendarMonth as CalendarIcon,
  EmojiEvents as TrophyIcon,
  ShowChart as ChartIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import intakeService from '../../api/intakeService';

const MedisafeStats = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [adherence, setAdherence] = useState({ overall: { adherencePercentage: 0 } });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
        
        if (patientId) {
          // Get streak data
          const streakData = await intakeService.getStreak(patientId);
          setStreak(streakData);
          
          // Get adherence statistics
          // Default to last 30 days
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const startDate = thirtyDaysAgo.toISOString().split('T')[0];
          const endDate = today.toISOString().split('T')[0];
          
          const adherenceData = await intakeService.getAdherenceStats(
            patientId, 
            startDate,
            endDate
          );
          
          setAdherence(adherenceData);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);
  
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Medication Statistics
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Medication Statistics
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // Handle no data yet
  if (!streak || !adherence?.overall) {
    return (
      <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Medication Statistics
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            Start tracking your medications to see statistics
          </Typography>
          <Chip
            icon={<StarIcon />}
            label="Take your medications on time to build a streak!"
            color="primary"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>
      </Paper>
    );
  }
  
  // Calculate adherence level and color
  const adherencePercentage = adherence.overall.adherencePercentage || 0;
  let adherenceColor = theme.palette.error.main; // Red for poor (< 50%)
  let adherenceLevel = 'Poor';
  
  if (adherencePercentage >= 90) {
    adherenceColor = theme.palette.success.main; // Green for excellent
    adherenceLevel = 'Excellent';
  } else if (adherencePercentage >= 70) {
    adherenceColor = theme.palette.success.light; // Light green for good
    adherenceLevel = 'Good';
  } else if (adherencePercentage >= 50) {
    adherenceColor = theme.palette.warning.main; // Orange for fair
    adherenceLevel = 'Fair';
  }
  
  return (
    <Paper sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Medication Statistics
        </Typography>
        <Tooltip title="Statistics from the last 30 days">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Stack spacing={3}>
        {/* Adherence Stats */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ChartIcon sx={{ mr: 1, color: 'primary.main' }} />
            Medication Adherence
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={adherencePercentage} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: adherenceColor,
                  }
                }} 
              />
            </Box>
            <Typography variant="h6" color={adherenceColor}>
              {adherencePercentage}%
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            Your adherence is {adherenceLevel}
          </Typography>
        </Box>
        
        {/* Current Streak */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FireIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
            Current Streak
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2,
            backgroundColor: theme.palette.background.default,
            borderRadius: 2
          }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {streak.currentStreak}
            </Typography>
            <Typography variant="body1" sx={{ ml: 1, color: 'text.secondary' }}>
              {streak.currentStreak === 1 ? 'Day' : 'Days'}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
            {streak.currentStreak === 0 
              ? "Take all your medications today to start a streak!" 
              : "Keep it up! Don't break your streak."}
          </Typography>
        </Box>
        
        {/* Best Record */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ mr: 1, color: theme.palette.warning.light }} />
            Your Record
          </Typography>
          
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Longest Streak</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {streak.longestStreak} {streak.longestStreak === 1 ? 'Day' : 'Days'}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Total Taken</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {adherence.overall.totalTaken || 0}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MedisafeStats; 