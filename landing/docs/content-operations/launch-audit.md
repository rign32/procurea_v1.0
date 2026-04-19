# Content Hub Launch Audit

> **Role**: Content Marketing Manager — final pre-launch audit
> **Date**: 2026-04-18
> **Scope**: 20 blog posts, 5 lead magnets, 5 case studies, routing, prerender, components

## Legend

- **GREEN** — launch-ready, no action required
- **YELLOW** — functional but below CMM quality bar; 3 improvements suggested
- **RED** — broken before shipping; must be fixed

---

## Top-line verdict

**HOLD for 30-minute fix window, then ship.**

9 broken internal slug references across resources + case studies (RED, all 10-character copy-paste fixes).
4 blog posts below the `relatedFeatures ≥ 2` rule (RED, one-line data fix).
9 blog posts with <3 blog-inbound links (orphan risk — see `orphan-report.md`).

Nothing in this audit is a structural or architectural problem. All of it is data drift: the blog skeletons shipped with one set of slugs, while resources + case studies reference an older slug naming (from cross-linking-matrix.md sketch). Data, code, and prerender are in sync with each other — only the **cross-refs** lag.

---

## 1. Data integrity

### 1.1 Blog posts (`src/content/blog-data/skeletons.ts`)

**Status: YELLOW — 4 posts violate `relatedFeatures ≥ 2` rule**

- All 20 slugs are unique (file audit confirmed).
- All 20 `relatedPosts` entries resolve to existing blog slugs (no missing refs).
- All 20 posts have `relatedPosts.length ≥ 3` (rule met).
- All 20 posts have `relatedIndustries.length ≥ 1` (rule met).
- Lead magnet slugs all valid (all 5 leadMagnetSlug references resolve).
- Feature / industry PathKeys all valid.

**RED: 4 posts have only 1 entry in `relatedFeatures` (rule requires ≥ 2):**

| Post | Current `relatedFeatures` | Location |
|---|---|---|
| `vendor-scoring-10-criteria` | `['fOfferComparison']` | `skeletons.ts:360` |
| `netsuite-supplier-management` | `['fAiSourcing']` | `skeletons.ts:447` |
| `tco-beat-lowest-price-trap` | `['fOfferComparison']` | `skeletons.ts:503` |
| `salesforce-for-procurement` | `['fAiSourcing']` | `skeletons.ts:560` |

**Fix**: one-line additions per post. Suggested second features:
- vendor-scoring-10-criteria → add `fOfferCollection`
- netsuite-supplier-management → add `fCompanyRegistry`
- tco-beat-lowest-price-trap → add `fOfferCollection`
- salesforce-for-procurement → add `fCompanyRegistry`

---

### 1.2 Resources (`src/content/resources.ts`)

**Status: RED — 3 broken slug refs**

- All 5 slugs unique.
- All `relatedFeatures` PathKeys valid.

**RED: 3 `relatedPosts` entries reference non-existent blog slugs:**

| Resource | Bad slug reference | Correct slug | Location |
|---|---|---|---|
| `tco-calculator` | `european-nearshoring-guide` | `european-nearshoring-guide-2026` | `resources.ts:165` |
| `nearshore-migration-playbook` | `european-nearshoring-guide` | `european-nearshoring-guide-2026` | `resources.ts:247` |
| `nearshore-migration-playbook` | `textile-sourcing-turkey-poland-portugal` | `turkey-vs-poland-vs-portugal-textiles` | `resources.ts:247` |

These produce broken "related content" links on the lead-magnet landing pages.

---

### 1.3 Case studies (`src/content/caseStudies.ts`)

**Status: RED — 6 broken slug refs across all 5 case studies**

- All 5 slugs unique.
- All `industry` values are valid PathKeys.
- All `featuresUsed` PathKeys valid.
- `relatedCaseStudies` refs resolve (2 valid, 3 empty arrays — see YELLOW below).

**RED: 6 `relatedPosts` entries reference non-existent blog slugs:**

| Case study | Bad slug reference | Correct slug | Location |
|---|---|---|---|
| `automotive-8-suppliers-5-days` | `european-nearshoring-guide` | `european-nearshoring-guide-2026` | `caseStudies.ts:78` |
| `automotive-8-suppliers-5-days` | `find-100-verified-suppliers-hour` | `how-to-find-100-verified-suppliers-in-under-an-hour` | `caseStudies.ts:78` |
| `event-agency-barcelona-72h` | `find-100-verified-suppliers-hour` | `how-to-find-100-verified-suppliers-in-under-an-hour` | `caseStudies.ts:117` |
| `hvac-subcontractors-developer` | `find-100-verified-suppliers-hour` | `how-to-find-100-verified-suppliers-in-under-an-hour` | `caseStudies.ts:148` |
| `restaurant-chain-12-vendors` | `find-100-verified-suppliers-hour` | `how-to-find-100-verified-suppliers-in-under-an-hour` | `caseStudies.ts:179` |
| `d2c-cosmetics-nearshore-migration` | `european-nearshoring-guide` | `european-nearshoring-guide-2026` | `caseStudies.ts:218` |
| `d2c-cosmetics-nearshore-migration` | `textile-sourcing-turkey-poland-portugal` | `turkey-vs-poland-vs-portugal-textiles` | `caseStudies.ts:218` |

Every case study has at least one broken link. Critical before launch.

**YELLOW: 3 case studies have empty `relatedCaseStudies`** (`caseStudies.ts:118`, `:149`, `:180`).
- `event-agency-barcelona-72h` → `relatedCaseStudies: []`
- `hvac-subcontractors-developer` → `relatedCaseStudies: []`
- `restaurant-chain-12-vendors` → `relatedCaseStudies: []`

Improvements:
1. HVAC ↔ Restaurant chain cross-link (both B2B category-refresh story arcs)
2. Barcelona event agency ↔ HVAC (both time-pressured short-burst sourcing)
3. Restaurant chain ↔ D2C cosmetics (both category-diversification from incumbent vendors)

---

## 2. Cross-linking rule compliance

**Status: YELLOW — architectural rules met on paper, but real inbound-link count is thin for 9 posts**

Cross-linking-matrix.md §5 claims every post has ≥ 3 inbound links. This assumes contribution from **landing-page inbound links** (e.g. `/features/ai-sourcing` linking to Post 10). The actual blog skeleton data only provides 3 posts in each `relatedPosts` array, so when we count blog→blog inbound alone, **9 of 20 posts fall below 3**.

See `orphan-report.md` for full incoming-link map. Top concerns:

| Post | Blog inbound | Notes |
|---|---|---|
| sourcing-funnel-explained | 1 | Only referenced by 30-hour-problem |
| buyers-guide-12-questions-ai-sourcing | 1 | Only referenced by ai-procurement-software |
| the-30-hour-problem | 2 | Should be hub-adjacent, only has 2 inbounds |
| netsuite-supplier-management | 2 | ERP cluster — matrix predicted this (§5 row 17) |
| sap-ariba-alternative-procurement | 2 | ERP cluster — matrix predicted this |
| salesforce-for-procurement | 2 | ERP cluster — matrix predicted this |
| german-manufacturer-sourcing | 2 | Orphan-adjacent |
| tco-beat-lowest-price-trap | 2 | Has an inbound from a resource, not counted in blog math |
| rfq-comparison-template-buyers-use | 2 | Has 2 resource inbounds |

The matrix §5 shows Posts 17 and 18 at 3 inbounds with `/integrations/*` landing pages as the third link. Those landing pages exist in routing (`pathMappings.intSap`, etc.) but the current blog skeletons don't reference them *from within their body text* — only in `relatedFeatures` (which is a different UI slot).

**Recommendation**: For launch, accept the orphan debt. Orphans route through feature landing pages in their CTAs, which surfaces them via navigation. Assign `orphan-fix` task in Wave 2 to add 3+ reciprocal links per orphan.

---

## 3. Routing integrity

### 3.1 App.tsx route registration

**Status: GREEN**

- `App.tsx:121-131` registers all 4 hub routes:
  - `/blog` + `/blog/:slug` (blog index + post)
  - `/materialy` (or `/resources`) + `/library` + `/library/:slug` (content hub, resources index, resource detail)
  - `/case-studies` + `/case-studies/:slug` (case studies index + detail)
- All use `pathFor()` from `paths.ts` — single source of truth.
- `ContentHubPage`, `BlogIndexPage`, `BlogPostPage`, `ResourcesIndexPage`, `ResourcePage`, `CaseStudiesIndexPage`, `CaseStudyPage` all imported as lazy chunks.

### 3.2 PathKeys in paths.ts

**Status: GREEN**

- `paths.ts:20-22` defines `resourcesHub`, `blogIndex`, `caseStudiesHub` with PL↔EN mapping.
- All 10 feature PathKeys + all 8 industry PathKeys declared — matches what blog/resource/case-study data files reference.
- `featureSlugs` (line 131) + `industrySlugs` (line 120) arrays match.

### 3.3 Navbar Resources dropdown

**Status: GREEN**

- `Navbar.tsx:69-100` — `resourcesSections` dropdown lists all 4 hub destinations:
  - All Resources → `pathFor('resourcesHub')`
  - Blog → `pathFor('blogIndex')`
  - Guides & Templates → `pathFor('resourcesHub') + '/library'`
  - Case Studies → `pathFor('caseStudiesHub')`
- Links resolve correctly (verified against `paths.ts`).
- Labels localized PL/EN.

---

## 4. Prerender coverage

### 4.1 scripts/prerender.mjs

**Status: GREEN**

- `prerender.mjs:35-56` — `BLOG_SLUGS` lists all 20 blog slugs (audited against `skeletons.ts`).
- `prerender.mjs:59-65` — `RESOURCE_SLUGS` lists all 5 resource slugs.
- `prerender.mjs:68-74` — `CASE_STUDY_SLUGS` lists all 5 case study slugs.
- `ROUTES_PL` (line 76-92) + `ROUTES_EN` (line 94-110) both include:
  - Hub landing pages (`/materialy`, `/blog`, `/materialy/library`, `/case-studies`)
  - All 20 `/blog/:slug` routes
  - All 5 `/materialy/library/:slug` (or `/resources/library/:slug`) routes
  - All 5 `/case-studies/:slug` routes
- META coverage exists for every slug:
  - `BLOG_META_EN` + `BLOG_META_PL` (lines 180-224) — 20 entries each
  - `RESOURCE_META_EN` + `RESOURCE_META_PL` (lines 226-240) — 5 entries each
  - `CASE_STUDY_META_EN` + `CASE_STUDY_META_PL` (lines 242-256) — 5 entries each

### 4.2 src/config/routesMeta.ts

**Status: YELLOW — hub pages covered; detail pages fall through to `noindex` default**

- Hub meta present:
  - `/materialy` `/resources` → lines 295-318
  - `/blog` → lines 321-334
  - `/materialy/library` `/resources/library` → lines 337-348
  - `/case-studies` → lines 351-358
- **No per-slug meta cases for `/blog/:slug`, `/resources/library/:slug`, `/case-studies/:slug`** — these fall through to the `default` case (line 360) which returns `noindex: true`.
- This is a YELLOW because:
  1. The prerender script bakes meta into static HTML (correct for SEO crawlers).
  2. The `metaFor()` is used client-side in case user lands on a page and React 19's metadata hoisting runs.
  3. If a user deep-links to a blog post **in a dev / SPA-only context** without prerender, they get `noindex`.

Improvements:
1. Add `case '/blog/how-to-find-100-verified-suppliers-in-under-an-hour':` branches (20 + 5 + 5 = 30 cases) or a regex-match helper at the top of `metaFor()`.
2. Wire `routesMeta.ts` to read from `BLOG_SKELETONS` / `RESOURCES` / `CASE_STUDIES` directly (DRY principle — single data source).
3. Have the `default` case check `pathname.match(/^\/(blog|case-studies|resources\/library)\//)` and return per-slug meta from the content arrays.

### 4.3 Sitemap coverage

**Status: GREEN**

- `prerender.mjs:438-446` emits sitemap entries for every route in `routes` (which includes all blog/resource/case-study slugs).
- Priority rules assign feature/industry = 0.6; hub = 0.8; home = 1.0; content-hub detail pages inherit 0.6 (monthly changefreq).

---

## 5. Component usage

### 5.1 ResourcePage uses LEAD_MAGNET_COVERS

**Status: GREEN**

- `ResourcePage.tsx:10` — `import { LEAD_MAGNET_COVERS } from "@/assets/content-hub/LeadMagnetCovers"`
- `ResourcePage.tsx:111` — `const Cover = LEAD_MAGNET_COVERS[resource.slug]`
- Registry covers all 5 resource slugs (`LeadMagnetCovers.tsx:578-587`).

### 5.2 CaseStudiesIndexPage uses CASE_STUDY_THUMBNAILS

**Status: GREEN**

- `CaseStudiesIndexPage.tsx:10` — import correct.
- `CaseStudiesIndexPage.tsx:65` — `const Thumbnail = CASE_STUDY_THUMBNAILS[cs.slug]` used in grid card render.

### 5.3 BlogPostPage uses AuthorAvatar

**Status: GREEN**

- `BlogPostPage.tsx:13` — import correct.
- `BlogPostPage.tsx:233` — `<AuthorAvatar name={post.author.name} size="md" />` used in author byline.

---

## Summary table

| Area | Verdict | Notes |
|---|---|---|
| Blog post data (uniqueness, refs) | **YELLOW** | 4 posts under `relatedFeatures ≥ 2` rule |
| Resources data | **RED** | 3 broken blog slug refs |
| Case studies data | **RED** | 6 broken blog slug refs, 3 empty `relatedCaseStudies` |
| Cross-linking ≥ 3 inbound rule | **YELLOW** | 9 posts orphan-adjacent (see orphan report) |
| App.tsx routing | **GREEN** | All hub + detail routes registered |
| paths.ts PathKeys | **GREEN** | All 10 feature + 8 industry keys defined |
| Navbar Resources dropdown | **GREEN** | Links to all 4 hub destinations |
| prerender.mjs coverage | **GREEN** | All 30 content-hub URLs generated |
| routesMeta.ts hub pages | **GREEN** | Hub page meta present |
| routesMeta.ts detail pages | **YELLOW** | Falls through to `noindex` default (prerender fills the gap) |
| ResourcePage LEAD_MAGNET_COVERS | **GREEN** | Wired |
| CaseStudiesIndexPage CASE_STUDY_THUMBNAILS | **GREEN** | Wired |
| BlogPostPage AuthorAvatar | **GREEN** | Wired |

---

## Launch recommendation

**FIX then SHIP** — the 9 broken slug refs + 4 missing features are all under 30 minutes of data editing. Block launch on these RED items; accept YELLOW orphan-risk debt for Wave 2 mitigation.

### Required before ship (RED, blockers)

1. Fix 3 slug refs in `resources.ts`:
   - line 165: `european-nearshoring-guide` → `european-nearshoring-guide-2026`
   - line 247: `european-nearshoring-guide` → `european-nearshoring-guide-2026`
   - line 247: `textile-sourcing-turkey-poland-portugal` → `turkey-vs-poland-vs-portugal-textiles`

2. Fix 7 slug refs in `caseStudies.ts` (`european-nearshoring-guide` → `european-nearshoring-guide-2026`, `find-100-verified-suppliers-hour` → `how-to-find-100-verified-suppliers-in-under-an-hour`, `textile-sourcing-turkey-poland-portugal` → `turkey-vs-poland-vs-portugal-textiles`).

3. Add a second `relatedFeatures` entry to 4 blog posts (lines 360, 447, 503, 560 in `skeletons.ts`).

### Ship with (YELLOW, Wave 2 mitigation)

- Orphan debt for 9 posts — documented in `orphan-report.md`, fixable by adding 12 reciprocal links total (≈1 hour of editing).
- Empty `relatedCaseStudies` on 3 case studies — 3 cross-links to add.
- Per-slug meta in `routesMeta.ts` — SEO bot gets correct meta today via prerender; SPA client fallback needs the helper.
- ERP-cluster inbound-link minimum (posts 17/18) — cross-linking-matrix.md §8 already flagged this; accept and monitor.

### Total fix time

≈ 30 minutes RED; + 1 hour YELLOW (optional before launch).
