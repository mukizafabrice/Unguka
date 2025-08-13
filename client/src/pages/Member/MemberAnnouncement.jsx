import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchAnnouncements } from "../../services/announcementService";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  styled,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign"; // Icon for Announcements

// Styled components consistent with other dashboards
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50], // Neutral background for header
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
  padding: theme.spacing(2, 3), // Consistent padding
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: theme.palette.background.paper,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  height: "100%", // Ensure card stretches to fill height in Stack
}));

function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Kept for fetch errors

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
      toast.error("Failed to load announcements."); // Display toast for fetch error
      setAnnouncements([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnnouncements();
  }, [fetchAllAnnouncements]);

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
        direction="row" // Set to row, as there's only one main card now, helps with centering if desired.
        justifyContent="center"
        alignItems="stretch" // Ensures card stretches to equal height
      >
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
