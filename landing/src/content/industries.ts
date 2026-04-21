// Industry page content — 4 MVP P0 industries with full copy.
// Reference: landing/docs/personas.md (industry sub-personas I1-I5).

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export interface IndustryContent {
  slug: string
  heroTitle: string
  heroSubtitle: string
  painPoints: { title: string; body: string }[]
  howProcureaHelps: { title: string; body: string }[]
  topFeatures: string[] // path keys from paths.ts
  relatedIndustries: string[] // slugs
  ctaTitle: string
  ctaBody: string
  interestTag: string // for /kontakt?interest=
  caseStudy?: { headline: string; body: string; stat: string; statLabel: string }
}

// EN content
const industriesEN: Record<string, IndustryContent> = {
  'produkcja': {
    slug: 'manufacturing',
    heroTitle: 'AI procurement automation for manufacturing',
    heroSubtitle:
      'Alternative suppliers for raw materials, components, and MRO — qualified against ISO 9001, IATF 16949, RoHS, REACH. Dual sourcing and supply chain diversification in weeks, not months.',
    painPoints: [
      {
        title: 'Manual supplier search eats your team\'s week',
        body: 'Finding 5-10 qualified vendors for a new category takes analysts 30+ hours — googling, emailing, qualifying certificates. Procurea delivers the list in an hour.',
      },
      {
        title: 'Single-source dependency is a supply chain risk',
        body: 'Post-COVID and post-Ukraine, dual sourcing is not optional. You need backup vendors in nearshore locations fast, with the right certifications, before disruption hits.',
      },
      {
        title: 'Excel supplier databases rot',
        body: 'Contacts go stale (40%/year), certifications expire, tier-2 capacity shifts. A centralized registry with AI enrichment keeps your vendor base current.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Qualified supplier shortlist in minutes',
        body: 'Describe the category (e.g. "plastic injection molding, PA66, Europe, IATF 16949"). AI searches 26 languages, verifies capabilities, filters by certifications. You get 20-100 validated vendors.',
      },
      {
        title: 'RFQ to 50 suppliers in one click',
        body: 'With Procurement add-on: send RFQ in supplier\'s local language, track responses via Supplier Portal (magic link, no login), auto follow-up to non-responders.',
      },
      {
        title: 'Side-by-side offer comparison',
        body: 'Price per unit at tiered quantities, MOQ, lead time, Incoterms, certifications — compared in one table. Export as PDF report for your CFO or board.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['budownictwo', 'logistyka', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Ready to diversify your supplier base?',
    ctaBody: 'Book a 30-minute intro call. We will show you how Procurea handles your specific category (materials, components, MRO, packaging).',
    interestTag: 'industry_manufacturing',
    caseStudy: {
      stat: '80%',
      statLabel: 'less time spent on supplier sourcing',
      headline: 'A European automotive OEM diversified its supplier base in 3 weeks',
      body: 'After a key tier-1 supplier announced capacity constraints, the procurement team used Procurea to identify 35 alternative injection molding suppliers across Central Europe. The AI-qualified shortlist replaced a process that previously took 4 months of manual research.',
    },
  },
  'eventy': {
    slug: 'events',
    heroTitle: 'Event sourcing in 48 hours — catering, AV, scenography, gadgets',
    heroSubtitle:
      'Find local vendors fast, in any city, for time-critical events. AI searches in local languages so you get authentic local pricing and availability, not Google Ads noise.',
    painPoints: [
      {
        title: 'Sourcing in a foreign city is slow and expensive',
        body: 'You\'re organizing an event in Berlin, Barcelona, or Warsaw. You don\'t know the local vendor landscape. Without local contacts, you pay 30-50% premium or risk unvetted suppliers.',
      },
      {
        title: 'Short deadlines vs long RFQ cycles',
        body: 'Event kickoff in 2 weeks. Standard RFQ process takes 3-4 weeks. You cut corners, miss alternatives, or overpay known vendors.',
      },
      {
        title: 'Different categories = different workflows',
        body: 'Catering for 500 people, AV rental, scenography, on-site staff, gadgets — all need separate vendor research. Juggling 5+ parallel RFQs in spreadsheets breaks down.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Local vendor discovery in 26 languages',
        body: 'Type "catering for 500 people, Berlin Mitte, 18 Dec, vegan options". AI searches local German directories, verified supplier data, fresh contacts. Shortlist in 20 minutes.',
      },
      {
        title: 'RFQ with multilingual templates',
        body: 'Send RFQ in German to Berlin vendors, Polish to Warsaw vendors — automatic translation. Supplier Portal accepts offers in their language, we translate back for your team.',
      },
      {
        title: 'Parallel campaigns for complex events',
        body: 'Run catering, AV, scenography campaigns simultaneously. Compare offers per category, lock in the best, move on. Growth or Scale plan gives you 50–150 campaigns per month — room for parallel category work.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fAutoFollowUp'],
    relatedIndustries: ['gastronomia', 'retail-ecommerce'],
    ctaTitle: 'Got an event in 2 weeks?',
    ctaBody: 'Start a free research campaign right now. Your shortlist of local vendors will be ready in 20 minutes.',
    interestTag: 'industry_events',
    caseStudy: {
      stat: '48h',
      statLabel: 'from brief to vendor shortlist',
      headline: 'A global events agency sourced 40 local vendors for a conference in Berlin',
      body: 'Tasked with organizing a 2,000-person tech conference, the agency needed catering, AV, and on-site branding vendors in Berlin — a market they had never operated in. Procurea searched German directories and delivered 40 qualified local vendors within two days.',
    },
  },
  'budownictwo': {
    slug: 'construction',
    heroTitle: 'Procurement for construction — materials and subcontractors',
    heroSubtitle:
      'Find qualified subcontractors (HVAC, electrical, finishing) and material suppliers for your next project. RFQ to 30+ vendors at once, compare on price, lead time, and local references.',
    painPoints: [
      {
        title: 'Tender preparation under time pressure',
        body: 'Public tender or private deal requires offers from 5+ qualified bidders in 7-14 days. Traditional outreach means endless phone calls and emails, often missing qualified vendors entirely.',
      },
      {
        title: 'Project-specific vendor qualification',
        body: 'Each project has unique requirements — certifications, insurance, locality, capacity. You need a fresh vendor list per project, not a stale database from last year.',
      },
      {
        title: 'Price comparison across tiered quotes',
        body: 'Construction vendors quote in tiered pricing, volume discounts, and milestone payments. Apples-to-apples comparison in Excel takes hours per RFQ.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Subcontractor discovery by category + location',
        body: 'Search "HVAC subcontractors, residential 200-unit development, Mazowieckie, ISO 9001, Polish-speaking team". AI returns 30-50 qualified companies with recent references.',
      },
      {
        title: 'Bulk RFQ with project specifications',
        body: 'Attach tender docs, BOQ, site plans. Send RFQ to 30+ vendors in one click. Supplier Portal collects structured quotes — no PDF parsing, no email chains.',
      },
      {
        title: 'Offer comparison with BOQ line items',
        body: 'Compare vendors on total price, per-BOQ-item price, lead time, payment terms, certifications, insurance. Export as PDF for tender evaluation committee.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'logistyka'],
    ctaTitle: 'Running a tender this month?',
    ctaBody: 'Book a demo. See how Procurea handles subcontractor RFQ for your project type (residential, commercial, industrial, infrastructure).',
    interestTag: 'industry_construction',
    caseStudy: {
      stat: '\u20AC2.4M',
      statLabel: 'annual procurement savings',
      headline: 'A Polish general contractor cut material sourcing costs by 5%',
      body: 'By running competitive RFQs through Procurea for steel, concrete, and insulation across 12 active projects, the contractor identified lower-cost suppliers with equivalent quality certifications. The consolidated savings reached \u20AC2.4M annually.',
    },
  },
  'retail-ecommerce': {
    slug: 'retail-ecommerce',
    heroTitle: 'Private label sourcing for retail and e-commerce brands',
    heroSubtitle:
      'Find private label manufacturers in Europe, Turkey, and nearshore locations. Migrate from China with 18+ alternative factories in weeks, not months. Verified CE, FDA, GOTS, OEKO-TEX certifications.',
    painPoints: [
      {
        title: 'China sourcing no longer the obvious choice',
        body: 'Tariffs, tensions, shipping costs, and ESG pressure push D2C brands toward nearshore. But finding EU/TR alternatives for cosmetics, apparel, electronics takes weeks of research — brands give up and stay in Alibaba.',
      },
      {
        title: 'MOQ negotiation for small brands',
        body: 'Growing D2C brand can\'t commit to 10,000 unit MOQs. You need manufacturers flexible on minimums, willing to prototype and scale together — not hidden in their website catalog.',
      },
      {
        title: 'Certification and sample verification',
        body: 'Private label means your brand takes legal + reputational risk. You need verified GOTS-certified cotton mills, FDA-registered cosmetic labs, CE-marked electronics OEMs — not shell companies on Alibaba.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Nearshore manufacturer discovery',
        body: 'Specify category, certifications, MOQ range, geography. AI searches industrial registries in Poland, Czech Republic, Italy, Portugal, Turkey. Delivers 20+ qualified factories with capacity data.',
      },
      {
        title: 'Sample + prototype RFQ workflow',
        body: 'Email manufacturers with your spec, budget, timeline. They submit quotes via Supplier Portal — pricing, MOQ, sample cost, lead time, variants. All in one structured table.',
      },
      {
        title: 'Multi-language negotiation',
        body: 'Talk to Italian pattern makers in Italian, Turkish mills in Turkish, Polish factories in Polish. Automatic translation preserves context and increases response rate 2-3x.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'gastronomia'],
    ctaTitle: 'Migrating from China?',
    ctaBody: 'Book a nearshore sourcing strategy call. We will map 15-20 alternative manufacturers for your category in Europe + Turkey.',
    interestTag: 'industry_retail',
    caseStudy: {
      stat: '6 weeks \u2192 2 days',
      statLabel: 'supplier discovery cycle',
      headline: 'A DTC brand migrated packaging sourcing from China to nearshore',
      body: 'Facing rising tariffs and 12-week lead times, a fast-growing DTC cosmetics brand used Procurea to find 18 alternative packaging manufacturers in Poland, Portugal, and Turkey. The entire supplier shortlist was ready in 2 days instead of the usual 6-week research cycle.',
    },
  },
  'gastronomia': {
    slug: 'horeca',
    heroTitle: 'Procurement automation for restaurants, hotels, and catering',
    heroSubtitle:
      'Find food service suppliers, kitchen equipment vendors, and F&B ingredient producers across Europe. Compare pricing, MOQ, and delivery terms — all in one platform.',
    painPoints: [
      {
        title: 'Fragmented supplier landscape',
        body: 'The HoReCa supply chain is hyper-local. Finding specialty ingredient suppliers, commercial kitchen equipment dealers, or tableware importers beyond your existing network takes weeks of phone calls and trade show visits.',
      },
      {
        title: 'Price volatility in F&B ingredients',
        body: 'Commodity prices for dairy, oils, proteins shift weekly. Without a broad supplier base for spot-buying, you are locked into above-market contracts or scrambling for last-minute alternatives.',
      },
      {
        title: 'Compliance and food safety certifications',
        body: 'HACCP, IFS, BRC, organic certifications — every supplier needs verification. Manually checking certificates across dozens of vendors is error-prone and time-consuming.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Discover specialty suppliers in any region',
        body: 'Search "organic olive oil producer, Andalusia, HACCP certified, 200L MOQ". AI scans local food industry directories in 26 languages and returns verified producers with capacity data.',
      },
      {
        title: 'Competitive RFQ for seasonal procurement',
        body: 'Run parallel RFQs for seasonal ingredients across multiple suppliers. Supplier Portal collects structured quotes — price per unit, delivery schedule, minimum order, shelf life.',
      },
      {
        title: 'Certification tracking built in',
        body: 'AI verifies HACCP, IFS, BRC, and organic certifications during supplier screening. Expired or missing certificates are flagged automatically before you send an RFQ.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['eventy', 'retail-ecommerce'],
    ctaTitle: 'Looking for better food service suppliers?',
    ctaBody: 'Book a 15-minute call. We will show you how Procurea sources F&B ingredients, equipment, and tableware for your specific operation.',
    interestTag: 'industry_horeca',
    caseStudy: {
      stat: '3x',
      statLabel: 'more supplier options per tender',
      headline: 'A hotel chain reduced food costs by consolidating ingredient sourcing',
      body: 'A 12-property hotel group used Procurea to source dairy, bakery, and fresh produce suppliers across 4 countries. By tripling the number of qualified vendors in each category, they negotiated 8% better pricing on annual contracts.',
    },
  },
  'ochrona-zdrowia': {
    slug: 'healthcare',
    heroTitle: 'Medical device and disposable sourcing for healthcare organizations',
    heroSubtitle:
      'Find CE/MDR-certified medical device manufacturers, lab equipment suppliers, and disposable producers. Verified compliance data, structured RFQ, side-by-side comparison.',
    painPoints: [
      {
        title: 'Regulatory compliance is non-negotiable',
        body: 'Every medical supplier must meet CE, MDR, FDA, or ISO 13485 standards. Verifying compliance manually for each potential vendor is a bottleneck that delays procurement by weeks.',
      },
      {
        title: 'Limited visibility into alternative suppliers',
        body: 'Healthcare procurement often relies on a small set of known distributors. When supply chain disruptions hit (as with PPE during COVID), organizations lack qualified backup vendors.',
      },
      {
        title: 'Complex approval workflows',
        body: 'Medical procurement requires clinical, compliance, and financial sign-off. Without structured vendor data, the approval process stalls at every handoff.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Compliance-first supplier discovery',
        body: 'Search by product category, certification (CE, MDR, ISO 13485), and geography. AI verifies regulatory documentation during screening — non-compliant vendors are filtered out automatically.',
      },
      {
        title: 'Structured RFQ for medical procurement',
        body: 'Send detailed RFQs with product specifications, compliance requirements, and volume tiers. Suppliers respond through a structured portal — no ambiguous email threads.',
      },
      {
        title: 'Audit-ready supplier documentation',
        body: 'Every supplier profile includes verified certifications, company data, and sourcing history. Export compliance reports for internal audit or regulatory review.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fSupplierPortal', 'fOfferComparison', 'fEmailOutreach'],
    relatedIndustries: ['produkcja', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Need qualified medical device suppliers?',
    ctaBody: 'Book a demo. We will show you how Procurea handles compliance-first sourcing for medical devices, disposables, and lab equipment.',
    interestTag: 'industry_healthcare',
    caseStudy: {
      stat: '70%',
      statLabel: 'faster supplier qualification',
      headline: 'A regional hospital network qualified 25 new disposable suppliers in 10 days',
      body: 'After a primary supplier failed a compliance audit, the procurement team used Procurea to rapidly identify CE/ISO 13485-certified alternatives for surgical disposables. The AI-screened shortlist cut the usual 5-week qualification process to under two weeks.',
    },
  },
  'logistyka': {
    slug: 'logistics',
    heroTitle: 'Supplier sourcing for logistics — warehouse, fleet, and 3PL services',
    heroSubtitle:
      'Find warehouse equipment suppliers, fleet spare parts vendors, and 3PL service providers. AI searches across markets and languages to uncover options your team would miss.',
    painPoints: [
      {
        title: 'Warehouse equipment is hard to source competitively',
        body: 'Racking systems, conveyor belts, automated picking solutions — these are niche categories with few well-known vendors. Without broad market visibility, you overpay or accept long lead times.',
      },
      {
        title: 'Fleet maintenance parts require fast turnaround',
        body: 'When a truck is down, every hour costs money. Finding a compatible spare part supplier with stock and next-day delivery across borders is a scramble that repeats every week.',
      },
      {
        title: '3PL selection lacks structured comparison',
        body: 'Evaluating third-party logistics providers on warehouse locations, SLA terms, technology stack, and pricing is a months-long manual exercise involving dozens of emails and calls.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Niche equipment supplier discovery',
        body: 'Search "automated pallet racking system, 10,000 pallet positions, CE certified, Central Europe". AI finds specialized manufacturers and distributors across 26 languages.',
      },
      {
        title: 'Emergency parts sourcing in hours',
        body: 'Describe the part, compatibility requirements, and delivery urgency. Procurea identifies suppliers with stock and sends RFQs immediately — shortlist in hours, not days.',
      },
      {
        title: 'Structured 3PL evaluation',
        body: 'Run an RFQ campaign for 3PL services with structured criteria: warehouse locations, SLA tiers, technology capabilities, pricing per pallet. Compare responses side-by-side.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fOfferComparison', 'fSupplierPortal'],
    relatedIndustries: ['produkcja', 'mro-utrzymanie-ruchu', 'budownictwo'],
    ctaTitle: 'Optimizing your logistics procurement?',
    ctaBody: 'Book a call. We will demo how Procurea handles warehouse equipment, fleet parts, and 3PL sourcing for your specific operation.',
    interestTag: 'industry_logistics',
    caseStudy: {
      stat: '40%',
      statLabel: 'reduction in fleet parts lead time',
      headline: 'A European logistics operator cut spare parts procurement time by 40%',
      body: 'Managing a fleet of 800+ vehicles across 5 countries, the operator used Procurea to build a cross-border spare parts supplier network. AI-sourced alternatives reduced average lead time from 5 days to 3 days, with 12% cost savings on brake and suspension components.',
    },
  },
  'mro-utrzymanie-ruchu': {
    slug: 'mro',
    heroTitle: 'MRO procurement — industrial spare parts, maintenance, and facilities',
    heroSubtitle:
      'Source industrial spare parts, maintenance service providers, and facilities management vendors. Reduce downtime with faster supplier discovery and competitive RFQ.',
    painPoints: [
      {
        title: 'Unplanned downtime drives emergency purchases',
        body: 'When a production line stops, procurement scrambles to find spare parts at any price. Without pre-qualified backup suppliers, you pay 30-50% premiums on emergency orders.',
      },
      {
        title: 'Tail spend is unmanaged and expensive',
        body: 'MRO purchases are high-volume, low-value — thousands of SKUs across dozens of vendors. Without consolidation, maverick buying and duplicate orders inflate costs by 15-20%.',
      },
      {
        title: 'Maintenance service providers are hard to benchmark',
        body: 'HVAC servicing, electrical maintenance, calibration labs — each category has local specialists. Comparing service quality, response time, and pricing across providers requires structured data you do not have.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Pre-qualified spare parts supplier network',
        body: 'Build a backup supplier database before emergencies happen. Search by part category, OEM compatibility, certification, and geography. AI delivers qualified alternatives you can activate instantly.',
      },
      {
        title: 'Tail spend consolidation via competitive RFQ',
        body: 'Group similar MRO categories, run structured RFQs to multiple vendors, and compare on total cost of ownership. Supplier Portal collects standardized quotes for apples-to-apples comparison.',
      },
      {
        title: 'Maintenance service benchmarking',
        body: 'Send RFQs for maintenance contracts with structured criteria: response time SLA, geographic coverage, certifications, hourly rates. Compare service providers on what matters most.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fOfferComparison', 'fEmailOutreach', 'fSupplierPortal'],
    relatedIndustries: ['produkcja', 'logistyka', 'budownictwo'],
    ctaTitle: 'Reducing MRO costs and downtime?',
    ctaBody: 'Book a demo. We will show how Procurea handles spare parts sourcing, maintenance vendor selection, and tail spend consolidation.',
    interestTag: 'industry_mro',
    caseStudy: {
      stat: '22%',
      statLabel: 'reduction in MRO spend',
      headline: 'A food processing plant consolidated spare parts sourcing across 3 facilities',
      body: 'Running 3 production facilities with 200+ maintenance SKUs each, the plant used Procurea to identify overlapping suppliers and run consolidated RFQs. The structured comparison revealed 22% savings on bearings, seals, and motor components versus incumbent pricing.',
    },
  },
}

// PL content
const industriesPL: Record<string, IndustryContent> = {
  'produkcja': {
    slug: 'manufacturing',
    heroTitle: 'Automatyzacja AI procurementu dla przemysłu produkcyjnego',
    heroSubtitle:
      'Alternatywni dostawcy surowców, komponentów i MRO — zakwalifikowani pod ISO 9001, IATF 16949, RoHS, REACH. Dual sourcing i dywersyfikacja łańcucha dostaw w tygodniach, nie miesiącach.',
    painPoints: [
      {
        title: 'Ręczne wyszukiwanie dostawców pochłania tydzień zespołu',
        body: 'Znalezienie 5-10 zakwalifikowanych vendorów dla nowej kategorii zajmuje analitykom 30+ godzin — googlowanie, maile, weryfikacja certyfikatów. Procurea dostarcza listę w godzinę.',
      },
      {
        title: 'Zależność od jednego dostawcy to ryzyko łańcucha dostaw',
        body: 'Po COVID i Ukrainie dual sourcing nie jest opcjonalny. Potrzebujesz backup vendorów w nearshore, z odpowiednimi certyfikatami, zanim wystąpi zakłócenie.',
      },
      {
        title: 'Excel-owe bazy dostawców się dezaktualizują',
        body: 'Kontakty tracą aktualność (40%/rok), certyfikaty wygasają, moce tier-2 się przesuwają. Centralny rejestr z enrichmentem AI utrzymuje bazę aktualną.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Zakwalifikowana lista dostawców w minutach',
        body: 'Opisz kategorię (np. "wtrysk tworzyw, PA66, Europa, IATF 16949"). AI przeszukuje 26 języków, weryfikuje możliwości, filtruje po certyfikatach. Dostajesz 20-100 zwalidowanych vendorów.',
      },
      {
        title: 'RFQ do 50 dostawców jednym kliknięciem',
        body: 'Z Procurement add-on: wyślij RFQ w języku dostawcy, śledź odpowiedzi przez Supplier Portal (magic link, bez logowania), auto follow-up do nierespondentów.',
      },
      {
        title: 'Porównanie ofert side-by-side',
        body: 'Cena jednostkowa przy różnych ilościach, MOQ, lead time, Incoterms, certyfikaty — w jednej tabeli. Eksport do PDF dla CFO lub zarządu.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['budownictwo', 'logistyka', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Gotowy na dywersyfikację bazy dostawców?',
    ctaBody: 'Umów 30-minutowe spotkanie. Pokażemy jak Procurea radzi sobie z Twoją konkretną kategorią (materiały, komponenty, MRO, opakowania).',
    interestTag: 'industry_manufacturing',
    caseStudy: {
      stat: '80%',
      statLabel: 'mniej czasu na sourcing dostawców',
      headline: 'Europejski OEM motoryzacyjny zdywersyfikował bazę dostawców w 3 tygodnie',
      body: 'Po tym jak kluczowy dostawca tier-1 ogłosił ograniczenia mocy, zespół zakupowy użył Procurea do identyfikacji 35 alternatywnych dostawców wtrysku tworzyw w Europie Środkowej. Lista zakwalifikowanych vendorów zastąpiła proces, który wcześniej zajmował 4 miesiące ręcznego researchu.',
    },
  },
  'eventy': {
    slug: 'events',
    heroTitle: 'Sourcing eventowy w 48h — catering, AV, scenografia, gadżety',
    heroSubtitle:
      'Lokalni dostawcy w każdym mieście dla eventów z krótkim deadlinem. AI szuka w lokalnych językach — dostajesz autentyczne lokalne ceny i dostępność, nie szum Google Ads.',
    painPoints: [
      {
        title: 'Sourcing w obcym mieście jest wolny i drogi',
        body: 'Organizujesz event w Berlinie, Barcelonie, Warszawie. Nie znasz lokalnego rynku. Bez kontaktów płacisz 30-50% premię lub ryzykujesz z niesprawdzonymi dostawcami.',
      },
      {
        title: 'Krótki deadline vs długi cykl RFQ',
        body: 'Event za 2 tygodnie. Standardowy proces RFQ trwa 3-4 tygodnie. Obcinasz rogi, tracisz alternatywy, lub przepłacasz znanym vendorom.',
      },
      {
        title: 'Różne kategorie = różne workflow',
        body: 'Catering dla 500 osób, AV, scenografia, obsługa on-site, gadżety — każda kategoria osobno. Żonglowanie 5+ równoległymi RFQ w Excelu się sypie.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Lokalne wyszukiwanie w 26 językach',
        body: 'Wpisz "catering dla 500 osób, Berlin Mitte, 18 grudnia, opcje wegańskie". AI przeszukuje lokalne niemieckie katalogi, zweryfikowane dane, świeże kontakty. Shortlista w 20 minut.',
      },
      {
        title: 'RFQ z wielojęzycznymi szablonami',
        body: 'Wysyłasz RFQ po niemiecku do Berlina, po polsku do Warszawy — automatyczne tłumaczenie. Supplier Portal przyjmuje oferty w ich języku, my tłumaczymy z powrotem dla Twojego zespołu.',
      },
      {
        title: 'Równoległe kampanie dla złożonych eventów',
        body: 'Prowadź kampanie catering, AV, scenografia jednocześnie. Porównuj oferty per kategoria, blokuj najlepsze, idź dalej. Plan Growth lub Scale daje 50–150 kampanii miesięcznie — zapas na równoległą pracę per kategoria.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fAutoFollowUp'],
    relatedIndustries: ['gastronomia', 'retail-ecommerce'],
    ctaTitle: 'Masz event za 2 tygodnie?',
    ctaBody: 'Rozpocznij darmową kampanię research teraz. Twoja shortlista lokalnych dostawców będzie gotowa w 20 minut.',
    interestTag: 'industry_events',
    caseStudy: {
      stat: '48h',
      statLabel: 'od briefu do shortlisty vendorów',
      headline: 'Globalna agencja eventowa znalazła 40 lokalnych dostawców na konferencję w Berlinie',
      body: 'Organizując konferencję tech dla 2000 osób, agencja potrzebowała dostawców cateringu, AV i brandingu w Berlinie — rynku, na którym nigdy nie działała. Procurea przeszukała niemieckie katalogi i dostarczyła 40 zakwalifikowanych lokalnych vendorów w dwa dni.',
    },
  },
  'budownictwo': {
    slug: 'construction',
    heroTitle: 'Procurement dla budownictwa — materiały i podwykonawcy',
    heroSubtitle:
      'Znajdź zakwalifikowanych podwykonawców (HVAC, elektryka, wykończenia) i dostawców materiałów dla Twojego projektu. RFQ do 30+ vendorów naraz, porównanie po cenie, lead time i lokalnych referencjach.',
    painPoints: [
      {
        title: 'Przygotowanie tendera pod presją czasu',
        body: 'Tender publiczny lub prywatny wymaga ofert od 5+ zakwalifikowanych bidderów w 7-14 dni. Tradycyjne outreach to niekończące się rozmowy i maile, często z pominięciem kwalifikowanych vendorów.',
      },
      {
        title: 'Kwalifikacja vendorów specyficzna dla projektu',
        body: 'Każdy projekt ma unikalne wymagania — certyfikaty, ubezpieczenie, lokalność, moce. Potrzebujesz świeżej listy per projekt, nie przestarzałej bazy sprzed roku.',
      },
      {
        title: 'Porównanie cen z tiered quotes',
        body: 'Vendorzy w budowlance kwotują tiered pricing, volume discounts, milestone payments. Porównanie apples-to-apples w Excelu zajmuje godziny per RFQ.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Wyszukiwanie podwykonawców wg kategorii + lokalizacji',
        body: 'Szukaj "podwykonawcy HVAC, osiedle 200-mieszkań, Mazowieckie, ISO 9001, zespół polsko-języczny". AI zwraca 30-50 zakwalifikowanych firm z ostatnimi referencjami.',
      },
      {
        title: 'Bulk RFQ z specyfikacją projektu',
        body: 'Załącz dokumenty tendera, BOQ, plany. Wyślij RFQ do 30+ vendorów jednym kliknięciem. Supplier Portal zbiera strukturalne oferty — bez parsowania PDF, bez chainów maili.',
      },
      {
        title: 'Porównanie ofert z liniami BOQ',
        body: 'Porównaj vendorów po cenie totalnej, per-BOQ-item, lead time, warunkach płatności, certyfikatach, ubezpieczeniu. Eksport PDF dla komisji tenderowej.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'logistyka'],
    ctaTitle: 'Prowadzisz tender w tym miesiącu?',
    ctaBody: 'Umów demo. Zobacz jak Procurea radzi sobie z podwykonawcami RFQ dla Twojego typu projektu (mieszkalny, komercyjny, przemysłowy, infrastruktura).',
    interestTag: 'industry_construction',
    caseStudy: {
      stat: '\u20AC2,4M',
      statLabel: 'rocznych oszczędności na procurement',
      headline: 'Polski generalny wykonawca obniżył koszty sourcingu materiałów o 5%',
      body: 'Prowadząc konkurencyjne RFQ przez Procurea na stal, beton i izolację w 12 aktywnych projektach, wykonawca zidentyfikował tańszych dostawców z równoważnymi certyfikatami jakości. Skonsolidowane oszczędności wyniosły \u20AC2,4M rocznie.',
    },
  },
  'retail-ecommerce': {
    slug: 'retail-ecommerce',
    heroTitle: 'Sourcing private label dla marek retail i e-commerce',
    heroSubtitle:
      'Znajdź producentów private label w Europie, Turcji i nearshore. Migruj z Chin z 18+ alternatywnymi fabrykami w tygodniach, nie miesiącach. Zweryfikowane certyfikaty CE, FDA, GOTS, OEKO-TEX.',
    painPoints: [
      {
        title: 'Chiny to już nie oczywisty wybór',
        body: 'Cła, napięcia, koszty wysyłki i presja ESG pchają marki D2C do nearshore. Ale znalezienie EU/TR alternatyw dla kosmetyków, odzieży, elektroniki zajmuje tygodnie — marki się poddają i zostają w Alibaba.',
      },
      {
        title: 'Negocjacja MOQ dla małych marek',
        body: 'Rosnąca marka D2C nie może zaangażować się w MOQ 10,000 sztuk. Potrzebujesz producentów elastycznych w minimach, chętnych do prototypowania i skalowania razem — nie ukrytych w katalogu strony internetowej.',
      },
      {
        title: 'Weryfikacja certyfikatów i sampli',
        body: 'Private label = Twoja marka bierze ryzyko prawne i reputacyjne. Potrzebujesz zweryfikowanych GOTS-certyfikowanych przędzalni, FDA-registered labów kosmetycznych, CE-markowanych OEM elektroniki — nie shell companies na Alibaba.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Odkrywanie producentów nearshore',
        body: 'Określ kategorię, certyfikaty, zakres MOQ, geografię. AI przeszukuje rejestry przemysłowe w Polsce, Czechach, Włoszech, Portugalii, Turcji. Dostarcza 20+ zakwalifikowanych fabryk z danymi o mocach.',
      },
      {
        title: 'Workflow RFQ z samplami i prototypami',
        body: 'Wyślij maile producentom z Twoją specyfikacją, budżetem, terminem. Oni składają oferty przez Supplier Portal — ceny, MOQ, koszt sampli, lead time, warianty. Wszystko w jednej tabeli.',
      },
      {
        title: 'Negocjacja wielojęzyczna',
        body: 'Rozmawiaj z włoskimi krawcami po włosku, tureckimi przędzalniami po turecku, polskimi fabrykami po polsku. Automatyczne tłumaczenie zachowuje kontekst i zwiększa response rate 2-3x.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'gastronomia'],
    ctaTitle: 'Migrujesz z Chin?',
    ctaBody: 'Umów spotkanie strategiczne. Zmapujemy 15-20 alternatywnych producentów dla Twojej kategorii w Europie + Turcji.',
    interestTag: 'industry_retail',
    caseStudy: {
      stat: '6 tygodni → 2 dni',
      statLabel: 'cykl wyszukiwania dostawców',
      headline: 'Marka DTC przeniosła sourcing opakowań z Chin do nearshore',
      body: 'W obliczu rosnących ceł i 12-tygodniowych lead time\'ów, szybko rosnąca marka kosmetyczna DTC użyła Procurea do znalezienia 18 alternatywnych producentów opakowań w Polsce, Portugalii i Turcji. Cała shortlista dostawców była gotowa w 2 dni zamiast zwykłego 6-tygodniowego cyklu researchu.',
    },
  },
  'gastronomia': {
    slug: 'horeca',
    heroTitle: 'Automatyzacja procurement dla restauracji, hoteli i cateringu',
    heroSubtitle:
      'Znajdź dostawców food service, vendorów sprzętu kuchennego i producentów składników F&B w Europie. Porównaj ceny, MOQ i warunki dostaw — wszystko w jednej platformie.',
    painPoints: [
      {
        title: 'Rozdrobniony krajobraz dostawców',
        body: 'Łańcuch dostaw HoReCa jest hiperlokalny. Znalezienie dostawców specjalistycznych składników, dealerów sprzętu kuchennego czy importerów zastawy stołowej poza Twoją siecią kontaktów zajmuje tygodnie rozmów telefonicznych i wizyt na targach.',
      },
      {
        title: 'Zmienność cen składników F&B',
        body: 'Ceny surowców — nabiał, oleje, białka — zmieniają się co tydzień. Bez szerokiej bazy dostawców do zakupów spot jesteś zamknięty w kontraktach powyżej cen rynkowych lub szukasz alternatyw w ostatniej chwili.',
      },
      {
        title: 'Compliance i certyfikaty bezpieczeństwa żywności',
        body: 'HACCP, IFS, BRC, certyfikaty ekologiczne — każdy dostawca wymaga weryfikacji. Ręczne sprawdzanie certyfikatów u dziesiątek vendorów jest podatne na błędy i czasochłonne.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Znajdź specjalistycznych dostawców w dowolnym regionie',
        body: 'Szukaj "producent ekologicznej oliwy z oliwek, Andaluzja, HACCP, MOQ 200L". AI skanuje lokalne katalogi food industry w 26 językach i zwraca zweryfikowanych producentów z danymi o mocach.',
      },
      {
        title: 'Konkurencyjne RFQ na procurement sezonowy',
        body: 'Prowadź równoległe RFQ na sezonowe składniki u wielu dostawców. Supplier Portal zbiera ustrukturyzowane oferty — cena za jednostkę, harmonogram dostaw, minimum zamówienia, termin przydatności.',
      },
      {
        title: 'Wbudowane śledzenie certyfikatów',
        body: 'AI weryfikuje certyfikaty HACCP, IFS, BRC i ekologiczne podczas screeningu dostawców. Wygasłe lub brakujące certyfikaty są automatycznie flagowane przed wysłaniem RFQ.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['eventy', 'retail-ecommerce'],
    ctaTitle: 'Szukasz lepszych dostawców food service?',
    ctaBody: 'Umów 15-minutowe spotkanie. Pokażemy jak Procurea sourcuje składniki F&B, sprzęt i zastawę stołową dla Twojej operacji.',
    interestTag: 'industry_horeca',
    caseStudy: {
      stat: '3x',
      statLabel: 'więcej opcji dostawców per tender',
      headline: 'Sieć hoteli obniżyła koszty żywności konsolidując sourcing składników',
      body: 'Grupa 12 hoteli użyła Procurea do sourcingu dostawców nabiału, pieczywa i świeżych produktów w 4 krajach. Potrojenie liczby zakwalifikowanych vendorów w każdej kategorii pozwoliło wynegocjować 8% lepsze ceny na kontraktach rocznych.',
    },
  },
  'ochrona-zdrowia': {
    slug: 'healthcare',
    heroTitle: 'Sourcing wyrobów medycznych i jednorazówek dla organizacji ochrony zdrowia',
    heroSubtitle:
      'Znajdź producentów wyrobów medycznych z certyfikatami CE/MDR, dostawców sprzętu laboratoryjnego i producentów jednorazówek. Zweryfikowane dane compliance, ustrukturyzowane RFQ, porównanie side-by-side.',
    painPoints: [
      {
        title: 'Regulatory compliance jest bezdyskusyjne',
        body: 'Każdy dostawca medyczny musi spełniać standardy CE, MDR, FDA lub ISO 13485. Ręczna weryfikacja compliance dla każdego potencjalnego vendora to wąskie gardło, które opóźnia procurement o tygodnie.',
      },
      {
        title: 'Ograniczona widoczność alternatywnych dostawców',
        body: 'Procurement medyczny często opiera się na małym zbiorze znanych dystrybutorów. Gdy uderzają zakłócenia łańcucha dostaw (jak PPE podczas COVID), organizacje nie mają zakwalifikowanych backup vendorów.',
      },
      {
        title: 'Złożone workflow zatwierdzania',
        body: 'Procurement medyczny wymaga sign-off klinicznego, compliance i finansowego. Bez ustrukturyzowanych danych o vendorach proces zatwierdzania utyka na każdym handoff.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Wyszukiwanie dostawców z priorytetem compliance',
        body: 'Szukaj wg kategorii produktu, certyfikacji (CE, MDR, ISO 13485) i geografii. AI weryfikuje dokumentację regulacyjną podczas screeningu — niezgodne vendory są automatycznie odfiltrowywane.',
      },
      {
        title: 'Ustrukturyzowane RFQ na procurement medyczny',
        body: 'Wysyłaj szczegółowe RFQ ze specyfikacjami produktów, wymaganiami compliance i progami wolumenowymi. Dostawcy odpowiadają przez ustrukturyzowany portal — bez niejednoznacznych chainów maili.',
      },
      {
        title: 'Dokumentacja dostawców gotowa na audyt',
        body: 'Każdy profil dostawcy zawiera zweryfikowane certyfikaty, dane firmy i historię sourcingu. Eksportuj raporty compliance na wewnętrzny audyt lub przegląd regulacyjny.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fSupplierPortal', 'fOfferComparison', 'fEmailOutreach'],
    relatedIndustries: ['produkcja', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Potrzebujesz zakwalifikowanych dostawców wyrobów medycznych?',
    ctaBody: 'Umów demo. Pokażemy jak Procurea radzi sobie z compliance-first sourcingiem wyrobów medycznych, jednorazówek i sprzętu laboratoryjnego.',
    interestTag: 'industry_healthcare',
    caseStudy: {
      stat: '70%',
      statLabel: 'szybsza kwalifikacja dostawców',
      headline: 'Regionalna sieć szpitali zakwalifikowała 25 nowych dostawców jednorazówek w 10 dni',
      body: 'Po tym jak główny dostawca nie przeszedł audytu compliance, zespół zakupowy użył Procurea do szybkiej identyfikacji alternatyw z certyfikatami CE/ISO 13485 dla jednorazówek chirurgicznych. Lista zeskanowana przez AI skróciła zwykły 5-tygodniowy proces kwalifikacji do niecałych dwóch tygodni.',
    },
  },
  'logistyka': {
    slug: 'logistics',
    heroTitle: 'Sourcing dostawców dla logistyki — magazyn, flota i usługi 3PL',
    heroSubtitle:
      'Znajdź dostawców sprzętu magazynowego, vendorów części zamiennych do floty i dostawców usług 3PL. AI szuka na rynkach i w językach, żeby odkryć opcje, które Twój zespół by przegapił.',
    painPoints: [
      {
        title: 'Sprzęt magazynowy trudno sourcować konkurencyjnie',
        body: 'Systemy regałowe, przenośniki taśmowe, zautomatyzowane rozwiązania pickingowe — to niszowe kategorie z kilkoma znanymi vendorami. Bez szerokiej widoczności rynku przepłacasz lub akceptujesz długie lead time.',
      },
      {
        title: 'Części zamienne do floty wymagają szybkiego turnaround',
        body: 'Gdy ciężarówka stoi, każda godzina kosztuje. Znalezienie kompatybilnego dostawcy części z magazynem i dostawą next-day przez granice to wyścig, który powtarza się co tydzień.',
      },
      {
        title: 'Selekcja 3PL bez ustrukturyzowanego porównania',
        body: 'Ocena dostawców logistyki zewnętrznej pod kątem lokalizacji magazynów, warunków SLA, stacku technologicznego i cen to wielomiesięczne ćwiczenie manualne obejmujące dziesiątki maili i rozmów.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Wyszukiwanie niszowych dostawców sprzętu',
        body: 'Szukaj "zautomatyzowany system regałowy, 10 000 miejsc paletowych, CE, Europa Środkowa". AI znajduje specjalistycznych producentów i dystrybutorów w 26 językach.',
      },
      {
        title: 'Awaryjny sourcing części w godzinach',
        body: 'Opisz część, wymagania kompatybilności i pilność dostawy. Procurea identyfikuje dostawców z towarem na magazynie i natychmiast wysyła RFQ — shortlista w godzinach, nie dniach.',
      },
      {
        title: 'Ustrukturyzowana ewaluacja 3PL',
        body: 'Prowadź kampanię RFQ na usługi 3PL z ustrukturyzowanymi kryteriami: lokalizacje magazynów, tiery SLA, możliwości technologiczne, cena za paletę. Porównuj odpowiedzi side-by-side.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fOfferComparison', 'fSupplierPortal'],
    relatedIndustries: ['produkcja', 'mro-utrzymanie-ruchu', 'budownictwo'],
    ctaTitle: 'Optymalizujesz procurement logistyczny?',
    ctaBody: 'Umów spotkanie. Pokażemy jak Procurea radzi sobie z sourcingiem sprzętu magazynowego, części do floty i usług 3PL dla Twojej operacji.',
    interestTag: 'industry_logistics',
    caseStudy: {
      stat: '40%',
      statLabel: 'skrócenie lead time części do floty',
      headline: 'Europejski operator logistyczny skrócił czas procurement części zamiennych o 40%',
      body: 'Zarządzając flotą 800+ pojazdów w 5 krajach, operator użył Procurea do zbudowania transgranicznej sieci dostawców części zamiennych. Alternatywy znalezione przez AI skróciły średni lead time z 5 do 3 dni, z 12% oszczędnościami na komponentach hamulcowych i zawieszeniowych.',
    },
  },
  'mro-utrzymanie-ruchu': {
    slug: 'mro',
    heroTitle: 'Procurement MRO — przemysłowe części zamienne, utrzymanie ruchu i facilities',
    heroSubtitle:
      'Sourcuj przemysłowe części zamienne, dostawców usług maintenance i vendorów zarządzania obiektami. Zmniejsz przestoje dzięki szybszemu wyszukiwaniu dostawców i konkurencyjnym RFQ.',
    painPoints: [
      {
        title: 'Nieplanowane przestoje wymuszają zakupy awaryjne',
        body: 'Gdy linia produkcyjna staje, procurement szuka części zamiennych za każdą cenę. Bez wstępnie zakwalifikowanych backup dostawców płacisz 30-50% premię na zamówieniach awaryjnych.',
      },
      {
        title: 'Tail spend jest niezarządzany i kosztowny',
        body: 'Zakupy MRO to duży wolumen, niska wartość — tysiące SKU u dziesiątek vendorów. Bez konsolidacji, maverick buying i duplikaty zamówień zawyżają koszty o 15-20%.',
      },
      {
        title: 'Dostawców usług maintenance trudno zbenchmarkować',
        body: 'Serwis HVAC, utrzymanie elektryczne, laboratoria kalibracyjne — każda kategoria ma lokalnych specjalistów. Porównanie jakości usług, czasu reakcji i cen u różnych dostawców wymaga ustrukturyzowanych danych, których nie masz.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Wstępnie zakwalifikowana sieć dostawców części',
        body: 'Zbuduj backup bazę dostawców zanim wydarzy się awaria. Szukaj wg kategorii części, kompatybilności OEM, certyfikacji i geografii. AI dostarcza zakwalifikowane alternatywy, które możesz aktywować natychmiast.',
      },
      {
        title: 'Konsolidacja tail spend przez konkurencyjne RFQ',
        body: 'Grupuj podobne kategorie MRO, prowadź ustrukturyzowane RFQ do wielu vendorów i porównuj po total cost of ownership. Supplier Portal zbiera standardowe oferty do porównania apples-to-apples.',
      },
      {
        title: 'Benchmarking usług maintenance',
        body: 'Wysyłaj RFQ na kontrakty maintenance z ustrukturyzowanymi kryteriami: czas reakcji SLA, zasięg geograficzny, certyfikacje, stawki godzinowe. Porównuj dostawców usług po tym, co ma największe znaczenie.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fOfferComparison', 'fEmailOutreach', 'fSupplierPortal'],
    relatedIndustries: ['produkcja', 'logistyka', 'budownictwo'],
    ctaTitle: 'Redukujesz koszty MRO i przestoje?',
    ctaBody: 'Umów demo. Pokażemy jak Procurea radzi sobie z sourcingiem części zamiennych, selekcją vendorów maintenance i konsolidacją tail spend.',
    interestTag: 'industry_mro',
    caseStudy: {
      stat: '22%',
      statLabel: 'redukcja wydatków MRO',
      headline: 'Zakład przetwórstwa spożywczego skonsolidował sourcing części zamiennych w 3 obiektach',
      body: 'Prowadząc 3 obiekty produkcyjne z 200+ SKU maintenance każdy, zakład użył Procurea do identyfikacji nakładających się dostawców i prowadzenia skonsolidowanych RFQ. Ustrukturyzowane porównanie ujawniło 22% oszczędności na łożyskach, uszczelnieniach i komponentach silnikowych vs dotychczasowe ceny.',
    },
  },
}

export const industries = isEN ? industriesEN : industriesPL

// Get content by slug — tries both PL and EN slug keys
export function getIndustry(slug: string): IndustryContent | null {
  return industries[slug] || null
}

// Map EN slug → PL key and vice-versa for cross-lookup
export const SLUG_ALIASES: Record<string, string> = {
  'manufacturing': 'produkcja',
  'events': 'eventy',
  'construction': 'budownictwo',
  'retail-ecommerce': 'retail-ecommerce',
  'horeca': 'gastronomia',
  'healthcare': 'ochrona-zdrowia',
  'logistics': 'logistyka',
  'mro': 'mro-utrzymanie-ruchu',
}

export function resolveSlug(slug: string): string {
  // If it's an EN slug, map to PL key (our content files use PL keys)
  return SLUG_ALIASES[slug] || slug
}
