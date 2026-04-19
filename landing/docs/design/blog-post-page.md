# Blog Post Page — Design Specification

**Route**: `/blog/:slug` (EN) · `/blog/:slug` (PL — paths match)
**Component file**: `landing/src/pages/BlogPostPage.tsx` (rewrite of existing 170-line version)
**Purpose**: Data-rich, long-form article page with sticky TOC, inline CTAs, and tight cross-linking to resources + related posts.

---

## 1. Information architecture

```
┌──────────────────────────────────────────────────────┐
│ 1. Navbar (global)                                   │
├──────────────────────────────────────────────────────┤
│ 2. Breadcrumb row (Resources › Blog › Article)       │
├──────────────────────────────────────────────────────┤
│ 3. Article hero                                      │
│    – Pillar badge + reading time                     │
│    – H1                                              │
│    – Excerpt (dek)                                   │
│    – AuthorByline row                                │
│    – Hero image OR gradient (optional)               │
├──────────────────────────────────────────────────────┤
│ 4. Two-col layout: TOC sidebar + article body        │
│    – Sticky TOC on desktop (left rail, 240px)        │
│    – Inline CTAs interspersed (after sections 2-3)   │
│    – Data viz: stat pills, tables, callouts, quotes  │
├──────────────────────────────────────────────────────┤
│ 5. Author byline (full) + social share               │
├──────────────────────────────────────────────────────┤
│ 6. Primary CTA (related lead magnet or trial)        │
├──────────────────────────────────────────────────────┤
│ 7. Related content (3-card grid)                     │
├──────────────────────────────────────────────────────┤
│ 8. Newsletter signup (dark gradient section)         │
├──────────────────────────────────────────────────────┤
│ 9. Footer                                            │
└──────────────────────────────────────────────────────┘
```

**Key shift from existing BlogPostPage.tsx**: existing version has no TOC, no author, no inline CTAs, no related-content grid. This rewrite adds all of those while keeping the dark CTA section (already proven UX pattern from current build).

---

## 2. Breadcrumb row

```
Resources › Blog › What is AI Sourcing...
```

```tsx
<nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-4">
  <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
    <li><Link to={pathFor('resourcesHub')} className="hover:text-brand-500 transition-colors">{isEN ? 'Resources' : 'Materiały'}</Link></li>
    <li aria-hidden className="text-slate-300">/</li>
    <li><Link to={pathFor('blogIndex')} className="hover:text-brand-500 transition-colors">Blog</Link></li>
    <li aria-hidden className="text-slate-300">/</li>
    <li className="text-slate-900 font-medium truncate max-w-xs" aria-current="page">{post.title}</li>
  </ol>
</nav>
```

- Truncate current-page crumb at `max-w-xs` on mobile to prevent wrap.
- `aria-current="page"` on final item for screen readers.

---

## 3. Article hero

### Structure

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  [Pillar badge: SOURCING]        5 min read           │
│                                                        │
│  What is AI Sourcing and Why                          │
│  It Matters in 2026                                   │
│                                                        │
│  Manual supplier sourcing is slow, expensive,         │
│  and limited by language barriers. Here is how        │
│  AI changes the game.                                 │
│                                                        │
│  ● Anna Kowalska · Head of Content · Apr 10, 2026     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │       [Hero image or gradient placeholder]       │ │
│  │                 aspect-[16/9]                    │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Tailwind

```tsx
<section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-12">
  <div className="flex items-center gap-3 mb-5">
    <PillarBadge pillar={post.pillar} />
    <span className="text-sm text-muted-foreground">·</span>
    <span className="text-sm text-muted-foreground">{post.readTime}</span>
  </div>

  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-extra-tight leading-[1.05] mb-5">
    {post.title}
  </h1>

  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 max-w-3xl">
    {post.excerpt}
  </p>

  <AuthorByline author={post.author} date={post.date} compact />

  {post.heroImage && (
    <div className="mt-10 aspect-[16/9] rounded-2xl overflow-hidden border border-black/[0.06] bg-gradient-to-br from-brand-500/10 to-sage-100">
      <img src={post.heroImage} alt="" className="h-full w-full object-cover" />
    </div>
  )}
</section>
```

- H1 max 70 characters (per existing h-structure.md). Uses `font-display` + `tracking-extra-tight`.
- Max width `max-w-4xl` on hero — narrower than grid for readability.
- If no hero image, use gradient placeholder (per-category color, see content-hub-page.md).
- AuthorByline rendered in `compact` variant here (avatar + name + role + date, single row).

---

## 4. Two-column article body + sticky TOC

### Desktop layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌────────────────┐  ┌──────────────────────────────────────────┐    │
│  │ TABLE OF       │  │                                          │    │
│  │ CONTENTS       │  │  Article body                            │    │
│  │                │  │                                          │    │
│  │ • Introduction │  │  Manual supplier sourcing has...         │    │
│  │ • What is AI   │  │                                          │    │
│  │   Sourcing     │  │  ## What is AI sourcing                  │    │
│  │ • Benefits     │  │                                          │    │
│  │ • Who uses it  │  │  AI sourcing refers to...                │    │
│  │ • Conclusion   │  │                                          │    │
│  │                │  │  [STAT PILLS ROW: 200+ / 40h / 26 lang]  │    │
│  │ ────           │  │                                          │    │
│  │                │  │  ┌────────────────────────────────────┐  │    │
│  │ Share:         │  │  │ [INLINE CTA — lead magnet]         │  │    │
│  │ [X] [Li] [🔗]  │  │  │ Free template: RFQ Comparison      │  │    │
│  │                │  │  │ Download → (name + email)          │  │    │
│  │                │  │  └────────────────────────────────────┘  │    │
│  │                │  │                                          │    │
│  │                │  │  ## Who is already using AI sourcing?    │    │
│  │                │  │                                          │    │
│  │                │  │  Forward-thinking procurement teams...   │    │
│  │                │  │                                          │    │
│  │                │  │  [TABLE — category comparison]           │    │
│  │ sticky top-28  │  │                                          │    │
│  └────────────────┘  │  [PULL QUOTE]                            │    │
│   w-60 shrink-0      │  "We had written off 6 weeks to crisis.  │    │
│                      │  Procurea gave us back 5 of them."       │    │
│                      │   — Head of Strategic Sourcing           │    │
│                      │                                          │    │
│                      │  ## Conclusion                           │    │
│                      │                                          │    │
│                      │  The technology is no longer experimental│    │
│                      │                                          │    │
│                      └──────────────────────────────────────────┘    │
│                            max-w-3xl, prose-lg                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile layout (<1024px)

- TOC becomes collapsible drawer anchored to bottom of screen (like Stripe docs / Notion).
- "Jump to section" chip/button at top of article body, triggers drawer.
- Article body uses full width `max-w-3xl mx-auto`.

### Tailwind

```tsx
<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
  <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
    {/* Desktop TOC */}
    <aside className="hidden lg:block">
      <TableOfContents sections={toc} className="sticky top-28" />
    </aside>

    {/* Mobile TOC trigger */}
    <div className="lg:hidden mb-8">
      <TableOfContentsDrawer sections={toc} />
    </div>

    {/* Article body */}
    <article className="max-w-3xl prose prose-lg prose-gray prose-headings:font-display prose-headings:tracking-tight prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:text-slate-700 prose-p:max-w-[65ch] prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-semibold prose-blockquote:border-l-brand-500 prose-blockquote:bg-brand-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic">
      <MdxRenderer content={post.content} />
    </article>
  </div>
</section>
```

---

## 5. Typography scale for article body

| Element | Tailwind classes | Notes |
|---|---|---|
| H2 | `text-3xl font-bold font-display tracking-tight mt-12 mb-5` | Max 60 chars (per SEO H-structure) |
| H3 | `text-xl font-semibold font-display tracking-tight mt-8 mb-3` | Max 75 chars |
| Paragraph | `text-base leading-relaxed text-slate-700 max-w-[65ch] mb-6` | 65ch ≈ optimal line length |
| Lead paragraph (first `<p>` after H1) | `text-lg leading-relaxed text-slate-800 font-medium mb-8` | Softer, larger |
| Links inline | `text-brand-500 no-underline hover:underline` | |
| Bold | `font-semibold text-slate-900` | Slightly darker than body |
| Lists (ul/ol) | `pl-6 space-y-2 marker:text-brand-500` | Brand-colored bullets |
| Code inline | `px-1.5 py-0.5 rounded bg-slate-100 text-[0.9em] font-mono text-slate-900` | |
| Code block | `rounded-xl bg-slate-950 text-slate-100 p-5 overflow-x-auto text-sm font-mono leading-relaxed` | Dark theme |

Use `@tailwindcss/typography` plugin's `prose-*` modifiers to achieve above without per-element classes.

---

## 6. Inline CTA components

### Variants (4 styles, full spec in component-library.md)

1. **Magnet** — after section 2, promotes a specific related lead magnet
2. **Trial** — after section 3, prompts app signup
3. **Demo** — after section 4, books a call
4. **Calculator** — inline link to ROI calculator page

### Placement logic

- If post has `relatedResources[]`, drop `InlineCTA variant="magnet"` after the 2nd H2 section.
- After the 3rd H2 section, drop `InlineCTA variant="trial"` (or `"demo"` for BOFU posts).
- MAX 2 inline CTAs per article (any more feels sales-heavy). Use frontmatter flag `ctaMode: 'soft' | 'aggressive'` in blog.ts.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ [gradient: bg-gradient-to-br from-brand-50 to-sage-50] │
│                                                         │
│  [📘 icon]                                              │
│  Free template: RFQ Comparison                          │
│  10 comparison fields, weighted scoring,                │
│  ready for executive presentations.                     │
│                                                         │
│  [ Download free → ]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```tsx
<aside className="not-prose my-10 rounded-2xl bg-gradient-to-br from-brand-50 to-sage-50 border border-brand-500/15 p-6 sm:p-8">
  <div className="flex items-start gap-4">
    <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
      <BookOpen className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <div className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">{isEN ? 'FREE TEMPLATE' : 'DARMOWY SZABLON'}</div>
      <h4 className="text-lg font-bold font-display tracking-tight mb-1">{resource.title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{resource.excerpt}</p>
      <Link
        to={`${pathFor('resourcesHub')}/library/${resource.slug}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-500 transition-colors"
      >
        {isEN ? 'Download free' : 'Pobierz za darmo'}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </div>
</aside>
```

`not-prose` is critical — tells `@tailwindcss/typography` to skip prose styling inside the CTA.

---

## 7. Data visualization patterns

### 7a. Stat pills row (inline)

Use for "key numbers" — e.g., "AI sources 10-20x more suppliers than manual".

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  200+   │ │  40h→1h │ │   26    │ │   60%   │      │
│  │suppliers│ │  faster │ │languages│ │coverage │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
└─────────────────────────────────────────────────────────┘
```

Full component spec in `component-library.md` → `StatPillsRow`. Within prose use `not-prose` wrapper.

### 7b. Comparison tables

Desktop: standard HTML table. Mobile (<640px): horizontal scroll with left-side column frozen, OR transform into stacked cards.

```tsx
<div className="not-prose my-10 -mx-4 sm:mx-0 overflow-x-auto">
  <table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr className="bg-slate-50">
        <th className="sticky left-0 bg-slate-50 border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Criterion</th>
        <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Manual</th>
        <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50">AI Sourcing</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="sticky left-0 bg-white border-b border-slate-100 px-4 py-3 text-sm font-medium">Time per project</td>
        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">20-40 hours</td>
        <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-brand-700 bg-brand-50/30">45 minutes</td>
      </tr>
      {/* ... */}
    </tbody>
  </table>
</div>
```

### 7c. Callout boxes

For warnings, tips, and notes. 3 variants: info (brand-500), warning (amber-500), tip (emerald-500).

```
┌───────────────────────────────────────────────────────┐
│ ⚡ TIP                                                │
│ If you are evaluating 5+ suppliers, use a weighted   │
│ scoring matrix — not a simple ranked list.           │
└───────────────────────────────────────────────────────┘
```

```tsx
<aside className="not-prose my-8 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 p-5">
  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
    <Zap className="h-3.5 w-3.5" />
    {isEN ? 'TIP' : 'WSKAZÓWKA'}
  </div>
  <p className="text-sm leading-relaxed text-slate-700">If you are evaluating 5+ suppliers...</p>
</aside>
```

### 7d. Pull quote

For testimonials or emphasis. Full spec in `component-library.md` → `PullQuote`.

```
                  ┌──────────────────────────┐
                  │ "                        │
                  │                          │
  "We had written off 6 weeks to crisis.    │
   Procurea gave us back 5 of them."        │
                                             │
   — Head of Strategic Sourcing              │
     Tier-1 Automotive Supplier              │
                                             │
                  │                          │
                  └──────────────────────────┘
```

```tsx
<figure className="not-prose my-12 relative pl-8 border-l-4 border-brand-500">
  <div className="absolute -left-2 top-0 text-6xl font-serif text-brand-500/30 leading-none select-none">"</div>
  <blockquote className="text-xl md:text-2xl font-display font-semibold tracking-tight leading-snug text-slate-900 mb-4">
    We had written off 6 weeks to crisis. Procurea gave us back 5 of them.
  </blockquote>
  <figcaption className="text-sm text-slate-600">
    <span className="font-semibold text-slate-900">Head of Strategic Sourcing</span> · Tier-1 Automotive Supplier
  </figcaption>
</figure>
```

---

## 8. Author byline (full, below article)

Full spec in `component-library.md` → `AuthorByline` (`variant="full"`).

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────┐                                                │
│  │ [AK] │  Anna Kowalska                                 │
│  │avatar│  Head of Content · Procurea                    │
│  └──────┘                                                │
│                                                          │
│  Anna spent 8 years in procurement at Schneider         │
│  Electric and now leads Procurea's content strategy.    │
│                                                          │
│  [LinkedIn] [Follow on X]                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Primary CTA section (after body, before related)

Reuse existing dark gradient pattern from current `BlogPostPage.tsx` lines 111-136 — it works well. Updated tokens only:

```tsx
<RevealOnScroll>
  <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-500/[0.08] blur-[120px] pointer-events-none" />
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center relative">
      <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-4">
        {post.ctaTitle || (isEN ? 'Ready to automate your procurement?' : 'Gotowy na automatyzację procurement?')}
      </h2>
      <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
        {post.ctaSubtitle || (isEN ? 'Try Procurea free — get AI-sourced supplier shortlists in minutes, not weeks.' : 'Wypróbuj Procurea za darmo...')}
      </p>
      <a
        href={appendUtm(APP_URL, `blog_${post.slug}`)}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-glow-primary hover:bg-brand-600 hover:shadow-glow-primary-hover transition-all duration-200"
      >
        {isEN ? 'Try Procurea free' : 'Wypróbuj Procurea za darmo'}
      </a>
    </div>
  </section>
</RevealOnScroll>
```

Key change from current: use `brand-500` instead of `blue-600`, use `shadow-glow-primary`.

---

## 10. Related content (3-card grid)

Full spec in `component-library.md` → `RelatedContentSection`.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│    Continue your journey                                 │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐                     │
│  │Card 1  │  │Card 2  │  │Card 3  │                     │
│  │Related │  │Related │  │Resource│                     │
│  └────────┘  └────────┘  └────────┘                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Mix of related posts (2) + 1 lead magnet. Uses same `ContentCard` as hub grid.

---

## 11. Newsletter signup (dark gradient)

Same component as Content Hub (section 8 there) — `NewsletterSignupInline variant="dark"` wrapped in dark section.

---

## 12. Full ASCII mockup — Desktop (≥1024px)

```
╔══════════════════════════════════════════════════════════════════════╗
║ [Navbar]                                                             ║
╠══════════════════════════════════════════════════════════════════════╣
║ Resources / Blog / What is AI Sourcing and Why It Matters in 2026  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   [SOURCING]  ·  5 min read                                         ║
║                                                                      ║
║   What is AI Sourcing and                                           ║
║   Why It Matters in 2026                                            ║
║                                                                      ║
║   Manual supplier sourcing is slow, expensive, and limited          ║
║   by language barriers. Here is how AI changes the game.            ║
║                                                                      ║
║   ● Anna Kowalska · Head of Content · Apr 10, 2026                  ║
║                                                                      ║
║   ┌────────────────────────────────────────────────────────────┐    ║
║   │ [Hero image — aspect-16/9 — gradient if no image]          │    ║
║   └────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ ┌─────────────┐  ┌─────────────────────────────────────────────┐    ║
║ │ ON THIS PAGE│  │                                             │    ║
║ │             │  │  Lead paragraph — text-lg font-medium       │    ║
║ │● Intro      │  │  Manual supplier sourcing has traditionally │    ║
║ │ What is AI  │  │  been one of the most time-consuming tasks..│    ║
║ │ Benefits    │  │                                             │    ║
║ │ Who uses it │  │  ## What is AI sourcing                     │    ║
║ │ Conclusion  │  │                                             │    ║
║ │             │  │  AI sourcing refers to the use of AI...     │    ║
║ │ ────        │  │                                             │    ║
║ │             │  │  Three paragraphs of body copy max-w-[65ch] │    ║
║ │ SHARE       │  │                                             │    ║
║ │ [X] [Li]    │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │    ║
║ │ [Copy link] │  │  │  200+    │ │ 40h → 1h │ │    26    │    │    ║
║ │             │  │  │suppliers │ │  faster  │ │languages │    │    ║
║ │ sticky      │  │  └──────────┘ └──────────┘ └──────────┘    │    ║
║ │ top-28      │  │                                             │    ║
║ └─────────────┘  │  ┌─────────────────────────────────────┐   │    ║
║  w-60            │  │ [Inline CTA — lead magnet]          │   │    ║
║                  │  │ Free template: RFQ Comparison       │   │    ║
║                  │  │ [Download free →]                   │   │    ║
║                  │  └─────────────────────────────────────┘   │    ║
║                  │                                             │    ║
║                  │  ## Benefits of AI sourcing                 │    ║
║                  │                                             │    ║
║                  │  The benefits are substantial...            │    ║
║                  │                                             │    ║
║                  │  ┌─────────────────────────────────────┐   │    ║
║                  │  │ Comparison table                    │   │    ║
║                  │  │ Manual vs. AI across 5 criteria     │   │    ║
║                  │  └─────────────────────────────────────┘   │    ║
║                  │                                             │    ║
║                  │  ## Who is using AI sourcing?              │    ║
║                  │                                             │    ║
║                  │  Forward-thinking procurement teams...      │    ║
║                  │                                             │    ║
║                  │  ┃ "We had written off 6 weeks..."          │    ║
║                  │  ┃ — Head of Strategic Sourcing             │    ║
║                  │                                             │    ║
║                  │  ## Conclusion                              │    ║
║                  │                                             │    ║
║                  │  The technology is no longer experimental..│    ║
║                  │                                             │    ║
║                  └─────────────────────────────────────────────┘    ║
║                    max-w-3xl, prose prose-lg                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ┌────────────────────────────────────────────────────────────┐    ║
║   │ [AK avatar]  Anna Kowalska                                  │   ║
║   │              Head of Content · Procurea                     │   ║
║   │                                                             │   ║
║   │  Anna spent 8 years in procurement at Schneider Electric... │   ║
║   │                                                             │   ║
║   │  [LinkedIn] [Follow on X]                                   │   ║
║   └────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║ [DARK CTA section — slate-900 → slate-950]                          ║
║                                                                      ║
║         Ready to automate your procurement?                         ║
║                                                                      ║
║    Try Procurea free — get AI-sourced supplier shortlists           ║
║                                                                      ║
║                 [ Try Procurea free → ]                             ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   Continue your journey                                             ║
║                                                                      ║
║   ┌──────────┐  ┌──────────┐  ┌──────────┐                          ║
║   │[related] │  │[related] │  │[magnet]  │                          ║
║   │          │  │          │  │          │                          ║
║   └──────────┘  └──────────┘  └──────────┘                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║ [Newsletter CTA — dark]                                             ║
╠══════════════════════════════════════════════════════════════════════╣
║ [Footer]                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 13. Mobile mockup (<1024px)

```
╔══════════════════════════╗
║ [☰][Logo]   [Try free]   ║
╠══════════════════════════╣
║ Resources/Blog/Title...  ║
╠══════════════════════════╣
║                          ║
║ [SOURCING] · 5 min       ║
║                          ║
║ What is AI Sourcing      ║
║ and Why It Matters       ║
║                          ║
║ Excerpt dek copy...      ║
║                          ║
║ ● Anna K. · Apr 10       ║
║                          ║
║ ┌──────────────────────┐ ║
║ │ [Hero image]         │ ║
║ └──────────────────────┘ ║
║                          ║
║ ┌──────────────────────┐ ║
║ │ ▼ Jump to section    │ ║ ◄ TOC drawer trigger
║ └──────────────────────┘ ║
║                          ║
║  Lead paragraph...       ║
║                          ║
║  ## Section              ║
║                          ║
║  Body copy full-width    ║
║  (max-w-none on mobile)  ║
║                          ║
║  ┌──────┐┌──────┐        ║
║  │ stat ││ stat │        ║ ◄ pills wrap 2-col
║  └──────┘└──────┘        ║
║  ┌──────┐┌──────┐        ║
║  │ stat ││ stat │        ║
║  └──────┘└──────┘        ║
║                          ║
║  [Inline CTA]            ║
║                          ║
║  ## Section              ║
║  ...                     ║
║                          ║
║  ┃ Pull quote            ║
║  ┃ — Attribution         ║
║                          ║
║                          ║
║ [AuthorByline full]      ║
║                          ║
║ [Primary CTA dark]       ║
║                          ║
║ Continue your journey    ║
║ ┌──────────────────────┐ ║
║ │[card 1]              │ ║ ◄ stack 1-col
║ └──────────────────────┘ ║
║ ┌──────────────────────┐ ║
║ │[card 2]              │ ║
║ └──────────────────────┘ ║
║                          ║
║ [Newsletter]             ║
║ [Footer]                 ║
╚══════════════════════════╝
```

---

## 14. Sticky TOC behavior (desktop)

- `position: sticky; top: 112px` (below sticky navbar + 48px breathing room).
- On scroll, active H2 is visually highlighted (border-left accent + color change) via IntersectionObserver.
- Fade/collapse items below active for visual hierarchy: active item full opacity, adjacent 100%, others 60%.
- Auto-generated from article H2 headings — don't require author to manually list sections.

Full component spec in `component-library.md` → `TableOfContents`.

---

## 15. Mobile TOC drawer

- Trigger: "Jump to section" pill button at top of body, shown only when `toc.length >= 3`.
- On tap: slide up bottom sheet (80vh max) using Radix Dialog or Framer motion drawer.
- Sheet contains full TOC + close button.
- Tapping a section: close drawer + smooth-scroll to anchor (offset -96px for sticky nav).

---

## 16. Animation choreography

- **Breadcrumb + hero**: `fade-up` on mount, 0.5s duration, no delay.
- **Article body**: no entrance animation (content should appear fast — reading is the goal).
- **Inline CTAs, tables, stat pills, pull quotes**: wrap each in `RevealOnScroll` for fade-up on scroll into view.
- **Sticky TOC**: active section indicator animates via `layoutId="toc-active"` (Framer shared layout) for smooth morph.
- **Related content grid**: RevealOnScroll wrapper with 0.08s stagger.

---

## 17. Accessibility

- Article H1 present and unique (only one per page).
- All H2 and H3 auto-get `id` slugs (via `rehype-slug` if using MDX, or manual if plain content).
- TOC links focus-visible and keyboard-navigable.
- Pull quotes wrapped in `<figure><blockquote>` with proper `<figcaption>`.
- Images: `alt=""` for decorative, descriptive alt for content imagery (hero image).
- Skip link in navbar targets `#main-content` which sits on `<article>`.
- Color contrast ≥4.5:1 for all body text (brand-500 on white = 5.2:1 ✓, slate-700 on white = 11.3:1 ✓).
- Share buttons: `aria-label="Share on Twitter"` etc. — icon-only with hidden text.

---

## 18. SEO requirements

- `<title>` = `{post.title} — Procurea Blog`
- `<meta name="description">` = `{post.excerpt}` (trimmed to 155 chars)
- Open Graph tags via RouteMeta component.
- JSON-LD `Article` schema with `author`, `datePublished`, `headline`, `image`.
- Canonical tag to `https://procurea.io/blog/:slug` (EN) or `https://procurea.pl/blog/:slug` (PL).
- Hreflang link to PL/EN sibling post when available.

---

## 19. Data dependencies

- Extend `BlogPost` interface in `content/blog.ts` with:
  ```ts
  interface BlogPost {
    // ... existing
    author: { id: string; name: string; role: string; avatar: string; bio?: string }
    pillar: 'sourcing' | 'supplier-management' | 'nearshoring' | 'automation' | 'benchmarks'
    heroImage?: string
    toc?: Array<{ id: string; text: string; level: 2 | 3 }>  // auto-generated OR explicit
    relatedResources?: string[]  // resource slugs
    relatedPosts?: string[]       // blog slugs (fallback to pillar match)
    ctaMode?: 'soft' | 'aggressive'
    ctaTitle?: string
    ctaSubtitle?: string
  }
  ```
- Author registry: new file `content/authors.ts` with 2-3 authors initially (CEO, Head of Content, guest).
- For rendering: article body currently `\n\n`-split plain paragraphs. Upgrade to MDX for tables/callouts — recommend `next-mdx-remote` or `@mdx-js/rollup` for Vite.
