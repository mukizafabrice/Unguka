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
  feeToEdit, // The fee object to be edited
  users,
  seasons,
  feeTypes,
  cooperativeId, // Cooperative ID from parent (from token)
  cooperativeName, // ⭐ NEW: Cooperative Name from parent (from DB fetch)
}) {
  const [formData, setFormData] = useState({
    userId: "",
    seasonId: "",
    feeTypeId: "",
    amountOwed: "",
    amountPaid: "",
    status: "",
  });

  // Populate form data when feeToEdit changes
  useEffect(() => {
    if (show && feeToEdit) {
      setFormData({
        userId: feeToEdit.userId?._id || feeToEdit.userId, // Handle populated or unpopulated
        seasonId: feeToEdit.seasonId?._id || feeToEdit.seasonId,
        feeTypeId: feeToEdit.feeTypeId?._id || feeToEdit.feeTypeId,
        amountOwed: feeToEdit.amountOwed || "",
        amountPaid: feeToEdit.amountPaid || "",
        status: feeToEdit.status || "",
      });
    }
  }, [show, feeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.userId ||
      !formData.seasonId ||
      !formData.feeTypeId ||
      formData.amountPaid === "" ||
      !formData.status
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    onSubmit(feeToEdit._id, {
      // Pass the ID of the fee being edited
      ...formData,
      cooperativeId: cooperativeId, // Ensure cooperativeId is included from prop
      amountPaid: Number(formData.amountPaid),
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
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* ⭐ DISPLAY: Cooperative Name (disabled field) */}
          <TextField
            label="Cooperative"
            value={cooperativeName || "N/A"}
            fullWidth
            disabled // Make it read-only
            sx={{ mb: 2 }}
          />

          {/* User Display (read-only in update) */}
          <TextField
            label="User"
            value={users.find((u) => u._id === formData.userId)?.names || "N/A"}
            fullWidth
            disabled
          />
          {/* Season Display (read-only in update) */}
          <TextField
            label="Season"
            value={
              seasons.find((s) => s._id === formData.seasonId)?.name || "N/A"
            }
            fullWidth
            disabled
          />
          {/* Fee Type Display (read-only in update) */}
          <TextField
            label="Fee Type"
            value={
              feeTypes.find((ft) => ft._id === formData.feeTypeId)?.name ||
              "N/A"
            }
            fullWidth
            disabled
          />

          {/* Amount Owed Display (read-only) */}
          <TextField
            label="Amount Owed"
            type="number"
            value={formData.amountOwed}
            fullWidth
            disabled
          />

          {/* Amount Paid Input (editable) */}
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
          />

          {/* Status Selection (editable) */}
          <FormControl fullWidth required>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="unpain">Unpaid</MenuItem>
              <MenuItem value="partial">Partially Paid</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Fee
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateFeeModal;
