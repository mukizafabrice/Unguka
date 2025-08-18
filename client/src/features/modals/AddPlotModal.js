import React, { useEffect, useState } from "react";
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
  CircularProgress, // For loading states in dropdowns
  Alert, // For displaying load errors
} from "@mui/material"; // ⭐ Imported Material-UI components

// ⭐ Import from updated service files
import { fetchUsers } from "../../services/userService"; // Now expected to be a named export
import { fetchProducts } from "../../services/productService"; // Corrected to fetchProducts (plural)

// Pass cooperativeId as a prop to correctly filter members and products
const AddPlotModal = ({ show, onClose, onSave, cooperativeId }) => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]); // Will still fetch, but not used in UI

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false); // For product dropdown
  const [dataLoadError, setDataLoadError] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    // productId: "", // ⭐ REMOVED productId as per Plot model update
    size: "", // ⭐ CHANGED area to size as per Plot model update
    upi: "",
  });

  // Fetch dropdown data (users and products)
  useEffect(() => {
    const loadDropdownData = async () => {
      if (!cooperativeId) {
        setDataLoadError("Cooperative ID is missing, cannot load members.");
        setLoadingUsers(false);
        setLoadingProducts(false);
        return;
      }
      setLoadingUsers(true);
      setLoadingProducts(true);
      setDataLoadError(null); // Reset error on new load attempt

      try {
        // Fetch all users and then filter by cooperativeId and role 'member'
        const usersResponse = await fetchUsers(); // This fetches all users
        if (usersResponse.success && Array.isArray(usersResponse.data)) {
          // Adjust based on your userService response structure
          // Filter users by cooperativeId and role "member" to show relevant members
          const filteredMembers = usersResponse.data.filter(
            (user) =>
              String(user.cooperativeId?._id) === String(cooperativeId) &&
              user.role === "member"
          );

          setUsers(filteredMembers);
          console.log(filteredMembers);
        } else {
          setDataLoadError(usersResponse.message || "Failed to load members.");
        }
      } catch (err) {
        console.error("Failed to load users for add plot modal:", err);
        setDataLoadError("Failed to load members for dropdown.");
      } finally {
        setLoadingUsers(false);
      }

      // Products are no longer directly associated with a plot,
      // but if you have other uses for them, you can keep fetching.
      // For this modal, the dropdown for products is removed.
      try {
        const productsResponse = await fetchProducts(cooperativeId);
        if (productsResponse.success && Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data); // Store products if needed elsewhere
        } else {
          // You might not need to show an error for products if the dropdown is gone
          console.warn(
            "Failed to load products for add plot modal:",
            productsResponse.message
          );
        }
      } catch (err) {
        console.error(
          "Failed to load products for add plot modal (catch block):",
          err
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    if (show) {
      loadDropdownData();
      // Reset form data when modal opens
      setFormData({
        userId: "",
        size: "",
        upi: "",
      });
    }
  }, [show, cooperativeId]); // Depend on show and cooperativeId

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // ⭐ Basic form validation
    if (
      !formData.userId ||
      !String(formData.size).trim() ||
      !formData.upi.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // Ensure size is a valid positive number
    const parsedSize = parseFloat(formData.size);
    if (isNaN(parsedSize) || parsedSize <= 0) {
      toast.error("Size must be a positive number.");
      return;
    }

    onSave(formData); // Pass data to parent component
    // onClose() is typically called by the parent after onSubmit confirms success.
    // For this example, we keep it here for immediate modal closure.
    onClose();
  };

  // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-plot-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-plot-dialog-title">
        <Typography variant="h6" component="span">
          Add New Plot
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {dataLoadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dataLoadError}
            </Alert>
          )}

          {/* User (Member) Dropdown */}
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required>
            <InputLabel id="user-select-label">User (Member)</InputLabel>
            <Select
              labelId="user-select-label"
              id="userId"
              name="userId"
              value={formData.userId}
              label="User (Member)"
              onChange={handleChange}
              disabled={loadingUsers || dataLoadError} // Disable while loading or on error
            >
              {loadingUsers ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading
                  members...
                </MenuItem>
              ) : users.length > 0 ? (
                [
                  <MenuItem key="select-user-placeholder" value="">
                    Select User
                  </MenuItem>,
                  ...users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.names}
                    </MenuItem>
                  )),
                ]
              ) : (
                <MenuItem disabled>
                  No members found for this cooperative.
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* ⭐ REMOVED Product Dropdown as productId is removed from Plot model */}
          {/* Size Input Field (formerly Area) */}
          <TextField
            autoFocus // Focus on this field when modal opens
            margin="dense"
            id="size" // ⭐ CHANGED id from area to size
            label="Size (e.g., in sq. meters)"
            type="number"
            fullWidth
            variant="outlined"
            name="size" // ⭐ CHANGED name from area to size
            value={formData.size}
            onChange={handleChange}
            required
            inputProps={{ min: "0.01", step: "0.01" }} // Ensure positive decimal values
            sx={{ mb: 2 }}
          />

          {/* UPI Input Field */}
          <TextField
            margin="dense"
            id="upi"
            label="UPI (Unique Plot Identifier)"
            type="text"
            fullWidth
            variant="outlined"
            name="upi"
            value={formData.upi}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Plot
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPlotModal;
