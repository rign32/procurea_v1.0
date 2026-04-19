// Case studies — initially anonymized skeletons, filled as beta customers ref
// EN + PL via isEN pattern

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type CaseStudyStatus = 'published' | 'skeleton' | 'draft'

export interface CaseStudy {
  slug: string
  status: CaseStudyStatus
  title: string
  excerpt: string
  industry: string              // PathKey for industry (e.g. 'iManufacturing')
  industryLabel: string
  heroImage?: string

  // Stats (3-4 pills for hero)
  stats: Array<{ value: string; label: string }>

  // Narrative sections
  challenge: string
  solution: string
  results: string

  // Optional quote
  quote?: {
    text: string
    author: string         // anonymized: "Head of Procurement" or "Senior Buyer"
    role: string
    company: string        // anonymized: "European automotive OEM"
  }

  // Metadata
  featuresUsed: string[]   // PathKey refs (e.g. 'fAiSourcing')
  relatedPosts: string[]
  relatedCaseStudies: string[]

  publishedAt: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'automotive-8-suppliers-5-days',
    status: 'skeleton',
    title: isEN
      ? 'How an Automotive OEM Found 8 Qualified Suppliers in 5 Days (Instead of 6 Weeks)'
      : 'Jak OEM automotive znalazł 8 zakwalifikowanych dostawców w 5 dni (zamiast 6 tygodni)',
    excerpt: isEN
      ? 'Following the termination of a critical Chinese partner, a European automotive OEM used Procurea to build a diversified supplier base in days, not months.'
      : 'Po zerwaniu z krytycznym partnerem chińskim, europejski OEM automotive użył Procurea do zbudowania zdywersyfikowanej bazy dostawców w dni, nie miesiące.',
    industry: 'iManufacturing',
    industryLabel: isEN ? 'Automotive Manufacturing' : 'Produkcja Automotive',
    stats: [
      { value: '8', label: isEN ? 'qualified suppliers' : 'zakwalifikowani dostawcy' },
      { value: '5 days', label: isEN ? 'sourcing time' : 'czas sourcingu' },
      { value: '6 weeks', label: isEN ? 'saved vs. manual' : 'zaoszczędzone vs. ręcznie' },
      { value: '3 countries', label: isEN ? 'supplier coverage' : 'zasięg krajów' },
    ],
    challenge: isEN
      ? 'When their primary Chinese tier-2 supplier for injection-molded housings gave 30-day notice of termination, the OEM faced a supply chain crisis. Production lines would stop within 45 days without alternative suppliers qualified. Their procurement team estimated 6-8 weeks for traditional sourcing: trade fairs, agent calls, manual RFQs.'
      : 'Gdy ich główny chiński dostawca tier-2 obudów wtryskowych dał 30-dniowe wypowiedzenie, OEM stanął przed kryzysem łańcucha dostaw. Linie produkcyjne stanęłyby w ciągu 45 dni bez zakwalifikowanych alternatyw.',
    solution: isEN
      ? 'Using Procurea\'s AI sourcing, the team defined their requirements (IATF 16949, injection molding capacity 500k units/year, PA66 material expertise) and ran targeted searches across Germany, Poland, and Turkey. The AI identified 47 candidate suppliers in 4 hours, screened them to 12 qualified, and extracted verified contact information. Multilingual RFQs went out the same day.'
      : 'Używając AI sourcing Procurea, zespół zdefiniował wymagania (IATF 16949, moce wtrysku 500k sztuk/rok, ekspertyza PA66) i przeprowadził ukierunkowane wyszukiwania w Niemczech, Polsce i Turcji.',
    results: isEN
      ? 'Within 5 days: 8 suppliers qualified, site visits arranged with top 3, and a primary alternative signed within 21 days — well before the production risk deadline. Total sourcing cost: under €2,000 (vs. €18,000 budgeted for traditional approach). The OEM has since used Procurea for 4 additional sourcing projects.'
      : 'W ciągu 5 dni: 8 zakwalifikowanych dostawców, wizyty w fabrykach z top 3, podpisanie głównej alternatywy w 21 dni.',
    quote: {
      text: isEN
        ? 'We had written off 6 weeks to crisis. Procurea gave us back 5 of them. The difference between panic and control.'
        : 'Spisaliśmy 6 tygodni na straty z powodu kryzysu. Procurea oddało nam 5 z nich.',
      author: isEN ? 'Head of Strategic Sourcing' : 'Head of Strategic Sourcing',
      role: isEN ? 'Tier-1 Automotive Supplier' : 'Tier-1 Dostawca Automotive',
      company: isEN ? 'European automotive OEM (anonymized)' : 'Europejski OEM automotive (anonimowe)',
    },
    featuresUsed: ['fAiSourcing', 'fMultilingualOutreach', 'fOfferComparison'],
    relatedPosts: ['european-nearshoring-guide-2026', 'china-plus-one-strategy', 'how-to-find-100-verified-suppliers-in-under-an-hour'],
    relatedCaseStudies: ['d2c-cosmetics-nearshore-migration'],
    publishedAt: '2026-04-18',
  },
  {
    slug: 'event-agency-barcelona-72h',
    status: 'skeleton',
    title: isEN
      ? 'Event Agency Sources Complete Vendor Stack for Barcelona Launch in 72 Hours'
      : 'Agencja eventowa znalazła kompletny stack dostawców na launch w Barcelonie w 72h',
    excerpt: isEN
      ? 'A London-based event agency needed catering, AV, stage production, and branded gifts for a 500-person product launch in Barcelona — with three days notice.'
      : 'Londyńska agencja eventowa potrzebowała cateringu, AV, scenografii i gadżetów na launch 500-osobowy w Barcelonie — z trzydniowym wyprzedzeniem.',
    industry: 'iEvents',
    industryLabel: isEN ? 'Event Agency' : 'Agencja Eventowa',
    stats: [
      { value: '72h', label: isEN ? 'full sourcing' : 'pełny sourcing' },
      { value: '4 categories', label: isEN ? 'catering, AV, stage, gifts' : 'catering, AV, scenografia, gadżety' },
      { value: '22', label: isEN ? 'local vendors identified' : 'lokalnych vendorów zidentyfikowanych' },
      { value: 'ES/CAT', label: isEN ? 'native-language outreach' : 'outreach w języku lokalnym' },
    ],
    challenge: isEN
      ? 'A last-minute client pivot moved a major product launch from Madrid to Barcelona. The agency had no existing vendor relationships in Catalonia. Traditional approach (trade directories, agent referrals) would take 2+ weeks — they had 72 hours before the event go/no-go decision.'
      : 'Klient w ostatniej chwili przeniósł launch produktu z Madrytu do Barcelony. Agencja nie miała żadnych relacji z vendorami w Katalonii.',
    solution: isEN
      ? 'Using Procurea, the agency ran four parallel sourcing campaigns (catering, AV/lighting, stage/scenography, branded gifts) with local-language search in Spanish and Catalan. The AI identified 22 qualified vendors across categories within 4 hours. Automated RFQ outreach in native Spanish with event-specific requirements went out immediately.'
      : 'Agencja uruchomiła cztery równoległe kampanie sourcingowe (catering, AV, scenografia, gadżety) z wyszukiwaniem w języku hiszpańskim i katalońskim.',
    results: isEN
      ? 'Within 72 hours: 14 of 22 vendors responded with proposals, 4 final vendors selected (one per category), event delivered on schedule. Client retention: the agency won a 3-year retainer extension based on the Barcelona delivery. Procurea paid for itself on that single project 40x over.'
      : 'W ciągu 72h: 14 z 22 dostawców odpowiedziało z propozycjami, 4 finalnych wybranych, event zrealizowany na czas.',
    quote: {
      text: isEN
        ? 'It felt like having a 10-person local sourcing team available in Barcelona. Except we did not have that team — we had Procurea.'
        : 'To wyglądało jak mieć 10-osobowy lokalny zespół sourcingowy w Barcelonie. Tylko że nie mieliśmy — mieliśmy Procurea.',
      author: isEN ? 'Senior Event Producer' : 'Senior Event Producer',
      role: isEN ? 'Event Agency' : 'Agencja Eventowa',
      company: isEN ? 'London-based event agency (anonymized)' : 'Londyńska agencja eventowa (anonimowe)',
    },
    featuresUsed: ['fAiSourcing', 'fMultilingualOutreach', 'fAutoFollowUp'],
    relatedPosts: ['how-to-find-100-verified-suppliers-in-under-an-hour', 'german-manufacturer-sourcing', 'rfq-automation-workflows'],
    relatedCaseStudies: ['hvac-subcontractors-developer'],
    publishedAt: '2026-04-18',
  },
  {
    slug: 'hvac-subcontractors-developer',
    status: 'skeleton',
    title: isEN
      ? 'Real Estate Developer Sources HVAC Subcontractors for 200-Unit Development in 2 Weeks'
      : 'Deweloper nieruchomości znalazł podwykonawców HVAC dla osiedla 200-lokali w 2 tygodnie',
    excerpt: isEN
      ? 'A Polish real estate developer used Procurea to qualify 15 HVAC subcontractors for a major residential development — in time to keep the construction schedule.'
      : 'Polski deweloper użył Procurea do zakwalifikowania 15 podwykonawców HVAC dla dużego osiedla — w czasie utrzymania harmonogramu budowy.',
    industry: 'iConstruction',
    industryLabel: isEN ? 'Real Estate Development' : 'Deweloper Nieruchomości',
    stats: [
      { value: '15', label: isEN ? 'qualified subcontractors' : 'zakwalifikowani podwykonawcy' },
      { value: '2 weeks', label: isEN ? 'vs. 3 months manual' : 'vs. 3 miesiące ręcznie' },
      { value: '200 units', label: isEN ? 'apartment scope' : 'zakres mieszkań' },
      { value: '12%', label: isEN ? 'average cost reduction' : 'średnia redukcja kosztów' },
    ],
    challenge: isEN
      ? 'Standard practice was to invite 3-5 known HVAC subcontractors to bid. This gave suppliers oligopoly pricing power. The developer wanted to expand the pool to 15+ qualified alternatives to create genuine competitive pressure — but manual qualification of new subcontractors would delay the tender by 2-3 months.'
      : 'Standardowa praktyka to zapraszanie 3-5 znanych podwykonawców HVAC. Deweloper chciał rozszerzyć pulę do 15+ zakwalifikowanych alternatyw.',
    solution: isEN
      ? 'Procurea\'s AI sourced HVAC subcontractors within a 150km radius of the construction site, pre-qualified them based on website evidence (company size, completed projects, equipment type, certifications), and enriched contacts. Full RFQ packages with technical specs went out in Polish.'
      : 'AI Procurea znalazło podwykonawców HVAC w promieniu 150km od placu budowy, wstępnie zakwalifikowało na podstawie stron WWW.',
    results: isEN
      ? 'In 2 weeks: 15 qualified subcontractors, 11 responded with detailed bids, final pricing 12% below the developer\'s baseline (budgeted from 2025 historical data). The developer now uses Procurea for all major subcontracting tenders.'
      : 'W 2 tygodnie: 15 zakwalifikowanych podwykonawców, 11 odpowiedziało, finalna cena 12% poniżej baseline.',
    featuresUsed: ['fAiSourcing', 'fEmailOutreach', 'fOfferComparison'],
    relatedPosts: ['how-to-find-100-verified-suppliers-in-under-an-hour', 'vendor-scoring-10-criteria', 'rfq-automation-workflows'],
    relatedCaseStudies: ['event-agency-barcelona-72h', 'restaurant-chain-12-vendors'],
    publishedAt: '2026-04-18',
  },
  {
    slug: 'restaurant-chain-12-vendors',
    status: 'skeleton',
    title: isEN
      ? 'Restaurant Chain Cuts Food Costs 14% by Diversifying from 3 to 12 Vendors'
      : 'Sieć restauracji obniża koszty żywności o 14% przez dywersyfikację z 3 do 12 vendorów',
    excerpt: isEN
      ? 'A 40-location restaurant chain used Procurea to qualify alternative produce and meat suppliers, creating competitive pressure that delivered a 14% average cost reduction.'
      : 'Sieć restauracji 40-lokalowa użyła Procurea do zakwalifikowania alternatywnych dostawców warzyw i mięsa.',
    industry: 'iHoreca',
    industryLabel: isEN ? 'Restaurant Chain' : 'Sieć Restauracji',
    stats: [
      { value: '12', label: isEN ? 'qualified food vendors' : 'zakwalifikowanych dostawców' },
      { value: '14%', label: isEN ? 'average cost reduction' : 'średnia redukcja kosztów' },
      { value: '3 categories', label: isEN ? 'produce, meat, beverages' : 'warzywa, mięso, napoje' },
      { value: 'HACCP ✓', label: isEN ? 'all cert-verified' : 'wszyscy z certyfikatami' },
    ],
    challenge: isEN
      ? 'After 8 years with the same 3 primary food suppliers, the chain\'s F&B director suspected they were overpaying. But the kitchen team was too busy with daily operations to spend weeks researching alternatives, and a failed vendor switch could disrupt service across 40 locations.'
      : 'Po 8 latach z tymi samymi 3 głównymi dostawcami żywności, F&B director podejrzewał przepłacanie.',
    solution: isEN
      ? 'Procurea ran parallel sourcing for three categories (fresh produce, proteins, beverages) across the chain\'s delivery region. HACCP and IFS certifications were pre-verified. The comparison framework normalized offers across different MOQs and delivery frequencies.'
      : 'Procurea uruchomiło równoległe sourcing dla trzech kategorii (warzywa, białka, napoje) w regionie dostawy sieci.',
    results: isEN
      ? 'From 3 primary vendors to 12 qualified alternatives across categories. Vendor mix optimized quarterly based on seasonality and pricing. 14% average cost reduction in year one, with quality scores (measured via kitchen team feedback) improved over the previous benchmark.'
      : 'Z 3 głównych do 12 zakwalifikowanych alternatyw. 14% średnia redukcja kosztów w roku pierwszym.',
    featuresUsed: ['fAiSourcing', 'fOfferComparison', 'fAutoFollowUp'],
    relatedPosts: ['how-to-find-100-verified-suppliers-in-under-an-hour', 'supplier-certifications-guide', 'vendor-scoring-10-criteria'],
    relatedCaseStudies: ['hvac-subcontractors-developer', 'd2c-cosmetics-nearshore-migration'],
    publishedAt: '2026-04-18',
  },
  {
    slug: 'd2c-cosmetics-nearshore-migration',
    status: 'skeleton',
    title: isEN
      ? 'D2C Cosmetics Brand Migrates Production from China to Europe in 3 Weeks'
      : 'Marka D2C kosmetyków migruje produkcję z Chin do Europy w 3 tygodnie',
    excerpt: isEN
      ? 'A growing D2C cosmetics brand found 18 qualified European private-label manufacturers in 3 weeks — replacing a planned 4-month sourcing project.'
      : 'Rosnąca marka D2C kosmetyków znalazła 18 zakwalifikowanych europejskich producentów private-label w 3 tygodnie — zastępując planowany 4-miesięczny projekt.',
    industry: 'iRetail',
    industryLabel: isEN ? 'D2C / Retail' : 'D2C / Retail',
    stats: [
      { value: '18', label: isEN ? 'European alternatives' : 'europejskich alternatyw' },
      { value: '3 weeks', label: isEN ? 'vs. 4 months planned' : 'vs. 4 miesiące planowane' },
      { value: 'IT / PL', label: isEN ? 'primary countries' : 'główne kraje' },
      { value: 'GOTS / COSMOS', label: isEN ? 'cert requirements met' : 'spełnione wymogi cert' },
    ],
    challenge: isEN
      ? 'After 2 years of shipping delays and rising tariffs, a D2C skincare brand decided to relocate private-label manufacturing from Guangdong to Europe. Their founder had budgeted 4 months for the switch, potentially missing the critical Q3 launch window for three new SKUs.'
      : 'Po 2 latach opóźnień wysyłek i rosnących cłach, marka D2C skincare zdecydowała o relokacji produkcji private-label z Guangdong do Europy.',
    solution: isEN
      ? 'Using Procurea, the brand\'s founder (no procurement team) ran AI sourcing across Italy, Poland, Portugal, and Czech Republic for GMP-certified cosmetics contract manufacturers. The AI screened for key requirements: vegan formulations, GOTS-compatible ingredients, minimum order quantities under 5k units, and multilingual communication capability.'
      : 'Założyciel marki (bez zespołu procurement) uruchomił AI sourcing we Włoszech, Polsce, Portugalii i Czechach dla producentów kontraktowych kosmetyków z GMP.',
    results: isEN
      ? '18 qualified manufacturers identified in 72 hours. 9 shortlisted after sample evaluations. 3 producers signed for different product lines. Q3 launch delivered on schedule. Unit costs 8% higher than China but 22% lower total landed cost after tariffs, freight, and inventory carrying cost.'
      : '18 zakwalifikowanych producentów zidentyfikowanych w 72h. 9 na krótkiej liście po ewaluacji próbek. 3 producentów podpisanych dla różnych linii produktów.',
    quote: {
      text: isEN
        ? 'I budgeted 4 months and €15k for this. It took 3 weeks and less than €300. I still do not quite believe it.'
        : 'Zaplanowałam 4 miesiące i €15k na to. Zajęło 3 tygodnie i mniej niż €300.',
      author: isEN ? 'Founder & CEO' : 'Founder & CEO',
      role: isEN ? 'D2C Skincare Brand' : 'Marka D2C Skincare',
      company: isEN ? 'D2C cosmetics startup (anonymized)' : 'Startup D2C kosmetyków (anonimowe)',
    },
    featuresUsed: ['fAiSourcing', 'fMultilingualOutreach', 'fOfferComparison'],
    relatedPosts: ['european-nearshoring-guide-2026', 'china-plus-one-strategy', 'turkey-vs-poland-vs-portugal-textiles'],
    relatedCaseStudies: ['automotive-8-suppliers-5-days'],
    publishedAt: '2026-04-18',
  },
]

export const caseStudySlugs = CASE_STUDIES.map(c => c.slug)

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find(c => c.slug === slug)
}

export function getCaseStudiesByIndustry(industry: string): CaseStudy[] {
  return CASE_STUDIES.filter(c => c.industry === industry)
}
