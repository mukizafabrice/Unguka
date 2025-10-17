import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";

const translateTitle = (title, lang) => {
  const translations = {
    fr: {
      "Users": "Utilisateurs",
      "Cooperatives": "Coopératives",
      "Managers": "Gestionnaires",
      "Super Admins": "Super Admins",
      "Total Products": "Produits Totaux",
      "Total Productions": "Productions Totales",
      "My Loans": "Mes Prêts"
    },
    rw: {
      "Users": "Abakoresha",
      "Cooperatives": "Koperative",
      "Managers": "Abayobozi",
      "Super Admins": "Abayobozi bakuru",
      "Total Products": "Ibicuruzwa Byose",
      "Total Productions": "Ibikorwa Byose",
      "My Loans": "Inguzanyo Zanvu"
    }
  };
  return translations[lang]?.[title] || title;
};

const Stat = ({ title, value, icon, color = "#1976d2" }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
        bgcolor: "#ffffff",
        border: "1px solid #e3f2fd",
        minHeight: 140,
        minWidth: 240,
        mx: 1,
        flex: 1,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: color,
          color: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Stat;