import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { fetchProduct } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

const UpdatePurchaseOutModal = ({ show, onClose, onSubmit, purchaseOut }) => {
  // State for the form data, initialized with the purchaseOut prop
  const [formData, setFormData] = useState({
    _id: "",
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
  });

  // States to hold fetched data and loading status
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to manage body class and fetch data when modal opens
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
      setLoading(true);

      const loadDependencies = async () => {
        try {
          // Fetch products and seasons in parallel
          const [productsData, seasonsData] = await Promise.all([
            fetchProduct(),
            fetchSeasons(),
          ]);
          setProducts(productsData);
          setSeasons(seasonsData);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch modal dependencies:", error);
          toast.error("Failed to load products or seasons.");
          setLoading(false);
        }
      };
      loadDependencies();
    } else {
      document.body.classList.remove("modal-open");
    }
    // Cleanup function
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Effect to populate form data when the `purchaseOut` prop changes or modal opens
  useEffect(() => {
    if (show && purchaseOut) {
      setFormData({
        _id: purchaseOut._id || "",
        productId: purchaseOut.productId?._id || "",
        seasonId: purchaseOut.seasonId?._id || "",
        quantity: purchaseOut.quantity || "",
        unitPrice: purchaseOut.unitPrice || "",
      });
    }
  }, [show, purchaseOut]);

  // If the modal is not visible, don't render it
  if (!show) return null;

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Process values for number inputs
    const processedValue = ["quantity", "unitPrice"].includes(name)
      ? Number(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure a product and season are selected
    if (!formData.productId || !formData.seasonId) {
      toast.error("Please select a product and a season.");
      return;
    }

    // Calculate the new totalPrice
    const totalPrice = formData.quantity * formData.unitPrice;

    // Call the parent's onSubmit handler with the ID and updated data
    onSubmit(formData._id, {
      ...formData,
      totalPrice,
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updatePurchaseOutModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5
                  className="modal-title text-dark"
                  id="updatePurchaseOutModalLabel"
                >
                  Update Purchase
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {loading ? (
                  <div className="col-12 text-center text-dark my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading products and seasons...</p>
                  </div>
                ) : (
                  <>
                    {/* Product Dropdown */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="productId"
                        className="form-label text-dark"
                      >
                        Product
                      </label>
                      <select
                        name="productId"
                        id="productId"
                        className="form-control"
                        value={formData.productId}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select a product
                        </option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Season Dropdown */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="seasonId"
                        className="form-label text-dark"
                      >
                        Season
                      </label>
                      <select
                        name="seasonId"
                        id="seasonId"
                        className="form-control"
                        value={formData.seasonId}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select a season
                        </option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="quantity"
                        className="form-label text-dark"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        className="form-control"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>

                    {/* Unit Price Input */}
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="unitPrice"
                        className="form-label text-dark"
                      >
                        Unit Price
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        id="unitPrice"
                        className="form-control"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
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
    </>
  );
};

export default UpdatePurchaseOutModal;
