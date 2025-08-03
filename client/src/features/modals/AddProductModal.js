import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function AddProductModal({ show, onClose, onSubmit }) {
  const [productName, setProductName] = useState("");

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

  useEffect(() => {
    if (show) {
      setProductName("");
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!productName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    onSubmit({ productName });

    setProductName("");
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
              <h5 className="modal-title text-dark">Add New Product</h5>
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
                  <label htmlFor="productName" className="form-label text-dark">
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
    </>
  );
}

export default AddProductModal;
