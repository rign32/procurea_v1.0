import { Link } from "react-router-dom"
import { Search, Workflow, Layers, Sparkles, ArrowRight, type LucideIcon } from "lucide-react"
import { t } from "@/i18n"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  search: Search,
  workflow: Workflow,
  layers: Layers,
  sparkles: Sparkles,
}

export function ModuleOverview() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-14">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.moduleOverview.modules.map((mod, idx) => {
            const Icon = ICON_MAP[mod.iconName] ?? Search
            const highlight = Boolean(mod.highlight)
            return (
              <RevealOnScroll key={mod.title} delay={idx * 0.05}>
                <Link
                  to={mod.href}
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border p-6 shadow-premium transition-all hover:shadow-premium-lg hover:-translate-y-0.5",
                    highlight
                      ? "border-primary/30 bg-gradient-to-br from-primary/[0.04] via-white to-white"
                      : "border-black/[0.06] bg-white"
                  )}
                >
                  {highlight && (
                    <span className="absolute -top-2.5 left-6 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                      {mod.linkLabel}
                    </span>
                  )}
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4",
                      highlight
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-display font-bold tracking-extra-tight text-foreground mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {mod.tagline}
                  </p>
                  <div className="mt-auto">
                    <div className="text-xs font-semibold text-slate-700 mb-3">
                      {mod.price}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-semibold transition-colors",
                        highlight
                          ? "text-primary group-hover:text-primary/80"
                          : "text-slate-900 group-hover:text-primary"
                      )}
                    >
                      {highlight ? t.moduleOverview.bestValueLink : mod.linkLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
