import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";
import { getCooperativeById } from "../../src/services/cooperativeService";
import { useAuth } from "../contexts/AuthContext";
function TopNav({ onMenuClick }) {
  const [cooperativeName, setCooperativeName] = useState("");

  // Use a variable to hold user data for cleaner access
  const user = JSON.parse(localStorage.getItem("user"));
  const profilePic = user?.profilePicture;
  // const cooperativeId = user?.cooperativeId;
  const { user1 } = useAuth();
  const cooperativeId = user1?.cooperativeId;

  // Use useEffect to fetch data when the component mounts or cooperativeId changes
  useEffect(() => {
    const loadCooperative = async () => {
      if (!cooperativeId) {
        // Exit early if no ID is available
        return;
      }

      try {
        // Use `await` to wait for the API call to complete
        const responseData = await getCooperativeById(cooperativeId);

        // Check for a valid response and access the correct property (e.g., `name`)
        if (responseData && responseData.name) {
          setCooperativeName(responseData.name);
        } else {
          console.error("Cooperative data not found or invalid.");
          setCooperativeName("Cooperative"); // Fallback name
        }
      } catch (error) {
        console.error("Failed to fetch cooperative:", error);
        setCooperativeName("Cooperative"); // Fallback on error
      }
    };

    loadCooperative();
  }, [cooperativeId]); // Add cooperativeId to the dependency array

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <Menu
          size={28}
          className="topnav-icon menu-icon-left"
          onClick={onMenuClick}
        />
        <span className="topnav-brand-name ms-3">{cooperativeName}</span>
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
