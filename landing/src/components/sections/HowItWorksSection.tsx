import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { FileText, Brain, Search, UserCheck, ListChecks, ChevronRight } from "lucide-react"
import { t } from "@/i18n"

const stepIcons = [FileText, Brain, Search, UserCheck, ListChecks]

const stepStyles = [
  { gradient: "from-blue-500 to-blue-600", iconBg: "bg-blue-50", iconColor: "text-blue-600", ringColor: "ring-blue-100" },
  { gradient: "from-violet-500 to-violet-600", iconBg: "bg-violet-50", iconColor: "text-violet-600", ringColor: "ring-violet-100" },
  { gradient: "from-indigo-500 to-indigo-600", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", ringColor: "ring-indigo-100" },
  { gradient: "from-cyan-500 to-cyan-600", iconBg: "bg-cyan-50", iconColor: "text-cyan-600", ringColor: "ring-cyan-100" },
  { gradient: "from-emerald-500 to-emerald-600", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
]

const stepNumbers = ["01", "02", "03", "04", "05"]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function HowItWorksSection() {
  return (
    <section id={t.sectionIds.howItWorks} className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-500/[0.04] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-violet-500/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              {t.howItWorks.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.howItWorks.heading}
              <br />
              <span className="text-muted-foreground">{t.howItWorks.headingSub}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.howItWorks.description}
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5"
        >
          {t.howItWorks.steps.map((step, i) => {
            const Icon = stepIcons[i]
            const style = stepStyles[i]
            return (
              <motion.div
                key={stepNumbers[i]}
                variants={cardVariants}
                className="relative group"
              >
                {i < t.howItWorks.steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="h-5 w-5 text-indigo-300" />
                  </div>
                )}

                <div className="relative rounded-2xl border border-border bg-card p-6 lg:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.05] hover:border-transparent hover:-translate-y-1 h-full flex flex-col">
                  <div className={`text-sm font-extrabold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent mb-4 tracking-wide`}>
                    {t.howItWorks.stepPrefix} {stepNumbers[i]}
                  </div>

                  <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${style.iconBg} ring-1 ${style.ringColor} mb-4 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>

                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>

                  <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <RevealOnScroll delay={0.3}>
          <div className="mt-14 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-white border border-border shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <ListChecks className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm sm:text-base">
                <strong className="font-semibold">{t.howItWorks.summaryPart1}</strong>
                <span className="text-muted-foreground">{t.howItWorks.summaryPart2}</span>
                <strong className="font-semibold text-emerald-600">{t.howItWorks.summaryHighlight}</strong>
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
