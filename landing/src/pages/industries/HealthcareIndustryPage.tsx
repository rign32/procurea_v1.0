import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  HeartPulse,
  Shield,
  Stethoscope,
  Microscope,
  Syringe,
  Pill,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
  UserCheck,
  Calculator,
  FileWarning,
  Filter,
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
    badge: isEN ? "Healthcare & MedTech" : "Healthcare & MedTech",
    title: isEN ? "Compliance-aware sourcing for hospitals, clinics and MedTech" : "Sourcing compliance-aware dla szpitali, klinik i MedTech",
    subtitle: isEN
      ? "Sourcing that surfaces CE / MDR / FDA / ISO 13485 signals early — so regulated-goods buyers stop chasing certificates over email. Build backup pools for disposables, devices and consumables so a single audit failure doesn't stop the theatre list."
      : "Sourcing, który wyciąga sygnały CE / MDR / FDA / ISO 13485 wcześnie — żeby kupcy wyrobów regulowanych przestali ganiać certyfikaty mailem. Zbuduj backup pule jednorazówek, wyrobów i consumables, żeby jeden audyt nie zatrzymał listy operacyjnej.",
    primary: isEN ? "Start a sourcing campaign" : "Rozpocznij kampanię sourcingową",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { value: "2× faster", label: isEN ? "shortlist cycle" : "cykl shortlisty", detail: isEN ? "vs. manual spreadsheet sourcing" : "vs. ręczne sourcowanie w Excelu" },
    { value: "CE · MDR", label: isEN ? "flagged at screening" : "flagowane przy screeningu", detail: isEN ? "+ FDA, ISO 13485 signals" : "+ sygnały FDA, ISO 13485" },
    { value: "Central", label: isEN ? "supplier document vault" : "centralny vault dokumentów", detail: isEN ? "Versioned, tagged, expiry-tracked" : "Wersjonowane, tagowane, śledzona ważność" },
    { value: "25+", label: isEN ? "alternatives per category" : "alternatyw per kategoria", detail: isEN ? "For PPE, disposables, lab" : "Dla PPE, jednorazówek, labu" },
  ],
  // MDR / CE compliance funnel
  funnel: {
    title: isEN ? "Compliance-aware screening — narrow early, not late" : "Screening compliance-aware — zwężaj wcześnie, nie późno",
    subtitle: isEN
      ? "The painful path is qualifying 50 vendors, then finding out most are missing certs you need. Procurea's AI pipeline surfaces certification signals from supplier websites at screening — so obvious mismatches drop before they reach your review meeting."
      : "Bolesna ścieżka to kwalifikacja 50 vendorów, potem odkrycie że większości brakuje potrzebnych certyfikatów. Pipeline AI Procurea wyciąga sygnały certyfikatów ze stron dostawców już na screeningu — oczywiste niepasowania odpadają zanim trafią na Twoje spotkanie review.",
    stages: isEN
      ? [
          { label: "Candidates discovered", count: 240, width: 100, tone: "slate" },
          { label: "CE / regulated claim in profile", count: 170, width: 70, tone: "sky" },
          { label: "ISO / quality mark declared", count: 95, width: 40, tone: "primary" },
          { label: "Capacity + locality fit", count: 40, width: 17, tone: "emerald" },
          { label: "Shortlist for RFQ", count: 18, width: 8, tone: "amber" },
        ]
      : [
          { label: "Odkryci kandydaci", count: 240, width: 100, tone: "slate" },
          { label: "Deklaracja CE / wyrób regulowany", count: 170, width: 70, tone: "sky" },
          { label: "Deklarowany znak ISO / jakości", count: 95, width: 40, tone: "primary" },
          { label: "Moce + lokalizacja OK", count: 40, width: 17, tone: "emerald" },
          { label: "Shortlista do RFQ", count: 18, width: 8, tone: "amber" },
        ],
    summary: isEN ? "Illustrative funnel — actual numbers depend on category and region. You still verify certificates against source documents before award." : "Lejek ilustracyjny — rzeczywiste liczby zależą od kategorii i regionu. Certyfikaty przed udzieleniem zamówienia weryfikujesz u źródła.",
  },
  // 3-step approval workflow
  workflow: {
    title: isEN ? "Three review perspectives, one shared workspace" : "Trzy perspektywy review, jeden wspólny workspace",
    subtitle: isEN
      ? "Clinical, compliance and finance stakeholders review the same shortlist from different angles. Procurea centralizes supplier documents, offers and comments — so reviewers work from one source instead of forwarded PDFs."
      : "Zespoły kliniczne, compliance i finansowe patrzą na tę samą shortlistę z różnych kątów. Procurea centralizuje dokumenty dostawców, oferty i komentarze — reviewerzy pracują na jednym źródle zamiast forwardowanych PDF-ów.",
    steps: isEN
      ? [
          {
            icon: Stethoscope,
            tone: "rose",
            role: "Clinical perspective",
            scope: "Product fit, sample validation, peer references — captured as supplier notes and attachments",
            evidence: ["Sample results (uploaded)", "Clinical references (notes)", "Product spec match"],
          },
          {
            icon: Shield,
            tone: "primary",
            role: "Compliance perspective",
            scope: "Certificate tracking in the supplier vault — CE, MDR, FDA, ISO 13485 uploads, expiry dates, document versions",
            evidence: ["Certificate files (versioned)", "Declaration of conformity", "Expiry date tracking"],
          },
          {
            icon: Calculator,
            tone: "emerald",
            role: "Finance perspective",
            scope: "TCO, payment terms, volume tiers — compared side-by-side in the offer comparison view",
            evidence: ["Price per unit at volume", "Payment schedule", "Annual spend projection"],
          },
        ]
      : [
          {
            icon: Stethoscope,
            tone: "rose",
            role: "Perspektywa kliniczna",
            scope: "Dopasowanie produktu, walidacja sampli, referencje — notowane jako notatki i załączniki przy dostawcy",
            evidence: ["Wyniki sampli (upload)", "Referencje kliniczne (notatki)", "Zgodność ze specyfikacją"],
          },
          {
            icon: Shield,
            tone: "primary",
            role: "Perspektywa compliance",
            scope: "Tracking certyfikatów w vaulcie dostawcy — uploady CE, MDR, FDA, ISO 13485, daty ważności, wersje dokumentów",
            evidence: ["Pliki certyfikatów (wersjonowane)", "Deklaracja zgodności", "Śledzenie dat ważności"],
          },
          {
            icon: Calculator,
            tone: "emerald",
            role: "Perspektywa finansowa",
            scope: "TCO, warunki płatności, progi wolumenowe — porównane side-by-side w porównywarce ofert",
            evidence: ["Cena/szt. po wolumenie", "Harmonogram płatności", "Projekcja wydatków rocznych"],
          },
        ],
  },
  // Supplier dossier preview
  dossier: {
    title: isEN ? "The supplier document vault — one place per supplier, versioned" : "Vault dokumentów dostawcy — jedno miejsce per dostawca, wersjonowane",
    subtitle: isEN
      ? "Every supplier profile has a document area. Your team uploads certificates, declarations and campaign artifacts — Procurea tracks categories, tags, versions, upload dates and (where provided) expiry dates. Below: example document types a hospital procurement team typically keeps."
      : "Każdy profil dostawcy ma sekcję dokumentów. Twój zespół uploaduje certyfikaty, deklaracje i artefakty kampanii — Procurea śledzi kategorie, tagi, wersje, daty uploadu i (tam gdzie podano) daty ważności. Poniżej: przykładowe typy dokumentów, które zespół procurement szpitala zwykle trzyma.",
    items: isEN
      ? [
          { label: "Legal entity & VAT", status: "VIES verified" },
          { label: "CE declaration of conformity", status: "Uploaded" },
          { label: "MDR technical documentation", status: "Uploaded" },
          { label: "ISO 13485 certificate", status: "Expiry: 2027-06" },
          { label: "FDA establishment reg. (if US)", status: "Uploaded" },
          { label: "Quality manual", status: "Uploaded" },
          { label: "Post-market surveillance plan", status: "Uploaded" },
          { label: "Clinical evaluation report", status: "Uploaded" },
          { label: "Product labeling samples", status: "Uploaded" },
          { label: "Notified body certificate", status: "Expiry tracked" },
          { label: "Recall history notes", status: "Free-text" },
          { label: "Campaign outcome history", status: "Auto-logged" },
        ]
      : [
          { label: "Osobowość prawna & VAT", status: "VIES zweryfikowane" },
          { label: "Deklaracja zgodności CE", status: "Uploadowane" },
          { label: "Dokumentacja techniczna MDR", status: "Uploadowane" },
          { label: "Certyfikat ISO 13485", status: "Ważność: 2027-06" },
          { label: "FDA establishment reg. (jeśli US)", status: "Uploadowane" },
          { label: "Księga jakości", status: "Uploadowane" },
          { label: "Plan nadzoru post-market", status: "Uploadowane" },
          { label: "Raport oceny klinicznej", status: "Uploadowane" },
          { label: "Próbki etykietowania", status: "Uploadowane" },
          { label: "Certyfikat jednostki notyfikowanej", status: "Śledzenie ważności" },
          { label: "Notatki o historii wycofań", status: "Free-text" },
          { label: "Historia kampanii", status: "Auto-logged" },
        ],
  },
  // Categories
  categories: {
    title: isEN ? "Where healthcare procurement wins with Procurea" : "Gdzie procurement medyczny wygrywa z Procurea",
    items: isEN
      ? [
          { icon: Syringe, name: "Disposables", examples: "Surgical, PPE, infusion sets, catheters" },
          { icon: HeartPulse, name: "Medical devices", examples: "Monitoring, imaging, therapeutic, surgical" },
          { icon: Microscope, name: "Lab equipment", examples: "Analyzers, centrifuges, reagents, consumables" },
          { icon: Pill, name: "Pharma & APIs", examples: "Generics, excipients, contract manufacturers" },
          { icon: Shield, name: "PPE & infection control", examples: "Masks, gowns, gloves, disinfectants" },
          { icon: FileCheck2, name: "Clinical consumables", examples: "Dressings, sutures, wound care, lab plastics" },
        ]
      : [
          { icon: Syringe, name: "Jednorazówki", examples: "Chirurgiczne, PPE, infuzyjne, cewniki" },
          { icon: HeartPulse, name: "Wyroby medyczne", examples: "Monitorowanie, obrazowanie, terapia, chirurgia" },
          { icon: Microscope, name: "Sprzęt laboratoryjny", examples: "Analizatory, wirówki, odczynniki, consumables" },
          { icon: Pill, name: "Pharma & API", examples: "Generyki, substancje pomocnicze, contract mfg" },
          { icon: Shield, name: "PPE & kontrola zakażeń", examples: "Maski, fartuchy, rękawice, dezynfektanty" },
          { icon: FileCheck2, name: "Consumables kliniczne", examples: "Opatrunki, szwy, wound care, plastyki lab" },
        ],
  },
  pains: {
    title: isEN ? "Where medical procurement breaks" : "Gdzie łamie się procurement medyczny",
    items: [
      {
        metric: "5 weeks",
        heading: isEN ? "typical MDR qualification cycle" : "typowy cykl kwalifikacji MDR",
        body: isEN ? "Emailing certificates, cross-checking notified body registries, validating technical files — manually, per supplier. Procurea cuts this to under 2 weeks." : "Maile z certyfikatami, cross-check rejestrów jednostek notyfikowanych, walidacja plików technicznych — ręcznie, per dostawca. Procurea ścina do poniżej 2 tygodni.",
        icon: FileWarning,
      },
      {
        metric: "3 vendors",
        heading: isEN ? "average backup pool for critical disposables" : "średnia pula backupu dla krytycznych jednorazówek",
        body: isEN ? "When one supplier fails an audit — or a pandemic hits — 3 is not enough. Hospitals need 15+ pre-qualified alternatives they can activate in days." : "Gdy jeden dostawca nie przechodzi audytu — albo uderza pandemia — 3 to za mało. Szpitale potrzebują 15+ pre-zakwalifikowanych alternatyw do aktywacji w dniach.",
        icon: FileCheck2,
      },
      {
        metric: "Zero",
        heading: isEN ? "single source of truth for supplier docs" : "single source of truth dla dokumentów dostawców",
        body: isEN ? "Certificates live in emails, cabinets and shared drives. When auditors ask for a specific dossier, it takes 2 days to reconstruct. Procurea stores everything linked to the supplier profile." : "Certyfikaty żyją w mailach, szafach i shared drive. Gdy audytorzy proszą o konkretne dossier, 2 dni na odtworzenie. Procurea trzyma wszystko podpięte do profilu dostawcy.",
        icon: ClipboardCheck,
      },
    ],
  },
  caseStudy: {
    badge: isEN ? "Illustrative scenario — regional hospital network" : "Scenariusz ilustracyjny — regionalna sieć szpitali",
    title: isEN ? "25 new CE/ISO 13485 disposable suppliers qualified in 10 days after audit failure" : "25 nowych dostawców jednorazówek z CE/ISO 13485 zakwalifikowanych w 10 dni po porażce audytu",
    body: isEN
      ? "After the primary disposables supplier failed a compliance audit, the procurement team needed audit-ready alternatives fast. Procurea ran MDR + ISO 13485 pre-screening across 240 candidates and delivered 25 qualified vendors with complete dossiers within 10 days — compared to a usual 5-week cycle."
      : "Po porażce audytu compliance głównego dostawcy jednorazówek, zespół procurement potrzebował szybko audit-ready alternatyw. Procurea uruchomiła pre-screening MDR + ISO 13485 na 240 kandydatach i dostarczyła 25 zakwalifikowanych vendorów z pełnymi dossier w 10 dni — vs. zwykły 5-tygodniowy cykl.",
    highlights: isEN
      ? [
          { v: "240", l: "Candidates screened" },
          { v: "25", l: "Audit-ready shortlist" },
          { v: "10 days", l: "End-to-end cycle" },
          { v: "0", l: "Theatre days lost" },
        ]
      : [
          { v: "240", l: "Kandydatów screenowanych" },
          { v: "25", l: "Audit-ready shortlista" },
          { v: "10 dni", l: "Cykl end-to-end" },
          { v: "0", l: "Straconych dni operacyjnych" },
        ],
  },
  faq: {
    title: isEN ? "Questions from hospital procurement and MedTech buyers" : "Pytania od procurement szpitalnego i kupujących MedTech",
    items: isEN
      ? [
          { q: "How do you verify CE, MDR and ISO 13485 in practice?", a: "Our AI extracts certification signals from supplier websites at screening — company self-declarations, certificate numbers, logos and text references. This is a first-pass filter, not a regulatory verification. Actual verification happens when bidders upload certificate files via the Supplier Portal — Procurea stores them in the document vault with expiry dates, versions and tags. For authoritative registry checks (NANDO, FDA establishment database) your compliance team still queries source systems — we surface the data to make that faster, but we don't claim to be a replacement for them." },
          { q: "Do you store documents in a GDPR / HIPAA compliant way?", a: "Documents are stored encrypted in EU infrastructure. We don't process patient data. Supplier documents (certificates, declarations) are retained according to your audit retention policy." },
          { q: "Can Procurea integrate with our ERP (SAP, Oracle, Epicor)?", a: "Yes — via API or Merge.dev for common ERPs. Award decisions can be pushed as approved supplier records. Procurement teams typically keep Procurea as the qualification/comparison layer and push validated suppliers into ERP as system-of-record." },
          { q: "What about small-volume highly-specialized items (e.g. specific catheter types)?", a: "Procurea still helps — the filter criteria just get narrower (MDR class, specific intended use, clinical references). You may see fewer alternatives, but you see the ones that actually exist." },
          { q: "How do you handle recall history and post-market surveillance?", a: "At qualification, AI surfaces publicly available recall notices and flags vendors with recent serious-incident reports. For formal post-market review, dossier items support structured audit trails." },
        ]
      : [
          { q: "Jak weryfikujecie CE, MDR i ISO 13485 w praktyce?", a: "Nasza AI wyciąga sygnały certyfikatów ze stron dostawców na screeningu — samodeklaracje firmy, numery certyfikatów, logo i odniesienia w tekście. To jest pierwszy filtr, nie regulacyjna weryfikacja. Faktyczna weryfikacja następuje, gdy dostawcy uploadują pliki certyfikatów przez Supplier Portal — Procurea trzyma je w vaulcie dokumentów z datami ważności, wersjami i tagami. Autorytatywne sprawdzenia w rejestrach (NANDO, baza FDA establishment) Twój zespół compliance nadal robi w systemach źródłowych — my wystawiamy dane, żeby było to szybsze, ale nie zastępujemy tych narzędzi." },
          { q: "Czy przechowujecie dokumenty zgodnie z RODO / HIPAA?", a: "Dokumenty są szyfrowane w infrastrukturze UE. Nie przetwarzamy danych pacjentów. Dokumenty dostawców (certyfikaty, deklaracje) są retencjonowane zgodnie z Twoją polityką audytową." },
          { q: "Czy Procurea integruje się z naszym ERP (SAP, Oracle, Epicor)?", a: "Tak — przez API lub Merge.dev dla popularnych ERP. Decyzje award mogą być pushowane jako zatwierdzone rekordy dostawców. Zespoły procurement zwykle trzymają Procurea jako warstwę kwalifikacji/porównania i pushują zwalidowanych do ERP jako system-of-record." },
          { q: "A małe wolumeny wysoce specjalistyczne (np. konkretne typy cewników)?", a: "Procurea nadal pomaga — kryteria filtrów są węższe (klasa MDR, konkretne intended use, referencje kliniczne). Zobaczysz mniej alternatyw, ale zobaczysz te które realnie istnieją." },
          { q: "Jak radzicie sobie z historią wycofań i nadzorem post-market?", a: "Przy kwalifikacji AI wyciąga publicznie dostępne zawiadomienia o wycofaniach i flaguje dostawców ze świeżymi raportami poważnych incydentów. Do formalnego przeglądu post-market elementy dossier wspierają ustrukturyzowane audit trails." },
        ],
  },
  cta: {
    title: isEN ? "Start building your compliance-aware supplier pool" : "Zacznij budować swoją pulę dostawców z naciskiem na compliance",
    body: isEN ? "Bring one critical category. In 30 minutes we'll walk through the sourcing pipeline, certificate tracking and the supplier document vault." : "Przynieś jedną krytyczną kategorię. W 30 minut przejdziemy przez pipeline sourcingowy, tracking certyfikatów i vault dokumentów dostawców.",
    primary: isEN ? "Start free" : "Zacznij za darmo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  slate: { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-400", border: "border-slate-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", border: "border-violet-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" },
}

export function HealthcareIndustryPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-teal-400 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("industriesHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All industries" : "Wszystkie branże"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 border border-teal-200 text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-5">
                  <HeartPulse className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "industry_healthcare_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_healthcare_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={`${pathFor("contact")}?interest=industry_healthcare#calendar`} onClick={() => trackCtaClick("industry_healthcare_hero_secondary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">
                    {t.hero.secondary}
                  </Link>
                </div>
              </div>

              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-100/60 to-primary/10 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {isEN ? "Supplier dossier — summary" : "Dossier dostawcy — podsumowanie"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">{isEN ? "Audit ready" : "Audit ready"}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                        <UserCheck className="h-10 w-10 text-primary" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">MedDis Europe SA</div>
                          <div className="text-[11px] text-slate-500">{isEN ? "Surgical disposables, EU" : "Jednorazówki chirurgiczne, UE"}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        {["CE marked", "MDR class IIa", "ISO 13485:2016", "FDA 510(k)", "Clean recall history"].map((x) => (
                          <div key={x} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-slate-700 font-medium">{x}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{isEN ? "Last verified" : "Ostatnia weryfikacja"}</span>
                        <span className="font-bold text-slate-900">2026-04-12</span>
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

        {/* FUNNEL */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Filter className="h-3 w-3" />
                  {isEN ? "Compliance funnel" : "Lejek compliance"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.funnel.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.funnel.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="max-w-3xl mx-auto space-y-2">
              {t.funnel.stages.map((st, i) => {
                const tone = toneMap[st.tone]
                return (
                  <motion.div
                    key={st.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-52 shrink-0 text-sm font-semibold text-slate-700 text-right">{st.label}</div>
                    <div className="flex-1 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${st.width}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                        className={`h-12 rounded-lg ${tone.bar} flex items-center px-4 shadow-sm`}
                      >
                        <span className="text-sm font-bold text-white tabular-nums">{st.count}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-8 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                {t.funnel.summary}
              </span>
            </div>
          </div>
        </section>

        {/* APPROVAL WORKFLOW */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.workflow.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.workflow.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-4">
              {t.workflow.steps.map((s, i) => {
                const tone = toneMap[s.tone]
                return (
                  <motion.div
                    key={s.role}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border ${tone.border} bg-white p-6 relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${tone.bar}`} />
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone.bg} ${tone.text} mb-4`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${tone.text}`}>{isEN ? `Step ${i + 1}` : `Krok ${i + 1}`}</div>
                    <h3 className="text-lg font-bold mb-2">{s.role}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{s.scope}</p>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">{isEN ? "Evidence surfaced" : "Dowody wyciągane"}</div>
                      <ul className="space-y-1.5">
                        {s.evidence.map((e) => (
                          <li key={e} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <CheckCircle2 className={`h-3.5 w-3.5 ${tone.text} shrink-0 mt-0.5`} />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* DOSSIER CHECKLIST */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
              <RevealOnScroll>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                    <ClipboardCheck className="h-3 w-3" />
                    {isEN ? "Dossier" : "Dossier"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.dossier.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t.dossier.subtitle}</p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll>
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{isEN ? "Audit dossier — sample" : "Dossier audytowe — sample"}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">{isEN ? "Complete" : "Kompletne"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    <ul className="divide-y divide-slate-50">
                      {t.dossier.items.slice(0, 6).map((item, i) => (
                        <motion.li key={item.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2.5 px-4 py-2.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs text-slate-700 flex-1">{item.label}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{item.status}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <ul className="divide-y divide-slate-50">
                      {t.dossier.items.slice(6).map((item, i) => (
                        <motion.li key={item.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: (i + 6) * 0.04 }} className="flex items-center gap-2.5 px-4 py-2.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs text-slate-700 flex-1">{item.label}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{item.status}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>
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
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
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
                    src="/industries/healthcare.jpg"
                    alt={isEN ? "Hospital procurement manager reviewing CE/MDR compliance documents" : "Hospital procurement manager weryfikuje dokumenty zgodności CE/MDR"}
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
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-teal-50" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-extrabold text-teal-800 tabular-nums">{p.metric}</div>
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
                <img src="/industries/healthcare-solution.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200 mb-3">
                    {isEN ? 'After Procurea' : 'Po Procurea'}
                  </span>
                  <div className="max-w-2xl text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {isEN ? 'Every certificate verified. Every supplier audit-ready.' : 'Każdy certyfikat zweryfikowany. Każdy dostawca gotowy na audyt.'}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CASE STUDY */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="rounded-3xl bg-gradient-to-br from-teal-800 to-primary text-white p-8 md:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.12] blur-[100px] bg-white pointer-events-none" />
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-emerald-300 pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.cta.title}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{t.cta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "industry_healthcare_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("industry_healthcare_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-teal-700 hover:bg-teal-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link to={`${pathFor("contact")}?interest=industry_healthcare#calendar`} onClick={() => trackCtaClick("industry_healthcare_footer_secondary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">
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
