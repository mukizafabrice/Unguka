import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchSeasons,
  createSeasons,
  updateSeasons,
  deleteSeasons,
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

// Helper function for status chip color (assuming season status like 'active' or 'closed')
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "closed": // Or 'inactive', 'archived' depending on your backend data
      return "error";
    case "pending": // If there's a pending status
      return "info";
    default:
      return "default";
  }
};

function Season() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by season status
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to load seasons data from the backend
  const loadSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const seasonsData = await fetchSeasons();
      setSeasons(seasonsData || []); // Ensure data is an array
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
      toast.error("Failed to load seasons.");
      setSeasons([]); // Reset seasons on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  // Handler for adding a new season
  const handleAddSeason = async (newSeasonData) => {
    try {
      await createSeasons(newSeasonData);
      toast.success("Season added successfully!");
      await loadSeasons(); // Re-fetch all seasons to refresh the list
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add season:", error);
      toast.error(
        `Failed to add season: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (season) => {
    setSelectedSeason(season);
    setShowUpdateModal(true);
  };

  // Handler for updating a season
  const handleUpdateSeason = async (seasonId, updatedSeasonData) => {
    try {
      await updateSeasons(seasonId, updatedSeasonData);
      toast.success("Season updated successfully!");
      await loadSeasons();
      setShowUpdateModal(false);
      setSelectedSeason(null); // Clear selected season after update
    } catch (error) {
      console.error("Failed to update season:", error);
      toast.error(
        `Failed to update season: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a season
  const handleDeleteSeason = async (id) => {
    try {
      await deleteSeasons(id);
      toast.success("Season deleted successfully!");
      await loadSeasons();
    } catch (error) {
      console.error("Failed to delete season:", error);
      toast.error(
        `Failed to delete season: ${
          error.response?.data?.message || error.message
        }`
      );
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
              names, years, and statuses.
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
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>{" "}
              {/* Example status */}
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
      />

      {/* Update Season Modal Component */}
      <UpdateSeasonModal
        show={showUpdateModal}
        season={selectedSeason} // Prop name 'season' passed to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSeason} // Handler for saving updates from the modal
      />

      {/* ToastContainer for displaying success/error notifications */}
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

export default Season;
