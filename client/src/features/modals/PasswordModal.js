import React, { useState } from "react";
import { Key } from "lucide-react"; // Icon for visual clarity

// Password Change Modal Component
const PasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setMessageType("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("danger"); // Bootstrap's text-danger
      return;
    }
    if (newPassword.length < 6) {
      // Example validation
      setMessage("New password must be at least 6 characters long.");
      setMessageType("danger"); // Bootstrap's text-danger
      return;
    }

    // --- API Call Placeholder ---
    // In a real application, you would make an API call here to update the password.
    // Example: authService.changePassword(currentPassword, newPassword)
    console.log("Attempting to change password:", {
      currentPassword,
      newPassword,
    });
    setMessage("Password changed successfully!");
    setMessageType("success"); // Bootstrap's text-success
    // Optionally close modal after success, e.g., setTimeout(onClose, 1500);
    // --- End API Call Placeholder ---
  };

  return (
    // Bootstrap Modal Structure
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-3 shadow-lg p-3">
          <div className="modal-header border-bottom-0 pb-2 mb-3 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
              <Key size={24} className="me-2 text-secondary" /> Change Password
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body pt-0">
            {/* Password Change Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="current-password"
                  className="form-label text-muted mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="new-password"
                  className="form-label text-muted mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="confirm-password"
                  className="form-label text-muted mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div
                  className={`alert alert-${
                    messageType === "error" ? "danger" : "success"
                  } py-2`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              <div className="d-flex justify-content-end pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary me-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
