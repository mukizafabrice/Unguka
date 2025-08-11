import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these service imports are correctly pointing to your backend services
import {
  fetchProduct,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../services/productService";

import {
  Box,
  Container,
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
  TextField, // Import TextField for search input
  InputAdornment, // For search icon
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search"; // Import Search icon
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // Import icons for sorting
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Assuming these modal imports are correctly pointing to your modal components
import AddProductModal from "../../features/modals/AddProductModal";
import UpdateProductModal from "../../features/modals/UpdateProductModal";

function Product() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [sortOrder, setSortOrder] = useState("asc"); // State for sorting: 'asc' or 'desc'

  // Function to fetch products from the backend
  const loadProducts = async () => {
    try {
      const productsData = await fetchProduct();
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products.");
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Handler for adding a new product
  const handleAddProduct = async (productData) => {
    try {
      await createProduct(productData);
      setShowAddModal(false);
      toast.success("Product added successfully!");
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(
        `Failed to add product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        `Failed to delete product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler to open the update modal with the selected product's data
  const handleUpdateProduct = (product) => {
    setProductToEdit(product);
    setShowUpdateModal(true);
  };

  // Handler for submitting the updated product
  const handleProductUpdated = async (updatedProductData) => {
    try {
      await updateProduct(updatedProductData._id, updatedProductData);
      toast.success("Product updated successfully!");
      setShowUpdateModal(false);
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        `Failed to update product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Filter and sort products based on searchTerm and sortOrder
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
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

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
    setCurrentPage(1); // Reset to first page when sorting
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header and Add Product Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack on small screens, row on larger
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" }, // Align items differently based on screen size
          mb: 4,
          gap: { xs: 2, sm: 0 }, // Add gap when stacked
        }}
      >
        <Typography variant="h4" component="h1" sx={{ color: "text.primary" }}>
          Products Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
          sx={{ minWidth: { xs: "100%", sm: "auto" } }} // Full width on small screens
        >
          Add Product
        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset pagination on search
          }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "auto" } }}
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
          onClick={handleSort}
          startIcon={
            sortOrder === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          }
          sx={{ minWidth: { xs: "100%", sm: "auto" } }} // Full width on small screens
        >
          Sort by Name {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
        </Button>
      </Box>

      {/* Product Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Product Name
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.length > 0 ? (
              currentRows.map((product, index) => (
                <TableRow
                  hover
                  key={product._id || index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {indexOfFirstRow + index + 1}
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <IconButton
                        aria-label="update"
                        color="primary"
                        onClick={() => handleUpdateProduct(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1">No products found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          flexDirection: { xs: "column", sm: "row" }, // Stack on small screens
          gap: { xs: 2, sm: 0 }, // Add gap when stacked
        }}
      >
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          startIcon={<ArrowBackIosIcon />}
          variant="outlined"
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Previous
        </Button>
        <Typography variant="body1">
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          endIcon={<ArrowForwardIosIcon />}
          variant="outlined"
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Next
        </Button>
      </Box>

      {/* Modals for Add and Update */}
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

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
}

export default Product;
