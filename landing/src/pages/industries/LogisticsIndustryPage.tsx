import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Truck,
  Package,
  Warehouse,
  Radar,
  Clock,
  MapPin,
  Sparkles,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Globe,
  Box,
  Route,
  Zap,
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const t = {
  hero: {
    badge: isEN ? "Logistics & supply chain" : "Logistyka & supply chain",
    title: isEN ? "Supplier sourcing for fleets, warehouses and 3PL — across every border your trucks cross" : "Sourcing dostawców dla flot, magazynów i 3PL — na każdej granicy, którą przekraczają Twoje ciężarówki",
    subtitle: isEN
      ? "Emergency fleet parts in hours, warehouse equipment tenders in days, 3PL RFQs with SLA scorecards. Procurea covers niche categories with few obvious vendors — exactly where your team has no time to dig."
      : "Awaryjne części do floty w godzinach, tendery sprzętu magazynowego w dni, RFQ 3PL ze scorecardem SLA. Procurea pokrywa niszowe kategorie z kilkoma oczywistymi vendorami — dokładnie tam gdzie Twój zespół nie ma czasu kopać.",
    primary: isEN ? "Start a sourcing campaign" : "Rozpocznij kampanię sourcingu",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { value: "−40%", label: isEN ? "spare-parts lead time" : "skrócony lead time części", detail: isEN ? "cross-border sourcing network" : "sieć cross-border" },
    { value: "−12%", label: isEN ? "on brake & suspension spend" : "na wydatkach hamulce & zawieszenie", detail: isEN ? "Via competitive RFQ" : "Przez konkurencyjne RFQ" },
    { value: "800+", label: isEN ? "fleet supported in scenarios" : "pojazdów w scenariuszach", detail: isEN ? "across 5 countries" : "w 5 krajach" },
    { value: "4h", label: isEN ? "emergency parts shortlist" : "shortlista awaryjna części", detail: isEN ? "from brief to vendor calls" : "od briefu do kontaktów z vendorem" },
  ],
  // Emergency parts radar
  radar: {
    title: isEN ? "Emergency fleet parts — radar, not a phone marathon" : "Awaryjne części do floty — radar, nie maraton telefonów",
    subtitle: isEN
      ? "A truck is down in Lyon at 16:00. You need a compatible brake calliper by 09:00 tomorrow. Procurea runs a cross-border scan and hands you vendors with stock, distance and delivery window."
      : "Ciężarówka stoi w Lyonie o 16:00. Potrzebujesz kompatybilnego zacisku hamulcowego na 09:00 jutro. Procurea uruchamia scan cross-border i podaje vendorów z towarem, odległością i oknem dostawy.",
    hits: isEN
      ? [
          { vendor: "TruckParts EU GmbH", city: "Lyon, FR", flag: "🇫🇷", km: "14 km", stock: "12 in stock", eta: "Today 19:00", tone: "emerald" },
          { vendor: "Pièces Automobiles RH", city: "Villeurbanne, FR", flag: "🇫🇷", km: "21 km", stock: "4 in stock", eta: "Today 20:30", tone: "emerald" },
          { vendor: "Euro-Fleet Parts SA", city: "Geneva, CH", flag: "🇨🇭", km: "146 km", stock: "8 in stock", eta: "Tomorrow 07:45", tone: "sky" },
          { vendor: "Camion Ricambi Srl", city: "Turin, IT", flag: "🇮🇹", km: "216 km", stock: "15 in stock", eta: "Tomorrow 09:15", tone: "amber" },
        ]
      : [
          { vendor: "TruckParts EU GmbH", city: "Lyon, FR", flag: "🇫🇷", km: "14 km", stock: "12 w magazynie", eta: "Dziś 19:00", tone: "emerald" },
          { vendor: "Pièces Automobiles RH", city: "Villeurbanne, FR", flag: "🇫🇷", km: "21 km", stock: "4 w magazynie", eta: "Dziś 20:30", tone: "emerald" },
          { vendor: "Euro-Fleet Parts SA", city: "Geneva, CH", flag: "🇨🇭", km: "146 km", stock: "8 w magazynie", eta: "Jutro 07:45", tone: "sky" },
          { vendor: "Camion Ricambi Srl", city: "Turin, IT", flag: "🇮🇹", km: "216 km", stock: "15 w magazynie", eta: "Jutro 09:15", tone: "amber" },
        ],
    query: isEN ? "Brake calliper — Volvo FH 2020 — need by 09:00" : "Zacisk hamulcowy — Volvo FH 2020 — potrzebny do 09:00",
  },
  // Emergency flow timeline (hour-by-hour)
  timeline: {
    title: isEN ? "The first 4 hours of an emergency part sourcing" : "Pierwsze 4 godziny awaryjnego sourcingu części",
    steps: isEN
      ? [
          { time: "00:00", title: "Issue reported", body: "Fleet ops drops part number and urgency into Procurea.", tone: "rose" },
          { time: "00:15", title: "Cross-border scan", body: "AI pings parts distributors in a 300 km radius, filtered by stock availability flags.", tone: "amber" },
          { time: "01:00", title: "Offers arriving", body: "Price, stock, delivery window. Portal collects responses as they come in.", tone: "sky" },
          { time: "02:30", title: "Shortlist ready", body: "3–5 viable vendors ranked by ETA vs. SLA requirement.", tone: "primary" },
          { time: "04:00", title: "PO issued", body: "Winning vendor accepts PO through portal. Tracking link shared with fleet ops.", tone: "emerald" },
        ]
      : [
          { time: "00:00", title: "Zgłoszenie problemu", body: "Fleet ops wrzuca numer części i pilność do Procurea.", tone: "rose" },
          { time: "00:15", title: "Scan cross-border", body: "AI pinguje dystrybutorów części w promieniu 300 km, filtrowane po flagach dostępności.", tone: "amber" },
          { time: "01:00", title: "Oferty przychodzą", body: "Cena, stan magazynu, okno dostawy. Portal zbiera odpowiedzi napływające.", tone: "sky" },
          { time: "02:30", title: "Shortlista gotowa", body: "3–5 vendorów rankowanych po ETA vs. wymaganie SLA.", tone: "primary" },
          { time: "04:00", title: "PO wysłane", body: "Zwycięski vendor akceptuje PO przez portal. Link tracking dla fleet ops.", tone: "emerald" },
        ],
  },
  // 3PL scorecard
  scorecard: {
    title: isEN ? "3PL RFQ scorecard — ranked on what actually matters" : "Scorecard RFQ 3PL — ranking po tym co faktycznie ma znaczenie",
    subtitle: isEN
      ? "Stop comparing 3PL providers on hourly rate alone. Procurea's structured RFQ pulls SLA, tech stack, locations and pricing into one weighted table."
      : "Przestań porównywać dostawców 3PL tylko po stawce godzinowej. Ustrukturyzowane RFQ Procurea wyciąga SLA, stack technologiczny, lokalizacje i ceny do jednej ważonej tabeli.",
    header: isEN ? ["Provider", "SLA", "Locations", "Tech", "€/pallet", "Score"] : ["Dostawca", "SLA", "Lokalizacje", "Tech", "€/paleta", "Score"],
    rows: [
      { name: "Alpha Logistics 3PL", sla: "98.5%", locs: "14", tech: "SAP + TMS", price: "€8.40", score: 91, highlight: true },
      { name: "EuroWare Services", sla: "97.2%", locs: "9", tech: "TMS only", price: "€7.90", score: 84 },
      { name: "FleetLog Partners", sla: "96.1%", locs: "22", tech: "SAP + TMS + API", price: "€9.10", score: 88 },
      { name: "CentralPL Storage", sla: "95.5%", locs: "6", tech: "Excel (no API)", price: "€6.80", score: 68 },
    ],
  },
  // Service categories
  categories: {
    title: isEN ? "Four lanes of logistics procurement" : "Cztery lanes procurement logistycznego",
    items: isEN
      ? [
          { icon: Warehouse, name: "Warehouse equipment", examples: "Racking, conveyors, AGVs, pallet jacks, MHE" },
          { icon: Truck, name: "Fleet parts & MRO", examples: "Spare parts, tyres, lubricants, body repairs" },
          { icon: Package, name: "3PL services", examples: "Storage, pick-pack, cross-dock, value-add" },
          { icon: Route, name: "Last-mile & final", examples: "Urban fleets, couriers, reverse logistics" },
        ]
      : [
          { icon: Warehouse, name: "Sprzęt magazynowy", examples: "Regały, przenośniki, AGV, wózki, MHE" },
          { icon: Truck, name: "Części do floty & MRO", examples: "Zamienne, opony, smary, blacharka" },
          { icon: Package, name: "Usługi 3PL", examples: "Magazynowanie, pick-pack, cross-dock, value-add" },
          { icon: Route, name: "Last-mile & final", examples: "Floty miejskie, kurierzy, logistyka zwrotna" },
        ],
  },
  pains: {
    title: isEN ? "Where logistics procurement leaks money" : "Gdzie procurement logistyczny traci pieniądze",
    items: [
      {
        metric: "€1,500/h",
        heading: isEN ? "per truck-down hour adds up fast" : "per godzina przestoju ciężarówki się sumuje",
        body: isEN ? "Fleet ops quote their own premium prices under pressure. A pre-qualified cross-border network cuts both price and downtime." : "Fleet ops kwotuje własne premie pod presją. Pre-zakwalifikowana sieć cross-border ścina cenę i downtime.",
        icon: AlertCircle,
      },
      {
        metric: "3 vendors",
        heading: isEN ? "quoted on the average 3PL tender" : "kwotowanych na średnim tenderze 3PL",
        body: isEN ? "When 3PLs know they're only competing with 2 others, pricing and service levels drift. 10+ bidders changes the math." : "Gdy 3PLe wiedzą że konkurują z 2 innymi, ceny i service levels dryfują. 10+ bidderów zmienia matematykę.",
        icon: Gauge,
      },
      {
        metric: "6 weeks",
        heading: isEN ? "to evaluate a warehouse equipment CAPEX" : "na ocenę CAPEX sprzętu magazynowego",
        body: isEN ? "Racking systems, conveyors, AGVs — niche categories where most buyers rely on the first vendor to reach out. Broader RFQ cuts cost and shortens delivery." : "Regały, przenośniki, AGV — niszowe kategorie gdzie większość kupujących polega na pierwszym vendorze który zadzwoni. Szersze RFQ ścina koszt i skraca dostawę.",
        icon: Warehouse,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — European logistics operator" : "Scenariusz ilustracyjny — europejski operator logistyczny",
    title: isEN ? "Fleet spare-parts lead time cut 40% across 5 countries" : "Lead time części do floty skrócony 40% w 5 krajach",
    body: isEN
      ? "Managing 800+ vehicles across 5 countries, the operator used Procurea to build a cross-border spare parts supplier network. AI-sourced alternatives — qualified on OEM compatibility and stock availability — reduced average lead time from 5 days to 3 days, with 12% cost savings on brake and suspension components."
      : "Zarządzając flotą 800+ pojazdów w 5 krajach, operator użył Procurea do zbudowania cross-border sieci dostawców części zamiennych. Alternatywy znalezione przez AI — zakwalifikowane po kompatybilności OEM i dostępności — skróciły średni lead time z 5 do 3 dni, z 12% oszczędnościami na hamulcach i zawieszeniu.",
    highlights: isEN
      ? [
          { v: "800+", l: "Vehicles supported" },
          { v: "5", l: "Countries" },
          { v: "−40%", l: "Lead-time cut" },
          { v: "−12%", l: "Parts spend" },
        ]
      : [
          { v: "800+", l: "Pojazdów" },
          { v: "5", l: "Krajów" },
          { v: "−40%", l: "Skrócony lead" },
          { v: "−12%", l: "Wydatki na części" },
        ],
  },
  faq: {
    title: isEN ? "Questions from logistics procurement" : "Pytania od procurement logistycznego",
    items: isEN
      ? [
          { q: "Can you actually find compatible OEM and aftermarket parts?", a: "Yes — part number, OEM equivalence and aftermarket cross-reference are inputs to the search. Bidders confirm compatibility in their offer; you see the match alongside price and stock." },
          { q: "What about customs and duty for cross-border emergency parts?", a: "Intra-EU is duty-free; for CH / UK / non-EU we flag likely duty implications at screening. Bidders quote DDP or EXW so you can see total landed." },
          { q: "Does Procurea integrate with our TMS or fleet system?", a: "Via API — qualified suppliers can push into your TMS as approved vendor records. Some customers prefer keeping Procurea as the sourcing layer and using it manually for one-off RFQs." },
          { q: "How do you handle warehouse equipment CAPEX with long lead times?", a: "Same structured RFQ — we add install, commissioning, training and warranty scope as comparison fields. Lead time is a first-class column, not a footnote." },
          { q: "Do you cover reverse logistics and returns?", a: "Yes — 3PL providers with returns handling, reverse flow processing and restocking services all run through the platform as one service category." },
        ]
      : [
          { q: "Czy faktycznie znajdujecie kompatybilne części OEM i aftermarket?", a: "Tak — numer części, ekwiwalencja OEM i cross-reference aftermarket to inputy do searchu. Bidderzy potwierdzają kompatybilność w ofercie; widzisz match obok ceny i stanu." },
          { q: "A cło i podatki dla awaryjnych części cross-border?", a: "Wewnątrz UE bez cła; dla CH / UK / poza-UE flagujemy prawdopodobne implikacje celne na screeningu. Bidderzy kwotują DDP lub EXW żebyś widział landed total." },
          { q: "Czy Procurea integruje się z naszym TMS lub systemem floty?", a: "Przez API — zakwalifikowani dostawcy pushują do TMS jako approved vendor records. Niektórzy klienci wolą trzymać Procurea jako warstwę sourcingu i używać manualnie dla one-off RFQ." },
          { q: "Jak obsługujecie CAPEX sprzętu magazynowego z długim lead time?", a: "Ten sam ustrukturyzowany RFQ — dodajemy instalację, commissioning, szkolenia i gwarancje jako pola porównania. Lead time to first-class kolumna, nie przypis." },
          { q: "Obsługujecie reverse logistics i zwroty?", a: "Tak — dostawcy 3PL z obsługą zwrotów, reverse flow processing i restockingiem przechodzą przez platformę jako jedna kategoria usługi." },
        ],
  },
  cta: {
    title: isEN ? "Got a truck down right now?" : "Masz ciężarówkę w postoju?",
    body: isEN ? "Start a campaign now — we'll map vendors with stock in your corridor within the hour." : "Rozpocznij kampanię teraz — zmapujemy vendorów z towarem w Twoim korytarzu w godzinę.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
}

export function LogisticsIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-indigo-500 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-amber-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-5">
                  <Truck className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_logistics_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_logistics_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_logistics#calendar`} onClick={() => trackCtaClick("industry_logistics_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              {/* Hero visual: radar scanner */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-100/60 to-amber-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/70 font-medium flex items-center gap-1.5">
                        <Radar className="h-3.5 w-3.5" />
                        {isEN ? "Emergency parts radar" : "Radar awaryjnych części"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isEN ? "Scanning" : "Skanowanie"}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5">{isEN ? "Query" : "Zapytanie"}</div>
                      <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-emerald-300 mb-5">{t.radar.query}</div>
                      <div className="space-y-2">
                        {t.radar.hits.map((h, i) => {
                          const tone = toneMap[h.tone]
                          return (
                            <motion.div
                              key={h.vendor}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + i * 0.12 }}
                              className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-2.5"
                            >
                              <span className="text-xl" aria-hidden>{h.flag}</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{h.vendor}</div>
                                <div className="text-[10px] text-white/60">{h.city} • {h.km}</div>
                              </div>
                              <div className="text-right">
                                <div className={`text-[10px] font-bold ${tone.text.replace("text-", "text-").replace("-700", "-300")}`}>{h.eta}</div>
                                <div className="text-[9px] text-white/60">{h.stock}</div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

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

        {/* EMERGENCY TIMELINE */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-3">
                  <Zap className="h-3 w-3" />
                  {isEN ? "Emergency flow" : "Flow awaryjny"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.timeline.title}</h2>
              </div>
            </RevealOnScroll>

            <div className="relative">
              <div className="hidden lg:block absolute top-7 left-[6%] right-[6%] h-0.5 bg-gradient-to-r from-rose-300 via-amber-300 via-sky-300 to-emerald-300" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {t.timeline.steps.map((s, i) => {
                  const tone = toneMap[s.tone]
                  return (
                    <motion.div
                      key={s.time}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-center mb-4">
                        <div className={`h-14 w-14 rounded-2xl ${tone.bg} ring-4 ring-white flex items-center justify-center ${tone.text} font-mono text-xs font-bold shadow-sm`}>{s.time}</div>
                      </div>
                      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-sm font-bold mb-1.5">{s.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{s.body}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3PL SCORECARD */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Gauge className="h-3 w-3" />
                  {isEN ? "3PL comparison" : "Porównanie 3PL"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.scorecard.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.scorecard.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        {t.scorecard.header.map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.scorecard.rows.map((r) => (
                        <tr key={r.name} className={`border-b border-slate-50 ${r.highlight ? "bg-emerald-50/50" : "hover:bg-slate-50/40"} transition-colors`}>
                          <td className="px-5 py-3 font-semibold text-slate-900">{r.name} {r.highlight && <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">{isEN ? "Best" : "Najlepszy"}</span>}</td>
                          <td className="px-5 py-3 tabular-nums text-slate-700">{r.sla}</td>
                          <td className="px-5 py-3 tabular-nums text-slate-700">{r.locs}</td>
                          <td className="px-5 py-3 text-slate-700">{r.tech}</td>
                          <td className="px-5 py-3 tabular-nums text-slate-700">{r.price}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${r.score >= 85 ? "bg-emerald-500" : r.score >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.score}%` }} />
                              </div>
                              <span className="text-xs font-bold tabular-nums text-slate-900">{r.score}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.categories.title}</h2>
            </RevealOnScroll>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {t.categories.items.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold mb-1">{c.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.examples}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PAINS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 max-w-3xl">{t.pains.title}</h2>
            </RevealOnScroll>
            <div className="grid md:grid-cols-3 gap-5">
              {t.pains.items.map((p, i) => (
                <motion.div key={p.heading} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-extrabold text-indigo-800 tabular-nums">{p.metric}</div>
                    </div>
                    <h3 className="text-base font-bold mb-2 leading-snug">{p.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CASE STUDY */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="rounded-3xl bg-gradient-to-br from-indigo-800 to-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.15] blur-[100px] bg-amber-300 pointer-events-none" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold text-white uppercase tracking-[0.15em] mb-4">
                    <Sparkles className="h-3 w-3" />
                    {t.caseStudy.badge}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{t.caseStudy.title}</h2>
                  <p className="text-white/85 leading-relaxed max-w-2xl mb-6">{t.caseStudy.body}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/15">
                    {t.caseStudy.highlights.map((x) => (
                      <div key={x.l}>
                        <div className="text-2xl font-extrabold tabular-nums">{x.v}</div>
                        <div className="text-xs text-white/70 mt-0.5">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-slate-800 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-amber-300 pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_logistics_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_logistics_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_logistics#calendar`} onClick={() => trackCtaClick("industry_logistics_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
