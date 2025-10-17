import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService"; // Make sure this is correctly imported
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";

function AddLoanModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    userId: "",
    amountOwed: "",
    interest: "",
    seasonId: "", // Add the seasonId field to the state
  });
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]); // State for seasons
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  useEffect(() => {
    const fetchModalData = async () => {
      setLoading(true);
      try {
        // Fetch users and seasons concurrently using Promise.all
        const [usersResponse, seasonsResponse] = await Promise.all([
          fetchUsers(),
          fetchSeasons(cooperativeId),
        ]);

        const userData = usersResponse.data || [];
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          setUsers([]);
        }

        const seasonData = seasonsResponse.data || [];
        if (Array.isArray(seasonData)) {
          setSeasons(seasonData);
        } else {
          setSeasons([]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setUsers([]);
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchModalData();
    }
  }, [show]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Loan</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading data...
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Member"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              margin="dense"
              disabled={users.length === 0}
            >
              <MenuItem value="">-- Select Member --</MenuItem>
              {users
                .filter((user) => user.role === "member") // CRITICAL: Filter users by role
                .map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.names}
                  </MenuItem>
                ))}
            </TextField>

            {/* Season Dropdown */}
            <TextField
              select
              fullWidth
              label="Season"
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              required
              margin="dense"
              disabled={seasons.length === 0}
            >
              <MenuItem value="">-- Select Season --</MenuItem>
              {seasons.map((season) => (
                <MenuItem key={season._id} value={season._id}>
                  {season.name} {/* Adjust this based on your Season model */}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Maximum Amount can be borrowed"
              type="number"
              name="amountOwed"
              value={formData.amountOwed}
              onChange={handleChange}
              placeholder="Enter amount owed"
              required
              margin="dense"
              
            />
            {/* Amount Owed */}
            <TextField
              fullWidth
              label="Amount Owed"
              type="number"
              name="amountOwed"
              value={formData.amountOwed}
              onChange={handleChange}
              placeholder="Enter amount owed"
              required
              margin="dense"
            />
            {/* Interest Rate */}
            <TextField
              fullWidth
              label="Interest Rate (%)"
              type="number"
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              placeholder="Enter interest rate"
              required
              margin="dense"
            />
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          color="primary"
          variant="contained"
        >
          Add Loan
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddLoanModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddLoanModal;
