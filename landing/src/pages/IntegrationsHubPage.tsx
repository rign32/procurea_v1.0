import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Search, Shield, Lock, CheckCircle2, Sparkles, Zap } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
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
import { BRAND_LOGOS } from "@/components/integrations/BrandLogos"
import { IntegrationConstellation } from "@/components/integrations/IntegrationConstellation"
import { DataFlowDiagram } from "@/components/integrations/DataFlowDiagram"
import { ApiTerminal } from "@/components/integrations/ApiTerminal"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type CategoryFilter = IntegrationCategory | "all"

/* ═════════════════════ LOGO TILE ═════════════════════ */

function LogoTile({ slug, className = "" }: { slug: string; className?: string }) {
  const Logo = BRAND_LOGOS[slug]
  if (!Logo) {
    return (
      <div className={`inline-flex items-center justify-center font-mono text-[13px] font-bold bg-slate-100 text-slate-700 rounded-lg px-3 py-1.5 ${className}`}>
        {slug.toUpperCase()}
      </div>
    )
  }
  return <Logo className={className} />
}

/* ═════════════════════ BENTO CARD (flagship) ═════════════════════ */

function BentoCard({
  integration,
  size = "sm",
}: {
  integration: Integration
  size?: "lg" | "md" | "sm"
}) {
  const href = `${pathFor("contact")}?interest=integration_${integration.slug}#calendar`
  const typeLabel = integrationsCopy.integrationTypeLabel[integration.integrationType]

  if (size === "lg") {
    return (
      <Link
        to={href}
        className="group relative flex flex-col justify-between rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-10 h-full overflow-hidden hover:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-black/[0.08] bg-white text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
              {integration.category}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              {typeLabel}
            </span>
          </div>

          <div className="h-16 mb-6 flex items-center">
            <LogoTile slug={integration.slug} className="h-full w-auto max-w-[240px]" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 leading-tight mb-3">
            {integration.name}
          </h3>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-xl mb-6">
            {isEN ? integration.descEn : integration.descPl}
          </p>

          <div className="space-y-2">
            {(isEN ? integration.capabilitiesEn : integration.capabilitiesPl).slice(0, 3).map((cap) => (
              <div key={cap} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 pt-6 border-t border-black/[0.06] flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{integrationsCopy.tierLabel}:</span>{" "}
            {isEN ? integration.tiersEn : integration.tiersPl}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
            {integrationsCopy.learnMoreLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    )
  }

  // md / sm — compact vertical card
  return (
    <Link
      to={href}
      className="group relative flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 h-full overflow-hidden hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-black/[0.14] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-black/[0.08] bg-slate-50 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-600">
          {integration.category}
        </span>
      </div>

      <div className="h-10 mb-5 flex items-center">
        <LogoTile slug={integration.slug} className="h-full w-auto max-w-[180px]" />
      </div>

      <h3 className="text-base font-bold tracking-tight text-slate-900 leading-tight mb-2">
        {integration.name}
      </h3>
      <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 flex-1 mb-4">
        {isEN ? integration.descEn : integration.descPl}
      </p>

      <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9.5px] font-bold uppercase tracking-[0.14em] ${
          integration.integrationType === "native"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : integration.integrationType === "merge-dev"
            ? "bg-violet-50 border-violet-200 text-violet-800"
            : "bg-slate-100 border-slate-200 text-slate-700"
        }`}>
          {integrationsCopy.integrationTypeLabel[integration.integrationType]}
        </span>
        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          {integrationsCopy.learnMoreLabel}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

/* ═════════════════════ MAIN PAGE ═════════════════════ */

export function IntegrationsHubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilter>("all")

  const featured = useMemo(() => INTEGRATIONS.filter((i) => i.featured), [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return INTEGRATIONS.filter((i) => {
      if (category === "API") return false
      if (category !== "all" && i.category !== category) return false
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

  const isSearching = searchQuery.trim() !== ""

  // Sort featured array so SAP is first, then by order
  const featuredSorted = [...featured].sort((a, b) => {
    if (a.slug === "sap") return -1
    if (b.slug === "sap") return 1
    return 0
  })

  return (
    <div className="min-h-screen bg-white">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pb-24">
        {/* ═══════ HERO — with constellation visualization ═══════ */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          {/* Subtle dotted background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.5]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--ds-ink-2) / 0.08) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-20 -right-40 w-[640px] h-[640px] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none" aria-hidden="true" />
          <div className="absolute top-40 -left-32 w-[520px] h-[520px] rounded-full bg-sky-500/[0.04] blur-[100px] pointer-events-none" aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.05fr_1.25fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-5">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {integrationsCopy.heroEyebrow}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold font-display tracking-tight mb-5 text-slate-900 leading-[1.05]">
                  {integrationsCopy.heroTitle}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                  {integrationsCopy.heroSubtitle}
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {integrationsCopy.heroStats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-black/[0.08] bg-white p-4">
                      <div className="text-2xl sm:text-[28px] font-extrabold font-display tracking-tight text-slate-900 tabular-nums">
                        {s.value}
                      </div>
                      <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-slate-500 mt-1 font-bold">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <IntegrationConstellation />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ LOGOS STRIP ═══════ */}
        <section className="py-8 border-y border-slate-100 bg-slate-50/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-bold">
                {isEN ? "Out of the box — ready to connect" : "Gotowe out-of-the-box"}
              </div>
              <div className="text-xs text-slate-500">
                {INTEGRATIONS.length} {isEN ? "systems shown, 50+ via Merge.dev" : "systemów pokazane, 50+ przez Merge.dev"}
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 md:gap-5 items-center">
              {INTEGRATIONS.map((i) => (
                <div
                  key={i.slug}
                  className="flex items-center justify-center h-10 grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                  title={i.name}
                >
                  <LogoTile slug={i.slug} className="h-full w-auto max-w-[120px]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FLAGSHIP — bento layout ═══════ */}
        {featuredSorted.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
            <RevealOnScroll>
              <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-3">
                    {isEN ? "Native · bi-directional" : "Natywne · dwukierunkowe"}
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-3 text-slate-900">
                    {integrationsCopy.featuredTitle}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                    {integrationsCopy.featuredSubtitle}
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Bento: 1 large SAP + 3 compact cards in a 12-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* SAP — big hero card, takes 7/12 columns and spans 2 rows on lg */}
              <div className="lg:col-span-7 lg:row-span-2">
                <BentoCard integration={featuredSorted[0]} size="lg" />
              </div>

              {/* 3 smaller featured cards (NetSuite, Dynamics, Salesforce) */}
              {featuredSorted.slice(1).map((i) => (
                <div key={i.slug} className="lg:col-span-5">
                  <BentoCard integration={i} size="md" />
                </div>
              ))}

              {/* If only 3 featured (less than 4), fill with CTA tile */}
              {featuredSorted.length < 4 && (
                <div className="lg:col-span-5">
                  <Link
                    to={`${pathFor("contact")}?interest=integration_other#calendar`}
                    className="group flex flex-col items-start justify-center h-full rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.02] p-6 hover:border-primary/50 hover:bg-primary/[0.04] transition-all duration-300"
                  >
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      {isEN ? "Your system?" : "Twój system?"}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {isEN ? "We build custom adapters in 2–4 weeks." : "Budujemy custom adaptery w 2–4 tygodnie."}
                    </p>
                    <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {isEN ? "Scope with us" : "Wyceńmy razem"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════ HOW IT WORKS — data flow ═══════ */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-3">
                  {isEN ? "How it works" : "Jak to działa"}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-4 text-slate-900">
                  {isEN ? "Your ERP is the source of truth" : "Twój ERP jest źródłem prawdy"}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {isEN
                    ? "Procurea enriches what is already yours — never replaces it. Four steps from discovery to reconciliation."
                    : "Procurea wzbogaca to, co już masz — nigdy nie zastępuje. Cztery kroki od odkrycia do uzgodnienia."}
                </p>
              </div>
            </RevealOnScroll>

            <DataFlowDiagram />
          </div>
        </section>

        {/* ═══════ FILTER + SEARCH + ALL INTEGRATIONS ═══════ */}
        <section id="all" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-3">
                {isEN ? "All systems" : "Wszystkie systemy"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight mb-3 text-slate-900">
                {integrationsCopy.allTitle}
              </h2>
              <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                {integrationsCopy.allSubtitle}
              </p>
            </div>
          </div>

          {/* Filter row */}
          <div className="mb-8 rounded-2xl border border-black/[0.06] bg-white p-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 font-bold px-2">
                {isEN ? "Category" : "Kategoria"}
              </span>
              {INTEGRATION_CATEGORIES.map((cat) => {
                const isActive = category === cat.key
                const count = cat.key === "API" ? "—" : categoryCounts[cat.key]
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key as CategoryFilter)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-black/[0.08]"
                    }`}
                  >
                    {isEN ? cat.labelEn : cat.labelPl}
                    <span className={`font-mono text-[10px] ${isActive ? "text-white/70" : "text-slate-400"}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-black/[0.06] rounded-lg px-3 py-1.5 min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={integrationsCopy.searchPlaceholder}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                aria-label={isEN ? "Search integrations" : "Szukaj integracji"}
              />
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-black/[0.1] bg-white/50">
              <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{integrationsCopy.noResults}</h3>
              <p className="text-sm text-slate-500 max-w-md mb-5">
                {isEN
                  ? "Enterprise Custom adapters are built per engagement — VPN/SNC, on-prem bridges, proprietary DBs."
                  : "Adaptery Enterprise Custom budujemy pod wdrożenie — VPN/SNC, mosty on-prem, własne bazy."}
              </p>
              <Link
                to={`${pathFor("contact")}?interest=integration_other#calendar`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 px-5 text-sm hover:bg-primary/90 transition-colors"
              >
                {integrationsCopy.noResultsCta}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((i) => (
                <BentoCard key={i.slug} integration={i} size="sm" />
              ))}
              {!isSearching && (
                <Link
                  to={`${pathFor("contact")}?interest=integration_other#calendar`}
                  className="group rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.02] p-6 flex flex-col items-start justify-center hover:border-primary/50 hover:bg-primary/[0.04] transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2">
                    {isEN ? "Your system?" : "Twój system?"}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {isEN ? "Custom adapter in 2–4 weeks." : "Custom adapter w 2–4 tygodnie."}
                  </p>
                  <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isEN ? "Scope with us" : "Wyceńmy razem"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* ═══════ API / WEBHOOKS — terminal ═══════ */}
        <section id="api" className="py-24 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-14 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-3">
                  {apiSection.eyebrow}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-4 text-slate-900">
                  {apiSection.title}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {apiSection.subtitle}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <ApiTerminal />
            </RevealOnScroll>

            {/* Access banner — sits below the terminal */}
            <RevealOnScroll>
              <div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-7 sm:p-9 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
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
                  to={`${pathFor("contact")}?interest=api_access#calendar`}
                  className="relative shrink-0 inline-flex items-center gap-2 rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold py-3 px-5 text-sm shadow-lg hover:shadow-amber-400/25 transition-all"
                >
                  {apiSection.accessBannerCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══════ SECURITY ═══════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <RevealOnScroll>
            <div className="flex items-start gap-4 mb-10">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-2">
                  {isEN ? "Enterprise-grade" : "Klasa enterprise"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-900 mb-2">
                  {apiSection.securityTitle}
                </h2>
                <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                  {isEN
                    ? "Isolation, audit, and residency controls that pass procurement due diligence."
                    : "Izolacja, audyt i kontrola lokalizacji danych spełniająca due diligence procurement."}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiSection.securityItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-black/[0.06] bg-white p-5 hover:border-black/[0.12] transition-colors">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary font-bold mb-2">
                  {item.label}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-10 md:p-14 text-center">
            <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary/[0.1] blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[350px] h-[350px] rounded-full bg-amber-400/[0.08] blur-[100px] pointer-events-none" />
            <h2 className="relative text-2xl md:text-3xl lg:text-4xl font-bold font-display tracking-tight mb-4">
              {integrationsCopy.ctaSectionTitle}
            </h2>
            <p className="relative text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {integrationsCopy.ctaSectionBody}
            </p>
            <Link
              to={`${pathFor("contact")}?interest=integration_other#calendar`}
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
