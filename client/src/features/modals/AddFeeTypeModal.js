import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  FormGroup,
  Box,
  Typography,
} from "@mui/material";

/**
 * @typedef {Object} AddFeeTypeModalProps
 * @property {boolean} show - Controls the visibility of the modal.
 * @property {function} onClose - Function to call when the modal is closed.
 * @property {function(Object): void} onSubmit - Function to call when the form is submitted.
 */


function AddFeeTypeModal({ show, onClose, onSubmit }) {
  // State to hold the form data
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
    status: "active", // Default status
    isPerSeason: true, // Default to true
    autoApplyOnCreate: true, // Default to true
  });

  // Reset form state when the modal is opened
  useEffect(() => {
    if (show) {
      setFormData({
        name: "",
        amount: "",
        description: "",
        status: "active",
        isPerSeason: true,
        autoApplyOnCreate: true,
      });
    }
  }, [show]);

  /**
   * Handles changes in form input fields.
   * @param {Event} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Handle different input types: number for amount, boolean for switches
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox" // For Switch components, use 'checked'
          ? checked
          : value,
    }));
  };

  /**
   * Handles the form submission.
   * Performs basic validation before calling the onSubmit prop.
   * @param {Event} e - The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Fee Type Name is required.");
      return;
    }
    if (
      formData.amount === "" ||
      isNaN(formData.amount) ||
      formData.amount < 0
    ) {
      toast.error("Amount must be a non-negative number.");
      return;
    }

    // Call the onSubmit prop with the form data
    onSubmit(formData);
    // Modal will close via the parent component's state change after successful submission
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-fee-type-modal-title"
      PaperProps={{
        sx: {
          borderRadius: 2, // Apply rounded corners to the modal paper
        },
      }}
      fullWidth
      maxWidth="sm" // Adjust maximum width for responsiveness
    >
      <DialogTitle id="add-fee-type-modal-title" sx={{ pb: 1.5 }}>
        <Typography variant="h6" component="span">
          Add New Fee Type
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pt: 1.5 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Name Input */}
            <TextField
              autoFocus // Automatically focus this field when modal opens
              margin="dense"
              id="name"
              name="name"
              label="Fee Type Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              size="small"
              inputProps={{ maxLength: 100 }} // Limit name length
            />

            {/* Amount Input */}
            <TextField
              margin="dense"
              id="amount"
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.amount}
              onChange={handleChange}
              required
              size="small"
              inputProps={{ min: "0", step: "0.01" }} // Allow decimal amounts
              helperText="Enter a non-negative amount (e.g., 5000, 25.50)"
            />

            {/* Description Textarea */}
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description (Optional)"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              size="small"
              inputProps={{ maxLength: 500 }} // Limit description length
            />

            {/* Status Select */}
            <FormControl fullWidth margin="dense" size="small">
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
            </FormControl>

            {/* Is Per Season Switch */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPerSeason}
                    onChange={handleChange}
                    name="isPerSeason"
                    color="primary"
                  />
                }
                label="Is Per Season?"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4 }}
              >
                If enabled, this fee might be applied on a seasonal basis.
              </Typography>
            </FormGroup>

            {/* Auto Apply on Create Switch */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyOnCreate}
                    onChange={handleChange}
                    name="autoApplyOnCreate"
                    color="primary"
                  />
                }
                label="Auto-apply to All Members on Creation?"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4 }}
              >
                If enabled, this fee will automatically be assigned to all
                existing members when created.
              </Typography>
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Fee Type
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddFeeTypeModal;
