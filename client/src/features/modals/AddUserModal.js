import React, { useState } from "react";

const AddUserModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    names: "",
    phoneNumber: "",
    nationalId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass data to parent
    setFormData({ names: "", phoneNumber: "", nationalId: "" }); // reset form
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
