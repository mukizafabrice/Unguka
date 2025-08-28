import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";

// Assuming these are available from the parent or a global utility
// function formatCurrency(amount) {
//   return new Intl.NumberFormat("en-RW", {
//     style: "currency",
//     currency: "RWF",
//   }).format(amount || 0);
// }

function PayFeeModal({ show, onClose, onSubmit, feeToPay, formatCurrency }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or feeToPay changes
  useEffect(() => {
    if (show) {
      setPaymentAmount("");
      setErrors({});
    }
  }, [show, feeToPay]);

  const remainingAmount = feeToPay
    ? feeToPay.amountOwed - feeToPay.amountPaid
    : 0;

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      tempErrors.paymentAmount = "Payment amount must be a positive number.";
      isValid = false;
    } else if (amount > remainingAmount) {
      tempErrors.paymentAmount = `Payment amount cannot exceed the remaining balance (${formatCurrency(
        remainingAmount
      )}).`;
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSubmit(feeToPay._id, parseFloat(paymentAmount));
        onClose(); // Close modal on successful submission
      } catch (error) {
        // Error handling is usually done in the parent component's onSubmit handler
        // But we can add a generic catch here if parent doesn't handle specific errors.
        console.error("Error submitting payment in modal:", error);
        toast.error("Failed to record payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Payment for Fee</DialogTitle>
      <Divider />
      <DialogContent>
        {feeToPay ? (
          <Box mb={2}>
            <Typography variant="body1">
              <strong>User:</strong> {feeToPay.userId?.names || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Fee Type:</strong> {feeToPay.feeTypeId?.name || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Season:</strong> {feeToPay.seasonId?.name || "N/A"} (
              {feeToPay.seasonId?.year || "N/A"})
            </Typography>
            <Typography variant="body1">
              <strong>Amount Owed:</strong>{" "}
              {formatCurrency(feeToPay.amountOwed)}
            </Typography>
            <Typography variant="body1">
              <strong>Amount Paid:</strong>{" "}
              {formatCurrency(feeToPay.amountPaid)}
            </Typography>
            <Typography variant="h6" color="primary" mt={1}>
              <strong>Remaining Balance:</strong>{" "}
              {formatCurrency(remainingAmount)}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">No fee selected for payment.</Typography>
        )}

        <TextField
          label="Payment Amount"
          variant="outlined"
          fullWidth
          margin="normal"
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          error={!!errors.paymentAmount}
          helperText={errors.paymentAmount}
          disabled={isSubmitting || !feeToPay}
          inputProps={{ min: 0.01, step: 0.01 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting || !feeToPay}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting ? "Processing..." : "Record Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PayFeeModal;
