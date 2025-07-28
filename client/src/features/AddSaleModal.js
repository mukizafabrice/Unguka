import React, { useState, useEffect } from "react";
import { fetchStock } from "../services/stockService";
import { fetchSeasons } from "../services/seasonService";

const AddSaleModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    stockId: "",
    seasonId: "",
    quantity: "",
    buyer: "",
    phoneNumber: "",
    paymentType: "cash",
    status: "unpaid",
  });

  const [stocks, setStocks] = useState([]);
  const [seasons, setSeasons] = useState([]);

  // Loading states for data fetching
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  // Error states for data fetching
  const [productsError, setProductsError] = useState(null);
  const [seasonsError, setSeasonsError] = useState(null);

  useEffect(() => {
    if (show) {
      const getProducts = async () => {
        setLoadingProducts(true);
        setProductsError(null);
        try {
          const response = await fetchStock();
          console.log("Full product fetch response:", response); // This is good for debugging
          // console.log("Fetched products data:", response.data); // This was logging undefined

          // CORRECTED LINE: Use 'response' directly if your service returns the array
          if (Array.isArray(response)) {
            setStocks(response);
            console.log("Products set in state (length):", response.length);
          } else {
            console.warn("Product data is not an array:", response);
            setStocks([]);
            setProductsError("Product data format incorrect or empty.");
          }
        } catch (error) {
          console.error("Failed to fetch products:", error);
          setProductsError(
            "Failed to load products. Please check your connection or try again."
          );
          setStocks([]);
        } finally {
          setLoadingProducts(false);
        }
      };
      getProducts();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      const getSeasons = async () => {
        setLoadingSeasons(true);
        setSeasonsError(null);
        try {
          const response = await fetchSeasons();
          console.log("Full season fetch response:", response); // This is good for debugging
          // console.log("Fetched seasons data:", response.data); // This was logging undefined

          // CORRECTED LINE: Use 'response' directly if your service returns the array
          if (Array.isArray(response)) {
            setSeasons(response);
            console.log("Seasons set in state (length):", response.length);
          } else {
            console.warn("Season data is not an array:", response);
            setSeasons([]);
            setSeasonsError("Season data format incorrect or empty.");
          }
        } catch (error) {
          console.error("Failed to fetch seasons:", error);
          setSeasonsError(
            "Failed to load seasons. Please check your connection or try again."
          );
          setSeasons([]); // Ensure state is an empty array on error
        } finally {
          setLoadingSeasons(false);
        }
      };
      getSeasons();
    }
  }, [show]);

  // Effect to reset form data and errors when the modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        stockId: "",
        seasonId: "",
        quantity: "",
        buyer: "",
        phoneNumber: "",
        paymentType: "cash",
      });
      // Also reset fetch errors on modal open for a fresh start
      setProductsError(null);
      setSeasonsError(null);
    }
  }, [show]);

  // --- Component Logic ---

  // If the modal isn't supposed to be shown, return null immediately
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert quantity to a number before submitting
    const dataToSubmit = {
      ...formData,
      quantity: Number(formData.quantity),
    };
    onSubmit(dataToSubmit);
    // Optionally close modal or reset form after successful submission (handled by parent component)
  };

  // --- Rendered JSX ---
  return (
    <>
      {/* Modal overlay */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSaleModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addSaleModalLabel">
                  Add New Sale
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {/* Display general fetch errors if any */}
                {(productsError || seasonsError) && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      {productsError && <p className="mb-1">{productsError}</p>}
                      {seasonsError && <p className="mb-0">{seasonsError}</p>}
                    </div>
                  </div>
                )}

                {/* Product Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="stockId" className="form-label">
                    Product
                  </label>
                  {loadingProducts ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading products...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading products...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="stockId"
                        id="stockId"
                        className="form-select"
                        value={formData.stockId}
                        onChange={handleChange}
                        required
                        // Disable if there's an error or no products available after loading
                        disabled={productsError || stocks.length === 0}
                      >
                        <option value="">Select a product</option>
                        {stocks.map((stock) => (
                          <option key={stock._id} value={stock._id}>
                            {stock.productId.productName}
                          </option>
                        ))}
                      </select>
                      {stocks.length === 0 && !productsError && (
                        <small className="text-muted mt-1 d-block">
                          No products available. Please add products first.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Season Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="seasonId" className="form-label">
                    Season
                  </label>
                  {loadingSeasons ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading seasons...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading seasons...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="seasonId"
                        id="seasonId"
                        className="form-select"
                        value={formData.seasonId}
                        onChange={handleChange}
                        required
                        // Disable if there's an error or no seasons available after loading
                        disabled={seasonsError || seasons.length === 0}
                      >
                        <option value="">Select a season</option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                      {seasons.length === 0 && !seasonsError && (
                        <small className="text-muted mt-1 d-block">
                          No seasons available. Please add seasons first.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity (kg)
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

                {/* Buyer */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="buyer" className="form-label">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    name="buyer"
                    id="buyer"
                    className="form-control"
                    value={formData.buyer}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g., 0781234567 or +250781234567"
                    required
                  />
                </div>

                {/* Payment Type */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="paymentType" className="form-label">
                    Payment Type
                  </label>
                  <select
                    name="paymentType"
                    id="paymentType"
                    className="form-select"
                    value={formData.paymentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Add Sale
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
      {/* Modal backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default AddSaleModal;
