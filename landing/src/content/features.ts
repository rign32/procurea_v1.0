// Feature page content — MVP P0 features with full copy + grouped by product/subgroup.
// Reference: landing/docs/pricing-model.md (credit-based products).

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Feature taxonomy:
//   - 'sourcing'    — AI Sourcing module (cheap credits): pipeline, Supplier Database, 26-lang
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

  // ---- Extended sections (optional, used by flagship feature pages) ----
  problemSection?: {
    heading: string
    paragraphs: string[]            // 2–3 narrative paragraphs
  }
  detailedSteps?: {                 // alt to howItWorks — richer per-step copy
    step: string
    title: string
    body: string
    techDetail?: string             // optional technical insight line
  }[]
  capabilityGroups?: {
    groupLabel: string              // e.g. "Search", "Enrichment", "Quality", "Export"
    items: string[]                 // 2–3 items per group
  }[]
  useCasesByIndustry?: {
    industry: string                // "Manufacturing" / "Events" / "Construction" / "Retail"
    industrySlug: string            // slug used for linking to industry page
    scenario: string                // 1-sentence scenario
    before: string                  // situation without Procurea
    after: string                   // situation with Procurea
  }[]
  integrationsHighlight?: {
    heading: string
    body: string
    bullets: string[]               // 3–4 integration bullets
  }
  faq?: {
    q: string
    a: string
  }[]
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
      'Describe what you need in plain language. Our AI-native pipeline plans a search strategy across 26 languages, crawls directories and sources traditional tools miss, scores every supplier for capability fit, and enriches the shortlist with contact data and certification evidence. First 20 vendors land in your dashboard in under three minutes; the full list of 50–250 qualified suppliers — deduplicated against your existing base — is Excel-ready in about 20.',
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
      'Supplier Database with AI scores, contacts, and certification tracking',
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

    problemSection: {
      heading: 'Manual sourcing is broken — and it is costing your team weeks on every project.',
      paragraphs: [
        'A typical procurement team spends 30+ hours on a single category search: Googling in one or two languages, scraping lists from association websites, cross-checking half a dozen directories, pasting results into a sprawling Excel that immediately starts going stale. The real vendors you need — niche, regional, certified — hide behind local-language sites, on page 7 of Google, or inside specialized directories you have never heard of. You cannot read Turkish, Italian or Polish supplier catalogs at scale, so you default to the same 20 names everyone in your industry already contacts.',
        'Legacy tools do not help. Traditional supplier databases were built a decade ago: they charge $40k+ per seat, cover maybe one region well, and their data ages out in months. B2B marketplaces show only vendors who pay to list. Your own ERP supplier master only reflects who you have already worked with. None of these find the new, better, cheaper vendor who just entered the market last quarter.',
        'Meanwhile your CFO is asking why supply costs are up 8%, your category managers are drowning in RFQ admin, and every time the board pushes a nearshoring initiative you restart the research from scratch. Sourcing should not be the bottleneck of modern procurement — but until now, there was no tool built for how AI actually works in 2026.',
      ],
    },
    detailedSteps: [
      {
        step: '1',
        title: 'Describe what you need — in one sentence',
        body: 'Type a prompt the way you would brief a colleague: "Injection-molding vendors in the EU for automotive interior parts, IATF 16949 required, 50k-500k units/year, lead time under 8 weeks." No boolean operators, no tag pickers, no search syntax. The prompt can be in any of 26 supported languages — the pipeline understands Polish, German, Turkish, Italian, French, Spanish, English and more natively.',
        techDetail: 'Powered by Gemini 2.0 Flash — the same model behind the AI interpretation of your brief is used to plan search queries across every supported market.',
      },
      {
        step: '2',
        title: 'The Strategy agent plans a multi-market search',
        body: 'Before a single query is sent, the Strategy agent decomposes your brief into sub-categories, selects the 5–15 most relevant countries, and generates 20–40 targeted search queries per country — each written in the local language with local taxonomy. It picks the right directories (Wer liefert was, Kompass, GoldenLine, Europages, national chambers of commerce) and the right long-tail web queries, calibrated to your certification and capacity constraints.',
        techDetail: 'Strategy output includes a query budget plan — you see exactly how many searches will run and can adjust scope before the campaign starts.',
      },
      {
        step: '3',
        title: 'The Scanning agent crawls the web in parallel',
        body: 'Up to 20 worker threads run simultaneously, combining Google search (via Serper.dev), direct crawls of supplier directories, national company registries, and trade association listings. Rate limiting, retry logic and a disk-backed cache keep cost under $2.50 per campaign while pulling from sources legacy databases never touch. Every URL found is scraped and fed to the next stage — no human paging through results.',
        techDetail: '90-day cache TTL means a follow-up campaign in the same category costs roughly half as much and runs in minutes.',
      },
      {
        step: '4',
        title: 'The Analysis agent scores every supplier for fit',
        body: 'Each candidate is evaluated against your brief by an LLM reviewer: does the website evidence the capability you asked for? Are the certifications you need mentioned or implied? Is the company size in range? Are there trust signals — clients listed, case studies, ISO marks — or red flags (empty about page, dormant social, broken contact forms)? Suppliers are scored 0–100 and the obvious misfits are dropped before enrichment to keep the shortlist tight.',
        techDetail: 'Scoring rubric is consistent across campaigns — so vendors from your last 5 searches are directly comparable.',
      },
      {
        step: '5',
        title: 'The Enrichment agent fills in the missing data',
        body: 'For every qualified supplier, the enrichment pass pulls: company website and contact details (email, phone, LinkedIn), certification evidence, and a deduplication check against suppliers already in your Procurea Supplier Database. What lands in your dashboard is a shortlist you can act on immediately — Excel export, bulk RFQ through AI Procurement, or ERP push via API.',
        techDetail: 'An Auditor pass runs last to flag inconsistencies — e.g. a capability claim the LLM could not verify on the site, or missing contact information.',
      },
    ],
    capabilityGroups: [
      {
        groupLabel: 'Search',
        items: [
          '26-language native research — Polish, German, French, Italian, Spanish, Turkish, Dutch, Czech, and 18 more',
          'Multi-source coverage — national registries, trade directories, association listings, long-tail web',
          'Regional search strategies calibrated per category (EU-focused, global, near-shoring, reshoring)',
        ],
      },
      {
        groupLabel: 'Enrichment',
        items: [
          'Centralized Supplier Database — AI match scores, contact details, certifications, and campaign history per vendor',
          'Decision-maker contacts — purchasing lead, procurement manager, CEO — with deliverability signals',
          'Automatic deduplication against your existing supplier base (ERP sync or manual upload)',
        ],
      },
      {
        groupLabel: 'Quality',
        items: [
          'AI capability scoring — suppliers ranked 0–100 on how well they match your brief, with visible reasoning',
          'Certification filters — ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS and more',
        ],
      },
      {
        groupLabel: 'Export',
        items: [
          'One-click Excel — full supplier list with all enriched fields, audit-ready format',
          'Pipe directly into AI Procurement — launch RFQ, collect quotes, compare offers without leaving Procurea',
        ],
      },
    ],
    useCasesByIndustry: [
      {
        industry: 'Manufacturing',
        industrySlug: 'produkcja',
        scenario: 'Finding 8 alternative injection-molding vendors across the EU after a Tier-1 supply chain disruption.',
        before: '6 weeks of desk research, 200+ cold emails, 12 qualified vendors after one procurement manager works the category full time.',
        after: '20 minutes, 187 qualified vendors, all with IATF 16949 verified — ranked by capability match and geographic proximity to your plant.',
      },
      {
        industry: 'Events',
        industrySlug: 'eventy',
        scenario: 'Sourcing catering, AV and scenography vendors in Berlin for a product launch two weeks away.',
        before: '4 vendors per category found via English-only Google, no local-language coverage, premium agency pricing, nothing booked 10 days out.',
        after: '48 hours, 70+ local Berlin vendors across all three categories, quotes arriving in German through the Supplier Portal.',
      },
      {
        industry: 'Construction',
        industrySlug: 'budownictwo',
        scenario: 'Subcontractor sourcing for HVAC on a 200-unit residential development tender in Mazowieckie.',
        before: 'Phone calls to the industry rolodex, 8–12 qualified bidders after two weeks — mostly the same names everyone invites.',
        after: 'One search, 40+ qualified HVAC contractors in the region, 22 with recent residential references verified against registry data.',
      },
      {
        industry: 'Retail & E-commerce',
        industrySlug: 'retail-ecommerce',
        scenario: 'Private-label cosmetics producer, migrating volume from China to EU/Turkey near-shore manufacturing.',
        before: 'Alibaba searches, three months to shortlist, MOQs too high for a private-label brand scaling 0 → 1.',
        after: '12 days, 23 cosmetic labs across Italy, Poland and Turkey, MOQs from 500 units — pre-filtered for GMP and ISO 22716.',
      },
    ],
    integrationsHighlight: {
      heading: 'More than a search — a data layer for the rest of your procurement stack',
      body: 'AI Sourcing is not a standalone tool. Every campaign feeds your Supplier Database: AI-scored vendor profiles, multi-language supplier records, deduplicated master data, and machine-readable exports that plug into the rest of your workflow. You get supplier research that compounds across projects instead of restarting from zero every quarter.',
      bullets: [
        'Supplier Database included on every campaign — AI scores, contacts, certifications, campaign history — no separate data management needed',
        'Native 26-language search keeps regional vendors in the shortlist instead of filtered out by your English keywords',
        'Automatic deduplication against your existing supplier base — no duplicate outreach, no contact fatigue',
        'Excel export for every tier, REST API access on Enterprise — pipe results into SAP Ariba, Coupa, Salesforce or your in-house ERP',
      ],
    },
    faq: [
      {
        q: 'How accurate is the AI capability scoring?',
        a: 'Capability matching runs at ~85% precision measured against procurement-team manual review across the last 90 days of production campaigns. Top candidates should still be verified manually — AI Sourcing gets you to a shortlist of 20–30 real contenders in minutes; the final decision stays with your team.',
      },
      {
        q: 'Which languages and regions does it cover?',
        a: 'Full support for 26 languages covering the EU plus major global markets. Highest precision today: Polish, German, French, Italian, Spanish, English — thanks to very strong directory and registry coverage. Turkish, Czech, Dutch, Portuguese and Nordic languages are fully supported. Non-Latin scripts (Arabic, Chinese, Japanese) are on the roadmap.',
      },
      {
        q: 'What does one credit actually get me?',
        a: 'One campaign = one credit. A campaign returns 50–250 qualified vendors depending on category coverage — niche B2B segments lean toward 50–80, mainstream categories (packaging, logistics, generic manufacturing) routinely return 200+. Average across all campaigns: ~120 vendors per credit. 10 free credits on signup means 10 real campaigns with no card required.',
      },
      {
        q: 'Can I filter by certification before the AI scores vendors?',
        a: 'Yes. Supported filters include ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS, GOTS, GMP, ISO 22716, ISO 14001, ISO 27001 and more. The filter is applied at the Screener stage — vendors without evidence of the certification never reach enrichment, which keeps the shortlist tight and the credit cost low.',
      },
      {
        q: 'How does Enterprise tier differ from self-serve credits?',
        a: 'Enterprise adds: priority pipeline processing (2x faster turnaround under load), REST API access for ERP integration, custom certification and data filters, SSO, dedicated customer success, higher per-campaign vendor caps, and volume pricing. Self-serve credits are perfect for teams running under 50 campaigns a month; Enterprise is the right fit above that or where API + SSO are non-negotiable.',
      },
      {
        q: 'Is there a real free trial?',
        a: 'Yes — 10 credits on signup, no credit card, no trial clock. That is enough to run 10 full production campaigns across different categories. If you find the results useful, top up at $89 per 10 credits. If you do not, you owe us nothing and your research is still yours to export.',
      },
    ],
  },

  'company-registry': {
    slug: 'company-registry',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · included in every campaign',
    heroTitle: 'Supplier Database — centralized supplier hub with AI scoring and campaign history',
    heroSubtitle:
      'Every supplier discovered by AI Sourcing is stored in a centralized database with AI match scores, contact details, certification tracking, and full campaign history. Deduplicated, filterable, taggable, and Excel-exportable.',
    howItWorks: [
      {
        step: '1',
        title: 'Automatic import from campaigns',
        body: 'Every supplier found by AI Sourcing is automatically added to your Supplier Database with AI match score, contact info, and campaign origin. No manual data entry.',
      },
      {
        step: '2',
        title: 'Filter, tag, and organize',
        body: 'Filter suppliers by score, country, certification, campaign, or custom tags. Build shortlists across multiple campaigns. Deduplication ensures no vendor appears twice.',
      },
      {
        step: '3',
        title: 'Export and act',
        body: 'One-click Excel export with all supplier fields. Pipe suppliers into AI Procurement for RFQ, or use contact data for your own outreach.',
      },
    ],
    highlights: [
      'Centralized supplier records across all campaigns',
      'AI match scores with visible reasoning per supplier',
      'Contact details (email, phone, website) per vendor',
      'Certification tracking (ISO, CE, FDA, GOTS, and more)',
      'Full campaign history — see every campaign a supplier appeared in',
      'Automatic deduplication across campaigns',
      'Custom tags and filtering for shortlist management',
      'One-click Excel export',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'ochrona-zdrowia'],
    relatedFeatures: ['fAiSourcing'],
    ctaTitle: 'Every campaign feeds your Supplier Database',
    ctaBody: 'Supplier Database builds automatically as you run AI Sourcing campaigns — no setup needed.',
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
      'Replace two weeks of manual RFQ sending with a 10-minute workflow. Automated bulk outreach, localized per supplier country, with full delivery and open tracking. Built for procurement teams (1–5 people) drowning in mail-merge spreadsheets, PDF attachments, and chasing non-responders across 20+ email threads. Integrates with the Supplier Portal — no manual data entry, structured responses from day one.',
    howItWorks: [
      {
        step: '1',
        title: 'Pick suppliers from your sourcing campaign',
        body: 'Select 30, 50, or 200 suppliers from your AI Sourcing results — or import a pre-existing shortlist via Excel. Each vendor is automatically tagged with country, language, and decision-maker contact. Every recipient gets a unique Supplier Portal magic link (token with 30-day validity) embedded in their personalized email.',
      },
      {
        step: '2',
        title: 'Customize or use template',
        body: 'Write your RFQ email once in your own language. Start from a battle-tested template (manufacturing RFQ, events catering, construction BOQ) or build from scratch. Attach technical specs, BOQ files, drawings, reference photos — the system packages everything per supplier.',
      },
      {
        step: '3',
        title: 'Auto-translate per supplier country',
        body: 'Gemini 2.0 Flash translates your email per recipient — German for Berlin, Italian for Milan, Turkish for Istanbul. Technical terminology stays intact (MOQ, lead time, Incoterms, part numbers). Commercial tone adjusts per market (formal for DACH, warmer for Iberia). Attachment filenames translate too.',
      },
      {
        step: '4',
        title: 'Send via Resend — inbox, not spam',
        body: 'Mass-send through Resend infrastructure with warmed-up domains, proper SPF/DKIM/DMARC, and deliverability monitoring. Typical inbox placement rate: 95%+. Sends are throttled intelligently to avoid provider rate-limits. Preview every email before launch.',
      },
      {
        step: '5',
        title: 'Track deliveries and opens in real-time',
        body: 'Dashboard shows live status per supplier — delivered, bounced, opened, clicked, portal visited, offer submitted. Filter non-responders for follow-up sequences. Reply-to routing sends any direct replies back to your team inbox, preserving the thread for context.',
      },
    ],
    highlights: [
      'Bulk RFQ to 200+ suppliers in one action',
      'Automatic language detection and translation (26 languages)',
      'Localized email templates per supplier country',
      'Delivery + open + click tracking in real-time dashboard',
      'Reply-to routes back to your inbox (preserves thread history)',
      'Integrates with Supplier Portal for structured offer collection',
      'GDPR-compliant unsubscribe tracking (one-click opt-out per supplier)',
      'Throttled sending prevents deliverability blacklisting',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEnrichment', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Book a Procurement workflow demo',
    ctaBody: 'Email Outreach comes with the full Procurement workflow (enrichment, Supplier Portal, offer collection). We configure it together in a 30-minute onboarding call — including template setup, DNS alignment, and your first live campaign.',
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
      'Stop chasing PDFs, Excel attachments, and inconsistent quote formats. Suppliers submit structured offers via a personalized link — no account creation, no password, no onboarding call. Built for procurement teams running 5–50 RFQs per month who need quantity breaks, alternatives, certificates, and attachments all captured in a single standard format. 40% of suppliers respond from mobile.',
    howItWorks: [
      {
        step: '1',
        title: 'Each supplier gets a unique link',
        body: 'When you send an RFQ, the email contains a magic link (unique token, 30-day configurable validity). Supplier clicks, sees your branded portal, sees their specific RFQ — no login prompt, no password reset email, no "I forgot my account" support ticket. Frictionless entry is the whole point.',
      },
      {
        step: '2',
        title: 'Suppliers access in their language',
        body: 'Portal auto-detects the supplier country and serves the UI in their local language (26 supported). Technical fields (MOQ, Incoterms, lead time) use recognized industry abbreviations. Help text adapts per market. A German supplier sees a fully German portal; a Turkish supplier gets full Turkish.',
      },
      {
        step: '3',
        title: 'Structured quote submission',
        body: 'Portal form: base price, tiered pricing (quantity breaks at 100/1000/10000 units), MOQ, lead time, Incoterms, certifications (ISO, CE, FDA, GOTS), payment terms, alternatives (e.g. alternative material, alternative finish). Attach samples, certificates, test reports, product catalogs — up to 20MB per submission.',
      },
      {
        step: '4',
        title: 'Validation flags missing/inconsistent data',
        body: 'Before a supplier can submit, the portal validates: mandatory fields filled, MOQ ≤ requested quantity, lead time within plausible range, certifications uploaded where required. If data is inconsistent, a clear error prompts the supplier to fix it — you never receive half-broken offers that need follow-up emails to clean up.',
      },
      {
        step: '5',
        title: 'See offers in real-time',
        body: 'Each submission appears instantly in your dashboard with a status marker (new / reviewed / shortlisted / rejected). Side-by-side comparison via Offer Comparison feature. No PDF parsing, no email forwarding, no copy-paste into spreadsheets — structured data from day one, ready to feed into ranking or AI Insights.',
      },
    ],
    highlights: [
      'No supplier account needed — magic link only',
      'Portal auto-translated to supplier language (26 supported)',
      'Structured price tiers, MOQ, lead time, alternatives',
      'Supplier uploads certificates, samples, catalogs (up to 20MB)',
      'Custom branding per organization (Enterprise Custom)',
      'Mobile-responsive (40% suppliers reply from phone)',
      'Token expires after 30 days (configurable per campaign)',
      'Real-time validation catches errors before submission',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'See the Supplier Portal in action',
    ctaBody: 'Book a demo. We send you a test RFQ, you open the supplier side, and see exactly what your vendors will see — including the mobile experience and the localized UI for a country of your choice.',
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
      'Replace hand-built Excel comparison sheets and two-day CFO prep with a structured, AI-weighted ranking view. Compare all RFQ responses on price, MOQ, lead time, certifications, payment terms, alternatives — up to 200 offers side by side. Built for procurement leads preparing tender recommendations, CFO approvals, and board-level supplier decisions. Export as PDF or PPTX for stakeholders.',
    howItWorks: [
      {
        step: '1',
        title: 'Suppliers submit via Supplier Portal',
        body: 'All quotes come in structured — no PDFs to parse, no spreadsheets to reconcile, no "what did they mean by lead time" phone calls. Each offer includes base price, quantity breaks, MOQ, lead time, Incoterms, certifications, payment terms, and any alternatives the supplier wants to propose.',
      },
      {
        step: '2',
        title: 'Weight your criteria (price / lead time / certs)',
        body: 'Before ranking runs, configure how much each criterion matters for this RFQ. Price 40%, lead time 30%, certifications 20%, payment terms 10% — or any mix you need. Presets per industry available (manufacturing = price-heavy, healthcare = cert-heavy, events = lead-time-heavy). Weights are saved per category for reuse.',
      },
      {
        step: '3',
        title: 'System ranks and highlights',
        body: 'Automatic ranking against your weighted criteria. Outliers flagged (price 40% below median = possibly suspicious, lead time 2x longer than others = capacity issue). Missing data highlighted in red. Alternatives scored separately so they don\'t unfairly inflate a supplier\'s rank. Top-3 surfaced with reasoning.',
      },
      {
        step: '4',
        title: 'Send a counter-offer with one click',
        body: 'Spot a top-3 supplier whose price is close but lead time is long? Click "counter-offer" and propose new terms (counter-pricing, counter-MOQ, alternative lead time) through the same Supplier Portal. Supplier responds, you see the updated quote in place, full negotiation history preserved. No email thread tangles.',
      },
      {
        step: '5',
        title: 'Export for stakeholders',
        body: 'Export as PDF (tender-ready format with logos and page numbers) or PPTX (board-ready deck with executive summary slide). Includes ranked comparison table, weighted criteria used, and notes. CFO gets a one-page summary; tender committee gets the full detailed appendix. No manual formatting required.',
      },
    ],
    highlights: [
      'Side-by-side comparison up to 200 offers',
      'Weighted ranking — configure your priorities per RFQ',
      'Quantity-break comparison (price at 100, 1000, 10000 units)',
      'Certification matrix (ISO, CE, FDA, GOTS, and custom)',
      'PDF / PPTX export for board presentations',
      'Counter-offer workflow with full negotiation history',
      'Historical offer comparison (find pricing drift over time)',
      'Shortlist offers for team review (collaborative annotations)',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fAiInsights'],
    ctaTitle: 'Ready to end spreadsheet comparison?',
    ctaBody: 'Book a demo. We walk through a comparison view with sample RFQ data from your industry — manufacturing, construction, events, or retail. See the weighting engine, counter-offer flow, and PDF/PPTX export live.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'ai-insights': {
    slug: 'ai-insights',
    group: 'insights',
    tierBadge: 'AI Procurement · contact sales',
    heroTitle: 'AI Insights — campaign reports that read themselves',
    heroSubtitle:
      'Gemini-powered summary of every campaign: supplier distribution, database quality, response rates, and offer benchmarking vs. your targets. Auto-generated PDF/PPTX reports ready for your board.',
    howItWorks: [
      { step: '1', title: 'Data from every step of the campaign', body: 'Sourcing pipeline results + RFQ responses + offers — all feed into the insights engine.' },
      { step: '2', title: 'AI summarizes the outcome', body: 'Gemini describes: supplier distribution by country/specialization, response and engagement rates, which offers clear your price/lead-time/MOQ targets, and how the shortlist compares to your brief.' },
      { step: '3', title: 'Export-ready PDF / PPTX', body: 'Pre-formatted deck with executive summary, shortlist overview, offer benchmarking charts, and recommended next steps. No manual formatting.' },
    ],
    highlights: [
      'Gemini 2.0 Flash analysis per campaign',
      'Supplier distribution + database quality scoring',
      'Response and engagement rates',
      'Offer benchmarking vs. your brief (price, lead time, MOQ)',
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
      'Opisz czego szukasz zwykłym językiem. Nasz AI-native pipeline planuje strategię wyszukiwania w 26 językach, przeczesuje rejestry i katalogi branżowe, których tradycyjne narzędzia nie widzą, ocenia każdego dostawcę pod kątem dopasowania do briefu i wzbogaca shortlistę o zweryfikowane dane rejestrowe i kontaktowe. Pierwsze 20 dostawców ląduje w Twoim dashboardzie w mniej niż trzy minuty; pełna lista 50–250 zakwalifikowanych vendorów — z automatyczną deduplikacją wobec Twojej bazy — jest gotowa do eksportu do Excela w około 20.',
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
      'Baza Dostawców z ocenami AI, kontaktami i śledzeniem certyfikatów',
      'Eksport do Excela jednym kliknięciem (pełna lista z kontaktami)',
      'Deduplikacja wobec istniejącej bazy dostawców',
      '10 darmowych kredytów po rejestracji — bez karty',
    ],
    relatedIndustries: ['produkcja', 'eventy', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fCompanyRegistry', 'fEmailOutreach'],
    ctaTitle: 'Zacznij pierwszą kampanię za darmo',
    ctaBody: 'Załóż konto służbowym mailem. Dostajesz 10 darmowych kredytów — wystarczy na 10 pierwszych kampanii AI sourcingu. Bez karty kredytowej.',
    isSelfServe: true,
    interestTag: 'ai_sourcing',
    hasPage: true,

    problemSection: {
      heading: 'Manualny sourcing jest zepsuty — i kosztuje Twój zespół tygodnie przy każdym projekcie.',
      paragraphs: [
        'Typowy zespół procurement spędza 30+ godzin na jednym wyszukiwaniu w kategorii: googlowanie w jednym-dwóch językach, scrapowanie list ze stron stowarzyszeń, cross-checking sześciu różnych katalogów, wklejanie wyników do rozjeżdżającego się Excela, który od razu zaczyna się dezaktualizować. Prawdziwi dostawcy, których potrzebujesz — niszowi, regionalni, certyfikowani — ukrywają się za stronami w lokalnych językach, na 7. stronie Google, albo w wyspecjalizowanych katalogach, o których nigdy nie słyszałaś. Nie czytasz po turecku, włosku ani czesku na skalę, więc domyślnie dzwonisz do tych samych 20 firm, co wszyscy w Twojej branży.',
        'Legacy tools nie pomagają. Tradycyjne bazy dostawców były budowane dekadę temu: kosztują $40k+ za seat, pokrywają może jeden region dobrze, a ich dane starzeją się w miesiącach. B2B marketplace\'y pokazują tylko vendorów, którzy płacą za listing. Twój własny ERP supplier master pokazuje tylko tych, z którymi już pracowałaś. Żadne z tych narzędzi nie znajdzie nowego, lepszego, tańszego dostawcy, który wszedł na rynek w zeszłym kwartale.',
        'W tym samym czasie CFO pyta dlaczego koszty dostaw urosły o 8%, category managerowie toną w administracji RFQ, a przy każdej inicjatywie nearshoringu od zarządu restartujecie research od zera. Sourcing nie powinien być wąskim gardłem nowoczesnego procurement — ale do tej pory nie było narzędzia zbudowanego pod to, jak AI faktycznie działa w 2026 roku.',
      ],
    },
    detailedSteps: [
      {
        step: '1',
        title: 'Opisz czego szukasz — w jednym zdaniu',
        body: 'Wpisz prompt tak, jak przedstawiasz zadanie koledze: "Dostawcy wtrysku tworzyw sztucznych w UE do części wnętrzowych automotive, wymagany IATF 16949, 50k-500k sztuk/rok, lead time poniżej 8 tygodni." Bez operatorów boolean, bez tagów, bez składni wyszukiwarki. Prompt może być w dowolnym z 26 obsługiwanych języków — pipeline rozumie polski, niemiecki, turecki, włoski, francuski, hiszpański, angielski i więcej natywnie.',
        techDetail: 'Napędzane Gemini 2.0 Flash — ten sam model, który interpretuje Twój brief, planuje potem zapytania wyszukiwania na każdym wspieranym rynku.',
      },
      {
        step: '2',
        title: 'Agent Strategy planuje multi-market search',
        body: 'Zanim zostanie wysłane pierwsze zapytanie, agent Strategy dekomponuje Twój brief na podkategorie, wybiera 5–15 najbardziej relevantnych krajów i generuje 20–40 celowanych zapytań per kraj — każde w lokalnym języku z lokalną taksonomią. Wybiera odpowiednie katalogi (Wer liefert was, Kompass, GoldenLine, Europages, izby handlowe) i long-tail web queries, skalibrowane pod Twoje wymagania certyfikacyjne i capacity.',
        techDetail: 'Output Strategy zawiera plan budżetu zapytań — widzisz dokładnie ile searches zostanie uruchomionych i możesz skorygować scope przed startem kampanii.',
      },
      {
        step: '3',
        title: 'Agent Scanning przeczesuje web równolegle',
        body: 'Do 20 wątków roboczych działa równolegle, łącząc Google search (przez Serper.dev), bezpośrednie crawle katalogów dostawców, krajowe rejestry firm i listingi stowarzyszeń branżowych. Rate limiting, retry logic i disk cache utrzymują koszt poniżej $2.50 per kampania, jednocześnie sięgając do źródeł, których legacy databases nigdy nie dotykają. Każdy znaleziony URL jest scrapowany i przekazywany do następnego etapu — bez ręcznego klikania przez wyniki.',
        techDetail: 'TTL cache\'u 90 dni oznacza, że następna kampania w tej samej kategorii kosztuje mniej więcej o połowę mniej i uruchamia się w minutach.',
      },
      {
        step: '4',
        title: 'Agent Analysis ocenia każdego dostawcę pod kątem dopasowania',
        body: 'Każdy kandydat jest oceniany wobec Twojego briefu przez LLM reviewera: czy strona potwierdza capability, o które pytałeś? Czy certyfikaty, których potrzebujesz, są wymienione lub sugerowane? Czy wielkość firmy jest w zakresie? Czy są sygnały zaufania — listy klientów, case studies, znaki ISO — czy czerwone flagi (pusta strona "o nas", martwy social, zepsute formularze kontaktowe)? Dostawcy są scoringowani 0–100, a oczywiste niedopasowania są odrzucane przed enrichment, żeby shortlista pozostała zwięzła.',
        techDetail: 'Rubryka scoringu jest spójna między kampaniami — więc vendorzy z Twoich ostatnich 5 searches są bezpośrednio porównywalni.',
      },
      {
        step: '5',
        title: 'Agent Enrichment uzupełnia brakujące dane',
        body: 'Dla każdego zakwalifikowanego dostawcy enrichment pass pobiera: stronę firmową i dane kontaktowe (email, telefon, LinkedIn), dowody certyfikatów i robi dedup wobec dostawców już w Twojej Bazie Dostawców Procurea. To, co ląduje w Twoim dashboardzie, to shortlista, na której możesz od razu działać — eksport do Excela, bulk RFQ przez AI Procurement, lub push do ERP przez API.',
        techDetail: 'Na końcu uruchamia się pass Auditor, który flaguje niespójności — np. capability claim, którego LLM nie mógł zweryfikować na stronie, albo brakujące dane kontaktowe.',
      },
    ],
    capabilityGroups: [
      {
        groupLabel: 'Search',
        items: [
          'Natywny research w 26 językach — polski, niemiecki, francuski, włoski, hiszpański, turecki, holenderski, czeski i 18 kolejnych',
          'Multi-source coverage — rejestry krajowe, katalogi branżowe, listingi stowarzyszeń, long-tail web',
          'Regionalne strategie wyszukiwania skalibrowane per kategoria (EU-focused, global, near-shoring, reshoring)',
        ],
      },
      {
        groupLabel: 'Enrichment',
        items: [
          'Centralna Baza Dostawców — oceny dopasowania AI, dane kontaktowe, certyfikaty i historia kampanii per vendor',
          'Kontakty do decydentów — purchasing lead, manager procurement, CEO — z sygnałami deliverability',
          'Automatyczna deduplikacja wobec Twojej bazy dostawców (sync ERP lub manualny upload)',
        ],
      },
      {
        groupLabel: 'Quality',
        items: [
          'AI capability scoring — dostawcy rankowani 0–100 pod kątem dopasowania do briefu, z widocznym uzasadnieniem',
          'Filtry certyfikatów — ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS i więcej',
        ],
      },
      {
        groupLabel: 'Export',
        items: [
          'Eksport do Excela jednym kliknięciem — pełna lista z wszystkimi polami, format gotowy pod audyt',
          'Bezpośrednie zasilanie AI Procurement — RFQ, zbieranie ofert, porównanie bez wychodzenia z Procurea',
        ],
      },
    ],
    useCasesByIndustry: [
      {
        industry: 'Produkcja',
        industrySlug: 'produkcja',
        scenario: 'Znalezienie 8 alternatywnych dostawców wtrysku tworzyw sztucznych w UE po zakłóceniu łańcucha dostaw Tier-1.',
        before: '6 tygodni desk research, 200+ cold maili, 12 zakwalifikowanych vendorów po full-time pracy jednego procurement managera.',
        after: '20 minut, 187 zakwalifikowanych dostawców, wszyscy z IATF 16949 zweryfikowanym — rankowani po dopasowaniu i odległości od Twojego zakładu.',
      },
      {
        industry: 'Eventy',
        industrySlug: 'eventy',
        scenario: 'Sourcing cateringu, AV i scenografii w Berlinie pod event produktowy za dwa tygodnie.',
        before: '4 vendorów per kategoria znalezionych przez angielski Google, brak lokalnego coverage, premium pricing agencji, nic nie zabukowane 10 dni przed eventem.',
        after: '48 godzin, 70+ lokalnych berlińskich vendorów we wszystkich trzech kategoriach, oferty wpadające po niemiecku przez Supplier Portal.',
      },
      {
        industry: 'Budownictwo',
        industrySlug: 'budownictwo',
        scenario: 'Sourcing podwykonawców HVAC pod przetarg na 200-lokalowy projekt mieszkaniowy w Mazowieckiem.',
        before: 'Telefony do branżowego rolodexa, 8–12 zakwalifikowanych oferentów po dwóch tygodniach — w większości te same nazwy, które wszyscy zapraszają.',
        after: 'Jedno wyszukiwanie, 40+ zakwalifikowanych wykonawców HVAC w regionie, 22 ze świeżymi referencjami mieszkaniowymi zweryfikowanymi wobec danych rejestrowych.',
      },
      {
        industry: 'Retail & E-commerce',
        industrySlug: 'retail-ecommerce',
        scenario: 'Producent kosmetyków private label przenoszący wolumen z Chin do nearshore w UE/Turcji.',
        before: 'Wyszukiwania na Alibaba, trzy miesiące do shortlisty, MOQ za wysokie dla private label marki skalującej 0 → 1.',
        after: '12 dni, 23 laboratoria kosmetyczne we Włoszech, Polsce i Turcji, MOQ od 500 sztuk — pre-filtrowane pod GMP i ISO 22716.',
      },
    ],
    integrationsHighlight: {
      heading: 'Więcej niż wyszukiwarka — warstwa danych dla reszty Twojego stacku procurement',
      body: 'AI Sourcing nie jest standalone tool. Każda kampania zasila Twoją Bazę Dostawców: profile vendorów z oceną AI, wielojęzyczne rekordy dostawców, zdeduplikowane master data i machine-readable exporty, które wpinają się w resztę workflow. Dostajesz supplier research, który się kumuluje między projektami, zamiast restartować od zera co kwartał.',
      bullets: [
        'Baza Dostawców wliczona w każdą kampanię — oceny AI, kontakty, certyfikaty, historia kampanii — bez osobnego zarządzania danymi',
        'Natywne wyszukiwanie w 26 językach utrzymuje regionalnych vendorów na shortliście zamiast odfiltrowywać ich przez angielskie keywordy',
        'Automatyczna deduplikacja wobec Twojej bazy — bez duplikatów outreach, bez contact fatigue',
        'Export Excel w każdym tierze, REST API na Enterprise — zasilanie SAP Ariba, Coupa, Salesforce lub Twojego ERP',
      ],
    },
    faq: [
      {
        q: 'Jak dokładne jest AI capability scoring?',
        a: 'Capability matching działa z precyzją ~85% mierzoną wobec manualnego review zespołu procurement na przestrzeni ostatnich 90 dni kampanii produkcyjnych. Top kandydaci powinni być nadal weryfikowani manualnie — AI Sourcing dostarcza Ci shortlistę 20–30 realnych contenderów w minuty; finalna decyzja pozostaje w rękach Twojego zespołu.',
      },
      {
        q: 'Jakie języki i regiony są pokryte?',
        a: 'Pełne wsparcie dla 26 języków pokrywających UE plus kluczowe rynki globalne. Najwyższa precyzja dziś: polski, niemiecki, francuski, włoski, hiszpański, angielski — dzięki bardzo dobremu pokryciu katalogów i rejestrów. Turecki, czeski, holenderski, portugalski i języki nordyckie są w pełni wspierane. Non-Latin scripts (arabski, chiński, japoński) są w roadmapie.',
      },
      {
        q: 'Co dokładnie dostaję za jeden kredyt?',
        a: 'Jedna kampania = jeden kredyt. Kampania zwraca 50–250 zakwalifikowanych vendorów zależnie od pokrycia kategorii — niszowe segmenty B2B dają 50–80, mainstream kategorie (opakowania, logistyka, ogólna produkcja) rutynowo zwracają 200+. Średnia wszystkich kampanii: ~120 dostawców per kredyt. 10 darmowych kredytów po rejestracji to 10 realnych kampanii bez karty kredytowej.',
      },
      {
        q: 'Czy mogę filtrować po certyfikatach, zanim AI zacznie scoringować?',
        a: 'Tak. Wspierane filtry to ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS, GOTS, GMP, ISO 22716, ISO 14001, ISO 27001 i więcej. Filtr jest aplikowany na etapie Screenera — vendorzy bez dowodów certyfikatu nigdy nie docierają do enrichment, co utrzymuje shortlistę zwięzłą a koszt kredytu niski.',
      },
      {
        q: 'Czym różni się tier Enterprise od self-serve kredytów?',
        a: 'Enterprise dodaje: priority processing pipeline\'u (2x szybszy turnaround pod obciążeniem), REST API dla integracji z ERP, custom filtry certyfikatów i danych, SSO, dedykowany customer success, wyższe capy vendorów per kampania i volume pricing. Self-serve kredyty są idealne dla zespołów z poniżej 50 kampaniami miesięcznie; Enterprise to właściwy wybór powyżej albo gdy API + SSO są non-negotiable.',
      },
      {
        q: 'Czy jest realny free trial?',
        a: 'Tak — 10 kredytów po rejestracji, bez karty kredytowej, bez zegara trialu. To wystarczy na 10 pełnoprawnych kampanii produkcyjnych w różnych kategoriach. Jeśli uznasz wyniki za użyteczne, doładowujesz po $89 za 10 kredytów. Jeśli nie — nic nam nie jesteś winien, a Twój research i tak pozostaje Twój do exportu.',
      },
    ],
  },

  'company-registry': {
    slug: 'company-registry',
    group: 'sourcing',
    tierBadge: 'AI Sourcing · wliczone w każdą kampanię',
    heroTitle: 'Baza Dostawców — centralna baza dostawców z oceną AI i historią kampanii',
    heroSubtitle:
      'Każdy dostawca znaleziony przez AI Sourcing trafia do centralnej bazy z oceną dopasowania AI, danymi kontaktowymi, śledzeniem certyfikatów i pełną historią kampanii. Zdeduplikowana, filtrowalna, tagowalnia i gotowa do eksportu Excel.',
    howItWorks: [
      { step: '1', title: 'Automatyczny import z kampanii', body: 'Każdy dostawca znaleziony przez AI Sourcing jest automatycznie dodawany do Twojej Bazy Dostawców z oceną AI, danymi kontaktowymi i źródłem kampanii. Bez ręcznego wpisywania.' },
      { step: '2', title: 'Filtruj, taguj, organizuj', body: 'Filtruj dostawców po ocenie, kraju, certyfikacie, kampanii lub własnych tagach. Buduj shortlisty z wielu kampanii. Deduplikacja zapewnia, że żaden vendor nie pojawi się dwa razy.' },
      { step: '3', title: 'Eksportuj i działaj', body: 'Eksport do Excela jednym kliknięciem ze wszystkimi polami. Podłącz dostawców do AI Procurement pod RFQ, lub użyj danych kontaktowych do własnego outreach.' },
    ],
    highlights: [
      'Centralne rekordy dostawców ze wszystkich kampanii',
      'Oceny dopasowania AI z widocznym uzasadnieniem per dostawca',
      'Dane kontaktowe (email, telefon, strona www) per vendor',
      'Śledzenie certyfikatów (ISO, CE, FDA, GOTS i więcej)',
      'Pełna historia kampanii — zobacz każdą kampanię, w której dostawca się pojawił',
      'Automatyczna deduplikacja między kampaniami',
      'Własne tagi i filtrowanie do zarządzania shortlistami',
      'Eksport do Excela jednym kliknięciem',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'ochrona-zdrowia'],
    relatedFeatures: ['fAiSourcing'],
    ctaTitle: 'Każda kampania zasila Twoją Bazę Dostawców',
    ctaBody: 'Baza Dostawców buduje się automatycznie w miarę uruchamiania kampanii AI Sourcing — bez konfiguracji.',
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
      'Zastąp dwa tygodnie ręcznej wysyłki RFQ 10-minutowym workflow. Zautomatyzowane bulk-RFQ, zlokalizowane per kraj dostawcy, z pełnym trackingiem dostarczeń i otwarć. Dla zespołów procurement (1–5 osób) tonących w mail-merge arkuszach, załącznikach PDF i gonieniu nierespondentów przez 20+ wątków mailowych. Integruje się z Supplier Portalem — bez ręcznego wpisywania, strukturalne odpowiedzi od pierwszego dnia.',
    howItWorks: [
      {
        step: '1',
        title: 'Wybierz dostawców z kampanii sourcingowej',
        body: 'Zaznacz 30, 50 lub 200 dostawców z wyników AI Sourcingu — lub zaimportuj gotową shortlistę z Excela. Każdy vendor automatycznie otagowany krajem, językiem i kontaktem do decydenta. Każdy odbiorca dostaje unikalny magic link do Supplier Portalu (token z 30-dniową ważnością) wklejony w spersonalizowanym mailu.',
      },
      {
        step: '2',
        title: 'Customizuj lub użyj szablonu',
        body: 'Napisz RFQ raz w swoim języku. Zacznij od sprawdzonego szablonu (RFQ produkcyjne, catering eventowy, BOQ budowlane) lub napisz od zera. Załącz specyfikację, pliki BOQ, rysunki, zdjęcia referencyjne — system pakuje wszystko per dostawca.',
      },
      {
        step: '3',
        title: 'Auto-tłumaczenie per kraj dostawcy',
        body: 'Gemini 2.0 Flash tłumaczy Twój mail per odbiorca — niemiecki dla Berlina, włoski dla Mediolanu, turecki dla Stambułu. Terminologia techniczna pozostaje nietknięta (MOQ, lead time, Incoterms, numery katalogowe). Ton komercyjny dopasowuje się do rynku (formalny dla DACH, cieplejszy dla Półwyspu Iberyjskiego). Nazwy załączników też się tłumaczą.',
      },
      {
        step: '4',
        title: 'Wyślij przez Resend — inbox, nie spam',
        body: 'Masowa wysyłka przez Resend z rozgrzanymi domenami, poprawną konfiguracją SPF/DKIM/DMARC i monitoringiem deliverability. Typowa skuteczność do inboxa: 95%+. Wysyłki są inteligentnie throttle\'owane żeby nie wpaść w rate-limity providerów. Preview każdego maila przed startem.',
      },
      {
        step: '5',
        title: 'Śledź dostarczenia i otwarcia w czasie rzeczywistym',
        body: 'Dashboard pokazuje live status per dostawca — dostarczony, odbity, otwarty, kliknięty, portal odwiedzony, oferta złożona. Filtruj nierespondentów do sekwencji follow-up. Reply-to routing wysyła wszystkie bezpośrednie odpowiedzi do inboxa Twojego zespołu, zachowując wątek dla kontekstu.',
      },
    ],
    highlights: [
      'Bulk RFQ do 200+ dostawców w jednej akcji',
      'Automatyczne wykrywanie języka i tłumaczenie (26 języków)',
      'Lokalizowane szablony maili per kraj dostawcy',
      'Tracking dostarczenia + otwarcia + kliknięć w dashboardzie na żywo',
      'Reply-to wraca do inboxa Twojego zespołu (zachowuje historię wątku)',
      'Integracja z Supplier Portalem dla strukturalnego zbierania ofert',
      'GDPR-compliant tracking rezygnacji (one-click opt-out per dostawca)',
      'Throttled sending zapobiega wpadnięciu na blacklist deliverability',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fEnrichment', 'fAutoFollowUp', 'fMultilingualOutreach'],
    ctaTitle: 'Umów demo Procurement workflow',
    ctaBody: 'Email Outreach przychodzi z pełnym workflow Procurement (enrichment, Supplier Portal, zbieranie ofert). Konfigurujemy to razem w 30-minutowym onboardingu — łącznie z setupem szablonów, alignmentem DNS i Twoją pierwszą kampanią na żywo.',
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
      'Koniec z goniem PDF-ów, załączników Excel i niespójnych formatów ofert. Dostawcy składają strukturalne quotes przez personalizowany link — bez zakładania konta, bez hasła, bez rozmowy onboardingowej. Dla zespołów procurement prowadzących 5–50 RFQ miesięcznie, które potrzebują quantity breaks, alternatyw, certyfikatów i załączników w jednym standardzie. 40% dostawców odpowiada z telefonu.',
    howItWorks: [
      {
        step: '1',
        title: 'Każdy dostawca dostaje unikalny link',
        body: 'Gdy wysyłasz RFQ, mail zawiera magic link (unikalny token, konfigurowalna 30-dniowa ważność). Dostawca klika, widzi Twój branded portal, widzi swoje konkretne RFQ — bez prompta logowania, bez maila "zapomniałem hasła", bez ticketa "nie mogę się zalogować". Frictionless entry to cały sens.',
      },
      {
        step: '2',
        title: 'Dostawcy korzystają w swoim języku',
        body: 'Portal auto-detektuje kraj dostawcy i serwuje UI w jego lokalnym języku (26 obsługiwanych). Techniczne pola (MOQ, Incoterms, lead time) używają rozpoznawanych branżowych skrótów. Help text dopasowuje się do rynku. Niemiecki dostawca widzi w pełni niemiecki portal; turecki dostaje pełny turecki.',
      },
      {
        step: '3',
        title: 'Strukturalne składanie oferty',
        body: 'Formularz portalu: cena bazowa, tiered pricing (quantity breaks przy 100/1000/10000 sztuk), MOQ, lead time, Incoterms, certyfikaty (ISO, CE, FDA, GOTS), warunki płatności, alternatywy (np. alternatywny materiał, wykończenie). Załącza sample, certyfikaty, raporty z testów, katalogi produktowe — do 20MB na złożenie.',
      },
      {
        step: '4',
        title: 'Walidacja flaguje brakujące/niespójne dane',
        body: 'Zanim dostawca złoży ofertę, portal waliduje: wymagane pola wypełnione, MOQ ≤ zamawiana ilość, lead time w prawdopodobnym zakresie, certyfikaty wgrane tam gdzie wymagane. Jeśli dane są niespójne, jasny błąd prosi dostawcę o poprawę — nigdy nie dostajesz na poły złamanych ofert wymagających follow-up maili z prośbą o wyjaśnienie.',
      },
      {
        step: '5',
        title: 'Widzisz oferty w czasie rzeczywistym',
        body: 'Każde złożenie pojawia się natychmiast w Twoim dashboardzie ze statusem (nowa / przejrzana / shortlistowana / odrzucona). Porównanie side-by-side przez Offer Comparison. Bez parsowania PDF, bez forwardowania maili, bez kopiowania do arkuszy — strukturalne dane od pierwszego dnia, gotowe do zasilenia rankingu lub AI Insights.',
      },
    ],
    highlights: [
      'Bez konta dostawcy — tylko magic link',
      'Portal automatycznie tłumaczony na język dostawcy (26 obsługiwanych)',
      'Strukturalne price tiers, MOQ, lead time, alternatywy',
      'Dostawca uploaduje certyfikaty, sample, katalogi (do 20MB)',
      'Custom branding per organizacja (Enterprise Custom)',
      'Mobile-responsive (40% dostawców odpowiada z telefonu)',
      'Token wygasa po 30 dniach (konfigurowalne per kampania)',
      'Walidacja w czasie rzeczywistym łapie błędy przed wysyłką',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'eventy'],
    relatedFeatures: ['fEmailOutreach', 'fOfferCollection', 'fOfferComparison'],
    ctaTitle: 'Zobacz Supplier Portal w akcji',
    ctaBody: 'Umów demo. Wyślemy Ci testowe RFQ, otworzysz stronę dostawcy, zobaczysz dokładnie co widzą Twoi vendorzy — łącznie z doświadczeniem mobilnym i zlokalizowanym UI dla kraju Twojego wyboru.',
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
      'Zastąp ręcznie budowane arkusze Excel i dwudniowy prep dla CFO strukturalnym, ważonym AI widokiem rankingu. Porównuj wszystkie odpowiedzi RFQ po cenie, MOQ, lead time, certyfikatach, warunkach płatności, alternatywach — do 200 ofert side by side. Dla lidów procurement przygotowujących rekomendacje tenderowe, akceptacje CFO i decyzje o dostawcach na poziomie zarządu. Eksport do PDF lub PPTX dla stakeholderów.',
    howItWorks: [
      {
        step: '1',
        title: 'Dostawcy składają przez Supplier Portal',
        body: 'Wszystkie oferty przychodzą w strukturze — bez PDF do parsowania, bez arkuszy do uzgodnienia, bez telefonów "co oni mieli na myśli przez lead time". Każda oferta zawiera cenę bazową, quantity breaks, MOQ, lead time, Incoterms, certyfikaty, warunki płatności i dowolne alternatywy które dostawca chce zaproponować.',
      },
      {
        step: '2',
        title: 'Zważ swoje kryteria (cena / lead time / certy)',
        body: 'Zanim ranking się uruchomi, skonfiguruj jak ważne jest każde kryterium dla tego RFQ. Cena 40%, lead time 30%, certyfikaty 20%, warunki płatności 10% — lub dowolny mix. Dostępne presety per branża (produkcja = cena-ciężka, ochrona zdrowia = cert-ciężka, eventy = lead-time-ciężka). Wagi zapisane per kategoria do wielokrotnego użytku.',
      },
      {
        step: '3',
        title: 'System rankuje i highlightuje',
        body: 'Automatyczny ranking po Twoich ważonych kryteriach. Outliers oznaczone (cena 40% poniżej mediany = potencjalnie podejrzana, lead time 2x dłuższy niż inni = problem z mocami). Brakujące dane wyróżnione na czerwono. Alternatywy scorowane osobno żeby nie inflate\'ować rankingu dostawcy. Top-3 wypchnięte z uzasadnieniem.',
      },
      {
        step: '4',
        title: 'Wyślij counter-offer jednym kliknięciem',
        body: 'Widzisz top-3 dostawcę z blisko dopasowaną ceną, ale długim lead time? Kliknij "counter-offer" i zaproponuj nowe warunki (counter-pricing, counter-MOQ, alternatywny lead time) przez ten sam Supplier Portal. Dostawca odpowiada, widzisz zaktualizowaną ofertę w miejscu, pełna historia negocjacji zachowana. Koniec z gąszczami wątków mailowych.',
      },
      {
        step: '5',
        title: 'Eksport dla stakeholderów',
        body: 'Eksport do PDF (format gotowy pod tender, z logo i numeracją stron) lub PPTX (board-ready deck z executive summary slide). Zawiera ranking porównawczy, użyte kryteria wagowe i notatki. CFO dostaje jednostronicowy summary; komisja tenderowa dostaje pełny szczegółowy appendix. Bez ręcznego formatowania.',
      },
    ],
    highlights: [
      'Porównanie side-by-side do 200 ofert',
      'Ranking ważony — konfiguruj swoje priorytety per RFQ',
      'Porównanie quantity-break (cena przy 100, 1000, 10000 sztuk)',
      'Matryca certyfikatów (ISO, CE, FDA, GOTS i custom)',
      'Eksport PDF / PPTX dla prezentacji zarządu',
      'Workflow counter-offer z pełną historią negocjacji',
      'Porównanie historyczne ofert (wykryj dryf cenowy w czasie)',
      'Shortlist ofert do review zespołu (collaborative adnotacje)',
    ],
    relatedIndustries: ['produkcja', 'budownictwo', 'retail-ecommerce'],
    relatedFeatures: ['fSupplierPortal', 'fAiInsights'],
    ctaTitle: 'Gotowy na koniec porównywania w Excelu?',
    ctaBody: 'Umów demo. Przejdziemy przez widok porównania z przykładowymi danymi RFQ z Twojej branży — produkcja, budownictwo, eventy lub retail. Zobacz silnik wagowy, flow counter-offer i eksport PDF/PPTX na żywo.',
    isSelfServe: false,
    interestTag: 'ai_procurement',
    hasPage: true,
  },

  'ai-insights': {
    slug: 'ai-insights',
    group: 'insights',
    tierBadge: 'AI Procurement · porozmawiaj z nami',
    heroTitle: 'AI Insights — raporty kampanii które same się piszą',
    heroSubtitle:
      'Podsumowanie Gemini każdej kampanii: rozkład dostawców, jakość bazy, statystyki odpowiedzi i benchmark ofert vs. Twoje cele. Auto-generowane raporty PDF/PPTX gotowe dla zarządu.',
    howItWorks: [
      { step: '1', title: 'Dane z każdego etapu kampanii', body: 'Wyniki AI Sourcingu + odpowiedzi RFQ + oferty — wszystko zasila silnik insights.' },
      { step: '2', title: 'AI opisuje wynik kampanii', body: 'Gemini opisuje: rozkład dostawców po krajach i specjalizacjach, statystyki odpowiedzi i zaangażowania, które oferty mieszczą się w Twoich celach (cena, lead time, MOQ) oraz jak shortlista wypada względem briefu.' },
      { step: '3', title: 'Export-ready PDF / PPTX', body: 'Pre-formatowany deck z executive summary, przeglądem shortlisty, wykresami benchmarku ofert i rekomendowanymi następnymi krokami. Bez ręcznego formatowania.' },
    ],
    highlights: [
      'Analiza Gemini 2.0 Flash per kampania',
      'Rozkład dostawców + scoring jakości bazy',
      'Statystyki odpowiedzi i zaangażowania',
      'Benchmark ofert vs. Twój brief (cena, lead time, MOQ)',
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
