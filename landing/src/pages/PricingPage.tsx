import { Link } from "react-router-dom"
import { Check, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"
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

function accentClasses(accent: ProductDefinition['accent']) {
  switch (accent) {
    case 'primary':
      return {
        card: 'bg-white border border-primary/20 shadow-md',
        badge: 'bg-primary/10 text-primary border-primary/20',
        cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
      }
    case 'bundle':
      return {
        card: 'bg-primary text-primary-foreground shadow-2xl ring-2 ring-primary/30 lg:scale-[1.02]',
        badge: 'bg-amber-400 text-amber-950',
        cta: 'bg-white text-primary hover:bg-white/90',
      }
    case 'enterprise':
      return {
        card: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl border border-amber-400/20',
        badge: 'bg-amber-400/10 border border-amber-400/30 text-amber-300',
        cta: 'bg-amber-400 text-amber-950 hover:bg-amber-300',
      }
    default:
      return {
        card: 'bg-white border border-black/[0.08] shadow-sm',
        badge: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
        cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
      }
  }
}

function ProductCard({ product }: { product: ProductDefinition }) {
  const styles = accentClasses(product.accent)
  const isBundle = product.accent === 'bundle'
  const isEnterprise = product.accent === 'enterprise'
  const isDark = isBundle || isEnterprise

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
    <div className={`relative rounded-2xl p-6 md:p-7 flex flex-col h-full ${styles.card}`}>
      {product.badge && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles.badge}`}>
          {isBundle && <Sparkles className="h-3 w-3" />}
          {product.badge}
        </span>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-foreground'}`}>
          {product.name}
        </h3>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>
          {product.tagline}
        </p>
      </div>

      {/* Price area */}
      {product.packs.length > 0 ? (
        <div className={`mb-6 rounded-xl p-4 border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/[0.06] bg-slate-50/60'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
            {copy.packLabel}
          </div>
          <ul className="space-y-1.5">
            {product.packs.map((pack) => (
              <li key={pack.credits} className="flex items-baseline justify-between text-sm">
                <span className={isDark ? 'text-white/90' : 'text-foreground'}>{pack.label}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {formatUSD(pack.price)}
                  <span className={`ml-1 text-[11px] font-normal ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
                    · ${pack.perCredit.toFixed(2)}{copy.perCreditLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{product.badge}</div>
          <div className="text-sm text-white/80">{isEN ? 'Unlimited · custom contract' : 'Bez limitu · custom kontrakt'}</div>
        </div>
      )}

      {/* Description */}
      <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>
        {product.description}
      </p>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? 'text-amber-300' : 'text-emerald-600'}`} />
            <span className={isDark ? 'text-white/90' : 'text-foreground'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {ctaElement}
    </div>
  )
}

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <RouteMeta />
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            {copy.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {copy.heroSubtitle}
          </p>
        </section>

        {/* Product cards — 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ORDERED_PRODUCTS.map((key: Product) => (
              <ProductCard key={key} product={PRODUCTS[key]} />
            ))}
          </div>
        </section>

        {/* How credits work */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-24">
          <RevealOnScroll>
            <div className="rounded-2xl border border-black/[0.08] bg-white p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-center">
                {copy.howItWorksTitle}
              </h2>
              <ul className="space-y-3">
                {copy.howItWorksPoints.map((point, idx) => (
                  <li key={point} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm leading-relaxed pt-0.5">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
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
