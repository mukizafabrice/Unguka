import React, { useState, useEffect } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import "../assets/styles/dashboard.css"; // optional custom styles
import { useNavigate } from "react-router-dom";
function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      <TopNav onMenuClick={toggleSidebar} />

      <div className="container-fluid p-0 w-100" style={{ maxWidth: "100%" }}>
        <div className="row g-0 w-100" style={{ width: "100%" }}>
          {/* Sidebar */}
          {isSidebarOpen && (
            <div
              className="col-auto p-0 bg-light sidebar transition"
              style={{ minHeight: "100vh", width: "250px" }}
            >
              <SideNav />
            </div>
          )}

          {/* Main content */}
          <div className={mainColClass} style={{ minWidth: 0, width: "100%" }}>
            <main className="main-content-area-dashboard">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
