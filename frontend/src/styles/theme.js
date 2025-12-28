import { createTheme } from "@mui/material/styles";

// UI-only theme: consistent typography, spacing, and a single accent color.
// Dark/light is driven by the browser preference (handled by ThemeWrapper).

export const getAppTheme = (mode = "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#7c5cff",
      },
      background: {
        default: mode === "dark" ? "#070a12" : "#f6f7fb",
        paper:
          mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)",
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji",
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 780, letterSpacing: "-0.02em" },
      h3: { fontWeight: 760, letterSpacing: "-0.01em" },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(15,23,42,0.12)",
            boxShadow:
              mode === "dark"
                ? "0 18px 60px rgba(0,0,0,0.55)"
                : "0 18px 60px rgba(2,6,23,0.14)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 14,
            paddingBlock: 10,
          },
          contained: {
            boxShadow: "0 10px 30px rgba(124, 92, 255, 0.28)",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "medium",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            background:
              mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.7)",
          },
        },
      },
    },
  });
