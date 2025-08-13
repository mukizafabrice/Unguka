import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAnnouncements,
  createAnnouncement,
} from "../../services/announcementService";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  styled,
  Alert, // For displaying errors
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CampaignIcon from "@mui/icons-material/Campaign"; // Icon for Announcements

// Styled components consistent with other dashboards
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

const StyledListGroupItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
  padding: theme.spacing(2, 3), // 
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: theme.palette.background.paper,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  height: "100%", // Ensure cards stretch to fill height in Stack
}));

function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchAllAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data ? data.reverse() : []); // Ensure data is an array
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
      setAnnouncements([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnnouncements();
  }, [fetchAllAnnouncements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!title.trim() || !description.trim()) {
      setError("Both title and description are required.");
      return;
    }

    try {
      setLoading(true);
      // Ensure user is retrieved safely; consider using a global auth context if available
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id; // Get userId if available

      await createAnnouncement({ title, description, userId });

      setTitle("");
      setDescription("");
      toast.success("Announcement sent successfully!"); // Added success toast
      await fetchAllAnnouncements(); // Re-fetch all announcements
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(
        `Failed to send announcement: ${
          err.response?.data?.message || err.message
        }`
      );
      toast.error("Failed to send announcement. Please try again."); // Toast for error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box px={isMobile ? 2 : 3} py={0}>
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        color="text.primary"
      >
        <CampaignIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Announcements
      </Typography>

      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 3 : 4}
        justifyContent="center"
        alignItems="stretch" // Ensures cards stretch to equal height
      >
        {/* Card for Create New Announcement */}
        <Box flex={1}>
          <StyledCard>
            <StyledCardHeader
              title={
                <Typography variant="h6">Create New Announcement</Typography>
              }
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              }}
            />
            <CardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  margin="normal"
                  helperText="Keep the title concise and clear."
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description"
                  margin="normal"
                  helperText="Provide all necessary details for the announcement."
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={loading ? null : <SendIcon />}
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send Announcement"
                  )}
                </Button>
              </form>
            </CardContent>
          </StyledCard>
        </Box>

        {/* Card for Displaying Recent Announcements */}
        <Box flex={1}>
          <StyledCard>
            <StyledCardHeader
              title={<Typography variant="h6">Recent Announcements</Typography>}
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              }}
            />
            <CardContent
              sx={{
                p: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                maxHeight: isMobile ? "350px" : "400px",
              }}
            >
              {loading && announcements.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexGrow={1}
                  my={3}
                >
                  <CircularProgress color="primary" />
                </Box>
              ) : announcements.length > 0 ? (
                <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
                  {announcements.map((item) => (
                    <StyledListGroupItem key={item._id}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="h6"
                            component="h3"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              component="p"
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5, mb: 1 }}
                            >
                              {item.description}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Posted on{" "}
                              {new Date(item.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </StyledListGroupItem>
                  ))}
                </List>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexGrow={1}
                  p={3}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                  >
                    No announcements yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Box>
      </Stack>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
}

export default Announcement;
