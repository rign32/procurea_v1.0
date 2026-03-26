# Procurea — Kontekst dla Claude Code

## Sposób pracy Claude Code (OBOWIĄZKOWE)

### Zasada naczelna
Claude Code **NIE** uruchamia aplikacji lokalnie (npm run dev, localhost). Środowiskiem testowym jest **staging** (`staging.procurea.pl`). Każda zmiana w kodzie trafia na staging przez GitHub → CI/CD, a użytkownik testuje tam w przeglądarce.

### Workflow: od zadania do produkcji

**Faza 1 — Planowanie**
1. Użytkownik opisuje zadanie lub sprint (lista tasków)
2. Claude planuje implementację (plan mode lub todo list)
3. Po zatwierdzeniu planu → przejście do fazy 2

**Faza 2 — Implementacja**
1. Claude pisze kod, edytuje pliki
2. Może uruchamiać `npm run build` / `tsc --noEmit` aby sprawdzić kompilację
3. **NIE** uruchamia serwerów lokalnie, **NIE** testuje na localhost
4. Po zakończeniu kodu → zapytaj użytkownika:
   > „Zmiany gotowe. Rozpocząć procedurę deploy na staging?"

**Faza 3 — Deploy na staging**
Po potwierdzeniu użytkownika:
1. `git add` (tylko zmienione/nowe pliki, nie `git add .`)
2. `git commit` z opisowym komunikatem
3. Upewnij się, że branch `staging` jest aktualny: `git checkout staging && git merge main`
4. `git push origin staging` — to uruchamia GitHub Actions
5. **Monitoruj CI** — sprawdź status workflow:
   ```
   curl -s -H "Authorization: token <TOKEN>" \
     "https://api.github.com/repos/rign32/procurea_v1.0/actions/runs?branch=staging&per_page=1"
   ```
6. Jeśli CI **FAILED** → przeczytaj logi, napraw błąd, commitnij poprawkę i powtórz
7. Jeśli CI **SUCCESS** → poinformuj użytkownika:
   > „Deploy na staging zakończony. Odśwież staging.procurea.pl i przetestuj."

**Faza 4 — Akceptacja i produkcja**
1. Użytkownik testuje na staging.procurea.pl
2. Jeśli znajdzie problemy → Claude naprawia i wraca do fazy 3
3. Jeśli użytkownik akceptuje (mówi np. „git", „deploy na proda", „ok"):
   - `git checkout main && git merge staging`
   - `git push origin main` — to uruchamia deploy na produkcję
   - **Monitoruj CI** — sprawdź status workflow dla brancha main
   - Jeśli CI **SUCCESS** → potwierdź:
     > „Produkcja wdrożona. app.procurea.pl zaktualizowane."
   - Jeśli CI **FAILED** → przeczytaj logi, napraw, powtórz

### Zasady monitorowania CI/CD
- **NIGDY** nie kończ zadania zanim CI nie przejdzie pomyślnie
- Jeśli CI trwa > 5 minut, sprawdź status co minutę
- Po wykryciu błędu CI, automatycznie przeczytaj logi i zaproponuj fix
- Status CI/CD monitoruj przez: `gh run list --branch staging --limit 1` (gh CLI) lub GitHub API z tokenem z GitHub Secrets

### Czego Claude Code NIE robi
- **NIE** uruchamia `npm run dev`, `npm start` ani żadnych serwerów lokalnych
- **NIE** deployuje bezpośrednio na produkcję (`firebase deploy --only hosting:app,functions:api`) — tylko przez merge do `main`
- **NIE** pushuje na `main` bez wcześniejszej akceptacji staging przez użytkownika
- **NIE** tworzy commitów bez zapytania użytkownika o gotowość do deploy
- **NIE** używa `git add .` ani `git add -A` — tylko konkretne pliki

---

## Architektura projektu

- **Backend**: NestJS + Prisma + PostgreSQL (Docker, port 5432)
- **Frontend**: React 19 + Vite + Tailwind
- **AI**: Google Gemini 2.0 Flash (via AI Studio API Key)
- **Search**: Serper.dev
- **Email**: Resend

## Sourcingowy Pipeline (po optymalizacji z 2026-02-19)

Pipeline per URL: `Scrape → Screener(Gemini) → Enrichment(Google+Gemini) → Auditor(Gemini)`

Screener = połączony Explorer + Analyst (1 wywołanie Gemini zamiast 2).

Kluczowe pliki:
- `backend/src/sourcing/sourcing.service.ts` — główna orkiestracja pipeline
- `backend/src/sourcing/agents/screener.agent.ts` — screening + analiza (1 Gemini call)
- `backend/src/sourcing/agents/enrichment.agent.ts` — email discovery + enrichment
- `backend/src/sourcing/agents/auditor.agent.ts` — walidacja danych
- `backend/src/sourcing/agents/strategy.agent.ts` — generowanie strategii wyszukiwania
- `backend/src/common/services/gemini.service.ts` — klient Gemini z cache na dysku
- `backend/src/common/services/google-search.service.ts` — search z rate limiting i budżetem

Stare pliki `explorer.agent.ts` i `analyst.agent.ts` nie są używane — można usunąć.

---

## INSTRUKCJA: Zmiana limitu firm na 120

### Kontekst

Obecny limit to 10 firm (MAX_TOTAL_QUALIFIED). Poniżej opisano WSZYSTKIE zmiany
potrzebne do bezpiecznego zwiększenia do 120, z odpowiednim dostrojeniem
concurrency i budżetów API.

### Zmiany do wykonania

#### 1. `backend/src/sourcing/sourcing.service.ts`

```
Linia ~55-56 (concurrency limits):
  BYŁO:   workerLimit = pLimit(2)   urlLimit = pLimit(3)
  MA BYĆ: workerLimit = pLimit(3)   urlLimit = pLimit(5)

Linia ~343-344 (limity firm):
  BYŁO:   MAX_TOTAL_QUALIFIED = 10   MAX_PER_LANGUAGE = 5
  MA BYĆ: MAX_TOTAL_QUALIFIED = 120  MAX_PER_LANGUAGE = 50

Linia ~424 (limit strategii):
  BYŁO:   languageStrategies.slice(0, 3)
  MA BYĆ: languageStrategies.slice(0, 5)
```

#### 2. `backend/src/common/services/google-search.service.ts`

```
Linia ~65 (budżet search per kampania):
  BYŁO:   MAX_SEARCHES_PER_CAMPAIGN = 20
  MA BYĆ: MAX_SEARCHES_PER_CAMPAIGN = 80

Linia ~50 (minimalne opóźnienie między requestami):
  BYŁO:   MIN_DELAY_MS = 1500
  MA BYĆ: MIN_DELAY_MS = 1000
```

Alternatywnie budżet można ustawić przez env: `MAX_SEARCHES_PER_CAMPAIGN=80`

#### 3. `backend/src/sourcing/agents/strategy.agent.ts`

```
W prompcie (linia ~140-141):
  BYŁO:   "LIMIT: max 3 kraje/języki" i "3-4 zapytania PER JĘZYK"
  MA BYĆ: "LIMIT: max 5 krajów/języków" i "4-5 zapytań PER JĘZYK"
```

### Dlaczego takie wartości?

| Parametr | Wartość | Uzasadnienie |
|---|---|---|
| `workerLimit(3)` | 3 równoległe workery | 5 strategii × 3 parallel = stabilne obciążenie Gemini |
| `urlLimit(5)` | 5 równoległych URLi | 5 URLs × 3 Gemini calls = ~15 RPM per worker, bezpiecznie poniżej limitu |
| `MAX_PER_LANGUAGE = 50` | 50 per język | 120 / 3-5 języków ≈ 25-40, z zapasem |
| `MAX_SEARCHES = 80` | 80 search queries | 5 strategii × ~12 queries + email discovery |
| `slice(0, 5)` | 5 strategii | Więcej rynków = więcej różnorodności dostawców |

### Czego NIE zmieniać

- Gemini disk cache (90-dni TTL) — działa dobrze
- Query cache (30-dni TTL) — oszczędza search API
- Company Registry cache — pomija agentów dla znanych firm
- Rate limiting w GoogleSearchService — chroni przed 429
- Scraping retry logic (3 próby, exponential backoff)

### Szacowany czas dla 120 firm

- Gemini calls: ~120 × 3 = 360 (minus cache hits)
- Przy 5 parallel URLs × 3 workers = ~15 jednoczesnych pipeline'ów
- Szacowany czas: **8-15 minut** (vs ~60 min gdyby sekwencyjnie)

### Uwaga: PostgreSQL

Baza danych to PostgreSQL (via Docker). Stary opis o SQLite jest nieaktualny.

---

## Deployment Workflow (OBOWIĄZKOWY)

### Środowiska (IZOLOWANE)
- **Staging**: `staging.procurea.pl` — Cloud Function `apiStaging`, baza `procurea_staging`
- **Produkcja**: `app.procurea.pl` — Cloud Function `api`, baza `procurea`
- Środowiska są **w pełni oddzielone** — osobny backend, osobna baza danych

### CI/CD (automatyczny)
- Push na **`staging`** branch → GitHub Actions deployuje `hosting:app-staging` + `functions:apiStaging`
- Push na **`main`** branch → GitHub Actions deployuje `hosting:app` + `functions:api`
- Deploy backendu na staging **NIE** wpływa na produkcję (i odwrotnie)

### Flow pracy
1. Zrób zmiany w kodzie na branchu `main` (working directory)
2. Commit → `git checkout staging && git merge main && git push origin staging`
3. GitHub Actions deployuje na staging automatycznie
4. Użytkownik testuje na staging
5. Po akceptacji: `git checkout main && git push origin main`
6. GitHub Actions deployuje na produkcję automatycznie

### Deploy manualny (staging)
Jeśli potrzebny szybki deploy bez CI:
```bash
cd frontend && VITE_STAGING_SECRET=$VITE_STAGING_SECRET npm run build:staging
npx firebase deploy --only hosting:app-staging
```
Jeśli backend się zmienił:
```bash
cd backend && npm run build
npx firebase deploy --only functions:apiStaging
```

### Zasady
- **NIGDY** nie deployuj bezpośrednio na produkcję (`--only hosting:app`)
- **ZAWSZE** najpierw staging
- Deploy `functions:api` = tylko produkcja, deploy `functions:apiStaging` = tylko staging
- Bazy danych są oddzielne — dane staging nie wpływają na produkcję

### Deploy awaryjny (produkcja, bez GitHub)
Tylko w sytuacjach awaryjnych, po potwierdzeniu przez użytkownika:
```bash
cd frontend && npm run build && npx firebase deploy --only hosting:app,functions:api
```

---

## Staging: zasady cachowania i testowania

Użytkownik testuje staging przez **zwykłe odświeżenie przeglądarki** (F5). Nie czyści localStorage, nie otwiera incognito — po prostu odświeża stronę. Wszystkie zmiany MUSZĄ działać natychmiast po odświeżeniu.

### Zasady dla Claude:

1. **Staging auto-login ZAWSZE odświeża sesję** — efekt w `App.tsx` wywołuje `POST /auth/staging/auto-login` przy KAŻDYM mount (nie skip'uje gdy user jest cached). Dzięki temu nowe pola, naprawione dane i zmiany w backendzie są widoczne od razu po odświeżeniu.

2. **Nie polegaj na localStorage** — cached user w store może mieć stare dane (brak nowych pól, null w polach które backend dopiero naprawił). Staging auto-login musi zawsze nadpisywać store świeżymi danymi z backendu.

3. **Kiedy dodajesz nowe pole do User**:
   - Backend: dodaj pole do WSZYSTKICH response objects w auth.controller.ts (me, exchange, email/verify, staging/auto-login)
   - Frontend: dodaj pole do typu User w `campaign.types.ts`
   - Staging auto-login response MUSI zawierać to pole
   - Frontend MUSI defaultować do bezpiecznej wartości jeśli pole jest undefined (np. `user?.plan === 'full'` → false gdy brak pola)

4. **Kiedy zmieniasz dane staging usera** (np. dodajesz organizację, naprawiasz relacje):
   - Zmiana w `autoLoginStaging()` w `auth.service.ts` wystarczy — zostanie wywołana przy następnym odświeżeniu staging
   - NIE zakładaj że user musi wyczyścić cache

5. **Po deploy na staging** — poinformuj użytkownika że wystarczy odświeżyć stronę. Nigdy nie proś o czyszczenie cache/localStorage.
