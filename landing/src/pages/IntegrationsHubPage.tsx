import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Search, Zap, Shield, Code, Webhook, Key, Lock, CheckCircle2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  integrationsCopy,
  apiSection,
  type Integration,
  type IntegrationCategory,
} from "@/content/integrations"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

type CategoryFilter = IntegrationCategory | 'all'

/* ═════════════════════ FLAGSHIP CARD ═════════════════════ */

function FlagshipCard({ integration }: { integration: Integration }) {
  return (
    <Link
      to={`${pathFor('contact')}?interest=integration_${integration.slug}#calendar`}
      className="group relative overflow-hidden rounded-3xl bg-white border border-black/[0.06] hover:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Brand hero panel */}
      <div className={`relative bg-gradient-to-br ${integration.brandGradient} p-6 sm:p-7 aspect-[2/1] flex flex-col justify-between overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/15 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-black/10 blur-[60px] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm text-white font-bold text-[15px] tracking-tight">
            {integration.logo}
          </div>
          <div>
            <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.15em] text-white/70 mb-0.5">
              {integration.category}
            </div>
            <div className="text-[11px] font-semibold text-white/85 uppercase tracking-wider">
              {integrationsCopy.integrationTypeLabel[integration.integrationType]}
            </div>
          </div>
        </div>
        <h3 className="relative text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
          {integration.name}
        </h3>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7">
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
          {isEN ? integration.descEn : integration.descPl}
        </p>
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground line-clamp-1 flex-1 min-w-0">
            <span className="font-semibold text-foreground">{integrationsCopy.tierLabel}:</span>{' '}
            {isEN ? integration.tiersEn : integration.tiersPl}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
            {integrationsCopy.learnMoreLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ═════════════════════ GRID CARD ═════════════════════ */

function IntegrationCard({ integration }: { integration: Integration }) {
  const typeBadgeClass =
    integration.integrationType === 'native'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : integration.integrationType === 'merge-dev'
      ? 'bg-violet-50 border-violet-200 text-violet-800'
      : 'bg-slate-100 border-slate-200 text-slate-700'

  return (
    <Link
      to={`${pathFor('contact')}?interest=integration_${integration.slug}#calendar`}
      className="group relative flex flex-col h-full rounded-2xl border border-black/[0.08] bg-white overflow-hidden hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-black/[0.12] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className={`relative flex items-center gap-3 p-5 bg-gradient-to-br ${integration.brandGradient} overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-[40px] pointer-events-none" />
        <div className="relative inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-white font-bold text-xs tracking-tight">
          {integration.logo}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-white/70 mb-0.5">
            {integration.category}
          </div>
          <h3 className="text-[15px] font-bold text-white leading-tight truncate">{integration.name}</h3>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-bold uppercase tracking-wider ${typeBadgeClass}`}>
            {integrationsCopy.integrationTypeLabel[integration.integrationType]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {isEN ? integration.descEn : integration.descPl}
        </p>
        <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate flex-1 min-w-0 mr-2">
            {isEN ? integration.tiersEn : integration.tiersPl}
          </span>
          <span className="shrink-0 font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {integrationsCopy.ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ═════════════════════ MAIN PAGE ═════════════════════ */

export function IntegrationsHubPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const featured = useMemo(() => INTEGRATIONS.filter((i) => i.featured), [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return INTEGRATIONS.filter((i) => {
      if (category !== 'all' && category !== 'API' && i.category !== category) return false
      if (category === 'API') return false // API category handled by the dedicated section
      if (!q) return true
      return (
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.searchKeywords.some((kw) => kw.toLowerCase().includes(q)) ||
        (isEN ? i.descEn : i.descPl).toLowerCase().includes(q)
      )
    })
  }, [searchQuery, category])

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = { all: INTEGRATIONS.length, ERP: 0, CRM: 0, Accounting: 0, API: 0 }
    for (const i of INTEGRATIONS) counts[i.category]++
    return counts
  }, [])

  const isApiView = category === 'API'
  const isSearching = searchQuery.trim() !== ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pb-24">
        {/* ═══════ HERO ═══════ */}
        <section className="relative overflow-hidden pt-32 pb-16">
          <div className="absolute top-20 -right-40 w-[640px] h-[640px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" aria-hidden="true" />
          <div className="absolute top-40 -left-32 w-[520px] h-[520px] rounded-full bg-sky-500/[0.05] blur-[100px] pointer-events-none" aria-hidden="true" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={52} className="opacity-40" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary mb-5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {integrationsCopy.heroEyebrow}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {integrationsCopy.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
                {integrationsCopy.heroSubtitle}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {integrationsCopy.heroStats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/80 backdrop-blur-sm border border-black/[0.06] p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900">
                      {s.value}
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══════ FEATURED / FLAGSHIP ═══════ */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-16">
            <RevealOnScroll>
              <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-2">
                    {integrationsCopy.featuredTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {integrationsCopy.featuredSubtitle}
                  </p>
                </div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground font-bold">
                  {isEN ? 'Native · bi-directional' : 'Natywne · dwukierunkowe'}
                </span>
              </div>
            </RevealOnScroll>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {featured.map((i) => (
                <motion.div key={i.slug} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}>
                  <FlagshipCard integration={i} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* ═══════ FILTER + SEARCH (sticky) ═══════ */}
        <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/85 border-y border-black/[0.06]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground font-bold mr-1">
              {isEN ? 'Category' : 'Kategoria'}
            </span>
            {INTEGRATION_CATEGORIES.map((cat) => {
              const isActive = category === cat.key
              const count = cat.key === 'API' ? '—' : categoryCounts[cat.key]
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key as CategoryFilter)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-black/[0.08] hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {isEN ? cat.labelEn : cat.labelPl}
                  <span className={`font-mono text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
            <div className="ml-auto flex items-center gap-2 bg-slate-50 border border-black/[0.06] rounded-lg px-3 py-1.5 min-w-[240px]">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={integrationsCopy.searchPlaceholder}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                aria-label={isEN ? 'Search integrations' : 'Szukaj integracji'}
              />
            </div>
          </div>
        </div>

        {/* ═══════ ALL INTEGRATIONS GRID (hidden when viewing API tab) ═══════ */}
        {!isApiView && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                {integrationsCopy.allTitle}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filtered.length} {isEN ? 'systems' : 'systemów'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-black/[0.1] bg-white/50">
                <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{integrationsCopy.noResults}</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-5">
                  {isEN
                    ? 'Enterprise Custom adapters are built per engagement — VPN/SNC, on-prem bridges, proprietary DBs.'
                    : 'Adaptery Enterprise Custom budujemy pod wdrożenie — VPN/SNC, mosty on-prem, własne bazy.'}
                </p>
                <Link
                  to={`${pathFor('contact')}?interest=integration_other#calendar`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 px-5 text-sm hover:bg-primary/90 transition-colors"
                >
                  {integrationsCopy.noResultsCta}
                </Link>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {filtered.map((integration) => (
                  <motion.div key={integration.slug} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }}>
                    <IntegrationCard integration={integration} />
                  </motion.div>
                ))}
                {!isSearching && (
                  <Link
                    to={`${pathFor('contact')}?interest=integration_other#calendar`}
                    className="group rounded-2xl border-2 border-dashed border-primary/25 bg-white/60 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-2">
                      {isEN ? 'Your system?' : 'Twój system?'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isEN ? 'We build custom adapters in 2–4 weeks.' : 'Budujemy custom adaptery w 2–4 tygodnie.'}
                    </p>
                    <span className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {isEN ? 'Scope with us' : 'Wyceńmy razem'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                )}
              </motion.div>
            )}
          </section>
        )}

        {/* ═══════ VALUE PROPS (hidden in API or search view) ═══════ */}
        {!isApiView && !isSearching && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 border-t border-black/[0.06]">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-center mb-12">
                {integrationsCopy.valueTitle}
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {integrationsCopy.valueProps.map((prop) => (
                <div key={prop.title} className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-7">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prop.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════ API / WEBHOOKS / SDKs (always visible, bigger when API tab selected) ═══════ */}
        <section id="api" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 border-t border-black/[0.06]">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
                <Code className="h-3.5 w-3.5" aria-hidden="true" />
                {apiSection.eyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4 text-slate-900">
                {apiSection.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {apiSection.subtitle}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {apiSection.resources.map((r, idx) => {
              const Icon = idx === 0 ? Key : idx === 1 ? Webhook : Code
              return (
                <RevealOnScroll key={r.title}>
                  <div className="flex flex-col h-full rounded-2xl border border-black/[0.08] bg-white overflow-hidden">
                    <div className="p-6 sm:p-7">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight mb-2">
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {r.description}
                      </p>
                      <ul className="space-y-2 mb-5">
                        {r.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto px-6 sm:px-7 pb-6 sm:pb-7">
                      <div className="text-[10.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground font-bold mb-2">
                        {r.snippetLabel}
                      </div>
                      <pre className="rounded-xl bg-slate-950 text-slate-100 text-[12px] leading-[1.55] p-4 overflow-x-auto font-mono">
                        <code>{r.snippet}</code>
                      </pre>
                    </div>
                  </div>
                </RevealOnScroll>
              )
            })}
          </div>

          {/* Access banner */}
          <RevealOnScroll>
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7 sm:p-9 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-20 w-[400px] h-[400px] rounded-full bg-primary/[0.15] blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-16 w-[300px] h-[300px] rounded-full bg-amber-400/[0.08] blur-[80px] pointer-events-none" />
              <div className="relative shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 border border-white/15 text-amber-300">
                <Lock className="h-6 w-6" />
              </div>
              <div className="relative flex-1">
                <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight mb-2">
                  {apiSection.accessBannerTitle}
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                  {apiSection.accessBannerBody}
                </p>
              </div>
              <Link
                to={`${pathFor('contact')}?interest=api_access#calendar`}
                className="relative shrink-0 inline-flex items-center gap-2 rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold py-3 px-5 text-sm shadow-lg hover:shadow-amber-400/25 transition-all"
              >
                {apiSection.accessBannerCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══════ SECURITY & COMPLIANCE ═══════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 border-t border-black/[0.06]">
          <RevealOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                {apiSection.securityTitle}
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiSection.securityItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-black/[0.06] bg-white p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-primary font-bold mb-2">
                  {item.label}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-10 md:p-14 text-center">
            <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary/[0.1] blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[350px] h-[350px] rounded-full bg-amber-400/[0.08] blur-[100px] pointer-events-none" />
            <h2 className="relative text-2xl md:text-3xl lg:text-4xl font-bold font-display tracking-tight mb-4">
              {integrationsCopy.ctaSectionTitle}
            </h2>
            <p className="relative text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {integrationsCopy.ctaSectionBody}
            </p>
            <Link
              to={`${pathFor('contact')}?interest=integration_other#calendar`}
              className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg hover:shadow-amber-400/25 transition-all"
            >
              {integrationsCopy.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default IntegrationsHubPage
