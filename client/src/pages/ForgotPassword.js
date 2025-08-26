import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { styled } from "@mui/system";
import { forgotPasswordService } from "../services/userService";

// Styled components (keep them as is)
const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#eee",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "480px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2.5),
  transition: "transform 0.3s ease-in-out",
  "&:hover": { transform: "translateY(-5px)" },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  padding: "14px 28px",
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontSize: "1.05rem",
  fontWeight: 600,
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.12)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
    transform: "translateY(-2px)",
  },
}));

const ForgotPasswordMUI = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const result = await forgotPasswordService(email);

      if (result.success) {
        setMessage(result.message || "Password reset link sent successfully.");
        setEmail("");
      } else {
        setError(result.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unexpected error. Please try again later.");
    }

    setLoading(false);
  };

  const handleBackToLogin = () => navigate("/");

  return (
    <StyledContainer maxWidth="full">
      <StyledBox>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#3f51b5" }}
        >
          Forgot Your Password?
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: "#555", marginBottom: 3 }}
        >
          No worries! Just enter your email below and we'll send you a link to
          reset it.
        </Typography>

        {message && (
          <Alert severity="success" sx={{ width: "100%", borderRadius: "8px" }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: "100%", borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </StyledButton>
        </Box>

        <MuiLink
          component="button"
          variant="body2"
          onClick={handleBackToLogin}
          sx={{
            marginTop: 2,
            color: "#3f51b5",
            "&:hover": { textDecoration: "underline", color: "#303f9f" },
          }}
        >
          Remember your password? Back to Login
        </MuiLink>
      </StyledBox>
    </StyledContainer>
  );
};

export default ForgotPasswordMUI;
