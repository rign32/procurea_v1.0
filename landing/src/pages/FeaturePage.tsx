import type { ComponentType } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowRight, Check, ChevronRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { PagePlaceholder } from "@/components/layout/PagePlaceholder"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor, pathMappings, type PathKey } from "@/i18n/paths"
import { getFeature, resolveFeatureSlug } from "@/content/features"
import { AiSourcingMockup } from "@/components/feature-mockups/AiSourcingMockup"
import { EmailOutreachMockup } from "@/components/feature-mockups/EmailOutreachMockup"
import { SupplierPortalMockup } from "@/components/feature-mockups/SupplierPortalMockup"
import { OfferComparisonMockup } from "@/components/feature-mockups/OfferComparisonMockup"
import { AiSourcingFeaturePage } from "@/pages/features/AiSourcingFeaturePage"
import { SupplierDatabaseFeaturePage } from "@/pages/features/SupplierDatabaseFeaturePage"
import { EmailOutreachFeaturePage } from "@/pages/features/EmailOutreachFeaturePage"
import { SupplierPortalFeaturePage } from "@/pages/features/SupplierPortalFeaturePage"
import { OfferComparisonFeaturePage } from "@/pages/features/OfferComparisonFeaturePage"
import { MultilingualOutreachFeaturePage } from "@/pages/features/MultilingualOutreachFeaturePage"
import { AutoFollowUpFeaturePage } from "@/pages/features/AutoFollowUpFeaturePage"
import { ContactEnrichmentFeaturePage } from "@/pages/features/ContactEnrichmentFeaturePage"
import { OfferCollectionFeaturePage } from "@/pages/features/OfferCollectionFeaturePage"
import { AiInsightsFeaturePage } from "@/pages/features/AiInsightsFeaturePage"

// Keyed by canonical (PL) slug returned by resolveFeatureSlug()
const MOCKUPS: Record<string, ComponentType> = {
  'ai-sourcing': AiSourcingMockup,
  'outreach-mailowy': EmailOutreachMockup,
  'supplier-portal': SupplierPortalMockup,
  'porownywarka-ofert': OfferComparisonMockup,
}

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

  // Dispatch to bespoke feature pages (unique layout, infographics, content)
  switch (resolvedSlug) {
    case 'ai-sourcing': return <AiSourcingFeaturePage />
    case 'company-registry': return <SupplierDatabaseFeaturePage />
    case 'outreach-mailowy': return <EmailOutreachFeaturePage />
    case 'supplier-portal': return <SupplierPortalFeaturePage />
    case 'porownywarka-ofert': return <OfferComparisonFeaturePage />
    case 'wielojezyczny-outreach': return <MultilingualOutreachFeaturePage />
    case 'auto-follow-up': return <AutoFollowUpFeaturePage />
    case 'enrichment-kontaktow': return <ContactEnrichmentFeaturePage />
    case 'zbieranie-ofert': return <OfferCollectionFeaturePage />
    case 'ai-insights': return <AiInsightsFeaturePage />
  }

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

  const Mockup = MOCKUPS[resolvedSlug]

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 bg-mesh-gradient overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />
          <div className="absolute bottom-10 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[100px] bg-emerald-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-40" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to={pathFor('featuresHub')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors underline-slide"
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
                  {isEN ? 'Start free' : 'Zacznij za darmo'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link
                  to={`${pathFor('contact')}?interest=${feature.interestTag}#calendar`}
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

        {/* Feature-specific dashboard mockup */}
        {Mockup && (
          <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
            <Mockup />
          </section>
        )}

        {/* Problem narrative (optional — flagship feature pages only) */}
        {feature.problemSection && (
          <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50/40">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10 leading-tight">
                  {feature.problemSection.heading}
                </h2>
              </RevealOnScroll>
              <div className="space-y-5">
                {feature.problemSection.paragraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How it works — uses detailedSteps if available (5-step flagship layout), else howItWorks (3-step) */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
                {isEN ? 'How it works' : 'Jak to działa'}
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                {feature.detailedSteps
                  ? (isEN ? 'Inside the AI pipeline — step by step.' : 'Wewnątrz AI pipeline — krok po kroku.')
                  : (isEN ? 'Three steps, zero spreadsheets.' : 'Trzy kroki, zero arkuszy kalkulacyjnych.')}
              </p>
            </RevealOnScroll>

            {feature.detailedSteps ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {feature.detailedSteps.map((step) => (
                  <motion.div key={step.step} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.body}</p>
                    {step.techDetail && (
                      <div className="mt-auto flex items-start gap-2 pt-4 border-t border-black/[0.06]">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                        <span className="text-xs text-muted-foreground leading-relaxed italic">
                          {step.techDetail}
                        </span>
                      </div>
                    )}
                  </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {feature.howItWorks.map((step) => (
                  <motion.div key={step.step} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Highlights — uses capabilityGroups when available (grouped flagship layout), else flat highlights */}
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
                {isEN ? 'Key capabilities' : 'Kluczowe możliwości'}
              </h2>
            </RevealOnScroll>

            {feature.capabilityGroups ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {feature.capabilityGroups.map((group) => (
                  <motion.div key={group.groupLabel} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 md:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-[11px] font-bold text-primary uppercase tracking-wider mb-4">
                      {group.groupLabel}
                    </div>
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-700" />
                          </div>
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-8 md:p-10 max-w-5xl mx-auto">
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
            )}
          </div>
        </section>

        {/* Use cases by industry (optional) */}
        {feature.useCasesByIndustry && feature.useCasesByIndustry.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
                  {isEN ? 'What it looks like in your industry' : 'Jak to wygląda w Twojej branży'}
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                  {isEN
                    ? 'Real scenarios, real numbers — before and after Procurea.'
                    : 'Realne scenariusze, realne liczby — przed i po Procurea.'}
                </p>
              </RevealOnScroll>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {feature.useCasesByIndustry.map((uc) => {
                  const link = getIndustryLink(uc.industrySlug)
                  return (
                    <div
                      key={uc.industrySlug}
                      className="rounded-2xl border border-black/[0.08] bg-white p-6 md:p-7 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          {uc.industry}
                        </div>
                        {link && (
                          <Link
                            to={link.to}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {isEN ? 'See industry page' : 'Zobacz branżę'}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                      <p className="text-sm font-semibold mb-5 leading-relaxed">{uc.scenario}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                        <div className="rounded-xl border border-black/[0.06] bg-slate-50/80 p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            {isEN ? 'Before' : 'Przed'}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{uc.before}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                            {isEN ? 'After' : 'Po'}
                          </div>
                          <p className="text-xs text-emerald-950/80 leading-relaxed">{uc.after}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Integrations highlight (optional) */}
        {feature.integrationsHighlight && (
          <section className="py-16 md:py-20 bg-slate-50/50">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <div className="rounded-3xl border border-black/[0.08] bg-white p-8 md:p-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
                    {feature.integrationsHighlight.heading}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                    {feature.integrationsHighlight.body}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feature.integrationsHighlight.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        )}

        {/* FAQ (optional) */}
        {feature.faq && feature.faq.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
                  {isEN ? 'Frequently asked questions' : 'Najczęściej zadawane pytania'}
                </h2>
                <p className="text-center text-muted-foreground mb-10">
                  {isEN
                    ? 'Answers to what procurement teams ask before their first campaign.'
                    : 'Odpowiedzi na pytania, które zespoły procurement zadają przed pierwszą kampanią.'}
                </p>
              </RevealOnScroll>
              <div className="rounded-2xl border border-black/[0.08] bg-white px-6 md:px-8">
                {feature.faq.map((item) => (
                  <AccordionItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cross-links: industries + related features */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 border-t border-black/[0.06]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isEN ? 'Used in' : 'Używane w'}:
            </span>
            {feature.relatedIndustries.map((indSlug) => {
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

          {feature.relatedFeatures.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isEN ? 'Often used with' : 'Często używane z'}:
              </span>
              {feature.relatedFeatures.map((featureKey) => {
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
          )}
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/[0.06] rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[80px]" />
              </div>
              <h2 className="relative text-2xl md:text-3xl font-bold mb-3">
                {feature.ctaTitle}
              </h2>
              <p className="relative text-white/80 mb-8 max-w-2xl mx-auto">
                {feature.ctaBody}
              </p>
              {feature.isSelfServe ? (
                <a
                  href={appendUtm(APP_URL, `feature_${resolvedSlug}_footer_primary`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_footer_primary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isEN ? 'Start free' : 'Zacznij za darmo'}
                </a>
              ) : (
                <Link
                  to={`${pathFor('contact')}?interest=${feature.interestTag}#calendar`}
                  onClick={() => trackCtaClick(`feature_${resolvedSlug}_footer_primary`)}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
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
