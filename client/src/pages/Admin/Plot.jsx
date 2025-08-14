import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ NEW: Import useAuth to get the current user's cooperativeId
import { useAuth } from "../../contexts/AuthContext";

import {
  fetchPlots, // ⭐ CORRECTED: Changed from fetchPlot to fetchPlots (plural)
  createPlot,
  updatePlot,
  deletePlot,
} from "../../services/plotService";

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
  MenuItem, // Added MenuItem for search field dropdown
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import AddPlotModal from "../../features/modals/AddPlotModal";
import UpdatePlotModal from "../../features/modals/UpdatePlotModal";

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

function Plot() {
  // ⭐ Get user and cooperativeId from AuthContext
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // This is the ID of the cooperative the manager belongs to

  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  // ⭐ UPDATED: Default search field now includes 'size' and 'member' for plots. Removed 'productName', 'area'.
  const [searchField, setSearchField] = useState("member");
  const [sortOrder, setSortOrder] = useState("asc"); // State for sorting
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch plots for the manager's specific cooperativeId
  const loadPlots = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Manager's cooperative ID is not available. Cannot load plots.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ⭐ Pass cooperativeId to fetchPlots
      const response = await fetchPlots(null, cooperativeId); // Pass null for userId as manager gets all for their coop
      if (response.success && Array.isArray(response.data)) {
        setPlots(response.data);
      } else {
        console.error("Failed to fetch plots:", response.message);
        toast.error(response.message || "Failed to load plots.");
        setPlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch plots (catch block):", error);
      toast.error("An unexpected error occurred while loading plots.");
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Add cooperativeId to dependencies

  useEffect(() => {
    if (cooperativeId) { // Only load plots if cooperativeId is available
      loadPlots();
    }
  }, [cooperativeId, loadPlots]); // Depend on cooperativeId and loadPlots

  // ⭐ Modified handleAddPlot to include cooperativeId
  const handleAddPlot = async (newData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add plot.");
      return;
    }
    try {
      // Add the cooperativeId to the data before sending
      const dataToSend = { ...newData, cooperativeId: cooperativeId };
      const response = await createPlot(dataToSend);
      if (response.success) {
        setShowAddModal(false);
        toast.success(response.message || "Plot added successfully!");
        await loadPlots();
      } else {
        toast.error(response.message || "Failed to add plot.");
      }
    } catch (error) {
      console.error("Failed to add plot:", error);
      toast.error("An unexpected error occurred while adding plot.");
    }
  };

  const handleOpenUpdateModal = (plot) => {
    setSelectedPlot(plot);
    setShowUpdateModal(true);
  };

  // ⭐ Modified handleUpdatePlot to include cooperativeId
  const handleUpdatePlot = async (updatedData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update plot.");
      return;
    }
    try {
      const { _id, ...dataToUpdate } = updatedData;
      // Add the cooperativeId to the data before sending for update
      const dataToSend = { ...dataToUpdate, cooperativeId: cooperativeId };
      const response = await updatePlot(_id, dataToSend);
      if (response.success) {
        toast.success(response.message || "Plot updated successfully!");
        setShowUpdateModal(false);
        setSelectedPlot(null);
        await loadPlots();
      } else {
        toast.error(response.message || "Failed to update plot.");
      }
    } catch (error) {
      console.error("Failed to update plot:", error);
      toast.error("An unexpected error occurred while updating plot.");
    }
  };

  // ⭐ Modified handleDeletePlot to include cooperativeId
  const handleDeletePlot = async (id) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot delete plot.");
      return;
    }
    try {
      // Pass the cooperativeId to deletePlot for backend authorization
      const response = await deletePlot(id, cooperativeId);
      if (response.success) {
        toast.success(response.message || "Plot deleted successfully!");
        await loadPlots();
      } else {
        toast.error(response.message || "Failed to delete plot.");
      }
    } catch (error) {
      console.error("Failed to delete plot:", error);
      toast.error("An unexpected error occurred while deleting plot.");
    }
  };

  // Filter and sort plots based on search term, search field, and sort order
  const filteredAndSortedPlots = useMemo(() => {
    let filtered = plots;

    if (searchTerm) {
      filtered = filtered.filter((plot) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
            return plot.userId?.names
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          // ⭐ UPDATED: Use 'size' instead of 'area' for searching
          case "size":
            return plot.size
              ?.toString()
              .toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "upi":
            return plot.upi?.toLowerCase().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      // Default sort by Member Name (as before)
      const nameA = a.userId?.names || "";
      const nameB = b.userId?.names || "";

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    return filtered;
  }, [plots, searchTerm, searchField, sortOrder]);

  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPlots.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(filteredAndSortedPlots.length / rowsPerPage);

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPlots]);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Plots Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Plot
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)", // Dynamic height for content
            overflowY: "auto", // Scroll content area if it overflows
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track land plots, including member associations,
              and size details for your cooperative.
            </Typography>
          </Box>

          {/* Search and Sort Section */}
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
              <MenuItem value="member">Member Name</MenuItem>
              {/* ⭐ Removed 'Product Name' and 'Area', added 'Size' */}
              <MenuItem value="size">Size</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "member"
                  ? "Member Name"
                  : searchField === "size"
                  ? "Size"
                  : "UPI"
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
              Sort by Member {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
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
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "25%" }}>
                        Member
                      </StyledTableHeaderCell>
                      {/* ⭐ REMOVED 'Product Name' column */}
                      {/* <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Product Name
                      </StyledTableHeaderCell> */}
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Size
                      </StyledTableHeaderCell> {/* ⭐ CHANGED 'Area' to 'Size' */}
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        UPI
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "30%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((plot, index) => (
                        <TableRow
                          hover
                          key={plot._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {plot.userId?.names || "N/A"}
                          </StyledTableCell>
                          {/* ⭐ REMOVED Product Name cell */}
                          {/* <StyledTableCell>
                            {plot.productId?.productName || "N/A"}
                          </StyledTableCell> */}
                          <StyledTableCell>{plot.size || "N/A"}</StyledTableCell> {/* ⭐ CHANGED plot.area to plot.size */}
                          <StyledTableCell>{plot.upi || "N/A"}</StyledTableCell>
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
                                onClick={() => handleOpenUpdateModal(plot)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeletePlot(plot._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}> {/* ⭐ Adjusted colspan */}
                          <Typography variant="body1" color="text.secondary">
                            No plots found for this cooperative.
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
                    onChange={(event, newPage) => setCurrentPage(newPage)}
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

      <AddPlotModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPlot}
        // Pass the cooperativeId to the AddPlotModal for new plot creation
        cooperativeId={cooperativeId}
      />
      <UpdatePlotModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdatePlot}
        initialData={selectedPlot}
        // Pass the cooperativeId to the UpdatePlotModal for update authorization
        cooperativeId={cooperativeId}
      />

      {/* ⭐ Removed duplicate ToastContainer: Your App.js should contain the global one. */}
      {/* <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
    </Box>
  );
}

export default Plot;