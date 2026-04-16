import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, X, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"
import {
  PRICES,
  CAMPAIGNS,
  annualPrice,
  annualSavings,
  copy,
  comparison,
  type Module,
  type Tier,
} from "@/content/pricing"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const TIERS: Tier[] = ['starter', 'professional', 'enterprise']

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

function TierCard({
  tier,
  module,
  billing,
}: {
  tier: Tier
  module: Module
  billing: 'monthly' | 'annually'
}) {
  const monthly = PRICES[tier][module]
  if (monthly == null) return null

  const campaigns = CAMPAIGNS[tier]
  const isPopular = tier === 'professional' && module === 'full'
  const isProcurementOnly = module === 'procurement'

  // Procurement prices are "add-on" — shown differently
  // But for the main 3-card layout, we always show a single price figure for the module
  const displayMonthly = monthly
  const displayAnnual = annualPrice(monthly)
  const savings = annualSavings(monthly)

  const contactSales = module !== 'sourcing' // only Sourcing self-serve

  const tierLabel = {
    starter: copy.starterName,
    professional: copy.professionalName,
    enterprise: copy.enterpriseName,
  }[tier]

  const tierDesc = module === 'full'
    ? ({
      starter: copy.starterDescFull,
      professional: copy.professionalDescFull,
      enterprise: copy.enterpriseDescFull,
    })[tier]
    : ({
      starter: copy.starterDescSourcing,
      professional: copy.professionalDescSourcing,
      enterprise: copy.enterpriseDescSourcing,
    })[tier]

  const interestParam =
    module === 'full' ? `full_${tier}` :
    module === 'procurement' ? `procurement_${tier}` :
    `sourcing_${tier}`

  return (
    <div
      className={`relative rounded-2xl p-6 md:p-7 flex flex-col ${
        isPopular
          ? 'bg-primary text-primary-foreground shadow-2xl ring-2 ring-primary/20 scale-[1.02]'
          : 'bg-white border border-black/[0.08] shadow-sm'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-xs font-bold text-amber-950 uppercase tracking-wider">
          {copy.professionalBadge}
        </span>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-1 ${isPopular ? 'text-white' : 'text-foreground'}`}>
          {tierLabel}
        </h3>
        <p className={`text-sm leading-relaxed ${isPopular ? 'text-white/80' : 'text-muted-foreground'}`}>
          {tierDesc}
        </p>
      </div>

      <div className="mb-6">
        {isProcurementOnly ? (
          <>
            <div className={`text-xs uppercase tracking-wider mb-1 ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>
              add-on
            </div>
            <div className={`flex items-baseline gap-1 ${isPopular ? 'text-white' : 'text-foreground'}`}>
              <span className="text-3xl md:text-4xl font-bold">+{formatUSD(displayMonthly)}</span>
              <span className={`text-sm ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>{copy.monthlyLabel}</span>
            </div>
          </>
        ) : billing === 'annually' ? (
          <>
            <div className={`flex items-baseline gap-1 ${isPopular ? 'text-white' : 'text-foreground'}`}>
              <span className="text-3xl md:text-4xl font-bold">{formatUSD(Math.round(displayAnnual / 12))}</span>
              <span className={`text-sm ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>{copy.monthlyLabel}</span>
            </div>
            <div className={`text-xs mt-1 ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>
              {copy.perMonthBilled} · {formatUSD(displayAnnual)}{copy.annuallyLabel} ({isPopular ? 'save' : 'save'} {formatUSD(savings)})
            </div>
          </>
        ) : (
          <div className={`flex items-baseline gap-1 ${isPopular ? 'text-white' : 'text-foreground'}`}>
            <span className="text-3xl md:text-4xl font-bold">{formatUSD(displayMonthly)}</span>
            <span className={`text-sm ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>{copy.monthlyLabel}</span>
          </div>
        )}
        <div className={`mt-3 text-sm ${isPopular ? 'text-white/80' : 'text-muted-foreground'}`}>
          {campaigns} {copy.campaignsLabel}
        </div>
      </div>

      <div className="mt-auto">
        {contactSales ? (
          <Link
            to={`${pathFor('contact')}?interest=${interestParam}`}
            onClick={() => trackCtaClick(`pricing_${tier}_${module}_sales`)}
            className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              isPopular
                ? 'bg-white text-primary hover:bg-white/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {copy.ctaContactSales}
          </Link>
        ) : (
          <>
            <a
              href={appendUtm(APP_URL, `pricing_${tier}_${module}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick(`pricing_${tier}_${module}`)}
              className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                isPopular
                  ? 'bg-white text-primary hover:bg-white/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {copy.ctaSelfServe}
            </a>
            {tier === 'starter' && (
              <p className={`mt-2 text-xs text-center ${isPopular ? 'text-white/70' : 'text-muted-foreground'}`}>
                {copy.freeCreditsNote}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EnterpriseCustomCard() {
  return (
    <div className="relative rounded-2xl p-6 md:p-7 flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl border border-amber-400/20">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-3">
          <Sparkles className="h-3 w-3" />
          Enterprise Custom
        </div>
        <h3 className="text-xl font-bold mb-1 text-white">{copy.enterpriseCustomName}</h3>
        <p className="text-sm leading-relaxed text-white/80">{copy.enterpriseCustomDesc}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1 text-white">
          <span className="text-2xl md:text-3xl font-bold">{copy.enterpriseCustomPrice}</span>
        </div>
        <div className="mt-3 text-sm text-white/80">{copy.enterpriseCustomCampaigns}</div>
      </div>

      <div className="mt-auto">
        <Link
          to={`${pathFor('contact')}?interest=enterprise_custom`}
          onClick={() => trackCtaClick('pricing_enterprise_custom')}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 transition-all"
        >
          {copy.ctaEnterpriseCustom}
        </Link>
      </div>
    </div>
  )
}

function renderCell(value: boolean | string, isPopular: boolean) {
  if (value === true) return <Check className={`h-4 w-4 ${isPopular ? 'text-primary' : 'text-emerald-600'}`} />
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40" />
  return <span className={`text-xs font-semibold ${isPopular ? 'text-primary' : 'text-foreground'}`}>{value}</span>
}

export function PricingPage() {
  const [module, setModule] = useState<Module>('sourcing')
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            {copy.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {copy.heroSubtitle}
          </p>
        </section>

        {/* Toggles */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col gap-4 items-center">
            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${billing === 'monthly' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {copy.billingMonthly}
              </button>
              <button
                type="button"
                onClick={() => setBilling('annually')}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all relative ${billing === 'annually' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {copy.billingAnnually}
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  -20%
                </span>
              </button>
            </div>

            {/* Module toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setModule('sourcing')}
                className={`px-4 md:px-5 py-2 text-sm font-semibold rounded-full transition-all ${module === 'sourcing' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {copy.moduleSourcing}
              </button>
              <button
                type="button"
                onClick={() => setModule('procurement')}
                className={`px-4 md:px-5 py-2 text-sm font-semibold rounded-full transition-all ${module === 'procurement' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {copy.moduleProcurement}
              </button>
              <button
                type="button"
                onClick={() => setModule('full')}
                className={`px-4 md:px-5 py-2 text-sm font-semibold rounded-full transition-all relative ${module === 'full' ? 'bg-primary shadow-sm text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {copy.moduleFull}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white">
                  save
                </span>
              </button>
            </div>

            {/* Module description */}
            <p className="text-sm text-muted-foreground max-w-2xl text-center">
              {module === 'sourcing' && copy.sourcingDesc}
              {module === 'procurement' && copy.procurementDesc}
              {module === 'full' && copy.fullDesc}
            </p>
          </div>
        </section>

        {/* 4-column tier cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <TierCard key={tier} tier={tier} module={module} billing={billing} />
            ))}
            <EnterpriseCustomCard />
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{copy.comparisonTitle}</h2>
              <p className="text-muted-foreground">{copy.comparisonSubtitle}</p>
            </div>
          </RevealOnScroll>

          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-black/[0.06]">
                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Feature</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center text-foreground">Starter</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center text-primary">Pro</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center text-foreground">Enterprise</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center text-amber-600">Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((section) => (
                    <>
                      <tr key={`section-${section.label}`} className="bg-slate-50/50">
                        <td colSpan={5} className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.label}
                        </td>
                      </tr>
                      {section.rows.map((row) => (
                        <tr key={`${section.label}-${row.label}`} className="border-t border-black/[0.04]">
                          <td className="px-5 py-3 text-sm text-foreground">{row.label}</td>
                          <td className="px-4 py-3 text-center">{renderCell(row.values[0], false)}</td>
                          <td className="px-4 py-3 text-center bg-primary/[0.03]">{renderCell(row.values[1], true)}</td>
                          <td className="px-4 py-3 text-center">{renderCell(row.values[2], false)}</td>
                          <td className="px-4 py-3 text-center">{renderCell(row.values[3], false)}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mb-24">
          <RevealOnScroll>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{copy.faqTitle}</h2>
            </div>
          </RevealOnScroll>
          <div className="rounded-2xl border border-black/[0.08] bg-white divide-y divide-black/[0.05] overflow-hidden">
            {copy.faq.map((item) => (
              <div key={item.q} className="px-5">
                <AccordionItem question={item.q} answer={item.a} />
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {copy.ctaContactSales}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {import.meta.env.VITE_LANGUAGE === 'en'
                ? 'Still unsure which plan? Book a 30-minute call. We help you pick the right tier based on your volume and workflow.'
                : 'Nie wiesz, który plan wybrać? Umów 30-minutowe spotkanie — pomożemy dobrać tier do Twojego wolumenu i workflow.'}
            </p>
            <Link
              to={pathFor('contact')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
            >
              {copy.ctaContactSales}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
