import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import "../assets/styles/NotificationBell.css";

function NotificationBell() {
  const [announcements, setAnnouncements] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axiosInstance.get("/announcements");
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
  }, []);

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const handleOpenDropdown = () => {
    setShowDropdown(!showDropdown);

    const readIds = announcements.map((a) => a._id);
    localStorage.setItem("readAnnouncements", JSON.stringify(readIds));

    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  return (
    <div className="notification-wrapper">
      <div className="icon-container" onClick={handleOpenDropdown}>
        <Bell className="notification-bell" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
    </div>
  );
}

export default NotificationBell;
