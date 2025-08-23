import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  Box,
  styled,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

import { fetchSeasons } from "../../services/seasonService";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  if (
    !theme ||
    !theme.palette ||
    !theme.palette.grey ||
    !theme.palette.divider
  ) {
    return {
      backgroundColor: "#fafafa",
      borderBottom: `1px solid #e0e0e0`,
      "& .MuiTypography-root": {
        fontWeight: 600,
      },
    };
  }
  return {
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
    "& .MuiTypography-root": {
      fontWeight: 600,
    },
  };
});

const getInitialPurchaseState = () => ({
  userId: "",
  productId: "",
  seasonId: "",
  quantity: "",
  unitPrice: "",
  amountPaid: "",
  interest: "",
  totalAmount: 0,
});

export default function AddPurchaseInputModal({
  show,
  onClose,
  onSubmit, // This should now handle a single purchase object
  cooperativeId,
}) {
  const [purchases, setPurchases] = useState([getInitialPurchaseState()]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load data (users, products, seasons) when the modal opens
  const loadModalData = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot load form data.");
      return;
    }
    setLoading(true);
    try {
      const [usersResponse, productsResponse, seasonsResponse] =
        await Promise.all([
          fetchUsers(cooperativeId),
          fetchProducts(cooperativeId),
          fetchSeasons(cooperativeId),
        ]);

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
  }, [cooperativeId]);

  useEffect(() => {
    if (show) {
      loadModalData();
      setPurchases([getInitialPurchaseState()]); // Reset to a single empty form
      setErrors({}); // Clear errors
    }
  }, [show, loadModalData]);

  const handleChange = useCallback(
    (e, index) => {
      const { name, value } = e.target;
      const list = [...purchases];
      list[index][name] = value;

      const quantity = parseFloat(list[index].quantity) || 0;
      const unitPrice = parseFloat(list[index].unitPrice) || 0;
      const amountPaid = parseFloat(list[index].amountPaid) || 0;

      list[index].totalAmount = quantity * unitPrice;
      if (list[index].totalAmount <= amountPaid) {
        list[index].interest = "";
      }

      setPurchases(list);

      if (errors[`${name}-${index}`]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[`${name}-${index}`];
          return newErrors;
        });
      }
    },
    [purchases, errors]
  );

  const handleAddPurchase = useCallback(() => {
    setPurchases([...purchases, getInitialPurchaseState()]);
  }, [purchases]);

  const handleRemovePurchase = useCallback(
    (index) => {
      if (purchases.length === 1) {
        toast.info("At least one purchase entry is required.");
        return;
      }
      const list = [...purchases];
      list.splice(index, 1);
      setPurchases(list);
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.endsWith(`-${index}`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    },
    [purchases]
  );

  const validate = useCallback(() => {
    let tempErrors = {};
    let isValid = true;
    purchases.forEach((purchase, index) => {
      if (!purchase.userId) {
        tempErrors[`userId-${index}`] = "Member is required.";
        isValid = false;
      }
      if (!purchase.productId) {
        tempErrors[`productId-${index}`] = "Product is required.";
        isValid = false;
      }
      if (!purchase.seasonId) {
        tempErrors[`seasonId-${index}`] = "Season is required.";
        isValid = false;
      }
      const quantityNum = parseFloat(purchase.quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        tempErrors[`quantity-${index}`] = "Quantity must be a positive number.";
        isValid = false;
      }
      const unitPriceNum = parseFloat(purchase.unitPrice);
      if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
        tempErrors[`unitPrice-${index}`] =
          "Unit price must be a positive number.";
        isValid = false;
      }
      const amountPaidNum = parseFloat(purchase.amountPaid);
      if (isNaN(amountPaidNum) || amountPaidNum < 0) {
        tempErrors[`amountPaid-${index}`] =
          "Amount paid must be a non-negative number.";
        isValid = false;
      }
      if (amountPaidNum > quantityNum * unitPriceNum) {
        tempErrors[`amountPaid-${index}`] =
          "Amount paid cannot exceed total price.";
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  }, [purchases]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast.error("Please fill in all required fields and correct errors.");
        return;
      }
      const purchasesToSubmit = purchases.map((purchase) => {
        const calculatedTotalPrice =
          parseFloat(purchase.quantity) * parseFloat(purchase.unitPrice);
        const amountPaidNum = parseFloat(purchase.amountPaid) || 0;
        const status = calculatedTotalPrice > amountPaidNum ? "loan" : "paid";
        return {
          ...purchase,
          quantity: parseFloat(purchase.quantity),
          unitPrice: parseFloat(purchase.unitPrice),
          amountPaid: amountPaidNum,
          totalPrice: calculatedTotalPrice,
          amountRemaining: calculatedTotalPrice - amountPaidNum,
          status,
          interest: status === "loan" ? parseFloat(purchase.interest) || 0 : 0,
          cooperativeId,
        };
      });

      console.log("Submitting purchases:", purchasesToSubmit);
      try {
        // ⭐ THE KEY FIX: Loop through each purchase and call onSubmit individually
        for (const purchase of purchasesToSubmit) {
          await onSubmit(purchase);
        }

        toast.success("All purchases saved successfully!");
        onClose();
      } catch (error) {
        toast.error(error.message || "Failed to save one or more purchases.");
        console.error("Error saving purchases:", error);
      }
    },
    [purchases, cooperativeId, onSubmit, onClose, validate]
  );

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>Add New Purchases</StyledDialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          {loading ? (
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{ height: 200 }}
            >
              <CircularProgress />
              <Typography variant="subtitle1" sx={{ ml: 2 }}>
                Loading data...
              </Typography>
            </Stack>
          ) : (
            purchases.map((purchase, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #e0e0e0",
                  p: 2,
                  mb: 3,
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "text.primary", fontWeight: "bold", mb: 1 }}
                >
                  Purchase #{index + 1}
                </Typography>
                {purchases.length > 1 && (
                  <IconButton
                    aria-label="remove purchase"
                    color="error"
                    size="small"
                    onClick={() => handleRemovePurchase(index)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <TextField
                    select
                    label="Member"
                    name="userId"
                    value={purchase.userId}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    error={!!errors[`userId-${index}`]}
                    helperText={errors[`userId-${index}`]}
                  >
                    <MenuItem value="">Select a member</MenuItem>
                    {users
                      .filter((user) => user.role === "member")
                      .map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.names}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    select
                    label="Product"
                    name="productId"
                    value={purchase.productId}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    error={!!errors[`productId-${index}`]}
                    helperText={errors[`productId-${index}`]}
                  >
                    <MenuItem value="">Select a product</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.productName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Season"
                    name="seasonId"
                    value={purchase.seasonId}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    error={!!errors[`seasonId-${index}`]}
                    helperText={errors[`seasonId-${index}`]}
                  >
                    <MenuItem value="">Select a season</MenuItem>
                    {seasons.map((season) => (
                      <MenuItem key={season._id} value={season._id}>
                        {season.name} ({season.year})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Quantity"
                    type="number"
                    name="quantity"
                    value={purchase.quantity}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    inputProps={{ min: "0" }}
                    error={!!errors[`quantity-${index}`]}
                    helperText={errors[`quantity-${index}`]}
                  />

                  <TextField
                    label="Unit Price"
                    type="number"
                    name="unitPrice"
                    value={purchase.unitPrice}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    inputProps={{ min: "0" }}
                    error={!!errors[`unitPrice-${index}`]}
                    helperText={errors[`unitPrice-${index}`]}
                  />

                  <TextField
                    label="Total Amount"
                    value={`RWF ${purchase.totalAmount.toFixed(2)}`}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />

                  <TextField
                    label="Amount Paid"
                    type="number"
                    name="amountPaid"
                    value={purchase.amountPaid}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    required
                    size="small"
                    inputProps={{ min: "0" }}
                    error={!!errors[`amountPaid-${index}`]}
                    helperText={errors[`amountPaid-${index}`]}
                  />

                  {purchase.totalAmount >
                    (parseFloat(purchase.amountPaid) || 0) && (
                    <TextField
                      label="Loan Interest (%)"
                      type="number"
                      name="interest"
                      value={purchase.interest}
                      onChange={(e) => handleChange(e, index)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ min: "0", max: "100" }}
                      helperText="Enter interest rate if a balance remains (loan)"
                    />
                  )}
                </Stack>
              </Box>
            ))
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddPurchase}
            sx={{ mt: 2 }}
          >
            Add Another Purchase
          </Button>
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
          <Button type="submit" variant="contained" color="primary">
            Save All Purchases
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
