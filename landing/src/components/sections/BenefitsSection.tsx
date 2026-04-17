import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TrendingDown, Users, Zap, Globe } from "lucide-react"
import { t } from "@/i18n"

const metricConfigs = [
  {
    target: 30,
    suffix: "x",
    icon: Zap,
    gradient: "from-amber-400 via-orange-500 to-red-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    glowColor: "shadow-amber-500/20",
  },
  {
    target: 4.6,
    suffix: "%",
    decimals: 1,
    icon: TrendingDown,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    glowColor: "shadow-emerald-500/20",
  },
  {
    target: 26,
    suffix: "",
    icon: Globe,
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    glowColor: "shadow-blue-500/20",
  },
  {
    target: 3,
    suffix: "x",
    icon: Users,
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    glowColor: "shadow-violet-500/20",
  },
]

const cardStyles = [
  {
    gradient: "from-emerald-500/[0.08] via-teal-500/[0.04] to-cyan-500/[0.02]",
    border: "border-emerald-500/10 hover:border-emerald-500/25",
    accent: "from-emerald-500 to-cyan-500",
  },
  {
    gradient: "from-amber-500/[0.08] via-orange-500/[0.04] to-red-500/[0.02]",
    border: "border-amber-500/10 hover:border-amber-500/25",
    accent: "from-amber-500 to-orange-500",
  },
]

function CounterItem({
  target,
  suffix,
  label,
  sublabel,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  glowColor,
  decimals,
}: {
  target: number
  suffix: string
  label: string
  sublabel?: string
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
  glowColor: string
  decimals?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const count = useAnimatedCounter(target, 2000, isVisible, decimals ?? 0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const displayCount =
    decimals && decimals > 0 ? count.toFixed(decimals) : count

  return (
    <div ref={ref} className="text-center group cursor-default">
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${iconBg} ${iconColor} mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${glowColor}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </div>

      {/* Animated number */}
      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums mb-3">
        <span
          className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {displayCount}
        </span>
        <span className="text-muted-foreground/25 text-3xl sm:text-4xl md:text-5xl">
          {suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-sm sm:text-base text-foreground/80 font-semibold leading-tight">
        {label}
      </p>
      {sublabel && (
        <p className="text-xs text-muted-foreground/60 mt-1 leading-snug max-w-[180px] mx-auto">
          {sublabel}
        </p>
      )}
    </div>
  )
}

export function BenefitsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background pointer-events-none" />
      <div className="absolute top-[-200px] left-1/4 w-[700px] h-[700px] rounded-full bg-brand-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.02] blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-sm font-semibold text-brand-500 tracking-widest uppercase mb-4">
              {t.benefits.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              {t.benefits.heading}
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              {t.benefits.headingSub}
            </p>
          </div>
        </RevealOnScroll>

        {/* Metrics grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-14 mb-20"
        >
          {metricConfigs.map((config, idx) => (
            <motion.div
              key={t.benefits.metrics[idx].label}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              <CounterItem
                {...config}
                label={t.benefits.metrics[idx].label}
                sublabel={t.benefits.metrics[idx].sublabel}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {t.benefits.cards.map((card, i) => {
            const style = cardStyles[i]
            return (
              <RevealOnScroll key={card.title} delay={i * 0.15}>
                <div
                  className={`group relative rounded-2xl border ${style.border} bg-gradient-to-br ${style.gradient} backdrop-blur-sm p-8 lg:p-10 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1.5`}
                >
                  {/* Accent line */}
                  <div
                    className={`h-1 w-14 rounded-full bg-gradient-to-r ${style.accent} mb-7 transition-all duration-300 group-hover:w-20`}
                  />
                  <h3 className="text-xl lg:text-2xl font-bold mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
