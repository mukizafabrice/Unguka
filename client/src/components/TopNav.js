import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";
import { getCooperativeById } from "../../src/services/cooperativeService";
import { useAuth } from "../contexts/AuthContext";

// Import the base URL from your config file or environment variable
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // If using .env
const API_BASE_URL = "http://localhost:8000"; // Or hardcode for simplicity during testing

function TopNav({ onMenuClick }) {
  const [cooperativeName, setCooperativeName] = useState("");
  const { user1 } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));

  // Get the profile picture path from the most reliable source (user1 context or localStorage)
  const profilePicPath = user1?.profilePicture || user?.profilePicture;

  // Construct the full, valid URL for the image
  const fullProfilePicUrl = profilePicPath
    ? `${API_BASE_URL}${profilePicPath}`
    : "/default-avatar.png";

  const cooperativeId = user1?.cooperativeId || user?.cooperativeId;
  console.log("Cooperative ID:", cooperativeId);
  console.log("This is the full profile picture URL:", fullProfilePicUrl);

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
            // Use the full URL here
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
