import React from "react";
import "./css/HowItWorks.css";
import { LogIn, UserPlus, Send, PartyPopper } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <LogIn className="step-icon" />,
      title: "התחברו",
      description: "כניסה מהירה עם גוגל.",
    },
    {
      number: "02",
      icon: <UserPlus className="step-icon" />,
      title: "הוסיפו אורחים",
      description: "ייבוא מאקסל או הוספה ידנית.",
    },
    {
      number: "03",
      icon: <Send className="step-icon" />,
      title: "שלחו הזמנות",
      description: "וואטסאפ עם מעקב אוטומטי.",
    },
    {
      number: "04",
      icon: <PartyPopper className="step-icon" />,
      title: "חוגגים!",
      description: "תהנו מהיום המושלם.",
    },
  ];

  return (
    <div id="how-it-works" className="how-it-works" dir="rtl">
      <div className="section-container">
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">
            איך זה עובד?
          </h2>
          <p className="how-it-works-description">
            4 צעדים פשוטים לחתונה מאורגנת.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="step-number-container">
                <span className="step-number">{step.number}</span>
                <div className="step-icon-wrapper">{step.icon}</div>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
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
            </div>
          ))}
        </div>

        <div className="cta-container">
          <p className="cta-text">מוכנים להתחיל?</p>
          <p className="cta-subtext">
            הצטרפו לזוגות שכבר מתכננים איתנו 💕
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
