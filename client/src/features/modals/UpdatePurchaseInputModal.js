import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// These service imports are crucial for fetching the dropdown data
import { fetchSeasons } from "../../services/seasonService";
import { fetchProduct } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

export default function UpdatePurchaseInputModal({
  show,
  onClose,
  onSubmit,
  initialData,
}) {
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

  // useEffect hook to fetch data for dropdowns when the modal is shown
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

  // useEffect hook to populate the form with the initial data
  // This runs whenever the modal is opened with a new purchase item.
  useEffect(() => {
    if (show && initialData) {
      // Ensure all numbers are cast to the correct type to prevent form errors
      setFormData({
        ...initialData,
        quantity: Number(initialData.quantity),
        unitPrice: Number(initialData.unitPrice),
        amountPaid: Number(initialData.amountPaid),
      });
    }
  }, [show, initialData]);

  // useEffect hook to reset the form when the modal is closed
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

  // Handles changes to form inputs, converting number types as needed
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Handles form submission, performs validation, and calls the onSubmit prop
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

  // The modal component is only rendered if the 'show' prop is true
  if (!show) {
    return null;
  }

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Purchase</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {/* Added a key to the form to ensure a re-render when a different purchase is selected */}
            <form
              onSubmit={handleSubmit}
              key={initialData ? initialData._id : "new"}
            >
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
              Update Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
