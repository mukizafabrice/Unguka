import React, { useState } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import "../assets/styles/dashboard.css"; // optional custom styles

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-layout">
      <TopNav onMenuClick={toggleSidebar} />

      <div className="container-fluid">
        <div className="row flex-nowrap">
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
          <div className="col p-3 main-content transition">
            <main className="main-content-area-dashboard overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
