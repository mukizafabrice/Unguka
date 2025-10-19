import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Agriculture as PlotIcon,
  ShoppingCart as ProductIcon,
  TrendingUp as ProductionIcon,
  Assessment as PredictionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchMemberDetails } from "../services/userService";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function UserDetails({ open, onClose, userId, cooperativeId }) {
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && userId) {
      loadMemberDetails();
    }
  }, [open, userId]);

  const loadMemberDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMemberDetails(userId);
      if (response.success) {
        setMemberDetails(response.data);
      } else {
        setError(response.message || "Failed to load member details");
      }
    } catch (err) {
      setError("Failed to load member details");
      console.error("Error loading member details:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalLandArea = () => {
    if (!memberDetails?.plots) return 0;
    return memberDetails.plots.reduce((total, plot) => total + (plot.size || 0), 0);
  };

  const calculateTotalProduction = () => {
    if (!memberDetails?.recentProductions) return 0;
    return memberDetails.recentProductions.reduce((total, prod) => total + (prod.quantity || 0), 0);
  };

  const prepareProductionChartData = () => {
    if (!memberDetails?.recentProductions) return [];
    return memberDetails.recentProductions.map(prod => ({
      product: prod.product?.name || 'Unknown',
      quantity: prod.quantity || 0,
      value: prod.quantity * (prod.unitPrice || 0)
    }));
  };

  const preparePlotChartData = () => {
    if (!memberDetails?.plots) return [];
    return memberDetails.plots.map(plot => ({
      name: `Plot ${plot.upi || plot._id}`,
      size: plot.size || 0
    }));
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6">
            {memberDetails?.user?.names || 'Member Details'}
          </Typography>
        </Box>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Member Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Name"
                      secondary={memberDetails?.user?.names || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={memberDetails?.user?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={memberDetails?.user?.phoneNumber || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="National ID"
                      secondary={memberDetails?.user?.nationalId || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={<Chip label={memberDetails?.user?.role || 'N/A'} size="small" color="primary" />}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cooperative"
                      secondary={memberDetails?.user?.cooperative?.name || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Plots Information */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <PlotIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Land Holdings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h5" color="secondary" gutterBottom>
                  {calculateTotalLandArea()} acres
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Land Area
                </Typography>
                <List dense>
                  {memberDetails?.plots?.map((plot, index) => (
                    <ListItem key={plot.id || index}>
                      <ListItemIcon>
                        <LocationIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Plot ${plot.upi || plot.id}`}
                        secondary={`${plot.size || 0} acres - ${plot.cooperative?.name || 'N/A'}`}
                      />
                    </ListItem>
                  )) || <Typography variant="body2" color="text.secondary">No plots found</Typography>}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Production Information */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <ProductionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Production Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h5" color="secondary" gutterBottom>
                  {calculateTotalProduction()} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Recent Production
                </Typography>
                <Typography variant="h6" color="success.main" gutterBottom>
                  {memberDetails?.expectedProduction?.predictedQuantity || 0} kg
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected Next Production
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {memberDetails?.expectedProduction?.basedOn || 'No data available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Production Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Production by Product
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareProductionChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Plot Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Land Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePlotChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="size"
                      >
                        {preparePlotChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Productions */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <ProductionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Productions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {memberDetails?.recentProductions?.slice(0, 6).map((prod) => (
                    <Grid item xs={12} sm={6} md={4} key={prod.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {prod.product?.name || 'Unknown Product'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {prod.quantity || 0} kg
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Season: {prod.season?.name || 'N/A'} {prod.season?.year || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: <Chip label={prod.paymentStatus || 'N/A'} size="small" color={prod.paymentStatus === 'paid' ? 'success' : 'warning'} />
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total: {prod.totalPrice || 0} RWF
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )) || <Typography variant="body2" color="text.secondary">No recent productions found</Typography>}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default UserDetails;