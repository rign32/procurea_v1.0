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

  // Optional enrichment sections
  visualTimeline?: Array<{ day: string; event: string; eventPl?: string }>
  keyLearnings?: Array<{ text: string; textPl?: string }>
  whatWentWrong?: { text: string; textPl?: string }
  financialBreakdown?: {
    before: string
    after: string
    beforePl?: string
    afterPl?: string
    saved: string
    savedPl?: string
  }
  technicalDetails?: Array<{ label: string; labelPl?: string; value: string; valuePl?: string }>

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
    visualTimeline: [
      {
        day: isEN ? 'Day 1' : 'Dzień 1',
        event: 'Brief intake + AI scoping (IATF 16949, PA66, 500k units/year)',
        eventPl: 'Przyjęcie briefu + scoping AI (IATF 16949, PA66, 500k szt./rok)',
      },
      {
        day: isEN ? 'Day 2' : 'Dzień 2',
        event: '3 parallel searches launched: Germany, Poland, Turkey',
        eventPl: '3 równoległe wyszukiwania: Niemcy, Polska, Turcja',
      },
      {
        day: isEN ? 'Day 3' : 'Dzień 3',
        event: '47 candidates shortlisted, screening pass narrowed to 12',
        eventPl: '47 kandydatów na liście, screening zawęził do 12',
      },
      {
        day: isEN ? 'Day 4' : 'Dzień 4',
        event: 'Multilingual email outreach (DE, PL, TR, EN)',
        eventPl: 'Outreach mailowy w 4 językach (DE, PL, TR, EN)',
      },
      {
        day: isEN ? 'Day 5' : 'Dzień 5',
        event: '8 qualified suppliers confirmed with certifications verified',
        eventPl: '8 zakwalifikowanych dostawców z potwierdzonymi certyfikatami',
      },
    ],
    keyLearnings: [
      {
        text: 'Multilingual search captured ~60% more candidates than English-only',
        textPl: 'Wyszukiwanie wielojęzyczne dało ~60% więcej kandydatów niż samo angielskie',
      },
      {
        text: 'Pre-verification cut wasted RFQ sends by 70%',
        textPl: 'Wstępna weryfikacja obcięła puste wysyłki RFQ o 70%',
      },
      {
        text: 'Germany had lowest response rate; Turkey the highest',
        textPl: 'Niemcy miały najniższy response rate; Turcja najwyższy',
      },
      {
        text: 'IATF 16949 certification filter was the single most decisive criterion',
        textPl: 'Filtr IATF 16949 był najbardziej decydującym kryterium',
      },
    ],
    technicalDetails: [
      {
        label: isEN ? 'Searches run' : 'Wyszukiwania',
        value: '12',
      },
      {
        label: isEN ? 'Languages used' : 'Języki',
        value: '5 (DE, PL, TR, EN, CS)',
      },
      {
        label: isEN ? 'Credits consumed' : 'Zużyte credits',
        value: '45',
      },
      {
        label: isEN ? 'Unique companies discovered' : 'Unikalne firmy',
        value: '247',
      },
    ],
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
    visualTimeline: [
      {
        day: isEN ? 'Hour 0' : 'Godz. 0',
        event: 'Client brief — Barcelona pivot, 500-person launch, 72h window',
        eventPl: 'Brief klienta — zwrot na Barcelonę, launch 500 osób, okno 72h',
      },
      {
        day: isEN ? 'Hour 4' : 'Godz. 4',
        event: 'AI scoping in Spanish + Catalan across 4 vendor categories',
        eventPl: 'Scoping AI po hiszpańsku i katalońsku dla 4 kategorii vendorów',
      },
      {
        day: isEN ? 'Hour 18' : 'Godz. 18',
        event: '22 local vendors shortlisted with certifications & capacity match',
        eventPl: '22 lokalnych vendorów z dopasowanymi certyfikatami i capacity',
      },
      {
        day: isEN ? 'Hour 36' : 'Godz. 36',
        event: 'RFQ emails sent in native Spanish with event-specific briefs',
        eventPl: 'RFQ wysłane po hiszpańsku z briefami specyficznymi dla eventu',
      },
      {
        day: isEN ? 'Hour 48' : 'Godz. 48',
        event: '14 vendor responses collected, price normalization started',
        eventPl: '14 odpowiedzi od vendorów, start normalizacji cen',
      },
      {
        day: isEN ? 'Hour 60' : 'Godz. 60',
        event: 'Offer comparison & final shortlist per category',
        eventPl: 'Porównanie ofert i lista finalna per kategoria',
      },
      {
        day: isEN ? 'Hour 72' : 'Godz. 72',
        event: 'Contracts signed: 1 catering, 1 AV, 1 stage, 1 gifts vendor',
        eventPl: 'Podpisane kontrakty: 1 catering, 1 AV, 1 scenografia, 1 gadżety',
      },
    ],
    keyLearnings: [
      {
        text: 'Local-language outreach doubled response rate vs English-only emails',
        textPl: 'Outreach w języku lokalnym podwoił response rate vs samo angielski',
      },
      {
        text: 'Event categories needed true parallel sourcing — sequencing would have missed the window',
        textPl: 'Kategorie eventowe wymagały prawdziwego równoległego sourcingu — sekwencyjny nie zdążyłby',
      },
      {
        text: '3 of 4 winning vendors had tight MOQs but were flexible on payment terms',
        textPl: '3 z 4 wygranych vendorów miały ciasne MOQ, ale elastyczne warunki płatności',
      },
    ],
    technicalDetails: [
      {
        label: isEN ? 'Categories sourced' : 'Kategorie sourcingowe',
        value: '4',
      },
      {
        label: isEN ? 'Vendors identified' : 'Zidentyfikowani vendorzy',
        value: '22',
      },
      {
        label: isEN ? 'Responses collected' : 'Zebrane odpowiedzi',
        value: '14',
      },
      {
        label: isEN ? 'Total elapsed time' : 'Całkowity czas',
        value: isEN ? '72 hours' : '72 godziny',
      },
    ],
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
    visualTimeline: [
      {
        day: isEN ? 'Week 1 · Day 1-3' : 'Tydz. 1 · Dni 1-3',
        event: 'AI sourcing across Poland + Czech Republic, 150km radius filter',
        eventPl: 'Sourcing AI w Polsce i Czechach, filtr promienia 150 km',
      },
      {
        day: isEN ? 'Week 1 · Day 4-5' : 'Tydz. 1 · Dni 4-5',
        event: 'ISO 9001 + equipment type filters narrow pool to 22',
        eventPl: 'Filtry ISO 9001 + typ sprzętu zawężają listę do 22',
      },
      {
        day: isEN ? 'Week 1 · Day 6-7' : 'Tydz. 1 · Dni 6-7',
        event: 'RFQ emails sent in Polish + English with full tech specs',
        eventPl: 'RFQ po polsku i angielsku z pełnymi specyfikacjami',
      },
      {
        day: isEN ? 'Week 2 · Day 8-10' : 'Tydz. 2 · Dni 8-10',
        event: '15 subcontractors responded with detailed bids',
        eventPl: '15 podwykonawców odpowiedziało szczegółowymi ofertami',
      },
      {
        day: isEN ? 'Week 2 · Day 11-13' : 'Tydz. 2 · Dni 11-13',
        event: 'Offer comparison + site visits with top 3 candidates',
        eventPl: 'Porównanie ofert + wizyty na placach top 3 kandydatów',
      },
      {
        day: isEN ? 'Week 2 · Day 14' : 'Tydz. 2 · Dzień 14',
        event: 'Final selection + framework contract signed',
        eventPl: 'Finalna selekcja + podpisanie umowy ramowej',
      },
    ],
    keyLearnings: [
      {
        text: '15 subcontractors responded — ~11x more than the traditional 3-5 invite list',
        textPl: '15 podwykonawców odpowiedziało — ~11x więcej niż standardowa lista 3-5',
      },
      {
        text: 'Price range was narrower than expected — only 12% spread across 11 bids',
        textPl: 'Rozrzut cen był węższy niż oczekiwano — tylko 12% pomiędzy 11 ofertami',
      },
      {
        text: 'Lead time, not price, was the decisive factor in the final award',
        textPl: 'Termin realizacji, nie cena, był decydującym czynnikiem przy wyborze',
      },
    ],
    whatWentWrong: {
      text: 'One of our top-3 bidders turned out to have overstated their installation capacity. We caught it during the site visit in week 3 and fell back to bidder #4. Lesson: capacity claims need on-site verification, not just RFQ responses.',
      textPl: 'Jeden z naszych top-3 oferentów przesadził z deklarowaną mocą instalacyjną. Wyłapaliśmy to podczas wizyty w tygodniu 3 i przeszliśmy do oferenta #4. Wniosek: deklarowana moc wymaga weryfikacji na miejscu, nie tylko w odpowiedzi na RFQ.',
    },
    technicalDetails: [
      {
        label: isEN ? 'Countries searched' : 'Kraje',
        value: '2 (PL, CZ)',
      },
      {
        label: isEN ? 'Search radius' : 'Promień wyszukiwania',
        value: '150 km',
      },
      {
        label: isEN ? 'Qualified bids' : 'Zakwalifikowane oferty',
        value: '15',
      },
      {
        label: isEN ? 'Price spread' : 'Rozrzut cen',
        value: '12%',
      },
    ],
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
    visualTimeline: [
      {
        day: isEN ? 'Month 1' : 'Miesiąc 1',
        event: 'Audit of existing 3 vendors + gap analysis per category',
        eventPl: 'Audyt 3 obecnych vendorów + analiza luk per kategoria',
      },
      {
        day: isEN ? 'Month 2' : 'Miesiąc 2',
        event: 'AI sourcing run for produce, meat, and beverages in parallel',
        eventPl: 'Sourcing AI równolegle dla warzyw, mięsa i napojów',
      },
      {
        day: isEN ? 'Month 3' : 'Miesiąc 3',
        event: 'Pilot delivery across 4 locations + framework contracts signed',
        eventPl: 'Pilot dostaw w 4 lokalizacjach + podpisane umowy ramowe',
      },
    ],
    keyLearnings: [
      {
        text: 'HACCP certification filter was fast — only ~20% of candidate vendors held it',
        textPl: 'Filtr HACCP był szybki — tylko ~20% kandydatów go posiadało',
      },
      {
        text: 'Quarterly produce rotation beat annual contracts on seasonality pricing',
        textPl: 'Kwartalna rotacja warzyw biła roczne kontrakty na cenach sezonowych',
      },
      {
        text: 'Meat suppliers showed 24% price variance vs just 12% for vegetables',
        textPl: 'Dostawcy mięsa mieli 24% rozrzut cen vs tylko 12% dla warzyw',
      },
      {
        text: 'Quality scores (kitchen-team measured) improved above the single-vendor baseline',
        textPl: 'Oceny jakości (mierzone przez zespół kuchni) wzrosły powyżej baseline jednego vendora',
      },
    ],
    financialBreakdown: {
      before: '€1.2M annual food spend, 3 suppliers, oligopoly pricing',
      beforePl: '€1,2M roczny wydatek na żywność, 3 dostawców, ceny oligopolowe',
      after: '€1.03M annual, 12 suppliers, quarterly rotation',
      afterPl: '€1,03M rocznie, 12 dostawców, kwartalna rotacja',
      saved: '~€170k / year (≈14%)',
      savedPl: '~€170k / rok (≈14%)',
    },
    technicalDetails: [
      {
        label: isEN ? 'Categories sourced' : 'Kategorie',
        value: isEN ? '3 (produce, meat, beverages)' : '3 (warzywa, mięso, napoje)',
      },
      {
        label: isEN ? 'Qualified vendors' : 'Zakwalifikowani dostawcy',
        value: '12',
      },
      {
        label: isEN ? 'HACCP pass rate' : 'Odsetek z HACCP',
        value: '~20%',
      },
      {
        label: isEN ? 'Rotation cadence' : 'Częstotliwość rotacji',
        value: isEN ? 'Quarterly' : 'Kwartalna',
      },
    ],
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
    visualTimeline: [
      {
        day: isEN ? 'Week 1' : 'Tydzień 1',
        event: 'AI sourcing across Italy, Poland, Portugal, Czech Republic — 42 candidates',
        eventPl: 'Sourcing AI we Włoszech, Polsce, Portugalii, Czechach — 42 kandydatów',
      },
      {
        day: isEN ? 'Week 2' : 'Tydzień 2',
        event: 'GOTS / COSMOS certification verification — 18 qualified',
        eventPl: 'Weryfikacja certyfikatów GOTS / COSMOS — 18 zakwalifikowanych',
      },
      {
        day: isEN ? 'Week 3' : 'Tydzień 3',
        event: 'Sample evaluations + factory audits + 3 contracts signed',
        eventPl: 'Ocena próbek + audyty fabryk + 3 podpisane kontrakty',
      },
    ],
    keyLearnings: [
      {
        text: 'Italian contract manufacturers had the highest GOTS coverage of any country sampled',
        textPl: 'Włoscy producenci kontraktowi mieli najwyższe pokrycie GOTS ze wszystkich krajów',
      },
      {
        text: 'Small-batch MOQ (<5k units) was rare — only 9 of 42 manufacturers offered it',
        textPl: 'Małe MOQ (<5k szt.) było rzadkie — tylko 9 z 42 producentów to oferowało',
      },
      {
        text: 'Vegan formulation requirement cut candidate pool by ~40%',
        textPl: 'Wymóg formulacji wegańskich obciął pulę kandydatów o ~40%',
      },
      {
        text: 'Factory audits in week 3 changed the final ranking vs. paper scoring',
        textPl: 'Audyty fabryk w tygodniu 3 zmieniły finalny ranking vs. scoring na papierze',
      },
    ],
    whatWentWrong: {
      text: 'One Italian candidate refused to share formulation data under NDA — dropped from shortlist week 2. Lesson: NDA acceptance should be a hard pre-qualification step, not a late-stage blocker.',
      textPl: 'Jeden włoski kandydat odmówił udostępnienia formulacji pod NDA — wypadł z listy w tygodniu 2. Wniosek: akceptacja NDA powinna być twardym wymogiem wstępnej kwalifikacji, nie późnym blokerem.',
    },
    financialBreakdown: {
      before: '€12 / unit from Guangdong, 45-day sea freight, rising tariffs',
      beforePl: '€12 / szt. z Guangdongu, fracht morski 45 dni, rosnące cła',
      after: '€13 / unit from Milan, 5-day road freight, ~8% lower TCO after landed cost',
      afterPl: '€13 / szt. z Mediolanu, fracht drogowy 5 dni, TCO niższe o ~8% po landed cost',
      saved: '~€84k / year at ~30k units',
      savedPl: '~€84k / rok przy ~30k szt.',
    },
    technicalDetails: [
      {
        label: isEN ? 'Countries searched' : 'Kraje',
        value: '4 (IT, PL, PT, CZ)',
      },
      {
        label: isEN ? 'Candidates found' : 'Znalezionych kandydatów',
        value: '42',
      },
      {
        label: isEN ? 'GOTS/COSMOS verified' : 'Z certyfikatem GOTS/COSMOS',
        value: '18',
      },
      {
        label: isEN ? 'Total project cost' : 'Koszt projektu',
        value: '< €300',
      },
    ],
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
