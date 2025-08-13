import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchAllFeesById } from "../../services/feesService";

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
    case "paid":
      return "success";
    case "pending": // Assuming "pending" for remaining amount > 0
      return "warning";
    default:
      return "default";
  }
};

function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by user name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch all necessary data
  const loadFeesData = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      if (userId) {
        const feesData = await fetchAllFeesById(userId);
        setFees(feesData || []); // Ensure data is an array
      } else {
        console.warn("User ID not found in localStorage. Cannot fetch fees.");
        setFees([]);
      }
    } catch (error) {
      console.error("Failed to fetch fees:", error);
      toast.error("Failed to load fees.");
      setFees([]); // Reset fees on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeesData();
  }, [loadFeesData]);

  // Filter and sort fees based on search, status filter, and sort order
  const filteredAndSortedFees = useMemo(() => {
    let filtered = fees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((fee) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "user":
            return fee.userId?.names
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              fee.seasonId?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
              fee.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "feeType":
            return fee.feeTypeId?.name
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (fee) => fee.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting by user name (default)
    filtered.sort((a, b) => {
      const nameA = a.userId?.names || "";
      const nameB = b.userId?.names || "";
      const comparison = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [fees, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedFees.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedFees.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedFees]);

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
          title={<Typography variant="h6">Fees Dashboard</Typography>}
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
              This dashboard displays all fees records associated with your
              account, including amounts owed, paid, and remaining.
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
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="season">Season</MenuItem>
              <MenuItem value="feeType">Fee Type</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "season"
                  ? "Season/Year"
                  : "Fee Type Name"
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
              <MenuItem value="pending">Pending</MenuItem>
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
              Sort by User {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
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
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        User
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Fee Type
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount Owed
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Amount Paid
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Remaining Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Status
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((fee, index) => (
                        <TableRow hover key={fee._id || index}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.userId?.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.seasonId?.name || "N/A"} (
                            {fee.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.feeTypeId?.name || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(fee.amountOwed)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(fee.amountPaid)}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{
                              color:
                                fee.remainingAmount > 0
                                  ? "error.main"
                                  : "success.main",
                              fontWeight: "bold",
                            }}
                          >
                            {formatCurrency(fee.remainingAmount)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={fee.status || "N/A"}
                              size="small"
                              color={getStatusColor(fee.status)}
                            />
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No fee records found.
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

export default Fees;
