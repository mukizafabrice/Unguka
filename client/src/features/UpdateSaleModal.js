import React, { useState, useEffect } from "react";

const UpdateSaleModal = ({ show, sale, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    buyer: "",
    phoneNumber: "",
    quantity: 0,
    paymentType: "cash",
    productId: "",
    status: "paid",
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        buyer: sale.buyer || "",
        phoneNumber: sale.phoneNumber || "",
        quantity: sale.quantity || 0,
        paymentType: sale.paymentType || "cash",
        productId: sale.stockId?.productId?._id || sale.stockId?.productId?.id || "",
        status: sale.status || "paid",
      });
    }
  }, [sale]);

  if (!show || !sale) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value, // Convert quantity to a number
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(sale._id, formData);
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Update Sale</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>

              <div className="modal-body row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Buyer</label>
                  <input
                    type="text"
                    name="buyer"
                    className="form-control"
                    value={formData.buyer}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Quantity (kg)</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Pending</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Payment Type</label>
                  <select
                    name="paymentType"
                    className="form-select"
                    value={formData.paymentType}
                    onChange={handleChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Product ID</label>
                  <input
                    type="text"
                    name="productId"
                    className="form-control"
                    value={formData.productId}
                    readOnly
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
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default UpdateSaleModal;