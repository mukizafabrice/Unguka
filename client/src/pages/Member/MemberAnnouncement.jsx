import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
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
  Alert,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { fetchAnnouncements } from "../../services/announcementService";

// Styled components
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
  padding: theme.spacing(2, 3),
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: theme.palette.background.paper,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchAllAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAnnouncements(cooperativeId);
      setAnnouncements(data ? data.reverse() : []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]);

  useEffect(() => {
    fetchAllAnnouncements();
  }, [fetchAllAnnouncements]);

  return (
    <Box px={isMobile ? 2 : 5} py={3}>
      {/* Page Title */}
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        color="text.primary"
      >
        <CampaignIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Announcements
      </Typography>

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
            flexGrow: 1,
            maxHeight: isMobile ? "350px" : "500px",
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
          ) : error ? (
            <Box p={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : announcements.length > 0 ? (
            <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
              {announcements.map((item) => (
                <StyledListGroupItem key={item._id}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
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
                          Posted on {new Date(item.createdAt).toLocaleString()}
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
  );
}

export default Announcement;
