import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSummaryById } from "../../services/paymentService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { useAuth } from "../../contexts/AuthContext";

// Material-UI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
  Stack,
  styled,
} from "@mui/material";

// Material-UI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MoneyOffCsredIcon from "@mui/icons-material/MoneyOffCsred";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaidIcon from "@mui/icons-material/Paid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useTheme, useMediaQuery } from "@mui/material";

// Styled Components for consistent design
const StyledSummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5), // Smaller padding
  borderRadius: theme.shape.borderRadius,
  textAlign: "center",
  boxShadow: theme.shadows[1], // Lighter shadow
  height: "100%", // Ensure consistent height in grid
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const StyledSectionWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper, // Changed from grey[50] for consistency
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    marginBottom: theme.spacing(3), // Reduced margin
  },
}));

// Helper to get icon for summary items
const getIconForSummary = (type, theme) => {
  const iconStyle = { fontSize: "1.8rem", mb: 0.5 }; // Smaller icon
  switch (type) {
    case "production":
      return <AttachMoneyIcon color="primary" sx={iconStyle} />;
    case "fees":
      return <MoneyOffCsredIcon color="error" sx={iconStyle} />;
    case "loans":
      return <AccountBalanceWalletIcon color="warning" sx={iconStyle} />;
    case "remaining":
      return <PaidIcon color="success" sx={iconStyle} />;
    case "net":
      return <AssessmentIcon color="secondary" sx={iconStyle} />;
    case "due":
      return (
        <AccountBalanceWalletIcon
          sx={{ color: theme.palette.info.main, ...iconStyle }}
        />
      ); // Specific for Amount Due
    default:
      return (
        <AttachMoneyIcon
          sx={{ color: theme.palette.text.secondary, ...iconStyle }}
        />
      );
  }
};

function PaymentDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id; // Get userId from auth context
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState({ fees: [], loans: [], payments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeTypes, setFeeTypes] = useState([]);

  // Helper function for currency formatting
  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat("en-RW", {
        style: "currency",
        currency: "RWF",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount || 0), // Ensure it handles null/undefined gracefully
    []
  );

  // Consolidated data loading effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (!userId) {
        setLoading(false);
        setError(
          "User ID not found. Please log in or navigate from a user context."
        );
        setSummary(null);
        setDetails({ fees: [], loans: [], payments: [] });
        return;
      }

      let fetchedFeeTypes = [];
      try {
        const types = await fetchFeeTypes();
        fetchedFeeTypes = Array.isArray(types) ? types : types?.data || [];
        setFeeTypes(fetchedFeeTypes); // Update state for potential future use or re-renders
      } catch (err) {
        console.error("Failed to load fee types:", err);
        toast.error(
          "Failed to load fee types. Displaying summary with generic names."
        );
        // Continue with an empty array if fetching fee types fails
        fetchedFeeTypes = [];
      }

      // Helper to get fee type name from the directly fetched feeTypes
      const getFeeTypeNameInternal = (feeTypeId) =>
        fetchedFeeTypes.find((ft) => ft._id === feeTypeId)?.name ||
        "Unknown Fee Type";

      try {
        console.log(`[PaymentDetails] Fetching summary for userId: ${userId}`);
        const data = await fetchSummaryById(userId);

        setSummary({
          totalProduction: data.totalProduction || 0,
          totalUnpaidFees: data.totalUnpaidFees || 0,
          totalLoans: data.totalLoans || 0,
          previousRemaining: data.previousRemaining || 0,
          currentNet: data.currentNet || 0,
          amountDue: data.netPayable || 0,
          existingPartialPayment: data.existingPartialPayment,
        });

        setDetails({
          fees: Array.isArray(data.fees)
            ? data.fees.map((fee) => ({
                ...fee,
                feeTypeName: getFeeTypeNameInternal(fee.feeTypeId), // Use the internal helper
                remainingAmount: fee.amountOwed - (fee.amountPaid || 0),
              }))
            : [],
          loans: Array.isArray(data.loans) ? data.loans : [],
          payments: Array.isArray(data.payments) ? data.payments : [],
        });
      } catch (err) {
        console.error("[PaymentDetails] Failed to load summary:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred.";
        setError(`Failed to load payment details: ${message}`);
        setSummary(null);
        setDetails({ fees: [], loans: [], payments: [] });
        toast.error(`Error loading summary: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, formatCurrency]); // `formatCurrency` is stable due to useCallback

  const handleBack = useCallback(() => {
    navigate(-1); // Go back to the previous page
  }, [navigate]);

  // --- Render Logic ---
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Stack direction="column" spacing={2} alignItems="center">
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading payment details...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          sx={{ maxWidth: 400, textAlign: "center" }}
        >
          <Typography variant="h6" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography>{error}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please ensure you are logged in and have a valid user ID.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Alert
          severity="info"
          variant="outlined"
          sx={{ maxWidth: 400, textAlign: "center" }}
        >
          <Typography variant="h6" gutterBottom>
            No Details Available
          </Typography>
          <Typography>
            No payment details could be loaded for this user.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            This might mean the user has no payment data, or the ID is
            incorrect.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isMobile ? 1.5 : 3,
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Button
        onClick={handleBack}
        startIcon={<ArrowBackIcon />}
        variant="text" // Less prominent than outlined
        sx={{ mb: isMobile ? 2 : 3 }}
      >
        Back to Payments
      </Button>

      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        {" "}
        {/* Smaller border radius and shadow */}
        {/* Scrollable Content Container */}
        <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            {" "}
            {/* Reduced padding */}
            {summary.existingPartialPayment ? (
              <Alert
                severity="info"
                sx={{
                  mb: isMobile ? 2 : 3,
                  p: isMobile ? 1.5 : 2,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body1"
                  component="h5"
                  align="center"
                  fontWeight="medium"
                  gutterBottom
                >
                  Continuing Payment from Previous Period
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  align="center"
                  fontWeight="bold"
                >
                  Remaining Due:{" "}
                  {formatCurrency(
                    summary.existingPartialPayment?.amountRemainingToPay
                  )}
                </Typography>
                <Typography
                  variant="caption"
                  align="center"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  This reflects the outstanding balance from a previous payment.
                </Typography>
              </Alert>
            ) : (
              <>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component="h2"
                  sx={{ fontWeight: "bold", mb: isMobile ? 1.5 : 2 }}
                >
                  Overall Financial Overview
                </Typography>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {" "}
                  {/* Reduced spacing */}
                  <Grid item xs={6} sm={4} md={4}>
                    <StyledSummaryPaper>
                      {getIconForSummary("production", theme)}
                      <Typography variant="caption" color="text.secondary">
                        Total Production
                      </Typography>
                      <Typography
                        variant="body1"
                        color="primary"
                        fontWeight="bold"
                      >
                        {formatCurrency(summary.totalProduction)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={4}>
                    <StyledSummaryPaper>
                      {getIconForSummary("fees", theme)}
                      <Typography variant="caption" color="text.secondary">
                        Unpaid Fees
                      </Typography>
                      <Typography
                        variant="body1"
                        color="error"
                        fontWeight="bold"
                      >
                        {formatCurrency(summary.totalUnpaidFees)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={4}>
                    <StyledSummaryPaper>
                      {getIconForSummary("loans", theme)}
                      <Typography variant="caption" color="text.secondary">
                        Unpaid Loans
                      </Typography>
                      <Typography
                        variant="body1"
                        color="warning"
                        fontWeight="bold"
                      >
                        {formatCurrency(summary.totalLoans)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                  <Grid item xs={6} sm={6} md={6}>
                    <StyledSummaryPaper>
                      {getIconForSummary("remaining", theme)}
                      <Typography variant="caption" color="text.secondary">
                        Previous Remaining
                      </Typography>
                      <Typography
                        variant="body1"
                        color="success"
                        fontWeight="bold"
                      >
                        {formatCurrency(summary.previousRemaining)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <StyledSummaryPaper sx={{ color: "text.primary" }}>
                      {getIconForSummary("net", theme)}
                      <Typography variant="caption">
                        Current Net Balance
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(summary.currentNet)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledSummaryPaper sx={{ color: "text.primary" }}>
                      {getIconForSummary("due", theme)}
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Total Amount Due:
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.dark"
                      >
                        {formatCurrency(summary.amountDue)}
                      </Typography>
                    </StyledSummaryPaper>
                  </Grid>
                </Grid>
              </>
            )}
            <Divider sx={{ my: isMobile ? 3 : 4 }} />
            <StyledSectionWrapper>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Unpaid Fees Breakdown
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {details.fees.length ? (
                <List dense disablePadding>
                  {" "}
                  {/* Dense list for compactness */}
                  {details.fees.map((fee) => (
                    <ListItem key={fee._id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {fee.feeTypeName}
                          </Typography>
                        }
                        secondary={`Original Due: ${formatCurrency(
                          fee.amountOwed
                        )}`}
                      />
                      <Typography
                        variant="body2"
                        color="error"
                        fontWeight="bold"
                      >
                        {formatCurrency(fee.remainingAmount)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ p: 1, fontSize: "0.875rem" }}>
                  No outstanding fees for this user.
                </Alert>
              )}
            </StyledSectionWrapper>
            <StyledSectionWrapper>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Outstanding Loans Breakdown
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {details.loans.length ? (
                <List dense disablePadding>
                  {details.loans.map((loan) => (
                    <ListItem key={loan._id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            Loan on{" "}
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                        secondary={`Principal: ${formatCurrency(
                          loan.loanOwed
                        )}`}
                      />
                      <Typography
                        variant="body2"
                        color="warning"
                        fontWeight="bold"
                      >
                        {formatCurrency(loan.amountOwed)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ p: 1, fontSize: "0.875rem" }}>
                  No outstanding loans for this user.
                </Alert>
              )}
            </StyledSectionWrapper>
            <StyledSectionWrapper>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Previous Payments with Remaining Balance
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {details.payments.length ? (
                <List dense disablePadding>
                  {details.payments.map((prev) => (
                    <ListItem key={prev._id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            Payment on{" "}
                            {new Date(prev.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                        secondary={`Paid: ${formatCurrency(prev.amountPaid)}`}
                      />
                      <Typography
                        variant="body2"
                        color="info"
                        fontWeight="bold"
                      >
                        {formatCurrency(prev.amountRemainingToPay)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ p: 1, fontSize: "0.875rem" }}>
                  No previous payments with remaining balances for this user.
                </Alert>
              )}
            </StyledSectionWrapper>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}

export default PaymentDetails;
