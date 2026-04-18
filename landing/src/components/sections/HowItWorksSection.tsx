import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { FileText, Search, ListChecks } from "lucide-react"
import { t } from "@/i18n"

const stepIcons = [FileText, Search, ListChecks]

const stepColors = [
  {
    number: "from-brand-400 to-brand-600",
    card: "from-brand-500/[0.06] to-brand-500/[0.02]",
    iconBg: "from-brand-50 to-brand-100/80",
    iconColor: "text-brand-600",
    line: "from-brand-400 to-cyan-400",
    dot: "bg-brand-500",
    ring: "ring-brand-200/50",
  },
  {
    number: "from-cyan-400 to-cyan-600",
    card: "from-cyan-500/[0.06] to-cyan-500/[0.02]",
    iconBg: "from-cyan-50 to-cyan-100/80",
    iconColor: "text-cyan-600",
    line: "from-cyan-400 to-emerald-400",
    dot: "bg-cyan-500",
    ring: "ring-cyan-200/50",
  },
  {
    number: "from-emerald-400 to-emerald-600",
    card: "from-emerald-500/[0.06] to-emerald-500/[0.02]",
    iconBg: "from-emerald-50 to-emerald-100/80",
    iconColor: "text-emerald-600",
    line: "",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200/50",
  },
]

const stepNumbers = ["01", "02", "03"]

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.2,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
}

const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: {
      duration: 0.8,
      delay: 0.3 + i * 0.2,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
}

const lineVerticalVariants = {
  hidden: { scaleY: 0, originY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      duration: 0.8,
      delay: 0.3 + i * 0.2,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
}

export function HowItWorksSection() {
  return (
    <section id={t.sectionIds.howItWorks} className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-gradient-to-br from-brand-500/[0.03] via-cyan-500/[0.02] to-emerald-500/[0.03] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <p className="text-sm font-semibold text-brand-500 tracking-wide uppercase mb-3">
              {t.howItWorks.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.howItWorks.heading}
              <br />
              <span className="text-muted-foreground font-medium">{t.howItWorks.headingSub}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t.howItWorks.description}
            </p>
          </div>
        </RevealOnScroll>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-3 gap-0 relative"
          >
            {t.howItWorks.steps.map((step, i) => {
              const Icon = stepIcons[i]
              const colors = stepColors[i]
              return (
                <div key={stepNumbers[i]} className="relative flex flex-col items-center">
                  {/* Connector line between steps */}
                  {i < t.howItWorks.steps.length - 1 && (
                    <motion.div
                      custom={i}
                      variants={lineVariants}
                      className={`absolute top-[38px] left-[calc(50%+28px)] right-[calc(-50%+28px)] h-[2px] bg-gradient-to-r ${colors.line} z-0 rounded-full`}
                    />
                  )}

                  {/* Step number + dot */}
                  <motion.div
                    custom={i}
                    variants={cardVariants}
                    className="relative z-10 flex flex-col items-center"
                  >
                    {/* Outer ring */}
                    <div className={`flex items-center justify-center h-[76px] w-[76px] rounded-full ring-1 ${colors.ring} bg-white shadow-sm mb-8 transition-shadow duration-300 group-hover:shadow-md`}>
                      {/* Gradient number */}
                      <span className={`text-2xl font-extrabold bg-gradient-to-br ${colors.number} bg-clip-text text-transparent`}>
                        {stepNumbers[i]}
                      </span>
                    </div>

                    {/* Glass card */}
                    <div className={`relative rounded-2xl border border-white/80 bg-gradient-to-b ${colors.card} backdrop-blur-sm p-7 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1.5 hover:border-primary/20 group w-full max-w-[320px]`}>
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br ${colors.iconBg} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-5 w-5 ${colors.iconColor}`} strokeWidth={1.8} />
                      </div>

                      {/* Step label */}
                      <p className={`text-[11px] font-bold uppercase tracking-[0.15em] bg-gradient-to-r ${colors.number} bg-clip-text text-transparent mb-2`}>
                        {t.howItWorks.stepPrefix} {stepNumbers[i]}
                      </p>

                      <h3 className="text-lg font-semibold tracking-tight mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="relative pl-12"
          >
            {/* Vertical line track */}
            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-slate-100 rounded-full" />

            {t.howItWorks.steps.map((step, i) => {
              const Icon = stepIcons[i]
              const colors = stepColors[i]
              return (
                <motion.div
                  key={stepNumbers[i]}
                  custom={i}
                  variants={cardVariants}
                  className="relative mb-8 last:mb-0"
                >
                  {/* Dot on timeline */}
                  <div className={`absolute -left-12 top-7 h-[46px] w-[46px] rounded-full bg-white ring-1 ${colors.ring} shadow-sm flex items-center justify-center z-10`}>
                    <span className={`text-base font-extrabold bg-gradient-to-br ${colors.number} bg-clip-text text-transparent`}>
                      {stepNumbers[i]}
                    </span>
                  </div>

                  {/* Animated connector */}
                  {i < t.howItWorks.steps.length - 1 && (
                    <motion.div
                      custom={i}
                      variants={lineVerticalVariants}
                      className={`absolute -left-[25.5px] top-[54px] w-[2px] h-[calc(100%+2rem-54px)] bg-gradient-to-b ${colors.line} z-[5] rounded-full`}
                    />
                  )}

                  {/* Glass card */}
                  <div className={`relative rounded-2xl border border-white/80 bg-gradient-to-b ${colors.card} backdrop-blur-sm p-6 transition-all duration-300`}>
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${colors.iconBg} mb-4`}>
                      <Icon className={`h-5 w-5 ${colors.iconColor}`} strokeWidth={1.8} />
                    </div>

                    <p className={`text-[11px] font-bold uppercase tracking-[0.15em] bg-gradient-to-r ${colors.number} bg-clip-text text-transparent mb-1.5`}>
                      {t.howItWorks.stepPrefix} {stepNumbers[i]}
                    </p>

                    <h3 className="text-base font-semibold tracking-tight mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Summary line */}
        <RevealOnScroll delay={0.4}>
          <div className="mt-16 lg:mt-20 flex items-center justify-center">
            <div className="inline-flex items-center gap-3.5 px-8 py-4.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80">
                <ListChecks className="h-5 w-5 text-emerald-600" strokeWidth={1.8} />
              </div>
              <span className="text-sm sm:text-base">
                <strong className="font-semibold">{t.howItWorks.summaryPart1}</strong>
                <span className="text-muted-foreground">{t.howItWorks.summaryPart2}</span>
                <strong className="font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  {t.howItWorks.summaryHighlight}
                </strong>
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
