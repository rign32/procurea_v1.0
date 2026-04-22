import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Utensils,
  Music2,
  Lightbulb,
  Shirt,
  Users,
  Clock,
  MapPin,
  Languages,
  Zap,
  PartyPopper,
  Video,
  Coffee,
  CheckCircle2,
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { IndustryRelatedResources } from "@/components/industries/IndustryRelatedResources"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_BASE = (import.meta.env.VITE_APP_URL || "https://app.procurea.pl").replace(/\/login\/?$/, "")
const APP_URL = `${APP_BASE}/campaigns/new?industry=events&mode=service`
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const t = {
  hero: {
    badge: isEN ? "Events & experiential" : "Eventy & experiential",
    title: isEN ? "Event sourcing in 48 hours — any city, any category, any language" : "Sourcing eventowy w 48 godzin — każde miasto, każda kategoria, każdy język",
    subtitle: isEN
      ? "Catering, AV, scenography, staffing, gadgets — parallel campaigns across 26 languages. Stop begging the same three vendors; get authentic local pricing in the city where the event happens."
      : "Catering, AV, scenografia, obsługa, gadżety — równoległe kampanie w 26 językach. Przestań prosić tych samych trzech dostawców; dostaj autentyczne lokalne ceny w mieście eventu.",
    primary: isEN ? "Start a 48h campaign" : "Rozpocznij kampanię 48h",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  countdown: {
    label: isEN ? "Typical event brief timer" : "Typowy zegar briefu eventowego",
    days: "12",
    daysLabel: isEN ? "days to kick-off" : "dni do kick-offu",
    phases: isEN
      ? [
          { day: "D+0", label: "Brief received", color: "bg-slate-400" },
          { day: "D+2", label: "Shortlists live", color: "bg-primary" },
          { day: "D+5", label: "Offers collected", color: "bg-amber-500" },
          { day: "D+7", label: "Vendors locked", color: "bg-emerald-500" },
        ]
      : [
          { day: "D+0", label: "Brief przyjęty", color: "bg-slate-400" },
          { day: "D+2", label: "Shortlisty live", color: "bg-primary" },
          { day: "D+5", label: "Oferty zebrane", color: "bg-amber-500" },
          { day: "D+7", label: "Dostawcy zablokowani", color: "bg-emerald-500" },
        ],
  },
  stats: [
    { value: "48h", label: isEN ? "from brief to shortlist" : "od briefu do shortlisty", detail: isEN ? "vs. 10–14 days manual" : "vs. 10–14 dni ręcznie" },
    { value: "26", label: isEN ? "languages supported" : "obsługiwanych języków", detail: isEN ? "incl. Turkish, Greek, Hungarian" : "w tym turecki, grecki, węgierski" },
    { value: "5+", label: isEN ? "parallel category campaigns" : "równoległe kampanie kategorii", detail: isEN ? "one brief, many tracks" : "jeden brief, wiele tracków" },
    { value: "40+", label: isEN ? "typical shortlist size" : "typowy rozmiar shortlisty", detail: isEN ? "per city, per category (illustrative)" : "per miasto, per kategoria (ilustracyjnie)" },
  ],
  cities: {
    title: isEN ? "European cities where AI sourcing finds local scenes fast" : "Miasta europejskie, gdzie AI sourcing szybko znajduje lokalną scenę",
    subtitle: isEN
      ? "Illustrative market-size view — typical number of event vendors the AI pipeline surfaces from local directories, across catering, AV, scenography, staffing and gadgets combined. Actual yield depends on your brief, category and timing."
      : "Ilustracyjny widok rozmiaru rynku — typowa liczba dostawców eventowych, jaką pipeline AI wyciąga z lokalnych katalogów, łącznie dla cateringu, AV, scenografii, obsługi i gadżetów. Rzeczywista liczba zależy od briefu, kategorii i timingu.",
    cities: [
      { name: "Berlin", flag: "🇩🇪", vendors: 312, tone: "amber" },
      { name: "Warsaw", flag: "🇵🇱", vendors: 284, tone: "primary" },
      { name: "Barcelona", flag: "🇪🇸", vendors: 246, tone: "rose" },
      { name: "Paris", flag: "🇫🇷", vendors: 298, tone: "sky" },
      { name: "Amsterdam", flag: "🇳🇱", vendors: 187, tone: "orange" },
      { name: "Prague", flag: "🇨🇿", vendors: 142, tone: "violet" },
      { name: "Vienna", flag: "🇦🇹", vendors: 168, tone: "red" },
      { name: "Milan", flag: "🇮🇹", vendors: 231, tone: "emerald" },
      { name: "Lisbon", flag: "🇵🇹", vendors: 94, tone: "teal" },
      { name: "Budapest", flag: "🇭🇺", vendors: 108, tone: "violet" },
      { name: "Stockholm", flag: "🇸🇪", vendors: 121, tone: "sky" },
      { name: "Istanbul", flag: "🇹🇷", vendors: 203, tone: "rose" },
    ],
  },
  parallel: {
    title: isEN ? "One event, five campaigns — all running in parallel" : "Jeden event, pięć kampanii — wszystkie równolegle",
    subtitle: isEN
      ? "Every category has its own vendor pool, its own RFQ template and its own timeline. You see them all in one board."
      : "Każda kategoria ma swoją pulę vendorów, swój template RFQ i swoją linię czasu. Widzisz je wszystkie na jednym boardzie.",
    tracks: isEN
      ? [
          { icon: Utensils, name: "Catering", vendors: 24, progress: 88, status: "6 offers in", tone: "orange" },
          { icon: Video, name: "AV / video", vendors: 18, progress: 72, status: "5 offers in", tone: "sky" },
          { icon: Lightbulb, name: "Scenography", vendors: 15, progress: 55, status: "3 offers in", tone: "amber" },
          { icon: Users, name: "On-site staffing", vendors: 22, progress: 41, status: "Awaiting quotes", tone: "primary" },
          { icon: Shirt, name: "Branded gadgets", vendors: 31, progress: 92, status: "Ready to award", tone: "emerald" },
        ]
      : [
          { icon: Utensils, name: "Catering", vendors: 24, progress: 88, status: "6 ofert", tone: "orange" },
          { icon: Video, name: "AV / video", vendors: 18, progress: 72, status: "5 ofert", tone: "sky" },
          { icon: Lightbulb, name: "Scenografia", vendors: 15, progress: 55, status: "3 oferty", tone: "amber" },
          { icon: Users, name: "Obsługa on-site", vendors: 22, progress: 41, status: "Czeka na oferty", tone: "primary" },
          { icon: Shirt, name: "Gadżety brandowane", vendors: 31, progress: 92, status: "Gotowe do award", tone: "emerald" },
        ],
  },
  languages: {
    title: isEN ? "Speak the local language automatically" : "Rozmawiaj w lokalnym języku automatycznie",
    subtitle: isEN
      ? "Send RFQs in Catalan to Barcelona, in Turkish to Istanbul, in Hungarian to Budapest. Vendors reply in their language; we translate back — response rate goes up 2–3×."
      : "Wysyłaj RFQ po katalońsku do Barcelony, po turecku do Istambułu, po węgiersku do Budapesztu. Vendorzy odpowiadają w swoim języku; tłumaczymy z powrotem — response rate rośnie 2–3×.",
    chips: [
      { code: "PL", lang: "Polski" }, { code: "DE", lang: "Deutsch" }, { code: "EN", lang: "English" }, { code: "FR", lang: "Français" },
      { code: "ES", lang: "Español" }, { code: "IT", lang: "Italiano" }, { code: "NL", lang: "Nederlands" }, { code: "PT", lang: "Português" },
      { code: "CZ", lang: "Česky" }, { code: "SK", lang: "Slovensky" }, { code: "HU", lang: "Magyar" }, { code: "RO", lang: "Română" },
      { code: "TR", lang: "Türkçe" }, { code: "GR", lang: "Ελληνικά" }, { code: "SE", lang: "Svenska" }, { code: "DK", lang: "Dansk" },
      { code: "NO", lang: "Norsk" }, { code: "FI", lang: "Suomi" }, { code: "LT", lang: "Lietuvių" }, { code: "LV", lang: "Latviešu" },
      { code: "EE", lang: "Eesti" }, { code: "HR", lang: "Hrvatski" }, { code: "SI", lang: "Slovenščina" }, { code: "BG", lang: "Български" },
      { code: "UA", lang: "Українська" }, { code: "RU", lang: "Русский" },
    ],
  },
  pains: {
    title: isEN ? "Why agencies burn nights before events" : "Dlaczego agencje palą noce przed eventami",
    items: [
      {
        metric: "30–50%",
        heading: isEN ? "premium when you don't know the local market" : "premia gdy nie znasz lokalnego rynku",
        body: isEN ? "First-time city = no contacts. You pay tourist prices or risk unvetted suppliers with unverifiable references." : "Pierwszy raz w mieście = brak kontaktów. Płacisz ceny turystyczne albo ryzykujesz niezweryfikowanych dostawców.",
        icon: MapPin,
      },
      {
        metric: "5× RFQs",
        heading: isEN ? "juggled across 5 separate spreadsheets" : "żonglowane w 5 osobnych arkuszach",
        body: isEN ? "Catering, AV, scenography, staff, gadgets — five pipelines in parallel. Excel melts; nothing stays in sync." : "Catering, AV, scenografia, obsługa, gadżety — pięć pipeline'ów równolegle. Excel się topi; nic nie jest zsynchronizowane.",
        icon: Zap,
      },
      {
        metric: "3–4 weeks",
        heading: isEN ? "standard RFQ cycle — you don't have them" : "standardowy cykl RFQ — których nie masz",
        body: isEN ? "Event is in 14 days. Cutting the cycle means either picking known vendors or skipping alternatives that would save 20%." : "Event za 14 dni. Skrócenie cyklu oznacza albo wybór znanych vendorów albo pominięcie alternatyw oszczędzających 20%.",
        icon: Clock,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — global events agency" : "Scenariusz ilustracyjny — globalna agencja eventowa",
    title: isEN ? "40 local vendors for a 2,000-person tech conference in Berlin — sourced in 2 days" : "40 lokalnych dostawców na konferencję tech dla 2000 osób w Berlinie — w 2 dni",
    body: isEN
      ? "Organizing a conference in a new city without any local contacts, the agency needed catering, AV and on-site branding vendors fast. Procurea ran parallel campaigns in German across Berlin directories and returned qualified local vendors with verified contacts and references within 48 hours."
      : "Organizując konferencję w nowym mieście bez żadnych lokalnych kontaktów, agencja potrzebowała dostawców cateringu, AV i brandingu on-site szybko. Procurea uruchomiła równoległe kampanie po niemiecku w katalogach berlińskich i w 48 godzin zwróciła zakwalifikowanych lokalnych vendorów ze zweryfikowanymi kontaktami i referencjami.",
    highlights: isEN
      ? [
          { v: "2 days", l: "Brief → shortlist" },
          { v: "4 tracks", l: "Parallel campaigns" },
          { v: "German", l: "Outreach language" },
          { v: "€0", l: "Travel to scout" },
        ]
      : [
          { v: "2 dni", l: "Brief → shortlista" },
          { v: "4 tracki", l: "Równoległe kampanie" },
          { v: "Niemiecki", l: "Język outreach" },
          { v: "0 zł", l: "Dojazdy na rekonesans" },
        ],
  },
  faq: {
    title: isEN ? "Questions from event producers" : "Pytania od producentów eventów",
    items: isEN
      ? [
          { q: "Do you actually translate outreach into the local language?", a: "Yes. RFQs and follow-ups go out in the vendor's local language (automated, reviewed by our system). Vendors reply in their language via the Supplier Portal and offers are translated back to your working language with context preserved." },
          { q: "Can I run catering, AV and scenography as one campaign?", a: "You run them as parallel campaigns under one event project. Each has its own template, vendor pool and timeline, but you see them on one board and can award across categories without leaving the tool." },
          { q: "What about last-minute emergencies — event in 5 days?", a: "Shortlists return in 20–60 minutes. If you have 5 days, we can have offers in 3 and award in 4. The compressed-timeline flow drops follow-up delays and escalates non-responders faster." },
          { q: "Do you cover experiential / brand activations / popup stores?", a: "Yes. Anything with suppliers, venues and vendors works. We have active campaigns for conferences, trade shows, brand activations, popup retail and product launches." },
          { q: "What happens to the vendors after the event?", a: "They stay in your Supplier Database with scores, campaign history and contact verification date. Re-running a campaign in the same city in 3 months takes two clicks." },
        ]
      : [
          { q: "Czy faktycznie tłumaczycie outreach na lokalny język?", a: "Tak. RFQ i follow-upy wychodzą w lokalnym języku vendora (automatycznie, zrewidowane przez nasz system). Vendorzy odpowiadają w swoim języku przez Supplier Portal, a oferty tłumaczą się z powrotem z zachowaniem kontekstu." },
          { q: "Czy mogę prowadzić catering, AV i scenografię jako jedną kampanię?", a: "Prowadzisz je jako równoległe kampanie pod jednym projektem eventowym. Każda ma swój template, pulę vendorów i timeline, ale widzisz je na jednym boardzie i awardujesz cross-kategoriowo bez wychodzenia z narzędzia." },
          { q: "A co z last-minute — event za 5 dni?", a: "Shortlisty wracają w 20–60 minut. Jeśli masz 5 dni, możemy mieć oferty w 3 i award w 4. Flow ze skróconą linią czasu wycina opóźnienia follow-upów i eskaluje nierespondentów szybciej." },
          { q: "Obsługujecie experiential / brand activations / popup stores?", a: "Tak. Wszystko z dostawcami, venue i vendorami działa. Mamy aktywne kampanie dla konferencji, targów, brand activations, popup retail i product launches." },
          { q: "Co dzieje się z vendorami po evencie?", a: "Zostają w Supplier Database z ocenami, historią kampanii i datą weryfikacji kontaktu. Ponowny run kampanii w tym samym mieście za 3 miesiące to dwa kliknięcia." },
        ],
  },
  cta: {
    title: isEN ? "Event in 2 weeks? Start now." : "Event za 2 tygodnie? Zacznij teraz.",
    body: isEN ? "Drop in your brief and city. Your first shortlist lands in your inbox within an hour." : "Wrzuć brief i miasto. Pierwsza shortlista ląduje w Twoim inboxie w godzinę.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", ring: "ring-primary/30" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", ring: "ring-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", ring: "ring-rose-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", ring: "ring-sky-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500", ring: "ring-orange-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", ring: "ring-violet-200" },
  red: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500", ring: "ring-red-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", ring: "ring-emerald-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", bar: "bg-teal-500", ring: "ring-teal-200" },
}

export function EventsIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-fuchsia-50/40 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.08] blur-[120px] bg-fuchsia-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.06] blur-[120px] bg-orange-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-100 border border-fuchsia-200 text-[11px] font-bold text-fuchsia-800 uppercase tracking-wider mb-5">
                  <PartyPopper className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_events_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_events_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_events#calendar`} onClick={() => trackCtaClick("industry_events_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              {/* Hero visual — countdown card */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-100/60 to-orange-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t.countdown.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-baseline gap-3 mb-6">
                        <div className="text-6xl font-extrabold text-slate-900 tabular-nums">{t.countdown.days}</div>
                        <div className="text-sm text-slate-500">{t.countdown.daysLabel}</div>
                      </div>
                      <div className="space-y-2.5">
                        {t.countdown.phases.map((p, i) => (
                          <motion.div
                            key={p.day}
                            initial={{ opacity: 0, x: -6 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <div className="font-mono text-[10px] font-bold text-slate-500 w-9">{p.day}</div>
                            <div className={`h-2 rounded-full flex-1 relative overflow-hidden bg-slate-100`}>
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(i + 1) * 25}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
                                className={`h-full ${p.color} rounded-full`}
                              />
                            </div>
                            <span className="text-xs text-slate-700 font-medium">{p.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden">
              {t.stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white p-5">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CITIES */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-3">
                  <MapPin className="h-3 w-3" />
                  {isEN ? "Coverage" : "Pokrycie"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.cities.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.cities.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {t.cities.cities.map((c, i) => {
                const tone = toneMap[c.tone] || toneMap.primary
                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl" aria-hidden>{c.flag}</span>
                      <span className={`inline-flex h-2 w-2 rounded-full ${tone.bar} ring-4 ring-white relative`}>
                        <span className={`absolute inset-0 rounded-full ${tone.bar} opacity-40 animate-ping`} />
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className={`font-bold ${tone.text}`}>{c.vendors}</span> {isEN ? "vendors" : "vendorów"}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PARALLEL CAMPAIGNS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Zap className="h-3 w-3" />
                  {isEN ? "Parallel campaigns" : "Równoległe kampanie"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.parallel.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.parallel.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 text-xs">
                <span className="font-semibold text-slate-700">{isEN ? "Event: Tech Conf Berlin 2026" : "Event: Tech Conf Berlin 2026"}</span>
                <span className="text-slate-500">{isEN ? "5 parallel tracks" : "5 równoległych tracków"}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {t.parallel.tracks.map((tr, i) => {
                  const tone = toneMap[tr.tone] || toneMap.primary
                  return (
                    <motion.div
                      key={tr.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-4 md:p-5 hover:bg-slate-50/40 transition-colors"
                    >
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}>
                        <tr.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-slate-900">{tr.name}</span>
                          <span className="text-[11px] text-slate-500">{tr.vendors} {isEN ? "bidders" : "bidderów"}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${tr.progress}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }} className={`h-full ${tone.bar}`} />
                        </div>
                      </div>
                      <div className="hidden md:block text-[11px] font-bold tabular-nums text-slate-700">{tr.progress}%</div>
                      <div className={`text-[11px] font-medium ${tone.text} ${tone.bg} px-2.5 py-1 rounded-full whitespace-nowrap`}>{tr.status}</div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* LANGUAGES */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-[11px] font-bold text-violet-800 uppercase tracking-wider mb-3">
                  <Languages className="h-3 w-3" />
                  {isEN ? "Languages" : "Języki"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.languages.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.languages.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="flex flex-wrap gap-2">
              {t.languages.chips.map((l, i) => (
                <motion.div
                  key={l.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                >
                  <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">{l.code}</span>
                  <span className="text-xs font-medium text-slate-700">{l.lang}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PAINS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="relative rounded-2xl overflow-hidden mb-12 bg-slate-100 shadow-xl">
                <div className="relative aspect-[16/10] md:aspect-[21/9] lg:aspect-[24/8]">
                  <img
                    src="/industries/events.jpg"
                    alt={isEN ? "Stressed event coordinator calling last-minute vendors" : "Zestresowana menedżerka eventów dzwoniąca do dostawców w ostatniej chwili"}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/55 to-slate-950/15" />
                  <div className="absolute inset-0 flex items-end p-6 sm:p-10 md:p-14">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]">{t.pains.title}</h2>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <div className="grid md:grid-cols-3 gap-5">
              {t.pains.items.map((p, i) => (
                <motion.div key={p.heading} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-fuchsia-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-extrabold text-fuchsia-700 tabular-nums">{p.metric}</div>
                    </div>
                    <h3 className="text-base font-bold mb-2 leading-snug">{p.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION BANNER */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="relative overflow-hidden rounded-3xl aspect-[21/9] sm:aspect-[21/8]">
                <img src="/industries/events-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'Suppliers locked. Event on schedule.' : 'Dostawcy potwierdzeni. Event zgodnie z planem.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* RELATED CONTENT (replaces retired case study) */}
        <IndustryRelatedResources industrySlug="eventy" tone="fuchsia" />

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{t.faq.title}</h2>
            </RevealOnScroll>
            <div className="space-y-3">
              {t.faq.items.map((item, i) => (
                <motion.details key={item.q} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group rounded-2xl border border-slate-200 bg-white hover:border-primary/30 transition-colors">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                    <span className="text-sm md:text-base font-semibold text-slate-900">{item.q}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-rose-500 to-orange-400 text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-white pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_events_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_events_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-fuchsia-700 hover:bg-rose-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_events#calendar`} onClick={() => trackCtaClick("industry_events_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
                  {t.cta.secondary}
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
