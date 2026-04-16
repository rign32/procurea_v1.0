import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Quote } from "lucide-react"
import { t } from "@/i18n"

export function TestimonialSection() {
  return (
    <section className="relative py-20 md:py-28 bg-slate-50/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" strokeWidth={1.5} />
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-display tracking-extra-tight leading-[1.3] text-foreground mb-8">
            &ldquo;{t.testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
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
