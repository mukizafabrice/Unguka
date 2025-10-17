import React from "react";
import { Box, Paper } from "@mui/material";

const Shell = ({ header, children }) => {
  return (
    <Box sx={{ p: 0, bgcolor: "#f7f8fa", minHeight: "100%", width: "100%" }}>
      {header && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, #0b2a3b 0%, #123a50 60%, #145a32 100%)",
            color: "#eaf6ff",
            width: "100%",
          }}
        >
          {header}
        </Paper>
      )}
      <Box sx={{ width: "100%" }}>{children}</Box>
    </Box>
  );
};

export default Shell;