import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField, Tooltip } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className="topBar">
        <div className="container">
          <div className="glass topBarInner">
            <div className="topBarLeft">
              <div className="brandDot" aria-hidden="true" />
              <div>
                <div className="brandTitle">Conecta</div>
                <div
                  style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
                >
                  Meetings, chat, and screen share
                </div>
              </div>
            </div>

            <div className="topBarRight">
              <Tooltip title="History">
                <IconButton
                  onClick={() => navigate("/history")}
                  aria-label="Open meeting history"
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/auth");
                }}
                aria-label="Logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="homeGrid">
          <div className="glass joinCard">
            <h2 className="joinTitle">
              Join a meeting in <span>seconds</span>
            </h2>
            <p className="joinHint">
              Paste your meeting code, hit Join, and you’re in.
            </p>

            <div className="joinRow">
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="meeting-code"
                label="Meeting Code"
                variant="outlined"
                aria-label="Meeting code"
              />
              <Button
                onClick={handleJoinVideoCall}
                variant="contained"
                aria-label="Join meeting"
              >
                Join
              </Button>
            </div>
          </div>

          <div className="homeVisual">
            <img srcSet="/logo3.png" alt="App logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
