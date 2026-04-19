import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Package2,
  Ship,
  Truck,
  Plane,
  Shield,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Globe2,
  Tag,
  Layers,
  Award,
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
    badge: isEN ? "Retail & e-commerce" : "Retail & e-commerce",
    title: isEN ? "Nearshore your private label — without losing the China price point" : "Przenieś private label do nearshore — bez utraty poziomu ceny z Chin",
    subtitle: isEN
      ? "CE / FDA / GOTS / OEKO-TEX-certified manufacturers in Poland, Czechia, Portugal, Italy, Turkey — mapped for your category, MOQ and margin. 18+ alternatives in weeks, not a year of Canton Fair visits."
      : "Producenci z certyfikatami CE / FDA / GOTS / OEKO-TEX w Polsce, Czechach, Portugalii, Włoszech, Turcji — zmapowani pod Twoją kategorię, MOQ i marżę. 18+ alternatyw w tygodniach, nie rok wizyt na Canton Fair.",
    primary: isEN ? "Map my nearshore options" : "Zmapuj moje opcje nearshore",
    secondary: isEN ? "Book a strategy call" : "Umów rozmowę strategiczną",
  },
  // Landed cost comparison
  costCompare: {
    title: isEN ? "China vs. nearshore — the landed cost nobody breaks down for you" : "Chiny vs. nearshore — landed cost, którego nikt Ci nie rozbija",
    subtitle: isEN
      ? "Unit price looks great on Alibaba. Add ocean freight, duty, currency, MOQ-driven capital tie-up and 16-week lead time. Nearshore wins more often than you think."
      : "Cena jednostkowa wygląda super na Alibaba. Dodaj fracht morski, cło, walutę, kapitał zamrożony w MOQ i 16-tygodniowy lead time. Nearshore wygrywa częściej niż myślisz.",
    cols: isEN
      ? [
          {
            label: "China (Shenzhen → EU)",
            flag: "🇨🇳",
            tone: "red",
            rows: [
              { label: "FOB unit price", v: "€3.20", n: 3.2 },
              { label: "Ocean freight + port", v: "€0.85", n: 0.85 },
              { label: "EU import duty (6%)", v: "€0.19", n: 0.19 },
              { label: "Last-mile + warehouse", v: "€0.45", n: 0.45 },
              { label: "MOQ-driven capital cost", v: "€0.38", n: 0.38 },
            ],
            total: "€5.07",
            leadTime: "14–16 weeks",
            moq: "10,000 units",
            risks: ["Tariff exposure", "Forex volatility", "Sample delays"],
          },
          {
            label: "Nearshore (Poland / Portugal)",
            flag: "🇪🇺",
            tone: "emerald",
            rows: [
              { label: "EXW unit price", v: "€4.10", n: 4.1 },
              { label: "Road freight", v: "€0.20", n: 0.2 },
              { label: "EU duty", v: "€0", n: 0 },
              { label: "Last-mile + warehouse", v: "€0.35", n: 0.35 },
              { label: "MOQ-driven capital cost", v: "€0.08", n: 0.08 },
            ],
            total: "€4.73",
            leadTime: "3–5 weeks",
            moq: "500 units",
            risks: ["Higher unit price"],
          },
        ]
      : [
          {
            label: "Chiny (Shenzhen → UE)",
            flag: "🇨🇳",
            tone: "red",
            rows: [
              { label: "Cena jednostkowa FOB", v: "3,20 €", n: 3.2 },
              { label: "Fracht morski + port", v: "0,85 €", n: 0.85 },
              { label: "Cło UE (6%)", v: "0,19 €", n: 0.19 },
              { label: "Last-mile + magazyn", v: "0,45 €", n: 0.45 },
              { label: "Koszt kapitału pod MOQ", v: "0,38 €", n: 0.38 },
            ],
            total: "5,07 €",
            leadTime: "14–16 tygodni",
            moq: "10 000 szt.",
            risks: ["Ekspozycja celna", "Zmienność FX", "Opóźnione sample"],
          },
          {
            label: "Nearshore (Polska / Portugalia)",
            flag: "🇪🇺",
            tone: "emerald",
            rows: [
              { label: "Cena jednostkowa EXW", v: "4,10 €", n: 4.1 },
              { label: "Fracht drogowy", v: "0,20 €", n: 0.2 },
              { label: "Cło UE", v: "0 €", n: 0 },
              { label: "Last-mile + magazyn", v: "0,35 €", n: 0.35 },
              { label: "Koszt kapitału pod MOQ", v: "0,08 €", n: 0.08 },
            ],
            total: "4,73 €",
            leadTime: "3–5 tygodni",
            moq: "500 szt.",
            risks: ["Wyższa cena jednostkowa"],
          },
        ],
    delta: {
      label: isEN ? "Nearshore wins" : "Nearshore wygrywa",
      value: "−€0.34",
      percent: "−6.7%",
      per: isEN ? "per unit landed" : "na jednostkę landed",
    },
    footnote: isEN ? "Illustrative calculation, packaging category, 5K units/run." : "Obliczenie ilustracyjne, kategoria opakowania, 5 tys. szt./partia.",
  },
  // Factory regions
  regions: {
    title: isEN ? "Where your next factory actually lives" : "Gdzie naprawdę żyje Twoja następna fabryka",
    subtitle: isEN
      ? "We map factories by category, MOQ range and certification footprint. These are the regions behind the shortlists."
      : "Mapujemy fabryki wg kategorii, zakresu MOQ i footprintu certyfikacyjnego. To regiony stojące za shortlistami.",
    items: isEN
      ? [
          { flag: "🇵🇱", name: "Poland", specialty: "Packaging, textiles, cosmetics, electronics assembly", lead: "2–4 weeks", moq: "300–2,000" },
          { flag: "🇨🇿", name: "Czech Republic", specialty: "Plastics, precision metal, PCB, glassware", lead: "3–5 weeks", moq: "500–3,000" },
          { flag: "🇵🇹", name: "Portugal", specialty: "Apparel, footwear, home textiles, ceramics", lead: "3–5 weeks", moq: "200–1,500" },
          { flag: "🇮🇹", name: "Italy", specialty: "Leather, premium apparel, eyewear, design goods", lead: "4–6 weeks", moq: "100–1,000" },
          { flag: "🇹🇷", name: "Turkey", specialty: "Textiles, cosmetics, home goods, appliances", lead: "3–5 weeks", moq: "500–5,000" },
          { flag: "🇷🇴", name: "Romania", specialty: "Apparel, furniture, electronics contract mfg", lead: "3–5 weeks", moq: "300–2,000" },
        ]
      : [
          { flag: "🇵🇱", name: "Polska", specialty: "Opakowania, tekstylia, kosmetyki, montaż elektroniki", lead: "2–4 tyg.", moq: "300–2 000" },
          { flag: "🇨🇿", name: "Czechy", specialty: "Tworzywa, precyzyjny metal, PCB, szkło", lead: "3–5 tyg.", moq: "500–3 000" },
          { flag: "🇵🇹", name: "Portugalia", specialty: "Odzież, obuwie, tekstylia domowe, ceramika", lead: "3–5 tyg.", moq: "200–1 500" },
          { flag: "🇮🇹", name: "Włochy", specialty: "Skóra, premium odzież, okulary, design", lead: "4–6 tyg.", moq: "100–1 000" },
          { flag: "🇹🇷", name: "Turcja", specialty: "Tekstylia, kosmetyki, home goods, AGD", lead: "3–5 tyg.", moq: "500–5 000" },
          { flag: "🇷🇴", name: "Rumunia", specialty: "Odzież, meble, contract mfg elektroniki", lead: "3–5 tyg.", moq: "300–2 000" },
        ],
  },
  migration: {
    title: isEN ? "A 6-week migration plan from China to nearshore" : "6-tygodniowy plan migracji z Chin do nearshore",
    subtitle: isEN
      ? "You don't have to cut China today. Run nearshore in parallel, prove the numbers, shift volume as confidence grows."
      : "Nie musisz ciąć Chin dzisiaj. Uruchom nearshore równolegle, udowodnij liczby, przesuwaj wolumen wraz z rosnącym zaufaniem.",
    weeks: isEN
      ? [
          { w: "Week 1", title: "Map alternatives", body: "Upload specs + certs, AI returns 18+ nearshore factories across 3–5 regions." },
          { w: "Week 2", title: "RFQ + samples", body: "Send RFQs in local languages, request samples, negotiate MOQ flex." },
          { w: "Week 3–4", title: "Sample evaluation", body: "Side-by-side quality/cost/lead time, rank against current China vendor." },
          { w: "Week 5", title: "Pilot order", body: "Place 500–2,000 unit pilot, validate end-to-end from production to delivery." },
          { w: "Week 6", title: "Dual-run", body: "Keep China for legacy SKUs, route new launches through nearshore." },
        ]
      : [
          { w: "Tydz. 1", title: "Mapuj alternatywy", body: "Wgraj specy + certy, AI zwraca 18+ fabryk nearshore w 3–5 regionach." },
          { w: "Tydz. 2", title: "RFQ + sample", body: "Wyślij RFQ w lokalnych językach, zamów sample, negocjuj flex MOQ." },
          { w: "Tydz. 3–4", title: "Ocena sampli", body: "Side-by-side jakość/koszt/lead time, ranking vs. aktualny vendor z Chin." },
          { w: "Tydz. 5", title: "Zamówienie pilotażowe", body: "Złóż 500–2 000 szt. pilota, zwaliduj end-to-end produkcja → dostawa." },
          { w: "Tydz. 6", title: "Dual-run", body: "Zostaw Chiny dla legacy SKU, nowe launche kieruj przez nearshore." },
        ],
  },
  certs: {
    title: isEN ? "Private label certifications — verified before you commit" : "Certyfikaty private label — weryfikowane zanim się zaangażujesz",
    items: [
      { code: "CE", scope: isEN ? "EU conformity marking" : "Znak zgodności UE" },
      { code: "FDA", scope: isEN ? "US food, drug, cosmetics" : "USA: żywność, leki, kosmetyki" },
      { code: "GOTS", scope: isEN ? "Organic textile standard" : "Ekologiczny standard tekstyliów" },
      { code: "OEKO-TEX", scope: isEN ? "Textile toxicology" : "Toksykologia tekstyliów" },
      { code: "REACH", scope: isEN ? "EU chemical safety" : "Bezpieczeństwo chemiczne UE" },
      { code: "RoHS", scope: isEN ? "Hazardous substances" : "Substancje niebezpieczne" },
      { code: "BSCI", scope: isEN ? "Social compliance" : "Social compliance" },
      { code: "FSC", scope: isEN ? "Forest stewardship" : "Certyfikat leśny" },
    ],
  },
  pains: {
    title: isEN ? "Three tax-es you pay by staying on Alibaba" : "Trzy podatki, które płacisz zostając na Alibaba",
    items: [
      {
        metric: "16 weeks",
        heading: isEN ? "lead time kills your new-launch velocity" : "lead time zabija velocity nowych launchy",
        body: isEN ? "By the time a winter SKU arrives, the season is ending. Nearshore cuts this to 3–5 weeks, unlocking 3–4 launch cycles per year." : "Zanim zimowe SKU dotrze, sezon się kończy. Nearshore ścina to do 3–5 tyg., otwierając 3–4 cykle launchowe rocznie.",
        icon: Ship,
      },
      {
        metric: "10,000 MOQ",
        heading: isEN ? "ties up capital you don't have" : "zamraża kapitał, którego nie masz",
        body: isEN ? "A €50K SKU bet becomes €5K in nearshore. You can test-and-learn instead of bet-and-pray." : "Zakład 50K zł na SKU staje się 5K w nearshore. Możesz test-and-learn zamiast bet-and-pray.",
        icon: Package2,
      },
      {
        metric: "Zero",
        heading: isEN ? "verifiable references on a shell company" : "weryfikowalnych referencji shell company",
        body: isEN ? "Alibaba storefronts can be 5 days old. Nearshore manufacturers have registries, VAT numbers, factory tours on Google Maps." : "Storefronty na Alibaba mogą mieć 5 dni. Producenci nearshore mają rejestry, numery VAT, zwiedzanie fabryki na Google Maps.",
        icon: Shield,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — DTC cosmetics brand" : "Scenariusz ilustracyjny — marka DTC kosmetyczna",
    title: isEN ? "Packaging migrated from China to Poland + Portugal + Turkey in 6 weeks" : "Opakowania przeniesione z Chin do Polski + Portugalii + Turcji w 6 tygodni",
    body: isEN
      ? "Facing 16-week lead times and rising tariffs, a fast-growing DTC beauty brand used Procurea to map 18 alternative packaging manufacturers across three nearshore regions. After sample evaluation and pilot runs, the brand routed 70% of new-launch volume through nearshore while keeping the incumbent China supplier for legacy SKUs."
      : "Mając 16-tygodniowe lead time i rosnące cła, szybko rosnąca marka kosmetyczna DTC użyła Procurea do zmapowania 18 alternatywnych producentów opakowań w trzech regionach nearshore. Po ocenie sampli i pilotażach marka skierowała 70% wolumenu nowych launchów przez nearshore, zostawiając incumbent chiński dla legacy SKU.",
    highlights: isEN
      ? [
          { v: "18", l: "Factories mapped" },
          { v: "6 weeks", l: "Research cycle" },
          { v: "−38%", l: "Lead time cut" },
          { v: "−95%", l: "MOQ capital" },
        ]
      : [
          { v: "18", l: "Zmapowanych fabryk" },
          { v: "6 tyg.", l: "Cykl researchu" },
          { v: "−38%", l: "Skrócony lead time" },
          { v: "−95%", l: "Kapitał MOQ" },
        ],
  },
  faq: {
    title: isEN ? "Questions from DTC and retail founders" : "Pytania od founderów DTC i retail",
    items: isEN
      ? [
          { q: "Will unit price actually come down moving from China to nearshore?", a: "Sometimes, sometimes not. What always improves is landed cost when you factor freight, duty, MOQ capital and lead-time opportunity cost. Our BOQ-style comparison surfaces the real delta — not just unit price." },
          { q: "Can I keep China for legacy SKUs and run nearshore for new launches?", a: "Yes, that's the recommended migration path. Procurea tracks suppliers per SKU so you can route a fraction of your portfolio while validating the nearshore option, then shift more as confidence grows." },
          { q: "How flexible are nearshore manufacturers on MOQ?", a: "Much more than China for small/mid brands. Polish and Portuguese factories often work from 200–500 units for apparel, 300–1,000 for packaging. We screen by declared MOQ range so you only contact realistic fits." },
          { q: "Do you handle sample logistics?", a: "We don't ship samples, but the Supplier Portal tracks sample requests, courier tracking numbers and approvals across all bidders — replacing the email chain where samples usually get lost." },
          { q: "What about quality audits?", a: "For formal audits you'd still use a third-party (QIMA, SGS). Procurea handles the pre-screening so the audit budget goes to 5 short-listed factories instead of 25 unvetted ones." },
        ]
      : [
          { q: "Czy cena jednostkowa faktycznie spadnie przenosząc się z Chin do nearshore?", a: "Czasem tak, czasem nie. Co zawsze się poprawia to landed cost gdy uwzględnisz fracht, cło, kapitał MOQ i koszt alternatywny lead time. Nasze porównanie BOQ-style pokazuje prawdziwą deltę, nie tylko cenę jednostkową." },
          { q: "Czy mogę zostawić Chiny dla legacy SKU i uruchomić nearshore dla nowych launchów?", a: "Tak, to rekomendowana ścieżka migracji. Procurea trackuje dostawców per SKU więc możesz routować fragment portfolio walidując opcję nearshore, a potem przesuwać więcej gdy rośnie zaufanie." },
          { q: "Jak elastyczni są producenci nearshore w kwestii MOQ?", a: "Znacznie bardziej niż chińscy dla małych/średnich marek. Polskie i portugalskie fabryki często pracują od 200–500 szt. dla odzieży, 300–1 000 dla opakowań. Screenujemy po deklarowanym zakresie MOQ więc kontaktujesz się tylko z realistycznymi dopasowaniami." },
          { q: "Obsługujecie logistykę sampli?", a: "Nie wysyłamy sampli, ale Supplier Portal trackuje requesty, numery kurierskie i akceptacje u wszystkich bidderów — zastępuje chain maili gdzie zwykle giną sample." },
          { q: "A audyty jakości?", a: "Do formalnych audytów nadal używasz third-party (QIMA, SGS). Procurea robi pre-screening, więc budżet audytowy idzie na 5 shortlistowanych fabryk zamiast 25 nieprzeszukanych." },
        ],
  },
  cta: {
    title: isEN ? "Still on Alibaba in 2026?" : "Nadal na Alibaba w 2026?",
    body: isEN ? "Give us one category. In an hour we'll map 15–20 nearshore alternatives with certifications, lead times and indicative pricing." : "Daj nam jedną kategorię. W godzinę zmapujemy 15–20 alternatyw nearshore z certyfikatami, lead time i indykatywnymi cenami.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a strategy call" : "Umów rozmowę strategiczną",
  },
}

export function RetailIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-rose-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-emerald-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-5">
                  <ShoppingBag className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_retail_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_retail_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_retail#calendar`} onClick={() => trackCtaClick("industry_retail_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              {/* Hero visual: nearshore savings card */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-100/60 to-emerald-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Globe2 className="h-3.5 w-3.5" />
                        {isEN ? "Nearshore migration plan" : "Plan migracji nearshore"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {isEN ? "Ready" : "Gotowe"}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex flex-col items-center">
                          <div className="text-3xl mb-1">🇨🇳</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">China</div>
                          <div className="text-xs text-slate-500 mt-0.5">€5.07</div>
                        </div>
                        <div className="flex-1 relative h-px bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] font-bold text-emerald-700">→</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-3xl mb-1">🇪🇺</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nearshore</div>
                          <div className="text-xs text-emerald-700 font-bold mt-0.5">€4.73</div>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50">
                          <span className="text-slate-700 font-medium">{isEN ? "Landed cost delta" : "Delta landed cost"}</span>
                          <span className="font-bold text-emerald-700">−6.7%</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50">
                          <span className="text-slate-700 font-medium">{isEN ? "Lead-time cut" : "Skrócony lead time"}</span>
                          <span className="font-bold text-sky-700">−75%</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10">
                          <span className="text-slate-700 font-medium">{isEN ? "MOQ flexibility" : "Elastyczność MOQ"}</span>
                          <span className="font-bold text-primary">20× better</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* COST COMPARISON TABLE */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-3">
                  <TrendingDown className="h-3 w-3" />
                  {isEN ? "Landed cost" : "Landed cost"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.costCompare.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.costCompare.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-4">
              {t.costCompare.cols.map((col, ci) => {
                const border = col.tone === "red" ? "border-red-200 bg-red-50/30" : "border-emerald-200 bg-emerald-50/30"
                const totalTone = col.tone === "red" ? "bg-red-900 text-white" : "bg-emerald-600 text-white"
                const maxVal = Math.max(...col.rows.map((r) => r.n))
                return (
                  <RevealOnScroll key={col.label}>
                    <div className={`rounded-3xl border ${border} overflow-hidden`}>
                      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200/60">
                        <span className="text-3xl" aria-hidden>{col.flag}</span>
                        <div>
                          <h3 className="text-base font-bold">{col.label}</h3>
                          <div className="text-[11px] text-slate-500 mt-0.5">Lead: <span className="font-semibold text-slate-700">{col.leadTime}</span> • MOQ: <span className="font-semibold text-slate-700">{col.moq}</span></div>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        {col.rows.map((r, ri) => (
                          <motion.div key={r.label} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.15 + ri * 0.06 }} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{r.label}</span>
                              <span className="font-semibold tabular-nums text-slate-900">{r.v}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white overflow-hidden">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${(r.n / maxVal) * 100}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + ci * 0.15 + ri * 0.06, duration: 0.7 }} className={col.tone === "red" ? "h-full bg-gradient-to-r from-red-400 to-red-500" : "h-full bg-gradient-to-r from-emerald-400 to-emerald-500"} />
                            </div>
                          </motion.div>
                        ))}
                        <div className={`mt-4 p-4 rounded-xl ${totalTone} flex items-center justify-between`}>
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{isEN ? "Total landed" : "Suma landed"}</span>
                          <span className="text-xl font-extrabold tabular-nums">{col.total}</span>
                        </div>
                        <div className="pt-2">
                          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">{isEN ? "Risks" : "Ryzyka"}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {col.risks.map((rk) => (
                              <span key={rk} className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-medium text-slate-600">{rk}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                )
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-emerald-600 text-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">{t.costCompare.delta.label}</div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-extrabold tabular-nums">{t.costCompare.delta.value}</span>
                  <span className="text-lg font-bold text-emerald-200">{t.costCompare.delta.percent}</span>
                  <span className="text-sm text-emerald-100">{t.costCompare.delta.per}</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-100 italic">{t.costCompare.footnote}</div>
            </div>
          </div>
        </section>

        {/* REGIONS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.regions.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.regions.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.regions.items.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl" aria-hidden>{r.flag}</span>
                    <h3 className="text-base font-bold">{r.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{r.specialty}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                    <div>
                      <div className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Lead</div>
                      <div className="font-bold text-slate-900">{r.lead}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">MOQ</div>
                      <div className="font-bold text-slate-900">{r.moq}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MIGRATION PLAN */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Layers className="h-3 w-3" />
                  {isEN ? "Migration plan" : "Plan migracji"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.migration.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.migration.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="relative">
              <div className="hidden lg:block absolute top-7 left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
                {t.migration.weeks.map((w, i) => (
                  <motion.div
                    key={w.w}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-14 w-14 rounded-full bg-white border-4 border-slate-100 ring-4 ring-white flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                        {i + 1}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1">{w.w}</div>
                      <h3 className="text-sm font-bold mb-1.5">{w.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{w.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CERTS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.certs.title}</h2>
            </RevealOnScroll>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {t.certs.items.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{c.code}</div>
                    <div className="text-[10px] text-slate-500 truncate">{c.scope}</div>
                  </div>
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
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-rose-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-extrabold text-rose-700">{p.metric}</div>
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
              <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-rose-600 text-white p-8 md:p-12 relative overflow-hidden">
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-emerald-600 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-white pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_retail_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_retail_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-rose-700 hover:bg-rose-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_retail#calendar`} onClick={() => trackCtaClick("industry_retail_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
