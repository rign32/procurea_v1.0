import { motion } from "framer-motion"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { Sparkles, Database, Activity, CheckCircle } from "lucide-react"
import { t } from "@/i18n"

const featureStyles = [
  {
    icon: Sparkles,
    iconBg: "bg-gradient-to-br from-indigo-500 to-violet-500",
    iconColor: "text-white",
    featured: true,
  },
  {
    icon: Database,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    ringColor: "ring-amber-100",
    featured: false,
  },
  {
    icon: Activity,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    ringColor: "ring-cyan-100",
    featured: false,
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
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function FeaturesSection() {
  return (
    <section id="co-zyskujesz" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-40 left-0 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              {t.features.sectionLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-5">
              {t.features.heading}
              <br />
              <span className="text-muted-foreground">{t.features.headingSub}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.features.description}
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-5"
        >
          {t.features.items.map((feature, idx) => {
            const style = featureStyles[idx]
            const Icon = style.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                className="group relative"
              >
                <div
                  className={`relative rounded-2xl border bg-card p-7 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] h-full flex flex-col ${
                    style.featured
                      ? "border-indigo-200/80 ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30"
                      : "border-border hover:border-transparent"
                  }`}
                >
                  {style.featured && (
                    <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[0.65rem] font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      {t.features.featuredLabel}
                    </div>
                  )}

                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${style.iconBg} ${style.iconColor} mb-5 transition-transform duration-200 group-hover:scale-110 ${
                    !style.featured && style.ringColor ? `ring-1 ${style.ringColor}` : ""
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2.5">{feature.title}</h3>
                  <p className="text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {'highlight' in feature && feature.highlight && (
                    <div className="mt-5 pt-4 border-t border-indigo-100">
                      <span className="text-sm font-semibold text-indigo-600">
                        {feature.highlight as string}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-14 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-8 lg:p-10 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold mb-5">{t.features.testerExpectationsTitle}</h3>
            <div className="flex flex-col gap-3.5">
              {t.features.testerExpectations.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
