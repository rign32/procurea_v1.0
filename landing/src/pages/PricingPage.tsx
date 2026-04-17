import { Fragment } from "react"
import { Link } from "react-router-dom"
import { Check, Sparkles, Search, Workflow, Layers, type LucideIcon } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"
import { t } from "@/i18n"
import { SavingsCalculator } from "@/components/sections/SavingsCalculator"
import {
  PRODUCTS,
  ORDERED_PRODUCTS,
  copy,
  formatUSD,
  type Product,
  type ProductDefinition,
} from "@/content/pricing"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PRODUCT_ICONS: Record<Product, LucideIcon> = {
  sourcing: Search,
  procurement: Workflow,
  bundle: Layers,
  enterprise: Sparkles,
}

function accentClasses(accent: ProductDefinition['accent']) {
  switch (accent) {
    case 'primary':
      return {
        card: 'bg-white border border-primary/20 shadow-md',
        badge: 'bg-primary/10 text-primary border-primary/20',
        cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
        iconWrap: 'bg-primary/10 text-primary',
      }
    case 'bundle':
      return {
        card: 'bg-primary text-primary-foreground shadow-2xl ring-2 ring-primary/30 lg:scale-[1.02]',
        badge: 'bg-amber-400 text-amber-950',
        cta: 'bg-white text-primary hover:bg-white/90',
        iconWrap: 'bg-white/15 text-white',
      }
    case 'enterprise':
      return {
        card: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl border border-amber-400/20',
        badge: 'bg-amber-400/10 border border-amber-400/30 text-amber-300',
        cta: 'bg-amber-400 text-amber-950 hover:bg-amber-300',
        iconWrap: 'bg-amber-400/15 text-amber-300',
      }
    default:
      return {
        card: 'bg-white border border-black/[0.08] shadow-sm',
        badge: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
        cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
        iconWrap: 'bg-slate-100 text-slate-700',
      }
  }
}

function headlinePrice(product: ProductDefinition): string {
  if (product.packs.length > 0) {
    const first = product.packs[0]
    return `${isEN ? 'From' : 'Od'} ${formatUSD(first.price)}`
  }
  // Enterprise
  return isEN ? 'From $25k / year' : 'Od $25k / rok'
}

function headlineSub(product: ProductDefinition): string {
  if (product.packs.length > 0) {
    const first = product.packs[0]
    return `${first.credits} ${isEN ? 'campaigns' : 'kampanii'} · $${first.perCredit.toFixed(2)}${copy.perCreditLabel}`
  }
  return isEN ? 'Unlimited · custom contract' : 'Bez limitu · custom kontrakt'
}

function ProductCard({ product }: { product: ProductDefinition }) {
  const styles = accentClasses(product.accent)
  const isBundle = product.accent === 'bundle'
  const isEnterprise = product.accent === 'enterprise'
  const isDark = isBundle || isEnterprise
  const Icon = PRODUCT_ICONS[product.key]

  const topFeatures = product.features.slice(0, 4)

  const ctaElement = product.cta === 'self-serve' ? (
    <a
      href={appendUtm(APP_URL, `pricing_${product.key}`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCtaClick(`pricing_${product.key}`)}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all ${styles.cta}`}
    >
      {product.ctaLabel}
    </a>
  ) : (
    <Link
      to={`${pathFor('contact')}?interest=${product.interestTag}`}
      onClick={() => trackCtaClick(`pricing_${product.key}_sales`)}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all ${styles.cta}`}
    >
      {product.ctaLabel}
    </Link>
  )

  return (
    <div className={`relative rounded-2xl p-5 md:p-6 flex flex-col h-full ${styles.card}`}>
      {isBundle && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles.badge}`}>
          <Sparkles className="h-3 w-3" />
          {isEN ? 'Most popular' : 'Najpopularniejsze'}
        </span>
      )}

      <div className="flex items-center gap-2.5 mb-3">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${styles.iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
          {product.name}
        </h3>
      </div>

      <div className={`mb-4 rounded-lg p-3 border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/[0.06] bg-slate-50/60'}`}>
        <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
          {headlinePrice(product)}
        </div>
        <div className={`text-[11px] mt-0.5 ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
          {headlineSub(product)}
        </div>
      </div>

      <ul className="space-y-2 mb-5 flex-1">
        {topFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5 text-[13px] leading-snug">
            <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isDark ? 'text-amber-300' : 'text-emerald-600'}`} />
            <span className={isDark ? 'text-white/90' : 'text-foreground'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {ctaElement}
    </div>
  )
}

function CreditPacksSection() {
  const section = t.pricing.creditPacks
  const sourcing = PRODUCTS.sourcing.packs
  const procurement = PRODUCTS.procurement.packs
  const bundle = PRODUCTS.bundle.packs
  const labels = section.productLabels

  // 3 tiers correspond to pack index 0/1/2 (10/25/50 credits)
  const tiers = section.tiers.map((tier, idx) => ({
    ...tier,
    sourcing: sourcing[idx],
    procurement: procurement[idx],
    bundle: bundle[idx],
  }))

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-16">
      <RevealOnScroll>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{section.title}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier, idx) => {
          const isFeatured = idx === 1
          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 border flex flex-col ${
                isFeatured
                  ? 'bg-white border-primary/30 shadow-lg ring-1 ring-primary/20'
                  : 'bg-white border-black/[0.08] shadow-sm'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {tier.badge}
                </span>
              )}
              <div className="mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {tier.name}
                </div>
                <div className="text-2xl font-bold">{tier.credits}</div>
              </div>
              <div className="space-y-3 mb-2 flex-1">
                <div className="flex items-baseline justify-between py-2 border-b border-black/[0.06]">
                  <span className="text-sm text-muted-foreground">{labels.sourcing}</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatUSD(tier.sourcing.price)}</div>
                    <div className="text-[11px] text-muted-foreground">${tier.sourcing.perCredit.toFixed(2)}{copy.perCreditLabel}</div>
                  </div>
                </div>
                <div className="flex items-baseline justify-between py-2 border-b border-black/[0.06]">
                  <span className="text-sm text-muted-foreground">{labels.procurement}</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatUSD(tier.procurement.price)}</div>
                    <div className="text-[11px] text-muted-foreground">${tier.procurement.perCredit.toFixed(2)}{copy.perCreditLabel}</div>
                  </div>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-sm font-semibold text-primary">{labels.bundle}</span>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatUSD(tier.bundle.price)}</div>
                    <div className="text-[11px] text-muted-foreground">${tier.bundle.perCredit.toFixed(2)}{copy.perCreditLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-5 max-w-xl mx-auto">
        {section.helper}
      </p>
    </section>
  )
}

function renderCell(value: string, highlight = false) {
  if (value === '✓') {
    return <Check className={`h-4 w-4 mx-auto ${highlight ? 'text-primary' : 'text-emerald-600'}`} />
  }
  if (value === '—') {
    return <span className="text-muted-foreground/50">—</span>
  }
  return <span className={highlight ? 'font-semibold text-primary' : ''}>{value}</span>
}

function ComparePlansSection() {
  const section = t.pricing.compare
  const plans = section.plans

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-16">
      <RevealOnScroll>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{section.title}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>
        </div>
      </RevealOnScroll>

      <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/[0.08]">
                <th className="sticky left-0 bg-white text-left font-semibold px-4 py-4 min-w-[200px] z-10">
                  <span className="sr-only">{isEN ? 'Feature' : 'Funkcja'}</span>
                </th>
                <th className="text-center font-semibold px-4 py-4 min-w-[130px]">{plans.sourcing}</th>
                <th className="text-center font-semibold px-4 py-4 min-w-[130px]">{plans.procurement}</th>
                <th className="text-center font-semibold px-4 py-4 min-w-[130px] bg-primary/5 text-primary">{plans.bundle}</th>
                <th className="text-center font-semibold px-4 py-4 min-w-[130px]">{plans.enterprise}</th>
              </tr>
            </thead>
            <tbody>
              {section.groups.map((group) => (
                <Fragment key={group.name}>
                  <tr className="bg-slate-50">
                    <td
                      colSpan={5}
                      className="sticky left-0 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      {group.name}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={`${group.name}-${row.label}`} className="border-b border-black/[0.04] last:border-b-0">
                      <td className="sticky left-0 bg-white px-4 py-3 text-left">{row.label}</td>
                      <td className="text-center px-4 py-3">{renderCell(row.sourcing)}</td>
                      <td className="text-center px-4 py-3">{renderCell(row.procurement)}</td>
                      <td className="text-center px-4 py-3 bg-primary/[0.03]">{renderCell(row.bundle, true)}</td>
                      <td className="text-center px-4 py-3">{renderCell(row.enterprise)}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pt-32 pb-24">
        {/* Hero — compact */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {copy.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEN
              ? 'Buy only what you need. Start free, scale on demand.'
              : 'Kupuj tylko to czego potrzebujesz. Zacznij za darmo, skaluj kiedy chcesz.'}
          </p>
        </section>

        {/* Savings calculator — compact inline */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
          <SavingsCalculator variant="pricing" />
        </section>

        {/* Product cards — 4 simplified */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ORDERED_PRODUCTS.map((key: Product) => (
              <ProductCard key={key} product={PRODUCTS[key]} />
            ))}
          </div>
        </section>

        {/* Credit packs */}
        <CreditPacksSection />

        {/* Compare plans */}
        <ComparePlansSection />

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mb-16">
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
              {isEN ? 'Not sure which product fits?' : 'Nie wiesz który produkt Ci pasuje?'}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Book a 15-minute call. We walk through your procurement volume and recommend Sourcing-only, Bundle, or Enterprise Custom.'
                : 'Umów 15-minutowe spotkanie. Przejdziemy przez Twój wolumen procurement i polecimy Sourcing-only, Bundle, lub Enterprise Custom.'}
            </p>
            <Link
              to={pathFor('contact')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
            >
              {isEN ? 'Talk to us' : 'Porozmawiaj z nami'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
