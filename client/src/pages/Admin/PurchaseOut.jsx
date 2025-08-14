import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchAllPurchaseOuts, // ⭐ CORRECTED: Changed from fetchPurchaseOut to fetchAllPurchaseOuts
  createPurchaseOut,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../../services/purchaseOutService";

// Import fetchProducts and fetchSeasons for dropdowns in modals
import { fetchProducts } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

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
  // Chip, // ⭐ REMOVED: No 'status' field in PurchaseOut schema
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear"; // For Clear Filters button

import AddPurchaseOutModal from "../../features/modals/AddPurchaseOutModal"; // Ensure this path is correct
import UpdatePurchaseOutModal from "../../features/modals/UpdatePurchaseOutModal"; // Ensure this path is correct

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
  backgroundColor: "#f5f5f5", // ⭐ ADJUSTED: Consistent background for header
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

// ⭐ REMOVED: getStatusColor function, as there's no 'status' in PurchaseOut schema

function PurchaseOut() {
  // ⭐ Get user and cooperativeId from AuthContext
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the manager belongs to

  const [purchaseOuts, setPurchaseOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseOut, setSelectedPurchaseOut] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date, newest first

  const isMobile = useMediaQuery("(max-width: 768px)");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0); // Handle null/undefined amount gracefully
  };

  // ⭐ Modified loadPurchaseOut to fetch purchase outs for the specific cooperativeId
  const loadPurchaseOut = useCallback(async () => {
    if (!cooperativeId) {
      toast.error(
        "Manager's cooperative ID is not available. Cannot load purchase outs."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass the cooperativeId to fetchAllPurchaseOuts
      const response = await fetchAllPurchaseOuts(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setPurchaseOuts(response.data);
      } else {
        console.error("Failed to fetch purchase outs:", response.message);
        toast.error(response.message || "Failed to load purchases.");
        setPurchaseOuts([]);
      }
    } catch (error) {
      console.error("Failed to fetch purchase outs (catch block):", error);
      toast.error("An unexpected error occurred while loading purchases.");
      setPurchaseOuts([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

  useEffect(() => {
    // Only load purchase outs if cooperativeId is available
    if (cooperativeId) {
      loadPurchaseOut();
    }
  }, [cooperativeId, loadPurchaseOut]); // Depend on cooperativeId and loadPurchaseOut

  // Handler for adding a new purchase out
  // ⭐ Modified handleAddPurchaseOut to include cooperativeId
  const handleAddPurchaseOut = async (newPurchaseOutData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add purchase out.");
      return;
    }
    try {
      // Add the cooperativeId to the purchase out data before sending
      const dataToSend = {
        ...newPurchaseOutData,
        cooperativeId: cooperativeId,
      };
      const response = await createPurchaseOut(dataToSend);
      if (response.success) {
        toast.success(response.message || "Purchase added successfully!");
        setShowAddModal(false);
        await loadPurchaseOut();
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

  const handleOpenUpdateModal = (purchaseOut) => {
    setSelectedPurchaseOut(purchaseOut);
    setShowUpdateModal(true);
  };

  // Handler for updating a purchase out
  // ⭐ Modified handleUpdatePurchaseOut to include cooperativeId in the data sent
  const handleUpdatePurchaseOut = async (id, updatedPurchaseOutData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update purchase out.");
      return;
    }
    try {
      // Add the cooperativeId to the data for authorization at the backend
      const dataToSend = {
        ...updatedPurchaseOutData,
        cooperativeId: cooperativeId,
      };
      const response = await updatePurchaseOut(id, dataToSend);
      if (response.success) {
        toast.success(response.message || "Purchase updated successfully!");
        setShowUpdateModal(false);
        setSelectedPurchaseOut(null);
        await loadPurchaseOut();
      } else {
        toast.error(
          `Failed to update purchase: ${
            response.message || "An unexpected error occurred."
          }`
        );
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

  // Handler for deleting a purchase out
  // ⭐ Modified handleDeletePurchaseOut to include cooperativeId
  const handleDeletePurchaseOut = async (id) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot delete purchase out.");
      return;
    }
    try {
      // Pass the cooperativeId to deletePurchaseOut for backend authorization
      const response = await deletePurchaseOut(id, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Purchase deleted successfully!");
        await loadPurchaseOut();
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchField("productName");
    setSortOrder("desc");
    setCurrentPage(1);
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
                placeholder="Search purchases..."
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
                  <MenuItem value="productName">Product Name</MenuItem>
                  <MenuItem value="season">Season/Year</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
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
                {(searchTerm ||
                  searchField !== "productName" ||
                  sortOrder !== "desc") && (
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
                  boxShadow: 3, // Consistent shadow
                  borderRadius: 2, // Consistent border radius
                  overflowX: "auto",
                  flexGrow: 1,
                  maxHeight: { xs: "50vh", md: "70vh" }, // Responsive max height for table scroll
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{ minWidth: 900, tableLayout: "fixed" }}
                >
                  {" "}
                  {/* stickyHeader and minWidth */}
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "20%", minWidth: "150px" }}
                      >
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "15%", minWidth: "120px" }}
                      >
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "10%", minWidth: "80px" }}
                      >
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "15%", minWidth: "100px" }}
                      >
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "15%", minWidth: "100px" }}
                      >
                        Total Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "10%", minWidth: "90px" }}
                      >
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "10%", minWidth: "100px" }}
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
                            No purchases found for this cooperative.
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

      {/* AddPurchaseOutModal and UpdatePurchaseOutModal will be passed the cooperativeId */}
      <AddPurchaseOutModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseOut}
        cooperativeId={cooperativeId} // Pass cooperativeId to the modal
      />

      <UpdatePurchaseOutModal
        show={showUpdateModal}
        purchaseOut={selectedPurchaseOut}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePurchaseOut}
        cooperativeId={cooperativeId} // Pass cooperativeId to the modal
      />

      {/* ⭐ Removed duplicate ToastContainer: Your App.js should contain the global one. */}
    </Box>
  );
}

export default PurchaseOut;
