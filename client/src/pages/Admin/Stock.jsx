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
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";
import { fetchStocks } from "../../services/stockService";

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

// Styled component for table header cells - Adjusted for responsiveness and background
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: "#f5f5f5",
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

function Stock() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch stock data for the specific cooperative
  const loadStocks = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available. Cannot load stocks.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchStocks(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setStocks(response.data);
      } else {
        console.error("Failed to fetch stocks:", response.message);
        toast.error(response.message || "Failed to load stocks.");
        setStocks([]);
      }
    } catch (error) {
      console.error("Failed to fetch stocks (catch block):", error);
      toast.error("An unexpected error occurred while loading stocks.");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (cooperativeId) {
      loadStocks();
    }
  }, [cooperativeId, loadStocks]);

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
            return true;
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
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Stocks Dashboard</Typography>}
          // Removed Add Stock Button
        />
        <CardContent>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              View current stock levels for products within your cooperative.
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
                  <IconButton edge="start" disableRipple>
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
                  <TableHead>
                    <TableRow>
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
                      {/* Removed Action column */}
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
                          {/* Removed corresponding action cell */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            p={2}
                          >
                            No stock found for your cooperative.
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

      {/* Removed Add/Update Stock Modals */}
    </Box>
  );
}

export default Stock;
