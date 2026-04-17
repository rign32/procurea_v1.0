import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Mail, Shield, BarChart3, Sparkles, ArrowRight, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { t } from "@/i18n"

const FEATURES = [
  { slug: "ai-sourcing" as const, icon: Search, gradient: "from-blue-500/10 to-cyan-500/10", accent: "text-blue-600", ring: "ring-blue-500/20", bar: "from-blue-500 to-cyan-400", linkTo: 'fAiSourcing' as const },
  { slug: "email-outreach" as const, icon: Mail, gradient: "from-violet-500/10 to-purple-500/10", accent: "text-violet-600", ring: "ring-violet-500/20", bar: "from-violet-500 to-purple-400", linkTo: 'fEmailOutreach' as const },
  { slug: "supplier-portal" as const, icon: Shield, gradient: "from-emerald-500/10 to-teal-500/10", accent: "text-emerald-600", ring: "ring-emerald-500/20", bar: "from-emerald-500 to-teal-400", linkTo: 'fSupplierPortal' as const },
  { slug: "offer-comparison" as const, icon: BarChart3, gradient: "from-amber-500/10 to-orange-500/10", accent: "text-amber-600", ring: "ring-amber-500/20", bar: "from-amber-500 to-orange-400", linkTo: 'fOfferComparison' as const },
  { slug: "ai-insights" as const, icon: Sparkles, gradient: "from-rose-500/10 to-pink-500/10", accent: "text-rose-600", ring: "ring-rose-500/20", bar: "from-rose-500 to-pink-400", linkTo: 'featuresHub' as const },
] as const

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

type FeatureSlug = (typeof FEATURES)[number]["slug"]

const AUTO_ROTATE_MS = 5000

export function FeaturesSneakPeek() {
  const copy = t.featuresSneakPeek
  const features = t.homeFeatures as Record<
    FeatureSlug,
    { title: string; subtitle: string; sectionLabel: string; bullets: readonly string[] }
  >

  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((i: number) => {
    setActiveIndex(i)
    setPaused(true)
  }, [])

  // Auto-rotation
  useEffect(() => {
    if (paused) {
      // Resume after 8s of inactivity
      const resume = setTimeout(() => setPaused(false), 8000)
      return () => clearTimeout(resume)
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length)
    }, AUTO_ROTATE_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  const active = FEATURES[activeIndex]
  const activeFeat = features[active.slug]

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span className="inline-block rounded-full bg-primary/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-5">
              {copy.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {copy.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {copy.subtitle}
            </p>
          </div>
        </RevealOnScroll>

        {/* Desktop: tabbed showcase */}
        <RevealOnScroll>
          <div
            className="hidden md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 lg:gap-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Tab list */}
            <div className="relative flex flex-col gap-1">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                const feat = features[f.slug]
                const isActive = i === activeIndex

                return (
                  <button
                    key={f.slug}
                    onClick={() => goTo(i)}
                    className={`relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Animated active bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBar"
                        className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b ${f.bar}`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${f.gradient}`
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] transition-colors duration-200 ${
                          isActive ? f.accent : "text-gray-400"
                        }`}
                      />
                    </div>

                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {feat.title}
                    </span>
                  </button>
                )
              })}

              {/* Progress bar for auto-rotation */}
              <div className="mt-3 mx-4">
                <div className="h-[2px] rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    key={`${activeIndex}-${paused}`}
                    className={`h-full rounded-full bg-gradient-to-r ${active.bar}`}
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? undefined : "100%" }}
                    transition={paused ? {} : { duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            {/* Content panel */}
            <div className="relative min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`rounded-2xl border border-black/[0.06] bg-gradient-to-br ${active.gradient} p-8 lg:p-10 h-full flex flex-col justify-center`}
                >
                  <span
                    className={`inline-block text-[11px] font-bold uppercase tracking-[0.18em] ${active.accent} mb-4`}
                  >
                    {activeFeat.sectionLabel}
                  </span>

                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                    {activeFeat.title}
                  </h3>

                  <p className="text-[15px] leading-relaxed text-gray-600 mb-6 max-w-xl">
                    {activeFeat.subtitle}
                  </p>

                  <ul className="space-y-3">
                    {activeFeat.bullets.map((bullet, bi) => (
                      <motion.li
                        key={bi}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + bi * 0.07 }}
                        className="flex items-start gap-2.5"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${active.gradient} ring-1 ${active.ring}`}
                        >
                          <Check className={`h-3 w-3 ${active.accent}`} />
                        </span>
                        <span className="text-sm text-gray-700 leading-snug">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Link
                    to={pathFor(active.linkTo)}
                    className={`inline-flex items-center gap-1.5 mt-6 text-sm font-semibold ${active.accent} hover:gap-2.5 transition-all duration-200`}
                  >
                    {isEN ? 'Learn more' : 'Dowiedz sie wiecej'} &rarr;
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </RevealOnScroll>

        {/* Mobile: accordion cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            const feat = features[f.slug]
            const isOpen = i === activeIndex

            return (
              <RevealOnScroll key={f.slug} delay={i * 0.06}>
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? `border-black/[0.08] bg-gradient-to-br ${f.gradient} shadow-sm`
                      : "border-black/[0.06] bg-white"
                  }`}
                >
                  <button
                    onClick={() => goTo(i)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left cursor-pointer"
                  >
                    <div
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${
                        isOpen ? `bg-white/60` : "bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] ${isOpen ? f.accent : "text-gray-400"}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold flex-1 ${
                        isOpen ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {feat.title}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="stroke-current"
                      >
                        <path d="M4 6l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-sm leading-relaxed text-gray-600 mb-4">
                            {feat.subtitle}
                          </p>
                          <ul className="space-y-2.5">
                            {feat.bullets.map((bullet, bi) => (
                              <li key={bi} className="flex items-start gap-2.5">
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/60 ring-1 ${f.ring}`}
                                >
                                  <Check className={`h-3 w-3 ${f.accent}`} />
                                </span>
                                <span className="text-sm text-gray-700 leading-snug">
                                  {bullet}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>

        {/* 6th card: View all modules */}
        <RevealOnScroll>
          <div className="mt-8 md:mt-12 flex justify-center">
            <Link
              to={pathFor("featuresHub")}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary/50 px-8 py-5 text-base font-semibold text-muted-foreground hover:text-primary transition-all duration-200 group"
            >
              {isEN ? 'View all modules' : 'Zobacz wszystkie moduly'} &rarr;
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
