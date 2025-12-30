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
import classes from "./css/HowItWorks.module.css";

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
    <Box id="how-it-works" className={classes.howItWorks}>
      <Box className={classes.ringDecor}>💍</Box>
      <Box className={classes.confettiDecor}>🎊</Box>

      <Container size="xl" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap={60}>
          {/* Header */}
          <Box ta="center" maw={600}>
            <Text size="lg" fw={600} c="#f43f5e" mb="xs">
              🎯 Getting Started
            </Text>
            <Title order={2} c="#831843" mb="md" className={classes.sectionTitle}>
              How It Works
            </Title>
            <Text size="lg" c="#9f1239" opacity={0.7} lh={1.7}>
              Four simple steps to stress-free wedding planning 🌸
            </Text>
          </Box>

          {/* Steps Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={24} w="100%">
            {steps.map((step, index) => (
              <Paper
                key={index}
                p="xl"
                radius="xl"
                className={classes.stepCard}
                style={{
                  borderColor: `${step.color}30`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {index < steps.length - 1 && (
                  <Box className={classes.stepConnector}>→</Box>
                )}

                <Stack gap="md" align="center" ta="center">
                  <Box
                    className={classes.stepNumber}
                    style={{
                      background: step.bgColor,
                      borderColor: step.color,
                      color: step.color,
                    }}
                  >
                    {step.number}
                    <Box className={classes.stepEmoji}>{step.emoji}</Box>
                  </Box>
                  <Title order={3} fz="1.1rem" fw={600} c="#831843">
                    {step.title}
                  </Title>
                  <Text size="sm" c="#9f1239" opacity={0.75} lh={1.7}>
                    {step.description}
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

export default HowItWorks;
