import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ NEW: Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchProducts, // Renamed from fetchProduct for consistency with service file
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../services/productService";

import {
  Box,
  Card, // Added Card import to match Loan.jsx structure
  CardHeader, // Added CardHeader import to match Loan.jsx structure
  CardContent, // Added CardContent import to match Loan.jsx structure
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  useMediaQuery,
  styled,
  Pagination,
  CircularProgress,
  FormControlLabel, // Needed for Checkbox/Radio in forms
  Checkbox, // Needed for Checkbox in forms
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AddProductModal from "../../features/modals/AddProductModal";
import UpdateProductModal from "../../features/modals/UpdateProductModal";

// Styled components consistent with Loan.jsx
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled component for table body cells - Adjusted for responsiveness
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper, // Changed from transparent for consistency
  color: theme.palette.text.primary,
  wordWrap: "break-word",
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: {
    padding: "4px 6px",
    fontSize: "0.65rem",
  },
}));

// Styled component for table header cells - Adjusted for responsiveness and no background
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: "#f5f5f5", // Explicit background for header
  color: theme.palette.text.primary,
  fontWeight: 600,
  borderBottom: `2px solid ${theme.palette.divider}`,
  "&:first-of-type": {
    borderTopLeftRadius: theme.shape.borderRadius,
  },
  "&:last-of-type": {
    borderTopRightRadius: theme.shape.borderRadius,
  },
  wordWrap: "break-word",
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: {
    padding: "6px 6px",
    fontSize: "0.65rem",
  },
}));

function Product() {
  // ⭐ Get user and cooperativeId from AuthContext
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the manager belongs to

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // ⭐ Modified loadProducts to fetch products for the specific cooperativeId
  const loadProducts = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot load products.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchProducts(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        toast.error(response.message || "Failed to load products.");
        setProducts([]);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while loading products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    // Only load products if cooperativeId is available
    if (cooperativeId) {
      loadProducts();
    }
  }, [cooperativeId, loadProducts]); // Depend on cooperativeId and loadProducts

  // ⭐ Modified handleAddProduct to include cooperativeId
  const handleAddProduct = async (productData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add product.");
      return;
    }
    try {
      // Add the cooperativeId to the product data before sending
      const dataToSend = { ...productData, cooperativeId: cooperativeId };
      const response = await createProduct(dataToSend);
      if (response.success) {
        setShowAddModal(false);
        toast.success(response.message || "Product added successfully!");
        await loadProducts();
      } else {
        toast.error(response.message || "Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("An unexpected error occurred while adding product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot delete product.");
      return;
    }

    // Ask for confirmation
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return; // User canceled

    try {
      const response = await deleteProduct(id, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Product deleted successfully!");
        await loadProducts();
      } else {
        toast.error(response.message || "Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An unexpected error occurred while deleting product.");
    }
  };

  const handleUpdateProduct = (product) => {
    setProductToEdit(product);
    setShowUpdateModal(true);
  };

  // ⭐ Modified handleProductUpdated to include cooperativeId
  const handleProductUpdated = async (updatedProductData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update product.");
      return;
    }
    try {
      // Add the cooperativeId to the product data before sending for update
      const dataToSend = {
        ...updatedProductData,
        cooperativeId: cooperativeId,
      };
      const response = await updateProduct(dataToSend._id, dataToSend);
      if (response.success) {
        toast.success(response.message || "Product updated successfully!");
        setShowUpdateModal(false);
        await loadProducts();
      } else {
        toast.error(response.message || "Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An unexpected error occurred while updating product.");
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (!a.productName || !b.productName) return 0;
      if (sortOrder === "asc") {
        return a.productName.localeCompare(b.productName);
      } else {
        return b.productName.localeCompare(a.productName);
      }
    });
    return filtered;
  }, [products, searchTerm, sortOrder]);

  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedProducts.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(filteredAndSortedProducts.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedProducts]);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Products</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Product
            </Button>
          }
        />
        <CardContent>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track products, including adding new ones, updating
              details, and removing old entries.
            </Typography>
          </Box>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            alignItems={isMobile ? "stretch" : "center"}
          >
            <TextField
              label="Search Products"
              variant="outlined"
              size="small"
              fullWidth={isMobile}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              size="medium"
              onClick={handleSort}
              startIcon={
                sortOrder === "asc" ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )
              }
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Sort by Name {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
            </Button>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ boxShadow: 2, borderRadius: 2, overflowX: "auto" }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      {" "}
                      {/* Removed explicit backgroundColor from TableRow, handled by StyledTableHeaderCell */}
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "60%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "30%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((product, index) => (
                        <TableRow
                          hover
                          key={product._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {product.productName}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="center"
                            >
                              <IconButton
                                aria-label="update"
                                color="primary"
                                size="small"
                                onClick={() => handleUpdateProduct(product)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No products found for this cooperative.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box mt={3} display="flex" justifyContent="center">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, newPage) => setCurrentPage(newPage)}
                    color="primary"
                    showFirstButton
                    showLastButton
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 0 : 1}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AddProductModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
      />
      <UpdateProductModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleProductUpdated}
        productData={productToEdit}
      />
    </Box>
  );
}

export default Product;
