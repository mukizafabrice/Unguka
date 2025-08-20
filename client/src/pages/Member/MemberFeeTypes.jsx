import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
} from "../../services/feeTypeService"; // Import from the updated service file

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
  Chip, // For status display
  Dialog, // ⭐ Added for confirmation dialog
  DialogTitle, // ⭐ Added for confirmation dialog
  DialogContent, // ⭐ Added for confirmation dialog
  DialogActions, // ⭐ Added for confirmation dialog
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear"; // Import ClearIcon

import AddFeeTypeModal from "../../features/modals/AddFeeTypeModal"; // Path assuming it's in a 'modals' subfolder
import UpdateFeeTypeModal from "../../features/modals/UpdateFeeTypeModal"; // Path assuming it's in a 'modals' subfolder

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
  backgroundColor: "#f5f5f5", // Explicit background for header
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
    case "active":
      return "success";
    case "inactive":
      return "error";
    default:
      return "default";
  }
};

function FeeTypeManagement() {
  // Get user and cooperativeId from AuthContext
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the manager belongs to

  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState(null); // Changed name from feeTypeToEdit

  // ⭐ NEW STATE FOR CONFIRMATION DIALOG
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [feeTypeToDeleteId, setFeeTypeToDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPerSeasonFilter, setIsPerSeasonFilter] = useState("all"); // 'all', 'true', 'false'
  const [sortOrder, setSortOrder] = useState("asc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to load fee types data from the backend, filtered by cooperativeId
  const loadFeeTypes = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available. Cannot load fee types.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass cooperativeId to fetchFeeTypes
      const response = await fetchFeeTypes(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setFeeTypes(response.data);
      } else {
        console.error("Failed to fetch fee types:", response.message);
        toast.error(response.message || "Failed to load fee types.");
        setFeeTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch fee types (catch block):", error);
      toast.error("An unexpected error occurred while loading fee types.");
      setFeeTypes([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (cooperativeId) {
      // Only load if cooperativeId is available
      loadFeeTypes();
    }
  }, [cooperativeId, loadFeeTypes]);

  // Handler for adding a new fee type
  const handleAddFeeType = async (newFeeTypeData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add fee type.");
      return;
    }
    try {
      // Add cooperativeId to the data before sending
      const dataToSend = { ...newFeeTypeData, cooperativeId };
      const response = await createFeeType(dataToSend);
      if (response.success) {
        toast.success(response.message || "Fee type added successfully!");
        setShowAddModal(false);
        await loadFeeTypes();
      } else {
        toast.error(response.message || "Failed to add fee type.");
      }
    } catch (error) {
      console.error("Failed to add fee type:", error);
      toast.error("An unexpected error occurred while adding fee type.");
    }
  };

  const handleOpenUpdateModal = (feeType) => {
    setSelectedFeeType(feeType); // Set selectedFeeType for the modal
    setShowUpdateModal(true);
  };

  // Handler for updating a fee type
  const handleUpdateFeeType = async (updatedFeeTypeData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update fee type.");
      return;
    }
    try {
      const { _id, ...dataToUpdate } = updatedFeeTypeData;
      // Add cooperativeId to the data before sending
      const dataToSend = { ...dataToUpdate, cooperativeId };
      const response = await updateFeeType(_id, dataToSend);
      if (response.success) {
        toast.success(response.message || "Fee type updated successfully!");
        setShowUpdateModal(false);
        setSelectedFeeType(null); // Clear selected fee type
        await loadFeeTypes();
      } else {
        toast.error(response.message || "Failed to update fee type.");
      }
    } catch (error) {
      console.error("Failed to update fee type:", error);
      toast.error("An unexpected error occurred while updating fee type.");
    }
  };

  // ⭐ NEW FUNCTION: Open confirmation dialog for deletion
  const handleOpenConfirmDeleteDialog = (id) => {
    setFeeTypeToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  };

  // ⭐ NEW FUNCTION: Close confirmation dialog (cancel deletion)
  const handleCancelDelete = () => {
    setFeeTypeToDeleteId(null);
    setShowConfirmDeleteDialog(false);
  };

  // ⭐ NEW FUNCTION: Confirm and proceed with deletion
  const confirmDeleteFeeType = async () => {
    if (!cooperativeId || !feeTypeToDeleteId) {
      toast.error(
        "Cooperative ID or Fee Type ID is missing. Cannot delete fee type."
      );
      return;
    }
    try {
      // Pass cooperativeId to deleteFeeType for backend authorization
      const response = await deleteFeeType(feeTypeToDeleteId, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Fee type deleted successfully!");
        await loadFeeTypes();
        // Adjust current page if the last item on a page was deleted
        if (currentRows.length === 1 && currentPage > 1) {
          setCurrentPage((prevPage) => prevPage - 1);
        }
      } else {
        toast.error(response.message || "Failed to delete fee type.");
      }
    } catch (error) {
      console.error("Failed to delete fee type (catch block):", error);
      toast.error(
        `Failed to delete fee type: ${
          error.message || "An unexpected error occurred."
        }`
      );
    } finally {
      handleCancelDelete(); // Always close the dialog
    }
  };

  // ⭐ MODIFIED handleDeleteFeeType to use the confirmation dialog
  const handleDeleteFeeType = (id) => {
    handleOpenConfirmDeleteDialog(id);
  };

  // Filter and sort fee types based on search, status filter, and sort order
  const filteredAndSortedFeeTypes = useMemo(() => {
    let filtered = feeTypes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((feeType) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "name":
            return feeType.name?.toLowerCase().includes(lowerCaseSearchTerm);
          case "amount":
            return feeType.amount?.toString().includes(lowerCaseSearchTerm);
          case "description":
            return feeType.description
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "status":
            return feeType.status?.toLowerCase().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (feeType) =>
          feeType.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply isPerSeason filter
    if (isPerSeasonFilter !== "all") {
      const isPerSeasonBool = isPerSeasonFilter === "true";
      filtered = filtered.filter(
        (feeType) => feeType.isPerSeason === isPerSeasonBool
      );
    }

    // Apply sorting by name or amount
    filtered.sort((a, b) => {
      let comparison = 0;
      if (searchField === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        comparison = nameA.localeCompare(nameB);
      } else if (searchField === "amount") {
        comparison = (a.amount || 0) - (b.amount || 0); // Numerical sort for amount
      } else {
        // Default sort by name if search field is not name/amount
        const nameA = a.name || "";
        const nameB = b.name || "";
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    feeTypes,
    searchTerm,
    searchField,
    statusFilter,
    isPerSeasonFilter,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredAndSortedFeeTypes.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedFeeTypes.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedFeeTypes]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchField("name");
    setStatusFilter("all");
    setIsPerSeasonFilter("all");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0);
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        FeeTypes
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
              Manage different types of fees, including their amounts, whether
              they are per season, and if they auto-apply.
            </Typography>
          </Box>

          {/* Search, Filter, and Sort Section */}
          <Paper
            sx={{
              mb: 3,
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
              borderRadius: "8px",
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: { xs: 1, sm: 2 },
              }}
            >
              {/* Search Bar */}
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search fee types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: "300px", md: "350px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "25px",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&:hover fieldset": { borderColor: "#bdbdbd" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": { padding: "8px 12px" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#757575" }} />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Filter and Sort Buttons */}
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
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
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                  <MenuItem value="description">Description</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Status Filter"
                  size="small"
                  fullWidth={isMobile}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: isMobile ? "100%" : 120 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Per Season Filter"
                  size="small"
                  fullWidth={isMobile}
                  value={isPerSeasonFilter}
                  onChange={(e) => setIsPerSeasonFilter(e.target.value)}
                  sx={{ minWidth: isMobile ? "100%" : 120 }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="true">Per Season</MenuItem>
                  <MenuItem value="false">Not Per Season</MenuItem>
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
                  Sort by {searchField === "amount" ? "Amount" : "Name"}{" "}
                  {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
                </Button>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  isPerSeasonFilter !== "all" ||
                  sortOrder !== "asc") && (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    size="small"
                    sx={{ ml: { xs: 0, md: "auto" }, mt: { xs: 1, md: 0 } }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>

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
                <Table
                  size="small"
                  sx={{ tableLayout: "fixed", minWidth: 800 }}
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "40%" }}>
                        Description
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Per Season
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((feeType, index) => (
                        <TableRow hover key={feeType._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {feeType.name || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(feeType.amount)}
                          </StyledTableCell>
                          <StyledTableCell sx={{ whiteSpace: "normal" }}>
                            {feeType.description || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={feeType.status || "N/A"}
                              size="small"
                              color={getStatusColor(feeType.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {feeType.isPerSeason ? "Yes" : "No"}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No fee types found for this cooperative.
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

      <AddFeeTypeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFeeType}
      />
      <UpdateFeeTypeModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateFeeType}
        initialData={selectedFeeType}
      />
    </Box>
  );
}

export default FeeTypeManagement;
