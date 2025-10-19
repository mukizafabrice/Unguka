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
import { fetchSeasons } from "../../services/seasonService";
import { fetchLoanPrediction } from "../../services/loanService"; // <<< NEW SERVICE IMPORT
// CORRECT ✅
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";

function AddLoanModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    userId: "",
    amountOwed: "",
    interest: "",
    seasonId: "",
  });
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true); // <<< NEW STATE FOR LOAN PREDICTION
  const [maxLoan, setMaxLoan] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false); // <<< END NEW STATE
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId; // Existing useEffect to fetch Users and Seasons when the modal opens

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
  useEffect(() => {
    const { userId, seasonId } = formData;

    if (show && userId) {
      // Only fetch if modal is open and a user is selected
      setPredictionLoading(true);
      setMaxLoan(null); // Clear previous max loan

      const getPrediction = async () => {
        try {
          const response = await fetchLoanPrediction(userId, seasonId); // Use new service call
          const maxLoanAmount = response.prediction?.maxLoan; // Display the max loan amount, rounding down for safety/simplicity

          setMaxLoan(maxLoanAmount ? Math.floor(maxLoanAmount) : 0);
        } catch (error) {
          console.error("Failed to fetch loan prediction:", error);
          setMaxLoan(0); // Default to 0 on error
        } finally {
          setPredictionLoading(false);
        }
      };
      getPrediction();
    } else if (!userId) {
      // Reset prediction when user is deselected
      setMaxLoan(null);
      setPredictionLoading(false);
    }
  }, [show, formData.userId, formData.seasonId]); // Depend on user and season

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Clear amountOwed when userId or seasonId changes to force re-entry
      ...(name === "userId" || name === "seasonId" ? { amountOwed: "" } : {}),
    }));
  }, []);
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault(); // Add a client-side check if a maxLoan is available
      if (maxLoan !== null && Number(formData.amountOwed) > maxLoan) {
        alert(
          `The requested amount (${formData.amountOwed}) exceeds the maximum allowable loan of ${maxLoan}.`
        );
        return; // Prevent submission
      }
      onSubmit(formData);
    },
    [formData, onSubmit, maxLoan]
  );

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add New Loan</DialogTitle>     {" "}
      <DialogContent dividers>
               {" "}
        {loading ? (
          // ... (Loading state for users/seasons) ...
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
                        <CircularProgress />           {" "}
            <Typography variant="body1" sx={{ ml: 2 }}>
                            Loading data...            {" "}
            </Typography>
                     {" "}
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
                                    {/* Member Dropdown */}           {" "}
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
                       {" "}
              {users
                .filter((user) => user.role === "member")
                .map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                                        {user.names}                 {" "}
                  </MenuItem>
                ))}
                         {" "}
            </TextField>
                        {/* Season Dropdown */}           {" "}
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
                       {" "}
              {seasons.map((season) => (
                <MenuItem key={season._id} value={season._id}>
                                    {season.name}               {" "}
                </MenuItem>
              ))}
                         {" "}
            </TextField>
                                    {/* Max Loan Display (NEW FIELD) */}       
               {" "}
            <TextField
              fullWidth
              label="Maximum Allowable Loan"
              name="maxLoanDisplay"
              value={
                maxLoan !== null
                  ? maxLoan === 0
                    ? "0 (No production data)"
                    : maxLoan.toLocaleString()
                  : formData.userId
                  ? "Calculating..."
                  : "Select Member and Season"
              }
              InputProps={{
                endAdornment: predictionLoading ? (
                  <CircularProgress size={20} />
                ) : null,
              }}
              margin="dense"
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#3f51b5", // Make the text color stand out (e.g., primary color)
                  fontWeight: "bold",
                },
              }}
            />
                                    {/* Amount Owed */}           {" "}
            <TextField
              fullWidth
              label="Amount Owed"
              type="number"
              name="amountOwed"
              value={formData.amountOwed}
              onChange={handleChange}
              placeholder={`Max loan is ${
                maxLoan !== null ? maxLoan.toLocaleString() : "..."
              }`} // Placeholder hint
              required
              margin="dense"
              error={maxLoan !== null && Number(formData.amountOwed) > maxLoan}
              helperText={
                maxLoan !== null && Number(formData.amountOwed) > maxLoan
                  ? `Amount exceeds the maximum allowable loan of ${maxLoan.toLocaleString()}.`
                  : ""
              }
            />
                        {/* Interest Rate */}           {" "}
            <TextField // ... (Interest Field remains the same) ...
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
                                 {" "}
          </form>
        )}
             {" "}
      </DialogContent>
           {" "}
      <DialogActions>
               {" "}
        <Button onClick={onClose} color="secondary">
                    Cancel        {" "}
        </Button>
               {" "}
        <Button
          type="submit"
          onClick={handleSubmit}
          color="primary"
          variant="contained" // Disable if a prediction is pending or if amount exceeds max loan
          disabled={
            predictionLoading ||
            (maxLoan !== null && Number(formData.amountOwed) > maxLoan)
          }
        >
                    Add Loan        {" "}
        </Button>
             {" "}
      </DialogActions>
         {" "}
    </Dialog>
  );
}
// ... (propTypes and export remain the same) ...

AddLoanModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddLoanModal;
