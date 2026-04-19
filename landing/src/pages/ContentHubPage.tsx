import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { ContentCard } from "@/components/content/ContentCard"
import { CategoryFilter, type FilterValue } from "@/components/content/CategoryFilter"
import { NewsletterSignupInline } from "@/components/content/NewsletterSignupInline"
import { getAllHubItems, filterHubItems, type ContentType } from "@/content/contentHub"
import { Sparkles } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function ContentHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const allItems = useMemo(() => getAllHubItems(), [])

  const initialFilter = (searchParams.get('type') as FilterValue) || 'all'
  const [activeFilter, setActiveFilter] = useState<FilterValue>(
    ['all', 'blog', 'resource', 'case-study'].includes(initialFilter) ? initialFilter : 'all'
  )

  // Sync filter to URL query params
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (activeFilter === 'all') {
      newParams.delete('type')
    } else {
      newParams.set('type', activeFilter)
    }
    setSearchParams(newParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: allItems.length,
      blog: 0,
      resource: 0,
      'case-study': 0,
    }
    for (const item of allItems) {
      base[item.type]++
    }
    return base
  }, [allItems])

  const filteredItems = useMemo(
    () => filterHubItems(allItems, activeFilter),
    [allItems, activeFilter]
  )

  const featuredItems = activeFilter === 'all' ? filteredItems.slice(0, 2) : []
  const gridItems = activeFilter === 'all' ? filteredItems.slice(2) : filteredItems

  const filterOptions = [
    { value: 'all' as FilterValue, labelEn: 'All', labelPl: 'Wszystkie', count: counts.all },
    { value: 'blog' as FilterValue, labelEn: 'Blog', labelPl: 'Blog', count: counts.blog },
    { value: 'resource' as FilterValue, labelEn: 'Guides', labelPl: 'Przewodniki', count: counts.resource },
    { value: 'case-study' as FilterValue, labelEn: 'Case Studies', labelPl: 'Case Studies', count: counts['case-study'] },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? 'Resources — Procurement Insights, Guides & Case Studies | Procurea'
            : 'Materiały — Wiedza, przewodniki i case studies | Procurea',
          description: isEN
            ? 'Practical procurement resources for buyers who want fewer Excel nights. Articles, downloadable guides, and real case studies from Procurea beta cohort.'
            : 'Praktyczne materiały dla zespołów zakupowych. Artykuły, przewodniki do pobrania i rzeczywiste case studies z beta cohort Procurea.',
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* 2. Hero */}
        <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
          {/* Ambient blobs */}
          <div
            className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-40 -left-32 w-[500px] h-[500px] rounded-full bg-sage-500/[0.05] blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <AnimatedGrid className="opacity-30" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-600 mb-5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? 'Procurement Knowledge Hub' : 'Centrum Wiedzy Procurement'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {isEN
                  ? 'Procurement insights, guides, and case studies'
                  : 'Wiedza, przewodniki i case studies'}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10">
                {isEN
                  ? 'Practical resources for procurement teams — written by practitioners who still lose sleep over supplier lead times, not marketers.'
                  : 'Praktyczne materiały dla zespołów zakupowych — pisane przez praktyków, nie marketerów. Bez corporate voice.'}
              </p>
              <NewsletterSignupInline variant="hero" />
            </RevealOnScroll>
          </div>
        </section>

        {/* 3. Filter bar (sticky) */}
        <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/85 border-y border-black/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <CategoryFilter
              options={filterOptions}
              active={activeFilter}
              onChange={setActiveFilter}
            />
          </div>
        </div>

        {/* 4. Featured row — only in "All" view */}
        {featuredItems.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                  {isEN ? 'Featured' : 'Polecane'}
                </h2>
                <span className="text-sm text-slate-500">
                  {isEN ? 'Start here' : 'Zacznij tutaj'}
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredItems.map((item) => (
                  <RevealOnScroll key={item.slug}>
                    <ContentCard item={{ ...item, isFeatured: true }} size="featured" />
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Grid */}
        <section className={featuredItems.length > 0 ? 'pb-20' : 'py-12 sm:py-16'}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {featuredItems.length > 0 && (
              <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                  {isEN ? 'All resources' : 'Wszystkie materiały'}
                </h2>
                <span className="text-sm text-slate-500">
                  {gridItems.length} {isEN ? 'items' : 'pozycji'}
                </span>
              </div>
            )}

            {gridItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {isEN ? 'Nothing here yet' : 'Nic tutaj jeszcze nie ma'}
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  {isEN
                    ? 'We are building fresh content in this category. Subscribe above and we will tell you when it is live.'
                    : 'Pracujemy nad nowymi materiałami w tej kategorii. Zapisz się powyżej, dostaniesz info gdy będą gotowe.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((item) => (
                  <RevealOnScroll key={item.slug}>
                    <ContentCard item={item} />
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. Newsletter CTA */}
        <section className="py-20 bg-gradient-to-br from-brand-500 via-brand-600 to-slate-900 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-white mb-5">
              {isEN
                ? 'Weekly procurement notes, straight to your inbox'
                : 'Cotygodniowe notki procurement, prosto na maila'}
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              {isEN
                ? 'One email per week. Sharp analysis of procurement trends, vendor strategies, and AI sourcing tactics from the field.'
                : 'Jeden email tygodniowo. Analizy trendów w zakupach, strategii vendorów i taktyk AI sourcing.'}
            </p>
            <div className="flex justify-center">
              <NewsletterSignupInline variant="hero" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ContentHubPage
