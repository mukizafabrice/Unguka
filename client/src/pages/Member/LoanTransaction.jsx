import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLoanTransactions } from "../../services/loanTransactionService";
import { ArrowLeft, Search } from "lucide-react";
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
} from "@mui/material";
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
  switch (status) {
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
  const rowsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("member");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { loanId } = useParams();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      if (loanId) {
        const res = await fetchLoanTransactions(loanId);
        setTransactions(res.transactions || []);
      } else {
        const res = await fetchLoanTransactions();
        setTransactions(res.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch loan transactions:", error);
      toast.error("Failed to load loan transactions.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const handleBack = () => navigate(-1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    let currentFiltered = transactions;

    if (searchTerm) {
      currentFiltered = currentFiltered.filter((tx) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
            return (
              tx.loanId?.purchaseInputId?.userId?.names
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              tx.loanId?.userId?.names
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm)
            );
          case "product":
            return tx.loanId?.purchaseInputId?.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "date":
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

    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (tx) => tx.loanId?.status === statusFilter
      );
    }

    return currentFiltered;
  }, [transactions, searchTerm, searchField, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  return (
    <Box p={isMobile ? 2 : 3}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Loan Transactions</Typography>}
          action={
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ArrowLeft size={18} />}
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
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              View and manage all loan payment transactions.
            </Typography>
          </Box>

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
                  : "Date"
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
                <Table size="small" sx={{ minWidth: 700, tableLayout: "auto" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Date
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((tx, index) => (
                        <TableRow hover key={tx._id}>
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
        </CardContent>
      </Card>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default LoanTransactions;
