import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Logout from "./Logout";

import {
  Home,
  ShoppingCart,
  PiggyBank,
  CreditCard,
  ScrollText,
  Wallet,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import "../assets/styles/dashboard.css";

function SideNav({ isHide }) {
  const [openMenus, setOpenMenus] = useState({
    financials: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className={`sidebar ${isHide ? "hide" : ""}`}>
      <div className="sidebar-header">Unguka CO</div>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/accountant/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Home size={18} className="me-2" /> Dashboard
          </NavLink>
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
                  to="/accountant/dashboard/sales"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <ShoppingCart size={16} className="me-2" /> Sales
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/accountant/dashboard/fees"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Wallet size={16} className="me-2" /> Fees
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/accountant/dashboard/loan"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <PiggyBank size={16} className="me-2" /> Loans
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/accountant/dashboard/payment"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <CreditCard size={16} className="me-2" /> Payments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/accountant/dashboard/purchase-inputs"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <ScrollText size={16} className="me-2" /> Purchases
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <div className="mt-auto">
          <Logout />
        </div>
      </ul>
    </div>
  );
}

export default SideNav;
