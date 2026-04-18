// Pricing page content — single source of truth for /cennik and /pricing
// Model: credit-based pay-as-you-go for 3 self-serve products + Enterprise Custom.
//
// Products (AI Procurement REQUIRES AI Sourcing — it is an extension, not standalone):
//   1. AI Sourcing credits — cheap ($) — base module, works standalone.
//      Run AI pipeline to find 50-250 qualified vendors.
//   2. AI Procurement credits — expensive ($$$) — extension, requires AI Sourcing.
//      Contact enrichment, email outreach in local language, auto follow-up,
//      supplier portal (magic link), offer collection/comparison, AI insights reports.
//   3. Bundle — same credit count across both modules, ~15% discount vs buying separately.
//      One bundle credit = one end-to-end campaign (sourcing → outreach → offers).
//   4. Enterprise Custom — unlimited, personalized onboarding, per-client ERP integration
//      (dedicated instance or on-premise), dedicated support.
//
// Pricing basis (provided by product owner 2026-04-16):
//   - AI Sourcing credit cost to us: ~2-5 PLN. Retail ~$89 for 10 credits (current Stripe packs).
//   - AI Procurement credit cost to us: ~15-20 PLN (5x higher — data enrichment, email infra,
//     portal hosting). Retail ~$349 for 10 credits.
//   - Bundle: ~15% discount vs buying separately at same volume.
//
// Values below are PROPOSED. Sourcing matches current Stripe packs in
// backend/src/billing/billing.service.ts (pack_10 $89, pack_25 $199, pack_50 $299).
// Procurement + Bundle require new Stripe products — backend task tracked separately.

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type Product = 'sourcing' | 'procurement' | 'bundle' | 'enterprise'

export interface CreditPack {
  credits: number
  price: number       // USD, net
  perCredit: number
  label: string
}

export interface ProductDefinition {
  key: Product
  name: string
  tagline: string
  description: string
  packs: CreditPack[] // empty for enterprise (contact-sales only)
  features: string[]
  cta: 'self-serve' | 'contact-sales'
  ctaLabel: string
  interestTag: string
  accent: 'neutral' | 'primary' | 'bundle' | 'enterprise'
  badge?: string
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

export const PRODUCTS: Record<Product, ProductDefinition> = {
  sourcing: {
    key: 'sourcing',
    name: 'AI Sourcing',
    tagline: isEN
      ? 'Find qualified suppliers. Pay per campaign.'
      : 'Znajduj zweryfikowanych dostawców. Płać za kampanię.',
    description: isEN
      ? 'AI pipeline scouts 50–250 qualified vendors per campaign across 26 languages. One-click export to Excel. Perfect for teams that already have their own outreach process.'
      : 'AI pipeline wyszukuje 50–250 zweryfikowanych dostawców na kampanię w 26 językach. Eksport do Excela jednym kliknięciem. Idealne dla zespołów z własnym procesem outreach.',
    packs: [
      { credits: 10, price: 89, perCredit: 8.9, label: '10 ' + (isEN ? 'campaigns' : 'kampanii') },
      { credits: 25, price: 199, perCredit: 7.96, label: '25 ' + (isEN ? 'campaigns' : 'kampanii') },
      { credits: 50, price: 299, perCredit: 5.98, label: '50 ' + (isEN ? 'campaigns' : 'kampanii') },
    ],
    features: isEN ? [
      'AI pipeline: 50–250 verified vendors per campaign',
      '26-language research across EU and global markets',
      'Supplier Database with AI scores and campaign history',
      'One-click Excel export of full supplier list',
      'Deduplication against your existing vendor base',
      '10 free credits on signup (no credit card)',
    ] : [
      'AI pipeline: 50–250 zweryfikowanych dostawców na kampanię',
      'Wielojęzyczny research w 26 językach (UE + globalnie)',
      'Baza Dostawców z ocenami AI i historią kampanii',
      'Eksport pełnej listy do Excela jednym kliknięciem',
      'Deduplikacja wobec istniejącej bazy dostawców',
      '10 darmowych kredytów po rejestracji (bez karty)',
    ],
    cta: 'self-serve',
    ctaLabel: isEN ? 'Start free' : 'Zacznij za darmo',
    interestTag: 'ai_sourcing',
    accent: 'neutral',
  },
  procurement: {
    key: 'procurement',
    name: 'AI Procurement',
    tagline: isEN
      ? 'Extend AI Sourcing with full RFQ workflow — outreach, portal, offers, comparison.'
      : 'Rozszerz AI Sourcing o pełny workflow RFQ — outreach, portal, oferty, porównanie.',
    description: isEN
      ? 'Everything that happens after you have a supplier list: contact enrichment, bulk email outreach in each supplier\'s local language, auto follow-up sequences, magic-link Supplier Portal for structured offer collection, AI-powered offer comparison and insight reports.'
      : 'Wszystko co dzieje się po otrzymaniu listy dostawców: enrichment kontaktów, masowa wysyłka RFQ w języku lokalnym dostawcy, automatyczne sekwencje follow-up, Supplier Portal z magic-link do strukturalnego zbierania ofert, porównanie ofert i AI insights.',
    packs: [
      { credits: 10, price: 349, perCredit: 34.9, label: '10 ' + (isEN ? 'campaigns' : 'kampanii') },
      { credits: 25, price: 799, perCredit: 31.96, label: '25 ' + (isEN ? 'campaigns' : 'kampanii') },
      { credits: 50, price: 1299, perCredit: 25.98, label: '50 ' + (isEN ? 'campaigns' : 'kampanii') },
    ],
    features: isEN ? [
      'Contact enrichment — decision-maker emails, phones, LinkedIn',
      'Email outreach localized per supplier country (26 languages)',
      'Auto follow-up sequences on your schedule',
      'Supplier Portal (magic link — no login needed for suppliers)',
      'Structured offer collection (quantity breaks, MOQ, lead time)',
      'Side-by-side offer comparison with weighted ranking',
      'AI Insights PDF/PPTX reports — ready for your CFO',
      'Counter-offer negotiation workflow',
    ] : [
      'Enrichment kontaktów — emaile decydentów, telefony, LinkedIn',
      'Email outreach zlokalizowany per kraj dostawcy (26 języków)',
      'Sekwencje auto follow-up na Twoim harmonogramie',
      'Supplier Portal (magic link — dostawcy bez logowania)',
      'Strukturalne zbieranie ofert (quantity breaks, MOQ, lead time)',
      'Porównanie ofert side-by-side z rankingiem ważonym',
      'Raporty AI Insights PDF/PPTX — gotowe dla CFO',
      'Workflow negocjacyjny counter-offer',
    ],
    cta: 'contact-sales',
    ctaLabel: isEN ? 'Talk to sales' : 'Porozmawiaj z nami',
    interestTag: 'ai_procurement',
    accent: 'primary',
  },
  bundle: {
    key: 'bundle',
    name: 'Bundle',
    tagline: isEN
      ? 'AI Sourcing + AI Procurement for every campaign. Save 15%.'
      : 'AI Sourcing + AI Procurement za każdą kampanię. Oszczędź 15%.',
    description: isEN
      ? 'Same credit count across both modules — one credit runs a full campaign from AI sourcing through outreach to offer collection. Best value for teams running procurement end-to-end.'
      : 'Ta sama liczba kredytów w obu modułach — jeden kredyt uruchamia pełną kampanię od AI sourcingu przez outreach do zbierania ofert. Najlepsza wartość dla zespołów prowadzących pełen procurement.',
    packs: [
      { credits: 10, price: 399, perCredit: 39.9, label: '10 ' + (isEN ? 'full campaigns' : 'pełnych kampanii') },
      { credits: 25, price: 899, perCredit: 35.96, label: '25 ' + (isEN ? 'full campaigns' : 'pełnych kampanii') },
      { credits: 50, price: 1399, perCredit: 27.98, label: '50 ' + (isEN ? 'full campaigns' : 'pełnych kampanii') },
    ],
    features: isEN ? [
      'Everything in AI Sourcing',
      'Everything in AI Procurement',
      'Same credit count across both modules',
      '~15% savings vs buying separately',
      'One credit = one end-to-end campaign',
      'Best for recurring sourcing needs',
    ] : [
      'Wszystko z AI Sourcing',
      'Wszystko z AI Procurement',
      'Ta sama liczba kredytów w obu modułach',
      'Oszczędność ~15% vs zakup osobno',
      'Jeden kredyt = jedna pełna kampania end-to-end',
      'Najlepsze dla powtarzalnych kampanii sourcingowych',
    ],
    cta: 'contact-sales',
    ctaLabel: isEN ? 'Talk to sales' : 'Porozmawiaj z nami',
    interestTag: 'bundle',
    accent: 'bundle',
    badge: isEN ? 'Save 15%' : 'Oszczędzasz 15%',
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise Custom',
    tagline: isEN
      ? 'Unlimited usage, dedicated instance, custom ERP integration.'
      : 'Bez limitu, dedicated instance, custom integracja ERP.',
    description: isEN
      ? 'For procurement teams with 10+ users, regulated industries, or complex ERP landscapes. Personalized onboarding, per-client integration build (SAP S/4HANA, Oracle Fusion, Dynamics F&O — native or on-premise), dedicated support with SLA.'
      : 'Dla zespołów procurement z 10+ użytkownikami, branż regulowanych lub złożonych landscape\'ów ERP. Personalizowany onboarding, integracja budowana per-klient (SAP S/4HANA, Oracle Fusion, Dynamics F&O — natywnie lub on-premise), dedicated support z SLA.',
    packs: [],
    features: isEN ? [
      'Unlimited campaigns (no per-credit pricing)',
      'Dedicated instance (cloud or on-premise)',
      'Personalized onboarding (2–4 week implementation)',
      'Per-client ERP/CRM integration — SAP, Oracle, Dynamics, Salesforce',
      'Custom AI models tuned to your category data',
      'White-label Supplier Portal',
      'Dedicated support engineer + SLA',
      'Custom legal / compliance review + contract terms',
    ] : [
      'Bez limitu kampanii (brak pricingu per-kredyt)',
      'Dedicated instance (cloud lub on-premise)',
      'Personalizowany onboarding (2–4 tygodnie wdrożenia)',
      'Integracja ERP/CRM per-klient — SAP, Oracle, Dynamics, Salesforce',
      'Custom modele AI dostrojone do Twoich danych kategorii',
      'White-label Supplier Portal',
      'Dedykowany inżynier wsparcia + SLA',
      'Custom przegląd legal/compliance + warunki kontraktu',
    ],
    cta: 'contact-sales',
    ctaLabel: isEN ? 'Contact us' : 'Skontaktuj się',
    interestTag: 'enterprise_custom',
    accent: 'enterprise',
    badge: isEN ? 'From $25k / year' : 'Od $25k / rok',
  },
}

export const ORDERED_PRODUCTS: Product[] = ['sourcing', 'procurement', 'bundle', 'enterprise']

export const copy = {
  heroTitle: isEN
    ? 'Transparent credit-based pricing'
    : 'Przejrzysty pricing credit-based',
  heroSubtitle: isEN
    ? 'AI Sourcing works standalone — find qualified suppliers in 26 languages. Add AI Procurement to extend any campaign with RFQ outreach, Supplier Portal, and offer comparison. Bundle includes both for every campaign at 15% off.'
    : 'AI Sourcing działa samodzielnie — znajdź dostawców w 26 językach. Dodaj AI Procurement, aby rozszerzyć kampanię o outreach RFQ, Supplier Portal i porównanie ofert. Bundle zawiera oba za każdą kampanię z 15% rabatem.',

  packLabel: isEN ? 'Credit packs' : 'Pakiety kredytów',
  perCreditLabel: isEN ? '/credit' : '/kredyt',
  fromLabel: isEN ? 'from' : 'od',

  howItWorksTitle: isEN ? 'How credits work' : 'Jak działają kredyty',
  howItWorksPoints: isEN ? [
    '1 credit = 1 AI Sourcing campaign (or 1 full Bundle campaign)',
    'Credits never expire',
    'Pay as you go — no subscription commitment',
    'Larger packs = lower per-credit cost',
    'Upgrade to Enterprise Custom when you need unlimited',
  ] : [
    '1 kredyt = 1 kampania AI Sourcingowa (lub 1 pełna kampania Bundle)',
    'Kredyty nigdy nie wygasają',
    'Pay-as-you-go — bez zobowiązania subskrypcji',
    'Większe pakiety = niższa cena per kredyt',
    'Upgrade do Enterprise Custom gdy potrzebujesz unlimited',
  ],

  faqTitle: isEN ? 'Pricing FAQ' : 'FAQ o cennik',
  faq: isEN ? [
    { q: 'What is a credit?', a: 'One AI Sourcing credit runs one campaign — describe what you need, AI finds 50–250 verified vendors, you get a full list with contacts and certifications. One Procurement credit runs one RFQ + offer collection workflow. Bundle credits do both end-to-end.' },
    { q: 'What are the free credits?', a: 'Every new account gets 10 free AI Sourcing credits on signup. No credit card required. Credits never expire — use them whenever you want.' },
    { q: 'Why is Procurement more expensive than Sourcing?', a: 'Procurement runs contact enrichment (third-party data lookups), sends emails via paid infrastructure, hosts Supplier Portal sessions, and uses more AI inference for translation and offer analysis. Our cost per credit is ~5x higher than Sourcing, so retail pricing reflects that.' },
    { q: 'Can I buy Procurement credits without Sourcing?', a: 'No — AI Procurement extends AI Sourcing. Each Procurement campaign runs on top of a Sourcing campaign. Buy the Sourcing credits you need, then add Procurement credits for the campaigns where you want full RFQ workflow. Bundle credits include both automatically.' },
    { q: 'Why is Bundle cheaper than buying separately?', a: 'Bundle assumes you run Sourcing + Procurement together in every campaign. We pre-commit capacity on both modules, pass ~15% savings to you. If you only need one module occasionally, buy that one — Bundle is for predictable end-to-end volume.' },
    { q: 'Do credits expire?', a: 'No. Credits never expire. Buy 50 credits today, use them over the next year or three — they are yours until you use them.' },
    { q: 'When do I need Enterprise Custom?', a: 'When you need unlimited usage, native SAP/Oracle/Dynamics integration, dedicated instance (or on-premise), custom SLA, or regulatory compliance review. Typically 10+ users or 500+ campaigns/year.' },
    { q: 'Do prices include VAT?', a: 'Prices shown are in USD, net. VAT/taxes added per your jurisdiction for EU and Polish customers.' },
  ] : [
    { q: 'Czym jest kredyt?', a: 'Jeden kredyt AI Sourcing uruchamia jedną kampanię — opisujesz czego szukasz, AI znajduje 50–250 zweryfikowanych dostawców, dostajesz pełną listę z kontaktami i certyfikatami. Jeden kredyt Procurement uruchamia jeden workflow RFQ + zbieranie ofert. Kredyty Bundle robią oba end-to-end.' },
    { q: 'Co to są darmowe kredyty?', a: 'Każde nowe konto dostaje 10 darmowych kredytów AI Sourcing po rejestracji. Bez karty kredytowej. Kredyty nigdy nie wygasają — używaj kiedy chcesz.' },
    { q: 'Dlaczego Procurement jest droższy niż Sourcing?', a: 'Procurement uruchamia enrichment kontaktów (third-party data lookup), wysyła maile przez płatną infrastrukturę, hostuje sesje Supplier Portal, używa więcej AI inference do tłumaczenia i analizy ofert. Nasz koszt per kredyt jest ~5x wyższy, więc retail pricing to odzwierciedla.' },
    { q: 'Czy mogę kupić kredyty Procurement bez Sourcingu?', a: 'Nie — AI Procurement rozszerza AI Sourcing. Każda kampania Procurement bazuje na kampanii Sourcing. Kup potrzebne kredyty Sourcing, a potem dodaj kredyty Procurement dla kampanii, w których chcesz pełny workflow RFQ. Kredyty Bundle zawierają oba automatycznie.' },
    { q: 'Dlaczego Bundle jest tańszy niż osobno?', a: 'Bundle zakłada że prowadzisz Sourcing + Procurement razem w każdej kampanii. Pre-commitujemy moce w obu modułach, przekazujemy ~15% oszczędności Tobie. Jeśli tylko czasami potrzebujesz jednego modułu — kup ten jeden; Bundle jest dla przewidywalnego end-to-end volumenu.' },
    { q: 'Czy kredyty wygasają?', a: 'Nie. Kredyty nigdy nie wygasają. Kup 50 kredytów dziś, używaj przez rok, dwa lub trzy — są Twoje dopóki ich nie zużyjesz.' },
    { q: 'Kiedy potrzebuję Enterprise Custom?', a: 'Gdy potrzebujesz bez-limitowego użycia, natywnej integracji SAP/Oracle/Dynamics, dedicated instance (lub on-premise), custom SLA lub przeglądu compliance regulacyjnego. Typowo 10+ użytkowników lub 500+ kampanii rocznie.' },
    { q: 'Czy ceny zawierają VAT?', a: 'Ceny pokazane są w USD, netto. VAT/podatki dodawane zgodnie z Twoją jurysdykcją dla klientów z UE i Polski.' },
  ],
}
