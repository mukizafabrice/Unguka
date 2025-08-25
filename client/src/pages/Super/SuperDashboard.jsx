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

  // Helper function to generate growth data dynamically
  const generateGrowthData = (dataArray, dataKey, totalCount) => {
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
    const growthMap = new Map(); // Stores cumulative count for each month

    // Initialize map for the last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
      growthMap.set(yearMonth, {
        name: monthNames[date.getMonth()],
        [dataKey]: 0,
      });
    }

    // Sort data by creation date
    const sortedData = [...dataArray].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Populate growth data cumulatively
    let cumulativeCount = 0;
    sortedData.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemYearMonth = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

      // Find the corresponding month in the growth map, or a later one if the item is too old
      let foundKey = null;
      for (const [key, value] of growthMap.entries()) {
        const [year, month] = key.split("-").map(Number);
        if (
          itemDate.getFullYear() > year ||
          (itemDate.getFullYear() === year && itemDate.getMonth() >= month)
        ) {
          foundKey = key;
        } else {
          break; // Optimization: if current item is older than this month, it's older than subsequent months too
        }
      }

      if (foundKey) {
        // Increment count for the month the item was created in
        growthMap.get(foundKey)[dataKey]++;
      }
    });

    // Convert map values to array and ensure cumulative sum
    const chartData = Array.from(growthMap.values());
    let currentCumulative = 0;

    // Filter to last 6 months and calculate cumulative sum
    const filteredChartData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
      const dataPoint = chartData.find((d) => {
        const [dataYear, dataMonth] = d.name.split("-"); // Assuming 'name' is in 'MMM-YY' or similar
        // Simple comparison for now, needs more robust date parsing if 'name' is complex
        return d.name === monthNames[date.getMonth()]; // Matches 'name' property as month abbreviation
      });

      if (dataPoint) {
        currentCumulative += dataPoint[dataKey];
      }
      filteredChartData.push({
        name: monthNames[date.getMonth()],
        [dataKey]: currentCumulative,
      });
    }

    return filteredChartData;
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

      // Filter only active cooperatives
      const activeCooperatives = allCooperatives.filter(
        (coop) => coop.isActive === true
      );

      // Generate dynamic growth data
      const userGrowthData = generateGrowthData(
        allUsers,
        "users",
        allUsers.length
      );
      const coopGrowthData = generateGrowthData(
        allCooperatives,
        "cooperatives",
        allCooperatives.length
      );

      setStats({
        totalUsers: allUsers.length,
        totalCooperatives: allCooperatives.length, // all cooperatives
        activeCooperatives: activeCooperatives.length, // only active ones
        userGrowthData,
        coopGrowthData,
      });
    } catch (err) {
      setError("An unexpected error occurred while fetching dashboard data.");
      console.error("Dashboard data fetch error:", err);
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
        {/* <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium " style={{ color: "black" }}>
            Dashboard
          </h4>
          <div className="row flex-nowrap overflow-auto  pb-2 gx-1">
            <div className="col-lg-3 col-md-4 col-sm-6 w-50 p-3">
              <StatCard
                title="Total Cooperatives"
                value={stats.totalCooperatives}
                color="orange"
                icon={Group}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 w-50 p-3">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                color="red"
                icon={Users}
              />
            </div>
          </div>
        </div> */}
        <div className=" border-bottom border-secondary-subtle">
          <div className="dashboard-content-area">
            <h4 className="fw-semibold mb-4 text-dark">Dashboard</h4>
            <div className="row flex-nowrap overflow-auto pb-2 gx-3">
              <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
                <StatCard
                  title="Total Cooperatives"
                  value={stats.totalCooperatives}
                  color="orange"
                  icon={Group}
                />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  color="red"
                  icon={Users}
                />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
                <StatCard
                  title="Active Cooperatives"
                  value={stats.activeCooperatives}
                  color="#E11D48"
                  icon={Layers}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Charts */}
        <Grid
          container
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Paper
              sx={{
                p: 3,
                height: 360,
                width: {
                  xs: 500,
                  sm: "70%", // Tablets
                  md: "80%", // Laptops
                  lg: "100%", // Large desktops
                },
                width: 500,
                maxWidth: "100%",
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

          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Paper
              sx={{
                p: 3,
                height: 360,
                width: {
                  xs: 500, // Phones
                  sm: "70%", // Tablets
                  md: "800%", // Laptops
                  lg: "100%", // Large desktops
                },
                width: 500,
                maxWidth: "100%",
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
