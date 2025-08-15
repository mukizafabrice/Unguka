import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify"; // Keep toast for error messages
import "react-toastify/dist/ReactToastify.css";
// ⭐ Import useAuth to get the current user's ID and cooperative ID
import { useAuth } from "../../contexts/AuthContext";

// ⭐ Import fetchPlots from the plotService (now plural and accepts filters)
import { fetchPlots } from "../../services/plotService";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Stack,
  useMediaQuery,
  styled,
  Pagination,
  CircularProgress,
  MenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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
  // ⭐ Get current user's ID and cooperative ID from AuthContext
  const { user } = useAuth();
  const currentUserId = user?._id;
  const currentCooperativeId = user?.cooperativeId;

  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  // ⭐ UPDATED searchField options for member view
  const [searchField, setSearchField] = useState("upi"); // Default search by UPI
  const [sortOrder, setSortOrder] = useState("asc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch plots for the current member and cooperative
  const loadPlots = useCallback(async () => {
    // ⭐ Ensure both userId and cooperativeId are available before fetching
    if (!currentUserId || !currentCooperativeId) {
      toast.error("User or cooperative ID not available. Cannot load plots.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ⭐ Pass both userId and cooperativeId to fetchPlots
      const response = await fetchPlots(currentUserId, currentCooperativeId);
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
  }, [currentUserId, currentCooperativeId]); // Dependencies for useCallback

  // Initial data load on component mount and when user/coop IDs change
  useEffect(() => {
    if (currentUserId && currentCooperativeId) {
      // Only load if IDs are ready
      loadPlots();
    }
  }, [currentUserId, currentCooperativeId, loadPlots]);

  // Filter and sort plots based on search and sort order
  const filteredAndSortedPlots = useMemo(() => {
    let filtered = plots;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((plot) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // ⭐ Search only by UPI or size as these are direct plot properties
        switch (searchField) {
          case "upi":
            return plot.upi?.toLowerCase().includes(lowerCaseSearchTerm);
          case "size": // Search by size (numeric property)
            return String(plot.size)?.includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply sorting by chosen field (UPI or Size)
    filtered.sort((a, b) => {
      const valA = a[searchField] || "";
      const valB = b[searchField] || "";
      const comparison = String(valA).localeCompare(String(valB));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [plots, searchTerm, searchField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedPlots.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPlots.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPlots]);

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
          title={<Typography variant="h6">My Plots</Typography>} // ⭐ Updated title for member view
        />
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
              Here is a list of your registered plots within your cooperative.
            </Typography>
          </Box>

          {/* Search and Sort Section */}
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
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="size">Size</MenuItem>{" "}
              {/* ⭐ Changed from 'area' to 'size' */}
            </TextField>
            <TextField
              label={`Search ${searchField === "upi" ? "UPI" : "Size"}`}
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
              Sort by {searchField === "upi" ? "UPI" : "Size"}{" "}
              {sortOrder === "asc" ? "(Asc)" : "(Desc)"}{" "}
              {/* ⭐ Dynamic sort button text */}
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
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        No.
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "30%" }}>
                        UPI
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        Size
                      </StyledTableHeaderCell>{" "}
                      {/* ⭐ Changed 'Area' to 'Size' */}
                      <StyledTableHeaderCell sx={{ width: "40%" }}>
                        Cooperative
                      </StyledTableHeaderCell>{" "}
                      {/* ⭐ Added Cooperative column */}
                      {/* ⭐ Removed "Product Name" and "Action" columns */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((plot, index) => (
                        <TableRow hover key={plot._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>{plot.upi || "N/A"}</StyledTableCell>
                          <StyledTableCell>
                            {plot.size || "N/A"}
                          </StyledTableCell>{" "}
                          {/* ⭐ Changed plot.area to plot.size */}
                          <StyledTableCell>
                            {plot.cooperativeId?.name || "N/A"}
                          </StyledTableCell>{" "}
                          {/* ⭐ Display cooperative name */}
                          {/* ⭐ Removed Product Name and Action cells */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          {" "}
                          {/* ⭐ Adjusted colspan */}
                          <Typography variant="body1" color="text.secondary">
                            No plots found for you in this cooperative.
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

      {/* ⭐ Removed AddPlotModal and UpdatePlotModal as members cannot add/update */}
      {/* <AddPlotModal /> */}
      {/* <UpdatePlotModal /> */}

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
