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
} from "@mui/material"; // Imported Material-UI components

function UpdateProductModal({ show, onClose, onSubmit, productData }) {
  const [form, setForm] = useState({ productName: "" });

  useEffect(() => {
    // Populate form with productData when modal is shown or productData changes
    if (show && productData) {
      setForm({
        productName: productData.productName || "",
        _id: productData._id, // Keep the _id for update operation
      });
    } else if (!show) {
      // Reset form when modal closes
      setForm({ productName: "" });
    }
  }, [show, productData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.productName.trim()) {
      toast.error("Product Name is required.");
      return;
    }

    onSubmit(form); // Pass the entire form object including _id
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="update-product-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="update-product-dialog-title">
        <Typography variant="h6" component="span">
          Update Product
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              autoFocus // Focus on this field when modal opens
              margin="dense"
              id="productName"
              label="Product Name"
              type="text"
              name="productName" // Make sure name matches state key
              fullWidth
              variant="outlined"
              value={form.productName}
              onChange={handleChange}
              required
            />
          </Box>
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

export default UpdateProductModal;
