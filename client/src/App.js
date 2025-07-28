// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Season from "./pages/Admin/Season";
import Sales from "./pages/Admin/Sales";
import Stock from "./pages/Admin/Stock";
import Plot from "./pages/Admin/Plot";
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import MemberDashboard from "./pages/Member/MemberDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";
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
                <DashboardLayout>
                  {/* <AdminDashboard /> */}
                  {/* <Sales /> */}
                  {/* <Season /> */}
                  {/* <Stock /> */}
                  <Plot />
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
