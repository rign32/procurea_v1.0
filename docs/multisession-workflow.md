# Multi-session workflow (równoległe chaty Claude Code)

Praca w ~10 równoległych chatach Claude Code na jednym working directory
generuje konkretne klasy błędów. Ten dokument opisuje jak ich unikać.

## Objawy problemu

1. **Utrata uncommitted changes** — sesja A zapomniała commitnąć, sesja B zrobiła
   `git pull` i teraz widzi zmiany A jako swoje. Po commit+push sesji B, prace A
   trafiają do stashu (patrz `git stash list` — stashe `"other-session files"`).

2. **CI cancellation storm** — push sesji A uruchamia CI (~10 min), push sesji B
   po minucie kasuje CI-A i startuje CI-B. Efekt: żaden pośredni stan nie jest
   zweryfikowany.

3. **Lint errors na main** — staging historycznie miał `continue-on-error: true`
   na lint → błędy przechodziły przez staging, merge do main, blokowały prod CI.
   **Naprawione 2026-04-21 — lint teraz enforced na staging.**

4. **Schema drift** — ktoś zmienił `schema.prisma` bez migracji → `prisma db push`
   na staging, ale `migrate deploy` na prod nie widzi migracji → prod 500.
   **Naprawione — CI guard blokuje push z schema change bez migration file.**

## Zasady (OBOWIĄZKOWE dla każdej sesji)

### 1. Sync przed edycją
Zawsze zaczynaj sesję (i nowy task w sesji) od:
```bash
./scripts/claude-status.sh
```
Skrypt pokazuje:
- Czy jesteś behind/ahead wobec origin
- Ile jest uncommitted plików (>10 = prawdopodobnie WIP innej sesji)
- Co inne sesje pushnęły w ostatniej godzinie
- Status ostatniego CI run
- Ile stashy jest w repo

Jeśli `git status` pokazuje zmiany których nie robiłeś → to cudza sesja, **nie dotykaj tych plików**.

### 2. Nigdy `git add .` ani `git add -A`
Zawsze konkretne pliki. To jedyne zabezpieczenie przed wrzuceniem
plików innej sesji do swojego commita:
```bash
git add frontend/src/components/MyFile.tsx
git add frontend/src/i18n/en.ts
```

### 3. Commituj często, małe kawałki
Nie trzymaj długo niecommitowanego kodu. Każde zakończone zadanie →
commit. Zmniejsza okno w którym inna sesja może „pochłonąć" twoje zmiany.

### 4. Przed push — rebase na origin/staging
Użyj helpera który robi to wszystko atomowo:
```bash
./scripts/claude-safe-push.sh
```
Skrypt: fetch → rebase na origin → push → pokazuje status CI. Na konflikcie
przerywa jasnym komunikatem (nie force-pushuje, nie nadpisuje pracy innej sesji).

Ręcznie:
```bash
git fetch origin
git rebase origin/staging
# rozwiąż konflikty jeśli są
git push origin staging
```
Dzięki `rebase` zamiast `merge` historia staging zostaje liniowa, bez
merge-commitów z każdej sesji.

### 5. Stashe — zawsze z labelem
Jeśli musisz odstawić pracę:
```bash
git stash push -m "chat-N: opis co to za WIP"
```
Bezimienne stashe (`git stash` bez `-m`) po tygodniu są nieczytelne.
Po zrobieniu pracy → `git stash pop` i finalizuj.

### 6. CI cancellation to NIE błąd
Staging workflow ma `cancel-in-progress: true` celowo — z 10 chatami
pushującymi, tylko finalny stan staging ma znaczenie. Pośrednie runy
to szum. **Nie restartuj anulowanego CI** — nowszy commit już to pokrywa.

### 7. Praca równoległa nad tym samym plikiem
Jeśli **wiesz** że inna sesja pracuje nad tym samym plikiem (widzisz
uncommitted change w `git status`) → **poczekaj** aż tamta skończy i
commitnie, potem zrób `git pull --rebase` i dopiero zaczynaj.

## Jeśli już wpadłeś w chaos

### „Cudze" zmiany w moim working dir
```bash
# zobacz czyje
git diff --stat

# odłóż na stash z opisem — NIE usuwaj!
git stash push -m "other-session-WIP-$(date +%H%M)" -- <pliki>

# rób swoje
...

# oddaj inicjatywy innej sesji — użytkownik zrobi stash pop w tamtym chacie
```

### Failed merge/rebase
Nie używaj `git reset --hard` ani `git checkout -- .` — stracisz pracę.
Zamiast tego:
```bash
git rebase --abort                 # wróć do stanu przed rebase
git merge --abort                  # albo przerwij merge
git status                         # zobacz gdzie jesteś
```

### Lost commits (widziałem w reflogu że były)
```bash
git reflog                         # znajdź hash
git cherry-pick <hash>             # wyciągnij pojedynczy commit
```

## Opcjonalnie: git worktrees (pełna izolacja sesji)

Jeśli pain multi-session jest zbyt duży mimo powyższych zabezpieczeń —
rozważ git worktrees. Każda Claude sesja dostaje **osobny working directory**
(ta sama .git w tle, różne checkouty):

```bash
# Utwórz worktree dla konkretnej sesji/feature
git worktree add ../procurea-feature-rfq feature/rfq-wizard
git worktree add ../procurea-sourcing   feature/sourcing-pipeline

# Teraz Claude Code sesja #1 pracuje w /procurea/
# Sesja #2 w /procurea-feature-rfq/
# Sesja #3 w /procurea-sourcing/

# Pliki w każdym dir są niezależne — jedna sesja nie widzi plików drugiej
# Commity we wszystkich idą do tego samego repo

# Gdy skończysz:
git worktree remove ../procurea-feature-rfq
```

**Trade-off**: każdy worktree = duplikowane node_modules (500MB-1GB).
Zalety: zero kolizji plików, zero stashy, każda sesja ma własny TypeScript
daemon/ESLint cache.

**Kiedy warto**: jeśli masz >3 sesje pracujące na DŁUGOTRWAŁYCH featurach.
Dla krótkich tasków (30min-2h) — obecne zabezpieczenia (pre-commit hook +
claude-status.sh + małe commity) wystarczą.

## Efekt CI optimization (2026-04-21)

Przed: monolityczny build, lint z `continue-on-error`, ~12-13 min happy-path.
Po: quick-check fail-fast (~40s) + parallel builds, lint enforced, ~5 min total.

Fail-fast na lint oszczędza ~10 min przy każdym niepoprawnym pushu.
