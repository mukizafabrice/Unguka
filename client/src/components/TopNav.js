// src/components/TopNav.js
import React, { useState } from "react";
import { Menu, Bell, User } from "lucide-react";
import "../assets/styles/dashboard.css";
import SideNav from "./SideNav";

function TopNav() {
  const [isNavHidden, setIsNavHidden] = useState(false);

  const toggleNav = () => {
    setIsNavHidden(!isNavHidden);
  };
  return (
    <nav className="topnav">
      <div className="topnav-left">
        <Menu
          size={28}
          className="topnav-icon menu-icon-left"
          onClick={toggleNav}
        />
        <span className="topnav-brand-name ms-3">Dashboard</span>{" "}
      </div>
      <div className="topnav-right">
        <Bell size={24} className="topnav-icon notification-icon" />

        <div className="user-avatar-container ms-4">
          <img
            src="https://placehold.co/36x36/4CAF50/ffffff?text=U"
            alt="User Avatar"
            className="user-avatar"
          />
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
