import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { BookCover3D } from "@/components/content/BookCover3D"
import { getBookCoverConfig } from "@/content/bookCoverConfig"
import { RESOURCES } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { BookOpen, Search, ArrowRight, Sparkles } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type FormatFilter = "all" | "pdf" | "xlsx" | "notion" | "calculator"

const FILTER_LABELS: Record<FormatFilter, { en: string; pl: string }> = {
  all:        { en: "All",        pl: "Wszystkie" },
  pdf:        { en: "PDF",        pl: "PDF" },
  xlsx:       { en: "Excel",      pl: "Excel" },
  notion:     { en: "Notion",     pl: "Notion" },
  calculator: { en: "Calculator", pl: "Kalkulator" },
}

export function ResourcesIndexPage() {
  const all = useMemo(() => RESOURCES.filter(r => r.status !== "draft"), [])
  const resourcesBase = pathMappings.resourcesHub[LANG]

  const [filter, setFilter] = useState<FormatFilter>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = all
    if (filter !== "all") {
      list = list.filter(r => {
        if (filter === "pdf") return r.format === "pdf"
        if (filter === "xlsx") return r.format === "xlsx"
        if (filter === "notion") return r.format === "notion"
        if (filter === "calculator") return r.format === "calculator" || r.format === "xlsx"
        return true
      })
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
    return all.filter(r => {
      if (f === "pdf") return r.format === "pdf"
      if (f === "xlsx") return r.format === "xlsx"
      if (f === "notion") return r.format === "notion"
      if (f === "calculator") return r.format === "calculator" || r.format === "xlsx"
      return false
    }).length
  }

  // Featured = first 3 (flagship, then whatever comes next)
  const flagship = all[all.length - 1] ?? all[0] // nearshore playbook is last-defined
  const flagshipIsIn = filtered.some(r => r.slug === flagship?.slug)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? "The Procurea Library — Procurement Handbooks, Not Slideware"
            : "Biblioteka Procurea — Praktyczne Przewodniki, Nie Slajdy",
          description: isEN
            ? "Five working documents and one weekly newsletter. Free to read online. PDF and Excel downloads when you want to keep a copy."
            : "Pięć praktycznych dokumentów i cotygodniowy newsletter. Darmowe online. PDF i Excel do pobrania kiedy chcesz zachować kopię.",
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* ═══════ LIBRARY HERO — dark navy with 3D book stack ═══════ */}
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden bg-[linear-gradient(135deg,#162a52_0%,#0b1a3d_100%)] text-white">
          <div
            className="absolute -right-32 -top-40 w-[440px] h-[440px] rounded-full bg-[radial-gradient(circle,rgba(244,200,66,0.14),transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -left-24 -bottom-32 w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(59,91,160,0.32),transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f4c842] mb-4">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? "Procurea · The Library" : "Procurea · Biblioteka"}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold font-display tracking-tight mb-5 leading-[1.02] text-white max-w-[16ch]">
                {isEN ? (
                  <>
                    Procurement <em className="not-italic text-[#f4c842]">handbooks,</em> not slideware.
                  </>
                ) : (
                  <>
                    Procurement <em className="not-italic text-[#f4c842]">handbooki,</em> nie slajdy.
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-[48ch]">
                {isEN ? (
                  <>
                    <strong className="text-white font-semibold">Five working documents, one living newsletter.</strong>{" "}
                    Everything here can be read now — no email wall. PDF and Excel downloads when you want a copy.
                  </>
                ) : (
                  <>
                    <strong className="text-white font-semibold">Pięć praktycznych dokumentów i żywy newsletter.</strong>{" "}
                    Wszystko do czytania tu i teraz — bez bramek. PDF i Excel do pobrania kiedy chcesz kopię.
                  </>
                )}
              </p>

              <div className="flex gap-3 mt-6 flex-wrap">
                <a
                  href="#library"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f4c842] hover:bg-[#e6b82e] text-[#0e1614] font-semibold py-3 px-5 text-sm shadow-[0_2px_0_#d9a82a,0_4px_14px_rgba(244,200,66,0.35)] transition-colors"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {isEN ? "Browse the library" : "Przeglądaj bibliotekę"}
                </a>
                <a
                  href={`${resourcesBase}/library/nearshore-migration-playbook`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold py-3 px-5 text-sm transition-colors"
                >
                  {isEN ? "Open flagship handbook" : "Otwórz flagowy handbook"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="font-mono text-3xl font-medium text-[#f4c842] leading-none tracking-tight">
                    {all.length}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 mt-1.5">
                    {isEN ? "Core handbooks" : "Handbooki"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-3xl font-medium text-[#f4c842] leading-none tracking-tight">39</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 mt-1.5">
                    {isEN ? "Weekly editions" : "Wydań co tydzień"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-3xl font-medium text-[#f4c842] leading-none tracking-tight">4,200</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 mt-1.5">
                    {isEN ? "CPOs reading" : "CPO czyta"}
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Floating 3D book stack */}
            <div className="relative h-[420px] hidden lg:block" aria-hidden="true">
              {all.slice(0, 3).map((r, i) => {
                const cfg = getBookCoverConfig(r.slug)
                const positions = [
                  { right: "4%", top: "16%", z: 3, width: "54%", opacity: 1 },
                  { right: "22%", top: "32%", z: 2, width: "50%", opacity: 0.92 },
                  { right: "40%", top: "48%", z: 1, width: "48%", opacity: 0.78 },
                ]
                const pos = positions[i]
                return (
                  <div
                    key={r.slug}
                    className="absolute"
                    style={{ right: pos.right, top: pos.top, width: pos.width, zIndex: pos.z, opacity: pos.opacity }}
                  >
                    <BookCover3D
                      variant={cfg.variant}
                      coverBg={cfg.coverBg}
                      spineBg={cfg.spineBg}
                      spineText={cfg.spineText}
                      kicker={cfg.kicker}
                      title={r.title}
                      footLabel={cfg.footLabel}
                      pageCount={cfg.pageCount}
                      pageUnit={cfg.pageUnit}
                      motif={cfg.motif}
                      pill={cfg.pill}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════ FILTER BAR ═══════ */}
        <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-md border-b border-black/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 font-bold mr-1">
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
                      ? "bg-[#162a52] text-white border-[#162a52]"
                      : "bg-white text-slate-700 border-black/[0.08] hover:border-[#3b5ba0] hover:text-[#162a52]"
                  }`}
                >
                  {FILTER_LABELS[f][isEN ? "en" : "pl"]}
                  <span
                    className={`font-mono text-[10px] ${active ? "text-[#f4c842]" : "text-slate-400"}`}
                  >
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
                placeholder={
                  isEN
                    ? "Search — nearshore, RFQ, TCO…"
                    : "Szukaj — nearshore, RFQ, TCO…"
                }
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                aria-label={isEN ? "Search resources" : "Szukaj materiałów"}
              />
            </div>
          </div>
        </div>

        {/* ═══════ FEATURED (shown only when flagship is in filter) ═══════ */}
        {flagshipIsIn && flagship && (
          <section className="py-10 lg:py-12" id="library">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 max-w-[30ch]">
                  {isEN ? (
                    <>On the front table <em className="text-[#162a52] italic">this quarter.</em></>
                  ) : (
                    <>Na eksponowanym miejscu <em className="text-[#162a52] italic">w tym kwartale.</em></>
                  )}
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  {isEN ? "Revised · Apr 2026" : "Aktualizacja · kwi 2026"}
                </span>
              </div>

              <FeatureCell resource={flagship} large resourcesBase={resourcesBase} />
            </div>
          </section>
        )}

        {/* ═══════ LIBRARY SHELF — grid of books ═══════ */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_14px_rgba(11,18,32,0.06)] px-5 sm:px-7 pt-5 pb-7">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-5">
                <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
                  {isEN ? "The full library" : "Cała biblioteka"}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold">
                  {filtered.length} {isEN ? "titles" : "tytułów"} · {isEN ? "sorted by category" : "wg kategorii"}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 text-sm">
                    {isEN
                      ? "No resources match your filter."
                      : "Żaden materiał nie pasuje do filtra."}
                  </p>
                </div>
              ) : (
                <div
                  className="relative grid gap-5 pt-7 pb-3 px-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                    before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:bg-gradient-to-b before:from-[#c9cfdb] before:to-[#7f8899] before:rounded-sm before:shadow-[0_6px_14px_rgba(8,14,28,0.18)]"
                >
                  {filtered.map(resource => (
                    <ShelfBook key={resource.slug} resource={resource} resourcesBase={resourcesBase} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════ NEWSLETTER BAND ═══════ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(135deg,#162a52_0%,#0b1a3d_100%)] text-white relative overflow-hidden">
          <div
            className="absolute -right-16 -top-20 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(244,200,66,0.14),transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white max-w-[22ch]">
                {isEN ? (
                  <>Weekly procurement notes, <em className="not-italic text-[#f4c842]">straight to your inbox.</em></>
                ) : (
                  <>Cotygodniowe notatki procurement, <em className="not-italic text-[#f4c842]">prosto do skrzynki.</em></>
                )}
              </h2>
              <p className="text-sm text-white/72 mt-3 max-w-[44ch]">
                {isEN
                  ? "One email, every Sunday. One benchmark, one playbook, one mistake. 6-minute read. 4,200 CPOs reading."
                  : "Jeden email, każda niedziela. Jeden benchmark, jeden playbook, jeden błąd. 6 minut czytania. 4 200 CPO czyta."}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50 mt-4">
                {isEN
                  ? "No spam · unsubscribe in one click · Rafał writes every one"
                  : "Zero spamu · wypisujesz się jednym kliknięciem · Rafał pisze każdy"}
              </p>
            </div>
            <form
              className="flex gap-2 bg-white/8 p-1.5 rounded-[10px] border border-white/12"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={isEN ? "your@work.email" : "twój@email.firmowy"}
                className="flex-1 bg-transparent border-0 px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#f4c842] hover:bg-[#e6b82e] text-[#0e1614] font-semibold px-5 py-2.5 text-sm"
              >
                {isEN ? "Subscribe" : "Zapisz się"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helper components                                                    */
/* ------------------------------------------------------------------ */

interface ResourceLike {
  slug: string
  title: string
  excerpt: string
  formatLabel: string
  fileSize?: string
  pageCount?: number
  status?: string
}

function FeatureCell({
  resource,
  resourcesBase,
  large = false,
}: {
  resource: ResourceLike
  resourcesBase: string
  large?: boolean
}) {
  const cfg = getBookCoverConfig(resource.slug)
  const href = `${resourcesBase}/library/${resource.slug}`
  const isComingSoon = resource.status === "coming-soon"

  return (
    <Link
      to={href}
      className={`group grid bg-white rounded-2xl border border-black/[0.08] overflow-hidden transition-all hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 ${
        large ? "grid-cols-1 md:grid-cols-[1fr_1.3fr]" : "grid-cols-1 md:grid-cols-[1fr_1.1fr]"
      }`}
    >
      <div
        className={`flex items-center justify-center py-7 sm:py-9 px-3 sm:px-5 border-b md:border-b-0 md:border-r border-black/[0.05] ${
          large ? "bg-[linear-gradient(135deg,#0b1a3d_0%,#162a52_100%)]" : "bg-[linear-gradient(135deg,#f7f9fd_0%,#e3e8f2_100%)]"
        }`}
      >
        <div className="w-full max-w-[320px]">
          <BookCover3D
            variant={cfg.variant}
            coverBg={cfg.coverBg}
            spineBg={cfg.spineBg}
            spineText={cfg.spineText}
            kicker={cfg.kicker}
            title={resource.title}
            dek={resource.excerpt}
            footLabel={cfg.footLabel}
            pageCount={cfg.pageCount}
            pageUnit={cfg.pageUnit}
            motif={cfg.motif}
            pill={cfg.pill}
            comingSoonLabel={isComingSoon ? (isEN ? "Coming soon" : "Wkrótce") : undefined}
          />
        </div>
      </div>

      <div className={`flex flex-col gap-3 ${large ? "p-7 sm:p-9" : "p-6 sm:p-7"}`}>
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#162a52] font-bold">
          {resource.formatLabel}
          {resource.pageCount ? (
            <>
              {" · "}
              <span className="text-slate-500 font-semibold">
                {resource.pageCount} {isEN ? "pages" : "stron"}
              </span>
            </>
          ) : null}
        </div>
        <h3
          className={`font-bold font-display tracking-tight text-slate-900 leading-[1.12] ${
            large ? "text-2xl sm:text-3xl" : "text-xl sm:text-[22px]"
          }`}
        >
          {resource.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">{resource.excerpt}</p>
        <div className="flex gap-2 flex-wrap pt-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e7ecf5] text-[#162a52] font-mono text-[10px] uppercase tracking-[0.1em] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0f7a4f]" />
            {isEN ? "Free to read" : "Za darmo"}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-slate-700 border border-black/[0.08] font-mono text-[10px] uppercase tracking-[0.1em] font-bold">
            {resource.fileSize}
          </span>
        </div>
      </div>
    </Link>
  )
}

function ShelfBook({
  resource,
  resourcesBase,
}: {
  resource: ResourceLike
  resourcesBase: string
}) {
  const cfg = getBookCoverConfig(resource.slug)
  const href = `${resourcesBase}/library/${resource.slug}`
  const isComingSoon = resource.status === "coming-soon"

  return (
    <div>
      <Link to={href} className="block">
        <BookCover3D
          variant={cfg.variant}
          coverBg={cfg.coverBg}
          spineBg={cfg.spineBg}
          spineText={cfg.spineText}
          kicker={cfg.kicker}
          title={resource.title}
          footLabel={cfg.footLabel}
          pageCount={cfg.pageCount}
          pageUnit={cfg.pageUnit}
          motif={cfg.motif}
          pill={cfg.pill}
          comingSoonLabel={isComingSoon ? (isEN ? "Coming soon" : "Wkrótce") : undefined}
        />
      </Link>
      <Link
        to={href}
        className="mt-4 block rounded-lg bg-white border border-black/[0.06] px-4 py-3 hover:border-[#3b5ba0] transition-colors"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#162a52] font-bold">
          {resource.formatLabel}
        </div>
        <h4 className="text-[15px] font-bold font-display tracking-tight text-slate-900 leading-tight mt-1 line-clamp-2">
          {resource.title}
        </h4>
        <div className="flex justify-between font-mono text-[10px] text-slate-500 mt-2">
          <span>
            {resource.pageCount
              ? `${resource.pageCount} ${isEN ? "pages" : "stron"}`
              : resource.fileSize}
          </span>
          <span className="text-[#162a52] font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            {isEN ? "Open" : "Otwórz"} →
          </span>
        </div>
      </Link>
    </div>
  )
}

export default ResourcesIndexPage
