import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementService";
import { useAuth } from "../../contexts/AuthContext";
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
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CampaignIcon from "@mui/icons-material/Campaign";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchAllAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const data = await fetchAnnouncements(cooperativeId);
      setAnnouncements(data ? data.reverse() : []); // Ensure data is an array
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
      setAnnouncements([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

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
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      await createAnnouncement({ title, description, userId, cooperativeId });

      setTitle("");
      setDescription("");
      toast.success("Announcement sent successfully!");
      await fetchAllAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(
        `Failed to send announcement: ${
          err.response?.data?.message || err.message
        }`
      );
      toast.error("Failed to send announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditTitle(announcement.title);
    setEditDescription(announcement.description);
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error("Both title and description are required.");
      return;
    }

    try {
      setLoading(true);
      await updateAnnouncement(editingAnnouncement._id, {
        title: editTitle,
        description: editDescription,
      });

      toast.success("Announcement updated successfully!");
      setEditDialogOpen(false);
      setEditingAnnouncement(null);
      await fetchAllAnnouncements();
    } catch (err) {
      console.error("Failed to update announcement:", err);
      toast.error("Failed to update announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteAnnouncement(selectedAnnouncement._id);

      toast.success("Announcement deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      await fetchAllAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      toast.error("Failed to delete announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, announcement) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAnnouncement(announcement);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAnnouncement(null);
  };

  return (
    <Box
      px={isMobile ? 2 : 3}
      py={0}
      sx={{ maxHeight: "100vh", overflowY: "auto" }}
    >
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
        alignItems="stretch"
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                        <ListItemText
                          sx={{ flex: 1 }}
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
                        <IconButton
                          onClick={(e) => handleMenuClick(e, item)}
                          size="small"
                          sx={{ ml: 1, mt: -1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Update"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the announcement "{selectedAnnouncement?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedAnnouncement)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedAnnouncement)} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Announcement;
