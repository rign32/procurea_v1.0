// Pricing page content — single source of truth for /cennik and /pricing
// Binding values from landing/docs/pricing-model.md

export type Module = 'sourcing' | 'procurement' | 'full'
export type Tier = 'starter' | 'professional' | 'enterprise'

// Monthly prices in USD. Annual = 20% discount.
export const PRICES: Record<Tier, Record<Module, number | null>> = {
  starter: { sourcing: 199, procurement: 249, full: 399 },
  professional: { sourcing: 499, procurement: 449, full: 849 },
  enterprise: { sourcing: 999, procurement: 649, full: 1499 },
}

// Campaigns per month per tier (same across modules)
export const CAMPAIGNS: Record<Tier, number> = {
  starter: 20,
  professional: 60,
  enterprise: 100,
}

// Annual discount
export const ANNUAL_DISCOUNT = 0.2

export function annualPrice(monthly: number): number {
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT))
}

export function annualSavings(monthly: number): number {
  return Math.round(monthly * 12 * ANNUAL_DISCOUNT)
}

// Procurement is not self-serve — contact sales
export function isContactSales(tier: Tier, module: Module): boolean {
  return module !== 'sourcing' // only Sourcing alone is self-serve; Procurement and Full require sales
}

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export const copy = {
  heroTitle: isEN ? 'Simple pricing that scales with you' : 'Przejrzysty cennik, który skaluje się z Tobą',
  heroSubtitle: isEN
    ? 'Start with AI Sourcing self-serve. Add Procurement workflow when you are ready to send RFQs, collect offers and close deals.'
    : 'Zacznij od AI Sourcingu — dostępny od razu po rejestracji. Dodaj Procurement workflow kiedy chcesz wysyłać RFQ, zbierać oferty i zamykać kontrakty.',

  billingMonthly: isEN ? 'Monthly' : 'Miesięcznie',
  billingAnnually: isEN ? 'Annually' : 'Rocznie',
  saveBadge: isEN ? 'Save 20%' : 'Oszczędzasz 20%',

  moduleSourcing: isEN ? 'AI Sourcing' : 'AI Sourcing',
  moduleProcurement: isEN ? '+ Procurement' : '+ Procurement',
  moduleFull: isEN ? 'Full Workflow' : 'Pełen Workflow',
  moduleFullBadge: isEN ? 'Save up to $149/mo' : 'Oszczędzasz do $149/mies',

  sourcingDesc: isEN ? 'Verified supplier shortlist. Self-serve.' : 'Zweryfikowana lista dostawców. Self-serve.',
  procurementDesc: isEN ? 'RFQ + portal + offers. Requires Sourcing.' : 'RFQ + portal + oferty. Wymaga Sourcingu.',
  fullDesc: isEN ? 'Complete workflow at a bundle discount.' : 'Kompletny workflow w cenie pakietu.',

  campaignsLabel: isEN ? 'campaigns / month' : 'kampanii / mies',
  monthlyLabel: isEN ? '/mo' : '/mies',
  annuallyLabel: isEN ? '/yr' : '/rok',
  perMonthBilled: isEN ? 'per month, billed annually' : 'miesięcznie, rozliczane rocznie',

  ctaSelfServe: isEN ? 'Start free research' : 'Rozpocznij za darmo',
  ctaContactSales: isEN ? 'Talk to sales' : 'Porozmawiaj z nami',
  ctaEnterpriseCustom: isEN ? 'Contact us' : 'Skontaktuj się',
  freeCreditsNote: isEN ? '10 free credits on signup' : '10 darmowych kredytów po rejestracji',

  // Tier cards
  starterName: 'Starter',
  starterDescSourcing: isEN ? 'For small teams doing ad-hoc sourcing' : 'Dla małych zespołów robiących ad-hoc sourcing',
  starterDescFull: isEN ? 'Starter plan with full procurement workflow' : 'Starter z pełnym workflow procurement',

  professionalName: 'Professional',
  professionalDescSourcing: isEN ? 'For procurement managers running campaigns weekly' : 'Dla kierowników zakupów prowadzących kampanie co tydzień',
  professionalDescFull: isEN ? 'Pro plan with full procurement + sequences + multilingual' : 'Pro z pełnym procurementem + sekwencje + wielojęzyczność',
  professionalBadge: isEN ? 'Most popular' : 'Najpopularniejszy',

  enterpriseName: 'Enterprise',
  enterpriseDescSourcing: isEN ? 'For procurement teams with API + priority processing' : 'Dla zespołów zakupowych z API + priority processing',
  enterpriseDescFull: isEN ? 'Enterprise with SLA, custom branding, dedicated support' : 'Enterprise z SLA, custom branding, dedicated support',

  enterpriseCustomName: 'Enterprise Custom',
  enterpriseCustomPrice: isEN ? 'From $25k / year' : 'Od $25k / rok',
  enterpriseCustomDesc: isEN
    ? 'Unlimited, dedicated instance, custom AI, white-label, SAP/Oracle native integrations.'
    : 'Unlimited, dedicated instance, custom AI, white-label, natywne integracje SAP/Oracle.',
  enterpriseCustomCampaigns: isEN ? 'Unlimited campaigns' : 'Bez limitu kampanii',

  // Comparison
  comparisonTitle: isEN ? 'Compare all features' : 'Porównaj wszystkie funkcje',
  comparisonSubtitle: isEN
    ? 'Every feature across tiers and modules, side by side.'
    : 'Wszystkie funkcje per tier i moduł, obok siebie.',

  // FAQ
  faqTitle: isEN ? 'Pricing FAQ' : 'FAQ o cennik',
  faq: isEN ? [
    { q: 'How do free credits work?', a: 'Every new user signs up with 10 free credits. Each credit runs one AI sourcing campaign. Business-email organizations share a pool of 10 credits; joining teammates add +3 bonus credits each. When credits run out, buy a pack or upgrade to a monthly plan.' },
    { q: 'Can I buy Procurement add-on without a Sourcing subscription?', a: 'No — Procurement (RFQ, portal, offers, comparison) operates on suppliers discovered via Sourcing. You need an active Sourcing plan at the same tier, or buy a Full Workflow Bundle.' },
    { q: 'Why is Procurement contact-sales only?', a: 'Procurement plans require workflow configuration — email templates, sequences, RFQ branding, supplier portal customization. We set this up together in a 30-minute onboarding call so you get value from day one.' },
    { q: 'What happens if I exceed my monthly campaign limit?', a: 'Soft overage — you pay a small per-campaign fee, and we suggest upgrading to the next tier if you hit the limit regularly. No hard blocks.' },
    { q: 'Can I cancel anytime?', a: 'All self-serve plans (Starter / Professional / Enterprise) are month-to-month. Cancel from your dashboard, no questions asked. Enterprise Custom is annual.' },
    { q: 'Do you offer annual discounts?', a: 'Yes — 20% off when paid annually. Applies to all self-serve plans.' },
    { q: 'Do prices include VAT?', a: 'Prices shown are in USD, net. VAT/taxes added per your jurisdiction for EU and Polish customers.' },
    { q: 'Which ERPs and CRMs do you integrate with?', a: 'Dynamics 365 Business Central is in pilot. Salesforce, Oracle NetSuite, Oracle Fusion Cloud and SAP S/4HANA are on roadmap (Q3–Q4 2026). Merge.dev covers 50+ additional systems. See /integrations for live status.' },
  ] : [
    { q: 'Jak działają darmowe kredyty?', a: 'Każdy nowy użytkownik otrzymuje 10 darmowych kredytów po rejestracji. Jeden kredyt = jedna kampania sourcingowa AI. Organizacje z biznesowym e-mailem dzielą wspólną pulę 10 kredytów; każdy kolejny członek zespołu dodaje +3 bonusowe kredyty. Gdy kredyty się skończą, kup pakiet lub upgrade do planu miesięcznego.' },
    { q: 'Czy mogę kupić Procurement add-on bez subskrypcji Sourcingu?', a: 'Nie — Procurement (RFQ, portal, oferty, porównywarka) działa na dostawcach znalezionych przez Sourcing. Potrzebujesz aktywnego planu Sourcing na tym samym tierze, lub Full Workflow Bundle.' },
    { q: 'Dlaczego Procurement jest tylko contact-sales?', a: 'Plany Procurement wymagają konfiguracji workflow — szablony maili, sekwencje, branding RFQ, customizacja portalu dostawcy. Ustawiamy to razem w 30-minutowym onboardingu, żebyś miał wartość od pierwszego dnia.' },
    { q: 'Co się dzieje gdy przekroczę miesięczny limit kampanii?', a: 'Soft overage — płacisz małą opłatę per dodatkowa kampania, i sugerujemy upgrade do wyższego tieru jeśli regularnie osiągasz limit. Brak hard blocków.' },
    { q: 'Czy mogę anulować w każdej chwili?', a: 'Wszystkie plany self-serve (Starter / Professional / Enterprise) są miesięczne. Anuluj z dashboardu, bez pytań. Enterprise Custom jest roczny.' },
    { q: 'Czy oferujecie rabaty roczne?', a: 'Tak — 20% zniżki przy płatności rocznej. Dotyczy wszystkich planów self-serve.' },
    { q: 'Czy ceny zawierają VAT?', a: 'Ceny pokazane są w USD, netto. VAT/podatki dodawane zgodnie z Twoją jurysdykcją dla klientów z UE i Polski.' },
    { q: 'Z jakimi systemami ERP i CRM się integrujecie?', a: 'Dynamics 365 Business Central jest w pilocie. Salesforce, Oracle NetSuite, Oracle Fusion Cloud i SAP S/4HANA na roadmapie (Q3-Q4 2026). Merge.dev pokrywa 50+ dodatkowych systemów. Status live na /integracje.' },
  ],
}

// Feature comparison matrix
export interface ComparisonRow {
  label: string
  // per column: true (included), false (not), string (custom value)
  values: [boolean | string, boolean | string, boolean | string, boolean | string] // [Starter, Pro, Enterprise, Enterprise Custom]
}

export interface ComparisonSection {
  label: string
  rows: ComparisonRow[]
}

export const comparisonEN: ComparisonSection[] = [
  {
    label: 'AI Sourcing (base module)',
    rows: [
      { label: 'Campaigns per month', values: ['20', '60', '100', 'Unlimited'] },
      { label: 'AI supplier shortlist', values: [true, true, true, true] },
      { label: 'AI classification & scoring', values: [true, true, true, true] },
      { label: 'CSV export', values: [true, true, true, true] },
      { label: 'Contact enrichment', values: [false, true, true, true] },
      { label: 'Multilingual research (26 languages)', values: [false, true, true, true] },
      { label: 'Company Registry (VAT, EORI, financials)', values: [false, true, true, true] },
      { label: 'Priority processing', values: [false, false, true, true] },
      { label: 'Custom filters', values: [false, false, true, true] },
      { label: 'REST API access', values: [false, false, true, true] },
    ],
  },
  {
    label: 'Procurement (add-on or included in Full bundle)',
    rows: [
      { label: 'RFQ email outreach', values: [true, true, true, true] },
      { label: 'Supplier Portal (magic link)', values: [true, true, true, true] },
      { label: 'Structured offer collection', values: [true, true, true, true] },
      { label: 'Offer comparison reports', values: [false, true, true, true] },
      { label: 'Auto follow-up sequences', values: [false, true, true, true] },
      { label: 'Multilingual outreach (Gemini translation)', values: [false, true, true, true] },
      { label: 'PDF / PPTX report export', values: [true, true, true, true] },
      { label: 'Counter-offer negotiation', values: [true, true, true, true] },
      { label: 'Custom portal branding', values: [false, false, true, true] },
      { label: 'Dedicated support', values: [false, false, true, true] },
      { label: 'SLA', values: [false, false, true, true] },
    ],
  },
  {
    label: 'Enterprise Custom only',
    rows: [
      { label: 'Dedicated instance', values: [false, false, false, true] },
      { label: 'Custom AI models', values: [false, false, false, true] },
      { label: 'White-label', values: [false, false, false, true] },
      { label: 'Native SAP / Oracle integration', values: [false, false, false, true] },
      { label: 'Custom contract + legal review', values: [false, false, false, true] },
    ],
  },
]

export const comparisonPL: ComparisonSection[] = [
  {
    label: 'AI Sourcing (moduł podstawowy)',
    rows: [
      { label: 'Kampanie miesięcznie', values: ['20', '60', '100', 'Bez limitu'] },
      { label: 'AI lista dostawców', values: [true, true, true, true] },
      { label: 'AI klasyfikacja i scoring', values: [true, true, true, true] },
      { label: 'Eksport CSV', values: [true, true, true, true] },
      { label: 'Enrichment kontaktów', values: [false, true, true, true] },
      { label: 'Wielojęzyczny research (26 języków)', values: [false, true, true, true] },
      { label: 'Company Registry (VAT, EORI, finanse)', values: [false, true, true, true] },
      { label: 'Priority processing', values: [false, false, true, true] },
      { label: 'Custom filtry', values: [false, false, true, true] },
      { label: 'REST API', values: [false, false, true, true] },
    ],
  },
  {
    label: 'Procurement (add-on lub w Full bundle)',
    rows: [
      { label: 'Email outreach RFQ', values: [true, true, true, true] },
      { label: 'Supplier Portal (magic link)', values: [true, true, true, true] },
      { label: 'Strukturalne zbieranie ofert', values: [true, true, true, true] },
      { label: 'Raporty porównawcze ofert', values: [false, true, true, true] },
      { label: 'Sekwencje auto follow-up', values: [false, true, true, true] },
      { label: 'Wielojęzyczny outreach (Gemini)', values: [false, true, true, true] },
      { label: 'Eksport raportów PDF / PPTX', values: [true, true, true, true] },
      { label: 'Counter-offer negocjacje', values: [true, true, true, true] },
      { label: 'Custom branding portalu', values: [false, false, true, true] },
      { label: 'Dedicated support', values: [false, false, true, true] },
      { label: 'SLA', values: [false, false, true, true] },
    ],
  },
  {
    label: 'Tylko Enterprise Custom',
    rows: [
      { label: 'Dedicated instance', values: [false, false, false, true] },
      { label: 'Custom modele AI', values: [false, false, false, true] },
      { label: 'White-label', values: [false, false, false, true] },
      { label: 'Natywna integracja SAP / Oracle', values: [false, false, false, true] },
      { label: 'Custom kontrakt + legal review', values: [false, false, false, true] },
    ],
  },
]

export const comparison = isEN ? comparisonEN : comparisonPL
