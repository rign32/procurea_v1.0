import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, Calendar, Timer, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { trackCtaClick } from "@/lib/analytics"
import { t } from "@/i18n"

const LANGUAGE = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"

interface SavingsCalculatorProps {
  variant?: "home" | "pricing"
}

const SAVINGS_RATE = 0.046
const BUNDLE_MONTHLY_USD = 899
const BUNDLE_ANNUAL_USD = BUNDLE_MONTHLY_USD * 12

function formatUSD(value: number): string {
  return new Intl.NumberFormat(LANGUAGE === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function SavingsCalculator({ variant = "home" }: SavingsCalculatorProps) {
  const [sliderPos, setSliderPos] = useState(50)

  const { rounded, annualSavings, monthlySavings, roiDays } = useMemo(() => {
    const spend = Math.round(100_000 * Math.pow(10, (sliderPos / 100) * 3))
    const rounded = Math.round(spend / 10_000) * 10_000
    const annualSavings = Math.round(rounded * SAVINGS_RATE)
    const monthlySavings = Math.round(annualSavings / 12)
    const roiDays =
      annualSavings > 0
        ? Math.round((BUNDLE_ANNUAL_USD / annualSavings) * 365)
        : 0
    return { rounded, annualSavings, monthlySavings, roiDays }
  }, [sliderPos])

  const heading =
    variant === "pricing" ? t.calculator.pricingTitle : t.calculator.title
  const subheading =
    variant === "pricing"
      ? t.calculator.pricingSubtitle
      : t.calculator.subtitle

  const roiReached = annualSavings >= BUNDLE_ANNUAL_USD
  const roiDisplay = roiReached
    ? `${roiDays} ${t.calculator.roiSuffix}`
    : t.calculator.roiNotReached

  const resultCards = [
    {
      icon: TrendingDown,
      label: t.calculator.annualSavings,
      value: formatUSD(annualSavings),
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      ring: "ring-emerald-100",
      gradient: "from-emerald-500 to-teal-500",
      animKey: `annual-${annualSavings}`,
    },
    {
      icon: Calendar,
      label: t.calculator.monthlySavings,
      value: formatUSD(monthlySavings),
      iconBg: "bg-brand-50",
      iconColor: "text-brand-600",
      ring: "ring-brand-100",
      gradient: "from-brand-500 to-brand-700",
      animKey: `monthly-${monthlySavings}`,
    },
    {
      icon: Timer,
      label: t.calculator.roiLabel,
      value: roiDisplay,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      ring: "ring-amber-100",
      gradient: "from-amber-500 to-orange-500",
      animKey: `roi-${roiDisplay}`,
    },
  ]

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold tracking-tight mb-4">
                {heading}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {subheading}
              </p>
            </div>

            {/* Slider + current value */}
            <div className="mb-10">
              <div className="flex items-baseline justify-between mb-3 gap-4">
                <label
                  htmlFor="savings-slider"
                  className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {t.calculator.inputLabel}
                </label>
              </div>

              <div className="text-center mb-6">
                <motion.div
                  key={rounded}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent"
                >
                  {formatUSD(rounded)}
                </motion.div>
              </div>

              <input
                id="savings-slider"
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-brand-100 via-brand-300 to-emerald-400 accent-primary outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-500 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                aria-label={t.calculator.inputLabel}
              />

              <div className="flex justify-between mt-2 text-xs text-muted-foreground/80 tabular-nums">
                <span>$100k</span>
                <span>$1M</span>
                <span>$10M</span>
                <span>$100M</span>
              </div>
            </div>

            {/* Result cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
              {resultCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className="relative rounded-xl border border-black/[0.06] bg-gradient-to-br from-white to-muted/20 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div
                      className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${card.iconBg} ${card.iconColor} mb-4 ring-1 ${card.ring}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {card.label}
                    </p>
                    <div className="min-h-[2.25rem]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={card.animKey}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={`text-2xl sm:text-[1.75rem] font-extrabold tracking-tight tabular-nums bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                        >
                          {card.value}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <Link
                to={pathFor("contact")}
                onClick={() => trackCtaClick("calculator_cta")}
              >
                <Button
                  size="lg"
                  className="group text-base px-8 py-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
                >
                  {t.calculator.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
