import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const copy = {
  sectionLabel: isEN ? 'WORKS WITH YOUR STACK' : 'DZIAŁA Z TWOIM STACKIEM',
  heading: isEN ? 'Native ERP & CRM integrations' : 'Natywne integracje ERP i CRM',
  subheading: isEN
    ? 'Procurea enriches sourcing results with your ERP state. Already-in / maybe-match / new — no duplicate data entry.'
    : 'Procurea wzbogaca wyniki sourcingu o stan Twojego ERP. Already-in / maybe-match / new — bez duplikacji danych.',
  ctaLabel: isEN ? 'See all integrations' : 'Zobacz wszystkie integracje',
}

const SYSTEMS: { name: string; logo: string; status: 'pilot' | 'roadmap' | 'custom'; eta?: string }[] = [
  { name: 'Dynamics 365 Business Central', logo: 'D365', status: 'pilot' },
  { name: 'Salesforce', logo: 'SF', status: 'roadmap', eta: 'Q3 2026' },
  { name: 'Oracle NetSuite', logo: 'NS', status: 'roadmap', eta: 'Q3 2026' },
  { name: 'Dynamics 365 F&O', logo: 'F&O', status: 'roadmap', eta: 'Q4 2026' },
  { name: 'Oracle Fusion Cloud', logo: 'OFC', status: 'roadmap', eta: 'Q4 2026' },
  { name: 'SAP S/4HANA', logo: 'SAP', status: 'roadmap', eta: 'Q4 2026' },
  { name: 'SAP ECC', logo: 'ECC', status: 'custom' },
  { name: '50+ via Merge.dev', logo: '50+', status: 'roadmap', eta: 'Q4 2026' },
]

function statusBadge(status: string, eta?: string) {
  if (status === 'pilot') {
    return <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pilot</span>
  }
  if (status === 'roadmap') {
    return <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{eta}</span>
  }
  return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Custom</span>
}

export function IntegrationsPreviewSection() {
  return (
    <section className="relative py-20 md:py-28 bg-slate-50/50" data-track-section="integrations-preview">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {copy.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">{copy.heading}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.subheading}</p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {SYSTEMS.map((sys) => (
            <div
              key={sys.name}
              className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white p-4 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-bold tracking-tight shrink-0">
                {sys.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold leading-tight truncate" title={sys.name}>
                  {sys.name}
                </div>
                <div className="mt-0.5">{statusBadge(sys.status, sys.eta)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to={pathFor('integrationsHub')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            {copy.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
