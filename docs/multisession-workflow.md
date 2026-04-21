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
git fetch origin
git status                      # zobacz co jest niecommitowane
git log HEAD..origin/staging    # zobacz nowe commity
```
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

## Istniejące stashe do przejrzenia

Na 2026-04-21 w repo jest 10 stashy od różnych sesji
(`git stash list`). Przed ich usunięciem — obejrzyj każdy:
```bash
git stash show -p stash@{N}
```
Stashe z labelami `other-claude`, `other-session`, `chat-*` mogą zawierać
pracę która się zgubiła.

## CI optimization (ref)

Zmiany z 2026-04-21:
- `quick-check` job (tsc + lint, ~2 min) odpala się pierwszy, fail-fast
- Deploy job równolegli npm ci (backend+frontend+landing) oraz builds
- Lint enforcing na staging (było `continue-on-error: true`)
- Paths-ignore: `.claude/**`, `Dokumenty/**`, `**.md` — push z samymi
  dokumentami lub memory nie uruchamia deploy

Efekt: happy-path ~8-10 min (było 12-13). Fail-fast na lint: 2 min (było 4-5).
