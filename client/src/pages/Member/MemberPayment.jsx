import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchPaymentById } from "../../services/paymentService"; // Changed from fetchPayments to fetchPaymentById
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
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
  Chip,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Material-UI Eye icon

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
  backgroundColor: "transparent",
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

// Helper function for status chip color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "success";
    case "pending": // Loans are likely pending until fully repaid
      return "warning";
    default:
      return "default";
  }
};

function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Load payments data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const cooperativeId = user?.cooperativeId;

      if (userId) {
        const paymentsData = await fetchPaymentById(userId, cooperativeId);
        const mappedPayments = (paymentsData || []).map((payment) => {
          const userName = payment.userId?.names || "N/A";
          return {
            ...payment,
            userName,
          };
        });
        setPayments(mappedPayments);
      } else {
        console.warn(
          "User ID not found in localStorage. Cannot fetch payments."
        );
        setPayments([]);
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error(
        "Error loading payment data. Please check console for details."
      );
      setPayments([]);
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
    }).format(amount || 0); // Handle null/undefined amount gracefully
  };

  const viewPaymentTransaction = () => {
    navigate("/member/dashboard/payment-transaction");
  };

  // Add the new function to navigate to the payment summary page
  const viewPaymentSummary = () => {
    navigate("/member/dashboard/payment-summary");
  };

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((p) => {
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
          case "status":
            return p.status?.toLowerCase().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by creation date (implicitly, assuming payments are created over time) descending.
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [payments, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedPayments.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPayments.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPayments]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const handleCheckboxChange = (paymentId) => {
    setSelectedPaymentId((prevId) => (prevId === paymentId ? null : paymentId));
  };
  const handleNavigateToTransactions = () => {
    if (selectedPaymentId) {
      navigate(`/member/dashboard/payment-transaction/${selectedPaymentId}`);
    }
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        {<Typography variant="h6">Payments </Typography>}
        <StyledCardHeader
          action={
            <Stack
              direction={{ xs: "column", sm: "row" }} // stack vertically on mobile
              spacing={1}
              sx={{ width: { xs: "100%", sm: "auto" } }} // full width on mobile
            >
              <Button
                variant="outlined"
                size="medium"
                startIcon={<VisibilityIcon />}
                onClick={handleNavigateToTransactions}
                disabled={!selectedPaymentId} // 👈 Smart!
              >
                Transactions
              </Button>

              <Button
                variant="outlined"
                size="medium"
                startIcon={<VisibilityIcon />}
                onClick={viewPaymentSummary}
                fullWidth={{ xs: true, sm: false }} // full width on mobile
              >
                Payment Summary
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
              A place to view and manage payment status, amounts, and payment
              dates.
            </Typography>
          </Box>

          {/* Search, Filter, and Sort Section */}
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
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="paymentDate">Payment Date</MenuItem>
              <MenuItem value="amountPaid">Amount Paid</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "paymentDate"
                  ? "Payment Date (e.g., 2/15/2023)"
                  : searchField === "amountPaid"
                  ? "Amount Paid"
                  : "Status"
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
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  overflowX: "auto",
                  maxHeight: { xs: "50vh", md: "70vh" },
                }}
              >
                <Table
                  size="small"
                  l
                  sx={{ minWidth: 700, tableLayout: "auto" }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        Select
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
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
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Payment Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((p, index) => (
                        <TableRow hover key={p._id || index}>
                          <StyledTableCell>
                            <Checkbox
                              size="small"
                              checked={selectedPaymentId === p._id}
                              onChange={() => handleCheckboxChange(p._id)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {p.userName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountPaid)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountDue)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(p.amountRemainingToPay)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={p.status || "N/A"}
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
    </Box>
  );
}

export default Payment;
