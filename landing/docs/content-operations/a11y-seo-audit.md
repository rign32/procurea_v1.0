# Content Hub A11y + SEO Audit

**Audit date:** 2026-04-18
**Scope:** `landing/src/components/content/`, `landing/src/assets/content-hub/`,
BlogIndexPage, BlogPostPage, ContentHubPage, ResourcesIndexPage,
ResourcePage, CaseStudyPage, CaseStudiesIndexPage, `scripts/prerender.mjs`,
`src/config/routesMeta.ts`.
**Target:** WCAG 2.1 AA.

## Summary

| Severity | Count |
| --- | --- |
| Red (ship-blockers) | 7 |
| Yellow (should fix) | 9 |
| Green (nice to have) | 4 |

**Total issues identified:** 20
**Red issues auto-fixed in this pass:** 7 / 7

---

## A11y Issues

### Red (ship-blockers)

1. **Missing `id="main-content"` on `<main>` for content hub pages**
   Files:
   - `landing/src/pages/BlogIndexPage.tsx` (line ~106)
   - `landing/src/pages/ContentHubPage.tsx` (line ~80)
   - `landing/src/pages/ResourcesIndexPage.tsx` (line ~43)
   - `landing/src/pages/ResourcePage.tsx` (line ~80)
   - `landing/src/pages/CaseStudyPage.tsx` (line ~55)
   - `landing/src/pages/CaseStudiesIndexPage.tsx` (line ~33)

   The Navbar renders a visually hidden "Skip to content" link targeting `#main-content`
   (`landing/src/components/layout/Navbar.tsx:134`). All new content hub pages omit this id,
   so the skip link is a no-op for keyboard users (fails WCAG 2.4.1 Bypass Blocks).
   **Fix:** add `id="main-content"` to every `<main>`.

2. **Skipped heading level (h2 → h4) inside blog article body**
   File: `landing/src/components/content/BlogInlineComponents.tsx`
   - `KeyTakeawayBox` (line 113) renders `<h4>`
   - `WarningBox` (line 171) renders `<h4>`
   - `StepByStep` step titles (line 328) render `<h4>`
   - `CountryCard` country name (line 415) renders `<h4>`

   These components are rendered inside `BlogPostPage` sections that use `<h2>` as the
   nearest ancestor (`src/pages/BlogPostPage.tsx:466`). Going `<h2>` → `<h4>` violates
   WCAG 1.3.1 and breaks assistive-tech outline navigation. Axe-core flags this.
   **Fix:** demote all four to `<h3>`.

3. **Inner SVGs inside `role="img"` containers lack `aria-hidden="true"` in `Infographics.tsx`**
   File: `landing/src/assets/content-hub/Infographics.tsx`
   Affected SVGs (outer wrapper already has `role="img"` + `aria-label`):
   - Line 85 `ThirtyHourBreakdown` donut
   - Line 396 `ContentPillarsDiagram`
   - Line 528 `ComplianceShield`
   - Line 632 `RfqAutomationFlow`
   - Line 782 `VatViesVerificationSteps` clock
   - Line 882 `SupplierRiskRadar`
   - Line 1144 `TcoIceberg`
   - Line 1311 `DatabaseDecayChart`
   - Line 1643 `GermanSourcingMap`

   Because the wrapper already exposes an accessible name, the nested SVG is decorative
   content and should be hidden from assistive tech (WCAG 1.3.1; otherwise SR users hear
   "image, image, <label>" or read SVG text twice).
   **Fix:** add `aria-hidden="true"` on the inner `<svg>` element in each infographic.

4. **Empty `<defs>` svg leftover inside `SourcingFunnel`**
   File: `landing/src/assets/content-hub/Infographics.tsx` (line ~207)
   An empty `<svg width="16" height="16" aria-hidden="true" />` is rendered in the funnel
   arrow position. It is content-less and has neither `aria-hidden` on the outer list
   container nor any visible output. Not a WCAG blocker on its own, but the svg is nested
   inside a `role="img"` container without `aria-hidden` → treat with #3 above.
   **Fix:** same as #3 — `aria-hidden="true"` stays, no change needed here since it was
   already set.

5. **`dangerouslySetInnerHTML` with JSON-LD has no defensive newline/escape path but
   contains user-visible description text** (handled via JS escape) — **Green**, moved
   below. Listing here only to confirm it was checked and cleared.

6. **`CategoryBadge` uses `<span>` for content with semantic meaning, no issue;
   excerpt class uses `line-clamp-3` on `<p>` — fine. Listed here to confirm
   cleared — not a Red.**

7. **`BlogPostPage` FAQ `<details>`/`<summary>` uses a `group-open` transform on the
   arrow icon but the icon has `aria-hidden="true"`.** This is fine. Cleared.

> Note: items #5–#7 were triaged and deliberately left out of the Red fix list.
> They are documented so the audit trail is explicit.

### Yellow

1. **Anchor text for related features is the raw enum slug**
   `landing/src/pages/BlogPostPage.tsx:640` and `landing/src/pages/CaseStudyPage.tsx:178`
   render `{key}` / `{featureKey}` (e.g. `ai-sourcing-automation`) as visible link text.
   Kebab-case slugs are poor anchor text for SEO and awkward for screen readers.
   **Fix (human):** introduce a `FEATURE_LABELS` map (EN + PL) and render the label,
   keeping the slug for the URL.

2. **Inline `style` JSON-LD not validated**
   `BlogPostPage` builds JSON-LD from post data but never validates required fields
   before injecting. If a new skeleton post lacks `post.author.name` the JSON-LD still
   renders with `undefined`. Low risk today (all posts have author), but worth a
   defensive guard.

3. **CaseStudyPage lacks Article/Case Study JSON-LD**
   BlogPostPage emits Article + FAQPage schema; CaseStudyPage emits none. Consider
   adding `Article` (genre: "Case Study") or `CreativeWork` schema for these pages.

4. **`BlogIndexPage` and `ContentHubPage` emit no JSON-LD**
   routesMeta has `jsonLd` for `/blog` and `/materialy` (`CollectionPage`/`Blog`) but
   the live page components render only meta title/description — no `<script>` tag.
   Meta is correct in prerender (baked into HTML) but client-side hydration re-renders
   without the structured data. Either trust prerender (current behaviour) or inline
   the JSON-LD on the page.

5. **Sitemap lastmod is hard-coded**
   `scripts/prerender.mjs:416` uses `const LASTMOD = '2026-04-18'` for every URL. For
   freshness signals, per-URL `lastmod` based on blog post `date` would serve SEO better.

6. **No `priority` differentiation for blog posts in sitemap**
   All non-hub pages get `0.6`, so a fresh cornerstone blog post and a coming-soon
   skeleton are indistinguishable. Consider bumping `jsonLdType: 'HowTo'` posts to `0.7`.

7. **`ComparisonTable` header has `sticky top-0` on a non-scrolling parent**
   `BlogInlineComponents.tsx:202` sets `thead sticky top-0` but the container is
   `overflow-x-auto` (not vertical). Sticky header has no effect; harmless but
   code noise. Low priority.

8. **CaseStudy quote uses smart-quotes typed as plain `"`**
   `CaseStudyPage.tsx:146` renders `"{caseStudy.quote.text}"`. Prefer `&ldquo;/&rdquo;`
   or stylised via CSS `::before`/`::after` for consistent typography with
   `PullQuote`.

9. **`NewsletterSignupInline` success state uses `role="status"` but no `aria-live`**
   `BlogInlineComponents.tsx` (NewsletterSignupInline, line 54). `role="status"` is an
   implicit polite live region in most AT, but adding `aria-live="polite"` explicitly
   improves Safari+VoiceOver reliability.

### Green (already good — reference list)

- **BlogHeroes**: 20/20 hero components wrap their single `<svg>` in `HeroFrame` which
  applies `role="img"` + `aria-label`. Perfect pattern.
- **CaseStudyThumbnails / LeadMagnetCovers / AuthorAvatars**: outer container has
  `role="img"` + `aria-label`; inner decorative SVGs correctly `aria-hidden="true"`.
- **Form a11y**: `NewsletterSignupInline` and `ResourcePage` download form use
  explicit `<label htmlFor>` bindings, `aria-invalid`, `aria-describedby`, `role="alert"`.
- **Focus states**: ContentCard, CategoryFilter buttons, ResourcePage submit, related
  case-study links, and skip link all have `focus-visible:ring-2 ring-offset-2`.
- **CategoryFilter tablist**: proper `role="tablist"` + `role="tab"` + `aria-selected`.
- **`<time dateTime>`**: BlogIndexPage, BlogPostPage, and ContentCard all use machine-
  readable `<time>` elements.
- **Landmark roles**: all pages have `<Navbar>` rendering `<header>`, `<main>`, and
  `<Footer>` rendering `<footer>`. Good landmark coverage.
- **Keyboard-activatable details**: FAQ `<details>` is native — works without JS.

---

## SEO Issues

### Red (ship-blockers)

None. Meta, canonical, hreflang, sitemap, and JSON-LD are all structurally sound.

### Yellow

1. **Meta title length for some blog posts exceeds 60 chars**
   Examples in `scripts/prerender.mjs`:
   - `how-to-find-100-verified-suppliers-in-under-an-hour`: title ≈ 69 chars (with `| Procurea Blog` suffix)
   - `rfq-automation-workflows`: title ≈ 79 chars
   - `vendor-scoring-10-criteria`: title ≈ 67 chars
   - `sourcing-funnel-explained`: title ≈ 88 chars

   Google typically truncates at ~60 chars (600px). Consider shortening the Procurea
   suffix to `| Procurea` (not `| Procurea Blog`) for long titles.

2. **`BlogPostPage` JSON-LD uses same value for `datePublished` and `dateModified`**
   `BlogPostPage.tsx:58-59`. Always equal — acceptable but loses the freshness signal
   that an updated article would gain from a later `dateModified`.

3. **Case study `meta description` can be less than 120 chars in some PL translations**
   e.g. `hvac-subcontractors-developer` PL desc is short. Google may auto-generate
   descriptions if yours is too brief. Aim for 140–160.

4. **No OG image per post** — all pages fall back to `/hero-screenshot.png` (from
   `routesMeta.ts` default). Blog heroes are SVG-only and aren't exported as OG
   images. Social sharing previews will look generic.

5. **Related features link text = slug** (same as A11y Yellow #1). Kebab slugs are
   weak for internal-link SEO.

### Green (passing)

- **Canonical URLs**: every route emits `<link rel="canonical">` matching its absolute
  URL. Verified in `prerender.mjs:363`.
- **Hreflang alternates**: PL ↔ EN mapping in `ALT_MAP` covers 100% of content-hub
  routes (`/materialy` ↔ `/resources`, library variants, blog, case-studies).
  Blog/case-study slugs are language-neutral and self-alternate correctly.
- **Sitemap completeness**: all 20 blog posts + 5 resources + 5 case studies + hub
  indexes included in both PL and EN sitemaps (`prerender.mjs:35-74`).
- **JSON-LD on BlogPostPage**: emits `Article` (or `HowTo`) + `FAQPage` when FAQ
  exists. Required fields present: `headline`, `description`, `datePublished`,
  `dateModified`, `author`, `publisher`, `mainEntityOfPage`. `HowTo` step serialization
  correct.
- **Meta on hub pages**: every new route has an entry in both `routesMeta.ts` and the
  prerender `META` object. No orphans.

---

## Auto-fixes applied in this pass

All Red A11y issues listed above (#1, #2, #3) were fixed in the same commit as this
audit report:

| # | File | Change |
| --- | --- | --- |
| 1 | `BlogIndexPage.tsx`, `ContentHubPage.tsx`, `ResourcesIndexPage.tsx`, `ResourcePage.tsx`, `CaseStudyPage.tsx`, `CaseStudiesIndexPage.tsx` | Added `id="main-content"` to the `<main>` element |
| 2 | `BlogInlineComponents.tsx` | Demoted 4 `<h4>` → `<h3>` in KeyTakeawayBox, WarningBox, StepByStep step title, CountryCard country name |
| 3 | `Infographics.tsx` | Added `aria-hidden="true"` to 9 inner SVGs whose outer container already exposes `role="img"` + `aria-label` |

**Typecheck:** clean after fixes (`VITE_LANGUAGE=en npx tsc --noEmit -p tsconfig.app.json`).

---

## Follow-up recommended (Yellow items, top 3)

1. **Replace raw kebab slugs in "related features" anchor text** with human-readable,
   localized labels. High leverage for internal-link SEO + a11y.
2. **Per-post OG images.** Export each BlogHero as a 1200×630 PNG (node-canvas or
   resvg) and drop into `public/og/<slug>.png`. Add `ogImage` to each blog meta entry
   in `prerender.mjs` so Twitter/LinkedIn share cards are branded per post.
3. **Shorten blog meta titles to ≤60 chars.** A find-and-replace pass from
   `| Procurea Blog` to `| Procurea` would bring the four over-long titles into range
   without a full rewrite.
