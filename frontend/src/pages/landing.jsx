import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      <div className="landingBackdrop" aria-hidden="true" />
      <div className="landingOverlay" aria-hidden="true" />

      <div className="container">
        <nav className="landingNav">
          <div className="brandMark" aria-label="Conecta">
            <div className="brandDot" />
            <div className="brandTitle">Conecta</div>
          </div>

          <div className="navActions">
            <button
              type="button"
              className="btnGhost"
              onClick={() => router("/aljk23")}
              aria-label="Join as guest"
            >
              Join as Guest
            </button>
            <button
              type="button"
              className="btnGhost"
              onClick={() => router("/auth")}
              aria-label="Register"
            >
              Register
            </button>
            <button
              type="button"
              className="btnPrimary"
              onClick={() => router("/auth")}
              aria-label="Login"
            >
              Login
            </button>
          </div>
        </nav>

        <div className="landingMain">
          <div className="glass heroCard">
            <div className="heroKicker">Fast • Simple • Secure</div>
            <h1 className="heroTitle">
              <span>Connect</span> with your people, instantly.
            </h1>
            <p className="heroSub">
              Crystal-clear video meetings with chat and screen share — built to
              keep you close, even when you’re far.
            </p>
            <div className="heroCtas">
              <Link
                className="btnPrimary"
                to={"/auth"}
                aria-label="Get started"
              >
                Get Started
              </Link>
              <button
                type="button"
                className="btnGhost"
                onClick={() => router("/aljk23")}
                aria-label="Join a meeting as guest"
              >
                Join a Meeting
              </button>
            </div>
          </div>

          <div className="heroVisual">
            <img src="/image.png" alt="Video call illustration" />
          </div>
        </div>
      </div>
    </div>
  );
}
