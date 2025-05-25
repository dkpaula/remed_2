import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              ReMed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your medicine reminder and inventory management system
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Home
              </Link>
              <Link href="/login" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Login
              </Link>
              <Link href="/register" color="inherit" sx={{ display: 'block' }}>
                Register
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@remed.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +63 123 456 7890
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}{' '}
            <Link color="inherit" href="/">
              ReMed
            </Link>
            {' - All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 