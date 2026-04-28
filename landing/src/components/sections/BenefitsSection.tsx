import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TrendingDown, Users, Zap, Globe } from "lucide-react"
import { t } from "@/i18n"

const metricConfigs = [
  { target: 30,  suffix: "x", icon: Zap },
  { target: 4.6, suffix: "%", decimals: 1, icon: TrendingDown },
  { target: 26,  suffix: "",  icon: Globe },
  { target: 3,   suffix: "x", icon: Users },
]

function CounterItem({
  target,
  suffix,
  label,
  sublabel,
  icon: Icon,
  decimals,
}: {
  target: number
  suffix: string
  label: string
  sublabel?: string
  icon: React.ElementType
  decimals?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const count = useAnimatedCounter(target, 2000, isVisible, decimals ?? 0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const displayCount = decimals && decimals > 0 ? count.toFixed(decimals) : count

  return (
    <div ref={ref} className="text-center group cursor-default">
      <div className="inline-flex items-center justify-center h-11 w-11 rounded-[10px] bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))] mb-4 transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <div className="font-mono text-[clamp(36px,4.5vw,52px)] font-semibold tracking-[-0.02em] tabular-nums leading-none mb-2 text-[hsl(var(--ds-ink))]">
        {displayCount}
        <span className="text-[hsl(var(--ds-muted))] text-[0.7em]">{suffix}</span>
      </div>

      <p className="text-[14px] text-[hsl(var(--ds-ink))] font-semibold leading-tight">
        {label}
      </p>
      {sublabel && (
        <p className="text-[12px] text-[hsl(var(--ds-muted))] mt-1 leading-snug max-w-[200px] mx-auto">
          {sublabel}
        </p>
      )}
    </div>
  )
}

export function BenefitsSection() {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <RevealOnScroll scale>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {t.benefits.sectionLabel}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[24ch] text-[hsl(var(--ds-ink))]">
              {t.benefits.heading}
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
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
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {metricConfigs.map((config, idx) => (
            <motion.div
              key={t.benefits.metrics[idx].label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

        {/* Cards grid — clean neutral cards with navy accent line */}
        <div className="grid md:grid-cols-2 gap-4">
          {t.benefits.cards.map((card, i) => (
            <RevealOnScroll key={card.title} delay={i * 0.12}>
              <div className="card-ds group transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_-4px_rgba(14,22,20,0.06)]">
                <div className="h-1 w-14 rounded-full bg-[hsl(var(--ds-accent))] mb-6 transition-all duration-200 group-hover:w-20" />
                <h3 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] text-[hsl(var(--ds-ink))] mb-2.5">
                  {card.title}
                </h3>
                <p className="text-[14.5px] leading-[1.55] text-[hsl(var(--ds-ink-2))] text-pretty">
                  {card.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
