import { useParams, Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { getCaseStudy, CASE_STUDIES } from "@/content/caseStudies"
import { pathMappings, PathKey } from "@/i18n/paths"
import { ArrowLeft, ArrowRight, Quote, TrendingUp } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const caseStudy = slug ? getCaseStudy(slug) : undefined

  if (!caseStudy) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {isEN ? 'Case study not found' : 'Nie znaleziono case study'}
            </h1>
            <Link to={pathMappings.caseStudiesHub[LANG]} className="text-brand-600 hover:underline">
              {isEN ? '← Back to Case Studies' : '← Wróć do Case Studies'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const relatedCaseStudies = caseStudy.relatedCaseStudies
    .map(csSlug => getCaseStudy(csSlug))
    .filter(Boolean)
    .slice(0, 2)

  const otherCaseStudies = relatedCaseStudies.length
    ? relatedCaseStudies
    : CASE_STUDIES.filter(c => c.slug !== caseStudy.slug).slice(0, 2)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: `${caseStudy.title} | Procurea`,
          description: caseStudy.excerpt,
        }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="pt-28 sm:pt-32 pb-4">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              to={pathMappings.caseStudiesHub[LANG]}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? 'All case studies' : 'Wszystkie case studies'}
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  {caseStudy.industryLabel}
                </span>
                {caseStudy.status === 'skeleton' && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {isEN ? 'Composite from pilot cohort' : 'Kompozyt z beta cohort'}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-6 text-slate-900 leading-tight">
                {caseStudy.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-3xl">
                {caseStudy.excerpt}
              </p>

              {/* Stats pills row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
                {caseStudy.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 p-4 sm:p-5"
                  >
                    <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-800 leading-none mb-1.5">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-700 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Challenge / Solution / Results */}
        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: isEN ? 'The Challenge' : 'Wyzwanie', body: caseStudy.challenge, color: 'rose' },
                { label: isEN ? 'The Solution' : 'Rozwiązanie', body: caseStudy.solution, color: 'brand' },
                { label: isEN ? 'The Results' : 'Wyniki', body: caseStudy.results, color: 'emerald' },
              ].map((section, i) => (
                <RevealOnScroll key={i}>
                  <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-7 h-full">
                    <h2 className={`text-xs font-bold uppercase tracking-[0.15em] mb-3 ${
                      section.color === 'rose' ? 'text-rose-600'
                        : section.color === 'brand' ? 'text-brand-600'
                        : 'text-emerald-700'
                    }`}>
                      {section.label}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{section.body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Quote */}
        {caseStudy.quote && (
          <section className="pb-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <blockquote className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8 sm:p-12">
                  <Quote
                    className="absolute top-6 left-6 h-10 w-10 text-emerald-500/30"
                    aria-hidden="true"
                  />
                  <p className="relative text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed mb-6 pl-14">
                    "{caseStudy.quote.text}"
                  </p>
                  <footer className="pl-14">
                    <div className="font-semibold text-slate-900">{caseStudy.quote.author}</div>
                    <div className="text-sm text-slate-600">
                      {caseStudy.quote.role} · {caseStudy.quote.company}
                    </div>
                  </footer>
                </blockquote>
              </RevealOnScroll>
            </div>
          </section>
        )}

        {/* Features used */}
        {caseStudy.featuresUsed.length > 0 && (
          <section className="pb-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-6">
                {isEN ? 'Procurea features used' : 'Wykorzystane funkcje Procurea'}
              </h2>
              <div className="flex flex-wrap gap-3">
                {caseStudy.featuresUsed.map(featureKey => {
                  const featurePath = pathMappings[featureKey as PathKey]
                  if (!featurePath) return null
                  return (
                    <Link
                      key={featureKey}
                      to={featurePath[LANG]}
                      className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.08] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-500/40 hover:text-brand-600 transition-all"
                    >
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                      {featureKey}
                      <ArrowRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related case studies */}
        {otherCaseStudies.length > 0 && (
          <section className="py-16 bg-slate-50/70 border-t border-black/[0.05]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-8">
                {isEN ? 'More case studies' : 'Więcej case studies'}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {otherCaseStudies.map(cs => cs && (
                  <Link
                    key={cs.slug}
                    to={`${pathMappings.caseStudiesHub[LANG]}/${cs.slug}`}
                    className="group block rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">
                      {cs.industryLabel}
                    </span>
                    <h3 className="font-bold font-display text-lg mb-2 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {cs.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{cs.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      {isEN ? 'Read' : 'Czytaj'}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CaseStudyPage
