import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { t } from "@/i18n"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export function ProblemSection() {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <RevealOnScroll>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {t.meta.lang === "en" ? "The problem" : "Problem"}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[24ch] text-[hsl(var(--ds-ink))]">
              {t.problem.heading} {t.problem.headingSub}
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] text-pretty">
              {t.problem.description}
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-4"
        >
          {t.problem.painPoints.map((point, idx) => (
            <motion.div
              key={point.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="feat-ds"
            >
              <div className="feat-num-ds">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.015em] text-[hsl(var(--ds-ink))] mt-1">
                {point.title}
              </h3>
              <p className="text-[14.5px] leading-[1.55] text-[hsl(var(--ds-ink-2))] text-pretty">
                {point.description}
              </p>
              <div className="feat-meta-ds">
                <span>{point.statLabel}:</span>
                <strong className="font-semibold text-[hsl(var(--ds-ink))]">{point.stat}</strong>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
