import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { INTEGRATIONS, integrationsCopy, type Integration } from "@/content/integrations"
import { IntegrationsLogosCarousel } from "@/components/sections/IntegrationsLogosCarousel"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

function IntegrationTypeBadge({ type }: { type: Integration['integrationType'] }) {
  const label = integrationsCopy.integrationTypeLabel[type]
  const className =
    type === 'native'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-slate-100 border-slate-200 text-slate-700'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className="group rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-hover-card hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-bold tracking-tight group-hover:scale-105 transition-transform duration-200">
            {integration.logo}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {integration.category}
            </div>
            <h3 className="text-base font-bold leading-tight">{integration.name}</h3>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <IntegrationTypeBadge type={integration.integrationType} />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
        {isEN ? integration.descEn : integration.descPl}
      </p>

      <div className="text-xs text-muted-foreground mb-4 pt-3 border-t border-black/[0.06]">
        <span className="font-semibold text-foreground">{integrationsCopy.tierLabel}: </span>
        {isEN ? integration.tiersEn : integration.tiersPl}
      </div>

      <Link
        to={`${pathFor('contact')}?interest=integration_${integration.slug === 'sap' || integration.slug === 'sap-ecc' ? 'sap' : integration.slug === 'oracle-netsuite' || integration.slug === 'oracle-fusion-cloud' ? 'oracle' : integration.slug === 'dynamics-365-bc' || integration.slug === 'dynamics-365-fo' ? 'dynamics' : integration.slug === 'salesforce' ? 'salesforce' : 'other'}#calendar`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all underline-slide"
      >
        {integrationsCopy.ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export function IntegrationsHubPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const isSearching = searchQuery.trim() !== ''

  const filteredIntegrations = isSearching
    ? INTEGRATIONS.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.searchKeywords?.some(kw => kw.includes(searchQuery.toLowerCase()))
      )
    : INTEGRATIONS

  const t = isEN
    ? {
        searchPlaceholder: 'Check if we integrate with your ERP...',
        noResults: 'No pre-built integration found.',
        noResultsCta: 'Contact us — we can build one →',
        requestTitle: 'Your system?',
        requestSubtitle: "We'll build an adapter for your ERP.",
        requestCta: 'Talk to us →',
      }
    : {
        searchPlaceholder: 'Sprawdź czy integrujemy z Twoim ERP...',
        noResults: 'Nie znaleziono gotowej integracji.',
        noResultsCta: 'Skontaktuj się z nami — zbudujemy →',
        requestTitle: 'Twój system?',
        requestSubtitle: 'Zbudujemy adapter do Twojego ERP.',
        requestCta: 'Porozmawiaj z nami →',
      }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 bg-mesh-gradient">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pt-32 pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-40" />
          <div className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            {integrationsCopy.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {integrationsCopy.heroSubtitle}
          </p>
        </section>

        {/* Hero illustration */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-12">
          <RevealOnScroll>
            <div className="relative overflow-hidden rounded-3xl aspect-[21/9] shadow-[0_24px_64px_-16px_rgba(8,14,28,0.2)]">
              <img src="/pages/integrations-hub-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
            </div>
          </RevealOnScroll>
        </section>

        {/* Search */}
        <section className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 mb-12">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full px-5 py-3.5 rounded-xl border border-black/[0.1] bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-sm transition-all focus-glow"
          />
        </section>

        {/* Value props — only when not searching */}
        {!isSearching && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-20">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
                {integrationsCopy.valueTitle}
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {integrationsCopy.valueProps.map((prop) => (
                <div key={prop.title} className="rounded-2xl border border-black/[0.08] bg-white p-6">
                  <h3 className="text-lg font-bold mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prop.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Integrations grid */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
            {filteredIntegrations.map((integration) => (
              <motion.div key={integration.slug} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
                <IntegrationCard integration={integration} />
              </motion.div>
            ))}

            {/* Request card — only when not searching */}
            {!isSearching && (
              <div className="group rounded-2xl border-2 border-dashed border-primary/20 bg-white/60 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:shadow-md transition-all duration-300">
                <div className="text-2xl mb-3"><span className="inline-block group-hover:scale-110 transition-transform duration-200">🔌</span></div>
                <h3 className="text-base font-bold mb-2">{t.requestTitle}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.requestSubtitle}</p>
                <Link
                  to={`${pathFor('contact')}?interest=integration_other#calendar`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t.requestCta}
                </Link>
              </div>
            )}

            {/* No results */}
            {filteredIntegrations.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{t.noResults}</p>
                <Link
                  to={`${pathFor('contact')}?interest=integration_other#calendar`}
                  className="text-sm font-semibold text-primary mt-2 inline-block"
                >
                  {t.noResultsCta}
                </Link>
              </div>
            )}
          </motion.div>
        </section>

        {/* Logos carousel — only when not searching */}
        {!isSearching && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
            <RevealOnScroll>
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  {integrationsCopy.logosSectionTitle}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {integrationsCopy.logosSectionBody}
                </p>
              </div>
            </RevealOnScroll>
            <IntegrationsLogosCarousel />
          </section>
        )}

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary/[0.08] blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[350px] h-[350px] rounded-full bg-amber-400/[0.06] blur-[100px] pointer-events-none" />
            <h2 className="relative text-2xl md:text-3xl font-bold mb-3">
              {integrationsCopy.ctaSectionTitle}
            </h2>
            <p className="relative text-white/80 mb-8 max-w-2xl mx-auto">
              {integrationsCopy.ctaSectionBody}
            </p>
            <Link
              to={`${pathFor('contact')}?interest=integration_other#calendar`}
              className="relative inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg hover:shadow-amber-400/25 transition-all"
            >
              {integrationsCopy.ctaLabel}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
