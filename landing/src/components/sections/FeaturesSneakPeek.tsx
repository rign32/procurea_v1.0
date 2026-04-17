import { Search, Mail, Shield, BarChart3, Sparkles, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { t } from "@/i18n"

const FEATURES = [
  { slug: 'ai-sourcing' as const, icon: Search },
  { slug: 'email-outreach' as const, icon: Mail },
  { slug: 'supplier-portal' as const, icon: Shield },
  { slug: 'offer-comparison' as const, icon: BarChart3 },
  { slug: 'ai-insights' as const, icon: Sparkles },
] as const

type FeatureSlug = typeof FEATURES[number]['slug']

export function FeaturesSneakPeek() {
  const copy = t.featuresSneakPeek
  const features = t.homeFeatures as Record<FeatureSlug, { title: string; subtitle: string }>

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {copy.sectionLabel}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {copy.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            const feat = features[f.slug]
            return (
              <RevealOnScroll key={f.slug} delay={i * 0.08}>
                <Link
                  to={pathFor('featuresHub')}
                  className="group block h-full rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {feat.subtitle}
                  </p>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    {copy.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
