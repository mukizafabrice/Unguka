import React, { useState } from "react";
import { Key } from "lucide-react";
import { toast } from "react-toastify";
import { changePassword } from "../../services/userService";

const PasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id; // <-- The fix is right here!

    if (!userId) {
      toast.error("User not found in local storage.");
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(
        userId,
        currentPassword,
        newPassword
      );

      toast.success(response.message);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="d-flex justify-content-end pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary me-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
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
