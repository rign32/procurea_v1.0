// Feature page content — 4 MVP P0 features with full copy.

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export interface FeatureContent {
  slug: string
  tierBadge: string
  heroTitle: string
  heroSubtitle: string
  howItWorks: { step: string; title: string; body: string }[]
  highlights: string[]
  relatedIndustries: string[] // slugs (PL keys)
  relatedFeatures: string[] // path keys
  ctaTitle: string
  ctaBody: string
  isSelfServe: boolean
  interestTag: string
}

const featuresEN: Record<string, FeatureContent> = {
  'ai-sourcing': {
    slug: 'ai-sourcing',
    tierBadge: 'Available from Starter Sourcing ($199/mo) · 10 free credits on signup',
    heroTitle: 'AI Sourcing — verified supplier shortlist in minutes',
    heroSubtitle:
      'Describe what you need in plain language. Our AI pipeline searches 26 languages, verifies supplier capabilities, filters by certifications, and delivers a shortlist of 20-200 qualified vendors.',
    howItWorks: [
      {
        step: '1',
        title: 'Describe what you need',
        body: 'Enter a category (e.g. "eco-friendly packaging, EU, FSC certified, 10k-50k units/month"). No search operators, no boolean logic — just plain language.',
      },
      {
        step: '2',
        title: 'AI pipeline runs in background',
        body: '4-agent pipeline: Strategy plans search queries across 26 languages → Screener evaluates each supplier → Enrichment finds contact data → Auditor validates results. You watch progress live.',
      },
      {
        step: '3',
        title: 'Shortlist ready in 2-20 minutes',
        body: 'First 20 suppliers arrive in 2-3 minutes. Full list of up to 200 vendors (Enterprise tier) completes in 20 minutes. Export CSV or send RFQ from the platform.',
      },
    ],
    highlights: [
      '26-language research (PL, EN, DE, FR, IT, ES, TR, CZ, HU, and more)',
      'AI scoring: capability match, trust signals, certifications',
      'Country Registry lookup (VAT, EORI, financials)',
      'Deduplicates against your existing supplier base',
      'Export to CSV or integrate via REST API (Enterprise)',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fSupplierPortal'],
    ctaTitle: 'Start your first research for free',
    ctaBody: 'Sign up with your work email. You get 10 free credits to run your first 10 AI sourcing campaigns — no credit card required.',
    isSelfServe: true,
    interestTag: 'sourcing_starter',
  },
  'outreach-mailowy': {
    slug: 'email-outreach',
    tierBadge: 'Available from Starter +Procurement (+$249/mo) · Contact sales',
    heroTitle: 'Email Outreach — send RFQ to 200 suppliers in one click',
    heroSubtitle:
      'Automated bulk RFQ emails, localized per supplier country. Track delivery, opens, and responses in one dashboard. Integrates with the Supplier Portal — no manual data entry.',
    howItWorks: [
      {
        step: '1',
        title: 'Pick suppliers from your sourcing campaign',
        body: 'Select the 30, 50, or 200 suppliers you want to RFQ. Each gets a unique Supplier Portal magic link.',
      },
      {
        step: '2',
        title: 'Customize or use template',
        body: 'Write your RFQ email once. System translates it per supplier language (German for Berlin, Polish for Warsaw). Attach specs, BOQ, drawings.',
      },
      {
        step: '3',
        title: 'Send — and watch responses come in',
        body: 'Mass-send via Resend infrastructure (inboxes, not spam). Dashboard shows deliveries, opens, and offers as they arrive through the Supplier Portal.',
      },
    ],
    highlights: [
      'Bulk RFQ to 200+ suppliers in one action',
      'Automatic language detection and translation',
      'Localized email templates (Professional tier)',
      'Auto follow-up sequences (Professional tier)',
      'Delivery + open tracking',
      'Reply-to goes back to your team inbox',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Talk to us about the Procurement add-on',
    ctaBody: 'Email Outreach comes with full Procurement workflow (Supplier Portal, Offer Collection, Comparison). We configure it together in a 30-minute onboarding call.',
    isSelfServe: false,
    interestTag: 'procurement_starter',
  },
  'supplier-portal': {
    slug: 'supplier-portal',
    tierBadge: 'Available from Starter +Procurement · Contact sales',
    heroTitle: 'Supplier Portal — magic link, no login, no friction',
    heroSubtitle:
      'Suppliers submit structured quotes via a personalized link — no account creation, no password. Quantity breaks, alternatives, attachments — all captured in a standard format.',
    howItWorks: [
      {
        step: '1',
        title: 'Each supplier gets a unique link',
        body: 'When you send an RFQ, the email contains a magic link (unique token, 30-day validity). Supplier clicks, sees your branded portal, sees their specific RFQ.',
      },
      {
        step: '2',
        title: 'Structured quote submission',
        body: 'Portal form: base price, tiered pricing (quantity breaks), MOQ, lead time, Incoterms, certifications, payment terms, alternatives. Attach samples, certificates, catalogs.',
      },
      {
        step: '3',
        title: 'You see offers in real-time',
        body: 'Each submission appears in your dashboard. Side-by-side offer comparison (from Professional). No PDF parsing, no email forwarding — structured data from day one.',
      },
    ],
    highlights: [
      'No supplier account needed — magic link only',
      'Portal auto-translated to supplier language',
      'Structured price tiers, MOQ, lead time, alternatives',
      'Supplier uploads certificates, samples, catalogs',
      'Custom branding per organization (Enterprise)',
      'Mobile-responsive — suppliers respond from phone',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'See the Supplier Portal in action',
    ctaBody: 'Book a demo. We will send you a test RFQ, you open the supplier side, see exactly what your vendors see.',
    isSelfServe: false,
    interestTag: 'procurement_starter',
  },
  'porownywarka-ofert': {
    slug: 'offer-comparison',
    tierBadge: 'Available from Professional +Procurement (+$449/mo) · Contact sales',
    heroTitle: 'Offer Comparison — every quote, side by side',
    heroSubtitle:
      'Structured comparison of all RFQ responses: price, MOQ, lead time, certifications, payment terms, alternatives. Export as PDF or PPTX for your CFO, board, or tender committee.',
    howItWorks: [
      {
        step: '1',
        title: 'Suppliers submit via Supplier Portal',
        body: 'All quotes come in structured — no PDFs to parse. Each includes base price, quantity breaks, lead time, certifications.',
      },
      {
        step: '2',
        title: 'System ranks and highlights',
        body: 'Automatic ranking by weighted criteria (price, lead time, certifications). Outliers flagged. Missing data highlighted.',
      },
      {
        step: '3',
        title: 'Export or negotiate',
        body: 'Export as PDF/PPTX for stakeholders. Or send counter-offer (counter-pricing, counter-MOQ) through the same portal — supplier responds, you accept.',
      },
    ],
    highlights: [
      'Side-by-side comparison up to 200 offers',
      'Weighted ranking — configure your priorities',
      'Quantity-break comparison (price at 100, 1000, 10000 units)',
      'Certification matrix (ISO, CE, FDA, GOTS)',
      'PDF / PPTX export for board presentations',
      'Counter-offer workflow with negotiation history',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fPdfReports'],
    ctaTitle: 'Ready to end spreadsheet comparison?',
    ctaBody: 'Book a demo. We will walk through a comparison view with sample RFQ data from your industry.',
    isSelfServe: false,
    interestTag: 'procurement_professional',
  },
}

const featuresPL: Record<string, FeatureContent> = {
  'ai-sourcing': {
    slug: 'ai-sourcing',
    tierBadge: 'Dostępne od Starter Sourcing ($199/mies) · 10 darmowych kredytów po rejestracji',
    heroTitle: 'AI Sourcing — zweryfikowana lista dostawców w minutach',
    heroSubtitle:
      'Opisz czego szukasz zwykłym językiem. Nasz AI pipeline przeszukuje 26 języków, weryfikuje możliwości dostawców, filtruje po certyfikatach i dostarcza shortlistę 20-200 zakwalifikowanych vendorów.',
    howItWorks: [
      {
        step: '1',
        title: 'Opisz czego szukasz',
        body: 'Wpisz kategorię (np. "opakowania ekologiczne, UE, certyfikat FSC, 10k-50k sztuk/mies"). Bez operatorów, bez boolean logic — zwykły język.',
      },
      {
        step: '2',
        title: 'AI pipeline działa w tle',
        body: '4-agentowy pipeline: Strategia planuje zapytania w 26 językach → Screener ocenia każdego dostawcę → Enrichment znajduje dane kontaktowe → Auditor waliduje wyniki. Śledzisz postęp na żywo.',
      },
      {
        step: '3',
        title: 'Shortlista gotowa w 2-20 minut',
        body: 'Pierwsze 20 dostawców po 2-3 minutach. Pełna lista do 200 vendorów (tier Enterprise) za 20 minut. Eksportujesz do CSV lub wysyłasz RFQ z platformy.',
      },
    ],
    highlights: [
      'Research w 26 językach (PL, EN, DE, FR, IT, ES, TR, CZ, HU i więcej)',
      'AI scoring: dopasowanie możliwości, sygnały trust, certyfikaty',
      'Lookup w Country Registry (VAT, EORI, dane finansowe)',
      'Deduplikacja względem Twojej istniejącej bazy dostawców',
      'Eksport do CSV lub integracja przez REST API (Enterprise)',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fSupplierPortal'],
    ctaTitle: 'Rozpocznij pierwszy research za darmo',
    ctaBody: 'Zarejestruj się służbowym mailem. Dostajesz 10 darmowych kredytów na pierwsze 10 kampanii AI sourcingu — bez karty kredytowej.',
    isSelfServe: true,
    interestTag: 'sourcing_starter',
  },
  'outreach-mailowy': {
    slug: 'email-outreach',
    tierBadge: 'Dostępne od Starter +Procurement (+$249/mies) · Porozmawiaj z nami',
    heroTitle: 'Email Outreach — RFQ do 200 dostawców jednym kliknięciem',
    heroSubtitle:
      'Zautomatyzowane bulk-RFQ, zlokalizowane per kraj dostawcy. Śledź dostarczenia, otwarcia i odpowiedzi w jednym dashboardzie. Integruje się z Supplier Portalem — bez ręcznego wpisywania danych.',
    howItWorks: [
      {
        step: '1',
        title: 'Wybierz dostawców z kampanii sourcingowej',
        body: 'Zaznacz 30, 50 lub 200 dostawców których chcesz RFQować. Każdy dostaje unikalny magic link do Supplier Portalu.',
      },
      {
        step: '2',
        title: 'Customizuj lub użyj szablonu',
        body: 'Napisz RFQ raz. System tłumaczy per język dostawcy (niemiecki dla Berlina, polski dla Warszawy). Załącz spec, BOQ, rysunki.',
      },
      {
        step: '3',
        title: 'Wyślij — i obserwuj odpowiedzi',
        body: 'Masowa wysyłka przez Resend (do inbox, nie spam). Dashboard pokazuje dostarczenia, otwarcia i oferty przybywające przez Supplier Portal.',
      },
    ],
    highlights: [
      'Bulk RFQ do 200+ dostawców w jednej akcji',
      'Automatyczne wykrywanie języka i tłumaczenie',
      'Lokalizowane szablony maili (tier Professional)',
      'Sekwencje auto follow-up (tier Professional)',
      'Tracking dostarczenia + otwarcia',
      'Reply-to wraca do inboxa Twojego zespołu',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Porozmawiajmy o Procurement add-on',
    ctaBody: 'Email Outreach przychodzi z pełnym workflow Procurement (Supplier Portal, Offer Collection, Comparison). Konfigurujemy to razem w 30-minutowym onboardingu.',
    isSelfServe: false,
    interestTag: 'procurement_starter',
  },
  'supplier-portal': {
    slug: 'supplier-portal',
    tierBadge: 'Dostępne od Starter +Procurement · Porozmawiaj z nami',
    heroTitle: 'Supplier Portal — magic link, bez logowania, bez friction',
    heroSubtitle:
      'Dostawcy składają strukturalne oferty przez personalizowany link — bez zakładania konta, bez hasła. Quantity breaks, alternatywy, załączniki — wszystko w standardowym formacie.',
    howItWorks: [
      {
        step: '1',
        title: 'Każdy dostawca dostaje unikalny link',
        body: 'Gdy wysyłasz RFQ, mail zawiera magic link (unikalny token, 30-dniowa ważność). Dostawca klika, widzi Twój branded portal, widzi swoje konkretne RFQ.',
      },
      {
        step: '2',
        title: 'Strukturalne składanie oferty',
        body: 'Formularz portalu: cena bazowa, tiered pricing (quantity breaks), MOQ, lead time, Incoterms, certyfikaty, warunki płatności, alternatywy. Załącza sample, certyfikaty, katalogi.',
      },
      {
        step: '3',
        title: 'Widzisz oferty w czasie rzeczywistym',
        body: 'Każde złożenie pojawia się w Twoim dashboardzie. Porównanie side-by-side (od Professional). Bez parsowania PDF, bez forwardowania maili — strukturalne dane od pierwszego dnia.',
      },
    ],
    highlights: [
      'Bez konta dostawcy — tylko magic link',
      'Portal automatycznie tłumaczony na język dostawcy',
      'Strukturalne price tiers, MOQ, lead time, alternatywy',
      'Dostawca uploaduje certyfikaty, sample, katalogi',
      'Custom branding per organizacja (Enterprise)',
      'Mobile-responsive — dostawcy odpowiadają z telefonu',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'Zobacz Supplier Portal w akcji',
    ctaBody: 'Umów demo. Wyślemy Ci testowe RFQ, otworzysz stronę dostawcy, zobaczysz dokładnie co widzą Twoi vendorzy.',
    isSelfServe: false,
    interestTag: 'procurement_starter',
  },
  'porownywarka-ofert': {
    slug: 'offer-comparison',
    tierBadge: 'Dostępne od Professional +Procurement (+$449/mies) · Porozmawiaj z nami',
    heroTitle: 'Porównywarka Ofert — każde quote, side by side',
    heroSubtitle:
      'Strukturalne porównanie wszystkich odpowiedzi RFQ: cena, MOQ, lead time, certyfikaty, warunki płatności, alternatywy. Eksport do PDF lub PPTX dla CFO, zarządu lub komisji tenderowej.',
    howItWorks: [
      {
        step: '1',
        title: 'Dostawcy składają przez Supplier Portal',
        body: 'Wszystkie oferty przychodzą w strukturze — bez PDF do parsowania. Każda zawiera cenę bazową, quantity breaks, lead time, certyfikaty.',
      },
      {
        step: '2',
        title: 'System rankuje i highlightuje',
        body: 'Automatyczny ranking po ważonych kryteriach (cena, lead time, certyfikaty). Outliers oznaczone. Brakujące dane wyróżnione.',
      },
      {
        step: '3',
        title: 'Eksportuj lub negocjuj',
        body: 'Eksport PDF/PPTX dla stakeholderów. Albo wyślij counter-offer (counter-pricing, counter-MOQ) przez ten sam portal — dostawca odpowiada, akceptujesz.',
      },
    ],
    highlights: [
      'Porównanie side-by-side do 200 ofert',
      'Ranking ważony — konfiguruj swoje priorytety',
      'Porównanie quantity-break (cena przy 100, 1000, 10000 sztuk)',
      'Matryca certyfikatów (ISO, CE, FDA, GOTS)',
      'Eksport PDF / PPTX dla prezentacji zarządu',
      'Workflow counter-offer z historią negocjacji',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fPdfReports'],
    ctaTitle: 'Gotowy na koniec porównywania w Excelu?',
    ctaBody: 'Umów demo. Przejdziemy przez widok porównania z przykładowymi danymi RFQ z Twojej branży.',
    isSelfServe: false,
    interestTag: 'procurement_professional',
  },
}

export const features = isEN ? featuresEN : featuresPL

// Slug aliases (EN slug → PL key used in content)
export const FEATURE_SLUG_ALIASES: Record<string, string> = {
  'ai-sourcing': 'ai-sourcing',
  'email-outreach': 'outreach-mailowy',
  'supplier-portal': 'supplier-portal',
  'offer-comparison': 'porownywarka-ofert',
}

export function resolveFeatureSlug(slug: string): string {
  return FEATURE_SLUG_ALIASES[slug] || slug
}

export function getFeature(slug: string): FeatureContent | null {
  return features[resolveFeatureSlug(slug)] || null
}
