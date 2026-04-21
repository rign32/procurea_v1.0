import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Building2,
  HardHat,
  Package,
  ShieldCheck,
  FileCheck2,
  CalendarClock,
  Wallet,
  MapPin,
  Users,
  AlertTriangle,
  TrendingDown,
  Timer,
  CheckCircle2,
  Sparkles,
  Scale,
  FileSpreadsheet,
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
    backToHub: isEN ? "All industries" : "Wszystkie branże",
    badge: isEN ? "Construction" : "Budownictwo",
    title: isEN
      ? "Procurement for construction — subcontractors and materials in one workflow"
      : "Procurement dla budownictwa — podwykonawcy i materiały w jednym workflow",
    subtitle: isEN
      ? "Run RFQs for HVAC, electrical, steel, concrete and insulation. Find more bidders per category across 26 languages, collect structured offers via the Supplier Portal, and shortlist without the email-and-PDF midnight ritual."
      : "Odpalaj RFQ dla HVAC, elektryki, stali, betonu i izolacji. Znajdź więcej bidderów per kategoria w 26 językach, zbieraj strukturalne oferty przez Supplier Portal i twórz shortlistę bez nocnego rytuału mail-i-PDF.",
    primaryCta: isEN ? "Start a tender RFQ" : "Rozpocznij RFQ pod tender",
    secondaryCta: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    {
      value: "Wider pool",
      label: isEN ? "of qualified bidders" : "zakwalifikowanych bidderów",
      detail: isEN ? "AI sourcing reaches beyond your incumbent list" : "AI sourcing sięga poza listę incumbentów",
    },
    {
      value: "48h",
      label: isEN ? "to a qualified subcontractor shortlist" : "do zakwalifikowanej listy podwykonawców",
      detail: isEN ? "vs. weeks of manual outreach" : "vs. tygodnie ręcznego outreach",
    },
    {
      value: "30–50",
      label: isEN ? "bidders per RFQ instead of 5" : "bidderów per RFQ zamiast 5",
      detail: isEN ? "covers EU + nearshore markets" : "pokrywa UE + nearshore",
    },
    {
      value: "Structured",
      label: isEN ? "offer collection" : "zbieranie ofert",
      detail: isEN ? "Supplier Portal — no Excel stitching" : "Supplier Portal — bez sklejania Excela",
    },
  ],
  split: {
    title: isEN ? "Two halves of construction procurement — one platform" : "Dwa światy procurement budowlanego — jedna platforma",
    subtitle: isEN
      ? "Procurea unifies subcontractor RFQ and materials sourcing into a single tender workflow. One campaign, one comparison grid, one award decision."
      : "Procurea łączy RFQ podwykonawców i sourcing materiałów w jeden tender workflow. Jedna kampania, jeden grid porównania, jedna decyzja award.",
    subcontractors: {
      title: isEN ? "Subcontractors" : "Podwykonawcy",
      description: isEN
        ? "HVAC, electrical, finishing, scaffolding, demolition — qualified by locality, certification and recent references."
        : "HVAC, elektryka, wykończenia, rusztowania, rozbiórki — kwalifikowani po lokalności, certyfikatach i świeżych referencjach.",
      chips: isEN
        ? ["HVAC", "Electrical", "Finishing", "Scaffolding", "Demolition", "Landscaping"]
        : ["HVAC", "Elektryka", "Wykończenia", "Rusztowania", "Rozbiórki", "Zieleń"],
      criteria: isEN
        ? ["ISO 9001", "Liability insurance", "Local references", "Capacity", "Safety record", "Union compliance"]
        : ["ISO 9001", "Ubezpieczenie OC", "Lokalne referencje", "Moce przerobowe", "BHP", "Union compliance"],
    },
    materials: {
      title: isEN ? "Materials & systems" : "Materiały i systemy",
      description: isEN
        ? "Steel, concrete, insulation, windows, HVAC equipment — sourced against BOQ with price per unit, MOQ, lead time and Incoterms."
        : "Stal, beton, izolacja, stolarka, urządzenia HVAC — sourcowane pod BOQ z ceną jednostkową, MOQ, lead time i Incoterms.",
      chips: isEN
        ? ["Structural steel", "Ready-mix", "EPS/XPS", "Windows & doors", "HVAC units", "Electrical cabling"]
        : ["Stal konstr.", "Beton", "EPS/XPS", "Stolarka", "Urządzenia HVAC", "Okablowanie"],
      criteria: isEN
        ? ["CE marking", "DoP declarations", "REACH/RoHS", "Fire class", "Lead time", "Incoterms"]
        : ["Znak CE", "Deklaracje DoP", "REACH/RoHS", "Klasa odporn.", "Lead time", "Incoterms"],
    },
  },
  timeline: {
    title: isEN ? "From brief to signed contract in 14 days" : "Od briefu do podpisanej umowy w 14 dni",
    subtitle: isEN
      ? "A typical tender RFQ cycle in Procurea. Each step is timestamped in your audit trail."
      : "Typowy cykl RFQ pod tender w Procurea. Każdy krok otagowany w audit trail.",
    steps: [
      {
        day: isEN ? "Day 1" : "Dzień 1",
        title: isEN ? "Brief + BOQ attached" : "Brief + BOQ załączony",
        body: isEN
          ? "Describe the tender scope in plain language and pick top categories (steel, HVAC, insulation). Attach your BOQ (Excel or PDF) — bidders receive it alongside the RFQ. Procurea runs one campaign per category."
          : "Opisz zakres tendera językiem naturalnym i wybierz top kategorie (stal, HVAC, izolacja). Załącz BOQ (Excel lub PDF) — bidderzy dostają go razem z RFQ. Procurea prowadzi jedną kampanię per kategoria.",
        icon: FileSpreadsheet,
        color: "sky",
      },
      {
        day: isEN ? "Days 2–3" : "Dni 2–3",
        title: isEN ? "AI qualifies 30–50 bidders" : "AI kwalifikuje 30–50 bidderów",
        body: isEN
          ? "Category + locality + certs search runs across 26 languages. Shortlist lands with verified contacts and local references."
          : "Search po kategorii + lokalności + certyfikatach w 26 językach. Shortlista dostaje zweryfikowane kontakty i lokalne referencje.",
        icon: Users,
        color: "emerald",
      },
      {
        day: isEN ? "Day 4" : "Dzień 4",
        title: isEN ? "RFQ sent + portal live" : "RFQ wysłane + portal live",
        body: isEN
          ? "One-click dispatch with attached BOQ, drawings, site plans. Each bidder gets a magic-link portal, no login needed."
          : "Dispatch jednym kliknięciem z załączonym BOQ, rysunkami, planami. Każdy bidder dostaje magic-link portal, bez logowania.",
        icon: ArrowRight,
        color: "primary",
      },
      {
        day: isEN ? "Days 5–11" : "Dni 5–11",
        title: isEN ? "Structured offers collected" : "Strukturalne oferty zbierane",
        body: isEN
          ? "Bidders submit structured pricing (per unit, per tier), lead time, MOQ, payment terms plus BOQ attachments. Auto follow-up nudges non-responders."
          : "Bidderzy składają strukturalne ceny (per jednostka, per próg), lead time, MOQ, warunki płatności plus załączniki BOQ. Auto follow-up do nierespondentów.",
        icon: FileCheck2,
        color: "amber",
      },
      {
        day: isEN ? "Days 12–14" : "Dni 12–14",
        title: isEN ? "Side-by-side award" : "Award side-by-side",
        body: isEN
          ? "Compare offers in one grid — price, lead time, MOQ, submitted attachments. Export PDF for the tender committee. Weighted-ranking scoring (price / compliance / lead time / references) is on our 2026 roadmap."
          : "Porównaj oferty w jednym gridzie — cena, lead time, MOQ, złożone załączniki. Eksport PDF dla komisji tenderowej. Scoring ważony (cena / compliance / lead time / referencje) jest na roadmapie 2026.",
        icon: Scale,
        color: "violet",
      },
    ],
  },
  boq: {
    title: isEN ? "What BOQ offer comparison looks like — one grid, not a pile of PDFs" : "Jak wygląda porównanie ofert pod BOQ — jeden grid, nie stos PDF-ów",
    subtitle: isEN
      ? "An illustrative comparison grid for a 5-line tender. Today Procurea runs one campaign per category — the grid below is the target experience once the multi-line comparison (2026 roadmap) ships. Structured per-category comparison already works today."
      : "Ilustracyjny grid porównania dla 5-linijkowego tendera. Dziś Procurea prowadzi jedną kampanię per kategoria — grid poniżej to docelowy UX po dowiezieniu multi-line comparison (roadmapa 2026). Ustrukturyzowane porównanie per kategoria działa już dziś.",
    header: isEN
      ? ["BOQ line", "Spec", "Qty", "Bidder A", "Bidder B", "Bidder C", "Bidder D"]
      : ["Linia BOQ", "Specyfikacja", "Ilość", "Bidder A", "Bidder B", "Bidder C", "Bidder D"],
    rows: isEN
      ? [
          { line: "1.2.1", spec: "Structural steel S355", qty: "120 t", a: "€1,180/t", b: "€1,210/t", c: "€1,140/t", d: "€1,290/t", best: "c" },
          { line: "2.4.3", spec: "Concrete C30/37", qty: "850 m³", a: "€142/m³", b: "€138/m³", c: "€145/m³", d: "€136/m³", best: "d" },
          { line: "3.1.7", spec: "EPS 100 — 18cm", qty: "4,200 m²", a: "€21.40", b: "€22.10", c: "€20.80", d: "€21.90", best: "c" },
          { line: "4.2.5", spec: "PVC windows U=0.9", qty: "312 pcs", a: "€410", b: "€405", c: "€430", d: "€398", best: "d" },
          { line: "5.1.2", spec: "HVAC AHU 4,000 m³/h", qty: "6 pcs", a: "€12,400", b: "€11,950", c: "€12,800", d: "€11,700", best: "d" },
        ]
      : [
          { line: "1.2.1", spec: "Stal konstrukcyjna S355", qty: "120 t", a: "1 180 zł/t", b: "1 210 zł/t", c: "1 140 zł/t", d: "1 290 zł/t", best: "c" },
          { line: "2.4.3", spec: "Beton C30/37", qty: "850 m³", a: "142 zł/m³", b: "138 zł/m³", c: "145 zł/m³", d: "136 zł/m³", best: "d" },
          { line: "3.1.7", spec: "EPS 100 — 18cm", qty: "4 200 m²", a: "21,40 zł", b: "22,10 zł", c: "20,80 zł", d: "21,90 zł", best: "c" },
          { line: "4.2.5", spec: "Okna PVC U=0.9", qty: "312 szt.", a: "410 zł", b: "405 zł", c: "430 zł", d: "398 zł", best: "d" },
          { line: "5.1.2", spec: "Centrala AHU 4000 m³/h", qty: "6 szt.", a: "12 400 zł", b: "11 950 zł", c: "12 800 zł", d: "11 700 zł", best: "d" },
        ],
    totals: isEN
      ? { label: "Tender total", a: "€1,284,400", b: "€1,268,900", c: "€1,241,800", d: "€1,229,600", delta: "-4.3%" }
      : { label: "Suma tendera", a: "1 284 400 zł", b: "1 268 900 zł", c: "1 241 800 zł", d: "1 229 600 zł", delta: "-4,3%" },
    footnote: isEN
      ? "Illustrative numbers. Real campaigns include weighted scoring on compliance, lead time and references."
      : "Liczby ilustracyjne. Rzeczywiste kampanie zawierają ranking ważony po compliance, lead time i referencjach.",
  },
  pains: {
    title: isEN ? "Where tender procurement leaks time and money" : "Gdzie procurement tenderowy traci czas i pieniądze",
    items: [
      {
        metric: "60%",
        heading: isEN ? "of qualified bidders are missed" : "zakwalifikowanych bidderów jest pomijanych",
        body: isEN
          ? "Phone-and-email outreach touches the same 5 names. Every tender leaves 20–40 qualified subcontractors unreached."
          : "Outreach phone-and-email dotyka tych samych 5 nazw. Każdy tender zostawia 20–40 zakwalifikowanych podwykonawców bez kontaktu.",
        icon: Users,
      },
      {
        metric: "4–8h",
        heading: isEN ? "per RFQ spent stitching offers" : "per RFQ na sklejanie ofert",
        body: isEN
          ? "Parsing 5 PDFs with different units, Incoterms and payment schedules into one Excel is the nightly procurement ritual."
          : "Parsowanie 5 PDF-ów z różnymi jednostkami, Incoterms i harmonogramami płatności do jednego Excela to nocny rytuał procurement.",
        icon: FileSpreadsheet,
      },
      {
        metric: "14 days",
        heading: isEN ? "to re-qualify last year's list" : "na re-kwalifikację listy z zeszłego roku",
        body: isEN
          ? "Contacts rot at 40%/year. Certificates expire. Bankruptcies happen. Stale databases send tenders into voids."
          : "Kontakty starzeją się w 40%/rok. Certyfikaty wygasają. Bankructwa się zdarzają. Stare bazy wysyłają tendery w próżnię.",
        icon: CalendarClock,
      },
    ],
  },
  projectTypes: {
    title: isEN ? "Project types we support" : "Typy projektów, które wspieramy",
    subtitle: isEN
      ? "Each project type drives different BOQ structure, bidder qualification and approval flow. Procurea adapts."
      : "Każdy typ projektu wymusza inną strukturę BOQ, kwalifikację bidderów i flow zatwierdzania. Procurea się dostosowuje.",
    types: isEN
      ? [
          {
            icon: Building2,
            name: "Residential",
            features: ["Multi-unit developments", "Finishing packages", "Local references critical"],
          },
          {
            icon: HardHat,
            name: "Commercial",
            features: ["Office and retail fit-out", "MEP-heavy scopes", "Schedule-driven"],
          },
          {
            icon: Package,
            name: "Industrial",
            features: ["Warehouses, factories", "Heavy structural steel", "Process equipment"],
          },
          {
            icon: MapPin,
            name: "Infrastructure",
            features: ["Public tenders", "PPP/concession", "Strict compliance docs"],
          },
        ]
      : [
          {
            icon: Building2,
            name: "Mieszkaniowe",
            features: ["Osiedla wielorodzinne", "Pakiety wykończeniowe", "Krytyczne lokalne referencje"],
          },
          {
            icon: HardHat,
            name: "Komercyjne",
            features: ["Biura i retail fit-out", "Zakresy MEP-heavy", "Schedule-driven"],
          },
          {
            icon: Package,
            name: "Przemysłowe",
            features: ["Magazyny, fabryki", "Ciężka stal konstrukcyjna", "Urządzenia procesowe"],
          },
          {
            icon: MapPin,
            name: "Infrastrukturalne",
            features: ["Tendery publiczne", "PPP/koncesje", "Strict compliance docs"],
          },
        ],
  },
  verification: {
    title: isEN ? "What Procurea surfaces at screening — and what still needs your engineering review" : "Co Procurea wyciąga przy screeningu — a co nadal wymaga przeglądu engineeringu",
    subtitle: isEN
      ? "AI sourcing extracts signals from supplier websites and public registries. You still verify specifics before award — but you start with a pre-filtered shortlist instead of a cold list of 200."
      : "AI sourcing wyciąga sygnały ze stron dostawców i publicznych rejestrów. Specyfikę przed awardem i tak weryfikujesz — ale startujesz z pre-filtrowanej shortlisty zamiast zimnej listy 200.",
    items: isEN
      ? [
          "Registered legal entity + EU VAT (VIES validation)",
          "ISO 9001 / ISO 45001 and other certifications mentioned on the site",
          "Website, specialization and declared scope",
          "Country, city and stated regional coverage",
          "Visible team size and capacity indicators (where published)",
          "Contact emails and LinkedIn / decision-maker enrichment (via Apollo)",
          "Language coverage for on-site communication",
          "Campaign response history (internal tracking on repeat engagements)",
        ]
      : [
          "Aktywna osobowość prawna + EU VAT (walidacja VIES)",
          "ISO 9001 / ISO 45001 i inne certyfikaty wymienione na stronie",
          "Strona WWW, specjalizacja i deklarowany zakres",
          "Kraj, miasto i deklarowany zasięg regionalny",
          "Widoczna wielkość zespołu i wskaźniki mocy (gdy opublikowane)",
          "Kontakty email i enrichment LinkedIn / decision-makerów (przez Apollo)",
          "Pokrycie językowe do komunikacji on-site",
          "Historia odpowiedzi w kampaniach (wewnętrzny tracking przy powtórnym angażowaniu)",
        ],
  },
  tenderFlow: {
    title: isEN ? "Public vs private tenders — we handle both" : "Tendery publiczne vs prywatne — obsługujemy oba",
    public: {
      title: isEN ? "Public tender flow" : "Tender publiczny",
      items: isEN
        ? [
            "Attach SIWZ/PZP documents and ESPD templates to the RFQ",
            "Configurable response windows (7–21 days)",
            "Structured offer submission via the Supplier Portal",
            "Timestamped audit trail of sent/received artifacts",
            "Export PDF of the comparison grid for the tender file",
          ]
        : [
            "Załączaj dokumenty SIWZ/PZP i szablony ESPD do RFQ",
            "Konfigurowalne okna odpowiedzi (7–21 dni)",
            "Strukturalne składanie ofert przez Supplier Portal",
            "Otagowany audit trail wysłanych/odebranych artefaktów",
            "Eksport PDF gridu porównania do teczki tenderowej",
          ],
    },
    private: {
      title: isEN ? "Private / design-build flow" : "Prywatny / design-build",
      items: isEN
        ? [
            "Multi-round negotiation",
            "BAFO (Best and Final Offer) rounds",
            "Value engineering comparison",
            "Flexible scope clarifications",
            "Direct award with justification",
          ]
        : [
            "Wielorundowe negocjacje",
            "Rundy BAFO (Best and Final Offer)",
            "Porównanie value engineering",
            "Elastyczne uszczegółowienia zakresu",
            "Direct award z uzasadnieniem",
          ],
    },
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — Polish GC" : "Scenariusz ilustracyjny — Polski GW",
    title: isEN
      ? "€2.4M annual savings across 12 active residential projects"
      : "2,4 mln € rocznych oszczędności w 12 aktywnych projektach mieszkaniowych",
    body: isEN
      ? "A general contractor running 12 residential developments switched from repeat outreach to three well-known suppliers to Procurea-driven competitive RFQs. By broadening the bidder pool to 30+ per category and comparing BOQ line-by-line, unit costs dropped 3–7% on steel, concrete and insulation."
      : "Generalny wykonawca prowadzący 12 osiedli mieszkaniowych przełączył się z powtarzalnego outreach do trzech znanych dostawców na RFQ konkurencyjne przez Procurea. Rozszerzenie puli bidderów do 30+ per kategoria i porównanie BOQ linia po linii obniżyło koszty jednostkowe o 3–7% na stali, betonie i izolacji.",
    breakdown: [
      { label: isEN ? "Structural steel" : "Stal konstrukcyjna", value: "€980K", pct: 68 },
      { label: isEN ? "Ready-mix concrete" : "Beton towarowy", value: "€640K", pct: 52 },
      { label: isEN ? "Insulation (EPS/XPS)" : "Izolacja (EPS/XPS)", value: "€420K", pct: 38 },
      { label: isEN ? "Electrical + HVAC subs" : "Podwykonawcy elektryka + HVAC", value: "€360K", pct: 30 },
    ],
  },
  faq: {
    title: isEN ? "Questions from procurement managers" : "Pytania od kierowników procurement",
    items: isEN
      ? [
          {
            q: "Does Procurea support Polish public tender (PZP) requirements?",
            a: "Procurea is an RFQ orchestration platform — it does not generate ESPD/JEDZ documents or validate PZP/SIWZ formal compliance for you (your legal team does that). What it does: lets you attach SIWZ/PZP documents and ESPD templates to the RFQ, keeps a timestamped audit trail of what was sent and received, and produces a PDF comparison grid you can file. For public tenders, Procurea sits alongside your formal tender software, not instead of it.",
          },
          {
            q: "How do you handle BOQ uploads — Excel, PDF, drawings?",
            a: "You attach Excel, PDF and drawings to the RFQ — bidders receive them alongside the brief. Today bidders quote per-campaign (one category = one campaign) and submit structured pricing via the Supplier Portal. Per-BOQ-line structured quoting is on our 2026 roadmap.",
          },
          {
            q: "What about liability and insurance verification?",
            a: "AI sourcing picks up publicly declared certifications and insurance mentions from the supplier website — but this is a screening signal, not formal verification. For the tender file, bidders upload certificate and insurance PDFs via the Supplier Portal before the bid closes; documents are stored with versions and (if provided) expiry dates.",
          },
          {
            q: "Can we reuse a tender list across projects?",
            a: "Yes. Every qualified bidder lands in your Supplier Database with scores, certifications and past-campaign history. You can re-run an RFQ against a saved list in two clicks.",
          },
          {
            q: "Does it work for subcontractor RFQ or only materials?",
            a: "Both. Subcontractor RFQ runs the same structured-offer workflow with fields tuned for labour rates, scope lines and SLAs instead of unit prices and MOQ.",
          },
        ]
      : [
          {
            q: "Czy Procurea wspiera wymagania polskiego tendera publicznego (PZP)?",
            a: "Procurea to platforma orkiestracji RFQ — nie generuje dokumentów ESPD/JEDZ ani nie waliduje formalnej zgodności PZP/SIWZ (to robi Twój zespół prawny). Co robi: pozwala załączyć dokumenty SIWZ/PZP i szablony ESPD do RFQ, trzyma otagowany audit trail wysłanych i odebranych artefaktów oraz produkuje PDF gridu porównania do teczki. Przy tenderach publicznych Procurea stoi obok Twojego formalnego softu tenderowego, nie zamiast niego.",
          },
          {
            q: "Jak obsługujecie upload BOQ — Excel, PDF, rysunki?",
            a: "Załączasz Excela, PDF i rysunki do RFQ — bidderzy dostają je razem z briefem. Dziś bidderzy kwotują per-kampania (jedna kategoria = jedna kampania) i składają strukturalne ceny przez Supplier Portal. Strukturalne kwotowanie per linia BOQ jest na roadmapie 2026.",
          },
          {
            q: "A weryfikacja OC i ubezpieczeń?",
            a: "AI sourcing wyciąga publicznie deklarowane certyfikaty i wzmianki o ubezpieczeniach ze strony dostawcy — ale to jest sygnał screeningowy, nie formalna weryfikacja. Do teczki tenderowej bidderzy uploadują PDF-y certyfikatów i OC przez Supplier Portal przed zamknięciem; dokumenty trzymane są z wersjami i (jeśli podano) datami ważności.",
          },
          {
            q: "Czy możemy ponownie użyć listy tenderowej między projektami?",
            a: "Tak. Każdy zakwalifikowany bidder trafia do Supplier Database z ocenami, certyfikatami i historią kampanii. Możesz re-run RFQ na zapisanej liście w dwa kliknięcia.",
          },
          {
            q: "Czy to działa dla RFQ podwykonawców czy tylko materiałów?",
            a: "Obojga. RFQ podwykonawców uruchamia ten sam workflow strukturalnej oferty z polami dostosowanymi do stawek roboczych, linii zakresu i SLA zamiast cen jednostkowych i MOQ.",
          },
        ],
  },
  cta: {
    title: isEN ? "Running a tender this month?" : "Prowadzisz tender w tym miesiącu?",
    body: isEN
      ? "Walk us through your next RFQ. In 30 minutes we'll show you a live Procurea campaign scoped to your project type."
      : "Opowiedz nam o Twoim następnym RFQ. W 30 minut pokażemy Ci live kampanię Procurea dostrojoną pod Twój typ projektu.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  sky: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", bar: "bg-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", bar: "bg-emerald-500" },
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20", bar: "bg-primary" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", bar: "bg-amber-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", bar: "bg-violet-500" },
}

export function ConstructionIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-amber-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              to={pathFor("industriesHub")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {t.hero.backToHub}
            </Link>

            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-5">
                  <HardHat className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">
                  {t.hero.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a
                    href={appendUtm(APP_URL, "industry_construction_hero_primary")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCtaClick("industry_construction_hero_primary")}
                    className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    {t.hero.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link
                    to={`${pathFor("contact")}?interest=industry_construction#calendar`}
                    onClick={() => trackCtaClick("industry_construction_hero_secondary")}
                    className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all"
                  >
                    {t.hero.secondaryCta}
                  </Link>
                </div>
              </div>

              {/* Hero visual: stacked blueprint card */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-100/50 to-primary/10 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Building2 className="h-3.5 w-3.5" />
                        {isEN ? "Tender #2026-RES-118" : "Tender #2026-MIE-118"}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {isEN ? "Live RFQ" : "Aktywne RFQ"}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { label: isEN ? "Qualified bidders" : "Zakwalifikowani bidderzy", val: "42", color: "text-slate-900" },
                        { label: isEN ? "Offers received" : "Otrzymane oferty", val: "27 / 42", color: "text-primary" },
                        { label: isEN ? "Best price delta" : "Delta najlepszej ceny", val: "-4.3%", color: "text-emerald-600" },
                        { label: isEN ? "Days to award" : "Dni do award", val: "3", color: "text-amber-600" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-600">{r.label}</span>
                          <span className={`text-sm font-bold tabular-nums ${r.color}`}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {isEN
                        ? "AI suggests Bidder D — best total + compliance complete"
                        : "AI sugeruje Bidder D — najlepsza suma + pełne compliance"}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Stats strip */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden">
              {t.stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-white p-5"
                >
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SPLIT: SUBCONTRACTORS vs MATERIALS */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.split.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.split.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { data: t.split.subcontractors, icon: HardHat, tone: "from-amber-500 to-orange-500", bg: "bg-amber-50/70", chip: "bg-amber-100 text-amber-800" },
                { data: t.split.materials, icon: Package, tone: "from-sky-500 to-primary", bg: "bg-sky-50/70", chip: "bg-sky-100 text-sky-800" },
              ].map(({ data, icon: Icon, tone, bg, chip }) => (
                <RevealOnScroll key={data.title}>
                  <div className={`relative rounded-3xl border border-slate-200 ${bg} p-7 h-full flex flex-col`}>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white mb-5 shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{data.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{data.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {data.chips.map((c) => (
                        <span key={c} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${chip}`}>
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-5 border-t border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">
                        {isEN ? "Qualification criteria" : "Kryteria kwalifikacji"}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {data.criteria.map((c) => (
                          <div key={c} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE: 14 DAYS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-14">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Timer className="h-3 w-3" />
                  {isEN ? "Tender workflow" : "Workflow tendera"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.timeline.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.timeline.subtitle}</p>
              </div>
            </RevealOnScroll>

            {/* Desktop horizontal timeline */}
            <div className="hidden lg:block relative">
              <div className="absolute top-[38px] left-[4%] right-[4%] h-0.5 bg-gradient-to-r from-sky-300 via-emerald-300 via-primary via-amber-300 to-violet-300" />
              <div className="relative grid grid-cols-5 gap-4">
                {t.timeline.steps.map((step, i) => {
                  const c = colorMap[step.color]
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-center mb-4">
                        <div className={`h-[76px] w-[76px] rounded-full ${c.bg} ring-4 ring-white flex items-center justify-center shadow-sm ${c.text}`}>
                          <step.icon className="h-7 w-7" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${c.text}`}>{step.day}</div>
                        <h3 className="text-sm font-bold mb-2">{step.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Mobile vertical timeline */}
            <div className="lg:hidden relative pl-5">
              <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-300 via-primary to-violet-300" />
              <div className="space-y-5">
                {t.timeline.steps.map((step) => {
                  const c = colorMap[step.color]
                  return (
                    <div key={step.title} className="relative pl-10">
                      <div className={`absolute left-0 top-0 h-11 w-11 rounded-full ${c.bg} ring-4 ring-slate-50/60 flex items-center justify-center ${c.text}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${c.text}`}>{step.day}</div>
                        <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* BOQ COMPARISON MOCK */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <FileSpreadsheet className="h-3 w-3" />
                  BOQ
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.boq.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.boq.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                    {isEN ? "Residential development • 12,500 m²" : "Osiedle mieszkaniowe • 12 500 m²"}
                  </div>
                  <div className="flex gap-1.5">
                    {["A", "B", "C", "D"].map((b) => (
                      <span key={b} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30">
                        {t.boq.header.map((h, i) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 ${i >= 3 ? "text-right" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.boq.rows.map((row) => (
                        <tr key={row.line} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.line}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{row.spec}</td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">{row.qty}</td>
                          {(["a", "b", "c", "d"] as const).map((bk) => (
                            <td
                              key={bk}
                              className={`px-4 py-3 text-right tabular-nums font-medium ${
                                row.best === bk ? "text-emerald-700 font-bold bg-emerald-50/70" : "text-slate-600"
                              }`}
                            >
                              {row.best === bk && (
                                <span className="inline-flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  {row[bk]}
                                </span>
                              )}
                              {row.best !== bk && row[bk]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="px-4 py-4" colSpan={2}>{t.boq.totals.label}</td>
                        <td className="px-4 py-4" />
                        <td className="px-4 py-4 text-right tabular-nums">{t.boq.totals.a}</td>
                        <td className="px-4 py-4 text-right tabular-nums">{t.boq.totals.b}</td>
                        <td className="px-4 py-4 text-right tabular-nums">{t.boq.totals.c}</td>
                        <td className="px-4 py-4 text-right tabular-nums bg-emerald-500">
                          <span className="inline-flex items-center gap-1.5">
                            {t.boq.totals.d}
                            <span className="text-[10px] font-semibold text-emerald-50 bg-emerald-700/60 rounded px-1.5 py-0.5">
                              {t.boq.totals.delta}
                            </span>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  {t.boq.footnote}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* PAIN POINTS */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="relative rounded-2xl overflow-hidden mb-12 bg-slate-100 shadow-xl">
                <div className="relative aspect-[16/10] md:aspect-[21/9] lg:aspect-[24/8]">
                  <img
                    src="/industries/construction.jpg"
                    alt={isEN ? "Site manager frustrated over delayed construction materials" : "Kierownik budowy zniecierpliwiony opóźnieniem materiałów"}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/55 to-slate-950/15" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14">
                    <span className="inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/90 border border-red-300/40 text-[11px] font-bold text-white uppercase tracking-wider mb-3 backdrop-blur-sm">
                      <AlertTriangle className="h-3 w-3" />
                      {isEN ? "What's breaking" : "Co się psuje"}
                    </span>
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
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-red-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-extrabold tracking-tight text-red-700 tabular-nums">{p.metric}</div>
                    </div>
                    <h3 className="text-base font-bold mb-2 leading-snug">{p.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECT TYPES */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.projectTypes.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.projectTypes.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {t.projectTypes.types.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold mb-3">{p.name}</h3>
                  <ul className="space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <div className="mt-1.5 h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* VERIFICATION CHECKLIST */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
              <RevealOnScroll>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                    <ShieldCheck className="h-3 w-3" />
                    {isEN ? "Qualification" : "Kwalifikacja"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.verification.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{t.verification.subtitle}</p>
                  <Link
                    to={pathFor("featuresHub")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                  >
                    {isEN ? "How AI screening works" : "Jak działa screening AI"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </RevealOnScroll>

              <RevealOnScroll>
                <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)]">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {isEN ? "Auto-verification checklist" : "Checklista auto-weryfikacji"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                      {isEN ? "AI" : "AI"}
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {t.verification.items.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50/40 transition-colors"
                      >
                        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        </div>
                        <span className="text-sm text-slate-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* PUBLIC VS PRIVATE TENDER */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 max-w-3xl">{t.tenderFlow.title}</h2>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { data: t.tenderFlow.public, tone: "border-violet-200 bg-violet-50/50", chip: "bg-violet-100 text-violet-800", iconBg: "bg-violet-100 text-violet-700", tag: isEN ? "Regulated" : "Regulowany" },
                { data: t.tenderFlow.private, tone: "border-primary/20 bg-primary/[0.04]", chip: "bg-primary/15 text-primary", iconBg: "bg-primary/10 text-primary", tag: isEN ? "Flexible" : "Elastyczny" },
              ].map((col, i) => (
                <RevealOnScroll key={col.data.title}>
                  <div className={`rounded-3xl border p-7 ${col.tone} h-full`}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold">{col.data.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${col.chip}`}>{col.tag}</span>
                    </div>
                    <ul className="space-y-2.5">
                      {col.data.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <div className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${col.iconBg} shrink-0 mt-0.5`}>
                            <span className="text-[11px] font-bold">{i === 0 ? "§" : "✓"}</span>
                          </div>
                          <span className="text-sm text-slate-700 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION BANNER */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="relative overflow-hidden rounded-3xl aspect-[21/9] sm:aspect-[21/8]">
                <img src="/industries/construction-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'Verified suppliers before you break ground.' : 'Zweryfikowani dostawcy zanim wbijesz łopatę.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CASE STUDY WITH BREAKDOWN */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px] bg-amber-400 pointer-events-none" />
                <div className="absolute -bottom-10 -left-20 w-[300px] h-[300px] rounded-full opacity-[0.05] blur-[80px] bg-primary pointer-events-none" />

                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white/80 uppercase tracking-[0.15em] mb-4">
                    <Wallet className="h-3 w-3" />
                    {t.caseStudy.badge}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{t.caseStudy.title}</h2>
                  <p className="text-white/75 leading-relaxed max-w-2xl mb-8">{t.caseStudy.body}</p>

                  <div className="space-y-3 max-w-2xl">
                    {t.caseStudy.breakdown.map((b, i) => (
                      <motion.div
                        key={b.label}
                        initial={{ opacity: 0, width: 0 }}
                        whileInView={{ opacity: 1, width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12, duration: 0.7, ease: "easeOut" }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-36 shrink-0 text-sm text-white/90 font-medium">{b.label}</div>
                        <div className="flex-1 h-8 rounded-lg bg-white/10 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${b.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-lg"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white tabular-nums drop-shadow">{b.value}</span>
                        </div>
                      </motion.div>
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
                <motion.details
                  key={item.q}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group rounded-2xl border border-slate-200 bg-white hover:border-primary/30 transition-colors"
                >
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-600 text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-amber-300 pointer-events-none" />
              <div className="absolute bottom-10 -left-20 w-[250px] h-[250px] rounded-full opacity-[0.15] blur-[80px] bg-white pointer-events-none" />

              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={appendUtm(APP_URL, "industry_construction_footer_primary")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick("industry_construction_footer_primary")}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-primary hover:bg-amber-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link
                  to={`${pathFor("contact")}?interest=industry_construction#calendar`}
                  onClick={() => trackCtaClick("industry_construction_footer_secondary")}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all"
                >
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
