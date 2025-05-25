import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import reportService from '../../api/reportService';

const ReportList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchSummary();
  }, [user]);

  const fetchReports = async (type = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        const data = await reportService.getPatientReports(patientId, type || null);
        setReports(data.reports || []);
      } else {
        setReports([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      
      const patientId = user.userType === 'Patient' ? user.id : user.selectedPatientId;
      
      if (patientId) {
        const data = await reportService.getPatientReportSummary(patientId);
        setSummary(data.summary || null);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to fetch report summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleReportTypeChange = (event) => {
    const type = event.target.value;
    setReportType(type);
    fetchReports(type);
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'Medication Log':
        return 'primary';
      case 'Inventory Update':
        return 'info';
      case 'Health Update':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Reports & History
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={reportType}
            label="Filter by Type"
            onChange={handleReportTypeChange}
          >
            <MenuItem value="">All Reports</MenuItem>
            <MenuItem value="Medication Log">Medication Logs</MenuItem>
            <MenuItem value="Inventory Update">Inventory Updates</MenuItem>
            <MenuItem value="Health Update">Health Updates</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Box display="flex" alignItems="center">
              <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Total Reports</Typography>
                {summaryLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Typography variant="h4">{summary?.totalReports || 0}</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'success.contrastText' }}>
            <Box display="flex" alignItems="center">
              <EventIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">This Month</Typography>
                {summaryLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Typography variant="h4">{summary?.monthlyReports || 0}</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
            <Box display="flex" alignItems="center">
              <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Compliance Rate</Typography>
                {summaryLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Typography variant="h4">{summary?.complianceRate || '0%'}</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No reports found.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {reports.map((report) => (
              <React.Fragment key={report.Report_ID}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">
                          <Chip
                            label={report.Report_Type}
                            color={getReportTypeColor(report.Report_Type)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {report.Creator_Name || 'System'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(report.Date_Created)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.primary"
                        >
                          {report.Notes}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReportList; 