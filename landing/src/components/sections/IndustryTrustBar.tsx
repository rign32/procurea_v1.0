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

export function IndustryTrustBar() {
  return (
    <section className="relative border-y border-border/50 bg-slate-50/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <RevealOnScroll>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-6">
            {t.homeTrustBar.heading}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 items-center justify-items-center">
            {INDUSTRIES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Icon className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-slate-600 text-center">
                  {t.homeTrustBar.industries[key]}
                </span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
