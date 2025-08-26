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
  Groups as GroupsIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircleOutline,
  ErrorOutline,
  AdminPanelSettings,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Services
import { fetchUsers } from "../../services/userService";
import { getCooperatives } from "../../services/cooperativeService";
import { getProductions } from "../../services/productionService";

// Reusable StatCard
const StatCard = ({ title, value, icon, color }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "#fff",
        transition: "0.3s",
        "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: color,
          color: "white",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  </Grid>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalMembers: 0,
    totalSuperadmins: 0,
    totalCooperatives: 0,
    activeCooperatives: 0,
    inactiveCooperatives: 0,
    userGrowthData: [],
    coopGrowthData: [],
    productionStats: [],
  });

  // Helper: generate monthly data for last 6 months
  const generateMonthlyCumulative = (items, dateKey, dataKey) => {
    const now = new Date();
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
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = monthNames[month.getMonth()];

      const count = items.filter((item) => {
        const itemDate = new Date(item[dateKey]);
        return (
          itemDate.getMonth() === month.getMonth() &&
          itemDate.getFullYear() === month.getFullYear()
        );
      }).length;

      result.push({ name: monthStr, [dataKey]: count });
    }

    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const usersResponse = await fetchUsers();
        const allUsers = usersResponse.success ? usersResponse.data : [];

        const coopsResponse = await getCooperatives();
        const allCooperatives = coopsResponse.success ? coopsResponse.data : [];

        const productionsResponse = await getProductions();
        const allProductions = productionsResponse.success
          ? productionsResponse.data
          : [];
        console.log("these my production", allProductions);
        const managers = allUsers.filter((u) => u.role === "manager");
        const members = allUsers.filter((u) => u.role === "member");
        const superadmins = allUsers.filter((u) => u.role === "superadmin");
        const activeCoops = allCooperatives.filter((c) => c.isActive);

        const userGrowthData = generateMonthlyCumulative(
          allUsers,
          "createdAt",
          "users"
        );
        const coopGrowthData = generateMonthlyCumulative(
          allCooperatives,
          "createdAt",
          "cooperatives"
        );

        const productionMap = {};
        allProductions.forEach((p) => {
          const name = p.productId?.productName || "Unknown";
          productionMap[name] = (productionMap[name] || 0) + p.totalPrice;
        });
        const productionStats = Object.entries(productionMap).map(
          ([name, value]) => ({ name, value })
        );

        setStats({
          totalUsers: allUsers.length,
          totalManagers: managers.length,
          totalMembers: members.length,
          totalSuperadmins: superadmins.length,
          totalCooperatives: allCooperatives.length,
          activeCooperatives: activeCoops.length,
          inactiveCooperatives: allCooperatives.length - activeCoops.length,
          userGrowthData,
          coopGrowthData,
          productionStats,
        });
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <div style={{ maxHeight: "80vh" }}>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f9fafc", minHeight: "100vh" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Super Admin Analytics
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
          <StatCard
            title="Total Managers"
            value={stats.totalManagers}
            icon={<GroupsIcon />}
            color="#4caf50"
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<PeopleIcon />}
            color="#ff9800"
          />
          <StatCard
            title="Total Cooperatives"
            value={stats.totalCooperatives}
            icon={<BusinessIcon />}
            color="#9c27b0"
          />
          <StatCard
            title="Active Cooperatives"
            value={stats.activeCooperatives}
            icon={<CheckCircleOutline />}
            color="#4caf50"
          />
          <StatCard
            title="Inactive Cooperatives"
            value={stats.inactiveCooperatives}
            icon={<ErrorOutline />}
            color="#f44336"
          />
          <StatCard
            title="Super Admins"
            value={stats.totalSuperadmins}
            icon={<AdminPanelSettings />}
            color="#673ab7"
          />
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* User Growth Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: "16px", height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Growth (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#1976d2"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Cooperative Growth Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: "16px", height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cooperative Growth (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.coopGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cooperatives" fill="#4caf50" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Production Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: "16px", height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Production Statistics
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.productionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Analytics;
