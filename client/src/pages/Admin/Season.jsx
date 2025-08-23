import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
} from "../../services/seasonService";

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

import AddSeasonModal from "../../features/modals/AddSeasonModal";
import UpdateSeasonModal from "../../features/modals/UpdateSeasonModal";

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
  backgroundColor: "#f5f5f5", // ⭐ Set background color for header cells
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

// Helper function for status chip color (assuming season status like 'active' or 'inactive')
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive": // ⭐ Changed from 'closed' to 'inactive' to match model enum
      return "error";
    default: // For any other status, or 'pending' if applicable
      return "default";
  }
};

function Season() {
 
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const loadSeasons = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available. Cannot load seasons.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ⭐ Pass cooperativeId to fetchSeasons
      const response = await fetchSeasons(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setSeasons(response.data);
      } else {
        console.error("Failed to fetch seasons:", response.message);
        toast.error(response.message || "Failed to load seasons.");
        setSeasons([]);
      }
    } catch (error) {
      console.error("Failed to fetch seasons (catch block):", error);
      toast.error("An unexpected error occurred while loading seasons.");
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Depend on cooperativeId

  useEffect(() => {
    if (cooperativeId) {
      // Only load if cooperativeId is available
      loadSeasons();
    }
  }, [cooperativeId, loadSeasons]);

  // Handler for adding a new season
  const handleAddSeason = async (newSeasonData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot add season.");
      return;
    }
    try {
      const dataToSend = { ...newSeasonData, cooperativeId };
      const response = await createSeason(dataToSend); 
      if (response.success) {
        toast.success(response.message || "Season added successfully!");
        setShowAddModal(false);
        await loadSeasons();
      } else {
        toast.error(response.message || "Failed to add season.");
      }
    } catch (error) {
      console.error("Failed to add season:", error);
      toast.error("An unexpected error occurred while adding season.");
    }
  };

  const handleOpenUpdateModal = (season) => {
    setSelectedSeason(season);
    setShowUpdateModal(true);
  };

  // Handler for updating a season
  const handleUpdateSeason = async (seasonId, updatedSeasonData) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot update season.");
      return;
    }
    try {
      const dataToSend = { ...updatedSeasonData, cooperativeId };
      const response = await updateSeason(seasonId, dataToSend); 
      if (response.success) {
        toast.success(response.message || "Season updated successfully!");
        setShowUpdateModal(false);
        setSelectedSeason(null);
        await loadSeasons();
      } else {
        toast.error(response.message || "Failed to update season.");
      }
    } catch (error) {
      console.error("Failed to update season:", error);
      toast.error("An unexpected error occurred while updating season.");
    }
  };

  // Handler for deleting a season
  const handleDeleteSeason = async (id) => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is missing. Cannot delete season.");
      return;
    }
    // ⭐ Use a confirmation dialog instead of window.confirm for consistency
    if (
      window.confirm(
        "Are you sure you want to delete this season? This action cannot be undone."
      )
    ) {
      try {
        // ⭐ Pass cooperativeId to deleteSeason for backend authorization
        const response = await deleteSeason(id, cooperativeId); // ⭐ Corrected service call
        if (response.success) {
          toast.success(response.message || "Season deleted successfully!");
          await loadSeasons();
        } else {
          toast.error(response.message || "Failed to delete season.");
        }
      } catch (error) {
        console.error("Failed to delete season:", error);
        toast.error("An unexpected error occurred while deleting season.");
      }
    }
  };

  // Filter and sort seasons based on search, status filter, and sort order
  const filteredAndSortedSeasons = useMemo(() => {
    let filtered = seasons;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((season) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "name":
            return season.name?.toLowerCase().includes(lowerCaseSearchTerm);
          case "year":
            return season.year?.toString().includes(lowerCaseSearchTerm);
          case "status":
            return season.status?.toLowerCase().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (season) => season.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting by name/year
    filtered.sort((a, b) => {
      let comparison = 0;
      if (searchField === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        comparison = nameA.localeCompare(nameB);
      } else if (searchField === "year") {
        comparison = (a.year || 0) - (b.year || 0); // Numerical sort for year
      } else {
        // Default sort by name if search field is not name/year
        const nameA = a.name || "";
        const nameB = b.name || "";
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [seasons, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedSeasons.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedSeasons.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedSeasons]);

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
          title={<Typography variant="h6">Seasons Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Season
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
              Manage and track different agricultural seasons, including their
              names, years, and statuses for your cooperative.
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
              <MenuItem value="name">Season Name</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "name"
                  ? "Season Name"
                  : searchField === "year"
                  ? "Year"
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
              <MenuItem value="inactive">Inactive</MenuItem>{" "}
              {/* ⭐ Changed from 'closed' to 'inactive' */}
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
              Sort by {searchField === "year" ? "Year" : "Name"}{" "}
              {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
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
                      <StyledTableHeaderCell sx={{ width: "30%" }}>
                        Season Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Year
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Status
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
                      currentRows.map((season, index) => (
                        <TableRow hover key={season._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {season.name || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {season.year || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={season.status || "N/A"}
                              size="small"
                              color={getStatusColor(season.status)}
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
                                onClick={() => handleOpenUpdateModal(season)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteSeason(season._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No seasons found.
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

      {/* Add Season Modal Component */}
      <AddSeasonModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSeason}
        cooperativeId={cooperativeId} // ⭐ Pass cooperativeId to AddSeasonModal
      />

      {/* Update Season Modal Component */}
      <UpdateSeasonModal
        show={showUpdateModal}
        season={selectedSeason}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSeason}
        cooperativeId={cooperativeId} // ⭐ Pass cooperativeId to UpdateSeasonModal
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

export default Season;
