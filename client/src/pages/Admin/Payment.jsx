import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPayments } from "../../services/paymentService";
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
  InputAdornment, // Added for search icon
} from "@mui/material";
import {
  Add,
  Search, // Imported Search icon
  Visibility, // Imported Visibility icon for transactions button
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddPaymentModal from "../../features/modals/AddPaymentModal";

// Styled components for a cleaner look consistent with other dashboards
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled component for table body cells - Adjusted padding for responsiveness
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px", // Default padding
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
    case "pending": // Changed from "unpaid" to "pending" for consistency with Fee/Loan Statuses
      return "warning";
    default:
      return "default";
  }
};

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Increased rows per page for consistency with other tables

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Load payments data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsData = await fetchPayments();

      // Map user info, assuming userId and createdAt are available
      const mappedPayments = (paymentsData || []).map((payment) => {
        const userName = payment.userId?.names || "N/A";
        return {
          ...payment,
          userName,
        };
      });

      setPayments(mappedPayments);
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error(
        "Error loading payment data. Please check console for details."
      );
      setPayments([]); // Ensure payments is reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const handlePaymentSubmissionSuccess = async () => {
    setShowAddModal(false);
    toast.success("Payment recorded successfully!"); // Added success toast
    await loadData();
  };

  const viewPaymentTransactions = () => {
    navigate("/admin/dashboard/payment-transaction");
  };

  // Memoized filtered and paginated payments
  const filteredAndPaginatedPayments = useMemo(() => {
    let currentFiltered = payments;

    // Apply search filter
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((p) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "user":
            return p.userName?.toLowerCase().includes(lowerCaseSearchTerm);
          case "paymentDate": // Assuming payments have a 'createdAt' or 'paymentDate' field
            return p.createdAt
              ? new Date(p.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          case "amountPaid":
            return p.amountPaid?.toString().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by date (createdAt) - newest first by default
    currentFiltered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Pagination logic
    const startIndex = (currentPage - 1) * rowsPerPage;
    return currentFiltered.slice(startIndex, startIndex + rowsPerPage);
  }, [
    payments,
    currentPage,
    rowsPerPage,
    searchTerm,
    searchField,
    statusFilter,
  ]);

  const totalPages = useMemo(() => {
    let currentFiltered = payments;
    // Recalculate total pages based on filtered (not paginated) data
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((p) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "user":
            return p.userName?.toLowerCase().includes(lowerCaseSearchTerm);
          case "paymentDate":
            return p.createdAt
              ? new Date(p.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          case "amountPaid":
            return p.amountPaid?.toString().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    return Math.ceil(currentFiltered.length / rowsPerPage);
  }, [payments, rowsPerPage, searchTerm, searchField, statusFilter]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField, statusFilter]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Payments Dashboard</Typography>}
          action={
            <Stack direction={isMobile ? "column" : "row"} spacing={1}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<Add />}
                onClick={() => setShowAddModal(true)}
                disabled={loading}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Create Payment
              </Button>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Visibility />} // Use Material-UI icon
                onClick={viewPaymentTransactions}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                View Transactions
              </Button>
            </Stack>
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
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Manage and track all payment records, including amounts paid,
              amounts due, and payment status.
            </Typography>
          </Box>

          {/* Search and Filter Section */}
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
              <MenuItem value="paymentDate">Payment Date</MenuItem>
              <MenuItem value="amountPaid">Amount Paid</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "paymentDate"
                  ? "Payment Date (e.g., 2/15/2023)"
                  : "Amount Paid"
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
              label="Status Filter"
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
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        User
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Paid Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount Due
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Remaining
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Payment Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndPaginatedPayments.length > 0 ? (
                      filteredAndPaginatedPayments.map((p, index) => (
                        <TableRow hover key={p._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>{p.userName}</StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountPaid || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountDue || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountRemainingToPay || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={p.status}
                              size="small"
                              color={getStatusColor(p.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "N/A"}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No payments found.
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
      <AddPaymentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handlePaymentSubmissionSuccess}
      />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
};

export default Payment;
