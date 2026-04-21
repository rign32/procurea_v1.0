import { useState, useMemo, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { ResourceCover } from "@/components/content/ResourceCover"
import { BLOG_HEROES } from "@/assets/content-hub/BlogHeroes"
import { getBlogPostImages } from "@/assets/content-hub/BlogHeroImages"
import { getAllHubItems, filterHubItems, type ContentType } from "@/content/contentHub"
import { RESOURCES } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Sparkles, Search, Download, ArrowRight, Clock3, Calendar } from "lucide-react"
import type { HubItem } from "@/content/contentHub"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type FilterValue = ContentType | "all"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(isEN ? "en-US" : "pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ContentHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const allItems = useMemo(() => getAllHubItems(), [])
  const resourcesBase = pathMappings.resourcesHub[LANG]

  const initialFilter = (searchParams.get("type") as FilterValue) || "all"
  const [activeFilter, setActiveFilter] = useState<FilterValue>(
    (["all", "blog", "resource"] as FilterValue[]).includes(initialFilter)
      ? initialFilter
      : "all"
  )
  const [query, setQuery] = useState("")

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (activeFilter === "all") newParams.delete("type")
    else newParams.set("type", activeFilter)
    setSearchParams(newParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: allItems.length,
      blog: 0,
      resource: 0,
    }
    for (const item of allItems) base[item.type]++
    return base
  }, [allItems])

  const filtered = useMemo(() => {
    let list = filterHubItems(allItems, activeFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q)
      )
    }
    return list
  }, [allItems, activeFilter, query])

  const flagshipResource = useMemo(
    () =>
      RESOURCES.find((r) => r.slug === "nearshore-migration-playbook" && r.status !== "draft"),
    []
  )
  const showFlagship = !query && (activeFilter === "all" || activeFilter === "resource") && flagshipResource

  const gridItems = useMemo(() => {
    const excludedSlugs = new Set<string>()
    if (showFlagship && flagshipResource) excludedSlugs.add(flagshipResource.slug)
    return filtered.filter((item) => !excludedSlugs.has(item.slug))
  }, [filtered, showFlagship, flagshipResource])

  const filterOptions: Array<{ value: FilterValue; label: string; count: number }> = [
    { value: "all", label: isEN ? "All" : "Wszystkie", count: counts.all },
    { value: "blog", label: isEN ? "Articles" : "Artykuły", count: counts.blog },
    { value: "resource", label: isEN ? "Guides & Templates" : "Przewodniki i szablony", count: counts.resource },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? "Content Hub — Articles, Guides & Templates | Procurea"
            : "Centrum Wiedzy — artykuły, przewodniki i szablony | Procurea",
          description: isEN
            ? "Practical procurement content in one place: articles, downloadable guides, templates, playbooks, and calculators. Written by practitioners, not marketers."
            : "Praktyczne materiały procurement w jednym miejscu: artykuły, przewodniki do pobrania, szablony, playbooki i kalkulatory. Pisane przez praktyków, nie marketerów.",
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 bg-gradient-to-b from-white via-[hsl(var(--ds-accent-soft))]/40 to-white overflow-hidden">
          <div
            className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-40 -left-32 w-[500px] h-[500px] rounded-full bg-amber-400/[0.05] blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <AnimatedGrid className="opacity-30" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-8 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.15em] text-brand-600 mb-3">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {isEN ? "Content Hub" : "Centrum Wiedzy"}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-3 text-slate-900">
                  {isEN
                    ? "Everything procurement — in one place"
                    : "Wszystko o procurement — w jednym miejscu"}
                </h1>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                  {isEN
                    ? "Articles, guides, templates, and calculators — built from 200+ real sourcing projects."
                    : "Artykuły, przewodniki, szablony i kalkulatory — zbudowane na 200+ prawdziwych projektach sourcingowych."}
                </p>
              </div>
            </RevealOnScroll>

            {showFlagship && flagshipResource && (
              <RevealOnScroll>
                <HeroFlagshipResource resource={flagshipResource} resourcesBase={resourcesBase} />
              </RevealOnScroll>
            )}
          </div>
        </section>

        <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/85 border-y border-black/[0.06]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 font-bold mr-1">
              {isEN ? "Filter" : "Filtr"}
            </span>
            {filterOptions.map((opt) => {
              const active = activeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-black/[0.08] hover:border-brand-500/50 hover:text-brand-600"
                  }`}
                >
                  {opt.label}
                  <span className={`font-mono text-[10px] ${active ? "text-white/70" : "text-slate-400"}`}>
                    {opt.count}
                  </span>
                </button>
              )
            })}

            <div className="ml-auto flex items-center gap-2 bg-slate-50 border border-black/[0.06] rounded-lg px-3 py-1.5 min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isEN ? "Search — nearshore, RFQ, TCO…" : "Szukaj — nearshore, RFQ, TCO…"
                }
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                aria-label={isEN ? "Search content" : "Szukaj materiałów"}
              />
            </div>
          </div>
        </div>

        <section className="py-12 sm:py-14 pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                {activeFilter === "blog"
                  ? isEN ? "All articles" : "Wszystkie artykuły"
                  : activeFilter === "resource"
                  ? isEN ? "All guides & templates" : "Wszystkie przewodniki i szablony"
                  : isEN ? "All content" : "Wszystkie materiały"}
              </h2>
              <span className="text-sm text-slate-500">
                {gridItems.length} {isEN ? "items" : "pozycji"}
              </span>
            </div>

            {gridItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {query
                    ? isEN ? "No matches" : "Brak wyników"
                    : isEN ? "Nothing here yet" : "Nic tutaj jeszcze nie ma"}
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  {query
                    ? isEN
                      ? "Try a different search term or clear the filter."
                      : "Spróbuj innej frazy lub wyczyść filtr."
                    : isEN
                    ? "We are building fresh content in this category."
                    : "Pracujemy nad nowymi materiałami w tej kategorii."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((item) => (
                  <RevealOnScroll key={item.slug}>
                    <UnifiedContentCard item={item} />
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ */

interface FlagshipResource {
  slug: string
  title: string
  excerpt: string
  formatLabel: string
  fileSize?: string
  pageCount?: number
}

function HeroFlagshipResource({
  resource,
  resourcesBase,
}: {
  resource: FlagshipResource
  resourcesBase: string
}) {
  return (
    <Link
      to={`${resourcesBase}/${resource.slug}`}
      className="group block rounded-2xl bg-white border border-black/[0.06] overflow-hidden shadow-[0_16px_48px_-20px_rgba(8,14,28,0.18)] hover:shadow-[0_24px_64px_-20px_rgba(8,14,28,0.25)] transition-shadow duration-300"
    >
      <div className="grid md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
        <div className="bg-[#0b1a3d] p-5 sm:p-6 md:p-7 flex items-center justify-center">
          <div className="w-full max-w-[220px] transition-transform duration-500 ease-out group-hover:scale-[1.02]">
            <ResourceCover slug={resource.slug} title={resource.title} size="hero" hover={false} />
          </div>
        </div>
        <div className="p-5 sm:p-6 md:p-7 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-[10px] uppercase tracking-[0.12em] font-bold">
              ★ {isEN ? "Flagship guide" : "Flagowy przewodnik"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold">
              {resource.formatLabel}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display tracking-tight text-slate-900 leading-[1.2] mb-2">
            {resource.title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
            {resource.excerpt}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--ds-accent))] group-hover:bg-[hsl(var(--ds-accent))]/90 text-white font-semibold py-2 px-3.5 text-sm transition-colors">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? "Download free" : "Pobierz za darmo"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
              {resource.fileSize}
              {resource.pageCount ? ` · ${resource.pageCount} ${isEN ? "pages" : "stron"}` : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function UnifiedContentCard({ item }: { item: HubItem }) {
  if (item.type === "resource") return <ResourceGridCard item={item} />
  return <BlogGridCard item={item} />
}

function ResourceGridCard({ item }: { item: HubItem }) {
  const res = RESOURCES.find((r) => r.slug === item.slug)
  return (
    <Link
      to={item.href}
      className="group flex flex-col rounded-2xl bg-white border border-black/[0.06] overflow-hidden h-full hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-black/[0.12] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ds-accent))] focus-visible:ring-offset-2"
    >
      <ResourceCover slug={item.slug} title={item.title} hover={false} />
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" aria-hidden="true" />
            {isEN ? "Guide" : "Przewodnik"}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-500 font-bold">
            {item.categoryLabel}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-[hsl(var(--ds-accent))] transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1 mb-4">{item.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] text-xs">
          <span className="font-mono text-slate-500 tracking-[0.02em]">
            {res?.fileSize}
            {res?.pageCount ? ` · ${res.pageCount} str` : ""}
          </span>
          <span className="font-semibold text-[hsl(var(--ds-accent))] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {isEN ? "Download" : "Pobierz"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BlogGridCard({ item }: { item: HubItem }) {
  const Hero = BLOG_HEROES[item.slug]
  const postImages = getBlogPostImages(item.slug)
  return (
    <Link
      to={item.href}
      className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-400 via-brand-600 to-slate-800 overflow-hidden">
        {postImages?.hero ? (
          <img src={postImages.hero} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : Hero ? (
          <Hero className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mr-1.5" aria-hidden="true" />
            {isEN ? "Article" : "Artykuł"}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-500 font-bold line-clamp-1">
            {item.categoryLabel}
          </span>
        </div>
        <h3 className="font-bold font-display tracking-tight text-lg sm:text-xl leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-brand-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">{item.excerpt}</p>
        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {formatDate(item.date)}
            </span>
            {item.readingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" aria-hidden="true" />
                {item.readingTime}
              </span>
            )}
          </div>
          <span className="font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            {isEN ? "Read" : "Czytaj"}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ContentHubPage
