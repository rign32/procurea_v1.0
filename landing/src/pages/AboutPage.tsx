import { Link } from "react-router-dom"
import { ArrowRight, MapPin, Building2, Calendar, Award, Compass, Target, Shield, Zap } from "lucide-react"
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
  const principles = [
    {
      icon: Compass,
      title: isEN ? 'Built from the trenches' : 'Zbudowane z praktyki',
      body: isEN
        ? 'Every decision in the product answers a real problem we saw on ERP rollouts, not a guess about what procurement might want.'
        : 'Każda decyzja w produkcie odpowiada na realny problem zaobserwowany podczas wdrożeń ERP — nie na domysły, co może się przydać.',
      iconBg: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-600',
    },
    {
      icon: Target,
      title: isEN ? 'Outcomes, not dashboards' : 'Wyniki, nie dashboardy',
      body: isEN
        ? 'We optimize for qualified shortlists delivered, not for vanity metrics. Nobody should buy software to watch charts.'
        : 'Optymalizujemy pod dostarczone, skwalifikowane shortlisty — nie pod metryki próżności. Nikt nie kupuje softu po to, żeby oglądać wykresy.',
      iconBg: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-600',
    },
    {
      icon: Shield,
      title: isEN ? 'Honest about limits' : 'Uczciwi co do ograniczeń',
      body: isEN
        ? 'AI is fast but fallible. We surface confidence levels, show sources, and make it easy for a human to disagree with the agent.'
        : 'AI jest szybkie, ale omylne. Pokazujemy poziomy pewności, źródła, i ułatwiamy człowiekowi zakwestionowanie agenta.',
      iconBg: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Zap,
      title: isEN ? 'AI-native, not AI-sprinkled' : 'AI-native, nie AI-doklejone',
      body: isEN
        ? "Procurea wasn't a legacy tool with a chatbot bolted on. Agents run the sourcing — the UI exists to review what they did."
        : 'Procurea nie jest legacy narzędziem z doklejonym chatbotem. Agenci prowadzą sourcing — UI służy do weryfikacji ich pracy.',
      iconBg: 'from-violet-500/10 to-violet-500/5',
      iconColor: 'text-violet-600',
    },
  ] as const

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pb-28 bg-gradient-to-b from-white to-slate-50/30 bg-mesh-gradient overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-50" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-5">
              {isEN ? 'ABOUT PROCUREA' : 'O PROCUREA'}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
              {isEN ? 'Built by a procurement insider' : 'Zbudowane przez praktyka procurement'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {isEN
                ? "Not another startup guessing what procurement needs. Procurea was born from 5 years of watching sourcing processes that haven't changed in decades."
                : 'To nie kolejny startup zgadujący czego potrzebuje procurement. Procurea powstała z 5 lat obserwowania procesów sourcingowych, które nie zmieniły się od dekad.'}
            </p>
          </div>
        </section>

        {/* Founder — single editorial portrait + story */}
        <section className="relative py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="lg:col-span-5 lg:sticky lg:top-28"
                >
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 via-transparent to-amber-400/10 rounded-[28px] blur-xl pointer-events-none" />
                    <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/[0.06] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
                      <img
                        src="/team/rafal-reiwer-pro.jpg"
                        alt="Rafał Reiwer — Founder & CEO, Procurea"
                        className="w-full h-auto object-cover aspect-[4/5]"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div>
                      <p className="text-lg font-bold tracking-tight">Rafał Reiwer</p>
                      <p className="text-sm text-muted-foreground">Founder & CEO</p>
                    </div>
                    <div className="h-8 w-px bg-black/[0.08]" />
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isEN ? '5 yrs · ERP consulting' : '5 lat · konsulting ERP'}
                    </div>
                  </div>
                </motion.div>

                {/* Story */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
                  className="lg:col-span-7"
                >
                  <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-4">
                    {isEN ? 'FOUNDER STORY' : 'HISTORIA ZAŁOŻYCIELA'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                    {isEN
                      ? 'Five years inside the problem.'
                      : 'Pięć lat wewnątrz problemu.'}
                  </h2>
                  <div className="prose prose-slate max-w-none text-lg leading-relaxed text-foreground/90 space-y-5">
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
                  </div>

                  {/* Signature line */}
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      — Rafał Reiwer
                    </span>
                  </div>

                  {/* Stats strip */}
                  <dl className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-black/[0.06] pt-8">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {isEN ? 'Domain years' : 'Lata w branży'}
                      </dt>
                      <dd className="text-2xl md:text-3xl font-bold tracking-tight">5+</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {isEN ? 'Search languages' : 'Języki wyszukiwania'}
                      </dt>
                      <dd className="text-2xl md:text-3xl font-bold tracking-tight">26</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {isEN ? 'Shortlist in' : 'Shortlista w'}
                      </dt>
                      <dd className="text-2xl md:text-3xl font-bold tracking-tight">~20 min</dd>
                    </div>
                  </dl>
                </motion.div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <div className="section-divider-gradient" />

        {/* Principles */}
        <section className="py-20 md:py-24 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-12">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-4">
                  {isEN ? 'HOW WE BUILD' : 'JAK BUDUJEMY'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
                  {isEN
                    ? 'Four principles that shape the product.'
                    : 'Cztery zasady, które kształtują produkt.'}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {isEN
                    ? "We're building the procurement platform we wished we had as ERP consultants. AI-native from day one. No legacy. No compromise."
                    : 'Budujemy platformę zakupową, której brakowało nam jako konsultantom ERP. AI-native od pierwszego dnia. Bez legacy. Bez kompromisów.'}
                </p>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {principles.map((p) => {
                  const Icon = p.icon
                  return (
                    <motion.div
                      key={p.title}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    >
                      <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300 group">
                        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${p.iconBg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className={`h-5 w-5 ${p.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-2">{p.title}</h3>
                        <p className="text-[15px] text-muted-foreground leading-relaxed">{p.body}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </RevealOnScroll>
          </div>
        </section>

        <div className="section-divider-gradient" />

        {/* Company Info */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-4">
                  {isEN ? 'THE COMPANY' : 'FIRMA'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {isEN ? 'Registered in Poland. Building for Europe.' : 'Zarejestrowani w Polsce. Budujemy dla Europy.'}
                </h2>
              </div>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
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
                        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 group h-full">
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
