import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress, // Added for loading state
} from "@mui/material";
import { toast } from "react-toastify";

// Import named exports from services
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService"; // Corrected from fetchProduct
import { fetchSeasons } from "../../services/seasonService";

const UpdateProductionModal = ({
  show,
  onClose,
  onUpdate,
  initialData,
  cooperativeId,
}) => {
  // ⭐ Added cooperativeId prop
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true); // Loading state for dropdowns

  const [formData, setFormData] = useState({
    _id: "",
    userId: "",
    productId: "",
    seasonId: "",
    quantity: "",
    unitPrice: "",
    totalAmount: 0, // Initialize totalAmount
  });
  const [errors, setErrors] = useState({}); // State for validation errors

  // Effect to manage body class for scroll prevention (MUI Dialog handles this mostly, but good practice)
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Function to load dropdown data (members, products, seasons)
  const loadDropdownData = useCallback(async () => {
    if (!cooperativeId) {
      console.warn(
        "Cooperative ID is not available for fetching dropdown data."
      );
      return;
    }

    setLoadingDropdowns(true);
    try {
      // ⭐ Pass cooperativeId to fetch functions
      const [membersResponse, productsResponse, seasonsResponse] =
        await Promise.all([
          fetchUsers(), // Assuming fetchUsers can filter by cooperativeId or you filter it client-side
          fetchProducts(cooperativeId),
          fetchSeasons(cooperativeId),
        ]);

      if (membersResponse.success && Array.isArray(membersResponse.data)) {
        // Filter members by cooperativeId on the client-side if fetchUsers gets all
        const filteredMembers = membersResponse.data.filter(
          (user) =>
            String(user.cooperativeId?._id || user.cooperativeId) ===
              String(cooperativeId) && user.role === "member"
        );
        
        setMembers(filteredMembers);
      } else {
        console.error("Failed to fetch members:", membersResponse.message);
        toast.error(membersResponse.message || "Failed to load members.");
      }

      if (productsResponse.success && Array.isArray(productsResponse.data)) {
        setProducts(productsResponse.data);
      } else {
        console.error("Failed to fetch products:", productsResponse.message);
        toast.error(productsResponse.message || "Failed to load products.");
      }

      if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
        setSeasons(seasonsResponse.data);
      } else {
        console.error("Failed to fetch seasons:", seasonsResponse.message);
        toast.error(seasonsResponse.message || "Failed to load seasons.");
      }
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      toast.error("An unexpected error occurred while loading form data.");
    } finally {
      setLoadingDropdowns(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (show) {
      loadDropdownData();
      if (initialData) {
        // ⭐ Set totalAmount from initialData or calculate if missing
        const initialQuantity = parseFloat(initialData.quantity) || 0;
        const initialUnitPrice = parseFloat(initialData.unitPrice) || 0;
        setFormData({
          _id: initialData._id || "",
          userId: initialData.userId?._id || "",
          productId: initialData.productId?._id || "",
          seasonId: initialData.seasonId?._id || "",
          quantity: initialData.quantity || "",
          unitPrice: initialData.unitPrice || "",
          totalAmount: initialQuantity * initialUnitPrice,
        });
      }
      setErrors({}); // Clear errors when opening
    }
  }, [show, initialData, loadDropdownData]); // Added loadDropdownData to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Recalculate totalAmount when quantity or unitPrice changes
      if (name === "quantity" || name === "unitPrice") {
        const quantity =
          parseFloat(name === "quantity" ? value : updatedData.quantity) || 0;
        const unitPrice =
          parseFloat(name === "unitPrice" ? value : updatedData.unitPrice) || 0;
        updatedData.totalAmount = quantity * unitPrice;
      }

      return updatedData;
    });

    // Clear specific error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.userId) {
      tempErrors.userId = "Member is required.";
      isValid = false;
    }
    if (!formData.productId) {
      tempErrors.productId = "Product is required.";
      isValid = false;
    }
    if (!formData.seasonId) {
      tempErrors.seasonId = "Season is required.";
      isValid = false;
    }
    if (
      parseFloat(formData.quantity) <= 0 ||
      !Number.isInteger(parseFloat(formData.quantity))
    ) {
      tempErrors.quantity = "Quantity must be a positive integer.";
      isValid = false;
    }
    if (parseFloat(formData.unitPrice) <= 0) {
      tempErrors.unitPrice = "Unit price must be a positive number.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onUpdate(formData); // onUpdate expects the formData object
      // onClose(); // onClose will be called by parent component after successful save
    } else {
      toast.error("Please fill in all required fields and correct errors.");
    }
  };

  return (
    // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-production-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="update-production-dialog-title">
        <Typography variant="h6" component="span">
          Update Production
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {loadingDropdowns ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
          ) : (
            <>
              <FormControl
                fullWidth
                margin="dense"
                sx={{ mb: 2 }}
                required
                error={!!errors.userId}
              >
                <InputLabel id="member-label">Member</InputLabel>
                <Select
                  labelId="member-label"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  label="Member"
                  onChange={handleChange}
                  // Member cannot be changed after creation
                  disabled={true} // Disable member selection for updates
                >
                  <MenuItem value="">Select Member</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.names}
                    </MenuItem>
                  ))}
                </Select>
                {errors.userId && (
                  <Typography variant="caption" color="error">
                    {errors.userId}
                  </Typography>
                )}
              </FormControl>

              <FormControl
                fullWidth
                margin="dense"
                sx={{ mb: 2 }}
                required
                error={!!errors.productId}
              >
                <InputLabel id="product-label">Product</InputLabel>
                <Select
                  labelId="product-label"
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  label="Product"
                  onChange={handleChange}
                  // Product cannot be changed after creation based on productionController
                  disabled={true} // Disable product selection for updates
                >
                  <MenuItem value="">Select Product</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.productName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.productId && (
                  <Typography variant="caption" color="error">
                    {errors.productId}
                  </Typography>
                )}
              </FormControl>

              <FormControl
                fullWidth
                margin="dense"
                sx={{ mb: 2 }}
                required
                error={!!errors.seasonId}
              >
                <InputLabel id="season-label">Season</InputLabel>
                <Select
                  labelId="season-label"
                  id="seasonId"
                  name="seasonId"
                  value={formData.seasonId}
                  label="Season"
                  onChange={handleChange}
                  // Season cannot be changed after creation, typically
                  disabled={true} // Disable season selection for updates
                >
                  <MenuItem value="">Select Season</MenuItem>
                  {seasons.map((season) => (
                    <MenuItem key={season._id} value={season._id}>
                      {season.name} ({season.year})
                    </MenuItem>
                  ))}
                </Select>
                {errors.seasonId && (
                  <Typography variant="caption" color="error">
                    {errors.seasonId}
                  </Typography>
                )}
              </FormControl>

              <TextField
                margin="dense"
                id="quantity"
                label="Quantity"
                type="number"
                fullWidth
                variant="outlined"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />

              <TextField
                margin="dense"
                id="unitPrice"
                label="Unit Price"
                type="number"
                fullWidth
                variant="outlined"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
              />

              <TextField
                margin="dense"
                id="totalAmount"
                label="Total Amount"
                type="text"
                fullWidth
                variant="outlined"
                name="totalAmount"
                value={`RWF ${formData.totalAmount.toFixed(2)}`}
                InputProps={{ readOnly: true }}
                sx={{ mb: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateProductionModal;
