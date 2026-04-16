# Procurea — Model Pricingu (credit-based)

> **Purpose**: single source of truth dla `/cennik` + `/pricing` + wszystkich CTA tier mappingów.
> Model zweryfikowany z właścicielem produktu 2026-04-16 (rewizja po feedback'u pierwszej iteracji).

---

## Model w skrócie

Procurea sprzedaje **3 osobne produkty credit-based** (self-serve) + **1 tier enterprise** (contact sales):

| Produkt | Cel | Dostęp |
|---|---|---|
| **AI Sourcing** | Znajdowanie zakwalifikowanych dostawców przez AI pipeline (50–250 firm per kampania, 26 języków, Excel export) | Self-serve credit packs — pay as you go |
| **AI Procurement** | Pełen workflow po sourcingu: contact enrichment, email outreach w języku lokalnym, auto follow-up, Supplier Portal (magic link), strukturalne zbieranie ofert, comparison, AI Insights reports | Contact-sales (wymaga onboarding call) — potem credit packs |
| **Bundle** | Sourcing + Procurement razem, ta sama liczba credits w obu modułach = pełna kampania end-to-end. ~15% oszczędność vs zakup osobno. | Contact-sales + credit packs |
| **Enterprise Custom** | Unlimited, dedicated instance, personalizowany onboarding, custom per-client ERP integration (SAP S/4HANA, Oracle Fusion, Dynamics F&O — native lub on-premise), dedicated support z SLA | Contact-sales only, custom contract, $25k–$100k / rok |

**Ważne**: **nie ma** planów Starter / Professional / Enterprise w sensie subskrypcyjnym (usunięte 2026-04-16 rewizja). User nie wybiera tier'u przez volumen kampanii — wybiera **produkt** (który moduł chce) i **rozmiar pack'a** (10 / 25 / 50 credits).

## Proposed pricing (do potwierdzenia)

Podstawy:
- Koszt credita Sourcing dla nas: ~2–5 PLN. Current Stripe pack_10 = $89 (marża ~7–18x).
- Koszt credita Procurement dla nas: ~15–20 PLN (5× wyższy — data enrichment third-party, Resend email infra, hosting Supplier Portal). Więc retail musi też być ~5× wyższy niż Sourcing żeby zachować marżę.
- Bundle: ~15% oszczędność vs zakup osobno (pre-commit capacity w obu modułach).

### AI Sourcing (obecne Stripe packs, zostają bez zmian)

| Pack | Credits | Price | Per credit |
|---|---|---|---|
| pack_10_sourcing | 10 | $89 | $8.90 |
| pack_25_sourcing | 25 | $199 | $7.96 |
| pack_50_sourcing | 50 | $299 | $5.98 |

### AI Procurement (nowe packs — wymaga Stripe setup)

| Pack | Credits | Price | Per credit |
|---|---|---|---|
| pack_10_procurement | 10 | $349 | $34.90 |
| pack_25_procurement | 25 | $799 | $31.96 |
| pack_50_procurement | 50 | $1,299 | $25.98 |

### Bundle (Sourcing + Procurement same volume, 15% save vs standalone)

| Pack | Credits (each module) | Bundle price | vs standalone | Per full campaign |
|---|---|---|---|---|
| pack_10_bundle | 10 + 10 | $399 | save $39 ($438 alone) | $39.90 |
| pack_25_bundle | 25 + 25 | $899 | save $99 ($998 alone) | $35.96 |
| pack_50_bundle | 50 + 50 | $1,399 | save $199 ($1,598 alone) | $27.98 |

### Enterprise Custom

$25k – $100k / rok, unlimited, custom integration, dedicated support. Landing pokazuje tylko „From $25k / year", konkretne ceny w contract call.

## Free entry point (realny model w kodzie backendu — zostaje bez zmian)

**Źródło prawdy**: `backend/prisma/schema.prisma` + `backend/src/auth/auth.service.ts`. Model credits bazowych jest już zaimplementowany.

### Default credits przy rejestracji

| Ścieżka | User credits | Org credits | Plan enum |
|---|---|---|---|
| Public email (gmail etc.) | 10 | — brak org | `research` (trial) |
| Business email, brak org | 0 (do org) | 10 shared pool | `research` |
| Business email, org istnieje + paid | 0 | **+3 bonus** | org plan (`pay_as_you_go` / `unlimited`) |
| Business email, org istnieje + trial | 0 | bez bonusu | `research` |

Po wykorzystaniu trial → `trialCreditsUsed=true`, user kupuje pack.

### Mechanika (cytaty z kodu)

- `User.searchCredits` default = **10** (schema.prisma linia 70)
- `Organization.searchCredits` default = **10** (schema.prisma linia 167)
- Plan default = `"research"` (schema.prisma linie 67, 171)
- Nowy user w paid org → +3 credits do shared pool (auth.service.ts linia 174, `MEMBER_BONUS`)

**Uwaga**: obecny `User.searchCredits` nie rozróżnia Sourcing vs Procurement — jest jeden unified licznik. Dla nowego modelu credits potrzebna rozbudowa schema na `searchCreditsSourcing`, `searchCreditsProcurement`, `searchCreditsBundle` (lub osobny `CreditBalance` model per type). **Backend task — osobny od landing**.

## Implikacje dla strony

### Pricing page (`/cennik` / `/pricing`)

4-kolumnowy layout: `AI Sourcing | AI Procurement | Bundle | Enterprise Custom`. Każda karta:
- Tagline + opis
- Pack table (10 / 25 / 50 credits + price + per-credit)
- Feature list
- CTA: self-serve (Sourcing → signup w app) lub contact-sales (Procurement, Bundle, Enterprise → `/kontakt?interest=X`)

### Hero + DualTier (home)

Hero: „AI-native procurement platform — from sourcing to contract". Dual CTA:
1. **Start free** → app signup (10 free credits Sourcing)
2. **See pricing** → `/cennik`

DualTierSection (kompaktowa, ~30% wysokości wcześniejszej wersji): 2 karty — AI Sourcing self-serve + Bundle (contact sales).

### Feature pages — tier badges

Każda feature page pokazuje konkretny badge pod hero:
- `fAiSourcing`, `fCompanyRegistry` → „AI Sourcing · from $89 / 10 credits · 10 free on signup"
- `fEmailOutreach`, `fEnrichment`, `fAutoFollowUp`, `fMultilingualOutreach` → „AI Procurement · Outreach · contact sales"
- `fSupplierPortal`, `fOfferCollection`, `fOfferComparison` → „AI Procurement · Offers · contact sales"
- `fAiInsights` → „AI Procurement · Insights · contact sales"

## Obecny backend stan (wymaga rozbudowy)

Kod obsługuje 3 plans: `research` (trial) / `pay_as_you_go` (credits) / `unlimited` (sub). Credit packs istnieją tylko dla Sourcing (pack_10/25/50 w backend/src/billing/billing.service.ts).

Do implementacji:
- **Prisma schema**: `CreditBalance` model z typami `sourcing` / `procurement` / `bundle` (albo 3 kolumny w User/Organization)
- **Stripe Products** — 6 nowych SKU: `pack_{10,25,50}_procurement`, `pack_{10,25,50}_bundle`
- **Billing.service.ts** rozbudowa: `createCheckoutFor(userId, productType, packSize)`, ogólny checkout flow
- **Enterprise contact-sales flow**: `/kontakt?interest=X` → `POST /leads` → sales team contacts. Procurement NIE ma self-serve checkout (sales onboarding wymagany przed pierwszym zakupem).

**Scope**: to osobny backend projekt, poza scope landing. Landing prezentuje proponowane ceny + CTA.

## Historia zmian

- **2026-04-16 (rewizja 2)** — **kompletny rewrite po user review**. Odejście od 9-tier struktury (Starter/Pro/Enterprise × Sourcing/+Procurement/Full) na rzecz 3 credit-based produktów + Enterprise Custom. Usunięcie Monthly/Annually toggle (nie aplikowalne do pay-as-you-go). Plan nazwy = AI Sourcing / AI Procurement / Bundle / Enterprise Custom. Feature grouping naprawiony (Contact Enrichment przeniesiony z AI Sourcing do Procurement-Outreach; 26-lang research zostaje przy AI Sourcing; PDF Reports rebrand na AI Insights).
- **2026-04-16 (rewizja 1)** — dodany Enterprise Custom tier. Zamknięto 5 decyzji pricingowych (annual, waluta, contract, overage, credit model z kodu).
- **2026-04-16** — Document created (original 9-tier structure, since retired).
