import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ArrowRight, CheckCircle } from "lucide-react"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const trustPoints = [
  "Darmowy start",
  "Bez karty kredytowej",
  "Wsparcie po polsku",
]

export function CtaSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[80px]" />
        {/* Grid pattern */}
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
            Gotowy na inteligentny
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              sourcing?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Zacznij korzystać z Procurea już dziś. Dołącz do zespołów zakupowych,
            które zamieniły tygodnie ręcznego wyszukiwania na minuty.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12">
            <motion.a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center"
            >
              {/* Glow */}
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 opacity-60 blur-lg group-hover:opacity-80 transition-opacity" />
              <span className="relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-white text-gray-900 text-base font-semibold shadow-xl">
                Rozpocznij za darmo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.a>
            <a
              href="mailto:kontakt@procurea.pl"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400"
            >
              Umów prezentację
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            {trustPoints.map((point) => (
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
