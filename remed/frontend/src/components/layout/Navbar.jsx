import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Medication as MedicationIcon,
  Notifications as NotificationsIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  AccountCircle,
  Logout,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      text: 'Medicines',
      icon: <MedicationIcon />,
      path: '/medicines',
      badge: null
    },
    {
      text: 'Reminders',
      icon: <NotificationsIcon />,
      path: '/reminders',
      badge: 3 // This would be dynamic in a real app
    },
    {
      text: 'Inventory',
      icon: <InventoryIcon />,
      path: '/inventory',
      badge: null
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      badge: null
    }
  ];

  // Drawer content
  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Avatar sx={{ mb: 1, width: 64, height: 64, bgcolor: 'secondary.main' }}>
          {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Typography variant="h6">{user ? user.name : 'User'}</Typography>
        <Typography variant="body2">{user ? user.userType : ''}</Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            selected={isActive(item.path)}
            sx={{
              borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : 'none',
              bgcolor: isActive(item.path) ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.12)'
              }
            }}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem 
          button 
          component={Link} 
          to="/profile" 
          onClick={handleDrawerToggle}
          selected={isActive('/profile')}
          sx={{
            borderLeft: isActive('/profile') ? `4px solid ${theme.palette.primary.main}` : 'none',
            bgcolor: isActive('/profile') ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
          }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {user && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={Link}
            to={user ? '/dashboard' : '/'}
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            ReMed
          </Typography>
          
          {user ? (
            <>
              {!isMobile && (
                <Box sx={{ display: 'flex' }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{ 
                        mx: 1,
                        position: 'relative',
                        '&::after': isActive(item.path) ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 10,
                          left: '25%',
                          right: '25%',
                          height: '2px',
                          backgroundColor: 'white'
                        } : {}
                      }}
                      startIcon={
                        item.badge ? (
                          <Badge badgeContent={item.badge} color="error">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )
                      }
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}
              <Tooltip title="Account">
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 2 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{ 
                  borderRadius: 2,
                  mr: 1,
                  backgroundColor: isActive('/login') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                variant="outlined" 
                component={Link} 
                to="/register"
                sx={{ 
                  borderRadius: 2,
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true // Better performance on mobile
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 