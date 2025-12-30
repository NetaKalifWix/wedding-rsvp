import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import PrivacyPolicy from "./components/global/PrivacyPolicy";
import TermsOfService from "./components/global/TermsOfService";
import "./App.css";
import { RSVPDashboard } from "./components/rsvp/RSVPDashboard";
import { WeddingDashboard } from "./components/userDashboard/WeddingDashboard";
import { TasksDashboard } from "./components/tasks/TasksDashboard";
import { BudgetDashboard } from "./components/budgetAndVendors/BudgetDashboard";
import WelcomePage from "./components/welcomePage/WelcomePage";
import { useAuth, AuthProvider } from "./hooks/useAuth";

const theme = createTheme({
  primaryColor: "pink",
  fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily:
      "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Franklin Gothic Bold', sans-serif",
  },
  colors: {
    pink: [
      "#fff1f3",
      "#ffe4e8",
      "#fecdd3",
      "#fda4af",
      "#fb7185",
      "#f43f5e",
      "#e11d48",
      "#be123c",
      "#9f1239",
      "#881337",
    ],
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <ScrollToTop />
      <main className="App-content">
        <Routes>
          <Route
            path="/"
            element={user ? <WeddingDashboard /> : <WelcomePage />}
          />
          <Route path="/rsvp" element={<RSVPDashboard />} />
          <Route path="/tasks" element={<TasksDashboard />} />
          <Route path="/budget" element={<BudgetDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </main>

      <footer className="App-footer">
        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span className="footer-divider">|</span>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
        <p>
          &copy; {new Date().getFullYear()} RSVP by Neta Kalif. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </MantineProvider>
  );
}

export default App;
