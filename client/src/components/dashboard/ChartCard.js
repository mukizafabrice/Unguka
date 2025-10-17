import React from "react";
import { Paper, Typography } from "@mui/material";
import { ResponsiveContainer } from "recharts";

const translateTitle = (title, lang) => {
  const translations = {
    fr: {
      "Users (last 6 months)": "Utilisateurs (6 derniers mois)",
      "Cooperatives (last 6 months)": "Coopératives (6 derniers mois)",
      "Production by Season": "Production par Saison",
      "Recent Purchases": "Achats Récents",
      "Recent Productions": "Productions Récentes",
      "Recent Payments": "Paiements Récents",
      "Recent Loans": "Prêts Récents"
    },
    rw: {
      "Users (last 6 months)": "Abakoresha (amezi 6 ashize)",
      "Cooperatives (last 6 months)": "Koperative (amezi 6 ashize)",
      "Production by Season": "Ibikorwa ku gihe",
      "Recent Purchases": "Ibicuruzwa bya vuba",
      "Recent Productions": "Ibikorwa bya vuba",
      "Recent Payments": "Kwishyura bya vuba",
      "Recent Loans": "Inguzanyo bya vuba"
    }
  };
  return translations[lang]?.[title] || title;
};

const ChartCard = ({ title, height = 250, children }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 4,
        minHeight: height + 60,
        border: "1px solid #e3f2fd",
        display: "inline-flex",
        flexDirection: "column",
        minWidth: 350,
        flex: 1,
        mx: 0.5,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        },
      }}
    >
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </Paper>
  );
};

export default ChartCard;