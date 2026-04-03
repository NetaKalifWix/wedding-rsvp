import React from "react";
import "./App.css";

const NEW_URL = "https://wedding-rsvp-by-neta.vercel.app/";

function App() {
  return (
    <div className="App" style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>&#10024;</div>
        <h1 style={styles.title}>עברנו לכתובת חדשה!</h1>
        <p style={styles.subtitle}>
          האתר עבר לבית חדש ומשודרג. לחצו על הכפתור למעבר לאתר החדש.
        </p>
        <a href={NEW_URL} style={styles.button}>
          קחו אותי לאתר החדש
        </a>
        <p style={styles.urlText}>{NEW_URL}</p>
      </div>
      <p style={styles.footer}>
        &copy; {new Date().getFullYear()} RSVP by Neta Kalif
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "48px 40px",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    textAlign: "center" as const,
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#2d2d2d",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#555",
    lineHeight: 1.6,
    margin: "0 0 28px",
  },
  button: {
    display: "inline-block",
    background: "linear-gradient(135deg, #e88fc5 0%, #b57edc 100%)",
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 600,
    padding: "14px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 16px rgba(181, 126, 220, 0.35)",
  },
  urlText: {
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "16px",
    direction: "ltr" as const,
  },
  footer: {
    marginTop: "32px",
    fontSize: "0.85rem",
    color: "#888",
  },
};

export default App;
