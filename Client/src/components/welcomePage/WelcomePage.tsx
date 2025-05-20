import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
type WelcomePageProps = {
  handleLoginSuccess: (user: any) => void;
};
const WelcomePage = (props: WelcomePageProps) => {
  return (
    <main className="flex-grow">
      <Hero handleLoginSuccess={props.handleLoginSuccess} />
      <Features />
      <HowItWorks />
    </main>
  );
};
export default WelcomePage;
