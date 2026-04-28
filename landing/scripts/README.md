# landing/scripts

Build helpers and content pipelines for the landing site.

## Lead Magnet Sync from Figma

The Figma file `EVi16MP6TUmTE9OQf6I7Ha` (Procurea Lead Magnets) is the source
of truth for downloadable magnet content. The sync command pulls text from a
named page → updates the markdown source under
`public/resources/downloads/<slug>/<slug>.md` → regenerates the PDF.

### Setup (once)

1. Get a Figma personal access token: https://www.figma.com/developers
2. Add it to `landing/.env`:
   ```
   FIGMA_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. (Optional, for PDF regeneration) install pandoc + wkhtmltopdf:
   ```
   brew install pandoc
   brew install --cask wkhtmltopdf
   ```
   Without these, sync still works but PDF regeneration is skipped (use
   `--no-pdf` explicitly to silence the warning).

### Usage

```bash
# Dry-run — preview the diff against current markdown, no writes
npm run sync-magnet -- --slug=nearshore-migration-playbook --dry-run

# Real sync (writes .md, regenerates .pdf, bumps publishedAt in resources.ts)
npm run sync-magnet -- --slug=nearshore-migration-playbook

# Skip PDF regeneration (faster, useful when only text changed)
npm run sync-magnet -- --slug=nearshore-migration-playbook --no-pdf

# Sync all 4 magnets
npm run sync-magnet:all

# Verbose logging (shows Figma API calls + classifier decisions)
npm run sync-magnet -- --slug=nearshore-migration-playbook --verbose
```

### Available slugs

| Slug | Figma page |
|---|---|
| `nearshore-migration-playbook` | `01 — Nearshore Migration Playbook` |
| `supplier-risk-checklist-2026` | `02 — Supplier Risk Checklist 2026` |
| `ai-sourcing-buyers-guide` | `03 — AI Sourcing Buyer's Guide` |
| `china-plus-one-playbook-2026` | `04 — China+1 Strategy Playbook 2026` |

To add a new magnet: create a page in the Figma file with spreads named
`01-cover`, `02-toc`, `03-…` etc., then append an entry to
`scripts/figma-to-md/magnet-config.mjs`.

### What the script does

1. Fetches the full Figma file via REST API (cached in-process).
2. Locates the page named in `MAGNET_CONFIG[slug].figmaPageName`.
3. Iterates top-level frames whose names start with two digits + dash
   (`01-…`, `02-…`), in numeric order. Each frame = one spread = one section.
4. Walks each spread's text nodes top-to-bottom, classifies them (heading vs
   body vs caption) by font-size buckets relative to the spread median.
5. Reconciles design markers (`> [!STAT]`, `> [!CALLOUT]`, etc.) by reading
   the v2 source markdown in `figma-pipeline/lead-magnets-v2/<slug>.md` and
   matching by heading. Markers from the v2 source are preserved; Figma
   heading text always wins.
6. Renders Procurea-shape markdown with frontmatter (title, subtitle, slug,
   audience, category, format, updatedAt).
7. Writes the markdown, regenerates the PDF (pandoc → wkhtmltopdf), and
   bumps `publishedAt` for the slug in `src/content/resources.ts`.
8. Prints the diff and **stops there** — commit and push are human-gated
   per CLAUDE.md.

### Workflow (per CLAUDE.md)

```
1. Edit magnet text in Figma
2. npm run sync-magnet -- --slug=<slug> --dry-run     ← preview
3. npm run sync-magnet -- --slug=<slug>                ← write
4. git diff                                            ← review
5. git add public/resources/downloads/<slug>/ src/content/resources.ts
6. git commit -m "content: sync <slug> from Figma"
7. git checkout staging && git merge main && git push origin staging
8. Wait for CI ✓ → test on procurea-app-staging.web.app
9. git checkout main && git push origin main          ← prod deploy
```

### Module layout

```
scripts/
├── sync-magnet-from-figma.mjs      ← CLI entrypoint
└── figma-to-md/
    ├── magnet-config.mjs           ← slug → Figma page mapping
    ├── figma-client.mjs            ← REST API wrapper (cache, 429 handling)
    ├── frame-extractor.mjs         ← spreads → semantic sections
    ├── markdown-renderer.mjs       ← sections + v2 markers → markdown
    ├── file-writer.mjs             ← write .md, pandoc PDF, manifest, diff
    └── sync-agent.mjs              ← orchestration
```

## Other scripts

- `build-lead-magnets.mjs` — bulk markdown → PDF via pandoc (legacy, used
  manually before the Figma sync existed).
- `generate-{magnet}.mjs` — programmatic React-PDF generators for specific
  magnets (used to bootstrap the v1 PDFs).
- `prerender.mjs` — static HTML prerendering for SEO (52 pages PL/EN).
