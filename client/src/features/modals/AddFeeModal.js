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
  cooperatives,
}) {
  const [formData, setFormData] = useState({
    cooperativeId: "", // Added cooperativeId to form data
    userId: "",
    seasonId: "",
    feeTypeId: "",
    paymentAmount: "",
  });

  const [amountToPay, setAmountToPay] = useState(0);

  // Reset form state and amount to pay when the modal is shown
  useEffect(() => {
    if (show) {
      setFormData({
        cooperativeId: "", // Reset cooperativeId
        userId: "",
        seasonId: "",
        feeTypeId: "",
        paymentAmount: "",
      });
      setAmountToPay(0);
    }
  }, [show]);

  // Effect to update the default payment amount when a fee type is selected
  useEffect(() => {
    if (formData.feeTypeId && feeTypes.length > 0) {
      const selectedFeeType = feeTypes.find(
        (ft) => ft._id === formData.feeTypeId
      );
      if (selectedFeeType) {
        setAmountToPay(selectedFeeType.amount);
        setFormData((prev) => ({
          ...prev,
          paymentAmount: selectedFeeType.amount,
        }));
      }
    } else {
      setAmountToPay(0);
      setFormData((prev) => ({
        ...prev,
        paymentAmount: "",
      }));
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

    // Basic form validation
    if (
      !formData.cooperativeId || // Validate cooperativeId
      !formData.userId ||
      !formData.seasonId ||
      !formData.feeTypeId ||
      formData.paymentAmount === ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Call the onSubmit function from the parent component
    onSubmit({
      ...formData,
      paymentAmount: Number(formData.paymentAmount),
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
          {/* Cooperative Selection */}
          <FormControl fullWidth required>
            <InputLabel id="cooperative-label">Cooperative</InputLabel>
            <Select
              labelId="cooperative-label"
              id="cooperativeId"
              name="cooperativeId"
              value={formData.cooperativeId}
              onChange={handleChange}
              label="Cooperative"
            >
              <MenuItem value="">Select Cooperative</MenuItem>
              {cooperatives &&
                cooperatives.map((coop) => (
                  <MenuItem key={coop._id} value={coop._id}>
                    {coop.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

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
                users.map((user) => (
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

          {/* Display Standard Amount if applicable */}
          {amountToPay > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Standard Amount:{" "}
              {new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: "RWF",
              }).format(amountToPay)}
            </Typography>
          )}

          {/* Payment Amount Input */}
          <TextField
            label="Payment Amount"
            type="number"
            id="paymentAmount"
            name="paymentAmount"
            value={formData.paymentAmount}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: "0", step: "0.01" }} // Ensure minimum value is 0 and allows decimals
          />
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
