import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';

// Layout Component
import Layout from './components/layout/Layout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard Component
import Dashboard from './components/dashboard/Dashboard';

// Medicine Components
import MedicineList from './components/medicines/MedicineList';
import AddMedicine from './components/medicines/AddMedicine';
import EditMedicine from './components/medicines/EditMedicine';

// Reminder Component
import ReminderList from './components/reminders/ReminderList';
import ReminderForm from './components/reminders/ReminderForm';

// Inventory Component
import InventoryList from './components/inventory/InventoryList';

// Report Component
import ReportList from './components/reports/ReportList';

// Profile Component
import Profile from './components/profile/Profile';

// Patient Management Component
import LinkPatientScreen from './components/patients/LinkPatientScreen';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#009688',       // Teal
      light: '#4DB6AC',
      dark: '#00796B',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF7043',       // Coral
      light: '#FFAB91',
      dark: '#E64A19',
      contrastText: '#fff',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Increased for more rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 50, // Pill-shaped buttons like Medisafe
          padding: '8px 20px',
        },
        containedPrimary: {
          boxShadow: '0 4px 8px 0 rgba(0, 150, 136, 0.2)',
        },
        containedSecondary: {
          boxShadow: '0 4px 8px 0 rgba(255, 112, 67, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 10px 0 rgba(0,0,0,0.14)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Medicine Routes */}
                <Route path="/medicines" element={<MedicineList />} />
                <Route path="/medicines/add" element={<AddMedicine />} />
                <Route path="/medicines/edit/:medicineId" element={<EditMedicine />} />
                
                {/* Reminder Routes */}
                <Route path="/reminders" element={<ReminderList />} />
                <Route path="/reminders/medicine/:medicineId" element={<ReminderForm />} />
                
                {/* Inventory Routes */}
                <Route path="/inventory" element={<InventoryList />} />
                
                {/* Report Routes */}
                <Route path="/reports" element={<ReportList />} />
                
                {/* Profile Routes */}
                <Route path="/profile" element={<Profile />} />
                
                {/* Patient Management Routes */}
                <Route path="/link-patient" element={<LinkPatientScreen />} />
              </Route>
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 