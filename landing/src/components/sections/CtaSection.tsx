import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ArrowRight, CheckCircle } from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

export function CtaSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-brand-800" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-900/[0.06] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-500/[0.04] rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <RevealOnScroll>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            {t.cta.headingPart1}
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-200 to-sage-200 bg-clip-text text-transparent">
              {t.cta.headingHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12">
            <motion.a
              href={appendUtm(APP_URL, 'cta_bottom')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('cta_bottom')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center"
            >
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-brand-700 via-brand-400 to-emerald-400 opacity-50 blur-lg group-hover:opacity-80 transition-opacity animate-gradient-x bg-[length:200%_200%]" />
              <span className="relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-white text-gray-900 text-base font-semibold shadow-xl hover:shadow-2xl transition-shadow">
                {t.cta.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.a>
            <a
              href={`mailto:${t.cta.contactEmail}`}
              onClick={() => trackCtaClick('cta_email')}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400"
            >
              {t.cta.ctaEmail}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400">
            {t.cta.trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                {point}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
