import React, { useState, useEffect } from "react";
import { fetchStock } from "../../services/stockService";
import { fetchSeasons } from "../../services/seasonService";

const AddSaleModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    stockId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
    buyer: "",
    phoneNumber: "",
    paymentType: "cash",
    status: "unpaid",
  });

  const [stocks, setStocks] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [loadingStocks, setLoadingStocks] = useState(false); // Renamed from loadingProducts for clarity
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  // Error states for data fetching
  const [stocksError, setStocksError] = useState(null); // Renamed from productsError for clarity
  const [seasonsError, setSeasonsError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

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

  useEffect(() => {
    if (show) {
      const getSeasons = async () => {
        setLoadingSeasons(true);
        setSeasonsError(null);
        try {
          const response = await fetchSeasons();
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
          setSeasons([]);
        } finally {
          setLoadingSeasons(false);
        }
      };
      getSeasons();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setFormData({
        stockId: "",
        seasonId: "",
        quantity: "",
        unitPrice: "",
        buyer: "",
        phoneNumber: "",
        paymentType: "cash",
        status: "unpaid",
      });
      setStocksError(null);
      setSeasonsError(null);
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      quantity: Number(formData.quantity),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSaleModalLabel"
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
                        disabled={stocksError || stocks.length === 0}
                      >
                        <option value="">Select a product</option>
                        {stocks.map((stock) => (
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
                        disabled={seasonsError || seasons.length === 0}
                      >
                        <option value="">Select a season</option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name + "" + season.year}
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="unitPrice" className="form-label text-dark">
                    Unit Price (rwf)
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    id="unitPrice"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="totalAmount" className="form-label text-dark">
                    Total Amount (rwf)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formatCurrency(`${totalAmount}`)}
                    readOnly
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
