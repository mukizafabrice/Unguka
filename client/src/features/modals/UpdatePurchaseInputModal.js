import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  CircularProgress, // For loading state
} from "@mui/material";
import { styled } from "@mui/system"; // Import styled for custom components

// ⭐ Updated import paths to ensure consistency.
// Assuming these service functions can accept a cooperativeId to filter results.
import { fetchSeasons } from "../../services/seasonService";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

// Styled components for consistent modal header
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTypography-root": {
    fontWeight: 600,
  },
}));

export default function UpdatePurchaseInputModal({
  show,
  onClose,
  onSubmit,
  initialData,
  cooperativeId, // ⭐ NEW: Accept cooperativeId prop
}) {
  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
    amountPaid: "",
    interest: "",
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state for form data

  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalAmount(quantity * unitPrice);
    // If total amount is less than or equal to amount paid, reset interest
    if (quantity * unitPrice <= (parseFloat(formData.amountPaid) || 0)) {
      setFormData((prevData) => ({ ...prevData, interest: "" }));
    }
  }, [formData.quantity, formData.unitPrice, formData.amountPaid]);

  // Load data (users, products, seasons) when the modal opens or cooperativeId changes
  useEffect(() => {
    const loadModalData = async () => {
      if (!cooperativeId) {
        toast.error("Cooperative ID is missing. Cannot load form data.");
        return;
      }

      setLoading(true);
      try {
        // ⭐ Pass cooperativeId to fetch functions for multi-cooperative filtering
        const [usersResponse, productsResponse, seasonsResponse] =
          await Promise.all([
            fetchUsers(cooperativeId),
            fetchProducts(cooperativeId),
            fetchSeasons(cooperativeId),
          ]);

        // ⭐ Enhanced error handling for each fetch operation
        if (usersResponse.success && Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        } else {
          toast.error(usersResponse.message || "Failed to load users.");
          setUsers([]);
        }

        if (productsResponse.success && Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data);
        } else {
          toast.error(productsResponse.message || "Failed to load products.");
          setProducts([]);
        }

        if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
          setSeasons(seasonsResponse.data);
        } else {
          toast.error(seasonsResponse.message || "Failed to load seasons.");
          setSeasons([]);
        }
      } catch (error) {
        console.error("Failed to load modal data:", error);
        toast.error("An unexpected error occurred while loading form data.");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadModalData();
    }
  }, [show, cooperativeId]); // Re-run effect if show or cooperativeId changes

  // useEffect hook to populate the form with the initial data
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        _id: initialData._id, // Keep the _id for update operation
        userId: initialData.userId?._id || "", // Access _id from nested object
        productId: initialData.productId?._id || "", // Access _id from nested object
        seasonId: initialData.seasonId?._id || "", // Access _id from nested object
        quantity:
          initialData.quantity !== undefined
            ? String(initialData.quantity)
            : "",
        unitPrice:
          initialData.unitPrice !== undefined
            ? String(initialData.unitPrice)
            : "",
        amountPaid:
          initialData.amountPaid !== undefined
            ? String(initialData.amountPaid)
            : "",
        interest:
          initialData.interest !== undefined
            ? String(initialData.interest)
            : "",
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
        quantity: "",
        unitPrice: "",
        amountPaid: "",
        interest: "",
      });
      setTotalAmount(0); // Also reset total amount
    }
  }, [show]);

  // Handles changes to form inputs, converting number types as needed
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Handles form submission, performs validation, and calls the onSubmit prop
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!formData.userId || !formData.productId || !formData.seasonId) {
        toast.error("Please select a user, product, and season.");
        return;
      }
      const quantityNum = parseFloat(formData.quantity);
      const unitPriceNum = parseFloat(formData.unitPrice);
      const amountPaidNum = parseFloat(formData.amountPaid);
      const interestNum = parseFloat(formData.interest) || 0; // Default to 0 if not entered

      if (isNaN(quantityNum) || quantityNum <= 0) {
        toast.error("Quantity must be a number greater than 0.");
        return;
      }
      if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
        toast.error("Unit Price must be a number greater than 0.");
        return;
      }

      const calculatedTotalPrice = quantityNum * unitPriceNum;

      if (isNaN(amountPaidNum) || amountPaidNum < 0) {
        toast.error("Amount paid must be a non-negative number.");
        return;
      }

      if (amountPaidNum > calculatedTotalPrice) {
        toast.error("Amount paid cannot exceed the total price.");
        return;
      }

      // Determine status
      let status = "paid";
      if (calculatedTotalPrice > amountPaidNum) {
        status = "loan"; // ⭐ Set status to 'loan' if there's a remaining balance
      }

      // Prepare data to submit, including _id and cooperativeId
      const dataToSubmit = {
        _id: formData._id, // Include the _id for update operation
        userId: formData.userId,
        productId: formData.productId,
        seasonId: formData.seasonId,
        quantity: quantityNum,
        unitPrice: unitPriceNum,
        amountPaid: amountPaidNum,
        totalPrice: calculatedTotalPrice,
        amountRemaining: calculatedTotalPrice - amountPaidNum,
        status: status,
        interest: status === "loan" ? interestNum : 0, // Only include interest if status is 'loan'
        cooperativeId: cooperativeId, // ⭐ Crucially, add cooperativeId here
      };

      onSubmit(dataToSubmit);
    },
    [formData, onSubmit, cooperativeId]
  );

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  }, []);

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle onClose={onClose}>Update Purchase</StyledDialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ height: 200 }}
          >
            <CircularProgress />
            <Typography variant="subtitle1" sx={{ ml: 2 }}>
              Loading data...
            </Typography>
          </Grid>
        ) : (
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Member"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  // disabled when data is loading to prevent changing a selected item prematurely
                  disabled={loading}
                >
                  <MenuItem value="">Select a member</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.names}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Product"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  disabled={loading}
                >
                  <MenuItem value="">Select a product</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.productName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Season"
                  name="seasonId"
                  value={formData.seasonId}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  disabled={loading}
                >
                  <MenuItem value="">Select a season</MenuItem>
                  {seasons.map((season) => (
                    <MenuItem key={season._id} value={season._id}>
                      {season.name} ({season.year})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  inputProps={{ min: "0" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Unit Price"
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  inputProps={{ min: "0" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Total Amount"
                  value={formatCurrency(totalAmount)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Amount Paid"
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  size="small"
                  inputProps={{ min: "0" }}
                />
              </Grid>

              {totalAmount > (parseFloat(formData.amountPaid) || 0) && (
                <Grid item xs={12}>
                  <TextField
                    label="Loan Interest (%)"
                    type="number"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ min: "0", max: "100" }}
                    helperText="Enter interest rate if a balance remains (loan)"
                  />
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          padding: 2,
          borderTop: `1px solid ${(theme) => theme.palette.divider}`,
        }}
      >
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
}
