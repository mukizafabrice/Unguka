import React, { useState, useEffect } from "react";

const AddSeasonModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // Effect to manage body class for scroll prevention
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    // Cleanup function for when component unmounts or show changes
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Effect to reset form data when the modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass form data to parent's onSubmit handler
  };

  return (
    <>
      {/* Modal Backdrop: Render first for correct z-index stacking */}
      <div className="modal-backdrop fade show"></div>

      {/* Main Modal Content */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSeasonModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-dark" id="addSeasonModalLabel">
                  Add New Season
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {/* Season Name */}
                <div className="col-md-12 mb-3">
                  <label htmlFor="name" className="form-label text-dark">
                    Season Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Start Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="startDate" className="form-label text-dark">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* End Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="endDate" className="form-label text-dark">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    className="form-control"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Add Season
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
    </>
  );
};

export default AddSeasonModal;