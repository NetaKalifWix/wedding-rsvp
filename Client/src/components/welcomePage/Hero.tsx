import React from "react";
import "./css/Hero.css";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

type HeroProps = {
  handleLoginSuccess: (user: any) => void;
};
const Hero = (props: HeroProps) => {
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }
  return (
    <div className="hero">
      <div className="section-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-heading">
              Modern RSVP System with WhatsApp Integration
            </h1>
            <p className="hero-description">
              Send invitations via WhatsApp and track all responses in a
              beautiful dashboard. Simplify your event planning with RSVP Hub.
            </p>
            <div className="hero-buttons">
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => props.handleLoginSuccess(res)}
                  onError={() => alert("Login Failed")}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <div className="image-glow"></div>
              <div className="glass-card">
                <a href="https://ibb.co/1f97BFYh">
                  <img
                    src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                    alt="Screenshot-2025-05-20-at-15-24-20"
                  />
                </a>
                <div className="card-overlay">
                  <p className="card-text">Track all your RSVPs in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
