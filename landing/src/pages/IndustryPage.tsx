import { Link, useParams } from "react-router-dom"
import { ArrowRight, AlertTriangle, Sparkles, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { PagePlaceholder } from "@/components/layout/PagePlaceholder"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor, pathMappings, type PathKey } from "@/i18n/paths"
import { getIndustry, resolveSlug } from "@/content/industries"
import { getFeature } from "@/content/features"
import { ConstructionIndustryPage } from "@/pages/industries/ConstructionIndustryPage"
import { ManufacturingIndustryPage } from "@/pages/industries/ManufacturingIndustryPage"
import { EventsIndustryPage } from "@/pages/industries/EventsIndustryPage"
import { RetailIndustryPage } from "@/pages/industries/RetailIndustryPage"
import { HorecaIndustryPage } from "@/pages/industries/HorecaIndustryPage"
import { HealthcareIndustryPage } from "@/pages/industries/HealthcareIndustryPage"
import { LogisticsIndustryPage } from "@/pages/industries/LogisticsIndustryPage"
import { MroIndustryPage } from "@/pages/industries/MroIndustryPage"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Map content topFeatures (PathKey) → feature URL + label
function getFeatureLink(key: string): { to: string; label: string } | null {
  const pathKey = key as PathKey
  const mapping = pathMappings[pathKey]
  if (!mapping) return null
  const to = mapping[isEN ? 'en' : 'pl']

  // Derive label from feature content
  const slug = to.split('/').pop() || ''
  const feature = getFeature(slug)
  if (!feature) {
    // Fallback: prettify slug
    return { to, label: slug.replace(/-/g, ' ') }
  }
  return { to, label: feature.heroTitle.split(' — ')[0] }
}

function getIndustryLink(slug: string): { to: string; label: string } | null {
  // slug is PL key; map to PathKey
  const keyMap: Record<string, PathKey> = {
    'produkcja': 'iManufacturing',
    'eventy': 'iEvents',
    'budownictwo': 'iConstruction',
    'retail-ecommerce': 'iRetail',
    'gastronomia': 'iHoreca',
    'ochrona-zdrowia': 'iHealthcare',
    'logistyka': 'iLogistics',
    'mro-utrzymanie-ruchu': 'iMro',
  }
  const pathKey = keyMap[slug]
  if (!pathKey) return null
  const mapping = pathMappings[pathKey]
  const to = mapping[isEN ? 'en' : 'pl']

  const labels: Record<string, string> = isEN ? {
    'produkcja': 'Manufacturing',
    'eventy': 'Events',
    'budownictwo': 'Construction',
    'retail-ecommerce': 'Retail & E-commerce',
    'gastronomia': 'HoReCa',
    'ochrona-zdrowia': 'Healthcare',
    'logistyka': 'Logistics',
    'mro-utrzymanie-ruchu': 'MRO',
  } : {
    'produkcja': 'Produkcja',
    'eventy': 'Eventy',
    'budownictwo': 'Budownictwo',
    'retail-ecommerce': 'Retail & E-commerce',
    'gastronomia': 'Gastronomia',
    'ochrona-zdrowia': 'Ochrona zdrowia',
    'logistyka': 'Logistyka',
    'mro-utrzymanie-ruchu': 'MRO',
  }
  return { to, label: labels[slug] || slug }
}

export function IndustryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const resolvedSlug = resolveSlug(slug)

  // Dispatch to bespoke industry pages (unique layout, infographics, content)
  switch (resolvedSlug) {
    case 'budownictwo': return <ConstructionIndustryPage />
    case 'produkcja': return <ManufacturingIndustryPage />
    case 'eventy': return <EventsIndustryPage />
    case 'retail-ecommerce': return <RetailIndustryPage />
    case 'gastronomia': return <HorecaIndustryPage />
    case 'ochrona-zdrowia': return <HealthcareIndustryPage />
    case 'logistyka': return <LogisticsIndustryPage />
    case 'mro-utrzymanie-ruchu': return <MroIndustryPage />
  }

  const industry = getIndustry(resolvedSlug)

  if (!industry) {
    return (
      <PagePlaceholder
        title={isEN ? 'Industry page not found' : 'Nie znaleziono strony branży'}
        subtitle={isEN ? `No content for slug "${slug}"` : `Brak treści dla slugu "${slug}"`}
        mvpStage="404"
      />
    )
  }

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 bg-mesh-gradient overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />
          <div className="absolute bottom-10 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[100px] bg-emerald-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-40" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to={pathFor('industriesHub')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors underline-slide"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? 'All industries' : 'Wszystkie branże'}
            </Link>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {industry.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              {industry.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={appendUtm(APP_URL, `industry_${resolvedSlug}_primary`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick(`industry_${resolvedSlug}_primary`)}
                className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                {isEN ? 'Start free' : 'Zacznij za darmo'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                to={`${pathFor('contact')}?interest=${industry.interestTag}#calendar`}
                onClick={() => trackCtaClick(`industry_${resolvedSlug}_secondary`)}
                className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-black/[0.1] text-foreground hover:bg-black/[0.03] transition-all"
              >
                {isEN ? 'Talk to sales' : 'Porozmawiaj z nami'}
              </Link>
            </div>
          </div>
        </section>

        {/* Pain points */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-red-800 uppercase tracking-wider mb-3">
                  <AlertTriangle className="h-3 w-3" />
                  {isEN ? 'The problem' : 'Problem'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {isEN ? 'What slows down procurement in your industry' : 'Co spowalnia procurement w Twojej branży'}
                </h2>
              </div>
            </RevealOnScroll>

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
              {industry.painPoints.map((point) => (
                <motion.div key={point.title} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className="rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-lg font-bold mb-3">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How Procurea helps */}
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Sparkles className="h-3 w-3" />
                  {isEN ? 'The solution' : 'Rozwiązanie'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {isEN ? 'How Procurea helps' : 'Jak Procurea pomaga'}
                </h2>
              </div>
            </RevealOnScroll>

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
              {industry.howProcureaHelps.map((help, idx) => (
                <motion.div key={help.title} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className="group rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary font-bold mb-4 group-hover:scale-110 transition-transform duration-200">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{help.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{help.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Case study */}
        {industry.caseStudy && (
          <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20">
            <RevealOnScroll>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="shrink-0 text-center md:text-left">
                    <div className="text-4xl md:text-5xl font-extrabold text-emerald-600">{industry.caseStudy.stat}</div>
                    <div className="text-sm text-muted-foreground mt-1">{industry.caseStudy.statLabel}</div>
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600/70 mb-1">
                      {isEN ? 'Projected scenario' : 'Scenariusz modelowy'}
                    </span>
                    <h3 className="text-lg font-bold mb-2">{industry.caseStudy.headline}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{industry.caseStudy.body}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </section>
        )}

        {/* Cross-links: features + related industries */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 border-t border-black/[0.06]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isEN ? 'Key features' : 'Kluczowe funkcje'}:
            </span>
            {industry.topFeatures.map((featureKey) => {
              const link = getFeatureLink(featureKey)
              if (!link) return null
              return (
                <Link
                  key={featureKey}
                  to={link.to}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-foreground hover:bg-slate-200 transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {industry.relatedIndustries.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isEN ? 'Related' : 'Powiązane'}:
              </span>
              {industry.relatedIndustries.map((indSlug) => {
                const link = getIndustryLink(indSlug)
                if (!link) return null
                return (
                  <Link
                    key={indSlug}
                    to={link.to}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-foreground hover:bg-slate-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[80px] bg-primary pointer-events-none" />
              <div className="absolute bottom-10 -left-20 w-[250px] h-[250px] rounded-full opacity-[0.04] blur-[80px] bg-emerald-400 pointer-events-none" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {industry.ctaTitle}
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                {industry.ctaBody}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={appendUtm(APP_URL, `industry_${resolvedSlug}_footer_primary`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick(`industry_${resolvedSlug}_footer_primary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isEN ? 'Start free' : 'Zacznij za darmo'}
                </a>
                <Link
                  to={`${pathFor('contact')}?interest=${industry.interestTag}#calendar`}
                  onClick={() => trackCtaClick(`industry_${resolvedSlug}_footer_secondary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  {isEN ? 'Book a demo' : 'Umów demo'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
