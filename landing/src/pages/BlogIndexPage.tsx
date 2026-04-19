import { useMemo, useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { NewsletterSignupInline } from "@/components/content/NewsletterSignupInline"
import { getAllBlogPosts } from "@/content/blog"
import { pathMappings } from "@/i18n/paths"
import { BLOG_HEROES } from "@/assets/content-hub/BlogHeroes"
import type { BlogPillar, BlogPersona, BlogFunnel } from "@/content/blog-data/types"
import { BookOpen, ArrowRight, Clock3, Calendar } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PILLAR_LABELS: Record<BlogPillar, { en: string; pl: string; color: string }> = {
  'ai-sourcing-automation': { en: 'AI Sourcing', pl: 'AI Sourcing', color: 'bg-brand-50 text-brand-700 border-brand-200' },
  'erp-crm-integration': { en: 'ERP Integration', pl: 'Integracje ERP', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'multilingual-outreach': { en: 'Multilingual', pl: 'Wielojęzyczny', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'supplier-intelligence': { en: 'Supplier Intelligence', pl: 'Weryfikacja', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  'offer-comparison': { en: 'Offer Comparison', pl: 'Porównanie', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  'supply-chain-strategy': { en: 'Strategy', pl: 'Strategia', color: 'bg-slate-50 text-slate-700 border-slate-200' },
}

const PERSONA_LABELS: Record<BlogPersona, { en: string; pl: string }> = {
  'P1': { en: 'Head of Procurement', pl: 'Head of Procurement' },
  'P2': { en: 'Purchasing Manager', pl: 'Purchasing Manager' },
  'P3': { en: 'Founder / COO', pl: 'Founder / COO' },
  'Mixed': { en: 'All buyers', pl: 'Wszyscy' },
}

const FUNNEL_LABELS: Record<BlogFunnel, { en: string; pl: string }> = {
  'TOFU': { en: 'Awareness', pl: 'Świadomość' },
  'MOFU': { en: 'Evaluation', pl: 'Ewaluacja' },
  'BOFU': { en: 'Decision', pl: 'Decyzja' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BlogIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const allPosts = useMemo(() => getAllBlogPosts(), [])
  const blogBase = pathMappings.blogIndex[LANG]

  const initialPillar = (searchParams.get('pillar') || 'all') as BlogPillar | 'all'
  const [activePillar, setActivePillar] = useState<BlogPillar | 'all'>(initialPillar)

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (activePillar === 'all') newParams.delete('pillar')
    else newParams.set('pillar', activePillar)
    setSearchParams(newParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePillar])

  const filteredPosts = useMemo(() => {
    if (activePillar === 'all') return allPosts
    return allPosts.filter(p => p.pillar === activePillar)
  }, [allPosts, activePillar])

  const pillarCounts = useMemo(() => {
    const counts: Record<BlogPillar | 'all', number> = {
      all: allPosts.length,
      'ai-sourcing-automation': 0,
      'erp-crm-integration': 0,
      'multilingual-outreach': 0,
      'supplier-intelligence': 0,
      'offer-comparison': 0,
      'supply-chain-strategy': 0,
    }
    for (const p of allPosts) counts[p.pillar]++
    return counts
  }, [allPosts])

  const visiblePillars: (BlogPillar | 'all')[] = [
    'all',
    'ai-sourcing-automation',
    'multilingual-outreach',
    'supplier-intelligence',
    'offer-comparison',
    'erp-crm-integration',
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? 'Procurement Blog — Insights for Buyers | Procurea'
            : 'Blog Procurement — Wiedza dla kupców | Procurea',
          description: isEN
            ? 'Sharp analysis of sourcing, supplier management, and procurement automation — written by practitioners, for practitioners.'
            : 'Analizy sourcingu, zarządzania dostawcami i automatyzacji procurement — pisane przez praktyków, dla praktyków.',
        }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
          <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-[120px] pointer-events-none" aria-hidden="true" />
          <AnimatedGrid className="opacity-30" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-600 mb-4">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? 'Blog' : 'Blog'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {isEN
                  ? 'Procurement insights without the corporate voice'
                  : 'Wiedza o procurement bez corporate voice'}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                {isEN
                  ? 'Sharp takes on sourcing, supplier management, and procurement automation. Written by practitioners who still lose sleep over supplier lead times.'
                  : 'Konkretne analizy sourcingu, zarządzania dostawcami i automatyzacji. Pisane przez praktyków, nie marketerów.'}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Pillar filter */}
        <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/85 border-y border-black/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div role="tablist" aria-label={isEN ? 'Filter by topic' : 'Filtruj po temacie'} className="flex flex-wrap items-center gap-2">
              {visiblePillars.map(pillar => {
                const isActive = pillar === activePillar
                const label = pillar === 'all'
                  ? (isEN ? 'All' : 'Wszystkie')
                  : PILLAR_LABELS[pillar][LANG]
                const count = pillarCounts[pillar]
                return (
                  <button
                    key={pillar}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePillar(pillar)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-white border border-black/[0.08] text-slate-700 hover:border-brand-500/40 hover:text-brand-600'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full text-[11px] font-bold px-1.5 min-w-[22px] h-[18px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="font-semibold text-lg mb-2">
                  {isEN ? 'No posts in this category yet' : 'Brak postów w tej kategorii'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isEN ? 'Subscribe for new posts.' : 'Subskrybuj aby otrzymać nowe posty.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, index) => {
                  const title = isEN ? post.title : post.titlePl || post.title
                  const excerpt = isEN ? post.excerptPl ? (isEN ? post.excerpt : post.excerptPl) : post.excerpt : post.excerptPl || post.excerpt
                  const readTime = isEN ? post.readTime : post.readTimePl || post.readTime
                  const pillarInfo = PILLAR_LABELS[post.pillar]
                  const isScheduled = post.status === 'skeleton'
                  const Hero = BLOG_HEROES[post.slug]
                  return (
                    <RevealOnScroll key={post.slug}>
                      <Link
                        to={`${blogBase}/${post.slug}`}
                        className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-400 via-brand-600 to-slate-800 overflow-hidden">
                          {Hero ? (
                            <Hero className="w-full h-full" />
                          ) : (
                            <>
                              <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay" aria-hidden="true">
                                <defs>
                                  <pattern id={`pat-${post.slug}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="1.5" fill="white" />
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill={`url(#pat-${post.slug})`} />
                              </svg>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
                            </>
                          )}
                          {isScheduled && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                                {isEN ? 'Coming soon' : 'Wkrótce'}
                              </span>
                            </div>
                          )}
                          {!isScheduled && index === 0 && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                                ★ {isEN ? 'Featured' : 'Polecane'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-1 p-6">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pillarInfo.color}`}>
                              {pillarInfo[LANG]}
                            </span>
                            <span className="text-xs text-slate-500">
                              {PERSONA_LABELS[post.persona][LANG]}
                            </span>
                          </div>

                          <h3 className="font-bold font-display tracking-tight text-lg sm:text-xl leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-brand-600 transition-colors">
                            {title}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                            {excerpt}
                          </p>

                          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" aria-hidden="true" />
                                {formatDate(post.date)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3 w-3" aria-hidden="true" />
                                {readTime}
                              </span>
                            </div>
                            <span className="font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              {isEN ? 'Read' : 'Czytaj'}
                              <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-gradient-to-br from-brand-500 via-brand-600 to-slate-900">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-5">
              {isEN
                ? 'New posts every week — straight to your inbox'
                : 'Nowe posty co tydzień — prosto na maila'}
            </h2>
            <p className="text-white/80 mb-10 max-w-2xl mx-auto">
              {isEN
                ? 'One email per week. Sharp takes on sourcing, AI tools, and vendor management.'
                : 'Jeden email tygodniowo. Konkretne analizy sourcingu, AI i vendor management.'}
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

export default BlogIndexPage
