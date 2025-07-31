import React, { useState, useEffect } from "react";

const AddSeasonModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
  });
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

  // Effect to reset form data when the modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        name: "",
        year: "",
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
    onSubmit(formData);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSeasonModalLabel"
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
                  <select
                    name="name"
                    id="name"
                    className="form-select"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a production</option>

                    <option value="Season-A">Season-A</option>
                    <option value="Season-B">Season-B</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="year" className="form-label text-dark">
                    Year
                  </label>
                  <input
                    type="text"
                    pattern="\d{4}"
                    placeholder="YYYY"
                    name="year"
                    id="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleChange}
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
