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
} from "@mui/material";

// Corrected import for userService and productService (plural)
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService"; // Keeping for reference if needed elsewhere, but not used in UI

// Accept cooperativeId from the parent Plot component
function UpdatePlotModal({
  show,
  onClose,
  onUpdate,
  initialData,
  cooperativeId,
}) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]); // Will still fetch, but not used in UI

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false); // For product dropdown, if re-added
  const [dataLoadError, setDataLoadError] = useState(null);

  const [formData, setFormData] = useState({
    _id: "",
    userId: "",
    // productId: "", // Removed as per Plot model update
    size: "", // Changed 'area' to 'size'
    upi: "",
  });

  // Effect to load users (members) for the dropdown and populate form data
  useEffect(() => {
    const loadDropdownData = async () => {
      if (!cooperativeId) {
        setDataLoadError("Cooperative ID is missing, cannot load members.");
        setLoadingUsers(false);
        setLoadingProducts(false);
        return;
      }
      setLoadingUsers(true);
      setLoadingProducts(true); // Still setting true if products are fetched, even if not used in UI
      setDataLoadError(null);

      try {
        // Fetch users and filter by cooperativeId and 'member' role
        const usersResponse = await fetchUsers();
        if (usersResponse.success && Array.isArray(usersResponse.data.data)) {
          const filteredMembers = usersResponse.data.data.filter(
            (user) =>
              String(user.cooperativeId) === String(cooperativeId) &&
              user.role === "member"
          );
          setUsers(filteredMembers);
        } else {
          setDataLoadError(usersResponse.message || "Failed to load members.");
        }
      } catch (err) {
        console.error("Failed to load users for update plot modal:", err);
        setDataLoadError("Failed to load members for dropdown.");
      } finally {
        setLoadingUsers(false);
      }

      // Products are no longer directly associated with a plot,
      // but if you have other uses for them, you can keep fetching.
      // For this modal, the dropdown for products is removed.
      try {
        const productsResponse = await fetchProducts(cooperativeId); // Passing cooperativeId for filtering
        if (productsResponse.success && Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data); // Store products if needed elsewhere
        } else {
          console.warn(
            "Failed to load products for update plot modal:",
            productsResponse.message
          );
        }
      } catch (err) {
        console.error(
          "Failed to load products for update plot modal (catch block):",
          err
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    // Populate form data when modal opens or initialData changes
    if (show && initialData) {
      setFormData({
        _id: initialData._id || "",
        userId: initialData.userId?._id || "", // Access _id from populated user object
        // productId: initialData.productId?._id || "", // Removed
        size: initialData.size || "", // Changed from area
        upi: initialData.upi || "",
      });
      loadDropdownData(); // Load dropdown data when modal becomes visible
    } else if (!show) {
      // Reset form data when modal closes
      setFormData({
        _id: "",
        userId: "",
        size: "",
        upi: "",
      });
      setDataLoadError(null); // Clear errors
    }
  }, [show, initialData, cooperativeId]); // Depend on show, initialData, and cooperativeId

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic form validation
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

    onUpdate(formData); // Pass data to parent component
    onClose(); // Close modal after update attempt
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-plot-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="update-plot-dialog-title">
        <Typography variant="h6" component="span">
          Update Plot
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
              disabled={loadingUsers || dataLoadError}
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

          {/* REMOVED Product Dropdown as productId is removed from Plot model */}

          {/* Size Input Field (formerly Area) */}
          <TextField
            margin="dense"
            id="size" // Changed from area
            label="Size (e.g., in sq. meters)"
            type="number"
            fullWidth
            variant="outlined"
            name="size" // Changed from area
            value={formData.size}
            onChange={handleChange}
            required
            inputProps={{ min: "0.01", step: "0.01" }}
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
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default UpdatePlotModal;
