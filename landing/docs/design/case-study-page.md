# Case Study Page — Design Specification

**Route**: `/case-studies/:slug` (EN) · `/case-studies/:slug` (PL)
**Component file**: `landing/src/pages/CaseStudyPage.tsx` (new)
**Purpose**: Story-driven case study page with strong upfront stats, narrative structure (Challenge → Solution → Results), and cross-links to features used.

---

## 1. Information architecture

```
┌──────────────────────────────────────────────────────┐
│ 1. Navbar (global)                                   │
├──────────────────────────────────────────────────────┤
│ 2. Breadcrumb (Resources › Case Studies › Slug)      │
├──────────────────────────────────────────────────────┤
│ 3. Hero                                              │
│    – Industry badge                                  │
│    – H1 (result-focused)                             │
│    – Excerpt                                         │
│    – Anonymization label (subtle)                    │
│    – Stat pills row (3-4 hero metrics)               │
├──────────────────────────────────────────────────────┤
│ 4. Challenge → Solution → Results narrative          │
│    – 3 scroll sections OR 3 cards (decision below)   │
├──────────────────────────────────────────────────────┤
│ 5. Pull quote (styled testimonial, large)            │
├──────────────────────────────────────────────────────┤
│ 6. Features used section                             │
│    – Grid of 3-4 feature cards → link to Feature pg │
├──────────────────────────────────────────────────────┤
│ 7. Results deep-dive (optional metrics/charts)       │
├──────────────────────────────────────────────────────┤
│ 8. Related case studies (2-3 cards)                  │
├──────────────────────────────────────────────────────┤
│ 9. Related blog posts (2-3 cards)                    │
├──────────────────────────────────────────────────────┤
│ 10. Primary CTA (trial or demo)                      │
├──────────────────────────────────────────────────────┤
│ 11. Footer                                           │
└──────────────────────────────────────────────────────┘
```

**Decision: Challenge/Solution/Results as scroll sections (NOT cards)**. Why: cards feel transactional ("feature list"), but case studies are stories. Scroll sections with vertical rhythm create momentum. Each section is visually distinct (alternating backgrounds).

---

## 2. Hero

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      [🏭 AUTOMOTIVE MANUFACTURING]         ← industry badge│
│                                                             │
│     How an Automotive OEM Found                             │
│     8 Qualified Suppliers in 5 Days                         │
│     (Instead of 6 Weeks)                                    │
│                                                             │
│     Following the termination of a critical Chinese        │
│     partner, a European automotive OEM used Procurea       │
│     to build a diversified supplier base in days.          │
│                                                             │
│     (anonymized from beta cohort)                           │
│                                                             │
│     ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│     │   8    │ │ 5 days │ │6 weeks │ │3 countries           │
│     │qualified│ │sourcing│ │saved   │ │supplier│            │
│     │suppliers│ │  time  │ │vs manual│ │coverage│            │
│     └────────┘ └────────┘ └────────┘ └────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tailwind

```tsx
<section className="relative pt-28 pb-16 bg-gradient-to-b from-emerald-50/40 via-white to-white overflow-hidden">
  {/* Ambient gradient blobs */}
  <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.08] blur-[120px] pointer-events-none" />
  <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/[0.06] blur-[120px] pointer-events-none" />

  <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    {/* Industry badge */}
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-5">
      <Factory className="h-3.5 w-3.5" />
      {caseStudy.industryLabel}
    </div>

    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-extra-tight leading-[1.05] mb-5 max-w-4xl">
      {caseStudy.title}
    </h1>

    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
      {caseStudy.excerpt}
    </p>

    {/* Anonymization label — subtle */}
    <p className="text-xs text-slate-500 italic mb-10">
      {isEN ? 'Anonymized from beta cohort' : 'Anonimowe z beta cohort'}
    </p>

    {/* Stat pills row */}
    <StatPillsRow stats={caseStudy.stats} theme="emerald" />
  </div>
</section>
```

---

## 3. Stat pills row (hero)

Full component spec in `component-library.md` → `StatPillsRow`. Desktop: horizontal row of 3-4 pills. Mobile: 2x2 grid.

### Visual

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│            │  │            │  │            │  │            │
│     8      │  │  5 days    │  │  6 weeks   │  │ 3 countries│
│            │  │            │  │            │  │            │
│ qualified  │  │  sourcing  │  │   saved    │  │  supplier  │
│ suppliers  │  │    time    │  │ vs manual  │  │  coverage  │
│            │  │            │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

### Tailwind

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {stats.map((stat, i) => (
    <RevealOnScroll key={i} delay={i * 0.08}>
      <div className="rounded-2xl bg-white border border-emerald-200/60 shadow-premium p-5 md:p-6 text-center">
        <div className="text-3xl md:text-4xl font-bold font-display tracking-extra-tight text-emerald-700 mb-1">
          {stat.value}
        </div>
        <div className="text-xs md:text-sm text-slate-600 leading-tight">
          {stat.label}
        </div>
      </div>
    </RevealOnScroll>
  ))}
</div>
```

**Theme variants** via prop (`theme: 'emerald' | 'brand' | 'amber'`):
- emerald: case study hero (border-emerald-200, text-emerald-700)
- brand: feature page hero (border-brand-200, text-brand-700)
- amber: resource stats (border-amber-200, text-amber-700)

---

## 4. Challenge → Solution → Results narrative (scroll sections)

Three vertical sections with alternating backgrounds for visual rhythm.

### Layout

```
╔══════════════════════════════════════════════════════════════╗
║ Section 1: CHALLENGE (bg-white)                             ║
║                                                              ║
║  [01] THE CHALLENGE                                         ║
║                                                              ║
║  Supply chain crisis                                        ║
║                                                              ║
║  When their primary Chinese tier-2 supplier for...          ║
║  Production lines would stop within 45 days without         ║
║  alternative suppliers qualified. Their procurement team    ║
║  estimated 6-8 weeks for traditional sourcing...            ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║ Section 2: SOLUTION (bg-slate-50/50 bg-mesh-gradient)      ║
║                                                              ║
║  [02] THE SOLUTION                                          ║
║                                                              ║
║  AI sourcing across 3 countries in hours                    ║
║                                                              ║
║  Using Procurea's AI sourcing, the team defined their       ║
║  requirements (IATF 16949, injection molding capacity...)   ║
║                                                              ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ [Feature callout: AI Sourcing — step 1]             │    ║
║  │ Identified 47 candidate suppliers in 4 hours        │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                              ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ [Feature callout: Multilingual Outreach — step 2]   │    ║
║  │ RFQs sent in Polish, German, and Turkish            │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║ Section 3: RESULTS (bg-emerald-50/30)                       ║
║                                                              ║
║  [03] THE RESULTS                                           ║
║                                                              ║
║  From crisis to control in 5 days                           ║
║                                                              ║
║  Within 5 days: 8 suppliers qualified, site visits          ║
║  arranged with top 3, primary alternative signed within 21  ║
║  days — well before the production risk deadline.          ║
║                                                              ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐              ║
║  │  €2,000    │ │  21 days   │ │   90%      │              ║
║  │ total cost │ │ signed by  │ │ cost reduc │              ║
║  │            │ │            │ │ vs budget  │              ║
║  └────────────┘ └────────────┘ └────────────┘              ║
║                                                              ║
║  The OEM has since used Procurea for 4 additional           ║
║  sourcing projects.                                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Per-section structure

```tsx
<section className="py-16 md:py-24 bg-white">
  <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div className="inline-flex items-baseline gap-3 mb-5">
        <span className="text-6xl md:text-7xl font-bold font-display tracking-extra-tight text-brand-500/20 leading-none">01</span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">{isEN ? 'THE CHALLENGE' : 'WYZWANIE'}</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight leading-tight mb-5">
        {isEN ? 'Supply chain crisis' : 'Kryzys łańcucha dostaw'}
      </h2>

      <div className="prose prose-lg prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-700">
        <ReactMarkdown>{caseStudy.challenge}</ReactMarkdown>
      </div>
    </RevealOnScroll>
  </div>
</section>

<section className="py-16 md:py-24 bg-slate-50/60 bg-mesh-gradient">
  {/* ... [02] THE SOLUTION ... */}
  {/* Inside solution: embed feature callouts linking to feature pages */}
</section>

<section className="py-16 md:py-24 bg-emerald-50/30">
  {/* ... [03] THE RESULTS ... */}
  {/* Inside results: embed a second StatPillsRow (mini) with end-state metrics */}
</section>
```

- Giant ghost numerals `[01] [02] [03]` in `text-brand-500/20` — purely visual anchor, not semantic.
- Each section `max-w-3xl` for readable line length.
- Alternating backgrounds create scroll rhythm without feeling choppy.

---

## 5. Pull quote (styled testimonial)

Placed between Results section and Features Used section.

### Visual

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                     "                                        │
│                                                              │
│          We had written off 6 weeks to crisis.              │
│          Procurea gave us back 5 of them.                   │
│          The difference between panic and control.          │
│                                                              │
│                                                              │
│          ─────                                              │
│                                                              │
│          Head of Strategic Sourcing                         │
│          Tier-1 Automotive Supplier                         │
│                                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tailwind

```tsx
<section className="py-16 md:py-20 bg-white">
  <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
    <div className="absolute -top-4 left-2 sm:-left-4 text-8xl md:text-9xl font-serif text-brand-500/15 leading-none select-none pointer-events-none">"</div>

    <blockquote className="relative text-2xl sm:text-3xl md:text-4xl font-display font-semibold tracking-tight leading-[1.2] text-slate-900 mb-8 pl-6 sm:pl-12">
      {caseStudy.quote.text}
    </blockquote>

    <figcaption className="pl-6 sm:pl-12">
      <div className="h-0.5 w-12 bg-brand-500 mb-4" />
      <div className="font-semibold text-slate-900">{caseStudy.quote.author}</div>
      <div className="text-sm text-slate-600">{caseStudy.quote.role} · <span className="italic">{caseStudy.quote.company}</span></div>
    </figcaption>
  </figure>
</section>
```

---

## 6. Features used section

Grid of feature cards linking to individual feature pages. Reinforces the "how we got the results" + drives traffic to product pages.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  Features that made it work                  │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ [icon]     │  │ [icon]     │  │ [icon]     │             │
│  │ AI Sourcing│  │Multilingual│  │ Offer      │             │
│  │            │  │ Outreach   │  │ Comparison │             │
│  │ Find 200+  │  │ 26 lang    │  │ Weighted   │             │
│  │ suppliers  │  │ support    │  │ scoring    │             │
│  │            │  │            │  │            │             │
│  │ Learn → │  │ Learn →    │  │ Learn →    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tailwind

```tsx
<section className="py-16 md:py-20 bg-slate-50/60">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-center mb-10">
        {isEN ? 'Features that made it work' : 'Funkcje, które zadziałały'}
      </h2>
    </RevealOnScroll>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
      {features.map((feature, i) => (
        <RevealOnScroll key={feature.slug} delay={i * 0.08}>
          <Link
            to={pathFor(feature.pathKey)}
            className="group block rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-hover-card hover:-translate-y-1 transition-all duration-300"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-display tracking-tight mb-2 group-hover:text-brand-500 transition-colors">
              {feature.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{feature.shortDescription}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 group-hover:gap-2.5 transition-all">
              {isEN ? 'Learn more' : 'Dowiedz się więcej'}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </RevealOnScroll>
      ))}
    </div>
  </div>
</section>
```

Uses existing feature data from `content/features.ts` mapped via `caseStudy.featuresUsed[]` array of PathKey refs.

---

## 7. Related case studies + related blog posts

Two separate horizontal rows, each with 2-3 cards. Uses same `ContentCard` as hub.

```
┌───────────────────────────────────────────────────────────┐
│              More case studies                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │[case 1]  │  │[case 2]  │  │[case 3]  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
├───────────────────────────────────────────────────────────┤
│              Related reading                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │[blog 1]  │  │[blog 2]  │  │[blog 3]  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└───────────────────────────────────────────────────────────┘
```

---

## 8. Primary CTA (bottom)

Variant of the dark CTA pattern, but worded specifically for case-study readers: "Could your team save 5 weeks on the next crisis?"

```
┌────────────────────────────────────────────────────┐
│  [bg-gradient-to-br from-slate-900 to-slate-950]   │
│                                                    │
│     See how Procurea would work for your team     │
│                                                    │
│   Book a 30-min demo — we'll show you how AI      │
│   sourcing applies to your category and region.   │
│                                                    │
│         [ Book a demo → ]   [ Try free → ]         │
│                                                    │
└────────────────────────────────────────────────────┘
```

Two CTAs (demo + trial) on case study pages (BOFU). Demo first (primary), trial second (secondary).

```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
  <Link
    to={pathFor('contact') + '#calendar'}
    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-amber-950 px-6 py-3 text-base font-semibold hover:bg-amber-300 transition-colors"
  >
    {isEN ? 'Book a demo' : 'Umów demo'}
    <ArrowRight className="h-4 w-4" />
  </Link>
  <a
    href={appendUtm(APP_URL, `case_${caseStudy.slug}`)}
    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 text-white px-6 py-3 text-base font-semibold hover:bg-white/10 transition-colors"
  >
    {isEN ? 'Try free' : 'Wypróbuj za darmo'}
  </a>
</div>
```

---

## 9. Full ASCII mockup — Desktop (≥1024px)

```
╔══════════════════════════════════════════════════════════════════════╗
║ [Navbar]                                                             ║
╠══════════════════════════════════════════════════════════════════════╣
║ Resources / Case Studies / Automotive 8 Suppliers in 5 Days          ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-gradient-to-b from-emerald-50/40 to-white                        ║
║                                                                      ║
║  [🏭 AUTOMOTIVE MANUFACTURING]                                       ║
║                                                                      ║
║  How an Automotive OEM Found                                        ║
║  8 Qualified Suppliers in 5 Days                                    ║
║  (Instead of 6 Weeks)                                               ║
║                                                                      ║
║  Following the termination of a critical Chinese partner, a         ║
║  European automotive OEM used Procurea to build a diversified       ║
║  supplier base in days, not months.                                 ║
║                                                                      ║
║  (anonymized from beta cohort)                                      ║
║                                                                      ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                ║
║  │    8     │ │  5 days  │ │ 6 weeks  │ │3 countries│                ║
║  │qualified │ │ sourcing │ │   saved  │ │  supplier │                ║
║  │suppliers │ │   time   │ │vs manual │ │ coverage  │                ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘                ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-white                                                            ║
║                                                                      ║
║   01  THE CHALLENGE                                                 ║
║                                                                      ║
║   Supply chain crisis                                               ║
║                                                                      ║
║   When their primary Chinese tier-2 supplier for injection-molded  ║
║   housings gave 30-day notice of termination, the OEM faced a      ║
║   supply chain crisis. Production lines would stop within 45 days   ║
║   without alternative suppliers qualified...                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-slate-50/60 bg-mesh-gradient                                    ║
║                                                                      ║
║   02  THE SOLUTION                                                  ║
║                                                                      ║
║   AI sourcing across 3 countries in hours                           ║
║                                                                      ║
║   Using Procurea's AI sourcing, the team defined their             ║
║   requirements (IATF 16949, injection molding capacity 500k        ║
║   units/year, PA66 material expertise)...                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-emerald-50/30                                                   ║
║                                                                      ║
║   03  THE RESULTS                                                   ║
║                                                                      ║
║   From crisis to control in 5 days                                  ║
║                                                                      ║
║   Within 5 days: 8 suppliers qualified, site visits arranged...    ║
║                                                                      ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐                             ║
║  │ €2,000   │ │ 21 days  │ │  90% ↓   │                             ║
║  │total cost│ │ to sign  │ │vs budget │                             ║
║  └──────────┘ └──────────┘ └──────────┘                             ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-white                                                            ║
║                                                                      ║
║              "                                                       ║
║                                                                      ║
║     We had written off 6 weeks to crisis.                           ║
║     Procurea gave us back 5 of them.                                ║
║     The difference between panic and control.                       ║
║                                                                      ║
║     ────                                                             ║
║     Head of Strategic Sourcing                                      ║
║     Tier-1 Automotive Supplier · (anonymized)                       ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  bg-slate-50/60                                                     ║
║                                                                      ║
║              Features that made it work                              ║
║                                                                      ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                           ║
║  │[AI Srcg] │  │[Multi    │  │[Offer    │                           ║
║  │          │  │ Outreach]│  │ Compare] │                           ║
║  │Learn →   │  │Learn →   │  │Learn →   │                           ║
║  └──────────┘  └──────────┘  └──────────┘                           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║         More case studies                                            ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                           ║
║  │[related] │  │[related] │  │[related] │                           ║
║  └──────────┘  └──────────┘  └──────────┘                           ║
║                                                                      ║
║         Related reading                                              ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                           ║
║  │[blog]    │  │[blog]    │  │[blog]    │                           ║
║  └──────────┘  └──────────┘  └──────────┘                           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  [DARK CTA]                                                          ║
║                                                                      ║
║     See how Procurea would work for your team                       ║
║                                                                      ║
║   Book a 30-min demo — we'll show you how AI sourcing applies       ║
║   to your category and region.                                      ║
║                                                                      ║
║       [ Book a demo → ]    [ Try free ]                             ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║ [Footer]                                                             ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 10. Mobile mockup (<768px)

```
╔══════════════════════════╗
║ [Navbar]                 ║
╠══════════════════════════╣
║ Resources/CS/Automotive..║
╠══════════════════════════╣
║                          ║
║ [🏭 AUTOMOTIVE MFG]      ║
║                          ║
║ How an Automotive OEM    ║
║ Found 8 Qualified        ║
║ Suppliers in 5 Days      ║
║                          ║
║ Following termination... ║
║                          ║
║ (anonymized)             ║
║                          ║
║ ┌──────┐┌──────┐         ║
║ │  8   ││5 days│         ║ ← 2x2 grid
║ └──────┘└──────┘         ║
║ ┌──────┐┌──────┐         ║
║ │6 wks ││3 ctry│         ║
║ └──────┘└──────┘         ║
║                          ║
╠══════════════════════════╣
║                          ║
║  01 THE CHALLENGE        ║
║                          ║
║  Supply chain crisis     ║
║                          ║
║  When their primary...   ║
║                          ║
╠══════════════════════════╣
║  [bg-slate-50]           ║
║  02 THE SOLUTION         ║
║                          ║
║  AI sourcing across 3    ║
║  countries in hours      ║
║                          ║
║  Using Procurea's AI...  ║
║                          ║
╠══════════════════════════╣
║  [bg-emerald-50]         ║
║  03 THE RESULTS          ║
║                          ║
║  From crisis to control  ║
║                          ║
║  Within 5 days: 8...     ║
║                          ║
║  ┌──────┐┌──────┐        ║
║  │€2,000││21 dys│        ║
║  └──────┘└──────┘        ║
║                          ║
╠══════════════════════════╣
║                          ║
║      "                   ║
║  We had written off 6    ║
║  weeks to crisis.        ║
║  Procurea gave us back   ║
║  5 of them.              ║
║                          ║
║  ────                    ║
║  Head of Strategic Srcng ║
║                          ║
╠══════════════════════════╣
║  Features that made it   ║
║  work                    ║
║                          ║
║  ┌────────────────────┐  ║
║  │[AI Sourcing]       │  ║
║  └────────────────────┘  ║
║  ┌────────────────────┐  ║
║  │[Multi Outreach]    │  ║
║  └────────────────────┘  ║
║  ┌────────────────────┐  ║
║  │[Offer Compare]     │  ║
║  └────────────────────┘  ║
║                          ║
╠══════════════════════════╣
║  More case studies       ║
║  [stacked cards]         ║
║                          ║
║  Related reading         ║
║  [stacked cards]         ║
║                          ║
╠══════════════════════════╣
║  [Dark CTA]              ║
║  [Book demo]             ║
║  [Try free]              ║
╠══════════════════════════╣
║ [Footer]                 ║
╚══════════════════════════╝
```

---

## 11. Animation choreography

- Hero: fade-up on mount.
- Stat pills: stagger 0.08s per pill.
- Section 01/02/03 headers: giant numerals use `RevealOnScroll` with `scale` variant — slight zoom-in feel.
- Pull quote: fade-up + the giant quote mark has `animate-fade-in` delayed 0.3s after blockquote.
- Features grid: stagger 0.08s per card, `RevealOnScroll` wrappers.
- Related sections: `RevealOnScroll`.

---

## 12. Accessibility

- Stats: each pill has both value (big) and label (small) — use `aria-label="8 qualified suppliers"` on the wrapping element.
- Giant ghost numerals `[01]`: `aria-hidden="true"` since they're decorative.
- Pull quote: `<figure>` + `<blockquote>` + `<figcaption>`.
- Anonymization disclaimer: screen reader reads it as part of excerpt (no special markup needed, just keep it near the excerpt).
- Feature cards (grid): entire card is `<Link>`, `aria-label="Learn more about AI Sourcing"`.
- Color contrast: emerald-700 on white = 5.8:1 ✓.

---

## 13. SEO

- `<title>` = `{caseStudy.title} — Procurea Case Study`
- `<meta description>` = `{caseStudy.excerpt}` (trimmed 155 chars)
- JSON-LD `Article` schema with `articleSection="Case Study"`.
- Consider `FAQPage` schema if we add an FAQ section (not in v1).
- Hreflang to PL/EN sibling.

---

## 14. Data dependencies

- `CaseStudy` interface in `content/caseStudies.ts` — already exists and is well-modeled.
- Extend with optional fields for v1.5:
  ```ts
  interface CaseStudy {
    // ... existing
    heroImage?: string        // optional illustration
    solutionSteps?: Array<{   // optional feature callouts inside solution section
      featureKey: string
      label: string
    }>
    resultsStats?: Array<{    // optional second stat pill row in results
      value: string
      label: string
    }>
    keyTakeaways?: string[]   // optional bulleted takeaway list
  }
  ```
- Feature lookup: map `caseStudy.featuresUsed[]` (PathKey refs) to `content/features.ts` entries via PathKey matching.

---

## 15. Content rules for case study authors

- **Never name the customer** unless explicit written permission. Default to "European automotive OEM", "Polish real estate developer", etc.
- **Stat pills must be real numbers**. If a metric is fuzzy ("much faster"), don't use it as a stat pill — move to prose.
- **Quote rules**: must be verbatim or "substantially paraphrased with customer review". Attribution anonymized to role + industry.
- **Anonymization label is always shown** when status is `skeleton` or customer anonymized. Transparent about anonymization = trust.
- **Primary CTA**: demo first for case studies (BOFU intent), trial second. Reversed from blog (TOFU) where trial is primary.
