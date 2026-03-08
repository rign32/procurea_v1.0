import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Briefcase, Target, Search } from "lucide-react"

const personas = [
  {
    icon: Briefcase,
    title: "Dyrektorzy zakupów",
    description:
      "Strategiczny przegląd procesu sourcingu. Raporty, metryki i pełna kontrola nad bazą dostawców w jednym miejscu.",
    tags: ["Strategia", "Raporty", "Kontrola"],
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
    tagBg: "bg-blue-50",
    tagText: "text-blue-700",
    tagRing: "ring-blue-100",
    borderAccent: "border-blue-200/60",
    lightBg: "bg-gradient-to-br from-blue-50/40 to-indigo-50/20",
  },
  {
    icon: Target,
    title: "Kierownicy zaopatrzenia",
    description:
      "Zarządzanie kampaniami sourcingowymi. Szybkie znajdowanie i porównywanie dostawców.",
    tags: ["Kampanie", "Analiza", "Negocjacje"],
    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
    iconColor: "text-white",
    tagBg: "bg-violet-50",
    tagText: "text-violet-700",
    tagRing: "ring-violet-100",
    borderAccent: "border-violet-200/60",
    lightBg: "bg-gradient-to-br from-violet-50/40 to-purple-50/20",
  },
  {
    icon: Search,
    title: "Specjaliści zakupów",
    description:
      "Szybkie wyszukiwanie dostawców bez ręcznego przeszukiwania internetu. AI wykonuje ciężką pracę za Ciebie.",
    tags: ["Wyszukiwanie", "Kontakty", "Automatyzacja"],
    iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    iconColor: "text-white",
    tagBg: "bg-cyan-50",
    tagText: "text-cyan-700",
    tagRing: "ring-cyan-100",
    borderAccent: "border-cyan-200/60",
    lightBg: "bg-gradient-to-br from-cyan-50/40 to-teal-50/20",
  },
]

const industries = [
  { name: "Automotive", color: "bg-blue-50 text-blue-700 border-blue-200/60 hover:bg-blue-100/70" },
  { name: "Elektronika", color: "bg-violet-50 text-violet-700 border-violet-200/60 hover:bg-violet-100/70" },
  { name: "Obróbka metali", color: "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100/70" },
  { name: "Tworzywa sztuczne", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70" },
  { name: "Opakowania", color: "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/70" },
  { name: "Maszyny i urządzenia", color: "bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/70" },
  { name: "Chemikalia", color: "bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100/70" },
  { name: "Komponenty elektryczne", color: "bg-cyan-50 text-cyan-700 border-cyan-200/60 hover:bg-cyan-100/70" },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function AudienceSection() {
  return (
    <section id="dla-kogo" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              Dla kogo
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              Stworzone dla zespołów zakupowych
              <br />
              <span className="text-muted-foreground">w firmach produkcyjnych</span>
            </h2>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-16"
        >
          {personas.map((persona) => (
            <motion.div
              key={persona.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div
                className={`relative rounded-2xl border ${persona.borderAccent} ${persona.lightBg} p-7 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] h-full flex flex-col`}
              >
                {/* Icon with gradient */}
                <div className={`inline-flex items-center justify-center h-13 w-13 rounded-xl ${persona.iconBg} ${persona.iconColor} mb-5 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                  <persona.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold mb-3">{persona.title}</h3>
                <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed mb-6 flex-1">
                  {persona.description}
                </p>

                {/* Tags with colors */}
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg ${persona.tagBg} ring-1 ${persona.tagRing} text-xs font-semibold ${persona.tagText}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Industries */}
        <RevealOnScroll delay={0.2}>
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-6">
              Idealnie dla branż:
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {industries.map((industry) => (
                <span
                  key={industry.name}
                  className={`inline-flex items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-default ${industry.color}`}
                >
                  {industry.name}
                </span>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
