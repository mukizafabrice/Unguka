import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchSales,
  deleteSales,
  updateSales,
  createSales,
} from "../../services/salesService";

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
  Chip, // Added Chip for status display
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import UpdateSaleModal from "../../features/modals/UpdateSaleModal";
import AddSaleModal from "../../features/modals/AddSaleModal";

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
  switch (status) {
    case "paid":
      return "success";
    case "unpaid":
      return "warning";
    default:
      return "default";
  }
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Changed from itemsPerPage to rowsPerPage for consistency

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("product"); // Default search field
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort by date, newest first

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const salesData = await fetchSales();
      // Adjust this based on your actual API response structure
      setSales(salesData.data || salesData || []);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast.error("Failed to load sales.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Filter and sort sales based on searchTerm, searchField, statusFilter, and sortOrder
  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((sale) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "product":
            return sale.stockId?.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              sale.seasonId?.name
                ?.toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              sale.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "buyer":
            return sale.buyer?.toLowerCase().includes(lowerCaseSearchTerm);
          case "phoneNumber":
            return sale.phoneNumber?.includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }

    // Apply sorting by date (createdAt)
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
  }, [sales, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / rowsPerPage);
  const indexOfLastSale = currentPage * rowsPerPage;
  const indexOfFirstSale = indexOfLastSale - rowsPerPage;
  const currentSales = filteredAndSortedSales.slice(
    indexOfFirstSale,
    indexOfLastSale
  );

  // Reset page to 1 whenever filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedSales]);

  const paginate = useCallback((event, pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleAddSale = async (newSaleData) => {
    try {
      await createSales(newSaleData);
      toast.success("Sale added successfully!");
      await loadSales();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add new sale:", error);
      toast.error(
        `Failed to add sale: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleOpenUpdateModal = (sale) => {
    setSelectedSale(sale);
    setShowUpdateModal(true);
  };

  const handleUpdateSale = async (saleId, updatedSaleData) => {
    try {
      await updateSales(saleId, updatedSaleData);
      toast.success("Sale updated successfully!");
      await loadSales();
      setShowUpdateModal(false);
      setSelectedSale(null);
    } catch (error) {
      console.error("Failed to update sale:", error);
      toast.error(
        `Failed to update sale: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeleteSale = async (id) => {
    try {
      await deleteSales(id);
      toast.success("Sale deleted successfully!");
      await loadSales();

      // Adjust current page if the last item on a page was deleted
      if (currentSales.length === 1 && currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }
    } catch (error) {
      console.error("Failed to delete sale:", error);
      toast.error(
        `Failed to delete sale: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Sales Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Sale
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track sales data, including product details, buyer
              information, and payment status.
            </Typography>
          </Box>

          {/* Search, Filter, and Sort Section */}
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
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="season">Season</MenuItem>
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="phoneNumber">Phone Number</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "product"
                  ? "Product Name"
                  : searchField === "season"
                  ? "Season/Year"
                  : searchField === "buyer"
                  ? "Buyer Name"
                  : "Phone Number"
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
              <MenuItem value="unpaid">Unpaid</MenuItem>
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
                  flexGrow: 1,
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Product
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "8%" }}>
                        Quantity
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        Amount
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Buyer
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Tel
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "8%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "5%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentSales.length > 0 ? (
                      currentSales.map((sale, index) => (
                        <TableRow
                          hover
                          key={sale._id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell>
                            {indexOfFirstSale + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.stockId?.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.seasonId?.name || "N/A"} (
                            {sale.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.quantity}{" "}
                            <span style={{ fontWeight: "bold" }}>kg</span>
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(sale.unitPrice)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(sale.totalPrice)}
                          </StyledTableCell>
                          <StyledTableCell>{sale.buyer}</StyledTableCell>
                          <StyledTableCell>{sale.phoneNumber}</StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={sale.status}
                              size="small"
                              color={getStatusColor(sale.status)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
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
                                onClick={() => handleOpenUpdateModal(sale)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteSale(sale._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No sales found.
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
                    onChange={paginate}
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

      {/* Modals */}
      <UpdateSaleModal
        show={showUpdateModal}
        sale={selectedSale}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSale}
      />
      <AddSaleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSale}
      />

      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default Sales;
