// src/pages/Super/cooperative.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormControlLabel,
  TablePagination,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  CheckCircleOutline,
  ErrorOutline,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import {
  createCooperative,
  getCooperatives,
  updateCooperative,
  deleteCooperative,
} from "../../services/cooperativeService";
import { fetchUsers, updateUser } from "../../services/userService"; // Added updateUser from userService

const CooperativesTable = () => {
  const [cooperatives, setCooperatives] = useState([]);
  const [filteredCooperatives, setFilteredCooperatives] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false); // State for Assign Manager dialog
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [currentCooperative, setCurrentCooperative] = useState(null);
  const [newCooperativeData, setNewCooperativeData] = useState({
    name: "",
    registrationNumber: "",
    district: "",
    sector: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [editCooperativeData, setEditCooperativeData] = useState(null);
  const [assignManagerData, setAssignManagerData] = useState({ managerId: "" }); // State for selected manager in assign dialog
  const [availableManagers, setAvailableManagers] = useState([]); // List of managers who are not assigned to any cooperative

  const fetchCooperatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCooperatives();
      if (response.success) {
        setCooperatives(response.data);
      } else {
        setError(response.message);
        toast.error(`Failed to load cooperatives: ${response.message}`);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching cooperatives.");
      toast.error("Failed to load cooperatives. Network error?");
      console.error("Fetch cooperatives error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableManagers = async () => {
    try {
      const response = await fetchUsers(); // This returns { success: boolean, data: array, message: string }
      if (response.success && Array.isArray(response.data)) {
        // Check success and if data is array
        // Filter for managers who are not currently assigned to any cooperative
        const managers = response.data.filter(
          (user) => user.role === "manager" && !user.cooperativeId
        );
        setAvailableManagers(managers);
      } else {
        console.error(
          "Failed to fetch managers: Response was empty or not an array.",
          response.message
        );
        toast.error(
          `Failed to load available managers: ${
            response.message || "Data format error."
          }`
        );
      }
    } catch (err) {
      console.error("Fetch managers error:", err);
      toast.error("An error occurred while fetching available managers.");
    }
  };

  useEffect(() => {
    fetchCooperatives();
    fetchAvailableManagers();
  }, []);

  // Filter logic - combines search and new filters
  useEffect(() => {
    let currentFiltered = cooperatives;

    // Apply text search
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (coop) =>
          coop.name.toLowerCase().includes(lowercasedSearchText) ||
          coop.registrationNumber
            .toLowerCase()
            .includes(lowercasedSearchText) ||
          coop.district.toLowerCase().includes(lowercasedSearchText) ||
          coop.sector.toLowerCase().includes(lowercasedSearchText) ||
          (coop.contactEmail &&
            coop.contactEmail.toLowerCase().includes(lowercasedSearchText)) ||
          (coop.contactPhone &&
            coop.contactPhone.toLowerCase().includes(lowercasedSearchText))
      );
    }

    // Apply district filter
    if (selectedDistrict) {
      currentFiltered = currentFiltered.filter(
        (coop) => coop.district === selectedDistrict
      );
    }

    // Apply sector filter
    if (selectedSector) {
      currentFiltered = currentFiltered.filter(
        (coop) => coop.sector === selectedSector
      );
    }

    // Apply active status filter
    if (activeStatusFilter !== "all") {
      const isActiveBool = activeStatusFilter === "true";
      currentFiltered = currentFiltered.filter(
        (coop) => coop.isActive === isActiveBool
      );
    }

    setFilteredCooperatives(currentFiltered);
    setPage(0); // Reset page to 0 when filters change
  }, [
    searchText,
    cooperatives,
    selectedDistrict,
    selectedSector,
    activeStatusFilter,
  ]);

  // Unique lists for filters
  const uniqueDistricts = useMemo(() => {
    const districts = new Set(
      cooperatives.map((coop) => coop.district).filter(Boolean)
    );
    return ["", ...Array.from(districts).sort()]; // Include empty string for "All"
  }, [cooperatives]);

  const uniqueSectors = useMemo(() => {
    const sectors = new Set(
      cooperatives.map((coop) => coop.sector).filter(Boolean)
    );
    return ["", ...Array.from(sectors).sort()]; // Include empty string for "All"
  }, [cooperatives]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredCooperatives.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchText("");
    setSelectedDistrict("");
    setSelectedSector("");
    setActiveStatusFilter("all");
    setPage(0);
  };

  // --- Add Cooperative Dialog Handlers ---
  const handleOpenAddDialog = () => {
    setNewCooperativeData({
      name: "",
      registrationNumber: "",
      district: "",
      sector: "",
      contactEmail: "",
      contactPhone: "",
    });
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);
  const handleAddChange = (e) => {
    setNewCooperativeData({
      ...newCooperativeData,
      [e.target.name]: e.target.value,
    });
  };
  const handleAddSubmit = async () => {
    try {
      const response = await createCooperative(newCooperativeData);
      if (response.success) {
        toast.success("Cooperative added successfully!");
        fetchCooperatives();
        setOpenAddDialog(false);
      } else {
        toast.error(`Failed to add cooperative: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during creation.");
      console.error("Creation error:", err);
    }
  };

  // --- Edit Cooperative Dialog Handlers ---
  const handleOpenEditDialog = (coop) => {
    setCurrentCooperative(coop);
    setEditCooperativeData({ ...coop });
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => setOpenEditDialog(false);
  const handleEditChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditCooperativeData({ ...editCooperativeData, [e.target.name]: value });
  };
  const handleEditSubmit = async () => {
    try {
      const response = await updateCooperative(
        currentCooperative._id,
        editCooperativeData
      );
      if (response.success) {
        toast.success("Cooperative updated successfully!");
        fetchCooperatives();
        setOpenEditDialog(false);
      } else {
        toast.error(`Failed to update cooperative: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during update.");
      console.error("Update error:", err);
    }
  };

  // --- Delete Cooperative Dialog Handlers ---
  const handleOpenConfirmDeleteDialog = (coop) => {
    setCurrentCooperative(coop);
    setOpenConfirmDeleteDialog(true);
  };
  const handleCloseConfirmDeleteDialog = () =>
    setOpenConfirmDeleteDialog(false);
  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteCooperative(currentCooperative._id);
      if (response.success) {
        toast.success("Cooperative deleted successfully!");
        fetchCooperatives();
        setSelected(selected.filter((id) => id !== currentCooperative._id));
        setOpenConfirmDeleteDialog(false);
      } else {
        toast.error(`Failed to delete cooperative: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during deletion.");
      console.error("Deletion error:", err);
    }
  };

  // --- Assign Manager Dialog Handlers ---
  const handleOpenAssignDialog = () => {
    if (selected.length === 1) {
      const coopToAssign = filteredCooperatives.find(
        (c) => c._id === selected[0]
      );
      setCurrentCooperative(coopToAssign);
      // Pre-select current manager if any, otherwise empty string
      setAssignManagerData({ managerId: coopToAssign?.managerId || "" });
      setOpenAssignDialog(true);
      fetchAvailableManagers(); // Re-fetch available managers just in case
    } else {
      toast.warn("Please select exactly one cooperative to assign a manager.");
    }
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setAssignManagerData({ managerId: "" }); // Reset selection
  };

  const handleAssignChange = (e) => {
    setAssignManagerData({ managerId: e.target.value });
  };

  const handleAssignSubmit = async () => {
    if (!currentCooperative) {
      toast.error("No cooperative selected for assignment.");
      return;
    }

    const managerIdToAssign =
      assignManagerData.managerId === "" ? null : assignManagerData.managerId;

    try {
      // 1. Update the selected manager (assign or unassign from previous cooperative if any)
      // This step ensures the *manager's* record is updated with the cooperativeId
      if (managerIdToAssign) {
        // If assigning a manager
        const response = await updateUser(managerIdToAssign, {
          cooperativeId: currentCooperative._id,
        });
        if (!response.success) {
          toast.error(`Failed to assign manager: ${response.message}`);
          return;
        }
      }

      // If there was a previous manager on this cooperative, unassign them first
      // This is a more complex logic. For now, we assume a manager can only be assigned to one cooperative.
      // If a manager is moved from Coop A to Coop B, their old cooperativeId should be set to null.
      // This needs a backend endpoint that can find a manager by cooperativeId and set it null.
      // For simplicity, this current implementation only assigns the *selected* manager.
      // A more robust solution might involve:
      // a) Fetching the previously assigned manager (if any) for `currentCooperative`
      // b) Setting `cooperativeId` to `null` for that previous manager.
      // c) Then assigning the new manager.
      // For now, we'll assume `updateUser` can handle setting `cooperativeId` to `null` for the new manager if "None" is selected.

      // 2. Update the Cooperative (optional, if your coop model stores managerId)
      // If your Cooperative model stores 'managerId', you would update it here:
      // const coopUpdateResponse = await updateCooperative(currentCooperative._id, { managerId: managerIdToAssign });
      // if (!coopUpdateResponse.success) {
      //   toast.error(`Failed to update cooperative's manager reference: ${coopUpdateResponse.message}`);
      //   return;
      // }

      // After updating the manager, re-fetch all necessary data
      toast.success(
        managerIdToAssign
          ? "Manager assigned successfully!"
          : "Manager unassigned successfully!"
      );
      fetchCooperatives(); // Refresh cooperatives table
      fetchAvailableManagers(); // Refresh available managers list
      setOpenAssignDialog(false); // Close the dialog
    } catch (err) {
      toast.error("An unexpected error occurred during manager assignment.");
      console.error("Assign manager error:", err);
    }
  };

  // Conditional rendering for pagination
  const showPagination = filteredCooperatives.length > rowsPerPage; // Show if more than default rows per page

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {" "}
      {/* Responsive padding */}
      {/* Moved this section to the top, removing the H4 title */}
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
          {/* Search Bar Design */}
          <TextField
            variant="outlined"
            size="small" // Make search bar smaller
            placeholder="Search cooperatives..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "300px", md: "350px" }, // Responsive width
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px",
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#bdbdbd" },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputBase-input": { padding: "8px 12px" }, // Smaller padding
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 1.5 },
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#388e3c" },
                borderRadius: "8px",
                py: "8px",
                px: "12px",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
              onClick={handleOpenAssignDialog}
              disabled={selected.length !== 1}
            >
              Assign Manager
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#1976d2",
                "&:hover": { bgcolor: "#115293" },
                borderRadius: "8px",
                py: "8px",
                px: "12px",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
              onClick={handleOpenAddDialog}
            >
              Add Cooperative
            </Button>
          </Box>
        </Box>

        {/* Filter Controls */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            alignItems: "center",
            flexWrap: "wrap",
            pt: { xs: 1.5, sm: 2 },
            borderTop: "1px solid #eee",
            mt: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            Filters:
          </Typography>
          <FormControl sx={{ minWidth: { xs: 120, sm: 150 } }} size="small">
            {" "}
            {/* Smaller filter controls */}
            <InputLabel id="district-filter-label">District</InputLabel>
            <Select
              labelId="district-filter-label"
              id="district-filter-select"
              value={selectedDistrict}
              label="District"
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {uniqueDistricts.map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: { xs: 120, sm: 150 } }} size="small">
            {" "}
            {/* Smaller filter controls */}
            <InputLabel id="sector-filter-label">Sector</InputLabel>
            <Select
              labelId="sector-filter-label"
              id="sector-filter-select"
              value={selectedSector}
              label="Sector"
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {uniqueSectors.map((sector) => (
                <MenuItem key={sector} value={sector}>
                  {sector}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset" sx={{ ml: { xs: 0, sm: 1 } }}>
            {" "}
            {/* Adjust margin for small screens */}
            <RadioGroup
              row
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label={<Typography variant="body2">All Status</Typography>}
              />
              <FormControlLabel
                value="true"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Active</Typography>}
              />
              <FormControlLabel
                value="false"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Inactive</Typography>}
              />
            </RadioGroup>
          </FormControl>

          {(searchText ||
            selectedDistrict ||
            selectedSector ||
            activeStatusFilter !== "all") && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small" // Smaller clear button
              sx={{ ml: { xs: 0, md: "auto" }, mt: { xs: 1, md: 0 } }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>
      {/* Table with Scrollbar */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: "8px",
          overflowX: "auto",
          maxHeight: { xs: "50vh", md: "70vh" },
        }}
      >
        {" "}
        {/* Responsive max height */}
        <Table
          stickyHeader
          sx={{ minWidth: 800 }}
          aria-label="cooperatives table"
        >
          {" "}
          {/* Increased minWidth for scroll, sticky header */}
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={handleSelectAllClick}
                  checked={
                    selected.length === filteredCooperatives.length &&
                    filteredCooperatives.length > 0
                  }
                  inputProps={{ "aria-label": "select all cooperatives" }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "120px" }}>
                Reg. No.
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "100px" }}>
                District
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "100px" }}>
                Sector
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "180px" }}>
                Contact Email
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                Contact Phone
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "80px" }}>
                Active
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "120px" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading cooperatives...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredCooperatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1">
                    No cooperatives found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Slice data for current page
              filteredCooperatives
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((coop) => {
                  const isItemSelected = isSelected(coop._id);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, coop._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={coop._id}
                      selected={isItemSelected}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": `cooperative-checkbox-${coop._id}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>{coop.name}</TableCell>
                      <TableCell>{coop.registrationNumber}</TableCell>
                      <TableCell>{coop.district}</TableCell>
                      <TableCell>{coop.sector}</TableCell>
                      <TableCell>{coop.contactEmail || "N/A"}</TableCell>
                      <TableCell>{coop.contactPhone || "N/A"}</TableCell>
                      <TableCell>{coop.isActive ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenEditDialog(coop);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenConfirmDeleteDialog(coop);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Table Pagination - Conditional and styled */}
      {filteredCooperatives.length > 5 && ( // Show pagination if more than 5 items
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Keeps options for flexibility
          component="div"
          count={filteredCooperatives.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            mt: 2,
            display: "flex", // Ensure flex for proper alignment
            justifyContent: "center", // Center pagination controls
            "& .MuiTablePagination-toolbar": {
              flexDirection: { xs: "column", sm: "row" }, // Stack on small screens
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            },
            "& .MuiTablePagination-displayedRows": { order: { xs: 2, sm: 0 } }, // Order control
            "& .MuiTablePagination-actions": { order: { xs: 3, sm: 0 } },
            "& .MuiTablePagination-selectLabel": { mb: { xs: 0.5, sm: 0 } },
            "& .MuiTablePagination-select": { mr: { xs: 0, sm: 2 } },
          }}
        />
      )}
      {/* Add Cooperative Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Cooperative</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            name="name"
            label="Cooperative Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCooperativeData.name}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="registrationNumber"
            label="Registration Number"
            type="text"
            fullWidth
            variant="outlined"
            value={newCooperativeData.registrationNumber}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="district"
            label="District"
            type="text"
            fullWidth
            variant="outlined"
            value={newCooperativeData.district}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="sector"
            label="Sector"
            type="text"
            fullWidth
            variant="outlined"
            value={newCooperativeData.sector}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="contactEmail"
            label="Contact Email (Optional)"
            type="email"
            fullWidth
            variant="outlined"
            value={newCooperativeData.contactEmail}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="contactPhone"
            label="Contact Phone (Optional)"
            type="tel"
            fullWidth
            variant="outlined"
            value={newCooperativeData.contactPhone}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Cooperative Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Cooperative</DialogTitle>
        <DialogContent dividers>
          {editCooperativeData && (
            <>
              <TextField
                margin="dense"
                name="name"
                label="Cooperative Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editCooperativeData.name || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="registrationNumber"
                label="Registration Number"
                type="text"
                fullWidth
                variant="outlined"
                value={editCooperativeData.registrationNumber || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="district"
                label="District"
                type="text"
                fullWidth
                variant="outlined"
                value={editCooperativeData.district || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="sector"
                label="Sector"
                type="text"
                fullWidth
                variant="outlined"
                value={editCooperativeData.sector || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="contactEmail"
                label="Contact Email (Optional)"
                type="email"
                fullWidth
                variant="outlined"
                value={editCooperativeData.contactEmail || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="contactPhone"
                label="Contact Phone (Optional)"
                type="tel"
                fullWidth
                variant="outlined"
                value={editCooperativeData.contactPhone || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editCooperativeData.isActive}
                    onChange={handleEditChange} // Use generic handleEditChange for checkbox
                    name="isActive"
                    color="primary"
                  />
                }
                label="Is Active"
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Assign Manager Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>Assign Manager to {currentCooperative?.name}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="manager-select-label">Select Manager</InputLabel>
            <Select
              labelId="manager-select-label"
              id="manager-select"
              value={assignManagerData.managerId}
              label="Select Manager"
              onChange={handleAssignChange}
            >
              <MenuItem value="">
                <em>None (Unassign)</em>
              </MenuItem>
              {availableManagers.map((manager) => (
                <MenuItem key={manager._id} value={manager._id}>
                  {manager.names} ({manager.email || manager.phoneNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Only unassigned managers are shown. Selecting "None" will unassign
            the current manager.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            color="primary"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={handleCloseConfirmDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete cooperative "
            <strong>{currentCooperative?.name}</strong>"? This action cannot be
            undone and will delete all associated data (users, loans, etc.).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CooperativesTable;
