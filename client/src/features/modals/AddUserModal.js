import React, { useState } from "react";
import { createUser } from "../../services/userService";

const AddUserModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    names: "",
    phoneNumber: "",
    nationalId: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form before sending to backend
  const validateForm = () => {
    if (!formData.names.trim()) {
      setErrorMsg("Full names are required.");
      return false;
    }
    if (!/^\+2507\d{8}$/.test(formData.phoneNumber)) {
      setErrorMsg("Phone number must be in format +2507XXXXXXXX.");
      return false;
    }
    if (!/^\d{16}$/.test(formData.nationalId)) {
      setErrorMsg("National ID must be exactly 16 digits.");
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      const res = await createUser(formData);
      setSuccessMsg("User added successfully!");
      setFormData({ names: "", phoneNumber: "", nationalId: "" });

      if (onSubmit) onSubmit(res); // callback to parent
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null);

      setErrorMsg(backendMessage || "Failed to add user. Try again.");
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addUserModalLabel">
                  Add New User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row px-3">
                {successMsg && (
                  <div className="alert alert-success">{successMsg}</div>
                )}
                {errorMsg && (
                  <div className="alert alert-danger">{errorMsg}</div>
                )}

                {/* Full Names */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="names" className="form-label">
                    Full Names
                  </label>
                  <input
                    type="text"
                    name="names"
                    id="names"
                    className="form-control"
                    value={formData.names}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+250781234567"
                    required
                  />
                </div>

                {/* National ID */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="nationalId" className="form-label">
                    National ID
                  </label>
                  <input
                    type="number"
                    name="nationalId"
                    id="nationalId"
                    className="form-control"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default AddUserModal;
