import React, { useState } from 'react';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction, 
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText 
} from '@mui/material';
import { 
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Medication as MedicationIcon,
  MoreHoriz as MoreIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  // Don't show bottom nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }
  
  // Get current path for active navigation
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 0;
    if (path.includes('/reminders')) return 1;
    if (path.includes('/reports')) return 2;
    if (path.includes('/medicines')) return 3;
    if (path === '/profile') return 4;
    return 0; // Default to dashboard
  };

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleLogout = () => {
    handleMoreClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMoreClose();
    navigate('/profile');
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={getCurrentValue()}
          onChange={(event, newValue) => {
            switch(newValue) {
              case 0:
                navigate('/dashboard');
                break;
              case 1:
                navigate('/reminders');
                break;
              case 2:
                navigate('/reports');
                break;
              case 3:
                navigate('/medicines');
                break;
              case 4:
                handleMoreClick(event); // Open menu when More is clicked
                break;
              default:
                navigate('/dashboard');
            }
          }}
          sx={{ 
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              color: theme.palette.text.secondary
            },
            '& .Mui-selected': {
              color: theme.palette.primary.main
            }
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<HomeIcon />} 
          />
          <BottomNavigationAction 
            label="Reminders" 
            icon={<NotificationsIcon />} 
          />
          <BottomNavigationAction 
            label="Reports" 
            icon={<AssessmentIcon />} 
          />
          <BottomNavigationAction 
            label="Medicines" 
            icon={<MedicationIcon />} 
          />
          <BottomNavigationAction 
            label="More" 
            icon={<MoreIcon />} 
            onClick={handleMoreClick}
          />
        </BottomNavigation>

        {/* More Menu */}
        <Menu
          anchorEl={moreAnchorEl}
          open={Boolean(moreAnchorEl)}
          onClose={handleMoreClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default BottomNav; 