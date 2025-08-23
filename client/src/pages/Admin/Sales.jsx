import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchAllSales,
  deleteSale,
  updateSale,
  createSale,
} from "../../services/salesService";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Assuming these modals are correctly implemented and accept the cooperativeId prop
import UpdateSaleModal from "../../features/modals/UpdateSaleModal";
import AddSaleModal from "../../features/modals/AddSaleModal";

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
  // Responsive adjustments for smaller screens
  [theme.breakpoints.down("sm")]: {
    padding: "4px 6px",
    fontSize: "0.75rem", // Slightly increased for better readability on small screens
  },
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: "#f5f5f5", // Adjusted for solid background in header
  color: theme.palette.text.primary,
  fontWeight: 600,
  borderBottom: `2px solid ${theme.palette.divider}`,
  // Removed fixed widths, let content and minWidth of table handle it
  "&:first-of-type": {
    borderTopLeftRadius: theme.shape.borderRadius,
  },
  "&:last-of-type": {
    borderTopRightRadius: theme.shape.borderRadius,
  },
  wordWrap: "break-word",
  whiteSpace: "normal",
  // Responsive adjustments for smaller screens
  [theme.breakpoints.down("sm")]: {
    padding: "6px 6px",
    fontSize: "0.7rem", // Slightly increased for better readability
  },
}));

// Helper function for status chip color
const getStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "success";
    case "unpaid":
      return "warning";
    default:
      return "default";
  }
};

function Sales() {
  const { user } = useAuth();
  // Ensure cooperativeId is always a string or null
  const cooperativeId = user?.cooperativeId || null;

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [saleToDeleteId, setSaleToDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("product"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date, newest first

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Modified loadSales to fetch sales for the specific cooperativeId
  const loadSales = useCallback(async () => {
    if (!cooperativeId) {
      toast.error(
        "Manager's cooperative ID is not available. Cannot load sales."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass the cooperativeId to fetchAllSales
      const response = await fetchAllSales(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        // Adjust this based on your actual API response structure
        setSales(response.data);
      } else {
        console.error("Failed to fetch sales:", response.message);
        toast.error(response.message || "Failed to load sales.");
        setSales([]);
      }
    } catch (error) {
      console.error("Failed to fetch sales (catch block):", error);
      toast.error("An unexpected error occurred while loading sales.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

  useEffect(() => {
    // Only load sales if cooperativeId is available
    if (cooperativeId) {
      loadSales();
    }
  }, [cooperativeId, loadSales]); // Depend on cooperativeId and loadSales

  // Filter and sort sales based on searchTerm, searchField, statusFilter, and sortOrder
  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((sale) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "product":
            // Access productName through stockId and then productId
            return sale.stockId?.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            // Access season name and year through seasonId
            return (
              sale.seasonId?.name
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              sale.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "buyer":
            return sale.buyer?.toLowerCase().includes(lowerCaseSearchTerm);
          case "phoneNumber":
            return sale.phoneNumber?.includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }

    // Apply sorting by date (createdAt)
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
  }, [sales, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / rowsPerPage);
  const indexOfLastSale = currentPage * rowsPerPage;
  const indexOfFirstSale = indexOfLastSale - rowsPerPage;
  const currentSales = filteredAndSortedSales.slice(
    indexOfFirstSale,
    indexOfLastSale
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedSales]);

  const paginate = useCallback((event, pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  // Modified handleAddSale to include cooperativeId
  const handleAddSale = async (newSaleData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add sale.");
      return;
    }
    try {
      // Add the cooperativeId to the sale data before sending
      const dataToSend = { ...newSaleData, cooperativeId: cooperativeId };
      const response = await createSale(dataToSend);
      if (response.success) {
        toast.success(response.message || "Sale added successfully!");
        await loadSales();
        setShowAddModal(false);
      } else {
        console.error("Failed to add new sale:", response.message);
        toast.error(response.message || "Failed to add sale.");
      }
    } catch (error) {
      console.error("Failed to add new sale (catch block):", error);
      toast.error(
        `Failed to add sale: ${
          error.message || "An unexpected error occurred."
        }`
      );
    }
  };

  const handleOpenUpdateModal = (sale) => {
    setSelectedSale(sale);
    setShowUpdateModal(true);
  };

  // Modified handleUpdateSale to include cooperativeId
  const handleUpdateSale = async (saleId, updatedSaleData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update sale.");
      return;
    }
    try {
      // Add the cooperativeId to the update data before sending
      const dataToSend = { ...updatedSaleData, cooperativeId: cooperativeId };
      const response = await updateSale(saleId, dataToSend);
      if (response.success) {
        toast.success(response.message || "Sale updated successfully!");
        await loadSales();
        setShowUpdateModal(false);
        setSelectedSale(null);
      } else {
        console.error("Failed to update sale:", response.message);
        toast.error(response.message || "Failed to update sale.");
      }
    } catch (error) {
      console.error("Failed to update sale (catch block):", error);
      toast.error(
        `Failed to update sale: ${
          error.message || "An unexpected error occurred."
        }`
      );
    }
  };

  // NEW FUNCTION: Open confirmation dialog
  const handleOpenConfirmDeleteDialog = (id) => {
    setSaleToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  };

  // NEW FUNCTION: Close confirmation dialog (cancel deletion)
  const handleCancelDelete = () => {
    setSaleToDeleteId(null);
    setShowConfirmDeleteDialog(false);
  };

  // NEW FUNCTION: Confirm and proceed with deletion
  const confirmDeleteSale = async () => {
    if (!cooperativeId || !saleToDeleteId) {
      toast.error("Cooperative ID or Sale ID is missing. Cannot delete sale.");
      return;
    }
    try {
      // Pass the cooperativeId to deleteSale for backend authorization
      const response = await deleteSale(saleToDeleteId, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Sale deleted successfully!");
        await loadSales();

        // Adjust current page if the last item on a page was deleted
        if (currentSales.length === 1 && currentPage > 1) {
          setCurrentPage((prevPage) => prevPage - 1);
        }
      } else {
        console.error("Failed to delete sale:", response.message);
        toast.error(response.message || "Failed to delete sale.");
      }
    } catch (error) {
      console.error("Failed to delete sale (catch block):", error);
      toast.error(
        `Failed to delete sale: ${
          error.message || "An unexpected error occurred."
        }`
      );
    } finally {
      // Always close the dialog and reset the saleToDeleteId
      handleCancelDelete();
    }
  };

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
          title={<Typography variant="h6">Sales Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Sale
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 120px)", // Adjusted maxHeight
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track sales data, including product details, buyer
              information, and payment status.
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
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="season">Season</MenuItem>
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="phoneNumber">Phone Number</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "product"
                  ? "Product Name"
                  : searchField === "season"
                  ? "Season/Year"
                  : searchField === "buyer"
                  ? "Buyer Name"
                  : "Phone Number"
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
              <MenuItem value="unpaid">Unpaid</MenuItem>
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
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  overflowX: "auto", // Ensure horizontal scrolling is possible
                  maxHeight: { xs: "50vh", md: "70vh" },
                }}
              >
                <Table
                  size="small"
                  // minWidth ensures table doesn't shrink too much, enabling horizontal scroll
                  sx={{ minWidth: 700, tableLayout: "auto" }} // Changed to 'auto' or 'fixed' as needed
                >
                  <TableHead>
                    <TableRow>
                      {/* Removed explicit width percentages, let content and table minWidth manage */}
                      <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Product</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Season</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Qty(kg)</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Unit Price</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Amount</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Buyer</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Tel</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Status</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Date</StyledTableHeaderCell>
                      <StyledTableHeaderCell align="center">
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentSales.length > 0 ? (
                      currentSales.map((sale, index) => (
                        <TableRow
                          hover
                          key={sale._id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell>
                            {indexOfFirstSale + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.stockId?.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.seasonId?.name || "N/A"} (
                            {sale.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.quantity}{" "}
                            <span style={{ fontWeight: "bold" }}></span>
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(sale.unitPrice)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(sale.totalPrice)}
                          </StyledTableCell>
                          <StyledTableCell>{sale.buyer}</StyledTableCell>
                          <StyledTableCell>{sale.phoneNumber}</StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={sale.status}
                              size="small"
                              color={getStatusColor(sale.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
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
                                onClick={() => handleOpenUpdateModal(sale)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleOpenConfirmDeleteDialog(sale._id)
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
                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No sales found for this cooperative.
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
                    onChange={paginate}
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

      {/* Modals */}
      <UpdateSaleModal
        show={showUpdateModal}
        sale={selectedSale}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSale}
        // Pass cooperativeId to the modal if it needs to fetch related data (e.g., stocks, seasons)
        cooperativeId={cooperativeId}
      />
      <AddSaleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSale}
        // Pass cooperativeId to the modal for new sale creation
        cooperativeId={cooperativeId}
      />

      {/* NEW: Confirmation Dialog for Deletion */}
      <Dialog
        open={showConfirmDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          <Typography variant="h6" color="error">
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-delete-dialog-description">
            Are you sure you want to permanently delete this sale record? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteSale}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sales;
