import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchAllProductions,
  createProduction,
  updateProduction,
  deleteProduction,
} from "../../services/productionService";

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
  Pagination, // Keeping Pagination for now, will replace with TablePagination if needed
  CircularProgress,
  MenuItem,
  // Chip // Uncomment if paymentStatus needs chipping as in other tables
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
import ClearIcon from "@mui/icons-material/Clear"; // For Clear Filters button

import AddProductionModal from "../../features/modals/AddProductionModal";
import UpdateProductionModal from "../../features/modals/UpdateProductionModal";

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
  backgroundColor: "#f5f5f5",
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

function Production() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);

  // ⭐ NEW STATE FOR CONFIRMATION DIALOG
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [productionToDeleteId, setProductionToDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7); // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const [sortOrder, setSortOrder] = useState("desc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadProductions = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available. Cannot load productions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchAllProductions(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setProductions(response.data);
      } else {
        console.error("Failed to fetch productions:", response.message);
        toast.error(response.message || "Failed to load productions.");
        setProductions([]);
      }
    } catch (error) {
      console.error("Failed to fetch productions (catch block):", error);
      toast.error("An unexpected error occurred while loading productions.");
      setProductions([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (cooperativeId) {
      loadProductions();
    }
  }, [cooperativeId, loadProductions]);

  const handleAddProduction = async (newProductionData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add production.");
      return;
    }
    try {
      const dataToSend = { ...newProductionData, cooperativeId };
      const response = await createProduction(dataToSend);
      if (response.success) {
        setShowAddModal(false);
        toast.success(response.message || "Production added successfully!");
        await loadProductions();
      } else {
        toast.error(response.message || "Failed to add production.");
      }
    } catch (error) {
      console.error("Error adding production:", error);
      toast.error("An unexpected error occurred while adding production.");
    }
  };

  const handleUpdateProduction = async (updatedData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update production.");
      return;
    }
    try {
      const { _id, ...dataToUpdate } = updatedData;
      const finalDataToUpdate = { ...dataToUpdate, cooperativeId };
      const response = await updateProduction(_id, finalDataToUpdate);
      if (response.success) {
        toast.success(response.message || "Production updated successfully!");
        setShowUpdateModal(false);
        setSelectedProduction(null);
        await loadProductions();
      } else {
        toast.error(response.message || "Failed to update production.");
      }
    } catch (error) {
      console.error("Failed to update production:", error);
      toast.error("An unexpected error occurred while updating production.");
    }
  };

  const handleOpenUpdateModal = (production) => {
    setSelectedProduction(production);
    setShowUpdateModal(true);
  };

  // ⭐ NEW FUNCTION: Open confirmation dialog for deletion
  const handleOpenConfirmDeleteDialog = (id) => {
    setProductionToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  };

  // ⭐ NEW FUNCTION: Close confirmation dialog (cancel deletion)
  const handleCancelDelete = () => {
    setProductionToDeleteId(null);
    setShowConfirmDeleteDialog(false);
  };

  // ⭐ NEW FUNCTION: Confirm and proceed with deletion
  const confirmDeleteProduction = async () => {
    if (!cooperativeId || !productionToDeleteId) {
      toast.error("Cooperative ID or Production ID is missing. Cannot delete production.");
      return;
    }
    try {
      const response = await deleteProduction(productionToDeleteId, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Production deleted successfully!");
        await loadProductions();
        // Adjust current page if the last item on a page was deleted
        if (currentRows.length === 1 && currentPage > 1) {
          setCurrentPage((prevPage) => prevPage - 1);
        }
      } else {
        toast.error(response.message || "Failed to delete production.");
      }
    } catch (error) {
      console.error("Failed to delete production (catch block):", error);
      toast.error(
        `Failed to delete production: ${
          error.message || "An unexpected error occurred."
        }`
      );
    } finally {
      handleCancelDelete(); // Always close the dialog
    }
  };

  // ⭐ MODIFIED handleDeleteProduction to use the confirmation dialog
  const handleDeleteProduction = (id) => {
    handleOpenConfirmDeleteDialog(id);
  };


  const filteredAndSortedProductions = useMemo(() => {
    let filtered = productions;

    if (searchTerm) {
      filtered = filtered.filter((production) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
            return production.userId?.names
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "productName":
            return production.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              production.seasonId?.name
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              production.seasonId?.year
                ?.toString()
                .includes(lowerCaseSearchTerm)
            );
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
    return filtered;
  }, [productions, searchTerm, searchField, sortOrder]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedProductions.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(
    filteredAndSortedProductions.length / rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedProductions]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchField('productName');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Productions</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#115293' },
                borderRadius: '8px',
                py: '8px',
                px: '12px',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Add Production
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
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track production data, including member contributions,
              product details, and quantity produced for your cooperative.
            </Typography>
          </Box>

          <Paper sx={{ mb: 3, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, borderRadius: '8px', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
              {/* Search Bar */}
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search productions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: '300px', md: '350px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#bdbdbd' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
                  },
                  '& .MuiInputBase-input': { padding: '8px 12px' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#757575' }} />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Search By Select (re-arranged into a Stack) */}
              <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "stretch" : "center"}>
                <TextField
                  select
                  label="Search By"
                  size="small"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  sx={{ minWidth: 120, flexShrink: 0 }}
                >
                  <MenuItem value="productName">Product Name</MenuItem>
                  <MenuItem value="member">Member Name</MenuItem>
                  <MenuItem value="season">Season/Year</MenuItem>
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
                {(searchTerm || searchField !== 'productName' || sortOrder !== 'desc') && (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    size="small"
                    sx={{ ml: { xs: 0, md: 'auto' }, mt: { xs: 1, md: 0 } }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>

          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ boxShadow: 3, borderRadius: 2, overflowX: "auto", maxHeight: { xs: '50vh', md: '70vh' } }}
              >
                <Table stickyHeader size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}> {/* Increased minWidth */}
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%", minWidth: '120px' }}>
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%", minWidth: '120px' }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%", minWidth: '120px' }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "8%", minWidth: '80px' }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%", minWidth: '100px' }}>
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%", minWidth: '100px' }}>
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%", minWidth: '90px' }}>
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "8%", minWidth: '80px' }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((production, index) => (
                        <TableRow
                          hover
                          key={production._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.userId?.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.seasonId?.name || "N/A"}(
                            {production.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.quantity}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(production.unitPrice)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(production.totalPrice)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.createdAt
                              ? new Date(
                                  production.createdAt
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
                                  handleOpenUpdateModal(production)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleDeleteProduction(production._id)
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
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No production found for this cooperative.
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

      <AddProductionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduction}
        cooperativeId={cooperativeId}
      />
      <UpdateProductionModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProduction}
        initialData={selectedProduction}
        cooperativeId={cooperativeId}
      />

      {/* ⭐ NEW: Confirmation Dialog for Deletion */}
      <Dialog
        open={showConfirmDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          <Typography variant="h6" color="error">Confirm Deletion</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-delete-dialog-description">
            Are you sure you want to permanently delete this production record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteProduction} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Production;
