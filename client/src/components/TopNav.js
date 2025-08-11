import React from "react";
import { Menu, Bell } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";

function TopNav({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const profilePic = user?.profilePicture;

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <span className="topnav-brand-name ms-3">Unguka</span>
        <Menu
          size={28}
          className="topnav-icon menu-icon-left"
          onClick={onMenuClick}
        />
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
