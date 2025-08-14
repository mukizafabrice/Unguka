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
} from "@mui/material"; // ⭐ Imported Material-UI components
import { toast } from "react-toastify"; // For toast notifications

// Pass cooperativeId as a prop, as expected by the parent Season component
const AddSeasonModal = ({ show, onClose, onSubmit, cooperativeId }) => {
  // ⭐ Added cooperativeId prop
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    // cooperativeId: "", // Will be added directly in handleSubmit from prop
  });
  const [errors, setErrors] = useState({}); // State for validation errors

  // Effect to reset form data and errors when the modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        name: "",
        year: "",
      });
      setErrors({}); // Reset errors
    }
  }, [show]);

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

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // ⭐ Add cooperativeId to the data before submitting
      const dataToSubmit = { ...formData, cooperativeId };
      onSubmit(dataToSubmit); // Call parent's onSubmit
      // onClose() will typically be called by the parent after onSubmit confirms success.
      // For this example, we keep it here for immediate modal closure.
      onClose();
    } else {
      toast.error("Please correct the form errors."); // Notify user of validation errors
    }
  };

  return (
    // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-season-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-season-dialog-title">
        <Typography variant="h6" component="span">
          Add New Season
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
            autoFocus // Focus on this field when modal opens
            margin="dense"
            id="year"
            label="Year (YYYY)"
            type="number" // Use type="number" for better input handling, but ensure pattern check
            fullWidth
            variant="outlined"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            inputProps={{ minLength: 4, maxLength: 4 }} // Restrict to 4 digits visually
            error={!!errors.year}
            helperText={errors.year}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Season
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSeasonModal;
