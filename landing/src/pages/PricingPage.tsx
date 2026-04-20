import { Link } from "react-router-dom"
import { Search, Workflow, Layers, Sparkles, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
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

const PRODUCT_ICONS: Record<Product, LucideIcon> = {
  sourcing: Search,
  procurement: Workflow,
  bundle: Layers,
  enterprise: Sparkles,
}

/* ─────────── Plan card (prototype-style) ─────────── */

function headlinePrice(product: ProductDefinition): string {
  if (product.packs.length > 0) {
    return formatUSD(product.packs[0].price)
  }
  return isEN ? 'Custom' : 'Indywidualnie'
}

function headlineUnit(product: ProductDefinition): string {
  if (product.packs.length > 0) {
    const first = product.packs[0]
    return `/ ${first.credits} ${isEN ? 'campaigns' : 'kampanii'}`
  }
  return isEN ? 'contract' : 'kontrakt'
}

function PlanCard({ product }: { product: ProductDefinition }) {
  const featured = product.accent === 'bundle'
  const Icon = PRODUCT_ICONS[product.key]
  const topFeatures = product.features.slice(0, 5)

  const ctaElement = product.cta === 'self-serve' ? (
    <a
      href={appendUtm(APP_URL, `pricing_${product.key}`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCtaClick(`pricing_${product.key}`)}
      className={`btn-ds ${featured ? 'btn-ds-secondary' : 'btn-ds-ghost'} w-full justify-center mt-auto`}
    >
      {product.ctaLabel}
      <span className="arrow" aria-hidden>→</span>
    </a>
  ) : (
    <Link
      to={`${pathFor('contact')}?interest=${product.interestTag}#calendar`}
      onClick={() => trackCtaClick(`pricing_${product.key}_sales`)}
      className={`btn-ds ${featured ? 'btn-ds-secondary' : 'btn-ds-ghost'} w-full justify-center mt-auto`}
    >
      {product.ctaLabel}
      <span className="arrow" aria-hidden>→</span>
    </Link>
  )

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-[14px] bg-[hsl(var(--ds-surface))] p-7 transition-all duration-200 ${
        featured
          ? 'border-[1.5px] border-[hsl(var(--ds-accent))] shadow-[var(--ds-shadow-md)]'
          : 'border border-[hsl(var(--ds-rule))] hover:border-[hsl(var(--ds-rule-2))]'
      }`}
    >
      {featured && (
        <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[hsl(var(--ds-accent))] text-white px-2.5 py-1 rounded-full whitespace-nowrap">
          {isEN ? 'Most popular' : 'Najpopularniejsze'}
        </span>
      )}

      {/* Plan header */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="grid place-items-center h-7 w-7 rounded-[7px] bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))]">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <h3 className="text-[16px] font-semibold text-[hsl(var(--ds-ink))]">{product.name}</h3>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[40px] font-semibold tracking-[-0.02em] leading-none text-[hsl(var(--ds-ink))]">
            {headlinePrice(product)}
          </span>
          <span className="text-[13px] text-[hsl(var(--ds-muted))]">{headlineUnit(product)}</span>
        </div>
      </div>

      <p className="text-[13px] leading-[1.5] text-[hsl(var(--ds-muted))]">
        {product.tagline}
      </p>

      {/* Features with radial-dot bullets */}
      <ul className="list-none p-0 m-0 grid gap-2.5 flex-1">
        {topFeatures.map((feature) => (
          <li
            key={feature}
            className="text-[13.5px] leading-[1.45] text-[hsl(var(--ds-ink-2))] flex items-start gap-2.5"
          >
            <span
              aria-hidden
              className="mt-[3px] h-[14px] w-[14px] rounded-full bg-[hsl(var(--ds-accent-soft))] shrink-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, hsl(var(--ds-accent)) 0 28%, transparent 30%)",
              }}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {ctaElement}
    </div>
  )
}

/* ─────────── Credit packs (prototype-style 4 cards) ─────────── */

type CreditCard = {
  label: string
  credits: string
  price: string
  perUnit: string
  save?: string
  best?: boolean
}

function creditCardsFromProduct(product: ProductDefinition): CreditCard[] {
  // Derive 3 pack cards from the product + 1 enterprise call-out
  const labels = isEN
    ? ['Starter pack', 'Team pack', 'Scale pack']
    : ['Pakiet startowy', 'Pakiet zespołu', 'Pakiet skalujący']

  const packCards: CreditCard[] = product.packs.map((pack, i) => {
    const base = product.packs[0].perCredit
    const savePct = i === 0 ? undefined : Math.round((1 - pack.perCredit / base) * 100)
    return {
      label: labels[i] ?? `${pack.credits} ${isEN ? 'credits' : 'kredytów'}`,
      credits: `${pack.credits} ${isEN ? 'credits' : 'kredytów'}`,
      price: formatUSD(pack.price),
      perUnit: `${formatUSD(pack.perCredit)} / ${isEN ? 'run' : 'kampanii'}`,
      save: savePct && savePct > 0 ? (isEN ? `Save ${savePct}%` : `−${savePct}%`) : undefined,
      best: i === 1,
    }
  })

  return [
    ...packCards,
    {
      label: isEN ? 'Enterprise' : 'Enterprise',
      credits: isEN ? '100+ credits' : '100+ kredytów',
      price: isEN ? 'Custom' : 'Indywidualnie',
      perUnit: isEN ? 'from $4.40 / run' : 'od $4,40 / kampanię',
    },
  ]
}

function CreditPacksSection() {
  // Use Bundle packs as the canonical credit-pack view (same-count credits across both modules)
  const cards = creditCardsFromProduct(PRODUCTS.bundle)

  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pt-0 pb-[clamp(48px,6vw,80px)]">
      <RevealOnScroll>
        <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(28px,4vw,48px)]">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {isEN ? 'Credit packs' : 'Pakiety kredytów'}
          </span>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] max-w-[28ch] text-[hsl(var(--ds-ink))]">
            {isEN ? 'Or: pay only for what you source.' : 'Albo: płać tylko za to, co sourcingujesz.'}
          </h2>
          <p className="text-[16px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
            {isEN
              ? 'Buy credits up front. One credit = one full Bundle campaign (AI Sourcing + RFQ workflow).'
              : 'Kup kredyty z góry. Jeden kredyt = jedna pełna kampania Bundle (AI Sourcing + workflow RFQ).'}
          </p>
        </div>
      </RevealOnScroll>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {cards.map((c) => (
          <motion.div
            key={c.label}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            className={`relative rounded-[12px] bg-[hsl(var(--ds-surface))] p-[18px] ${
              c.best
                ? 'border border-[hsl(var(--ds-accent))]'
                : 'border border-[hsl(var(--ds-rule))]'
            }`}
          >
            {c.save && (
              <span className="absolute top-2.5 right-2.5 font-mono text-[10px] font-medium px-2 py-[3px] rounded-full bg-[#e6f2ec] text-[hsl(var(--ds-good))]">
                {c.save}
              </span>
            )}
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--ds-muted))]">
              {c.label}
            </div>
            <div className="font-mono text-[22px] font-semibold my-2 text-[hsl(var(--ds-ink))]">
              {c.credits}
            </div>
            <div className="text-[13px] text-[hsl(var(--ds-muted))]">
              {c.price} · {c.perUnit}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ─────────── FAQ (prototype-style details/summary) ─────────── */

function FaqSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
      <RevealOnScroll>
        <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(28px,4vw,48px)]">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {isEN ? 'Pricing FAQ' : 'FAQ o cennik'}
          </span>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] text-[hsl(var(--ds-ink))]">
            {isEN ? 'Common questions' : 'Częste pytania'}
          </h2>
        </div>
      </RevealOnScroll>

      <div className="max-w-[760px] mx-auto grid gap-2 faq-ds">
        {copy.faq.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-[10px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] p-[14px_18px] open:border-[hsl(var(--ds-ink-3))] transition-colors"
          >
            <summary className="cursor-pointer list-none flex justify-between gap-4 text-[15px] font-semibold text-[hsl(var(--ds-ink))] [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="font-mono text-[20px] text-[hsl(var(--ds-muted))] transition-transform group-open:rotate-45 leading-none"
              >
                +
              </span>
            </summary>
            <p className="mt-2.5 text-[14px] leading-[1.6] text-[hsl(var(--ds-ink-2))]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ─────────── Page ─────────── */

export function PricingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--ds-bg))]">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pb-20">
        {/* Hero — centered evergreen wash */}
        <section className="hero-wash border-b border-[hsl(var(--ds-rule))]">
          <div className="mx-auto max-w-[920px] px-[clamp(20px,4vw,72px)] pt-[clamp(96px,10vw,144px)] pb-[clamp(32px,4vw,56px)] text-center">
            <span className="eyebrow mb-5 inline-flex">
              <span className="eyebrow-dot" />
              {isEN ? "Pricing" : "Cennik"}
            </span>
            <h1 className="font-display text-[clamp(36px,5.2vw,64px)] font-bold leading-[1.04] tracking-[-0.03em] mb-[18px] text-balance text-[hsl(var(--ds-ink))]">
              {copy.heroTitle}.
            </h1>
            <RevealOnScroll>
              <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] mx-auto mb-7">
                {isEN
                  ? 'Start with 3 free sourcing runs. When you need more, pick a plan — or buy a credit pack. No per-seat fees, no 12-month lock-in, no "contact sales" for self-serve plans.'
                  : 'Zacznij od 3 darmowych kampanii. Gdy potrzebujesz więcej — wybierz plan lub pakiet kredytów. Bez opłat per-seat, bez blokady 12-miesięcznej, bez "skontaktuj się z nami" dla planów self-serve.'}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a
                  href={appendUtm(APP_URL, 'pricing_hero_signup')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('pricing_hero_signup')}
                  className="btn-ds btn-ds-primary"
                >
                  {isEN ? 'Start free' : 'Zacznij za darmo'}
                  <span className="arrow" aria-hidden>→</span>
                </a>
                <a href="#plans" className="btn-ds btn-ds-ghost">
                  {isEN ? 'Compare plans' : 'Porównaj plany'}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Plans grid */}
        <section id="plans" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(32px,4vw,56px)]">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {ORDERED_PRODUCTS.map((key: Product) => (
              <motion.div
                key={key}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="h-full"
              >
                <PlanCard product={PRODUCTS[key]} />
              </motion.div>
            ))}
          </motion.div>

          {/* How modules work together — compact call-out */}
          <div className="mt-12 rounded-[14px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] p-6 md:p-8">
            <div className="grid md:grid-cols-[auto_1fr_auto] items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-[10px] bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))]">
                  <Layers className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--ds-accent))]">
                  {isEN ? 'How modules fit together' : 'Jak moduły pasują do siebie'}
                </span>
              </div>
              <p className="text-[14.5px] text-[hsl(var(--ds-ink-2))] leading-[1.55]">
                {isEN
                  ? 'AI Sourcing works standalone. AI Procurement extends any Sourcing campaign with RFQ outreach, Supplier Portal, and side-by-side offer comparison. Bundle = both modules at every campaign, ~15% off.'
                  : 'AI Sourcing działa samodzielnie. AI Procurement rozszerza dowolną kampanię Sourcingową o outreach RFQ, Supplier Portal i porównanie ofert. Bundle = oba moduły w każdej kampanii, ~15% taniej.'}
              </p>
              <Link
                to={pathFor('featuresHub')}
                className="font-semibold text-sm text-[hsl(var(--ds-accent))] inline-flex items-center gap-1.5 hover:gap-2.5 transition-all whitespace-nowrap"
              >
                {isEN ? 'Explore modules' : 'Poznaj moduły'} →
              </Link>
            </div>
          </div>
        </section>

        {/* Credit packs */}
        <CreditPacksSection />

        {/* FAQ */}
        <FaqSection />

        {/* Final CTA */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
          <div className="cta-block-ds grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-[clamp(24px,2.8vw,34px)] font-bold leading-[1.15] text-white max-w-[18ch]">
                {isEN ? 'Not sure which plan fits?' : 'Nie wiesz, który plan pasuje?'}
              </h2>
              <p className="mt-3 text-white/70">
                {isEN
                  ? 'Tell us your category volume — we\'ll pick a plan and show you a projected ROI in 15 minutes.'
                  : 'Powiedz nam o wolumenie Twoich kategorii — wybierzemy plan i pokażemy projekcję ROI w 15 minut.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={`${pathFor('contact')}#calendar`} className="btn-ds btn-ds-primary">
                {isEN ? 'Book a demo' : 'Umów demo'}
                <span className="arrow" aria-hidden>→</span>
              </Link>
              <a
                href={appendUtm(APP_URL, 'pricing_final_signup')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ds btn-ds-dark"
              >
                {isEN ? 'Start free' : 'Zacznij za darmo'}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
