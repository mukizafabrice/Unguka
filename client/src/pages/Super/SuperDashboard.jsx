// src/pages/Super/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  ErrorOutline,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchUsers } from "../../services/userService";
import { getCooperatives } from "../../services/cooperativeService";

const localCustomTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3B82F6" },
    secondary: { main: "#6366F1" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  shape: { borderRadius: 16 },
});

const Dashboard = () => {
  const theme = localCustomTheme;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCooperatives: 0,
    userGrowthData: [],
    coopGrowthData: [],
  });

  const mockUserGrowthData = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 600 },
    { name: "Mar", users: 800 },
    { name: "Apr", users: 1000 },
    { name: "May", users: 1200 },
    { name: "Jun", users: 1500 },
  ];

  const mockCoopGrowthData = [
    { name: "Jan", cooperatives: 10 },
    { name: "Feb", cooperatives: 12 },
    { name: "Mar", cooperatives: 15 },
    { name: "Apr", cooperatives: 18 },
    { name: "May", cooperatives: 20 },
    { name: "Jun", cooperatives: 25 },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResponse = await fetchUsers();
      let allUsers = usersResponse.success ? usersResponse.data : [];

      const cooperativesResponse = await getCooperatives();
      let allCooperatives = cooperativesResponse.success
        ? cooperativesResponse.data
        : [];

      setStats({
        totalUsers: allUsers.length,
        totalCooperatives: allCooperatives.length,
        userGrowthData: mockUserGrowthData,
        coopGrowthData: mockCoopGrowthData,
      });
    } catch (err) {
      setError("An unexpected error occurred while fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <CircularProgress
          size={50}
          sx={{ color: theme.palette.primary.main }}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          icon={<ErrorOutline fontSize="inherit" />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2" color="text.secondary">
            Some data might be incomplete.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ p: { xs: 2, sm: 4 }, bgcolor: theme.palette.background.default }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: { xs: 3, sm: 5 },
            color: theme.palette.text.primary,
          }}
        >
          Superadmin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          {[
            {
              title: "Total Users",
              value: stats.totalUsers,
              icon: (
                <PeopleIcon
                  sx={{ fontSize: 50, color: theme.palette.primary.main }}
                />
              ),
              borderColor: theme.palette.primary.main,
            },
            {
              title: "Total Cooperatives",
              value: stats.totalCooperatives,
              icon: (
                <BusinessIcon
                  sx={{ fontSize: 50, color: theme.palette.secondary.main }}
                />
              ),
              borderColor: theme.palette.secondary.main,
            },
          ].map((card, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Paper
                sx={{
                  p: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  borderLeft: `6px solid ${card.borderColor}`,
                  boxShadow: "0px 8px 24px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
                  },
                }}
              >
                {card.icon}
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {card.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: 400,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Growth
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: 400,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cooperative Growth
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.coopGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cooperatives"
                    fill={theme.palette.secondary.main}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
