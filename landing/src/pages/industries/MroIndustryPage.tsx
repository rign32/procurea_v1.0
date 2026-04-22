import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Wrench,
  Gauge,
  AlertTriangle,
  Cog,
  Sparkles,
  Layers3,
  PauseCircle,
  CheckCircle2,
  TrendingDown,
  Workflow,
  HardDrive,
  Settings,
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
const APP_URL = `${APP_BASE}/campaigns/new?industry=mro&mode=mixed`
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const t = {
  hero: {
    badge: isEN ? "MRO & plant maintenance" : "MRO & utrzymanie ruchu",
    title: isEN ? "MRO sourcing — build backup vendor pools before the line goes down" : "Sourcing MRO — zbuduj pule backup zanim linia stanie",
    subtitle: isEN
      ? "Find and pre-qualify alternative vendors for bearings, seals, filters, motors, HVAC — so a sole-source failure doesn't turn into an emergency premium. Procurea's AI pipeline discovers authorized OEM distributors and aftermarket alternatives across 26 languages, in hours."
      : "Znajdź i pre-zakwalifikuj alternatywnych dostawców dla łożysk, uszczelnień, filtrów, silników, HVAC — żeby awaria sole-source'a nie zamieniła się w premię awaryjną. Pipeline AI Procurea odkrywa autoryzowanych dystrybutorów OEM i alternatywy aftermarket w 26 językach, w godzinach.",
    primary: isEN ? "Start a backup-vendor campaign" : "Rozpocznij kampanię backup vendorów",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { value: "Hours", label: isEN ? "to discover alternatives" : "na odkrycie alternatyw", detail: isEN ? "vs. weeks of manual search" : "vs. tygodnie ręcznego szukania" },
    { value: "30–50%", label: isEN ? "emergency premium avoided" : "premia awaryjna uniknięta", detail: isEN ? "with pre-qualified backups" : "z pre-zakwalifikowanymi backupami" },
    { value: "26", label: isEN ? "languages searched" : "języków wyszukiwania", detail: isEN ? "reaches EU + global aftermarket" : "sięga UE + globalny aftermarket" },
    { value: "48h", label: isEN ? "to activate a backup vendor" : "do aktywacji backup vendora", detail: isEN ? "vs. weeks from cold start" : "vs. tygodnie od zera" },
  ],
  // Downtime cost calculator
  downtime: {
    title: isEN ? "What unplanned downtime actually costs — per hour, per line" : "Ile naprawdę kosztuje nieplanowany przestój — na godzinę, na linię",
    subtitle: isEN
      ? "Procurement buys time, not just parts. Every hour you keep a critical line running is worth more than any unit-price discount."
      : "Procurement kupuje czas, nie tylko części. Każda godzina działania krytycznej linii warta jest więcej niż jakikolwiek rabat jednostkowy.",
    lines: isEN
      ? [
          { name: "Pharma filling line", cost: "€18,500/h", note: "Regulated, revalidation after stop" },
          { name: "FMCG high-speed packaging", cost: "€9,800/h", note: "Single-shift recovery window" },
          { name: "Automotive stamping", cost: "€12,400/h", note: "Die change cascades downstream" },
          { name: "Food cold-chain freezer", cost: "€6,200/h", note: "Spoilage risk after 2 hours" },
          { name: "CNC machining cell", cost: "€3,900/h", note: "Operator + amortization" },
        ]
      : [
          { name: "Linia nalewu pharma", cost: "18 500 €/h", note: "Regulowana, rewalidacja po stopie" },
          { name: "FMCG pakowanie high-speed", cost: "9 800 €/h", note: "Okno odzyskania single-shift" },
          { name: "Tłoczenie motoryzacyjne", cost: "12 400 €/h", note: "Wymiana matrycy kaskaduje dalej" },
          { name: "Zamrażarka cold-chain", cost: "6 200 €/h", note: "Ryzyko spoilage po 2h" },
          { name: "Cela CNC", cost: "3 900 €/h", note: "Operator + amortyzacja" },
        ],
    footnote: isEN ? "Illustrative; true cost varies by plant. The point: unit-price chasing while ignoring lead time is false economy." : "Ilustracyjnie; prawdziwy koszt zależy od zakładu. Pointa: gonienie za ceną jednostkową przy ignorowaniu lead time to fałszywa oszczędność.",
  },
  // Tail-spend pyramid (ABC analysis)
  pyramid: {
    title: isEN ? "Tail spend is where 80% of your MRO SKUs — and 15–20% of inflation — live" : "Tail spend to miejsce gdzie żyje 80% Twoich SKU MRO — i 15–20% inflacji",
    subtitle: isEN
      ? "A-class parts get attention. B-class parts get half-attention. C-class tail spend gets ordered from whoever picks up the phone. Procurea helps you find competing vendors for the B and C tiers — so you stop ordering from the incumbent by default."
      : "Części A dostają uwagę. Części B połowę uwagi. Tail spend klasy C zamawia się u tego, kto odbierze telefon. Procurea pomaga znaleźć konkurencyjnych dostawców dla B i C — żebyś przestał zamawiać u incumbenta z automatu.",
    tiers: isEN
      ? [
          { class: "A", share: "20% SKUs", spend: "70% spend", note: "Critical, typically sole-source", tone: "rose", width: 35 },
          { class: "B", share: "30% SKUs", spend: "20% spend", note: "Structured annual contracts", tone: "amber", width: 60 },
          { class: "C (tail)", share: "50% SKUs", spend: "10% spend — leakage lives here", note: "Refresh supplier pool with Procurea AI sourcing", tone: "primary", width: 100 },
        ]
      : [
          { class: "A", share: "20% SKU", spend: "70% wydatków", note: "Krytyczne, zwykle sole-source", tone: "rose", width: 35 },
          { class: "B", share: "30% SKU", spend: "20% wydatków", note: "Ustrukturyzowane kontrakty roczne", tone: "amber", width: 60 },
          { class: "C (tail)", share: "50% SKU", spend: "10% wydatków — tu żyje wyciek", note: "Odśwież bazę dostawców przez AI sourcing Procurea", tone: "primary", width: 100 },
        ],
  },
  // OEM compatibility matrix
  compat: {
    title: isEN ? "OEM and aftermarket — both live in the MRO market" : "OEM i aftermarket — oba żyją na rynku MRO",
    subtitle: isEN
      ? "An SKF bearing has several equivalent aftermarket alternatives. A FESTO valve has a few. When you describe a part in plain language, Procurea's AI sourcing finds authorized OEM distributors and aftermarket suppliers — across 26 languages. Your engineering team still decides which equivalents are acceptable for safety-critical lines."
      : "Łożysko SKF ma kilka równoważnych alternatyw aftermarket. Zawór FESTO ma kilka. Gdy opiszesz część językiem naturalnym, AI sourcing Procurea znajduje autoryzowanych dystrybutorów OEM i dostawców aftermarket — w 26 językach. Twój zespół engineering i tak decyduje które odpowiedniki są akceptowalne dla linii safety-critical.",
    header: isEN ? ["OEM part", "Category", "OEM price", "Aftermarket eq.", "Best price"] : ["Część OEM", "Kategoria", "Cena OEM", "Odp. aftermarket", "Najlepsza cena"],
    rows: isEN
      ? [
          { oem: "SKF 6308-2RS1", cat: "Deep groove bearing", oemPrice: "€42", aftermarket: "5 alternatives", best: "€24 (FAG)", delta: "-43%" },
          { oem: "FESTO MFH-5-1/4", cat: "Pneumatic valve", oemPrice: "€118", aftermarket: "3 alternatives", best: "€76 (AirTAC)", delta: "-36%" },
          { oem: "Timken HM212049", cat: "Tapered roller bearing", oemPrice: "€68", aftermarket: "4 alternatives", best: "€39 (NTN)", delta: "-43%" },
          { oem: "Parker 3/8\" R7 hose", cat: "Hydraulic hose", oemPrice: "€14/m", aftermarket: "6 alternatives", best: "€9/m (Gates)", delta: "-36%" },
        ]
      : [
          { oem: "SKF 6308-2RS1", cat: "Łożysko kulkowe", oemPrice: "42 €", aftermarket: "5 alternatyw", best: "24 € (FAG)", delta: "-43%" },
          { oem: "FESTO MFH-5-1/4", cat: "Zawór pneumatyczny", oemPrice: "118 €", aftermarket: "3 alternatywy", best: "76 € (AirTAC)", delta: "-36%" },
          { oem: "Timken HM212049", cat: "Łożysko stożkowe", oemPrice: "68 €", aftermarket: "4 alternatywy", best: "39 € (NTN)", delta: "-43%" },
          { oem: "Parker 3/8\" R7 hose", cat: "Wąż hydrauliczny", oemPrice: "14 €/m", aftermarket: "6 alternatyw", best: "9 €/m (Gates)", delta: "-36%" },
        ],
    note: isEN ? "Illustrative market prices — actual deltas depend on volume, region and distributor. Always validate critical-safety parts with OEM or a notified-body alternative." : "Ilustracyjne ceny rynkowe — realne delty zależą od wolumenu, regionu i dystrybutora. Zawsze waliduj krytyczne części bezpieczeństwa z OEM lub z alternatywą z jednostki notyfikowanej.",
  },
  // Categories
  categories: {
    title: isEN ? "Five MRO lanes Procurea accelerates" : "Pięć lanes MRO, które Procurea przyspiesza",
    items: isEN
      ? [
          { icon: Cog, name: "Bearings & seals", examples: "SKF, FAG, NTN, Timken + aftermarket" },
          { icon: Settings, name: "Electrical & drives", examples: "Motors, VFDs, relays, PLCs" },
          { icon: HardDrive, name: "Pneumatic & hydraulic", examples: "Valves, cylinders, hoses, fittings" },
          { icon: Layers3, name: "Filtration & fluids", examples: "Filters, oils, cutting fluids, degreasers" },
          { icon: Wrench, name: "Maintenance services", examples: "HVAC, calibration, electrical audits" },
        ]
      : [
          { icon: Cog, name: "Łożyska & uszczelki", examples: "SKF, FAG, NTN, Timken + aftermarket" },
          { icon: Settings, name: "Elektryka & napędy", examples: "Silniki, VFD, przekaźniki, PLC" },
          { icon: HardDrive, name: "Pneumatyka & hydraulika", examples: "Zawory, siłowniki, węże, złączki" },
          { icon: Layers3, name: "Filtracja & płyny", examples: "Filtry, oleje, chłodziwa, odtłuszczacze" },
          { icon: Wrench, name: "Usługi maintenance", examples: "HVAC, kalibracja, audyty elektryczne" },
        ],
  },
  pains: {
    title: isEN ? "Why MRO spend always looks flat — until you look harder" : "Dlaczego wydatki MRO zawsze wyglądają płasko — dopóki nie spojrzysz głębiej",
    items: [
      {
        metric: "15–20%",
        heading: isEN ? "inflation hidden in maverick buys" : "inflacja ukryta w maverick buys",
        body: isEN ? "Urgent same-day orders at retail-style markups add up to 15–20% of MRO spend. Structured spot-buy RFQs contain this even under pressure." : "Pilne zamówienia day-of po cenach retail stanowią 15–20% wydatków MRO. Ustrukturyzowane RFQ spot-buy hamują to nawet pod presją.",
        icon: TrendingDown,
      },
      {
        metric: "40%",
        heading: isEN ? "emergency premium on sole-sourced parts" : "premia awaryjna na częściach sole-source",
        body: isEN ? "When the only supplier knows you have no alternative, prices and lead times both slip. 3+ qualified backups change the negotiating posture." : "Gdy jedyny dostawca wie że nie masz alternatywy, ceny i lead time się przesuwają. 3+ zakwalifikowane backupy zmieniają pozycję negocjacyjną.",
        icon: AlertTriangle,
      },
      {
        metric: "5 weeks",
        heading: isEN ? "to qualify a new MRO vendor manually" : "na ręczną kwalifikację nowego vendora MRO",
        body: isEN ? "Emails, certs, samples, first PO — typical MRO onboarding is slow enough that buyers just… don't. Procurea compresses this." : "Maile, certy, sample, pierwsze PO — typowe onboardowanie MRO jest tak wolne że kupujący po prostu… nie robią tego. Procurea to ściska.",
        icon: PauseCircle,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — food processing plant" : "Scenariusz ilustracyjny — zakład przetwórstwa spożywczego",
    title: isEN ? "22% category savings after sourcing alternatives for a sole-source bearing supplier" : "22% oszczędności w kategorii po sourcingu alternatyw dla sole-source dostawcy łożysk",
    body: isEN
      ? "Running 3 production facilities with the same incumbent bearing supplier, the plant used Procurea to find and pre-qualify alternatives. Running separate campaigns per top category (bearings, seals, motors), the team ran structured RFQs on comparable shortlists — surfacing 22% savings on the bearing tender and activating backup vendors across the three sites before the next sole-source emergency."
      : "Prowadząc 3 obiekty produkcyjne z tym samym incumbentem na łożyskach, zakład użył Procurea do znalezienia i pre-kwalifikacji alternatyw. Odpalając osobne kampanie na top kategorie (łożyska, uszczelki, silniki), zespół prowadził ustrukturyzowane RFQ na porównywalnych shortlistach — ujawniając 22% oszczędności na tenderze łożysk i aktywując backup vendorów w 3 obiektach zanim nastąpiła kolejna awaria sole-source.",
    highlights: isEN
      ? [
          { v: "3", l: "Facilities consolidated" },
          { v: "200+", l: "SKUs per site" },
          { v: "22%", l: "Total MRO reduction" },
          { v: "0", l: "Emergency buys Q1" },
        ]
      : [
          { v: "3", l: "Skonsolidowane obiekty" },
          { v: "200+", l: "SKU per zakład" },
          { v: "22%", l: "Redukcja MRO" },
          { v: "0", l: "Zakupów awaryjnych Q1" },
        ],
  },
  faq: {
    title: isEN ? "Questions from maintenance & procurement leads" : "Pytania od szefów maintenance & procurement",
    items: isEN
      ? [
          { q: "Can you handle high-SKU-count tail spend?", a: "Today each campaign targets one category (e.g. 'deep-groove ball bearings in EU'). Teams typically run a series of per-category campaigns. Multi-SKU-per-campaign bundles are on our 2026 roadmap — until then, you run 5–10 parallel campaigns in under an hour." },
          { q: "What about OEM-mandated parts where aftermarket is not allowed?", a: "You tell Procurea what you need in plain language — including 'OEM only'. The AI sourcing pipeline surfaces authorized distributors matching that brief. For interchangeable lines, you can widen the prompt to include aftermarket equivalents; your engineering team decides what's acceptable on the shortlist." },
          { q: "Do you integrate with our CMMS / ERP?", a: "For NetSuite, Dynamics 365 Business Central, QuickBooks, Xero, Sage and 50+ more ERPs — yes, via Merge.dev. Qualified vendors can sync as supplier records. For SAP and Oracle deep-sync, on-prem CMMS or industry-specific systems (Infor, Maximo) — Enterprise Custom builds a dedicated adapter in the SOW." },
          { q: "Can I run an RFQ on a maintenance service contract (e.g. annual HVAC)?", a: "Yes. Maintenance services follow the same structured RFQ with fields for SLA, response time, coverage geography, certifications and hourly/annual rates." },
          { q: "How do you handle critical-safety parts — brake, pressure, lifting?", a: "Screening flags safety-critical categories so you always keep OEM or notified-body-certified alternatives in scope. Procurea surfaces, your engineering team decides what's acceptable." },
        ]
      : [
          { q: "Czy obsługujecie tail spend z wysoką liczbą SKU?", a: "Dziś każda kampania celuje w jedną kategorię (np. 'łożyska kulkowe w UE'). Zespoły zwykle odpalają serię kampanii per-kategoria. Bundle multi-SKU w jednej kampanii są na roadmapie 2026 — na razie odpalasz 5–10 równoległych kampanii w niecałą godzinę." },
          { q: "A części OEM-mandatory gdzie aftermarket nie jest dopuszczony?", a: "Mówisz Procurea czego potrzebujesz językiem naturalnym — w tym 'tylko OEM'. Pipeline AI sourcing wyciąga autoryzowanych dystrybutorów pasujących do briefu. Dla linii wymiennych możesz rozszerzyć prompt o odpowiedniki aftermarket; Twój engineering decyduje co jest akceptowalne na shortliście." },
          { q: "Czy integrujecie się z naszym CMMS / ERP?", a: "Dla NetSuite, Dynamics 365 Business Central, QuickBooks, Xero, Sage i 50+ innych ERP — tak, przez Merge.dev. Zakwalifikowani vendorzy mogą synchronizować się jako rekordy dostawców. Dla deep-sync SAP i Oracle, on-prem CMMS lub systemów branżowych (Infor, Maximo) — Enterprise Custom buduje dedykowany adapter w SOW." },
          { q: "Czy mogę prowadzić RFQ na kontrakt serwisowy (np. roczny HVAC)?", a: "Tak. Usługi maintenance idą tym samym ustrukturyzowanym RFQ z polami SLA, czasu reakcji, zasięgu geograficznego, certyfikacji i stawek godzinowych/rocznych." },
          { q: "Jak radzicie sobie z częściami safety-critical — hamulce, ciśnienie, dźwig?", a: "Screening flaguje kategorie safety-critical żebyś zawsze trzymał OEM lub alternatywy z certyfikatów jednostek notyfikowanych w scope. Procurea wyciąga, Twój engineering decyduje co jest akceptowalne." },
        ],
  },
  cta: {
    title: isEN ? "Start with one tail-spend category" : "Zacznij od jednej kategorii tail-spend",
    body: isEN ? "Bearings, filters, hoses — any category where you know there's 15% hiding. First tender closes in a week." : "Łożyska, filtry, węże — jakakolwiek kategoria gdzie wiesz że chowa się 15%. Pierwszy tender zamyka się w tydzień.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
}

export function MroIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-stone-50/60 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-amber-500 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-slate-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-5">
                  <Wrench className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_mro_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_mro_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_mro#calendar`} onClick={() => trackCtaClick("industry_mro_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-100/60 to-slate-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5" />
                        {isEN ? "Tail-spend dashboard" : "Dashboard tail-spend"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">Q2</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">{isEN ? "SKUs consolidated" : "Skonsolidowane SKU"}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold tabular-nums text-slate-900">847</span>
                          <span className="text-xs text-emerald-600 font-semibold">+312 vs Q1</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">{isEN ? "Tail-spend savings YTD" : "Oszczędności tail YTD"}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold tabular-nums text-emerald-600">€412K</span>
                          <span className="text-xs text-slate-500">22% avg</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: "68%" }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isEN ? "Emergency buys" : "Zakupy awar."}</div>
                          <div className="text-lg font-extrabold text-slate-900">0</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isEN ? "Backup vendors" : "Backup vendorów"}</div>
                          <div className="text-lg font-extrabold text-slate-900">38</div>
                        </div>
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

        {/* DOWNTIME COST */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-3">
                  <PauseCircle className="h-3 w-3" />
                  {isEN ? "Downtime cost" : "Koszt przestoju"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.downtime.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.downtime.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {t.downtime.lines.map((l, i) => (
                  <motion.div
                    key={l.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] items-center gap-5 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">{l.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 hidden md:block">{l.note}</div>
                    </div>
                    <div className="hidden md:block text-[11px] text-slate-500 italic">{l.note}</div>
                    <div className="text-xl font-extrabold tabular-nums text-rose-600">{l.cost}</div>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-[11px] italic text-slate-500">{t.downtime.footnote}</div>
            </div>
          </div>
        </section>

        {/* PYRAMID / ABC */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Workflow className="h-3 w-3" />
                  {isEN ? "Tail spend" : "Tail spend"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.pyramid.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.pyramid.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="max-w-3xl mx-auto space-y-3">
              {t.pyramid.tiers.map((tier, i) => {
                const tone = toneMap[tier.tone]
                return (
                  <motion.div
                    key={tier.class}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    style={{ maxWidth: `${tier.width}%` }}
                    className={`rounded-2xl border ${tone.border} ${tone.bg} p-5 ml-auto mr-0`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white ${tone.text} text-lg font-extrabold shadow-sm`}>{tier.class}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{tier.share}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-sm font-semibold text-slate-700">{tier.spend}</span>
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed">{tier.note}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* OEM COMPATIBILITY MATRIX */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <CheckCircle2 className="h-3 w-3" />
                  {isEN ? "OEM ↔ aftermarket" : "OEM ↔ aftermarket"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.compat.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.compat.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        {t.compat.header.map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                        ))}
                        <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.compat.rows.map((r) => (
                        <tr key={r.oem} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">{r.oem}</td>
                          <td className="px-5 py-3 text-slate-700 text-xs">{r.cat}</td>
                          <td className="px-5 py-3 tabular-nums text-slate-700">{r.oemPrice}</td>
                          <td className="px-5 py-3 text-slate-700 text-xs">{r.aftermarket}</td>
                          <td className="px-5 py-3 tabular-nums font-bold text-emerald-700">{r.best}</td>
                          <td className="px-5 py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <TrendingDown className="h-3 w-3" />
                              {r.delta}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-[11px] italic text-slate-500">{t.compat.note}</div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.categories.title}</h2>
            </RevealOnScroll>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {t.categories.items.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{c.name}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{c.examples}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PAINS */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="relative rounded-2xl overflow-hidden mb-12 bg-slate-100 shadow-xl">
                <div className="relative aspect-[16/10] md:aspect-[21/9] lg:aspect-[24/8]">
                  <img
                    src="/industries/mro.jpg"
                    alt={isEN ? "Maintenance manager next to a halted CNC machine with alert lamps blinking" : "Maintenance manager przy zatrzymanej maszynie CNC z lampkami awarii"}
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
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-extrabold text-amber-800 tabular-nums">{p.metric}</div>
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
                <img src="/industries/mro-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'Part found. Machine back up. Downtime over.' : 'Część znaleziona. Maszyna działa. Przestój zakończony.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* RELATED CONTENT (replaces retired case study) */}
        <IndustryRelatedResources industrySlug="mro-utrzymanie-ruchu" tone="amber" />

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-slate-800 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-amber-300 pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_mro_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_mro_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-amber-700 hover:bg-amber-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_mro#calendar`} onClick={() => trackCtaClick("industry_mro_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
