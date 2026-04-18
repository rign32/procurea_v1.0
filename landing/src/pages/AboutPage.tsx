import { Link } from "react-router-dom"
import { ArrowRight, MapPin, Building2, Calendar, Award } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { TiltCard } from "@/components/ui/TiltCard"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function AboutPage() {
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
              {isEN ? 'ABOUT PROCUREA' : 'O PROCUREA'}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {isEN ? 'Built by a procurement insider' : 'Zbudowane przez praktyka procurement'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {isEN
                ? "Not another startup guessing what procurement needs. Procurea was born from 5 years of watching sourcing processes that haven't changed in decades."
                : 'To nie kolejny startup zgadujący czego potrzebuje procurement. Procurea powstała z 5 lat obserwowania procesów sourcingowych, które nie zmieniły się od dekad.'}
            </p>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative"
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/team/rafal-reiwer.jpg"
                      alt="Rafał Reiwer — Founder & CEO, Procurea"
                      className="w-full h-auto object-cover aspect-[4/5]"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 text-center lg:text-left">
                    <p className="text-xl font-bold tracking-tight">Rafał Reiwer</p>
                    <p className="text-sm text-muted-foreground">Founder & CEO</p>
                  </div>
                </motion.div>

                {/* Story */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                >
                  <blockquote className="text-lg md:text-xl leading-relaxed text-foreground/90 space-y-5">
                    <p>
                      {isEN
                        ? 'After 5 years as an ERP consultant implementing SAP and Dynamics for manufacturing companies, I saw the same problem everywhere: procurement teams spending 30+ hours per sourcing project, manually Googling vendors, sending cold emails, comparing quotes in spreadsheets.'
                        : 'Po 5 latach jako konsultant ERP wdrażający SAP i Dynamics w firmach produkcyjnych, wszędzie widziałem ten sam problem: zespoły zakupowe spędzające 30+ godzin na projekt sourcingowy, ręcznie googlujące dostawców, wysyłające zimne maile, porównujące oferty w Excelach.'}
                    </p>
                    <p>
                      {isEN
                        ? "The tools existed for managing purchase orders. But nobody had automated the hardest part — finding and qualifying the right suppliers in the first place."
                        : 'Narzędzia do zarządzania zamówieniami istniały. Ale nikt nie zautomatyzował najtrudniejszej części — znajdowania i kwalifikowania właściwych dostawców.'}
                    </p>
                    <p>
                      {isEN
                        ? 'Procurea deploys AI agents that search in 26 languages, verify supplier capabilities, and deliver a qualified shortlist in 20 minutes. What used to take weeks now takes a coffee break.'
                        : 'Procurea wysyła agentów AI, którzy szukają w 26 językach, weryfikują możliwości dostawców i dostarczają kwalifikowaną shortlistę w 20 minut. To co zajmowało tygodnie, teraz zajmuje przerwę na kawę.'}
                    </p>
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      — Rafał Reiwer, Founder & CEO
                    </span>
                  </div>
                </motion.div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Vision */}
        <section className="py-16 md:py-24 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll parallax>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="order-2 lg:order-1"
                >
                  <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
                    {isEN ? 'THE VISION' : 'WIZJA'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
                    {isEN
                      ? 'The platform we wished we had'
                      : 'Platforma, której nam brakowało'}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {isEN
                      ? "We're building the procurement platform we wished we had as ERP consultants. AI-native from day one. No legacy. No compromise."
                      : 'Budujemy platformę zakupową, której brakowało nam jako konsultantom ERP. AI-native od pierwszego dnia. Bez legacy. Bez kompromisów.'}
                  </p>
                </motion.div>

                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                  className="order-1 lg:order-2"
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/team/rafal-reiwer-2.jpg"
                      alt={isEN ? 'Rafał Reiwer — building Procurea' : 'Rafał Reiwer — twórca Procurea'}
                      className="w-full h-auto object-cover aspect-[4/3]"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <div className="section-divider-gradient" />

        {/* Company Info */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10">
                {isEN ? 'Company' : 'Firma'}
              </h2>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {([
                  {
                    icon: Building2,
                    label: 'Procurea sp. z o.o.',
                    sub: isEN ? 'Limited liability company' : 'Spółka z ograniczoną odpowiedzialnością',
                    iconBg: 'from-amber-500/10 to-amber-500/5',
                    iconColor: 'text-amber-600',
                  },
                  {
                    icon: MapPin,
                    label: isEN ? 'Bydgoszcz, Poland' : 'Bydgoszcz, Polska',
                    sub: 'ul. Pomorska 3/1, 85-050',
                    iconBg: 'from-blue-500/10 to-blue-500/5',
                    iconColor: 'text-blue-600',
                  },
                  {
                    icon: Calendar,
                    label: isEN ? 'Founded 2025' : 'Założona 2025',
                    sub: isEN ? 'Early-stage startup' : 'Startup we wczesnej fazie',
                    iconBg: 'from-emerald-500/10 to-emerald-500/5',
                    iconColor: 'text-emerald-600',
                  },
                  {
                    icon: Award,
                    label: isEN ? 'Domain expertise' : 'Doświadczenie branżowe',
                    sub: isEN
                      ? 'Backed by 5 years of procurement consulting'
                      : '5 lat doświadczenia w konsultingu procurement',
                    iconBg: 'from-violet-500/10 to-violet-500/5',
                    iconColor: 'text-violet-600',
                  },
                ] as const).map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.label}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    >
                      <TiltCard className="h-full">
                        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 group h-full">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`h-5 w-5 ${item.iconColor}`} />
                          </div>
                          <p className="font-bold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.sub}</p>
                        </div>
                      </TiltCard>
                    </motion.div>
                  )
                })}
              </motion.div>
            </RevealOnScroll>
          </div>
        </section>

        <div className="section-divider-gradient" />

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden text-white p-10 md:p-16 text-center">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/[0.06] rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[80px]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {isEN ? "Let's talk procurement" : 'Porozmawiajmy o zakupach'}
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                {isEN
                  ? "Book a call with Rafał to discuss your sourcing challenges and see Procurea in action."
                  : 'Umów rozmowę z Rafałem, żeby omówić Twoje wyzwania sourcingowe i zobaczyć Procurea w akcji.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={`${pathFor('contact')}#calendar`}
                  onClick={() => trackCtaClick('about_talk_to_rafal')}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
                >
                  {isEN ? 'Talk to Rafał' : 'Porozmawiaj z Rafałem'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to={pathFor('featuresHub')}
                  onClick={() => trackCtaClick('about_see_features')}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  {isEN ? "See what we're building" : 'Zobacz co budujemy'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
