import React, { useState, useEffect } from "react";
import { fetchUsers } from "../../services/userService"; // Assuming this service exists
import { fetchProduct } from "../../services/productService"; // Assuming this service exists
import { fetchSeasons } from "../../services/seasonService"; // Assuming this service exists
// Assuming you have a service to fetch purchase inputs if loans are tied to them
// import { fetchPurchaseInputs } from "../../services/purchaseInputService";

const UpdateLoanModal = ({ show, onClose, onSubmit, loan }) => {
  // Renamed prop from 'initialData' to 'loan' for clarity
  const [formData, setFormData] = useState({
    _id: "", // To store the loan ID for the update request
    purchaseInputId: "",
    quantity: "",
    totalPrice: "",
    status: "",
  });

  const [purchaseInputs, setPurchaseInputs] = useState([]);
  const [loadingPurchaseInputs, setLoadingPurchaseInputs] = useState(false);
  const [purchaseInputsError, setPurchaseInputsError] = useState(null);

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

  // Fetch purchase inputs (or related data) for dropdowns and populate form with initial loan data
  useEffect(() => {
    if (show) {
      const loadDropdownData = async () => {
        setLoadingPurchaseInputs(true);
        setPurchaseInputsError(null);

        try {
          // Placeholder: Adjust to fetchPurchaseInputs if applicable
          const response = await fetchProduct(); // Using fetchProduct as placeholder
          if (response && Array.isArray(response.data || response)) {
            setPurchaseInputs(response.data || response);
          } else {
            console.warn("Purchase input data is not an array:", response);
            setPurchaseInputs([]);
            setPurchaseInputsError(
              "Purchase input data format incorrect or empty."
            );
          }
        } catch (error) {
          console.error(
            "Failed to load purchase inputs for update modal:",
            error
          );
          setPurchaseInputsError(
            "Failed to load associated data. Check connection."
          );
          setPurchaseInputs([]);
        } finally {
          setLoadingPurchaseInputs(false);
        }
      };

      loadDropdownData();

      // Populate form data with the current 'loan' prop
      if (loan) {
        setFormData({
          _id: loan._id || "",
          purchaseInputId: loan.purchaseInputId?._id || "", // Access nested ID
          quantity: loan.quantity || "",
          totalPrice: loan.totalPrice || "",
          status: loan.status || "pending",
        });
      }
    }
  }, [show, loan]); // Re-run when modal visibility or selected 'loan' changes

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
      quantity: Number(formData.quantity),
      totalPrice: Number(formData.totalPrice),
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
        aria-labelledby="updateLoanModalLabel"
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
                <h5 className="modal-title text-dark" id="updateLoanModalLabel">
                  Update Loan
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
                {purchaseInputsError && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      <p className="mb-0">{purchaseInputsError}</p>
                    </div>
                  </div>
                )}

                {/* Purchase Input Dropdown */}
                <div className="col-md-12 mb-3">
                  <label
                    htmlFor="purchaseInputId"
                    className="form-label text-dark"
                  >
                    Associated Purchase/Product
                  </label>
                  {loadingPurchaseInputs ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading options...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading options...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="purchaseInputId"
                        id="purchaseInputId"
                        className="form-select"
                        value={formData.purchaseInputId}
                        onChange={handleChange}
                        required
                        disabled={
                          purchaseInputsError || purchaseInputs.length === 0
                        }
                      >
                        <option value="">Select an associated item</option>
                        {purchaseInputs.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.productName || `Item ID: ${item._id}`}
                          </option>
                        ))}
                      </select>
                      {purchaseInputs.length === 0 && !purchaseInputsError && (
                        <small className="text-muted mt-1 d-block">
                          No associated items available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="quantity" className="form-label text-dark">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="totalPrice" className="form-label text-dark">
                    Amount (RWF)
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    id="totalPrice"
                    className="form-control"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label text-dark">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="repaid">Repaid</option>
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

export default UpdateLoanModal;
