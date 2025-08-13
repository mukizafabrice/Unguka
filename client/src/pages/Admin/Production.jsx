import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchProductions,
  createProduction,
  updateProduction,
  deleteProduction,
} from "../../services/productionService";

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

import AddProductionModal from "../../features/modals/AddProductionModal";
import UpdateProductionModal from "../../features/modals/UpdateProductionModal";

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
  whiteSpace: "normal", // Corrected typo here
  [theme.breakpoints.down("sm")]: {
    padding: "6px 6px",
    fontSize: "0.65rem",
  },
}));

function Production() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const [sortOrder, setSortOrder] = useState("desc"); // Default to descending for dates (newest first)
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadProductions = useCallback(async () => {
    setLoading(true);
    try {
      const productionsData = await fetchProductions();
      setProductions(productionsData || []);
    } catch (error) {
      console.error("Failed to fetch productions:", error);
      toast.error("Failed to load productions.");
      setProductions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductions();
  }, [loadProductions]);

  const handleAddProduction = async (newProduction) => {
    try {
      await createProduction(newProduction);
      setShowAddModal(false);
      toast.success("Production added successfully!");
      await loadProductions();
    } catch (error) {
      console.error("Error adding production:", error);
      toast.error(
        `Failed to add production: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleUpdateProduction = async (updatedData) => {
    try {
      const { _id, ...dataToUpdate } = updatedData;
      await updateProduction(_id, dataToUpdate);
      toast.success("Production updated successfully!");
      setShowUpdateModal(false);
      setSelectedProduction(null);
      await loadProductions();
    } catch (error) {
      console.error("Failed to update production:", error);
      toast.error(
        `Failed to update production: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (production) => {
    setSelectedProduction(production);
    setShowUpdateModal(true);
  };

  const handleDeleteProduction = async (id) => {
    try {
      await deleteProduction(id);
      toast.success("Production deleted successfully!");
      await loadProductions();
    } catch (error) {
      console.error("Failed to delete production:", error);
      toast.error(
        `Failed to delete production: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const filteredAndSortedProductions = useMemo(() => {
    let filtered = productions;

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
          default:
            return true;
        }
      });
    }

    // Sort by date (createdAt)
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

  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedProductions.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(
    filteredAndSortedProductions.length / rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedProductions]);

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
          title={<Typography variant="h6">Productions </Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add Production
            </Button>
          }
        />
        <CardContent
          sx={{
            maxHeight: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 150px)", // Dynamic height for content
            overflowY: "auto", // Scroll content area if it overflows
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Manage and track production data, including member contributions,
              product details, and quantity produced.
            </Typography>
          </Box>

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
              <MenuItem value="productName">Product Name</MenuItem>
              <MenuItem value="member">Member Name</MenuItem>
              <MenuItem value="season">Season/Year</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "productName"
                  ? "Product Name"
                  : searchField === "member"
                  ? "Member Name"
                  : "Season/Year"
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
                  // Removed maxHeight and overflowY from here
                  flexGrow: 1, // Allow table to grow and fill available space
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
                        Date
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "8%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((production, index) => (
                        <TableRow
                          hover
                          key={production._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.userId?.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.productId?.productName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.seasonId?.name || "N/A"}(
                            {production.seasonId?.year || "N/A"})
                          </StyledTableCell>
                          <StyledTableCell>
                            {production.quantity}
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
                                  handleOpenUpdateModal(production)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleDeleteProduction(production._id)
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
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No production found.
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
                    onChange={(event, newPage) => setCurrentPage(newPage)}
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

      <AddProductionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduction}
      />
      <UpdateProductionModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProduction}
        initialData={selectedProduction}
      />

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
