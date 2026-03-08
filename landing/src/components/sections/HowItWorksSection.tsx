import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { FileText, Brain, Search, UserCheck, ListChecks, ChevronRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Opisz czego szukasz",
    description:
      "Wprowadź nazwę produktu, specyfikacje techniczne i wymagania. Intuicyjny kreator przeprowadzi Cię krok po kroku.",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    ringColor: "ring-blue-100",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI tworzy strategię",
    description:
      "Agent Strategii analizuje wymagania i tworzy zapytania w wielu językach, dopasowane do specyfiki rynków.",
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    ringColor: "ring-violet-100",
  },
  {
    number: "03",
    icon: Search,
    title: "Skanowanie internetu",
    description:
      "Agent Eksploracji przeszukuje internet, identyfikuje producentów i ocenia ich możliwości.",
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    ringColor: "ring-indigo-100",
  },
  {
    number: "04",
    icon: UserCheck,
    title: "Wzbogacanie danych",
    description:
      "System automatycznie znajduje emaile, telefony i dane decyzyjne dla każdego dostawcy.",
    gradient: "from-cyan-500 to-cyan-600",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    ringColor: "ring-cyan-100",
  },
  {
    number: "05",
    icon: ListChecks,
    title: "Gotowa lista",
    description:
      "Zweryfikowana lista dostawców z ocenami AI, danymi kontaktowymi i certyfikatami. Gotowa do wykorzystania.",
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    ringColor: "ring-emerald-100",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function HowItWorksSection() {
  return (
    <section id="jak-to-dziala" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-500/[0.04] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-violet-500/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              Jak to działa
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              Od zapytania do listy dostawców
              <br />
              <span className="text-muted-foreground">w 5 prostych krokach</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Cały proces jest w pełni automatyczny. Ty definiujesz potrzeby — AI robi resztę.
            </p>
          </div>
        </RevealOnScroll>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              className="relative group"
            >
              {/* Connector arrow (desktop, between cards) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className={`h-5 w-5 text-indigo-300`} />
                </div>
              )}

              <div className="relative rounded-2xl border border-border bg-card p-6 lg:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.05] hover:border-transparent hover:-translate-y-1 h-full flex flex-col">
                {/* Step number — large and colored */}
                <div className={`text-sm font-extrabold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent mb-4 tracking-wide`}>
                  KROK {step.number}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${step.iconBg} ring-1 ${step.ringColor} mb-4 transition-transform duration-200 group-hover:scale-110`}>
                  <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                </div>

                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {step.description}
                </p>

                {/* Bottom gradient line on hover */}
                <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary stat below */}
        <RevealOnScroll delay={0.3}>
          <div className="mt-14 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-white border border-border shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <ListChecks className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm sm:text-base">
                <strong className="font-semibold">Cały proces</strong>
                <span className="text-muted-foreground"> trwa średnio </span>
                <strong className="font-semibold text-emerald-600">5–10 minut</strong>
              </span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
