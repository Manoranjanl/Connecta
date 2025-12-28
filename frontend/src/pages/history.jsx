import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";
import "../App.css";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // IMPLEMENT SNACKBAR
      }
    };
    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container">
      <div className="historyHeader">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconButton
            onClick={() => routeTo("/home")}
            aria-label="Back to home"
          >
            <HomeIcon />
          </IconButton>
          <div className="historyTitle">Meeting history</div>
        </div>

        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          {meetings.length} {meetings.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="glass emptyState">
          No meetings yet. Join a meeting and it will show up here.
        </div>
      ) : (
        <div className="historyGrid">
          {meetings.map((e, i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <CardContent>
                <Typography
                  sx={{ fontSize: 12 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Meeting Code
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  {e.meetingCode}
                </Typography>
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  {formatDate(e.date)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
