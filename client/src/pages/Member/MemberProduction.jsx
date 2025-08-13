import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchProductionsById } from "../../services/productionService";

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

function Production() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName"); // Default search field
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date descending

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to fetch productions from the backend
  const loadProductions = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id; // Get userId safely

      // Only fetch if userId is available
      if (userId) {
        const productionsData = await fetchProductionsById(userId);
        setProductions(productionsData || []); // Ensure data is an array
      } else {
        console.warn(
          "User ID not found in localStorage. Cannot fetch productions."
        );
        setProductions([]);
      }
    } catch (error) {
      console.error("Failed to fetch productions:", error);
      toast.error("Failed to load productions.");
      setProductions([]); // Reset productions on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load on component mount
  useEffect(() => {
    loadProductions();
  }, [loadProductions]);

  // Filter and sort productions based on search and sort order
  const filteredAndSortedProductions = useMemo(() => {
    let filtered = productions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((production) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "member":
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

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Productions </Typography>}
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
              you’ve produced and their details.
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
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="productName">Product Name</MenuItem>
              <MenuItem value="season">Season</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "member"
                  ? "Member"
                  : searchField === "productName"
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
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Product Name
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Date
                      </StyledTableHeaderCell>
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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

export default Production;
