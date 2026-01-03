import React from "react";
import { Box } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import "./css/HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "נרשמים ומגדירים",
      description: "התחברות מהירה עם גוגל, הזנת פרטי החתונה והגדרת התקציב.",
    },
    {
      number: "02",
      title: "מנהלים את האורחים",
      description:
        "העלאת רשימה מאקסל, שליחת הזמנות בוואטסאפ וקבלת אישורים אוטומטית.",
    },
    {
      number: "03",
      title: "עוקבים אחרי הכל",
      description: "ניהול משימות לפי ציר זמן, מעקב תקציב ותשלומים לספקים.",
    },
    {
      number: "04",
      title: "מגיעים מוכנים",
      description:
        "ביום החתונה אתם יודעים בדיוק כמה אורחים, מה התקציב ומה הסטטוס.",
    },
  ];

  return (
    <div id="how-it-works" className="how-it-works" dir="rtl">
      <Box className="section-container" direction="vertical" align="center">
        <Box direction="vertical" align="center" marginBottom="SP6">
          <h2 className="how-it-works-title">איך מתחילים?</h2>
          <span className="how-it-works-description">
            מההרשמה ועד ליום הגדול — כל התכנון במקום אחד.
          </span>
        </Box>

        <Box className="steps-grid" gap="SP4">
          {steps.map((step, index) => (
            <Box
              key={index}
              className="step-card"
              direction="vertical"
              align="center"
              gap="SP2"
              padding="SP6"
              borderRadius="24px"
              backgroundColor="WHITE"
            >
              <span className="step-number">{step.number}</span>
              <h3 className="step-title">{step.title}</h3>
              <span className="step-description">{step.description}</span>
              {index < steps.length - 1 && (
                <div className="step-connector">
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
                </div>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default HowItWorks;
