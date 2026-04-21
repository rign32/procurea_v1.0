import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, ArrowRight, Minus } from "lucide-react"
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

function AnimatedValue({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`block tabular-nums ${className ?? ""}`}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

export function SavingsCalculator({ variant = "home" }: SavingsCalculatorProps) {
  const [sliderPos, setSliderPos] = useState(50)

  const { rounded, annualSavings, annualCost, netSavings } = useMemo(() => {
    const spend = 100_000 * Math.pow(10, (sliderPos / 100) * 3)
    const rounded = Math.round(spend / 10_000) * 10_000
    const annualSavings = Math.round(rounded * SAVINGS_RATE)
    // Estimate campaigns needed: ~1 campaign per $500k of procurement spend, min 12/year
    const estimatedCampaignsPerYear = Math.max(
      12,
      Math.ceil(rounded / 500_000) * 12
    )
    // Full-campaign cost: Starter pack sourcing ($11.90/campaign) + AI Procurement workflow ($29/run)
    const annualCost = Math.round(estimatedCampaignsPerYear * 40.9)
    const netSavings = annualSavings - annualCost
    return { rounded, annualSavings, annualCost, netSavings }
  }, [sliderPos])

  const heading =
    variant === "pricing" ? t.calculator.pricingTitle : t.calculator.title

  // Slider fill percentage for gradient track
  const fillPercent = sliderPos

  return (
    <div className="group relative rounded-[14px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[hsl(var(--ds-accent))]" />

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))]">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold leading-tight text-[hsl(var(--ds-ink))]">{heading}</h3>
            <span className="text-xs text-[hsl(var(--ds-muted))]">4.6% avg. savings</span>
          </div>
        </div>

        {/* Slider section */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.calculator.inputLabel}
            </span>
            <AnimatedValue
              value={formatUSD(rounded)}
              className="text-lg sm:text-xl font-bold"
            />
          </div>

          {/* Custom slider */}
          <div className="relative h-8 flex items-center">
            <div className="absolute inset-x-0 h-2 rounded-full bg-[hsl(var(--ds-bg-2))] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[hsl(var(--ds-accent))]"
                style={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-x-0 w-full h-8 appearance-none bg-transparent cursor-pointer outline-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--ds-accent))] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[hsl(var(--ds-accent))] [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:bg-transparent"
              aria-label={t.calculator.inputLabel}
            />
          </div>

          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/60 tabular-nums font-medium">
            <span>$100k</span>
            <span>$1M</span>
            <span>$10M</span>
            <span>$100M</span>
          </div>
        </div>

        {/* Results flow */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 sm:gap-0 sm:items-center">
          {/* Gross Savings */}
          <div className="rounded-[10px] bg-[hsl(var(--ds-bg-2))] p-4 text-center cursor-default hover:shadow-sm transition-shadow duration-200">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--ds-muted))] block mb-1">
              {t.calculator.grossSavings}
            </span>
            <AnimatedValue
              value={formatUSD(annualSavings)}
              className="font-mono text-xl font-semibold text-[hsl(var(--ds-ink))]"
            />
          </div>

          <div className="hidden sm:flex items-center justify-center px-2">
            <Minus className="h-4 w-4 text-[hsl(var(--ds-muted-2))]" />
          </div>

          {/* Procurea Cost */}
          <div className="rounded-[10px] bg-[hsl(var(--ds-bg-3))] p-4 text-center cursor-default hover:shadow-sm transition-shadow duration-200">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--ds-muted))] block mb-1">
              {t.calculator.procureaCost}
            </span>
            <AnimatedValue
              value={`-${formatUSD(annualCost)}`}
              className="font-mono text-xl font-semibold text-[hsl(var(--ds-ink-2))]"
            />
          </div>

          <div className="hidden sm:flex items-center justify-center px-2">
            <ArrowRight className="h-4 w-4 text-[hsl(var(--ds-accent))]" />
          </div>

          {/* Net Savings — hero element */}
          <div className="relative rounded-[10px] bg-[hsl(var(--ds-accent-soft))] p-4 text-center cursor-default overflow-hidden ring-1 ring-[hsl(var(--ds-accent))]/10 hover:shadow-sm transition-shadow duration-200">
            <motion.div
              className="absolute inset-0 rounded-[10px] bg-[hsl(var(--ds-accent))]/[0.06]"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--ds-accent))] block mb-1">
              {t.calculator.netSavings}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={`net-${netSavings}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[hsl(var(--ds-accent))]"
              >
                {formatUSD(netSavings)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Cost basis note */}
        <p className="text-[10px] text-muted-foreground/50 mt-4 text-center">
          {t.calculator.costBasis}
        </p>
      </div>
    </div>
  )
}
