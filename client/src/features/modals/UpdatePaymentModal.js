// src/features/modals/UpdatePaymentModal.jsx

import React, { useState, useEffect } from "react";
import { fetchProductions } from "../../services/productionService"; // Assuming this service exists

const UpdatePaymentModal = ({ show, onClose, onSubmit, payment }) => {
  const [formData, setFormData] = useState({
    _id: "", // To store the payment ID for the update request
    productionId: "",
    amount: "",
  });

  const [productions, setProductions] = useState([]);
  const [loadingProductions, setLoadingProductions] = useState(false);
  const [productionsError, setProductionsError] = useState(null);

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

  // Fetch productions for dropdown and populate form with initial payment data
  useEffect(() => {
    if (show) {
      const loadDropdownData = async () => {
        setLoadingProductions(true);
        setProductionsError(null);

        try {
          const response = await fetchProductions();
          if (response && Array.isArray(response.data || response)) {
            setProductions(response.data || response);
          } else {
            console.warn("Production data is not an array:", response);
            setProductions([]);
            setProductionsError("Production data format incorrect or empty.");
          }
        } catch (error) {
          console.error("Failed to load productions for update modal:", error);
          setProductionsError("Failed to load productions. Check connection.");
          setProductions([]);
        } finally {
          setLoadingProductions(false);
        }
      };

      loadDropdownData();

      // Populate form data with the current 'payment' prop
      if (payment) {
        setFormData({
          _id: payment._id || "",
          productionId: payment.productionId?._id || "", // Access nested ID
          amount: payment.amount || "",
        });
      }
    }
  }, [show, payment]); // Re-run when modal visibility or selected 'payment' changes

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
    const dataToSubmit = {
      ...formData,
      amount: Number(formData.amount), // Ensure amount is a number
    };
    onSubmit(dataToSubmit._id, dataToSubmit); // Pass ID and updated data to parent
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
        aria-labelledby="updatePaymentModalLabel"
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
                  id="updatePaymentModalLabel"
                >
                  Update Payment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {/* General Fetch Errors */}
                {productionsError && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      <p className="mb-0">{productionsError}</p>
                    </div>
                  </div>
                )}

                {/* Production Dropdown */}
                <div className="col-md-12 mb-3">
                  <label
                    htmlFor="productionId"
                    className="form-label text-dark"
                  >
                    Associated Production
                  </label>
                  {loadingProductions ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading productions...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading productions...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="productionId"
                        id="productionId"
                        className="form-select"
                        value={formData.productionId}
                        onChange={handleChange}
                        required
                        disabled={productionsError || productions.length === 0}
                      >
                        <option value="">Select a production</option>
                        {productions.map((production) => (
                          <option key={production._id} value={production._id}>
                            {/* Display relevant info from production, e.g., user + product + season */}
                            {`${production.userId?.names || "N/A"} - ${
                              production.productId?.productName || "N/A"
                            } (${production.seasonId?.name || "N/A"})`}
                          </option>
                        ))}
                      </select>
                      {productions.length === 0 && !productionsError && (
                        <small className="text-muted mt-1 d-block">
                          No productions available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Amount */}
                <div className="col-md-12 mb-3">
                  <label htmlFor="amount" className="form-label text-dark">
                    Amount (RWF)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
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

export default UpdatePaymentModal;
