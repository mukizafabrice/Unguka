import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchProducts, // ⭐ CORRECTED: Changed from fetchProduct to fetchProducts
} from "../../services/productService"; // Only fetching is needed for members

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Stack,
  useMediaQuery,
  styled,
  Pagination,
  CircularProgress,
  MenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Styled components consistent with other dashboards
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  wordWrap: "break-word",
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: {
    padding: "4px 6px",
    fontSize: "0.65rem",
  },
}));

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
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the member belongs to

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName"); // Default search field
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by product name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // ⭐ Modified loadProducts to fetch products for the specific cooperativeId
  const loadProducts = useCallback(async () => {
    if (!cooperativeId) {
      toast.error(
        "Member's cooperative ID is not available. Cannot load products."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass the cooperativeId to fetchProducts
      const response = await fetchProducts(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error("Failed to fetch products:", response.message);
        toast.error(response.message || "Failed to load products.");
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products (catch block):", error);
      toast.error("An unexpected error occurred while loading products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

  useEffect(() => {
    // Only load products if cooperativeId is available
    if (cooperativeId) {
      loadProducts();
    }
  }, [cooperativeId, loadProducts]); // Depend on cooperativeId and loadProducts

  // No add/update/delete handlers for member view

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "productName":
            return product.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply sorting by product name
    filtered.sort((a, b) => {
      const nameA = a.productName || "";
      const nameB = b.productName || "";
      const comparison = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchTerm, searchField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedProducts.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedProducts]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Products Dashboard</Typography>}
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflow: "hidden", // Hide overflow on CardContent itself
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Here is a list of products available in your cooperative.
            </Typography>
          </Box>

          {/* Search and Sort Section */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            alignItems={isMobile ? "stretch" : "center"}
            sx={{ flexShrink: 0 }}
          >
            <TextField
              select
              label="Search By"
              size="small"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              sx={{ minWidth: 120, flexShrink: 0 }}
            >
              <MenuItem value="productName">Product Name</MenuItem>
            </TextField>
            <TextField
              label="Search Product Name"
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
              Sort by Name {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
            </Button>
          </Stack>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              my={5}
              sx={{ flexGrow: 1 }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {" "}
              {/* This box will scroll */}
              <TableContainer
                component={Paper}
                sx={{
                  overflowX: "auto",
                  borderRadius: 2,
                  boxShadow: 2,
                  flexGrow: 1,
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "90%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((product, index) => (
                        <TableRow hover key={product._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {product.productName || "N/A"}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No products found for this cooperative.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {totalPages > 1 && (
            <Box
              mt={3}
              display="flex"
              justifyContent="center"
              sx={{ flexShrink: 0 }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={isMobile ? 0 : 1}
                boundaryCount={isMobile ? 0 : 1}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Product;
