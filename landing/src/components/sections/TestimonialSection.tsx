import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Quote } from "lucide-react"
import { t } from "@/i18n"

export function TestimonialSection() {
  return (
    <section className="relative py-20 md:py-28 bg-slate-50/40 overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/[0.03] blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-brand-400/[0.03] blur-[60px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <RevealOnScroll>
          <div className="relative inline-block mb-6">
            <Quote className="h-12 w-12 text-primary/15 mx-auto" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
          </div>
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-display tracking-extra-tight leading-[1.3] text-foreground mb-8">
            &ldquo;{t.testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/25 to-brand-400/15 flex items-center justify-center text-primary font-bold ring-2 ring-primary/10 ring-offset-2">
              {t.testimonial.authorInitials}
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">{t.testimonial.authorRole}</div>
              <div className="text-xs text-muted-foreground">{t.testimonial.authorContext}</div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
