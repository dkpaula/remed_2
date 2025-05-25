import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles.css'; // You'll need to create this file for global styles

// Create a custom theme to fix Material UI issues
const theme = createTheme({
  components: {
    MuiDatePicker: {
      defaultProps: {
        inputFormat: 'MM/dd/yyyy',
      },
    },
  },
});

// Initialize Capacitor if available
if (window.Capacitor) {
  console.log("Capacitor detected - running as mobile app");
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  </React.StrictMode>
); 