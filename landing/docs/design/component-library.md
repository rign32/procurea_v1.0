# Content Hub Component Library — Design Specification

**Location**: `landing/src/components/content/` (new directory)
**Purpose**: Reusable, typed, Tailwind-styled, accessibility-audited components used across ContentHub, BlogPost, Resource, and CaseStudy pages.

---

## Conventions (apply to ALL components)

- **File naming**: PascalCase, one component per file (e.g., `ContentCard.tsx`).
- **Export**: named export + default export for compatibility.
- **Props interface**: exported (for reuse in tests / other components).
- **Styling**: Tailwind classes only. For dynamic classes use `clsx` or template literals. No CSS modules.
- **Dark mode**: NOT needed for landing (hardcoded light theme per existing pages).
- **i18n**: accept copy as props (don't hardcode EN/PL inside components). The calling page passes localized strings.
- **Animation**: use Framer Motion for layout + complex transitions; Tailwind `animate-*` for simple enter animations.
- **Accessibility**: every component has keyboard navigation + focus rings + screen-reader labels. Focus style is consistent: `focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`.

---

## 1. `ContentCard`

The universal card for hub grid + related content sections.

### Props

```ts
export interface ContentCardProps {
  item: HubItem                     // from content/contentHub.ts
  size?: 'default' | 'featured'     // default | featured (bigger, in hero row)
  orientation?: 'vertical' | 'horizontal'  // vertical default; horizontal for inline recommendations
  className?: string
}
```

### Visual (vertical, default size)

```
┌────────────────────────────┐
│  ┌──────────────────────┐  │
│  │                      │  │
│  │   Gradient/image     │  │ ← aspect-[16/10]
│  │                      │  │   color per type
│  └──────────────────────┘  │
│                            │
│  [BADGE · category]        │
│                            │
│  Title — max 2 lines       │
│                            │
│  Excerpt — max 3 lines     │
│                            │
│  ─────────────────────     │
│  Apr 18 · 5 min  Read →   │
└────────────────────────────┘
```

### Tailwind

```tsx
export function ContentCard({ item, size = 'default', className }: ContentCardProps) {
  const gradient = GRADIENTS_BY_TYPE[item.type]
  const isFeatured = size === 'featured'

  return (
    <Link
      to={item.href}
      aria-label={`${getTypeLabel(item.type)}: ${item.title}`}
      className={clsx(
        "group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden",
        "hover:shadow-hover-card hover:-translate-y-1 transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "h-full",
        className
      )}
    >
      {/* Thumbnail */}
      <div className={clsx(
        "relative overflow-hidden bg-gradient-to-br",
        gradient,
        isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"
      )}>
        {item.heroImage ? (
          <img src={item.heroImage} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-mesh-gradient opacity-30 mix-blend-overlay" />
        )}
        {item.isFeatured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900">
            ★ Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className={clsx("flex flex-col flex-1", isFeatured ? "p-8" : "p-6")}>
        <div className="flex items-center gap-2.5 mb-3">
          <CategoryBadge type={item.type} />
          <span className="text-xs text-slate-500 line-clamp-1">{item.categoryLabel}</span>
        </div>

        <h3 className={clsx(
          "font-bold font-display tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-brand-500 transition-colors",
          isFeatured ? "text-2xl sm:text-3xl" : "text-lg"
        )}>
          {item.title}
        </h3>

        <p className={clsx(
          "text-slate-600 leading-relaxed line-clamp-3 flex-1",
          isFeatured ? "text-base" : "text-sm"
        )}>
          {item.excerpt}
        </p>

        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            {item.readingTime && (<>
              <span className="text-slate-300">·</span>
              <span>{item.readingTime}</span>
            </>)}
          </div>
          <span className="text-xs font-semibold text-brand-500 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            {item.type === 'resource' ? 'Download' : item.type === 'case-study' ? 'Read story' : 'Read'}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

const GRADIENTS_BY_TYPE: Record<ContentType, string> = {
  'blog': 'from-brand-500 via-brand-600 to-slate-800',
  'resource': 'from-amber-500 via-orange-500 to-rose-600',
  'case-study': 'from-emerald-500 via-teal-600 to-slate-800',
}
```

### Responsive behavior
- Desktop: full-width within grid col.
- Mobile: same structure, just full-width (grid collapses to 1-col).

### Accessibility
- `aria-label` on Link includes type and title.
- Thumbnail image `alt=""` (decorative) when hero image is illustrative; OR descriptive alt if the image is content-relevant.
- Focus ring only on keyboard focus (`focus-visible`).

### Animation
- Tailwind `hover:-translate-y-1 hover:shadow-hover-card transition-all duration-300`.
- NO `TiltCard` (too noisy in dense grids).

---

## 2. `CategoryBadge`

Color-coded type indicator.

### Props

```ts
export interface CategoryBadgeProps {
  type: ContentType
  size?: 'xs' | 'sm'
  className?: string
}
```

### Visual

```
[• BLOG]        teal
[• GUIDE]       amber
[• CASE STUDY]  emerald
```

### Tailwind

```tsx
const BADGE_STYLES: Record<ContentType, string> = {
  'blog': 'bg-brand-50 text-brand-800 border-brand-200',
  'resource': 'bg-amber-50 text-amber-900 border-amber-200',
  'case-study': 'bg-emerald-50 text-emerald-900 border-emerald-200',
}

const BADGE_LABELS: Record<ContentType, { en: string; pl: string }> = {
  'blog': { en: 'BLOG', pl: 'BLOG' },
  'resource': { en: 'GUIDE', pl: 'PRZEWODNIK' },
  'case-study': { en: 'CASE STUDY', pl: 'CASE STUDY' },
}

export function CategoryBadge({ type, size = 'xs' }: CategoryBadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider",
      BADGE_STYLES[type],
      size === 'xs' ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {BADGE_LABELS[type][LANG]}
    </span>
  )
}
```

---

## 3. `CategoryFilter`

Pill-based filter bar for hub page.

### Props

```ts
export interface CategoryFilterProps {
  types: Array<{ key: ContentType | 'all'; label: string; count: number }>
  active: ContentType | 'all'
  onChange: (type: ContentType | 'all') => void
  className?: string
}
```

### Visual

```
[All (23)]  [Blog (14)]  [Guides (5)]  [Case Studies (4)]
 ^active
```

### Tailwind

```tsx
export function CategoryFilter({ types, active, onChange }: CategoryFilterProps) {
  return (
    <div role="group" aria-label="Filter by content type" className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
      {types.map(type => {
        const isActive = active === type.key
        return (
          <button
            key={type.key}
            onClick={() => onChange(type.key)}
            aria-pressed={isActive}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              isActive
                ? "bg-brand-500 text-white shadow-premium"
                : "bg-white border border-black/[0.08] text-slate-700 hover:border-brand-500/40 hover:bg-slate-50"
            )}
          >
            {type.label}
            <span className={clsx(
              "text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center",
              isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            )}>
              {type.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

### Accessibility
- `role="group"` + `aria-label` on wrapper.
- `aria-pressed={isActive}` per button.
- Keyboard: `Tab` through pills, `Space/Enter` activates.

### Animation
- Active state: `transition-all duration-200`.
- On click, use Framer layout animation via sibling `layoutId` if we want sliding indicator (optional, can skip at v1).

---

## 4. `ContentHubGrid`

Responsive grid wrapper for content cards with stagger animation.

### Props

```ts
export interface ContentHubGridProps {
  items: HubItem[]
  columns?: 2 | 3                   // default 3
  className?: string
}
```

### Tailwind

```tsx
export function ContentHubGrid({ items, columns = 3, className }: ContentHubGridProps) {
  return (
    <motion.div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
        className
      )}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {items.map(item => (
        <motion.div
          key={`${item.type}-${item.slug}`}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] as const } },
          }}
          layout
        >
          <ContentCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

Note: `layout` prop gives smooth re-order animation when filter changes.

---

## 5. `LeadMagnetGate`

Email capture form for resource pages. Full layout in `resource-page.md`.

### Props

```ts
export interface LeadMagnetGateProps {
  resource: Resource                   // full resource object
  onSubmitSuccess?: (lead: LeadData) => void
  className?: string
}

interface LeadData {
  name: string
  email: string
  company: string
  optIn: boolean
}
```

### State machine

```
idle → submitting → success
              ↓
            error
```

### Tailwind + behavior

```tsx
export function LeadMagnetGate({ resource, onSubmitSuccess }: LeadMagnetGateProps) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [lead, setLead] = useState<LeadData>({ name: '', email: '', company: '', optIn: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validateLead(lead)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setState('submitting')
    try {
      await submitLead(resource.slug, lead)
      setState('success')
      onSubmitSuccess?.(lead)
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    if (state === 'success') successHeadingRef.current?.focus()
  }, [state])

  if (state === 'success') {
    return <SuccessState resource={resource} firstName={lead.name.split(' ')[0]} headingRef={successHeadingRef} />
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-black/[0.08] shadow-premium-lg p-6 sm:p-7">
      {/* fields as in resource-page.md */}
    </form>
  )
}
```

### Accessibility
- All `<input>`s have associated `<label htmlFor>`.
- Error state: `aria-invalid="true"` + `aria-describedby` pointing to error `<p>` with `role="alert"`.
- Loading state: `aria-busy="true"` on `<form>`, submit button disabled with `aria-disabled`.
- Success state: move focus to heading so screen reader announces.

---

## 6. `AuthorByline`

### Props

```ts
export interface AuthorBylineProps {
  author: {
    id: string
    name: string
    role: string
    avatar: string     // URL or initials-fallback placeholder
    bio?: string
  }
  date: string         // YYYY-MM-DD
  variant?: 'compact' | 'full'
  className?: string
}
```

### Visual — compact (inline in hero)

```
●  Anna Kowalska · Head of Content · Apr 10, 2026
```

### Visual — full (below article)

```
┌─────────────────────────────────────────────────┐
│  ┌──────┐                                       │
│  │ [AK] │  Anna Kowalska                        │
│  │avatar│  Head of Content · Procurea           │
│  └──────┘                                       │
│                                                 │
│  Anna spent 8 years in procurement at          │
│  Schneider Electric and now leads Procurea's   │
│  content strategy.                              │
│                                                 │
│  [LinkedIn]  [Follow on X]                     │
└─────────────────────────────────────────────────┘
```

### Tailwind

```tsx
export function AuthorByline({ author, date, variant = 'compact' }: AuthorBylineProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2.5 text-sm text-slate-600">
        <Avatar author={author} size={7} />
        <span className="font-medium text-slate-900">{author.name}</span>
        <span className="text-slate-400">·</span>
        <span>{author.role}</span>
        <span className="text-slate-400">·</span>
        <time dateTime={date}>{formatDate(date)}</time>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-black/[0.08] bg-slate-50/50 p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <Avatar author={author} size={14} />
        <div>
          <div className="font-bold text-lg text-slate-900">{author.name}</div>
          <div className="text-sm text-slate-600">{author.role} · Procurea</div>
        </div>
      </div>
      {author.bio && (
        <p className="mt-4 text-sm text-slate-700 leading-relaxed">{author.bio}</p>
      )}
    </section>
  )
}

function Avatar({ author, size }: { author: AuthorBylineProps['author']; size: number }) {
  const initials = author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={clsx(
      `h-${size} w-${size} rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shrink-0`,
      size >= 14 ? "text-lg" : "text-xs"
    )}>
      {author.avatar && author.avatar.startsWith('http') ? (
        <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
```

---

## 7. `InlineCTA`

Inline content CTA with 4 variants.

### Props

```ts
export interface InlineCTAProps {
  variant: 'magnet' | 'trial' | 'demo' | 'calculator'
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  icon?: LucideIcon     // override default per variant
  eyebrow?: string      // override default per variant
  onCtaClick?: () => void
}
```

### Visual patterns

- **Magnet**: brand-50 → sage-50 gradient, book icon, "FREE TEMPLATE" eyebrow.
- **Trial**: slate-900 → slate-950 gradient (dark), sparkle icon, "TRY PROCUREA" eyebrow.
- **Demo**: amber-50 → orange-50 gradient, calendar icon, "BOOK A DEMO" eyebrow.
- **Calculator**: emerald-50 → teal-50 gradient, calculator icon, "ROI CALCULATOR" eyebrow.

### Tailwind

```tsx
const VARIANTS: Record<InlineCTAProps['variant'], { bg: string; iconBg: string; icon: LucideIcon; eyebrow: string; eyebrowColor: string; btnBg: string; btnText: string }> = {
  magnet: {
    bg: 'from-brand-50 to-sage-50',
    iconBg: 'bg-brand-500 text-white',
    icon: BookOpen,
    eyebrow: 'FREE TEMPLATE',
    eyebrowColor: 'text-brand-700',
    btnBg: 'bg-slate-900 hover:bg-brand-500',
    btnText: 'text-white',
  },
  trial: {
    bg: 'from-slate-900 to-slate-950',
    iconBg: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
    icon: Sparkles,
    eyebrow: 'TRY PROCUREA',
    eyebrowColor: 'text-brand-300',
    btnBg: 'bg-brand-500 hover:bg-brand-600',
    btnText: 'text-white',
  },
  demo: {
    bg: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-500 text-white',
    icon: Calendar,
    eyebrow: 'BOOK A DEMO',
    eyebrowColor: 'text-amber-700',
    btnBg: 'bg-amber-400 hover:bg-amber-300',
    btnText: 'text-amber-950',
  },
  calculator: {
    bg: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-500 text-white',
    icon: Calculator,
    eyebrow: 'ROI CALCULATOR',
    eyebrowColor: 'text-emerald-700',
    btnBg: 'bg-slate-900 hover:bg-emerald-500',
    btnText: 'text-white',
  },
}

export function InlineCTA({ variant, title, description, ctaLabel, ctaHref, onCtaClick, icon, eyebrow }: InlineCTAProps) {
  const v = VARIANTS[variant]
  const Icon = icon || v.icon
  const isDark = variant === 'trial'

  return (
    <aside className={clsx(
      "not-prose my-10 rounded-2xl border p-6 sm:p-8",
      `bg-gradient-to-br ${v.bg}`,
      isDark ? "border-white/10 text-white" : "border-black/[0.06]"
    )}>
      <div className="flex items-start gap-4">
        <div className={clsx("shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg", v.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className={clsx("text-xs font-bold uppercase tracking-wider mb-1", v.eyebrowColor)}>
            {eyebrow || v.eyebrow}
          </div>
          <h4 className={clsx("text-lg font-bold font-display tracking-tight mb-1", isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h4>
          <p className={clsx("text-sm leading-relaxed mb-4", isDark ? "text-white/70" : "text-slate-600")}>
            {description}
          </p>
          <Link
            to={ctaHref}
            onClick={onCtaClick}
            className={clsx("inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors", v.btnBg, v.btnText)}
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
```

---

## 8. `StatPillsRow`

Row of 3-4 number-label pills.

### Props

```ts
export interface StatPillsRowProps {
  stats: Array<{ value: string; label: string }>
  theme?: 'emerald' | 'brand' | 'amber' | 'slate'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### Visual

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │          │  │          │  │          │
│  200+    │  │  45 min  │  │    26    │  │    90%   │
│          │  │          │  │          │  │          │
│suppliers │  │ sourcing │  │languages │  │ coverage │
│          │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Tailwind

```tsx
const THEMES = {
  emerald: { border: 'border-emerald-200/60', value: 'text-emerald-700' },
  brand: { border: 'border-brand-200/60', value: 'text-brand-700' },
  amber: { border: 'border-amber-200/60', value: 'text-amber-700' },
  slate: { border: 'border-slate-200', value: 'text-slate-900' },
}

const SIZES = {
  sm: { pad: 'p-4', value: 'text-2xl', label: 'text-xs' },
  md: { pad: 'p-5 md:p-6', value: 'text-3xl md:text-4xl', label: 'text-xs md:text-sm' },
  lg: { pad: 'p-6 md:p-8', value: 'text-4xl md:text-5xl', label: 'text-sm md:text-base' },
}

export function StatPillsRow({ stats, theme = 'slate', size = 'md', className }: StatPillsRowProps) {
  const t = THEMES[theme]
  const s = SIZES[size]
  const cols = stats.length >= 4 ? 'md:grid-cols-4' : `md:grid-cols-${stats.length}`

  return (
    <div className={clsx("not-prose grid grid-cols-2 gap-3 md:gap-4", cols, className)}>
      {stats.map((stat, i) => (
        <RevealOnScroll key={i} delay={i * 0.08}>
          <div
            className={clsx("rounded-2xl bg-white border shadow-premium text-center", t.border, s.pad)}
            aria-label={`${stat.value} ${stat.label}`}
          >
            <div className={clsx("font-bold font-display tracking-extra-tight leading-none mb-1", s.value, t.value)}>
              {stat.value}
            </div>
            <div className={clsx("text-slate-600 leading-tight", s.label)}>
              {stat.label}
            </div>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  )
}
```

---

## 9. `RelatedContentSection`

3-card grid of related items.

### Props

```ts
export interface RelatedContentSectionProps {
  title: string                         // "Continue your journey"
  items: HubItem[]                      // already selected (max 3)
  className?: string
}
```

### Tailwind

```tsx
export function RelatedContentSection({ title, items, className }: RelatedContentSectionProps) {
  if (items.length === 0) return null

  return (
    <section className={clsx("py-16 md:py-20 bg-slate-50/60", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight mb-8">
            {title}
          </h2>
        </RevealOnScroll>
        <ContentHubGrid items={items} columns={3} />
      </div>
    </section>
  )
}
```

---

## 10. `TableOfContents`

Sticky sidebar TOC for blog posts.

### Props

```ts
export interface TableOfContentsProps {
  sections: Array<{ id: string; text: string; level: 2 | 3 }>
  className?: string
}
```

### Behavior

- On mount, create IntersectionObserver for all `#${section.id}` in article.
- Track which H2 is in viewport → active state.
- Clicking link: `scrollTo` with smooth behavior + offset for sticky navbar.

### Tailwind

```tsx
export function TableOfContents({ sections, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter(e => e.isIntersecting)
        if (inView.length > 0) setActiveId(inView[0].target.id)
      },
      { rootMargin: '-112px 0px -60% 0px', threshold: 0 }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null

  return (
    <nav aria-label="Table of contents" className={className}>
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">
        {isEN ? 'ON THIS PAGE' : 'NA TEJ STRONIE'}
      </h2>
      <ol className="space-y-2 border-l border-slate-200">
        {sections.map(section => {
          const isActive = activeId === section.id
          return (
            <li key={section.id} className={clsx(section.level === 3 && "pl-4")}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                className={clsx(
                  "group relative block py-1 pl-4 -ml-px text-sm transition-colors border-l-2",
                  isActive
                    ? "border-brand-500 text-brand-600 font-semibold"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                {section.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

### Mobile variant: `TableOfContentsDrawer`

Separate component. Renders a button at top of body; on tap opens a bottom-sheet drawer with same list.

---

## 11. `PullQuote`

Stylized quote callout.

### Props

```ts
export interface PullQuoteProps {
  text: string
  author?: string
  role?: string
  company?: string
  size?: 'md' | 'lg' | 'xl'      // md for inline blog, xl for case study hero
  className?: string
}
```

### Tailwind (size=lg, article inline)

```tsx
export function PullQuote({ text, author, role, company, size = 'lg', className }: PullQuoteProps) {
  const sizes = {
    md: { text: 'text-lg md:text-xl', mark: 'text-5xl' },
    lg: { text: 'text-xl md:text-2xl', mark: 'text-6xl' },
    xl: { text: 'text-2xl sm:text-3xl md:text-4xl', mark: 'text-8xl md:text-9xl' },
  }
  const s = sizes[size]

  return (
    <figure className={clsx("not-prose relative my-12 pl-8", className)}>
      <div className={clsx("absolute -left-1 top-0 font-serif text-brand-500/20 leading-none select-none pointer-events-none", s.mark)}>"</div>
      <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" />
      <blockquote className={clsx("font-display font-semibold tracking-tight leading-[1.25] text-slate-900 mb-4", s.text)}>
        {text}
      </blockquote>
      {author && (
        <figcaption className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{author}</span>
          {role && <> · {role}</>}
          {company && <> · <span className="italic">{company}</span></>}
        </figcaption>
      )}
    </figure>
  )
}
```

---

## 12. `NewsletterSignupInline`

Single-field newsletter form.

### Props

```ts
export interface NewsletterSignupInlineProps {
  variant: 'hero' | 'dark' | 'footer'
  source?: string                      // analytics source tag
  onSuccess?: (email: string) => void
}
```

### Visual variants

**Hero** (in Content Hub hero, light bg):
```
┌───────────────────────────┬──────────────────┐
│ your@email.com            │  Subscribe  →    │
└───────────────────────────┴──────────────────┘
  Weekly digest · No spam · Unsubscribe anytime
```

**Dark** (in dark CTA section):
```
┌───────────────────────────┬──────────────────┐
│ your@email.com            │  Subscribe  →    │
└───────────────────────────┴──────────────────┘
  [white text on dark bg, amber button]
```

### Tailwind (hero variant)

```tsx
export function NewsletterSignupInline({ variant, source = 'content_hub_hero', onSuccess }: NewsletterSignupInlineProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) { setState('error'); return }
    setState('submitting')
    try {
      await subscribeNewsletter(email, source)
      setState('success')
      onSuccess?.(email)
    } catch { setState('error') }
  }

  const isDark = variant === 'dark'

  if (state === 'success') {
    return (
      <div className={clsx("inline-flex items-center gap-2 rounded-xl px-4 py-3", isDark ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-800")}>
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">{isEN ? 'Check your inbox to confirm' : 'Sprawdź email by potwierdzić'}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <label htmlFor={`newsletter-${variant}`} className="sr-only">Email</label>
        <input
          id={`newsletter-${variant}`}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
          required
          placeholder={isEN ? 'your@email.com' : 'twój@email.com'}
          className={clsx(
            "flex-1 px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30",
            isDark
              ? "bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-brand-500"
          )}
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all disabled:opacity-60",
            isDark
              ? "bg-amber-400 text-amber-950 hover:bg-amber-300"
              : "bg-brand-500 text-white hover:bg-brand-600 shadow-glow-primary hover:shadow-glow-primary-hover"
          )}
        >
          {state === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            {isEN ? 'Subscribe' : 'Zapisz się'}
            <ArrowRight className="h-3.5 w-3.5" />
          </>}
        </button>
      </div>
      {state === 'error' && (
        <p className="mt-2 text-xs text-rose-500" role="alert">{isEN ? 'Please enter a valid email' : 'Wprowadź poprawny email'}</p>
      )}
    </form>
  )
}
```

---

## 13. `BlogPostHero`

Two variants of blog post hero.

### Props

```ts
export interface BlogPostHeroProps {
  post: BlogPost
  variant?: 'data' | 'story'
}
```

### Variant: `data` (for benchmarks / research posts)

Adds a prominent `StatPillsRow` below the excerpt.

```
┌─────────────────────────────────────────┐
│ [AI & AUTOMATION]  · 8 min read         │
│                                         │
│ State of Procurement AI 2026            │
│                                         │
│ We surveyed 500 procurement leaders     │
│ about AI adoption and here is what      │
│ we found.                               │
│                                         │
│ ● Anna K · Head of Content · Apr 10     │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│ │ 67% │ │ 42% │ │$1.2M│ │ 3.2x│         │
│ └─────┘ └─────┘ └─────┘ └─────┘         │
└─────────────────────────────────────────┘
```

### Variant: `story` (for how-to / narrative posts)

Default: large hero image + excerpt, no stat pills.

```tsx
export function BlogPostHero({ post, variant = 'story' }: BlogPostHeroProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-12">
      {/* ...standard hero as in blog-post-page.md section 3... */}
      {variant === 'data' && post.statPills && (
        <div className="mt-10">
          <StatPillsRow stats={post.statPills} theme="brand" size="md" />
        </div>
      )}
      {variant === 'story' && post.heroImage && (
        <div className="mt-10 aspect-[16/9] rounded-2xl overflow-hidden border border-black/[0.06]">
          <img src={post.heroImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </section>
  )
}
```

---

## 14. `ChallengeSolutionResults`

Three-section narrative block for case studies.

### Props

```ts
export interface ChallengeSolutionResultsProps {
  challenge: { title: string; body: string }
  solution: { title: string; body: string; featureHighlights?: Array<{ icon: LucideIcon; label: string }> }
  results: { title: string; body: string; stats?: Array<{ value: string; label: string }> }
  labels?: { challenge: string; solution: string; results: string }  // "THE CHALLENGE" etc.
}
```

### Rendering

Three `<section>` elements with alternating backgrounds + giant ghost numerals `[01] [02] [03]`. Full layout in `case-study-page.md` section 4.

```tsx
export function ChallengeSolutionResults({ challenge, solution, results, labels }: ChallengeSolutionResultsProps) {
  return (
    <>
      <NarrativeSection number="01" label={labels?.challenge || 'THE CHALLENGE'} title={challenge.title} bg="white">
        <p>{challenge.body}</p>
      </NarrativeSection>

      <NarrativeSection number="02" label={labels?.solution || 'THE SOLUTION'} title={solution.title} bg="mesh">
        <p>{solution.body}</p>
        {solution.featureHighlights && (
          <div className="mt-8 space-y-3">
            {solution.featureHighlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white border border-black/[0.06] p-4">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <h.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-800">{h.label}</span>
              </div>
            ))}
          </div>
        )}
      </NarrativeSection>

      <NarrativeSection number="03" label={labels?.results || 'THE RESULTS'} title={results.title} bg="emerald">
        <p>{results.body}</p>
        {results.stats && (
          <div className="mt-8">
            <StatPillsRow stats={results.stats} theme="emerald" size="sm" />
          </div>
        )}
      </NarrativeSection>
    </>
  )
}
```

`NarrativeSection` is a local helper inside the file.

---

## 15. `EmptyState`

Shown in Content Hub when filter returns 0 items.

### Props

```ts
export interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
  className?: string
}
```

### Tailwind

```tsx
export function EmptyState({ title, description, actionLabel, onAction, icon: Icon = Search }: EmptyStateProps) {
  return (
    <div role="status" aria-live="polite" className="text-center py-20 px-4">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-5">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
```

---

## 16. `Breadcrumbs`

### Props

```ts
export interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>   // last item has no href (current page)
  className?: string
}
```

### Tailwind

```tsx
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={i}>
              <li className={clsx(isLast && "text-slate-900 font-medium truncate max-w-xs")}>
                {item.href && !isLast ? (
                  <Link to={item.href} className="hover:text-brand-500 transition-colors">{item.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                )}
              </li>
              {!isLast && <li aria-hidden className="text-slate-300">/</li>}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
```

---

## Accessibility checklist (applies to ALL components)

- [ ] Focus rings visible on keyboard focus only (`focus-visible:ring-*`).
- [ ] Color contrast ≥4.5:1 for normal text, ≥3:1 for large text/UI.
- [ ] Semantic HTML: `<nav>`, `<article>`, `<section>`, `<figure>`, `<blockquote>`.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Form fields associated with labels via `htmlFor`.
- [ ] Errors announced with `role="alert"` + `aria-invalid`.
- [ ] Live regions for state changes (`aria-live="polite"`).
- [ ] Keyboard navigation: Tab + Enter/Space for interactive elements.
- [ ] Reduced motion: respect `prefers-reduced-motion: reduce` by disabling non-essential animations via Tailwind `motion-reduce:` OR Framer's `useReducedMotion`.

---

## Summary — Component count & sizing

| # | Component | LOC estimate | Priority |
|---|---|---|---|
| 1 | ContentCard | 120 | P0 |
| 2 | CategoryBadge | 40 | P0 |
| 3 | CategoryFilter | 80 | P0 |
| 4 | ContentHubGrid | 50 | P0 |
| 5 | LeadMagnetGate | 200 | P0 |
| 6 | AuthorByline | 80 | P1 |
| 7 | InlineCTA | 150 | P1 |
| 8 | StatPillsRow | 70 | P0 |
| 9 | RelatedContentSection | 40 | P0 |
| 10 | TableOfContents + Drawer | 180 | P1 |
| 11 | PullQuote | 60 | P1 |
| 12 | NewsletterSignupInline | 120 | P0 |
| 13 | BlogPostHero | 60 | P1 |
| 14 | ChallengeSolutionResults | 110 | P0 |
| 15 | EmptyState | 50 | P0 |
| 16 | Breadcrumbs | 40 | P0 |
| — | Helper: `formatDate`, `isValidEmail`, `slugify`, `submitLead`, `subscribeNewsletter` | 100 | P0 |
| — | Page: ContentHubPage | 250 | P0 |
| — | Page: BlogPostPage (rewrite) | 200 | P0 |
| — | Page: ResourcePage | 300 | P0 |
| — | Page: CaseStudyPage | 250 | P0 |

**Total**: ~16 reusable components + 4 page components + helpers = ~2,550 LOC estimate.

**P0 = launch blockers, P1 = enhancement (can ship v1 without, but should ship v1.1 within 2 weeks).**
