import { Link } from "react-router-dom"
import { CheckCircle2, Clock, Sparkles, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { INTEGRATIONS, integrationsCopy, type Integration } from "@/content/integrations"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

function StatusBadge({ status, eta }: { status: Integration['status']; eta?: string }) {
  if (status === 'pilot') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
        <CheckCircle2 className="h-3 w-3" />
        {integrationsCopy.statusPilotLabel}
      </span>
    )
  }
  if (status === 'roadmap') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
        <Clock className="h-3 w-3" />
        {eta || integrationsCopy.statusRoadmapLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
      <Sparkles className="h-3 w-3" />
      {integrationsCopy.statusCustomLabel}
    </span>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-md hover:border-black/[0.12] transition-all flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-bold tracking-tight">
            {integration.logo}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{integration.category}</div>
            <h3 className="text-base font-bold leading-tight">{integration.name}</h3>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <StatusBadge status={integration.status} eta={integration.eta} />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
        {isEN ? integration.descEn : integration.descPl}
      </p>

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
