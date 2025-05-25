import React, { Component } from 'react';
import { Box, Container, useMediaQuery, useTheme, Typography, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { useLocation, useNavigate } from 'react-router-dom';

// Error boundary to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Layout Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body1" paragraph>
            {this.state.error?.toString()}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // Reset the error state
              this.setState({ hasError: false, error: null, errorInfo: null });
              // Try to reload page
              window.location.href = '/dashboard';
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      );
    }

    return this.props.children; 
  }
}

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Only show navbar on non-auth pages or on desktop */}
      {(!isAuthPage || !isMobile) && <Navbar />}
      
      <Container 
        component="main" 
        sx={{ 
          mt: isAuthPage ? 0 : { xs: 1, sm: 4 }, 
          mb: isAuthPage ? 0 : { xs: 1, sm: 4 }, 
          flex: 1,
          px: { xs: isAuthPage ? 0 : 1, sm: 2 },
          maxWidth: { xs: '100%', lg: 'lg' },
          position: 'relative'
        }}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Container>
      
      {/* Bottom navigation for mobile */}
      <BottomNav />
      
      {/* Only show footer on desktop */}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default Layout; 