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
  sectionLabel: isEN ? 'TWO WAYS TO START' : 'DWA SPOSOBY NA START',
  heading: isEN ? 'Research now, automate later' : 'Research teraz, automatyzacja potem',
  subheading: isEN
    ? 'Start with AI Sourcing self-serve (10 free credits). When you are ready to send RFQs, collect offers, and close deals — upgrade to the full workflow.'
    : 'Zacznij od AI Sourcingu (10 darmowych kredytów). Gdy chcesz wysyłać RFQ, zbierać oferty i zamykać kontrakty — dodaj pełen workflow procurement.',

  sourcingLabel: isEN ? 'AI Sourcing' : 'AI Sourcing',
  sourcingPrice: isEN ? 'Free · then from $199/mo' : 'Darmowo · potem od $199/mies',
  sourcingDesc: isEN
    ? 'Describe what you need. AI delivers a verified supplier shortlist in minutes. Perfect for teams that still run negotiations via email.'
    : 'Opisz czego szukasz. AI dostarcza zweryfikowaną listę dostawców w minutach. Idealne dla zespołów prowadzących negocjacje mailem.',
  sourcingFeatures: isEN ? [
    '10 free credits on signup',
    'Verified supplier shortlist (up to 200 per campaign)',
    'AI classification + scoring',
    'CSV export',
    'Contact enrichment (from Professional)',
    '26-language research (from Professional)',
  ] : [
    '10 darmowych kredytów po rejestracji',
    'Zweryfikowana lista dostawców (do 200 na kampanię)',
    'AI klasyfikacja i scoring',
    'Eksport CSV',
    'Enrichment kontaktów (od Professional)',
    'Wielojęzyczny research, 26 języków (od Professional)',
  ],
  sourcingCta: isEN ? 'Start free research' : 'Rozpocznij za darmo',
  sourcingNote: isEN ? 'No credit card required' : 'Bez karty kredytowej',

  fullLabel: isEN ? 'Full Workflow' : 'Pełen Workflow',
  fullBadge: isEN ? 'Contact sales' : 'Porozmawiaj z nami',
  fullPrice: isEN ? 'Bundle from $399/mo' : 'Bundle od $399/mies',
  fullDesc: isEN
    ? 'Everything in Sourcing, plus: send RFQs in bulk, supplier portal, offer comparison, auto follow-ups, multilingual outreach, PDF/PPTX reports. Integrates with SAP, Oracle, Dynamics, Salesforce.'
    : 'Wszystko ze Sourcingu + wysyłka RFQ, portal dostawcy, porównywarka ofert, auto follow-upy, wielojęzyczny outreach, raporty PDF/PPTX. Integruje się z SAP, Oracle, Dynamics, Salesforce.',
  fullFeatures: isEN ? [
    'Everything in AI Sourcing',
    'Email outreach — bulk RFQ to 200+ suppliers',
    'Supplier Portal — magic link, no login',
    'Offer comparison — price, MOQ, lead time',
    'Auto follow-up sequences',
    'Multilingual outreach (Gemini translation)',
    'PDF/PPTX reports export',
    'ERP/CRM integrations (Dynamics · Salesforce · Oracle · SAP)',
  ] : [
    'Wszystko z AI Sourcingu',
    'Email outreach — RFQ do 200+ dostawców',
    'Supplier Portal — magic link, bez logowania',
    'Porównywarka ofert — cena, MOQ, lead time',
    'Sekwencje auto follow-up',
    'Wielojęzyczny outreach (tłumaczenie Gemini)',
    'Eksport raportów PDF/PPTX',
    'Integracje ERP/CRM (Dynamics · Salesforce · Oracle · SAP)',
  ],
  fullCta: isEN ? 'Talk to sales' : 'Umów demo',
  fullNote: isEN ? '30-min intro call · reply within 24h' : '30-minutowe intro · odpowiadamy w 24h',

  pricingCta: isEN ? 'See full pricing' : 'Zobacz pełen cennik',
}

export function DualTierSection() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-white to-slate-50/50" data-track-section="dual-tier">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {copy.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {copy.heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {copy.subheading}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Sourcing tier */}
          <RevealOnScroll>
            <div className="rounded-3xl bg-white border border-black/[0.08] p-7 md:p-10 shadow-sm h-full flex flex-col">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-4">
                  Self-serve
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{copy.sourcingLabel}</h3>
                <div className="text-sm font-semibold text-primary mb-3">{copy.sourcingPrice}</div>
                <p className="text-muted-foreground leading-relaxed">{copy.sourcingDesc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {copy.sourcingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href={appendUtm(APP_URL, 'dual_tier_sourcing')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('dual_tier_sourcing')}
                  className="inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
                >
                  {copy.sourcingCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <p className="text-xs text-center text-muted-foreground mt-2">{copy.sourcingNote}</p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Full Workflow tier */}
          <RevealOnScroll>
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-amber-400/20 p-7 md:p-10 shadow-2xl h-full flex flex-col relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-400/5 blur-3xl" />

              <div className="mb-6 relative">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3" />
                  {copy.fullBadge}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{copy.fullLabel}</h3>
                <div className="text-sm font-semibold text-amber-300 mb-3">{copy.fullPrice}</div>
                <p className="text-white/80 leading-relaxed">{copy.fullDesc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1 relative">
                {copy.fullFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-amber-300 shrink-0" />
                    <span className="text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="relative">
                <Link
                  to={`${pathFor('contact')}?interest=full_professional`}
                  onClick={() => trackCtaClick('dual_tier_full')}
                  className="inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
                >
                  {copy.fullCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <p className="text-xs text-center text-white/60 mt-2">{copy.fullNote}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <div className="text-center mt-10">
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
