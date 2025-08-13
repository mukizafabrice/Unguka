import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Stack,
  CircularProgress,
  Pagination,
  useMediaQuery,
  styled,
  TextField, // Added for search/filter inputs
  MenuItem, // Added for select dropdowns
  IconButton, // Added for search icon
} from "@mui/material";
import { Search } from "@mui/icons-material"; // Import Search icon
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchStock } from "../../services/stockService"; // Ensure this path is correct

// Styled components for a cleaner look consistent with Loan component
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled component for table body cells - Adjusted for responsiveness
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px", // Default padding
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  wordWrap: "break-word", // Allow long words to break
  whiteSpace: "normal", // Ensure text wraps naturally
  [theme.breakpoints.down("sm")]: {
    // Apply on small screens
    padding: "4px 6px", // Reduced padding for mobile
    fontSize: "0.65rem", // Smaller font size for mobile
  },
}));

// Styled component for table header cells - Adjusted for responsiveness and no background
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px", // Default padding
  backgroundColor: "transparent", // No background color
  color: theme.palette.text.primary, // Primary text color for readability
  fontWeight: 600, // Bolder font weight
  borderBottom: `2px solid ${theme.palette.divider}`, // Thicker border bottom, matching divider for subtlety
  "&:first-of-type": {
    borderTopLeftRadius: theme.shape.borderRadius,
  },
  "&:last-of-type": {
    borderTopRightRadius: theme.shape.borderRadius,
  },
  wordWrap: "break-word", // Allow long words to break
  whiteSpace: "normal", // Ensure text wraps naturally
  [theme.breakpoints.down("sm")]: {
    // Apply on small screens
    padding: "6px 6px",
    fontSize: "0.65rem",
  },
}));

function Stock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Current page, 1-based
  const rowsPerPage = 7; // Fixed rows per page
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [searchField, setSearchField] = useState("productName"); // State for selected search field
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch stock data
  const loadStocks = useCallback(async () => {
    setLoading(true);
    try {
      const stockData = await fetchStock();
      setStocks(stockData || []); // Ensure it's an array, even if empty
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      toast.error("Failed to load stocks.");
      setStocks([]); // Reset stocks on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    loadStocks();
  }, [loadStocks]); // Reload stocks when loadStocks function changes (which it won't, due to useCallback)

  // Memoized filtered data based on search term and selected field
  const filteredStocks = useMemo(() => {
    let currentFiltered = stocks;

    if (searchTerm) {
      currentFiltered = currentFiltered.filter((stock) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "productName":
            return stock.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "quantity":
            return stock.quantity?.toString().includes(lowerCaseSearchTerm);
          case "totalPrice":
            return stock.totalPrice?.toString().includes(lowerCaseSearchTerm);
          default:
            return true; // No filter applied if searchField is invalid
        }
      });
    }
    return currentFiltered;
  }, [stocks, searchTerm, searchField]);

  // Reset page to 1 whenever filters change (new filtered data is produced)
  useEffect(() => {
    setPage(1);
  }, [filteredStocks]);

  // Memoized paginated data
  const paginatedStocks = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredStocks.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStocks, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);

  // Handle page change for MUI Pagination
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      {" "}
      {/* Reduced top padding to 0 */}
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Stocks Dashboard</Typography>}
          // No actions needed as per original component, but can be added here
        />
        <CardContent>
          <Box mb={3}>
            {" "}
            {/* Margin bottom for header text */}
            <Typography variant="body2" color="text.secondary">
              Manage and track current stock levels and updates in real time.
            </Typography>
          </Box>

          {/* Search and Filter Section */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            alignItems={isMobile ? "stretch" : "center"}
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
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="totalPrice">Amount</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "productName"
                  ? "Product Name"
                  : searchField === "quantity"
                  ? "Quantity"
                  : "Amount"
              }`}
              variant="outlined"
              size="small"
              fullWidth={isMobile}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton edge="start">
                    <Search />
                  </IconButton>
                ),
              }}
            />
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ overflowX: "auto", borderRadius: 2, boxShadow: 2 }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  {" "}
                  {/* Fixed table layout to prevent horizontal scroll */}
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "35%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "35%" }}>
                        Amount
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStocks.length > 0 ? (
                      paginatedStocks.map((stock, index) => (
                        <TableRow hover key={stock._id}>
                          <StyledTableCell>
                            {(page - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {stock.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>{stock.quantity}</StyledTableCell>
                          <StyledTableCell>{stock.totalPrice}</StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          {" "}
                          {/* Adjusted colspan */}
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            p={2}
                          >
                            No stock found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination controls at the bottom */}
              {totalPages > 1 && (
                <Box mt={3} display="flex" justifyContent="center">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
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
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default Stock;
