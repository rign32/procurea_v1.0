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
    <div className="relative overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] shrink-0 hover:border-brand-200 hover:bg-white/90 hover:shadow-md transition-all duration-300 group cursor-default">
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-brand-50 to-brand-100/80 group-hover:from-brand-100 group-hover:to-brand-200/60 transition-colors duration-300">
        <Icon className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.8} />
      </div>
      <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap tracking-[-0.01em]">{label}</span>
    </div>
  )
}

export function IndustryTrustBar() {
  const items = INDUSTRIES.map(({ icon, key }) => ({
    icon,
    label: t.homeTrustBar.industries[key],
    key,
  }))

  // Duplicate for seamless infinite loop
  const doubled = [...items, ...items]

  return (
    <section className="relative bg-gradient-to-b from-slate-50/60 via-slate-50/30 to-transparent overflow-hidden">
      <div className="py-10 md:py-14">
        <RevealOnScroll>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 mb-7 px-4">
            {t.homeTrustBar.heading}
          </p>
        </RevealOnScroll>

        {/* Marquee container */}
        <div className="relative">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-r from-slate-50/95 via-slate-50/60 to-transparent pointer-events-none" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-l from-slate-50/95 via-slate-50/60 to-transparent pointer-events-none" />

          {/* Scrolling track */}
          <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] w-max">
            {doubled.map(({ icon, label, key }, idx) => (
              <IndustryPill key={`${key}-${idx}`} icon={icon} label={label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
