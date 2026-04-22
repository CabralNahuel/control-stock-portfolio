import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#131b2e",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#505f76",
      contrastText: "#ffffff",
    },
    success: {
      main: "#009668",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#b26a00",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ba1a1a",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#1b1b1d",
      secondary: "#45464d",
    },
    background: {
      default: "#fcf8fa",
      paper: "#ffffff",
    },
    divider: "#c6c6cd",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#fcf8fa",
          color: "#1b1b1d",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(17, 24, 39, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontWeight: 600,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
            backgroundColor: "transparent",
            opacity: 0.5,
          },
        }),
        page: ({ theme }) => ({
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        }),
        previousNext: ({ theme }) => ({
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
          },
        }),
      },
    },
  },
});
