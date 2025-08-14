import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext"; // To get user's cooperativeId

import {
  fetchProductionsByUserId, // Specific function for fetching a member's productions
} from "../../services/productionService";

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
  Paper, // Added for search/filter section styling
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
import ClearIcon from "@mui/icons-material/Clear"; // For Clear Filters button

// Styled components consistent with ManagerTable.jsx design
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

function Production() {
  // Get current user's ID and cooperative ID from AuthContext
  const { user } = useAuth();
  const userId = user?._id; // The logged-in member's ID
  const cooperativeId = user?.cooperativeId; // The logged-in member's cooperative ID

  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName"); // Default search field
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by creation date descending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to load production data for the specific user and cooperative
  const loadProductions = useCallback(async () => {
    if (!userId || !cooperativeId) {
      toast.error(
        "User ID or Cooperative ID is not available. Cannot load productions."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch productions specific to this user and cooperative
      const response = await fetchProductionsByUserId(userId, cooperativeId);
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
  }, [userId, cooperativeId]);

  useEffect(() => {
    if (userId && cooperativeId) {
      // Only load if both IDs are available
      loadProductions();
    }
  }, [userId, cooperativeId, loadProductions]);

  // Filter and sort productions based on search and sort order
  const filteredAndSortedProductions = useMemo(() => {
    let filtered = productions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((production) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member": // For member view, this typically searches the logged-in user's name
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
          case "date":
            return production.createdAt
              ? new Date(production.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          default:
            return true;
        }
      });
    }

    // Apply sorting by date (createdAt) - newest first by default
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
  }, [productions, searchTerm, searchField, sortOrder]);

  const totalPages = Math.ceil(
    filteredAndSortedProductions.length / rowsPerPage
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedProductions.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
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
    }).format(amount || 0); // Handle null/undefined amount gracefully
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
          title={<Typography variant="h6">My Productions</Typography>}
          // Removed "Add Production" button as this is a member's read-only view
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
              This is your Productions Dashboard, showing all the products
              you’ve produced and their details within your cooperative.
            </Typography>
          </Box>

          {/* Search and Sort Section - Styled like ManagersTable's filter area */}
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
                placeholder="Search productions..."
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
              {/* Search By and Sort Button */}
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
                  {/* For members, 'Member' search would effectively be searching their own name if populated */}
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
                        sx={{ width: "15%", minWidth: "120px" }}
                      >
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "15%", minWidth: "120px" }}
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
                        sx={{ width: "10%", minWidth: "100px" }}
                      >
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "10%", minWidth: "100px" }}
                      >
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "10%", minWidth: "90px" }}
                      >
                        Date
                      </StyledTableHeaderCell>
                      {/* Removed Action Header Cell */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((production, index) => (
                        <TableRow hover key={production._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.userId?.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.seasonId?.name || "N/A"} (
                            {production.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.quantity || "N/A"}
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
                          {/* Removed Action Cells */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          {" "}
                          {/* Adjusted colSpan */}
                          <Typography variant="body1" color="text.secondary">
                            No production found.
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
    </Box>
  );
}

export default Production;
