# Content Hub Page — Design Specification

**Route**: `/resources` (EN at procurea.io) · `/materialy` (PL at procurea.pl)
**Component file**: `landing/src/pages/ContentHubPage.tsx` (new)
**Purpose**: Unified, filterable grid of all content (blog, guides, case studies), mimicking procure.ai/resources but adapted to Procurea brand.

---

## 1. Information architecture

The page is composed of 7 vertical regions:

```
┌───────────────────────────────────────────────────────┐
│ 1. Navbar (global, fixed)                             │
├───────────────────────────────────────────────────────┤
│ 2. Hero section                                       │
│    – Eyebrow, H1, subhead, inline newsletter form     │
│    – Mesh gradient background + AnimatedGrid          │
├───────────────────────────────────────────────────────┤
│ 3. Sticky filter bar                                  │
│    – Primary: Type pills (All / Blog / Guides / Case) │
│    – Secondary (collapsible): Pillar, Persona, Funnel │
├───────────────────────────────────────────────────────┤
│ 4. Featured row (2 items, full width, asymmetric)     │
│    – Visible ONLY when filter = "All"                 │
├───────────────────────────────────────────────────────┤
│ 5. Grid (3-col desktop / 2-col tablet / 1-col mobile) │
│    – Cards ordered by date desc                       │
├───────────────────────────────────────────────────────┤
│ 6. Newsletter CTA section (full-width, gradient bg)   │
├───────────────────────────────────────────────────────┤
│ 7. Footer (global)                                    │
└───────────────────────────────────────────────────────┘
```

**Why featured row is only in "All" view**: when user has filtered to Blog or Case Studies specifically, they signalled intent — jump straight to the grid. In "All" view, featured row acts as a recommendation layer.

---

## 2. Hero section

### Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             [RESOURCES / MATERIAŁY]   ◄── eyebrow   │
│                                                     │
│     Procurement insights, guides,                   │
│     and case studies                    ◄── H1      │
│                                                     │
│     Practical resources for procurement             │
│     teams — written by practitioners,               │
│     not marketers.                      ◄── subhead │
│                                                     │
│   ┌───────────────────────────┬──────────────────┐  │
│   │ your@email.com            │  Subscribe  →    │  │ ◄── inline form
│   └───────────────────────────┴──────────────────┘  │
│     Weekly digest · No spam · Unsubscribe anytime   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tailwind classes

```tsx
<section className="relative pt-32 pb-20 bg-gradient-to-b from-white to-slate-50/50 bg-mesh-gradient overflow-hidden">
  {/* Ambient blob */}
  <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-[120px] pointer-events-none" />

  {/* AnimatedGrid overlay */}
  <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-40" />

  <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-brand-500 mb-4">
      {isEN ? 'RESOURCES' : 'MATERIAŁY'}
    </span>
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-extra-tight mb-5">
      {isEN ? 'Procurement insights, guides, and case studies' : 'Wiedza, przewodniki i case studies'}
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
      {subheadCopy}
    </p>
    <NewsletterSignupInline variant="hero" />
  </div>
</section>
```

**Key rules**:
- H1 uses `font-display` (Inter Tight) with `tracking-extra-tight` for the brand's wordmark feel.
- Newsletter form is inline (1-field + button), NOT gated modal — matches procure.ai low-friction pattern.
- Max width `max-w-4xl` (896px) — narrower than typical 7xl to keep hero focused.
- Eyebrow uses `text-brand-500` (not gray) — stronger brand anchor than generic gray eyebrow.

---

## 3. Sticky filter bar

### Structure

```
┌──────────────────────────────────────────────────────────────┐
│  [All (23)] [Blog (14)] [Guides (5)] [Case Studies (4)]     │ ◄── primary
│                                     [ Filters ⌄ ]            │ ◄── secondary toggle
├──────────────────────────────────────────────────────────────┤ ← expands when open
│  Pillar:   [All] [Sourcing] [Supplier Mgmt] [Nearshoring]   │
│  Persona:  [All] [Head of Procurement] [Buyer] [Founder]    │
│  Stage:    [All] [TOFU] [MOFU] [BOFU]                       │
└──────────────────────────────────────────────────────────────┘
```

### Behavior

- **Sticky**: `sticky top-[64px]` below navbar, `z-30`, `backdrop-blur-xl bg-white/80 border-b border-black/[0.06]`.
- **Primary pills always visible**. Active pill: `bg-brand-500 text-white shadow-premium`. Inactive: `bg-white border border-black/[0.08] text-slate-700 hover:border-brand-500/40`.
- **Secondary filters collapsed by default** — click "Filters" button to expand (height animation). Stored in URL as query params (`?type=blog&pillar=sourcing`) so filter state survives refresh/share.
- **Count badges** per type pill: `(14)` after label. When filter active, pill shows filtered count.
- **Active filter indicator**: dot on "Filters" button when secondary filter active.

### Tailwind classes

```tsx
<div className="sticky top-16 z-30 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 overflow-x-auto scrollbar-none">
    {/* Primary pills */}
    <div className="flex items-center gap-2 shrink-0">
      {contentTypes.map(type => (
        <button
          key={type.key}
          onClick={() => setActiveType(type.key)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap",
            activeType === type.key
              ? "bg-brand-500 text-white shadow-premium"
              : "bg-white border border-black/[0.08] text-slate-700 hover:border-brand-500/40 hover:bg-slate-50"
          )}
          aria-pressed={activeType === type.key}
        >
          {type.label}
          <span className={clsx(
            "text-xs font-medium rounded-full px-1.5 py-0.5",
            activeType === type.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          )}>
            {counts[type.key]}
          </span>
        </button>
      ))}
    </div>

    {/* Secondary toggle, pushed right */}
    <div className="flex-1" />
    <button
      onClick={() => setShowSecondary(!showSecondary)}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-500 transition-colors"
      aria-expanded={showSecondary}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {isEN ? 'Filters' : 'Filtry'}
      <ChevronDown className={clsx("h-4 w-4 transition-transform", showSecondary && "rotate-180")} />
      {hasActiveSecondary && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
    </button>
  </div>

  {/* Secondary filter panel (collapsible) */}
  <AnimatePresence>
    {showSecondary && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="border-t border-black/[0.04] bg-slate-50/50 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar / Persona / Funnel filter rows — see CategoryFilter spec */}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

## 4. Featured row (shown only when filter = "All")

### Layout: asymmetric 2-column (60/40 split on desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐│
│  │ [FEATURED · Case Study]     │ │ [FEATURED · Blog]       ││
│  │                             │ │                         ││
│  │  Large hero image           │ │  Image                  ││
│  │  (gradient placeholder)     │ │                         ││
│  │  aspect-[16/9]              │ │  aspect-[16/10]         ││
│  │                             │ │                         ││
│  │  [Emerald badge]            │ │  [Teal badge]           ││
│  │  Large title (text-3xl)     │ │  Title (text-xl)        ││
│  │  Excerpt                    │ │  Excerpt                ││
│  │  Apr 18 · 8 min read        │ │  Apr 10 · 5 min read    ││
│  │  Read case study →          │ │  Read article →         ││
│  └─────────────────────────────┘ └─────────────────────────┘│
│       col-span-12 md:col-span-7      col-span-12 md:col-span-5
└─────────────────────────────────────────────────────────────┘
```

**Selection logic**: pick the 1 newest case study + 1 newest blog post (or 1 newest resource if no fresh case study). Set `isFeatured: true` in `contentHub.ts` for these two items; they get rendered in this row AND suppressed from main grid below.

### Tailwind

```tsx
<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
  <RevealOnScroll>
    <div className="grid grid-cols-12 gap-6">
      {/* Main feature (wider) */}
      <Link to={featured[0].href} className="group col-span-12 md:col-span-7 rounded-2xl overflow-hidden border border-black/[0.08] bg-white hover:shadow-hover-card hover:-translate-y-0.5 transition-all duration-300">
        <div className="aspect-[16/9] bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
          {/* optional heroImage OR gradient */}
          <div className="absolute inset-0 bg-mesh-gradient opacity-50 mix-blend-overlay" />
        </div>
        <div className="p-8">
          <CategoryBadge type={featured[0].type} color="emerald" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold font-display tracking-tight leading-tight group-hover:text-brand-500 transition-colors">
            {featured[0].title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed line-clamp-2">{featured[0].excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={featured[0].date}>{formatDate(featured[0].date)}</time>
            {featured[0].readingTime && <>· <span>{featured[0].readingTime}</span></>}
          </div>
        </div>
      </Link>

      {/* Secondary feature */}
      <Link to={featured[1].href} className="group col-span-12 md:col-span-5 rounded-2xl overflow-hidden border border-black/[0.08] bg-white hover:shadow-hover-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
        {/* ... similar, smaller */}
      </Link>
    </div>
  </RevealOnScroll>
</section>
```

---

## 5. Main grid

### Layout: responsive 3/2/1 columns

```
Desktop (lg: ≥1024px)                 Tablet (md: 768-1023)        Mobile (<768)
┌────────┬────────┬────────┐          ┌────────┬────────┐          ┌────────┐
│ Card 1 │ Card 2 │ Card 3 │          │ Card 1 │ Card 2 │          │ Card 1 │
├────────┼────────┼────────┤          ├────────┼────────┤          ├────────┤
│ Card 4 │ Card 5 │ Card 6 │          │ Card 3 │ Card 4 │          │ Card 2 │
├────────┼────────┼────────┤          ├────────┼────────┤          ├────────┤
│ Card 7 │ Card 8 │ Card 9 │          │ Card 5 │ Card 6 │          │ Card 3 │
└────────┴────────┴────────┘          └────────┴────────┘          └────────┘

gap-6 (24px)                          gap-5 (20px)                  gap-5 (20px)
```

### Card anatomy (ContentCard component — full spec in component-library.md)

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │                              │    │ ← thumbnail (aspect-[16/10])
│  │   Gradient or image          │    │   – teal gradient for blog
│  │                              │    │   – amber for resources
│  └──────────────────────────────┘    │   – emerald for case studies
│                                      │
│  [Teal badge: BLOG]  [Category]     │ ← category row
│                                      │
│  Title — max 2 lines,                │
│  line-clamp-2, group-hover:text-     │ ← title (text-lg, semibold)
│  brand-500                           │
│                                      │
│  Excerpt — max 3 lines,              │
│  line-clamp-3, text-sm text-muted    │ ← excerpt
│                                      │
│  ─────────────────────────────────── │ ← divider (border-t border-black/[0.05])
│                                      │
│  Apr 18, 2026 · 5 min    Read →     │ ← meta + CTA
└──────────────────────────────────────┘
```

### Tailwind

```tsx
<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
  {visibleItems.length > 0 ? (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {visibleItems.map(item => (
        <motion.div
          key={`${item.type}-${item.slug}`}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          layout
        >
          <ContentCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  ) : (
    <EmptyState activeFilters={activeFilters} onReset={resetFilters} />
  )}
</section>
```

---

## 6. Empty state

Shown when filter combination returns 0 items.

```
┌─────────────────────────────────────────┐
│                                         │
│              🔍 (soft gray icon)        │
│                                         │
│    No resources match your filters      │
│                                         │
│    Try removing a filter, or browse     │
│    all resources.                       │
│                                         │
│      [ Clear filters ]                  │
│                                         │
└─────────────────────────────────────────┘
```

```tsx
<div className="text-center py-20 px-4">
  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-5">
    <Search className="h-6 w-6" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-semibold mb-2">{isEN ? 'No resources match your filters' : 'Brak materiałów spełniających kryteria'}</h3>
  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
    {isEN ? 'Try removing a filter, or browse all resources.' : 'Spróbuj usunąć filtr lub zobacz wszystkie materiały.'}
  </p>
  <button
    onClick={resetFilters}
    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
  >
    {isEN ? 'Clear filters' : 'Wyczyść filtry'}
  </button>
</div>
```

---

## 7. Loading state

Since content is static (imported from `content/*.ts`), there is NO true loading state. However, for filter transitions (if we later add API), use shimmer skeleton:

```tsx
{/* Skeleton card — only if async */}
<div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden animate-pulse">
  <div className="aspect-[16/10] bg-slate-200 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%] animate-shimmer" />
  <div className="p-6 space-y-3">
    <div className="h-4 w-20 rounded bg-slate-200" />
    <div className="h-5 w-3/4 rounded bg-slate-200" />
    <div className="h-4 w-full rounded bg-slate-200" />
    <div className="h-4 w-5/6 rounded bg-slate-200" />
  </div>
</div>
```

**Reality check**: since hub data is static, don't over-engineer — use Framer `AnimatePresence + layout` for filter changes (smooth re-order), no true loading state needed.

---

## 8. Newsletter CTA section (after grid)

Full-width dark section, mirrors the dark CTA already in BlogPostPage.

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│          [bg: bg-gradient-to-br from-slate-900 to-slate-950]│
│          [ambient blobs: brand-500/8, amber/6]             │
│                                                            │
│                                                            │
│           Weekly procurement digest,                       │
│           delivered every Tuesday                          │
│                                                            │
│        1,200+ procurement leaders read it.                 │
│                  Join them.                                │
│                                                            │
│     ┌────────────────────────────┬─────────────────┐      │
│     │ your@email.com             │ Subscribe →     │      │
│     └────────────────────────────┴─────────────────┘      │
│                                                            │
│           [trust line] No spam. 1-click unsubscribe.      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```tsx
<section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-10 sm:p-14 md:p-16 text-center">
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-500/[0.08] blur-[120px] pointer-events-none" />
    <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-amber-400/[0.05] blur-[100px] pointer-events-none" />
    <h2 className="relative text-3xl sm:text-4xl font-bold font-display tracking-tight mb-3">
      {isEN ? 'Weekly procurement digest' : 'Cotygodniowy digest procurement'}
    </h2>
    <p className="relative text-white/70 mb-8 max-w-xl mx-auto">
      {isEN ? '1,200+ procurement leaders read it every Tuesday. Join them.' : '1200+ liderów procurement czyta go co wtorek.'}
    </p>
    <div className="relative max-w-md mx-auto">
      <NewsletterSignupInline variant="dark" />
    </div>
    <p className="relative mt-4 text-xs text-white/50">{isEN ? 'No spam. 1-click unsubscribe.' : 'Bez spamu. Wypis jednym klikiem.'}</p>
  </div>
</section>
```

---

## 9. Full ASCII mockup — Desktop (≥1024px)

```
╔════════════════════════════════════════════════════════════════════╗
║ [Navbar: Logo] [Features ▾] [Industries ▾] [Resources]  [Try free] ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║                      [RESOURCES]                                   ║
║                                                                    ║
║         Procurement insights, guides, and                          ║
║                 case studies                                       ║
║                                                                    ║
║      Practical resources for procurement teams —                   ║
║        written by practitioners, not marketers.                    ║
║                                                                    ║
║     ┌──────────────────────────┬─────────────────┐                 ║
║     │ your@email.com           │  Subscribe  →   │                 ║
║     └──────────────────────────┴─────────────────┘                 ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║ [All (23)] [Blog (14)] [Guides (5)] [Case Studies (4)]  [Filters⌄]║ ◄ sticky
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  ┌─────────────────────────────────┐ ┌──────────────────────────┐ ║
║  │ ████████ gradient ████████████  │ │ █████ gradient ████████  │ ║
║  │ aspect-16/9, emerald→teal       │ │ aspect-16/10, teal→blue  │ ║
║  │                                 │ │                          │ ║
║  │ [CASE STUDY] [Automotive]       │ │ [BLOG] [AI & Auto]       │ ║
║  │                                 │ │                          │ ║
║  │ How an Automotive OEM Found 8   │ │ What is AI Sourcing      │ ║
║  │ Qualified Suppliers in 5 Days   │ │ and Why It Matters       │ ║
║  │                                 │ │                          │ ║
║  │ Following a Chinese partner     │ │ Manual supplier sourcing │ ║
║  │ termination, this OEM...        │ │ is slow and expensive... │ ║
║  │                                 │ │                          │ ║
║  │ Apr 18 · 8 min read             │ │ Apr 10 · 5 min read      │ ║
║  └─────────────────────────────────┘ └──────────────────────────┘ ║
║                    col-span-7                      col-span-5      ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐                            ║
║  │[thumb]  │  │[thumb]  │  │[thumb]  │                            ║
║  │teal     │  │amber    │  │emerald  │                            ║
║  │         │  │         │  │         │                            ║
║  │[BLOG]   │  │[GUIDE]  │  │[CASE]   │                            ║
║  │         │  │         │  │         │                            ║
║  │Title    │  │Title    │  │Title    │                            ║
║  │over two │  │line     │  │line     │                            ║
║  │lines    │  │         │  │         │                            ║
║  │         │  │         │  │         │                            ║
║  │Excerpt  │  │Excerpt  │  │Excerpt  │                            ║
║  │3 lines  │  │3 lines  │  │3 lines  │                            ║
║  │max...   │  │max...   │  │max...   │                            ║
║  │─────────│  │─────────│  │─────────│                            ║
║  │date·min │→ │date·min │→ │date·min │→                           ║
║  └─────────┘  └─────────┘  └─────────┘                            ║
║                                                                    ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐                            ║
║  │[thumb]  │  │[thumb]  │  │[thumb]  │                            ║
║  │...      │  │...      │  │...      │                            ║
║  └─────────┘  └─────────┘  └─────────┘                            ║
║                                                                    ║
║                ... grid continues ...                              ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   ┌──────────────────────────────────────────────────────────┐    ║
║   │  [dark gradient: slate-900 → slate-950]                  │    ║
║   │                                                          │    ║
║   │         Weekly procurement digest                        │    ║
║   │                                                          │    ║
║   │    1,200+ leaders read it every Tuesday. Join them.      │    ║
║   │                                                          │    ║
║   │    ┌─────────────────────┬───────────────┐               │    ║
║   │    │ your@email.com      │ Subscribe →   │               │    ║
║   │    └─────────────────────┴───────────────┘               │    ║
║   │                                                          │    ║
║   │         No spam. 1-click unsubscribe.                    │    ║
║   └──────────────────────────────────────────────────────────┘    ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║ [Footer: logo, nav cols, legal, social]                           ║
╚════════════════════════════════════════════════════════════════════╝
```

## 10. Mobile mockup (<768px)

```
╔══════════════════════════╗
║ [☰] [Logo]    [Try free] ║
╠══════════════════════════╣
║                          ║
║       [RESOURCES]        ║
║                          ║
║    Procurement           ║
║    insights, guides,     ║
║    and case studies      ║
║                          ║
║    Practical resources   ║
║    for procurement       ║
║    teams.                ║
║                          ║
║  ┌────────────────────┐  ║
║  │ your@email.com     │  ║
║  └────────────────────┘  ║
║  ┌────────────────────┐  ║
║  │  Subscribe  →      │  ║
║  └────────────────────┘  ║
║                          ║
╠══════════════════════════╣
║ [sticky filter row]     ◄─ horizontally scrollable
║ [All][Blog][Guides][Case]║
╠══════════════════════════╣
║                          ║
║  ┌────────────────────┐  ║
║  │ ████ thumbnail ██  │  ║
║  │                    │  ║
║  │ [BADGE] [category] │  ║
║  │                    │  ║
║  │ Title over two     │  ║
║  │ lines              │  ║
║  │                    │  ║
║  │ Excerpt            │  ║
║  │ ───────────────    │  ║
║  │ date · min  Read → │  ║
║  └────────────────────┘  ║
║                          ║
║  ┌────────────────────┐  ║
║  │ ...                │  ║
║  └────────────────────┘  ║
║                          ║
║  (cards stack 1-col)     ║
║                          ║
╠══════════════════════════╣
║ [Newsletter CTA — dark]  ║
╠══════════════════════════╣
║ [Footer]                 ║
╚══════════════════════════╝
```

---

## 11. Animation choreography

- **Hero**: fade-up on mount (0.6s, ease-out). NO entrance delay — landing fast.
- **Filter bar**: no entrance animation (sticky from scroll, always present).
- **Featured row**: `RevealOnScroll` wrapper, cards fade-up with 0.1s stagger between main and secondary.
- **Grid cards**: Framer `motion.div` with `variants` + `staggerChildren: 0.06`. On filter change use `layout` prop for smooth re-order.
- **Card hover**: `hover:-translate-y-1 hover:shadow-hover-card` (Tailwind, 300ms ease). NO TiltCard — too distracting for a dense grid.
- **Newsletter CTA**: `RevealOnScroll` wrapper with `scale` prop.

---

## 12. Accessibility

- Filter pills: `role="group" aria-label="Content type filter"`, each pill `aria-pressed={active}`.
- Cards: whole card is `<Link>`, but ensure `aria-label` includes type + title so screen reader announces "Case Study: How an Automotive OEM..."
- Focus rings on pills and cards: `focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`.
- Filter bar sticky — ensure `skip to content` anchor in navbar still works.
- Keyboard: `Tab` cycles through pills, then into secondary toggle, then grid cards in DOM order.
- Empty state: `role="status" aria-live="polite"` so screen readers announce when filter returns 0.

---

## 13. Tech notes

- **Filter state in URL**: use `useSearchParams` from react-router-dom. Default `?type=all`. On change, `setSearchParams({ type: 'blog' })`. This makes filter state shareable via link.
- **Debounce**: no search input, so no debounce needed on filter changes.
- **List virtualization**: NOT needed at current scale (<50 items). Add later if library exceeds 100+ items.
- **JSON-LD**: page should include `CollectionPage` schema with `hasPart` pointing to each item (for SEO).

---

## 14. Data dependencies

- `getAllHubItems()` from `content/contentHub.ts` — already exists.
- `filterHubItems()` already exists for type filter; extend for secondary filters (add `pillar`, `persona`, `funnel` fields to HubItem).
- Newsletter subscribe endpoint: TBD (likely Resend + backend route `/api/newsletter/subscribe`). For launch, can be stub that logs to console + always returns success.
