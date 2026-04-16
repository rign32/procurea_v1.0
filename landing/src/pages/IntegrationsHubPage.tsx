import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
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
  const dataFlow = isEN ? integration.dataFlowEn : integration.dataFlowPl
  const capabilities = isEN ? integration.capabilitiesEn : integration.capabilitiesPl
  const customization = isEN ? integration.customizationEn : integration.customizationPl

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-md hover:border-black/[0.12] transition-all flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-bold tracking-tight">
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

      <div className="mb-4 pt-3 border-t border-black/[0.06]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {integrationsCopy.dataFlowLabel}
        </div>
        <ul className="space-y-1">
          {dataFlow.map((item) => (
            <li key={item} className="text-xs text-foreground/80 leading-relaxed flex gap-1.5">
              <span className="text-muted-foreground mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {integrationsCopy.capabilitiesLabel}
        </div>
        <ul className="space-y-1">
          {capabilities.map((item) => (
            <li key={item} className="text-xs text-foreground/80 leading-relaxed flex gap-1.5">
              <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {integrationsCopy.customizationLabel}
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{customization}</p>
      </div>

      <div className="text-xs text-muted-foreground mb-4 pt-3 border-t border-black/[0.06]">
        <span className="font-semibold text-foreground">{integrationsCopy.tierLabel}: </span>
        {isEN ? integration.tiersEn : integration.tiersPl}
      </div>

      <Link
        to={`${pathFor('contact')}?interest=integration_${integration.slug === 'sap' || integration.slug === 'sap-ecc' ? 'sap' : integration.slug === 'oracle-netsuite' || integration.slug === 'oracle-fusion-cloud' ? 'oracle' : integration.slug === 'dynamics-365-bc' || integration.slug === 'dynamics-365-fo' ? 'dynamics' : integration.slug === 'salesforce' ? 'salesforce' : 'other'}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
      >
        {integrationsCopy.ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export function IntegrationsHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            {integrationsCopy.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {integrationsCopy.heroSubtitle}
          </p>
        </section>

        {/* Value props */}
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

        {/* Integrations grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEGRATIONS.map((integration) => (
              <IntegrationCard key={integration.slug} integration={integration} />
            ))}
          </div>
        </section>

        {/* Logos carousel — 50+ other ERP/CRM systems */}
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

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {integrationsCopy.ctaSectionTitle}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {integrationsCopy.ctaSectionBody}
            </p>
            <Link
              to={`${pathFor('contact')}?interest=integration_other`}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
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
