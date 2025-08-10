import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function AddFeeTypeModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
    status: "active",
    isPerSeason: true,
    autoApplyOnCreate: true,
  });

  // Effect to manage body class for scroll prevention when modal is open
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    // Cleanup function
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Reset form state when the modal is shown
  useEffect(() => {
    if (show) {
      setFormData({
        name: "",
        amount: "",
        description: "",
        status: "active",
      });
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      toast.error("Name and Amount are required.");
      return;
    }
    if (formData.amount < 0) {
      toast.error("Amount cannot be negative.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal d-block fade show"
        tabIndex="-1"
        role="dialog"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-dark">Add New Fee Type</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label text-dark">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label text-dark">
                    Amount
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label text-dark">
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="status" className="form-label text-dark">
                    Status
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark">Is Per Season?</label>
                  <select
                    className="form-select"
                    name="isPerSeason"
                    value={formData.isPerSeason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPerSeason: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Yes (Per Season)</option>
                    <option value="false">No (One-time/Non-Seasonal)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark">
                    Auto Apply to All Members?
                  </label>
                  <select
                    className="form-select"
                    name="autoApplyOnCreate"
                    value={formData.autoApplyOnCreate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        autoApplyOnCreate: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Fee Type
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddFeeTypeModal;
