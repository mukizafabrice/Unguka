import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
} from "../../services/feeTypeService";

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
  Chip, // Added Chip for status display
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AddFeeTypeModal from "../../features/modals/AddFeeTypeModal";
import UpdateFeeTypeModal from "../../features/modals/UpdateFeeTypeModal";

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

// Helper function for status chip color (assuming 'Active' and 'Inactive' statuses)
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

function FeeType() {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [feeTypeToEdit, setFeeTypeToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status (e.g., 'active', 'inactive', 'all')
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch fee types from the backend
  const loadFeeTypes = useCallback(async () => {
    setLoading(true);
    try {
      const feeTypesData = await fetchFeeTypes();
      setFeeTypes(feeTypesData || []);
    } catch (error) {
      console.error("Failed to fetch fee types:", error);
      toast.error("Failed to load fee types.");
      setFeeTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load on component mount
  useEffect(() => {
    loadFeeTypes();
  }, [loadFeeTypes]);

  // Handler for adding a new fee type
  const handleAddFeeType = async (feeTypeData) => {
    try {
      await createFeeType(feeTypeData);
      setShowAddModal(false);
      toast.success("Fee Type added successfully!");
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error adding fee type:", error);
      toast.error(
        `Failed to add fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a fee type
  const handleDeleteFeeType = async (id) => {
    try {
      await deleteFeeType(id);
      toast.success("Fee Type deleted successfully!");
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error deleting fee type:", error);
      toast.error(
        `Failed to delete fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler to open the update modal with the selected fee type's data
  const handleUpdateFeeType = (feeType) => {
    setFeeTypeToEdit(feeType);
    setShowUpdateModal(true);
  };

  // Handler for submitting the updated fee type
  const handleFeeTypeUpdated = async (id, updatedFeeTypeData) => {
    try {
      await updateFeeType(id, updatedFeeTypeData);
      toast.success("Fee Type updated successfully!");
      setShowUpdateModal(false);
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error updating fee type:", error);
      toast.error(
        `Failed to update fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Filter and sort fee types based on searchTerm, searchField, statusFilter, and sortOrder
  const filteredAndSortedFeeTypes = useMemo(() => {
    let filtered = feeTypes;

    // Apply search term filter
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

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (searchField === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        comparison = nameA.localeCompare(nameB);
      } else if (searchField === "amount") {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (searchField === "status") {
        const statusA = a.status || "";
        const statusB = b.status || "";
        comparison = statusA.localeCompare(statusB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [feeTypes, searchTerm, searchField, statusFilter, sortOrder]);

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

  const handlePageChange = useCallback((event, pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Fee Types Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Fee Type
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track different types of fees, including their names,
              amounts, descriptions, and statuses.
            </Typography>
          </Box>

          {/* Search, Filter, and Sort Section */}
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
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="description">Description</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "name"
                  ? "Name"
                  : searchField === "amount"
                  ? "Amount"
                  : searchField === "description"
                  ? "Description"
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
              Sort by{" "}
              {searchField === "name"
                ? "Name"
                : searchField === "amount"
                ? "Amount"
                : "Status"}{" "}
              {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
            </Button>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  overflowX: "auto",
                  flexGrow: 1, // Allows table to take up available height
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "30%" }}>
                        Description
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "20%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((feeType, index) => (
                        <TableRow
                          hover
                          key={feeType._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>{feeType.name}</StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(feeType.amount)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {feeType.description || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={feeType.status}
                              size="small"
                              color={getStatusColor(feeType.status)}
                            />
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
                                onClick={() => handleUpdateFeeType(feeType)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteFeeType(feeType._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No fee types found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

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
            </>
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
        onSubmit={handleFeeTypeUpdated}
        feeTypeToEdit={feeTypeToEdit}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
}

export default FeeType;
