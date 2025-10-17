import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AdminPanelSettings,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import Shell from "../../components/dashboard/Shell";
import Stat from "../../components/dashboard/Stat";
import ChartCard from "../../components/dashboard/ChartCard";

// Services
import { fetchUsers } from "../../services/userService";
import { getCooperatives } from "../../services/cooperativeService";
import { getProductions } from "../../services/productionService";

const formatNumber = (n) => new Intl.NumberFormat().format(n);

const translations = {
  en: {
    title: "Coopra Super Dashboard",
    subtitle: "Monitor cooperatives, users, and production across the platform",
    users: "Users",
    coops: "Coops",
    active: "Active"
  },
  fr: {
    title: "Tableau de Bord Super Coopra",
    subtitle: "Surveiller les coopératives, utilisateurs et production sur la plateforme",
    users: "Utilisateurs",
    coops: "Coops",
    active: "Actif"
  },
  rw: {
    title: "Coopra Super Dashboard",
    subtitle: "Kureba koperative, abakoresha n'ibyo bakora ku rubuga",
    users: "Abakoresha",
    coops: "Koperative",
    active: "Zikora"
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#fff", boxShadow: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#0b2a3b" }}>
          {label}
        </Typography>
        {payload.map((entry, idx) => (
          <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 9999, bgcolor: entry.color }} />
            <Typography variant="caption" sx={{ color: "#475569" }}>
              {entry.name}: {formatNumber(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });
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
    productionSeasonStats: [],
  });

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const generateMonthlyCumulative = (items, dateKey, dataKey) => {
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = monthNames[month.getMonth()];
      const count = items.filter((item) => {
        const itemDate = new Date(item[dateKey]);
        return itemDate.getMonth() === month.getMonth() && itemDate.getFullYear() === month.getFullYear();
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
        const allProductions = productionsResponse.success ? productionsResponse.data : [];

        const managers = allUsers.filter((u) => u.role === "manager");
        const superadmins = allUsers.filter((u) => u.role === "superadmin");

        const userGrowthData = generateMonthlyCumulative(allUsers, "createdAt", "users");
        const coopGrowthData = generateMonthlyCumulative(allCooperatives, "createdAt", "cooperatives");

        const seasonMap = {};
        allProductions.forEach((p) => {
          const seasonName = p.seasonId ? `${p.seasonId.name} ${p.seasonId.year}` : "Unknown Season";
          seasonMap[seasonName] = (seasonMap[seasonName] || 0) + p.totalPrice;
        });
        const productionSeasonStats = Object.entries(seasonMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 4)
          .map(([season, value]) => ({ season, value }));

        setStats({
          totalUsers: allUsers.length,
          totalManagers: managers.length,
          totalMembers: allUsers.filter((u) => u.role === "member").length,
          totalSuperadmins: superadmins.length,
          totalCooperatives: allCooperatives.length,
          activeCooperatives: allCooperatives.filter((c) => c.isActive).length,
          inactiveCooperatives: allCooperatives.filter((c) => !c.isActive).length,
          userGrowthData,
          coopGrowthData,
          productionSeasonStats,
        });
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  const texts = translations[currentLanguage] || translations.en;

  const header = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={{ bgcolor: "#34a853", width: 40, height: 40, fontWeight: 800 }}>C</Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {texts.title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {texts.subtitle}
        </Typography>
      </Box>
      <Box sx={{ ml: "auto", display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`${texts.users}: ${formatNumber(stats.totalUsers)}`} size="small" />
        <Chip label={`${texts.coops}: ${formatNumber(stats.totalCooperatives)}`} size="small" />
        <Chip label={`${texts.active}: ${formatNumber(stats.activeCooperatives)}`} size="small" />
      </Box>
    </Box>
  );

  return (
    <Shell header={header}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
        justifyContent: "flex-start",
        transition: "background-color 0.3s ease"
      }}>
        <Stat title="Users" value={formatNumber(stats.totalUsers)} icon={<PeopleIcon />} color="#1976d2" />
        <Stat title="Cooperatives" value={formatNumber(stats.totalCooperatives)} icon={<BusinessIcon />} color="#34a853" />
        <Stat title="Managers" value={formatNumber(stats.totalManagers)} icon={<GroupsIcon />} color="#ff9800" />
        <Stat title="Super Admins" value={formatNumber(stats.totalSuperadmins)} icon={<AdminPanelSettings />} color="#673ab7" />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 1, mb: 3, justifyContent: "center", alignItems: "center" }}>
        <ChartCard title="Users (last 6 months)" height={250}>
          <AreaChart data={stats.userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1976d2" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1976d2" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} interval={0} />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="users" stroke="#1976d2" strokeWidth={2} fill="url(#areaUsers)" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Cooperatives (last 6 months)" height={250}>
          <BarChart data={stats.coopGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barCoopsMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34a853" />
                <stop offset="100%" stopColor="#1e7e34" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} interval={0} />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cooperatives" fill="url(#barCoopsMin)" barSize={34} radius={[8,8,0,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Production by Season" height={250}>
          <BarChart data={stats.productionSeasonStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barProductionMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb74d" />
                <stop offset="100%" stopColor="#fb8c00" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="season" stroke="#94a3b8" tickLine={false} axisLine={false} interval={0} angle={-20} height={40} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="url(#barProductionMin)" barSize={30} radius={[8,8,0,0]} />
          </BarChart>
        </ChartCard>
      </Box>
    </Shell>
  );
};

export default Dashboard;
