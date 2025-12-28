import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { getAppTheme } from "./styles/theme";

function ThemeWrapper({ children }) {
  // UI-only: follow user's system preference.
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () => getAppTheme(prefersDark ? "dark" : "light"),
    [prefersDark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeWrapper>
      <App />
    </ThemeWrapper>
  </React.StrictMode>
);

reportWebVitals();
