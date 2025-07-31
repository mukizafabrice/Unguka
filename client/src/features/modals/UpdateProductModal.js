import React, { useState, useEffect } from "react";

function UpdateProductModal({ show, onClose, onSubmit, productData }) {
  const [form, setForm] = useState({ productName: "" });

  useEffect(() => {
    if (productData) {
      setForm({
        productName: productData.productName || "",
        _id: productData._id,
      });
    }
  }, [productData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content text-dark">
          <div className="modal-header">
            <h5 className="modal-title">Update Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  className="form-control"
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
  );
}

export default UpdateProductModal;
