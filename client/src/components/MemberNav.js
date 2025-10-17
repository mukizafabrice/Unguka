import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Logout from "./Logout";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Package,
  Users,
  Factory,
  Sprout,
  ShoppingCart,
  PiggyBank,
  CreditCard,
  ScrollText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Megaphone,
  DollarSign,
  Wallet,
  PackagePlus,
  PackageMinus,
  BarChart3,
} from "lucide-react";

import "../assets/styles/dashboard.css";

function SideNav({ isHide }) {
  const [openMenus, setOpenMenus] = useState({
    inventory: false,
    operations: false,
    financials: false,
    admin: false,
  });
  const { user } = useAuth();
  const names = user?.names;
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className={`sidebar ${isHide ? "hide" : ""}`}>
      <div className="sidebar-header">
        <h6 className="fw-bold" style={{ color: "#4caf50" }}>
          {names}
        </h6>
      </div>
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
            to="/member/dashboard/product"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Package size={16} className="me-2" /> Products
          </NavLink>
        </li>

        {/* Operations Section */}
        <li className="sidebar-parent" onClick={() => toggleMenu("operations")}>
          <div className="sidebar-link cursor-pointer">
            <Factory size={18} className="me-2" /> Operations
            {openMenus.operations ? (
              <ChevronDown size={16} className="ms-auto" />
            ) : (
              <ChevronRight size={16} className="ms-auto" />
            )}
          </div>
          {openMenus.operations && (
            <ul className="sidebar-submenu">
              <li>
                <NavLink
                  to="/member/dashboard/production"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Factory size={16} className="me-2" /> Production
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/member/dashboard/plot"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Sprout size={16} className="me-2" /> Plots
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Financials Section */}
        <li className="sidebar-parent" onClick={() => toggleMenu("financials")}>
          <div className="sidebar-link cursor-pointer">
            <CreditCard size={18} className="me-2" /> Financials
            {openMenus.financials ? (
              <ChevronDown size={16} className="ms-auto" />
            ) : (
              <ChevronRight size={16} className="ms-auto" />
            )}
          </div>
          {openMenus.financials && (
            <ul className="sidebar-submenu">
              <li>
                <NavLink
                  to="/member/dashboard/fees"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Wallet size={16} className="me-2" /> Fees
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/member/dashboard/feeTypes"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <DollarSign size={16} className="me-2" /> FeeTypes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/member/dashboard/loan"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PiggyBank size={16} className="me-2" /> Loans
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/member/dashboard/payment"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <CreditCard size={16} className="me-2" /> Payments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/member/dashboard/purchase-inputs"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PackagePlus size={16} className="me-2" /> PurchaseIn
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Admin Section */}

        <li className="sidebar-parent">
          <NavLink
            to="/member/dashboard/season"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Calendar size={16} className="me-2" /> Seasons
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/member/dashboard/reports"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <BarChart3 size={18} className="me-2" /> Reports
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/member/dashboard/announcement"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Megaphone size={18} className="me-2" /> Announcements
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
