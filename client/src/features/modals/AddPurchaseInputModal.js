import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { fetchSeasons } from "../../services/seasonService";
import { fetchProduct } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

export default function AddPurchaseInputModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    seasonId: "",
    quantity: 0,
    unitPrice: 0,
    amountPaid: 0,
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  useEffect(() => {
    if (show) {
      const loadData = async () => {
        try {
          const usersData = await fetchUsers();
          const productsData = await fetchProduct();
          const seasonsData = await fetchSeasons();

          setUsers(usersData);
          setProducts(productsData);
          setSeasons(seasonsData);
        } catch (error) {
          console.error("Failed to load modal data:", error);
          toast.error("Failed to load required data for the form.");
        }
      };
      loadData();
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      setFormData({
        userId: "",
        productId: "",
        seasonId: "",
        quantity: 0,
        unitPrice: 0,
        amountPaid: 0,
      });
    }
  }, [show]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.productId || !formData.seasonId) {
      toast.error("Please select a user, product, and season.");
      return;
    }
    if (formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error("Quantity and Unit Price must be greater than 0.");
      return;
    }

    const totalPrice = formData.quantity * formData.unitPrice;
    if (formData.amountPaid > totalPrice) {
      toast.error("Amount paid cannot exceed the total price.");
      return;
    }

    onSubmit(formData);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Purchase</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="userId" className="form-label">
                  User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.names}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="productId" className="form-label">
                  Product
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="seasonId" className="form-label">
                  Season
                </label>
                <select
                  id="seasonId"
                  name="seasonId"
                  value={formData.seasonId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a season</option>
                  {seasons.map((season) => (
                    <option key={season._id} value={season._id}>
                      {season.name} ({season.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="quantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="unitPrice" className="form-label">
                  Unit Price
                </label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="totalAmount" className="form-label">
                  Total Amount
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formatCurrency(`${totalAmount}`)}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label htmlFor="amountPaid" className="form-label">
                  Amount Paid
                </label>
                <input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Add Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
