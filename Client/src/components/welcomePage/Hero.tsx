import React from "react";
import {
  Container,
  Title,
  Text,
  Box,
  Image,
  Paper,
  Group,
  Stack,
} from "@mantine/core";
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
    <Box
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white",
        padding: "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box
        style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(233,69,96,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(79,172,254,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
        <Group
          align="center"
          justify="space-between"
          gap={48}
          style={{
            flexDirection: "column",
          }}
          className="hero-group"
        >
          {/* Text Content */}
          <Stack
            gap="xl"
            style={{
              flex: 1,
              maxWidth: "560px",
              animation: "fadeSlideUp 0.8s ease-out",
            }}
          >
            <Box>
              <Text
                size="sm"
                fw={600}
                tt="uppercase"
                style={{
                  letterSpacing: "3px",
                  color: "#e94560",
                  marginBottom: "12px",
                }}
              >
                Wedding Planning Made Simple
              </Text>
              <Title
                order={1}
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                }}
              >
                Modern RSVP System with{" "}
                <Text
                  component="span"
                  style={{
                    background: "linear-gradient(135deg, #e94560, #4facfe)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  WhatsApp Integration
                </Text>
              </Title>
              <Text
                size="xl"
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  lineHeight: 1.7,
                  maxWidth: "480px",
                }}
              >
                Send invitations via WhatsApp and track all responses in a
                beautiful dashboard. Simplify your event planning with RSVP Hub.
              </Text>
            </Box>

            <Box mt="md">
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => props.handleLoginSuccess(res)}
                  onError={() => alert("Login Failed")}
                />
              </GoogleOAuthProvider>
            </Box>
          </Stack>

          {/* Image Section */}
          <Box
            style={{
              flex: 1,
              maxWidth: "560px",
              position: "relative",
              animation: "fadeSlideUp 0.8s ease-out 0.2s both",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: "-4px",
                background: "linear-gradient(135deg, #e94560, #4facfe)",
                borderRadius: "16px",
                filter: "blur(20px)",
                opacity: 0.4,
              }}
            />
            <Paper
              shadow="xl"
              radius="md"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Image
                src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                alt="RSVP Dashboard Preview"
                style={{ width: "100%", display: "block" }}
              />
              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                  padding: "32px 24px 24px",
                }}
              >
                <Text fw={500} c="white" size="sm">
                  Track all your RSVPs in real-time
                </Text>
              </Box>
            </Paper>
          </Box>
        </Group>
      </Container>

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (min-width: 1024px) {
          .hero-group {
            flex-direction: row !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default Hero;
