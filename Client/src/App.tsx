import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <main className="App-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
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
    </Router>
  );
}

export default App;
