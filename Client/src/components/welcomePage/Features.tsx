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
import { MessageSquare, Wallet, CheckSquare, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare size={28} />,
      title: "RSVP Management",
      description:
        "Import guests from Excel, send WhatsApp invitations, and track responses in real-time. Search, filter, and organize guests by groups.",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      shadowColor: "rgba(34, 197, 94, 0.3)",
      emoji: "📋",
    },
    {
      icon: <Wallet size={28} />,
      title: "Budget & Vendors",
      description:
        "Set and monitor your wedding budget by category. Track vendor payments, contracts, and get visual spending insights.",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadowColor: "rgba(245, 158, 11, 0.3)",
      emoji: "💰",
    },
    {
      icon: <CheckSquare size={28} />,
      title: "Task Management",
      description:
        "Pre-built wedding planning templates to get you started. Create custom tasks with due dates and track progress visually.",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      shadowColor: "rgba(139, 92, 246, 0.3)",
      emoji: "✅",
    },
    {
      icon: <Heart size={28} />,
      title: "Couple's Dashboard",
      description:
        "Wedding countdown timer, partner collaboration features, and a centralized hub to plan your special day together.",
      gradient: "linear-gradient(135deg, #f43f5e, #e11d48)",
      shadowColor: "rgba(244, 63, 94, 0.3)",
      emoji: "👫",
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
              ✨ Everything You Need
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
              All-in-One Wedding Planning
            </Title>
            <Text
              size="lg"
              style={{ color: "#9f1239", opacity: 0.7, lineHeight: 1.7 }}
            >
              From RSVPs to budgets, tasks to collaboration — manage every aspect of your wedding in one beautiful platform
            </Text>
          </Box>

          {/* Features Grid */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing={24}
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
                      size={64}
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
                        fontSize: "1.25rem",
                      }}
                    >
                      {feature.emoji}
                    </Box>
                  </Box>
                  <Title
                    order={3}
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "#831843",
                    }}
                  >
                    {feature.title}
                  </Title>
                  <Text size="sm" style={{ color: "#9f1239", opacity: 0.8, lineHeight: 1.7 }}>
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
