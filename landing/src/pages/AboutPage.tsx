import { Link } from "react-router-dom"
import { ArrowRight, Zap, Globe, Shield, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const copy = {
  heroEyebrow: isEN ? 'ABOUT PROCUREA' : 'O PROCUREA',
  heroTitle: isEN
    ? 'AI-native procurement automation for global teams'
    : 'AI-native automatyzacja zakupów dla globalnych zespołów',
  heroSubtitle: isEN
    ? 'We build the procurement stack that small teams can run, and that enterprise buyers can scale with. Sourcing + RFQ + portal + negotiation — integrated with your ERP.'
    : 'Budujemy stack procurement który małe zespoły mogą prowadzić, a enterprise buyerzy mogą skalować. Sourcing + RFQ + portal + negocjacje — zintegrowane z Twoim ERP.',

  missionTitle: isEN ? 'Our mission' : 'Nasza misja',
  missionBody: isEN
    ? 'Procurement is the second-largest cost center in most industrial businesses after payroll — and it runs on spreadsheets, emails, and outdated vendor rolodexes. We believe AI should automate the repetitive 80% (research, outreach, comparison) so procurement teams can focus on the strategic 20% (negotiation, qualification, supplier development).'
    : 'Procurement to drugie co do wielkości centrum kosztów w większości firm przemysłowych po payroll — a działa na Excelach, mailach i przestarzałych rolodexach. Wierzymy że AI powinno automatyzować powtarzalne 80% (research, outreach, porównania) żeby zespoły zakupowe mogły skupić się na strategicznych 20% (negocjacje, kwalifikacja, rozwój dostawców).',

  valuesTitle: isEN ? 'What we value' : 'Co cenimy',
  values: isEN ? [
    {
      icon: Zap,
      title: 'Fast time-to-value',
      body: 'You run your first sourcing campaign in 20 minutes. No 3-month implementation, no consultancy contract, no paid integrations engineer. Just product.',
    },
    {
      icon: Globe,
      title: 'Multilingual by default',
      body: '26-language research and outreach. Your Polish team talks to Turkish suppliers in Turkish, German suppliers in German. Response rate 2-3x higher than English-only.',
    },
    {
      icon: Shield,
      title: 'Honest roadmap',
      body: 'We do not promise integrations we have not built. SAP, Oracle, Salesforce — check /integrations for actual status (pilot / roadmap / custom). No vapor, no lock-in tactics.',
    },
    {
      icon: Sparkles,
      title: 'Enterprise workflow, SMB pricing',
      body: 'From $199/mo you get what Coupa and Ariba charge $50k+ for — at a fraction of the cost, with zero legacy baggage. Growing teams skip the spreadsheet phase entirely.',
    },
  ] : [
    {
      icon: Zap,
      title: 'Szybki time-to-value',
      body: 'Uruchamiasz pierwszą kampanię sourcingową w 20 minut. Bez 3-miesięcznego wdrożenia, bez kontraktu konsultingowego, bez płatnego inżyniera integracji. Po prostu produkt.',
    },
    {
      icon: Globe,
      title: 'Wielojęzyczność domyślnie',
      body: '26-języczny research i outreach. Twój polski zespół rozmawia z tureckimi dostawcami po turecku, z niemieckimi po niemiecku. Response rate 2-3x wyższy niż tylko angielski.',
    },
    {
      icon: Shield,
      title: 'Uczciwa roadmapa',
      body: 'Nie obiecujemy integracji, których nie zbudowaliśmy. SAP, Oracle, Salesforce — sprawdź /integracje dla aktualnego statusu (pilot / roadmap / custom). Bez vapor, bez taktyk lock-in.',
    },
    {
      icon: Sparkles,
      title: 'Enterprise workflow, SMB pricing',
      body: 'Od $199/mies dostajesz to za co Coupa i Ariba biorą $50k+ — za ułamek kosztu, bez legacy baggage. Rosnące zespoły omijają fazę spreadsheet w całości.',
    },
  ],

  stackTitle: isEN ? 'Built on' : 'Zbudowane na',
  stackBody: isEN
    ? 'React 19 + Vite frontend · NestJS + PostgreSQL + Prisma backend · Google Gemini 2.0 Flash for AI · Serper.dev for search · Resend for email · Firebase Hosting + Cloud Functions. EU data residency (Google Cloud europe-west1).'
    : 'React 19 + Vite frontend · NestJS + PostgreSQL + Prisma backend · Google Gemini 2.0 Flash dla AI · Serper.dev dla wyszukiwania · Resend dla maila · Firebase Hosting + Cloud Functions. Dane w UE (Google Cloud europe-west1).',

  legalTitle: isEN ? 'Company' : 'Firma',
  legalBody: 'Procurea sp. z o.o. · ul. Pomorska 3/1, 85-050 Bydgoszcz · Polska',
  legalKrs: isEN ? 'Registered in Poland (KRS)' : 'Zarejestrowana w Polsce (KRS)',

  ctaTitle: isEN ? 'Let\'s talk procurement' : 'Porozmawiajmy o zakupach',
  ctaBody: isEN
    ? 'Whether you are running your first sourcing campaign or migrating away from legacy procurement software, we\'d love to hear what you\'re trying to solve.'
    : 'Niezależnie od tego czy uruchamiasz pierwszą kampanię sourcingową czy migrujesz z legacy procurement software, chętnie usłyszymy nad czym pracujesz.',
  ctaStart: isEN ? 'Start free research' : 'Rozpocznij za darmo',
  ctaContact: isEN ? 'Contact us' : 'Skontaktuj się',
}

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
              {copy.heroEyebrow}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {copy.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {copy.heroSubtitle}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center">
                {copy.missionTitle}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                {copy.missionBody}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
                {copy.valuesTitle}
              </h2>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {copy.values.map((v) => {
                const Icon = v.icon
                return (
                  <div
                    key={v.title}
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 md:p-7"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 text-center">
                {copy.stackTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-center">
                {copy.stackBody}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Company legal */}
        <section className="py-12 border-y border-black/[0.06] bg-slate-50/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {copy.legalTitle}
            </h2>
            <p className="text-sm font-semibold text-foreground mb-1">{copy.legalBody}</p>
            <p className="text-xs text-muted-foreground">{copy.legalKrs}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{copy.ctaTitle}</h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">{copy.ctaBody}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={appendUtm(APP_URL, 'about_primary')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('about_primary')}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg transition-all"
                >
                  {copy.ctaStart}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link
                  to={pathFor('contact')}
                  onClick={() => trackCtaClick('about_secondary')}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  {copy.ctaContact}
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
