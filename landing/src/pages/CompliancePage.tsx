import { LegalLayout } from "@/components/layout/LegalLayout"
import { Link } from "react-router-dom"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

const isEN = t.meta.lang === 'en'

export function CompliancePage() {
  return (
    <LegalLayout
      title={isEN ? "Compliance & Data Protection" : "Zgodnosc i ochrona danych"}
      lastUpdated={isEN ? "April 16, 2026" : "16 kwietnia 2026"}
    >
      {isEN ? (
        <>
          <p>
            Procurea is committed to maintaining the highest standards of data protection and regulatory compliance. This page outlines our compliance framework and data handling practices.
          </p>

          <h2>1. GDPR</h2>
          <p>
            Procurea is fully <strong>GDPR compliant</strong>. When processing customer data on behalf of our clients, we act as a <strong>data processor under Article 28 GDPR</strong>. A Data Processing Agreement (DPA) is available upon request for all enterprise customers.
          </p>

          <h2>2. Data Residency</h2>
          <p>
            All customer data is stored in <strong>Google Cloud europe-central2 (Warsaw, Poland)</strong>. No customer data leaves EU infrastructure. Database backups are stored within the same region to ensure full data sovereignty.
          </p>

          <h2>3. Data Retention</h2>
          <p>
            Campaign data (sourcing results, supplier lists, RFQ responses) is retained for <strong>12 months</strong> from the date of creation. Account data is retained for the <strong>duration of service plus 30 days</strong> after account deletion to allow for data recovery if needed.
          </p>

          <h2>4. Data Deletion</h2>
          <p>
            Users can request a full data export and deletion at any time via account settings or by contacting our support team. Upon receiving a deletion request, all personal data is permanently removed within 30 days, in accordance with GDPR Article 17 (Right to Erasure).
          </p>

          <h2>5. Sub-processors</h2>
          <p>We use the following sub-processors to deliver our services:</p>
          <ul>
            <li><strong>Google Cloud Platform</strong> — cloud infrastructure, database hosting, and compute</li>
            <li><strong>Resend</strong> — transactional email delivery (RFQ emails, notifications)</li>
            <li><strong>Serper.dev</strong> — web search API for supplier discovery</li>
            <li><strong>Google AI Studio</strong> — AI processing for supplier analysis and enrichment</li>
          </ul>

          <h2>6. Contact</h2>
          <p>
            For compliance inquiries, data protection questions, or to request a DPA, please{" "}
            <Link to={pathFor('contact')} className="text-blue-600 hover:underline">
              contact us
            </Link>.
          </p>
        </>
      ) : (
        <>
          <p>
            Procurea zobowiazuje sie do utrzymywania najwyzszych standardow ochrony danych i zgodnosci regulacyjnej. Ta strona opisuje nasze ramy zgodnosci i praktyki przetwarzania danych.
          </p>

          <h2>1. RODO</h2>
          <p>
            Procurea jest w pelni <strong>zgodna z RODO</strong>. Przetwarzajac dane klientow w ich imieniu, dzialamy jako <strong>podmiot przetwarzajacy dane na podstawie art. 28 RODO</strong>. Umowa powierzenia przetwarzania danych (DPA) jest dostepna na zadanie dla wszystkich klientow enterprise.
          </p>

          <h2>2. Rezydencja danych</h2>
          <p>
            Wszystkie dane klientow sa przechowywane w <strong>Google Cloud europe-central2 (Warszawa, Polska)</strong>. Zadne dane klientow nie opuszczaja infrastruktury UE. Kopie zapasowe bazy danych sa przechowywane w tym samym regionie, aby zapewnic pelna suwerennosc danych.
          </p>

          <h2>3. Retencja danych</h2>
          <p>
            Dane kampanii (wyniki sourcingu, listy dostawcow, odpowiedzi RFQ) sa przechowywane przez <strong>12 miesiecy</strong> od daty utworzenia. Dane konta sa przechowywane przez <strong>czas trwania uslugi plus 30 dni</strong> po usunieciu konta, aby umozliwic odzyskanie danych w razie potrzeby.
          </p>

          <h2>4. Usuwanie danych</h2>
          <p>
            Uzytkownicy moga w kazdej chwili zazadac pelnego eksportu i usuniecia danych przez ustawienia konta lub kontaktujac sie z naszym zespolem wsparcia. Po otrzymaniu zadania usuniecia, wszystkie dane osobowe sa trwale usuwane w ciagu 30 dni, zgodnie z art. 17 RODO (prawo do bycia zapomnianym).
          </p>

          <h2>5. Podprocesory</h2>
          <p>Korzystamy z nastepujacych podprocesorow do swiadczenia naszych uslug:</p>
          <ul>
            <li><strong>Google Cloud Platform</strong> — infrastruktura chmurowa, hosting bazy danych i obliczenia</li>
            <li><strong>Resend</strong> — dostarczanie emaili transakcyjnych (emaile RFQ, powiadomienia)</li>
            <li><strong>Serper.dev</strong> — API wyszukiwania do odkrywania dostawcow</li>
            <li><strong>Google AI Studio</strong> — przetwarzanie AI do analizy i wzbogacania danych dostawcow</li>
          </ul>

          <h2>6. Kontakt</h2>
          <p>
            W sprawie pytan dotyczacych zgodnosci, ochrony danych lub w celu uzyskania DPA, prosimy o{" "}
            <Link to={pathFor('contact')} className="text-blue-600 hover:underline">
              kontakt
            </Link>.
          </p>
        </>
      )}
    </LegalLayout>
  )
}
