import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
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
  CircularProgress, // Added CircularProgress for loading state
  MenuItem, // Added MenuItem for dropdowns
  Chip, // Added Chip for status display
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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

// Helper function for status chip color (assuming user roles might have a visual status)
const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
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
  const [loading, setLoading] = useState(true); // Changed default to true
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Consistent rows per page

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("names"); // Default search field
  const [roleFilter, setRoleFilter] = useState("all"); // Filter by user role
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort by name ascending

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users. Please try again.");
      setUsers([]); // Ensure users are reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async (newUserData) => {
    try {
      await createUser(newUserData);
      toast.success("User added successfully!");
      setShowAddModal(false);
      await loadUsers(); // Await loadUsers to ensure data is fresh
    } catch (error) {
      console.error("Failed to add user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add user. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleUserUpdated = async (id, updatedUserData) => {
    // Added id and updatedUserData params
    try {
      await updateUser(id, updatedUserData); // Call updateUser service
      toast.success("User updated successfully!");
      setShowUpdateModal(false);
      await loadUsers(); // Await loadUsers to ensure data is fresh
      setUserToEdit(null); // Clear selected user
    } catch (error) {
      console.error("Failed to update user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update user. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully!");
      await loadUsers(); // Await loadUsers to ensure data is fresh
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const openUpdateModal = (user) => {
    setUserToEdit(user);
    setShowUpdateModal(true);
  };

  // Filter and sort users based on search, role filter, and sort order
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
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

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Apply sorting by names
    filtered.sort((a, b) => {
      const nameA = a.names || "";
      const nameB = b.names || "";
      const comparison = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, searchField, roleFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAndSortedUsers.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  // Reset page to 1 whenever filters or sorting changes
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
            overflow: "hidden", // Hide overflow on CardContent itself
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
              <MenuItem value="admin">Admin</MenuItem>
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

      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default User;
