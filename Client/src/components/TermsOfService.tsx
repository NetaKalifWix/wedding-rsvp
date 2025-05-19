import React from "react";
import "./css/TermsOfService.css";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="legal-page terms-of-service">
      <Link to="/">Home</Link>
      <h1>Terms of Service</h1>
      <p className="last-updated">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to [Your Company/App Name] ("we," "our," or "us"). By
          accessing or using our website and services, you agree to be bound by
          these Terms of Service ("Terms"). If you disagree with any part of
          these Terms, you may not access or use our services.
        </p>
      </section>

      <section>
        <h2>2. Definitions</h2>
        <ul>
          <li>
            <strong>Service</strong>: The website and services offered by [Your
            Company/App Name]
          </li>
          <li>
            <strong>User</strong>: Any individual who accesses or uses the
            Service
          </li>
          <li>
            <strong>Content</strong>: All information displayed, transmitted, or
            otherwise made available via our Service
          </li>
        </ul>
      </section>

      <section>
        <h2>3. User Accounts</h2>

        <h3>3.1 Account Registration</h3>
        <p>
          You may be required to create an account to access certain features of
          our Service. You agree to provide accurate, current, and complete
          information during the registration process.
        </p>

        <h3>3.2 Account Security</h3>
        <p>
          You are responsible for safeguarding your account credentials and for
          all activities that occur under your account. Notify us immediately of
          any unauthorized use of your account.
        </p>
      </section>

      <section>
        <h2>4. User Responsibilities</h2>

        <h3>4.1 Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal purpose</li>
          <li>Violate any laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Interfere with the proper functioning of the Service</li>
          <li>
            Attempt to gain unauthorized access to any part of the Service
          </li>
        </ul>

        <h3>4.2 User Content</h3>
        <p>
          You retain ownership of content you submit to the Service. By
          submitting content, you grant us a non-exclusive, worldwide,
          royalty-free license to use, reproduce, modify, and display your
          content for the purpose of operating and improving our Service.
        </p>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>

        <h3>5.1 Our Intellectual Property</h3>
        <p>
          The Service and its original content, features, and functionality are
          owned by [Your Company/App Name] and are protected by international
          copyright, trademark, and other intellectual property laws.
        </p>

        <h3>5.2 Limited License</h3>
        <p>
          We grant you a limited, non-exclusive, non-transferable, and revocable
          license to use the Service for its intended purposes.
        </p>
      </section>

      <section>
        <h2>6. Third-Party Links and Services</h2>
        <p>
          Our Service may contain links to third-party websites or services not
          owned or controlled by us. We have no control over and assume no
          responsibility for the content, privacy policies, or practices of any
          third-party websites or services.
        </p>
      </section>

      <section>
        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service
          immediately, without prior notice, for conduct that we believe
          violates these Terms or is harmful to other users, us, or third
          parties, or for any other reason at our sole discretion.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, in no event shall [Your
          Company/App Name] be liable for any indirect, incidental, special,
          consequential, or punitive damages, including without limitation, loss
          of profits, data, use, goodwill, or other intangible losses, resulting
          from your access to or use of or inability to access or use the
          Service.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind, either express or implied, including, but not limited to,
          implied warranties of merchantability, fitness for a particular
          purpose, non-infringement, or course of performance.
        </p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of [Your Jurisdiction], without regard to its conflict of law
          provisions.
        </p>
      </section>

      <section>
        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will provide at least 30 days' notice prior
          to any new terms taking effect. What constitutes a material change
          will be determined at our sole discretion.
        </p>
      </section>

      <section>
        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <ul>
          <li>Email: [your-email@example.com]</li>
          <li>Address: [Your Company Address]</li>
        </ul>
      </section>
    </div>
  );
};

export default TermsOfService;
