import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { motion } from "framer-motion"
import { t } from "@/i18n"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const Star = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const trustIndicators = isEN
  ? [
      { value: '4.9/5', label: 'average rating' },
      { value: '50+', label: 'procurement teams' },
      { value: '8+', label: 'industries' },
    ]
  : [
      { value: '4.9/5', label: 'srednia ocena' },
      { value: '50+', label: 'zespolow zakupowych' },
      { value: '8+', label: 'branz' },
    ]

export function TestimonialSection() {
  const words = t.testimonial.quote.split(' ')

  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-b from-slate-50/80 via-slate-100/60 to-slate-50/80">
      {/* Decorative blur orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-brand-400/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <RevealOnScroll>
          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: 'easeOut' }}
              >
                <Star />
              </motion.span>
            ))}
          </div>

          {/* Quote block with decorative quote mark */}
          <div className="relative">
            {/* Large decorative opening quote */}
            <span
              aria-hidden="true"
              className="absolute -top-8 left-1/2 -translate-x-1/2 md:-top-10 lg:-top-12 text-[120px] md:text-[160px] lg:text-[200px] leading-none font-display font-bold select-none pointer-events-none bg-gradient-to-br from-primary/10 to-brand-400/5 bg-clip-text text-transparent"
            >
              &ldquo;
            </span>

            <blockquote className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-display italic tracking-extra-tight leading-[1.35] text-foreground text-balance max-w-4xl mx-auto">
              <span className="sr-only">{t.testimonial.quote}</span>
              <span aria-hidden="true">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.27em]"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3 + i * 0.03,
                      duration: 0.4,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                  >
                    {i === 0 ? `\u201C${word}` : i === words.length - 1 ? `${word}\u201D` : word}
                  </motion.span>
                ))}
              </span>
            </blockquote>
          </div>

          {/* Author */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Avatar with gradient border */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-brand-400 blur-sm opacity-30" />
              <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-brand-400/10 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <span className="text-sm font-bold bg-gradient-to-br from-primary to-brand-400 bg-clip-text text-transparent">
                    {t.testimonial.authorInitials}
                  </span>
                </div>
              </div>
            </div>
            {/* Name / role / context stacked */}
            <div className="text-center">
              <div className="font-semibold text-foreground text-base">{t.testimonial.authorRole}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{t.testimonial.authorContext}</div>
            </div>
          </motion.div>
        </RevealOnScroll>

        {/* Social proof bar */}
        <motion.div
          className="mt-16 pt-10 border-t border-slate-200/60"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {trustIndicators.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                {i === 0 && (
                  <div className="flex items-center gap-0.5 text-amber-400 mb-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
                <span className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">
                  {item.value}
                </span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
