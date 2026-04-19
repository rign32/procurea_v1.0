# Resource Page (Lead Magnet Landing) — Design Specification

**Route**: `/resources/library/:slug` (EN) · `/materialy/biblioteka/:slug` (PL)
**Component file**: `landing/src/pages/ResourcePage.tsx` (new)
**Purpose**: High-converting landing page for gated lead magnets (templates, playbooks, checklists). Primary goal: email capture.

---

## 1. Information architecture

```
┌──────────────────────────────────────────────────────┐
│ 1. Navbar (global)                                   │
├──────────────────────────────────────────────────────┤
│ 2. Breadcrumb row (Resources › Library › Slug)       │
├──────────────────────────────────────────────────────┤
│ 3. Hero + Two-col layout (60/40)                     │
│    – Left: format badge, H1, excerpt, value props,   │
│             "Who it's for" row, trust indicators     │
│    – Right: preview image + gate form (sticky)       │
├──────────────────────────────────────────────────────┤
│ 4. What's inside section (auto-generated TOC)        │
├──────────────────────────────────────────────────────┤
│ 5. Post-submit state (replaces gate form)            │
├──────────────────────────────────────────────────────┤
│ 6. Related resources (3-card grid)                   │
├──────────────────────────────────────────────────────┤
│ 7. Related blog posts (3-card grid)                  │
├──────────────────────────────────────────────────────┤
│ 8. Primary CTA (try app)                             │
├──────────────────────────────────────────────────────┤
│ 9. Footer                                            │
└──────────────────────────────────────────────────────┘
```

Two-column hero is the workhorse — 60-70% of conversions happen above the fold on these pages. Everything below is secondary.

---

## 2. Hero + gate form (two-column)

### Desktop layout (≥768px) — 60/40 split

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌───────────────────────────┐  ┌──────────────────────────┐    │
│  │                           │  │                          │    │
│  │ [EXCEL TEMPLATE · 86 KB]  │  │  ┌────────────────────┐  │    │
│  │                           │  │  │ [preview image]    │  │    │
│  │ RFQ Comparison            │  │  │  aspect-[4/3]      │  │    │
│  │ Template — Free           │  │  │  subtle shadow     │  │    │
│  │ Excel & Notion            │  │  └────────────────────┘  │    │
│  │                           │  │                          │    │
│  │ A battle-tested Excel     │  │  Get the free template  │    │
│  │ and Notion template for   │  │                          │    │
│  │ comparing supplier...     │  │  ┌────────────────────┐  │    │
│  │                           │  │  │ Full name          │  │    │
│  │ What you get:             │  │  └────────────────────┘  │    │
│  │                           │  │  ┌────────────────────┐  │    │
│  │ ✓ 10 comparison fields... │  │  │ Work email         │  │    │
│  │ ✓ Built-in weighted...    │  │  └────────────────────┘  │    │
│  │ ✓ Excel + Notion versions │  │  ┌────────────────────┐  │    │
│  │ ✓ One-click export to PPT │  │  │ Company            │  │    │
│  │ ✓ Used by 200+ teams      │  │  └────────────────────┘  │    │
│  │                           │  │                          │    │
│  │ Who it's for:             │  │  [ Get the template → ]  │    │
│  │                           │  │                          │    │
│  │ Purchasing managers and   │  │  By downloading, you     │    │
│  │ category buyers running   │  │  agree to our privacy    │    │
│  │ 5+ sourcing projects...   │  │  policy. Unsubscribe     │    │
│  │                           │  │  anytime.                │    │
│  │ [trust: 200+ teams  ★★★★☆]│  │                          │    │
│  │                           │  │  ← sticky top-28         │    │
│  └───────────────────────────┘  └──────────────────────────┘    │
│    col-span-12 md:col-span-7      col-span-12 md:col-span-5     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile layout (<768px) — form below value props

```
╔══════════════════════════╗
║ [EXCEL TEMPLATE · 86 KB] ║
║                          ║
║ RFQ Comparison           ║
║ Template — Free Excel    ║
║ & Notion                 ║
║                          ║
║ A battle-tested Excel... ║
║                          ║
║ ┌──────────────────────┐ ║
║ │ [preview image]      │ ║ ← image moves above form
║ └──────────────────────┘ ║
║                          ║
║ What you get:            ║
║ ✓ 10 comparison fields   ║
║ ✓ Built-in scoring       ║
║ ✓ Excel + Notion         ║
║ ✓ Export to PPT          ║
║ ✓ 200+ teams use this    ║
║                          ║
║ Who it's for:            ║
║ Purchasing managers...   ║
║                          ║
║ [trust: 200+ teams]      ║
║                          ║
║ ┌──────────────────────┐ ║
║ │ Full name            │ ║
║ └──────────────────────┘ ║
║ ┌──────────────────────┐ ║
║ │ Work email           │ ║
║ └──────────────────────┘ ║
║ ┌──────────────────────┐ ║
║ │ Company              │ ║
║ └──────────────────────┘ ║
║                          ║
║ [ Get the template → ]   ║
║                          ║
║ Privacy note...          ║
║                          ║
╚══════════════════════════╝
```

### Tailwind

```tsx
<section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
  <div className="grid grid-cols-12 gap-8 md:gap-10 lg:gap-14">
    {/* Left column — value props */}
    <div className="col-span-12 md:col-span-7">
      {/* Format badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 mb-5">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        {resource.formatLabel}
        {resource.fileSize && <span className="text-amber-700/70 font-normal">· {resource.fileSize}</span>}
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-extra-tight leading-[1.05] mb-5">
        {resource.title}
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
        {resource.excerpt}
      </p>

      {/* Mobile-only preview image */}
      <div className="md:hidden mb-8">
        <ResourcePreview resource={resource} />
      </div>

      {/* Value props */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4">
          {isEN ? 'What you get' : 'Co dostajesz'}
        </h2>
        <ul className="space-y-3">
          {resource.valueProps.map((prop, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </div>
              <span className="text-base text-slate-700 leading-relaxed">{prop}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Who it's for */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{isEN ? 'Who it is for' : 'Dla kogo'}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{resource.whoItsFor}</p>
      </div>

      {/* Trust indicators */}
      <TrustIndicators />
    </div>

    {/* Right column — form (sticky) */}
    <div className="col-span-12 md:col-span-5">
      <div className="md:sticky md:top-28">
        {/* Desktop-only preview image */}
        <div className="hidden md:block mb-6">
          <ResourcePreview resource={resource} />
        </div>

        <LeadMagnetGate resource={resource} />
      </div>
    </div>
  </div>
</section>
```

---

## 3. Preview visualization

Lead magnets rarely have production-quality screenshots at launch. Plan:

### Tier 1: no image (default at launch)
Show a format-specific gradient placeholder with format icon:

```
┌──────────────────────────────┐
│                              │
│   [gradient: amber-100 →     │
│    amber-300]                │
│                              │
│        [📊 icon]             │
│                              │
│     Excel Template           │
│         86 KB                │
│                              │
└──────────────────────────────┘
  aspect-[4/3]
  rounded-2xl
  border border-amber-200
  shadow-premium-lg
```

Tailwind:
```tsx
<div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-50 to-amber-200 border border-amber-200/50 shadow-premium-lg relative overflow-hidden">
  <div className="absolute inset-0 bg-mesh-gradient opacity-30 mix-blend-overlay" />
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm shadow-sm mb-3">
      <FileSpreadsheet className="h-8 w-8 text-amber-700" />
    </div>
    <div className="text-sm font-bold text-amber-900">{resource.formatLabel}</div>
    {resource.fileSize && <div className="text-xs text-amber-700 mt-0.5">{resource.fileSize}</div>}
  </div>
</div>
```

Format → gradient mapping:
- PDF: `from-rose-50 to-rose-200` (file icon)
- XLSX: `from-amber-50 to-amber-200` (spreadsheet icon)
- DOCX: `from-blue-50 to-blue-200` (document icon)
- Notion: `from-slate-50 to-slate-200` (book icon)
- Quiz/Calculator: `from-brand-50 to-brand-200` (brand icon)
- Video: `from-violet-50 to-violet-200` (play icon)

### Tier 2: full preview (post-launch)

Add `previewImage` field → render actual screenshot. Use `object-cover` with slight inner shadow to feel like "paper with ink on it".

---

## 4. Gate form (LeadMagnetGate)

### Structure

```
┌────────────────────────────────────┐
│                                    │
│  Get the free template             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Full name *                  │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Work email *                 │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Company *                    │  │
│  └──────────────────────────────┘  │
│                                    │
│  [ ] Subscribe to weekly digest    │
│      (optional, unchecked by       │
│      default)                      │
│                                    │
│  [ Get the template → ]            │
│                                    │
│  By downloading you agree to our   │
│  privacy policy. Unsubscribe       │
│  anytime.                          │
│                                    │
└────────────────────────────────────┘
```

### Fields

| Field | Required | Validation |
|---|---|---|
| Full name | yes | min 2 chars |
| Work email | yes | valid email + NOT gmail/yahoo/hotmail (flag as personal) |
| Company | yes | min 2 chars |
| Newsletter opt-in | no | default UNCHECKED per GDPR — double-opt-in follow-up |

**Critical GDPR rule**: Newsletter opt-in is OFF by default. User can download resource without subscribing — compliance + trust.

### Tailwind (form)

```tsx
<form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-black/[0.08] shadow-premium-lg p-6 sm:p-7">
  <h2 className="text-xl font-bold font-display tracking-tight mb-5">
    {isEN ? 'Get the free template' : 'Pobierz darmowy szablon'}
  </h2>

  <div className="space-y-4">
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
        {isEN ? 'Full name' : 'Imię i nazwisko'}
        <span className="text-rose-500 ml-0.5" aria-label="required">*</span>
      </label>
      <input
        id="name"
        type="text"
        required
        minLength={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
      />
    </div>
    {/* ... email, company similar */}

    <label className="flex items-start gap-2.5 cursor-pointer py-2">
      <input
        type="checkbox"
        checked={optIn}
        onChange={(e) => setOptIn(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
      />
      <span className="text-sm text-slate-600 leading-relaxed">
        {isEN ? 'Send me the weekly procurement digest (optional)' : 'Wysyłaj mi cotygodniowy digest procurement (opcjonalnie)'}
      </span>
    </label>
  </div>

  <button
    type="submit"
    disabled={isSubmitting}
    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white px-6 py-3.5 text-base font-semibold shadow-glow-primary hover:bg-brand-600 hover:shadow-glow-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {isEN ? 'Sending...' : 'Wysyłam...'}
      </>
    ) : (
      <>
        {isEN ? 'Get the template' : 'Pobierz szablon'}
        <ArrowRight className="h-4 w-4" />
      </>
    )}
  </button>

  <p className="mt-4 text-xs text-slate-500 leading-relaxed">
    {isEN ? 'By downloading you agree to our ' : 'Pobierając zgadzasz się z naszą '}
    <Link to={pathFor('privacy')} className="underline hover:text-brand-500">{isEN ? 'privacy policy' : 'polityką prywatności'}</Link>.
  </p>
</form>
```

### Validation

- Use `react-hook-form` + `zod` for schema validation (see dependency note below).
- Email validation: regex + check TLD + optionally check against disposable-email list (https://disposable.email/).
- Show error state per field: `border-rose-500`, `<p>` below field with `text-rose-600 text-xs`.

---

## 5. Post-submit state

Replaces the form in-place — don't redirect (losing scroll position is bad UX).

```
┌────────────────────────────────────┐
│                                    │
│        [✓ icon in green circle]   │
│                                    │
│      You're all set, Anna!         │
│                                    │
│  Check your inbox for the          │
│  download link.                    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Download now (if not in inbox│  │
│  └──────────────────────────────┘  │
│                                    │
│  ─────────────────────────────────│
│                                    │
│  While you're here, you might     │
│  also like:                        │
│                                    │
│  → TCO Calculator                  │
│  → Vendor Scoring Framework        │
│                                    │
└────────────────────────────────────┘
```

```tsx
<div className="rounded-2xl bg-white border border-black/[0.08] shadow-premium-lg p-6 sm:p-8 text-center">
  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4 animate-scale-in">
    <Check className="h-6 w-6" strokeWidth={2.5} />
  </div>
  <h3 className="text-xl font-bold font-display tracking-tight mb-2">
    {isEN ? `You're all set, ${firstName}!` : `Gotowe, ${firstName}!`}
  </h3>
  <p className="text-sm text-slate-600 leading-relaxed mb-6">
    {isEN ? 'Check your inbox for the download link.' : 'Sprawdź skrzynkę — wysłaliśmy link do pobrania.'}
  </p>
  <a
    href={resource.gatedDownloadUrl}
    download
    onClick={() => trackDownload(resource.slug)}
    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-slate-900 text-white px-6 py-3 text-base font-semibold hover:bg-brand-500 transition-colors"
  >
    <Download className="h-4 w-4" />
    {isEN ? 'Download now' : 'Pobierz teraz'}
  </a>

  {relatedResources.length > 0 && (
    <div className="mt-6 pt-6 border-t border-slate-200 text-left">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
        {isEN ? 'You might also like' : 'Może Cię zainteresować'}
      </p>
      <ul className="space-y-2">
        {relatedResources.slice(0, 2).map(r => (
          <li key={r.slug}>
            <Link to={`${pathFor('resourcesHub')}/library/${r.slug}`} className="group flex items-center justify-between gap-3 text-sm text-slate-700 hover:text-brand-500 transition-colors">
              <span className="line-clamp-1">{r.title}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
```

---

## 6. Trust indicators row

Subtle — single line below value props, not prominent. Don't fake social proof — use what's true (beta cohort count).

```
Used by 200+ procurement teams  ·  ★★★★☆ 4.7/5  ·  🔒 GDPR compliant
```

```tsx
<div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-500">
  <div className="inline-flex items-center gap-1.5">
    <Users className="h-3.5 w-3.5" />
    <span>{isEN ? 'Used by 200+ procurement teams' : 'Używane przez 200+ zespołów procurement'}</span>
  </div>
  <div className="inline-flex items-center gap-1.5">
    <Shield className="h-3.5 w-3.5" />
    <span>{isEN ? 'GDPR compliant' : 'Zgodne z RODO'}</span>
  </div>
</div>
```

If we have logos of beta customers willing to be named, add a single logo row (max 5 logos). Otherwise skip.

---

## 7. "What's inside" section (below fold)

Shown below the hero, preview content to help user commit. 1-column, narrative.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              What's inside the template                  │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Excel tab 1│  │ Excel tab 2│  │ Notion view│         │
│  │ Matrix     │  │ Scoring    │  │ Async prep │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                          │
│  Tab 1: Matrix                                          │
│  - 10 comparison fields                                 │
│  - Side-by-side layout                                  │
│  ...                                                    │
│                                                          │
│  Tab 2: Scoring                                         │
│  - Weighted formula                                     │
│  - Customizable weights                                 │
│  ...                                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Only include if `resource.whatsInside` field is populated. Not required for launch.

---

## 8. Related resources section

3-card grid showing related magnets (from `resource.relatedResources[]` or funnel-matched).

Uses same `ContentCard` component as hub, but filter to only show `type: 'resource'`.

---

## 9. Related blog posts section

3-card grid showing related posts (from `resource.relatedPosts[]`).

Uses same `ContentCard`.

---

## 10. Primary CTA (try app)

Same dark gradient CTA pattern as blog post page. Subtle variant copy: acknowledge they just downloaded, pitch the app as natural next step.

```
┌────────────────────────────────────────────────────────┐
│  [bg: dark]                                            │
│                                                        │
│  You have the template — now automate the search      │
│                                                        │
│  Procurea combines this comparison framework with     │
│  AI-sourced suppliers. Get 200+ qualified vendors     │
│  in minutes, pre-sorted for your template.           │
│                                                        │
│          [ Try Procurea free → ]                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 11. Full ASCII mockup — Desktop (≥768px)

```
╔══════════════════════════════════════════════════════════════════════╗
║ [Navbar]                                                             ║
╠══════════════════════════════════════════════════════════════════════╣
║ Resources / Library / RFQ Comparison Template                       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ ┌────────────────────────────────┐  ┌────────────────────────────┐  ║
║ │ [📊 EXCEL TEMPLATE · 86 KB]    │  │                            │  ║
║ │                                │  │  ┌──────────────────────┐  │  ║
║ │ RFQ Comparison                 │  │  │ [preview image]      │  │  ║
║ │ Template — Free                │  │  │ aspect-4/3           │  │  ║
║ │ Excel & Notion                 │  │  │ amber gradient +     │  │  ║
║ │                                │  │  │ file icon centered   │  │  ║
║ │ A battle-tested Excel and      │  │  └──────────────────────┘  │  ║
║ │ Notion template for comparing  │  │                            │  ║
║ │ supplier offers side-by-side.  │  │  Get the free template     │  ║
║ │ 10 comparison fields, scoring  │  │                            │  ║
║ │ formula built in, exportable   │  │  ┌──────────────────────┐  │  ║
║ │ to PPTX for stakeholders.      │  │  │ Full name *          │  │  ║
║ │                                │  │  └──────────────────────┘  │  ║
║ │                                │  │  ┌──────────────────────┐  │  ║
║ │ WHAT YOU GET                   │  │  │ Work email *         │  │  ║
║ │                                │  │  └──────────────────────┘  │  ║
║ │ ✓ 10 comparison fields...      │  │  ┌──────────────────────┐  │  ║
║ │ ✓ Built-in weighted scoring    │  │  │ Company *            │  │  ║
║ │ ✓ Excel + Notion versions      │  │  └──────────────────────┘  │  ║
║ │ ✓ One-click export to PPT      │  │                            │  ║
║ │ ✓ Used by 200+ teams           │  │  [ ] Subscribe to digest   │  ║
║ │                                │  │                            │  ║
║ │ ┌────────────────────────────┐ │  │  ┌──────────────────────┐  │  ║
║ │ │ WHO IT IS FOR              │ │  │  │ Get the template →   │  │  ║
║ │ │                            │ │  │  └──────────────────────┘  │  ║
║ │ │ Purchasing managers and    │ │  │                            │  ║
║ │ │ category buyers running    │ │  │  By downloading you agree  │  ║
║ │ │ 5+ sourcing projects...    │ │  │  to our privacy policy.    │  ║
║ │ └────────────────────────────┘ │  │                            │  ║
║ │                                │  │  (sticky top-28)           │  ║
║ │ 👥 Used by 200+ teams          │  │                            │  ║
║ │ 🔒 GDPR compliant              │  │                            │  ║
║ └────────────────────────────────┘  └────────────────────────────┘  ║
║    col-span-7 (60%)                      col-span-5 (40%)           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                 Related resources                                    ║
║                                                                      ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                           ║
║  │[TCO Calc]│  │[Vendor   │  │[Checklist│                           ║
║  │          │  │ Scoring] │  │ Risk]    │                           ║
║  └──────────┘  └──────────┘  └──────────┘                           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                 Related articles                                     ║
║                                                                      ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                           ║
║  │[RFQ auto]│  │[Vendor   │  │[AI Srcng]│                           ║
║  │          │  │ Scoring] │  │          │                           ║
║  └──────────┘  └──────────┘  └──────────┘                           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  [Dark CTA — "You have the template, now automate the search"]      ║
║                 [ Try Procurea free → ]                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  [Newsletter signup]                                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║  [Footer]                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 12. Conversion-optimization micro-patterns

- **Sticky form on desktop**: don't let user scroll past the form without another look. `md:sticky md:top-28`.
- **Pre-fill from UTMs**: if URL has `?utm_email=xxx`, pre-fill email field (rare but helps when email campaign clicks through).
- **Keep button copy specific**: "Get the template" not "Submit". Research shows +10-20% conversion.
- **Required-field asterisks in rose-500, not red**: feels less alarming.
- **No "Phone number" field**: phone is the #1 conversion killer for lead magnets. SDR outreach happens via email first anyway.
- **Exit-intent modal**: NOT at launch. Add only if conversion rate <15% after 30 days of data.
- **Related resources shown post-submit**: user is now engaged — capitalize with a next-step CTA while they're warm.

---

## 13. Animation choreography

- Hero left column: fade-up on mount (0.5s).
- Hero right column (form/preview): fade-up with 0.1s delay — feels sequential.
- Value props list: stagger each item by 0.05s via `motion.ul` with `staggerChildren`.
- Post-submit checkmark: `animate-scale-in` on the green circle (0.4s spring).
- Related sections: `RevealOnScroll` wrappers.

---

## 14. Accessibility

- Form labels ALL associated via `htmlFor` + `id`. No placeholder-only labels.
- Required field indicator: both visual (*) AND `aria-required="true"` on input.
- Error announcements: `aria-describedby` pointing to error `<p>`, `role="alert"` when error appears.
- Submit button loading state: `aria-busy="true"` when submitting, button disabled.
- Post-submit success state: focus moves to the heading (`useEffect` focus on ref). Screen reader announces "You're all set".
- Download button has `download` attribute + `aria-label` including resource format.
- Color contrast: labels `text-slate-700` on white = 11.3:1 ✓.
- Keyboard: `Tab` flows name → email → company → checkbox → submit. Submit on `Enter`.

---

## 15. Dependencies

- **react-hook-form** (new dep) — form state + validation. Current codebase has no form library; recommend this as standard going forward.
- **zod** (new dep) — schema validation. Pair with `react-hook-form` via `@hookform/resolvers/zod`.
- **Backend route `/api/leads/capture`** — posts to backend, backend sends email via Resend with download link, adds to CRM (Attio or Sheets for launch).
- Download links: store in `resources.ts` as `gatedDownloadUrl` — serve from Firebase Storage or committed `/public/downloads/` folder (latter OK for ≤10 MB files).

---

## 16. Analytics events

Fire these via `trackEvent()` (add to `landing/src/lib/analytics.ts`):

- `resource_page_viewed` — { slug, format, funnel, persona }
- `resource_form_started` — { slug } (on first field focus)
- `resource_form_submitted` — { slug, optIn }
- `resource_download_clicked` — { slug } (on download button after submit)
- `resource_related_clicked` — { slug, relatedSlug }

Use for funnel analysis in GA4 + custom dashboard.
