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

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };
  const { user } = useAuth();
  return (
    <div className={`sidebar ${isHide ? "hide" : ""}`}>
      <div className="sidebar-header">
        <h6 className="fw-bold" style={{ color: "#4caf50" }}>
          {user?.names || "System Admin"}
        </h6>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Home size={18} className="me-2" /> Dashboard
          </NavLink>
        </li>

        {/* Inventory Section */}
        <li className="sidebar-parent" onClick={() => toggleMenu("inventory")}>
          <div className="sidebar-link cursor-pointer">
            <Package size={18} className="me-2" /> Inventory
            {openMenus.inventory ? (
              <ChevronDown size={16} className="ms-auto" />
            ) : (
              <ChevronRight size={16} className="ms-auto" />
            )}
          </div>
          {openMenus.inventory && (
            <ul className="sidebar-submenu">
              <li>
                <NavLink
                  to="/admin/dashboard/product"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Package size={16} className="me-2" /> Products
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/stock"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Layers size={16} className="me-2" /> Stocks
                </NavLink>
              </li>
            </ul>
          )}
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
                  to="/admin/dashboard/production"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Factory size={16} className="me-2" /> Production
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/plot"
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
                  to="/admin/dashboard/sales"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <ShoppingCart size={16} className="me-2" /> Sales
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/fees"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Wallet size={16} className="me-2" /> Fees
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/feeTypes"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <DollarSign size={16} className="me-2" /> FeeTypes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/loan"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PiggyBank size={16} className="me-2" /> Loans
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/payment"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <CreditCard size={16} className="me-2" /> Payments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/purchase-inputs"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PackagePlus size={16} className="me-2" /> PurchaseIn
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/purchase-outputs"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PackageMinus size={16} className="me-2" /> PurchaseOut
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Admin Section */}
        <li className="sidebar-parent" onClick={() => toggleMenu("admin")}>
          <div className="sidebar-link cursor-pointer">
            <Users size={18} className="me-2" /> Administration
            {openMenus.admin ? (
              <ChevronDown size={16} className="ms-auto" />
            ) : (
              <ChevronRight size={16} className="ms-auto" />
            )}
          </div>
          {openMenus.admin && (
            <ul className="sidebar-submenu">
              <li>
                <NavLink
                  to="/admin/dashboard/user"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Users size={16} className="me-2" /> Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/dashboard/season"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Calendar size={16} className="me-2" /> Seasons
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li>
          <NavLink
            to="/admin/dashboard/reports"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <BarChart3 size={18} className="me-2" /> Reports
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/dashboard/announcement"
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
