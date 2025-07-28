import React from "react";
import { PlusCircle } from "lucide-react"; // or any other icon

function AddButton({ onClick, label = "Add", className = "" }) {
  return (
    <button
      className={`btn btn-success d-flex align-items-center ${className}`}
      onClick={onClick}
    >
      <PlusCircle size={20} className="me-1" />
      {label}
    </button>
  );
}

export default AddButton;
