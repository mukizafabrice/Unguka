// src/pages/Super/ManagersTable.jsx
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
  CheckCircleOutline,
  ErrorOutline,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// Named imports for userService functions
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userService";
// Named imports for cooperativeService functions
import { getCooperatives } from "../../services/cooperativeService";

const ManagersTable = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [activeStatusFilter, setActiveStatusFilter] = useState("all"); // 'all', 'true', 'false'
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // 'all', 'assigned', 'unassigned'

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [currentManager, setCurrentManager] = useState(null); // For edit/delete
  const [newManagerData, setNewManagerData] = useState({
    names: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    role: "manager",
    cooperativeId: "",
  });
  const [editManagerData, setEditManagerData] = useState(null);
  const [cooperativesList, setCooperativesList] = useState([]); // For displaying cooperative names

  // State for form validation errors
  const [addFormErrors, setAddFormErrors] = useState({});

  // Fetch Managers and Cooperatives
  const fetchManagers = async () => {
    console.log("Fetching managers...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers(); // response is now { success: true, data: [...], message: "..." }
      if (response.success) {
        // Check for success flag
        const managerUsers = response.data.filter(
          (user) => user.role === "manager"
        ); // Access .data property
        setManagers([...managerUsers]);
        console.log("Managers fetched successfully:", managerUsers);
      } else {
        setError(response.message);
        toast.error(`Failed to load managers: ${response.message}`);
        console.error("Fetch managers failed: ", response.message);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching managers.");
      toast.error("Failed to load managers. Network error?");
      console.error("Fetch managers error:", err);
    } finally {
      setLoading(false);
      console.log("Finished fetching managers.");
    }
  };

  const fetchCooperativesList = async () => {
    console.log("Fetching cooperatives list...");
    try {
      const response = await getCooperatives(); // This also returns { success: true, data: [...] }
      if (response.success) {
        setCooperativesList(response.data);
        console.log("Cooperative list fetched successfully:", response.data);
      } else {
        console.error("Failed to fetch cooperatives list:", response.message);
        toast.error("Failed to load cooperative list for display.");
      }
    } catch (err) {
      console.error("Fetch cooperatives list error:", err);
      toast.error("An error occurred while fetching cooperative list.");
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchCooperativesList();
  }, []);

  // Filter logic - combines search and new filters
  useEffect(() => {
    console.log(
      "Filtering managers. Current managers state:",
      managers.length,
      "items."
    );
    let currentFiltered = managers;

    // Apply text search
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (manager) =>
          manager.names.toLowerCase().includes(lowercasedSearchText) ||
          (manager.email &&
            manager.email.toLowerCase().includes(lowercasedSearchText)) ||
          (manager.phoneNumber &&
            manager.phoneNumber.toLowerCase().includes(lowercasedSearchText))
      );
    }

    // Apply active status filter
    if (activeStatusFilter !== "all") {
      const isActiveBool = activeStatusFilter === "true";
      currentFiltered = currentFiltered.filter(
        (manager) => manager.isActive === isActiveBool
      );
    }

    // Apply assignment filter
    if (assignmentFilter === "assigned") {
      currentFiltered = currentFiltered.filter(
        (manager) => manager.cooperativeId
      );
    } else if (assignmentFilter === "unassigned") {
      currentFiltered = currentFiltered.filter(
        (manager) => !manager.cooperativeId
      );
    }

    setFilteredManagers(currentFiltered);
    setPage(0);
    console.log(
      "Filtered managers state updated. New count:",
      currentFiltered.length
    );
  }, [searchText, managers, activeStatusFilter, assignmentFilter]);

  // Utility to get cooperative name by ID
  const getCooperativeName = (cooperativeId) => {
    console.log(
      `Looking up cooperative ID: ${cooperativeId} in list of ${cooperativesList.length} cooperatives.`
    );
    const coop = cooperativesList.find((c) => c._id === cooperativeId);
    if (coop) {
      console.log(`Cooperative found: ${coop.name}`);
    } else {
      console.log(`Cooperative not found for ID: ${cooperativeId}`);
    }
    return coop ? coop.name : "N/A (Deleted/Unknown)";
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredManagers.map((n) => n._id);
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
    setActiveStatusFilter("all");
    setAssignmentFilter("all");
    setPage(0);
  };

  // --- Add Manager Dialog Handlers ---
  const handleOpenAddDialog = () => {
    setNewManagerData({
      names: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      role: "manager",
      cooperativeId: "",
    });
    setAddFormErrors({});
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);
  const handleAddChange = (e) => {
    setNewManagerData({ ...newManagerData, [e.target.name]: e.target.value });
    if (addFormErrors[e.target.name]) {
      setAddFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  // Client-side validation function
  const validateAddForm = () => {
    const errors = {};
    if (!newManagerData.names.trim()) {
      errors.names = "Full Names are required.";
    } else if (newManagerData.names.trim().length < 3) {
      errors.names = "Names must be at least 3 characters long.";
    } else if (newManagerData.names.trim().length > 50) {
      errors.names = "Name must not exceed 50 characters.";
    }

    if (!newManagerData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(newManagerData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!newManagerData.nationalId) {
      errors.nationalId = "National ID is required.";
    } else if (!/^\d{16}$/.test(newManagerData.nationalId.toString())) {
      errors.nationalId = "National ID must be exactly 16 digits.";
    }

    if (
      newManagerData.phoneNumber &&
      !/^\+?[1-9]\d{7,14}$/.test(newManagerData.phoneNumber.trim())
    ) {
      errors.phoneNumber =
        "Please enter a valid phone number (e.g., +250781234567 or 0781234567).";
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateAddForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    try {
      const payload = {
        ...newManagerData,
        role: "manager",
        cooperativeId:
          newManagerData.cooperativeId === ""
            ? null
            : newManagerData.cooperativeId,
      };

      const response = await createUser(payload);
      if (response.success) {
        toast.success("Manager added successfully!");
        fetchManagers(); // Re-fetch data to update table
        setOpenAddDialog(false); // Close the dialog on success
      } else {
        toast.error(`Failed to add manager: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during creation.");
      console.error("Creation error:", err);
    }
  };

  // --- Edit Manager Dialog Handlers ---
  const handleOpenEditDialog = (manager) => {
    setCurrentManager(manager);
    setEditManagerData({ ...manager });
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => setOpenEditDialog(false);
  const handleEditChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditManagerData({ ...editManagerData, [e.target.name]: value });
  };
  const handleEditSubmit = async () => {
    try {
      const response = await updateUser(currentManager._id, editManagerData);
      if (response.success) {
        toast.success("Manager updated successfully!");
        fetchManagers(); // Re-fetch data to update table
        setOpenEditDialog(false); // Close the dialog on success
      } else {
        toast.error(`Failed to update manager: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during update.");
      console.error("Update error:", err);
    }
  };

  // --- Delete Manager Dialog Handlers ---
  const handleOpenConfirmDeleteDialog = (manager) => {
    setCurrentManager(manager);
    setOpenConfirmDeleteDialog(true);
  };
  const handleCloseConfirmDeleteDialog = () =>
    setOpenConfirmDeleteDialog(false);
  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteUser(currentManager._id);
      if (response.success) {
        toast.success("Manager deleted successfully!");
        fetchManagers(); // Re-fetch data to update table
        setSelected(selected.filter((id) => id !== currentManager._id));
        setOpenConfirmDeleteDialog(false); // Close the dialog on success
      } else {
        toast.error(`Failed to delete manager: ${response.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during deletion.");
      console.error("Deletion error:", err);
    }
  };

  const showPagination = filteredManagers.length > 5;

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
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
          {/* Search Bar */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search managers..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
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
              Add Manager
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

          <FormControl component="fieldset" sx={{ ml: { xs: 0, sm: 1 } }}>
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

          <FormControl component="fieldset" sx={{ ml: { xs: 0, sm: 1 } }}>
            <RadioGroup
              row
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label={<Typography variant="body2">All Assignments</Typography>}
              />
              <FormControlLabel
                value="assigned"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Assigned</Typography>}
              />
              <FormControlLabel
                value="unassigned"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Unassigned</Typography>}
              />
            </RadioGroup>
          </FormControl>

          {(searchText ||
            activeStatusFilter !== "all" ||
            assignmentFilter !== "all") && (
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
        <Table stickyHeader sx={{ minWidth: 800 }} aria-label="managers table">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={handleSelectAllClick}
                  checked={
                    selected.length === filteredManagers.length &&
                    filteredManagers.length > 0
                  }
                  inputProps={{ "aria-label": "select all managers" }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "180px" }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                Phone Number
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                National ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "150px" }}>
                Assigned Cooperative
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
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading managers...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredManagers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1">
                    No managers found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredManagers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((manager) => {
                  const isItemSelected = isSelected(manager._id);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, manager._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={manager._id}
                      selected={isItemSelected}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": `manager-checkbox-${manager._id}`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>{manager.names}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {manager.email || "N/A"}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {manager.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {manager.nationalId || "N/A"}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {manager.cooperativeId?.name}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {manager.isActive ? "Yes" : "No"}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenEditDialog(manager);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenConfirmDeleteDialog(manager);
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
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
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredManagers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            "& .MuiTablePagination-toolbar": {
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            },
            "& .MuiTablePagination-displayedRows": { order: { xs: 2, sm: 0 } },
            "& .MuiTablePagination-actions": { order: { xs: 3, sm: 0 } },
            "& .MuiTablePagination-selectLabel": { mb: { xs: 0.5, sm: 0 } },
            "& .MuiTablePagination-select": { mr: { xs: 0, sm: 2 } },
          }}
        />
      )}

      {/* Add Manager Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Manager</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            name="names"
            label="Full Names"
            type="text"
            fullWidth
            variant="outlined"
            value={newManagerData.names}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
            error={!!addFormErrors.names}
            helperText={addFormErrors.names}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newManagerData.email}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
            error={!!addFormErrors.email}
            helperText={addFormErrors.email}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number (Optional)"
            type="tel"
            fullWidth
            variant="outlined"
            value={newManagerData.phoneNumber}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            error={!!addFormErrors.phoneNumber}
            helperText={addFormErrors.phoneNumber}
          />
          <TextField
            margin="dense"
            name="nationalId"
            label="National ID"
            type="number"
            fullWidth
            variant="outlined"
            value={newManagerData.nationalId}
            onChange={handleAddChange}
            sx={{ mb: 2 }}
            required
            inputProps={{ maxLength: 16 }}
            error={!!addFormErrors.nationalId}
            helperText={addFormErrors.nationalId}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="cooperative-select-label">
              Assign Cooperative (Optional)
            </InputLabel>
            <Select
              labelId="cooperative-select-label"
              id="cooperative-select"
              name="cooperativeId"
              value={newManagerData.cooperativeId}
              label="Assign Cooperative (Optional)"
              onChange={handleAddChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {cooperativesList.map((coop) => (
                <MenuItem key={coop._id} value={coop._id}>
                  {coop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

      {/* Edit Manager Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Manager</DialogTitle>
        <DialogContent dividers>
          {editManagerData && (
            <>
              <TextField
                margin="dense"
                name="names"
                label="Full Names"
                type="text"
                fullWidth
                variant="outlined"
                value={editManagerData.names || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={editManagerData.email || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                name="phoneNumber"
                label="Phone Number (Optional)"
                type="tel"
                fullWidth
                variant="outlined"
                value={editManagerData.phoneNumber || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="nationalId"
                label="National ID"
                type="number"
                fullWidth
                variant="outlined"
                value={editManagerData.nationalId || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
                required
                inputProps={{ maxLength: 16 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editManagerData.isActive}
                    onChange={handleEditChange}
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

      {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={handleCloseConfirmDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete manager "
            <strong>{currentManager?.names}</strong>"? This action cannot be
            undone.
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

export default ManagersTable;
