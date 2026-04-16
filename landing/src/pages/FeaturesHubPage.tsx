import { Link } from "react-router-dom"
import { ArrowRight, Search, Mail, Users, BarChart3, Database, Clock, Globe, FileText, Building2, Shield, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

interface FeatureItem {
  icon: React.ComponentType<any>
  title: string
  desc: string
  to: string
  hasPage: boolean
}

const sourcingFeatures: FeatureItem[] = isEN ? [
  { icon: Search, title: 'AI Sourcing', desc: '50–250 verified vendors per campaign in 26 languages. One-click Excel export.', to: pathFor('fAiSourcing'), hasPage: true },
  { icon: Building2, title: 'Company Registry', desc: 'VAT / EORI / financial data / ownership — verified against official registries.', to: pathFor('fCompanyRegistry'), hasPage: false },
] : [
  { icon: Search, title: 'AI Sourcing', desc: '50–250 zweryfikowanych dostawców na kampanię w 26 językach. Eksport Excel jednym kliknięciem.', to: pathFor('fAiSourcing'), hasPage: true },
  { icon: Building2, title: 'Company Registry', desc: 'VAT / EORI / dane finansowe / własność — zweryfikowane wobec oficjalnych rejestrów.', to: pathFor('fCompanyRegistry'), hasPage: false },
]

const outreachFeatures: FeatureItem[] = isEN ? [
  { icon: Users, title: 'Contact Enrichment', desc: 'Decision-maker emails, phones, LinkedIn — verified deliverability.', to: pathFor('fEnrichment'), hasPage: false },
  { icon: Mail, title: 'Email Outreach', desc: 'Bulk RFQ to 200+ suppliers, localized per country. Inbox delivery via Resend.', to: pathFor('fEmailOutreach'), hasPage: true },
  { icon: Clock, title: 'Auto Follow-up', desc: 'Multi-step sequences (+3d, +7d, +14d). Auto-stops when supplier responds.', to: pathFor('fAutoFollowUp'), hasPage: false },
  { icon: Globe, title: 'Multilingual Outreach', desc: 'Gemini translation to 26 languages. Response rate 2–3x vs English-only.', to: pathFor('fMultilingualOutreach'), hasPage: false },
] : [
  { icon: Users, title: 'Enrichment Kontaktów', desc: 'Emaile decydentów, telefony, LinkedIn — zweryfikowana deliverability.', to: pathFor('fEnrichment'), hasPage: false },
  { icon: Mail, title: 'Email Outreach', desc: 'Bulk RFQ do 200+ dostawców, zlokalizowane per kraj. Inbox delivery przez Resend.', to: pathFor('fEmailOutreach'), hasPage: true },
  { icon: Clock, title: 'Auto Follow-up', desc: 'Wielokrokowe sekwencje (+3d, +7d, +14d). Auto-stop gdy dostawca odpowie.', to: pathFor('fAutoFollowUp'), hasPage: false },
  { icon: Globe, title: 'Wielojęzyczny Outreach', desc: 'Tłumaczenie Gemini na 26 języków. Response rate 2–3x vs English-only.', to: pathFor('fMultilingualOutreach'), hasPage: false },
]

const offersFeatures: FeatureItem[] = isEN ? [
  { icon: Shield, title: 'Supplier Portal', desc: 'Magic-link portal — suppliers submit structured quotes, no login needed.', to: pathFor('fSupplierPortal'), hasPage: true },
  { icon: FileText, title: 'Offer Collection', desc: 'Structured quotes: price tiers, MOQ, lead time, alternatives, attachments.', to: pathFor('fOfferCollection'), hasPage: false },
  { icon: BarChart3, title: 'Offer Comparison', desc: 'Side-by-side ranking with weighted criteria. Export to PDF/PPTX.', to: pathFor('fOfferComparison'), hasPage: true },
] : [
  { icon: Shield, title: 'Supplier Portal', desc: 'Portal z magic-link — dostawcy składają strukturalne oferty bez logowania.', to: pathFor('fSupplierPortal'), hasPage: true },
  { icon: FileText, title: 'Zbieranie Ofert', desc: 'Strukturalne quotes: price tiers, MOQ, lead time, alternatywy, załączniki.', to: pathFor('fOfferCollection'), hasPage: false },
  { icon: BarChart3, title: 'Porównywarka Ofert', desc: 'Ranking side-by-side z ważonymi kryteriami. Eksport PDF/PPTX.', to: pathFor('fOfferComparison'), hasPage: true },
]

const insightsFeatures: FeatureItem[] = isEN ? [
  { icon: Database, title: 'AI Insights Reports', desc: 'Gemini analysis: spend breakdown, negotiation leverage, benchmarks. Ready-to-present PDF/PPTX.', to: pathFor('fAiInsights'), hasPage: false },
] : [
  { icon: Database, title: 'Raporty AI Insights', desc: 'Analiza Gemini: breakdown wydatków, leverage negocjacyjny, benchmarki. Gotowe do prezentacji PDF/PPTX.', to: pathFor('fAiInsights'), hasPage: false },
]

const copy = {
  heroTitle: isEN ? 'Features' : 'Funkcje',
  heroSubtitle: isEN
    ? 'Two modules. Four subgroups. Everything you need to run procurement end-to-end — from AI-powered supplier discovery to executive-ready reports.'
    : 'Dwa moduły. Cztery podgrupy. Wszystko czego potrzebujesz do procurement end-to-end — od AI-powered wyszukiwania dostawców po raporty dla zarządu.',
  sourcingHeading: 'AI Sourcing',
  sourcingDesc: isEN
    ? 'Find qualified vendors. Self-serve, credit-based.'
    : 'Znajduj zweryfikowanych dostawców. Self-serve, credit-based.',
  procurementHeading: 'AI Procurement',
  procurementDesc: isEN
    ? 'Full RFQ workflow with AI-assisted outreach, offers, and insights.'
    : 'Pełny workflow RFQ z outreach AI, ofertami i insights.',
  outreachHeading: 'Outreach',
  offersHeading: isEN ? 'Offers' : 'Oferty',
  insightsHeading: 'AI Insights',
  integrationsHeading: isEN ? 'ERP & CRM Integrations' : 'Integracje ERP i CRM',
  integrationsDesc: isEN
    ? 'Native integration with SAP, Oracle, Dynamics, Salesforce — plus 50+ systems via Merge.dev.'
    : 'Natywna integracja z SAP, Oracle, Dynamics, Salesforce — plus 50+ systemów przez Merge.dev.',
  integrationsCta: isEN ? 'See all integrations' : 'Zobacz wszystkie integracje',
  learnMore: isEN ? 'Learn more' : 'Dowiedz się więcej',
  inProcurement: isEN ? 'Part of AI Procurement' : 'Część AI Procurement',
  inSourcing: isEN ? 'Part of AI Sourcing' : 'Część AI Sourcing',
}

function FeatureCard({ feature, variant = 'sourcing' }: { feature: FeatureItem; variant?: 'sourcing' | 'procurement' }) {
  const Icon = feature.icon

  const inner = (
    <div className="group h-full rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all flex flex-col">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-base font-bold mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.desc}</p>
      <div className="mt-4 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
        {feature.hasPage ? (
          <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            {copy.learnMore}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-muted-foreground font-medium">
            {variant === 'sourcing' ? copy.inSourcing : copy.inProcurement}
          </span>
        )}
      </div>
    </div>
  )

  if (feature.hasPage) {
    return <Link to={feature.to}>{inner}</Link>
  }
  return <div>{inner}</div>
}

export function FeaturesHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">{copy.heroTitle}</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">{copy.heroSubtitle}</p>
        </section>

        {/* AI Sourcing module */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <RevealOnScroll>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{copy.sourcingHeading}</h2>
                  <p className="text-sm text-muted-foreground">{copy.sourcingDesc}</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sourcingFeatures.map((f) => <FeatureCard key={f.title} feature={f} variant="sourcing" />)}
          </div>
        </section>

        {/* AI Procurement module — 3 subgroups */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <RevealOnScroll>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{copy.procurementHeading}</h2>
                  <p className="text-sm text-muted-foreground">{copy.procurementDesc}</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Outreach subgroup */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              {copy.outreachHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {outreachFeatures.map((f) => <FeatureCard key={f.title} feature={f} variant="procurement" />)}
            </div>
          </div>

          {/* Offers subgroup */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              {copy.offersHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offersFeatures.map((f) => <FeatureCard key={f.title} feature={f} variant="procurement" />)}
            </div>
          </div>

          {/* AI Insights subgroup */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              {copy.insightsHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insightsFeatures.map((f) => <FeatureCard key={f.title} feature={f} variant="procurement" />)}
            </div>
          </div>
        </section>

        {/* Integrations banner */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <RevealOnScroll>
            <Link
              to={pathFor('integrationsHub')}
              className="group block rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 hover:shadow-2xl transition-all"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{copy.integrationsHeading}</h2>
                  <p className="text-white/80 text-sm md:text-base max-w-2xl">{copy.integrationsDesc}</p>
                </div>
                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-400 text-amber-950 font-semibold text-sm group-hover:bg-amber-300 transition-all shrink-0">
                  {copy.integrationsCta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </RevealOnScroll>
        </section>

        {/* Final CTA — pricing */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-black/[0.08] p-10 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {isEN ? 'See credit packs and pricing' : 'Zobacz pakiety kredytów i cennik'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Credit-based pricing. Three self-serve products + Enterprise Custom for teams at scale.'
                : 'Pricing credit-based. Trzy produkty self-serve + Enterprise Custom dla zespołów na skalę.'}
            </p>
            <Link
              to={pathFor('pricing')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
            >
              {isEN ? 'View pricing' : 'Zobacz cennik'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
