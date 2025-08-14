import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

// Pass cooperativeId as a prop, as expected by the parent Season component
const UpdateSeasonModal = ({
  show,
  onClose,
  onSubmit,
  season,
  cooperativeId,
}) => {
  // Added cooperativeId prop
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    year: "",
    status: "inactive",
    // cooperativeId: "", // Will be added directly in handleSubmit from prop
  });
  const [errors, setErrors] = useState({}); // State for validation errors

  // Effect to populate form fields when the modal opens or selectedSeason changes
  useEffect(() => {
    if (show && season) {
      setFormData({
        _id: season._id || "",
        name: season.name || "",
        year: season.year || "",
        status: season.status || "inactive",
      });
      setErrors({}); // Reset errors when new season data is loaded
    }
  }, [show, season]);

  // If modal is not shown, return null immediately
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Basic client-side validation
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name) {
      tempErrors.name = "Season Name is required.";
      isValid = false;
    }
    if (!formData.year) {
      tempErrors.year = "Year is required.";
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.year)) {
      tempErrors.year = "Year must be a 4-digit number (e.g., 2024).";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      const inputYear = parseInt(formData.year, 10);
      if (inputYear < 2000 || inputYear > currentYear + 5) {
        // Example range: 2000 to 5 years in future
        tempErrors.year = `Year must be between 2000 and ${currentYear + 5}.`;
        isValid = false;
      }
    }
    if (!formData.status) {
      tempErrors.status = "Status is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Add cooperativeId to the data before submitting
      const dataToSubmit = { ...formData, cooperativeId };
      onSubmit(formData._id, dataToSubmit); // Call parent's onSubmit with ID and updated data
      // onClose() will typically be called by the parent after onSubmit confirms success.
      // For this example, we keep it here for immediate modal closure.
      onClose();
    } else {
      toast.error("Please correct the form errors."); // Notify user of validation errors
    }
  };

  return (
    // Replaced plain HTML modal structure with Material-UI Dialog
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-season-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="update-season-dialog-title">
        <Typography variant="h6" component="span">
          Update Season
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* Season Name Dropdown */}
          <FormControl
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
            required
            error={!!errors.name}
          >
            <InputLabel id="season-name-label">Season Name</InputLabel>
            <Select
              labelId="season-name-label"
              id="name"
              name="name"
              value={formData.name}
              label="Season Name"
              onChange={handleChange}
            >
              <MenuItem value="">Select a production season</MenuItem>
              <MenuItem value="Season-A">Season-A</MenuItem>
              <MenuItem value="Season-B">Season-B</MenuItem>
            </Select>
            {errors.name && (
              <Typography variant="caption" color="error">
                {errors.name}
              </Typography>
            )}
          </FormControl>

          {/* Year Input Field */}
          <TextField
            margin="dense"
            id="year"
            label="Year (YYYY)"
            type="number"
            fullWidth
            variant="outlined"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            inputProps={{ minLength: 4, maxLength: 4 }}
            error={!!errors.year}
            helperText={errors.year}
            sx={{ mb: 2 }}
          />

          {/* Status Dropdown */}
          <FormControl
            fullWidth
            margin="dense"
            required
            error={!!errors.status}
          >
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {errors.status && (
              <Typography variant="caption" color="error">
                {errors.status}
              </Typography>
            )}
          </FormControl>
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

export default UpdateSeasonModal;
