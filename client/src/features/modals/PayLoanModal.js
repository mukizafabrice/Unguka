import React, { useState, useEffect } from "react";

const PayLoanModal = ({ show, loan, onClose, onSubmit }) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (loan) {
      setAmount(loan.amountOwed);
    }
  }, [loan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0 || amount > loan.amountOwed) {
      alert("Please enter a valid amount less than or equal to the amount owed.");
      return;
    }
    onSubmit(loan._id, amount);
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
            <h5 className="modal-title">Pay Loan for {loan.purchaseInputId?.userId?.names || "N/A"}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p className="text-muted">
              The member currently owes <span className="fw-bold">{loan.amountOwed.toFixed(2)}</span>.
              Enter the amount you wish to pay.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label">
                  Amount to Pay
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="form-control"
                  step="0.01"
                  min="0"
                  max={loan.amountOwed}
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
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayLoanModal;