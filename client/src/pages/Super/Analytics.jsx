// src/pages/Super/Analytics.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';

// Named imports for userService and cooperativeService functions
import { fetchUsers } from '../../services/userService';
import { getCooperatives } from '../../services/cooperativeService';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalMembers: 0,
    totalSuperadmins: 0,
    assignedManagers: 0,
    unassignedManagers: 0,
    totalCooperatives: 0,
    activeCooperatives: 0,
    inactiveCooperatives: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users
      const usersResponse = await fetchUsers();
      let allUsers = [];
      if (usersResponse.success && Array.isArray(usersResponse.data)) {
        allUsers = usersResponse.data;
      } else {
        console.error("Failed to fetch users data or data is not an array:", usersResponse.message);
        setError(usersResponse.message || "Failed to fetch users data.");
        // Continue even with user fetch error to display cooperative data if available
      }

      // Fetch cooperatives
      const cooperativesResponse = await getCooperatives();
      let allCooperatives = [];
      if (cooperativesResponse.success && Array.isArray(cooperativesResponse.data)) {
        allCooperatives = cooperativesResponse.data;
      } else {
        console.error("Failed to fetch cooperatives data or data is not an array:", cooperativesResponse.message);
        setError(prev => prev ? `${prev} | ${cooperativesResponse.message || "Failed to fetch cooperative data."}` : (cooperativesResponse.message || "Failed to fetch cooperative data."));
      }

      // Process data to calculate statistics
      const totalUsers = allUsers.length;
      const managers = allUsers.filter(user => user.role === 'manager');
      const members = allUsers.filter(user => user.role === 'member');
      const superadmins = allUsers.filter(user => user.role === 'superadmin');

      const assignedManagers = managers.filter(manager => manager.cooperativeId);
      const unassignedManagers = managers.filter(manager => !manager.cooperativeId);

      const activeCooperatives = allCooperatives.filter(coop => coop.isActive === true);
      const inactiveCooperatives = allCooperatives.filter(coop => coop.isActive === false);

      setStats({
        totalUsers,
        totalManagers: managers.length,
        totalMembers: members.length,
        totalSuperadmins: superadmins.length,
        assignedManagers: assignedManagers.length,
        unassignedManagers: unassignedManagers.length,
        totalCooperatives: allCooperatives.length,
        activeCooperatives: activeCooperatives.length,
        inactiveCooperatives: inactiveCooperatives.length,
      });

    } catch (err) {
      console.error("Analytics data fetch error:", err);
      setError("An unexpected error occurred while fetching analytics data. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading analytics data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<ErrorOutline fontSize="inherit" />}>
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2" color="textSecondary">Data might be incomplete due to fetch errors.</Typography>
        </Alert>
        {/* Still render the dashboard even with errors, but with N/A or 0 for affected data */}
        {/* This allows partial display even if one API fails */}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f0f2f5', minHeight: '100vh', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: { xs: 3, sm: 5 } }}>
        Overall System Analytics
      </Typography>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff', borderLeft: '5px solid #1976d2' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{stats.totalUsers}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Total Users</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Managers */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff', borderLeft: '5px solid #4caf50' }}>
            <GroupsIcon sx={{ fontSize: 40, color: '#4caf50' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{stats.totalManagers}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Total Managers</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Members */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff', borderLeft: '5px solid #ff9800' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#ff9800' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{stats.totalMembers}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Total Members</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Cooperatives */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff', borderLeft: '5px solid #9c27b0' }}>
            <BusinessIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{stats.totalCooperatives}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Total Cooperatives</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* --- More Detailed Breakdown --- */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mt: 4, mb: 2 }}>
            Managers Overview
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: '#ffffff', borderLeft: '5px solid #2196f3' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Assignment Status</Typography>
            <Typography variant="body1">
              Assigned Managers: <Typography component="span" fontWeight="bold">{stats.assignedManagers}</Typography>
            </Typography>
            <Typography variant="body1">
              Unassigned Managers: <Typography component="span" fontWeight="bold">{stats.unassignedManagers}</Typography>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: '#ffffff', borderLeft: '5px solid #4caf50' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Cooperative Activity</Typography>
            <Typography variant="body1">
              Active Cooperatives: <Typography component="span" fontWeight="bold">{stats.activeCooperatives}</Typography>
            </Typography>
            <Typography variant="body1">
              Inactive Cooperatives: <Typography component="span" fontWeight="bold">{stats.inactiveCooperatives}</Typography>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;