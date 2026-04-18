import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Sparkles, Zap, Package, ArrowRight, Gift, Check } from "lucide-react"
import { appendUtm } from "@/lib/utm"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const plans = [
  {
    name: "Start",
    description: "Poznaj Procurea na własnym zapytaniu — bez zobowiązań",
    price: "0 zł",
    originalPrice: null,
    period: "",
    perCredit: null,
    highlight: false,
    badge: null,
    cta: "Zacznij za darmo",
    note: "10 darmowych kredytów na start",
    icon: Gift,
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    lightBg: "bg-gradient-to-br from-emerald-50/30 to-teal-50/20",
    borderAccent: "border-emerald-200/50",
  },
  {
    name: "Pojedynczy kredyt",
    description: "Płać za każdy proces osobno — bez abonamentu",
    price: "40 zł",
    originalPrice: "60 zł",
    period: "/ kredyt",
    perCredit: null,
    highlight: false,
    badge: "Promocja 2026",
    cta: "Kup kredyt",
    note: "1 pełny proces sourcingu AI",
    icon: Zap,
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
    iconColor: "text-white",
    lightBg: "bg-gradient-to-br from-brand-50/30 to-brand-50/20",
    borderAccent: "border-brand-200/50",
  },
  {
    name: "Pakiet 20 kredytów",
    description: "Najlepsza wartość — dla regularnego sourcingu",
    price: "400 zł",
    originalPrice: "800 zł",
    period: "/ 20 kredytów",
    perCredit: "20 zł / proces",
    highlight: true,
    badge: "Promocja 2026",
    cta: "Kup pakiet",
    note: "Oszczędzasz 50% na każdym procesie",
    icon: Package,
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-700",
    iconColor: "text-white",
    lightBg: "",
    borderAccent: "",
  },
]

const creditIncludes = [
  "Wieloetapowe wyszukiwanie AI (5 agentów)",
  "Wyszukiwanie w 26 językach",
  "Automatyczne dane kontaktowe",
  "Portal ofertowy dla dostawców",
  "Sekwencje email i follow-upy",
  "Eksport wyników",
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export function PricingSection() {
  return (
    <section id="cennik" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-brand-50/30 to-background pointer-events-none" />
      <div className="absolute top-20 left-0 w-[500px] h-[500px] rounded-full bg-brand-500/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-brand-900/[0.03] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-500 tracking-wide uppercase mb-3">
              Cennik
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              Płać tylko gdy używasz
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Bez abonamentów i ukrytych opłat. Model pay-as-you-go
              — jeden kredyt to jeden pełny proces sourcingu AI.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative group"
            >
              {/* Gradient border for highlighted */}
              {plan.highlight && (
                <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-b from-brand-700 via-brand-500 to-brand-400 opacity-100" />
              )}

              <div
                className={`relative rounded-2xl bg-card p-7 lg:p-8 h-full flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "border-0 shadow-lg shadow-brand-500/10 hover:shadow-glow-primary"
                    : `border ${plan.borderAccent} ${plan.lightBg} hover:shadow-lg hover:shadow-black/[0.05]`
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[0.65rem] font-bold uppercase tracking-wider shadow-md shadow-amber-500/25">
                      <Sparkles className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.iconBg} ${plan.iconColor} shadow-sm`}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>

                <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed mb-5">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground/60 line-through mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-1.5">{plan.period}</span>
                  )}
                </div>

                {/* Per credit breakdown */}
                {plan.perCredit && (
                  <div className="mb-5">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 text-emerald-700 text-xs font-bold">
                      {plan.perCredit}
                    </span>
                  </div>
                )}
                {!plan.perCredit && <div className="mb-5" />}

                {/* Note */}
                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {plan.note}
                </p>

                {/* CTA */}
                <a
                  href={appendUtm(APP_URL, 'pricing')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto inline-flex items-center justify-center w-full gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group/btn ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* What every credit includes */}
        <RevealOnScroll delay={0.2}>
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/30 p-8 lg:p-10">
              <h3 className="text-lg font-bold mb-5 text-center">Każdy kredyt zawiera</h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {creditIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm sm:text-[0.925rem]">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100">
                      <Check className="h-3 w-3 text-brand-500" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Promo note */}
        <RevealOnScroll delay={0.3}>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200/60 text-sm text-amber-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Ceny promocyjne do końca 2026</strong> — od 2027 cena regularna: 60 zł/kredyt, pakiet 20 za 800 zł
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
