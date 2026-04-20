import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { t } from "@/i18n"

export function HowItWorksSection() {
  const steps = t.howItWorks.steps
  const stepPrefix = t.howItWorks.stepPrefix

  return (
    <section
      id={t.sectionIds.howItWorks}
      className="py-[clamp(56px,8vw,112px)] bg-[hsl(var(--ds-bg-2))]/40"
    >
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <RevealOnScroll>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {t.howItWorks.sectionLabel}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[26ch] text-[hsl(var(--ds-ink))]">
              {t.howItWorks.heading}{" "}
              <span className="text-[hsl(var(--ds-ink-3))] font-medium">
                {t.howItWorks.headingSub}
              </span>
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] text-pretty">
              {t.howItWorks.description}
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="steps-ds"
          style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
          {steps.map((step, i) => (
            <div key={step.title} className="step-ds">
              <div className="step-num-ds">
                {stepPrefix} {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.015em] text-[hsl(var(--ds-ink))] mb-2">
                {step.title}
              </h3>
              <p className="text-[13.5px] leading-[1.55] text-[hsl(var(--ds-ink-2))] text-pretty">
                {step.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Summary line + data-agnostic note */}
        <RevealOnScroll delay={0.2} scale>
          <div className="mt-12 flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[hsl(var(--ds-surface))] border border-[hsl(var(--ds-rule))] shadow-[0_1px_3px_rgba(14,22,20,0.04)]">
              <span
                aria-hidden
                className="grid place-items-center h-8 w-8 rounded-lg bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))] font-mono font-semibold text-sm"
              >
                ✓
              </span>
              <span className="text-[14px] text-[hsl(var(--ds-ink-2))]">
                <strong className="font-semibold text-[hsl(var(--ds-ink))]">
                  {t.howItWorks.summaryPart1}
                </strong>
                {t.howItWorks.summaryPart2}
                <strong className="font-semibold text-[hsl(var(--ds-accent))]">
                  {t.howItWorks.summaryHighlight}
                </strong>
              </span>
            </div>

            <div className="inline-flex items-center gap-2.5 max-w-[58ch] text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] font-semibold px-2 py-1 rounded bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))] shrink-0">
                {t.howItWorks.transparencyBadge}
              </span>
              <span className="text-[13px] leading-[1.5] text-[hsl(var(--ds-muted))] text-pretty">
                {t.howItWorks.transparencyText}
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
