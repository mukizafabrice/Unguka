import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaymentTransactions } from "../../services/paymentTransactionService";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth to get cooperativeId
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
  InputAdornment,
} from "@mui/material";
import { ArrowBack as ArrowLeft, Search } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styled components for a cleaner look consistent with Loan component
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled component for table body cells - Adjusted padding for responsiveness
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px", // Consistent row padding
  borderBottom: `1px solid ${theme.palette.divider}`, // Keep divider for row separation
  backgroundColor: theme.palette.background.paper, // A slightly different background for body cells
  color: theme.palette.text.primary, // Ensure text color is readable
  wordWrap: "break-word", // Ensure text wraps naturally
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: {
    // Apply on small screens
    padding: "6px 8px", // Reduced padding for mobile
    fontSize: "0.75rem", // Slightly smaller font size
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
  wordWrap: "break-word", // Ensure text wraps naturally
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: {
    // Apply on small screens
    padding: "8px 8px", // Reduced padding for mobile
    fontSize: "0.75rem", // Slightly smaller font size
  },
}));

// Helper function for status chip color
const getStatusColor = (status) => {
  switch (
    status?.toLowerCase() // Ensure case-insensitivity
  ) {
    case "paid":
      return "success";
    case "pending": // Assuming 'pending' status for unpaid items
      return "warning";
    default:
      return "default";
  }
};

function PaymentTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Changed default to true as data is fetched on mount
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Fixed rows per page for consistency

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { user } = useAuth(); // Access user from AuthContext
  const cooperativeId = user?.cooperativeId; // Get the cooperativeId

  // Function to fetch transactions
  const getTransactions = useCallback(async () => {
    // Only proceed if cooperativeId is available
    if (!cooperativeId) {
      console.log(
        "[PaymentTransaction] Skipping transaction fetch: cooperativeId is undefined."
      );
      setLoading(false); // Stop loading if no cooperativeId
      setTransactions([]); // Clear transactions if no cooperativeId
      return;
    }

    setLoading(true);
    try {
      // Pass the cooperativeId to the fetchPaymentTransactions service
      const res = await fetchPaymentTransactions(cooperativeId);
      // Ensure res is an array or has a .data property that is an array
      const paymentsData = res.data || res; // Adjust based on actual API response structure

      // Map user info (assuming userId.names exists)
      const mappedPayments = (paymentsData || []).map((payment) => {
        const userName = payment.userId?.names || "N/A";
        return {
          ...payment,
          userName,
        };
      });

      setTransactions(mappedPayments);
      console.log(
        `[PaymentTransaction] Fetched ${mappedPayments.length} transactions for cooperativeId: ${cooperativeId}`
      );
    } catch (error) {
      console.error(
        "[PaymentTransaction] Failed to fetch payment transactions:",
        error
      );
      toast.error("Failed to load payment transactions.");
      setTransactions([]); // Ensure transactions is reset on error
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

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
    }).format(amount);
  };

  // Memoized filtered transactions: this filters the data based on search and status
  const filteredTransactions = useMemo(() => {
    let currentFiltered = transactions;

    // Apply search filter
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((tx) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "user":
            return tx.userName?.toLowerCase().includes(lowerCaseSearchTerm);
          case "paymentDate": // Search by formatted date string
            return tx.transactionDate
              ? new Date(tx.transactionDate)
                  .toLocaleDateString()
                  .toLowerCase()
                  .includes(lowerCaseSearchTerm)
              : false;
          case "amountPaid":
            return tx.amountPaid
              ?.toString()
              .toLowerCase()
              .includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter (for payment status)
    // Note: The PaymentTransaction model does not inherently have a 'status' field.
    // This filter might not work as expected unless you add 'status' to your PaymentTransaction model,
    // or you're deriving it from a related 'Payment' document.
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (tx) => tx.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by transaction date (newest first by default)
    currentFiltered.sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return dateB.getTime() - dateA.getTime();
    });

    return currentFiltered;
  }, [transactions, searchTerm, searchField, statusFilter]);

  // Reset page to 1 whenever filters change (new filtered data is produced)
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions]);

  // Memoized paginated transactions: this slices the filtered data for the current page
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  // Calculate total pages based on filtered transactions
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  // Handle page change for MUI Pagination component
  const handleChangePage = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Payment Transactions</Typography>}
          action={
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ArrowLeft />}
              onClick={handleBack}
            >
              Back
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Descriptive Text Section */}
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              View and manage all individual payment transactions for various
              fees and loans.
            </Typography>
          </Box>

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
              <MenuItem value="user">User Name</MenuItem>
              <MenuItem value="amountPaid">Amount Paid</MenuItem>
              <MenuItem value="paymentDate">Payment Date</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "amountPaid"
                  ? "Amount Paid"
                  : "Payment Date (e.g., 2/15/2023)"
              }`}
              variant="outlined"
              size="small"
              fullWidth={isMobile}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Payment Status"
              size="small"
              fullWidth={isMobile}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
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
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        User
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount Paid
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Remaining to Pay
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Payment Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((tx, index) => (
                        <TableRow hover key={tx._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {tx.userName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(tx.amountPaid || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(tx.amountRemainingToPay || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={tx.paymentId?.status || "N/A"}
                              size="small"
                              color={getStatusColor(tx.paymentId?.status)}
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
                          <Typography variant="body1" color="text.secondary">
                            No transactions found.
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
                onChange={handleChangePage}
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
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default PaymentTransaction;
