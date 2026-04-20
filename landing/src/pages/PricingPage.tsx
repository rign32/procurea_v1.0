import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

/* ─────────── Plans (matches prototype's 3-plan structure) ─────────── */

type PlanCta = 'self-serve' | 'featured' | 'contact-sales'

interface Plan {
  name: string
  price: string
  unit: string
  tagline: string
  features: string[]
  cta: { label: string; kind: PlanCta; interestTag?: string }
  featured?: boolean
}

const plans: Plan[] = isEN
  ? [
      {
        name: "Starter",
        price: "€89",
        unit: "/ month",
        tagline: "For a single buyer running a handful of RFQs.",
        features: [
          "20 sourcing runs / month",
          "Up to 50 suppliers per run",
          "2 RFQ templates",
          "CSV export",
          "Email support",
        ],
        cta: { label: "Start free", kind: "self-serve" },
      },
      {
        name: "Growth",
        price: "€349",
        unit: "/ month",
        tagline: "For procurement teams of 2–5 at an SMB manufacturer or builder.",
        features: [
          "100 sourcing runs / month",
          "Up to 250 suppliers per run",
          "Unlimited RFQ templates",
          "ERP connectors (NetSuite, Dynamics 365 BC, QuickBooks, Xero)",
          "Shared inbox & approval flows",
          "Priority support + onboarding",
        ],
        cta: { label: "Start Growth", kind: "featured", interestTag: "growth_plan" },
        featured: true,
      },
      {
        name: "Scale",
        price: "€890",
        unit: "/ month",
        tagline: "Multiple sites, multiple categories, custom compliance.",
        features: [
          "Unlimited sourcing runs",
          "Custom supplier verification rules",
          "SSO & audit log",
          "Dedicated category manager",
          "99.9% SLA",
        ],
        cta: { label: "Talk to sales", kind: "contact-sales", interestTag: "scale_plan" },
      },
    ]
  : [
      {
        name: "Starter",
        price: "€89",
        unit: "/ miesiąc",
        tagline: "Dla jednego kupca prowadzącego kilka RFQ.",
        features: [
          "20 kampanii sourcingowych / miesiąc",
          "Do 50 dostawców na kampanię",
          "2 szablony RFQ",
          "Eksport CSV",
          "Wsparcie mailowe",
        ],
        cta: { label: "Zacznij za darmo", kind: "self-serve" },
      },
      {
        name: "Growth",
        price: "€349",
        unit: "/ miesiąc",
        tagline: "Dla 2–5 osobowych zespołów procurement w SMB produkcji lub budownictwie.",
        features: [
          "100 kampanii sourcingowych / miesiąc",
          "Do 250 dostawców na kampanię",
          "Nielimitowane szablony RFQ",
          "Konektory ERP (NetSuite, Dynamics 365 BC, QuickBooks, Xero)",
          "Wspólny inbox i flow zatwierdzania",
          "Priorytetowe wsparcie + onboarding",
        ],
        cta: { label: "Zacznij Growth", kind: "featured", interestTag: "growth_plan" },
        featured: true,
      },
      {
        name: "Scale",
        price: "€890",
        unit: "/ miesiąc",
        tagline: "Wiele lokalizacji, wiele kategorii, custom compliance.",
        features: [
          "Nielimitowane kampanie sourcingowe",
          "Custom reguły weryfikacji dostawców",
          "SSO i audit log",
          "Dedykowany category manager",
          "99,9% SLA",
        ],
        cta: { label: "Porozmawiaj z nami", kind: "contact-sales", interestTag: "scale_plan" },
      },
    ]

/* ─────────── Credit packs (prototype 4-card layout) ─────────── */

interface CreditPack {
  label: string
  credits: string
  price: string
  perRun: string
  save?: string
  best?: boolean
}

const creditPacks: CreditPack[] = isEN
  ? [
      { label: "Starter pack", credits: "10 credits",    price: "€69",     perRun: "€6.90 / run" },
      { label: "Team pack",    credits: "25 credits",    price: "€132",    perRun: "€5.28 / run", save: "Save 24%", best: true },
      { label: "Scale pack",   credits: "50 credits",    price: "€220",    perRun: "€4.40 / run" },
      { label: "Enterprise",   credits: "100+ credits",  price: "Custom",  perRun: "from €3.80 / run" },
    ]
  : [
      { label: "Pakiet startowy",  credits: "10 kredytów",    price: "€69",           perRun: "€6,90 / kampania" },
      { label: "Pakiet zespołu",   credits: "25 kredytów",    price: "€132",          perRun: "€5,28 / kampania", save: "−24%", best: true },
      { label: "Pakiet skalujący", credits: "50 kredytów",    price: "€220",          perRun: "€4,40 / kampania" },
      { label: "Enterprise",       credits: "100+ kredytów",  price: "Indywidualnie", perRun: "od €3,80 / kampania" },
    ]

/* ─────────── FAQ ─────────── */

const faq = isEN
  ? [
      { q: 'What counts as a "sourcing run"?',                    a: 'One spec / category + region combination, returning a ranked list of up to 250 suppliers. You can export, shortlist and send RFQs from that same run without consuming extra credits.' },
      { q: 'What if I run out of credits mid-month?',             a: "Top up with any credit pack — they stack. Or switch to a plan, and we'll prorate." },
      { q: 'Do you offer a free trial?',                          a: 'Yes. 3 free sourcing runs when you sign up. No credit card.' },
      { q: 'Annual billing discount?',                            a: 'Yes — 15% off all plans billed annually.' },
      { q: 'Is there a setup fee?',                               a: 'No. On Growth and Scale, onboarding is included.' },
    ]
  : [
      { q: 'Co liczy się jako „sourcing run"?',                    a: 'Jedna specyfikacja / kategoria + region, zwraca ranking do 250 dostawców. Z tego samego runu możesz eksportować, shortlistować i wysyłać RFQ bez dodatkowych kredytów.' },
      { q: 'Co jeśli skończą mi się kredyty w środku miesiąca?',   a: 'Doładuj dowolnym pakietem — stakują się. Albo przejdź na plan, przeliczymy proporcjonalnie.' },
      { q: 'Czy oferujecie darmowy trial?',                        a: 'Tak. 3 darmowe sourcing run po rejestracji. Bez karty.' },
      { q: 'Rabat za rozliczenie roczne?',                         a: 'Tak — 15% zniżki na wszystkie plany przy rozliczeniu rocznym.' },
      { q: 'Czy jest opłata wdrożeniowa?',                         a: 'Nie. Na Growth i Scale onboarding jest wliczony.' },
    ]

/* ─────────── Plan card ─────────── */

function PlanCard({ plan }: { plan: Plan }) {
  const ctaClass =
    plan.cta.kind === "featured" ? "btn-ds btn-ds-secondary" : "btn-ds btn-ds-ghost"

  const ctaElement = plan.cta.kind === "contact-sales"
    ? (
      <Link
        to={`${pathFor('contact')}${plan.cta.interestTag ? `?interest=${plan.cta.interestTag}` : ''}#calendar`}
        onClick={() => trackCtaClick(`pricing_${plan.name.toLowerCase()}_sales`)}
        className={`${ctaClass} w-full justify-center mt-auto`}
      >
        {plan.cta.label}
      </Link>
    )
    : (
      <a
        href={appendUtm(APP_URL, `pricing_${plan.name.toLowerCase()}`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCtaClick(`pricing_${plan.name.toLowerCase()}`)}
        className={`${ctaClass} w-full justify-center mt-auto`}
      >
        {plan.cta.label}
      </a>
    )

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative flex flex-col gap-4 rounded-[14px] bg-[hsl(var(--ds-surface))] p-7 transition-shadow duration-200 ${
        plan.featured
          ? "border-[1.5px] border-[hsl(var(--ds-accent))] shadow-[0_4px_12px_rgba(14,22,20,0.06),0_12px_32px_rgba(14,22,20,0.05)] hover:shadow-[0_8px_20px_rgba(14,22,20,0.08),0_16px_40px_rgba(14,22,20,0.08)]"
          : "border border-[hsl(var(--ds-rule))] hover:border-[hsl(var(--ds-ink-3))] hover:shadow-[0_4px_16px_-4px_rgba(14,22,20,0.08)]"
      }`}
    >
      {plan.featured && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute -top-[11px] left-1/2 -translate-x-1/2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[hsl(var(--ds-accent))] text-white px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_2px_8px_rgba(22,42,82,0.25)]"
        >
          {isEN ? "Most popular" : "Najpopularniejsze"}
        </motion.span>
      )}

      <div>
        <h3 className="text-[16px] font-semibold text-[hsl(var(--ds-ink))] mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[40px] font-semibold tracking-[-0.02em] leading-none text-[hsl(var(--ds-ink))]">
            {plan.price}
          </span>
          <span className="text-[13px] text-[hsl(var(--ds-muted))]">{plan.unit}</span>
        </div>
      </div>

      <p className="text-[13px] leading-[1.5] text-[hsl(var(--ds-muted))]">
        {plan.tagline}
      </p>

      <ul className="list-none p-0 m-0 grid gap-2.5 flex-1">
        {plan.features.map((feature) => (
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
    </motion.div>
  )
}

/* ─────────── Page ─────────── */

export function PricingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--ds-bg))]">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pb-20">
        {/* Hero */}
        <section className="hero-wash border-b border-[hsl(var(--ds-rule))]">
          <div className="mx-auto max-w-[920px] px-[clamp(20px,4vw,72px)] pt-[clamp(96px,10vw,144px)] pb-[clamp(32px,4vw,56px)] text-center">
            <span className="eyebrow mb-5 inline-flex">
              <span className="eyebrow-dot" />
              {isEN ? "Pricing" : "Cennik"}
            </span>
            <h1 className="font-display text-[clamp(36px,5.2vw,64px)] font-bold leading-[1.04] tracking-[-0.03em] mb-[18px] text-balance text-[hsl(var(--ds-ink))]">
              {isEN ? "Transparent credit-based pricing." : "Przejrzysty pricing credit-based."}
            </h1>
            <RevealOnScroll>
              <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] mx-auto mb-7">
                {isEN
                  ? 'Start with 3 free sourcing runs. When you need more, pick a plan — or buy a credit pack. No per-seat fees, no 12-month lock-in, no "contact sales".'
                  : 'Zacznij od 3 darmowych sourcing run. Gdy potrzebujesz więcej — wybierz plan lub pakiet kredytów. Bez opłat per-seat, bez blokady 12-miesięcznej, bez „skontaktuj się z nami".'}
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

        {/* Plans grid — 3 cards matching prototype */}
        <section id="plans" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(32px,4vw,56px)]">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="h-full"
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Credit packs */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
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
                  ? 'Buy credits up front. One credit = one sourcing run (up to 250 suppliers).'
                  : 'Kup kredyty z góry. Jeden kredyt = jedna kampania sourcingowa (do 250 dostawców).'}
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
            {creditPacks.map((c) => (
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
                  {c.price} · {c.perRun}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FAQ */}
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

          <div className="max-w-[760px] mx-auto grid gap-2">
            {faq.map((item, i) => (
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

        {/* Final CTA */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
          <div className="cta-block-ds grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-[clamp(24px,2.8vw,34px)] font-bold leading-[1.15] text-white max-w-[18ch]">
                {isEN ? 'Not sure which plan fits?' : 'Nie wiesz, który plan pasuje?'}
              </h2>
              <p className="mt-3 text-white/70">
                {isEN
                  ? "Tell us your category volume — we'll pick a plan and show you a projected ROI in 15 minutes."
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
