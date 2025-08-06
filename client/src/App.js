// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// ... (other admin/manager/member imports) ...
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import "react-toastify/dist/ReactToastify.css";
//Admin imports
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Season from "./pages/Admin/Season";
import Sales from "./pages/Admin/Sales";
import Stock from "./pages/Admin/Stock";
import Plot from "./pages/Admin/Plot";
import Product from "./pages/Admin/Product";
import Production from "./pages/Admin/Production";
import Loan from "./pages/Admin/Loan";
import Payment from "./pages/Admin/Payment";
import Fees from "./pages/Admin/Fees";
import FeeTypes from "./pages/Admin/FeeType";
import PurchaseInput from "./pages/Admin/PurchaseInputs";
import PurchaseOut from "./pages/Admin/PurchaseOut";
import Announcement from "./pages/Admin/Announcement";
import User from "./pages/Admin/User";
import MemberDashboard from "./pages/Member/MemberDashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import LoanTransaction from "./pages/Admin/LoanTransaction";
import "./assets/styles/dashboard.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* TEMPORARY TEST: Render Profile DIRECTLY under ProtectedRoute, WITHOUT DashboardLayout */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={["manager", "accountant", "member"]}
              >
                <Profile />
              
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Route wrapped in DashboardLayout */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <DashboardLayout />
                {/* <ToastContainer /> */}
              </ProtectedRoute>
            }
          >
            {/* Nested children routes here */}
            <Route index element={<AdminDashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="season" element={<Season />} />
            <Route path="stock" element={<Stock />} />
            <Route path="plot" element={<Plot />} />
            <Route path="product" element={<Product />} />
            <Route path="production" element={<Production />} />
            <Route path="loan" element={<Loan />} />
            <Route path="payment" element={<Payment />} />
            <Route path="fees" element={<Fees />} />
            <Route path="feeTypes" element={<FeeTypes />} />
            <Route path="purchase-inputs" element={<PurchaseInput />} />
            <Route path="purchase-outputs" element={<PurchaseOut />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="loan-transaction" element={<LoanTransaction />} />
            <Route path="user" element={<User />} />
          </Route>
          
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
