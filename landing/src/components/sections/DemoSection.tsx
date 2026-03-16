import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { t } from "@/i18n"

export function DemoSection() {
  const loomId = t.meta.lang === 'en'
    ? '6dc440a653f14eea9f7a409ba2e2f81c'
    : '4a83f42e95d94b968a30ed4e8dc4a463'

  return (
    <section id={t.sectionIds.demo} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <p className="text-sm font-semibold text-brand-500 tracking-wide uppercase mb-3">
              {t.demo.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.demo.heading}
              <br />
              <span className="text-muted-foreground">{t.demo.headingSub}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.demo.description}
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/60 bg-white shadow-2xl shadow-brand-500/[0.06] overflow-hidden ring-1 ring-black/[0.03]">
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
