import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { RESOURCES } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Download, FileText, Sheet, BookOpenCheck, Clock3, ArrowRight } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const FORMAT_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  xlsx: Sheet,
  docx: FileText,
  notion: BookOpenCheck,
  quiz: Clock3,
  calculator: Sheet,
  video: Clock3,
}

export function ResourcesIndexPage() {
  const resources = useMemo(() => RESOURCES.filter(r => r.status !== 'draft'), [])
  const resourcesBase = pathMappings.resourcesHub[LANG]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: isEN
            ? 'Procurement Guides & Templates — Free Downloads | Procurea'
            : 'Przewodniki i szablony procurement — darmowe do pobrania | Procurea',
          description: isEN
            ? 'Free procurement templates, playbooks, checklists, and calculators. RFQ comparison template, TCO calculator, supplier risk checklist, nearshore migration playbook, vendor scoring framework.'
            : 'Darmowe szablony, playbooki, checklisty i kalkulatory procurement. Do pobrania w formacie Excel, PDF, Notion.',
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-white to-amber-50/20 overflow-hidden">
          <div
            className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/[0.08] blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <AnimatedGrid className="opacity-30" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-amber-700 mb-4">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {isEN ? 'Guides & Templates' : 'Przewodniki i szablony'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-5 text-slate-900">
                {isEN
                  ? 'Tools procurement teams actually use'
                  : 'Narzędzia których zespoły procurement faktycznie używają'}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                {isEN
                  ? 'Battle-tested Excel templates, PDF playbooks, and frameworks — built from 200+ real sourcing projects in the Procurea pilot cohort.'
                  : 'Sprawdzone w boju szablony Excel, playbooki PDF i frameworki — zbudowane na bazie 200+ prawdziwych projektów sourcingowych.'}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Resources grid */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map(resource => {
                const Icon = FORMAT_ICON[resource.format] ?? FileText
                const href = `${resourcesBase}/library/${resource.slug}`
                const isComingSoon = resource.status === 'coming-soon'

                return (
                  <RevealOnScroll key={resource.slug}>
                    <Link
                      to={href}
                      aria-label={`${isEN ? 'Download' : 'Pobierz'}: ${resource.title}`}
                      className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full
                        hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                    >
                      {/* Format + preview block */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="h-20 w-20 text-white/30" aria-hidden="true" />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-sm">
                            {resource.formatLabel}
                          </span>
                        </div>
                        {isComingSoon && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center rounded-full bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              {isEN ? 'Coming soon' : 'Wkrótce'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-6">
                        <h2 className="font-bold font-display tracking-tight text-lg sm:text-xl leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-amber-700 transition-colors">
                          {resource.title}
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                          {resource.excerpt}
                        </p>
                        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {resource.fileSize}
                            {resource.pageCount ? ` · ${resource.pageCount} ${isEN ? 'pages' : 'stron'}` : ''}
                          </span>
                          <span className="font-semibold text-amber-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {isComingSoon
                              ? isEN ? 'Get notified' : 'Powiadom mnie'
                              : isEN ? 'Download' : 'Pobierz'}
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

export default ResourcesIndexPage
