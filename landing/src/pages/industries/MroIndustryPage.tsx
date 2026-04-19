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
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const t = {
  hero: {
    badge: isEN ? "MRO & plant maintenance" : "MRO & utrzymanie ruchu",
    title: isEN ? "MRO procurement — cut tail spend, cut downtime, cut emergency premiums" : "Procurement MRO — tnij tail spend, tnij przestoje, tnij premie awaryjne",
    subtitle: isEN
      ? "Pre-qualified backup vendors for bearings, seals, filters, motors, HVAC. Structured RFQs consolidate thousands of SKUs across plants. Less maverick buying, less 40% emergency markup, less paper."
      : "Pre-zakwalifikowani backup vendorzy dla łożysk, uszczelnień, filtrów, silników, HVAC. Ustrukturyzowane RFQ konsolidują tysiące SKU między zakładami. Mniej maverick buying, mniej 40% narzutu awaryjnego, mniej papieru.",
    primary: isEN ? "Start a tail-spend tender" : "Rozpocznij tender tail-spend",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { value: "22%", label: isEN ? "MRO spend reduction" : "redukcja wydatków MRO", detail: isEN ? "consolidated RFQ across 3 sites" : "skonsolidowane RFQ na 3 zakładach" },
    { value: "30–50%", label: isEN ? "emergency premium avoided" : "premia awaryjna uniknięta", detail: isEN ? "with pre-qualified backups" : "z pre-zakwalifikowanymi backupami" },
    { value: "200+", label: isEN ? "SKUs per site consolidated" : "SKU per zakład skonsolidowanych", detail: isEN ? "bearings, seals, motors, filters" : "łożyska, uszczelki, silniki, filtry" },
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
      ? "A-class parts get attention. B-class parts get half-attention. C-class tail spend gets ordered from whoever picks up the phone. Procurea consolidates the tail — where the biggest leakage hides."
      : "Części A dostają uwagę. Części B połowę uwagi. Tail spend klasy C zamawia się u tego, kto odbierze telefon. Procurea konsoliduje tail — gdzie chowa się największy wyciek.",
    tiers: isEN
      ? [
          { class: "A", share: "20% SKUs", spend: "70% spend", note: "Critical, sole-source managed", tone: "rose", width: 35 },
          { class: "B", share: "30% SKUs", spend: "20% spend", note: "Structured annual contracts", tone: "amber", width: 60 },
          { class: "C (tail)", share: "50% SKUs", spend: "10% spend — leakage lives here", note: "Consolidate through Procurea RFQ bundles", tone: "primary", width: 100 },
        ]
      : [
          { class: "A", share: "20% SKU", spend: "70% wydatków", note: "Krytyczne, zarządzane sole-source", tone: "rose", width: 35 },
          { class: "B", share: "30% SKU", spend: "20% wydatków", note: "Ustrukturyzowane kontrakty roczne", tone: "amber", width: 60 },
          { class: "C (tail)", share: "50% SKU", spend: "10% wydatków — tu żyje wyciek", note: "Konsoliduj przez bundle RFQ Procurea", tone: "primary", width: 100 },
        ],
  },
  // OEM compatibility matrix
  compat: {
    title: isEN ? "OEM compatibility — cross-referenced at screening" : "Kompatybilność OEM — cross-reference na screeningu",
    subtitle: isEN
      ? "An SKF bearing has 5 equivalent aftermarket alternatives. A FESTO valve has 3. Procurea surfaces both OEM and cross-referenced aftermarket suppliers so you choose, not just search."
      : "Łożysko SKF ma 5 równoważnych alternatyw aftermarket. Zawór FESTO ma 3. Procurea wyciąga zarówno OEM jak i cross-reference aftermarket, żebyś wybierał, nie tylko szukał.",
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
    note: isEN ? "Illustrative. Always validate critical-safety parts with OEM." : "Ilustracyjnie. Zawsze waliduj krytyczne części bezpieczeństwa z OEM.",
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
    title: isEN ? "22% MRO spend cut by consolidating 200+ SKUs across 3 facilities" : "22% redukcji wydatków MRO przez konsolidację 200+ SKU w 3 obiektach",
    body: isEN
      ? "Running 3 production facilities with 200+ maintenance SKUs each, the plant used Procurea to identify overlapping suppliers and run consolidated RFQs. Structured comparison surfaced 22% savings on bearings, seals and motor components — and eliminated emergency premiums by activating backup vendors before lines went down."
      : "Prowadząc 3 obiekty produkcyjne z 200+ SKU maintenance każdy, zakład użył Procurea do identyfikacji nakładających się dostawców i prowadzenia skonsolidowanych RFQ. Ustrukturyzowane porównanie ujawniło 22% oszczędności na łożyskach, uszczelkach i silnikach — i wyeliminowało premie awaryjne przez aktywację backupów zanim linie zaczęły stać.",
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
          { q: "Can you handle high-SKU-count tail spend?", a: "Yes — RFQ bundles group similar SKUs (e.g. 'deep-groove ball bearings, 20 sizes, annual demand') into one tender. Bidders quote per SKU; you compare at the bundle level and award the best-fit vendor(s)." },
          { q: "What about OEM-mandated parts where aftermarket is not allowed?", a: "Procurea distinguishes OEM-mandatory from interchangeable lines based on your input. For OEM-locked lines we still compare authorized distributors; for interchangeable lines we bring in aftermarket alternatives." },
          { q: "Do you integrate with our CMMS / ERP?", a: "Yes — via API or Merge.dev for common ERPs (SAP, Oracle, Infor). Qualified vendors push as approved supplier records; POs can be issued from your ERP against those vendors." },
          { q: "Can I run an RFQ on a maintenance service contract (e.g. annual HVAC)?", a: "Yes. Maintenance services follow the same structured RFQ with fields for SLA, response time, coverage geography, certifications and hourly/annual rates." },
          { q: "How do you handle critical-safety parts — brake, pressure, lifting?", a: "Screening flags safety-critical categories so you always keep OEM or notified-body-certified alternatives in scope. Procurea surfaces, your engineering team decides what's acceptable." },
        ]
      : [
          { q: "Czy obsługujecie tail spend z wysoką liczbą SKU?", a: "Tak — bundle RFQ grupują podobne SKU (np. 'łożyska kulkowe, 20 rozmiarów, roczny popyt') w jeden tender. Bidderzy kwotują per SKU; porównujesz na poziomie bundla i awardujesz najlepszego vendora(ów)." },
          { q: "A części OEM-mandatory gdzie aftermarket nie jest dopuszczony?", a: "Procurea rozróżnia OEM-mandatory od wymiennych na bazie Twojego inputu. Dla linii OEM-locked nadal porównujemy autoryzowanych dystrybutorów; dla wymiennych bierzemy alternatywy aftermarket." },
          { q: "Czy integrujecie się z naszym CMMS / ERP?", a: "Tak — przez API lub Merge.dev dla popularnych ERP (SAP, Oracle, Infor). Zakwalifikowani vendorzy pushują jako approved supplier records; PO można wystawiać z ERP przeciwko tym vendorom." },
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 max-w-3xl">{t.pains.title}</h2>
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

        {/* CASE STUDY */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="rounded-3xl bg-gradient-to-br from-amber-800 to-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
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
