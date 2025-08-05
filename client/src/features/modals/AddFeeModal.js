import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function AddFeeModal({ show, onClose, onSubmit, users, seasons, feeTypes }) {
  const [formData, setFormData] = useState({
    userId: "",
    seasonId: "",
    feeTypeId: "",
    paymentAmount: "",
  });

  const [amountToPay, setAmountToPay] = useState(0);

  // Effect to manage body class for scroll prevention when modal is open
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

  // Reset form state and amount to pay when the modal is shown
  useEffect(() => {
    if (show) {
      setFormData({
        userId: "",
        seasonId: "",
        feeTypeId: "",
        paymentAmount: "",
      });
      setAmountToPay(0);
    }
  }, [show]);

  // Effect to update the default payment amount when a fee type is selected
  useEffect(() => {
    if (formData.feeTypeId && feeTypes.length > 0) {
      const selectedFeeType = feeTypes.find(
        (ft) => ft._id === formData.feeTypeId
      );
      if (selectedFeeType) {
        setAmountToPay(selectedFeeType.amount);
        setFormData((prev) => ({
          ...prev,
          paymentAmount: selectedFeeType.amount,
        }));
      }
    } else {
      setAmountToPay(0);
      setFormData((prev) => ({
        ...prev,
        paymentAmount: "",
      }));
    }
  }, [formData.feeTypeId, feeTypes]);

  // Do not render if the modal is not visible
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

    // Basic form validation
    if (
      !formData.userId ||
      !formData.seasonId ||
      !formData.feeTypeId ||
      formData.paymentAmount === ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // if (Number(formData.paymentAmount) < 0) {
    //   toast.error("Payment amount must be greater than zero.");
    //   return;
    // }

    // Call the onSubmit function from the parent component
    onSubmit({
      ...formData,
      paymentAmount: Number(formData.paymentAmount),
    });
  };

  return (
    <>
      {/* Modal backdrop to dim the background */}
      <div className="modal-backdrop fade show"></div>
      {/* The modal itself */}
      <div
        className="modal d-block fade show"
        tabIndex="-1"
        role="dialog"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-dark">Record New Fee</h5>
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
                  <label htmlFor="userId" className="form-label text-dark">
                    User
                  </label>
                  <select
                    className="form-select"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select User</option>
                    {users &&
                      users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.names}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="seasonId" className="form-label text-dark">
                    Season
                  </label>
                  <select
                    className="form-select"
                    id="seasonId"
                    name="seasonId"
                    value={formData.seasonId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Season</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name} ({season.year})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="feeTypeId" className="form-label text-dark">
                    Fee Type
                  </label>
                  <select
                    className="form-select"
                    id="feeTypeId"
                    name="feeTypeId"
                    value={formData.feeTypeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Fee Type</option>
                    {feeTypes.map((feeType) => (
                      <option key={feeType._id} value={feeType._id}>
                        {feeType.name}
                      </option>
                    ))}
                  </select>
                </div>
                {amountToPay > 0 && (
                  <div className="mb-3">
                    <p className="text-dark fw-bold">
                      Standard Amount: ${amountToPay.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="mb-3">
                  <label
                    htmlFor="paymentAmount"
                    className="form-label text-dark"
                  >
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="paymentAmount"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleChange}
                    min="0.0"
                    step="0.0"
                    required
                  />
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
                  Record Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddFeeModal;
