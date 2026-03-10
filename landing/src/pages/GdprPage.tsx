import { LegalLayout } from "@/components/layout/LegalLayout"

export function GdprPage() {
  return (
    <LegalLayout title="GDPR Information Notice" lastUpdated="February 18, 2026">
      <p>
        In accordance with Articles 13(1) and 13(2) of Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation, hereinafter: "GDPR"), we inform you:
      </p>

      <h2>1. Data Controller</h2>
      <p>
        The controller of your personal data is <strong>Procurea sp. z o.o.</strong>, registered at ul. Pomorska 3/1, 85-050 Bydgoszcz, Poland.
      </p>
      <p>
        Contact the Controller: <strong>hello@procurea.io</strong>.
      </p>

      <h2>2. Purposes and Legal Bases for Processing</h2>
      <p>Your personal data is processed for the following purposes:</p>

      <table>
        <thead>
          <tr>
            <th>Purpose of Processing</th>
            <th>Legal Basis</th>
            <th>Retention Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account registration and management</td>
            <td>Art. 6(1)(b) GDPR (performance of a contract)</td>
            <td>Until Account deletion + 30 days</td>
          </tr>
          <tr>
            <td>Provision of AI sourcing services</td>
            <td>Art. 6(1)(b) GDPR (performance of a contract)</td>
            <td>Until Account deletion + 30 days</td>
          </tr>
          <tr>
            <td>Sending RFQs and email sequences to suppliers on the User's behalf</td>
            <td>Art. 6(1)(b) GDPR (performance of a contract)</td>
            <td>Until Account deletion + 30 days</td>
          </tr>
          <tr>
            <td>Billing and invoicing</td>
            <td>Art. 6(1)(c) GDPR (legal obligation)</td>
            <td>5 years from the end of the tax year</td>
          </tr>
          <tr>
            <td>Inquiry and complaint handling</td>
            <td>Art. 6(1)(b) and (f) GDPR</td>
            <td>Until resolution + 12 months</td>
          </tr>
          <tr>
            <td>Platform security and fraud prevention</td>
            <td>Art. 6(1)(f) GDPR (legitimate interest)</td>
            <td>Up to 12 months (logs)</td>
          </tr>
          <tr>
            <td>Analytics and service improvement</td>
            <td>Art. 6(1)(f) GDPR (legitimate interest)</td>
            <td>Anonymized data — indefinitely</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Categories of Data</h2>
      <p>We process the following categories of personal data:</p>
      <ul>
        <li>Identification data: name, email address, phone number</li>
        <li>Organizational data: company name, job title, industry, tax ID</li>
        <li>Platform usage data: sourcing queries, results, supplier correspondence</li>
        <li>Technical data: IP address, session identifiers, browser data</li>
      </ul>

      <h2>4. Data Recipients</h2>
      <p>Your data may be shared with the following categories of recipients:</p>
      <ul>
        <li><strong>Google Cloud Platform / Firebase</strong> — IT infrastructure provider (hosting, databases, authentication). Data stored in europe-west1 region (EU).</li>
        <li><strong>Communication service providers</strong> — for SMS delivery (verification) and email (sequences, notifications).</li>
        <li><strong>Suppliers contacted via the Platform</strong> — User contact data included in requests for quotation.</li>
        <li><strong>Government authorities</strong> — in cases required by law.</li>
      </ul>

      <h2>5. Data Transfers to Third Countries</h2>
      <p>
        As a general rule, personal data is stored and processed exclusively within the European Economic Area (EEA), on Google Cloud servers in the europe-west1 region (Belgium).
      </p>
      <p>
        Where data transfer outside the EEA is necessary, appropriate safeguards in accordance with Chapter V of the GDPR are applied, particularly the standard contractual clauses adopted by the European Commission.
      </p>

      <h2>6. Data Subject Rights</h2>
      <p>Under the GDPR, you have the following rights:</p>
      <ol>
        <li><strong>Right of access</strong> (Art. 15 GDPR) — to obtain confirmation of data processing and access to your data.</li>
        <li><strong>Right to rectification</strong> (Art. 16 GDPR) — to request correction of inaccurate or completion of incomplete data.</li>
        <li><strong>Right to erasure</strong> (Art. 17 GDPR) — to request deletion of data (the "right to be forgotten") when:
          <ul>
            <li>data is no longer necessary for the purposes for which it was collected,</li>
            <li>consent has been withdrawn and there is no other legal basis for processing,</li>
            <li>a successful objection to processing has been raised.</li>
          </ul>
        </li>
        <li><strong>Right to restriction of processing</strong> (Art. 18 GDPR).</li>
        <li><strong>Right to data portability</strong> (Art. 20 GDPR) — to receive data in a structured, commonly used, machine-readable format.</li>
        <li><strong>Right to object</strong> (Art. 21 GDPR) — to processing based on the Controller's legitimate interest.</li>
        <li><strong>Right to withdraw consent</strong> (Art. 7(3) GDPR) — at any time, without affecting the lawfulness of processing carried out prior to withdrawal.</li>
      </ol>
      <p>
        To exercise the above rights, please contact us at: <strong>hello@procurea.io</strong>.
      </p>

      <h2>7. Right to Lodge a Complaint</h2>
      <p>
        If you believe that the processing of your personal data violates the GDPR, you have the right to lodge a complaint with the relevant supervisory authority. For users in Poland:
      </p>
      <p>
        <strong>President of the Personal Data Protection Office (UODO)</strong><br />
        ul. Stawki 2, 00-193 Warsaw, Poland<br />
        www.uodo.gov.pl
      </p>
      <p>
        For users in other EU/EEA countries, you may lodge a complaint with your local data protection authority.
      </p>

      <h2>8. Voluntary Nature of Data Provision</h2>
      <p>
        Providing personal data is voluntary but necessary to use the Procurea Platform. Failure to provide data will prevent Account registration and use of services.
      </p>

      <h2>9. Automated Decision-Making</h2>
      <p>
        The Procurea Platform uses AI algorithms to discover and evaluate suppliers. Results generated by AI agents are solely informational and supportive in nature — they do not constitute automated decision-making within the meaning of Art. 22 GDPR. Final business decisions are always made by the User.
      </p>

      <h2>10. Security Measures</h2>
      <p>The Controller has implemented appropriate technical and organizational measures to ensure the security of personal data, including:</p>
      <ul>
        <li>Data encryption in transit (TLS) and at rest</li>
        <li>Multi-factor authentication (OAuth 2.0 + SMS verification)</li>
        <li>Data storage in certified Google Cloud data centers (EU region)</li>
        <li>Regular security testing and backups</li>
        <li>Access control based on the principle of least privilege</li>
        <li>Access monitoring and logging</li>
      </ul>

      <h2>Controller Contact Information</h2>
      <p>
        <strong>Procurea sp. z o.o.</strong><br />
        ul. Pomorska 3/1, 85-050 Bydgoszcz, Poland<br />
        Email: hello@procurea.io
      </p>
    </LegalLayout>
  )
}
