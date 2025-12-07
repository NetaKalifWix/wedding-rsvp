import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import { useAuth } from "../../hooks/useAuth";

const WelcomePage = (props: {}) => {
  const { handleLoginSuccess } = useAuth();
  return (
    <main className="flex-grow">
      <Hero handleLoginSuccess={handleLoginSuccess} />
      <Features />
      <HowItWorks />
    </main>
  );
};
export default WelcomePage;
