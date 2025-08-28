// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";
import { ToastContainer } from "react-toastify"; // ⭐ CRUCIAL: Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; //
import ProtectedRoute from "./components/ProtectedRoute";
import usePreventBack from "./components/usePreventBack";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import PaymentTransaction from "./pages/Admin/PaymentTransaction";
import Fees from "./pages/Admin/Fees";
import FeeTypes from "./pages/Admin/FeeType";
import PurchaseInput from "./pages/Admin/PurchaseInputs";
import PurchaseOut from "./pages/Admin/PurchaseOut";
import Announcement from "./pages/Admin/Announcement";
import LoanTransaction from "./pages/Admin/LoanTransaction";
//member routed
import MemberDashboard from "./pages/Member/MemberDashboard";
import MemberSeason from "./pages/Member/MemberSeason";
import MemberAnnouncement from "./pages/Member/MemberAnnouncement";
import MemberProduct from "./pages/Member/MemberProduct";
import MemberFeeTypes from "./pages/Member/MemberFeeTypes";
import MemberProduction from "./pages/Member/MemberProduction";
import MemberPlot from "./pages/Member/MemberPlot";
import MemberFees from "./pages/Member/MemberFees";
import MemberPurchaseInput from "./pages/Member/MemberPurchaseInputs";
import MemberLoan from "./pages/Member/MemberLoan";
import MemberPayment from "./pages/Member/MemberPayment";
import MemberPaymentTransaction from "./pages/Member/PaymentTransaction";
import MemberLoanTransaction from "./pages/Member/LoanTransaction";
import PaymentSummary from "./pages/Member/PaymentSummary";
import MemberLayout from "./layouts/MemberLayout";
import User from "./pages/Admin/User";
import DashboardLayout from "./layouts/DashboardLayout";
//superadmin

import SuperDashboard from "./pages/Super/SuperDashboard";
import Cooperatives from "./pages/Super/Cooperatives";
import Managers from "./pages/Super/Managers";
import Analytics from "./pages/Super/Analytics";
import Settings from "./pages/Super/Settings";
import SuperLayout from "./layouts/SuperLayout";

import "./assets/styles/dashboard.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PreventBackWrapper />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={["manager", "member", "superadmin"]}
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
            <Route
              path="loan-transaction/:loanId"
              element={<LoanTransaction />}
            />
            <Route
              path="payment-transaction/:paymentId"
              element={<PaymentTransaction />}
            />
            <Route path="user" element={<User />} />
          </Route>

          {/* Member Dashboard Route wrapped in DashboardLayout */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={["member"]}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboard />} />
            <Route path="season" element={<MemberSeason />} />
            <Route path="announcement" element={<MemberAnnouncement />} />
            <Route path="product" element={<MemberProduct />} />
            <Route path="feeTypes" element={<MemberFeeTypes />} />
            <Route path="production" element={<MemberProduction />} />
            <Route path="plot" element={<MemberPlot />} />
            <Route path="fees" element={<MemberFees />} />
            <Route path="purchase-inputs" element={<MemberPurchaseInput />} />
            <Route path="loan" element={<MemberLoan />} />
            <Route path="payment" element={<MemberPayment />} />
            <Route path="payment-summary" element={<PaymentSummary />} />
            <Route
              path="payment-transaction/:paymentId"
              element={<MemberPaymentTransaction />}
            />
            <Route
              path="loan-transaction/:loanId"
              element={<MemberLoanTransaction />}
            />
          </Route>
          <Route
            path="/super/dashboard"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperDashboard />} />
            <Route path="cooperatives" element={<Cooperatives />} />
            <Route path="managers" element={<Managers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
function PreventBackWrapper() {
  usePreventBack();
  return null;
}
export default App;
