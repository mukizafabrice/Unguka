import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import "../assets/styles/NotificationBell.css";
import { useAuth } from "../contexts/AuthContext";

function NotificationBell() {
  const [announcements, setAnnouncements] = useState([]);
  const { user } = useAuth();

  // Get both the cooperativeId and user role from the user object
  const cooperativeId = user?.cooperativeId;
  const userRole = user?.role; // Access the user's role

  useEffect(() => {
    // Only fetch announcements if the user is a 'member' and has a cooperativeId
    if (userRole !== "member" || !cooperativeId) {
      setAnnouncements([]);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const res = await axiosInstance.get(
          `/announcements?cooperativeId=${cooperativeId}`
        );
        const storedRead =
          JSON.parse(localStorage.getItem("readAnnouncements")) || [];

        const updated = res.data.map((a) => ({
          ...a,
          isRead: storedRead.includes(a._id),
        }));

        setAnnouncements(updated);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();

    return () => setAnnouncements([]);
  }, [cooperativeId, userRole]); // Add userRole to the dependency array

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const handleMarkRead = () => {
    const readIds = announcements.map((a) => a._id);
    localStorage.setItem("readAnnouncements", JSON.stringify(readIds));
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  // Conditionally render the entire bell component based on the user's role
  if (userRole !== "member") {
    return null;
  }

  return (
    <div className="notification-wrapper">
      <div className="icon-container" onClick={handleMarkRead}>
        <Bell className="notification-bell" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
    </div>
  );
} 

export default NotificationBell;
