import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPurchaseOut,
  createPurchaseOut,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../../services/purchaseOutService";

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
  CircularProgress, // Added CircularProgress for loading state
  MenuItem, // Added MenuItem for dropdowns
  Chip, // Added Chip for status display
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AddPurchaseOutModal from "../../features/modals/AddPurchaseOutModal";
import UpdatePurchaseOutModal from "../../features/modals/UpdatePurchaseOutModal";

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

// Helper function for status chip color (if needed, assuming purchaseOuts have a status)
// For PurchaseOut, it's less clear if a 'status' field exists in the data.
// If not, this function might not be directly applicable unless you introduce a status.
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed": // Example status
      return "success";
    case "pending": // Example status
      return "warning";
    default:
      return "default";
  }
};

function PurchaseOut() {
  const [purchaseOuts, setPurchaseOuts] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseOut, setSelectedPurchaseOut] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName"); // Default search field
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date, newest first
  // Assuming no specific status filter for PurchaseOut unless data schema shows it.

  const isMobile = useMediaQuery("(max-width: 768px)");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  // Function to load purchase outs data from the backend
  const loadPurchaseOut = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPurchaseOut();
      setPurchaseOuts(data || []);
    } catch (error) {
      console.error("Failed to fetch purchase outs:", error);
      toast.error("Failed to load purchases.");
      setPurchaseOuts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchaseOut();
  }, [loadPurchaseOut]);

  // Handler for adding a new purchase out
  const handleAddPurchaseOut = async (newPurchaseOutData) => {
    try {
      await createPurchaseOut(newPurchaseOutData);
      toast.success("Purchase added successfully!");
      await loadPurchaseOut();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add purchase:", error);
      toast.error(
        `Failed to add purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (purchaseOut) => {
    setSelectedPurchaseOut(purchaseOut);
    setShowUpdateModal(true);
  };

  // Handler for updating a purchase out
  const handleUpdatePurchaseOut = async (id, updatedPurchaseOutData) => {
    try {
      await updatePurchaseOut(id, updatedPurchaseOutData);
      toast.success("Purchase updated successfully!");
      await loadPurchaseOut();
      setShowUpdateModal(false);
      setSelectedPurchaseOut(null);
    } catch (error) {
      console.error("Failed to update purchase:", error);
      toast.error(
        `Failed to update purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a purchase out
  const handleDeletePurchaseOut = async (id) => {
    try {
      await deletePurchaseOut(id);
      toast.success("Purchase deleted successfully!");
      await loadPurchaseOut();
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      toast.error(
        `Failed to delete purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Filter and sort purchase outs based on search and sort order
  const filteredAndSortedPurchaseOuts = useMemo(() => {
    let filtered = purchaseOuts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((po) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "productName":
            return po.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              po.seasonId?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
              po.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "date":
            return po.createdAt
              ? new Date(po.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          default:
            return true;
        }
      });
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
  }, [purchaseOuts, searchTerm, searchField, sortOrder]);

  const totalPages = Math.ceil(
    filteredAndSortedPurchaseOuts.length / rowsPerPage
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPurchaseOuts.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPurchaseOuts]);

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
          title={<Typography variant="h6">Purchases Out Dashboard</Typography>}
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
              Manage and track products purchased from outside the cooperative.
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
              <MenuItem value="productName">Product Name</MenuItem>
              <MenuItem value="season">Season/Year</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "productName"
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
            {/* No status filter currently, remove if not needed for PurchaseOut */}
            {/* <TextField
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
            </TextField> */}
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
              {" "}
              {/* This box will scroll */}
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
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Total Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
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
                      currentRows.map((purchaseOut, index) => (
                        <TableRow hover key={purchaseOut._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.seasonId?.name || "N/A"} (
                            {purchaseOut.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.quantity || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseOut.unitPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseOut.totalPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.createdAt
                              ? new Date(
                                  purchaseOut.createdAt
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
                                  handleOpenUpdateModal(purchaseOut)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleDeletePurchaseOut(purchaseOut._id)
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
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No purchases found.
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

      <AddPurchaseOutModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseOut}
      />

      <UpdatePurchaseOutModal
        show={showUpdateModal}
        purchaseOut={selectedPurchaseOut}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePurchaseOut}
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

export default PurchaseOut;
