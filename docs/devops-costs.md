# Procurea — DevOps & Cost Runbook

Ostatnia aktualizacja: 2026-04-20

## 1. Budżety i alerty GCP

Utworzone 3 budżety w projekcie **`project-c64b9be9-1d92-4bc6-be7`**.
Powiadomienia email → **r.ignaczak1@gmail.com** (monitoring notification channel `15325456512107726100`).

| Budżet | Limit | Progi powiadomień |
|---|---|---|
| Green (soft) | $50/mo | 50%, 90%, 100% spend + 80% forecasted |
| Yellow (warning) | $150/mo | 50%, 90%, 100% spend + 80% forecasted |
| Red (critical) | $300/mo | 50%, 90%, 100% spend + 80% forecasted |

Sprawdzenie budżetów:
```bash
gcloud beta billing budgets list --billing-account=01353F-ECAAD3-ADA539
```

Modyfikacja limitu (przykład):
```bash
gcloud beta billing budgets update <BUDGET_ID> \
  --billing-account=01353F-ECAAD3-ADA539 \
  --budget-amount=200
```

## 2. Obecne koszty — główne pozycje

Szacunki miesięczne (przy typowym ruchu):

| Pozycja | Koszt/mo | Uwagi |
|---|---|---|
| Cloud Function `api` idle (min=1, 4GiB, 1 vCPU) | ~$40 | Do obniżenia w Etapie 3 |
| Cloud Function `apiStaging` (min=0) | ~$0 idle | OK |
| Cloud SQL `procureafullapp-kopia-fdc` (db-f1-micro) | ~$8 | Minimalny rozmiar, OK |
| Serper.dev API | ~$0.001/query, max $2.50/campaign | Kontrolowane przez `MAX_SEARCHES_PER_CAMPAIGN` |
| Gemini (AI Studio) | Free tier + $0.00001875/token | Cache 60-70% hit rate |
| Firebase Hosting (6 targets) | Free tier starcza | 10 GB/mo bandwidth free |
| Artifact Registry (obrazy Cloud Functions) | ~$0.10/mo (po lifecycle) | Było ~$0.20, cleanup policy aktywna |

## 3. Artifact Registry — lifecycle policy

Repozytorium `gcf-artifacts` (europe-west1) ma automatyczny cleanup:
- Trzyma ostatnie **5 wersji** każdego pakietu
- Usuwa nietagowane obrazy starsze niż **14 dni**

Zarządzanie:
```bash
gcloud artifacts repositories describe gcf-artifacts --location=europe-west1
gcloud artifacts repositories set-cleanup-policies gcf-artifacts \
  --location=europe-west1 --policy=gcf-cleanup-policy.json --no-dry-run
```

## 4. Zasoby czekające na manualną akcję (ETAP 2 — do dokończenia)

### 4.1 Cloud Run `procurea-backend`
Stary, nieużywany od 2026-02-07 (brak ruchu, brak logów 30+ dni). Żaden Firebase Hosting target do niego nie rewrituje. Do skasowania:
```bash
gcloud run services delete procurea-backend --region=europe-west1 \
  --project=project-c64b9be9-1d92-4bc6-be7 --quiet
gcloud container images delete gcr.io/project-c64b9be9-1d92-4bc6-be7/procurea-backend \
  --force-delete-tags --quiet
```
**Akcja destrukcyjna** — wymaga potwierdzenia użytkownika.

### 4.2 Legacy GCR repository
Po usunięciu `procurea-backend` można wyczyścić cały `gcr.io/project-c64b9be9-1d92-4bc6-be7/*`:
```bash
gcloud container images list --repository=gcr.io/project-c64b9be9-1d92-4bc6-be7
```

## 5. Etap 3 — optymalizacja Cloud Function (wymaga redeploy prod)

**Plik: `backend/src/main.functions.ts`**

Obecna konfiguracja i proponowane zmiany:

### Funkcja `api` (produkcja)
```diff
- memory: '4GiB',
+ memory: '2GiB',        // -$13/mo idle. 4GiB potrzebne tylko dla pipeline sourcingu (2000+ URLs), ale min=1 trzyma 4GiB 24/7.
- maxInstances: 10,
+ maxInstances: 5,       // 80 concurrency × 5 = 400 równoległych requestów. 10 to overkill dla MVP.
  minInstances: 1,        // zostawiamy dla UX (bez cold start)
  concurrency: 80,        // OK
```

### Funkcja `apiStaging`
```diff
- memory: '4GiB',
+ memory: '1GiB',        // staging nie obsługuje prod loadu, 1GiB wystarczy
- maxInstances: 3,
+ maxInstances: 2,
```

### Jak wdrożyć (po akceptacji)
1. Edytuj `backend/src/main.functions.ts`
2. Commit → push na `staging`
3. Zweryfikuj pipeline sourcingu na staging (czy nie OOM'uje przy 500 supplierów)
4. Jeśli OK → merge na `main`
5. Jeśli OOM → przywróć 4GiB i rozważ inny split (osobna funkcja dla sourcingu)

### Oszczędność
~$13/mo na samym idle prod + ~$5/mo mniej na staging runs = **~$18/mo** = $216/rok.

## 6. Cleanup Cloud Run revisions

Cloud Run sam nie usuwa starych rewizji (mamy 114 dla `api`, 144 dla `apistaging`), ale one **nie kosztują** dopóki ich obrazy są czyszczone przez Artifact Registry lifecycle (punkt 3). Kosztujemy tylko za aktywne instancje serwujące ruch.

Jeśli chcesz wyczyścić listę rewizji dla porządku:
```bash
# Pokaż wszystkie poza najnowszymi 5
gcloud run revisions list --service=api --region=europe-west1 \
  --format="value(metadata.name)" | tail -n +6 | while read rev; do
  gcloud run revisions delete "$rev" --region=europe-west1 --quiet
done
```
Lepszy pomysł: pozwolić Cloud Run samemu je zwolnić (limit ~1000, potem usuwa FIFO).

## 7. GitHub Actions — zmiany w workflowach (2026-04-20)

### Dodane
- `paths-ignore:` na triggerach staging + prod — zmiany w `*.md`, `docs/**`, `.claude/**`, `Dokumenty/**` nie triggerują deployu (oszczędność Actions minutes).
- Lint frontendu na staging wywala błąd jeśli fails (nadal `continue-on-error: true`, ale nie jest już `|| echo`). Prod workflow blokuje lint failure od zawsze.

### Do rozważenia w przyszłości
- **Path-based conditional jobs**: osobne joby `build-backend`, `build-frontend`, `build-landing` z `paths:` filtrami (zmiana tylko landing = nie buduj backendu). Wymaga refaktoru workflow.
- **Manual approval na prod**: GitHub Environment `production` → Settings → Required reviewers.
- **Workload Identity Federation** zamiast `FIREBASE_TOKEN` (długoterminowy token legacy, deprecated w Firebase CLI).

## 8. Cykliczna higiena (do kwartalnego przeglądu)

- Sprawdź użycie Serper.dev: http://serper.dev dashboard
- Sprawdź rekord wydatków: https://console.cloud.google.com/billing/01353F-ECAAD3-ADA539/reports
- Sprawdź unused GCP resources: `gcloud recommender recommendations list --location=global --recommender=google.compute.instance.MachineTypeRecommender`
- Upewnij się że lifecycle policy dla `gcf-artifacts` jest aktywna (nie `dry-run`)
