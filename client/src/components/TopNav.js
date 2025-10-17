import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Languages } from "lucide-react";
import "../assets/styles/dashboard.css";
import NotificationBell from "../features/NotificationBell";
import { Link } from "react-router-dom";
import { getCooperativeById } from "../../src/services/cooperativeService";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "http://192.168.43.129:8000";

function TopNav({ onMenuClick, isSidebarOpen }) {
  const [cooperativeName, setCooperativeName] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "en";
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
    document.documentElement.setAttribute("lang", currentLanguage);
    // Force re-render of components that depend on language
    window.dispatchEvent(
      new CustomEvent("languageChange", { detail: currentLanguage })
    );
  }, [currentLanguage]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  ];

  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  return (
    <nav className="topnav">
      <div className="topnav-left">
        {isSidebarOpen ? (
          <X
            size={28}
            className="topnav-icon menu-icon-left"
            onClick={onMenuClick}
          />
        ) : (
          <Menu
            size={28}
            className="topnav-icon menu-icon-left"
            onClick={onMenuClick}
          />
        )}
        <span className="topnav-brand-name ms-3">
          {currentLanguage === "fr"
            ? cooperativeName || "Cooperatives"
            : currentLanguage === "rw"
            ? cooperativeName || "Koperative"
            : cooperativeName || "Coopra"}
        </span>
      </div>

      <div className="topnav-right">
        <div className="dropdown me-3">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="btn btn-link p-0"
            style={{
              border: "none",
              background: "none",
              color: isDarkMode ? "#60a5fa" : "#64748b",
              fontSize: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = isDarkMode
                ? "rgba(96, 165, 250, 0.1)"
                : "rgba(100, 116, 139, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <Languages size={20} />
          </button>
          {showLanguageMenu && (
            <div
              className="dropdown-menu show"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 1000,
                backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#404040" : "#dee2e6"}`,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "160px",
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className="dropdown-item"
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    border: "none",
                    background: "none",
                    color: isDarkMode ? "#ffffff" : "#212529",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <span style={{ marginLeft: "auto" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className="btn btn-link p-0 me-3"
          style={{
            border: "none",
            background: "none",
            color: isDarkMode ? "#fbbf24" : "#64748b",
            fontSize: "20px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = isDarkMode
              ? "rgba(251, 191, 36, 0.1)"
              : "rgba(100, 116, 139, 0.1)")
          }
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

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
