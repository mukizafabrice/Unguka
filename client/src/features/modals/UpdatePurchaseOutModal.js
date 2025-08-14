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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid, // Import Grid for responsive layout
} from "@mui/material";

// Corrected import: fetchProducts from productService
import { fetchProducts } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService"; // Assuming fetchSeasons also needs cooperativeId

const UpdatePurchaseOutModal = ({
  show,
  onClose,
  onSubmit,
  purchaseOut,
  cooperativeId,
}) => {
  // State for the form data, initialized with the purchaseOut prop
  const [formData, setFormData] = useState({
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
  });

  // States to hold fetched data and loading status
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to populate form data when the `purchaseOut` prop changes or modal opens
  // and to fetch products/seasons for the specific cooperative.
  useEffect(() => {
    if (show && purchaseOut) {
      setFormData({
        productId: purchaseOut.productId?._id || "", // Ensure to get the _id if populated
        seasonId: purchaseOut.seasonId?._id || "", // Ensure to get the _id if populated
        quantity: purchaseOut.quantity || "",
        unitPrice: purchaseOut.unitPrice || "",
      });
      setLoading(true);

      const loadDependencies = async () => {
        if (!cooperativeId) {
          toast.error(
            "Cooperative ID is missing. Cannot load products or seasons."
          );
          setLoading(false);
          return;
        }
        try {
          // ⭐ Pass cooperativeId to fetch functions for data segregation
          const [productsResponse, seasonsResponse] = await Promise.all([
            fetchProducts(cooperativeId),
            fetchSeasons(cooperativeId), // Assuming fetchSeasons also accepts cooperativeId
          ]);

          if (
            productsResponse.success &&
            Array.isArray(productsResponse.data)
          ) {
            setProducts(productsResponse.data);
          } else {
            console.error(
              "Failed to fetch products for update modal:",
              productsResponse.message
            );
            toast.error(
              productsResponse.message || "Failed to load products for update."
            );
            setProducts([]);
          }

          if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
            setSeasons(seasonsResponse.data);
          } else {
            console.error(
              "Failed to fetch seasons for update modal:",
              seasonsResponse.message
            );
            toast.error(
              seasonsResponse.message || "Failed to load seasons for update."
            );
            setSeasons([]);
          }
          setLoading(false);
        } catch (error) {
          console.error(
            "Failed to fetch update modal dependencies (catch block):",
            error
          );
          toast.error(
            "An unexpected error occurred while loading products or seasons for update."
          );
          setLoading(false);
          setProducts([]);
          setSeasons([]);
        }
      };
      loadDependencies();
    }
  }, [show, purchaseOut, cooperativeId]); // Depend on show, purchaseOut, and cooperativeId

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

    // Basic validation
    if (
      !formData.productId ||
      !formData.seasonId ||
      !formData.quantity ||
      !formData.unitPrice
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (isNaN(formData.quantity) || formData.quantity <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }

    if (isNaN(formData.unitPrice) || formData.unitPrice <= 0) {
      toast.error("Unit Price must be a positive number.");
      return;
    }

    // Calculate the new totalPrice
    const totalPrice = formData.quantity * formData.unitPrice;

    // Call the parent's onSubmit handler with the ID and updated data, including cooperativeId
    onSubmit(purchaseOut._id, {
      // Use purchaseOut._id to identify the record
      ...formData,
      totalPrice,
      cooperativeId, // ⭐ Ensure cooperativeId is included for backend authorization
    });
  };

  return (
    // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-purchase-out-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="update-purchase-out-dialog-title">
        <Typography variant="h6" component="span">
          Update Purchase
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {" "}
          {/* Added dividers for visual separation */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <CircularProgress color="primary" />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading products and seasons...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {" "}
              {/* Use Grid for responsive layout */}
              <Grid item xs={12} sm={6}>
                {/* Product Dropdown (Disabled as per backend logic) */}
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="productId-label">Product</InputLabel>
                  <Select
                    labelId="productId-label"
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    label="Product"
                    onChange={handleChange}
                    disabled // ⭐ Disabled as product cannot be changed on update (per controller)
                  >
                    <MenuItem value="" disabled>
                      <em>Select a product</em>
                    </MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.productName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Season Dropdown (Disabled as per backend logic) */}
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="seasonId-label">Season</InputLabel>
                  <Select
                    labelId="seasonId-label"
                    id="seasonId"
                    name="seasonId"
                    value={formData.seasonId}
                    label="Season"
                    onChange={handleChange}
                    disabled // ⭐ Disabled as season cannot be changed on update (per controller)
                  >
                    <MenuItem value="" disabled>
                      <em>Select a season</em>
                    </MenuItem>
                    {seasons.map((season) => (
                      <MenuItem key={season._id} value={season._id}>
                        {season.name} ({season.year})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Quantity Input */}
                <TextField
                  margin="dense"
                  id="quantity"
                  label="Quantity"
                  type="number"
                  name="quantity"
                  fullWidth
                  variant="outlined"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: "1", step: "0.01" }} // Allow decimals for quantity if needed
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Unit Price Input */}
                <TextField
                  margin="dense"
                  id="unitPrice"
                  label="Unit Price"
                  type="number"
                  name="unitPrice"
                  fullWidth
                  variant="outlined"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  inputProps={{ min: "0", step: "0.01" }}
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdatePurchaseOutModal;
