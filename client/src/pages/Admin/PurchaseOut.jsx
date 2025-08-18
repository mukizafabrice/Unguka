// frontend/src/pages/PurchaseOut.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchAllPurchaseOuts,
  createPurchaseOut,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../../services/purchaseOutService";

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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear";

import AddPurchaseOutModal from "../../features/modals/AddPurchaseOutModal";
import UpdatePurchaseOutModal from "../../features/modals/UpdatePurchaseOutModal";

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
  backgroundColor: "#f5f5f5",
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

function PurchaseOut() {
  const { user } = useAuth();
  const [purchaseOuts, setPurchaseOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseOut, setSelectedPurchaseOut] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const [sortOrder, setSortOrder] = useState("desc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0);
  };

  const loadPurchaseOut = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAllPurchaseOuts();
      if (response.success && Array.isArray(response.data)) {
        setPurchaseOuts(response.data);
      } else {
        console.error("Failed to fetch purchase outs:", response.message);
        toast.error(response.message || "Failed to load purchases.");
        setPurchaseOuts([]);
      }
    } catch (error) {
      console.error("Failed to fetch purchase outs (catch block):", error);
      toast.error("An unexpected error occurred while loading purchases.");
      setPurchaseOuts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchaseOut();
  }, [loadPurchaseOut]);

  const handleAddPurchaseOut = async (newPurchaseOutData) => {
    try {
      const response = await createPurchaseOut(newPurchaseOutData);
      if (response.success) {
        toast.success(response.message || "Purchase added successfully!");
        setShowAddModal(false);
        await loadPurchaseOut();
      } else {
        toast.error(response.message || "Failed to add purchase.");
      }
    } catch (error) {
      console.error("Failed to add purchase:", error);
      toast.error(
        `Failed to add purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (purchaseOut) => {
    setSelectedPurchaseOut(purchaseOut);
    setShowUpdateModal(true);
  };

  const handleUpdatePurchaseOut = async (id, updatedPurchaseOutData) => {
    try {
      const response = await updatePurchaseOut(id, updatedPurchaseOutData);
      if (response.success) {
        toast.success(response.message || "Purchase updated successfully!");
        setShowUpdateModal(false);
        setSelectedPurchaseOut(null);
        await loadPurchaseOut();
      } else {
        toast.error(
          `Failed to update purchase: ${
            response.message || "An unexpected error occurred."
          }`
        );
      }
    } catch (error) {
      console.error("Failed to update purchase:", error);
      toast.error(
        `Failed to update purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeletePurchaseOut = async (id) => {
    try {
      const response = await deletePurchaseOut(id);
      if (response.success) {
        toast.success(response.message || "Purchase deleted successfully!");
        await loadPurchaseOut();
      } else {
        toast.error(response.message || "Failed to delete purchase.");
      }
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      toast.error(
        `Failed to delete purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const filteredAndSortedPurchaseOuts = useMemo(() => {
    let filtered = purchaseOuts;

    if (searchTerm) {
      filtered = filtered.filter((po) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "productName":
            return po.productId?.productName
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          case "season":
            return (
              po.seasonId?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
              po.seasonId?.year?.toString().includes(lowerCaseSearchTerm)
            );
          case "date":
            return po.createdAt
              ? new Date(po.createdAt)
                  .toLocaleDateString()
                  .includes(lowerCaseSearchTerm)
              : false;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return filtered;
  }, [purchaseOuts, searchTerm, searchField, sortOrder]);

  const totalPages = Math.ceil(
    filteredAndSortedPurchaseOuts.length / rowsPerPage
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedPurchaseOuts.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedPurchaseOuts]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
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
          title={<Typography variant="h6">Purchases Out Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Purchase
            </Button>
          }
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
              Manage and track products purchased from outside the cooperative.
            </Typography>
          </Box>
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
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search purchases..."
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
                  boxShadow: 3,
                  borderRadius: 2,
                  overflowX: "auto",
                  flexGrow: 1,
                  maxHeight: { xs: "50vh", md: "70vh" },
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{ minWidth: 900, tableLayout: "fixed" }}
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "20%", minWidth: "150px" }}
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
                        sx={{ width: "15%", minWidth: "100px" }}
                      >
                        Unit Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "15%", minWidth: "100px" }}
                      >
                        Total Price
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        sx={{ width: "10%", minWidth: "90px" }}
                      >
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "10%", minWidth: "100px" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((purchaseOut, index) => (
                        <TableRow hover key={purchaseOut._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.seasonId?.name || "N/A"} (
                            {purchaseOut.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.quantity || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseOut.unitPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatCurrency(purchaseOut.totalPrice || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {purchaseOut.createdAt
                              ? new Date(
                                  purchaseOut.createdAt
                                ).toLocaleDateString()
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
                                onClick={() =>
                                  handleOpenUpdateModal(purchaseOut)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleDeletePurchaseOut(purchaseOut._id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No purchases found for this cooperative.
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

      {/* Conditionally render the modals only when cooperativeId is available */}
      {user?.cooperativeId && (
        <>
          <AddPurchaseOutModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddPurchaseOut}
            cooperativeId={user.cooperativeId}
          />

          <UpdatePurchaseOutModal
            show={showUpdateModal}
            purchaseOut={selectedPurchaseOut}
            onClose={() => setShowUpdateModal(false)}
            onSubmit={handleUpdatePurchaseOut}
            cooperativeId={user.cooperativeId}
          />
        </>
      )}
    </Box>
  );
}

export default PurchaseOut;
