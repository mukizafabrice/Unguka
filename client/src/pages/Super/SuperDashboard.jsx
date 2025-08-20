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
import StatCard from "../../components/StatCard";
import { Users, Layers, Group, Info } from "lucide-react";
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
        <div className=" mb-4 border-bottom border-secondary-subtle">
          <div className="dashboard-content-area">
            <h4 className="fs-4 fw-medium mb-3" style={{ color: "black" }}>
              Dashboard
            </h4>
            <div className="row flex-nowrap overflow-auto pb-2 gx-3">
              <div className="col-lg-3 col-md-4 col-sm-6 mb-3 p-3">
                <StatCard
                  title="Total Cooperatives"
                  value={stats.totalCooperatives}
                  color="orange"
                  icon={Group}
                />
              </div>
              <div className="col-lg-3 col-md-4 col-sm-6 mb-3 p-3">
                <StatCard
                  title="Total Members"
                  value={stats.totalUsers}
                  color="red"
                  icon={Users}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <Grid
          container
          spacing={3}
          sx={{ mt: 4, maxHeight: 400, overflow: "auto" }}
        >
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: 400,
                width: 500,
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
                width: 500,
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
