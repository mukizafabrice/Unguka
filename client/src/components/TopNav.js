import React from "react";
import { Menu, Bell } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";

function TopNav({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const profilePic =
    user?.profilePicture || "https://placehold.co/36x36/4CAF50/ffffff?text=U";

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <Menu
          size={28}
          className="topnav-icon menu-icon-left"
          onClick={onMenuClick}
        />
        <span className="topnav-brand-name ms-3">Dashboard</span>
      </div>

      <div className="topnav-right">
        <NotificationBell />

        <Link to="/profile" className="user-avatar-container ms-4">
          <img src={profilePic} alt="User Avatar" className="user-avatar" />
        </Link>
      </div>
    </nav>
  );
}

export default TopNav;
