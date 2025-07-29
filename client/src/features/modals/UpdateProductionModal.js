import React, { useEffect, useState } from "react";
import { fetchUsers } from "../../services/userService";
import { fetchProduct } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

const UpdateProductionModal = ({ show, onClose, onUpdate, initialData }) => {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [formData, setFormData] = useState({
    _id: "",
    userId: "",
    productId: "",
    seasonId: "",
    quantity: "",
    totalPrice: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersData, productsData, seasonsData] = await Promise.all([
          fetchUsers(),
          fetchProduct(),
          fetchSeasons(),
        ]);
        setMembers(membersData);
        setProducts(productsData);
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Failed to load dropdown data for update modal:", err);
      }
    };

    if (show) {
      loadData();
      if (initialData) {
        setFormData({
          _id: initialData._id || "",
          userId: initialData.userId?._id || "",
          productId: initialData.productId?._id || "",
          seasonId: initialData.seasonId?._id || "",
          quantity: initialData.quantity || "",
        });
      }

      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    onUpdate(formData); // Pass the updated form data to the parent
    onClose(); // Close the modal
  };

  // If the modal is not shown, render nothing
  if (!show) {
    return null;
  }

  return (
    <>
      {/* The Modal Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* The Modal itself */}
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updateProductionModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title text-dark"
                id="updateProductionModalLabel"
              >
                Update Production
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="userId" className="form-label text-dark">
                    Member
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    className="form-select"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.names}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="productId" className="form-label text-dark">
                    Product
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    className="form-select"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.productName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="seasonId" className="form-label text-dark">
                    Season
                  </label>
                  <select
                    id="seasonId"
                    name="seasonId"
                    className="form-select"
                    value={formData.seasonId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Season</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label text-dark">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* RE-ADDED THIS INPUT FIELD FOR totalPrice */}
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProductionModal;
