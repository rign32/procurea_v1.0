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
      to={`${pathFor('contact')}?interest=${product.interestTag}#calendar`}
      onClick={() => trackCtaClick(`pricing_${product.key}_sales`)}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all ${styles.cta}`}
    >
      {product.ctaLabel}
    </Link>
  )

  return (
    <div className={`relative rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-hover-card ${styles.card}`}>
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
              className={`relative rounded-2xl p-6 border flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
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


export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 bg-mesh-gradient">
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
              ? 'Start with AI Sourcing — find qualified suppliers. Extend with AI Procurement for full RFQ workflow. Bundle both at 15% off. All features included, pay per campaign.'
              : 'Zacznij od AI Sourcing — znajdź dostawców. Rozszerz o AI Procurement dla pełnego workflow RFQ. Bundle za oba z 15% rabatem. Wszystkie funkcje dostępne, płać za kampanię.'}
          </p>
        </section>

        {/* How the modules work */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-14">
          <RevealOnScroll>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-8">
                {isEN ? 'How the modules work together' : 'Jak moduły współpracują'}
              </h2>

              <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
                {/* Step 1: AI Sourcing */}
                <div className="flex-1 rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Base</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">AI Sourcing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isEN
                      ? 'Find qualified suppliers in 26 languages. Get a verified shortlist with contacts and certifications. Works standalone.'
                      : 'Znajdź zweryfikowanych dostawców w 26 językach. Otrzymaj listę z kontaktami i certyfikatami. Działa samodzielnie.'}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center px-2">
                  <div className="text-xs font-bold text-muted-foreground/50 md:rotate-0 rotate-90">
                    {isEN ? '+ extend with' : '+ rozszerz o'}
                  </div>
                </div>

                {/* Step 2: AI Procurement */}
                <div className="flex-1 rounded-xl bg-primary/[0.04] border border-primary/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Workflow className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Extension</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">AI Procurement</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isEN
                      ? 'Extend any Sourcing campaign with RFQ outreach, Supplier Portal, offer collection, and AI-powered comparison. Requires AI Sourcing.'
                      : 'Rozszerz dowolną kampanię Sourcingową o outreach RFQ, Supplier Portal, zbieranie ofert i porównanie AI. Wymaga AI Sourcing.'}
                  </p>
                </div>
              </div>

              {/* Bundle callout */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 via-primary/5 to-emerald-500/5 border border-primary/10 p-4 text-center mb-4">
                <span className="text-sm font-semibold">
                  <Layers className="h-4 w-4 inline-block mr-1.5 -mt-0.5 text-primary" />
                  Bundle = {isEN ? 'AI Sourcing + AI Procurement for every campaign. Save 15%.' : 'AI Sourcing + AI Procurement za każdą kampanię. Oszczędź 15%.'}
                </span>
              </div>

              {/* Key message */}
              <div className="rounded-lg bg-amber-50 border border-amber-200/60 px-4 py-3 text-center">
                <p className="text-sm font-medium text-amber-900">
                  {isEN
                    ? 'All features included in every plan. No feature gating — you pay per campaign, not per feature.'
                    : 'Wszystkie funkcje dostępne w każdym planie. Bez ograniczeń funkcji — płacisz za kampanię, nie za funkcje.'}
                </p>
              </div>
            </div>
          </RevealOnScroll>
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-brand-500/[0.06] rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[80px]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {isEN ? 'Not sure which product fits?' : 'Nie wiesz który produkt Ci pasuje?'}
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Book a 15-minute call. We walk through your procurement volume and recommend Sourcing-only, Bundle, or Enterprise Custom.'
                : 'Umów 15-minutowe spotkanie. Przejdziemy przez Twój wolumen procurement i polecimy Sourcing-only, Bundle, lub Enterprise Custom.'}
            </p>
            <Link
              to={`${pathFor('contact')}#calendar`}
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
