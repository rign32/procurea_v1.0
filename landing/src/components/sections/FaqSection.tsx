import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { MessageCircleQuestion } from "lucide-react"
import { t } from "@/i18n"

export function FaqSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.02] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white mb-5 shadow-sm">
              <MessageCircleQuestion className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-4">
              {t.faq.heading}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t.faq.description}
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="rounded-2xl border border-border bg-card p-1.5 shadow-sm">
            <div className="divide-y divide-border px-5 sm:px-6">
              {t.faq.items.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
