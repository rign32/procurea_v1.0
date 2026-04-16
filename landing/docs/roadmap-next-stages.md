# Procurea — Roadmap Next Stages (Etap 2-8)

> **Purpose**: opisać co dzieje się po fundamentu (etapie 1) — etapy 2-8 z decyzjami architektonicznymi które trzeba zatwierdzić przed startem implementacji. Żeby nic nie rozpoczynać zanim nie będzie konsensusu.
>
> **Use**: punkt referencyjny kiedy decydujemy o kolejnym etapie. Każdy etap ma własne „definition of done", „otwarte decyzje" i „critical path".

---

## Stan na dziś (po etapie 1)

✅ **Etap 1 — Foundation** (ukończony 2026-04-16):
- `personas.md` — 3 primary + 8 industry sub-personas
- `pricing-model.md` — Sourcing / +Procurement / Full bundle, 3 tiery
- `information-architecture.md` — ~35 static URL-i + infra blog/resources/case-studies
- `keyword-map.md` — primary/secondary KW per URL, priority Round 1-4
- `roadmap-next-stages.md` — ten dokument

Zero zmian w kodzie aplikacji. Landing w obecnej formie dalej działa na `procurea.pl` i `procurea.io`.

---

## Etap 2 — Infrastruktura (routing + pre-rendering + templates)

**Cel**: stworzyć szkielet nowej strony. Routing React Router v7 rozbudowany z 4 na ~35 routes, każdy route pre-renderowany do statycznego HTML z unikalnym meta/OG/JSON-LD. Zero copy — tylko placeholdery.

### Decyzja architektoniczna 1 — Pre-rendering tool

Problem: React SPA z Vite generuje jeden `index.html` na wszystkie routes. Meta tags są statyczne, Google Social Previews łapią ten sam OG image dla każdej podstrony. To kill SEO + UX.

**Opcja A — `vite-react-ssg`** [REKOMENDACJA]
- Plugin do Vite który w build-time generuje HTML per route
- Routes definiowane tym samym kodem React Router
- Każda route → osobny `.html` file w `dist/`
- Deploy bez zmian (Firebase Hosting static files)
- Trade-off: ograniczenia co można `useEffect` w SSR (np. `window` nie dostępny), wymaga drobnych refactorów

**Opcja B — `react-snap` (post-build crawler)**
- Po `vite build` uruchamia puppeteer, crawluje każdą route, zapisuje snapshot
- Prostsze w integracji (no SSR contraints)
- Trade-off: wolniejszy build (puppeteer), flaky dla dynamic content, deprecated

**Opcja C — migracja do Next.js**
- Pełne SSR/SSG, industry standard
- Trade-off: rewrite całego landingu, inny router, inna struktura
- Overkill jeśli nie planujemy ISR/dynamic routes

**Rekomendacja**: Opcja A (`vite-react-ssg`). Minimalne zmiany, zostajemy przy Vite, pełne static HTML per route. Potrzebujemy 1-2 dni refactoringu komponentów które używają `window/document` w top-level render.

### Decyzja architektoniczna 2 — Content data source

Gdzie trzymamy content podstron (feature/industry/use case)?

**Opcja A — TypeScript const files w `landing/src/content/`** [REKOMENDACJA]
- `content/industries/manufacturing.ts` exports const z całym content (i18n inline)
- Type-safe, refactor-friendly, zero dodatkowej infra
- Auto-discovery przy build przez `import.meta.glob`

**Opcja B — MDX files**
- Dla blog tak (decyzja użytkownika), ale dla industry/feature pages overkill — content ma structured data (pricing tier, linked features, etc.) którego MDX nie obsługuje dobrze
- MDX zostawiamy tylko na blog

**Opcja C — Headless CMS (Sanity/Contentful)**
- User odrzucił w poprzedniej rozmowie (wybrał MDX dla bloga)
- Nie dotyczy

**Rekomendacja**: Opcja A — TypeScript dla feature/industry/use case, MDX dla blog. Separacja struktury (TS) od długiego copy (MDX).

### Definition of Done etapu 2

- `landing/src/App.tsx` zawiera wszystkie 35 routes z `information-architecture.md`
- Każdy route ma własną komponent-stub w `landing/src/pages/` (z placeholderem copy)
- `vite-react-ssg` (albo alternative) skonfigurowany — `npm run build` produkuje 35 HTML files
- Każdy HTML ma unikalny `<title>`, `<meta description>`, `<link rel="canonical">`, `<link rel="alternate" hreflang>`
- `landing/src/i18n/index.ts` rozszerzony o pełne `pathMappings` z IA dokumentu
- Templates komponenty: `IndustryPage.tsx`, `FeaturePage.tsx`, `UseCasePage.tsx`, `BlogPostPage.tsx`, `ResourcePage.tsx`
- Smoke test: `cd landing && npm run build && npm run build:en` działa bez błędów, dist/ zawiera 35 HTML files z unique meta

**Estymata**: 4-7 dni pracy (w zależności od ilości SSR edge cases).

---

## Etap 3 — Home + Pricing rebrand

**Cel**: przepisać home i stworzyć pełną pricing page pod dual-tier narrację (Sourcing vs +Procurement vs Full).

### Zakres zmian

**Home (`/`)** — nowa sekwencja:
1. Hero (dual CTA: Free research + Enterprise demo)
2. Problem (szerszy kontekst, mniej manufacturing-centric)
3. **Dual-Tier Offer Overview** — NOWA SEKCJA, 2 karty (Sourcing / Full Workflow)
4. How it works (zostaje, lekka rewizja)
5. Features grid (links do 10 feature pages)
6. Industries grid (8 branż z linkami) — zastępuje `AudienceSection`
7. Social proof (empty-friendly, gotowy na case studies)
8. Final CTA (dual)
9. Skrócone FAQ

**Pricing (`/cennik`, `/pricing`)** — nowa pełna strona:
- Toggle „Sourcing" / „+Procurement" / „Full bundle (save)"
- 3 tier cards (Starter / Professional / Enterprise) — dynamic based on toggle
- Feature comparison table (jak w `pricing-model.md`)
- Enterprise CTA: contact form + meeting booking
- FAQ specyficzne dla pricingu

### Decyzja architektoniczna 3 — Meeting booking tool

Enterprise CTA = „Porozmawiaj z nami" — chcemy meeting booking widget albo form.

**Opcja A — Cal.com** (open-source, self-host możliwy, free tier) [REKOMENDACJA]
- Embed widget lub popup
- Integracje z Google Calendar
- Free tier wystarczy dla start
- Link w CTA: `cal.com/procurea/enterprise-demo`

**Opcja B — Calendly** ($8-16/mies)
- Industry standard, stable
- Embed widget clean

**Opcja C — Własny formularz `/kontakt` → Resend**
- Form: imię, firma, email, telefon, interest (dropdown: Starter/Pro/Enterprise), opis
- POST do backend endpoint → wysyła email do `kontakt@procurea.pl` + confirmation do usera
- Ręczne umawianie meetingów z follow-up
- Trade-off: więcej friction, ale kontrola + dane w Prisma

**Rekomendacja**: Opcja C + Opcja A jako complementary. Form dla wszystkich, dla kwalifikowanych leadów link Cal.com w follow-up. Wymaga backend endpoint `POST /contact` + Prisma model `Lead` (reuse architektury z lead magnets w etapie 7).

### Decyzja architektoniczna 4 — Free trial struktura

Z `pricing-model.md` otwarta decyzja: (a) 14-day free trial Starter, (b) Free tier 2 kampanie/mies, (c) Demo bez karty.

**Rekomendacja**: Opcja B — Free tier 2 kampanie/mies. Zgodne z obecną kulturą („beta free"), hook dla SEO, nie wymusza karty przy pierwszym kontakcie. Implementacja w aplikacji — osobny podtask, backend limit per month per user.

### Definition of Done etapu 3

- `/` przebudowane według nowej sekwencji
- `/cennik` nowa strona z toggle + feature table
- `/kontakt` z working formem → backend endpoint
- Copy PL + EN zaktualizowany w `landing/src/i18n/pl.ts` + `en.ts`
- Mobile responsive sprawdzone
- Lighthouse score ≥ 90 (performance/SEO/accessibility)
- Deploy na staging → ręczny click-through przez wszystkie CTAs
- Backend: `POST /leads` endpoint + Prisma `Lead` model

**Estymata**: 5-8 dni.

---

## Etap 4 — Industry pages (8 podstron)

**Cel**: napisać i wdrożyć 8 industry pages zgodnie z `personas.md` (industry sub-personas) i `keyword-map.md` (primary KW per URL).

### Template struktury (każda industry page)

1. **Hero** — headline z primary KW, subheadline z problemem branżowym, dual CTA
2. **Pain points** — 3 specyficzne dla branży (z `personas.md`)
3. **Use case narracja** — scenariusz z tej branży (mock campaign z content files)
4. **Top 3 features** — linki do feature pages relevantnych (z personas.md „Top 3 features")
5. **Testimonial slot** — empty-friendly, placeholder dopóki brak case study
6. **Branżowa FAQ** — 3-5 pytań specyficznych
7. **Related use cases + industries** — 2-3 cross-linki
8. **Final CTA** (dual)

### Priorytetyzacja — Round 1 (P0)

Zgodnie z `keyword-map.md`:
1. `/dla-kogo/produkcja` (I1 Manufacturing)
2. `/dla-kogo/eventy` (I2 Events)
3. `/dla-kogo/budownictwo` (I3 Construction)

Pozostałe 5 (HoReCa, Retail, Healthcare, Logistics, MRO) — Round 2.

### Definition of Done etapu 4

- 8 industry pages live z unique copy
- Content files w `landing/src/content/industries/*.ts` (PL + EN)
- Każda page ma unikalne meta + JSON-LD typu `Service`
- Internal links (do 3-4 feature pages + 1-2 use case pages każdy)
- Mock campaign screenshot dostosowany branżowo (jeśli mamy zasoby grafiki)
- Deploy na staging

**Estymata**: 1-2 dni per industry = 8-16 dni total.

---

## Etap 5 — Feature pages (10 podstron)

**Cel**: napisać i wdrożyć 10 feature pages. Każda pokazuje konkretny feature z produktu, które tiery go zawierają, use cases w których jest kluczowy.

### Template struktury

1. **Hero** — headline z primary KW, tier badge („Dostępne od Starter +Procurement"), dual CTA
2. **How it works** — step-by-step prawdziwy flow z produktu
3. **Screenshots / demo video** — realne z aplikacji (frontend repo)
4. **Dla kogo** — linki do 2-3 industry pages
5. **Use cases** — 1-2 use case pages
6. **Integration** — cross-link do related features (np. Outreach → Supplier Portal → Offer Collection)
7. **Part of plan** — tier badge detail + link do `/cennik#tier`
8. **CTA** (dual)

### Priorytetyzacja — Round 1 (P0)

1. `/funkcje/ai-sourcing` (flagship)
2. `/funkcje/outreach-mailowy`
3. `/funkcje/supplier-portal`
4. `/funkcje/porownywarka-ofert`

Pozostałe 6 — Round 2.

### Blocker: screenshoty z produktu

Każda feature page potrzebuje 2-4 screenshoty produktu. Albo:
- Zrzuty z obecnego `app.procurea.pl` (production) — wymaga dostępu + polish
- Mockup/Figma designs — ja generuję prompty, projektant robi
- Loom recording + frame extract — szybkie ale niska jakość

**Decyzja**: po etapie 3 ustalić pipeline screenshotów przed startem etapu 5.

### Definition of Done etapu 5

- 10 feature pages live
- Content files w `landing/src/content/features/*.ts`
- Screenshots w `landing/public/screenshots/features/`
- Unikalne meta + JSON-LD typu `SoftwareApplication` (feature) albo `Service`
- Cross-links działają (feature → industry → use case)
- Deploy na staging

**Estymata**: 1 dzień per feature = 10 dni.

---

## Etap 6 — Use case pages + Case studies skeleton

**Cel**: 6 use case pages (BOFU) + template/skeleton case studies.

### Use case pages

Template: „Problem → Proces ręczny → Proces z Procureą → Outcome z liczbami". Długość 800-1500 słów. Liczne internal linki.

Priorytet (z `keyword-map.md`):
1. `/zastosowania/sourcing-awaryjny-48h`
2. `/zastosowania/dywersyfikacja-dostawcow`
3. `/zastosowania/nearshore-migracja-z-chin`
4-6. Pozostałe

### Case studies skeleton

- `landing/src/pages/CaseStudyPage.tsx` — template strony
- `landing/src/content/case-studies/*.ts` — struktura danych (metadata, challenge, solution, outcome, quote)
- `/case-studies` hub — empty-friendly (pokazuje „Pracujemy nad case studies" jeśli lista pusta)
- Placeholder dla pierwszych 2-3 case studies po zebraniu referencji od klientów beta

### Blocker: real case studies data

Potrzebujemy rzeczywiste liczby + cytaty od 2-3 klientów beta. Bez tego case studies = placeholder, ale template gotowy.

**Action item**: przed etapem 6, zebrać od właściciela produktu listę klientów beta do kontaktu.

### Definition of Done etapu 6

- 6 use case pages live
- CaseStudy template + skeleton gotowe (content fill-in progresywnie)
- Deploy na staging

**Estymata**: 6-8 dni.

---

## Etap 7 — Blog + Lead magnets

**Cel**: infrastruktura treści TOFU/MOFU (blog + gated downloads) + pierwsze content piece.

### Blog infra (MDX)

- `vite-plugin-mdx` albo `@mdx-js/rollup` setup
- `landing/src/content/blog/*.mdx` — posty z frontmatter (title, slug, date, author, tags, primaryKw, relatedLinks)
- `BlogIndexPage.tsx` — lista postów z filtrowaniem (kategoria/tag), pagination
- `BlogPostPage.tsx` — renderuje MDX, reading time estimate, related posts, CTA na koniec
- Pre-rendering przez `vite-react-ssg` dla każdego posta
- Sitemap.xml auto-include blog URLs
- RSS feed `/blog/feed.xml` (opcjonalnie)

### Lead magnets infra

- `landing/src/pages/ResourceDetailPage.tsx` — preview + gated form
- `landing/src/components/forms/LeadMagnetForm.tsx` — email + firma + rola (dropdown z primary personas)
- Backend endpoint `POST /leads` (reuse z etapu 3) — zapisuje do Prisma `Lead`, wysyła email przez Resend z download link
- `landing/src/content/resources/*.ts` — metadata magnetów
- PDF files w `landing/public/downloads/` (albo protected S3 bucket dla tracking)

### Pierwsze content piece

3-5 blog posts + 1-2 lead magnets (z Round 1 priorytetu w `keyword-map.md`):
- Blog: `jak-wybrac-dostawce`, `rfq-template`, `ai-w-procurement-2026`
- Magnet: `checklist-wyboru-dostawcy`, `rfq-template` (DOCX)

### Decyzja architektoniczna 5 — PDF generation

Lead magnets to PDF files. Gdzie trzymamy + kto tworzy?

**Opcja A** — Static PDFs w `landing/public/downloads/` (committed to git)
- Proste, działa out-of-box
- Trade-off: git size grows, update = redeploy

**Opcja B** — Firebase Storage + signed URLs
- Bettter for updates, tracking
- Wymaga backend endpoint generującego signed URL per lead

**Rekomendacja**: Opcja A dla MVP lead magnetów. Jeśli rosną ponad 10-20 plików — migracja do B w etapie 8+.

### Decyzja 6 — Kto tworzy PDF content

- Checklist, RFQ template — właściciel produktu pisze content, ja formatuję
- Nearshore playbook (8 stron) — wspólna praca lub outsource copywriter

**Action item**: przed etapem 7, zdecydować kto pisze content + zlecać.

### Definition of Done etapu 7

- MDX plugin working, blog URLs rendered z unique meta
- Pierwsze 3 blog posts live
- Lead magnet infra: form + backend + email z download link + Prisma Lead model
- Pierwsze 2 lead magnety live
- Deploy na staging

**Estymata**: 6-10 dni (zależy od ilości content + ready PDFs).

---

## Etap 8 — SEO/Analytics finish

**Cel**: dopięcie wszystkiego co wpływa na SEO i conversion tracking. Po tym etapie strona jest „production-ready" w SEO sensie.

### Scope

- **JSON-LD per page type**:
  - Home: `WebSite` + `Organization`
  - Feature pages: `SoftwareApplication` (albo `Service`)
  - Industry pages: `Service` z `areaServed`
  - Use case pages: `Article` (how-to type)
  - Blog posts: `Article` + `Author` + `BreadcrumbList`
  - Pricing: `Product` z `Offer` per tier
  - Case studies: `Article`
- **Sitemap auto-generation** (`landing/scripts/generate-sitemap.ts`) — czyta wszystkie routes + blog/resources/case-studies z content, generuje `sitemap.xml` per domena z hreflang alternates
- **GSC submission** — submit do `procurea.pl` (już verified) i `procurea.io` (już verified)
- **GA4 events**:
  - `sign_up_start` (CTA Free Research click)
  - `contact_form_submit` (Enterprise CTA)
  - `lead_magnet_download` (per magnet slug)
  - `pricing_toggle` (Sourcing/+Procurement/Full switches)
  - `feature_page_view` (for attribution)
- **Core Web Vitals audit** per route — Lighthouse CI w GitHub Actions
- **Robots.txt cleanup** — ensure `/login`, `/dashboard` w app NIE crawl, ale landing tak
- **Redirects** — edge cases z IA doc (legacy anchors `/#features` → `/funkcje`)

### Definition of Done etapu 8

- Wszystkie routes mają JSON-LD zwalidowany przez Google Rich Results Test
- `sitemap.xml` auto-generated, submitted do GSC
- GSC: 0 errors, warnings < 10 per site
- Lighthouse CI: każda route ≥ 90 performance, ≥ 95 SEO, ≥ 95 accessibility
- GA4 dashboards skonfigurowane dla conversion tracking
- Deploy na produkcję

**Estymata**: 4-7 dni.

---

## Timeline MVP (główna ścieżka, 2026-04-16)

Decyzja z wywiadu: **MVP 3-4 tyg** zamiast pełnego 6-11 tyg. Pełny scope etapów 6-8 (use cases, blog, lead magnets, full feature/industry) → post-MVP roadmap po zebraniu GSC danych.

| Etap | Zakres | Estymata | Kumulatywnie |
|---|---|---|---|
| 1 | Foundation (docs, 5 plików) | ✅ 1 dzień | 1 dzień |
| 2 | Routing + vite-react-ssg + templates + `Lead` Prisma model + `POST /leads` endpoint | 4-7 dni | 1-2 tyg |
| 3 | Home rebrand + Pricing page (4-kolumnowy + annual toggle) + `/kontakt` z formem + Cal.com follow-up | 5-8 dni | 2-3 tyg |
| 4 lite | 4 Industry pages P0: Manufacturing, Events, Construction, Retail/E-commerce | 6-8 dni | 3 tyg |
| 5 lite | 4 Feature pages P0: AI Sourcing, Outreach, Supplier Portal, Offer Comparison | 4-6 dni | 3-4 tyg |
| 4 extra | `/integracje` hub page (tylko hub, 8 systemów z status badge) | 1-2 dni | 3-4 tyg |

**MVP total**: 20-31 dni (~3-4 tyg) przy założeniu że content piszę en-bloc, user akceptuje po etapie.

## Post-MVP roadmap (po 30-60 dniach GSC danych)

Kolejność etapów po MVP ustalana na podstawie realnego trafficu i konwersji:

- **Round 2 industries** (4 pozostałe: HoReCa, Healthcare, Logistics, MRO) — priorytet wg GSC zapytań
- **Full feature pages** (6 pozostałych: enrichment, company registry, offer collection, auto follow-up, multilingual outreach, PDF reports) — priorytet wg GSC
- **Integration detail pages** (6 per ERP system: SAP, Oracle NS, Oracle FC, Dynamics BC, Dynamics F&O, Salesforce) — priorytet wg integration keywords GSC impressions
- **Use case pages** (6 scenariuszy BOFU) — high commercial intent
- **Blog + lead magnets** (etap 7) — MDX setup, pierwsze 3-5 artykułów, 1-2 gated downloads
- **SEO/Analytics finish** (etap 8) — JSON-LD, sitemap auto-gen, GA4 conversion events, Lighthouse CI

Każdy post-MVP etap = osobna sesja/plan po akceptacji poprzedniego.

---

## Decyzje zamknięte (2026-04-16, 3-turowy wywiad + kontekst integracji)

Wszystkie decyzje z listy „otwarte" zostały rozstrzygnięte w wywiadzie. Nowa lista otwartych decyzji = tylko te które zależą od real GSC danych post-MVP lub wymagają dodatkowej sesji.

### Strategia

| # | Decyzja | Wynik |
|---|---|---|
| 1 | Geografia klientów | **Global-first** (US/EU globalnie). procurea.io flagship, procurea.pl niche PL-only. |
| 2 | Copy language priorytet | **EN-first**, PL jako secondary translation (Gemini + review) |
| 3 | ICP Round 1 (4 branże P0) | **Manufacturing, Events, Construction, Retail/E-commerce** |
| 4 | ICP Round 2 (post-MVP) | HoReCa, Healthcare, Logistics, MRO (priorytet ustalany po GSC) |
| 5 | Case studies na start | **Brak** klientów beta, skeleton empty-friendly, social proof = metryki produktowe |
| 6 | Scope iteracji 1 | **MVP 3-4 tyg** (Round 1 P0 only) |

### Pricing

| # | Decyzja | Wynik |
|---|---|---|
| 7 | Free entry point | **Realny credit model z kodu** (10 default + 3 bonus per paid-org member). Nie wymyślamy trial. |
| 8 | Annual billing | **TAK, -20% rabat** (toggle Monthly/Annually) |
| 9 | Waluta | **USD globalnie** (geo-pricing PLN/EUR odłożone) |
| 10 | Enterprise contract minimum | **Month-to-month** (self-serve); Enterprise Custom = roczny |
| 11 | Overage policy | **Soft overage + auto-suggestion upgrade banner** |
| 12 | Enterprise Custom | Nowy 4ty tier: **$25k-$100k/rok**, unlimited, dedicated instance, white-label, SAP/Oracle |
| 13 | Procurement add-on | **Contact-sales only** (meeting online przed zakupem, zależny od Sourcing) |

### Techniczne

| # | Decyzja | Wynik |
|---|---|---|
| 14 | Pre-rendering tool | **vite-react-ssg** (build-time static HTML per route) |
| 15 | Meeting booking | **Cal.com (free) + własny form `/kontakt`** → backend `POST /leads` → Resend |
| 16 | Keyword research tool | **GSC (Google Search Console)** — darmowy, iterujemy po 30-60 dniach danych |

### Content ops

| # | Decyzja | Wynik |
|---|---|---|
| 17 | Content ownership | **Ja piszę wszystko en-bloc per etap**, user akceptuje po całości etapu |
| 18 | PDF lead magnets | Ja draftuje, user akceptuje (etap 7, post-MVP — nie w MVP scope) |
| 19 | Screenshoty produktu | Do ustalenia przed pełnym etapem 5 (post-MVP), w MVP scope nie są potrzebne |

### Integracje ERP/CRM (nowa warstwa w landing marketingu)

| # | Decyzja | Wynik |
|---|---|---|
| 20 | Integrations hub w MVP | **TAK** — `/integracje` (`/integrations`) jako top-nav item + hub page z 8 systemami |
| 21 | Integrations detail pages | **Post-MVP** — 6 detail pages (SAP, Oracle NS, Oracle FC, Dynamics BC, Dynamics F&O, Salesforce) po zebraniu danych GSC |
| 22 | Status messaging | Uczciwe badge: Available / Pilot / Roadmap Q3-Q4 2026 / Custom. Nie obiecujemy czego nie ma w produkcji. |

## Otwarte decyzje post-MVP (zależne od GSC danych lub osobnej sesji)

1. **Round 2 industries priorytet** — kolejność HoReCa/Healthcare/Logistics/MRO na podstawie GSC zapytań z Round 1 industry pages
2. **Integration detail pages priorytet** — który ERP pisać pierwszy (SAP/Oracle/Dynamics/Salesforce) na podstawie GSC impressions
3. **Blog + lead magnets** — start etapu 7, decyzja czy MDX setup teraz czy po Round 2 industries
4. **Screenshoty produktu pipeline** — kto robi, jaki polish (Figma mockup vs live screenshots vs Loom frames)
5. **Ahrefs/Semrush subscription** — czy inwestować $99-$449/mies po zebraniu GSC baseline
6. **Geo-pricing PLN/EUR** — po pierwszych paying customers, czy warto dodawać geo-detected PLN/EUR na `/cennik`

---

## Dokumenty powiązane

- **personas.md** — kto odwiedza które strony (Round 1-2 priorytetyzacja Industry pages)
- **pricing-model.md** — etap 3 implementuje Pricing page
- **information-architecture.md** — etap 2 implementuje routing, etap 8 generuje sitemap
- **keyword-map.md** — content etapów 4-7 bazuje na KW z tego dokumentu

## Historia zmian

- **2026-04-16** — Document created. Roadmap 8 etapów z decyzjami architektonicznymi.
- **2026-04-16** — Zamknięto 22 decyzje w wywiadzie (Strategia / Pricing / Techniczne / Content ops / Integracje). Scope zmieniony z full 6-11 tyg na MVP 3-4 tyg. Post-MVP etapy uzależnione od GSC danych.
- **2026-04-16** — Dodano `/integracje` hub page do MVP scope (etap 4 extra, 1-2 dni). Detail pages per ERP system = post-MVP.
