import { AccordionItem } from "@/components/ui/AccordionItem"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { t } from "@/i18n"

export function HomeFaq() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {t.homeFaq.sectionLabel}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-extra-tight">
              {t.homeFaq.heading}
            </h2>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="rounded-2xl border border-black/[0.06] bg-white divide-y divide-black/[0.05] overflow-hidden shadow-premium">
            {t.homeFaq.items.map((item) => (
              <div key={item.q} className="px-5">
                <AccordionItem question={item.q} answer={item.a} />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
