import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";
import { getCooperativeById } from "../../src/services/cooperativeService";
import { useAuth } from "../contexts/AuthContext";
function TopNav({ onMenuClick }) {
  const [cooperativeName, setCooperativeName] = useState("");
  const { user1 } = useAuth();

  // Use a variable to hold user data for cleaner access
  const user = JSON.parse(localStorage.getItem("user"));
  const profilePic = user?.profilePicture;
  // const cooperativeId = user?.cooperativeId;

  const cooperativeId = user1?.cooperativeId || user?.cooperativeId;
  console.log("Cooperative ID:", cooperativeId);
  // Use useEffect to fetch data when the component mounts or cooperativeId changes
  // Add cooperativeId to the dependency array
  useEffect(() => {
    const loadCooperative = async () => {
      if (!cooperativeId) return;

      try {
        const response = await getCooperativeById(cooperativeId);

        if (response.success && response.data?.name) {
          setCooperativeName(response.data.name);
        } else {
          console.error(
            "Cooperative data not found or invalid:",
            response.message
          );
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
        <NotificationBell />

        <Link to="/profile" className="user-avatar-container ms-4">
          <img
            src={profilePic || "/default-avatar.png"}
            alt="User Avatar"
            className="user-avatar"
          />
        </Link>
      </div>
    </nav>
  );
}

export default TopNav;
