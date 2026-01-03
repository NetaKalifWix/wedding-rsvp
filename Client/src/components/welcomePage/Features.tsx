import React from "react";
import { Box, Card } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { MessageSquare, Wallet, CheckSquare, Heart } from "lucide-react";
import "./css/Features.css";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "הזמנות חכמות",
      description:
        "שלחו הזמנות בוואטסאפ וקבלו אישורי הגעה ישירות למערכת. בלי להתקשר לכל אורח.",
      color: "peach",
    },
    {
      icon: <Wallet className="feature-icon" />,
      title: "שליטה מלאה בתקציב",
      description:
        "עקבו אחרי כל שקל. תשלומים לספקים, מקדמות ויתרות — הכל ברור ומסודר.",
      color: "gold",
    },
    {
      icon: <CheckSquare className="feature-icon" />,
      title: "לא שוכחים כלום",
      description:
        "רשימת משימות מובנית לפי ציר זמן. תדעו בדיוק מה צריך לעשות ומתי.",
      color: "sage",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "תכנון משותף",
      description:
        "הזמינו את בן/ת הזוג לנהל יחד. שניכם רואים הכל בזמן אמת, מכל מקום.",
      color: "lavender",
    },
  ];

  return (
    <div id="features" className="features" dir="rtl">
      <Box className="section-container" direction="vertical" align="center">
        <Box
          className="features-header"
          direction="vertical"
          align="center"
          marginBottom="SP6"
        >
          <h2 className="features-title">למה זוגות בוחרים בנו?</h2>
          <span className="features-description">
            כל הכלים שצריך כדי להפוך את החתונה שלכם למושלמת — במקום אחד, בלי כאב
            ראש.
          </span>
        </Box>

        <Box className="features-grid" gap="SP4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card feature-card-${feature.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card>
                <Card.Content>
                  <Box direction="vertical" align="center" gap="SP2">
                    <Box
                      className={`feature-icon-${feature.color}`}
                      verticalAlign="middle"
                      align="center"
                      marginBottom="SP4"
                      padding="SP4"
                      borderRadius="16px"
                    >
                      {feature.icon}
                    </Box>
                    <h4 className="feature-title">{feature.title}</h4>
                    <span className="feature-description">
                      {feature.description}
                    </span>
                  </Box>
                </Card.Content>
              </Card>
            </div>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default Features;
