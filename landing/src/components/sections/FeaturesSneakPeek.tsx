import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Mail, Shield, BarChart3, Sparkles, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { t } from "@/i18n"

const FEATURES = [
  { slug: "ai-sourcing" as const,      icon: Search,    linkTo: 'fAiSourcing' as const },
  { slug: "email-outreach" as const,   icon: Mail,      linkTo: 'fEmailOutreach' as const },
  { slug: "supplier-portal" as const,  icon: Shield,    linkTo: 'fSupplierPortal' as const },
  { slug: "offer-comparison" as const, icon: BarChart3, linkTo: 'fOfferComparison' as const },
  { slug: "ai-insights" as const,      icon: Sparkles,  linkTo: 'featuresHub' as const },
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

  useEffect(() => {
    if (paused) {
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
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <RevealOnScroll>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {copy.sectionLabel}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[24ch] text-[hsl(var(--ds-ink))]">
              {copy.title}
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] text-pretty">
              {copy.subtitle}
            </p>
          </div>
        </RevealOnScroll>

        {/* Desktop: tabbed showcase */}
        <RevealOnScroll scale>
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
                    className={`relative flex items-center gap-3.5 rounded-[10px] px-4 py-3.5 text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[hsl(var(--ds-surface))] shadow-[0_1px_3px_rgba(14,22,20,0.05)] border border-[hsl(var(--ds-rule))]"
                        : "hover:bg-[hsl(var(--ds-bg-2))] border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBar"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[hsl(var(--ds-accent))]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div
                      className={`h-9 w-9 shrink-0 rounded-[7px] flex items-center justify-center transition-colors duration-150 ${
                        isActive
                          ? "bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))]"
                          : "bg-[hsl(var(--ds-bg-2))] text-[hsl(var(--ds-muted))]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </div>

                    <span
                      className={`text-sm transition-colors duration-150 ${
                        isActive
                          ? "text-[hsl(var(--ds-ink))] font-semibold"
                          : "text-[hsl(var(--ds-ink-2))]"
                      }`}
                    >
                      {feat.title}
                    </span>
                  </button>
                )
              })}

              {/* Progress bar */}
              <div className="mt-3 mx-4">
                <div className="h-[2px] rounded-full bg-[hsl(var(--ds-bg-2))] overflow-hidden">
                  <motion.div
                    key={`${activeIndex}-${paused}`}
                    className="h-full rounded-full bg-[hsl(var(--ds-accent))]"
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
                  className="card-ds h-full flex flex-col justify-center"
                >
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--ds-accent))] mb-4">
                    {activeFeat.sectionLabel}
                  </span>

                  <h3 className="text-[26px] lg:text-[30px] font-bold tracking-[-0.02em] text-[hsl(var(--ds-ink))] mb-3">
                    {activeFeat.title}
                  </h3>

                  <p className="text-[15px] leading-relaxed text-[hsl(var(--ds-ink-2))] mb-6 max-w-xl">
                    {activeFeat.subtitle}
                  </p>

                  <ul className="space-y-3">
                    {activeFeat.bullets.map((bullet, bi) => (
                      <motion.li
                        key={bi}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + bi * 0.09 }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--ds-accent-soft))]">
                          <Check className="h-3 w-3 text-[hsl(var(--ds-accent))]" />
                        </span>
                        <span className="text-sm text-[hsl(var(--ds-ink-2))] leading-snug">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Link
                    to={pathFor(active.linkTo)}
                    className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[hsl(var(--ds-accent))] hover:gap-2.5 transition-all duration-150"
                  >
                    {isEN ? 'Learn more' : 'Dowiedz sie wiecej'} →
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
                  className={`rounded-[14px] border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[hsl(var(--ds-rule-2))] bg-[hsl(var(--ds-surface))] shadow-[0_1px_3px_rgba(14,22,20,0.04)]"
                      : "border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))]"
                  }`}
                >
                  <button
                    onClick={() => goTo(i)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left cursor-pointer"
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-[7px] flex items-center justify-center ${
                      isOpen ? "bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))]" : "bg-[hsl(var(--ds-bg-2))] text-[hsl(var(--ds-muted))]"
                    }`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <span className={`text-sm font-semibold flex-1 ${
                      isOpen ? "text-[hsl(var(--ds-ink))]" : "text-[hsl(var(--ds-ink-2))]"
                    }`}>
                      {feat.title}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[hsl(var(--ds-muted))]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
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
                          <p className="text-sm leading-relaxed text-[hsl(var(--ds-ink-2))] mb-4">
                            {feat.subtitle}
                          </p>
                          <ul className="space-y-2.5">
                            {feat.bullets.map((bullet, bi) => (
                              <li key={bi} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--ds-accent-soft))]">
                                  <Check className="h-3 w-3 text-[hsl(var(--ds-accent))]" />
                                </span>
                                <span className="text-sm text-[hsl(var(--ds-ink-2))] leading-snug">{bullet}</span>
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

        <RevealOnScroll>
          <div className="mt-10 flex justify-center">
            <Link
              to={pathFor("featuresHub")}
              className="btn-ds btn-ds-ghost"
            >
              {isEN ? 'View all modules' : 'Zobacz wszystkie moduly'}
              <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
