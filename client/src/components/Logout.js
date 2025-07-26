// src/components/Common/Logout.js
import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="sidebar-link w-100 text-start text-danger bg-transparent border-0 d-flex align-items-center px-3 py-2 "
    >
      <LogOut size={18} className="me-2" />
      Logout
    </button>
  );
};

export default Logout;
