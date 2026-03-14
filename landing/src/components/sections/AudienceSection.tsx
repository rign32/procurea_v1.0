import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Briefcase, Target, Search } from "lucide-react"
import { t } from "@/i18n"

const personaStyles = [
  {
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
    iconColor: "text-white",
    tagBg: "bg-brand-50",
    tagText: "text-brand-700",
    tagRing: "ring-brand-100",
    borderAccent: "border-brand-200/60",
    lightBg: "bg-gradient-to-br from-brand-50/40 to-brand-50/20",
  },
  {
    icon: Target,
    iconBg: "bg-gradient-to-br from-brand-900 to-brand-800",
    iconColor: "text-white",
    tagBg: "bg-brand-gray-50",
    tagText: "text-brand-900",
    tagRing: "ring-brand-gray-100",
    borderAccent: "border-brand-gray-200/60",
    lightBg: "bg-gradient-to-br from-brand-gray-50/40 to-brand-gray-50/20",
  },
  {
    icon: Search,
    iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    iconColor: "text-white",
    tagBg: "bg-cyan-50",
    tagText: "text-cyan-700",
    tagRing: "ring-cyan-100",
    borderAccent: "border-cyan-200/60",
    lightBg: "bg-gradient-to-br from-cyan-50/40 to-teal-50/20",
  },
]

const industryColors = [
  "bg-brand-50 text-brand-700 border-brand-200/60 hover:bg-brand-100/70",
  "bg-brand-gray-50 text-brand-900 border-brand-gray-200/60 hover:bg-brand-gray-100/70",
  "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100/70",
  "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70",
  "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/70",
  "bg-brand-50 text-brand-700 border-brand-200/60 hover:bg-brand-100/70",
  "bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100/70",
  "bg-cyan-50 text-cyan-700 border-cyan-200/60 hover:bg-cyan-100/70",
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
    <section id={t.sectionIds.audience} className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-brand-900/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] rounded-full bg-brand-500/[0.03] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-500 tracking-wide uppercase mb-3">
              {t.audience.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.audience.heading}
              <br />
              <span className="text-muted-foreground">{t.audience.headingSub}</span>
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
          {t.audience.personas.map((persona, idx) => {
            const style = personaStyles[idx]
            const Icon = style.icon
            return (
              <motion.div
                key={persona.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative"
              >
                <div className={`relative rounded-2xl border ${style.borderAccent} ${style.lightBg} p-7 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] h-full flex flex-col`}>
                  <div className={`inline-flex items-center justify-center h-13 w-13 rounded-xl ${style.iconBg} ${style.iconColor} mb-5 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold mb-3">{persona.title}</h3>
                  <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed mb-6 flex-1">
                    {persona.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {persona.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg ${style.tagBg} ring-1 ${style.tagRing} text-xs font-semibold ${style.tagText}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <RevealOnScroll delay={0.2}>
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-6">
              {t.audience.industriesLabel}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {t.audience.industries.map((name, idx) => (
                <span
                  key={name}
                  className={`inline-flex items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-default ${industryColors[idx]}`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
