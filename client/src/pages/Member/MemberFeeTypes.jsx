import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming fetchFeeTypes is an async function that fetches fee type data
import { fetchFeeTypes } from "../../services/feeTypeService";

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
  Chip,
  useTheme, // Added useTheme for accessing theme properties directly
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Styled components consistent with other dashboards using Material-UI's styled utility
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
    color: theme.palette.text.primary, // Ensure title color is consistent
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper, // Use paper background for table cells
  color: theme.palette.text.primary,
  wordWrap: "break-word", // Allow long text to wrap
  whiteSpace: "normal", // Ensure normal whitespace handling
  [theme.breakpoints.down("sm")]: {
    padding: "4px 6px",
    fontSize: "0.65rem", // Smaller font size on small screens
  },
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: "transparent", // Header cells remain transparent against TableHead background
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

/**
 * Helper function to determine the color of the status chip.
 * @param {string} status - The status string (e.g., "active", "inactive").
 * @returns {"success" | "error" | "default"} The color variant for the MuiChip component.
 */
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

/**
 * @typedef {Object} FeeTypeData
 * @property {string} _id - Unique identifier for the fee type.
 * @property {string} name - The name of the fee type.
 * @property {number} amount - The amount of the fee.
 * @property {string} description - A description of the fee type.
 * @property {string} status - The status of the fee type (e.g., "active", "inactive").
 * @property {boolean} [isPerSeason] - Whether the fee is seasonal.
 * @property {boolean} [autoApplyOnCreate] - Whether the fee is automatically applied on creation.
 */

/**
 * FeeType component displays and manages a dashboard of fee types.
 * It includes features for searching, filtering, sorting, and pagination.
 * @returns {JSX.Element} The FeeType dashboard component.
 */
function FeeType() {
  const theme = useTheme(); // Hook to access the theme object
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Number of rows to display per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name"); // Field to apply search on
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by fee type status
  const [sortOrder, setSortOrder] = useState("asc"); // Sort order: 'asc' for ascending, 'desc' for descending

  // Media query hook to detect mobile screen sizes
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
 
  const loadFeeTypes = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const feeTypesData = await fetchFeeTypes();
      setFeeTypes(feeTypesData || []); // Update state with fetched data, ensure it's an array
    } catch (error) {
      console.error("Failed to fetch fee types:", error);
      toast.error("Failed to load fee types."); // Display error toast
      setFeeTypes([]); // Clear fee types on error
    } finally {
      setLoading(false); 
    }
  }, []); 

  // Effect hook to load fee types when the component mounts
  useEffect(() => {
    loadFeeTypes();
  }, [loadFeeTypes]); // Dependency on loadFeeTypes ensures it runs when loadFeeTypes changes (which it won't due to useCallback)

  /**
   * Memoized function to filter and sort fee types based on current search, filter, and sort states.
   * Re-calculates only when feeTypes, searchTerm, searchField, statusFilter, or sortOrder changes.
   */
  const filteredAndSortedFeeTypes = useMemo(() => {
    let filtered = feeTypes;

    // Apply search filter based on the selected search field
    if (searchTerm) {
      filtered = filtered.filter((feeType) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const value = feeType[searchField]; // Get the value of the selected search field

        if (value === null || value === undefined) return false; // Handle null/undefined values gracefully

        switch (searchField) {
          case "name":
          case "description":
          case "status":
            return String(value).toLowerCase().includes(lowerCaseSearchTerm);
          case "amount":
            // For amount, convert to string and check inclusion
            return String(value).includes(lowerCaseSearchTerm);
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
      // Get values for comparison based on searchField (which acts as the sort key here)
      const valueA = a[searchField];
      const valueB = b[searchField];

      let comparison = 0;
      // Handle different types for comparison (string vs. number)
      if (typeof valueA === "string" && typeof valueB === "string") {
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        comparison = valueA - valueB;
      } else {
        // Fallback for mixed or unexpected types, compare as strings
        comparison = String(valueA).localeCompare(String(valueB));
      }

      // Apply sort order (ascending or descending)
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [feeTypes, searchTerm, searchField, statusFilter, sortOrder]);

  // Calculate pagination details
  const totalPages = Math.ceil(filteredAndSortedFeeTypes.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedFeeTypes.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Effect to reset current page to 1 whenever filters or sorting criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedFeeTypes]); // Dependency on the memoized list

  /**
   * Handles page change for pagination.
   * @param {Event} event - The event object.
   * @param {number} newPage - The new page number.
   * Uses useCallback to memoize the function.
   */
  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  /**
   * Toggles the sort order (ascending to descending and vice versa).
   */
  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  /**
   * Formats a given amount into Rwandan Francs (RWF) currency.
   * @param {number | null | undefined} amount - The numeric amount to format.
   * @returns {string} The formatted currency string.
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0); // Default to 0 if amount is null/undefined
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Fee Types Dashboard</Typography>}
        />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            // Max height and overflow for the content area excluding header/footer
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflow: "hidden", // Hide overflow from the CardContent itself
          }}
        >
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              The Fee Types Dashboard shows all fee categories in the
              cooperative. It helps manage and track member payments easily.
            </Typography>
          </Box>

          {/* Search, Filter, and Sort Controls */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            alignItems={isMobile ? "stretch" : "center"}
            sx={{ flexShrink: 0 }} // Prevent this section from shrinking
          >
            {/* Search By Field Selection */}
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

            {/* Search Input Field */}
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

            {/* Status Filter Dropdown */}
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

            {/* Sort Button */}
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
              Sort by {searchField === "amount" ? "Amount" : "Name"}{" "}
              {/* Dynamic sort label */}
              {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
            </Button>
          </Stack>

          {/* Conditional Rendering: Loading State vs. Table Content */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              my={5}
              sx={{ flexGrow: 1 }} // Allow it to take available space
            >
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box
              sx={{
                flexGrow: 1, // Allow table container to grow and fill space
                overflowY: "auto", // Enable vertical scrolling for the table content
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  overflowX: "auto", // Enable horizontal scrolling for the table on small screens
                  borderRadius: 2,
                  boxShadow: 2,
                  flexGrow: 1, // Ensures the table container itself also grows
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
                      <StyledTableHeaderCell sx={{ width: "35%" }}>
                        Description
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Status
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((feeType, index) => (
                        <TableRow hover key={feeType._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {feeType.name || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(feeType.amount)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {feeType.description || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={feeType.status || "N/A"}
                              size="small"
                              color={getStatusColor(feeType.status)}
                            />
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No fee types found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box
              mt={3}
              display="flex"
              justifyContent="center"
              sx={{ flexShrink: 0 }} // Prevent pagination from shrinking
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

      {/* Toast notifications container */}
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
