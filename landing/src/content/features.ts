// Feature page content — MVP P0 features with full copy + grouped by product/subgroup.
// Reference: landing/docs/pricing-model.md (credit-based products).

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Feature taxonomy:
//   - 'sourcing'    — AI Sourcing module (cheap credits): pipeline, Company Registry, 26-lang
//   - 'outreach'    — AI Procurement / Outreach subgroup: contact enrichment, email, follow-up, multilingual
//   - 'offers'      — AI Procurement / Offers subgroup: portal, collection, comparison
//   - 'insights'    — AI Procurement / Insights subgroup: AI reports PDF/PPTX
//   - 'integrations' — ERP/CRM integrations (Enterprise-tier), hub at /integrations
export type FeatureGroup = 'sourcing' | 'outreach' | 'offers' | 'insights' | 'integrations'

export interface FeatureContent {
  slug: string
  group: FeatureGroup
  tierBadge: string                 // e.g. "Available in AI Sourcing credits"
  heroTitle: string
  heroSubtitle: string
  howItWorks: { step: string; title: string; body: string }[]
  highlights: string[]
  relatedIndustries: string[]       // industry slugs (PL keys)
  relatedFeatures: string[]         // path keys from paths.ts
  ctaTitle: string
  ctaBody: string
  isSelfServe: boolean              // true for AI Sourcing pipeline, false for Procurement
  interestTag: string               // /kontakt?interest=X
  hasPage: boolean                  // true = proper feature page, false = hub only (placeholder)
}

// ------------------------------------------------------------------
// EN content
// ------------------------------------------------------------------
const featuresEN: Record<string, FeatureContent> = {
  'ai-sourcing': {
    slug: 'ai-sourcing',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · from $89 / 10 credits · 10 free on signup',
    heroTitle: 'AI Sourcing — 50–250 verified vendors in 20 minutes',
    heroSubtitle:
      'Describe what you need in plain language. Our AI pipeline searches 26 languages, verifies supplier capabilities, filters by certifications, and delivers a shortlist of 50–250 qualified vendors. One-click export to Excel.',
    howItWorks: [
      {
        step: '1',
        title: 'Describe what you need',
        body: 'Enter a category (e.g. "eco-friendly packaging, EU, FSC certified, 10k-50k units/month"). No search operators, no boolean logic — just plain language.',
      },
      {
        step: '2',
        title: 'AI pipeline runs in background',
        body: '4-agent pipeline: Strategy plans search queries across 26 languages → Screener evaluates each supplier → Enrichment fetches company data → Auditor validates results. Watch progress live.',
      },
      {
        step: '3',
        title: 'Shortlist ready in 2–20 minutes',
        body: 'First 20 suppliers arrive in 2–3 minutes. Full list of 50–250 vendors completes in 20 minutes. Export to Excel with one click, or pipe into AI Procurement to launch RFQ.',
      },
    ],
    highlights: [
      '26-language research across EU and global markets',
      'AI scoring: capability match, trust signals, certifications',
      'Company Registry lookup (VAT, EORI, financials) built-in',
      'One-click Excel export (full supplier list with contacts)',
      'Deduplicates against your existing supplier base',
      '10 free credits on signup — no credit card required',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fCompanyRegistry', 'fEmailOutreach'],
    ctaTitle: 'Start your first campaign free',
    ctaBody: 'Sign up with your work email. You get 10 free credits — enough to run your first 10 AI sourcing campaigns. No credit card required.',
    isSelfServe: true,
    interestTag: 'ai_sourcing',
    hasPage: true,
  },

  'company-registry': {
    slug: 'company-registry',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · included in every campaign',
    heroTitle: 'Company Registry — instant VAT, EORI, financial verification',
    heroSubtitle:
      'Every supplier the AI pipeline discovers is enriched with registry data: VAT / NIP / EORI numbers, financial health indicators, ownership structure, and registration status. No separate due diligence pass needed.',
    howItWorks: [
      {
        step: '1',
        title: 'Automatic enrichment',
        body: 'When the AI pipeline finds a supplier, we look them up in national and EU company registries. VAT number, EORI, financial data, ownership — all fetched automatically.',
      },
      {
        step: '2',
        title: 'Flag anomalies',
        body: 'Inactive registration, recent ownership changes, blacklisting flags, or missing VAT — all highlighted on the supplier card. You see risks before you reach out.',
      },
      {
        step: '3',
        title: 'Export with audit trail',
        body: 'Excel export includes registry data + verification date. Ready for tender documentation or internal audit.',
      },
    ],
    highlights: [
      'VAT / NIP / EORI numbers verified against official registries',
      'Financial health indicators (revenue, employee count)',
      'Ownership structure (for compliance / regulated procurement)',
      'Flag inactive or blacklisted entities',
      'Audit-ready export format',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'ochrona-zdrowia'],
    relatedFeatures: ['fAiSourcing'],
    ctaTitle: 'Every campaign includes registry data',
    ctaBody: 'Company Registry enrichment runs automatically on every AI Sourcing campaign — no additional configuration.',
    isSelfServe: true,
    interestTag: 'ai_sourcing',
    hasPage: false,
  },

  'outreach-mailowy': {
    slug: 'email-outreach',
    group: 'outreach',
    tierBadge: 'AI Procurement · from $349 / 10 credits · contact sales',
    heroTitle: 'Email Outreach — send RFQ to 200+ suppliers in one click',
    heroSubtitle:
      'Automated bulk RFQ emails, localized per supplier country. Track delivery, opens, and responses in one dashboard. Integrates with the Supplier Portal — no manual data entry.',
    howItWorks: [
      {
        step: '1',
        title: 'Pick suppliers from your sourcing campaign',
        body: 'Select 30, 50, or 200 suppliers from your AI Sourcing results. Each gets a unique Supplier Portal magic link.',
      },
      {
        step: '2',
        title: 'Customize or use template',
        body: 'Write your RFQ email once. System translates it per supplier language (German for Berlin, Polish for Warsaw). Attach specs, BOQ, drawings.',
      },
      {
        step: '3',
        title: 'Send and track responses',
        body: 'Mass-send via Resend infrastructure (inbox delivery, not spam). Dashboard shows deliveries, opens, and offers as they arrive through the Supplier Portal.',
      },
    ],
    highlights: [
      'Bulk RFQ to 200+ suppliers in one action',
      'Automatic language detection and translation',
      'Localized email templates per supplier country',
      'Delivery + open tracking',
      'Reply-to goes back to your team inbox',
      'Integrates with Supplier Portal for structured offer collection',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEnrichment', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Book a Procurement workflow demo',
    ctaBody: 'Email Outreach comes with the full Procurement workflow (enrichment, Supplier Portal, offer collection). We configure it together in a 30-minute onboarding call.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'enrichment-kontaktow': {
    slug: 'contact-enrichment',
    group: 'outreach',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'Contact Enrichment — decision-maker contacts per supplier',
    heroSubtitle:
      'Find verified decision-maker emails, phone numbers, and LinkedIn profiles for every supplier in your campaign. Feeds directly into Email Outreach for high-quality bulk RFQ.',
    howItWorks: [
      { step: '1', title: 'Automatic enrichment', body: 'Every supplier in a Procurement campaign gets enriched with decision-maker data — purchasing lead, procurement manager, CEO where relevant.' },
      { step: '2', title: 'Quality signals', body: 'Email deliverability score, LinkedIn profile verification, role seniority. You know which contacts are reliable before you send.' },
      { step: '3', title: 'Export or launch outreach', body: 'Use contacts for your own outreach, or pipe directly into Email Outreach workflow.' },
    ],
    highlights: [
      'Decision-maker emails (verified deliverability)',
      'Phone numbers + LinkedIn profiles',
      'Role seniority + tenure signals',
      'Automatic refresh when data ages',
      'Feeds Email Outreach workflow',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fAutoFollowUp'],
    ctaTitle: 'Book a demo',
    ctaBody: 'Contact Enrichment is part of AI Procurement credits. Book a 30-min call to see it running on your category.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'auto-follow-up': {
    slug: 'auto-follow-up',
    group: 'outreach',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'Auto Follow-up — sequences that reach non-responders',
    heroSubtitle:
      'Multi-step email sequences on your schedule. Reach suppliers who missed the first RFQ without any manual work. Stop automatically when a supplier submits an offer.',
    howItWorks: [
      { step: '1', title: 'Configure your cadence', body: 'Default: +3 days, +7 days, +14 days. Or set custom timing per campaign.' },
      { step: '2', title: 'Localized copy per step', body: 'Follow-up 1, 2, 3 — each in the supplier\'s local language. System handles tone (gentle, firm, final).' },
      { step: '3', title: 'Auto-stop on response', body: 'Supplier submits an offer → sequence stops automatically. No manual toggling.' },
    ],
    highlights: [
      '3-step default cadence (+3d, +7d, +14d)',
      'Configurable timing per campaign',
      'Localized copy per supplier country',
      'Auto-stop on response',
      'Response rate typically +30–50% vs single send',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fMultilingualOutreach'],
    ctaTitle: 'Book a demo',
    ctaBody: 'Auto Follow-up is part of AI Procurement credits. See it in action in a 30-min demo.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'wielojezyczny-outreach': {
    slug: 'multilingual-outreach',
    group: 'outreach',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'Multilingual Outreach — 26 languages via Gemini',
    heroSubtitle:
      'Talk to every supplier in their local language. Gemini-powered translation preserves context, terminology, and tone. Response rate 2–3x higher than English-only outreach.',
    howItWorks: [
      { step: '1', title: 'Write once in your language', body: 'Draft your RFQ email in English, Polish, or any supported language. No templating required.' },
      { step: '2', title: 'Gemini translates per supplier', body: 'System detects supplier country → translates to local language (German for DE, Turkish for TR, Italian for IT). Preserves technical terminology and commercial tone.' },
      { step: '3', title: 'Supplier responds in their language', body: 'Supplier Portal accepts offers in the supplier\'s language. We translate back for your team.' },
    ],
    highlights: [
      '26 languages supported (EU + global markets)',
      'Gemini 2.0 Flash translation',
      'Preserves technical terminology',
      'Commercial tone adjustments',
      'Two-way translation (outreach + responses)',
      'Response rate lift: typically 2–3x vs English-only',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fAutoFollowUp'],
    ctaTitle: 'Book a demo',
    ctaBody: 'Multilingual Outreach is part of AI Procurement credits. See the 2-way translation flow in a 30-min demo.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'supplier-portal': {
    slug: 'supplier-portal',
    group: 'offers',
    tierBadge: 'AI Procurement · contact sales',
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
        title: 'See offers in real-time',
        body: 'Each submission appears in your dashboard. Side-by-side offer comparison (with Offer Comparison feature). No PDF parsing, no email forwarding — structured data from day one.',
      },
    ],
    highlights: [
      'No supplier account needed — magic link only',
      'Portal auto-translated to supplier language',
      'Structured price tiers, MOQ, lead time, alternatives',
      'Supplier uploads certificates, samples, catalogs',
      'Custom branding per organization (Enterprise Custom)',
      'Mobile-responsive — suppliers respond from phone',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'See the Supplier Portal in action',
    ctaBody: 'Book a demo. We send you a test RFQ, you open the supplier side, and see exactly what your vendors will see.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'zbieranie-ofert': {
    slug: 'offer-collection',
    group: 'offers',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'Offer Collection — structured quotes, not PDF attachments',
    heroSubtitle:
      'Every offer comes in as structured data: price tiers, quantity breaks, alternatives, attachments. No more parsing PDFs or chasing email threads.',
    howItWorks: [
      { step: '1', title: 'Standard form for every supplier', body: 'Same form for every supplier across every campaign. Price, MOQ, lead time, Incoterms, certifications, alternatives, attachments.' },
      { step: '2', title: 'Auto-validation', body: 'Missing fields flagged. Inconsistent data (e.g. MOQ > requested quantity) highlighted. You catch errors before you compare.' },
      { step: '3', title: 'Machine-readable output', body: 'Offers land as structured JSON in our DB. Export to CSV/Excel or pipe into Offer Comparison for ranking.' },
    ],
    highlights: [
      'Tiered pricing (quantity breaks)',
      'MOQ, lead time, Incoterms as structured fields',
      'Alternatives (e.g. alternative material, alternative finish)',
      'Certificate + sample + catalog attachments',
      'Auto-validation against RFQ requirements',
      'Feeds Offer Comparison + AI Insights workflow',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fOfferComparison', 'fAiInsights'],
    ctaTitle: 'Book a demo',
    ctaBody: 'See the structured offer form + how it feeds into comparison and AI insights.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'porownywarka-ofert': {
    slug: 'offer-comparison',
    group: 'offers',
    tierBadge: 'AI Procurement · contact sales',
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
    relatedFeatures: ['fSupplierPortal', 'fAiInsights'],
    ctaTitle: 'Ready to end spreadsheet comparison?',
    ctaBody: 'Book a demo. We walk through a comparison view with sample RFQ data from your industry.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'ai-insights': {
    slug: 'ai-insights',
    group: 'insights',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'AI Insights — procurement reports that read themselves',
    heroSubtitle:
      'Gemini-powered analysis of every campaign: spend breakdown, vendor concentration risk, negotiation opportunities, and benchmarks. Auto-generated PDF/PPTX reports ready for your CFO or board.',
    howItWorks: [
      { step: '1', title: 'Data from every step of the campaign', body: 'Sourcing pipeline results + RFQ responses + offers + negotiation history — all feed into the insights engine.' },
      { step: '2', title: 'AI identifies patterns', body: 'Gemini analyzes: which vendors are outliers, where negotiation leverage exists, which certifications are gated, how pricing stacks up vs market.' },
      { step: '3', title: 'Export-ready PDF / PPTX', body: 'Pre-formatted deck with executive summary, vendor rankings, cost analysis charts, and negotiation recommendations. No manual formatting.' },
    ],
    highlights: [
      'Gemini 2.0 Flash analysis per campaign',
      'Vendor concentration + supply chain risk scoring',
      'Negotiation leverage identification',
      'Price benchmarking vs market',
      'Executive summary + detailed appendix',
      'PDF / PPTX export — board-ready formatting',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fOfferComparison', 'fSupplierPortal'],
    ctaTitle: 'Book a demo',
    ctaBody: 'See a sample AI Insights report based on real sourcing data. Procurement category of your choice.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },
}

// ------------------------------------------------------------------
// PL content
// ------------------------------------------------------------------
const featuresPL: Record<string, FeatureContent> = {
  'ai-sourcing': {
    slug: 'ai-sourcing',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · od $89 / 10 kredytów · 10 darmowych po rejestracji',
    heroTitle: 'AI Sourcing — 50–250 zweryfikowanych dostawców w 20 minut',
    heroSubtitle:
      'Opisz czego szukasz zwykłym językiem. Nasz AI pipeline przeszukuje 26 języków, weryfikuje możliwości dostawców, filtruje po certyfikatach i dostarcza listę 50–250 zakwalifikowanych vendorów. Eksport do Excela jednym kliknięciem.',
    howItWorks: [
      {
        step: '1',
        title: 'Opisz czego szukasz',
        body: 'Wpisz kategorię (np. "opakowania ekologiczne, UE, certyfikat FSC, 10k-50k sztuk/mies"). Bez operatorów, bez boolean logic — zwykły język.',
      },
      {
        step: '2',
        title: 'AI pipeline działa w tle',
        body: '4-agentowy pipeline: Strategia planuje zapytania w 26 językach → Screener ocenia każdego dostawcę → Enrichment pobiera dane firm → Auditor waliduje wyniki. Śledzisz postęp na żywo.',
      },
      {
        step: '3',
        title: 'Shortlista gotowa w 2–20 minut',
        body: 'Pierwsze 20 dostawców po 2–3 minutach. Pełna lista 50–250 vendorów za 20 minut. Eksportujesz do Excela jednym kliknięciem, lub podłączasz do AI Procurement żeby uruchomić RFQ.',
      },
    ],
    highlights: [
      'Research w 26 językach (UE + globalnie)',
      'AI scoring: dopasowanie możliwości, sygnały trust, certyfikaty',
      'Company Registry (VAT, EORI, dane finansowe) wbudowany',
      'Eksport do Excela jednym kliknięciem (pełna lista z kontaktami)',
      'Deduplikacja wobec istniejącej bazy dostawców',
      '10 darmowych kredytów po rejestracji — bez karty',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fCompanyRegistry', 'fEmailOutreach'],
    ctaTitle: 'Rozpocznij pierwszą kampanię za darmo',
    ctaBody: 'Zarejestruj się służbowym mailem. Dostajesz 10 darmowych kredytów — wystarczy na 10 pierwszych kampanii AI sourcingu. Bez karty kredytowej.',
    isSelfServe: true,
    interestTag: 'ai_sourcing',
    hasPage: true,
  },

  'company-registry': {
    slug: 'company-registry',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · wliczone w każdą kampanię',
    heroTitle: 'Company Registry — błyskawiczna weryfikacja VAT, EORI i finansów',
    heroSubtitle:
      'Każdy dostawca znaleziony przez AI pipeline jest wzbogacony o dane rejestrowe: numery VAT / NIP / EORI, wskaźniki finansowe, strukturę własności, status rejestracji. Bez osobnego procesu due diligence.',
    howItWorks: [
      { step: '1', title: 'Automatyczny enrichment', body: 'Gdy AI pipeline znajduje dostawcę, wyszukujemy go w rejestrach krajowych i unijnych. VAT, EORI, finanse, własność — wszystko pobierane automatycznie.' },
      { step: '2', title: 'Flagowanie anomalii', body: 'Nieaktywna rejestracja, zmiany własności, blacklisty, brak VAT — wszystko highlightowane na karcie dostawcy. Widzisz ryzyka zanim się odezwiesz.' },
      { step: '3', title: 'Eksport z audit trail', body: 'Export Excel zawiera dane rejestrowe + datę weryfikacji. Gotowe pod dokumentację tendera lub audyt wewnętrzny.' },
    ],
    highlights: [
      'Numery VAT / NIP / EORI zweryfikowane wobec oficjalnych rejestrów',
      'Wskaźniki finansowe (przychód, zatrudnienie)',
      'Struktura własności (dla compliance / regulowanego procurement)',
      'Flagowanie nieaktywnych lub blacklistowanych podmiotów',
      'Format eksportu gotowy pod audyt',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'ochrona-zdrowia'],
    relatedFeatures: ['fAiSourcing'],
    ctaTitle: 'Każda kampania zawiera dane rejestrowe',
    ctaBody: 'Enrichment Company Registry działa automatycznie na każdej kampanii AI Sourcing — bez dodatkowej konfiguracji.',
    isSelfServe: true,
    interestTag: 'ai_sourcing',
    hasPage: false,
  },

  'outreach-mailowy': {
    slug: 'email-outreach',
    group: 'outreach',
    tierBadge: 'AI Procurement · od $349 / 10 kredytów · porozmawiaj z nami',
    heroTitle: 'Email Outreach — RFQ do 200+ dostawców jednym kliknięciem',
    heroSubtitle:
      'Zautomatyzowane bulk-RFQ, zlokalizowane per kraj dostawcy. Śledź dostarczenia, otwarcia i odpowiedzi w jednym dashboardzie. Integruje się z Supplier Portalem — bez ręcznego wpisywania danych.',
    howItWorks: [
      {
        step: '1',
        title: 'Wybierz dostawców z kampanii sourcingowej',
        body: 'Zaznacz 30, 50 lub 200 dostawców z wyników AI Sourcingu. Każdy dostaje unikalny magic link do Supplier Portalu.',
      },
      {
        step: '2',
        title: 'Customizuj lub użyj szablonu',
        body: 'Napisz RFQ raz. System tłumaczy per język dostawcy (niemiecki dla Berlina, polski dla Warszawy). Załącz spec, BOQ, rysunki.',
      },
      {
        step: '3',
        title: 'Wyślij i śledź odpowiedzi',
        body: 'Masowa wysyłka przez Resend (do inbox, nie spam). Dashboard pokazuje dostarczenia, otwarcia i oferty przybywające przez Supplier Portal.',
      },
    ],
    highlights: [
      'Bulk RFQ do 200+ dostawców w jednej akcji',
      'Automatyczne wykrywanie języka i tłumaczenie',
      'Lokalizowane szablony maili per kraj dostawcy',
      'Tracking dostarczenia + otwarcia',
      'Reply-to wraca do inboxa Twojego zespołu',
      'Integracja z Supplier Portalem dla strukturalnego zbierania ofert',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEnrichment', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Umów demo Procurement workflow',
    ctaBody: 'Email Outreach przychodzi z pełnym workflow Procurement (enrichment, Supplier Portal, zbieranie ofert). Konfigurujemy to razem w 30-minutowym onboardingu.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'enrichment-kontaktow': {
    slug: 'contact-enrichment',
    group: 'outreach',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'Enrichment Kontaktów — kontakty do decydentów per dostawca',
    heroSubtitle:
      'Znajdź zweryfikowane emaile decydentów, telefony i profile LinkedIn dla każdego dostawcy w Twojej kampanii. Zasila bezpośrednio Email Outreach dla wysokiej jakości bulk RFQ.',
    howItWorks: [
      { step: '1', title: 'Automatyczny enrichment', body: 'Każdy dostawca w kampanii Procurement dostaje enrichment o dane decydentów — purchasing lead, manager procurement, CEO gdzie relevantne.' },
      { step: '2', title: 'Sygnały jakości', body: 'Score deliverability maila, weryfikacja profilu LinkedIn, seniority roli. Wiesz które kontakty są rzetelne przed wysyłką.' },
      { step: '3', title: 'Eksport lub uruchom outreach', body: 'Użyj kontaktów do własnego outreach, lub podłącz bezpośrednio do workflow Email Outreach.' },
    ],
    highlights: [
      'Emaile decydentów (zweryfikowana deliverability)',
      'Numery telefonów + profile LinkedIn',
      'Seniority roli + sygnały tenure',
      'Automatyczny refresh gdy dane się starzeją',
      'Zasila workflow Email Outreach',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fAutoFollowUp'],
    ctaTitle: 'Umów demo',
    ctaBody: 'Enrichment Kontaktów jest częścią kredytów AI Procurement. Umów 30-minutowe spotkanie żeby zobaczyć to na Twojej kategorii.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'auto-follow-up': {
    slug: 'auto-follow-up',
    group: 'outreach',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'Auto Follow-up — sekwencje docierające do nierespondentów',
    heroSubtitle:
      'Wielo-krokowe sekwencje maili na Twoim harmonogramie. Dotrzyj do dostawców którzy pominęli pierwsze RFQ bez żadnej ręcznej pracy. Zatrzymaj się automatycznie gdy dostawca złoży ofertę.',
    howItWorks: [
      { step: '1', title: 'Skonfiguruj cadence', body: 'Domyślnie: +3 dni, +7 dni, +14 dni. Lub custom timing per kampania.' },
      { step: '2', title: 'Zlokalizowane copy per krok', body: 'Follow-up 1, 2, 3 — każdy w lokalnym języku dostawcy. System handluje tonem (delikatny, stanowczy, finalny).' },
      { step: '3', title: 'Auto-stop po odpowiedzi', body: 'Dostawca składa ofertę → sekwencja zatrzymuje się automatycznie. Bez ręcznego togglowania.' },
    ],
    highlights: [
      '3-krokowy default cadence (+3d, +7d, +14d)',
      'Konfigurowalny timing per kampania',
      'Zlokalizowane copy per kraj dostawcy',
      'Auto-stop po odpowiedzi',
      'Response rate typowo +30–50% vs pojedyncza wysyłka',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fMultilingualOutreach'],
    ctaTitle: 'Umów demo',
    ctaBody: 'Auto Follow-up jest częścią kredytów AI Procurement. Zobacz w akcji w 30-minutowym demo.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'wielojezyczny-outreach': {
    slug: 'multilingual-outreach',
    group: 'outreach',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'Wielojęzyczny Outreach — 26 języków przez Gemini',
    heroSubtitle:
      'Rozmawiaj z każdym dostawcą w jego lokalnym języku. Tłumaczenie Gemini zachowuje kontekst, terminologię i ton. Response rate 2–3x wyższy niż outreach tylko po angielsku.',
    howItWorks: [
      { step: '1', title: 'Napisz raz w swoim języku', body: 'Napisz RFQ w angielskim, polskim, lub dowolnym obsługiwanym języku. Bez templatowania.' },
      { step: '2', title: 'Gemini tłumaczy per dostawca', body: 'System wykrywa kraj dostawcy → tłumaczy na lokalny język (niemiecki dla DE, turecki dla TR, włoski dla IT). Zachowuje techniczną terminologię i ton komercyjny.' },
      { step: '3', title: 'Dostawca odpowiada w swoim języku', body: 'Supplier Portal przyjmuje oferty w języku dostawcy. Tłumaczymy z powrotem dla Twojego zespołu.' },
    ],
    highlights: [
      '26 obsługiwanych języków (UE + rynki globalne)',
      'Tłumaczenie Gemini 2.0 Flash',
      'Zachowuje techniczną terminologię',
      'Adjustacje tonu komercyjnego',
      'Tłumaczenie dwukierunkowe (outreach + odpowiedzi)',
      'Response rate lift: typowo 2–3x vs English-only',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'retail-ecommerce'],
    relatedFeatures: ['fEmailOutreach', 'fAutoFollowUp'],
    ctaTitle: 'Umów demo',
    ctaBody: 'Wielojęzyczny Outreach jest częścią kredytów AI Procurement. Zobacz 2-way translation flow w 30-min demo.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'supplier-portal': {
    slug: 'supplier-portal',
    group: 'offers',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
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
        body: 'Każde złożenie pojawia się w Twoim dashboardzie. Porównanie side-by-side (z feature Offer Comparison). Bez parsowania PDF, bez forwardowania maili — strukturalne dane od pierwszego dnia.',
      },
    ],
    highlights: [
      'Bez konta dostawcy — tylko magic link',
      'Portal automatycznie tłumaczony na język dostawcy',
      'Strukturalne price tiers, MOQ, lead time, alternatywy',
      'Dostawca uploaduje certyfikaty, sample, katalogi',
      'Custom branding per organizacja (Enterprise Custom)',
      'Mobile-responsive — dostawcy odpowiadają z telefonu',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'Zobacz Supplier Portal w akcji',
    ctaBody: 'Umów demo. Wyślemy Ci testowe RFQ, otworzysz stronę dostawcy, zobaczysz dokładnie co widzą Twoi vendorzy.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'zbieranie-ofert': {
    slug: 'offer-collection',
    group: 'offers',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'Zbieranie Ofert — strukturalne quotes, nie PDF-y w załącznikach',
    heroSubtitle:
      'Każda oferta przychodzi jako strukturalne dane: price tiers, quantity breaks, alternatywy, załączniki. Bez parsowania PDF, bez gonienia za chainami maili.',
    howItWorks: [
      { step: '1', title: 'Standardowy formularz dla każdego dostawcy', body: 'Ten sam formularz dla każdego dostawcy w każdej kampanii. Cena, MOQ, lead time, Incoterms, certyfikaty, alternatywy, załączniki.' },
      { step: '2', title: 'Auto-walidacja', body: 'Brakujące pola oflagowane. Niespójne dane (np. MOQ > requested quantity) highlightowane. Łapiesz błędy zanim porównasz.' },
      { step: '3', title: 'Machine-readable output', body: 'Oferty lądują jako strukturalny JSON w naszej DB. Export do CSV/Excel lub podłączenie do Offer Comparison dla rankingu.' },
    ],
    highlights: [
      'Tiered pricing (quantity breaks)',
      'MOQ, lead time, Incoterms jako pola strukturalne',
      'Alternatywy (np. alternatywny materiał, finisz)',
      'Załączniki: certyfikaty + sample + katalogi',
      'Auto-walidacja względem wymagań RFQ',
      'Zasila workflow Offer Comparison + AI Insights',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fOfferComparison', 'fAiInsights'],
    ctaTitle: 'Umów demo',
    ctaBody: 'Zobacz strukturalny formularz oferty + jak zasila porównanie i AI insights.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },

  'porownywarka-ofert': {
    slug: 'offer-comparison',
    group: 'offers',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
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
    relatedFeatures: ['fSupplierPortal', 'fAiInsights'],
    ctaTitle: 'Gotowy na koniec porównywania w Excelu?',
    ctaBody: 'Umów demo. Przejdziemy przez widok porównania z przykładowymi danymi RFQ z Twojej branży.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'ai-insights': {
    slug: 'ai-insights',
    group: 'insights',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'AI Insights — raporty procurement które same się piszą',
    heroSubtitle:
      'Analiza Gemini każdej kampanii: breakdown wydatków, koncentracja vendorów, możliwości negocjacyjne, benchmarki. Auto-generowane raporty PDF/PPTX gotowe dla CFO lub zarządu.',
    howItWorks: [
      { step: '1', title: 'Dane z każdego etapu kampanii', body: 'Wyniki AI Sourcingu + odpowiedzi RFQ + oferty + historia negocjacji — wszystko zasila silnik insights.' },
      { step: '2', title: 'AI identyfikuje wzorce', body: 'Gemini analizuje: którzy vendorzy są outlierami, gdzie istnieje leverage negocjacyjny, które certyfikaty są gated, jak pricing wypada vs rynek.' },
      { step: '3', title: 'Export-ready PDF / PPTX', body: 'Pre-formatowany deck z executive summary, rankingiem vendorów, wykresami analizy kosztów i rekomendacjami negocjacyjnymi. Bez ręcznego formatowania.' },
    ],
    highlights: [
      'Analiza Gemini 2.0 Flash per kampania',
      'Scoring koncentracji vendorów + supply chain risk',
      'Identyfikacja leverage negocjacyjnego',
      'Benchmarking cenowy vs rynek',
      'Executive summary + szczegółowy appendix',
      'Eksport PDF / PPTX — board-ready formatowanie',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fOfferComparison', 'fSupplierPortal'],
    ctaTitle: 'Umów demo',
    ctaBody: 'Zobacz przykładowy raport AI Insights na podstawie rzeczywistych danych sourcingu. Kategoria procurement Twojego wyboru.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: false,
  },
}

export const features = isEN ? featuresEN : featuresPL

// Slug aliases (EN slug → PL key used in content).
// When you add a new feature, update BOTH: features{EN,PL} and this alias table.
export const FEATURE_SLUG_ALIASES: Record<string, string> = {
  'ai-sourcing': 'ai-sourcing',
  'company-registry': 'company-registry',
  'email-outreach': 'outreach-mailowy',
  'contact-enrichment': 'enrichment-kontaktow',
  'auto-follow-up': 'auto-follow-up',
  'multilingual-outreach': 'wielojezyczny-outreach',
  'supplier-portal': 'supplier-portal',
  'offer-collection': 'zbieranie-ofert',
  'offer-comparison': 'porownywarka-ofert',
  'ai-insights': 'ai-insights',
}

export function resolveFeatureSlug(slug: string): string {
  return FEATURE_SLUG_ALIASES[slug] || slug
}

export function getFeature(slug: string): FeatureContent | null {
  return features[resolveFeatureSlug(slug)] || null
}
