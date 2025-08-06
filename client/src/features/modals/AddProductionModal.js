import React, { useEffect, useState } from "react";
import { fetchUsers } from "../../services/userService";
import { fetchProduct } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

const AddProductionModal = ({ show, onClose, onSave }) => {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
  });
  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

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
        console.error("Failed to load dropdown data", err);
      }
    };

    if (show) {
      loadData();
      // Reset form data when modal opens
      setFormData({
        userId: "",
        productId: "",
        seasonId: "",
        quantity: "",
        unitPrice: "",
      });
      // Add 'modal-open' class to body to prevent scrolling when modal is open
      document.body.classList.add("modal-open");
    } else {
      // Remove 'modal-open' class when modal is closed
      document.body.classList.remove("modal-open");
    }

    // Cleanup function to remove 'modal-open' class if component unmounts
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    onSave(formData);
    onClose();
  };

  // If the modal is not shown, return null to render nothing
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
        aria-labelledby="addProductionModalLabel"
        aria-hidden="false" // Always false when showing, as it's visible
        style={{ display: "block", paddingRight: "17px" }} // Manually set display and padding for scrollbar
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title text-dark"
                id="addProductionModalLabel"
              >
                Add New Production
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
                <div className="mb-3">
                  <label htmlFor="unitPrice" className="form-label text-dark">
                    UnitPrice
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    className="form-control"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark">Total Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`$${totalAmount.toFixed(2)}`}
                    readOnly
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
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProductionModal;
