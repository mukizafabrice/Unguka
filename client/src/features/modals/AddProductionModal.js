import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Box, // For spacing and layout
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

// Import named exports from services
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService"; // Corrected from fetchProduct
import { fetchSeasons } from "../../services/seasonService";

const AddProductionModal = ({ show, onClose, onSave, cooperativeId }) => { // ⭐ Added cooperativeId prop
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true); // Loading state for dropdowns
  const [productions, setProductions] = useState([
    {
      userId: "",
      productId: "",
      seasonId: "",
      quantity: "",
      unitPrice: "",
      totalAmount: 0,
    },
  ]);
  const [errors, setErrors] = useState({}); // State for validation errors

  // Effect to manage body class for scroll prevention (MUI Dialog handles this mostly, but good practice)
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Function to load dropdown data (members, products, seasons)
  const loadDropdownData = useCallback(async () => {
    if (!cooperativeId) {
      console.warn("Cooperative ID is not available for fetching dropdown data.");
      return;
    }

    setLoadingDropdowns(true);
    try {
      // ⭐ Pass cooperativeId to fetch functions
      const [membersResponse, productsResponse, seasonsResponse] = await Promise.all([
        fetchUsers(), // Assuming fetchUsers can filter by cooperativeId or you filter it client-side
        fetchProducts(cooperativeId),
        fetchSeasons(cooperativeId),
      ]);

      if (membersResponse.success && Array.isArray(membersResponse.data)) {
        // Filter members by cooperativeId on the client-side if fetchUsers gets all
        const filteredMembers = membersResponse.data.filter(
          (user) => user.cooperativeId === cooperativeId && user.role === 'member' // Assuming you only want 'member' role
        );
        setMembers(filteredMembers);
      } else {
        console.error("Failed to fetch members:", membersResponse.message);
        toast.error(membersResponse.message || "Failed to load members.");
      }

      if (productsResponse.success && Array.isArray(productsResponse.data)) {
        setProducts(productsResponse.data);
      } else {
        console.error("Failed to fetch products:", productsResponse.message);
        toast.error(productsResponse.message || "Failed to load products.");
      }

      if (seasonsResponse.success && Array.isArray(seasonsResponse.data)) {
        setSeasons(seasonsResponse.data);
      } else {
        console.error("Failed to fetch seasons:", seasonsResponse.message);
        toast.error(seasonsResponse.message || "Failed to load seasons.");
      }
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      toast.error("An unexpected error occurred while loading form data.");
    } finally {
      setLoadingDropdowns(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (show) {
      loadDropdownData();
      // Reset form data when modal opens
      setProductions([
        {
          userId: "",
          productId: "",
          seasonId: "",
          quantity: "",
          unitPrice: "",
          totalAmount: 0,
        },
      ]);
      setErrors({}); // Clear errors when opening
    }
  }, [show, loadDropdownData]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...productions];
    list[index][name] = value;

    // Recalculate totalAmount for the specific production being changed
    const quantity = parseFloat(list[index].quantity) || 0;
    const unitPrice = parseFloat(list[index].unitPrice) || 0;
    list[index].totalAmount = quantity * unitPrice;

    setProductions(list);

    // Clear specific error for the field being changed
    if (errors[`${name}-${index}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${name}-${index}`];
        return newErrors;
      });
    }
  };

  const handleAddProduction = () => {
    setProductions([
      ...productions,
      {
        userId: "",
        productId: "",
        seasonId: "",
        quantity: "",
        unitPrice: "",
        totalAmount: 0,
      },
    ]);
  };

  const handleRemoveProduction = (index) => {
    const list = [...productions];
    list.splice(index, 1);
    setProductions(list);

    // Also remove errors associated with the removed production
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.endsWith(`-${index}`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    productions.forEach((prod, index) => {
      if (!prod.userId) {
        tempErrors[`userId-${index}`] = "Member is required.";
        isValid = false;
      }
      if (!prod.productId) {
        tempErrors[`productId-${index}`] = "Product is required.";
        isValid = false;
      }
      if (!prod.seasonId) {
        tempErrors[`seasonId-${index}`] = "Season is required.";
        isValid = false;
      }
      if (parseFloat(prod.quantity) <= 0 || !Number.isInteger(parseFloat(prod.quantity))) {
        tempErrors[`quantity-${index}`] = "Quantity must be a positive integer.";
        isValid = false;
      }
      if (parseFloat(prod.unitPrice) <= 0) {
        tempErrors[`unitPrice-${index}`] = "Unit price must be a positive number.";
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(productions); // onSave expects an array of production objects
      // onClose(); // onClose will be called by parent component after successful save
    } else {
      toast.error("Please fill in all required fields and correct errors.");
    }
  };

  return (
    // ⭐ Replaced plain HTML modal structure with Material-UI Dialog
    <Dialog open={show} onClose={onClose} aria-labelledby="add-production-dialog-title" maxWidth="md" fullWidth>
      <DialogTitle id="add-production-dialog-title">
        <Typography variant="h6" component="span">Add New Productions</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}> {/* Added max height and scroll */}
          {loadingDropdowns ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <Typography>Loading data...</Typography>
            </Box>
          ) : (
            productions.map((production, index) => (
              <Box key={index} sx={{ border: "1px solid #e0e0e0", p: 2, mb: 3, borderRadius: "8px", position: 'relative' }}>
                <Typography variant="subtitle1" sx={{ color: "text.primary", fontWeight: 'bold', mb: 1 }}>Production #{index + 1}</Typography>
                {productions.length > 1 && (
                  <IconButton
                    aria-label="remove production"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveProduction(index)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required error={!!errors[`userId-${index}`]}>
                  <InputLabel id={`member-label-${index}`}>Member</InputLabel>
                  <Select
                    labelId={`member-label-${index}`}
                    id={`userId-${index}`}
                    name="userId"
                    value={production.userId}
                    label="Member"
                    onChange={(e) => handleChange(e, index)}
                  >
                    <MenuItem value="">Select Member</MenuItem>
                    {members.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.names}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`userId-${index}`] && <Typography variant="caption" color="error">{errors[`userId-${index}`]}</Typography>}
                </FormControl>

                <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required error={!!errors[`productId-${index}`]}>
                  <InputLabel id={`product-label-${index}`}>Product</InputLabel>
                  <Select
                    labelId={`product-label-${index}`}
                    id={`productId-${index}`}
                    name="productId"
                    value={production.productId}
                    label="Product"
                    onChange={(e) => handleChange(e, index)}
                  >
                    <MenuItem value="">Select Product</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.productName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`productId-${index}`] && <Typography variant="caption" color="error">{errors[`productId-${index}`]}</Typography>}
                </FormControl>

                <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required error={!!errors[`seasonId-${index}`]}>
                  <InputLabel id={`season-label-${index}`}>Season</InputLabel>
                  <Select
                    labelId={`season-label-${index}`}
                    id={`seasonId-${index}`}
                    name="seasonId"
                    value={production.seasonId}
                    label="Season"
                    onChange={(e) => handleChange(e, index)}
                  >
                    <MenuItem value="">Select Season</MenuItem>
                    {seasons.map((season) => (
                      <MenuItem key={season._id} value={season._id}>
                        {season.name} ({season.year})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`seasonId-${index}`] && <Typography variant="caption" color="error">{errors[`seasonId-${index}`]}</Typography>}
                </FormControl>

                <TextField
                  margin="dense"
                  id={`quantity-${index}`}
                  label="Quantity"
                  type="number"
                  fullWidth
                  variant="outlined"
                  name="quantity"
                  value={production.quantity}
                  onChange={(e) => handleChange(e, index)}
                  required
                  sx={{ mb: 2 }}
                  error={!!errors[`quantity-${index}`]}
                  helperText={errors[`quantity-${index}`]}
                />

                <TextField
                  margin="dense"
                  id={`unitPrice-${index}`}
                  label="Unit Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  name="unitPrice"
                  value={production.unitPrice}
                  onChange={(e) => handleChange(e, index)}
                  required
                  sx={{ mb: 2 }}
                  error={!!errors[`unitPrice-${index}`]}
                  helperText={errors[`unitPrice-${index}`]}
                />

                <TextField
                  margin="dense"
                  id={`totalAmount-${index}`}
                  label="Total Amount"
                  type="text"
                  fullWidth
                  variant="outlined"
                  name="totalAmount"
                  value={`RWF ${production.totalAmount.toFixed(2)}`}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
              </Box>
            ))
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddProduction}
            sx={{ mt: 2 }}
          >
            Add Another Production
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save All Productions
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductionModal;