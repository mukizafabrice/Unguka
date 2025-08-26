import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";
import { getCooperativeById } from "../../src/services/cooperativeService";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "http://localhost:8000";

function TopNav({ onMenuClick }) {
  const [cooperativeName, setCooperativeName] = useState("");
  const { user1 } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));

  // Determine role
  const role = user1?.role || user?.role || "member"; // default to member

  // Determine the correct announcement route
  const announcementLink =
    role === "manager"
      ? "/admin/dashboard/announcement"
      : "/member/dashboard/announcement";

  // Profile picture
  const profilePicPath = user1?.profilePicture || user?.profilePicture;
  const fullProfilePicUrl = profilePicPath
    ? `${API_BASE_URL}${profilePicPath}`
    : "/default-avatar.png";

  const cooperativeId = user1?.cooperativeId || user?.cooperativeId;

  useEffect(() => {
    const loadCooperative = async () => {
      if (!cooperativeId) return;

      try {
        const response = await getCooperativeById(cooperativeId);
        if (response.success && response.data?.name) {
          setCooperativeName(response.data.name);
        } else {
          setCooperativeName("Cooperative");
        }
      } catch (error) {
        console.error("Failed to fetch cooperative:", error);
        setCooperativeName("Cooperative");
      }
    };

    loadCooperative();
  }, [cooperativeId]);

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <Menu
          size={28}
          className="topnav-icon menu-icon-left"
          onClick={onMenuClick}
        />
        <span className="topnav-brand-name ms-3">
          {cooperativeName || "Cooperatives"}
        </span>
      </div>

      <div className="topnav-right">
        <Link to={announcementLink}>
          <NotificationBell />
        </Link>

        <Link to="/profile" className="user-avatar-container ms-4">
          <img
            src={fullProfilePicUrl}
            alt="User Avatar"
            className="user-avatar"
          />
        </Link>
      </div>
    </nav>
  );
}

export default TopNav;
