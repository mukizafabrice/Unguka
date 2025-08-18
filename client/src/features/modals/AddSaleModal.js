import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  // Removed Grid as per request
} from "@mui/material";

// ⭐ NEW: Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

// ⭐ CORRECTED: Import fetchStocks (plural) and fetchSeasons
import { fetchStocks } from "../../services/stockService";
import { fetchSeasons } from "../../services/seasonService";

const AddSaleModal = ({ show, onClose, onSubmit, cooperativeId }) => {
  // ⭐ Pass cooperativeId prop
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

  const [loadingStocks, setLoadingStocks] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  const [stocksError, setStocksError] = useState(null);
  const [seasonsError, setSeasonsError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  // Fetch stocks and seasons for dropdowns, scoped by cooperativeId
  useEffect(() => {
    if (!show || !cooperativeId) {
      // Only fetch when modal is shown AND cooperativeId is available
      setLoadingStocks(false);
      setLoadingSeasons(false);
      return;
    }

    const getStocks = async () => {
      setLoadingStocks(true);
      setStocksError(null);
      try {
        // ⭐ Pass cooperativeId to fetchStocks
        const response = await fetchStocks(cooperativeId);
        if (response.success && Array.isArray(response.data)) {
          // Check success and if data is array
          setStocks(response.data);
        } else {
          console.warn(
            "Stock data is not an array or missing 'data' property:",
            response
          );
          setStocks([]);
          setStocksError(
            response.message || "Stock data format incorrect or empty."
          );
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

    const getSeasons = async () => {
      setLoadingSeasons(true);
      setSeasonsError(null);
      try {
        // ⭐ Pass cooperativeId to fetchSeasons
        const response = await fetchSeasons(cooperativeId);
        if (response.success && Array.isArray(response.data)) {
          // Check success and if data is array
          setSeasons(response.data);
        } else {
          console.warn(
            "Season data is not an array or missing 'data' property:",
            response
          );
          setSeasons([]);
          setSeasonsError(
            response.message || "Season data format incorrect or empty."
          );
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

    getStocks();
    getSeasons();
  }, [show, cooperativeId]); // Depend on show and cooperativeId

  // Reset form data when modal is shown
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

    // Basic validation
    if (
      !formData.stockId ||
      !formData.seasonId ||
      !formData.quantity ||
      !formData.unitPrice ||
      !formData.buyer ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (parseFloat(formData.quantity) <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    if (parseFloat(formData.unitPrice) <= 0) {
      toast.error("Unit Price must be a positive number.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      totalPrice: totalAmount, // ⭐ Include totalPrice in submission
    };
    onSubmit(dataToSubmit); // Parent component will handle cooperativeId
    // onClose(); // Let parent handle closing after successful submission via toast logic
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-sale-modal-label"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="add-sale-modal-label">
        <Typography variant="h6">Add New Sale</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          {" "}
          {/* Added max height and scroll */}
          {(stocksError || seasonsError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {stocksError && (
                <Typography variant="body2">{stocksError}</Typography>
              )}
              {seasonsError && (
                <Typography variant="body2">{seasonsError}</Typography>
              )}
            </Alert>
          )}
          {/* Product Dropdown */}
          <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
            <InputLabel id="stock-select-label">Product from Stock</InputLabel>
            <Select
              labelId="stock-select-label"
              id="stockId"
              name="stockId"
              value={formData.stockId}
              label="Product from Stock"
              onChange={handleChange}
              disabled={loadingStocks || stocksError || stocks.length === 0}
            >
              {loadingStocks ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading
                  products...
                </MenuItem>
              ) : stocks.length > 0 ? (
                [
                  <MenuItem key="select-stock-placeholder" value="">
                    Select a product
                  </MenuItem>,
                  ...stocks.map((stock) => (
                    <MenuItem key={stock._id} value={stock._id}>
                      {stock.productId?.productName || `Stock ID: ${stock._id}`}{" "}
                      (Qty: {stock.quantity})
                    </MenuItem>
                  )),
                ]
              ) : (
                <MenuItem disabled>No products available in stock.</MenuItem>
              )}
            </Select>
            {stocks.length === 0 && !loadingStocks && !stocksError && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                No products available. Please add products to stock first.
              </Typography>
            )}
          </FormControl>
          {/* Season Dropdown */}
          <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
            <InputLabel id="season-select-label">Season</InputLabel>
            <Select
              labelId="season-select-label"
              id="seasonId"
              name="seasonId"
              value={formData.seasonId}
              label="Season"
              onChange={handleChange}
              disabled={loadingSeasons || seasonsError || seasons.length === 0}
            >
              {loadingSeasons ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading
                  seasons...
                </MenuItem>
              ) : seasons.length > 0 ? (
                [
                  <MenuItem key="select-season-placeholder" value="">
                    Select a season
                  </MenuItem>,
                  ...seasons.map((season) => (
                    <MenuItem key={season._id} value={season._id}>
                      {season.name} {season.year}
                    </MenuItem>
                  )),
                ]
              ) : (
                <MenuItem disabled>No seasons available.</MenuItem>
              )}
            </Select>
            {seasons.length === 0 && !loadingSeasons && !seasonsError && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                No seasons available. Please add seasons first.
              </Typography>
            )}
          </FormControl>
          {/* Quantity */}
          <TextField
            margin="dense"
            id="quantity"
            name="quantity"
            label="Quantity (kg)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.quantity}
            onChange={handleChange}
            inputProps={{ min: "1", step: "1" }}
            required
            sx={{ mb: 2 }}
          />
          {/* Unit Price */}
          <TextField
            margin="dense"
            id="unitPrice"
            name="unitPrice"
            label="Unit Price (RWF)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.unitPrice}
            onChange={handleChange}
            inputProps={{ min: "1", step: "1" }}
            required
            sx={{ mb: 2 }}
          />
          {/* Total Amount */}
          <TextField
            margin="dense"
            id="totalAmount"
            label="Total Amount (RWF)"
            type="text"
            fullWidth
            variant="outlined"
            value={formatCurrency(totalAmount)}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          {/* Buyer Name */}
          <TextField
            margin="dense"
            id="buyer"
            name="buyer"
            label="Buyer Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.buyer}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          {/* Phone Number */}
          <TextField
            margin="dense"
            id="phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g., 0781234567 or +250781234567"
            required
            sx={{ mb: 2 }}
          />
          {/* Payment Type */}
          <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
            <InputLabel id="paymentType-select-label">Payment Type</InputLabel>
            <Select
              labelId="paymentType-select-label"
              id="paymentType"
              name="paymentType"
              value={formData.paymentType}
              label="Payment Type"
              onChange={handleChange}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="loan">Loan</MenuItem>
            </Select>
          </FormControl>
          {/* Status */}
          <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status"
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Sale
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSaleModal;
