import React from "react";
import { Box, Heading, Text, Badge, Cell, Layout } from "@wix/design-system";
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
      <Box padding="SP10" maxWidth="1280px" margin="0 auto">
        <Layout>
          <Cell span={6}>
            <Box direction="vertical" gap="SP4" align="right">
              <Badge size="small" skin="warningLight">
                <Box gap="SP1" verticalAlign="middle">
                  <Heart className="badge-icon" />
                  <Text size="small" weight="bold">
                    תכנון חתונה
                  </Text>
                </Box>
              </Badge>

              <Heading appearance="H1">
                החתונה שלכם, <span className="highlight">מסודרת</span>
              </Heading>

              <Text size="medium" secondary>
                אישורי הגעה, תקציב, משימות וספקים — הכל במקום אחד.
              </Text>

              <Box gap="SP2" verticalAlign="middle">
                <Box
                  padding="SP2 SP4"
                  backgroundColor="WHITE"
                  borderRadius="SP6"
                  gap="SP1"
                  verticalAlign="middle"
                >
                  <Text>💌</Text>
                  <Text size="small">וואטסאפ</Text>
                </Box>
                <Box
                  padding="SP2 SP4"
                  backgroundColor="WHITE"
                  borderRadius="SP6"
                  gap="SP1"
                  verticalAlign="middle"
                >
                  <Text>💰</Text>
                  <Text size="small">תקציב</Text>
                </Box>
                <Box
                  padding="SP2 SP4"
                  backgroundColor="WHITE"
                  borderRadius="SP6"
                  gap="SP1"
                  verticalAlign="middle"
                >
                  <Text>✅</Text>
                  <Text size="small">משימות</Text>
                </Box>
              </Box>

              <Box direction="vertical" gap="SP2" align="right">
                <GoogleOAuthProvider clientId={CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={(res) => props.handleLoginSuccess(res)}
                    onError={() => alert("ההתחברות נכשלה")}
                  />
                </GoogleOAuthProvider>
                <Text size="small" secondary>
                  חינם • תכננו יחד
                </Text>
              </Box>
            </Box>
          </Cell>

          <Cell span={6}>
            <div className="hero-image">
              <div className="image-container">
                <div className="image-glow" />
                <div className="glass-card">
                  <img
                    src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                    alt="תצוגה מקדימה"
                  />
                  <div className="card-overlay">
                    <Text light>💍 מתחילים לתכנן</Text>
                  </div>
                </div>
              </div>
            </div>
          </Cell>
        </Layout>
      </Box>
    </div>
  );
};

export default Hero;
