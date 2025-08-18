import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";

import { fetchStocks } from "../../services/stockService";
import { fetchSeasons } from "../../services/seasonService";

// The UpdateSaleModal receives 'sale' (the data of the sale to be updated)
// and 'cooperativeId' from its parent component (Sales dashboard).
const UpdateSaleModal = ({ show, onClose, onSubmit, sale, cooperativeId }) => {
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

  // Initialize form data when the modal opens or 'sale' prop changes
  useEffect(() => {
    if (show && sale) {
      setFormData({
        stockId: sale.stockId?._id || "", // Use _id if populated, otherwise the ID string
        seasonId: sale.seasonId?._id || "",
        quantity: sale.quantity.toString(), // Convert number to string for TextField value
        unitPrice: sale.unitPrice.toString(),
        buyer: sale.buyer || "",
        phoneNumber: sale.phoneNumber || "",
        paymentType: sale.paymentType || "cash",
        status: sale.status || "unpaid",
      });
      // Recalculate total amount for initial load
      setTotalAmount(
        (parseFloat(sale.quantity) || 0) * (parseFloat(sale.unitPrice) || 0)
      );
      setStocksError(null);
      setSeasonsError(null);
    }
  }, [show, sale]);

  // Calculate total amount dynamically based on quantity and unit price changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  // Fetch stocks and seasons for dropdowns, scoped by cooperativeId
  const loadDropdownData = useCallback(async () => {
    if (!cooperativeId) {
      console.warn(
        "Cooperative ID is not available for fetching dropdown data."
      );
      return;
    }

    setLoadingStocks(true);
    setLoadingSeasons(true);
    setStocksError(null);
    setSeasonsError(null);

    try {
      const [stocksResponse, seasonsResponse] = await Promise.all([
        fetchStocks(cooperativeId),
        fetchSeasons(cooperativeId),
      ]);

      if (stocksResponse.success && Array.isArray(stocksResponse.data)) {
        setStocks(stocksResponse.data);
      } else {
        console.warn(
          "Stock data is not an array or missing 'data' property:",
          stocksResponse
        );
        setStocks([]);
        setStocksError(
          stocksResponse.message || "Stock data format incorrect or empty."
        );
      }

      if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
        setSeasons(seasonsResponse.data);
      } else {
        console.warn(
          "Season data is not an array or missing 'data' property:",
          seasonsResponse
        );
        setSeasons([]);
        setSeasonsError(
          seasonsResponse.message || "Season data format incorrect or empty."
        );
      }
    } catch (err) {
      console.error("Failed to load dropdown data for update modal:", err);
      if (!stocksError)
        setStocksError(
          "Failed to load products from stock. Please check your connection."
        );
      if (!seasonsError)
        setSeasonsError(
          "Failed to load seasons. Please check your connection."
        );
      setStocks([]);
      setSeasons([]);
    } finally {
      setLoadingStocks(false);
      setLoadingSeasons(false);
    }
  }, [cooperativeId, stocksError, seasonsError]); // Added errors to dependency to prevent infinite loop

  useEffect(() => {
    if (show) {
      loadDropdownData();
    }
  }, [show, loadDropdownData]);

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
      totalPrice: totalAmount,
    };
    // Pass the original sale ID and the updated data to the onSubmit prop
    onSubmit(sale._id, dataToSubmit);
    // The parent component (Sales dashboard) will handle closing the modal after successful submission
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-sale-modal-label"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="update-sale-modal-label">
        <Typography variant="h6">Update Sale</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ maxHeight: "60vh", overflowY: "auto" }}>
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
            inputProps={{ min: "0", step: "1" }} // Quantity can be 0 initially for existing sales
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
            inputProps={{ min: "0", step: "1" }} // Unit price can be 0 initially for existing sales
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
            Update Sale
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateSaleModal;
