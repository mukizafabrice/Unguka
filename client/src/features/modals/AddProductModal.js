import React, { useState } from "react";

function AddProductModal({ show, onClose, onSubmit }) {
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !unitPrice) return alert("All fields required");
    onSubmit({ productName, unitPrice });
    setProductName("");
    setUnitPrice("");
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Product Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="unitPrice" className="form-label">
                  Unit Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="unitPrice"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
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
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;
