import React from "react";
import { Box, Image } from "@wix/design-system";
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
      <Box
        padding="SP10"
        maxWidth="1280px"
        gap="SP6"
        verticalAlign="middle"
        className="hero-layout"
      >
        <Box direction="vertical" gap="SP4" align="center" width="50%">
          <div>
            <h1 style={{ margin: "4px" }}>תכננו את החתונה </h1>
            <h1 style={{ margin: "4px" }} className="highlight">
              בלי הסטרס
            </h1>
          </div>

          <span>
            ניהול אורחים, תקציב, משימות וספקים בפלטפורמה אחת חכמה. שלחו הזמנות
            בוואטסאפ וקבלו אישורים בזמן אמת.
          </span>

          <Box gap="SP2" verticalAlign="middle" className="hero-chips">
            <Box
              padding="SP2 SP4"
              backgroundColor="WHITE"
              borderRadius="SP6"
              gap="SP1"
              verticalAlign="middle"
              className="hero-chip"
            >
              <span>💌</span>
              <h4>הזמנות בוואטסאפ</h4>
            </Box>
            <Box
              padding="SP2 SP4"
              backgroundColor="WHITE"
              borderRadius="SP6"
              gap="SP1"
              verticalAlign="middle"
              className="hero-chip"
            >
              <span>💰</span>
              <h4>שליטה בתקציב</h4>
            </Box>
            <Box
              padding="SP2 SP4"
              backgroundColor="WHITE"
              borderRadius="SP6"
              gap="SP1"
              verticalAlign="middle"
              className="hero-chip"
            >
              <span>✅</span>
              <h4>רשימת משימות</h4>
            </Box>
          </Box>

          <Box direction="vertical" gap="SP2">
            <GoogleOAuthProvider clientId={CLIENT_ID}>
              <GoogleLogin
                onSuccess={(res) => props.handleLoginSuccess(res)}
                onError={() => alert("ההתחברות נכשלה")}
                theme="outline"
                size="large"
                shape="circle"
                width="250"
                locale="he"
              />
            </GoogleOAuthProvider>
          </Box>
        </Box>

        <Box
          className="hero-image"
          width="50%"
          direction="vertical"
          align="center"
        >
          <Image
            src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
            alt="תצוגה מקדימה"
          />
          <Box
            className="card-overlay"
            marginTop={"-40px"}
            width={"100%"}
            align="center"
            borderRadius="8px"
          >
            <h4 style={{ margin: "4px", color: "white" }}>
              💍 הצצה למערכת הניהול
            </h4>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Hero;
