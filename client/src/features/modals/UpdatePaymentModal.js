import React, { useState, useEffect } from "react";

const UpdatePaymentModal = ({ show, onClose, payment, onSubmit }) => {
  const [formData, setFormData] = useState({
    amountPaid: 0,
    amountRemainingToPay: 0,
    status: "pending",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        amountPaid: payment.amountPaid,
        amountRemainingToPay: payment.amountRemainingToPay,
        status: payment.status,
      });
    }
  }, [payment]);

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
    onSubmit(payment._id, formData);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updatePaymentModalLabel"
        aria-hidden="false"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-dark">Update Payment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="amountPaid" className="form-label text-dark">
                    Amount Paid (RWF)
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    id="amountPaid"
                    className="form-control"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="amountRemainingToPay"
                    className="form-label text-dark"
                  >
                    Amount Remaining (RWF)
                  </label>
                  <input
                    type="number"
                    name="amountRemainingToPay"
                    id="amountRemainingToPay"
                    className="form-control"
                    value={formData.amountRemainingToPay}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
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
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Update Payment
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
