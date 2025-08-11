import { createTheme } from "@mui/material";

// Define a custom Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4285F4', // Google Blue
    },
    secondary: {
      main: '#34A853', // Google Green
    },
    error: {
      main: '#EA4335', // Google Red
    },
    background: {
      default: '#F5F5F5', // Light grey background
      paper: '#FFFFFF', // White for cards/containers
    },
    text: {
      primary: '#202124', // Dark grey for primary text
      secondary: '#5F6368', // Medium grey for secondary text
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Use Inter font
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8, // More rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase by default
          borderRadius: 8,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          backgroundColor: '#4285F4',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#357AE8',
          },
        },
        outlined: {
          borderColor: '#4285F4',
          color: '#4285F4',
          '&:hover': {
            backgroundColor: 'rgba(66, 133, 244, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded for paper components
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)', // Enhanced shadow
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({ // Access theme here
          backgroundColor: '#E8F0FE', // Light blue background for table header
          color: theme.palette.text.primary,
          fontWeight: 700,
          fontSize: '1.05rem',
          padding: '16px 24px',
        }),
        body: {
          padding: '12px 24px',
          fontSize: '0.95rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({ // Access theme here
          '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover, // Subtle alternating row color
          },
          '&:hover': {
            backgroundColor: 'rgba(66, 133, 244, 0.08) !important', // Stronger hover effect
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({ // Access theme here
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: theme.palette.background.paper, // White background for input
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export default theme; 