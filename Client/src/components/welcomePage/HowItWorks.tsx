import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Stack,
} from "@mantine/core";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Sign In & Set Up",
      description:
        "Log in with Google and set your wedding date. Invite your partner to collaborate together.",
      color: "#f43f5e",
      bgColor: "#fef2f2",
      emoji: "🔐",
    },
    {
      number: "2",
      title: "Import Your Guests",
      description:
        "Add guests manually or upload an Excel spreadsheet. Organize them into groups for easy messaging.",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      emoji: "📥",
    },
    {
      number: "3",
      title: "Send Invitations",
      description:
        "Send personalized WhatsApp invitations with one click. Automated reminders and thank-you messages included.",
      color: "#22c55e",
      bgColor: "#f0fdf4",
      emoji: "💌",
    },
    {
      number: "4",
      title: "Plan & Track",
      description:
        "Manage your budget, track vendor payments, complete tasks, and watch your RSVPs come in real-time!",
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      emoji: "🎉",
    },
  ];

  return (
    <Box
      id="how-it-works"
      style={{
        background: "linear-gradient(180deg, #fdf2f8 0%, #fef3e2 50%, #fff5f5 100%)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box
        style={{
          position: "absolute",
          top: "5%",
          right: "5%",
          fontSize: "4rem",
          opacity: 0.1,
          transform: "rotate(15deg)",
        }}
      >
        💍
      </Box>
      <Box
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          fontSize: "3rem",
          opacity: 0.1,
          transform: "rotate(-10deg)",
        }}
      >
        🎊
      </Box>

      <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
        <Stack align="center" gap={60}>
          {/* Header */}
          <Box ta="center" maw={600}>
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#f43f5e",
                marginBottom: "12px",
              }}
            >
              🎯 Getting Started
            </Text>
            <Title
              order={2}
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 700,
                color: "#831843",
                marginBottom: "16px",
              }}
            >
              How It Works
            </Title>
            <Text
              size="lg"
              style={{ color: "#9f1239", opacity: 0.7, lineHeight: 1.7 }}
            >
              Four simple steps to stress-free wedding planning 🌸
            </Text>
          </Box>

          {/* Steps Grid */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing={24}
            style={{ width: "100%" }}
          >
            {steps.map((step, index) => (
              <Paper
                key={index}
                p="xl"
                radius="xl"
                style={{
                  background: "white",
                  border: `2px solid ${step.color}30`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                  position: "relative",
                  animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                className="step-card"
              >
                {/* Connector arrow for desktop */}
                {index < steps.length - 1 && (
                  <Box
                    className="step-connector"
                    style={{
                      position: "absolute",
                      right: "-20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "1.5rem",
                      display: "none",
                      zIndex: 10,
                    }}
                  >
                    →
                  </Box>
                )}

                <Stack gap="md" align="center" ta="center">
                  <Box
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: step.bgColor,
                      border: `3px solid ${step.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: step.color,
                      position: "relative",
                    }}
                  >
                    {step.number}
                    <Box
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        fontSize: "1.25rem",
                      }}
                    >
                      {step.emoji}
                    </Box>
                  </Box>
                  <Title
                    order={3}
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "#831843",
                    }}
                  >
                    {step.title}
                  </Title>
                  <Text
                    size="sm"
                    style={{ color: "#9f1239", opacity: 0.75, lineHeight: 1.7 }}
                  >
                    {step.description}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
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
        
        .step-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(244, 63, 94, 0.12);
        }
        
        @media (min-width: 1200px) {
          .step-connector {
            display: block !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default HowItWorks;
