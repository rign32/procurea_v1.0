import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { CASE_STUDIES } from "@/content/caseStudies"
import { pathMappings } from "@/i18n/paths"
import { TrendingUp, ArrowRight } from "lucide-react"
import { CASE_STUDY_THUMBNAILS } from "@/assets/content-hub/CaseStudyThumbnails"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'


export function CaseStudiesIndexPage() {
  const caseStudiesBase = pathMappings.caseStudiesHub[LANG]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? 'Case Studies — How Procurement Teams Use Procurea | Procurea'
            : 'Case Studies — Jak zespoły zakupowe używają Procurea | Procurea',
          description: isEN
            ? 'Real sourcing outcomes from the Procurea beta cohort — 8 automotive suppliers in 5 days, Barcelona event vendors in 72h, 14% HoReCa cost reduction.'
            : 'Rzeczywiste wyniki sourcingowe z beta cohort Procurea — 8 dostawców automotive w 5 dni, vendorzy eventowi w 72h, 14% redukcji kosztów HoReCa.',
        }}
      />
      <Navbar />

      <main className="flex-1">
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-white to-emerald-50/20 overflow-hidden">
          <div
            className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.08] blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <AnimatedGrid className="opacity-30" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 mb-4">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? 'Case Studies' : 'Case Studies'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {isEN
                  ? 'Real sourcing outcomes from our pilot cohort'
                  : 'Prawdziwe wyniki sourcingowe z beta cohort'}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                {isEN
                  ? 'Anonymized until customers sign off. Full numbers, full stories, no embellishment — because real numbers are more persuasive than logos.'
                  : 'Anonimizowane do potwierdzenia przez klientów. Pełne liczby, pełne historie — bo liczby przekonują bardziej niż logo.'}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {CASE_STUDIES.map(cs => {
                const Thumbnail = CASE_STUDY_THUMBNAILS[cs.slug]
                const href = `${caseStudiesBase}/${cs.slug}`
                return (
                  <RevealOnScroll key={cs.slug}>
                    <Link
                      to={href}
                      aria-label={cs.title}
                      className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full
                        hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      {/* Industry header — uses Graphic Designer's SVG thumbnail */}
                      <div className="relative overflow-hidden">
                        {Thumbnail ? (
                          <Thumbnail className="w-full" />
                        ) : (
                          <div className="aspect-[16/9] bg-gradient-to-br from-emerald-400 via-teal-600 to-slate-800" />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-sm">
                            {cs.industryLabel}
                          </span>
                        </div>
                        {cs.status === 'skeleton' && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center rounded-full bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              {isEN ? 'Composite' : 'Kompozyt'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-7">
                        {/* Stats row */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {cs.stats.slice(0, 3).map((stat, i) => (
                            <div
                              key={i}
                              className="inline-flex flex-col rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 min-w-[80px]"
                            >
                              <span className="text-lg font-bold text-emerald-800 leading-none">
                                {stat.value}
                              </span>
                              <span className="text-[10px] text-emerald-700 mt-1 leading-tight line-clamp-1">
                                {stat.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <h2 className="font-bold font-display tracking-tight text-xl leading-tight line-clamp-2 mb-3 text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {cs.title}
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                          {cs.excerpt}
                        </p>
                        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-end">
                          <span className="text-sm font-semibold text-emerald-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {isEN ? 'Read the story' : 'Przeczytaj case'}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </RevealOnScroll>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CaseStudiesIndexPage
