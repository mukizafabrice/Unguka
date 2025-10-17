import React, { useState, useEffect } from "react";
import SuperNav from "../components/SuperNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import "../assets/styles/dashboard.css";
import { useNavigate } from "react-router-dom";
function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token"); // or your auth state
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  const mainColClass = isSidebarOpen ? "col p-0 main-content transition" : "col-12 p-0 main-content transition";

  return (
    <div className="app-layout">
      <TopNav onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="container-fluid p-0 w-100" style={{ maxWidth: "100%" }}>
        <div className="row g-0 w-100" style={{ width: "100%" }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              className="col-auto p-0 bg-light sidebar transition"
              style={{ minHeight: "100vh", width: "250px" }}
            >
              <SuperNav />
            </div>
          )}

          {/* Main content */}
          <div className={mainColClass} style={{ minWidth: 0, width: "100%" }}>
            <main className="main-content-area-dashboard" style={{ padding: "0 8px" }}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
