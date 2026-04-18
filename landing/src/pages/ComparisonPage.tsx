import { Link } from "react-router-dom"
import { ArrowRight, Check, X, Clock, Globe, TrendingDown } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const rows = isEN ? [
  { aspect: 'Time to shortlist', manual: '30+ hours', procurea: '20 minutes', winner: 'procurea' },
  { aspect: 'Languages searched', manual: '1–2 (your team\'s)', procurea: '26 languages', winner: 'procurea' },
  { aspect: 'Suppliers found', manual: '5–15 per project', procurea: '50–250 per campaign', winner: 'procurea' },
  { aspect: 'Contact enrichment', manual: 'Manual (LinkedIn, Google)', procurea: 'Automated AI enrichment', winner: 'procurea' },
  { aspect: 'RFQ outreach', manual: 'Individual emails', procurea: 'Bulk localized RFQ', winner: 'procurea' },
  { aspect: 'Offer collection', manual: 'Email attachments, PDFs', procurea: 'Structured portal (magic link)', winner: 'procurea' },
  { aspect: 'Offer comparison', manual: 'Excel spreadsheets', procurea: 'AI-weighted ranking', winner: 'procurea' },
  { aspect: 'Cost per project', manual: '~$1,500 (analyst time)', procurea: 'From $8.90 per campaign', winner: 'procurea' },
  { aspect: 'Scalability', manual: 'Linear — more people, more cost', procurea: 'Unlimited — same credit cost', winner: 'procurea' },
] : [
  { aspect: 'Czas do shortlisty', manual: '30+ godzin', procurea: '20 minut', winner: 'procurea' },
  { aspect: 'Języki wyszukiwania', manual: '1–2 (Twojego zespołu)', procurea: '26 języków', winner: 'procurea' },
  { aspect: 'Znalezionych dostawców', manual: '5–15 na projekt', procurea: '50–250 na kampanię', winner: 'procurea' },
  { aspect: 'Enrichment kontaktów', manual: 'Ręcznie (LinkedIn, Google)', procurea: 'Automatyczny enrichment AI', winner: 'procurea' },
  { aspect: 'Outreach RFQ', manual: 'Pojedyncze emaile', procurea: 'Masowy zlokalizowany RFQ', winner: 'procurea' },
  { aspect: 'Zbieranie ofert', manual: 'Załączniki email, PDF', procurea: 'Portal (magic link)', winner: 'procurea' },
  { aspect: 'Porównanie ofert', manual: 'Arkusze Excel', procurea: 'Ranking ważony AI', winner: 'procurea' },
  { aspect: 'Koszt per projekt', manual: '~$1 500 (czas analityka)', procurea: 'Od $8.90 za kampanię', winner: 'procurea' },
  { aspect: 'Skalowalność', manual: 'Liniowa — więcej ludzi = więcej kosztów', procurea: 'Bez limitu — ten sam koszt kredytu', winner: 'procurea' },
]

const highlights = isEN ? [
  { icon: Clock, stat: '6 weeks → 20 min', label: 'Time saved on every sourcing project' },
  { icon: TrendingDown, stat: '4.6% avg savings', label: 'Better prices from wider supplier base' },
  { icon: Globe, stat: '26 languages', label: 'Global reach, zero language barrier' },
] : [
  { icon: Clock, stat: '6 tygodni → 20 min', label: 'Czas zaoszczędzony na każdym projekcie' },
  { icon: TrendingDown, stat: 'Śr. 4,6% oszczędności', label: 'Lepsze ceny z szerszej bazy dostawców' },
  { icon: Globe, stat: '26 języków', label: 'Globalny zasięg, zero bariery językowej' },
]

export function ComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pt-32 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            {isEN ? 'COMPARISON' : 'PORÓWNANIE'}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {isEN ? 'Procurea vs Manual Sourcing' : 'Procurea vs Ręczny Sourcing'}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEN
              ? 'See how AI procurement automation compares to traditional supplier sourcing — side by side.'
              : 'Zobacz jak automatyzacja procurement AI wypada w porównaniu z tradycyjnym sourcingiem dostawców.'}
          </p>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-20">
          <RevealOnScroll>
            <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 border-b border-black/[0.06]">
                <div className="p-4" />
                <div className="p-4 text-center border-l border-black/[0.06]">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {isEN ? 'Manual' : 'Ręcznie'}
                  </span>
                </div>
                <div className="p-4 text-center border-l border-black/[0.06] bg-emerald-50/50">
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                    Procurea
                  </span>
                </div>
              </div>
              {/* Rows */}
              {rows.map((row, idx) => (
                <div
                  key={row.aspect}
                  className={`grid grid-cols-3 ${idx < rows.length - 1 ? 'border-b border-black/[0.04]' : ''}`}
                >
                  <div className="p-4 text-sm font-medium">{row.aspect}</div>
                  <div className="p-4 text-sm text-muted-foreground border-l border-black/[0.06] flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    {row.manual}
                  </div>
                  <div className="p-4 text-sm font-medium text-emerald-700 border-l border-black/[0.06] bg-emerald-50/30 flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    {row.procurea}
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* Highlights */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20">
          <RevealOnScroll>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
              {isEN ? 'Why teams switch to Procurea' : 'Dlaczego zespoły przechodzą na Procurea'}
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon
              return (
                <RevealOnScroll key={h.stat}>
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{h.stat}</div>
                    <p className="text-sm text-muted-foreground">{h.label}</p>
                  </div>
                </RevealOnScroll>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {isEN ? 'Ready to stop sourcing manually?' : 'Gotowy przestać sourcować ręcznie?'}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Try Procurea free — 10 supplier searches included. No credit card, no commitment.'
                : 'Wypróbuj Procurea za darmo — 10 wyszukiwań dostawców w pakiecie. Bez karty, bez zobowiązań.'}
            </p>
            <a
              href={appendUtm(APP_URL, 'comparison_cta')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('comparison_cta')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
            >
              {isEN ? 'Start free' : 'Zacznij za darmo'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
