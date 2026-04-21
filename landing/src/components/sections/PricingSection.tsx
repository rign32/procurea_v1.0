import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Check } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

interface Plan {
  name: string
  price: string
  originalPrice?: string
  unit: string
  runs: string
  perRun: string
  tagline: string
  cta: string
  featured?: boolean
}

const plans: Plan[] = isEN
  ? [
      {
        name: "Starter",
        price: "$69",
        originalPrice: "$129",
        unit: "/ month",
        runs: "10 sourcing campaigns",
        perRun: "$6.90 / campaign",
        tagline: "For a single buyer running occasional RFQs.",
        cta: "Start free",
      },
      {
        name: "Growth",
        price: "$159",
        originalPrice: "$299",
        unit: "/ month",
        runs: "50 sourcing campaigns",
        perRun: "$3.18 / campaign",
        tagline: "For procurement teams of 2–5 at an SMB.",
        cta: "Start Growth",
        featured: true,
      },
      {
        name: "Scale",
        price: "$299",
        originalPrice: "$549",
        unit: "/ month",
        runs: "150 sourcing campaigns",
        perRun: "$1.99 / campaign",
        tagline: "For multi-site, multi-category operations.",
        cta: "Start Scale",
      },
    ]
  : [
      {
        name: "Starter",
        price: "289 zł",
        originalPrice: "549 zł",
        unit: "/ miesiąc",
        runs: "10 kampanii sourcingowych",
        perRun: "28,90 zł / kampania",
        tagline: "Dla jednego kupca prowadzącego kilka RFQ miesięcznie.",
        cta: "Zacznij za darmo",
      },
      {
        name: "Growth",
        price: "649 zł",
        originalPrice: "1 199 zł",
        unit: "/ miesiąc",
        runs: "50 kampanii sourcingowych",
        perRun: "12,98 zł / kampania",
        tagline: "Dla 2–5 osobowych zespołów procurement w SMB.",
        cta: "Zacznij Growth",
        featured: true,
      },
      {
        name: "Scale",
        price: "1 199 zł",
        originalPrice: "2 199 zł",
        unit: "/ miesiąc",
        runs: "150 kampanii sourcingowych",
        perRun: "7,99 zł / kampania",
        tagline: "Dla multi-site, multi-category operacji.",
        cta: "Zacznij Scale",
      },
    ]

const sharedIncludes = isEN
  ? [
      "AI pipeline — up to 250 verified suppliers",
      "30+ business languages",
      "Supplier Database with AI scores",
      "One-click Excel export",
      "ERP connectors (NetSuite, D365 BC, QuickBooks, Xero)",
      "3 free campaigns on signup — no credit card",
    ]
  : [
      "AI pipeline — do 250 zweryfikowanych dostawców",
      "30+ języków biznesowych",
      "Baza Dostawców z ocenami AI",
      "Eksport Excel jednym kliknięciem",
      "Konektory ERP (NetSuite, D365 BC, QuickBooks, Xero)",
      "3 darmowe kampanie po rejestracji — bez karty",
    ]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export function PricingSection() {
  return (
    <section id="cennik" className="py-20 lg:py-28 bg-[hsl(var(--ds-bg))]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[hsl(var(--ds-accent))] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ds-accent))]" />
              {isEN ? "Pricing" : "Cennik"}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-4 text-[hsl(var(--ds-ink))]">
              {isEN
                ? "Pay for sourcing runs. Add procurement on demand."
                : "Płać za kampanie sourcingowe. Procurement dodawaj kiedy potrzebujesz."}
            </h2>
            <p className="text-base sm:text-lg text-[hsl(var(--ds-ink-3))] leading-relaxed">
              {isEN
                ? "All features in every plan — plans differ only in how many sourcing campaigns you get each month. Add AI Procurement workflow ($29 / run) when you want full RFQ outreach."
                : "Wszystkie funkcje w każdym planie — plany różnią się tylko liczbą kampanii sourcingowych na miesiąc. Dodaj AI Procurement workflow (129 zł / run), gdy chcesz pełny outreach RFQ."}
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-4 lg:gap-5 max-w-6xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className={`relative flex flex-col gap-4 rounded-2xl bg-[hsl(var(--ds-surface))] p-7 transition-shadow duration-200 ${
                plan.featured
                  ? "border-[1.5px] border-[hsl(var(--ds-accent))] shadow-[0_4px_12px_rgba(14,22,20,0.06),0_12px_32px_rgba(14,22,20,0.05)] hover:shadow-[0_8px_20px_rgba(14,22,20,0.08),0_16px_40px_rgba(14,22,20,0.08)]"
                  : "border border-[hsl(var(--ds-rule))] hover:border-[hsl(var(--ds-ink-3))] hover:shadow-[0_4px_16px_-4px_rgba(14,22,20,0.08)]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[hsl(var(--ds-accent))] text-white px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_2px_8px_rgba(22,42,82,0.25)]">
                  {isEN ? "Most popular" : "Najpopularniejsze"}
                </span>
              )}

              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--ds-ink))] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[40px] font-semibold tracking-[-0.02em] leading-none text-[hsl(var(--ds-ink))]">
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="font-mono text-[18px] font-medium text-[hsl(var(--ds-muted))] line-through leading-none">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-sm text-[hsl(var(--ds-muted))]">{plan.unit}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[hsl(var(--ds-muted))]">
                {plan.tagline}
              </p>

              <div className="flex flex-col gap-1 rounded-[10px] bg-[hsl(var(--ds-accent-soft))] px-4 py-3">
                <span className="font-mono text-[15px] font-semibold text-[hsl(var(--ds-ink))]">
                  {plan.runs}
                </span>
                <span className="text-xs text-[hsl(var(--ds-muted))]">{plan.perRun}</span>
              </div>

              <a
                href={appendUtm(APP_URL, `home_pricing_${plan.name.toLowerCase()}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick(`home_pricing_${plan.name.toLowerCase()}`)}
                className={`mt-auto inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  plan.featured
                    ? "bg-[hsl(var(--ds-accent))] text-white hover:bg-[hsl(var(--ds-accent))]/90 shadow-sm"
                    : "bg-[hsl(var(--ds-bg-2))] text-[hsl(var(--ds-ink))] hover:bg-[hsl(var(--ds-bg-3))]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* What every plan includes */}
        <RevealOnScroll delay={0.2}>
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] p-8 lg:p-10">
              <h3 className="text-base font-semibold mb-5 text-center text-[hsl(var(--ds-ink))]">
                {isEN ? "In every plan" : "W każdym planie"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {sharedIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--ds-accent-soft))]">
                      <Check className="h-3 w-3 text-[hsl(var(--ds-accent))]" />
                    </div>
                    <span className="text-[hsl(var(--ds-ink-2))]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Link to full pricing */}
        <RevealOnScroll delay={0.3}>
          <div className="mt-8 text-center">
            <Link
              to={pathFor("pricing")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--ds-accent))] hover:gap-2.5 transition-all"
            >
              {isEN
                ? "See full pricing, add-ons and PAYG packs"
                : "Zobacz pełen cennik, dodatki i pakiety PAYG"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
