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

function AddFeeModal({
  show,
  onClose,
  onSubmit,
  users,
  seasons,
  feeTypes,
  cooperativeId,
  cooperativeName,
}) {
  const [formData, setFormData] = useState({
    userId: "",
    seasonId: "",
    feeTypeId: "",
  });

  const [amountToPay, setAmountToPay] = useState(0);

  // Reset form state when modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        userId: "",
        seasonId: "",
        feeTypeId: "",
      });
      setAmountToPay(0);
    }
  }, [show]);

  // Update amountToPay when a fee type is selected
  useEffect(() => {
    if (formData.feeTypeId && feeTypes.length > 0) {
      const selectedFeeType = feeTypes.find(
        (ft) => ft._id === formData.feeTypeId
      );
      if (selectedFeeType) {
        setAmountToPay(selectedFeeType.amount);
      }
    } else {
      setAmountToPay(0);
    }
  }, [formData.feeTypeId, feeTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.userId || !formData.seasonId || !formData.feeTypeId) {
      toast.error("Please select User, Season, and Fee Type.");
      return;
    }

    // Submit without paymentAmount (amountPaid/status handled by backend)
    onSubmit({
      ...formData,
      cooperativeId,
    });
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
          Record New Fee
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
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Cooperative Name (read-only) */}
          <TextField
            label="Cooperative"
            value={cooperativeName || "N/A"}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />

          {/* User Selection */}
          <FormControl fullWidth required>
            <InputLabel id="user-label">User</InputLabel>
            <Select
              labelId="user-label"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              label="User"
            >
              <MenuItem value="">Select User</MenuItem>
              {users &&
                users
                  .filter((user) => user.role === "member") // Only members
                  .map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.names}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>

          {/* Season Selection */}
          <FormControl fullWidth required>
            <InputLabel id="season-label">Season</InputLabel>
            <Select
              labelId="season-label"
              id="seasonId"
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              label="Season"
            >
              <MenuItem value="">Select Season</MenuItem>
              {seasons.map((season) => (
                <MenuItem key={season._id} value={season._id}>
                  {season.name} ({season.year})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Fee Type Selection */}
          <FormControl fullWidth required>
            <InputLabel id="feeType-label">Fee Type</InputLabel>
            <Select
              labelId="feeType-label"
              id="feeTypeId"
              name="feeTypeId"
              value={formData.feeTypeId}
              onChange={handleChange}
              label="Fee Type"
            >
              <MenuItem value="">Select Fee Type</MenuItem>
              {feeTypes.map((feeType) => (
                <MenuItem key={feeType._id} value={feeType._id}>
                  {feeType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Display standard amount */}
          {amountToPay > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Standard Amount:{" "}
              {new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: "RWF",
              }).format(amountToPay)}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Record Fee
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddFeeModal;
