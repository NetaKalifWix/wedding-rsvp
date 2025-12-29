import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  ThemeIcon,
  Stack,
} from "@mantine/core";
import { MessageSquare, User, Share } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare size={28} />,
      title: "WhatsApp Integration",
      description:
        "Send RSVP invitations directly through WhatsApp for higher response rates and engagement.",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      shadowColor: "rgba(34, 197, 94, 0.3)",
      emoji: "💬",
    },
    {
      icon: <User size={28} />,
      title: "Guest Tracking",
      description:
        "Real-time dashboard that shows all RSVP responses with detailed analytics and insights.",
      gradient: "linear-gradient(135deg, #f43f5e, #e11d48)",
      shadowColor: "rgba(244, 63, 94, 0.3)",
      emoji: "👥",
    },
    {
      icon: <Share size={28} />,
      title: "Export & Share",
      description:
        "Easily export your guest list and RSVP data to CSV or share it with your team for collaboration.",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadowColor: "rgba(245, 158, 11, 0.3)",
      emoji: "📤",
    },
  ];

  return (
    <Box
      id="features"
      style={{
        background: "white",
        padding: "100px 0",
        position: "relative",
      }}
    >
      {/* Decorative wave at top */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(135deg, #fff5f5 0%, #fef3e2 50%, #fdf2f8 100%)",
          clipPath: "ellipse(70% 100% at 50% 0%)",
        }}
      />

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
              ✨ Features
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
              Everything You Need
            </Title>
            <Text
              size="lg"
              style={{ color: "#9f1239", opacity: 0.7, lineHeight: 1.7 }}
            >
              Powerful tools to create, send and track RSVPs for your special day
            </Text>
          </Box>

          {/* Features Grid */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing={32}
            style={{ width: "100%" }}
          >
            {features.map((feature, index) => (
              <Paper
                key={index}
                p="xl"
                radius="xl"
                style={{
                  background: "linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%)",
                  border: "2px solid #fecdd3",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                  animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                className="feature-card"
              >
                <Stack gap="lg" align="center" ta="center">
                  <Box style={{ position: "relative" }}>
                    <ThemeIcon
                      size={72}
                      radius="xl"
                      style={{
                        background: feature.gradient,
                        boxShadow: `0 12px 28px ${feature.shadowColor}`,
                      }}
                    >
                      {feature.icon}
                    </ThemeIcon>
                    <Box
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        fontSize: "1.5rem",
                      }}
                    >
                      {feature.emoji}
                    </Box>
                  </Box>
                  <Title
                    order={3}
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#831843",
                    }}
                  >
                    {feature.title}
                  </Title>
                  <Text style={{ color: "#9f1239", opacity: 0.8, lineHeight: 1.7 }}>
                    {feature.description}
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
        
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 48px rgba(244, 63, 94, 0.15);
          border-color: #fb7185;
        }
      `}</style>
    </Box>
  );
};

export default Features;
