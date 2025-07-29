import React, { useEffect, useState } from "react";
import { fetchUsers } from "../../services/userService"; // Assuming you have this service
import { fetchProduct } from "../../services/productService"; // Assuming you have this service

const UpdatePlotModal = ({ show, onClose, onUpdate, initialData }) => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    _id: "",
    userId: "",
    productId: "",
    area: "",
    upi: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, productsData] = await Promise.all([
          fetchUsers(),
          fetchProduct(),
        ]);
        setUsers(usersData);
        setProducts(productsData);
      } catch (err) {
        console.error(
          "Failed to load dropdown data for update plot modal:",
          err
        );
      }
    };

    if (show) {
      loadData();
      if (initialData) {
        setFormData({
          _id: initialData._id || "",
          userId: initialData.userId?._id || "",
          productId: initialData.productId?._id || "",
          area: initialData.area || "",
          upi: initialData.upi || "",
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
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updatePlotModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-dark" id="updatePlotModalLabel">
                Update Plot
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
                    User (Member)
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    className="form-select"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.names}
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
                  <label htmlFor="area" className="form-label text-dark">
                    Area (e.g., in sq. meters)
                  </label>
                  <input
                    type="number"
                    id="area"
                    className="form-control"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="upi" className="form-label text-dark">
                    UPI (Unique Plot Identifier)
                  </label>
                  <input
                    type="text"
                    id="upi"
                    className="form-control"
                    name="upi"
                    value={formData.upi}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="modal-footer px-0 pb-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePlotModal;
