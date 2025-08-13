import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLoanTransactions } from "../../services/loanTransactionService";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Pagination,
  useMediaQuery,
  styled,
  TextField,
  MenuItem,
  InputAdornment, // Added InputAdornment for search icon
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Material-UI ArrowBack icon
import SearchIcon from "@mui/icons-material/Search"; // Material-UI Search icon
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // Material-UI sort icon
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // Material-UI sort icon

// Styled components for a cleaner look consistent with Loan component
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled component for table body cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px", // Consistent row padding
  borderBottom: `1px solid ${theme.palette.divider}`, // Keep divider for row separation
  backgroundColor: theme.palette.background.paper, // A slightly different background for body cells
  color: theme.palette.text.primary, // Ensure text color is readable
  wordWrap: "break-word", // Ensure text wraps
  whiteSpace: "normal", // Allow normal whitespace handling
  [theme.breakpoints.down("sm")]: {
    padding: "4px 6px",
    fontSize: "0.65rem",
  },
}));

// Styled component for table header cells (updated for no background)
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px", // Slightly more padding for headers
  backgroundColor: "transparent", // Removed background color
  color: theme.palette.text.primary, // Set text color to primary text for readability
  fontWeight: 600, // Bolder font weight
  borderBottom: `2px solid ${theme.palette.divider}`, // Thicker border bottom, matching divider for subtlety
  "&:first-of-type": {
    borderTopLeftRadius: theme.shape.borderRadius,
  },
  "&:last-of-type": {
    borderTopRightRadius: theme.shape.borderRadius,
  },
  wordWrap: "break-word", // Ensure text wraps
  whiteSpace: "normal", // Allow normal whitespace handling
  [theme.breakpoints.down("sm")]: {
    padding: "6px 6px",
    fontSize: "0.65rem",
  },
}));

// Helper function for status chip color
const getStatusColor = (status) => {
  switch (
    status?.toLowerCase() // Ensure status is lowercased for consistent comparison
  ) {
    case "repaid":
      return "success";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

function LoanTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7; // Fixed rows per page as requested

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("member");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date descending (newest first)

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch transactions
  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      if (userId) {
        // Ensure userId exists before fetching
        const res = await fetchLoanTransactions(userId); // Assuming fetchLoanTransactions now takes userId
        setTransactions(res.transactions || []);
      } else {
        console.warn(
          "User ID not found in localStorage. Cannot fetch loan transactions."
        );
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch loan transactions:", error);
      toast.error("Failed to load loan transactions.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  // Handle back button navigation
  const handleBack = () => navigate(-1);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0); // Handle null/undefined amounts gracefully
  };

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let currentFiltered = transactions;

    // Apply search filter
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((tx) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
            return (
              tx.loanId?.purchaseInputId?.userId?.names
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              tx.loanId?.userId?.names // Fallback if purchaseInputId is missing
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm)
            );
          case "product":
            return tx.loanId?.purchaseInputId?.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "date":
            // Filter by transaction date if available (e.g., "2/15/2023")
            return tx.transactionDate
              ? new Date(tx.transactionDate)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          default:
            return true;
        }
      });
    }

    // Apply status filter (for loan status)
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (tx) => tx.loanId?.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting by transaction date
    currentFiltered.sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime(); // Oldest first
      } else {
        return dateB.getTime() - dateA.getTime(); // Newest first
      }
    });

    return currentFiltered;
  }, [transactions, searchTerm, searchField, statusFilter, sortOrder]);

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setPage(1);
  }, [filteredAndSortedTransactions]);

  // Memoized paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [filteredAndSortedTransactions, page, rowsPerPage]);

  // Calculate total pages based on filtered transactions
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / rowsPerPage
  );

  // Handle page change for MUI Pagination component
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box p={isMobile ? 2 : 3}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Loan Transactions</Typography>}
          action={
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ArrowBackIcon />} // Material-UI ArrowBack icon
              onClick={handleBack}
            >
              Back
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflow: "hidden", // Hide overflow on CardContent itself
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Filters and Search Section */}
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
              <MenuItem value="member">Member Name</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "member"
                  ? "Member Name"
                  : searchField === "product"
                  ? "Product"
                  : "Date (e.g., 2/15/2023)"
              }`}
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
            <TextField
              select
              label="Loan Status"
              size="small"
              fullWidth={isMobile}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="repaid">Repaid</MenuItem>
            </TextField>
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
              Sort by Date {sortOrder === "asc" ? "(Oldest)" : "(Newest)"}
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
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      {/* Using StyledTableHeaderCell for header cells */}
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount Paid
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Remaining
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Loan Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((tx, index) => (
                        <TableRow hover key={tx._id || index}>
                          {" "}
                          {/* Added || index for key fallback */}
                          {/* Using StyledTableCell for body cells */}
                          <StyledTableCell>
                            {(page - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {tx.loanId?.purchaseInputId?.userId?.names ||
                              tx.loanId?.userId?.names ||
                              "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(tx.amountPaid)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(tx.amountRemainingToPay)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={tx.loanId?.status || "N/A"}
                              size="small"
                              color={getStatusColor(tx.loanId?.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {tx.transactionDate
                              ? new Date(
                                  tx.transactionDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          {" "}
                          {/* Added sx prop for padding */}
                          <Typography
                            variant="body1" // Changed from subtitle1 for consistency with other empty states
                            color="text.secondary"
                          >
                            No transactions found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination controls: Only show if there's more than one page */}
              {totalPages > 1 && (
                <Box
                  mt={3}
                  display="flex"
                  justifyContent="center"
                  sx={{ flexShrink: 0 }}
                >
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
            </Box>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default LoanTransactions;
