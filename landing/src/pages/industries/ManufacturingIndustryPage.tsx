import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Factory,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Gauge,
  Globe,
  Network,
  Boxes,
  Wrench,
  Sparkles,
  Thermometer,
  Recycle,
  Award,
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
    badge: isEN ? "Manufacturing" : "Produkcja",
    title: isEN
      ? "Dual sourcing for manufacturing — resilience you can actually trust"
      : "Dual sourcing dla produkcji — odporność, której naprawdę możesz zaufać",
    subtitle: isEN
      ? "Qualify alternative suppliers for raw materials, components and MRO against ISO 9001, IATF 16949, RoHS and REACH. Build a backup supplier network per category in weeks, not a year of trade-show meetings."
      : "Kwalifikuj alternatywnych dostawców surowców, komponentów i MRO pod ISO 9001, IATF 16949, RoHS i REACH. Zbuduj sieć backup per kategoria w tygodniach, nie rok spotkań targowych.",
    primary: isEN ? "Start a supplier campaign" : "Rozpocznij kampanię dostawców",
    secondary: isEN ? "Book a sourcing audit" : "Umów audyt sourcingu",
  },
  stats: [
    { value: "80%", label: isEN ? "less time on sourcing" : "mniej czasu na sourcing", detail: isEN ? "vs. manual research" : "vs. research ręczny" },
    { value: "35+", label: isEN ? "qualified backup vendors" : "zakwalifikowanych backup vendorów", detail: isEN ? "per category, per region" : "per kategoria, per region" },
    { value: "3wk", label: isEN ? "to a live dual-sourcing plan" : "do planu dual-sourcing live", detail: isEN ? "from brief to first RFQ" : "od briefu do pierwszego RFQ" },
    { value: "26", label: isEN ? "languages covered by AI" : "języków pokrywanych przez AI", detail: isEN ? "EU + nearshore markets" : "UE + rynki nearshore" },
  ],
  resilience: {
    title: isEN ? "Dual sourcing resilience map" : "Mapa odporności dual sourcing",
    subtitle: isEN
      ? "Every critical category gets a primary and at least two backups across different regions. One tariff shock, one bankruptcy, one port strike — your BOM keeps moving."
      : "Każda krytyczna kategoria ma primary i minimum dwa backupy w różnych regionach. Jeden szok celny, jedno bankructwo, jeden strajk portów — Twoja BOM jedzie dalej.",
    regions: isEN
      ? [
          { name: "Primary — Germany", city: "Stuttgart, DE", flag: "🇩🇪", role: "PRIMARY", score: 92, lead: "4 weeks", risk: "Low", tone: "primary" },
          { name: "Backup — Poland", city: "Wrocław, PL", flag: "🇵🇱", role: "BACKUP #1", score: 88, lead: "3 weeks", risk: "Low", tone: "sky" },
          { name: "Backup — Czech Rep.", city: "Brno, CZ", flag: "🇨🇿", role: "BACKUP #2", score: 85, lead: "5 weeks", risk: "Low", tone: "violet" },
          { name: "Strategic — Turkey", city: "Bursa, TR", flag: "🇹🇷", role: "STRATEGIC", score: 79, lead: "6 weeks", risk: "Medium", tone: "amber" },
        ]
      : [
          { name: "Primary — Niemcy", city: "Stuttgart, DE", flag: "🇩🇪", role: "PRIMARY", score: 92, lead: "4 tyg.", risk: "Niskie", tone: "primary" },
          { name: "Backup — Polska", city: "Wrocław, PL", flag: "🇵🇱", role: "BACKUP #1", score: 88, lead: "3 tyg.", risk: "Niskie", tone: "sky" },
          { name: "Backup — Czechy", city: "Brno, CZ", flag: "🇨🇿", role: "BACKUP #2", score: 85, lead: "5 tyg.", risk: "Niskie", tone: "violet" },
          { name: "Strategiczny — Turcja", city: "Bursa, TR", flag: "🇹🇷", role: "STRATEGIC", score: 79, lead: "6 tyg.", risk: "Średnie", tone: "amber" },
        ],
    riskFactors: isEN
      ? [
          { icon: AlertTriangle, label: "Tariff exposure", status: "Spread across 4 customs unions" },
          { icon: Thermometer, label: "Geopolitical risk", status: "No single-region concentration" },
          { icon: Recycle, label: "ESG & audit", status: "All 4 hold ISO 14001" },
          { icon: Gauge, label: "Capacity buffer", status: "137% of current demand" },
        ]
      : [
          { icon: AlertTriangle, label: "Ekspozycja celna", status: "Rozłożona na 4 unie celne" },
          { icon: Thermometer, label: "Ryzyko geopolityczne", status: "Brak koncentracji w 1 regionie" },
          { icon: Recycle, label: "ESG & audyt", status: "Wszystkie 4 mają ISO 14001" },
          { icon: Gauge, label: "Bufor mocy", status: "137% aktualnego zapotrzebowania" },
        ],
  },
  certMatrix: {
    title: isEN ? "Certifications Procurea looks for at screening" : "Certyfikaty, których Procurea szuka przy screeningu",
    subtitle: isEN
      ? "AI sourcing extracts certification signals from supplier websites — declared logos, standard codes, self-published statements. Matching vendors float to the top of the shortlist; final certificate files are uploaded by bidders via the Supplier Portal and stored with version history."
      : "AI sourcing wyciąga sygnały certyfikatów ze stron dostawców — deklarowane logo, kody standardów, samopublikowane oświadczenia. Pasujące firmy trafiają na górę shortlisty; finalne pliki certyfikatów bidderzy uploadują przez Supplier Portal i są trzymane z historią wersji.",
    certs: isEN
      ? [
          { code: "ISO 9001", scope: "Quality management", industries: ["All"] },
          { code: "IATF 16949", scope: "Automotive QMS", industries: ["Automotive"] },
          { code: "ISO 14001", scope: "Environmental", industries: ["All"] },
          { code: "ISO 45001", scope: "Occupational safety", industries: ["All"] },
          { code: "ISO 13485", scope: "Medical devices", industries: ["MedTech"] },
          { code: "AS 9100", scope: "Aerospace QMS", industries: ["Aerospace"] },
          { code: "RoHS", scope: "Hazardous substances", industries: ["Electronics"] },
          { code: "REACH", scope: "EU chemicals", industries: ["Chemicals"] },
          { code: "CE marking", scope: "EU conformity", industries: ["Multiple"] },
          { code: "UL", scope: "US safety", industries: ["Electronics"] },
          { code: "FSC", scope: "Forest stewardship", industries: ["Wood, Packaging"] },
          { code: "BSCI", scope: "Social compliance", industries: ["Textile"] },
        ]
      : [
          { code: "ISO 9001", scope: "Zarządzanie jakością", industries: ["Wszystkie"] },
          { code: "IATF 16949", scope: "QMS motoryzacyjny", industries: ["Motoryzacja"] },
          { code: "ISO 14001", scope: "Środowisko", industries: ["Wszystkie"] },
          { code: "ISO 45001", scope: "BHP", industries: ["Wszystkie"] },
          { code: "ISO 13485", scope: "Wyroby medyczne", industries: ["MedTech"] },
          { code: "AS 9100", scope: "QMS lotniczy", industries: ["Lotnictwo"] },
          { code: "RoHS", scope: "Substancje niebezp.", industries: ["Elektronika"] },
          { code: "REACH", scope: "Chemikalia UE", industries: ["Chemia"] },
          { code: "Znak CE", scope: "Zgodność UE", industries: ["Wiele"] },
          { code: "UL", scope: "Bezpieczeństwo US", industries: ["Elektronika"] },
          { code: "FSC", scope: "Lasy", industries: ["Drewno, Opakowania"] },
          { code: "BSCI", scope: "Social compliance", industries: ["Tekstylia"] },
        ],
  },
  bomFlow: {
    title: isEN ? "From one BOM component to a qualified shortlist" : "Od jednego komponentu BOM do zakwalifikowanej shortlisty",
    example: {
      component: isEN ? "Plastic injection — housing, PA66 GF30" : "Wtrysk tworzyw — obudowa, PA66 GF30",
      spec: isEN ? "IATF 16949, RoHS, 50K units/year, EU origin" : "IATF 16949, RoHS, 50 tys. szt./rok, pochodzenie UE",
    },
    steps: isEN
      ? [
          { label: "Describe the component", result: "Plain-language brief: material, volume, certs, region", count: "" },
          { label: "AI discovery run", result: "Injection molders in 8 EU countries", count: "312" },
          { label: "Screening shortlists IATF + RoHS signals", result: "Must mention IATF 16949 + RoHS on site", count: "84" },
          { label: "Capacity and locality match", result: "Declared volume / region fits brief", count: "41" },
          { label: "AI scoring + ranking", result: "Price (if listed), references, response signals", count: "Top 20" },
        ]
      : [
          { label: "Opisz komponent", result: "Brief w języku naturalnym: materiał, wolumen, certy, region", count: "" },
          { label: "Discovery AI", result: "Wtryskarnie w 8 krajach UE", count: "312" },
          { label: "Screening wyciąga sygnały IATF + RoHS", result: "Wzmianki IATF 16949 + RoHS na stronie", count: "84" },
          { label: "Dopasowanie mocy i lokalizacji", result: "Deklarowany wolumen / region pasuje do briefu", count: "41" },
          { label: "AI scoring + ranking", result: "Cena (jeśli podana), referencje, sygnały odpowiedzi", count: "Top 20" },
        ],
    footnote: isEN ? "One component = one campaign today. Multi-component BOM in a single campaign is on our 2026 roadmap — for now, teams run parallel campaigns per component (up to 10 concurrently)." : "Jeden komponent = jedna kampania dziś. Multi-komponent BOM w jednej kampanii jest na roadmapie 2026 — na razie zespoły odpalają równoległe kampanie per komponent (do 10 naraz).",
  },
  categories: {
    title: isEN ? "Where manufacturers win most with Procurea" : "Gdzie producenci wygrywają najbardziej z Procurea",
    items: isEN
      ? [
          { icon: Layers, name: "Plastic injection", examples: "Housings, enclosures, connectors, gears" },
          { icon: Wrench, name: "Metal stamping & CNC", examples: "Brackets, fasteners, shafts, precision parts" },
          { icon: Cpu, name: "PCB assembly", examples: "SMT, through-hole, box build, wire harness" },
          { icon: Boxes, name: "Packaging & labels", examples: "Corrugated, flexible, blister, secondary" },
          { icon: Factory, name: "Castings & forgings", examples: "Al / Fe / Zn gravity + pressure die" },
          { icon: Shield, name: "MRO & consumables", examples: "Bearings, seals, filters, lubricants" },
        ]
      : [
          { icon: Layers, name: "Wtrysk tworzyw", examples: "Obudowy, osłony, złącza, koła zębate" },
          { icon: Wrench, name: "Tłoczenie i CNC", examples: "Uchwyty, mocowania, wały, części precyzyjne" },
          { icon: Cpu, name: "Montaż PCB", examples: "SMT, przewlekane, box build, wiązki" },
          { icon: Boxes, name: "Opakowania i etykiety", examples: "Tektura, elastyczne, blister, wtórne" },
          { icon: Factory, name: "Odlewy i odkuwki", examples: "Al / Fe / Zn grawitacyjne + ciśnieniowe" },
          { icon: Shield, name: "MRO i consumables", examples: "Łożyska, uszczelki, filtry, smary" },
        ],
  },
  pains: {
    title: isEN ? "Supply chain fragility, quantified" : "Kruchość łańcucha dostaw, policzona",
    items: [
      {
        metric: "62%",
        heading: isEN ? "of manufacturers still single-sourced on Tier-1" : "producentów nadal single-sourced na Tier-1",
        body: isEN ? "Post-COVID surveys show most organizations intend to dual-source but never find time to qualify alternatives." : "Badania post-COVID: większość organizacji chce dual-source ale nigdy nie znajdują czasu na kwalifikację alternatyw.",
        icon: Network,
      },
      {
        metric: "40%",
        heading: isEN ? "supplier records go stale each year" : "rekordów dostawców dezaktualizuje się rocznie",
        body: isEN ? "Contacts change roles, companies get acquired, certifications expire. Your Excel from 2024 is 40% fiction by 2026." : "Kontakty zmieniają role, firmy są przejmowane, certyfikaty wygasają. Twój Excel z 2024 to w 2026 40% fikcji.",
        icon: AlertTriangle,
      },
      {
        metric: "9 months",
        heading: isEN ? "average time to qualify a Tier-2 switch" : "średni czas kwalifikacji zmiany Tier-2",
        body: isEN ? "Trade-show research, samples, audits, first-article — manual qualification drags. Procurea compresses screening to weeks." : "Research targowy, samples, audyty, pierwsza partia — ręczna kwalifikacja się ciągnie. Procurea spina screening w tygodnie.",
        icon: Gauge,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — European automotive OEM" : "Scenariusz ilustracyjny — Europejski OEM motoryzacyjny",
    title: isEN
      ? "Qualified 35 alternative injection molders in 3 weeks after Tier-1 capacity shock"
      : "35 alternatywnych wtryskarni zakwalifikowanych w 3 tygodnie po szoku mocy Tier-1",
    body: isEN
      ? "When a key Tier-1 injection molder announced capacity constraints, the procurement team used Procurea to map alternatives in 8 Central European countries. IATF 16949 pre-screening cut the long list to 84, capacity filter to 41, and a two-round RFQ closed the gap before production schedule slipped."
      : "Gdy kluczowy wtryskarz Tier-1 ogłosił ograniczenia mocy, zespół procurement użył Procurea do mapowania alternatyw w 8 krajach Europy Środkowej. Pre-screening IATF 16949 skrócił long-listę do 84, filtr mocy do 41, a dwurundowe RFQ zamknęło lukę zanim przesunął się harmonogram produkcji.",
  },
  faq: {
    title: isEN ? "Questions from manufacturing procurement" : "Pytania od procurement produkcyjnego",
    items: isEN
      ? [
          { q: "Can I import my current BOM and run campaigns against it?", a: "You can attach the BOM file to your campaign for context. Today you launch one campaign per component (up to 10 in parallel in a single project), describing material, volume, certifications and region in plain language. Importing an Excel/CSV BOM so each line auto-spawns a campaign is on our 2026 roadmap." },
          { q: "Do you handle IATF 16949 / ISO 13485 verification?", a: "AI screening extracts certification signals from supplier websites — declared logos, standard codes, self-published references. This is a first-pass shortlist filter, not a formal verification against IATF or notified-body databases. Bidders upload actual certificate PDFs via the Supplier Portal, where Procurea stores them with version history and (if provided) expiry dates. Your quality team signs off on final audit documents." },
          { q: "What about tier-2 and sub-tier visibility?", a: "Procurea maps what suppliers publicly disclose — their own certifications, production footprint, major references. Deep tier-n mapping still requires a dedicated engagement; Procurea accelerates the tier-1 and tier-2 screening work." },
          { q: "Can I share shortlists with my plant managers?", a: "Yes. Every qualified supplier lands in your Supplier Database with scores and campaign history. You can share read-only views with plant, quality or finance teams without extra seats." },
          { q: "Does it work for MRO / indirect procurement?", a: "Yes. Bearings, seals, lubricants, consumables — all run through the same RFQ workflow with category-specific scoring." },
        ]
      : [
          { q: "Czy mogę zaimportować moją aktualną BOM i prowadzić kampanie?", a: "Możesz załączyć plik BOM do kampanii jako kontekst. Dziś uruchamiasz jedną kampanię per komponent (do 10 równolegle w jednym projekcie), opisując materiał, wolumen, certyfikaty i region językiem naturalnym. Import Excela/CSV BOM tak, żeby każda linia auto-uruchamiała kampanię jest na roadmapie 2026." },
          { q: "Czy weryfikujecie IATF 16949 / ISO 13485?", a: "Screening AI wyciąga sygnały certyfikatów ze stron dostawców — deklarowane logo, kody standardów, samopublikowane referencje. To jest filtr pierwszego rzutu do shortlisty, nie formalna weryfikacja w bazach IATF czy jednostek notyfikowanych. Bidderzy uploadują właściwe PDF-y certyfikatów przez Supplier Portal, gdzie Procurea trzyma je z historią wersji i (jeśli podano) datami ważności. Twój zespół jakości podpisuje się pod finalnymi dokumentami audytowymi." },
          { q: "A widoczność tier-2 i sub-tier?", a: "Procurea mapuje to co dostawcy publicznie ujawniają — własne certyfikaty, footprint produkcyjny, główne referencje. Głębokie mapowanie tier-n wymaga dedykowanego engagement; Procurea przyspiesza screening tier-1 i tier-2." },
          { q: "Czy mogę dzielić shortlisty z plant managers?", a: "Tak. Każdy zakwalifikowany dostawca trafia do Supplier Database z ocenami i historią kampanii. Możesz dzielić read-only z plant, quality lub finance bez dodatkowych seatów." },
          { q: "Czy działa dla MRO / procurement pośredniego?", a: "Tak. Łożyska, uszczelki, smary, consumables — przez ten sam workflow RFQ z category-specific scoringiem." },
        ],
  },
  cta: {
    title: isEN ? "Start de-risking your supply base" : "Zacznij de-ryzykować swoją bazę dostawców",
    body: isEN ? "Bring one critical category. We'll show you a dual-sourcing plan with 3 regions in 30 minutes." : "Przynieś jedną krytyczną kategorię. Pokażemy Ci plan dual-sourcing z 3 regionami w 30 minut.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; ring: string; bar: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20", bar: "bg-primary", border: "border-primary/30" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", bar: "bg-sky-500", border: "border-sky-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", bar: "bg-violet-500", border: "border-violet-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", bar: "bg-amber-500", border: "border-amber-200" },
}

export function ManufacturingIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.06] blur-[120px] bg-sky-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-5">
                  <Factory className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a
                    href={appendUtm(APP_URL, "industry_manufacturing_hero_primary")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCtaClick("industry_manufacturing_hero_primary")}
                    className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link
                    to={`${pathFor("contact")}?interest=industry_manufacturing#calendar`}
                    onClick={() => trackCtaClick("industry_manufacturing_hero_secondary")}
                    className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all"
                  >
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              {/* Hero visual: resilience score dial */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-100/60 to-primary/10 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Network className="h-3.5 w-3.5" />
                        {isEN ? "Category: PA66 housings" : "Kategoria: obudowy PA66"}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {isEN ? "Dual-sourced" : "Dual-sourced"}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-baseline justify-between mb-5">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">{isEN ? "Resilience score" : "Score odporności"}</div>
                          <div className="flex items-baseline gap-2">
                            <div className="text-5xl font-extrabold tabular-nums text-emerald-600">87</div>
                            <div className="text-sm text-slate-500">/100</div>
                          </div>
                        </div>
                        <Award className="h-10 w-10 text-emerald-500/80" />
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "87%" }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-400 to-primary" />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {t.resilience.riskFactors.map((r) => (
                          <div key={r.label} className="flex items-start gap-2">
                            <r.icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-slate-700">{r.label}</div>
                              <div className="text-[10px] text-slate-500 truncate">{r.status}</div>
                            </div>
                          </div>
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
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }} className="bg-white p-5">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RESILIENCE MAP */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-12">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Globe className="h-3 w-3" />
                  {isEN ? "Resilience" : "Odporność"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.resilience.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.resilience.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.resilience.regions.map((r, i) => {
                const c = toneMap[r.tone]
                return (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`relative rounded-2xl border ${c.border} bg-white p-5 overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${c.bar}`} />
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl" aria-hidden>{r.flag}</div>
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>{r.role}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">{r.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{r.city}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Score</span><span className="font-bold tabular-nums">{r.score}/100</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Lead time</span><span className="font-medium">{r.lead}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{isEN ? "Risk" : "Ryzyko"}</span><span className="font-medium">{r.risk}</span></div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* BOM FLOW */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.bomFlow.title}</h2>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm mb-10">
                <div className="flex flex-col md:flex-row md:items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-0.5">{isEN ? "Example BOM line" : "Przykład linii BOM"}</div>
                    <div className="text-base font-bold text-slate-900">{t.bomFlow.example.component}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.bomFlow.example.spec}</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                  {t.bomFlow.steps.map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.35 }}
                      className="relative rounded-xl bg-slate-50/60 border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white text-[11px] font-bold">{i + 1}</div>
                        {step.count && <span className="text-[11px] font-bold tabular-nums text-primary">{step.count}</span>}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mb-1">{step.label}</div>
                      <div className="text-[11px] text-slate-500 leading-snug">{step.result}</div>
                      {i < t.bomFlow.steps.length - 1 && (
                        <ChevronRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      )}
                    </motion.div>
                  ))}
                </div>

                <p className="mt-5 text-[11px] italic text-slate-500 leading-relaxed">{t.bomFlow.footnote}</p>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CERT MATRIX */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Shield className="h-3 w-3" />
                  {isEN ? "Compliance" : "Compliance"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.certMatrix.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.certMatrix.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {t.certMatrix.certs.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mb-0.5">{c.code}</div>
                  <div className="text-[11px] text-slate-600 mb-2 leading-snug">{c.scope}</div>
                  <div className="flex flex-wrap gap-1">
                    {c.industries.map((ind) => (
                      <span key={ind} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{ind}</span>
                    ))}
                  </div>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.categories.items.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{cat.examples}</p>
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
                    src="/industries/manufacturing.jpg"
                    alt={isEN ? "Production manager at a halted assembly line" : "Kierownik produkcji przy zatrzymanej linii montażowej"}
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
                <motion.div
                  key={p.heading}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-red-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-extrabold text-red-700 tabular-nums">{p.metric}</div>
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
                <img src="/industries/manufacturing-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'Resilient supply chain. Line keeps running.' : 'Odporny łańcuch dostaw. Linia nie staje.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* RELATED CONTENT (replaces retired case study) */}
        <IndustryRelatedResources industrySlug="produkcja" tone="sky" />

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{t.faq.title}</h2>
            </RevealOnScroll>
            <div className="space-y-3">
              {t.faq.items.map((item, i) => (
                <motion.details key={item.q} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.3 }} className="group rounded-2xl border border-slate-200 bg-white hover:border-primary/30 transition-colors">
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-emerald-300 pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_manufacturing_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_manufacturing_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-primary hover:bg-sky-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_manufacturing#calendar`} onClick={() => trackCtaClick("industry_manufacturing_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
