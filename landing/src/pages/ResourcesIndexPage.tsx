import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ResourceCover } from "@/components/content/ResourceCover"
import { RESOURCES } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Download, Search, ArrowRight } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type FormatFilter = "all" | "pdf" | "xlsx" | "notion"

const FILTER_LABELS: Record<FormatFilter, { en: string; pl: string }> = {
  all:    { en: "All",    pl: "Wszystkie" },
  pdf:    { en: "PDF",    pl: "PDF" },
  xlsx:   { en: "Excel",  pl: "Excel" },
  notion: { en: "Notion", pl: "Notion" },
}

export function ResourcesIndexPage() {
  const all = useMemo(() => RESOURCES.filter(r => r.status !== "draft"), [])
  const resourcesBase = pathMappings.resourcesHub[LANG]

  const [filter, setFilter] = useState<FormatFilter>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = all
    if (filter !== "all") {
      list = list.filter(r => r.format === filter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.excerpt.toLowerCase().includes(q) ||
          r.primaryKeyword?.toLowerCase().includes(q)
      )
    }
    return list
  }, [all, filter, query])

  const countFor = (f: FormatFilter) => {
    if (f === "all") return all.length
    return all.filter(r => r.format === f).length
  }

  // Flagship = nearshore playbook
  const flagship = all.find(r => r.slug === "nearshore-migration-playbook") ?? all[0]
  const rest = all.filter(r => r.slug !== flagship?.slug)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? "Procurement Guides & Templates — Free Downloads | Procurea"
            : "Przewodniki i szablony procurement — darmowe do pobrania | Procurea",
          description: isEN
            ? "Free procurement templates, playbooks, checklists, and calculators. Download as PDF, Excel, or duplicate the Notion version."
            : "Darmowe szablony, playbooki, checklisty i kalkulatory procurement. Pobierz jako PDF, Excel lub duplikuj Notion.",
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* ═══════ HERO — light, matches landing warmth ═══════ */}
        <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-14 bg-gradient-to-b from-white via-[hsl(var(--ds-accent-soft))]/40 to-white overflow-hidden">
          <div
            className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-[hsl(var(--ds-accent))]/[0.06] blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[hsl(var(--ds-accent))] mb-4">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? "Free · No credit card" : "Za darmo · bez karty"}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {isEN
                  ? "Procurement tools that actually ship"
                  : "Narzędzia procurement, które działają"}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {isEN
                  ? "Five working documents. Templates, playbooks, calculators. Built from 200+ real sourcing projects in the Procurea pilot. Download, fork, use on Monday."
                  : "Pięć praktycznych dokumentów — szablony, playbooki, kalkulatory. Zbudowane na bazie 200+ prawdziwych projektów sourcingowych z pilotażu Procurea. Pobierz, zmodyfikuj, wdróż w poniedziałek."}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══════ FLAGSHIP FEATURED — big cover + copy ═══════ */}
        {flagship && (
          <section className="pb-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <Link
                to={`${resourcesBase}/${flagship.slug}`}
                className="group block rounded-3xl bg-gradient-to-br from-[hsl(var(--ds-accent-soft))] via-white to-white border border-black/[0.06] overflow-hidden hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-0 items-stretch">
                  {/* Cover */}
                  <div className="bg-[#0b1a3d] p-8 sm:p-10 md:p-12 flex items-center justify-center">
                    <div className="w-full max-w-lg">
                      <ResourceCover slug={flagship.slug} title={flagship.title} size="hero" hover={false} />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))] font-mono text-[10px] uppercase tracking-[0.12em] font-bold">
                        {isEN ? "Flagship" : "Flagowy"}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-500 font-bold">
                        {flagship.formatLabel}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold font-display tracking-tight text-slate-900 leading-[1.15] mb-4">
                      {flagship.title}
                    </h2>
                    <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-prose">
                      {flagship.excerpt}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap mt-auto">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--ds-accent))] group-hover:bg-[hsl(var(--ds-accent))]/90 text-white font-semibold py-3 px-5 text-sm transition-colors">
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {isEN ? "Download free" : "Pobierz za darmo"}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
                        {flagship.fileSize}
                        {flagship.pageCount ? ` · ${flagship.pageCount} ${isEN ? "pages" : "stron"}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ═══════ FILTER BAR ═══════ */}
        <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-md border-y border-black/[0.06]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 font-bold mr-1">
              {isEN ? "Filter" : "Filtr"}
            </span>
            {(Object.keys(FILTER_LABELS) as FormatFilter[]).map(f => {
              const count = countFor(f)
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-black/[0.08] hover:border-[hsl(var(--ds-accent))] hover:text-[hsl(var(--ds-accent))]"
                  }`}
                >
                  {FILTER_LABELS[f][isEN ? "en" : "pl"]}
                  <span className={`font-mono text-[10px] ${active ? "text-white/70" : "text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              )
            })}

            <div className="ml-auto flex items-center gap-2 bg-slate-50 border border-black/[0.06] rounded-lg px-3 py-1.5 min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isEN ? "Search — nearshore, RFQ, TCO…" : "Szukaj — nearshore, RFQ, TCO…"}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                aria-label={isEN ? "Search resources" : "Szukaj materiałów"}
              />
            </div>
          </div>
        </div>

        {/* ═══════ RESOURCE GRID ═══════ */}
        <section className="py-12 pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-500">
                  {isEN ? "No resources match your filter." : "Żaden materiał nie pasuje do filtra."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filter === "all" && !query ? rest : filtered).map(resource => (
                  <ResourceCard key={resource.slug} resource={resource} resourcesBase={resourcesBase} />
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
/* ResourceCard — flat modern card with real cover illustration         */
/* ------------------------------------------------------------------ */

interface ResourceCardProps {
  resource: {
    slug: string
    title: string
    excerpt: string
    formatLabel: string
    fileSize?: string
    pageCount?: number
  }
  resourcesBase: string
}

function ResourceCard({ resource, resourcesBase }: ResourceCardProps) {
  return (
    <RevealOnScroll>
      <Link
        to={`${resourcesBase}/${resource.slug}`}
        className="group flex flex-col rounded-2xl bg-white border border-black/[0.06] overflow-hidden h-full
          hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-black/[0.12]
          transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ds-accent))] focus-visible:ring-offset-2"
      >
        {/* Cover illustration — navy bg already in illustration */}
        <ResourceCover slug={resource.slug} title={resource.title} hover={false} />

        {/* Body */}
        <div className="flex flex-col flex-1 p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[hsl(var(--ds-accent))] font-bold mb-3">
            {resource.formatLabel}
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-[hsl(var(--ds-accent))] transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1 mb-4">
            {resource.excerpt}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] text-xs">
            <span className="font-mono text-slate-500 tracking-[0.02em]">
              {resource.fileSize}
              {resource.pageCount ? ` · ${resource.pageCount} str` : ""}
            </span>
            <span className="font-semibold text-[hsl(var(--ds-accent))] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {isEN ? "Download" : "Pobierz"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  )
}

export default ResourcesIndexPage
