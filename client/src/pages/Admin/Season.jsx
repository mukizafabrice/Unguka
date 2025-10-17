import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";

import {
  fetchSeasons,
} from "../../services/seasonService";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  useMediaQuery,
  CircularProgress,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Paper,
  styled,
} from "@mui/material";


// Styled components consistent with other dashboards
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
  },
}));

// Styled components for season cards
const SeasonCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
}));

// Helper function for status chip color (assuming season status like 'active' or 'inactive')
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive": // ⭐ Changed from 'closed' to 'inactive' to match model enum
      return "error";
    default: // For any other status, or 'pending' if applicable
      return "default";
  }
};

function Season() {

  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;

  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const loadSeasons = useCallback(async () => {
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available. Cannot load seasons.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ⭐ Pass cooperativeId to fetchSeasons
      const response = await fetchSeasons(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setSeasons(response.data);
        // Find and set the current active season
        const activeSeason = response.data.find(season => season.status === 'active');
        setCurrentSeason(activeSeason || null);
      } else {
        console.error("Failed to fetch seasons:", response.message);
        toast.error(response.message || "Failed to load seasons.");
        setSeasons([]);
        setCurrentSeason(null);
      }
    } catch (error) {
      console.error("Failed to fetch seasons (catch block):", error);
      toast.error("An unexpected error occurred while loading seasons.");
      setSeasons([]);
      setCurrentSeason(null);
    } finally {
      setLoading(false);
    }
  }, [cooperativeId]); // Depend on cooperativeId

  useEffect(() => {
    if (cooperativeId) {
      // Only load if cooperativeId is available
      loadSeasons();
    }
  }, [cooperativeId, loadSeasons]);



  // Get selected season details
  const selectedSeason = useMemo(() => {
    if (!selectedSeasonId) return null;
    return seasons.find(season => season._id === selectedSeasonId) || null;
  }, [seasons, selectedSeasonId]);

  // Set current season as default selected when seasons data loads
  useEffect(() => {
    if (seasons.length > 0 && currentSeason && !selectedSeasonId) {
      setSelectedSeasonId(currentSeason._id);
    }
  }, [seasons, currentSeason, selectedSeasonId]);

  // Reset selected season when seasons data changes
  useEffect(() => {
    if (seasons.length > 0 && !seasons.find(s => s._id === selectedSeasonId)) {
      // If current season exists, select it; otherwise clear selection
      if (currentSeason) {
        setSelectedSeasonId(currentSeason._id);
      } else {
        setSelectedSeasonId("");
      }
    }
  }, [seasons, selectedSeasonId, currentSeason]);

  return (
    <Box px={isMobile ? 2 : 3} pt={0}>
      <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
        <StyledCardHeader
          title={<Typography variant="h6">Seasons Dashboard</Typography>}
          action={
            currentSeason ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Season:
                </Typography>
                <Chip
                  label={`${currentSeason.name} ${currentSeason.year}`}
                  color="primary"
                  variant="filled"
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active season
              </Typography>
            )
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              View and manage agricultural seasons for your cooperative. Seasons are automatically created and the current active season is highlighted.
            </Typography>

            <FormControl fullWidth size="small" sx={{ maxWidth: 300, mb: 2 }}>
              <InputLabel>Select Season</InputLabel>
              <Select
                value={selectedSeasonId}
                label="Select Season"
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                sx={{
                  backgroundColor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.dark',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem value="">
                  <em>All Seasons</em>
                </MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season._id} value={season._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {season.name} {season.year}
                      </Typography>
                      <Chip
                        label={season.status}
                        size="small"
                        color={getStatusColor(season.status)}
                        variant={season.status === 'active' ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Choose a season to view its details
              </FormHelperText>
            </FormControl>
          </Box>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              my={5}
              sx={{ flexGrow: 1 }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : selectedSeason ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SeasonCard>
                  <Typography variant="h6" gutterBottom color="primary">
                    Season Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Season Name
                      </Typography>
                      <Typography variant="h6">
                        {selectedSeason.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Year
                      </Typography>
                      <Typography variant="h6">
                        {selectedSeason.year}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedSeason.status}
                        color={getStatusColor(selectedSeason.status)}
                        variant={selectedSeason.status === 'active' ? 'filled' : 'outlined'}
                        size="medium"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedSeason.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </SeasonCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SeasonCard>
                  <Typography variant="h6" gutterBottom color="primary">
                    Season Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cooperative
                      </Typography>
                      <Typography variant="body1">
                        {selectedSeason.cooperativeId?.name || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedSeason.cooperativeId?.registrationNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Season Period
                      </Typography>
                      <Typography variant="body1">
                        {selectedSeason.name === 'Season-A'
                          ? 'September - January'
                          : 'February - July'
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Typography variant="body1" color={selectedSeason.status === 'active' ? 'success.main' : 'text.secondary'}>
                        {selectedSeason.status === 'active'
                          ? 'This is the currently active season'
                          : 'This season is currently inactive'
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </SeasonCard>
              </Grid>
            </Grid>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
              sx={{ flexGrow: 1 }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a Season
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Choose a season from the dropdown above to view its detailed information.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>



      {/* ⭐ Removed duplicate ToastContainer: Your App.js should contain the global one. */}
      {/* <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
    </Box>
  );
}

export default Season;
