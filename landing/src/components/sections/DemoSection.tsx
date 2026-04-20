import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { t } from "@/i18n"

export function DemoSection() {
  const loomId = t.meta.lang === 'en'
    ? '6dc440a653f14eea9f7a409ba2e2f81c'
    : '4a83f42e95d94b968a30ed4e8dc4a463'

  return (
    <section id={t.sectionIds.demo} className="py-[clamp(56px,8vw,112px)] relative overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] relative z-10">
        <RevealOnScroll>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {t.demo.sectionLabel}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[24ch] text-[hsl(var(--ds-ink))]">
              {t.demo.heading}{" "}
              <span className="text-[hsl(var(--ds-ink-3))] font-medium">{t.demo.headingSub}</span>
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
              {t.demo.description}
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-[22px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] shadow-[0_8px_28px_rgba(14,22,20,0.08),0_28px_70px_rgba(14,22,20,0.08)] overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: '52.48%' }}>
                <iframe
                  src={`https://www.loom.com/embed/${loomId}`}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
