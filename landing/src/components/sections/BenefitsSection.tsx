import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TrendingDown, Users, Zap, Globe } from "lucide-react"
import { t } from "@/i18n"

const metricConfigs = [
  { target: 30, suffix: "x", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", ring: "ring-amber-100", gradient: "from-amber-500 to-orange-500" },
  { target: 6, suffix: "%", icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-100", gradient: "from-emerald-500 to-teal-500" },
  { target: 26, suffix: "", icon: Globe, color: "text-brand-500", bg: "bg-brand-50", ring: "ring-brand-100", gradient: "from-brand-500 to-brand-700" },
  { target: 3, suffix: "x", icon: Users, color: "text-brand-gray-500", bg: "bg-brand-gray-50", ring: "ring-brand-gray-100", gradient: "from-brand-gray-500 to-brand-900" },
]

const cardStyles = [
  { gradient: "from-emerald-500 to-cyan-500", lightBg: "bg-gradient-to-br from-emerald-50/50 to-cyan-50/30" },
  { gradient: "from-amber-500 to-orange-500", lightBg: "bg-gradient-to-br from-amber-50/50 to-orange-50/30" },
]

function CounterItem({
  target, suffix, label, icon: Icon, color, bg, ring, gradient,
}: { target: number; suffix: string; label: string; icon: any; color: string; bg: string; ring: string; gradient: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const count = useAnimatedCounter(target, 2000, isVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center group">
      <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${bg} ${color} mb-4 transition-transform duration-200 group-hover:scale-110 ring-1 ${ring}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums mb-2">
        <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{count}</span>
        <span className="text-muted-foreground/30">{suffix}</span>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground font-medium">{label}</p>
    </div>
  )
}

export function BenefitsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-brand-500/[0.02] blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-500 tracking-wide uppercase mb-3">
              {t.benefits.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.benefits.heading}
              <br />
              <span className="text-muted-foreground">{t.benefits.headingSub}</span>
            </h2>
          </div>
        </RevealOnScroll>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-20"
        >
          {metricConfigs.map((config, idx) => (
            <motion.div
              key={t.benefits.metrics[idx].label}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            >
              <CounterItem {...config} label={t.benefits.metrics[idx].label} />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {t.benefits.cards.map((card, i) => {
            const style = cardStyles[i]
            return (
              <RevealOnScroll key={card.title} delay={i * 0.15}>
                <div className={`group rounded-2xl border border-border ${style.lightBg} p-8 lg:p-10 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.05] hover:-translate-y-1`}>
                  <div className={`inline-flex h-1.5 w-16 rounded-full bg-gradient-to-r ${style.gradient} mb-7`} />
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
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
