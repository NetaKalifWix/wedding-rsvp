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
import classes from "./css/Hero.module.css";

type HeroProps = {
  handleLoginSuccess: (user: any) => void;
};

const Hero = (props: HeroProps) => {
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  return (
    <Box className={classes.hero}>
      {/* Decorative floating shapes */}
      <Box className={`${classes.floatingShape} ${classes.shape1}`} />
      <Box className={`${classes.floatingShape} ${classes.shape2}`} />
      <Box className={`${classes.floatingShape} ${classes.shape3}`} />
      <Box className={classes.heartDecor}>💕</Box>
      <Box className={classes.sparkleDecor}>✨</Box>

      <Container size="xl" pos="relative" style={{ zIndex: 1 }}>
        <Group
          align="center"
          justify="space-between"
          gap={48}
          className={classes.heroGroup}
        >
          {/* Text Content */}
          <Stack gap="xl" className={classes.heroText}>
            <Box>
              <Text
                size="sm"
                fw={600}
                tt="uppercase"
                lts={3}
                c="#f43f5e"
                mb="xs"
              >
                💍 Your Complete Wedding Planning Hub
              </Text>
              <Title
                order={1}
                c="#831843"
                mb="md"
                className={classes.heroTitle}
              >
                Plan Your Perfect Day{" "}
                <Text component="span" className={classes.gradientText}>
                  Together
                </Text>
              </Title>
              <Text size="xl" c="#9f1239" opacity={0.8} lh={1.7} maw={480}>
                From guest RSVPs and WhatsApp invitations to budget tracking and
                task management — everything you need to organize your special
                day in one place.
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
          <Box className={classes.imageSection}>
            <Box className={classes.imageGlow} />
            <Paper shadow="xl" radius="lg" className={classes.imageCard}>
              <Image
                src="https://i.ibb.co/JRzm8DW0/Screenshot-2025-05-20-at-15-24-20.png"
                alt="Wedding Planning Dashboard Preview"
                w="100%"
              />
              <Box className={classes.imageOverlay}>
                <Text fw={600} c="white" size="sm">
                  ✨ Your centralized wedding planning dashboard
                </Text>
              </Box>
            </Paper>
          </Box>
        </Group>
      </Container>
    </Box>
  );
};

export default Hero;
