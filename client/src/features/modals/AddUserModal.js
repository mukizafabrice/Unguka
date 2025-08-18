import React, { useState } from "react";

const AddUserModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    names: "",
    email: "", // Added email field
    phoneNumber: "",
    nationalId: "",
  });

  // Handles changes to any input field and updates the component's state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the collected form data to the parent component via onSubmit prop
    onSubmit(formData);
    // Reset the form fields after submission
    setFormData({ names: "", email: "", phoneNumber: "", nationalId: "" });
  };

  // If 'show' prop is false, the modal should not be rendered
  if (!show) return null;

  return (
    <>
      {/* Modal overlay: This creates the dimmed background behind the modal */}
      <div
        className="modal fade show d-block" // 'show' and 'd-block' make the modal visible
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        {/* Modal dialog: Contains the actual modal content */}
        <div
          className="modal-dialog modal-lg modal-dialog-centered" // Centered and large size
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title" id="addUserModalLabel">
                  Add New Member
                </h5>
                {/* Close button for the modal */}
                <button
                  type="button"
                  className="btn-close" // Bootstrap close button styling
                  onClick={onClose} // Calls the onClose prop when clicked
                  aria-label="Close"
                />
              </div>

              {/* Modal Body: Contains the form input fields */}
              <div className="modal-body row px-3">
                {/* Full Names Input */}
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
                    required // Makes this field mandatory
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
                    required // Makes this field mandatory
                  />
                </div>

                {/* Phone Number Input */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel" // Use type="tel" for phone numbers
                    name="phoneNumber"
                    id="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+250781234567" // Example format
                    required // Makes this field mandatory
                  />
                </div>

                {/* National ID Input */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="nationalId" className="form-label">
                    National ID
                  </label>
                  <input
                    type="number" // Use type="number" for national ID (assuming numeric)
                    name="nationalId"
                    id="nationalId"
                    className="form-control"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required // Makes this field mandatory
                  />
                </div>
              </div>

              {/* Modal Footer: Contains action buttons */}
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose} // Calls the onClose prop when clicked
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal backdrop: This makes the background clickable to close the modal */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default AddUserModal;
