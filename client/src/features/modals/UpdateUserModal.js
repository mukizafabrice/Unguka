import React, { useState, useEffect } from "react";
// No need to import toast here, as the parent component handles it.
// import { toast } from "react-toastify"; // Removed

// updateUser is correctly imported for the onSubmit logic
import { updateUser } from "../../services/userService";

const UpdateUserModal = ({ show, onClose, onSubmit, userData }) => {
  // Initialize formData with all necessary fields, including 'email'
  // Removed local errorMsg and successMsg states as parent handles toasts
  const [formData, setFormData] = useState({
    names: "",
    email: "", // Added email field
    phoneNumber: "",
    nationalId: "",
  });

  // Populate form data when modal shows or userData changes
  useEffect(() => {
    if (show && userData) {
      setFormData({
        names: userData.names || "",
        email: userData.email || "", // Populate email
        phoneNumber: userData.phoneNumber || "",
        nationalId: userData.nationalId || "",
      });
      // Removed local message resets
    }
  }, [show, userData]);

  // Handles changes to any input field and updates the component's state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Removed local message clearing

    // Call the onSubmit prop from the parent component.
    // The parent (User.js) will handle the API call using updateUser
    // and display toasts based on the service response.
    // It's crucial that onSubmit itself is an async function or handles the promise.
    if (onSubmit) {
      onSubmit(userData._id, formData); // Pass ID and updated form data to parent
      onClose(); // Close the modal immediately after submitting
    }
  };

  // If 'show' prop is false, the modal should not be rendered
  if (!show) return null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updateUserModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title" id="updateUserModalLabel">
                  Update User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              {/* Modal Body: Removed local alerts, parent handles toasts */}
              <div className="modal-body row px-3">
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

                {/* Email Input - NEWLY ADDED */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email" // Use type="email" for email validation
                    name="email"
                    id="email"
                    className="form-control"
                    value={formData.email}
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
                    type="number" // Assuming nationalId is numeric
                    name="nationalId"
                    id="nationalId"
                    className="form-control"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Update User
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

export default UpdateUserModal;
