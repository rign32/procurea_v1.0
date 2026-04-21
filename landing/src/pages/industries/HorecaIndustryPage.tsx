import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  ChefHat,
  Wine,
  Leaf,
  Snowflake,
  Sun,
  Flower,
  Apple,
  Coffee,
  Utensils,
  Shield,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Thermometer,
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

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const t = {
  hero: {
    badge: isEN ? "HoReCa" : "HoReCa",
    title: isEN ? "F&B sourcing that widens your local supplier pool — across languages and regions" : "Sourcing F&B, który rozszerza Twoją lokalną bazę dostawców — przez języki i regiony",
    subtitle: isEN
      ? "Dairy, produce, proteins, beverages, kitchen equipment — find more local vendors, screen for HACCP / IFS / BRC signals, run competitive RFQs without chasing the same incumbents every renewal."
      : "Nabiał, warzywa, białka, napoje, sprzęt kuchenny — znajdź więcej lokalnych dostawców, screenuj pod sygnały HACCP / IFS / BRC, prowadź konkurencyjne RFQ bez ganiania tych samych incumbentów przy każdym odnowieniu.",
    primary: isEN ? "Start a supplier campaign" : "Rozpocznij kampanię dostawców",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { value: "3×", label: isEN ? "more qualified vendors per tender" : "więcej zakwalifikowanych vendorów per tender", detail: isEN ? "vs. incumbent-only RFQs" : "vs. RFQ tylko do incumbent" },
    { value: "Illustrative", label: isEN ? "8% better pricing scenario" : "scenariusz 8% lepszej ceny", detail: isEN ? "depends on category + region" : "zależy od kategorii + regionu" },
    { value: "HACCP", label: isEN ? "flagged at screening" : "flagowane przy screeningu", detail: isEN ? "+ IFS, BRC, organic signals" : "+ sygnały IFS, BRC, ekologiczne" },
    { value: "26", label: isEN ? "languages for regional sourcing" : "języków do regionalnego sourcingu", detail: isEN ? "Andalusian olive oil, Turkish spices…" : "Oliwa z Andaluzji, tureckie przyprawy…" },
  ],
  // Seasonal calendar
  seasonal: {
    title: isEN ? "How seasons shape F&B sourcing — a working reference" : "Jak sezony kształtują sourcing F&B — praktyczny punkt odniesienia",
    subtitle: isEN
      ? "A seasonal reference F&B teams use to plan tender cycles. Procurea runs the campaigns on whatever cadence you choose — the calendar itself is guidance, not an automated scheduler. (Scheduled re-tender reminders are on our 2026 roadmap.)"
      : "Referencja sezonowa, której zespoły F&B używają do planowania cykli tenderowych. Procurea prowadzi kampanie w rytmie, który wybierzesz — kalendarz to wytyczna, nie automatyczny harmonogram. (Przypomnienia o re-tenderze są na roadmapie 2026.)",
    quarters: isEN
      ? [
          {
            q: "Q1", icon: Snowflake, tone: "sky", season: "Winter", focus: ["Citrus (PT/IT/TR)", "Imported produce", "Dairy contracts", "Cleaning chemicals"],
            hint: "Annual dairy tenders — lock before spring demand spike.",
          },
          {
            q: "Q2", icon: Flower, tone: "emerald", season: "Spring", focus: ["Asparagus, strawberries", "Lamb, early greens", "Herbs, edible flowers", "New-season olive oil"],
            hint: "Spring menu tenders — negotiate against abundant supply.",
          },
          {
            q: "Q3", icon: Sun, tone: "amber", season: "Summer", focus: ["Seafood, event catering", "Stone fruit, tomatoes", "Rosé, sparkling", "Ice, gelato ingredients"],
            hint: "Event-season spot buys — diversify beyond 2–3 vendors.",
          },
          {
            q: "Q4", icon: Leaf, tone: "orange", season: "Autumn", focus: ["Game, mushrooms", "Root vegetables", "Christmas staples", "Imported seafood"],
            hint: "Holiday season — lock prices 8 weeks early, avoid November surges.",
          },
        ]
      : [
          {
            q: "Q1", icon: Snowflake, tone: "sky", season: "Zima", focus: ["Cytrusy (PT/IT/TR)", "Warzywa importowane", "Kontrakty nabiałowe", "Chemia czystości"],
            hint: "Roczne tendery nabiałowe — zablokuj przed wiosennym spike'iem popytu.",
          },
          {
            q: "Q2", icon: Flower, tone: "emerald", season: "Wiosna", focus: ["Szparagi, truskawki", "Jagnięcina, wczesne zielone", "Zioła, kwiaty jadalne", "Oliwa nowego sezonu"],
            hint: "Tendery menu wiosennego — negocjuj przy szerokiej podaży.",
          },
          {
            q: "Q3", icon: Sun, tone: "amber", season: "Lato", focus: ["Owoce morza, catering eventów", "Owoce pestkowe, pomidory", "Rosé, musujące", "Lód, składniki gelato"],
            hint: "Spot buys sezonu eventów — zdywersyfikuj poza 2–3 vendorów.",
          },
          {
            q: "Q4", icon: Leaf, tone: "orange", season: "Jesień", focus: ["Dziczyzna, grzyby", "Korzeniowe", "Święta — klasyki", "Owoce morza z importu"],
            hint: "Święta — zablokuj ceny 8 tyg. wcześniej, unikaj skoków listopadowych.",
          },
        ],
  },
  // Commodity volatility
  volatility: {
    title: isEN ? "Commodity volatility — why a wider supplier base matters" : "Zmienność surowców — dlaczego szersza baza ma znaczenie",
    subtitle: isEN
      ? "Weekly price swings of 8–15% are normal for dairy, oils and proteins. A 3-vendor network means you ride every swing; a 20-vendor network lets you pick better quotes. Procurea doesn't track live commodity indices itself — the sample below is an illustrative context. You get the real prices by running an RFQ against a broader supplier pool."
      : "Tygodniowe skoki cen 8–15% to norma dla nabiału, olejów i białek. Sieć 3 vendorów = jedziesz na każdym skoku; sieć 20 vendorów pozwala wybierać lepsze oferty. Procurea sama nie trackuje żywych indeksów commodity — sample poniżej to ilustracyjny kontekst. Realne ceny dostajesz odpalając RFQ do szerszej puli dostawców.",
    commodities: isEN
      ? [
          { name: "Whole milk", icon: Wine, curr: "€0.46/L", delta: "+8.3%", trend: "up", band: [30, 90] },
          { name: "Olive oil EV", icon: Leaf, curr: "€8.20/L", delta: "+14.7%", trend: "up", band: [55, 92] },
          { name: "Chicken breast", icon: Apple, curr: "€6.10/kg", delta: "-4.1%", trend: "down", band: [40, 70] },
          { name: "Atlantic salmon", icon: Utensils, curr: "€12.40/kg", delta: "+11.2%", trend: "up", band: [60, 95] },
          { name: "Tomatoes", icon: Apple, curr: "€1.85/kg", delta: "-6.8%", trend: "down", band: [25, 55] },
          { name: "Arabica coffee", icon: Coffee, curr: "€18.90/kg", delta: "+9.4%", trend: "up", band: [50, 88] },
        ]
      : [
          { name: "Mleko pełne", icon: Wine, curr: "0,46 €/L", delta: "+8,3%", trend: "up", band: [30, 90] },
          { name: "Oliwa extra vergine", icon: Leaf, curr: "8,20 €/L", delta: "+14,7%", trend: "up", band: [55, 92] },
          { name: "Pierś z kurczaka", icon: Apple, curr: "6,10 €/kg", delta: "-4,1%", trend: "down", band: [40, 70] },
          { name: "Łosoś atlantycki", icon: Utensils, curr: "12,40 €/kg", delta: "+11,2%", trend: "up", band: [60, 95] },
          { name: "Pomidory", icon: Apple, curr: "1,85 €/kg", delta: "-6,8%", trend: "down", band: [25, 55] },
          { name: "Kawa arabika", icon: Coffee, curr: "18,90 €/kg", delta: "+9,4%", trend: "up", band: [50, 88] },
        ],
    note: isEN ? "Illustrative indicative prices, weekly delta. Real prices sourced via supplier RFQ." : "Orientacyjne ceny ilustracyjne, delta tygodniowa. Prawdziwe ceny przez RFQ dostawców.",
  },
  // Cert tracker
  certs: {
    title: isEN ? "Food safety certifications — the signals we pick up" : "Certyfikaty bezpieczeństwa żywności — sygnały, które wyciągamy",
    subtitle: isEN
      ? "AI screening picks up HACCP, IFS, BRC, organic and ISO 22000 mentions from supplier websites. Actual certificate files are uploaded by bidders via the Supplier Portal and stored with upload date and (if provided) expiry. Automatic 90-day expiry alerts are coming in our 2026 roadmap."
      : "Screening AI wyciąga wzmianki HACCP, IFS, BRC, eko i ISO 22000 ze stron dostawców. Właściwe pliki certyfikatów bidderzy uploadują przez Supplier Portal i są trzymane z datą uploadu oraz (jeśli podano) ważnością. Automatyczne alerty 90-dniowe na wygaśnięcie nadchodzą w roadmapie 2026.",
    items: isEN
      ? [
          { code: "HACCP", scope: "Hazard analysis, critical control points", mandatory: true },
          { code: "IFS Food", scope: "International Featured Standards — retail", mandatory: false },
          { code: "BRCGS", scope: "British Retail Consortium — global food safety", mandatory: false },
          { code: "ISO 22000", scope: "Food safety management system", mandatory: false },
          { code: "Organic EU", scope: "EU bio certification", mandatory: false },
          { code: "MSC / ASC", scope: "Sustainable seafood", mandatory: false },
          { code: "Kosher / Halal", scope: "Religious dietary compliance", mandatory: false },
          { code: "Fair Trade", scope: "Ethical sourcing", mandatory: false },
        ]
      : [
          { code: "HACCP", scope: "Analiza zagrożeń, krytyczne punkty kontrolne", mandatory: true },
          { code: "IFS Food", scope: "International Featured Standards — retail", mandatory: false },
          { code: "BRCGS", scope: "British Retail Consortium — global food safety", mandatory: false },
          { code: "ISO 22000", scope: "System zarządzania bezpieczeństwem żywności", mandatory: false },
          { code: "Eko UE", scope: "Unijny certyfikat bio", mandatory: false },
          { code: "MSC / ASC", scope: "Zrównoważone owoce morza", mandatory: false },
          { code: "Kosher / Halal", scope: "Zgodność religijna", mandatory: false },
          { code: "Fair Trade", scope: "Etyczne pozyskanie", mandatory: false },
        ],
  },
  // Supplier categories
  categories: {
    title: isEN ? "Three procurement lanes, one platform" : "Trzy lanes procurement, jedna platforma",
    items: isEN
      ? [
          {
            icon: ChefHat,
            name: "F&B ingredients",
            examples: ["Dairy, bakery, produce", "Proteins, seafood", "Beverages, wine, spirits", "Spices, oils, condiments"],
            tone: "emerald",
          },
          {
            icon: Utensils,
            name: "Kitchen equipment",
            examples: ["Commercial ovens, combi steamers", "Refrigeration, cold rooms", "Dishwashers, ware-wash", "Utensils, prep tools"],
            tone: "sky",
          },
          {
            icon: Wine,
            name: "Tableware & linen",
            examples: ["China, glassware, cutlery", "Linens, napery, uniforms", "Disposables, packaging", "Decor, event rentals"],
            tone: "violet",
          },
        ]
      : [
          {
            icon: ChefHat,
            name: "Składniki F&B",
            examples: ["Nabiał, piekarnia, warzywa", "Białka, owoce morza", "Napoje, wino, alkohole", "Przyprawy, oleje, sosy"],
            tone: "emerald",
          },
          {
            icon: Utensils,
            name: "Sprzęt kuchenny",
            examples: ["Piece, urządzenia combi", "Chłodnictwo, cold rooms", "Zmywarki, ware-wash", "Narzędzia, sprzęt prep"],
            tone: "sky",
          },
          {
            icon: Wine,
            name: "Zastawa & tekstylia",
            examples: ["Porcelana, szkło, sztućce", "Tekstylia, obrusy, uniformy", "Jednorazówki, opakowania", "Dekoracje, wynajem eventowy"],
            tone: "violet",
          },
        ],
  },
  pains: {
    title: isEN ? "What costs you money every week (and you don't see it)" : "Co kosztuje Cię co tydzień (a tego nie widzisz)",
    items: [
      {
        metric: "15%",
        heading: isEN ? "maverick buying inflates F&B spend" : "maverick buying zawyża wydatki F&B",
        body: isEN ? "Chef orders emergency lots from the first vendor who picks up. Structured spot-buy RFQs keep price discipline even under time pressure." : "Szef kuchni zamawia pilne partie u pierwszego który odbierze telefon. Ustrukturyzowane RFQ spot-buy trzymają dyscyplinę cenową nawet pod presją czasu.",
        icon: TrendingUp,
      },
      {
        metric: "40%",
        heading: isEN ? "of annual contracts locked without comparison" : "rocznych kontraktów zamkniętych bez porównania",
        body: isEN ? "Incumbent renewals get rubber-stamped because comparing quotes takes too long. Procurea runs the comparison in a week, not a month." : "Odnowienia incumbent są stemplowane bo porównanie ofert trwa za długo. Procurea robi porównanie w tydzień, nie miesiąc.",
        icon: Thermometer,
      },
      {
        metric: "90 days",
        heading: isEN ? "lag finding a backup after one fails" : "opóźnienie znalezienia backupu po awarii",
        body: isEN ? "Sole-sourced critical categories (proteins, coffee, dairy) mean a single supplier hiccup ruins three weeks of menu planning." : "Jednoźródłowe krytyczne kategorie (białka, kawa, nabiał) oznaczają że jedna awaria dostawcy rujnuje trzy tygodnie planowania menu.",
        icon: Shield,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — 12-property hotel chain" : "Scenariusz ilustracyjny — sieć 12 hoteli",
    title: isEN ? "Annual food cost down 8% by tripling the qualified vendor pool per category" : "Roczny koszt żywności −8% przez potrojenie zakwalifikowanej puli vendorów per kategoria",
    body: isEN
      ? "A 12-property hotel group used Procurea to source dairy, bakery and fresh produce suppliers across 4 countries. By moving from ~5 to 18 qualified vendors per category, the procurement team ran competitive annual tenders that locked 8% better pricing — worth low seven figures over a full year."
      : "Grupa 12 hoteli użyła Procurea do sourcingu dostawców nabiału, pieczywa i świeżych produktów w 4 krajach. Przejście z ~5 do 18 zakwalifikowanych vendorów per kategoria pozwoliło prowadzić konkurencyjne tendery roczne blokujące 8% lepsze ceny — warte niskie 7 cyfr rocznie.",
    highlights: isEN
      ? [
          { v: "4", l: "Countries covered" },
          { v: "3×", l: "Vendor pool size" },
          { v: "8%", l: "Annual savings" },
          { v: "HACCP", l: "Pre-verified" },
        ]
      : [
          { v: "4", l: "Pokryte kraje" },
          { v: "3×", l: "Pula vendorów" },
          { v: "8%", l: "Roczne oszczędności" },
          { v: "HACCP", l: "Pre-weryfikowany" },
        ],
  },
  faq: {
    title: isEN ? "Questions from F&B procurement" : "Pytania od procurement F&B",
    items: isEN
      ? [
          { q: "Can Procurea handle fresh / perishable categories?", a: "Yes. For fresh categories we emphasize lead time, delivery cadence and HACCP compliance in scoring. RFQs include cold-chain requirements, delivery windows, and shelf-life terms." },
          { q: "What about allergen and origin verification?", a: "During AI screening we flag declared allergens, country of origin, and organic/fair-trade claims. Documentation uploaded by suppliers through the portal forms the audit trail." },
          { q: "Do you work for single-property restaurants or only chains?", a: "Both. Chains benefit more from consolidated tenders, but single properties use Procurea to find local suppliers they didn't know about in their own city." },
          { q: "Can I re-run a tender quickly when prices spike?", a: "Yes — saved bidder lists + auto-localized RFQs mean a dairy re-tender goes from 2 weeks to 2 days. Useful when commodity indices move against you." },
          { q: "What about kitchen equipment CAPEX purchases?", a: "Full support — we handle large equipment RFQs with structured spec sheets, warranty comparison, and installation/training scope. Same workflow, different templates." },
        ]
      : [
          { q: "Czy Procurea obsługuje świeże / łatwo psujące się kategorie?", a: "Tak. Dla świeżych kategorii podkreślamy lead time, kadencję dostaw i zgodność HACCP w scoringu. RFQ zawierają wymagania cold-chain, okna dostaw i terminy przydatności." },
          { q: "A weryfikacja alergenów i pochodzenia?", a: "Podczas screeningu AI flagujemy deklarowane alergeny, kraj pochodzenia i deklaracje eko/fair-trade. Dokumenty uploadowane przez dostawców przez portal tworzą audit trail." },
          { q: "Pracujecie z pojedynczymi restauracjami czy tylko sieciami?", a: "Oboje. Sieci korzystają bardziej ze skonsolidowanych tenderów, ale pojedyncze lokale używają Procurea do znalezienia lokalnych dostawców których nie znali w swoim mieście." },
          { q: "Czy mogę szybko re-run tender gdy ceny skaczą?", a: "Tak — zapisane listy bidderów + auto-lokalizowane RFQ oznaczają że re-tender nabiału idzie z 2 tyg. na 2 dni. Przydatne gdy indeksy surowców ruszają przeciwko Tobie." },
          { q: "A zakupy CAPEX sprzętu kuchennego?", a: "Pełne wsparcie — obsługujemy RFQ dużego sprzętu z ustrukturyzowanymi arkuszami spec, porównaniem gwarancji i zakresem instalacji/szkoleń. Ten sam workflow, inne templates." },
        ],
  },
  cta: {
    title: isEN ? "Tender season is always now" : "Sezon tenderowy jest zawsze teraz",
    body: isEN ? "Pick one category — dairy, produce, proteins. Your first competitive shortlist lands today." : "Wybierz jedną kategorię — nabiał, warzywa, białka. Pierwsza konkurencyjna shortlista ląduje dziś.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500", border: "border-orange-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", border: "border-violet-200" },
}

export function HorecaIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-amber-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-emerald-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-5">
                  <ChefHat className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_horeca_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_horeca_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_horeca#calendar`} onClick={() => trackCtaClick("industry_horeca_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-100/60 to-emerald-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Utensils className="h-3.5 w-3.5" />
                        {isEN ? "This week — dairy watch" : "Ten tydzień — obserwacja nabiału"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">{isEN ? "Action" : "Akcja"}</span>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { label: isEN ? "Whole milk index" : "Indeks mleka", val: "+8.3%", tone: "text-rose-600" },
                        { label: isEN ? "Butter spot" : "Masło spot", val: "+12.1%", tone: "text-rose-600" },
                        { label: isEN ? "Yogurt contracts renewing" : "Odnawiające się kontrakty jogurtu", val: "5", tone: "text-primary" },
                        { label: isEN ? "Certified bidders available" : "Dostępni zakwalifikowani bidderzy", val: "31", tone: "text-emerald-600" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-600">{r.label}</span>
                          <span className={`text-sm font-bold tabular-nums ${r.tone}`}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-amber-50/60 border-t border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isEN ? "Re-tender suggested — 5 contracts, 12% spike detected" : "Sugerowany re-tender — 5 kontraktów, wykryto skok 12%"}
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

        {/* SEASONAL CALENDAR */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.seasonal.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.seasonal.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.seasonal.quarters.map((q, i) => {
                const tone = toneMap[q.tone]
                return (
                  <motion.div
                    key={q.q}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-2xl border ${tone.border} bg-white overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    <div className={`px-5 py-4 ${tone.bg} flex items-center gap-3`}>
                      <div className={`h-9 w-9 rounded-xl bg-white ${tone.text} inline-flex items-center justify-center shadow-sm`}>
                        <q.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${tone.text}`}>{q.q}</div>
                        <div className="text-sm font-bold text-slate-900">{q.season}</div>
                      </div>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2 mb-4">
                        {q.focus.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
                            <div className={`mt-1.5 h-1 w-1 rounded-full ${tone.bar} shrink-0`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t border-slate-100 text-[11px] italic text-slate-500">{q.hint}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* VOLATILITY CHART */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-3">
                  <TrendingUp className="h-3 w-3" />
                  {isEN ? "Commodity watch" : "Obserwacja surowców"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.volatility.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.volatility.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {t.volatility.commodities.map((c, i) => {
                  const isUp = c.trend === "up"
                  return (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 hover:bg-slate-50/40"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 mb-1">{c.name}</div>
                        {/* Price band */}
                        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`absolute top-0 bottom-0 rounded-full ${isUp ? "bg-gradient-to-r from-rose-300 to-rose-500" : "bg-gradient-to-r from-emerald-300 to-emerald-500"}`}
                            style={{ left: `${c.band[0]}%`, right: `${100 - c.band[1]}%` }}
                          />
                        </div>
                      </div>
                      <div className="hidden md:block text-sm font-bold tabular-nums text-slate-900">{c.curr}</div>
                      <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {c.delta}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-[11px] italic text-slate-500">{t.volatility.note}</div>
            </div>
          </div>
        </section>

        {/* CERTS */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Shield className="h-3 w-3" />
                  {isEN ? "Food safety" : "Bezpieczeństwo żywności"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.certs.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.certs.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {t.certs.items.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {c.mandatory && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold uppercase tracking-wider">{isEN ? "Required" : "Wymagane"}</span>}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mb-0.5">{c.code}</div>
                  <div className="text-[11px] text-slate-600 leading-snug">{c.scope}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.categories.title}</h2>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-5">
              {t.categories.items.map((cat, i) => {
                const tone = toneMap[cat.tone]
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-2xl border ${tone.border} bg-white p-6`}
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone.bg} ${tone.text} mb-4`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-4">{cat.name}</h3>
                    <ul className="space-y-1.5">
                      {cat.examples.map((e) => (
                        <li key={e} className="flex items-start gap-2 text-sm text-slate-700">
                          <div className={`mt-1.5 h-1 w-1 rounded-full ${tone.bar} shrink-0`} />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
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
                    src="/industries/horeca.jpg"
                    alt={isEN ? "Restaurant F&B buyer overwhelmed by paper invoices and fragmented suppliers" : "F&B buyer restauracji zalewany papierowymi fakturami od rozproszonych dostawców"}
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
                      <div className="text-2xl font-extrabold text-amber-700 tabular-nums">{p.metric}</div>
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
                <img src="/industries/horeca-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'One supplier list. All orders, one click.' : 'Jedna lista dostawców. Wszystkie zamówienia, jedno kliknięcie.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* RELATED CONTENT (replaces retired case study) */}
        <IndustryRelatedResources industrySlug="gastronomia" tone="amber" />

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-emerald-600 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-white pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_horeca_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_horeca_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-amber-700 hover:bg-amber-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_horeca#calendar`} onClick={() => trackCtaClick("industry_horeca_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
