import React from "react";
import { MessageSquare, User, Share } from "lucide-react";
import "../css/Features.css";

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "WhatsApp Integration",
      description:
        "Send RSVP invitations directly through WhatsApp for higher response rates and engagement.",
    },
    {
      icon: <User className="feature-icon" />,
      title: "Guest Tracking",
      description:
        "Real-time dashboard that shows all RSVP responses with detailed analytics and insights.",
    },
    {
      icon: <Share className="feature-icon" />,
      title: "Export & Share",
      description:
        "Easily export your guest list and RSVP data to CSV or share it with your team for collaboration.",
    },
  ];

  return (
    <div id="features" className="features">
      <div className="section-container">
        <div className="features-header">
          <h2 className="features-title">Powerful Features</h2>
          <p className="features-description">
            Everything you need to create, send and track RSVPs for your events.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-container">{feature.icon}</div>
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
