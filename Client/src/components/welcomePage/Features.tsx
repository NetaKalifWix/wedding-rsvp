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
import classes from "./css/Features.module.css";

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
    <Box id="features" className={classes.features}>
      <Box className={classes.waveTop} />

      <Container size="xl" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap={60}>
          {/* Header */}
          <Box ta="center" maw={600}>
            <Text size="lg" fw={600} c="#f43f5e" mb="xs">
              ✨ Everything You Need
            </Text>
            <Title order={2} c="#831843" mb="md" className={classes.sectionTitle}>
              All-in-One Wedding Planning
            </Title>
            <Text size="lg" c="#9f1239" opacity={0.7} lh={1.7}>
              From RSVPs to budgets, tasks to collaboration — manage every
              aspect of your wedding in one beautiful platform
            </Text>
          </Box>

          {/* Features Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={24} w="100%">
            {features.map((feature, index) => (
              <Paper
                key={index}
                p="xl"
                radius="xl"
                className={classes.featureCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Stack gap="lg" align="center" ta="center">
                  <Box pos="relative">
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
                    <Box className={classes.emoji}>{feature.emoji}</Box>
                  </Box>
                  <Title order={3} fz="1.15rem" fw={600} c="#831843">
                    {feature.title}
                  </Title>
                  <Text size="sm" c="#9f1239" opacity={0.8} lh={1.7}>
                    {feature.description}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Features;
