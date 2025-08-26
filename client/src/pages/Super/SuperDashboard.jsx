import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  ErrorOutline,
} from "@mui/icons-material";
import { Users, Layers, Group } from "lucide-react";
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
import StatCard from "../../components/StatCard"; // make sure this works with icon prop

// Theme
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
    activeCooperatives: 0,
    inactiveCooperatives: 0,
    totalManagers: 0,
    totalMembers: 0,
    totalSuperadmins: 0,
    userGrowthData: [],
    coopGrowthData: [],
  });

  // Helper to generate growth data
  const generateGrowthData = (dataArray, dataKey) => {
    const today = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const growthMap = new Map();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
      growthMap.set(yearMonth, {
        name: monthNames[date.getMonth()],
        [dataKey]: 0,
      });
    }

    const sortedData = [...dataArray].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    sortedData.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemYearMonth = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
      if (growthMap.has(itemYearMonth)) {
        growthMap.get(itemYearMonth)[dataKey]++;
      }
    });

    // Convert to cumulative array
    let cumulative = 0;
    return Array.from(growthMap.values()).map((d) => {
      cumulative += d[dataKey];
      return { name: d.name, [dataKey]: cumulative };
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResponse = await fetchUsers();
      const allUsers = usersResponse.success ? usersResponse.data : [];

      const cooperativesResponse = await getCooperatives();
      const allCooperatives = cooperativesResponse.success
        ? cooperativesResponse.data
        : [];

      const activeCooperatives = allCooperatives.filter((c) => c.isActive);
      const inactiveCooperatives = allCooperatives.filter((c) => !c.isActive);

      const managers = allUsers.filter((u) => u.role === "manager");
      const members = allUsers.filter((u) => u.role === "member");
      const superadmins = allUsers.filter((u) => u.role === "superadmin");

      setStats({
        totalUsers: allUsers.length,
        totalCooperatives: allCooperatives.length,
        activeCooperatives: activeCooperatives.length,
        inactiveCooperatives: inactiveCooperatives.length,
        totalManagers: managers.length,
        totalMembers: members.length,
        totalSuperadmins: superadmins.length,
        userGrowthData: generateGrowthData(allUsers, "users"),
        coopGrowthData: generateGrowthData(allCooperatives, "cooperatives"),
      });
    } catch (err) {
      setError("Failed to fetch dashboard data.");
      console.error(err);
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
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const cardConfig = [
    {
      title: "Total Cooperatives",
      value: stats.totalCooperatives,
      icon: Group,
      color: "orange",
    },
    {
      title: "Active Cooperatives",
      value: stats.activeCooperatives,
      icon: Layers,
      color: "#22C55E",
    },
    {
      title: "Inactive Cooperatives",
      value: stats.inactiveCooperatives,
      icon: ErrorOutline,
      color: "#EF4444",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "#3B82F6",
    },
    {
      title: "Total Managers",
      value: stats.totalManagers,
      icon: Layers,
      color: "#F59E0B",
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Layers,
      color: "#6366F1",
    },
    {
      title: "Super Admins",
      value: stats.totalSuperadmins,
      icon: Layers,
      color: "#8B5CF6",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ p: { xs: 2, sm: 4 }, bgcolor: theme.palette.background.default }}
      >
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Dashboard
        </Typography>

        {/* Cards */}
        <div className="row flex-nowrap overflow-auto pb-2 gx-3">
          {cardConfig.map((card, index) => (
            <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={card.icon}
              />
            </div>
          ))}
        </div>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 360 }}>
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 360 }}>
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
