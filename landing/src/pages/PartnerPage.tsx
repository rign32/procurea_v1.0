import { Link } from "react-router-dom"
import { ArrowRight, Users, Briefcase, Code2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PARTNER_TYPES = [
  {
    icon: Users,
    title: isEN ? 'ERP Consultants' : 'Konsultanci ERP',
    description: isEN
      ? 'Recommend Procurea to your SAP/Oracle/Dynamics clients. Earn referral commissions.'
      : 'Polecaj Procurea swoim klientom SAP/Oracle/Dynamics. Otrzymuj prowizje za polecenia.',
  },
  {
    icon: Briefcase,
    title: isEN ? 'Procurement Consultancies' : 'Firmy doradcze procurement',
    description: isEN
      ? 'White-label our AI sourcing for your clients\u2019 projects. API access available.'
      : 'White-label naszego AI sourcingu dla projekt\u00f3w Twoich klient\u00f3w. Dost\u0119p do API.',
  },
  {
    icon: Code2,
    title: isEN ? 'Technology Partners' : 'Partnerzy technologiczni',
    description: isEN
      ? 'Integrate your product with Procurea via our API. Joint go-to-market opportunities.'
      : 'Zintegruj sw\u00f3j produkt z Procurea przez nasze API. Wsp\u00f3lne dzia\u0142ania go-to-market.',
  },
]

const STEPS = [
  {
    step: '01',
    title: isEN ? 'Apply' : 'Zg\u0142o\u015b si\u0119',
    description: isEN
      ? 'Fill out the partner application form. Tell us about your business and how you\u2019d like to collaborate.'
      : 'Wype\u0142nij formularz partnerski. Opowiedz o swoim biznesie i preferowanej formie wsp\u00f3\u0142pracy.',
  },
  {
    step: '02',
    title: isEN ? 'Get approved' : 'Uzyskaj akceptacj\u0119',
    description: isEN
      ? 'Our team reviews your application and sets up your partner account within 48 hours.'
      : 'Nasz zesp\u00f3\u0142 weryfikuje zg\u0142oszenie i konfiguruje konto partnerskie w ci\u0105gu 48 godzin.',
  },
  {
    step: '03',
    title: isEN ? 'Start earning' : 'Zacznij zarabia\u0107',
    description: isEN
      ? 'Access partner resources, start referring clients or building integrations, and earn commissions.'
      : 'Uzyskaj dost\u0119p do materia\u0142\u00f3w partnerskich, polecaj klient\u00f3w lub buduj integracje i zarabiaj prowizje.',
  },
]

export function PartnerPage() {
  const contactPath = `${pathFor('contact')}#calendar`

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 bg-mesh-gradient overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-50" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
              {isEN ? 'PARTNER PROGRAM' : 'PROGRAM PARTNERSKI'}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {isEN ? 'Partner with Procurea' : 'Zosta\u0144 partnerem Procurea'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {isEN
                ? 'We work with ERP consultants, procurement agencies, and technology partners to bring AI sourcing to more teams.'
                : 'Wsp\u00f3\u0142pracujemy z konsultantami ERP, agencjami procurement i partnerami technologicznymi, aby dostarczy\u0107 AI sourcing wi\u0119kszej liczbie zespo\u0142\u00f3w.'}
            </p>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  {isEN ? 'Who we partner with' : 'Z kim wsp\u00f3\u0142pracujemy'}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {isEN
                    ? 'Choose the partnership model that fits your business.'
                    : 'Wybierz model partnerstwa dopasowany do Twojego biznesu.'}
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PARTNER_TYPES.map((type, i) => (
                <RevealOnScroll key={type.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative rounded-2xl border border-border/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                      <type.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{type.description}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-24 bg-slate-50/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  {isEN ? 'How it works' : 'Jak to dzia\u0142a'}
                </h2>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <RevealOnScroll key={step.step}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    className="relative text-center"
                  >
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-lg font-bold mb-5">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-5" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {isEN ? 'Ready to partner?' : 'Gotowy na wsp\u00f3\u0142prac\u0119?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {isEN
                  ? 'Apply to the partner program and start earning with Procurea.'
                  : 'Zg\u0142o\u015b si\u0119 do programu partnerskiego i zacznij zarabia\u0107 z Procurea.'}
              </p>
              <Link
                to={`${contactPath}?interest=partnership`}
                onClick={() => trackCtaClick('partner_apply')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200"
              >
                {isEN ? 'Apply to partner program' : 'Zg\u0142o\u015b si\u0119 do programu partnerskiego'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
