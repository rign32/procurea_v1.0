import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Sparkles, FileText, Globe, Mail, Database, Activity } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Wyszukiwanie AI",
    description:
      "Wieloetapowy agent AI przeszukuje internet w 12+ językach, identyfikuje producentów i weryfikuje ich możliwości produkcyjne.",
    highlight: "5 agentów AI pracujących równolegle",
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-700",
    iconColor: "text-white",
    featured: true,
  },
  {
    icon: FileText,
    title: "Zapytania ofertowe",
    description:
      "Tworzenie, wysyłanie i zarządzanie zapytaniami ofertowymi. Porównywanie ofert od wielu dostawców w jednym widoku.",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    ringColor: "ring-brand-100",
  },
  {
    icon: Globe,
    title: "Portal dostawcy",
    description:
      "Dostawcy składają oferty przez dedykowany portal bez konieczności zakładania konta. Prosty link i gotowe.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    ringColor: "ring-emerald-100",
  },
  {
    icon: Mail,
    title: "Sekwencje email",
    description:
      "Konfigurowalne sekwencje follow-up z personalizowanymi szablonami i automatycznym harmonogramem wysyłki.",
    iconBg: "bg-brand-gray-50",
    iconColor: "text-brand-900",
    ringColor: "ring-brand-gray-100",
  },
  {
    icon: Database,
    title: "Baza dostawców",
    description:
      "Centralny rejestr dostawców z ocenami AI, historią współpracy, danymi kontaktowymi i certyfikatami.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    ringColor: "ring-amber-100",
  },
  {
    icon: Activity,
    title: "Monitoring na żywo",
    description:
      "Śledź postęp kampanii sourcingowej w czasie rzeczywistym. Natychmiastowe aktualizacje o nowych dostawcach.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    ringColor: "ring-cyan-100",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export function FeaturesSection() {
  return (
    <section id="funkcje" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-40 left-0 w-[600px] h-[600px] rounded-full bg-brand-500/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-brand-900/[0.03] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-700 tracking-wide uppercase mb-3">
              Funkcje
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              Wszystko czego potrzebujesz
              <br />
              <span className="text-muted-foreground">do inteligentnego sourcingu</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Kompleksowa platforma zastępująca arkusze kalkulacyjne,
              ręczne wyszukiwanie i chaotyczne skrzynki email.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div
                className={`relative rounded-2xl border bg-card p-7 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] h-full flex flex-col ${
                  feature.featured
                    ? "border-brand-200/80 ring-1 ring-brand-100 bg-gradient-to-br from-white to-brand-50/30"
                    : "border-border hover:border-transparent"
                }`}
              >
                {/* Featured label */}
                {feature.featured && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white text-[0.65rem] font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Kluczowa funkcja
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${feature.iconBg} ${feature.iconColor} mb-5 transition-transform duration-200 group-hover:scale-110 ${
                  !feature.featured && feature.ringColor ? `ring-1 ${feature.ringColor}` : ""
                }`}>
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-semibold mb-2.5">{feature.title}</h3>
                <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed flex-1">
                  {feature.description}
                </p>

                {feature.highlight && (
                  <div className="mt-5 pt-4 border-t border-brand-100">
                    <span className="text-sm font-semibold text-brand-700">
                      {feature.highlight}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
