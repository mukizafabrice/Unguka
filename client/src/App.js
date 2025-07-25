// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Assuming this path is correct
import LoginPage from "./pages/Auth/LoginPage"; // Assuming this path is correct
import AdminDashboard from "./pages/Admin/AdminDashboard"; // Assuming this path is correct
import ManagerDashboard from "./pages/Manager/ManagerDashboard"; // Assuming this path is correct
import MemberDashboard from "./pages/Member/MemberDashboard"; // Assuming this path is correct
import ProtectedRoute from "./components/ProtectedRoute"; // Assuming this path is correct

// Import the new DashboardLayout
import DashboardLayout from "./layouts/DashboardLayout"; // Adjust path if you put it elsewhere


// Import your main dashboard CSS
import "./assets/styles/dashboard.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Admin Dashboard Route wrapped in DashboardLayout */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                {" "}
                {/* Note: Your original code had "manager" here for admin dashboard */}
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager Dashboard Route wrapped in DashboardLayout */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["accountant"]}>
                {" "}
                {/* Your original code had "accountant" here for manager dashboard */}
                <DashboardLayout>
                  <ManagerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Member Dashboard Route wrapped in DashboardLayout */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={["member"]}>
                <DashboardLayout>
                  <MemberDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
