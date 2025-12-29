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
      title: "שילוב וואטסאפ",
      description:
        "שלחו הזמנות יפות, תזכורות והודעות תודה ישירות דרך וואטסאפ למעורבות גבוהה יותר.",
      color: "rose",
    },
    {
      icon: <Users className="feature-icon" />,
      title: "ניהול אורחים",
      description:
        "ייבאו רשימות אורחים מאקסל, עקבו אחרי תגובות בזמן אמת, וסדרו לפי קבוצות עם חיפוש וסינון מתקדמים.",
      color: "peach",
    },
    {
      icon: <Wallet className="feature-icon" />,
      title: "מעקב תקציב",
      description:
        "הגדירו ועקבו אחר תקציב החתונה לפי קטגוריות. עקבו אחר תשלומים לספקים וקבלו תובנות ויזואליות.",
      color: "gold",
    },
    {
      icon: <CheckSquare className="feature-icon" />,
      title: "ניהול משימות",
      description:
        "תבניות מוכנות לתכנון חתונה, משימות מותאמות אישית עם תאריכי יעד, ומעקב התקדמות ויזואלי.",
      color: "sage",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "לוח הבקרה של הזוג",
      description:
        "ספירה לאחור לחתונה, שיתוף פעולה עם בן/בת הזוג, ומרכז תכנון מאוחד לשניכם.",
      color: "lavender",
    },
    {
      icon: <Timer className="feature-icon" />,
      title: "עדכונים בזמן אמת",
      description:
        "ראו תגובות אורחים וסטטוס אישורי הגעה מיד בלוח הבקרה. בלי צורך לרענן!",
      color: "coral",
    },
    {
      icon: <FileSpreadsheet className="feature-icon" />,
      title: "ייבוא/ייצוא אקסל",
      description:
        "ייבאו בקלות את רשימת האורחים הקיימת או ייצאו נתונים בכל עת לגיבוי ושיתוף.",
      color: "mint",
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "התחברות מאובטחת",
      description:
        "התחברו בבטחה עם חשבון גוגל. פרטי החתונה שלכם מוגנים ופרטיים.",
      color: "blush",
    },
  ];

  return (
    <div id="features" className="features" dir="rtl">
      <div className="section-container">
        <div className="features-header">
          <span className="features-eyebrow">כל מה שאתם צריכים</span>
          <h2 className="features-title">
            תכננו את החתונה שלכם{" "}
            <span className="title-highlight">באהבה ובקלות</span>
          </h2>
          <p className="features-description">
            מההזמנה הראשונה ועד התודה האחרונה, אנחנו דואגים לכל פרט כדי שתוכלו
            להתמקד במה שבאמת חשוב — לחגוג את האהבה שלכם.
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
