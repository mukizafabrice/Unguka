import React, { useState, useEffect } from "react";
import { fetchStock } from "../../services/stockService"; // Assuming this service exists
import { fetchSeasons } from "../../services/seasonService"; // Assuming this service exists

const AddSaleModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    stockId: "",
    seasonId: "",
    quantity: "",
    buyer: "",
    phoneNumber: "",
    paymentType: "cash",
    status: "unpaid", // This seems to be a default for AddSale, ensure your backend handles it or remove if not needed.
  });

  const [stocks, setStocks] = useState([]);
  const [seasons, setSeasons] = useState([]);

  // Loading states for data fetching
  const [loadingStocks, setLoadingStocks] = useState(false); // Renamed from loadingProducts for clarity
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  // Error states for data fetching
  const [stocksError, setStocksError] = useState(null); // Renamed from productsError for clarity
  const [seasonsError, setSeasonsError] = useState(null);

  // Effect to manage body class for scroll prevention
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    // Cleanup function for when component unmounts or show changes
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Fetch stocks for dropdown
  useEffect(() => {
    if (show) {
      // Only fetch when modal is shown
      const getStocks = async () => {
        setLoadingStocks(true);
        setStocksError(null);
        try {
          const response = await fetchStock();
          // IMPORTANT: Check if response.data is the array, or if response itself is the array.
          // Adjust this line based on what your fetchStock service actually returns.
          if (response && Array.isArray(response.data || response)) {
            setStocks(response.data || response);
          } else {
            console.warn(
              "Stock data is not an array or missing 'data' property:",
              response
            );
            setStocks([]);
            setStocksError("Stock data format incorrect or empty.");
          }
        } catch (error) {
          console.error("Failed to fetch stocks for modal:", error);
          setStocksError(
            "Failed to load products from stock. Please check your connection."
          );
          setStocks([]);
        } finally {
          setLoadingStocks(false);
        }
      };
      getStocks();
    }
  }, [show]);

  // Fetch seasons for dropdown
  useEffect(() => {
    if (show) {
      // Only fetch when modal is shown
      const getSeasons = async () => {
        setLoadingSeasons(true);
        setSeasonsError(null);
        try {
          const response = await fetchSeasons();
          // IMPORTANT: Check if response.data is the array, or if response itself is the array.
          // Adjust this line based on what your fetchSeasons service actually returns.
          if (response && Array.isArray(response.data || response)) {
            setSeasons(response.data || response);
          } else {
            console.warn(
              "Season data is not an array or missing 'data' property:",
              response
            );
            setSeasons([]);
            setSeasonsError("Season data format incorrect or empty.");
          }
        } catch (error) {
          console.error("Failed to fetch seasons for modal:", error);
          setSeasonsError(
            "Failed to load seasons. Please check your connection."
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
        status: "unpaid",
      });
      // Also reset fetch errors on modal open for a fresh start
      setStocksError(null); // Renamed from productsError
      setSeasonsError(null);
    }
  }, [show]);

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
    // The parent component (Sales.jsx) is responsible for closing the modal
    // and showing toast messages after the submission is complete.
  };

  // --- Rendered JSX ---
  return (
    <>
      {/* 1. MODAL BACKDROP: This MUST be rendered FIRST to be behind the modal content */}
      <div className="modal-backdrop fade show"></div>

      {/* 2. MODAL CONTENT: This is the actual modal that should appear on top */}
      <div
        className="modal fade show d-block" // 'd-block' makes it visible, 'show' applies fade animation
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSaleModalLabel"
        aria-hidden="false" // When 'show' is true, the modal is visible, so aria-hidden should be false
        style={{ display: "block", paddingRight: "17px" }} // Explicitly ensure it's displayed and accounts for scrollbar
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-dark" id="addSaleModalLabel">
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
                {(stocksError || seasonsError) && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      {stocksError && <p className="mb-1">{stocksError}</p>}
                      {seasonsError && <p className="mb-0">{seasonsError}</p>}
                    </div>
                  </div>
                )}

                {/* Product Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="stockId" className="form-label text-dark">
                    Product
                  </label>
                  {loadingStocks ? (
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
                        disabled={stocksError || stocks.length === 0}
                      >
                        <option value="">Select a product</option>
                        {stocks.map((stock) => (
                          // Ensure stock.productId and stock.productId.productName exist
                          <option key={stock._id} value={stock._id}>
                            {stock.productId?.productName ||
                              `Stock ID: ${stock._id}`}
                          </option>
                        ))}
                      </select>
                      {stocks.length === 0 && !stocksError && (
                        <small className="text-muted mt-1 d-block">
                          No products available in stock. Please add products to
                          stock first.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Season Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="seasonId" className="form-label text-dark">
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
                  <label htmlFor="quantity" className="form-label text-dark">
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
                  <label htmlFor="buyer" className="form-label text-dark">
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
                  <label htmlFor="phoneNumber" className="form-label text-dark">
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
                  <label htmlFor="paymentType" className="form-label text-dark">
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
    </>
  );
};

export default AddSaleModal;
