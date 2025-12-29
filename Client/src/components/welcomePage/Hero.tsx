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
    <div className="hero" dir="rtl">
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
              <span>תכננו את היום המושלם שלכם</span>
            </div>
            <h1 className="hero-heading">
              החתונה שחלמתם עליה,{" "}
              <span className="highlight">מאורגנת בצורה מושלמת</span>
            </h1>
            <p className="hero-description">
              מניהול אישורי הגעה ועד מעקב תקציב, ניהול משימות ותיאום ספקים — כל
              מה שצריך לתכנון היום הקסום שלכם, במקום אחד יפה.
            </p>
            <div className="hero-features-preview">
              <div className="preview-item">
                <span className="preview-emoji">💌</span>
                <span>אישורי הגעה בוואטסאפ</span>
              </div>
              <div className="preview-item">
                <span className="preview-emoji">💰</span>
                <span>מעקב תקציב</span>
              </div>
              <div className="preview-item">
                <span className="preview-emoji">✅</span>
                <span>ניהול משימות</span>
              </div>
            </div>
            <div className="hero-buttons">
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => props.handleLoginSuccess(res)}
                  onError={() => alert("ההתחברות נכשלה")}
                />
              </GoogleOAuthProvider>
              <p className="hero-subtext">
                חינם לשימוש • תכננו יחד עם בן/בת הזוג
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
                    alt="תצוגה מקדימה של לוח הבקרה"
                  />
                </a>
                <div className="card-overlay">
                  <p className="card-text">
                    💍 מרכז תכנון החתונה שלכם מחכה לכם
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
