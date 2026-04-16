import { Link } from "react-router-dom"
import { ArrowRight, Factory, Calendar, HardHat, ShoppingBag } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const copy = {
  sectionLabel: isEN ? 'BUILT FOR YOUR INDUSTRY' : 'STWORZONE DLA TWOJEJ BRANŻY',
  heading: isEN ? 'Procurement expertise, tailored per industry' : 'Procurement dopasowany do Twojej branży',
  subheading: isEN
    ? 'Different industries have different procurement workflows. See how Procurea handles yours.'
    : 'Różne branże to różne workflow. Zobacz jak Procurea radzi sobie z Twoim.',

  industries: isEN ? [
    {
      icon: Factory,
      title: 'Manufacturing',
      desc: 'Alternative suppliers for raw materials, components, packaging. ISO 9001 / IATF qualification built-in.',
      to: pathFor('iManufacturing'),
    },
    {
      icon: Calendar,
      title: 'Events & Agencies',
      desc: 'Find local vendors fast — catering, AV, scenography. 48h sourcing for foreign-city events.',
      to: pathFor('iEvents'),
    },
    {
      icon: HardHat,
      title: 'Construction',
      desc: 'Materials + subcontractors for developers and general contractors. RFQ to 30+ in one click.',
      to: pathFor('iConstruction'),
    },
    {
      icon: ShoppingBag,
      title: 'Retail & E-commerce',
      desc: 'Private label manufacturers in Europe, Turkey, nearshore. Migrate from China in weeks.',
      to: pathFor('iRetail'),
    },
  ] : [
    {
      icon: Factory,
      title: 'Produkcja',
      desc: 'Alternatywni dostawcy surowców, komponentów, opakowań. Wbudowana kwalifikacja ISO 9001 / IATF.',
      to: pathFor('iManufacturing'),
    },
    {
      icon: Calendar,
      title: 'Eventy',
      desc: 'Lokalni dostawcy w 48h — catering, AV, scenografia. Sourcing w obcym mieście pod event.',
      to: pathFor('iEvents'),
    },
    {
      icon: HardHat,
      title: 'Budownictwo',
      desc: 'Materiały i podwykonawcy dla deweloperów i generalnych wykonawców. RFQ do 30+ jednym kliknięciem.',
      to: pathFor('iConstruction'),
    },
    {
      icon: ShoppingBag,
      title: 'Retail & E-commerce',
      desc: 'Producenci private label w Europie, Turcji, nearshore. Migracja z Chin w tygodniach.',
      to: pathFor('iRetail'),
    },
  ],

  moreLabel: isEN ? 'Healthcare · HoReCa · Logistics · MRO — and more' : 'Ochrona zdrowia · HoReCa · Logistyka · MRO — i więcej',
  seeAllLabel: isEN ? 'See all industries' : 'Zobacz wszystkie branże',
}

export function IndustriesGridSection() {
  return (
    <section className="relative py-20 md:py-28" data-track-section="industries-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
              {copy.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">{copy.heading}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.subheading}</p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {copy.industries.map((industry) => {
            const Icon = industry.icon
            return (
              <RevealOnScroll key={industry.title}>
                <Link
                  to={industry.to}
                  className="group block h-full rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{industry.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{industry.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    {isEN ? 'Learn more' : 'Dowiedz się więcej'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </RevealOnScroll>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground mb-3">{copy.moreLabel}</p>
          <Link
            to={pathFor('industriesHub')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
          >
            {copy.seeAllLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
