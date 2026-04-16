import { Link } from "react-router-dom"
import { ArrowRight, Search, Mail, Users, BarChart3, Database, Clock, Globe, FileText, Building2, Shield } from "lucide-react"
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
  tier: string
  available: boolean
}

const sourcingFeatures: FeatureItem[] = isEN ? [
  { icon: Search, title: 'AI Sourcing', desc: 'Describe what you need — AI delivers verified supplier shortlist.', to: pathFor('fAiSourcing'), tier: 'Starter', available: true },
  { icon: Users, title: 'Contact Enrichment', desc: 'Decision-maker emails, phones, LinkedIn per supplier.', to: pathFor('fEnrichment'), tier: 'Professional', available: false },
  { icon: Building2, title: 'Company Registry', desc: 'VAT / EORI / financials / ownership structure.', to: pathFor('fCompanyRegistry'), tier: 'Professional', available: false },
] : [
  { icon: Search, title: 'AI Sourcing', desc: 'Opisz czego szukasz — AI dostarcza zweryfikowaną listę dostawców.', to: pathFor('fAiSourcing'), tier: 'Starter', available: true },
  { icon: Users, title: 'Enrichment Kontaktów', desc: 'E-maile, telefony, LinkedIn decydentów per dostawca.', to: pathFor('fEnrichment'), tier: 'Professional', available: false },
  { icon: Building2, title: 'Company Registry', desc: 'VAT / EORI / finanse / struktura własności.', to: pathFor('fCompanyRegistry'), tier: 'Professional', available: false },
]

const procurementFeatures: FeatureItem[] = isEN ? [
  { icon: Mail, title: 'Email Outreach', desc: 'RFQ to 200 suppliers in one click, localized per country.', to: pathFor('fEmailOutreach'), tier: '+Procurement', available: true },
  { icon: Shield, title: 'Supplier Portal', desc: 'Magic-link portal for structured quote submission — no login.', to: pathFor('fSupplierPortal'), tier: '+Procurement', available: true },
  { icon: FileText, title: 'Offer Collection', desc: 'Quantity breaks, alternatives, attachments — all structured.', to: pathFor('fOfferCollection'), tier: '+Procurement', available: false },
  { icon: BarChart3, title: 'Offer Comparison', desc: 'Side-by-side, weighted ranking, export PDF/PPTX.', to: pathFor('fOfferComparison'), tier: 'Pro +Procurement', available: true },
  { icon: Clock, title: 'Auto Follow-up', desc: 'Multi-step email sequences on your schedule.', to: pathFor('fAutoFollowUp'), tier: 'Pro +Procurement', available: false },
  { icon: Globe, title: 'Multilingual Outreach', desc: 'Gemini translation — talk to suppliers in their language.', to: pathFor('fMultilingualOutreach'), tier: 'Pro +Procurement', available: false },
  { icon: Database, title: 'PDF / PPTX Reports', desc: 'Export sourcing + comparison reports for stakeholders.', to: pathFor('fPdfReports'), tier: '+Procurement', available: false },
] : [
  { icon: Mail, title: 'Email Outreach', desc: 'RFQ do 200 dostawców jednym kliknięciem, zlokalizowane per kraj.', to: pathFor('fEmailOutreach'), tier: '+Procurement', available: true },
  { icon: Shield, title: 'Supplier Portal', desc: 'Portal z magic-link do strukturalnego składania ofert — bez logowania.', to: pathFor('fSupplierPortal'), tier: '+Procurement', available: true },
  { icon: FileText, title: 'Zbieranie Ofert', desc: 'Quantity breaks, alternatywy, załączniki — strukturalnie.', to: pathFor('fOfferCollection'), tier: '+Procurement', available: false },
  { icon: BarChart3, title: 'Porównywarka Ofert', desc: 'Side-by-side, ranking ważony, eksport PDF/PPTX.', to: pathFor('fOfferComparison'), tier: 'Pro +Procurement', available: true },
  { icon: Clock, title: 'Auto Follow-up', desc: 'Wielo-krokowe sekwencje maili na Twoim harmonogramie.', to: pathFor('fAutoFollowUp'), tier: 'Pro +Procurement', available: false },
  { icon: Globe, title: 'Wielojęzyczny Outreach', desc: 'Tłumaczenie Gemini — rozmawiaj z dostawcami w ich języku.', to: pathFor('fMultilingualOutreach'), tier: 'Pro +Procurement', available: false },
  { icon: Database, title: 'Raporty PDF / PPTX', desc: 'Eksport raportów sourcingu + porównania dla stakeholderów.', to: pathFor('fPdfReports'), tier: '+Procurement', available: false },
]

const copy = {
  heroTitle: isEN ? 'Features' : 'Funkcje',
  heroSubtitle: isEN
    ? 'Everything you need to run procurement end-to-end — from AI-powered supplier discovery to negotiated contracts.'
    : 'Wszystko czego potrzebujesz do procurement end-to-end — od AI-powered wyszukiwania dostawców po negocjowane kontrakty.',
  sourcingHeading: isEN ? 'AI Sourcing (self-serve)' : 'AI Sourcing (self-serve)',
  procurementHeading: isEN ? 'Procurement Workflow (contact sales)' : 'Workflow Procurement (contact sales)',
  comingSoonLabel: isEN ? 'Docs coming soon' : 'Dokumentacja wkrótce',
}

function FeatureCard({ feature }: { feature: FeatureItem }) {
  const Icon = feature.icon
  const content = (
    <div className={`group h-full rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all flex flex-col`}>
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-bold">{feature.title}</h3>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{feature.tier}</div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.desc}</p>
      <div className="mt-4 text-sm font-semibold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
        {feature.available ? (isEN ? 'Learn more' : 'Dowiedz się więcej') : copy.comingSoonLabel}
        {feature.available && <ArrowRight className="h-3.5 w-3.5" />}
      </div>
    </div>
  )

  if (feature.available) {
    return <Link to={feature.to}>{content}</Link>
  }
  return <div className="opacity-70">{content}</div>
}

export function FeaturesHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">{copy.heroTitle}</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">{copy.heroSubtitle}</p>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <RevealOnScroll>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{copy.sourcingHeading}</h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sourcingFeatures.map((f) => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <RevealOnScroll>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{copy.procurementHeading}</h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {procurementFeatures.map((f) => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {isEN ? 'See pricing' : 'Zobacz cennik'}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Four tiers, two modules, one clear price — Sourcing starts at $199/mo, Full Workflow at $399/mo.'
                : 'Cztery tiery, dwa moduły, jedna jasna cena — Sourcing od $199/mies, Full Workflow od $399/mies.'}
            </p>
            <Link
              to={pathFor('pricing')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
            >
              {isEN ? 'See all plans' : 'Zobacz wszystkie plany'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
