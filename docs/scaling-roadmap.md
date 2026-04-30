# Scaling Roadmap — Pipeline Throughput & Resilience

Stan na 2026-04-29. Plan po obserwacjach z prod-incydentu Moniki (3 kampanie z 0/4/7 dostawcami) i staging-debug session.

## Quick wins (zrobione 2026-04-29)

| # | Zmiana | Plik / komenda | Stan |
|---|---|---|---|
| QW1 | Staging `maxInstances` 2→10, concurrency 80→20, mem 1Gi→2Gi | `gcloud run services update apistaging` | ✅ |
| QW2 | Prod `maxInstances` 5→20, concurrency 80→40 | `gcloud run services update api` | ✅ |
| QW3 | Scrape timeout 10s→20s (env-tunable `SCRAPE_TIMEOUT_MS`) | `scraping.service.ts:54-67` | ✅ |
| QW4 | Serper retry on network errors (TLS/ECONNRESET) + keep-alive off | `google-search.service.ts:91-150` | ✅ |
| QW5 | Gemini retry expanded do network errors | `gemini.service.ts:170-220` | ✅ |
| QW6 | Cert filter → annotation (verified/unknown), nie rejection | `sourcing.service.ts:382-470` | ✅ |

**Koszt:** ~$0-30/mies dodatkowo (instances scale-on-demand, większy memory dopiero gdy realnie używane).

## Medium-term — sprint-scale items

### MT1 — Pub/Sub queue + Cloud Run worker pool dla pipeline

**Problem teraz:** API endpoint `POST /campaigns` zwraca 201 i jednocześnie odpala długi pipeline (10-25 min) w tle wewnątrz tej samej Cloud Function instancji. Pipeline **blokuje slot** na całą długość (sharing CPU/sieć z innymi requestami). Cap=20 instancji = max 20 równoległych kampanii **lub** API requestów.

**Design:**

```
[Frontend] → POST /campaigns → API enqueues to Pub/Sub topic 'sourcing-campaigns'
                                ↓
                          [Pub/Sub topic]
                                ↓
                  Cloud Run service `sourcing-worker`
                  (subscribes via push subscription,
                   maxInstances=50, concurrency=1)
                                ↓
                          Pipeline executes
                                ↓
                  Updates campaign status → DB
                  Emits WebSocket update → user UI
```

**Zalety:**
- API zostaje szybkie (zwraca 201 w <100ms, instance free dla kolejnego user'a)
- Worker scaling niezależny od API traffic
- Pub/Sub robi automatyczny retry (Cloud Tasks-style) jeśli worker padnie
- DLQ (Dead Letter Queue) na 5+ kolejnych fail'ach
- Concurrency=1 per worker = zero kontencji CPU/sieć między kampaniami

**Wymaga:**
1. Nowy serwis `sourcing-worker` w `backend/src/sourcing/worker/` — subscriber endpoint
2. Pub/Sub topic + push subscription (Terraform / `gcloud pubsub topics create`)
3. IAM: API service account może `pubsub.topics.publish`, worker SA może `pubsub.subscriptions.consume`
4. Refactor `sourcing.service.ts:create()` → emit event zamiast bezpośredniego wywołania pipeline'u
5. Idempotency check (campaign ID) — Pub/Sub może doręczyć wiadomość 2× w corner cases

**Estimate:** 1-2 dni implementacji + 0.5 dnia migracji + 0.5 dnia testów.

**Risk:** średni — duża refaktoryzacja, ale Pub/Sub to dojrzała usługa GCP, dobre SDK.

### MT2 — Cloud Tasks dla retry/backoff zewnętrznych API

**Problem:** Każdy retry Gemini/Serper/scraping żre slot Cloud Function. Long retry cycle (30s × 4 prób + jitter = 2.5 min) blokuje instancję. Skalowanie pomaga, ale można lepiej.

**Design:**

```
Pipeline call → Cloud Tasks queue 'gemini-calls'
                ↓
      Cloud Tasks dispatcher (managed, retries built-in)
                ↓
      Worker endpoint /internal/gemini-call
                ↓
      Result via callback URL → updates campaign state
```

**Zalety:**
- Infrastructure-level retry (5xx, network) bez naszego kodu
- Rate limiting per queue (np. 100 Gemini calls/sec globalnie)
- Pipeline główny nie blokuje czekając na retry
- Visible w Cloud Console (queue depth, retry rate)

**Trade-off:**
- Dodatkowa złożoność (call → enqueue → worker → callback)
- Dla SHORT calls (Gemini < 5s) może być overhead-em
- Lepiej dla LONG operations (scrape PDF z 30s timeout)

**Estimate:** 1 dzień, ale **zalecam wstrzymać** do po MT1 (Pub/Sub worker pool) — wtedy worker pool może bezpośrednio retry w pętli bez Cloud Tasks-em.

**Risk:** średni.

### MT3 — Browser pool dla scrapingu (Playwright na Cloud Run)

**Problem:** axios + cheerio nie radzi sobie z:
- JS-rendered SPA (React/Vue corporate sites)
- Cloudflare anti-bot challenges
- PDF z autoryzacją cookie/header
- Sites z infinite scroll / lazy load

Użyjemy **ScrapingBee** jako fallback gdy static fetch < 500 chars (już jest w kodzie). Ale ScrapingBee koszt: $50-200/mies przy growth.

**Design (alternative):**

Własny browser pool service:
```
sourcing-worker → POST /scrape   →  Playwright Cloud Run
                                    (1 instance = 1 browser context)
                                    maxInstances=10, concurrency=1
                                    memory=2Gi, cpu=2
                                    image: mcr.microsoft.com/playwright/node
```

**Zalety:**
- Real browser (JS, cookies, anti-bot mitigation)
- Możemy zachować screenshoots dla audit trail
- Koszt: ~$10-30/mies vs ScrapingBee $50-200

**Wymaga:**
1. Nowy `Dockerfile` z Playwright base image
2. Nowy serwis `scraping-worker` z endpointem `/scrape`
3. Refactor `scraping.service.ts` → call worker zamiast inline axios
4. Cache layer (już mamy in-memory, dodać Redis/Memorystore dla cross-instance share)

**Estimate:** 1-2 dni.

**Risk:** niski-średni (Playwright na Cloud Run jest dojrzała pattern).

**Decyzja:** MT3 robić **PO MT1**, bo MT1 dostarcza worker-pool architekturę w której scraping-worker jest naturalnym dodatkiem. Bez MT1 — Playwright worker by był sierotą.

## Long-term (jak będzie 50+ klientów)

- Mikroservisy: `search-service` / `scrape-service` / `ai-service` z osobnym scaling
- Persistent connection pools do Gemini/Serper (avoid TLS handshakes)
- Redis cache layer (Memorystore) dla cross-instance dedup
- Cloud SQL read replicas
- AlloyDB Serverless dla burst loadu

## Kolejność implementacji (rekomendacja)

1. **Sprint 1 (1-2 tygodnie):** MT1 — Pub/Sub queue + sourcing-worker. Największy zysk.
2. **Sprint 2 (1 tydz):** MT3 — Playwright browser pool (jako drugi worker).
3. **Sprint 3 (opcjonalnie):** MT2 — Cloud Tasks tylko jeśli worker-pool nie wystarcza.

Po Sprint 1+2 platforma obsłuży ~10× obecnego ruchu na tym samym budżecie GCP.

## Open questions

- Czy Pub/Sub push subscription radzi sobie z 25-min pipeline'em? (default ack deadline = 10 min, max 600s = 10 min — **trzeba ustawić max 600s i zrobić heartbeat ack-extension** albo użyć Cloud Run Job zamiast push subscription).
- ScrapingBee credit balance? Jeśli wystarcza, MT3 można odłożyć.
- VPC connector — czy potrzebny dla worker → Cloud SQL? (TLS direct = OK, prywatny IP = wymaga VPC connector).
