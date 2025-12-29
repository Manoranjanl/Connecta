import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;

// Keep connections outside component (as you had)
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);

  const localVideoref = useRef(null);

  const videoRef = useRef([]); // tracks videos state mirror for quick lookup

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [showModal, setModal] = useState(true);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [videos, setVideos] = useState([]);

  // ---------------------------
  // Helpers: fake black/silence
  // ---------------------------
  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const ensureLocalStream = () => {
    if (window.localStream) return window.localStream;
    const stream = new MediaStream([black(), silence()]);
    window.localStream = stream;
    return stream;
  };

  // ---------------------------
  // Permissions (IMPORTANT FIX: run once)
  // ---------------------------
  useEffect(() => {
    (async () => {
      try {
        // probe video permission
        try {
          const v = await navigator.mediaDevices.getUserMedia({ video: true });
          v.getTracks().forEach((t) => t.stop());
          setVideoAvailable(true);
        } catch {
          setVideoAvailable(false);
        }

        // probe audio permission
        try {
          const a = await navigator.mediaDevices.getUserMedia({ audio: true });
          a.getTracks().forEach((t) => t.stop());
          setAudioAvailable(true);
        } catch {
          setAudioAvailable(false);
        }

        setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

        // acquire initial stream
        const wantVideo = true;
        const wantAudio = true;

        if (wantVideo || wantAudio) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: wantVideo,
            audio: wantAudio,
          });
          window.localStream = stream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
          }
        }
      } catch (e) {
        console.log("Permission error:", e);
      }
    })();

    // cleanup on unmount
    return () => {
      try {
        if (window.localStream) {
          window.localStream.getTracks().forEach((t) => t.stop());
        }
      } catch {}
    };
  }, []);

  // ---------------------------
  // Media switching
  // ---------------------------
  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks()?.forEach((track) => track.stop());
    } catch {}

    window.localStream = stream;

    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }

    // renegotiate with all peers
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      try {
        connections[id].addStream(window.localStream);
      } catch {}

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current?.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    // if user stops camera/mic, replace with black/silence
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          const tracks = localVideoref.current?.srcObject?.getTracks?.() || [];
          tracks.forEach((t) => t.stop());
        } catch {}

        const fallback = new MediaStream([black(), silence()]);
        window.localStream = fallback;
        if (localVideoref.current) localVideoref.current.srcObject = fallback;

        for (let id in connections) {
          try {
            connections[id].addStream(window.localStream);
          } catch {}

          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current?.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        }
      };
    });
  };

  const getUserMedia = () => {
    const wantVideo = !!(video && videoAvailable);
    const wantAudio = !!(audio && audioAvailable);

    if (wantVideo || wantAudio) {
      navigator.mediaDevices
        .getUserMedia({ video: wantVideo, audio: wantAudio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        const tracks = localVideoref.current?.srcObject?.getTracks?.() || [];
        tracks.forEach((t) => t.stop());
      } catch {}
    }
  };

  // When toggling video/audio, update stream
  useEffect(() => {
    // avoid running before permissions init finishes
    if (video !== undefined && audio !== undefined) getUserMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, audio]);

  // ---------------------------
  // Screen share
  // ---------------------------
  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks()?.forEach((track) => track.stop());
    } catch {}

    window.localStream = stream;
    if (localVideoref.current) localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      try {
        connections[id].addStream(window.localStream);
      } catch {}

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current?.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        try {
          const tracks = localVideoref.current?.srcObject?.getTracks?.() || [];
          tracks.forEach((t) => t.stop());
        } catch {}

        // go back to camera/mic
        getUserMedia();
      };
    });
  };

  const getDislayMedia = () => {
    if (!screen) return;
    if (!navigator.mediaDevices.getDisplayMedia) return;

    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then(getDislayMediaSuccess)
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ---------------------------
  // Socket + WebRTC signaling
  // ---------------------------
  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    // Ensure connection exists
    if (!connections[fromId]) {
      connections[fromId] = new RTCPeerConnection(peerConfigConnections);
      setupPeer(fromId, connections[fromId]);
      connections[fromId].addStream(ensureLocalStream());
    }

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current?.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log(e));
    }

    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.log(e));
    }
  };

  const setupPeer = (peerId, pc) => {
    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit(
          "signal",
          peerId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    // Remote stream
    pc.onaddstream = (event) => {
      setVideos((prev) => {
        const exists = prev.find((v) => v.socketId === peerId);
        const updated = exists
          ? prev.map((v) =>
              v.socketId === peerId ? { ...v, stream: event.stream } : v
            )
          : [
              ...prev,
              {
                socketId: peerId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              },
            ];
        videoRef.current = updated;
        return updated;
      });
    };
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        try {
          connections[id]?.close?.();
        } catch {}
        delete connections[id];
      });

      /**
       * IMPORTANT FIXES:
       * 1) never overwrite existing peer connections
       * 2) never create connection to self
       * 3) only the JOINER initiates offers
       */
      socketRef.current.on("user-joined", (joinedId, clients) => {
        // Create connections only for peers we don't already have
        clients.forEach((peerId) => {
          if (peerId === socketIdRef.current) return;
          if (connections[peerId]) return;

          const pc = new RTCPeerConnection(peerConfigConnections);
          connections[peerId] = pc;

          setupPeer(peerId, pc);

          // add local stream once
          pc.addStream(ensureLocalStream());
        });

        // Only the person who just joined should create offers
        if (joinedId === socketIdRef.current) {
          clients.forEach((peerId) => {
            if (peerId === socketIdRef.current) return;
            if (!connections[peerId]) return;

            connections[peerId].createOffer().then((description) => {
              connections[peerId]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current?.emit(
                    "signal",
                    peerId,
                    JSON.stringify({
                      sdp: connections[peerId].localDescription,
                    })
                  );
                })
                .catch((e) => console.log(e));
            });
          });
        }
      });
    });
  };

  // ---------------------------
  // Chat
  // ---------------------------
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    socketRef.current?.emit("chat-message", message, username);
    setMessage("");
  };

  // ---------------------------
  // UI handlers
  // ---------------------------
  const handleVideo = () => setVideo((v) => !v);
  const handleAudio = () => setAudio((a) => !a);
  const handleScreen = () => setScreen((s) => !s);

  const handleEndCall = () => {
    try {
      const tracks = localVideoref.current?.srcObject?.getTracks?.() || [];
      tracks.forEach((t) => t.stop());
    } catch {}
    try {
      socketRef.current?.disconnect?.();
    } catch {}
    window.location.href = "/";
  };

  const connect = () => {
    setAskForUsername(false);
    // start socket + media
    connectToSocketServer();
    // set initial media toggles based on availability
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into Lobby</h2>

          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoref} autoPlay muted />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length ? (
                    messages.map((item, index) => (
                      <div style={{ marginBottom: 20 }} key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.buttonContainers}>
            <div className={styles.controlBar}>
              <IconButton
                onClick={handleVideo}
                className={styles.iconBtn}
                aria-label="Toggle video"
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                onClick={handleEndCall}
                className={`${styles.iconBtn} ${styles.danger}`}
                aria-label="End call"
              >
                <CallEndIcon />
              </IconButton>

              <IconButton
                onClick={handleAudio}
                className={styles.iconBtn}
                aria-label="Toggle microphone"
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable ? (
                <IconButton
                  onClick={handleScreen}
                  className={styles.iconBtn}
                  aria-label="Toggle screen share"
                >
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              ) : null}

              <Badge
                badgeContent={newMessages}
                max={999}
                color="error"
                overlap="circular"
                sx={{ "& .MuiBadge-badge": { fontWeight: 800 } }}
              >
                <IconButton
                  onClick={() => {
                    setModal((m) => !m);
                    setNewMessages(0);
                  }}
                  className={styles.iconBtn}
                  aria-label="Toggle chat"
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          />

          <div className={styles.conferenceView}>
            {videos.map((v) => (
              <div key={v.socketId}>
                <video
                  data-socket={v.socketId}
                  ref={(ref) => {
                    if (ref && v.stream) ref.srcObject = v.stream;
                  }}
                  autoPlay
                  playsInline
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
