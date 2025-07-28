import React, { useState, useEffect } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import "../assets/styles/dashboard.css";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // start open by default on large

  // Detect screen size on mount and on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        // Large devices: always open
        setIsSidebarOpen(true);
      } else {
        // Small/medium devices: always closed initially
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    // Only toggle on small/medium screens
    if (window.innerWidth < 992) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="app-layout">
      <TopNav onMenuClick={toggleSidebar} />

      <div className="dashboard-body-wrapper d-flex w-100">
        {/* Pass isHide based on sidebar state */}
        <SideNav isHide={!isSidebarOpen} />

        <div
          className={`main-content-wrapper flex-grow-1 ${
            !isSidebarOpen ? "full-width" : ""
          }`}
        >
          <main className="main-content-area-dashboard overfollow-">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
