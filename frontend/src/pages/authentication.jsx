// src/pages/authentication.jsx
import * as React from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = login, 1 = register

  // Snackbar "dialog"
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState("");
  const [snackSeverity, setSnackSeverity] = React.useState("success"); // success | error | info

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const [searchParams] = useSearchParams();

  const showSnack = (msg, severity = "success") => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  // Open Sign Up automatically if URL has ?mode=signup
  React.useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setFormState(1);
      setError("");
    }
  }, [searchParams]);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        showSnack("Login successful ✅", "success");
      }

      if (formState === 1) {
        const result = await handleRegister(name, username, password);

        setUsername("");
        setPassword("");
        setName("");

        showSnack(result || "Account created successfully ✅", "success");

        setError("");
        setFormState(0);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong";
      setError(msg);
      showSnack(msg, "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: "min(980px, 100%)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Left hero */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            minHeight: { xs: 240, md: 520 },
          }}
        >
          {/* Color-only background (no images) */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(700px 520px at 25% 22%, rgba(124,92,255,0.18), transparent 62%)," +
                "radial-gradient(700px 520px at 80% 80%, rgba(34,197,94,0.10), transparent 62%)," +
                "linear-gradient(180deg, var(--bg-0), var(--bg-1))",
            }}
          />

          <Box
            sx={{
              position: "relative",
              height: "100%",
              padding: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Brand */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: "primary.main",
                  boxShadow: "0 10px 25px rgba(124,92,255,0.35)",
                }}
              />
              <Typography sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
                Conecta
              </Typography>
            </Box>

            {/* Centered hero copy (box centered) */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: 560,
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1.03,
                    letterSpacing: "-0.035em",
                    color: "text.primary",
                  }}
                >
                  Meetings that feel{" "}
                  <Box component="span" sx={{ color: "primary.main" }}>
                    effortless
                  </Box>
                  .
                </Typography>

                {/* Readable strip */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(15,23,42,0.10)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "inline-block",
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    Sign in to host or join. Video, chat, and screen sharing —
                    fast and simple.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Right auth form */}
        <Paper elevation={0} sx={{ borderRadius: 4, padding: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(180deg, rgba(124,92,255,0.95), rgba(124,92,255,0.75))",
                  boxShadow: "0 10px 30px rgba(124,92,255,0.28)",
                }}
              >
                <LockOutlinedIcon sx={{ color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {formState === 0 ? "Welcome back" : "Create your account"}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  {formState === 0
                    ? "Log in to continue to your meetings"
                    : "Sign up to start hosting meetings"}
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => {
                  setFormState(0);
                  setError("");
                }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => {
                  setFormState(1);
                  setError("");
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Divider />

            {/* Form */}
            {formState === 1 ? (
              <TextField
                required
                fullWidth
                id="full-name"
                label="Full Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : null}

            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={username}
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />

            {/* Keep inline error (optional) */}
            {error ? (
              <Typography
                sx={{ color: "error.main", fontSize: 13 }}
                role="alert"
              >
                {error}
              </Typography>
            ) : null}

            <Button
              type="button"
              fullWidth
              variant="contained"
              size="large"
              onClick={handleAuth}
              aria-label={formState === 0 ? "Login" : "Register"}
            >
              {formState === 0 ? "Login" : "Create account"}
            </Button>

            <Typography
              sx={{ color: "text.secondary", fontSize: 12, lineHeight: 1.5 }}
            >
              By continuing, you agree to basic usage terms.
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Snackbar "dialog" */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
