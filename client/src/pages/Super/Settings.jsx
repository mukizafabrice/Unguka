import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get ID from URL
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Avatar,
  Paper,
  Divider,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system"; // Corrected import syntax
import { useAuth } from "../../contexts/AuthContext"; // <<-- ⚠️ VERIFY/ADJUST THIS PATH CAREFULLY ⚠️
import { updateAdmin, fetchUserById } from "../../services/userService"; // <<-- ⚠️ VERIFY/ADJUST THIS PATH CAREFULLY ⚠️

// Styled components (unchanged)
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  width: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const FormField = styled(TextField)(({ theme }) => ({
  width: "60%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    width: "100%",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: "12px 24px",
  fontWeight: "bold",
  backgroundColor: "#282c34",
  "&:hover": {
    backgroundColor: "#3a3f47",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: "12px 24px",
  fontWeight: "bold",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const SettingsPage = () => {
  const { userId } = useParams(); // Get the user ID from the URL parameter
  const { user: loggedInUser, authToken } = useAuth(); // Get logged-in user and token

  const [displayedUser, setDisplayedUser] = useState(null); // The user whose profile is shown/edited
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    names: "",
    email: "",
    phoneNumber: "",
  });
  const [loadingUser, setLoadingUser] = useState(true); // Loading state for fetching the displayed user
  const [loadingAction, setLoadingAction] = useState(false); // Loading state for update actions
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Debugging logs
  console.log("SettingsPage Render - loggedInUser:", loggedInUser);
  console.log(
    "SettingsPage Render - authToken:",
    authToken ? "Available" : "Not available"
  );
  console.log("SettingsPage Render - userId from params:", userId);
  console.log("SettingsPage Render - loadingUser:", loadingUser);

  // Effect to fetch the displayed user's data when the component mounts or userId/authToken changes
  useEffect(() => {
    console.log("useEffect for getUserData triggered.");
    const getUserData = async () => {
      if (!userId || !authToken) {
        console.log("getUserData: Missing userId or authToken.");
        setError("User ID or authentication token missing.");
        setLoadingUser(false);
        setSnackbarOpen(true);
        return;
      }
      setLoadingUser(true);
      setError("");
      try {
        console.log("getUserData: Attempting to fetch user by ID:", userId);
        const data = await fetchUserById(userId, authToken);
        console.log("getUserData: User data fetched successfully:", data);
        setDisplayedUser(data);
        setFormData({
          names: data.names || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (err) {
        console.error("getUserData: Error fetching user:", err);
        setError(err.message || "Failed to load user profile.");
        setSnackbarOpen(true);
      } finally {
        setLoadingUser(false);
        console.log("getUserData: setLoadingUser(false)");
      }
    };

    if (loggedInUser && authToken && userId) {
      // Ensure logged-in user and token exist before fetching
      console.log(
        "getUserData: Conditions met (loggedInUser, authToken, userId). Calling getUserData()."
      );
      getUserData();
    } else {
      console.log(
        "getUserData: Conditions NOT met. Not calling getUserData()."
      );
      // If loggedInUser or authToken are not available, we should stop loading here too
      if (!loggedInUser || !authToken) {
        setLoadingUser(false);
        console.log(
          "getUserData: loggedInUser or authToken missing, stopping loading."
        );
      }
    }
  }, [userId, loggedInUser, authToken]); // Depend on userId, loggedInUser, and authToken

  // Effect to reset formData when displayedUser changes (e.g., after successful update)
  useEffect(() => {
    if (displayedUser) {
      setFormData({
        names: displayedUser.names || "",
        email: displayedUser.email || "",
        phoneNumber: displayedUser.phoneNumber || "",
      });
    }
  }, [displayedUser]);

  // Show loading spinner if displayedUser data is still being fetched
  // Or if loggedInUser is not yet available (meaning AuthContext is still loading)
  if (loadingUser || !loggedInUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  // Handle case where displayedUser is not found after loading
  if (!displayedUser) {
    return (
      <StyledContainer>
        <Paper elevation={3} sx={{ padding: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            {error ||
              "User profile not found. Please ensure you have valid user ID and are logged in."}
          </Typography>
        </Paper>
      </StyledContainer>
    );
  }

  const handleEditClick = () => {
    setIsEditing(true);
    // Reset messages when entering edit mode
    setError("");
    setSuccess("");
    setSnackbarOpen(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      names: displayedUser.names || "",
      email: displayedUser.email || "",
      phoneNumber: displayedUser.phoneNumber || "",
    });
    setError("");
    setSuccess("");
    setSnackbarOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoadingAction(true);
    setError("");
    setSuccess("");

    try {
      if (!loggedInUser || !loggedInUser._id || !authToken) {
        setError("Authentication error: User not logged in or token missing.");
        setSnackbarOpen(true);
        setLoadingAction(false);
        return;
      }

      // Use updateAdmin for general profile updates, as requested
      // NOTE: This assumes your backend's PUT /api/users/:id/admin endpoint is now configured
      // to handle and save these profile fields (names, email, phoneNumber).
      const updatedUserData = await updateAdmin(
        displayedUser._id,
        formData,
        authToken
      ); // Pass formData

      setSuccess("Profile updated successfully! 🎉");
      setSnackbarOpen(true);
      setDisplayedUser(updatedUserData); // Update displayed user state with fresh data
      setIsEditing(false); // Exit editing mode on success
    } catch (err) {
      setError(err.message || "Failed to update profile.");
      setSnackbarOpen(true);
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Handler for updating user role to manager (Superadmin action)
  const handlePromoteToManager = async () => {
    setLoadingAction(true);
    setError("");
    setSuccess("");

    try {
      if (!loggedInUser || !loggedInUser._id || !authToken) {
        setError("Authentication error: User not logged in or token missing.");
        setSnackbarOpen(true);
        setLoadingAction(false);
        return;
      }

      // Optional: Add a confirmation dialog before promoting
      if (
        !window.confirm(
          `Are you sure you want to promote ${displayedUser.names} to Manager?`
        )
      ) {
        setLoadingAction(false);
        return;
      }

      // This call to updateAdmin is now specifically for promoting to manager.
      // We explicitly send the role update data, merging it with current form data in case
      // the backend endpoint processes all fields together.
      const updatedUserWithNewRole = await updateAdmin(
        displayedUser._id,
        { ...formData, role: "manager" },
        authToken
      );
      setSuccess(
        `User ${updatedUserWithNewRole.names}'s role updated to Manager successfully!`
      );
      setSnackbarOpen(true);
      setDisplayedUser(updatedUserWithNewRole); // Update displayed user state with new role
    } catch (err) {
      setError(err.message || "Failed to update user role to Manager.");
      setSnackbarOpen(true);
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Determine if the logged-in user is a superadmin
  const isSuperadmin = loggedInUser && loggedInUser.role === "superadmin";
  // Determine if the displayed user is already a manager
  const isAlreadyManager = displayedUser.role === "manager";
  // Determine if the displayed user is the same as the logged-in user
  const isSelf = loggedInUser._id === displayedUser._id;

  return (
    <StyledContainer>
      <StyledPaper elevation={3}>
        {/* Profile Picture (visible, but no update functionality) */}
        <ProfileAvatar
          src={displayedUser.profilePicture || "https://placehold.co/100x100"}
          alt={displayedUser.names}
        />

        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          User Profile ({displayedUser.names})
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {isEditing ? "Edit user information." : "View user information."}
        </Typography>

        <Box sx={{ width: "100%", mb: 3 }}>
          <DetailRow>
            <Typography variant="subtitle1" color="textSecondary">
              Full Names:
            </Typography>
            {isEditing ? (
              <FormField
                size="small"
                name="names"
                value={formData.names}
                onChange={handleChange}
                variant="outlined"
                required
              />
            ) : (
              <Typography variant="subtitle1" fontWeight="medium">
                {displayedUser.names}
              </Typography>
            )}
          </DetailRow>
          <DetailRow>
            <Typography variant="subtitle1" color="textSecondary">
              Email:
            </Typography>
            {isEditing ? (
              <FormField
                size="small"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
            ) : (
              <Typography variant="subtitle1" fontWeight="medium">
                {displayedUser.email}
              </Typography>
            )}
          </DetailRow>
          <DetailRow>
            <Typography variant="subtitle1" color="textSecondary">
              Phone Number:
            </Typography>
            {isEditing ? (
              <FormField
                size="small"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                variant="outlined"
                required
              />
            ) : (
              <Typography variant="subtitle1" fontWeight="medium">
                {displayedUser.phoneNumber}
              </Typography>
            )}
          </DetailRow>
          <DetailRow>
            <Typography variant="subtitle1" color="textSecondary">
              National ID:
            </Typography>
            <Typography variant="subtitle1" fontWeight="medium">
              {displayedUser.nationalId}
            </Typography>
          </DetailRow>
          <DetailRow>
            <Typography variant="subtitle1" color="textSecondary">
              Role:
            </Typography>
            <Typography variant="subtitle1" fontWeight="medium">
              {displayedUser.role}
            </Typography>
          </DetailRow>
        </Box>

        <ActionButtonsContainer>
          {isEditing ? (
            <>
              <SecondaryButton
                variant="outlined"
                onClick={handleCancelClick}
                disabled={loadingAction}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loadingAction}
                startIcon={
                  loadingAction ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {loadingAction ? "Saving Changes..." : "Save Changes"}
              </PrimaryButton>
            </>
          ) : (
            <>
              {/* Edit Profile Button (visible to anyone authorized to view this page) */}
              <PrimaryButton
                variant="contained"
                color="primary"
                onClick={handleEditClick}
                disabled={loadingAction}
              >
                Edit Profile
              </PrimaryButton>

              {/* Promote to Manager Button (Superadmin specific actions) */}
              {isSuperadmin && !isSelf && !isAlreadyManager && (
                <PrimaryButton
                  variant="contained"
                  color="success" // Use a distinct color for role updates
                  onClick={handlePromoteToManager}
                  disabled={loadingAction}
                  startIcon={
                    loadingAction ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    backgroundColor: "#4CAF50",
                    "&:hover": { backgroundColor: "#43A047" },
                  }} // Green for 'promote'
                >
                  {loadingAction ? "Promoting..." : "Promote to Manager"}
                </PrimaryButton>
              )}
              {isSuperadmin && !isSelf && isAlreadyManager && (
                <Button
                  variant="contained"
                  disabled // Disable if already a manager
                  sx={{ backgroundColor: "#9E9E9E", color: "white" }}
                >
                  Already Manager
                </Button>
              )}
            </>
          )}
        </ActionButtonsContainer>
      </StyledPaper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default SettingsPage;
