import React, { useState, useEffect, useMemo, useCallback } from "react";
// Removed ToastContainer and toast import as it's handled globally
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// Using a placeholder toast function if not globally available, or rely on global setup
// const toast = {
//   success: (msg) => console.log("Toast Success:", msg),
//   error: (msg) => console.log("Toast Error:", msg),
// };

import {
  fetchAllFees,
  recordPayment,
  updateFee,
  deleteFee,
} from "../../services/feesService";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { getCooperatives } from "../../services/cooperativeService"; // Assuming this service exists

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
  OutlinedInput, // For multi-select
  Select, // For multi-select
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'; // Example icon for multi-select

import AddFeeModal from "../../features/modals/AddFeeModal";
import UpdateFeeModal from "../../features/modals/UpdateFeeModal";

// Assuming `toast` is globally available or imported in a parent component like App.js
// If `toast` is not accessible here after removing its import, you'd need to
// pass it down as a prop or use React Context for it, or re-import it.
// For this update, we are assuming it's available via a global setup.
const toast = window.toast || { // Fallback if window.toast isn't set
  success: (msg) => console.log("Toast Success:", msg),
  error: (msg) => console.log("Toast Error:", msg),
  // Add other toast methods as needed if you rely on this fallback
};


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
  const [fees, setFees] = useState([]);
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [cooperativesMap, setCooperativesMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("user");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCooperativeIds, setSelectedCooperativeIds] = useState([]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadFeesData = useCallback(async () => {
    setLoading(true);
    try {
      const [cooperativesData, usersData, seasonsData, feeTypesData] =
        await Promise.all([
          getCooperatives(),
          fetchUsers(),
          fetchSeasons(),
          fetchFeeTypes(),
        ]);

      setCooperatives(cooperativesData || []);
      setUsers(usersData || []);
      setSeasons(seasonsData || []);
      setFeeTypes(feeTypesData || []);

      const userMap = {};
      (usersData || []).forEach((user) => {
        userMap[user._id] = user.names;
      });
      setUsersMap(userMap);

      const coopMap = {};
      (cooperativesData || []).forEach((coop) => {
        coopMap[coop._id] = coop.name;
      });
      setCooperativesMap(coopMap);

      const currentCoopIdsToFetch =
        selectedCooperativeIds.length > 0
          ? selectedCooperativeIds
          : (cooperativesData || []).map((coop) => coop._id);

      let allFees = [];
      if (currentCoopIdsToFetch.length > 0) {
        const feesPromises = currentCoopIdsToFetch.map(async (coopId) => {
          try {
            return await fetchAllFees(coopId);
          } catch (err) {
            console.warn(`Failed to fetch fees for cooperative ${coopId}:`, err);
            return [];
          }
        });
        const resolvedFees = await Promise.all(feesPromises);
        allFees = resolvedFees.flat();
      }

      setFees(allFees);
    } catch (error) {
      console.error("Failed to fetch all data:", error);
      toast.error("Failed to load fees dashboard data.");
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCooperativeIds]);

  useEffect(() => {
    loadFeesData();
  }, [loadFeesData]);

  const handleAddFee = async (feeData) => {
    try {
      await recordPayment(feeData);
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

  const handleDeleteFee = async (id, cooperativeId) => {
    try {
      await deleteFee(id, cooperativeId);
      toast.success("Fee record deleted successfully!");
      await loadFeesData();
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error(
        `Failed to delete fee record: ${
          error.response?.data?.message || error.message
        }`
      );
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
    let filtered = fees;

    if (searchTerm) {
      filtered = filtered.filter((fee) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "user":
            return (fee.userId?.names || usersMap[fee.userId])
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
          case "cooperative":
            return (fee.cooperativeId?.name || cooperativesMap[fee.cooperativeId])
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (fee) => fee.status?.toLowerCase() === statusFilter.toLowerCase()
      );
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
  }, [fees, usersMap, cooperativesMap, searchTerm, searchField, statusFilter, sortOrder]);

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

  const handleCooperativeSelectChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCooperativeIds(
      typeof value === "string" ? value.split(",") : value
    );
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
              Manage and track fee records, including user payments, amounts
              owed, and payment status.
            </Typography>
          </Box>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            alignItems={isMobile ? "stretch" : "center"}
          >
            <FormControl sx={{ minWidth: 150, flexShrink: 0 }}>
              <InputLabel id="cooperative-select-label" size="small">Cooperative(s)</InputLabel>
              <Select
                labelId="cooperative-select-label"
                id="cooperative-select-multiple"
                multiple
                value={selectedCooperativeIds}
                onChange={handleCooperativeSelectChange}
                input={<OutlinedInput label="Cooperative(s)" size="small" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={cooperativesMap[value] || value} />
                    ))}
                  </Box>
                )}
              >
                {cooperatives.map((coop) => (
                  <MenuItem key={coop._id} value={coop._id}>
                    {coop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              <MenuItem value="cooperative">Cooperative</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "user"
                  ? "User Name"
                  : searchField === "season"
                  ? "Season/Year"
                  : searchField === "feeType"
                  ? "Fee Type"
                  : "Cooperative"
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
                            {fee.cooperativeId?.name || cooperativesMap[fee.cooperativeId] || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.userId?.names || usersMap[fee.userId] || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {fee.seasonId?.name || "N/A"} ({fee.seasonId?.year || "N/A"})
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
                                onClick={() => handleDeleteFee(fee._id, fee.cooperativeId)}
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

      <AddFeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFee}
        users={users}
        seasons={seasons}
        feeTypes={feeTypes}
        cooperatives={cooperatives} // Pass cooperatives for selection
      />
      <UpdateFeeModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleFeeUpdated}
        feeToEdit={feeToEdit}
        users={users}
        seasons={seasons}
        feeTypes={feeTypes}
        cooperatives={cooperatives}
      />
    </Box>
  );
}

export default Fees;