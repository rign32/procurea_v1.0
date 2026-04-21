import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ArrowRight, CheckCircle } from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

export function CtaSection() {
  return (
    <section className="py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,72px)]">
      <div className="mx-auto max-w-[1240px]">
        <div className="cta-block-ds relative overflow-hidden">
          {/* Evergreen ambient */}
          <motion.div
            className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--ds-accent)) 0%, transparent 70%)", opacity: 0.25 }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--ds-cta)) 0%, transparent 70%)", opacity: 0.15 }}
            animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <RevealOnScroll>
              <div>
                <span className="eyebrow !bg-white/10 !text-white/80 mb-5 inline-flex">
                  <span className="eyebrow-dot" />
                  {t.meta.lang === "en" ? "Ready when you are" : "Gotowy, kiedy Ty"}
                </span>
                <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-white leading-[1.08] mb-5 tracking-[-0.025em] max-w-[18ch]">
                  {t.cta.headingPart1}{" "}
                  <span className="text-[hsl(var(--ds-cta))]">{t.cta.headingHighlight}</span>
                </h2>
                <p className="text-white/70 text-[17px] leading-[1.55] max-w-[54ch]">
                  {t.cta.description}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.15}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={appendUtm(APP_URL, "cta_bottom")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCtaClick("cta_bottom")}
                    className="btn-ds btn-ds-primary"
                  >
                    {t.cta.ctaPrimary}
                    <ArrowRight className="h-4 w-4 arrow" />
                  </a>
                  <a
                    href={`mailto:${t.cta.contactEmail}`}
                    onClick={() => trackCtaClick("cta_email")}
                    className="btn-ds btn-ds-dark"
                  >
                    {t.cta.ctaEmail}
                  </a>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/60">
                  {t.cta.trustPoints.map((point) => (
                    <span key={point} className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--ds-cta))]/80" />
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  )
}
