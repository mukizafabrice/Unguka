import React, { useState, useEffect } from "react";

const UpdateSeasonModal = ({ show, onClose, onSubmit, season }) => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    status: "inactive", // Initialize status here
  });

  // Effect to manage body class for scroll prevention
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Effect to populate form fields when the modal opens or selectedSeason changes
  useEffect(() => {
    if (show && season) {
      setFormData({
        _id: season._id || "",
        name: season.name || "",
        year: season.year || "",
        status: season.status || "inactive", // Populate status from season data
      });
    }
  }, [show, season]);

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
    onSubmit(formData._id, formData);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updateSeasonModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5
                  className="modal-title text-dark"
                  id="updateSeasonModalLabel"
                >
                  Update Season
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body row">
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="year" className="form-label text-dark">
                    Year
                  </label>
                  <input
                    type="text"
                    name="year"
                    id="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Added Status Field */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label text-dark">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Save Changes
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

export default UpdateSeasonModal;
