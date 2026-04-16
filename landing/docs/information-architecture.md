# Procurea — Information Architecture

> **Purpose**: pełne drzewo IA nowej strony Procurea — jakie podstrony istnieją, jak są ze sobą powiązane, jakie mają slugi, jak mapują się PL↔EN.
>
> **Use**: single source of truth dla etapu 2 (routing React Router v7 + pre-rendering) oraz etapu 8 (sitemap.xml auto-generation). Każda przyszła podstrona deklaruje swój URL z tego dokumentu.

---

## Zasady naczelne

1. **SPA z pre-renderingiem** — zachowujemy Vite + React Router, ale dodajemy build-time static HTML per route (decyzja z roadmap, rekomendacja `vite-react-ssg`). Każda podstrona dostaje unikalny `<title>`, meta tags, JSON-LD.
2. **PL/EN ratio** — struktura identyczna, slugi zlokalizowane (jak obecne `/regulamin` ↔ `/terms`). Logika w `landing/src/i18n/index.ts` rozszerzona o pełny mapping.
3. **Dwa domeny** — `procurea.pl` dla PL, `procurea.io` dla EN. Hreflang w każdym `<head>`. Geo-redirect zostaje (skrypt w obecnym `index.html`).
4. **Slug depth max 2** — `/funkcje/ai-sourcing` OK, `/funkcje/sourcing/ai-sourcing` NIE (głębsze URLe szkodzą SEO + UX).
5. **Slug convention PL** — kebab-case, bez polskich znaków (`/dla-kogo/ochrona-zdrowia`, nie `/dla-kogo/ochrona-zdrowia`). Logika już jest w istniejących legal routes.

---

## Pełne drzewo podstron

### Tier 0 — Meta (istnieją albo core nav)

| URL PL | URL EN | Typ | Status |
|---|---|---|---|
| `/` | `/` | Home | Przebudowa w etapie 3 |
| `/cennik` | `/pricing` | Pricing | NOWY w etapie 3 |
| `/o-nas` | `/about` | About | NOWY w etapie 3 |
| `/kontakt` | `/contact` | Contact + enterprise form | NOWY w etapie 3 |
| `/regulamin` | `/terms` | Legal | ISTNIEJE |
| `/polityka-prywatnosci` | `/privacy` | Legal | ISTNIEJE |
| `/rodo` | `/gdpr` | Legal | ISTNIEJE |

### Tier 1 — Features hub + 10 feature pages

| URL PL | URL EN | Tier Procurea | Priority |
|---|---|---|---|
| `/funkcje` | `/features` | Hub (links do 10 poniżej) | P1 |
| `/funkcje/ai-sourcing` | `/features/ai-sourcing` | Starter Sourcing (core) | P0 — flagship |
| `/funkcje/enrichment-kontaktow` | `/features/contact-enrichment` | Professional Sourcing | P1 |
| `/funkcje/company-registry` | `/features/company-registry` | Professional Sourcing | P2 |
| `/funkcje/outreach-mailowy` | `/features/email-outreach` | Starter +Procurement | P0 |
| `/funkcje/supplier-portal` | `/features/supplier-portal` | Starter +Procurement | P0 |
| `/funkcje/zbieranie-ofert` | `/features/offer-collection` | Starter +Procurement | P1 |
| `/funkcje/porownywarka-ofert` | `/features/offer-comparison` | Pro +Procurement | P0 |
| `/funkcje/auto-follow-up` | `/features/auto-follow-up` | Pro +Procurement | P1 |
| `/funkcje/wielojezyczny-outreach` | `/features/multilingual-outreach` | Pro +Procurement | P1 |
| `/funkcje/raporty-pdf-pptx` | `/features/pdf-reports` | +Procurement | P2 |

**Priority legenda**:
- P0 = core differentiator, pisze się jako pierwsze (4 podstron: ai-sourcing, outreach, supplier-portal, offer-comparison)
- P1 = wspierające value props
- P2 = nice-to-have, można odłożyć

### Tier 1 — Industries hub + 8 industry pages

| URL PL | URL EN | Primary persona | Priority |
|---|---|---|---|
| `/dla-kogo` | `/industries` | Hub (grid 8 branż) | P1 |
| `/dla-kogo/produkcja` | `/industries/manufacturing` | I1 — Supply Chain Mgr | P0 |
| `/dla-kogo/eventy` | `/industries/events` | I2 — Event Producer | P0 |
| `/dla-kogo/budownictwo` | `/industries/construction` | I3 — Site Manager | P0 |
| `/dla-kogo/gastronomia` | `/industries/horeca` | I4 — F&B Director | P1 |
| `/dla-kogo/retail-ecommerce` | `/industries/retail-ecommerce` | I5 — Head of Purchasing | P1 |
| `/dla-kogo/ochrona-zdrowia` | `/industries/healthcare` | I6 — Hospital Procurement | P1 |
| `/dla-kogo/logistyka` | `/industries/logistics` | I7 — Fleet Manager | P2 |
| `/dla-kogo/mro-utrzymanie-ruchu` | `/industries/mro` | I8 — Maintenance Manager | P2 |

### Tier 2 — Use cases hub + 6 use case pages

| URL PL | URL EN | Scenariusz |
|---|---|---|
| `/zastosowania` | `/use-cases` | Hub |
| `/zastosowania/sourcing-awaryjny-48h` | `/use-cases/emergency-sourcing-48h` | Pilny sourcing w 48h |
| `/zastosowania/dywersyfikacja-dostawcow` | `/use-cases/supplier-diversification` | Dywersyfikacja po kryzysie |
| `/zastosowania/nearshore-migracja-z-chin` | `/use-cases/china-to-nearshore` | Migracja z Chin do EU |
| `/zastosowania/tender-publiczny-7-dni` | `/use-cases/public-tender-7-days` | Tender publiczny — 7 dni |
| `/zastosowania/sourcing-na-targi` | `/use-cases/trade-show-sourcing` | Sourcing pod targi |
| `/zastosowania/lokalne-sourcing` | `/use-cases/local-sourcing` | Lokalne sourcing w obcym mieście |

### Tier 2 — Blog (infra + seed content w etapie 7)

| URL PL | URL EN | Typ |
|---|---|---|
| `/blog` | `/blog` | Index |
| `/blog/:slug` | `/blog/:slug` | Post (MDX) |
| `/blog/kategoria/:kategoria` | `/blog/category/:kategoria` | Kategorie (opcjonalnie) |

**Seed topics (do szczegółów w keyword-map.md)**:
- Jak wybrać dostawcę — checklista 15 kryteriów
- RFQ template — jak napisać zapytanie ofertowe
- Sourcing w Chinach vs Europa vs Turcja — porównanie
- Dual sourcing — dlaczego masz mieć 2 dostawców każdej kategorii
- AI w procurementcie — co naprawdę działa w 2026
- Jak porównać oferty dostawców — framework
- Sourcing lokalnych dostawców — przewodnik
- Supplier qualification checklist
- E-sourcing vs manual sourcing — kalkulator kosztów
- Tender publiczny w Polsce — jak zebrać oferty w 7 dni

### Tier 2 — Lead magnets

| URL PL | URL EN | Typ |
|---|---|---|
| `/materialy` | `/resources` | Library index |
| `/materialy/:slug` | `/resources/:slug` | Gated download page |

### Tier 1 — Integracje (hub + optional detail pages per system)

| URL PL | URL EN | Typ | Priority |
|---|---|---|---|
| `/integracje` | `/integrations` | Hub — grid wszystkich systemów z badgem status | P0 (w MVP) |
| `/integracje/sap` | `/integrations/sap` | Detail: SAP S/4HANA integration | Post-MVP |
| `/integracje/oracle-netsuite` | `/integrations/oracle-netsuite` | Detail: Oracle NetSuite | Post-MVP |
| `/integracje/oracle-fusion-cloud` | `/integrations/oracle-fusion-cloud` | Detail: Oracle Fusion Cloud | Post-MVP |
| `/integracje/dynamics-365-bc` | `/integrations/dynamics-365-bc` | Detail: MS Dynamics 365 Business Central | Post-MVP |
| `/integracje/dynamics-365-fo` | `/integrations/dynamics-365-fo` | Detail: MS Dynamics 365 F&O | Post-MVP |
| `/integracje/salesforce` | `/integrations/salesforce` | Detail: Salesforce | Post-MVP |

**Rola biznesowa**: integracje to kluczowy selling point dla Enterprise (P1 Head of Procurement w firmie 100-1000+ osób ma już SAP/Oracle/Dynamics i nie kupi Procurea bez gwarancji że systemy się pogadają). W MVP tylko **hub page** `/integracje` z gridem wszystkich systemów + ich status (Available / Pilot / Roadmap Q3-Q4 2026 / Custom). Detail pages per system = post-MVP (dla SEO „procurea sap integration" keywords + deeper product marketing per system).

**Status messaging (uczciwość)**:
- **Available** — działająca integracja w produkcji (na razie: żadna)
- **Pilot** — działający adapter u pierwszych klientów, beta dla nowych
- **Roadmap Q3/Q4 2026 / 2027** — zaplanowane z datami
- **Enterprise Custom** — per-klient adaptery (SAP ECC, custom middleware)

**Hub page content** (`/integracje`):
- Hero: „Procurea works with your existing stack" (lub PL equivalent)
- Grid 8 systemów z logo + status badge + krótki opis (1 linia)
- „Don't see your system? 50+ more via Merge.dev" — niche long-tail
- CTA: „Talk to us about your ERP" → `/kontakt?interest=integration`

**Seed magnets**:
- `checklist-wyboru-dostawcy` — PDF 2 strony, 15-punktowy framework
- `rfq-template` — DOCX template zapytania ofertowego z placeholderami
- `audyt-sourcing-score` — self-serve quiz (jak skuteczny jest wasz sourcing, skala 0-100)
- `supplier-qualification-framework` — PDF 4 strony, Deep Framework
- `nearshore-migration-playbook` — PDF 8 stron, case study + checklist

### Tier 2 — Case studies (skeleton, empty-friendly)

| URL PL | URL EN | Typ |
|---|---|---|
| `/case-studies` | `/case-studies` | Index |
| `/case-studies/:slug` | `/case-studies/:slug` | Pojedyncze case study |

Do wypełnienia po zebraniu referencji od klientów beta. W etapie 6 tworzymy template + placeholder, content dolewamy progresywnie.

---

## Cross-linking heuristic (internal link graph)

Jakość SEO i UX zależy od dobrze zaplanowanych wewnętrznych linków. Zasady:

### Industry page → …
- 3-4 feature pages (te z persony jako „top 3 features")
- 1-2 use case pages pasujące do branży
- 1 link do blog post z tą branżą jako topic (kiedy istnieje)
- `/cennik` z anchor na odpowiedni tier
- `/kontakt` z prefill dla branży

### Feature page → …
- 2-3 industry pages które z feature'u korzystają najbardziej
- 1-2 use case pages w których feature jest kluczowy
- `/cennik` z anchor na tier w którym feature jest dostępny
- Powiązane feature pages (np. Outreach → Supplier Portal → Offer Collection jako „workflow")
- `/kontakt` dla Enterprise-only features

### Use case page → …
- Wszystkie feature pages użyte w scenariuszu (np. „sourcing awaryjny 48h" → ai-sourcing + outreach + auto-follow-up)
- 1 industry page najbardziej pasująca
- `/cennik` z sugestią tieru (np. Starter Full dla emergency)
- 1-2 blog posts powiązane

### Blog post → …
- 2-3 feature/industry/use case pages jako context
- 1-2 lead magnets related (jeśli istnieją)
- CTA na koniec: „zacznij darmowy research" albo „download checklist"

### Home → …
- Wszystkie hub pages (features, industries, use-cases, blog, resources)
- Pricing
- Contact (dla Enterprise CTA)

---

## Sidebar navigation structure

**Header nav (desktop + mobile)**:
```
Logo | Funkcje ▼ | Dla kogo ▼ | Integracje | Cennik | Blog | [CTA: Start free research] | [Login]

  Funkcje ▼
    Dla sourcingu
      - AI Sourcing
      - Enrichment kontaktów
      - Company Registry
    Dla procurement
      - Outreach mailowy
      - Supplier Portal
      - Zbieranie ofert
      - Porównywarka ofert
      - Auto follow-up
      - Wielojęzyczny outreach
      - Raporty PDF/PPTX
    [Zobacz wszystkie →]

  Dla kogo ▼
    - Produkcja
    - Eventy
    - Budownictwo
    - Gastronomia
    - Retail / E-commerce
    - Ochrona zdrowia
    - Logistyka
    - MRO
    [Zobacz wszystkie →]
```

**Footer nav** — rozszerzone, 6 kolumn:
```
Produkt          Dla kogo         Zastosowania      Integracje    Firma          Zasoby
- AI Sourcing    - Produkcja      - Sourcing 48h    - SAP         - O nas        - Blog
- Outreach       - Eventy         - Dywersyfikacja  - Oracle NS   - Kontakt      - Materiały
- Supplier       - Budownictwo    - Nearshore       - Oracle FC   - Kariera      - Case studies
  Portal         - Gastronomia    - Tender 7 dni    - Dynamics    - Regulamin    - Help center
- Porównywarka   - Retail         - Targi           - Salesforce  - Prywatność   
- Cennik         - Ochrona zdr.   - Lokalne         - 50+ more    - RODO         
- [+6 więcej]    - [+2 więcej]    - [+1 więcej]     (Merge.dev)                   
```

---

## URL mapping PL ↔ EN (pełna tabela dla i18n)

```typescript
// landing/src/i18n/index.ts — rozszerzenie w etapie 2
export const pathMappings: Record<string, { pl: string; en: string }> = {
  home: { pl: '/', en: '/' },
  pricing: { pl: '/cennik', en: '/pricing' },
  about: { pl: '/o-nas', en: '/about' },
  contact: { pl: '/kontakt', en: '/contact' },
  terms: { pl: '/regulamin', en: '/terms' },
  privacy: { pl: '/polityka-prywatnosci', en: '/privacy' },
  gdpr: { pl: '/rodo', en: '/gdpr' },

  // Hubs
  featuresHub: { pl: '/funkcje', en: '/features' },
  industriesHub: { pl: '/dla-kogo', en: '/industries' },
  useCasesHub: { pl: '/zastosowania', en: '/use-cases' },
  blogIndex: { pl: '/blog', en: '/blog' },
  resourcesHub: { pl: '/materialy', en: '/resources' },
  caseStudiesHub: { pl: '/case-studies', en: '/case-studies' },

  // Feature pages
  fAiSourcing: { pl: '/funkcje/ai-sourcing', en: '/features/ai-sourcing' },
  fEnrichment: { pl: '/funkcje/enrichment-kontaktow', en: '/features/contact-enrichment' },
  fCompanyRegistry: { pl: '/funkcje/company-registry', en: '/features/company-registry' },
  fEmailOutreach: { pl: '/funkcje/outreach-mailowy', en: '/features/email-outreach' },
  fSupplierPortal: { pl: '/funkcje/supplier-portal', en: '/features/supplier-portal' },
  fOfferCollection: { pl: '/funkcje/zbieranie-ofert', en: '/features/offer-collection' },
  fOfferComparison: { pl: '/funkcje/porownywarka-ofert', en: '/features/offer-comparison' },
  fAutoFollowUp: { pl: '/funkcje/auto-follow-up', en: '/features/auto-follow-up' },
  fMultilingualOutreach: { pl: '/funkcje/wielojezyczny-outreach', en: '/features/multilingual-outreach' },
  fPdfReports: { pl: '/funkcje/raporty-pdf-pptx', en: '/features/pdf-reports' },

  // Industry pages
  iManufacturing: { pl: '/dla-kogo/produkcja', en: '/industries/manufacturing' },
  iEvents: { pl: '/dla-kogo/eventy', en: '/industries/events' },
  iConstruction: { pl: '/dla-kogo/budownictwo', en: '/industries/construction' },
  iHoreca: { pl: '/dla-kogo/gastronomia', en: '/industries/horeca' },
  iRetail: { pl: '/dla-kogo/retail-ecommerce', en: '/industries/retail-ecommerce' },
  iHealthcare: { pl: '/dla-kogo/ochrona-zdrowia', en: '/industries/healthcare' },
  iLogistics: { pl: '/dla-kogo/logistyka', en: '/industries/logistics' },
  iMro: { pl: '/dla-kogo/mro-utrzymanie-ruchu', en: '/industries/mro' },

  // Use case pages (6 scenariuszy)
  uEmergency48h: { pl: '/zastosowania/sourcing-awaryjny-48h', en: '/use-cases/emergency-sourcing-48h' },
  uDiversification: { pl: '/zastosowania/dywersyfikacja-dostawcow', en: '/use-cases/supplier-diversification' },
  uChinaMigration: { pl: '/zastosowania/nearshore-migracja-z-chin', en: '/use-cases/china-to-nearshore' },
  uPublicTender: { pl: '/zastosowania/tender-publiczny-7-dni', en: '/use-cases/public-tender-7-days' },
  uTradeShow: { pl: '/zastosowania/sourcing-na-targi', en: '/use-cases/trade-show-sourcing' },
  uLocalSourcing: { pl: '/zastosowania/lokalne-sourcing', en: '/use-cases/local-sourcing' },

  // Integrations (hub w MVP, detail pages post-MVP)
  integrationsHub: { pl: '/integracje', en: '/integrations' },
  intSap: { pl: '/integracje/sap', en: '/integrations/sap' },
  intOracleNetsuite: { pl: '/integracje/oracle-netsuite', en: '/integrations/oracle-netsuite' },
  intOracleFusion: { pl: '/integracje/oracle-fusion-cloud', en: '/integrations/oracle-fusion-cloud' },
  intDynamicsBc: { pl: '/integracje/dynamics-365-bc', en: '/integrations/dynamics-365-bc' },
  intDynamicsFo: { pl: '/integracje/dynamics-365-fo', en: '/integrations/dynamics-365-fo' },
  intSalesforce: { pl: '/integracje/salesforce', en: '/integrations/salesforce' },
};
```

---

## Liczba URL-i w pełnym scope

Zliczenie na podstawie powyższej struktury:
- Meta + legal: 7
- Features (hub + 10): 11
- Industries (hub + 8): 9
- Use cases (hub + 6): 7
- Integrations (hub + 6 detail): 7 (hub only w MVP = 1)
- Blog: 1 (index) + N (posty)
- Resources: 1 (index) + N (magnets)
- Case studies: 1 (index) + N (studies)

**Minimum static pages MVP**: 7 meta + home + pricing + 4 industry P0 + 4 feature P0 + 1 integrations hub = **~20 URL-i per język = 40 URL-i total** (PL + EN)

**Minimum static pages po pełnym scope** (etapy 2-6 + integracje detail): 35 + 6 = 41 URL-i per język = **82 URL-i total**.

**Z blog + resources + case studies** (etap 7+): ~100-150 URL-i per język = 200-300 total.

Pre-rendering 70-300 stron w Vite build — wykonalne w parę minut.

---

## Sitemap.xml strategia

Zamiast ręcznie utrzymywać `landing/public/sitemap.xml`, w etapie 8 generujemy go build-time ze content files:

```typescript
// landing/scripts/generate-sitemap.ts
import { pathMappings } from '../src/i18n';
// Czyta wszystkie routes + blog/resources/case-studies z /content
// Generuje sitemap.xml (PL) i sitemap-en.xml (EN)
// Dodaje hreflang alternatives
```

Uruchamiany w `postbuild` npm hook. Output:
- `dist/sitemap.xml` (PL)
- `dist-en/sitemap.xml` (EN)

---

## Redirects (edge cases)

1. Stare legacy anchors z obecnej SPA (`/#features`, `/#audience`, `/#faq`) → nie zostawiamy, bo podstrony przejmują te treści. Ale istnieją zewnętrzne linki (ads Google, LinkedIn posts). **Action**: dodać w `firebase.json` redirect `#features → /funkcje`, `#audience → /dla-kogo`, `#pricing → /cennik`, `#faq → /cennik#faq`.
2. Jeśli ktoś trafi na `procurea.pl/features` (EN slug na PL domenie) → redirect na `procurea.pl/funkcje`. W `firebase.json` rewrites + conditional 301.
3. Stara podstrona `/` na kompletnej SPA powinna zachować wszystkie trust pointy — żadna konwersja nie może „zniknąć" po refactorze.

---

## Dokumenty powiązane

- **personas.md** — kto odwiedza którą podstronę
- **pricing-model.md** — pricing page linkuje z każdej feature page
- **keyword-map.md** — każdy URL z tego dokumentu ma swój keyword w keyword map
- **roadmap-next-stages.md** — etap 2 implementuje routing zdefiniowany tutaj

## Historia zmian

- **2026-04-16** — Document created. Struktura IA na podstawie planu etapu 1.
- **2026-04-16** — Dodano Integrations hub `/integracje` + 6 detail pages per ERP system (SAP, Oracle NS, Oracle FC, Dynamics BC, Dynamics F&O, Salesforce). Hub w MVP, detail pages post-MVP. Top-nav rozszerzone o „Integracje", footer do 6 kolumn.
