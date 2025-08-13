import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  CircularProgress, // Added CircularProgress for loading state
  MenuItem, // Added MenuItem for dropdowns
  Button, // Added Button for sort control
  Chip, // Added Chip for status display
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

// Helper function for status chip color
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

function FeeType() {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch fee types from the backend
  const loadFeeTypes = useCallback(async () => {
    setLoading(true);
    try {
      const feeTypesData = await fetchFeeTypes();
      setFeeTypes(feeTypesData || []); // Ensure data is an array
    } catch (error) {
      console.error("Failed to fetch fee types:", error);
      toast.error("Failed to load fee types.");
      setFeeTypes([]); // Reset fee types on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load on component mount
  useEffect(() => {
    loadFeeTypes();
  }, [loadFeeTypes]);

  // Filter and sort fee types based on search, status filter, and sort order
  const filteredAndSortedFeeTypes = useMemo(() => {
    let filtered = feeTypes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((feeType) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "name":
            return feeType.name?.toLowerCase().includes(lowerCaseSearchTerm);
          case "amount":
            return feeType.amount?.toString().includes(lowerCaseSearchTerm);
          case "description":
            return feeType.description
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "status":
            return feeType.status?.toLowerCase().includes(lowerCaseSearchTerm);
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

    // Apply sorting by name (default)
    filtered.sort((a, b) => {
      const valueA = a[searchField] || "";
      const valueB = b[searchField] || "";

      let comparison = 0;
      if (typeof valueA === "string" && typeof valueB === "string") {
        comparison = valueA.localeCompare(valueB);
      } else {
        comparison = (valueA || 0) - (valueB || 0); // Numeric comparison for amount, etc.
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [feeTypes, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedFeeTypes.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedFeeTypes.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedFeeTypes]);

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

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Fee Types Dashboard</Typography>}
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
              The Fee Types Dashboard shows all fee categories in the
              cooperative. It helps manage and track member payments easily.
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
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="description">Description</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
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
