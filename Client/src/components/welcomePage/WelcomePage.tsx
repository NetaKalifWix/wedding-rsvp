import React from "react";
import { Box } from "@mantine/core";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import { useAuth } from "../../hooks/useAuth";

const WelcomePage = () => {
  const { handleLoginSuccess } = useAuth();

  return (
    <Box component="main" style={{ flexGrow: 1 }}>
      <Hero handleLoginSuccess={handleLoginSuccess} />
      <Features />
      <HowItWorks />
    </Box>
  );
};

export default WelcomePage;
