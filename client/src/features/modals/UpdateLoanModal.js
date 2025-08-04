import React, { useState, useEffect } from "react";

const UpdateLoanModal = ({ show, loan, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState("");
  const [amountOwed, setAmountOwed] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loan) {
      setQuantity(loan.purchaseInputId.quantity);
      setAmountOwed(loan.amountOwed);
    }
  }, [loan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (amountOwed === null || amountOwed < 0) {
      setError("Amount owed must be a positive number.");
      return;
    }
    setError("");
    onSubmit(loan._id, { quantity, amountOwed });
  };

  if (!show || !loan) {
    return null;
  }

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">
              Update Loan for {loan.purchaseInputId?.userId?.names || "N/A"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="quantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-control"
                  min="1"
                  required
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label htmlFor="amountOwed" className="form-label">
                  Amount Owed
                </label>
                <input
                  type="number"
                  id="amountOwed"
                  value={amountOwed}
                  onChange={(e) => setAmountOwed(Number(e.target.value))}
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="modal-footer d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Loan
                </button>
              </div>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UpdateLoanModal;
