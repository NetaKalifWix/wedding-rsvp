import React from "react";
import "./css/PrivacyPolicy.css";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="legal-page privacy-policy">
      <Link to="/">Home</Link>
      <h1>Privacy Policy</h1>
      <p className="last-updated">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to RSVP! We respect your privacy and are committed to
          protecting your personal data. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use
          our website and services.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>

        <h3>2.1 Personal Information</h3>
        <ul>
          <li>Contact information (name, email address, phone number)</li>
          <li>Account information (username, password)</li>
          <li>User content (messages, images, and other content you submit)</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>Device information (device type, operating system)</li>
          <li>Log data (IP address, browser type, pages visited)</li>
          <li>Cookies and similar technologies</li>
          <li>Usage patterns and preferences</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use your information for the following purposes:</p>
        <ul>
          <li>Providing and maintaining our services</li>
          <li>Processing transactions</li>
          <li>Responding to inquiries and service requests</li>
          <li>Sending administrative information</li>
          <li>Sending marketing communications (with your consent)</li>
          <li>Improving our services and user experience</li>
          <li>Protecting our services and users</li>
        </ul>
      </section>

      <section>
        <h2>4. Information Sharing and Disclosure</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Service providers who perform services on our behalf</li>
          <li>Business partners with your consent</li>
          <li>Legal authorities when required by law</li>
          <li>
            In connection with a business transaction (merger, acquisition)
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Your Rights and Choices</h2>
        <p>Depending on your location, you may have rights to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>Object to certain processing</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal
          information from unauthorized access, alteration, disclosure, or
          destruction.
        </p>
      </section>

      <section>
        <h2>7. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to
          fulfill the purposes outlined in this Privacy Policy, unless a longer
          retention period is required by law.
        </p>
      </section>

      <section>
        <h2>8. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 16. We
          do not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your country of residence, which may have different data
          protection laws.
        </p>
      </section>

      <section>
        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the "Last Updated" date.
        </p>
      </section>

      <section>
        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <ul>
          <li>Email: neta1019@gmail.com</li>
        </ul>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
