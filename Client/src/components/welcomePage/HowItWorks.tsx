import React from "react";
import "../css/HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Log In & Get Started",
      description:
        "Access your dashboard by logging in to start managing your event seamlessly.",
    },
    {
      number: "02",
      title: "Add Your Guests",
      description:
        "Enter your guest list manually or upload an Excel file to quickly import all your guests.",
    },
    {
      number: "03",
      title: "Send Personalized Messages",
      description:
        "Send customized WhatsApp or SMS invitations to your guests. Choose to message all, only pending, or only approved guests.",
    },
    {
      number: "04",
      title: "Track Everything in Real-Time",
      description:
        "View guest responses and RSVP status live on your dashboard. No need to refresh — updates appear instantly.",
    },
  ];

  return (
    <div id="how-it-works" className="how-it-works">
      <div className="section-container">
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">How It Works</h2>
          <p className="how-it-works-description">
            Our simple 4-step process makes event planning a breeze
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 5L16 12L9 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
