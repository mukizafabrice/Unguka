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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
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
  fetchAllCooperativeLoans,
  updateLoan,
  deleteLoan,
  createLoan,
} from "../../services/loanService";
import AddLoanModal from "../../features/modals/AddLoanModal";
import PayLoanModal from "../../features/modals/PayLoanModal";
import UpdateLoanModal from "../../features/modals/UpdateLoanModal";

// Styled components
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
    padding: "6px 8px",
    fontSize: "0.75rem",
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
    padding: "8px 8px",
    fontSize: "0.75rem",
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
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null); // State for the selected loan ID
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const loansData = await fetchAllCooperativeLoans();
      setLoans(loansData || []);
    } catch (error) {
      console.error("Failed to load loans:", error);
      toast.error("Failed to load loans.");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);

  const handleApiCall = useCallback(
    async (apiFunction, successMessage, errorMessage) => {
      try {
        await apiFunction();
        toast.success(successMessage);
        await loadLoans();
      } catch (error) {
        console.error(errorMessage, error);
        toast.error(
          `${errorMessage}: ${error.response?.data?.message || error.message}`
        );
      }
    },
    [loadLoans]
  );

  const handlePayLoan = (loanId, amountPaid) => {
    handleApiCall(
      () => updateLoan(loanId, { amountPaid }),
      "Loan payment processed successfully!",
      "Failed to process payment"
    );
    setShowPayModal(false);
  };

  const handleUpdateLoan = (loanId, updatedData) => {
    handleApiCall(
      () => updateLoan(loanId, updatedData),
      "Loan updated successfully!",
      "Failed to update loan"
    );
    setShowUpdateModal(false);
  };

  const handleAddLoan = (data) => {
    handleApiCall(
      () => createLoan(data),
      "Loan added successfully!",
      "Failed to add loan"
    );
    setShowAddModal(false);
  };

  const confirmDelete = (loan) => {
    setLoanToDelete(loan);
    setShowDeleteConfirm(true);
  };

  const handleExecuteDelete = () => {
    if (loanToDelete) {
      handleApiCall(
        () => deleteLoan(loanToDelete._id),
        "Loan deleted successfully!",
        "Failed to delete loan"
      );
      setLoanToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Handler for checkbox change
  const handleCheckboxChange = (loanId) => {
    setSelectedLoanId((prevId) => (prevId === loanId ? null : loanId));
  };

  // Handler for navigating to loan transactions
  const handleNavigateToTransactions = () => {
    if (selectedLoanId) {
      navigate(`/admin/dashboard/loan-transaction/${selectedLoanId}`);
    }
  };

  const filteredLoans = useMemo(() => {
    let updated = loans;
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      updated = updated.filter((loan) => {
        const userNames =
          loan.purchaseInputId?.userId?.names?.toLowerCase() ||
          loan.userId?.names?.toLowerCase();
        const productName =
          loan.purchaseInputId?.productId?.productName?.toLowerCase();
        const seasonName =
          loan.purchaseInputId?.seasonId?.name?.toLowerCase() ||
          loan.seasonId?.name?.toLowerCase();
        const seasonYear =
          loan.purchaseInputId?.seasonId?.year?.toString() ||
          loan.seasonId?.year?.toString();

        switch (searchField) {
          case "name":
            return userNames?.includes(lowerCaseSearchTerm) || false;
          case "product":
            return productName?.includes(lowerCaseSearchTerm) || false;
          case "season":
            return (
              seasonName?.includes(lowerCaseSearchTerm) ||
              seasonYear?.includes(lowerCaseSearchTerm) ||
              false
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={5}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
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
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Add Loan
              </Button>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Visibility />}
                onClick={handleNavigateToTransactions} // Changed onClick
                disabled={!selectedLoanId} // Disabled if no loan is selected
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Transactions
              </Button>
            </Stack>
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
              Manage and track loan records, including borrower details, product
              information, and payment status.
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
                      Select
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "5%" }}>
                      ID
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "15%" }}>
                      Member
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "15%" }}>
                      Product
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "15%" }}>
                      Season (Year)
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "12%" }}>
                      Loan Owed
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "12%" }}>
                      Amount Owed
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "8%" }}>
                      Interest Rate
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell sx={{ width: "8%" }}>
                      Status
                    </StyledTableHeaderCell>
                    <StyledTableHeaderCell>Date</StyledTableHeaderCell>
                    <StyledTableHeaderCell align="center" sx={{ width: "14%" }}>
                      Actions
                    </StyledTableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan, index) => (
                      <TableRow hover key={loan._id}>
                        <StyledTableCell>
                          <Checkbox
                            size="small"
                            checked={selectedLoanId === loan._id}
                            onChange={() => handleCheckboxChange(loan._id)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          {(page - 1) * rowsPerPage + index + 1}
                        </StyledTableCell>
                        <StyledTableCell>
                          {loan.purchaseInputId?.userId?.names ||
                            loan.userId?.names ||
                            "N/A"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {loan.purchaseInputId?.productId?.productName ||
                            "Money" ||
                            "N/A"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {loan.seasonId?.name || "N/A"} (
                          {loan.seasonId?.year || "N/A"})
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatCurrency(loan.loanOwed)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatCurrency(loan.amountOwed)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {loan.interest || "N/A"}%
                        </StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={loan.status}
                            size="small"
                            color={getStatusColor(loan.status)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          {loan.createdAt
                            ? new Date(loan.createdAt).toLocaleDateString()
                            : "N/A"}
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
                                onClick={() => confirmDelete(loan)}
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
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No loans found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {pageCount > 1 && (
            <Box
              mt={3}
              display="flex"
              justifyContent="center"
              sx={{ flexShrink: 0 }}
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
          onSubmit={handleAddLoan}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this loan for{" "}
            <span style={{ fontWeight: "bold" }}>
              {loanToDelete?.purchaseInputId?.userId?.names ||
                loanToDelete?.userId?.names ||
                "N/A"}
            </span>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleExecuteDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default Loan;
