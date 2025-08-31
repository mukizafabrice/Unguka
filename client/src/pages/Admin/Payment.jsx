import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
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
  TextField,
  MenuItem,
  InputAdornment,
  useMediaQuery,
  styled,
  Checkbox,
} from "@mui/material";
import { Add, Search, Visibility } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPayments,
  downloadPaymentsExcel,
  downloadPaymentsPDF,
} from "../../services/paymentService";
import { useAuth } from "../../contexts/AuthContext";
import AddPaymentModal from "../../features/modals/AddPaymentModal";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
// Styled components
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": { fontWeight: 600 },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  wordWrap: "break-word",
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: { padding: "6px 8px", fontSize: "0.75rem" },
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  fontWeight: 600,
  borderBottom: `2px solid ${theme.palette.divider}`,
  "&:first-of-type": { borderTopLeftRadius: theme.shape.borderRadius },
  "&:last-of-type": { borderTopRightRadius: theme.shape.borderRadius },
  wordWrap: "break-word",
  whiteSpace: "normal",
  [theme.breakpoints.down("sm")]: { padding: "8px 8px", fontSize: "0.75rem" },
}));

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "success";
    case "partial":
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const rowsPerPage = 7;
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  // Load payments from backend
  // Load payments from backend
  const loadPayments = useCallback(async () => {
    if (!cooperativeId) return; // do nothing until we have it

    setLoading(true);
    try {
      const data = await fetchPayments(cooperativeId); // pass cooperativeId here
      const mapped = (data || []).map((p) => ({
        ...p,
        userName: p.userId?.names || "N/A",
      }));
      setPayments(mapped);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments. Check console for details.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0);

  const handlePaymentSuccess = useCallback(async () => {
    setShowAddModal(false);
    toast.success("Payment recorded successfully!");
    await loadPayments();
  }, [loadPayments]);

  const viewTransactions = () =>
    navigate("/admin/dashboard/payment-transaction");

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        switch (searchField) {
          case "user":
            return p.userName?.toLowerCase().includes(term);
          case "paymentDate":
            return p.createdAt
              ? new Date(p.createdAt).toLocaleDateString().includes(term)
              : false;
          case "amountPaid":
            return p.amountPaid?.toString().includes(term);
          default:
            return true;
        }
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [payments, currentPage, searchTerm, searchField, statusFilter]);

  const totalPages = useMemo(() => {
    let filtered = [...payments];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        switch (searchField) {
          case "user":
            return p.userName?.toLowerCase().includes(term);
          case "paymentDate":
            return p.createdAt
              ? new Date(p.createdAt).toLocaleDateString().includes(term)
              : false;
          case "amountPaid":
            return p.amountPaid?.toString().includes(term);
          default:
            return true;
        }
      });
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    return Math.ceil(filtered.length / rowsPerPage);
  }, [payments, searchTerm, searchField, statusFilter]);

  useEffect(() => setCurrentPage(1), [searchTerm, searchField, statusFilter]);

  const handlePageChange = useCallback((_, page) => setCurrentPage(page), []);

  //handle transaction

  const handleCheckboxChange = (paymentId) => {
    setSelectedPaymentId((prevId) => (prevId === paymentId ? null : paymentId));
  };

  const handleNavigateToTransactions = () => {
    if (selectedPaymentId) {
      navigate(`/admin/dashboard/payment-transaction/${selectedPaymentId}`);
    }
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Payments Dashboard</Typography>}
          action={
            <Stack direction={isMobile ? "column" : "row"} spacing={1}>
              <Button
                variant="contained"
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
                startIcon={<Visibility />}
                onClick={handleNavigateToTransactions}
                disabled={!selectedPaymentId} // disabled until a loan is checked
              >
                Transactions
              </Button>
            </Stack>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh-200px)" : "calc(100vh-150px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Search & Filter */}
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
              sx={{ minWidth: 120 }}
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
                  ? "Payment Date"
                  : "Amount Paid"
              }`}
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
              label="Status"
              size="small"
              fullWidth={isMobile}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
            </TextField>
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={downloadPaymentsPDF}
                sx={{ minWidth: 140 }}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<GridOnIcon />}
                onClick={downloadPaymentsExcel}
                sx={{ minWidth: 140 }}
              >
                {" "}
                Excel
              </Button>
            </Stack>
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
                maxHeight: "55vh",
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
                  sx={{ minWidth: 700, tableLayout: "auto" }} // Changed to 'auto' or 'fixed' as needed
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        Select
                      </StyledTableHeaderCell>

                      <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                      <StyledTableHeaderCell>User</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Paid Amount</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Amount Due</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Remaining</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Status</StyledTableHeaderCell>
                      <StyledTableHeaderCell>
                        Payment Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.length ? (
                      filteredPayments.map((p, i) => (
                        <TableRow hover key={p._id}>
                          <StyledTableCell>
                            <Checkbox
                              size="small"
                              checked={selectedPaymentId === p._id}
                              onChange={() => handleCheckboxChange(p._id)}
                            />
                          </StyledTableCell>

                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + i + 1}
                          </StyledTableCell>
                          <StyledTableCell>{p.userId?.names}</StyledTableCell>
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
                          <Typography color="text.secondary">
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
            <Box mt={3} display="flex" justifyContent="center">
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
        onSave={handlePaymentSuccess}
      />
    </Box>
  );
};

export default Payment;
