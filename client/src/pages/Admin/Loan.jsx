import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  TextField,
  MenuItem,
  Chip,
  Stack,
  Tooltip,
  useMediaQuery,
  styled,
  Pagination,
} from "@mui/material";
import {
  Visibility,
  Add,
  Payment,
  Edit,
  Delete,
  Search,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  fetchLoans,
  updateLoans,
  deleteLoans,
  createLoan,
} from "../../services/loanService";
import AddLoanModal from "../../features/modals/AddLoanModal";
import PayLoanModal from "../../features/modals/PayLoanModal";
import UpdateLoanModal from "../../features/modals/UpdateLoanModal";

// Styled components for a cleaner look
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
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    // Apply on small screens
    padding: "6px 8px", // Reduced padding for mobile
    fontSize: "0.75rem", // Slightly smaller font size
  },
}));

// Styled component for table header cells - Adjusted padding for responsiveness
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px", // Default padding
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

function Loan() {
  const [loans, setLoans] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadLoans = async () => {
    try {
      const loansData = await fetchLoans();
      setLoans(loansData || []);
    } catch (error) {
      toast.error("Failed to load loans.");
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);

  const handlePayLoan = async (loanId, amountPaid) => {
    try {
      await updateLoans(loanId, { amountPaid });
      toast.success("Loan payment processed successfully!");
      await loadLoans();
      setShowPayModal(false);
    } catch {
      toast.error("Failed to process payment.");
    }
  };

  const handleUpdateLoan = async (loanId, updatedData) => {
    try {
      await updateLoans(loanId, updatedData);
      toast.success("Loan updated successfully!");
      await loadLoans();
      setShowUpdateModal(false);
    } catch {
      toast.error("Failed to update loan.");
    }
  };

  const handleDeleteLoan = async (id) => {
    try {
      await deleteLoans(id);
      toast.success("Loan deleted successfully!");
      await loadLoans();
    } catch {
      toast.error("Failed to delete loan.");
    }
  };

  const filteredLoans = useMemo(() => {
    let updated = loans;

    if (searchTerm) {
      updated = updated.filter((loan) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "name":
            return loan.purchaseInputId?.userId?.names
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "product":
            return loan.purchaseInputId?.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              loan.purchaseInputId?.seasonId?.name
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              loan.purchaseInputId?.seasonId?.year
                ?.toString()
                .includes(lowerCaseSearchTerm)
            );
          default:
            return true;
        }
      });
    }

    if (statusFilter !== "all") {
      updated = updated.filter((loan) => loan.status === statusFilter);
    }

    return updated;
  }, [loans, searchTerm, searchField, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [filteredLoans]);

  const paginatedLoans = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredLoans.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLoans, page, rowsPerPage]);

  const pageCount = Math.ceil(filteredLoans.length / rowsPerPage);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      {" "}
      {/* Reduced top padding (pt) to 0 */}
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Loan Dashboard</Typography>}
          action={
            <Stack direction={isMobile ? "column" : "row"} spacing={1}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<Add />}
                onClick={() => setShowAddModal(true)}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                Add Loan
              </Button>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Visibility />}
                onClick={() => navigate("/admin/dashboard/loan-transaction")}
              >
                Transactions
              </Button>
            </Stack>
          }
        />
        <CardContent>
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
              <MenuItem value="name">Member Name</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="season">Season/Year</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "name"
                  ? "Member Name"
                  : searchField === "product"
                  ? "Product"
                  : "Season/Year"
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
              label="Status Filter"
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

          {/* Table Container */}
          <TableContainer
            component={Paper}
            sx={{ overflowX: "auto", borderRadius: 2, boxShadow: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Member</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Product</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Season (Year)</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Quantity</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Amount Owed</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Interest</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Status</StyledTableHeaderCell>
                  <StyledTableHeaderCell align="center">
                    Actions
                  </StyledTableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLoans.length > 0 ? (
                  paginatedLoans.map((loan, index) => (
                    <TableRow hover key={loan._id}>
                      <StyledTableCell>
                        {(page - 1) * rowsPerPage + index + 1}
                      </StyledTableCell>
                      <StyledTableCell>
                        {loan.purchaseInputId?.userId?.names ||
                          loan.userId?.names}
                      </StyledTableCell>
                      <StyledTableCell>
                        {loan.purchaseInputId?.productId?.productName ||
                          "Money"}
                      </StyledTableCell>
                      <StyledTableCell>
                        {loan.purchaseInputId?.seasonId?.name || "N/A"} (
                        {loan.purchaseInputId?.seasonId?.year || "N/A"})
                      </StyledTableCell>
                      <StyledTableCell>
                        {loan.purchaseInputId?.quantity || "N/A"}
                      </StyledTableCell>
                      <StyledTableCell>
                        {formatCurrency(loan.amountOwed)}
                      </StyledTableCell>
                      <StyledTableCell>{loan.interest}</StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={loan.status}
                          size="small"
                          color={getStatusColor(loan.status)}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          {loan.status === "pending" && (
                            <Tooltip title="Pay Loan">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setShowPayModal(true);
                                }}
                              >
                                <Payment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit Loan">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setShowUpdateModal(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Loan">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLoan(loan._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        p={2}
                      >
                        No loans found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls moved to the bottom */}
          {pageCount > 1 && (
            <Box
              mt={3}
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection={isMobile ? "column" : "row"}
              gap={2}
            >
              <Pagination
                count={pageCount}
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
      {/* Modals */}
      {showPayModal && (
        <PayLoanModal
          show={showPayModal}
          loan={selectedLoan}
          onClose={() => setShowPayModal(false)}
          onSubmit={handlePayLoan}
        />
      )}
      {showUpdateModal && (
        <UpdateLoanModal
          show={showUpdateModal}
          loan={selectedLoan}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={handleUpdateLoan}
        />
      )}
      {showAddModal && (
        <AddLoanModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            try {
              await createLoan(data);
              toast.success("Loan added successfully!");
              await loadLoans();
              setShowAddModal(false);
            } catch {
              toast.error("Failed to add loan.");
            }
          }}
        />
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default Loan;
