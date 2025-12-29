import React from "react";
import { Box, Card, Heading, Text } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { MessageSquare, Wallet, CheckSquare, Heart } from "lucide-react";
import "./css/Features.css";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "אישור הגעה",
      description: "הזמנות ותזכורות ישירות לאורחים.",
      color: "peach",
    },
    {
      icon: <Wallet className="feature-icon" />,
      title: "ניהול תקציב",
      description: "מעקב הוצאות ותשלומים לספקים.",
      color: "gold",
    },
    {
      icon: <CheckSquare className="feature-icon" />,
      title: "מעקב משימות",
      description: "רשימות מוכנות ומעקב התקדמות.",
      color: "sage",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "לוח בקרה",
      description: "ספירה לאחור ושיתוף עם בן/ת הזוג.",
      color: "lavender",
    },
  ];

  return (
    <Box
      id="features"
      className="features"
      direction="vertical"
      align="center"
      dir="rtl"
    >
      <Box className="section-container" direction="vertical" align="center">
        <Box
          className="features-header"
          direction="vertical"
          align="center"
          marginBottom="SP6"
        >
          <Heading appearance="H2" className="features-title">
            הכל במקום אחד
          </Heading>
          <Text className="features-description" secondary>
            כל הכלים שצריך לתכנון החתונה המושלמת.
          </Text>
        </Box>

        <Box className="features-grid" gap="SP4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`feature-card feature-card-${feature.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card.Content>
                <Box
                  direction="vertical"
                  align="center"
                  gap="SP3"
                  padding="SP4"
                >
                  <Box
                    className={`feature-icon-container feature-icon-${feature.color}`}
                  >
                    {feature.icon}
                  </Box>
                  <Heading appearance="H4" className="feature-title">
                    {feature.title}
                  </Heading>
                  <Text className="feature-description" secondary size="small">
                    {feature.description}
                  </Text>
                </Box>
              </Card.Content>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Features;
