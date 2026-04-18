import { Link } from "react-router-dom"
import { ArrowRight, Factory, Calendar, HardHat, ShoppingBag, UtensilsCrossed, HeartPulse, Truck, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { pathFor } from "@/i18n/paths"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TiltCard } from "@/components/ui/TiltCard"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

interface IndustryItem {
  icon: React.ComponentType<any>
  title: string
  desc: string
  to: string | null // null = coming soon
  round: 1 | 2
}

const industries: IndustryItem[] = isEN ? [
  { icon: Factory, title: 'Manufacturing', desc: 'Alternative suppliers for raw materials and components. ISO 9001 / IATF qualification.', to: pathFor('iManufacturing'), round: 1 },
  { icon: Calendar, title: 'Events', desc: 'Local vendors in 48h — catering, AV, scenography for events in foreign cities.', to: pathFor('iEvents'), round: 1 },
  { icon: HardHat, title: 'Construction', desc: 'Subcontractors and materials for developers and general contractors.', to: pathFor('iConstruction'), round: 1 },
  { icon: ShoppingBag, title: 'Retail & E-commerce', desc: 'Private label manufacturers — nearshore migration from China.', to: pathFor('iRetail'), round: 1 },
  { icon: UtensilsCrossed, title: 'HoReCa', desc: 'F&B ingredients, equipment, tabletop for restaurants and hotels.', to: pathFor('iHoreca'), round: 1 },
  { icon: HeartPulse, title: 'Healthcare', desc: 'Medical devices, disposables — CE, FDA, MDR certified vendors.', to: pathFor('iHealthcare'), round: 1 },
  { icon: Truck, title: 'Logistics', desc: 'Warehouse equipment, fleet parts, outsourced 3PL services.', to: pathFor('iLogistics'), round: 1 },
  { icon: Wrench, title: 'MRO', desc: 'Industrial spare parts, maintenance services, urgent sourcing.', to: pathFor('iMro'), round: 1 },
] : [
  { icon: Factory, title: 'Produkcja', desc: 'Alternatywni dostawcy surowców i komponentów. Kwalifikacja ISO 9001 / IATF.', to: pathFor('iManufacturing'), round: 1 },
  { icon: Calendar, title: 'Eventy', desc: 'Lokalni dostawcy w 48h — catering, AV, scenografia dla eventów w obcych miastach.', to: pathFor('iEvents'), round: 1 },
  { icon: HardHat, title: 'Budownictwo', desc: 'Podwykonawcy i materiały dla deweloperów i generalnych wykonawców.', to: pathFor('iConstruction'), round: 1 },
  { icon: ShoppingBag, title: 'Retail & E-commerce', desc: 'Producenci private label — migracja nearshore z Chin.', to: pathFor('iRetail'), round: 1 },
  { icon: UtensilsCrossed, title: 'HoReCa', desc: 'Składniki F&B, sprzęt, tabletop dla restauracji i hoteli.', to: pathFor('iHoreca'), round: 1 },
  { icon: HeartPulse, title: 'Ochrona zdrowia', desc: 'Wyroby medyczne, jednorazówki — dostawcy z certyfikatami CE, FDA, MDR.', to: pathFor('iHealthcare'), round: 1 },
  { icon: Truck, title: 'Logistyka', desc: 'Sprzęt magazynowy, części floty, outsourcing usług 3PL.', to: pathFor('iLogistics'), round: 1 },
  { icon: Wrench, title: 'MRO', desc: 'Części zamienne przemysłowe, serwis, pilne sourcing.', to: pathFor('iMro'), round: 1 },
]

const copy = {
  heroTitle: isEN ? 'Who is Procurea for' : 'Dla kogo jest Procurea',
  heroSubtitle: isEN
    ? 'Different industries have different procurement workflows. We start with four core industries and expand based on what our customers need most.'
    : 'Różne branże to różne workflow. Startujemy od czterech głównych branż i rozwijamy się zgodnie z potrzebami klientów.',
}

function IndustryCard({ industry }: { industry: IndustryItem }) {
  const Icon = industry.icon
  const content = (
    <TiltCard className="h-full">
    <div className={`group h-full rounded-2xl border border-black/[0.08] bg-white p-6 hover:border-primary/30 hover:shadow-md hover:shadow-hover-card hover:-translate-y-1 transition-all flex flex-col`}>
      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">{industry.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{industry.desc}</p>
      <div className="mt-4 text-sm font-semibold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
        {isEN ? 'Learn more' : 'Dowiedz się więcej'}
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
    </TiltCard>
  )
  return <Link to={industry.to!}>{content}</Link>
}

export function IndustriesHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 bg-mesh-gradient">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pt-32 pb-24">
        <section className="relative overflow-hidden mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-40" />
          <div className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
          <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px] pointer-events-none" />
          <div className="relative">
            <RevealOnScroll>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">{copy.heroTitle}</h1>
            </RevealOnScroll>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">{copy.heroSubtitle}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            {industries.map((i) => (
              <motion.div key={i.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <IndustryCard industry={i} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="relative overflow-hidden mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/[0.06] rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {isEN ? "Your industry not listed?" : 'Nie ma Twojej branży?'}
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                {isEN
                  ? 'Procurea works for any business that sources suppliers. Book a call — we will walk through your specific category and workflow.'
                  : 'Procurea działa dla każdej firmy, która szuka dostawców. Umów spotkanie — przejdziemy przez Twoją specyficzną kategorię i workflow.'}
              </p>
              <Link
                to={`${pathFor('contact')}#calendar`}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEN ? 'Talk to us' : 'Porozmawiaj z nami'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
