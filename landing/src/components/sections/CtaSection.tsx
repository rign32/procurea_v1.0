import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ArrowRight, CheckCircle } from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const floatingCards = [
  { label: "183 suppliers found", x: "-12%", y: "18%", delay: 0 },
  { label: "18 min average", x: "108%", y: "30%", delay: 1.2 },
  { label: "26 languages", x: "95%", y: "72%", delay: 2.4 },
]

function FloatingCard({
  label,
  x,
  y,
  delay,
}: {
  label: string
  x: string
  y: string
  delay: number
}) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-xs text-gray-300 font-medium shadow-lg pointer-events-none select-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 1, -1, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
      {label}
    </motion.div>
  )
}

export function CtaSection() {
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-brand-900 to-gray-950" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[-10%] left-[15%] w-[700px] h-[700px] bg-brand-500/[0.07] rounded-full blur-[150px] pointer-events-none"
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[10%] w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[130px] pointer-events-none"
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 30, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-brand-400/[0.04] rounded-full blur-[100px] pointer-events-none"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Floating glass cards */}
        {floatingCards.map((card) => (
          <FloatingCard key={card.label} {...card} />
        ))}

        <RevealOnScroll>
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            {t.cta.headingPart1}
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              {t.cta.headingHighlight}
            </span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/60 mb-14 max-w-2xl mx-auto leading-relaxed">
            {t.cta.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-14">
            <motion.a
              href={appendUtm(APP_URL, "cta_bottom")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick("cta_bottom")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center justify-center"
            >
              {/* Animated glow */}
              <motion.div
                className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-brand-500 via-emerald-400 to-brand-400 opacity-40 blur-xl animate-gradient-x bg-[length:200%_200%]"
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-brand-500 via-emerald-400 to-brand-400 opacity-50 blur-md animate-gradient-x bg-[length:200%_200%]"
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative inline-flex items-center gap-3 px-10 py-4.5 rounded-xl bg-white text-gray-900 text-base font-semibold shadow-2xl transition-shadow group-hover:shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                {t.cta.ctaPrimary}
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.a>

            <a
              href={`mailto:${t.cta.contactEmail}`}
              onClick={() => trackCtaClick("cta_email")}
              className="text-sm font-medium text-white/40 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              {t.cta.ctaEmail}
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50">
            {t.cta.trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400/80" />
                {point}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
