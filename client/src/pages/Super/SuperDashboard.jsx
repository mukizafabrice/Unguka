// src/pages/Super/SuperDashboard.js (or src/pages/SuperAdminDashboard.js)
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Corrected path
import { fetchUsers } from "../../services/userService"; // <--- Ensure this is correct
import { getCooperatives } from "../../services/cooperativeService"; // <--- CHANGED TO NAMED IMPORT
import {
  Users,
  Building,
  BarChart2,
  MessageSquare,
  Briefcase,
} from "lucide-react"; // Added MessageSquare and Briefcase for example

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dashboard } from "@mui/icons-material";

// Dummy data for the chart - replace with actual API calls
const mockChartData = [
  { name: "Jan", Users: 4000, Cooperatives: 2400 },
  { name: "Feb", Users: 3000, Cooperatives: 1398 },
  { name: "Mar", Users: 2000, Cooperatives: 9800 },
  { name: "Apr", Users: 2780, Cooperatives: 3908 },
  { name: "May", Users: 1890, Cooperatives: 4800 },
  { name: "Jun", Users: 2390, Cooperatives: 3800 },
  { name: "Jul", Users: 3490, Cooperatives: 4300 },
];

// Reusable Card Component for Dashboard Statistics - MODIFIED TO MATCH IMAGE DESIGN
const DashboardCard = ({ title, value, icon: Icon, iconBgColor, trend }) => (
  <div className="flex bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
    {/* Left section for icon */}
    <div
      className={`flex-shrink-0 ${iconBgColor} p-4 flex items-center justify-center`}
    >
      {Icon && <Icon size={36} className="text-white" />}
    </div>
    {/* Right section for content */}
    <div className="flex-grow p-4 text-gray-800 flex flex-col justify-between">
      <div className="text-xl font-bold">{value}</div>
      <p className="text-md font-semibold text-gray-600 mb-1">{title}</p>
      {trend && (
        <p
          className="text-sm font-medium"
          style={{ color: trend.startsWith("-") ? "#dc3545" : "#28a745" }}
        >
          {trend} since last month
        </p>
      )}
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCooperatives, setTotalCooperatives] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const usersResponse = await fetchUsers();
        if (usersResponse) {
          setTotalUsers(usersResponse.length);
        } else {
          setError("Failed to fetch users data.");
        }

        const cooperativesResponse = await getCooperatives(); // <--- NOW CALLING DIRECTLY
        if (cooperativesResponse.success) {
          setTotalCooperatives(cooperativesResponse.data.length);
        } else {
          setError(cooperativesResponse.message);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please check network and server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-700">Loading dashboard...</div>
    );
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
        Hello, {user?.names || "Superadmin"}! 👋
      </h1>

      {/* Statistics Cards - UPDATED WITH NEW PROPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <DashboardCard
          title="Total Cooperatives"
          value={totalCooperatives}
          icon={Building}
          iconBgColor="bg-gray-800" // Example: Dark background for icon
          trend="+1.50%" // Example trend
        />
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          iconBgColor="bg-orange-500" // Example: Orange background for icon
          trend="-0.25%" // Example trend
        />
        {/* Added two new example cards for visual demonstration */}
        <DashboardCard
          title="Messages"
          value={220} // Example value
          icon={MessageSquare}
          iconBgColor="bg-purple-600" // Example: Purple background for icon
          trend="+3.46%" // Example trend
        />
        <DashboardCard
          title="Current Jobs"
          value={160} // Example value
          icon={Briefcase}
          iconBgColor="bg-blue-600" // Example: Blue background for icon
          trend="-1.20%" // Example trend
        />
      </div>

      {/* Dashboard Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart2 size={24} className="mr-2 text-purple-600" />
          System Overview & Trends
        </h2>
        <div className="h-96">
          {" "}
          {/* Fixed height for the chart container */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockChartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Users" fill="#8884d8" name="Total Users" />
              <Bar
                dataKey="Cooperatives"
                fill="#82ca9d"
                name="Total Cooperatives"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
