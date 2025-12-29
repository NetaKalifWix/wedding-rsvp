import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Stack,
  Badge,
} from "@mantine/core";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Log In & Get Started",
      description:
        "Access your dashboard by logging in to start managing your event seamlessly.",
      color: "#4facfe",
    },
    {
      number: "02",
      title: "Add Your Guests",
      description:
        "Enter your guest list manually or upload an Excel file to quickly import all your guests.",
      color: "#00f2fe",
    },
    {
      number: "03",
      title: "Send Personalized Messages",
      description:
        "Send customized WhatsApp or SMS invitations to your guests. Choose to message all, only pending, or only approved guests.",
      color: "#e94560",
    },
    {
      number: "04",
      title: "Track Everything in Real-Time",
      description:
        "View guest responses and RSVP status live on your dashboard. No need to refresh — updates appear instantly.",
      color: "#f093fb",
    },
  ];

  return (
    <Box
      id="how-it-works"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box
        style={{
          position: "absolute",
          top: "10%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(79,172,254,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
        <Stack align="center" gap={60}>
          {/* Header */}
          <Box ta="center" maw={600}>
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
              Getting Started
            </Text>
            <Title
              order={2}
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 700,
                color: "white",
                marginBottom: "16px",
              }}
            >
              How It Works
            </Title>
            <Text
              size="lg"
              style={{ color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7 }}
            >
              Our simple 4-step process makes event planning a breeze
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
                radius="lg"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                  position: "relative",
                  animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                className="step-card"
              >
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <Box
                    className="step-connector"
                    style={{
                      position: "absolute",
                      right: "-12px",
                      top: "50%",
                      width: "24px",
                      height: "2px",
                      background: `linear-gradient(90deg, ${step.color}, ${steps[index + 1].color})`,
                      transform: "translateY(-50%)",
                      display: "none",
                    }}
                  />
                )}

                <Stack gap="md">
                  <Badge
                    size="xl"
                    radius="md"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      color: step.color,
                      border: `1px solid ${step.color}40`,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      padding: "8px 16px",
                      alignSelf: "flex-start",
                    }}
                  >
                    {step.number}
                  </Badge>
                  <Title
                    order={3}
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {step.title}
                  </Title>
                  <Text
                    size="sm"
                    style={{ color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.7 }}
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
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-4px);
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
