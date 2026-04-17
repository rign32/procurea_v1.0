import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown } from "lucide-react"
import { t } from "@/i18n"

const LANGUAGE = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const SAVINGS_RATE = 0.046

function formatUSD(value: number): string {
  return new Intl.NumberFormat(LANGUAGE === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

interface SavingsCalculatorProps {
  variant?: "home" | "pricing"
}

export function SavingsCalculator({ variant = "home" }: SavingsCalculatorProps) {
  const [sliderPos, setSliderPos] = useState(50)

  const { rounded, annualSavings, monthlySavings } = useMemo(() => {
    const spend = 100_000 * Math.pow(10, (sliderPos / 100) * 3)
    const rounded = Math.round(spend / 10_000) * 10_000
    const annualSavings = Math.round(rounded * SAVINGS_RATE)
    const monthlySavings = Math.round(annualSavings / 12)
    return { rounded, annualSavings, monthlySavings }
  }, [sliderPos])

  const heading =
    variant === "pricing" ? t.calculator.pricingTitle : t.calculator.title

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <TrendingDown className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold">{heading}</h3>
        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">4.6% avg. savings</span>
      </div>

      {/* Slider row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-slate-200 via-brand-200 to-emerald-300 accent-primary outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-500 [&::-moz-range-thumb]:shadow-sm"
            aria-label={t.calculator.inputLabel}
          />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/60 tabular-nums">
            <span>$100k</span>
            <span>$1M</span>
            <span>$10M</span>
            <span>$100M</span>
          </div>
        </div>
      </div>

      {/* Results row — compact, inline */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.calculator.inputLabel}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={rounded}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold tabular-nums"
            >
              {formatUSD(rounded)}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-muted-foreground/30 text-lg font-light hidden sm:block">→</div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{t.calculator.annualSavings}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={annualSavings}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold tabular-nums text-emerald-600"
            >
              {formatUSD(annualSavings)}
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.calculator.monthlySavings}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={monthlySavings}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold tabular-nums text-muted-foreground"
            >
              {formatUSD(monthlySavings)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
