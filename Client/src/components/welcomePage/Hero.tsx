import React from "react";
import "./css/Hero.css";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Heart, Sparkles } from "lucide-react";

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
      <div className="floating-hearts">
        <Heart className="floating-heart heart-1" />
        <Heart className="floating-heart heart-2" />
        <Heart className="floating-heart heart-3" />
        <Sparkles className="floating-sparkle sparkle-1" />
        <Sparkles className="floating-sparkle sparkle-2" />
      </div>
      <div className="section-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Heart className="badge-icon" />
              <span>Plan Your Perfect Day</span>
            </div>
            <h1 className="hero-heading">
              Your Dream Wedding,{" "}
              <span className="highlight">Perfectly Organized</span>
            </h1>
            <p className="hero-description">
              From guest RSVPs to budget tracking, task management to vendor
              coordination — everything you need to plan your magical day, all
              in one beautiful place.
            </p>
            <div className="hero-features-preview">
              <div className="preview-item">
                <span className="preview-emoji">💌</span>
                <span>WhatsApp RSVPs</span>
              </div>
              <div className="preview-item">
                <span className="preview-emoji">💰</span>
                <span>Budget Tracking</span>
              </div>
              <div className="preview-item">
                <span className="preview-emoji">✅</span>
                <span>Task Management</span>
              </div>
            </div>
            <div className="hero-buttons">
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => props.handleLoginSuccess(res)}
                  onError={() => alert("Login Failed")}
                />
              </GoogleOAuthProvider>
              <p className="hero-subtext">
                Free to use • Plan together with your partner
              </p>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <div className="image-glow"></div>
              <div className="glass-card">
                <a href="https://ibb.co/1f97BFYh">
                  <img
                    src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                    alt="Wedding RSVP Dashboard Preview"
                  />
                </a>
                <div className="card-overlay">
                  <p className="card-text">
                    💍 Your wedding planning hub awaits
                  </p>
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
