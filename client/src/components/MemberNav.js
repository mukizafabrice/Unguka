import React from "react";
import { NavLink } from "react-router-dom";
import Logout from "./Logout";

import { Home, PiggyBank, ScrollText, Bell, User } from "lucide-react";

import "../assets/styles/dashboard.css";

function SideNav({ isHide }) {
  return (
    <div className={`sidebar ${isHide ? "hide" : ""}`}>
      <div className="sidebar-header">Unguka CO</div>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/member/dashboard"
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
            to="/member/dashboard/contributions"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <ScrollText size={18} className="me-2" /> Contributions
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/member/dashboard/loans"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <PiggyBank size={18} className="me-2" /> Loans
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/member/dashboard/messages"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Bell size={18} className="me-2" /> Messages
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/member/dashboard/profile"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <User size={18} className="me-2" /> Profile
          </NavLink>
        </li>

        <div className="mt-auto">
          <Logout />
        </div>
      </ul>
    </div>
  );
}

export default SideNav;
