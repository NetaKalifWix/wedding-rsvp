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
      gradient: "linear-gradient(135deg, #25d366, #128c7e)",
    },
    {
      icon: <User size={28} />,
      title: "Guest Tracking",
      description:
        "Real-time dashboard that shows all RSVP responses with detailed analytics and insights.",
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    },
    {
      icon: <Share size={28} />,
      title: "Export & Share",
      description:
        "Easily export your guest list and RSVP data to CSV or share it with your team for collaboration.",
      gradient: "linear-gradient(135deg, #e94560, #f093fb)",
    },
  ];

  return (
    <Box
      id="features"
      style={{
        background: "#fafbfc",
        padding: "100px 0",
        position: "relative",
      }}
    >
      {/* Subtle pattern overlay */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
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
              Features
            </Text>
            <Title
              order={2}
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: "16px",
              }}
            >
              Powerful Features
            </Title>
            <Text
              size="lg"
              c="dimmed"
              style={{ lineHeight: 1.7 }}
            >
              Everything you need to create, send and track RSVPs for your events.
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
                radius="lg"
                style={{
                  background: "white",
                  border: "1px solid #eef0f2",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                  animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                className="feature-card"
              >
                <Stack gap="lg" align="center" ta="center">
                  <ThemeIcon
                    size={64}
                    radius="xl"
                    style={{
                      background: feature.gradient,
                      boxShadow: `0 8px 24px ${feature.gradient.includes("#25d366") ? "rgba(37,211,102,0.3)" : feature.gradient.includes("#4facfe") ? "rgba(79,172,254,0.3)" : "rgba(233,69,96,0.3)"}`,
                    }}
                  >
                    {feature.icon}
                  </ThemeIcon>
                  <Title
                    order={3}
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    {feature.title}
                  </Title>
                  <Text c="dimmed" size="md" style={{ lineHeight: 1.7 }}>
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
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: transparent;
        }
      `}</style>
    </Box>
  );
};

export default Features;
