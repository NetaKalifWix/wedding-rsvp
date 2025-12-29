import React from "react";
import {
  MessageSquare,
  Users,
  Wallet,
  CheckSquare,
  Heart,
  Timer,
  FileSpreadsheet,
  Shield,
} from "lucide-react";
import "./css/Features.css";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "WhatsApp Integration",
      description:
        "Send beautiful invitations, reminders, and thank-you notes directly through WhatsApp for higher engagement.",
      color: "rose",
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Guest Management",
      description:
        "Import guest lists from Excel, track responses in real-time, and organize by groups with powerful search and filters.",
      color: "peach",
    },
    {
      icon: <Wallet className="feature-icon" />,
      title: "Budget Tracking",
      description:
        "Set and monitor your wedding budget by category. Track vendor payments and get visual spending insights.",
      color: "gold",
    },
    {
      icon: <CheckSquare className="feature-icon" />,
      title: "Task Management",
      description:
        "Pre-built wedding planning templates, custom tasks with due dates, and visual progress tracking.",
      color: "sage",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "Couple's Dashboard",
      description:
        "Wedding countdown timer, partner collaboration features, and a centralized planning hub for both of you.",
      color: "lavender",
    },
    {
      icon: <Timer className="feature-icon" />,
      title: "Real-Time Updates",
      description:
        "See guest responses and RSVP status instantly on your dashboard. No refresh needed!",
      color: "coral",
    },
    {
      icon: <FileSpreadsheet className="feature-icon" />,
      title: "Excel Import/Export",
      description:
        "Easily import your existing guest list or export data anytime for backups and sharing.",
      color: "mint",
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "Secure Login",
      description:
        "Sign in safely with Google OAuth. Your wedding details are protected and private.",
      color: "blush",
    },
  ];

  return (
    <div id="features" className="features">
      <div className="section-container">
        <div className="features-header">
          <span className="features-eyebrow">Everything You Need</span>
          <h2 className="features-title">
            Plan Your Wedding with{" "}
            <span className="title-highlight">Love & Ease</span>
          </h2>
          <p className="features-description">
            From the first invitation to the final thank-you, we've got every
            detail covered so you can focus on what matters most — celebrating
            your love.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card feature-card-${feature.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`feature-icon-container feature-icon-${feature.color}`}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
