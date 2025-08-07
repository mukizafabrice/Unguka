import React, { useState, useEffect } from "react";
import MemberNav from "../components/MemberNav";
import TopNav from "../components/TopNav";
import { Outlet } from "react-router-dom";
import "../assets/styles/dashboard.css"; // optional custom styles

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // initial check

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 992) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="app-layout">
      <TopNav onMenuClick={toggleSidebar} />

      <div className="container-fluid">
        <div className="row flex-nowrap">
          {/* Sidebar */}
          <div
            className={`col-auto p-0 bg-light sidebar transition ${
              isSidebarOpen ? "d-block" : "d-none d-lg-block"
            }`}
            style={{ minHeight: "100vh", width: "250px" }}
          >
            <MemberNav />
          </div>

          {/* Main content */}
          <div className={`col p-3 main-content transition`}>
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
