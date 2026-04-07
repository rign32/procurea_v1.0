# RFQ Workflow Audit Report

**Data:** 2026-04-07
**Zakres:** Pełny flow RFQ/Supplier od tworzenia zapytania do porównania ofert
**Pliki:** `backend/src/requests/`, `backend/src/portal/`, `backend/src/email/`, `backend/src/sequences/`

---

## [BUG] — Krytyczne błędy

### B1. Brak ownership check na PATCH `/requests/:id`
- **Plik:** `requests/requests.controller.ts:45-48`
- **Opis:** Dowolny zalogowany użytkownik może zmienić status dowolnego RFQ. Brak przekazania `userId` do service, brak weryfikacji `ownerId`.

### B2. Brak ownership check na accept/reject/shortlist oferty
- **Plik:** `requests/requests.controller.ts:83-96`
- **Opis:** Endpoints accept, reject, shortlist nie weryfikują czy user jest właścicielem RFQ powiązanego z ofertą.

### B3. Brak ownership check na send, compare, resend-email, portal-link
- **Plik:** `requests/requests.controller.ts:50-57, 78-81, 98-113`
- **Opis:** Brak `userId` w wywołaniach `sendRfqToCampaign`, `sendRfqToSuppliers`, `compareOffers`, `resendOfferEmail`, `getPortalLink`.

### B4. Status 'SENT' nie istnieje w schemacie
- **Plik:** `requests/requests.service.ts:239`
- **Opis:** `sendRfqToSuppliers` ustawia `status: 'SENT'`, ale schemat definiuje: DRAFT, ACTIVE, CLOSED, ARCHIVED. Powinno być `'ACTIVE'`.

### B5. Status 'COMPLETED' nie istnieje w schemacie
- **Plik:** `requests/requests.service.ts:132`
- **Opis:** `acceptOffer` ustawia `status: 'COMPLETED'`. Powinno być `'CLOSED'`.

### B6. Brak walidacji przejść statusów
- **Plik:** `requests/requests.service.ts:107-135, 294-318`
- **Opis:** Można zaakceptować REJECTED ofertę, odrzucić ACCEPTED, shortlistować PENDING (przed submitem). Brak mapy dozwolonych przejść.

### B7. Token expiry nie jest walidowany w portalu
- **Plik:** `portal/portal.service.ts:42-68`
- **Opis:** `getOfferByToken()` i `submitOffer()` nie sprawdzają `tokenExpiresAt`. Wygasłe tokeny nadal działają.

### B8. Token expiry nie jest ustawiany przy tworzeniu ofert
- **Plik:** `requests/requests.service.ts:181-188`
- **Opis:** `sendRfqToSuppliers` tworzy Offer bez `tokenExpiresAt`. Token nigdy nie wygasa.

### B9. DTO mismatch w createOffer
- **Plik:** `requests/requests.service.ts:496-542` vs `requests/requests.controller.ts:65-76`
- **Opis:** Controller wysyła `rfqRequestId` → service czyta `data.requestId`. Controller: `price` → service: `data.pricePerUnit`. Controller: `leadTime` → service: `data.leadTimeWeeks`. Controller: `comments` → service: `data.comment`. Powoduje tworzenie ofert z ceną 0 i brakującymi danymi.

### B10. Brak ochrony przed duplikatami ofert
- **Plik:** `requests/requests.service.ts:181`
- **Opis:** Ponowne wywołanie `sendRfqToSuppliers` z tym samym supplier tworzy duplikat rekordu Offer.

---

## [MISSING] — Brakujące elementy

### M1. `offerDeadline` nie jest ustawiany przy tworzeniu RFQ
- **Plik:** `requests/requests.service.ts:76-96`
- **Opis:** Pole `offerDeadline` istnieje w schemacie Prisma, ale `create()` nie przekazuje go.

### M2. `attachments` nie jest przekazywany do Prisma
- **Plik:** `requests/requests.service.ts:76-96`
- **Opis:** DTO przyjmuje `attachments`, ale `create()` nie wstawia ich do bazy.

### M3. Brak reply-to header w emailach organizacji
- **Plik:** `email/email.service.ts`
- **Opis:** Wszystkie emaile wysyłane z `noreply@procurea.pl`. Brak możliwości ustawienia reply-to z emaila organizacji.

### M4. Brak testów E2E
- **Plik:** `test/app.e2e-spec.ts`
- **Opis:** Tylko placeholder test (GET /). Brak testów dla RFQ flow, auth flow, portal flow.

---

## [NEEDS_WORK] — Do poprawy

### N1. `update()` zmienia tylko status
- **Plik:** `requests/requests.service.ts:98-105`
- **Opis:** Nie można edytować pól RFQ (productName, description, targetPrice, etc.) w stanie DRAFT.

### N2. Portal link fallback na localhost
- **Plik:** `requests/requests.controller.ts:101`
- **Opis:** `process.env.FRONTEND_URL || 'http://localhost:5173'` — fallback powinien być `'https://app.procurea.pl'`.

### N3. `findAll()` ukrywa DRAFT RFQs
- **Plik:** `requests/requests.service.ts:24`
- **Opis:** Filtr `status: { not: 'DRAFT' }` ukrywa drafty nawet przed ich właścicielem.

---

## [OK] — Działa poprawnie

| Element | Lokalizacja |
|---------|-------------|
| RFQ creation z ownerId | `requests/requests.service.ts:76-96` |
| Supplier email detection (contacts → contactEmails) | `requests/requests.service.ts:246-260` |
| Email translation per supplier language | `requests/requests.service.ts:198-210` |
| Portal offer submission z price tiers + alternatives | `portal/portal.service.ts:168-296` |
| Portal rate limiting (15/min) | `portal/portal.controller.ts:7` |
| Offer comparison z currency conversion (NBP) | `requests/requests.service.ts:411-494` |
| Sequence scheduler z retry (3x, exponential backoff) | `sequences/sequence-scheduler.service.ts` |
| Portal auto-update PENDING → VIEWED | `portal/portal.service.ts:70-76` |
| Notification on offer received | `portal/portal.service.ts:278-288` |
| Token regeneration w resendOfferEmail | `requests/requests.service.ts:346-362` |
| Submit DTO validation (price tiers, alternatives) | `portal/portal.service.ts:169-188` |
| Organization email footer injection | `email/email.service.ts:395-439` |
| Email override for dev environments | `email/email.service.ts:285-329` |

---

## Priorytety napraw

### P1 — Must Fix (blokują release)
B1-B10 (ownership, statusy, token expiry, DTO, duplikaty)

### P2 — Should Fix (ważne dla UX)
M1-M3, N1-N3 (offerDeadline, attachments, reply-to, update fields, portal URL, DRAFT visibility)

### P3 — Nice to Have
M4 (testy E2E — realizowane w ramach zadania 2.3)
