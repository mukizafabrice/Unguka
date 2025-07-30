import React, { useState, useEffect } from "react";

const UpdateSeasonModal = ({ show, onClose, onSubmit, season }) => {
  const [formData, setFormData] = useState({
    _id: "", // To store the season ID for the update request
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
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Effect to populate form data with the current 'season' prop when modal opens
  useEffect(() => {
    if (show && season) {
      setFormData({
        _id: season._id || "",
        name: season.name || "",
        // Format dates to YYYY-MM-DD for input type="date"
        startDate: season.startDate ? new Date(season.startDate).toISOString().split('T')[0] : "",
        endDate: season.endDate ? new Date(season.endDate).toISOString().split('T')[0] : "",
      });
    }
  }, [show, season]); // Re-run when modal visibility or selected 'season' changes

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
    onSubmit(formData._id, formData); // Pass ID and updated data to parent
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
        aria-labelledby="updateSeasonModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-dark" id="updateSeasonModalLabel">
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