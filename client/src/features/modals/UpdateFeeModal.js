import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function UpdateFeeModal({
  show,
  onClose,
  onSubmit,
  feeToEdit,
  users,
  seasons,
  feeTypes,
  cooperatives,
}) {
  const [formData, setFormData] = useState({
    _id: "",
    amountOwed: "",
    amountPaid: "",
    status: "",
    // Add cooperativeId here for consistency, though it's disabled for editing
    cooperativeId: "",
  });

  // Populate form data when modal is shown or feeToEdit changes
  useEffect(() => {
    if (show && feeToEdit) {
      setFormData({
        _id: feeToEdit._id,
        amountOwed: feeToEdit.amountOwed,
        amountPaid: feeToEdit.amountPaid,
        status: feeToEdit.status,
        cooperativeId: feeToEdit.cooperativeId?._id || feeToEdit.cooperativeId, // Ensure we get the ID
      });
    }
  }, [show, feeToEdit]);

  // If the modal is not visible or there's no fee to edit, don't render
  if (!show || !feeToEdit) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amountOwed || !formData.amountPaid) {
      toast.error("Amount Owed and Amount Paid are required.");
      return;
    }
    if (Number(formData.amountOwed) < 0 || Number(formData.amountPaid) < 0) {
      toast.error("Amounts cannot be negative.");
      return;
    }

    onSubmit(formData._id, {
      amountOwed: Number(formData.amountOwed),
      amountPaid: Number(formData.amountPaid),
      status: formData.status,
      // Pass the cooperativeId back, even though it's not editable, for the update service
      cooperativeId: formData.cooperativeId,
    });
  };

  // Helper to get names from IDs
  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.names : "N/A";
  };

  const getSeasonName = (seasonId) => {
    const season = seasons.find((s) => s._id === seasonId);
    return season ? `${season.name} (${season.year})` : "N/A";
  };

  const getFeeTypeName = (feeTypeId) => {
    const feeType = feeTypes.find((ft) => ft._id === feeTypeId);
    return feeType ? feeType.name : "N/A";
  };

  const getCooperativeName = (cooperativeId) => {
    const cooperative = cooperatives.find((c) => c._id === cooperativeId);
    return cooperative ? cooperative.name : "N/A";
  };

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          Update Fee Record
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Display Cooperative Name (Disabled) */}
          <TextField
            label="Cooperative"
            value={getCooperativeName(
              feeToEdit.cooperativeId?._id || feeToEdit.cooperativeId
            )}
            fullWidth
            disabled
            variant="outlined"
          />

          {/* Display User Name (Disabled) */}
          <TextField
            label="User"
            value={getUserName(feeToEdit.userId?._id || feeToEdit.userId)}
            fullWidth
            disabled
            variant="outlined"
          />

          {/* Display Season Name (Disabled) */}
          <TextField
            label="Season"
            value={getSeasonName(feeToEdit.seasonId?._id || feeToEdit.seasonId)}
            fullWidth
            disabled
            variant="outlined"
          />

          {/* Display Fee Type Name (Disabled) */}
          <TextField
            label="Fee Type"
            value={getFeeTypeName(
              feeToEdit.feeTypeId?._id || feeToEdit.feeTypeId
            )}
            fullWidth
            disabled
            variant="outlined"
          />

          {/* Amount Owed Input */}
          <TextField
            label="Amount Owed"
            type="number"
            id="amountOwed"
            name="amountOwed"
            value={formData.amountOwed}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: "0", step: "0.01" }}
            variant="outlined"
          />

          {/* Amount Paid Input */}
          <TextField
            label="Amount Paid"
            type="number"
            id="amountPaid"
            name="amountPaid"
            value={formData.amountPaid}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: "0", step: "0.01" }}
            variant="outlined"
          />

          {/* Status Selection */}
          <FormControl fullWidth required variant="outlined">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateFeeModal;
