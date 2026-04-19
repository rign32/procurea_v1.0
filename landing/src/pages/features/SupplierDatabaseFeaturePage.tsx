import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Database, Users, Tag, Filter, ShieldCheck, Building2,
  Phone, Mail, Linkedin, Calendar, Award, History, Layers, Heart, GitMerge, FileSpreadsheet, Sparkles,
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
    badge: isEN ? "Supplier Database" : "Baza Dostawców",
    sub: isEN ? "Supplier CRM, actually useful" : "Supplier CRM, który faktycznie działa",
    title: isEN ? "Every vendor you've ever sourced — scored, enriched, tagged, and ready to re-activate" : "Każdy vendor, którego kiedykolwiek szukałeś — oceniony, wzbogacony, otagowany, gotowy do re-aktywacji",
    subtitle: isEN
      ? "Not a static spreadsheet. A living supplier CRM: AI scores, multi-contact per vendor, full campaign history, relationship health, certification tracking, dedup, tags, saved views. Every campaign makes it smarter."
      : "Nie statyczny arkusz. Żywy supplier CRM: oceny AI, wiele kontaktów per vendor, pełna historia kampanii, relationship health, tracking certyfikatów, dedup, tagi, zapisane widoki. Każda kampania go pogłębia.",
    primary: isEN ? "Open my supplier base" : "Otwórz moją bazę dostawców",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "1", l: isEN ? "place for every supplier" : "miejsce dla każdego dostawcy", d: isEN ? "no more vendor_list_v7.xlsx" : "koniec vendor_list_v7.xlsx" },
    { v: "5+", l: isEN ? "contacts per vendor" : "kontaktów per vendor", d: isEN ? "proc, sales, eng, mgmt" : "zakupy, sprzedaż, eng, mgmt" },
    { v: "100%", l: isEN ? "dedup across campaigns" : "dedup między kampaniami", d: isEN ? "never contact twice" : "nigdy podwójnie" },
    { v: "∞", l: isEN ? "re-runs for free" : "re-runów za darmo", d: isEN ? "on saved shortlists" : "na zapisanych shortlistach" },
  ],
  // Kanban-style stages
  kanban: {
    title: isEN ? "Supplier lifecycle, tracked across every stage" : "Lifecycle dostawcy, trackowany na każdym etapie",
    subtitle: isEN ? "Drag suppliers across stages. Or let AI Sourcing + Procurement push them automatically as campaigns progress." : "Przeciągaj dostawców między etapami. Albo pozwól AI Sourcing + Procurement pushować ich automatycznie z kampanii.",
    stages: isEN
      ? [
          { name: "Discovered", count: 312, tone: "slate", desc: "AI-found, initial score" },
          { name: "Qualified", count: 84, tone: "sky", desc: "Cert + capacity match" },
          { name: "Contacted", count: 42, tone: "primary", desc: "RFQ sent, awaiting quote" },
          { name: "Engaged", count: 27, tone: "amber", desc: "Offer received, in review" },
          { name: "Awarded", count: 8, tone: "emerald", desc: "PO issued" },
          { name: "Active", count: 23, tone: "violet", desc: "Ongoing relationship" },
        ]
      : [
          { name: "Odkryci", count: 312, tone: "slate", desc: "Znaleziony przez AI, początkowy score" },
          { name: "Zakwalifikowani", count: 84, tone: "sky", desc: "Dopasowanie cert + mocy" },
          { name: "Zakontaktowani", count: 42, tone: "primary", desc: "RFQ wysłane, czekamy" },
          { name: "Zaangażowani", count: 27, tone: "amber", desc: "Oferta otrzymana, review" },
          { name: "Awarded", count: 8, tone: "emerald", desc: "PO wystawione" },
          { name: "Aktywni", count: 23, tone: "violet", desc: "Trwająca relacja" },
        ],
  },
  // Supplier profile anatomy
  profile: {
    title: isEN ? "Supplier profile anatomy — everything you need, never scattered" : "Anatomia profilu dostawcy — wszystko czego potrzebujesz, nigdy rozproszone",
    subtitle: isEN ? "One card per supplier. Opens in 200ms. Everything else links back to it." : "Jedna karta per dostawca. Otwiera się w 200ms. Wszystko inne linkuje do niej.",
    vendor: {
      name: "Polfiber Sp. z o.o.",
      location: "Łódź, PL",
      flag: "🇵🇱",
      score: 87,
      health: 92,
      tags: ["Preferred", "GOTS", "Textile", "Tier-1", "PL"],
      contacts: isEN
        ? [
            { name: "Anna Kowalska", role: "Head of Procurement", email: "a.kowalska@polfiber.pl", verified: true, icon: Mail },
            { name: "Marek Nowak", role: "Key Account Sales", email: "m.nowak@polfiber.pl", verified: true, icon: Mail },
            { name: "Jan Wiśniewski", role: "Production Lead", linkedin: "Verified", verified: true, icon: Linkedin },
          ]
        : [
            { name: "Anna Kowalska", role: "Head of Procurement", email: "a.kowalska@polfiber.pl", verified: true, icon: Mail },
            { name: "Marek Nowak", role: "Key Account Sales", email: "m.nowak@polfiber.pl", verified: true, icon: Mail },
            { name: "Jan Wiśniewski", role: "Production Lead", linkedin: "Verified", verified: true, icon: Linkedin },
          ],
      certs: isEN
        ? [
            { code: "GOTS", valid: "Valid to 2027-04" },
            { code: "OEKO-TEX", valid: "Valid to 2026-12" },
            { code: "ISO 9001", valid: "Valid to 2027-09" },
          ]
        : [
            { code: "GOTS", valid: "Ważny do 2027-04" },
            { code: "OEKO-TEX", valid: "Ważny do 2026-12" },
            { code: "ISO 9001", valid: "Ważny do 2027-09" },
          ],
      history: isEN
        ? [
            { date: "2026-03", event: "Quoted — Cotton yarn RFQ", status: "Awarded", tone: "emerald" },
            { date: "2026-01", event: "Onboarded via AI campaign #218", status: "Discovered", tone: "sky" },
            { date: "2025-11", event: "Quoted — Organic cotton RFQ", status: "Rejected (price)", tone: "rose" },
          ]
        : [
            { date: "2026-03", event: "Kwotowali — RFQ przędza bawełny", status: "Awarded", tone: "emerald" },
            { date: "2026-01", event: "Onboardowani przez kampanię AI #218", status: "Odkryci", tone: "sky" },
            { date: "2025-11", event: "Kwotowali — RFQ bawełna eko", status: "Odrzucenie (cena)", tone: "rose" },
          ],
    },
  },
  // Filters & saved views
  filters: {
    title: isEN ? "Filter, tag, save — build shortlists in 10 seconds" : "Filtruj, taguj, zapisuj — buduj shortlisty w 10 sekund",
    subtitle: isEN ? "Saved views are re-runnable in one click. Share read-only with plant, quality, finance teams." : "Zapisane widoki re-run w jeden klik. Dzielisz się read-only z plant, quality, finance.",
    savedViews: isEN
      ? [
          { name: "PL/CZ textile GOTS", count: 42, scope: "Poland + Czechia • GOTS + OEKO-TEX • Textile tag" },
          { name: "Tier-1 injection, IATF", count: 18, scope: "DE + PL + IT • IATF 16949 • Injection molding" },
          { name: "Awarded last 12 months", count: 67, scope: "Status = Awarded • Last-activity ≤ 12mo" },
          { name: "At-risk (cert expiring)", count: 9, scope: "Cert expires < 90 days • Status = Active" },
        ]
      : [
          { name: "PL/CZ tekstylia GOTS", count: 42, scope: "Polska + Czechy • GOTS + OEKO-TEX • Tag Textile" },
          { name: "Tier-1 wtrysk, IATF", count: 18, scope: "DE + PL + IT • IATF 16949 • Wtrysk tworzyw" },
          { name: "Awarded ostatnie 12 mies.", count: 67, scope: "Status = Awarded • Ostatnia aktywność ≤ 12mies" },
          { name: "Ryzykowni (cert wygasa)", count: 9, scope: "Cert wygasa < 90 dni • Status = Aktywni" },
        ],
  },
  // Relationship health
  health: {
    title: isEN ? "Relationship health — the metric most Excel bases never track" : "Relationship health — metryka której większość Excel-baz nigdy nie trackuje",
    subtitle: isEN ? "A supplier's last interaction, response rate, award count and freshness of contact — one number." : "Ostatnia interakcja, response rate, liczba awardów i świeżość kontaktu — jedna liczba.",
    examples: isEN
      ? [
          { name: "Polfiber", health: 92, status: "Healthy", detail: "Awarded recently, contacts verified, certs current", tone: "emerald" },
          { name: "WeaverWorks", health: 64, status: "At risk", detail: "No activity 14 months, one contact bounced", tone: "amber" },
          { name: "OldSupplier Ltd", health: 28, status: "Stale", detail: "2+ years silent, cert expired, website redirects", tone: "rose" },
        ]
      : [
          { name: "Polfiber", health: 92, status: "Zdrowa", detail: "Niedawno awardowani, kontakty zwer., certy aktualne", tone: "emerald" },
          { name: "WeaverWorks", health: 64, status: "Ryzykowna", detail: "Brak aktywności 14 mies., jeden kontakt bounce", tone: "amber" },
          { name: "OldSupplier Ltd", health: 28, status: "Zastała", detail: "2+ lata cisza, cert wygasł, strona redirectuje", tone: "rose" },
        ],
  },
  faq: {
    title: isEN ? "Questions from procurement leads" : "Pytania od szefów procurement",
    items: isEN
      ? [
          { q: "How is this different from an Excel vendor list?", a: "Excel rots 40%/year. Supplier Database auto-updates via campaigns, tracks contact freshness, dedupes on import, and re-runs shortlists in one click. It's a database, not a snapshot." },
          { q: "Can I import my existing supplier master?", a: "Yes. CSV upload or API. Dedup runs on EIN/VAT first, fuzzy match on name+address second. You keep your internal IDs." },
          { q: "Does it integrate with SAP Ariba / Coupa?", a: "REST API on Enterprise pushes awarded suppliers as approved vendor records. Read-only views share with ERP teams without full seats." },
          { q: "What about data residency / GDPR?", a: "Data in EU infrastructure. GDPR-compliant processing. You own the records; export anytime." },
          { q: "Do I pay per supplier stored?", a: "No. Suppliers are unlimited on every tier. You pay for sourcing credits (to find new ones) and optional procurement seats (to run RFQs)." },
        ]
      : [
          { q: "Czym to się różni od Excela z vendorami?", a: "Excel starzeje się 40%/rok. Supplier Database auto-aktualizuje się z kampanii, trackuje świeżość kontaktów, dedupuje przy imporcie i re-runuje shortlisty w klik. To baza, nie snapshot." },
          { q: "Mogę zaimportować istniejący supplier master?", a: "Tak. CSV upload albo API. Dedup leci po NIP/VAT najpierw, fuzzy match po nazwa+adres. Zachowujesz swoje wewnętrzne ID." },
          { q: "Integruje z SAP Ariba / Coupa?", a: "REST API na Enterprise pushuje awardowanych jako approved vendor records. Widoki read-only udostępniasz zespołom ERP bez pełnych seatów." },
          { q: "A data residency / RODO?", a: "Dane w infrastrukturze UE. Przetwarzanie zgodne z RODO. Ty posiadasz rekordy; eksport kiedykolwiek." },
          { q: "Płacę za każdego przechowywanego dostawcę?", a: "Nie. Dostawcy nielimitowani na każdym tierze. Płacisz za kredyty sourcingu (żeby znaleźć nowych) i opcjonalne seaty procurement (żeby prowadzić RFQ)." },
        ],
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  slate: { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-400", border: "border-slate-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", border: "border-violet-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" },
}

export function SupplierDatabaseFeaturePage() {
  const v = t.profile.vendor
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-violet-500 pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}
            </Link>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[11px] font-bold text-violet-800 uppercase tracking-wider">
                    <Database className="h-3 w-3" />{t.hero.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-violet-700 italic">{t.hero.sub}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "feature_supplier_db_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_supplier_db_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">{t.hero.secondary}</Link>
                </div>
              </div>

              {/* Hero visual: compact supplier card */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-200/40 to-primary/10 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-2xl">{v.flag}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500">{v.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase text-slate-400">Score</div>
                        <div className="text-xl font-extrabold text-primary">{v.score}</div>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{isEN ? "Tags" : "Tagi"}</div>
                        <div className="flex flex-wrap gap-1">
                          {v.tags.map((tg) => <span key={tg} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800">{tg}</span>)}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isEN ? "Relationship health" : "Relationship health"}</span>
                          <span className="text-xs font-bold text-emerald-600 tabular-nums">{v.health}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${v.health}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="h-full bg-gradient-to-r from-emerald-400 to-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden">
              {t.stats.map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white p-5">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{s.v}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{s.l}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* KANBAN STAGES */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Layers className="h-3 w-3" />Kanban
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.kanban.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.kanban.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {t.kanban.stages.map((s, i) => {
                const c = toneMap[s.tone]
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border ${c.border} bg-white overflow-hidden`}>
                    <div className={`px-3 py-2 ${c.bg} border-b ${c.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${c.text} uppercase tracking-wider`}>{s.name}</span>
                        <span className={`text-xs font-bold tabular-nums ${c.text}`}>{s.count}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {[...Array(3)].map((_, k) => (
                        <div key={k} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                          <div className="h-2 w-16 rounded bg-slate-200 mb-1.5" />
                          <div className="h-1.5 w-full rounded bg-slate-100" />
                        </div>
                      ))}
                      <div className="text-[10px] text-slate-500 italic pt-1">{s.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PROFILE ANATOMY */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.profile.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.profile.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                {/* Profile header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r from-violet-50/50 to-white">
                  <div className="h-14 w-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-3xl shadow-sm">{v.flag}</div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-slate-900">{v.name}</div>
                    <div className="text-sm text-slate-500">{v.location}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Score</div>
                      <div className="text-2xl font-extrabold text-primary">{v.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Health</div>
                      <div className="text-2xl font-extrabold text-emerald-600">{v.health}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Contacts */}
                  <div className="p-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5"><Users className="h-3 w-3" />{isEN ? "Contacts" : "Kontakty"}</div>
                    <div className="space-y-2.5">
                      {v.contacts.map((ct) => (
                        <div key={ct.name} className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <ct.icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{ct.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{ct.role}</div>
                            {ct.verified && <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 font-bold mt-0.5"><ShieldCheck className="h-2.5 w-2.5" />verified</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Certs */}
                  <div className="p-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5"><Award className="h-3 w-3" />{isEN ? "Certifications" : "Certyfikaty"}</div>
                    <div className="space-y-2">
                      {v.certs.map((ct) => (
                        <div key={ct.code} className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-2.5">
                          <div className="text-xs font-bold text-emerald-800">{ct.code}</div>
                          <div className="text-[10px] text-emerald-700 mt-0.5">{ct.valid}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* History */}
                  <div className="p-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5"><History className="h-3 w-3" />{isEN ? "Campaign history" : "Historia kampanii"}</div>
                    <div className="space-y-2">
                      {v.history.map((h) => {
                        const c = toneMap[h.tone]
                        return (
                          <div key={h.event} className="relative pl-3">
                            <div className={`absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full ${c.bar}`} />
                            <div className="text-[10px] font-bold text-slate-500">{h.date}</div>
                            <div className="text-xs font-semibold text-slate-900">{h.event}</div>
                            <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>{h.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* SAVED VIEWS */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-3">
                  <Filter className="h-3 w-3" />{isEN ? "Saved views" : "Zapisane widoki"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.filters.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.filters.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-3">
              {t.filters.savedViews.map((view, i) => (
                <motion.div key={view.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{view.name}</h3>
                    <span className="text-xs font-bold tabular-nums bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">{view.count}</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed mb-3">{view.scope}</div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-700">
                    <GitMerge className="h-3 w-3" />
                    {isEN ? "Re-run RFQ against this list" : "Re-run RFQ na tej liście"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RELATIONSHIP HEALTH */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Heart className="h-3 w-3" />{isEN ? "Health metric" : "Metryka health"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.health.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.health.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="space-y-3">
              {t.health.examples.map((h, i) => {
                const c = toneMap[h.tone]
                return (
                  <motion.div key={h.name} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="grid grid-cols-[auto_1fr_auto] gap-5 items-center rounded-2xl border border-slate-200 bg-white p-4">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-slate-900">{h.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text} ${c.bg} px-1.5 py-0.5 rounded-full`}>{h.status}</span>
                      </div>
                      <div className="text-xs text-slate-500">{h.detail}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${h.health}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }} className={`h-full ${c.bar}`} />
                      </div>
                      <span className="text-sm font-extrabold tabular-nums text-slate-900 w-8 text-right">{h.health}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 to-primary text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-white pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Every campaign feeds your base" : "Każda kampania zasila Twoją bazę"}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{isEN ? "Run one AI Sourcing campaign. Your supplier base stands up automatically — scored, tagged, deduped. No setup." : "Uruchom jedną kampanię AI Sourcing. Twoja baza dostawców staje automatycznie — oceniona, otagowana, zdeduplikowana. Bez setupu."}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "feature_supplier_db_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_supplier_db_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-violet-700 hover:bg-violet-50 shadow-lg hover:scale-[1.02] transition-all">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
                <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all">{isEN ? "Book a demo" : "Umów demo"}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
