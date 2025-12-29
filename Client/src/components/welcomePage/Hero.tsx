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
        background: "linear-gradient(135deg, #fff5f5 0%, #fef3e2 50%, #fdf2f8 100%)",
        padding: "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative floating shapes */}
      <Box
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "120px",
          height: "120px",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          borderRadius: "50%",
          opacity: 0.15,
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <Box
        style={{
          position: "absolute",
          top: "60%",
          left: "3%",
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #fb7185, #f43f5e)",
          borderRadius: "50%",
          opacity: 0.12,
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #c084fc, #a855f7)",
          borderRadius: "50%",
          opacity: 0.12,
          animation: "float 7s ease-in-out infinite",
        }}
      />
      {/* Heart decorations */}
      <Box
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          fontSize: "2rem",
          opacity: 0.15,
          animation: "float 5s ease-in-out infinite",
        }}
      >
        💕
      </Box>
      <Box
        style={{
          position: "absolute",
          bottom: "30%",
          right: "8%",
          fontSize: "1.5rem",
          opacity: 0.12,
          animation: "float 6s ease-in-out infinite reverse",
        }}
      >
        ✨
      </Box>

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
                  color: "#f43f5e",
                  marginBottom: "12px",
                }}
              >
                💒 Wedding Planning Made Simple
              </Text>
              <Title
                order={1}
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                  color: "#831843",
                }}
              >
                Modern RSVP System with{" "}
                <Text
                  component="span"
                  style={{
                    background: "linear-gradient(135deg, #f43f5e, #fb923c)",
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
                  color: "#9f1239",
                  opacity: 0.8,
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
                background: "linear-gradient(135deg, #fb7185, #fbbf24)",
                borderRadius: "20px",
                filter: "blur(24px)",
                opacity: 0.35,
              }}
            />
            <Paper
              shadow="xl"
              radius="lg"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "white",
                border: "3px solid rgba(251, 113, 133, 0.2)",
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
                  background: "linear-gradient(to top, rgba(251, 113, 133, 0.95), transparent)",
                  padding: "40px 24px 24px",
                }}
              >
                <Text fw={600} c="white" size="sm">
                  ✨ Track all your RSVPs in real-time
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
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
