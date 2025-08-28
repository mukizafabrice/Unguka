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
} from "@mui/material"; // ⭐ Imported Material-UI components

function AddProductModal({ show, onClose, onSubmit }) {
  const [productName, setProductName] = useState("");
 
  // useEffect(() => {
  //   if (show) {
  //     document.body.classList.add("modal-open");
  //   } else {
  //     document.body.classList.remove("modal-open");
  //   }
  //   return () => {
  //     document.body.classList.remove("modal-open");
  //   };
  // }, [show]);

  useEffect(() => {
    // Reset product name when modal is shown
    if (show) {
      setProductName("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      // ⭐ Added .trim() for better validation
      toast.error("Product Name is required.");
      return;
    }

    onSubmit({ productName });
    // Note: setProductName('') is typically handled by parent component
    // after successful submission and modal close, but can be here too.
    // For now, it remains as per original logic.
    setProductName(""); // Reset input after submission attempt
  };

  // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="add-product-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-product-dialog-title">
        <Typography variant="h6" component="span">
          Add New Product
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {" "}
          {/* Added dividers for visual separation */}
          <Box mb={2}>
            {" "}
            {/* Added Box for spacing */}
            <TextField
              autoFocus // Focus on this field when modal opens
              margin="dense"
              id="productName"
              label="Product Name"
              type="text"
              fullWidth
              variant="outlined"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required // HTML5 required attribute
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Product
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddProductModal;
