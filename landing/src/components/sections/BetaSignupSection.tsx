import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ArrowRight, CheckCircle, Sparkles, MessageSquare, Gift } from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const benefits = [
  {
    icon: Sparkles,
    title: "Pełny dostęp do AI sourcingu",
    description:
      "Bez limitów na liczbę procesów w czasie trwania beta testów. Wyszukiwanie w 26 językach, dane kontaktowe, oceny AI.",
    gradient: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    icon: MessageSquare,
    title: "Pierwszeństwo w rozwoju produktu",
    description:
      "Twoje opinie bezpośrednio wpłyną na kierunek rozwoju narzędzia. Budujemy Procurea razem z użytkownikami.",
    gradient: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: Gift,
    title: "Darmowe kredyty po beta",
    description:
      "Po zakończeniu beta testów otrzymasz darmowe kredyty na start w pełnej wersji produktu jako podziękowanie.",
    gradient: "from-emerald-500 to-cyan-500",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
]

const trustPoints = [
  "Rejestracja zajmuje 30 sekund",
  "Logowanie przez Google lub Microsoft",
  "Dane w europejskiej chmurze",
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function BetaSignupSection() {
  return (
    <section id="dolacz" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.06] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-400 tracking-wide uppercase mb-3">
              Dołącz do beta
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5">
              Dołącz do zamkniętych
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                beta testów
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Pełny dostęp. Za darmo. Bez zobowiązań.
            </p>
          </div>
        </RevealOnScroll>

        {/* Benefits grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-14"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group"
            >
              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-7 lg:p-8 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] h-full flex flex-col">
                {/* Gradient line at top */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${benefit.gradient} opacity-40`} />

                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${benefit.iconBg} ${benefit.iconColor} mb-5`}>
                  <benefit.icon className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2.5">{benefit.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <RevealOnScroll delay={0.15}>
          <div className="text-center">
            <motion.a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('beta_signup')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center mb-8"
            >
              {/* Glow */}
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 opacity-60 blur-lg group-hover:opacity-80 transition-opacity" />
              <span className="relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-white text-gray-900 text-base font-semibold shadow-xl">
                Załóż darmowe konto
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.a>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              {trustPoints.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
