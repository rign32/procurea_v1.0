# Procurea — Model Pricingu

> **Purpose**: zamrozić finalną strukturę pricingu, żeby wszystkie przyszłe podstrony (home, `/cennik`, feature pages, industry pages) spójnie ją odzwierciedlały. Model bazuje na decyzji właściciela produktu (2026-04-16).
>
> **Use**: punkt referencyjny dla etapu 3 (przebudowa Home + Pricing page) i wszystkich feature pages które muszą oznaczyć „w którym tierze ten feature jest dostępny".

---

## Model w skrócie

Procurea sprzedaje dwa **oddzielne moduły** z możliwością kupienia każdego osobno lub razem z rabatem:

- **AI Sourcing** — self-serve research dostawców (plan podstawowy). Dostępny po rejestracji, free tier w kredytach.
- **Procurement Add-on** — pełen workflow (RFQ, portal, oferty, porównania, negocjacje) (plan rozszerzony). **Contact-sales only** — meeting online przed zakupem (zależny od Sourcing, nie działa samodzielnie).
- **Full Workflow Bundle** — Sourcing + Procurement razem z rabatem (Starter save $49, Professional save $99, Enterprise save $149)
- **Enterprise Custom** — $25k-$100k/rok: unlimited, dedicated instance, custom AI, white-label, integracje SAP/Oracle

Trzy tiery w każdym module: **Starter / Professional / Enterprise**, skalują się liczbą kampanii (20 / 60 / 100) i zaawansowaniem feature'ów. Czwarty tier = Enterprise Custom dla korporacji z własną instancją.

## Free entry point (realny model w kodzie backendu)

**Źródło prawdy**: `backend/prisma/schema.prisma` (default credits) + `backend/src/auth/auth.service.ts` (signup logic). Model credits jest już zaimplementowany, **nie wymyślamy go na nowo** — strona go tylko opisuje.

### Default credits przy rejestracji

| Ścieżka rejestracji | User credits | Org credits | Plan |
|---|---|---|---|
| Public email (gmail, yahoo, etc.) | 10 (personal wallet) | — brak org | `research` (trial) |
| Business email, brak org w DB | 0 (przeniesione do org) | 10 (shared pool, trial) | `research` (trial) |
| Business email, org istnieje + paid plan | 0 | **+3 bonus** do istniejącego shared poola | plan org (pay_as_you_go / unlimited) |
| Business email, org istnieje + research (trial) | 0 | bez bonusu | `research` |

### Mechanika

- `User.searchCredits` default = **10** (Prisma schema `User` line 70)
- `Organization.searchCredits` default = **10** (Prisma schema `Organization` line 167)
- Nowy user z email domeny corporate która **już ma paid org** → org dostaje **+3 credits** do shared poola (auth.service.ts line 174). Trigger: `TRIAL_GRANT` lub `MEMBER_BONUS` w `OrgCreditTransaction`.
- Po wykorzystaniu trial credits: flag `trialCreditsUsed=true`, user musi kupić pack (pay_as_you_go) lub subskrybować (unlimited)

### Implikacje dla strony

- **CTA hero "Start free research"** — signup daje 10 credits (1-10 kampanii w zależności od jak definiowana kampania w kredytach)
- **CTA team invite** — „Zaproś kolegów z firmy, każdy dodaje +3 credits do shared poola" (tylko jeśli org jest paid)
- **Kampania = 1 credit** — do potwierdzenia w kodzie `sourcing.service.ts` (czy każda kampania to 1 credit czy więcej, zależy od skali)
- **Nie obiecywać 14-day trial czy 2-kampanie-na-miesiąc** — realny model to **jednorazowe 10 credits + dopłacanie** (pay-as-you-go) lub upgrade do unlimited (subscription)

### Obecny backend stan (wymaga rozbudowy dla nowego pricingu)

Obecny kod obsługuje 3 plany: `research` (trial) / `pay_as_you_go` (credits) / `unlimited` (sub). Nowy pricing wprowadza **9 planów** (Starter/Pro/Enterprise × Sourcing/+Procurement/Full) + Enterprise Custom. Backend wymaga rozbudowy o:

- Migracja `Organization.plan` enum na nowe wartości: `trial`, `starter_sourcing`, `starter_full`, `professional_sourcing`, `professional_full`, `enterprise_sourcing`, `enterprise_full`, `enterprise_custom`
- Miesięczne limity kampanii (20/60/100) — nowy model wymaga countera miesięcznego, nie tylko credit balance
- Sprzedaż add-ona Procurement jako upgrade (nie self-serve, ale trigger w UI → sales contact flow)
- Stripe Products/Prices zdefiniowane dla każdego plan × annual/monthly
- **Credit packs (pack_10/25/50) zostają** — dla Starter users przy przekroczeniu miesięcznego limitu (soft overage)

Ta migracja = osobny backend task, poza scope etapów landing page. Do uwzględnienia w roadmapie produktowej.

---

## Tabela cenowa (wiążąca)

### AI Sourcing (sam research)

| Tier | Cena | Kampanie/mies | Feature |
|---|---|---|---|
| **Starter** | $199/mies | 20 | Shortlista dostawców, klasyfikacja AI, eksport CSV |
| **Professional** | $499/mies | 60 | + enrichment kontaktów, wielojęzyczny research, Company Registry |
| **Enterprise** | $999/mies | 100 | + priority processing, custom filters, API access |

### Procurement Add-on (wymaga Sourcing na tym samym tierze)

| Tier | Cena add-on | Feature |
|---|---|---|
| **Starter +Procurement** | +$249/mies | Outreach mailowy, Supplier Portal, zbieranie ofert |
| **Professional +Procurement** | +$449/mies | + porównywarka ofert, auto follow-up, wielojęzyczny outreach |
| **Enterprise +Procurement** | +$649/mies | + custom branding, dedicated support, SLA |

### Full Workflow Bundle (Sourcing + Procurement razem z rabatem)

| Tier | Cena bundle | Rabat | Kampanie/mies |
|---|---|---|---|
| **Starter Full** | $399/mies | save $49 | 20 — pełen workflow |
| **Professional Full** | $849/mies | save $99 | 60 — pełen workflow |
| **Enterprise Full** | $1499/mies | save $149 | 100 — pełen workflow |

### Enterprise Custom (top tier — contact sales)

| Plan | Cena | Co zawiera |
|---|---|---|
| **Enterprise Custom** | $25k – $100k / rok | Unlimited kampanie, dedicated instance, custom AI models, white-label, integracje SAP/Oracle, dedykowany zespół onboardingowy, custom SLA |

**Pozycjonowanie**: dla korporacji Fortune 500 / dużych enterprise z procurement teams 10+ osób. Sprzedaż 100% contact-based, długi cycle (3-6 mies), custom kontrakty. Landing mówi tylko „Contact sales" — cena nie pokazywana publicznie (zakres $25k-$100k/rok tylko jako signal w propozycji).

### Annual billing (wszystkie self-serve tiery)

Toggle „Monthly / Annually (save 20%)" na `/cennik`. Przykłady per plan:

| Plan | Monthly | Annual (save 20%) |
|---|---|---|
| Starter Sourcing | $199/mies | $1912/rok (save $476) |
| Starter Full | $399/mies | $3830/rok (save $958) |
| Professional Full | $849/mies | $8150/rok (save $2038) |
| Enterprise Full | $1499/mies | $14392/rok (save $3596) |

Enterprise Custom → rozliczenie roczne domyślnie (contract), bez monthly option.

### Polityka overage i contract

- **Overage** (Starter/Pro/Enterprise self-serve): soft overage — użytkownik płaci $X za każdą dodatkową kampanię poza miesięcznym limitem. Banner w UI: „Upgrade do Pro, zaoszczędzisz $Y" gdy usage >70% limitu.
- **Contract minimum**: wszystkie self-serve plany (Starter/Pro/Enterprise) = month-to-month, cancel anytime. Enterprise Custom = roczne kontrakty.
- **Waluta**: **USD globalnie** (procurea.io jako primary market). Geo-pricing PLN/EUR odłożone — USD = prostota dla globalnego SaaS targetu.

---

## Feature matrix (który tier ma co)

Legend: ✅ included · ➕ add-on · ❌ not available

| Feature | Starter S | Starter +P | Starter Full | Pro S | Pro +P | Pro Full | Ent S | Ent +P | Ent Full |
|---|---|---|---|---|---|---|---|---|---|
| Kampanie sourcingowe/mies | 20 | — | 20 | 60 | — | 60 | 100 | — | 100 |
| Shortlista dostawców AI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Klasyfikacja / scoring AI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Eksport CSV | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enrichment kontaktów | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wielojęzyczny research | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Company Registry | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Priority processing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom filters | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| API access | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Outreach mailowy (RFQ) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Supplier Portal | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Zbieranie ofert | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Porównywarka ofert | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Auto follow-up (sequences) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Wielojęzyczny outreach | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Custom branding portalu | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dedicated support | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| SLA | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

Legenda: S = Sourcing only · +P = z Procurement add-on · Full = Bundle

---

## Mapping na kod: jak się prezentuje w aplikacji

Obecnie w repo (`backend/src`) wszystkie feature'y Procurement są **zaimplementowane** (email outbound, sequences, supplier portal, magic links, quantity breaks, translation, counter-offers, reports PDF/PPTX — potwierdzone w analizie explore).

Czego jeszcze brak w kodzie (ROADMAP, nie obiecywać na stronie jako „już dostępne"):

- **API access** (Enterprise Sourcing) — brak publicznego REST API dla kampanii/dostawców. Wymaga zaprojektowania kontraktu + rate limiting.
- **Custom filters** (Enterprise Sourcing) — user-definable filtry w campaign results. Do zaprojektowania.
- **Priority processing** (Enterprise Sourcing) — dedykowana kolejka w pipeline. Obecnie shared queue.
- **Custom branding portalu** (Enterprise +Procurement) — logo/kolory per organizacja w supplier portal. Baza ma pole `Organization.logoUrl` — potwierdzić czy użyte w portal.
- **Dedicated support + SLA** (Enterprise +Procurement) — operacyjne, nie techniczne. Procesowo do zdefiniowania.

Te features można zapowiedzieć jako Enterprise-tier bo sprzedaż Enterprise jest contact-based — czas dowiezienia jest elastyczny. Ale w feature pages nie pokazywać screenshotów jak coś nie istnieje.

---

## Implikacje dla strony

### Pricing page (`/cennik`, `/pricing`) — struktura

**Monthly / Annually toggle** (rabat -20% annually) + **Sourcing / +Procurement / Full bundle toggle**.

**4-kolumnowy layout** self-serve tierów:
- Starter (Sourcing / +Procurement / Full, zależy od toggle)
- Professional (j.w.)
- Enterprise (j.w.)
- **Enterprise Custom** — osobna kolumna zawsze widoczna, badge „Contact sales"

Każdy card tieru pokazuje:
- Cenę (monthly lub annual z save $X, w zależności od toggle)
- Liczba kampanii/mies
- Lista kluczowych features (różna per toggle)
- CTA:
  - Starter/Pro Sourcing = self-serve signup („Start free research — 10 credits")
  - Wszystkie +Procurement i Full = **„Talk to sales"** (contact form, Procurement wymaga meetingu)
  - Enterprise Custom = „Talk to sales" (zawsze)
- Badge „Most popular" na Professional Full
- Badge „Save $X" na Full bundle tierach (vs cena osobno Sourcing + Procurement)

Pod kartami — pełna feature comparison table (jak wyżej w tym dokumencie).

### Hero dual-CTA

- Primary: **„Rozpocznij darmowy research"** → self-serve signup (app.procurea.pl/register) — docelowo dla P3 i P2
- Secondary: **„Zobacz Full workflow"** → `/cennik?tier=full` lub scroll do sekcji Dual-Tier — docelowo dla P1 i P2 enterprise

### Add-on messaging

Kluczowa narracja: **Sourcing = masz listę** / **+Procurement = masz listę i coś z nią robisz** / **Full = kompletny workflow z rabatem**.

Nie sprzedawać Procurement jako „więcej feature'ów", tylko jako „next step w procesie". Jeśli user kupił tylko Sourcing, na końcu kampanii pokazać CTA „Wyślij RFQ do tych dostawców — dodaj Procurement za $249/mies".

### Feature pages — badge tieru

Każda feature page w `/funkcje/` na górze pokazuje badge:

- „Dostępne od Starter Sourcing" — dla AI Sourcing, klasyfikacji, eksportu CSV
- „Dostępne od Professional Sourcing" — dla enrichment, multilingual research, Company Registry
- „Dostępne w Enterprise Sourcing" — dla API, custom filters, priority processing
- „Dostępne z Procurement add-on" — dla outreach, portal, zbierania ofert
- „Dostępne od Professional +Procurement" — dla comparison, follow-up, multilingual outreach
- „Dostępne w Enterprise +Procurement" — dla custom branding, SLA

---

## Zamknięte decyzje pricingowe (2026-04-16, 3-turowy wywiad)

Wszystkie wcześniej otwarte decyzje pricingowe zostały zamknięte w wywiadzie z właścicielem produktu:

1. **Free trial / entry point** → **N/A (credit model z kodu)**. Nie wymyślamy nowego free trial. Strona opisuje realny model: 10 credits default dla User/Org + 3 bonus per nowy user w paid org. Po wyczerpaniu → pack albo upgrade.
2. **Annual billing** → **TAK, -20% rabat**. Toggle „Monthly / Annually" na `/cennik`. Dotyczy wszystkich self-serve planów.
3. **Waluta** → **USD globalnie**. procurea.io primary market (Global-first). Geo-pricing PLN/EUR odłożone — prostota ponad niuans lokalny.
4. **Enterprise minimum contract** → **month-to-month**. Wszystkie self-serve plany (Starter/Pro/Enterprise) = bez minimum. Enterprise Custom = roczny (contract).
5. **Overage policy** → **soft overage + auto-suggestion upgrade banner**. Po przekroczeniu limitu user płaci $X za dodatkową kampanię, banner sugeruje upgrade do wyższego tieru.

## Integracje ERP/CRM — pozycjonowanie w pricingu

Procurea integruje się z systemami enterprise (szczegóły: `landing/docs/integrations-strategy.md` oraz roadmap w dokumencie strategicznym ERP/CRM). Mapping integracji na pricing tiery:

| Integration | Status produktowy | Dostępność w tierze |
|---|---|---|
| **MS Dynamics 365 Business Central** | Faza 1 (pilot) | Professional +Procurement / Enterprise |
| **Salesforce** | Faza 2 | Professional +Procurement / Enterprise |
| **Oracle NetSuite** | Faza 2 | Enterprise |
| **MS Dynamics 365 F&O** | Faza 2 | Enterprise |
| **Oracle Fusion Cloud** | Faza 3 | Enterprise Full / Enterprise Custom |
| **SAP S/4HANA Cloud** | Faza 3 | Enterprise Full / Enterprise Custom |
| **Merge.dev (50+ systemów long-tail)** | Faza 3 | Professional +Procurement / Enterprise |
| **SAP ECC (on-prem legacy)** | Roadmap, bez kommitu | Enterprise Custom (per-klient) |

**Mapping do landing page**:
- **Starter Sourcing**: brak integracji ERP/CRM (CSV export only)
- **Starter +Procurement / Starter Full**: CSV + manual lookup
- **Professional +Procurement / Professional Full**: Dynamics BC, Salesforce, Merge.dev long-tail
- **Enterprise (każdy variant)**: wszystkie Tier-1 + Tier-2, custom via Merge
- **Enterprise Custom**: wszystko + SAP ECC + custom adaptery per-klient

**Status messaging na stronie** (kluczowe: uczciwość):
- **„Available"** = w produkcji (klienci piloci na Dynamics BC = Faza 1) — na razie **nic nie jest Available**, to Faza 0 dedup engine
- **„Pilot"** = działający adapter u 1-3 klientów, w beta dla nowych
- **„Roadmap Q3 2026"** / **„Q4 2026"** / **„2027"** = zaplanowane z datami
- Nie pokazywać integracji jako „available" dopóki nie ma działającego adaptera w produkcji

---

## Dokumenty powiązane

- **personas.md** — kto kupuje który tier (mapping P1→Enterprise Full, P2→Professional Full, P3→Starter/Full)
- **information-architecture.md** — jak pricing linkuje z feature pages i industry pages
- **roadmap-next-stages.md** — implementacja pricing page w etapie 3

## Historia zmian

- **2026-04-16** — Document created. Pricing model zdefiniowany przez użytkownika (AskUserQuestion, plan mode session).
- **2026-04-16** — Rewrite sekcji „Free entry point" na podstawie kodu backendu (User.searchCredits=10, Org.searchCredits=10, +3 bonus per paid-org member) zamiast wymyślonego 2-kampanie-na-miesiąc.
- **2026-04-16** — Dodano Enterprise Custom tier ($25k-$100k/rok, unlimited, dedicated instance).
- **2026-04-16** — Zamknięto 5 otwartych decyzji pricingowych (annual -20%, USD globalnie, month-to-month, soft overage, credit model z kodu).
- **2026-04-16** — Dodano sekcję integracji ERP/CRM mapowaną na tiery (Dynamics BC, Salesforce, Oracle, SAP, Merge.dev).
