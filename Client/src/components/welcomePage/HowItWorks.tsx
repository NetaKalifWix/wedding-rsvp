import React from "react";
import "./css/HowItWorks.css";
import { LogIn, UserPlus, Send, PartyPopper } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <LogIn className="step-icon" />,
      title: "Sign In Together",
      description:
        "Create your wedding planning space in seconds with Google login. Invite your partner to collaborate!",
    },
    {
      number: "02",
      icon: <UserPlus className="step-icon" />,
      title: "Add Your Guests",
      description:
        "Import your guest list from Excel or add them one by one. Organize into groups like family, friends, and colleagues.",
    },
    {
      number: "03",
      icon: <Send className="step-icon" />,
      title: "Send & Track",
      description:
        "Send personalized WhatsApp invitations and watch the RSVPs roll in on your real-time dashboard.",
    },
    {
      number: "04",
      icon: <PartyPopper className="step-icon" />,
      title: "Celebrate!",
      description:
        "Manage your budget, complete tasks, coordinate vendors, and enjoy your perfectly planned special day!",
    },
  ];

  return (
    <div id="how-it-works" className="how-it-works">
      <div className="section-container">
        <div className="how-it-works-header">
          <span className="how-it-works-eyebrow">Simple & Delightful</span>
          <h2 className="how-it-works-title">
            Your Journey to <span className="title-highlight">"I Do"</span>
          </h2>
          <p className="how-it-works-description">
            Four simple steps from "we're engaged!" to "I do!" — we make wedding
            planning feel like a joy, not a chore.
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
          <p className="cta-text">
            Ready to start planning the happiest day of your life?
          </p>
          <p className="cta-subtext">
            Join thousands of happy couples who made their dream wedding a
            reality 💕
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
