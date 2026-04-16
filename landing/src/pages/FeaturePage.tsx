import { Link, useParams } from "react-router-dom"
import { ArrowRight, Check, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { PagePlaceholder } from "@/components/layout/PagePlaceholder"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor, pathMappings, type PathKey } from "@/i18n/paths"
import { getFeature, resolveFeatureSlug } from "@/content/features"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

function getIndustryLink(slug: string): { to: string; label: string } | null {
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
  } : {
    'produkcja': 'Produkcja',
    'eventy': 'Eventy',
    'budownictwo': 'Budownictwo',
    'retail-ecommerce': 'Retail & E-commerce',
  }
  return { to, label: labels[slug] || slug }
}

function getFeatureLink(key: string): { to: string; label: string } | null {
  const pathKey = key as PathKey
  const mapping = pathMappings[pathKey]
  if (!mapping) return null
  const to = mapping[isEN ? 'en' : 'pl']

  const slug = to.split('/').pop() || ''
  const feature = getFeature(slug)
  if (!feature) return { to, label: slug.replace(/-/g, ' ') }
  return { to, label: feature.heroTitle.split(' — ')[0] }
}

export function FeaturePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const resolvedSlug = resolveFeatureSlug(slug)
  const feature = getFeature(resolvedSlug)

  if (!feature) {
    return (
      <PagePlaceholder
        title={isEN ? 'Feature page not found' : 'Nie znaleziono strony funkcji'}
        subtitle={isEN ? `No content for slug "${slug}"` : `Brak treści dla slugu "${slug}"`}
        mvpStage="404"
      />
    )
  }

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to={pathFor('featuresHub')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? 'All features' : 'Wszystkie funkcje'}
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-5">
              {feature.tierBadge}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {feature.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              {feature.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {feature.isSelfServe ? (
                <a
                  href={appendUtm(APP_URL, `feature_${resolvedSlug}_primary`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_primary`)}
                  className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                >
                  {isEN ? 'Start free research' : 'Rozpocznij za darmo'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link
                  to={`${pathFor('contact')}?interest=${feature.interestTag}`}
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_primary`)}
                  className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                >
                  {isEN ? 'Talk to sales' : 'Porozmawiaj z nami'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              <Link
                to={pathFor('pricing')}
                onClick={() => trackCtaClick(`feature_${resolvedSlug}_pricing`)}
                className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-black/[0.1] text-foreground hover:bg-black/[0.03] transition-all"
              >
                {isEN ? 'See pricing' : 'Zobacz cennik'}
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
                {isEN ? 'How it works' : 'Jak to działa'}
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                {isEN ? 'Three steps, zero spreadsheets.' : 'Trzy kroki, zero arkuszy kalkulacyjnych.'}
              </p>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {feature.howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-black/[0.08] bg-white p-6"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
                {isEN ? 'Key capabilities' : 'Kluczowe możliwości'}
              </h2>
            </RevealOnScroll>

            <div className="rounded-2xl border border-black/[0.08] bg-white p-8 md:p-10">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feature.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-700" />
                    </div>
                    <span className="text-sm leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Used by / industries */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                  {isEN ? 'Used by teams in' : 'Używane przez zespoły w'}
                </h2>
                <p className="text-muted-foreground">
                  {isEN ? 'See how this feature fits your industry workflow.' : 'Zobacz jak ta funkcja pasuje do Twojego workflow branżowego.'}
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {feature.relatedIndustries.map((indSlug) => {
                const link = getIndustryLink(indSlug)
                if (!link) return null
                return (
                  <Link
                    key={indSlug}
                    to={link.to}
                    className="group rounded-xl border border-black/[0.08] bg-white p-5 text-center hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="mx-auto mt-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Related features */}
        {feature.relatedFeatures.length > 0 && (
          <section className="py-12 bg-slate-50/50 border-y border-black/[0.04]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                {isEN ? 'Often used with' : 'Często używane z'}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {feature.relatedFeatures.map((featureKey) => {
                  const link = getFeatureLink(featureKey)
                  if (!link) return null
                  return (
                    <Link
                      key={featureKey}
                      to={link.to}
                      className="px-4 py-2 rounded-full bg-white border border-black/[0.08] text-sm font-medium hover:border-primary/30 hover:text-primary transition-all"
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {feature.ctaTitle}
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                {feature.ctaBody}
              </p>
              {feature.isSelfServe ? (
                <a
                  href={appendUtm(APP_URL, `feature_${resolvedSlug}_footer_primary`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_footer_primary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
                >
                  {isEN ? 'Start free research' : 'Rozpocznij za darmo'}
                </a>
              ) : (
                <Link
                  to={`${pathFor('contact')}?interest=${feature.interestTag}`}
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_footer_primary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
                >
                  {isEN ? 'Book a demo' : 'Umów demo'}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
