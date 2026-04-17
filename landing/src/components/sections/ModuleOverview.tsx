import { Link } from "react-router-dom"
import { Search, Workflow, Layers, Sparkles, ArrowRight, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { t } from "@/i18n"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TiltCard } from "@/components/ui/TiltCard"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  search: Search,
  workflow: Workflow,
  layers: Layers,
  sparkles: Sparkles,
}

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  search: { bg: "bg-blue-100", text: "text-blue-600" },
  workflow: { bg: "bg-violet-100", text: "text-violet-600" },
  layers: { bg: "bg-primary/10", text: "text-primary" },
  sparkles: { bg: "bg-amber-100", text: "text-amber-600" },
}

export function ModuleOverview() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {t.moduleOverview.sectionLabel}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-extra-tight mb-4">
              {t.moduleOverview.heading}
            </h2>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
              {t.moduleOverview.subheading}
            </p>
          </div>
        </RevealOnScroll>

        {/* Module cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {t.moduleOverview.modules.map((mod, idx) => {
            const Icon = ICON_MAP[mod.iconName] ?? Search
            const highlight = Boolean(mod.highlight)
            const colors = ICON_COLORS[mod.iconName] ?? ICON_COLORS.search

            return (
              <RevealOnScroll key={mod.title} delay={idx * 0.08}>
                <TiltCard className="h-full">
                  <Link
                    to={mod.href}
                    className={cn(
                      "group relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300",
                      "hover:-translate-y-1 hover:shadow-xl",
                      highlight
                        ? [
                            "border-transparent bg-white",
                            "shadow-lg shadow-primary/10",
                            "ring-2 ring-primary/20 hover:ring-primary/40 hover:shadow-glow-primary",
                            "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:p-[2px]",
                            "before:bg-gradient-to-br before:from-primary/40 before:via-primary/20 before:to-transparent",
                            "before:content-['']",
                            "scale-[1.02] xl:scale-105",
                          ]
                        : [
                            "border-black/[0.06] bg-white",
                            "shadow-premium hover:shadow-premium-lg",
                            "hover:border-primary/25",
                          ]
                    )}
                  >
                    {/* Best value badge for highlighted card */}
                    {highlight && (
                      <motion.span
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/90 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25"
                      >
                        <Sparkles className="h-3 w-3" />
                        Best value
                      </motion.span>
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                        highlight
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20"
                          : cn(colors.bg, colors.text)
                      )}
                    >
                      <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-bold tracking-extra-tight text-foreground mb-2">
                      {mod.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {mod.tagline}
                    </p>

                    {/* Price + CTA */}
                    <div className="mt-auto pt-4 border-t border-black/[0.04]">
                      <div className={cn(
                        "text-sm font-semibold mb-3",
                        highlight ? "text-primary" : "text-slate-800"
                      )}>
                        {mod.price}
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200",
                          highlight
                            ? "text-primary group-hover:text-primary/80"
                            : "text-slate-600 group-hover:text-primary"
                        )}
                      >
                        {mod.linkLabel}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
