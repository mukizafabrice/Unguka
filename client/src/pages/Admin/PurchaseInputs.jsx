import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ NEW: Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchPurchaseInputs,
  createPurchaseInput, // ⭐ Corrected to singular as per service file
  updatePurchaseInput, // ⭐ Corrected to singular as per service file
  deletePurchaseInput, // ⭐ Corrected to singular as per service file
} from "../../services/purchaseInputService"; // ⭐ Corrected service import path/name

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
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  useMediaQuery,
  styled,
  Pagination,
  CircularProgress,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AddPurchaseInputModal from "../../features/modals/AddPurchaseInputModal";
import UpdatePurchaseInputModal from "../../features/modals/UpdatePurchaseInputModal";

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
  backgroundColor: "#f5f5f5", // ⭐ Corrected to match ManagersTable.jsx design
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
    case "loan": // ⭐ Changed from 'pending' to 'loan' to match PurchaseInput model enum
      return "warning";
    default:
      return "default";
  }
};

function PurchaseInputs() {
  // ⭐ Get user and cooperativeId from AuthContext
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the manager belongs to

  const [purchaseInputs, setPurchaseInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseInput, setSelectedPurchaseInput] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("member");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  // ⭐ Modified loadPurchaseInputs to fetch purchases for the specific cooperativeId
  const loadPurchaseInputs = useCallback(async () => {
    if (!cooperativeId) {
      toast.error(
        "Cooperative ID is not available. Cannot load purchase inputs."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass the cooperativeId to fetchPurchaseInputs
      const response = await fetchPurchaseInputs(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        // Ensure response structure is handled
        setPurchaseInputs(response.data);
      } else {
        console.error("Failed to fetch purchase inputs:", response.message);
        toast.error(response.message || "Failed to load purchases.");
        setPurchaseInputs([]);
      }
    } catch (error) {
      console.error("Failed to fetch purchase inputs (catch block):", error);
      toast.error("An unexpected error occurred while loading purchases.");
      setPurchaseInputs([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

  useEffect(() => {
    // Only load purchases if cooperativeId is available
    if (cooperativeId) {
      loadPurchaseInputs();
    }
  }, [cooperativeId, loadPurchaseInputs]); // Depend on cooperativeId and loadPurchaseInputs

  // ⭐ Modified handleAddPurchaseInput to include cooperativeId
  const handleAddPurchaseInput = async (newPurchaseInputData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add purchase.");
      return;
    }
    try {
      // Add the cooperativeId to the data before sending
      const dataToSend = {
        ...newPurchaseInputData,
        cooperativeId: cooperativeId,
      };
      const response = await createPurchaseInput(dataToSend); // ⭐ Corrected service call
      if (response.success) {
        toast.success(response.message || "Purchase added successfully!");
        await loadPurchaseInputs();
        setShowAddModal(false);
      } else {
        toast.error(response.message || "Failed to add purchase.");
      }
    } catch (error) {
      console.error("Failed to add purchase:", error);
      toast.error(
        `Failed to add purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (purchaseInput) => {
    setSelectedPurchaseInput(purchaseInput);
    setShowUpdateModal(true);
  };

  // ⭐ Modified handleUpdatePurchaseInput to include cooperativeId
  const handleUpdatePurchaseInput = async (updatedPurchaseInputData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update purchase.");
      return;
    }
    try {
      const { _id, ...dataToUpdate } = updatedPurchaseInputData;
      // Add the cooperativeId to the data before sending for update
      const dataToSend = { ...dataToUpdate, cooperativeId: cooperativeId };
      const response = await updatePurchaseInput(
        _id, // Pass the extracted _id
        dataToSend // Pass the data with cooperativeId
      ); // ⭐ Corrected service call
      if (response.success) {
        toast.success(response.message || "Purchase updated successfully!");
        await loadPurchaseInputs();
        setShowUpdateModal(false);
        setSelectedPurchaseInput(null);
      } else {
        toast.error(response.message || "Failed to update purchase.");
      }
    } catch (error) {
      console.error("Failed to update purchase:", error);
      toast.error(
        `Failed to update purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // ⭐ Modified handleDeletePurchaseInput to include cooperativeId
  const handleDeletePurchaseInput = async (id) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot delete purchase.");
      return;
    }
    // Using window.confirm for simplicity, consider a custom MUI dialog for better UX
    if (
      window.confirm(
        "Are you sure you want to delete this purchase? This action cannot be undone."
      )
    ) {
      try {
        // Pass the cooperativeId to deletePurchaseInput for backend authorization
        const response = await deletePurchaseInput(id, cooperativeId); // ⭐ Corrected service call
        if (response.success) {
          toast.success(response.message || "Purchase deleted successfully!");
          await loadPurchaseInputs();
        } else {
          toast.error(response.message || "Failed to delete purchase.");
        }
      } catch (error) {
        console.error("Failed to delete purchase:", error);
        toast.error(
          `Failed to delete purchase: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  // Filter and sort purchase inputs based on search, filter, and sort order
  const filteredAndSortedPurchaseInputs = useMemo(() => {
    let filtered = purchaseInputs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((pi) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
            return pi.userId?.names
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "productName":
            return pi.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              pi.seasonId?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
              pi.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "date":
            return pi.createdAt
              ? new Date(pi.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (pi) => pi.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by date (createdAt) - newest first by default
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime(); // Oldest first
      } else {
        return dateB.getTime() - dateA.getTime(); // Newest first
      }
    });

    return filtered;
  }, [purchaseInputs, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(
    filteredAndSortedPurchaseInputs.length / rowsPerPage
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPurchaseInputs.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPurchaseInputs]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Purchases Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Purchase
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
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Manage and track all purchase records, including member details,
              product information, and payment status.
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
              <MenuItem value="member">Member Name</MenuItem>
              <MenuItem value="productName">Product Name</MenuItem>
              <MenuItem value="season">Season/Year</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "member"
                  ? "Member Name"
                  : searchField === "productName"
                  ? "Product Name"
                  : searchField === "season"
                  ? "Season/Year"
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
              label="Status Filter"
              size="small"
              fullWidth={isMobile}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="loan">Loan</MenuItem>{" "}
              {/* ⭐ Changed from 'pending' to 'loan' */}
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
                  overflowX: "auto",
                  borderRadius: 2,
                  boxShadow: 2,
                  flexGrow: 1,
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "8%" }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Total Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Amount Paid
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Remaining
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "8%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "9%" }}>
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "10%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((purchaseInput, index) => (
                        <TableRow hover key={purchaseInput._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseInput.userId?.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseInput.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseInput.seasonId?.name || "N/A"}(
                            {purchaseInput.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseInput.quantity || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseInput.unitPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseInput.totalPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseInput.amountPaid || 0)}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{
                              color:
                                purchaseInput.amountRemaining > 0
                                  ? "error.main"
                                  : "success.main",
                              fontWeight: "bold",
                            }}
                          >
                            {formatCurrency(purchaseInput.amountRemaining || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={purchaseInput.status}
                              size="small"
                              color={getStatusColor(purchaseInput.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseInput.createdAt
                              ? new Date(
                                  purchaseInput.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="center"
                            >
                              <IconButton
                                aria-label="update"
                                color="primary"
                                size="small"
                                onClick={() =>
                                  handleOpenUpdateModal(purchaseInput)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleDeletePurchaseInput(purchaseInput._id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No Purchases found for this cooperative.
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

      <AddPurchaseInputModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseInput}
        cooperativeId={cooperativeId} // ⭐ Pass cooperativeId to AddPurchaseInputModal
      />

      <UpdatePurchaseInputModal
        show={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedPurchaseInput(null);
        }}
        onSubmit={handleUpdatePurchaseInput}
        initialData={selectedPurchaseInput}
        cooperativeId={cooperativeId} // ⭐ Pass cooperativeId to UpdatePurchaseInputModal
      />
    </Box>
  );
}

export default PurchaseInputs;
