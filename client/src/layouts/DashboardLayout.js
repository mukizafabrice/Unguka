// src/layouts/DashboardLayout.js
import React, { useState } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import "../assets/styles/dashboard.css";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      <TopNav onMenuClick={toggleSidebar} />

      <div className="dashboard-body-wrapper d-flex w-100">
        <SideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* {isSidebarOpen && (
          <div
            className="sidebar-backdrop d-lg-none"
            onClick={toggleSidebar}
          ></div>
        )} */}

        <div className="main-content-wrapper flex-grow-1">
          <main className="main-content-area-dashboard overfollow-">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
