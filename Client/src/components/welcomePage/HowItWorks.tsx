import React from "react";
import { Box, Card, Heading, Text } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import "./css/HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "התחברו",
      description: "כניסה מהירה עם גוגל.",
    },
    {
      number: "02",
      title: "הוסיפו אורחים",
      description: "ייבוא מאקסל או הוספה ידנית.",
    },
    {
      number: "03",
      title: "שלחו הזמנות",
      description: "וואטסאפ עם מעקב אוטומטי.",
    },
    {
      number: "04",
      title: "חוגגים!",
      description: "תהנו מהיום המושלם.",
    },
  ];

  return (
    <Box className="how-it-works" direction="vertical" align="center" dir="rtl">
      <Box className="section-container" direction="vertical" align="center">
        <Box
          className="how-it-works-header"
          direction="vertical"
          align="center"
          marginBottom="SP6"
        >
          <Heading appearance="H2" className="how-it-works-title">
            איך זה עובד?
          </Heading>
          <Text className="how-it-works-description" secondary>
            4 צעדים פשוטים לחתונה מאורגנת.
          </Text>
        </Box>

        <Box className="steps-grid" gap="SP4">
          {steps.map((step, index) => (
            <Card key={index} className="step-card">
              <Card.Content>
                <Box
                  direction="vertical"
                  align="center"
                  gap="SP2"
                  padding="SP4"
                >
                  <Text className="step-number" weight="bold">
                    {step.number}
                  </Text>
                  <Heading appearance="H4" className="step-title">
                    {step.title}
                  </Heading>
                  <Text className="step-description" secondary size="small">
                    {step.description}
                  </Text>
                </Box>
              </Card.Content>
              {index < steps.length - 1 && (
                <Box className="step-connector">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    className="connector-heart"
                  >
                    <path
                      d="M20 35C20 35 5 25 5 15C5 10 9 5 15 5C18 5 20 7 20 7C20 7 22 5 25 5C31 5 35 10 35 15C35 25 20 35 20 35Z"
                      fill="currentColor"
                    />
                  </svg>
                </Box>
              )}
            </Card>
          ))}
        </Box>

        <Card className="cta-container">
          <Card.Content>
            <Box direction="vertical" align="center" gap="SP1" padding="SP5">
              <Heading appearance="H3" className="cta-text">
                מוכנים להתחיל?
              </Heading>
              <Text className="cta-subtext" secondary>
                הצטרפו לזוגות שכבר מתכננים איתנו 💕
              </Text>
            </Box>
          </Card.Content>
        </Card>
      </Box>
    </Box>
  );
};

export default HowItWorks;
