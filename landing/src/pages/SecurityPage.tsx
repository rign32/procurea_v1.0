import { LegalLayout } from "@/components/layout/LegalLayout"
import { t } from "@/i18n"

const isEN = t.meta.lang === 'en'

export function SecurityPage() {
  return (
    <LegalLayout
      title={isEN ? "Security at Procurea" : "Bezpieczenstwo w Procurea"}
      lastUpdated={isEN ? "April 16, 2026" : "16 kwietnia 2026"}
    >
      {isEN ? (
        <>
          <p>
            Procurea is built with enterprise-grade security from the ground up. We protect your procurement data with industry-leading infrastructure, encryption, and access controls.
          </p>

          <h2>1. Infrastructure</h2>
          <p>
            Procurea runs on <strong>Google Cloud Platform</strong> in the <strong>europe-central2 region (Warsaw, Poland)</strong>. Our database is hosted on a dedicated Cloud SQL instance with automated backups and high availability. Frontend assets are served via Firebase Hosting with a global CDN for fast, reliable access worldwide.
          </p>

          <h2>2. Encryption</h2>
          <p>
            All data is encrypted at rest using <strong>AES-256</strong> encryption. Data in transit is protected with <strong>TLS 1.3</strong>. All database connections are encrypted end-to-end. Backups are stored encrypted in Google Cloud Storage.
          </p>

          <h2>3. Authentication</h2>
          <p>
            Procurea uses <strong>OAuth 2.0</strong> via Google and Microsoft for secure authentication. Session tokens are stored in <strong>httpOnly cookies</strong>, preventing XSS-based token theft. We do not store passwords — all authentication is delegated to trusted identity providers.
          </p>

          <h2>4. Data Isolation</h2>
          <p>
            Each organization has fully isolated data within our PostgreSQL database. Application-level access controls ensure <strong>no cross-tenant data access</strong> is possible. API endpoints enforce organization-scoped queries at every layer.
          </p>

          <h2>5. Compliance</h2>
          <p>
            Procurea is <strong>GDPR compliant</strong>. All customer data is stored exclusively in the EU (Poland). We are currently pursuing <strong>SOC 2 Type II certification</strong> to provide additional assurance of our security controls and processes.
          </p>

          <h2>6. Monitoring</h2>
          <p>
            We maintain <strong>24/7 uptime monitoring</strong> with automated alerting for any anomalies. Application errors are tracked via <strong>Sentry</strong> with real-time notifications. Infrastructure metrics are monitored through Google Cloud Operations Suite.
          </p>
        </>
      ) : (
        <>
          <p>
            Procurea jest zbudowana z mysl o bezpieczenstwie klasy enterprise od samego poczatku. Chronimy dane procurement naszych klientow za pomoca wiodacej infrastruktury, szyfrowania i kontroli dostepu.
          </p>

          <h2>1. Infrastruktura</h2>
          <p>
            Procurea dziala na <strong>Google Cloud Platform</strong> w regionie <strong>europe-central2 (Warszawa, Polska)</strong>. Nasza baza danych jest hostowana na dedykowanej instancji Cloud SQL z automatycznymi kopiami zapasowymi i wysoka dostepnoscia. Zasoby frontendowe sa serwowane przez Firebase Hosting z globalnym CDN.
          </p>

          <h2>2. Szyfrowanie</h2>
          <p>
            Wszystkie dane sa szyfrowane w spoczynku za pomoca <strong>AES-256</strong>. Dane w transmisji sa chronione przez <strong>TLS 1.3</strong>. Wszystkie polaczenia z baza danych sa szyfrowane end-to-end. Kopie zapasowe sa przechowywane w zaszyfrowanej formie w Google Cloud Storage.
          </p>

          <h2>3. Uwierzytelnianie</h2>
          <p>
            Procurea wykorzystuje <strong>OAuth 2.0</strong> przez Google i Microsoft do bezpiecznego uwierzytelniania. Tokeny sesji sa przechowywane w <strong>httpOnly cookies</strong>, co zapobiega kradiezy tokenow przez XSS. Nie przechowujemy hasel — uwierzytelnianie jest delegowane do zaufanych dostawcow tozsamosci.
          </p>

          <h2>4. Izolacja danych</h2>
          <p>
            Kazda organizacja ma w pelni izolowane dane w naszej bazie PostgreSQL. Kontrola dostepu na poziomie aplikacji zapewnia <strong>brak dostepu do danych miedzy tenantami</strong>. Endpointy API wymuszaja zapytania w zakresie organizacji na kazdej warstwie.
          </p>

          <h2>5. Zgodnosc</h2>
          <p>
            Procurea jest <strong>zgodna z RODO</strong>. Wszystkie dane klientow sa przechowywane wylacznie w UE (Polska). Obecnie realizujemy proces certyfikacji <strong>SOC 2 Type II</strong>, aby zapewnic dodatkowa gwarancje naszych kontroli bezpieczenstwa.
          </p>

          <h2>6. Monitoring</h2>
          <p>
            Utrzymujemy <strong>calodobowy monitoring dostepnosci</strong> z automatycznym alertowaniem o wszelkich anomaliach. Bledy aplikacji sa sledzone przez <strong>Sentry</strong> z powiadomieniami w czasie rzeczywistym. Metryki infrastruktury sa monitorowane przez Google Cloud Operations Suite.
          </p>
        </>
      )}
    </LegalLayout>
  )
}
