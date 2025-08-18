import React from "react";
import { NavLink } from "react-router-dom";
import Logout from "./Logout";
import { useAuth } from "../contexts/AuthContext";

import { Home, Users, Building, BarChart, Megaphone, User } from "lucide-react";

import "../assets/styles/dashboard.css";

function SuperNav({ isHide }) {
  const { user } = useAuth();

  return (
    <div className={`sidebar ${isHide ? "hide" : ""}`}>
      {/* Sidebar Header/Logo */}
      <div className="sidebar-header">
        <h5 className="fw-bold">{user?.names || "System Admin"}</h5>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/super/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Home size={18} className="me-2" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/super/dashboard/cooperatives"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Building size={18} className="me-2" /> All Cooperatives
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/super/dashboard/managers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Users size={18} className="me-2" /> All Managers
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/super/dashboard/analytics"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <BarChart size={18} className="me-2" /> Analytics
          </NavLink>
        </li>

        <div className="mt-auto">
          <Logout />
        </div>
      </ul>
    </div>
  );
}

export default SuperNav;
