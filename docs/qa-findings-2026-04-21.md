# QA Findings — 2026-04-21

Sesja QA wykonana na branchu `staging` po deploy runa `24712050121`.
Staging smoke test **PASS 24/24** po deploy, backend tests **241/241 PASS**.
Dokument dla full-stack/dev grup które będą naprawiać znaleziska.

## Update 2026-04-21 (po bugfix pass)

Aktualny status znalezisk po sesji naprawczej (commity `c8137c8` + `050a3b1`):

| Bug | Status | Komentarz |
|---|---|---|
| P1 cold-start 500 | ⚠️ **kod gotowy, wymaga manual deploy** | `minInstances: 1` w komentarzu [main.functions.ts:145](../backend/src/main.functions.ts). Firebase CLI odrzuca bill-increase przez CI `--force`. Uruchom raz lokalnie: `npx firebase deploy --only functions:apiStaging --force` |
| P2 error shape 401 | ✅ **LIVE** | Zweryfikowane: `{"error":"Unauthorized"}` zamiast `"Internal Server Error"`. Fix: `defaultErrorForStatus()` w [all-exceptions.filter.ts](../backend/src/common/filters/all-exceptions.filter.ts) |
| P2 malformed JSON | ⚠️ **kod deployed, nadal 500 plain-text na live** | Zarejestrowałem `express.json()` + error middleware przed `app.init()` w [main.functions.ts](../backend/src/main.functions.ts). Na stagingu dalej zwraca 500 plain text. Podejrzenie: Firebase Functions 2nd gen / Express5Adapter ma własny body parser w wyższej warstwie. Wymaga głębszej diagnostyki. |
| P2 demo/create DoS | ✅ **LIVE** | `x-ratelimit-limit: 3, reset: 3600` — tighter niż wymagałem |
| P2 email/login spam | ❌ **nie tknięty** | Wymaga decyzji biznesowej (TTL vs tworzenie dopiero po verify) |
| P2 E2E w CI | ❌ **nie tknięty** | Wymaga zaprojektowania PG service container w GH Actions |
| P3 CSP + Referrer-Policy | ✅ **LIVE** | Wszystkie 3 headery obecne na `/api/**` |

### Auto-QA routine (nowe)

Dodany [.github/workflows/qa-nightly.yml](../.github/workflows/qa-nightly.yml):
- Cron `0 6 * * *` (08:00 PL zimą / 09:00 latem)
- Smoke test staging + production + backend unit tests
- Slack notify on failure (wymaga **SLACK_WEBHOOK_URL** secret)
- Manual trigger: `gh workflow run qa-nightly.yml`

**Aby włączyć Slack alerty**, dodaj secret `SLACK_WEBHOOK_URL`:
1. Slack → kanał (np. `#procurea-alerts`) → Apps → Incoming Webhooks → Add → Copy URL
2. `gh secret set SLACK_WEBHOOK_URL --repo rign32/procurea_v1.0` (wklej URL)
3. Opcjonalnie `SLACK_WEBHOOK_SUMMARY_URL` dla dzielnych success summaries

Bez tych secretów cron uruchamia się normalnie, tylko pomija krok Slack.

### Known limitations fixów

- **Malformed JSON body → 400**: próbowane **cztery podejścia**, żadne nie działa na deploy Firebase Functions 2nd gen + Express 5 + Nest 11:
  1. Express error middleware PO `app.init()` (na outer expressApp) — ignorowany bo `Express5Adapter.registerParserMiddleware` instaluje swój własny `express.json()` wewnątrz Nest stack.
  2. Własny `express.json()` + error handler PRZED `app.init()` — zjadany przez Express5Adapter który i tak re-instaluje parser.
  3. `SyntaxError` + `entity.parse.failed` catch w `AllExceptionsFilter` — body-parser error nie dociera do Nest exception pipeline bo Express ends request przed reaching Nest router.
  4. Override `registerParserMiddleware` w `Express5Adapter` żeby samemu zainstalować wrapped parsery (`app.use(safeParse(...))`) i zasupresować default Nest registration — deployed ale **response nadal HTTP 500 plain "Internal Server Error"**; oznacza że ani mój wrapper ani default ani AllExceptionsFilter go nie łapią. Request dociera do aplikacji (trace ID obecny) ale błąd wychodzi poza obsługę.

  **Hipoteza**: Firebase Functions 2nd gen runtime lub Cloud Run proxy parsuje body przed przekazaniem do expressApp, i przy malformed payload wywala 500 zanim nasz kod w ogóle zobaczy request. **Diagnoza wymaga Cloud Run logs** (GCP access, których QA session nie ma).

  Express5Adapter wrócił do oryginalnej formy (tylko `isMiddlewareApplied` patch), żeby nie zostawać dead code. Ticket dla deweloperów: "Diagnose malformed-JSON 500 plain-text response — requires Cloud Run logs".

- **E2E w CI (non-blocking)**: job `e2e-tests` dodany do [deploy-staging.yml](../.github/workflows/deploy-staging.yml) z PostgreSQL service container + `continue-on-error: true`. Czyta `test/*.e2e-spec.ts` (1067 LOC). Dzisiaj uruchomił się pierwszy raz — widać schema drift (field names nieaktualne w factories). Pierwsza naprawa już w commit `bd5d50d` od parallel session. Do flipu `needs: [quick-check, e2e-tests]` potrzebujemy: (a) factories zgodne z obecną schema.prisma, (b) migrate deploy kompletne (bez drift) — lub dalej `db push` dla E2E.

- **npm audit**: frontend 12→2 (vite 5→8 wymagane, breaking), landing 3→0, backend 41→41 (4 critical + xlsx bez fixa — osobny sprint).


---

## 1. Co zostało dostarczone w tej sesji

### A. Post-deploy smoke test
- [backend/scripts/smoke-staging.cjs](../backend/scripts/smoke-staging.cjs) — 9 kategorii, 24 asercje, cold-start retry 3×.
- Wpięty w oba workflowy: [deploy-staging.yml](../.github/workflows/deploy-staging.yml), [deploy-production.yml](../.github/workflows/deploy-production.yml).

### B. Testy jednostkowe (backend)
| Plik | Przedtem | Po sesji |
|---|---|---|
| [auth.service.spec.ts](../backend/src/auth/auth.service.spec.ts) | placeholder (1) | **29 testów** |
| [billing.service.spec.ts](../backend/src/billing/billing.service.spec.ts) | brak | **24 testy** (Stripe mocked) |
| [screener.agent.spec.ts](../backend/src/sourcing/agents/screener.agent.spec.ts) | brak | **6 testów** |
| [auditor.agent.spec.ts](../backend/src/sourcing/agents/auditor.agent.spec.ts) | brak | **6 testów** |
| [strategy.agent.spec.ts](../backend/src/sourcing/agents/strategy.agent.spec.ts) | brak | **9 testów** |

**Łącznie +73 testy**, backend suite: **168 → 241 PASS** w 1.5 s.

---

## 2. Bugi znalezione (dla deweloperów)

### 🔴 P1 — Cold-start 500 na Cloud Function

**Symptom**: Pierwszy request do `/api/health/ping` i `/api/health` po wybudzeniu `apiStaging` Cloud Function zwraca HTTP 500. Kolejne requesty (po ~44 s uptime) zwracają 200 stabilnie.

**Powtarzalność**: potwierdzone 2026-04-21 10:00:24 UTC. Po 10 kolejnych pingach wszystkie OK. Warsztat retry w smoke test maskuje problem dla CI ale nie dla użytkowników końcowych.

**Prawdopodobna przyczyna**: NestJS bootstrap przed pełną inicjalizacją providerów (Prisma connection pool albo `HealthService` lazy-init). `minInstances: 1` w prod może to ograniczać, ale staging może mieć `minInstances: 0` → zawsze zimny start dla użytkownika który pierwszy wchodzi rano.

**Wpływ biznesowy**: Użytkownik otwiera app po dłuższej pauzie → pierwszy `/api/auth/me` dostaje 500 → frontend wylogowuje usera lub pokazuje błąd.

**Ticket**: warto sprawdzić logi GCP Cloud Functions dla tego requesta, prawdopodobnie stack trace z Prisma/connection pool. Rozważyć `onApplicationBootstrap()` z warm-up query zamiast lazy connect. Alternatywnie: `minInstances: 1` na staging (koszt ~$5/mies).

### 🟡 P2 — Malformed JSON body → HTTP 500 + plain text

**Symptom**: 
```
POST /api/auth/email/magic-link
Content-Type: application/json
Body: "not-json{"
```
Odpowiedź: `HTTP 500` + `text/plain; charset=utf-8` + body `"Internal Server Error"`.

**Problem**:
1. Malformed JSON to błąd klienta → powinien być **400 Bad Request**, nie 500.
2. Wszystkie inne odpowiedzi backendu są JSON — ten jeden jest plain text, co łamie frontend error handling.
3. Brak security headers (HSTS itp.) w tej odpowiedzi — Express-level error handler omija NestJS pipeline.

**Ticket**: Dodać body-parser error middleware przed NestJS lub custom ExceptionFilter na `SyntaxError: Unexpected token` z `express.json()`. Wzorzec NestJS: `@Catch(SyntaxError)` filter zwracający `BadRequestException`.

### 🟡 P2 — `/api/campaigns/{id}` bez auth zwraca niespójny error shape

**Symptom**:
```json
{
  "statusCode": 401,
  "error": "Internal Server Error",   // <-- błąd: "Internal Server Error" przy 401
  "message": "Unauthorized",
  "timestamp": "...",
  "path": "/campaigns/nonexistent-id"
}
```

**Problem**: Pole `"error"` pokazuje `"Internal Server Error"` przy statusie 401 ("Unauthorized"). Mylące dla debugowania i narzędzi monitoring które groupują błędy po polu `error`.

**Ticket**: Global exception filter źle mapuje `UnauthorizedException` — powinien zwracać `error: "Unauthorized"` lub `error: "Unauthorized"` zgodnie z Nest default. Sprawdzić `main.ts` / custom exception filter.

### 🟡 P2 — `/api/auth/email/login` tworzy konto user na każdy unikalny email (spam surface)

**Symptom**: POST `/api/auth/email/login` z dowolnym emailem nieistniejącym w bazie → 201 + user record w PG. Rate limit 5 req/min mitiguje, ale nadal 7200 fake accountów/dobę na IP.

**Problem**: Po weryfikacji magic-code użytkownik staje się realny. Bez weryfikacji zostaje śmieć w bazie (powstała `Organization` z domain jeśli corporate email).

**Ticket**: Rozważyć: (a) tworzenie usera dopiero po weryfikacji magic-code, (b) retencja TTL na unverified users (np. delete po 7 dniach jeśli `emailVerifiedAt IS NULL`), (c) CAPTCHA / rate-limit po IP+email dla powtórzeń.

### 🟡 P2 — `/api/auth/demo/create` jest publiczny bez visible rate-limit

**Symptom**: Publiczny endpoint który tworzy: 1 Organization + 1 User + 1 Campaign + 7 Suppliers + 1 RFQ + 4 Offers + 6 Log entries — w sumie **~20 DB inserts**.

**Problem**: DoS-able. `cleanupDemoSessions` czyści dopiero po 24h. W międzyczasie atakujący może utworzyć tysiące sesji.

**Ticket**: Dodać strict rate-limit (np. 3/IP/h), CAPTCHA, lub session-based token. Zweryfikować czy już jest rate-limit który nie był widoczny w nagłówkach response.

### 🟢 P3 — Brak Content-Security-Policy i Referrer-Policy

**Symptom**: Odpowiedzi API mają HSTS + X-Frame-Options + nosniff, ale brak CSP i Referrer-Policy.

**Ticket**: Dodać CSP header (na start `default-src 'self'`) i `Referrer-Policy: strict-origin-when-cross-origin`. Warto też usunąć przestarzały `X-XSS-Protection: 1; mode=block` — nowoczesne przeglądarki go ignorują, a mogą być zastąpione CSP.

---

## 3. Dependency vulnerabilities (`npm audit`)

| Workspace | Total | Critical | High | Moderate | Low | Fix available? |
|---|---|---|---|---|---|---|
| **backend** | 41 | **4** | 16 | 12 | 9 | częściowo (`xlsx` — brak fixa, `<0.20.2`) |
| **frontend** | 12 | 0 | 7 | 5 | 0 | **tak** (`npm audit fix`) |
| **landing** | 3 | 0 | 3 | 0 | 0 | **tak** (`npm audit fix`) |

**Krytyczne (backend, 4 × Critical)**: wymagają natychmiastowej analizy — nazwy pakietów w `npm audit --json`.
**Wysokie fixowalne**: `rollup`, `socket.io-parser`, `undici` (frontend); `picomatch`, `rollup`, `vite` (landing) — wszystkie przez `npm audit fix`.
**`xlsx` (backend)**: Prototype Pollution + ReDoS, brak oficjalnego fixa, autor zaleca migrację na `exceljs`. Do ticketa.

**Ticket**: osobny sprint „Dep upgrades Q2 2026" — odpalić `npm audit fix` w frontend i landing (breaking changes wątpliwe, Vite 5→6 może być), potem osobno backend (krytyczne).

---

## 4. Test coverage gap analysis (po priorytetach dla deweloperów)

### 🔴 Wysokie ryzyko / brak pokrycia

| Moduł | LOC | Stan | Propozycja |
|---|---|---|---|
| **`backend/src/sourcing/sourcing.service.ts` `runMultimodalPipeline`** | ~1000 | placeholder | E2E test z mockami wszystkich agentów — dedykowany sprint; rozbić metodę na mniejsze phase-handlers (refactor) aby dało się testować fazy niezależnie |
| **`frontend/src/services/*` (17 serwisów)** | ~3k | **0 testów** | MSW + Vitest — mockować `api.client.ts`, testować happy+error paths dla `campaigns.service`, `rfqs.service`, `offers.service` |
| **`frontend/src/stores/*` (Zustand)** | ? | tylko `auth.store` pokryty | Dodać testy dla `campaigns.store`, `ui.store`, ewentualne inne stores |
| **`backend/src/webhooks/resend-inbound.controller.ts`** | ? | brak | webhook signature verification + event routing |
| **RBAC / tenant isolation** | — | `tenant-isolation.e2e-spec.ts` istnieje ale **NIE jest uruchamiany w CI** (patrz §5) | włączyć do CI — patrz poniżej |

### 🟡 Średnie ryzyko

| Moduł | Stan | Propozycja |
|---|---|---|
| `admin-frontend/` | **0 testów, 0 configu** | add Vitest + przynajmniej smoke test App.tsx |
| `landing/` | **0 testów, 0 configu** | przynajmniej build + a11y smoke (np. axe) — landing to wersja publiczna, SEO krytyczne |
| `backend/src/sourcing/agents/expansion.agent.ts` | brak | Gemini mock + testy expansion logic |
| `backend/src/sourcing/agents/apollo-enrichment.agent.ts` (681 LOC) | brak | Apollo API mock |

### 🟢 Niskie ryzyko / cosmetic

| Moduł | Notka |
|---|---|
| `sourcing.service.spec.ts`, `sourcing.controller.spec.ts` | placeholdery (`expect(true).toBe(true)`) — usunąć albo zastąpić jak ktoś będzie miał potrzebę |
| `frontend/src/constants/countries.test.ts` | 5 testów, OK |
| Helper utils (`parse-ai-json`, itp.) | prosta logika, ale warto mieć unit testy |

---

## 5. E2E testy backendu — istnieją ale NIE są uruchamiane w CI

W [backend/test/](../backend/test/) są 4 pliki E2E na 1 067 LOC (supertest + test fixtures):
- `portal-security.e2e-spec.ts` (232 LOC) — token validation, offer status guards
- `rfq-crud.e2e-spec.ts` (178 LOC) — CRUD flow
- `rfq-offer-flow.e2e-spec.ts` (304 LOC) — full RFQ → offer submission → viewing
- `tenant-isolation.e2e-spec.ts` (253 LOC) — org A nie widzi danych org B (**krytyczny test multi-tenant**)

`npm run test:e2e` jest zdefiniowane w `package.json` ale workflowy GitHub Actions go nie wywołują.

**Ticket (DevOps)**: dodać step E2E do `deploy-staging.yml` przed deploy:
```yaml
- name: Start PostgreSQL
  uses: docker/setup-buildx-action@v3
  # albo GH Actions services: postgres:16
- name: Run E2E tests
  working-directory: backend
  run: |
    npx prisma migrate deploy
    npm run test:e2e
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

**Szczególnie `tenant-isolation.e2e-spec.ts` powinien być gating condition dla produkcji** — regresja tam = wyciek danych między klientami.

---

## 6. Konkretne tickety (propozycja priorytetyzacji)

| # | Ticket | Severity | Effort | Properties |
|---|---|---|---|---|
| 1 | Cold-start 500 w `api/apiStaging` | P1 | M | `backend, infrastructure, cold-start` |
| 2 | Global exception filter: 401 zwraca `error: "Internal Server Error"` | P2 | S | `backend, observability` |
| 3 | Malformed JSON → 400 JSON zamiast 500 text/plain | P2 | S | `backend, api, dx` |
| 4 | `email/login` spam: tylko create po verify lub TTL na unverified | P2 | M | `backend, auth, security` |
| 5 | `demo/create` DoS risk — strict rate-limit / CAPTCHA | P2 | S | `backend, demo, security` |
| 6 | E2E testy do CI (szczególnie `tenant-isolation`) | P2 | M | `ci, devops, security` |
| 7 | npm audit fix (frontend + landing) | P2 | S | `deps, security` |
| 8 | npm audit analysis (backend — 4 × critical + xlsx) | P2 | L | `deps, security` |
| 9 | Testy `frontend/src/services/*` (MSW + Vitest) | P3 | L | `frontend, testing` |
| 10 | Test coverage dla `runMultimodalPipeline` — refactor na phase-handlers + E2E | P3 | XL | `backend, sourcing, refactor` |
| 11 | CSP + Referrer-Policy headers | P3 | S | `backend, security` |
| 12 | admin-frontend + landing setup Vitest + smoke tests | P3 | M | `testing, infrastructure` |

---

## 7. Staging — jak odtworzyć smoke test

```bash
BASE_URL=https://procurea-app-staging.web.app node backend/scripts/smoke-staging.cjs
# (production)
BASE_URL=https://app.procurea.pl node backend/scripts/smoke-staging.cjs
```

Wynik: 24 assertions, ~2 s. Zielone = wszystko OK. Retry 3× na `/api/health/ping` toleruje cold-start.

---

## 8. Czego NIE tknąłem (świadome odpuszczenia)

- **Pełne E2E `runMultimodalPipeline`** — monolit ~1000 LOC z 15+ deps, wymagałby dnia pracy i refaktoru. Zamiast tego pokryłem 3 agentów (Screener/Auditor/Strategy) bezpośrednio. Sourcing service tests placeholder zostawiony.
- **Frontend component tests / Playwright E2E** — nie ma Playwright skonfigurowanego. Dodanie go to osobny sprint setupowy.
- **Performance benchmarks** — p95 tylko na `/api/health/ping` (415ms max). Endpoint z DB query (`/api/campaigns`) wymaga auth cookie której nie mam.
- **Lokalne uruchomienie E2E backendu** — wymaga `docker compose up procurea-db` którego nie mam (maszyna użytkownika ma inne kontenery). E2E pliki są typesafe i odkrywalne przez `jest --listTests`.

---

*Dokument wygenerowany 2026-04-21, autor: Claude Code (QA pass).*
*Deploy commit: `6bdb082 fix(palette): narrow action items type before filter`.*
