import { LegalLayout } from "@/components/layout/LegalLayout"

export function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="February 18, 2026">
      <h2>1. Data Controller</h2>
      <p>
        The controller of your personal data is <strong>Procurea sp. z o.o.</strong>, registered at ul. Pomorska 3/1, 85-050 Bydgoszcz, Poland (hereinafter: the "Controller" or "we").
      </p>
      <p>
        Contact the Controller: <strong>hello@procurea.io</strong>.
      </p>

      <h2>2. What Data We Collect</h2>
      <p>When using the Procurea Platform, we collect the following categories of data:</p>
      <h3>2.1. Registration Data</h3>
      <ul>
        <li>Full name (from your Google or Microsoft account)</li>
        <li>Email address</li>
        <li>Phone number (provided during verification)</li>
        <li>Profile picture (if available from OAuth account)</li>
      </ul>
      <h3>2.2. Organizational Data</h3>
      <ul>
        <li>Company / organization name</li>
        <li>Job title</li>
        <li>Industry</li>
        <li>Tax identification number (optional)</li>
      </ul>
      <h3>2.3. Data Generated During Platform Use</h3>
      <ul>
        <li>Sourcing queries and their parameters</li>
        <li>Search results and supplier lists</li>
        <li>Correspondence with suppliers (email sequences)</li>
        <li>Requests for quotation (RFQ) and submitted offers</li>
        <li>Activity logs and operation history</li>
      </ul>
      <h3>2.4. Technical Data</h3>
      <ul>
        <li>IP address</li>
        <li>Browser type and operating system</li>
        <li>Session identifiers</li>
        <li>Cookie data (details in section 7)</li>
      </ul>

      <h2>3. Purposes of Data Processing</h2>
      <p>We process your personal data for the following purposes:</p>
      <ul>
        <li><strong>Service delivery</strong> — operating Platform functionality, including running AI sourcing processes, sending RFQs, and email sequences (legal basis: Art. 6(1)(b) GDPR — performance of a contract).</li>
        <li><strong>Registration and Account management</strong> — authentication, identity verification (legal basis: Art. 6(1)(b) GDPR).</li>
        <li><strong>Billing and invoicing</strong> — processing payments for Credits (legal basis: Art. 6(1)(b) and (c) GDPR).</li>
        <li><strong>Communication</strong> — responding to inquiries, handling complaints, system notifications (legal basis: Art. 6(1)(b) and (f) GDPR).</li>
        <li><strong>Security</strong> — protection against unauthorized access, fraud prevention (legal basis: Art. 6(1)(f) GDPR — legitimate interest).</li>
        <li><strong>Analytics and service improvement</strong> — analyzing Platform usage to improve functionality (legal basis: Art. 6(1)(f) GDPR).</li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>Your data may be shared with the following categories of recipients:</p>
      <ul>
        <li><strong>IT service providers</strong> — Google Cloud Platform (hosting, databases), Firebase (authentication), to the extent necessary for service provision.</li>
        <li><strong>Communication service providers</strong> — SMS delivery services (phone verification) and email services (sequences).</li>
        <li><strong>Suppliers discovered by the Platform</strong> — User contact information may be visible in RFQs sent to suppliers.</li>
        <li><strong>Government authorities</strong> — as required by applicable law, upon request from authorized bodies.</li>
      </ul>
      <p>
        We do not sell personal data to third parties. We do not share data for third-party marketing purposes.
      </p>

      <h2>5. Data Transfers Outside the EEA</h2>
      <p>
        User data is stored on Google Cloud servers in the <strong>europe-west1</strong> region (Belgium, EU). As a general rule, data does not leave the European Economic Area.
      </p>
      <p>
        When using services from providers located outside the EEA (e.g., AI services), we apply appropriate safeguards, including standard contractual clauses approved by the European Commission.
      </p>

      <h2>6. Data Retention Period</h2>
      <ul>
        <li><strong>Account data</strong> — for the duration of the active Account and for 30 days after deletion.</li>
        <li><strong>Billing data</strong> — for the period required by tax regulations (5 years).</li>
        <li><strong>Analytical data</strong> — in anonymized form, indefinitely.</li>
        <li><strong>System logs</strong> — up to 12 months.</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>The Platform uses cookies for the following purposes:</p>
      <ul>
        <li><strong>Essential cookies</strong> — required for the proper operation of the Platform (session, authentication).</li>
        <li><strong>Analytical cookies</strong> — collecting anonymous usage statistics (Google Analytics).</li>
      </ul>
      <p>
        You can manage cookie settings in your browser. Disabling essential cookies may limit Platform functionality.
      </p>

      <h2>8. Your Rights</h2>
      <p>In relation to data processing, you have the following rights:</p>
      <ul>
        <li><strong>Right of access</strong> — to obtain information about processed data (Art. 15 GDPR).</li>
        <li><strong>Right to rectification</strong> — to correct inaccurate data (Art. 16 GDPR).</li>
        <li><strong>Right to erasure</strong> — to request deletion of data, i.e., the "right to be forgotten" (Art. 17 GDPR).</li>
        <li><strong>Right to restriction of processing</strong> (Art. 18 GDPR).</li>
        <li><strong>Right to data portability</strong> — to receive data in a structured format (Art. 20 GDPR).</li>
        <li><strong>Right to object</strong> — to processing based on legitimate interest (Art. 21 GDPR).</li>
        <li><strong>Right to lodge a complaint</strong> — with the relevant data protection authority.</li>
      </ul>
      <p>
        To exercise these rights, contact us at: <strong>hello@procurea.io</strong>.
      </p>

      <h2>9. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect personal data, including:</p>
      <ul>
        <li>Data encryption in transit (TLS/SSL) and at rest</li>
        <li>OAuth 2.0 authentication with identity providers (Google, Microsoft)</li>
        <li>Two-factor verification (SMS)</li>
        <li>Regular backups</li>
        <li>Role-based access control</li>
        <li>Activity monitoring and logging</li>
      </ul>

      <h2>10. Changes to the Privacy Policy</h2>
      <p>
        We reserve the right to update this Privacy Policy. Users will be notified of significant changes electronically. The current version is always available at procurea.io.
      </p>

      <h2>Contact Information</h2>
      <p>
        <strong>Procurea sp. z o.o.</strong><br />
        ul. Pomorska 3/1, 85-050 Bydgoszcz, Poland<br />
        Email: hello@procurea.io
      </p>
    </LegalLayout>
  )
}
