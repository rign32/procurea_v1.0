import { Factory, Calendar, HardHat, ShoppingBag, HeartPulse, Truck, UtensilsCrossed, Wrench } from "lucide-react"
import { t } from "@/i18n"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"

const INDUSTRIES = [
  { icon: Factory, key: 'manufacturing' as const },
  { icon: Calendar, key: 'events' as const },
  { icon: HardHat, key: 'construction' as const },
  { icon: ShoppingBag, key: 'retail' as const },
  { icon: HeartPulse, key: 'healthcare' as const },
  { icon: Truck, key: 'logistics' as const },
  { icon: UtensilsCrossed, key: 'horeca' as const },
  { icon: Wrench, key: 'mro' as const },
]

function IndustryPill({ icon: Icon, label }: { icon: typeof Factory; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/[0.06] bg-white/80 shrink-0 hover:border-primary/20 hover:shadow-sm transition-all">
      <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
      <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{label}</span>
    </div>
  )
}

export function IndustryTrustBar() {
  // Double the items for seamless infinite scroll
  const items = INDUSTRIES.map(({ icon, key }) => ({
    icon,
    label: t.homeTrustBar.industries[key],
    key,
  }))

  return (
    <section className="relative border-y border-border/50 bg-slate-50/40 overflow-hidden">
      <div className="py-8 md:py-10">
        <RevealOnScroll>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-5 px-4">
            {t.homeTrustBar.heading}
          </p>
        </RevealOnScroll>

        {/* Marquee — infinite scroll */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-slate-50/90 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-slate-50/90 to-transparent pointer-events-none" />

          <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
            {[...items, ...items].map(({ icon, label, key }, idx) => (
              <IndustryPill key={`${key}-${idx}`} icon={icon} label={label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
