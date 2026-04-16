# Procurea — Keyword Map

> **Purpose**: dla każdej przyszłej podstrony zdefiniowany **primary keyword** przed napisaniem copy. Żeby SEO nie było przypadkowe, tylko spójny plan — 1 podstrona = 1 główne słowo kluczowe + 2-5 wspierających + jasny search intent.
>
> **Use**: przed pisaniem copy podstrony (etapy 3-7) autor sprawdza ten dokument, używa `<h1>` z primary KW, bazuje `<title>` / `<meta description>` na KW, wplata secondary KW w `<h2>`/`<h3>`, pisze pod intent (informational ≠ transactional).

---

## Metodologia

**Dostęp do narzędzi**: **GSC (Google Search Console)** dla procurea.pl i procurea.io (zweryfikowane DNS TXT). Brak ahrefs/Semrush — wolumeny w tej tabeli to **„rough proxy"** dopóki nie zbierzemy 30-60 dni danych GSC z nowych podstron po deploy MVP. Ahrefs/Semrush opcjonalnie później (budget decision post-MVP).

**Plan aktualizacji wolumenów**:
1. Deploy MVP (etapy 2-5 lite) → 35-40 nowych URL-i live
2. Po 30 dniach: raport GSC „Search queries" per page → real impressions + clicks per keyword
3. Po 60 dniach: tuning copy podstron z niskim CTR, dodawanie secondary KW gdzie GSC pokazuje ruch nie-anticipated
4. Po 90 dniach: decyzja czy Round 2 industries w tej samej kolejności co plan, czy GSC zasugerował priority shift

**Skala volume proxy** (do zastąpienia real numbers z GSC po 60 dniach):
- **HIGH** — główne słowo kluczowe branży, wiele szukań, wysoka konkurencja
- **MID** — niche z dobrym intentem, umiarkowana konkurencja
- **LOW** — long-tail, niskie szukania ale wysoka precyzja (mniej konkurencji → łatwiej rankować)

**Search intent**:
- **I** (Informational) — user chce się czegoś dowiedzieć (np. „jak wybrać dostawcę")
- **C** (Commercial) — user porównuje rozwiązania, rozważa zakup (np. „procurement software")
- **T** (Transactional) — user chce kupić/zarejestrować (np. „procurea cena")
- **N** (Navigational) — user zna markę (np. „procurea login")

## Priorytet językowy: EN-first (Global market)

Decyzja 2026-04-16: procurea.io (EN) = flagship, procurea.pl = niche PL-only.

**Implikacje dla copy writing**:
- Start od EN każdej podstrony → review → generate PL translation przez Gemini → manual review
- **Primary KW EN** ma priorytet przy wyborze angle copy (headline, H1, meta title)
- PL slugi zachowują naturalność (`/cennik` nie `/pricing` na .pl) — nie kopiujemy EN struktury
- W tabelach poniżej EN KW pokazane jako referencyjne dla Round 1 content, PL jako dopełniające

---

## Meta pages

| URL PL | URL EN | Primary KW (PL) | Primary KW (EN) | Intent | Secondary KW (PL) | Secondary KW (EN) | Volume | Notes |
|---|---|---|---|---|---|---|---|---|
| `/` | `/` | automatyzacja zakupów | procurement automation | C | platforma do zakupów, ai w zakupach | procurement software, ai procurement | HIGH | Flagowa — nazwa produktu w headline |
| `/cennik` | `/pricing` | procurea cennik | procurea pricing | T | ile kosztuje procurea, plany procurea | procurea cost, procurea plans | LOW | Branded, pokazuje dla już zainteresowanych |
| `/o-nas` | `/about` | procurea firma | about procurea | N | procurea zespół, procurea założyciele | procurea team | LOW | Branded, SEO nie priorytet |
| `/kontakt` | `/contact` | procurea kontakt | contact procurea | N | procurea demo, procurea sprzedaż | procurea demo, procurea sales | LOW | Transactional contact |

---

## Feature pages (10 podstron)

| URL PL | URL EN | Primary KW (PL) | Primary KW (EN) | Intent | Secondary KW (PL) | Secondary KW (EN) | Volume | Notes |
|---|---|---|---|---|---|---|---|---|
| `/funkcje` | `/features` | funkcje procurea | procurea features | N | co oferuje procurea | what procurea offers | LOW | Hub, internal linkage |
| `/funkcje/ai-sourcing` | `/features/ai-sourcing` | ai sourcing dostawców | ai supplier sourcing | C | automatyczne wyszukiwanie dostawców, sourcing ai | automated supplier search, ai supplier discovery | HIGH | Flagowa — core product |
| `/funkcje/enrichment-kontaktow` | `/features/contact-enrichment` | enrichment danych firm | b2b contact enrichment | C | znajdź emaile firm, dane kontaktowe dostawców | supplier contact data, b2b data enrichment | MID | Pro tier |
| `/funkcje/company-registry` | `/features/company-registry` | baza firm online | company registry search | I/C | krs online, sprawdzanie kontrahenta | company search, supplier due diligence | MID | Pro tier |
| `/funkcje/outreach-mailowy` | `/features/email-outreach` | automatyczne rfq | automated rfq software | C | wysyłanie zapytań ofertowych, mass rfq | rfq automation, send rfq suppliers | MID | Core procurement add-on |
| `/funkcje/supplier-portal` | `/features/supplier-portal` | portal dostawcy | supplier portal software | C | panel dla dostawców, e-procurement portal | vendor portal, supplier management platform | HIGH | Core procurement add-on |
| `/funkcje/zbieranie-ofert` | `/features/offer-collection` | zbieranie ofert od dostawców | collect supplier quotes | C | formularz oferty online, e-rfq | online rfq form, quote collection | MID | |
| `/funkcje/porownywarka-ofert` | `/features/offer-comparison` | porównanie ofert dostawców | supplier offer comparison | C | porównywarka cen dostawców, ocena ofert rfq | rfq comparison tool, bid comparison | HIGH | High-intent |
| `/funkcje/auto-follow-up` | `/features/auto-follow-up` | follow up do dostawców | automated supplier follow up | C | przypomnienia do dostawców, sekwencje mailowe | rfq reminder automation, sequence emails | MID | |
| `/funkcje/wielojezyczny-outreach` | `/features/multilingual-outreach` | wielojęzyczny outreach b2b | multilingual b2b outreach | C | tłumaczenie rfq, email dostawcy po niemiecku | translate rfq emails, multilingual supplier emails | MID | Differentiator |
| `/funkcje/raporty-pdf-pptx` | `/features/pdf-reports` | raport z sourcingu | sourcing report pdf | I | raport porównania ofert, prezentacja procurement | procurement report template, sourcing report template | MID | |

---

## Industry pages (8 podstron)

| URL PL | URL EN | Primary KW (PL) | Primary KW (EN) | Intent | Secondary KW (PL) | Secondary KW (EN) | Volume | Notes |
|---|---|---|---|---|---|---|---|---|
| `/dla-kogo` | `/industries` | procurea branże | procurea industries | N | dla kogo procurea | who uses procurea | LOW | Hub |
| `/dla-kogo/produkcja` | `/industries/manufacturing` | sourcing dla produkcji | supplier sourcing for manufacturing | C | dostawcy dla przemysłu, zakupy dla fabryki | manufacturer sourcing, supply chain software | HIGH | Largest industry |
| `/dla-kogo/eventy` | `/industries/events` | sourcing dla agencji eventowych | procurement for event agencies | C | dostawcy na eventy, sourcing cateringu | event vendor sourcing, event procurement | MID | Niche but high intent |
| `/dla-kogo/budownictwo` | `/industries/construction` | sourcing dla budownictwa | construction procurement software | C | dostawcy materiałów budowlanych, podwykonawcy platforma | construction supplier platform, subcontractor sourcing | HIGH | |
| `/dla-kogo/gastronomia` | `/industries/horeca` | zaopatrzenie restauracji | restaurant procurement | C | sourcing dla gastronomii, hurtownia dla horeca | horeca sourcing, food service procurement | MID | |
| `/dla-kogo/retail-ecommerce` | `/industries/retail-ecommerce` | sourcing marka własna | private label sourcing | C | dostawcy dla e-commerce, producent marki własnej | d2c manufacturer sourcing, private label platform | HIGH | Trending 2026 |
| `/dla-kogo/ochrona-zdrowia` | `/industries/healthcare` | zakupy szpitalne platforma | healthcare procurement platform | C | przetargi medyczne, dostawcy dla szpitali | hospital sourcing software, medical supplier platform | MID | Regulated |
| `/dla-kogo/logistyka` | `/industries/logistics` | sourcing dla logistyki | logistics procurement | C | dostawcy dla magazynu, zakupy 3pl | warehouse procurement, 3pl sourcing | MID | |
| `/dla-kogo/mro-utrzymanie-ruchu` | `/industries/mro` | mro sourcing | mro procurement software | C | części zamienne platforma, utrzymanie ruchu zakupy | industrial mro platform, spare parts sourcing | MID | Niche high-intent |

---

## Integration pages (hub + 6 detail pages)

Integracje ERP/CRM = silny sales lever dla P1 Head of Procurement. Keyword intent = wysoki commercial (user szukający „procurement tool with sap integration" jest blisko zakupu).

| URL PL | URL EN | Primary KW (PL) | Primary KW (EN) | Intent | Secondary KW (EN) | Volume | Notes |
|---|---|---|---|---|---|---|---|
| `/integracje` | `/integrations` | integracje procurea | procurea integrations | C | sap oracle salesforce procurement, erp integration platform | MID | Hub, linkuje wszystkie systemy |
| `/integracje/sap` | `/integrations/sap` | integracja sap procurement | sap procurement integration | C | sap supplier sourcing, s/4hana procurement tool, sap ariba alternative | HIGH | Top keyword, enterprise-buyer intent |
| `/integracje/oracle-netsuite` | `/integrations/oracle-netsuite` | integracja oracle netsuite procurement | netsuite procurement integration | C | netsuite supplier management, oracle netsuite sourcing | MID | Mid-market buyer intent |
| `/integracje/oracle-fusion-cloud` | `/integrations/oracle-fusion-cloud` | integracja oracle fusion procurement | oracle fusion cloud procurement | C | oracle scm cloud sourcing, oracle fusion supplier discovery | MID | Large enterprise |
| `/integracje/dynamics-365-bc` | `/integrations/dynamics-365-bc` | integracja dynamics business central | dynamics 365 business central procurement | C | dynamics bc vendor management, d365 bc sourcing tool | MID | SMB/mid-market |
| `/integracje/dynamics-365-fo` | `/integrations/dynamics-365-fo` | integracja dynamics 365 f&o | dynamics 365 finance operations procurement | C | d365 fo procurement automation, dynamics finance sourcing | MID | Large enterprise |
| `/integracje/salesforce` | `/integrations/salesforce` | integracja salesforce procurement | salesforce procurement integration | C | salesforce supplier management, salesforce crm procurement | MID | CRM-first companies, complements Coupa/Ariba |

**Status messaging w copy** (zgodnie z uczciwym pozycjonowaniem):
- Każda detail page powinna mieć **widoczny badge status**: „Available", „Pilot", „Roadmap Q3/Q4 2026", „Enterprise Custom only"
- Hero copy: „Connect Procurea with your [SYSTEM] — status: [BADGE]"
- CTA: „Talk to us about your [SYSTEM] rollout" → `/kontakt?interest=integration&system=sap`

**Hub page `/integracje` copy angle**:
- H1: „Procurea connects to your procurement stack — SAP, Oracle, Dynamics, Salesforce + 50 more"
- Lead: „Sourcing pipeline wzbogaca każdego znalezionego dostawcę o status w Twoim ERP: already-in / maybe-match / new. No duplicate data entry."
- CTA hero: „Talk to us about your integration"
- Grid 8 systemów z logo + status badge + 1-liner
- Section „Not seeing your system?" → Merge.dev long-tail (50+ systemów)

## Use case pages (6 scenariuszy)

| URL PL | URL EN | Primary KW (PL) | Primary KW (EN) | Intent | Secondary KW (PL) | Secondary KW (EN) | Volume | Notes |
|---|---|---|---|---|---|---|---|---|
| `/zastosowania` | `/use-cases` | zastosowania procurea | procurea use cases | N | przykłady użycia procurea | procurea examples | LOW | Hub |
| `/zastosowania/sourcing-awaryjny-48h` | `/use-cases/emergency-sourcing-48h` | sourcing awaryjny | emergency sourcing | C | szybkie wyszukiwanie dostawców, pilne rfq | rapid supplier sourcing, urgent procurement | MID | Strong BOFU scenario |
| `/zastosowania/dywersyfikacja-dostawcow` | `/use-cases/supplier-diversification` | dywersyfikacja dostawców | supplier diversification | I/C | dual sourcing strategy, kryzys łańcucha dostaw | dual sourcing, supply chain resilience | HIGH | Hot post-COVID/Ukraine |
| `/zastosowania/nearshore-migracja-z-chin` | `/use-cases/china-to-nearshore` | przeniesienie produkcji z chin | china to nearshore migration | C | nearshoring europe, alternatywy dla chin | nearshore manufacturing, europe manufacturer alternative | HIGH | 2026 trend keyword |
| `/zastosowania/tender-publiczny-7-dni` | `/use-cases/public-tender-7-days` | przygotowanie tendera | public tender preparation | C | zamówienia publiczne platforma, zebranie ofert tender | public procurement platform, rfq tender tool | MID | PL focus, EU tender law |
| `/zastosowania/sourcing-na-targi` | `/use-cases/trade-show-sourcing` | sourcing na targi | trade show sourcing | C | dostawcy na targi, przygotowanie na targi | trade show suppliers, event sourcing trade fair | LOW | Niche |
| `/zastosowania/lokalne-sourcing` | `/use-cases/local-sourcing` | lokalne sourcing | local supplier sourcing | C | lokalni dostawcy platforma, sourcing w mieście | find local suppliers, nearby supplier platform | MID | |

---

## Blog seed posts (10 pierwszych artykułów — etap 7)

Zaplanowane pod TOFU (informational intent) + MOFU (comparison intent) keywords. Każdy post ma 1500-3000 słów, internal linki do 2-3 feature/industry pages + 1 lead magnet CTA.

| Slug | Primary KW (PL) | Primary KW (EN) | Intent | Volume | Linki wewnętrzne |
|---|---|---|---|---|---|
| `jak-wybrac-dostawce` | jak wybrać dostawcę | how to choose a supplier | I | HIGH | `/funkcje/ai-sourcing`, magnet: `checklist-wyboru-dostawcy` |
| `rfq-template` | rfq wzór pisma | rfq template | I | HIGH | `/funkcje/outreach-mailowy`, magnet: `rfq-template` |
| `sourcing-chiny-vs-europa` | sourcing chiny vs europa | china vs europe sourcing | I/C | MID | `/zastosowania/nearshore-migracja-z-chin` |
| `dual-sourcing-strategia` | dual sourcing strategia | dual sourcing strategy | I | MID | `/zastosowania/dywersyfikacja-dostawcow` |
| `ai-w-procurement-2026` | ai w procurement | ai in procurement | I | HIGH | `/funkcje/ai-sourcing`, `/dla-kogo/produkcja` |
| `jak-porownac-oferty` | jak porównać oferty dostawców | how to compare supplier offers | I | MID | `/funkcje/porownywarka-ofert` |
| `lokalni-dostawcy-przewodnik` | jak znaleźć lokalnych dostawców | how to find local suppliers | I | MID | `/zastosowania/lokalne-sourcing` |
| `supplier-qualification-checklist` | kwalifikacja dostawcy checklist | supplier qualification checklist | I | MID | magnet: `supplier-qualification-framework` |
| `e-sourcing-vs-manual-koszt` | koszt ręcznego sourcingu kalkulator | manual sourcing cost calculator | I | LOW | `/cennik`, home |
| `tender-publiczny-jak-zebrac-oferty` | tender publiczny jak zebrać oferty | public tender how to collect quotes | I | MID | `/zastosowania/tender-publiczny-7-dni` |

---

## Lead magnets (5 pierwszych)

Lead magnet = content za adres email. Primary KW rankuje, secondary KW pojawia się w bullet points landingu magnetu.

| Slug | Format | Primary KW (PL) | Primary KW (EN) | Intent | Volume | Notes |
|---|---|---|---|---|---|---|
| `checklist-wyboru-dostawcy` | PDF 2 strony | checklista wyboru dostawcy | supplier selection checklist | I | MID | TOFU hook, szeroki fan-out |
| `rfq-template` | DOCX | rfq wzór | rfq template download | I/T | HIGH | Bardzo dobry hook — konkretny file |
| `audyt-sourcing-score` | Self-serve quiz | audyt procesu zakupowego | procurement maturity audit | I | LOW | MOFU — scorujemy reader'a, follow-up email z wynikiem |
| `supplier-qualification-framework` | PDF 4 strony | framework kwalifikacji dostawców | supplier qualification framework | I | MID | Dla P1 Head of Procurement |
| `nearshore-migration-playbook` | PDF 8 stron | nearshoring playbook | nearshoring playbook | I | MID | 2026 trend, high intent |

---

## Case studies (skeleton — etap 6, content po zebraniu)

Przy pisaniu case study primary KW = kombinacja „procurea + branża" albo konkretne keyword z use case:

| Slug propozycja | Primary KW (PL) | Primary KW (EN) | Notes |
|---|---|---|---|
| `fabryka-automotive-8-dostawcow-5-dni` | case study sourcing manufacturing | manufacturing sourcing case study | I1 Manufacturing |
| `agencja-event-barcelona-72h` | case study sourcing event | event sourcing case study | I2 Events |
| `deweloper-podwykonawcy-hvac` | case study sourcing budownictwo | construction sourcing case study | I3 Construction |
| `sieć-restauracji-12-dostawcow` | case study horeca procurement | restaurant chain procurement case | I4 HoReCa |
| `marka-d2c-kosmetyki-nearshore` | case study private label sourcing | private label sourcing case | I5 Retail |

---

## Priorytety copy writing — kolejność (MVP scope)

Decyzja 2026-04-16: MVP = 3-4 tyg, Round 1 = 10 podstron. Pozostałe (blog, lead magnets, Round 2 industries, integration detail pages) → post-MVP.

**Round 1 — MVP (10 podstron, 3-4 tyg)**:
1. `/` home (EN-first, then PL translation)
2. `/cennik` — `/pricing` (4-kolumnowy layout, annual toggle)
3. `/funkcje/ai-sourcing` — `/features/ai-sourcing`
4. `/funkcje/outreach-mailowy` — `/features/email-outreach`
5. `/funkcje/supplier-portal` — `/features/supplier-portal`
6. `/funkcje/porownywarka-ofert` — `/features/offer-comparison`
7. `/dla-kogo/produkcja` — `/industries/manufacturing` (I1)
8. `/dla-kogo/eventy` — `/industries/events` (I2)
9. `/dla-kogo/budownictwo` — `/industries/construction` (I3)
10. `/dla-kogo/retail-ecommerce` — `/industries/retail-ecommerce` (I5)
11. `/integracje` — `/integrations` (hub only, bez detail pages)
12. `/kontakt` — `/contact` (z formularzem + Cal.com follow-up)

**Round 2 — Post-MVP (po 30 dniach GSC danych)**:
13-18. Pozostałe 6 feature pages (enrichment, company registry, offer collection, auto follow-up, multilingual outreach, pdf reports)
19-22. Pozostałe 4 industry pages (HoReCa, Healthcare, Logistics, MRO)
23-28. Integration detail pages (SAP, Oracle NetSuite, Oracle Fusion, Dynamics BC, Dynamics F&O, Salesforce)
29-34. Use case pages (6 scenariuszy)

**Round 3 — Post-MVP stage 2 (blog + lead magnets, etap 7)**:
35+. Pierwsze 3-5 blog posts + 2 lead magnets + case studies skeleton fill

---

## Konkurencja per primary KW (benchmark)

Bez narzędzia SEO nie mamy real danych, ale domain knowledge mówi:
- **„procurement software"** (EN) — dominują Coupa, Jaggaer, GEP. Nie rankujemy w top 10 szybko. Strategia: long-tail („ai procurement software for manufacturers", „supplier sourcing automation").
- **„supplier sourcing"** (EN) — Scoutbee, Tealbook, Prewave. Procurea ma szansę w AI-first differentiation.
- **„ai sourcing"** (PL) — mało konkurencji w PL, szansa na quick wins SEO.
- **„portal dostawcy"** (PL) — niche, dominują integratory ERP (Oracle, SAP). Procurea jako standalone = swój kąt.
- **„rfq template"** (EN) — mega konkurencja (templates sites). Strategia: dobre lead magnet + skip high-volume SERP, iść w middle-of-funnel.

Pełny competitor analysis = osobny dokument (poza scope etapu 1).

---

## Otwarte TODO (przed etapem 3 i po MVP deploy)

1. ~~**Uzyskać dostęp do keyword tool**~~ → **ZAMKNIĘTE**: mamy GSC dla procurea.pl i procurea.io. Po MVP deploy zebrać 30-60 dni danych i zaktualizować wolumeny w tej tabeli.
2. ~~**Decyzja: PL-first czy EN-first?**~~ → **ZAMKNIĘTE**: EN-first (Global-first decyzja, procurea.io flagship).
3. **SERP intent check** — dla każdego HIGH primary KW sprawdzić co Google obecnie pokazuje na pozycjach 1-10 (listicle? comparison? case study? vendor page?). Robimy przed pisaniem copy każdej Round 1 podstrony (etap 3-5 MVP).
4. **Schema / structured data** — który page type dostaje Article (blog), SoftwareApplication (home/features), Service (use cases), FAQPage (feature with FAQ), Product (pricing), **SoftwareApplication + integration property** (integration pages). Decyzja w etapie 8 (SEO finish, post-MVP).
5. **GSC baseline dla integration keywords** — po deploy `/integracje` hub page, sprawdzić po 30 dniach jakie zapytania rzeczywiście generują impressions. Priorytet detail pages (SAP/Oracle/Dynamics/Salesforce) post-MVP będzie oparty na realnych danych, nie na rough proxy.

## Dokumenty powiązane

- **personas.md** — każda persona ma „czego szuka w Google" (3-5 zapytań) — tu je mapujemy na konkretne URL
- **pricing-model.md** — `/cennik` keyword = „procurea cennik"
- **information-architecture.md** — wszystkie URL pochodzą stamtąd
- **roadmap-next-stages.md** — etap 3 startuje copy writing od Round 1 powyżej

## Historia zmian

- **2026-04-16** — Document created. Wolumeny oparte o rough proxy, bez keyword tool.
- **2026-04-16** — Aktualizacja po wywiadzie: GSC jako keyword tool, EN-first priorytet, MVP scope 10 Round 1 podstron + `/integracje` hub.
- **2026-04-16** — Dodano sekcję Integration pages (hub + 6 detail pages) z keywordami per ERP system (SAP, Oracle NetSuite, Oracle Fusion, Dynamics BC/F&O, Salesforce).
