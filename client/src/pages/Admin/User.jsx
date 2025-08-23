import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import {
  fetchUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../../services/userService";

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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Ensure these paths correctly point to your modal files based on your project structure.
// If you continue to see "Could not resolve" errors, verify the file paths and names (case-sensitivity).
import AddUserModal from "../../features/modals/AddUserModal";
import UpdateUserModal from "../../features/modals/UpdateUserModal";

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
const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "superadmin": // Assuming 'superadmin' is a role
      return "secondary";
    case "manager": // Assuming 'manager' is a role
      return "primary";
    case "member":
      return "success";
    case "guest":
      return "info";
    default:
      return "default";
  }
};

function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("names");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming fetchUsers also returns { success, data, message }
      const response = await fetchUsers();

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("API returned invalid data format or failed:", response);
        setUsers([]);
        toast.error(
          response.message || "Received invalid data from the server."
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle adding a new user
  const handleAddUser = async (newUserData) => {
    try {
      // Now, createUser returns an object with `success` and `message`
      const result = await createUser(newUserData);
      console.log("User creation result:", result); // Log the full result for debugging

      if (result.success) {
        toast.success(result.message);
        setShowAddModal(false);
        await loadUsers(); // Reload users to show the newly added user
      } else {
        // If success is false, display the error message from the backend
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Unexpected error in handleAddUser:", error);
      toast.error("An unexpected error occurred during user creation.");
    }
  };

  const handleUserUpdated = async (id, updatedUserData) => {
    try {
      const result = await updateUser(id, updatedUserData);
      if (result.success) {
        toast.success(result.message);
        setShowUpdateModal(false);
        await loadUsers();
        setUserToEdit(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Unexpected error in handleUserUpdated:", error);
      toast.error("An unexpected error occurred during user update.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success(result.message);
        await loadUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Unexpected error in handleDeleteUser:", error);
      toast.error("An unexpected error occurred during user deletion.");
    }
  };

  const openUpdateModal = (user) => {
    setUserToEdit(user);
    setShowUpdateModal(true);
  };

  // Filter and sort users based on search, role filter, and sort order
  const filteredAndSortedUsers = useMemo(() => {
    // Failsafe: return an empty array if `users` is not an array
    if (!Array.isArray(users)) {
      return [];
    }

    let filtered = users;

    // Apply role filter first
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Then, apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((user) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchField) {
          case "names":
            return user.names?.toLowerCase().includes(lowerCaseSearchTerm);
          case "phoneNumber":
            return user.phoneNumber?.includes(lowerCaseSearchTerm);
          case "nationalId":
            return user.nationalId?.includes(lowerCaseSearchTerm);
          case "role":
            return user.role?.toLowerCase().includes(lowerCaseSearchTerm);
          default:
            return true;
        }
      });
    }

    // Finally, apply sorting to a copy of the filtered array
    const sorted = filtered.slice().sort((a, b) => {
      const nameA = a.names || "";
      const nameB = b.names || "";
      const comparison = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [users, searchTerm, searchField, roleFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedUsers.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedUsers]);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Member Dashboard</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Add User
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
              This dashboard displays the list of cooperative members along with
              their key details and membership status.
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
              <MenuItem value="names">Member Name</MenuItem>
              <MenuItem value="phoneNumber">Phone Number</MenuItem>
              <MenuItem value="nationalId">National ID</MenuItem>
              <MenuItem value="role">Role</MenuItem>
            </TextField>
            <TextField
              label={`Search ${
                searchField === "names"
                  ? "Member Name"
                  : searchField === "phoneNumber"
                  ? "Phone Number"
                  : searchField === "nationalId"
                  ? "National ID"
                  : "Role"
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
              label="Role Filter"
              size="small"
              fullWidth={isMobile}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="superadmin">Superadmin</MenuItem>{" "}
              {/* Added superadmin */}
              <MenuItem value="manager">Manager</MenuItem> {/* Added manager */}
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="guest">Guest</MenuItem>
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
              Sort by Name {sortOrder === "asc" ? "(Asc)" : "(Desc)"}
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
                  sx={{ minWidth: 700, tableLayout: "auto" }} // Changed to 'auto' or 'fixed' as needed
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableHeaderCell sx={{ width: "5%" }}>
                        ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "25%" }}>
                        Member
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Telephone
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "20%" }}>
                        National ID
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell sx={{ width: "15%" }}>
                        Role
                      </StyledTableHeaderCell>
                      <StyledTableHeaderCell
                        align="center"
                        sx={{ width: "20%" }}
                      >
                        Action
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.length > 0 ? (
                      currentRows.map((user, index) => (
                        <TableRow hover key={user._id}>
                          <StyledTableCell>
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </StyledTableCell>
                          <StyledTableCell>
                            {user.names || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {user.phoneNumber || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {user.nationalId || "N/A"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={user.role || "N/A"}
                              size="small"
                              color={getRoleColor(user.role)}
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
                                onClick={() => openUpdateModal(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No users found.
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

      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      <UpdateUserModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUserUpdated}
        userData={userToEdit}
      />
      {/* The ToastContainer has been removed from here as it should only be present once, typically in App.js */}
    </Box>
  );
}

export default User;
