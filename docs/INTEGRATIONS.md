# Procurea Integrations Guide

How to connect Procurea to your ERP / accounting system, and how to build
your own integration against the Procurea API.

## TL;DR

- **Out-of-the-box ERP connector**: Merge.dev gives you NetSuite, QuickBooks
  Online, Xero, Sage Intacct without writing code. Link your ERP at
  `app.merge.dev`, paste the Linked Account token into Settings →
  Integrations, and Procurea will push Purchase Orders as they're created.
- **Supplier de-duplication**: on every sync Procurea matches its suppliers
  against your ERP vendors (tax number → domain → fuzzy name), surfaces
  suggested pairs in Settings → Integrations, and refuses to sync a PO
  until the match is confirmed.
- **Custom integrations**: REST API documented at `/api/docs` (Swagger UI).
  Auth via Bearer JWT (buyer flow) or `X-API-Key` header (programmatic).
- **Webhooks** (Stripe / Resend / ERP inbound): see the Webhooks section.

---

## 1. Connect your ERP via Merge.dev (no-code)

### Supported platforms

| Platform | Category | PO write | Supplier read |
|----------|----------|----------|---------------|
| NetSuite | accounting | ✅ | ✅ |
| QuickBooks Online | accounting | ✅ | ✅ |
| Xero | accounting | ✅ | ✅ |
| Sage Intacct | accounting | ✅ | ✅ |
| SAP S/4HANA | *not in Merge — roadmap* | — | — |

### Step-by-step

1. Sign up at [app.merge.dev](https://app.merge.dev) and create a new
   Linked Account.
2. Authorize your ERP through Merge's hosted UI.
3. Copy the Linked Account **account token** and **account ID**.
4. In Procurea: Settings → Integrations → Connect. Fill:
   - Platform slug (`netsuite` / `quickbooks-online` / `xero` / `sage-intacct`)
   - Account token + account ID from step 3
5. Procurea runs an initial sync (pulls suppliers/vendors into the
   `ExternalSupplier` cache, runs matching).
6. Settings → Integrations → **Dopasowania dostawców do ERP**: confirm or
   reject each suggested match. Confirmed matches let `POST /purchase-orders/:id/sync-to-erp`
   push to the correct vendor in your ERP.

### What happens when sync runs

- Pages through Merge `GET /accounting/v1/contacts?is_supplier=true`.
- Upserts each vendor into `ExternalSupplier` (cached for 24h).
- Runs `supplier-matching.service.ts` over (Procurea suppliers ∩ external
  vendors) using tax-number index, then email-domain index, then fuzzy
  name (Jaro-Winkler, 0.82 floor, 0.95 strong).
- Persists `SupplierMatch` rows with status=`suggested` (or `confirmed`
  if confidence ≥ 0.95 and tax/domain match type).

---

## 2. Accept offer → PO → ERP: the full loop

```
Offer.status=ACCEPTED
    │
    ├── Manual flow: buyer drafts contract → UNDER_REVIEW → SIGNED
    │                                                         │
    └── Express flow: POST /contracts/express-sign-and-po     ▼
                                                          Contract.status=SIGNED
                                                                   │
                                                                   ▼
                                                        (auto) DRAFT PurchaseOrder
                                                                   │
                                                                   ▼
                                                POST /purchase-orders/:id/sync-to-erp
                                                                   │
                                                                   ▼
                                                Merge.dev POST /accounting/v1/purchase-orders
                                                                   │
                                                                   ▼
                                                    PurchaseOrder.externalId set
                                                    PurchaseOrder.status='SUBMITTED'
```

**Orchestration rules:**
- Transitioning a contract to `SIGNED` auto-creates a DRAFT PO unless one
  already exists for that contract (idempotent).
- `express-sign-and-po` bypasses the review flow — emits a minimal
  `SIGNED` contract + DRAFT PO in a single call; reuses existing artefacts
  on retry.
- `sync-to-erp` is guarded by the SupplierMatch status — rejects if no
  confirmed match exists, so you never create a wrong-vendor PO.

---

## 3. REST API — custom integrations

### Base URLs

- Production: `https://app.procurea.pl/api`
- Staging: `https://procurea-app-staging.web.app/api`

### Auth options

**A) Bearer JWT** — for buyer-facing flows.
```
POST /api/auth/login        → { accessToken, user }
GET  /api/auth/me           → current user
Authorization: Bearer <token>
```
Cookies (`procurea_token`) are set automatically by `/api/auth/login` for
browser clients; the same token can be sent as Bearer.

**B) API Key** — for programmatic access from scripts / other services.
1. Settings → API Keys → Create
2. Copy the one-time-displayed key (`pk_live_...`)
3. Add to requests: `X-API-Key: pk_live_...`

API keys scope to the user who created them and honor the same tenant
filters. Revoke any time from the same UI.

### Swagger / OpenAPI

Interactive API reference: **[https://app.procurea.pl/api/docs](https://app.procurea.pl/api/docs)**

Every endpoint below is fully documented there with request/response
schemas, auth requirements, and examples.

### Core endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /rfqs` | Create an RFQ |
| `POST /rfqs/:id/send` | Send RFQ to suppliers (generates portal tokens + emails) |
| `GET /rfqs/:id/offers` | List offers received (with contract + PO status) |
| `POST /rfqs/offers/:offerId/accept` | Accept an offer (auto-rejects others, closes RFQ) |
| `POST /contracts/express-sign-and-po` | One-call: signed contract + DRAFT PO |
| `POST /contracts` | Create DRAFT contract manually |
| `PATCH /contracts/:id/status` | Transition (SIGNED triggers auto-PO) |
| `POST /purchase-orders/generate` | Generate DRAFT PO from signed contract |
| `POST /purchase-orders/:id/sync-to-erp` | Push PO to connected ERP |
| `GET /integrations/connections` | List ERP connections + health |
| `GET /integrations/matches/by-supplier/:id` | Check if a supplier is in ERP |
| `POST /integrations/matches/confirm` | Confirm or reject a supplier match |
| `GET /reports/campaign/:id/insights` | Campaign metrics (funnel + costs + quality) |
| `GET /reports/campaign/:id/pdf` | Download campaign report PDF |

### Idempotency

Long-running write endpoints (contracts/express-sign-and-po,
purchase-orders/generate, auto-PO on contract sign) are idempotent — if
the downstream artefact already exists for the given offer/contract,
they return the existing row instead of creating a duplicate.

---

## 4. Webhooks

### Inbound (Procurea receives)

| Source | Endpoint | Purpose |
|--------|----------|---------|
| Stripe | `POST /api/billing/webhook` | Subscription + credit events |
| Resend | `POST /api/webhooks/resend/inbound` | Supplier email replies |

Both endpoints use raw body parsing + signature verification — see
`backend/src/main.functions.ts:43-46` for the parser registration.

### Outbound (Procurea sends)

Roadmap — currently Procurea does not push outbound webhooks. If you
need a notification when a PO lands in your ERP, poll
`GET /purchase-orders?status=SUBMITTED` or listen to Merge.dev's own
webhooks.

---

## 5. Common recipes

### Check if a supplier is already in the buyer's ERP before sending RFQ

```bash
curl -H "X-API-Key: $PROCUREA_KEY" \
  https://app.procurea.pl/api/integrations/matches/by-supplier/$SUPPLIER_ID
```
Returns an array of `SupplierMatch`. A confirmed match = safe to sync
PO later. A suggested match = user should review first. Empty = new
vendor (will be created on first PO push).

### Auto-create PO from accepted offer (headless)

```bash
curl -X POST -H "X-API-Key: $PROCUREA_KEY" \
  -H "Content-Type: application/json" \
  -d '{"offerId":"off_123"}' \
  https://app.procurea.pl/api/contracts/express-sign-and-po
# → { contract: {...}, po: { id, poNumber, status: 'DRAFT' } }

curl -X POST -H "X-API-Key: $PROCUREA_KEY" \
  https://app.procurea.pl/api/purchase-orders/$PO_ID/sync-to-erp
# → { externalId: 'netsuite_vendor_id', syncedAt: '...' }
```

### Pull campaign metrics into your BI tool

```bash
curl -H "X-API-Key: $PROCUREA_KEY" \
  https://app.procurea.pl/api/reports/campaign/$CAMPAIGN_ID/insights
```
Returns JSON with funnel counts, cost breakdown per service, quality
distribution, top countries/specializations, offer outcomes. Ready to
dump into Looker / Metabase / Snowflake.

---

## 6. Rate limits

- Portal endpoints (supplier-facing, no auth): throttled per IP + per
  offer token (5-15 requests/min depending on action).
- Authenticated buyer API (Bearer JWT or X-API-Key): no hard rate limit,
  but be reasonable — campaigns hitting `/sourcing/start` consume a
  shared per-customer Serper.dev budget.
- Gemini-backed endpoints (AI narrative, contract draft, insights
  narrative) have a 10-minute staleTime + on-disk cache, so identical
  prompts are nearly free to re-request.

---

## 7. Versioning & support

- API version: 1.0 — breaking changes will bump the major + stay
  available at `/api/v1/...` for 6 months.
- Feedback: r.ignaczak1@gmail.com or GitHub issues at
  [rign32/procurea_v1.0](https://github.com/rign32/procurea_v1.0).
