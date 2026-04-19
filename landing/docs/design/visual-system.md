# Procurea Content Hub — Visual System

This document describes the visual system that drives the Procurea content
hub: pillar colors, SVG patterns, hero card variants, OG image specs, lead
magnet cover standards, iconography, animation, and accessibility rules.

All components referenced live under:

- `landing/src/assets/content-hub/HeroBackgrounds.tsx`
- `landing/src/assets/content-hub/OgImageTemplates.tsx`
- `landing/src/assets/content-hub/LeadMagnetCovers.tsx`
- `landing/src/assets/content-hub/CaseStudyThumbnails.tsx`
- `landing/src/assets/content-hub/Infographics.tsx`
- `landing/src/assets/content-hub/AuthorAvatars.tsx`

Principle: **pure React + SVG + Tailwind, no external image files.** Each
component gzips under 5 KB and is responsive via `className`.

---

## 1. Pillar color mapping

Each of the 5 content pillars has a dedicated accent color. These colors are
used in hero gradients, pillar badges, OG images, and in-blog callouts.

| Pillar | Hex (primary) | Hex (deep) | Tailwind class | Use case |
| --- | --- | --- | --- | --- |
| AI Sourcing Automation | `#5E8C8F` | `#2A5C5D` | `brand-500` / `brand-700` | Default — any post without a stronger pillar match |
| ERP & CRM Integration | `#5E4B8F` | `#2E2259` | (inline style) | Integration, sync, data flow posts |
| Multilingual Outreach | `#A9B28A` | `#6F7A52` | `sage-200` (fallback inline) | Cross-border, language, localization |
| Supplier Intelligence & Compliance | `#D69722` | `#8F5E0E` | (inline `amber-*`) | Risk, compliance, certs, audits |
| Offer Comparison & Negotiation | `#C76F96` | `#7B3A5C` | (inline style) | RFQ, scoring, TCO, negotiation |

Neutrals (always used for body text + UI chrome):

| Token | Hex | Tailwind | Notes |
| --- | --- | --- | --- |
| Ink | `#0F172B` | `slate-925` | Primary text + dark surfaces |
| Off-ink | `#060913` | `slate-975` | Hero scrim bottom |
| Muted | `#8E8396` | `brand-gray-500` | Secondary copy, legends |
| Surface | `#FFFFFF` | `white` | Card bodies |
| Hairline | `slate-200` | `border-slate-200` | Dividers, card outlines |

Case-study specific accent — `#10B981` / `#047857` (emerald) — used across
all 5 case studies regardless of industry.

Lead magnet specific accent — always amber (Supplier Intel palette). Lead
magnets are funnel assets so they share one color, not the pillar of the
underlying topic.

---

## 2. SVG pattern library

Five reusable patterns used as hero backgrounds, cover textures, and OG
scrims. All are rendered inline via `<defs><pattern>…</pattern></defs>` so
they inherit the nearest `fill="url(#id)"` context.

### 2.1 Dots (ERP pillar default)

```tsx
<pattern id="erp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
  <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.14)" />
</pattern>
```

Best on dark backgrounds. Increase `r` to 1.5 for lighter surfaces.

### 2.2 Lines / hatch (Supplier Intel, Lead Magnets)

```tsx
<pattern id="amber-hatch" width="40" height="40" patternUnits="userSpaceOnUse"
         patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="40"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
</pattern>
```

Rotate 45° for warm directional feel; 0° reads flat / editorial.

### 2.3 Network (AI Sourcing pillar)

Not a `<pattern>` — hand-placed nodes + `<path>` curves. See
`AiSourcingHero`. Rule: 12–14 nodes max, 3–4 connecting curves, `stroke-width`
between 1.2 and 1.5.

### 2.4 Mesh gradient (already in Tailwind config)

```tsx
className="bg-mesh-gradient"
```

From `tailwind.config.js`:

```js
"mesh-gradient":
  "radial-gradient(at 40% 20%, rgba(90,140,143,0.15) 0px, transparent 50%), " +
  "radial-gradient(at 80% 0%, rgba(169,205,208,0.12) 0px, transparent 50%), " +
  "radial-gradient(at 0% 50%, rgba(197,224,226,0.1) 0px, transparent 50%)"
```

Use for airy hero sections that should **not** dominate. Pairs well with
dark text.

### 2.5 Grid (Offer Comparison pillar + Case Studies)

```tsx
<pattern id="grid-48" width="48" height="48" patternUnits="userSpaceOnUse">
  <path d="M 48 0 L 0 0 0 48" fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
</pattern>
```

Signals "structured comparison / data". Default cell size 48 px (hero),
40 px (thumbnails), 32 px (covers).

---

## 3. Hero card variants

Heroes live at 16:9 by default but are aspect-agnostic (components render
`absolute inset-0`, parent controls size).

### Variants

| Variant | When to use | Typography |
| --- | --- | --- |
| **Full-bleed** (default in `OgImage`) | Blog posts, pillar pages | `font-display` 64–72 px, white, `drop-shadow` |
| **Split 480/720** (`OgImage variant="split"`) | Long titles, dense type | `font-display` 56 px on dark panel |
| **Case study overlay** (emerald) | Case study index + hero | `font-display` 62 px + emerald stat 96 px |
| **Lead magnet amber** | Resource pages | `font-display` 68 px + amber CTA chip |

### Tone overlays

All heroes accept `tone?: 'default' | 'light' | 'dark'`. Use `dark` when
overlaying heavy title typography (OG images, above-the-fold). Use `light`
when the hero sits next to body text and shouldn't dominate.

---

## 4. OG image specs

- **Dimensions**: 1200 × 630 (fixed pixel size on outer wrapper)
- **Safe zones**: 60 px outer padding on all sides
- **Title**: `font-display` 72 px (full-bleed), 56 px (split). Max width 1000 px
- **Eyebrow**: 14 px semibold uppercase, `tracking-[0.18em]`, white pill
- **Logo**: bottom-left, 40–44 px tall (inline `ProcureaWordmark`)
- **URL**: bottom-right, 14–16 px, white at 75–80% opacity
- **Contrast**: always render title on hero with `tone="dark"` + drop shadow

### Render pipeline (future)

1. Build a Vite script that imports `OgImage` / `LeadMagnetOg` / `CaseStudyOg`
2. Wrap in `<div style="width:1200px;height:630px">` and call
   `renderToStaticMarkup`
3. Convert SVG to PNG via `@resvg/resvg-js` or `@vercel/og`
4. Write to `public/og/<slug>.png`
5. Reference from `<meta property="og:image" content="/og/<slug>.png" />`

### Safe-zone checklist (per PR)

- [ ] Title fits on 2 lines at declared font size
- [ ] Logo + URL live inside 60 px padding
- [ ] Contrast ratio ≥ 4.5:1 between title and its local background
- [ ] No critical content in the outer 48 px (some platforms crop)

---

## 5. Lead magnet cover standards

Covers are **3:4 portrait** and live in the preview slot on
`ResourcePage.tsx`. The goal is to communicate format at a glance without a
stock photo.

### Required elements

1. **Format badge** — top-left pill: "XLSX · Template", "PDF · 6 pages", etc.
2. **Central motif** — a single piece of visual evidence for the content:
   spreadsheet grid, shield, calculator, scorecard, map
3. **Amber gradient** — `linear-gradient(155deg, #F5C451, #E0A637, #B37C1C)`
   for all lead magnets (funnel consistency)
4. **Wordmark + "Free"** — bottom bar, 11 px

### Typography

- Badge: 10 px, `tracking-[0.18em]` uppercase
- Motif labels inside SVG: 7–9 px Inter, 600 weight
- Footer wordmark: 11 px `font-display` semibold

### Aspect & sizing

```tsx
<div className="aspect-[3/4] rounded-xl overflow-hidden">
  <RfqComparisonTemplateCover className="w-full h-full" />
</div>
```

Covers are pure SVG — safe to render at any size from 160 px (card thumb)
up to 800 px (resource detail hero). Do **not** use as OG images; use
`LeadMagnetOg` (1200 × 630) instead.

---

## 6. Iconography

**Use `lucide-react`** — already installed as a project dependency. No
emojis in UI (per global CLAUDE.md guidance).

### Sizes

| Context | Size | Weight |
| --- | --- | --- |
| Body inline | 16 px | `strokeWidth={1.75}` |
| Card headers | 20 px | `strokeWidth={1.75}` |
| Feature bullets | 24 px | `strokeWidth={1.5}` |
| Hero accents | 32–40 px | `strokeWidth={1.5}` |

### Color

Icons inherit `currentColor`. Always set `text-*` on the wrapper, never hard
code `stroke`/`fill` on the icon.

```tsx
<CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
```

### Decorative vs semantic

- **Decorative** (icon sits next to text that describes it): add
  `aria-hidden="true"`
- **Semantic** (icon is the only label): wrap in element with
  `role="img"` + `aria-label`

---

## 7. Animation guidelines

Keep motion subtle and functional. B2B procurement audiences trust clarity
over flourish.

### Defaults

- Duration: **200–400 ms**
- Easing: `ease-out` for entrances, `ease-in-out` for loops
- Transform-only (no layout thrash): `opacity`, `translate`, `scale`

### Allowed

- `fade-up` 0.6 s on section entrance (already in Tailwind keyframes)
- `scale-in` 0.4 s on card reveal
- Hover: `scale(1.02)` or `translateY(-2px)`, 200 ms
- Shimmer on loading skeletons

### Not allowed

- **Parallax scroll** — causes motion sickness, breaks on mobile
- Auto-playing video backgrounds
- Carousels that advance themselves faster than 6 s
- Animation on data/charts (let users read numbers)

### Reduced motion

All animations MUST respect `prefers-reduced-motion`. Tailwind `motion-safe:`
variants handle this automatically — use them on any animation class:

```tsx
<div className="motion-safe:animate-fade-up">…</div>
```

---

## 8. Accessibility requirements

Every content-hub visual component follows the same accessibility contract.

### Required on every SVG

1. `role="img"` on the outer `<svg>` (or the wrapper that owns it)
2. `aria-label="…"` that describes the content — not the shape
3. `aria-hidden="true"` on purely decorative inner shapes

### Good / bad labels

| Bad | Good |
| --- | --- |
| `aria-label="circle pattern"` | `aria-label="Network of connected supplier nodes"` |
| `aria-label="svg"` | `aria-label="30-hour breakdown: Google search 8h, site analysis 10h, verification 6h, outreach 4h, comparison 2h"` |
| `aria-label="image"` | `aria-label="Nearshore country comparison: Turkey, Poland, Portugal"` |

### Color contrast

- Body text on card background: **≥ 7:1** (AAA) — we have headroom, use it
- Secondary text / meta: **≥ 4.5:1** (AA)
- Badge pills on tinted backgrounds: **≥ 4.5:1** including backdrop blur

### Focus states

Interactive elements (cards, buttons inside heroes) must show a visible
focus ring:

```tsx
className="… focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-brand-500 focus-visible:ring-offset-2"
```

### Author avatars

`AuthorAvatar` is `role="img"` with `aria-label={name}`. Never rely on
initials alone to convey authorship — always pair with the author's full
name in surrounding markup.

---

## 9. Component quick reference

| Component | File | Aspect | Gzip (target) |
| --- | --- | --- | --- |
| `AiSourcingHero` | `HeroBackgrounds.tsx` | any | ~2 KB |
| `ErpIntegrationHero` | `HeroBackgrounds.tsx` | any | ~2 KB |
| `MultilingualHero` | `HeroBackgrounds.tsx` | any | ~2 KB |
| `SupplierIntelHero` | `HeroBackgrounds.tsx` | any | ~2 KB |
| `OfferComparisonHero` | `HeroBackgrounds.tsx` | any | ~2 KB |
| `OgImage` | `OgImageTemplates.tsx` | 1200×630 | ~3 KB |
| `LeadMagnetOg` | `OgImageTemplates.tsx` | 1200×630 | ~2 KB |
| `CaseStudyOg` | `OgImageTemplates.tsx` | 1200×630 | ~2 KB |
| Lead magnet covers (×5) | `LeadMagnetCovers.tsx` | 3:4 | ~2 KB each |
| Case study thumbnails (×5) | `CaseStudyThumbnails.tsx` | 16:9 | ~2 KB each |
| `ThirtyHourBreakdown` | `Infographics.tsx` | fluid | ~2 KB |
| `SourcingFunnel` | `Infographics.tsx` | fluid | ~1.5 KB |
| `NearshoreCountryComparison` | `Infographics.tsx` | fluid | ~1 KB |
| `ContentPillarsDiagram` | `Infographics.tsx` | 500×440 | ~2.5 KB |
| `ComplianceShield` | `Infographics.tsx` | 400×400 | ~1.5 KB |
| `RafalAvatar` / `ProcureaResearchAvatar` / `AuthorAvatar` | `AuthorAvatars.tsx` | 32/48/64 | ~0.8 KB |

---

## 10. Extension points

When adding a new pillar, case study, or lead magnet:

1. **New pillar** → add color triplet here, create a `*Hero` in
   `HeroBackgrounds.tsx`, register in `HERO_BY_PILLAR`, extend `PillarSlug`
2. **New case study** → add thumbnail component in
   `CaseStudyThumbnails.tsx` + register slug in `CASE_STUDY_THUMBNAILS`
3. **New lead magnet** → add cover component in `LeadMagnetCovers.tsx` +
   register slug in `LEAD_MAGNET_COVERS`
4. **New infographic** → add named export in `Infographics.tsx` with same
   accessibility contract (role="img" + aria-label)
5. **New author** → add concrete component in `AuthorAvatars.tsx` OR rely on
   the `AuthorAvatar` factory (it hashes name → deterministic gradient)

Do **not**:

- Import bitmap images (PNG/JPG) for the content hub
- Hardcode pillar hex codes outside this document and `tailwind.config.js`
- Introduce new pattern IDs without documenting them in section 2
