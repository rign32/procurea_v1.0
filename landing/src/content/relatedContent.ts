// Industry → related content mapping
// Replaces the former caseStudy section on industry pages.
// Pick 2 relevant articles + 1 downloadable resource per industry.

import { pathMappings } from '@/i18n/paths'

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'

export type RelatedContentType = 'blog' | 'resource'

export interface RelatedContentItem {
  type: RelatedContentType
  slug: string
  title: { en: string; pl: string }
  excerpt: { en: string; pl: string }
  /** For display only — no file fetch */
  meta?: { en: string; pl: string }
}

// Blog / resource catalog (subset used across industry pages)
const CONTENT: Record<string, RelatedContentItem> = {
  'german-manufacturer-sourcing': {
    type: 'blog',
    slug: 'german-manufacturer-sourcing',
    title: {
      en: 'How to Source from German Manufacturers Without Speaking German',
      pl: 'Jak pozyskiwać od niemieckich producentów bez znajomości niemieckiego',
    },
    excerpt: {
      en: 'Where to find Mittelstand suppliers, how to break the language barrier, email templates that work.',
      pl: 'Gdzie znaleźć dostawców Mittelstand, jak przełamać barierę językową, szablony emaili, które działają.',
    },
    meta: { en: 'Article · 9 min', pl: 'Artykuł · 9 min' },
  },
  'supplier-certifications-guide': {
    type: 'blog',
    slug: 'supplier-certifications-guide',
    title: {
      en: 'ISO 9001 vs IATF 16949 vs FDA: Supplier Certifications That Actually Matter',
      pl: 'ISO 9001, IATF 16949, FDA: certyfikaty dostawców, które mają znaczenie',
    },
    excerpt: {
      en: 'When each certification matters, how to verify, expiration tracking, red flags.',
      pl: 'Kiedy każda certyfikacja ma znaczenie, jak weryfikować, śledzenie wygaśnięć, czerwone flagi.',
    },
    meta: { en: 'Article · 11 min', pl: 'Artykuł · 11 min' },
  },
  'supplier-risk-management-2026': {
    type: 'blog',
    slug: 'supplier-risk-management-2026',
    title: {
      en: 'Supplier Risk Management: A 2026 Checklist for Procurement Teams',
      pl: 'Zarządzanie ryzykiem dostawców: checklista 2026 dla zespołów procurement',
    },
    excerpt: {
      en: 'Financial, operational, geopolitical, ESG, cyber — 20-point checklist + monitoring ops.',
      pl: 'Finansowe, operacyjne, geopolityczne, ESG, cyber — 20-punktowa checklista + monitoring.',
    },
    meta: { en: 'Article · 12 min', pl: 'Artykuł · 12 min' },
  },
  'rfq-automation-workflows': {
    type: 'blog',
    slug: 'rfq-automation-workflows',
    title: {
      en: 'RFQ Automation: 5 Workflows That Actually Work',
      pl: 'Automatyzacja RFQ: 5 workflow, które naprawdę działają',
    },
    excerpt: {
      en: 'Bulk outreach, templated offers, scoring, follow-ups, comparison. Free template included.',
      pl: 'Bulk outreach, szablonowe oferty, scoring, follow-upy, porównanie. Darmowy szablon.',
    },
    meta: { en: 'Article · 10 min', pl: 'Artykuł · 10 min' },
  },
  'sourcing-funnel-explained': {
    type: 'blog',
    slug: 'sourcing-funnel-explained',
    title: {
      en: 'From 500 Google Results to 120 Verified Suppliers: The Sourcing Funnel Explained',
      pl: 'Od 500 wyników Google do 120 zweryfikowanych dostawców: lejek sourcingowy',
    },
    excerpt: {
      en: 'Queries → URLs → screened → verified → contacted. Conversion rates at each stage.',
      pl: 'Zapytania → URL-e → screened → verified → kontakt. Wskaźniki konwersji w każdym etapie.',
    },
    meta: { en: 'Article · 8 min', pl: 'Artykuł · 8 min' },
  },
  'tco-beat-lowest-price-trap': {
    type: 'blog',
    slug: 'tco-beat-lowest-price-trap',
    title: {
      en: 'Total Cost of Ownership: How to Beat the Lowest-Price Trap',
      pl: 'Total Cost of Ownership: jak pokonać pułapkę najniższej ceny',
    },
    excerpt: {
      en: 'Why lowest unit price ≠ best value. TCO components + worked example + calculator.',
      pl: 'Dlaczego najniższa cena ≠ najlepsza wartość. Komponenty TCO + przykład + kalkulator.',
    },
    meta: { en: 'Article · 10 min', pl: 'Artykuł · 10 min' },
  },
  'vendor-scoring-10-criteria': {
    type: 'blog',
    slug: 'vendor-scoring-10-criteria',
    title: {
      en: 'Vendor Scoring: A 10-Criteria Framework for Fair Supplier Evaluation',
      pl: 'Scoring dostawców: framework 10 kryteriów uczciwej oceny',
    },
    excerpt: {
      en: '10 criteria, weighting logic, defensibility in audit, ready-to-use template.',
      pl: '10 kryteriów, logika ważenia, obrona w audycie, gotowy szablon.',
    },
    meta: { en: 'Article · 9 min', pl: 'Artykuł · 9 min' },
  },
  'china-plus-one-strategy': {
    type: 'blog',
    slug: 'china-plus-one-strategy',
    title: {
      en: 'China+1 Strategy: A Practical Playbook for 2026 Diversification',
      pl: 'Strategia China+1: praktyczny playbook dywersyfikacji na 2026',
    },
    excerpt: {
      en: '2025 tariff shocks reshaped sourcing. Alt countries by category, sequencing, board-ready template.',
      pl: 'Szoki celne 2025 zmieniły sourcing. Alternatywne kraje per kategoria, sekwencjonowanie, szablon.',
    },
    meta: { en: 'Article · 11 min', pl: 'Artykuł · 11 min' },
  },
  'turkey-vs-poland-vs-portugal-textiles': {
    type: 'blog',
    slug: 'turkey-vs-poland-vs-portugal-textiles',
    title: {
      en: 'Turkey vs Poland vs Portugal: Where to Source Textiles in 2026',
      pl: 'Turcja vs Polska vs Portugalia: gdzie szukać tekstyliów w 2026',
    },
    excerpt: {
      en: 'Country-by-country: capacity, MOQ, certs (GOTS, OEKO-TEX), lead time, price ranges.',
      pl: 'Kraj po kraju: moce, MOQ, certyfikaty (GOTS, OEKO-TEX), lead time, zakresy cen.',
    },
    meta: { en: 'Article · 13 min', pl: 'Artykuł · 13 min' },
  },
  'supplier-database-stale-40-percent': {
    type: 'blog',
    slug: 'supplier-database-stale-40-percent',
    title: {
      en: 'Why 40% of Your Supplier Database Goes Stale Every Year',
      pl: 'Dlaczego 40% bazy dostawców starzeje się każdego roku',
    },
    excerpt: {
      en: 'Why data decays, business impact, continuous refresh vs annual audit, self-audit template.',
      pl: 'Dlaczego dane się starzeją, wpływ biznesowy, ciągłe odświeżanie vs audyt roczny.',
    },
    meta: { en: 'Article · 7 min', pl: 'Artykuł · 7 min' },
  },
  'vat-vies-verification-3-minute-check': {
    type: 'blog',
    slug: 'vat-vies-verification-3-minute-check',
    title: {
      en: 'VAT VIES Verification: The 3-Minute Check That Saves You €50k',
      pl: 'Weryfikacja VAT VIES: 3-minutowa kontrola, która oszczędza €50k',
    },
    excerpt: {
      en: 'Why VAT verification matters, how VIES works, when it gets wrong answers, how to automate.',
      pl: 'Dlaczego weryfikacja VAT ma znaczenie, jak działa VIES, kiedy się myli, jak automatyzować.',
    },
    meta: { en: 'Article · 8 min', pl: 'Artykuł · 8 min' },
  },
  // Resources
  'rfq-comparison-template': {
    type: 'resource',
    slug: 'rfq-comparison-template',
    title: {
      en: 'RFQ Comparison Template',
      pl: 'Szablon porównania RFQ',
    },
    excerpt: {
      en: 'Excel + Notion template — compare supplier offers side-by-side. 10 criteria, built-in scoring.',
      pl: 'Szablon Excel + Notion — porównuj oferty dostawców side-by-side. 10 kryteriów, wbudowany scoring.',
    },
    meta: { en: 'Template · Excel + Notion', pl: 'Szablon · Excel + Notion' },
  },
  'supplier-risk-checklist-2026': {
    type: 'resource',
    slug: 'supplier-risk-checklist-2026',
    title: {
      en: 'Supplier Risk Checklist 2026',
      pl: 'Checklista ryzyka dostawcy 2026',
    },
    excerpt: {
      en: 'Comprehensive 20-point verification checklist used by procurement teams to prevent disruption.',
      pl: 'Kompleksowa 20-punktowa checklista weryfikacji — zapobiega zakłóceniom w dostawach.',
    },
    meta: { en: 'Checklist · PDF', pl: 'Checklista · PDF' },
  },
  'tco-calculator': {
    type: 'resource',
    slug: 'tco-calculator',
    title: {
      en: 'TCO Calculator',
      pl: 'Kalkulator TCO',
    },
    excerpt: {
      en: 'Interactive Excel calculator — true Total Cost of Ownership beyond unit price.',
      pl: 'Interaktywny kalkulator Excel — prawdziwy Total Cost of Ownership ponad cenę jednostkową.',
    },
    meta: { en: 'Calculator · Excel', pl: 'Kalkulator · Excel' },
  },
  'vendor-scoring-framework': {
    type: 'resource',
    slug: 'vendor-scoring-framework',
    title: {
      en: 'Vendor Scoring Framework',
      pl: 'Framework scoringu dostawcy',
    },
    excerpt: {
      en: 'Defensible 10-criteria vendor scoring framework with weighting logic. Audit-ready.',
      pl: 'Obronny framework scoringu z 10 kryteriami i logiką ważenia. Gotowy na audyt.',
    },
    meta: { en: 'Framework · PDF', pl: 'Framework · PDF' },
  },
  'nearshore-migration-playbook': {
    type: 'resource',
    slug: 'nearshore-migration-playbook',
    title: {
      en: 'Nearshore Migration Playbook',
      pl: 'Playbook migracji nearshore',
    },
    excerpt: {
      en: 'Step-by-step playbook for diversifying supply chain from China to European alternatives.',
      pl: 'Playbook krok po kroku dla dywersyfikacji łańcucha dostaw z Chin do Europy.',
    },
    meta: { en: 'Playbook · PDF', pl: 'Playbook · PDF' },
  },
}

// Industry PL-slug → list of content item slugs (order matters — first two articles, one resource)
const INDUSTRY_RELATED: Record<string, string[]> = {
  'produkcja': ['german-manufacturer-sourcing', 'supplier-certifications-guide', 'supplier-risk-checklist-2026'],
  'eventy': ['rfq-automation-workflows', 'sourcing-funnel-explained', 'rfq-comparison-template'],
  'budownictwo': ['tco-beat-lowest-price-trap', 'vendor-scoring-10-criteria', 'vendor-scoring-framework'],
  'retail-ecommerce': ['china-plus-one-strategy', 'turkey-vs-poland-vs-portugal-textiles', 'nearshore-migration-playbook'],
  'gastronomia': ['sourcing-funnel-explained', 'supplier-database-stale-40-percent', 'rfq-comparison-template'],
  'ochrona-zdrowia': ['supplier-certifications-guide', 'supplier-risk-management-2026', 'supplier-risk-checklist-2026'],
  'logistyka': ['vat-vies-verification-3-minute-check', 'supplier-risk-management-2026', 'supplier-risk-checklist-2026'],
  'mro-utrzymanie-ruchu': ['vendor-scoring-10-criteria', 'rfq-automation-workflows', 'vendor-scoring-framework'],
}

export interface ResolvedRelatedItem {
  type: RelatedContentType
  slug: string
  title: string
  excerpt: string
  meta: string
  href: string
}

export function getRelatedContentForIndustry(industrySlug: string): ResolvedRelatedItem[] {
  const slugs = INDUSTRY_RELATED[industrySlug] ?? []
  return slugs
    .map((slug) => CONTENT[slug])
    .filter(Boolean)
    .map((item) => {
      const href =
        item.type === 'blog'
          ? `${pathMappings.blogIndex[LANG]}/${item.slug}`
          : `${pathMappings.resourcesHub[LANG]}/${item.slug}`
      return {
        type: item.type,
        slug: item.slug,
        title: item.title[LANG],
        excerpt: item.excerpt[LANG],
        meta: item.meta?.[LANG] ?? '',
        href,
      }
    })
}
