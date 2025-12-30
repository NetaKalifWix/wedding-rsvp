import React from "react";
import { Box, Heading, Text, Badge } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
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
      <Box className="section-container">
        <Box className="hero-content" gap="SP6">
          <Box className="hero-text" direction="vertical" gap="SP4">
            <Badge className="hero-badge" skin="general">
              <Box gap="SP1" verticalAlign="middle">
                <Heart className="badge-icon" />
                <Text size="small" weight="bold" light>
                  תכנון חתונה
                </Text>
              </Box>
            </Badge>
            <Heading appearance="H1" className="hero-heading">
              החתונה שלכם, <span className="highlight">מסודרת</span>
            </Heading>
            <Text className="hero-description" size="medium" secondary>
              אישורי הגעה, תקציב, משימות וספקים — הכל במקום אחד.
            </Text>
            <Box className="hero-features-preview" gap="SP2">
              <Box className="preview-item" gap="SP1" verticalAlign="middle">
                <Text>💌</Text>
                <Text size="small">וואטסאפ</Text>
              </Box>
              <Box className="preview-item" gap="SP1" verticalAlign="middle">
                <Text>💰</Text>
                <Text size="small">תקציב</Text>
              </Box>
              <Box className="preview-item" gap="SP1" verticalAlign="middle">
                <Text>✅</Text>
                <Text size="small">משימות</Text>
              </Box>
            </Box>
            <Box className="hero-buttons" direction="vertical" gap="SP2">
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => props.handleLoginSuccess(res)}
                  onError={() => alert("ההתחברות נכשלה")}
                />
              </GoogleOAuthProvider>
              <Text className="hero-subtext" size="small" secondary>
                חינם • תכננו יחד
              </Text>
            </Box>
          </Box>
          <div className="hero-image">
            <div className="image-container">
              <div className="image-glow" />
              <div className="glass-card">
                <a href="https://ibb.co/1f97BFYh">
                  <img
                    src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                    alt="תצוגה מקדימה"
                  />
                </a>
                <div className="card-overlay">
                  <Text className="card-text" light>
                    💍 מתחילים לתכנן
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default Hero;
