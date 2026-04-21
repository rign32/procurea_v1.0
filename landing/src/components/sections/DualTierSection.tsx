import { Link } from "react-router-dom"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const copy = {
  sectionLabel: isEN ? 'TWO WAYS TO BUY' : 'DWIE OPCJE ZAKUPU',
  heading: isEN ? 'Research only, or full workflow' : 'Tylko research, lub pełen workflow',
  subheading: isEN
    ? 'Pay for what you use. AI Sourcing alone, or add AI Procurement workflow on demand — only on the campaigns where you want full RFQ outreach.'
    : 'Płacisz za to co używasz. Samo AI Sourcing albo dodaj workflow AI Procurement na żądanie — tylko na tych kampaniach, gdzie chcesz pełny outreach RFQ.',

  sourcingLabel: 'AI Sourcing',
  sourcingPrice: isEN ? 'From $69 / month — 10 campaigns' : 'Od 289 zł / miesiąc — 10 kampanii',
  sourcingDesc: isEN
    ? 'Find up to 250 verified suppliers per campaign in 30+ languages. Excel export. Self-serve.'
    : 'Znajdź do 250 zweryfikowanych dostawców na kampanię w 30+ językach. Eksport Excel. Self-serve.',
  sourcingFeatures: isEN ? [
    'AI pipeline — up to 250 suppliers per campaign',
    '30+ business languages + Supplier Database',
    'One-click Excel export',
    '3 free campaigns on signup — no credit card',
  ] : [
    'AI pipeline — do 250 dostawców na kampanię',
    '30+ języków biznesowych + Baza Dostawców',
    'Eksport Excel jednym kliknięciem',
    '3 darmowe kampanie po rejestracji — bez karty',
  ],
  sourcingCta: isEN ? 'Start free' : 'Zacznij za darmo',

  fullLabel: isEN ? 'AI Procurement add-on' : 'Dodatek AI Procurement',
  fullBadge: isEN ? 'Per run' : 'Za run',
  fullPrice: isEN ? '$29 / workflow' : '129 zł / workflow',
  fullDesc: isEN
    ? 'Extend any sourcing campaign with the full RFQ workflow — localized email outreach, Supplier Portal, offer collection, side-by-side comparison and AI Insights reports.'
    : 'Rozszerz dowolną kampanię sourcingową o pełny workflow RFQ — zlokalizowany outreach email, Supplier Portal, zbieranie ofert, porównanie side-by-side i raporty AI Insights.',
  fullFeatures: isEN ? [
    'Contact enrichment — decision-makers, emails, phones',
    'Bulk RFQ outreach — 30+ languages',
    'Supplier Portal + structured offer collection',
    'AI Insights reports (PDF / PPTX)',
  ] : [
    'Enrichment kontaktów — decydenci, emaile, telefony',
    'Bulk RFQ outreach — 30+ języków',
    'Supplier Portal + strukturalne zbieranie ofert',
    'Raporty AI Insights (PDF / PPTX)',
  ],
  fullCta: isEN ? 'See how it works' : 'Zobacz jak działa',

  pricingCta: isEN ? 'See full pricing' : 'Zobacz pełen cennik',
}

export function DualTierSection() {
  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-white to-slate-50/50" data-track-section="dual-tier">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-8 md:mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2">
              {copy.sectionLabel}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {copy.heading}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {copy.subheading}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sourcing — compact */}
          <RevealOnScroll>
            <div className="rounded-2xl bg-white border border-black/[0.08] p-6 md:p-7 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl md:text-2xl font-bold">{copy.sourcingLabel}</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  Self-serve
                </span>
              </div>
              <div className="text-sm font-semibold text-primary mb-2">{copy.sourcingPrice}</div>
              <p className="text-sm text-muted-foreground mb-4">{copy.sourcingDesc}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {copy.sourcingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={appendUtm(APP_URL, 'dual_tier_sourcing')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('dual_tier_sourcing')}
                className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                {copy.sourcingCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </RevealOnScroll>

          {/* Full Workflow — compact */}
          <RevealOnScroll>
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-7 shadow-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />

              <div className="relative flex items-center gap-2 mb-3">
                <h3 className="text-xl md:text-2xl font-bold">{copy.fullLabel}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-950 bg-amber-400 rounded-full px-2 py-0.5">
                  <Sparkles className="h-3 w-3" />
                  {copy.fullBadge}
                </span>
              </div>
              <div className="relative text-sm font-semibold text-amber-300 mb-2">{copy.fullPrice}</div>
              <p className="relative text-sm text-white/80 mb-4">{copy.fullDesc}</p>

              <ul className="relative space-y-2 mb-6 flex-1">
                {copy.fullFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-amber-300 shrink-0" />
                    <span className="text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`${pathFor('contact')}?interest=bundle#calendar`}
                onClick={() => trackCtaClick('dual_tier_full')}
                className="relative inline-flex items-center justify-center w-full px-5 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
              >
                {copy.fullCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>

        <div className="text-center mt-6">
          <Link
            to={pathFor('pricing')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
          >
            {copy.pricingCta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
