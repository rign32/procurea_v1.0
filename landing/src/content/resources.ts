// Lead magnets (gated downloadable resources)
// Each resource has EN + PL copy via isEN pattern, matching blog.ts convention

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type ResourceFormat = 'pdf' | 'docx' | 'xlsx' | 'notion' | 'quiz' | 'calculator' | 'video'

export type ResourcePersona = 'P1' | 'P2' | 'P3' | 'Mixed'
export type ResourceFunnel = 'TOFU' | 'MOFU' | 'BOFU'

export interface Resource {
  slug: string
  title: string
  excerpt: string
  format: ResourceFormat
  formatLabel: string
  fileSize?: string
  pageCount?: number
  heroImage?: string
  previewImage?: string

  // SEO
  primaryKeyword: string
  secondaryKeywords: string[]

  // Gating
  isGated: boolean
  downloadUrl?: string         // direct (non-gated)
  gatedDownloadUrl?: string    // after email capture

  // Landing copy
  valueProps: string[]
  whoItsFor: string

  // Targeting
  targetPersonas: ResourcePersona[]
  funnel: ResourceFunnel

  // Cross-linking
  relatedPosts: string[]       // blog post slugs
  relatedFeatures: string[]    // PathKey refs (e.g. 'fOfferComparison')

  publishedAt: string
  status: 'published' | 'draft' | 'coming-soon'
}

export const RESOURCES: Resource[] = [
  {
    slug: 'rfq-comparison-template',
    title: isEN
      ? 'RFQ Comparison Template — Free Excel & Notion'
      : 'Szablon porównywania ofert RFQ — darmowy Excel i Notion',
    excerpt: isEN
      ? 'A battle-tested Excel and Notion template for comparing supplier offers side-by-side. 10 comparison fields, scoring formula built in, exportable to PPTX for stakeholders.'
      : 'Sprawdzony w boju szablon Excel i Notion do porównywania ofert dostawców obok siebie. 10 pól porównawczych, wbudowana formuła scoringu, eksport do PPTX dla interesariuszy.',
    format: 'xlsx',
    formatLabel: isEN ? 'Excel + Notion Template' : 'Szablon Excel + Notion',
    fileSize: '16 KB',
    primaryKeyword: 'rfq comparison template',
    secondaryKeywords: ['supplier offer comparison', 'rfq scoring', 'vendor evaluation excel'],
    isGated: true,
    gatedDownloadUrl: '/resources/downloads/rfq-comparison-template/rfq-comparison-template.xlsx',
    valueProps: isEN
      ? [
          '10 comparison fields covering price, lead time, MOQ, certs, payment terms',
          'Built-in weighted scoring formula — plug in your priorities',
          'Excel version for finance teams + Notion version for async review',
          'One-click export to PPTX for C-level presentations',
          'Used by 200+ procurement teams in their first sourcing project',
        ]
      : [
          '10 pól porównawczych: cena, lead time, MOQ, certyfikaty, warunki płatności',
          'Wbudowana formuła ważonego scoringu — wpisz swoje priorytety',
          'Wersja Excel dla zespołów finansowych + Notion dla async review',
          'Eksport jednym kliknięciem do PPTX dla prezentacji C-level',
          'Używany przez 200+ zespołów procurement w ich pierwszym projekcie sourcingowym',
        ],
    whoItsFor: isEN
      ? 'Purchasing managers and category buyers running 5+ sourcing projects per quarter who need a defensible, audit-ready comparison framework.'
      : 'Kierownicy zakupów i category buyerzy prowadzący 5+ projektów sourcingowych kwartalnie, którzy potrzebują obronnego, gotowego na audyt frameworka porównywania.',
    targetPersonas: ['P2'],
    funnel: 'TOFU',
    relatedPosts: ['rfq-automation-workflows', 'vendor-scoring-10-criteria', 'rfq-comparison-template-buyers-use'],
    relatedFeatures: ['fOfferComparison', 'fOfferCollection'],
    publishedAt: '2026-04-18',
    status: 'coming-soon',
  },
  {
    slug: 'supplier-risk-checklist-2026',
    title: isEN
      ? 'Supplier Risk Checklist 2026 — 20-Point Verification Guide'
      : 'Checklista ryzyka dostawcy 2026 — przewodnik weryfikacji w 20 punktach',
    excerpt: isEN
      ? 'The comprehensive 20-point supplier risk verification checklist used by procurement teams to prevent supply chain disruption. Financial, operational, geopolitical, ESG, cyber.'
      : 'Kompleksowa 20-punktowa checklista weryfikacji ryzyka dostawcy używana przez zespoły procurement do zapobiegania zakłóceniom łańcucha dostaw.',
    format: 'pdf',
    formatLabel: isEN ? 'PDF Checklist · 9 pages' : 'Checklista PDF · 9 stron',
    fileSize: '53 KB',
    pageCount: 9,
    primaryKeyword: 'supplier risk checklist',
    secondaryKeywords: ['vendor risk assessment', 'supplier due diligence checklist', 'supplier qualification'],
    isGated: true,
    gatedDownloadUrl: '/resources/downloads/supplier-risk-checklist-2026/supplier-risk-checklist-2026.pdf',
    valueProps: isEN
      ? [
          '20 verification points across 5 risk dimensions',
          'Quick-scan version (5 min) + deep audit version (45 min)',
          'Real-world examples: what Ukraine, COVID, and tariff shocks taught us',
          'Red-flag indicators with specific thresholds (not vague "concerning")',
          'Ready-to-customize for your vendor onboarding SOP',
        ]
      : [
          '20 punktów weryfikacji w 5 wymiarach ryzyka',
          'Wersja quick-scan (5 min) + wersja deep audit (45 min)',
          'Przykłady z życia: czego nauczyły nas Ukraina, COVID i szoki celne',
          'Wskaźniki red-flag z konkretnymi progami (nie mgliste "niepokojące")',
          'Gotowe do customizacji pod twój SOP onboardingu dostawców',
        ],
    whoItsFor: isEN
      ? 'Heads of Procurement and risk officers building or auditing vendor risk management programs, especially in regulated industries (manufacturing, healthcare, food).'
      : 'Szefowie procurement i officerzy ryzyka budujący lub audytujący programy zarządzania ryzykiem vendorów, szczególnie w branżach regulowanych.',
    targetPersonas: ['P1'],
    funnel: 'MOFU',
    relatedPosts: ['supplier-risk-management-2026', 'supplier-certifications-guide', 'supplier-database-stale-40-percent'],
    relatedFeatures: ['fCompanyRegistry', 'fEnrichment'],
    publishedAt: '2026-04-18',
    status: 'coming-soon',
  },
  {
    slug: 'tco-calculator',
    title: isEN
      ? 'TCO Calculator — Beat the Lowest-Price Trap'
      : 'Kalkulator TCO — pokonaj pułapkę najniższej ceny',
    excerpt: isEN
      ? 'Interactive Excel calculator that reveals the true Total Cost of Ownership of supplier offers. Goes beyond unit price to include logistics, duties, quality cost, payment terms, switching cost.'
      : 'Interaktywny kalkulator Excel ujawniający prawdziwy Total Cost of Ownership ofert dostawców. Wychodzi poza cenę jednostkową.',
    format: 'xlsx',
    formatLabel: isEN ? 'Excel Calculator · 3 tabs' : 'Kalkulator Excel · 3 zakładki',
    fileSize: '17 KB',
    primaryKeyword: 'tco calculator procurement',
    secondaryKeywords: ['total cost of ownership', 'landed cost calculator', 'supplier tco'],
    isGated: true,
    gatedDownloadUrl: '/resources/downloads/tco-calculator/tco-calculator.xlsx',
    valueProps: isEN
      ? [
          'Pre-configured cost categories: price, freight, duties, quality, payment, switching',
          'Side-by-side comparison of up to 5 supplier offers',
          'Sensitivity analysis: see how exchange rates or lead times change the winner',
          'Charts auto-generated for executive presentations',
          'Based on 200+ real sourcing decisions from Procurea beta cohort',
        ]
      : [
          'Prekonfigurowane kategorie kosztów: cena, fracht, cła, jakość, płatność, zmiana dostawcy',
          'Porównanie side-by-side do 5 ofert dostawców',
          'Analiza wrażliwości: zobacz jak kursy walutowe lub lead time zmieniają zwycięzcę',
          'Wykresy auto-generowane dla prezentacji executive',
          'Oparty na 200+ rzeczywistych decyzjach sourcingowych z beta cohort Procurea',
        ],
    whoItsFor: isEN
      ? 'Procurement and finance teams evaluating multi-country supplier offers, especially when considering China vs. nearshore alternatives.'
      : 'Zespoły procurement i finansowe oceniające oferty dostawców z wielu krajów, szczególnie przy porównywaniu Chiny vs. nearshore.',
    targetPersonas: ['Mixed'],
    funnel: 'MOFU',
    relatedPosts: ['tco-beat-lowest-price-trap', 'china-plus-one-strategy', 'european-nearshoring-guide-2026'],
    relatedFeatures: ['fOfferComparison'],
    publishedAt: '2026-04-18',
    status: 'coming-soon',
  },
  {
    slug: 'vendor-scoring-framework',
    title: isEN
      ? 'Vendor Scoring Framework — 10-Criteria Template'
      : 'Framework scoringu dostawcy — szablon 10 kryteriów',
    excerpt: isEN
      ? 'A defensible 10-criteria vendor scoring framework with weighting logic, ready for your procurement audit. Used to standardize supplier selection across categories.'
      : 'Obronny framework scoringu dostawcy z 10 kryteriami i logiką ważenia, gotowy na twój audyt procurement.',
    format: 'pdf',
    formatLabel: isEN ? 'PDF Framework · 15 pages' : 'Framework PDF · 15 stron',
    fileSize: '54 KB',
    pageCount: 15,
    primaryKeyword: 'vendor scoring framework',
    secondaryKeywords: ['supplier scorecard', 'supplier evaluation criteria', 'vendor rating template'],
    isGated: true,
    gatedDownloadUrl: '/resources/downloads/vendor-scoring-framework/vendor-scoring-framework.pdf',
    valueProps: isEN
      ? [
          '10 criteria: price, quality, lead time, MOQ, payment terms, certs, capacity, financial, ESG, responsiveness',
          'Weighted-average scoring with customizable weights per category',
          'Defensibility notes for audit: how to justify each weight',
          'Excel companion template for data entry',
          'Based on best practices from CIPS and ISM procurement standards',
        ]
      : [
          '10 kryteriów: cena, jakość, lead time, MOQ, warunki płatności, certyfikaty, moce, finansowe, ESG, responsywność',
          'Scoring średniej ważonej z customizowalnymi wagami per kategoria',
          'Notatki obronne na audyt: jak uzasadnić każdą wagę',
          'Towarzyszący szablon Excel do wprowadzania danych',
          'Oparty na najlepszych praktykach z CIPS i ISM procurement standards',
        ],
    whoItsFor: isEN
      ? 'Purchasing managers standardizing supplier evaluation across categories. Especially useful for teams scaling from 1-2 buyers to a full procurement function.'
      : 'Kierownicy zakupów standaryzujący ewaluację dostawców w różnych kategoriach.',
    targetPersonas: ['P2'],
    funnel: 'TOFU',
    relatedPosts: ['vendor-scoring-10-criteria', 'rfq-comparison-template-buyers-use', 'supplier-certifications-guide'],
    relatedFeatures: ['fOfferComparison'],
    publishedAt: '2026-04-18',
    status: 'coming-soon',
  },
  {
    slug: 'nearshore-migration-playbook',
    title: isEN
      ? 'Nearshore Migration Playbook — China+1 Made Practical'
      : 'Playbook migracji nearshore — China+1 w praktyce',
    excerpt: isEN
      ? 'The step-by-step playbook for diversifying supply chain from China to European alternatives. Country comparison, sequencing strategy, board-ready business case.'
      : 'Playbook krok po kroku dla dywersyfikacji łańcucha dostaw z Chin do europejskich alternatyw. Porównanie krajów, strategia sekwencjonowania, business case gotowy na zarząd.',
    format: 'pdf',
    formatLabel: isEN ? 'PDF Playbook · 14 pages' : 'Playbook PDF · 14 stron',
    fileSize: '100 KB',
    pageCount: 14,
    primaryKeyword: 'nearshoring playbook',
    secondaryKeywords: ['china plus one strategy', 'supply chain diversification', 'nearshore sourcing europe'],
    isGated: true,
    gatedDownloadUrl: '/resources/downloads/nearshore-migration-playbook/nearshore-migration-playbook.pdf',
    valueProps: isEN
      ? [
          'Country comparison matrix: Poland, Turkey, Portugal, Romania, Hungary, Czech Republic',
          'Category-specific recommendations: textiles, electronics, metals, plastics',
          'Sequencing strategy: pilot → parallel → ramp (avoid the disruption trap)',
          'Board-ready business case template with ROI model',
          'Real examples from Procurea beta cohort: where nearshoring worked (and where it did not)',
        ]
      : [
          'Macierz porównania krajów: Polska, Turcja, Portugalia, Rumunia, Węgry, Czechy',
          'Rekomendacje per kategoria: tekstylia, elektronika, metale, plastiki',
          'Strategia sekwencjonowania: pilot → równoległe → ramp (unikaj pułapki zakłóceń)',
          'Szablon business case gotowy na zarząd z modelem ROI',
          'Prawdziwe przykłady z beta cohort Procurea: gdzie nearshoring zadziałał (i gdzie nie)',
        ],
    whoItsFor: isEN
      ? 'Heads of Procurement and Supply Chain leaders building multi-year diversification strategies away from single-country dependency.'
      : 'Szefowie procurement i supply chain budujący wieloletnie strategie dywersyfikacji.',
    targetPersonas: ['P1'],
    funnel: 'MOFU',
    relatedPosts: ['european-nearshoring-guide-2026', 'china-plus-one-strategy', 'turkey-vs-poland-vs-portugal-textiles'],
    relatedFeatures: ['fMultilingualOutreach', 'fAiSourcing'],
    publishedAt: '2026-04-18',
    status: 'coming-soon',
  },
]

export const resourceSlugs = RESOURCES.map(r => r.slug)

export function getResource(slug: string): Resource | undefined {
  return RESOURCES.find(r => r.slug === slug)
}

export function getResourcesByPersona(persona: ResourcePersona): Resource[] {
  return RESOURCES.filter(r => r.targetPersonas.includes(persona) || r.targetPersonas.includes('Mixed'))
}

export function getResourcesByFunnel(funnel: ResourceFunnel): Resource[] {
  return RESOURCES.filter(r => r.funnel === funnel)
}
