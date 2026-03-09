import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Clock, AlertTriangle, Globe, ArrowDown } from "lucide-react"

const painPoints = [
  {
    icon: Clock,
    title: "30 godzin na jeden sourcing",
    description:
      "Średni proces sourcingu zajmuje 30 godzin pracy. Ręczne przeszukiwanie internetu, weryfikacja firm, zbieranie kontaktów i wysyłanie zapytań pochłania cenny czas zespołu.",
    stat: "30h",
    statLabel: "średni czas jednego sourcingu",
    gradient: "from-orange-500 to-amber-500",
    bgGlow: "bg-orange-500/5",
    lightBg: "bg-orange-50/50",
    borderAccent: "border-orange-200/60",
  },
  {
    icon: AlertTriangle,
    title: "Nieaktualne dane",
    description:
      "Dane kontaktowe szybko tracą aktualność. Nieprawidłowe emaile, stare numery telefonów i przestarzałe informacje generują frustrację i straconą pracę.",
    stat: "40%",
    statLabel: "danych traci aktualność rocznie",
    gradient: "from-red-500 to-rose-500",
    bgGlow: "bg-red-500/5",
    lightBg: "bg-red-50/50",
    borderAccent: "border-red-200/60",
  },
  {
    icon: Globe,
    title: "Bariera językowa",
    description:
      "Wyszukiwanie dostawców na rynkach zagranicznych wymaga języków lokalnych. Bez tego omijasz najlepszych producentów z Europy i świata.",
    stat: "26",
    statLabel: "języków rynków dostawców",
    gradient: "from-amber-500 to-yellow-500",
    bgGlow: "bg-amber-500/5",
    lightBg: "bg-amber-50/50",
    borderAccent: "border-amber-200/60",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Warm-tinted background */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-50/30 via-background to-background pointer-events-none" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/[0.03] blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-red-50 text-red-500 mb-6 ring-1 ring-red-100">
              <ArrowDown className="h-5 w-5" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              Ręczne wyszukiwanie dostawców
              <br />
              <span className="text-muted-foreground">kosztuje Cię czas i pieniądze</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tradycyjny sourcing w firmach produkcyjnych to tygodnie przeszukiwania
              internetu, setki emaili i arkusze kalkulacyjne pełne nieaktualnych danych.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-5 lg:gap-6 mt-16"
        >
          {painPoints.map((point) => (
            <motion.div
              key={point.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div className={`absolute inset-0 rounded-2xl ${point.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className={`relative rounded-2xl border ${point.borderAccent} bg-card p-7 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] h-full flex flex-col`}>
                {/* Icon with gradient bg */}
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${point.gradient} text-white mb-6 shadow-sm`}>
                  <point.icon className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-semibold mb-3">{point.title}</h3>
                <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed mb-6 flex-1">
                  {point.description}
                </p>

                {/* Stat callout with colored background */}
                <div className={`pt-5 border-t border-border/40 ${point.lightBg} -mx-7 -mb-7 lg:-mx-8 lg:-mb-8 px-7 lg:px-8 pb-7 lg:pb-8 rounded-b-2xl`}>
                  <span className={`text-3xl font-bold bg-gradient-to-r ${point.gradient} bg-clip-text text-transparent`}>
                    {point.stat}
                  </span>
                  <span className="block text-xs sm:text-sm text-muted-foreground mt-1">
                    {point.statLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
