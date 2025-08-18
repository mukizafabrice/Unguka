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
  Grid,
} from "@mui/material";

import { fetchProducts } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

const AddPurchaseOutModal = ({ show, onClose, onSubmit, cooperativeId }) => {
  const [formData, setFormData] = useState({
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
  });

  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Corrected Effect:
  // This useEffect will now only run if 'show' is true AND 'cooperativeId' has a value.
  useEffect(() => {
    const loadDependencies = async () => {
      // This check is still good, but the dependency array change makes it less likely to fire.
      if (!cooperativeId) {
        toast.error(
          "Cooperative ID is missing. Cannot load products or seasons."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [productsResponse, seasonsResponse] = await Promise.all([
          fetchProducts(cooperativeId),
          fetchSeasons(cooperativeId),
        ]);

        if (productsResponse.success && Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data);
        } else {
          console.error("Failed to fetch products:", productsResponse.message);
          toast.error(productsResponse.message || "Failed to load products.");
          setProducts([]);
        }

        if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
          setSeasons(seasonsResponse.data);
        } else {
          console.error("Failed to fetch seasons:", seasonsResponse.message);
          toast.error(seasonsResponse.message || "Failed to load seasons.");
          setSeasons([]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch modal dependencies (catch block):",
          error
        );
        toast.error(
          "An unexpected error occurred while loading products or seasons."
        );
        setProducts([]);
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };

    if (show && cooperativeId) {
      loadDependencies();
    }
  }, [show, cooperativeId]); // The key change is here: the effect now depends on both 'show' and 'cooperativeId'.

  // Reset form data when the modal is shown
  useEffect(() => {
    if (show) {
      setFormData({
        productId: "",
        seasonId: "",
        quantity: "",
        unitPrice: "",
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = ["quantity", "unitPrice"].includes(name)
      ? Number(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    const totalPrice = formData.quantity * formData.unitPrice;

    // The data sent to the onSubmit prop is correct, as confirmed by your database log.
    onSubmit({
      ...formData,
      totalPrice,
      cooperativeId,
    });
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-purchase-out-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="add-purchase-out-dialog-title">
        <Typography variant="h6" component="span">
          Add New Purchase
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="productId-label">Product</InputLabel>
                  <Select
                    labelId="productId-label"
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    label="Product"
                    onChange={handleChange}
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
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="seasonId-label">Season</InputLabel>
                  <Select
                    labelId="seasonId-label"
                    id="seasonId"
                    name="seasonId"
                    value={formData.seasonId}
                    label="Season"
                    onChange={handleChange}
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
                  inputProps={{ min: "1", step: "0.01" }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
            Add Purchase
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPurchaseOutModal;
