import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UpdateFeeModal from "../../features/modals/UpdateFeeModal";
import AddFeeModal from "../../features/modals/AddFeeModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchAllFees,
  recordPayment,
  updateFee,
  deleteFee,
} from "../../services/feesService";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { getCooperativeById } from "../../services/cooperativeService";

// --- Styled Components ---
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

const getStatusColor = (status) => {
  switch (status) {
    case "Paid":
      return "success";
    case "Pending":
    case "Partially Paid":
      return "warning";
    default:
      return "default";
  }
};

function Fees() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const [fees, setFees] = useState([]);
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [cooperativeName, setCooperativeName] = useState("");
  const [usersMap, setUsersMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState(null);

  // ⭐ NEW: State for the confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [feeToDeleteId, setFeeToDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount || 0);
  };

  const loadFeesData = useCallback(async () => {
    setLoading(true);

    if (!cooperativeId) {
      console.warn(
        "User does not have a cooperativeId assigned. Cannot load fees."
      );
      setFees([]);
      toast.warn("You must be assigned to a cooperative to view fees.");
      setLoading(false);
      return;
    }

    try {
      const [
        usersResult,
        seasonsResult,
        feeTypesResult,
        feesResult,
        coopNameResult,
      ] = await Promise.allSettled([
        fetchUsers(cooperativeId),
        fetchSeasons(cooperativeId),
        fetchFeeTypes(cooperativeId),
        fetchAllFees(cooperativeId),
        getCooperativeById(cooperativeId),
      ]);

      if (
        usersResult.status === "fulfilled" &&
        Array.isArray(usersResult.value?.data)
      ) {
        setUsers(usersResult.value.data);
        const uMap = usersResult.value.data.reduce(
          (acc, u) => ({ ...acc, [u._id]: u.names }),
          {}
        );
        setUsersMap(uMap);
      } else {
        console.error(
          "Failed to fetch users:",
          usersResult.reason || "Unknown error"
        );
        toast.error("Failed to load user data.");
        setUsers([]);
        setUsersMap({});
      }

      if (
        seasonsResult.status === "fulfilled" &&
        Array.isArray(seasonsResult.value?.data)
      ) {
        setSeasons(seasonsResult.value.data);
      } else {
        console.error(
          "Failed to fetch seasons:",
          seasonsResult.reason || "Unknown error"
        );
        toast.error("Failed to load season data.");
        setSeasons([]);
      }

      if (
        feeTypesResult.status === "fulfilled" &&
        Array.isArray(feeTypesResult.value?.data)
      ) {
        setFeeTypes(feeTypesResult.value.data);
      } else {
        console.error(
          "Failed to fetch fee types:",
          feeTypesResult.reason || "Unknown error"
        );
        toast.error("Failed to load fee type data.");
        setFeeTypes([]);
      }

      if (
        feesResult.status === "fulfilled" &&
        Array.isArray(feesResult.value?.data)
      ) {
        setFees(feesResult.value.data);
      } else {
        console.error(
          "Failed to fetch fees:",
          feesResult.reason || "Unknown error"
        );
        toast.error("Failed to load fees data.");
        setFees([]);
      }

      if (
        coopNameResult.status === "fulfilled" &&
        coopNameResult.value?.data?.name
      ) {
        setCooperativeName(coopNameResult.value.data.name);
      } else {
        console.error(
          "Failed to fetch cooperative name:",
          coopNameResult.reason || "Unknown error"
        );
        setCooperativeName("N/A");
        toast.error("Failed to load cooperative name.");
      }
    } catch (error) {
      console.error("Error during fees data load:", error);
      toast.error("An unexpected error occurred while loading fees data.");
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    if (cooperativeId) {
      loadFeesData();
    }
  }, [cooperativeId, loadFeesData]);

  const handleAddFee = async (feeData) => {
    try {
      const feeDataWithCoopId = {
        ...feeData,
        cooperativeId: cooperativeId,
      };
      await recordPayment(feeDataWithCoopId);
      setShowAddModal(false);
      toast.success("Fee record added successfully!");
      await loadFeesData();
    } catch (error) {
      console.error("Error recording fee:", error);
      toast.error(
        `Failed to record fee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // ⭐ NEW: Function to open the confirmation dialog
  const handleOpenDeleteDialog = (id) => {
    setFeeToDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // ⭐ NEW: Function to close the confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setFeeToDeleteId(null);
  };

  // ⭐ MODIFIED: Actual deletion function, now called after confirmation
  const handleConfirmDelete = async () => {
    if (!feeToDeleteId) return;

    try {
      await deleteFee(feeToDeleteId);
      toast.success("Fee record deleted successfully!");
      handleCloseDeleteDialog(); // Close dialog on success
      await loadFeesData();
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error(
        `Failed to delete fee record: ${
          error.response?.data?.message || error.message
        }`
      );
      handleCloseDeleteDialog(); // Close dialog on error as well
    }
  };

  const handleUpdateFee = (fee) => {
    setFeeToEdit(fee);
    setShowUpdateModal(true);
  };

  const handleFeeUpdated = async (id, updatedFeeData) => {
    try {
      await updateFee(id, updatedFeeData);
      toast.success("Fee record updated successfully!");
      setShowUpdateModal(false);
      setFeeToEdit(null);
      await loadFeesData();
    } catch (error) {
      console.error("Error updating fee:", error);
      toast.error(
        `Failed to update fee record: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const filteredAndSortedFees = useMemo(() => {
    let currentFiltered = fees;
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter((fee) => {
        let valueToSearch = "";
        switch (searchField) {
          case "user":
            valueToSearch = fee.userId?.names || usersMap[fee.userId] || "";
            break;
          case "season":
            valueToSearch = `${fee.seasonId?.name || ""} ${
              fee.seasonId?.year || ""
            }`;
            break;
          case "feeType":
            valueToSearch = fee.feeTypeId?.name || "";
            break;
          default:
            return true;
        }
        return valueToSearch.toLowerCase().includes(lowerCaseSearchTerm);
      });
    }

    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(
        (fee) => fee.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    currentFiltered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return currentFiltered;
  }, [fees, usersMap, searchTerm, searchField, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedFees.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedFees.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedFees]);

  const handlePageChange = useCallback((event, pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Fees Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Record Fee
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
              Manage and track fee records for your cooperative.
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
              <MenuItem value="user">User Name</MenuItem>
              <MenuItem value="season">Season/Year</MenuItem>
              <MenuItem value="feeType">Fee Type</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "season"
                  ? "Season/Year"
                  : "Fee Type"
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
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
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
                  boxShadow: 3,
                  borderRadius: 2,
                  overflowX: "auto", // Ensure horizontal scrolling is possible
                  maxHeight: { xs: "50vh", md: "70vh" },
                }}
              >
                <Table
                  size="small"
                  // minWidth ensures table doesn't shrink too much, enabling horizontal scroll
                  sx={{ minWidth: 700, tableLayout: "auto" }} // Changed to 'auto' or 'fixed' as needed
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        Cooperative
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        User
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        Season
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "12%" }}>
                        Fee Type
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Amount Owed
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Amount Paid
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "10%" }}>
                        Remaining
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "7%" }}>
                        Status
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "10%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((fee, index) => (
                        <TableRow
                          hover
                          key={fee._id || index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCell component="th" scope="row">
                            {indexOfFirstRow + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {cooperativeName || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.userId?.names || usersMap[fee.userId] || "N/A"}
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
                              label={fee.status}
                              size="small"
                              color={getStatusColor(fee.status)}
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
                                onClick={() => handleUpdateFee(fee)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(fee._id)} // ⭐ Use the new handler
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No fee records found.
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
                    onChange={handlePageChange}
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

      {/* --- Modals and Dialogs --- */}
      {cooperativeId && (
        <>
          <AddFeeModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddFee}
            users={users}
            seasons={seasons}
            feeTypes={feeTypes}
            cooperativeId={cooperativeId}
            cooperativeName={cooperativeName}
          />
          <UpdateFeeModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onSubmit={handleFeeUpdated}
            feeToEdit={feeToEdit}
            users={users}
            seasons={seasons}
            feeTypes={feeTypes}
            cooperativeId={cooperativeId}
            cooperativeName={cooperativeName}
          />
        </>
      )}

      {/* ⭐ NEW: Confirmation Dialog for Deletion */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete this fee record? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Fees;
