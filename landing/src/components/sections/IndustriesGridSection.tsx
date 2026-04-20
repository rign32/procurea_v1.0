import { Link } from "react-router-dom"
import { ArrowRight, Factory, Calendar, HardHat, ShoppingBag } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const copy = {
  sectionLabel: isEN ? 'BUILT FOR YOUR INDUSTRY' : 'STWORZONE DLA TWOJEJ BRANŻY',
  heading: isEN ? 'Real problems. Real procurement.' : 'Realne problemy. Realne zakupy.',
  subheading: isEN
    ? 'Each industry has its own sourcing nightmares. See how Procurea turns them around.'
    : 'Każda branża ma swoje koszmary zakupowe. Zobacz jak Procurea je rozwiązuje.',

  industries: isEN ? [
    {
      icon: Factory,
      image: '/industries/manufacturing.jpg',
      tag: 'Manufacturing',
      problem: 'Key supplier down. Line stopped.',
      solution: 'Find qualified alternatives in 48h — ISO 9001 / IATF ready, pre-verified.',
      to: pathFor('iManufacturing'),
    },
    {
      icon: Calendar,
      image: '/industries/events.jpg',
      tag: 'Events & Agencies',
      problem: 'Event in 3 days. Vendor just canceled.',
      solution: 'Replace catering, AV or scenography in 24h — local vendors, any city.',
      to: pathFor('iEvents'),
    },
    {
      icon: HardHat,
      image: '/industries/construction.jpg',
      tag: 'Construction',
      problem: 'Materials late. Penalty clauses ticking.',
      solution: 'RFQ to 30+ wholesalers in one click. Compare offers side by side.',
      to: pathFor('iConstruction'),
    },
    {
      icon: ShoppingBag,
      image: '/industries/retail.jpg',
      tag: 'Retail & E-commerce',
      problem: 'China factory missing quality and lead times.',
      solution: 'Migrate to nearshore producers in Europe or Turkey in weeks.',
      to: pathFor('iRetail'),
    },
  ] : [
    {
      icon: Factory,
      image: '/industries/manufacturing.jpg',
      tag: 'Produkcja',
      problem: 'Główny dostawca padł. Linia stoi.',
      solution: 'Znajdź alternatywę w 48h — gotowych z ISO 9001 / IATF, zweryfikowanych.',
      to: pathFor('iManufacturing'),
    },
    {
      icon: Calendar,
      image: '/industries/events.jpg',
      tag: 'Eventy i agencje',
      problem: 'Event za 3 dni. Podwykonawca odwołał.',
      solution: 'Wymień catering, AV lub scenografię w 24h — lokalni dostawcy, każde miasto.',
      to: pathFor('iEvents'),
    },
    {
      icon: HardHat,
      image: '/industries/construction.jpg',
      tag: 'Budownictwo',
      problem: 'Materiały się spóźniają. Kary umowne tykają.',
      solution: 'RFQ do 30+ hurtowni jednym kliknięciem. Porównaj oferty obok siebie.',
      to: pathFor('iConstruction'),
    },
    {
      icon: ShoppingBag,
      image: '/industries/retail.jpg',
      tag: 'Retail & E-commerce',
      problem: 'Fabryka w Chinach nie trzyma jakości i terminów.',
      solution: 'Migracja do producentów nearshore w Europie i Turcji w tygodniach.',
      to: pathFor('iRetail'),
    },
  ],

  moreLabel: isEN ? 'Healthcare · HoReCa · Logistics · MRO — and more' : 'Ochrona zdrowia · HoReCa · Logistyka · MRO — i więcej',
  seeAllLabel: isEN ? 'See all industries' : 'Zobacz wszystkie branże',
}

export function IndustriesGridSection() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-white to-slate-50/60" data-track-section="industries-grid">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {copy.industries.map((industry) => {
            const Icon = industry.icon
            return (
              <RevealOnScroll key={industry.tag}>
                <Link
                  to={industry.to}
                  className="group block h-full rounded-2xl overflow-hidden border border-black/[0.08] bg-white hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={industry.image}
                      alt={industry.tag}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800 shadow-sm">
                      <Icon className="h-3 w-3 text-primary" />
                      {industry.tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold leading-snug mb-2 text-slate-900">{industry.problem}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{industry.solution}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      {isEN ? 'Learn more' : 'Dowiedz się więcej'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
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
