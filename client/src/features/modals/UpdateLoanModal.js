import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import { fetchUsers } from "../../services/userService"; // Assuming this service exists
import { fetchSeasons } from "../../services/seasonService"; // Assuming this service exists
import { useAuth } from "../../contexts/AuthContext";
const UpdateLoanModal = ({ show, loan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    userId: "",
    seasonId: "",
    amountOwed: "",
    interest: "",
  });

  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  // Fetch users and seasons when the modal is shown
  useEffect(() => {
    const fetchModalData = async () => {
      setLoading(true);
      try {
        const [usersResponse, seasonsResponse] = await Promise.all([
          fetchUsers(),
          fetchSeasons(cooperativeId),
        ]);

        const userData = usersResponse.data || [];
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          console.error("User data is not an array:", usersResponse);
          setUsers([]);
        }

        const seasonData = seasonsResponse.data || [];
        if (Array.isArray(seasonData)) {
          setSeasons(seasonData);
        } else {
          console.error("Season data is not an array:", seasonsResponse);
          setSeasons([]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load members or seasons.");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchModalData();
    }
  }, [show]);

  // Populate form data when the loan prop changes
  useEffect(() => {
    if (loan) {
      setFormData({
        userId: loan.userId?._id || "",
        seasonId: loan.seasonId?._id || "",
        amountOwed: loan.amountOwed || "",
        interest: loan.interest || "",
      });
      setError("");
    }
  }, [loan]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const typedValue =
      name === "quantity" || name === "amountOwed" || name === "interest"
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: typedValue,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // Client-side validation
      if (formData.amountOwed === "" || formData.amountOwed < 0) {
        setError("Amount owed must be a positive number.");
        return;
      }

      setError("");
      onSubmit(loan._id, formData);
    },
    [formData, loan, onSubmit]
  );

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Loan for {loan?.userId?.names || "N/A"}</DialogTitle>
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
            {error && (
              <Box mb={2}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            {/* Member Dropdown */}
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
                .filter((user) => user.role === "member")
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
                  {season.name}
                </MenuItem>
              ))}
            </TextField>
            {/* Amount Owed Field */}
            <TextField
              fullWidth
              label="Amount Owed"
              type="number"
              name="amountOwed"
              value={formData.amountOwed}
              onChange={handleChange}
              margin="dense"
              step="0.01"
              required
            />
            {/* Interest Rate Field */}
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
          Update Loan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UpdateLoanModal.propTypes = {
  show: PropTypes.bool.isRequired,
  loan: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default UpdateLoanModal;
