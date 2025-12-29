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
      title: "וואטסאפ",
      description: "הזמנות ותזכורות ישירות לאורחים.",
      color: "rose",
    },
    {
      icon: <Users className="feature-icon" />,
      title: "ניהול אורחים",
      description: "ייבוא מאקסל ומעקב בזמן אמת.",
      color: "peach",
    },
    {
      icon: <Wallet className="feature-icon" />,
      title: "תקציב",
      description: "מעקב הוצאות ותשלומים לספקים.",
      color: "gold",
    },
    {
      icon: <CheckSquare className="feature-icon" />,
      title: "משימות",
      description: "רשימות מוכנות ומעקב התקדמות.",
      color: "sage",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "לוח בקרה",
      description: "ספירה לאחור ושיתוף עם בן/ת הזוג.",
      color: "lavender",
    },
    {
      icon: <Timer className="feature-icon" />,
      title: "זמן אמת",
      description: "עדכונים מיידיים על אישורי הגעה.",
      color: "coral",
    },
    {
      icon: <FileSpreadsheet className="feature-icon" />,
      title: "אקסל",
      description: "ייבוא וייצוא קל של רשימות.",
      color: "mint",
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "מאובטח",
      description: "התחברות בטוחה עם גוגל.",
      color: "blush",
    },
  ];

  return (
    <div id="features" className="features" dir="rtl">
      <div className="section-container">
        <div className="features-header">
          <h2 className="features-title">
            הכל במקום אחד
          </h2>
          <p className="features-description">
            כל הכלים שצריך לתכנון החתונה המושלמת.
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
