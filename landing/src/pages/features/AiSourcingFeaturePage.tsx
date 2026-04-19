import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Brain, Search, BarChart3, Sparkles, ShieldCheck,
  Globe, Languages, Zap, CheckCircle2, FileSpreadsheet, Database, TrendingUp, Cpu, Award,
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
    badge: "AI Sourcing",
    title: isEN ? "50–250 verified vendors in 20 minutes — from one sentence" : "50–250 zweryfikowanych dostawców w 20 minut — z jednego zdania",
    subtitle: isEN
      ? "Plain-language brief → 4-agent AI pipeline → scored, enriched, deduplicated shortlist. 26 languages, not just English. First 20 vendors in 3 minutes, full list in 20, Excel-ready, no manual paging through Google."
      : "Brief w naturalnym języku → 4-agentowy pipeline AI → ocenione, wzbogacone, zdeduplikowane shortlisty. 26 języków, nie tylko angielski. Pierwsze 20 vendorów w 3 minuty, pełna lista w 20, gotowa do Excela, bez ręcznego kartkowania Google.",
    primary: isEN ? "Start free — 10 campaigns" : "Zacznij za darmo — 10 kampanii",
    secondary: isEN ? "See live pipeline" : "Zobacz pipeline na żywo",
  },
  stats: [
    { v: "26", l: isEN ? "languages natively" : "języków natywnie", d: isEN ? "EU + global directories" : "UE + globalne katalogi" },
    { v: "120", l: isEN ? "avg vendors / campaign" : "średnio vendorów / kampania", d: isEN ? "50–250 range" : "zakres 50–250" },
    { v: "10", l: isEN ? "free credits on signup" : "darmowych kredytów przy starcie", d: isEN ? "no card required" : "bez karty" },
    { v: "85%", l: isEN ? "capability-match precision" : "precyzja dopasowania", d: isEN ? "measured vs manual review" : "mierzone vs ręczny review" },
  ],
  pipeline: {
    title: isEN ? "Pipeline architecture — 4 agents, one prompt" : "Architektura pipeline — 4 agenty, jeden prompt",
    subtitle: isEN
      ? "Every campaign runs the same deterministic AI flow. Each stage narrows the pool and enriches the survivors. You watch progress live."
      : "Każda kampania uruchamia ten sam deterministyczny flow AI. Każdy etap zwęża pulę i wzbogaca tych którzy przeszli. Postęp oglądasz na żywo.",
    stages: isEN
      ? [
          { icon: Brain, name: "Strategy", role: "Plans multi-market search", tone: "sky", bullets: ["Decomposes your brief into sub-categories", "Picks 5–15 most relevant countries", "Generates 20–40 queries per country in local language", "Selects directories (Kompass, Europages, Wer liefert was, national chambers)"], output: "Query budget plan" },
          { icon: Search, name: "Scanning", role: "Parallel web crawl", tone: "amber", bullets: ["20 worker threads in parallel", "Serper.dev + direct directory crawls", "National company registries", "90-day disk cache (~50% cost cut on re-runs)"], output: "Raw candidate URLs" },
          { icon: BarChart3, name: "Screener", role: "Scores every supplier", tone: "primary", bullets: ["LLM reads each website + evidence", "Capability match against brief", "Certification heuristics (ISO, IATF, FDA, CE...)", "Red-flag detection (dormant, broken contact)"], output: "Score 0–100 + reasoning" },
          { icon: Sparkles, name: "Enrichment", role: "Fills in the gaps", tone: "emerald", bullets: ["Decision-maker contacts (email, LinkedIn)", "Certification evidence (document URLs)", "Dedup against existing Supplier Database", "Company-size and footprint data"], output: "Complete supplier profile" },
          { icon: ShieldCheck, name: "Auditor", role: "Final validation", tone: "violet", bullets: ["Cross-checks capability claims", "Flags inconsistencies to the reviewer", "Verifies contact deliverability signals", "Writes the qualification rationale"], output: "Audit-ready shortlist" },
        ]
      : [
          { icon: Brain, name: "Strategy", role: "Planuje search multi-market", tone: "sky", bullets: ["Dekomponuje brief na podkategorie", "Wybiera 5–15 najbardziej relewantnych krajów", "Generuje 20–40 zapytań per kraj w lokalnym języku", "Wybiera katalogi (Kompass, Europages, Wer liefert was, izby krajowe)"], output: "Plan budżetu zapytań" },
          { icon: Search, name: "Scanning", role: "Równoległy crawl webu", tone: "amber", bullets: ["20 worker threads równolegle", "Serper.dev + bezpośrednie crawle katalogów", "Krajowe rejestry spółek", "90-dniowy cache (~50% oszczędność przy re-runie)"], output: "Surowe URL-e kandydatów" },
          { icon: BarChart3, name: "Screener", role: "Ocenia każdego dostawcę", tone: "primary", bullets: ["LLM czyta każdą stronę + dowody", "Dopasowanie capability do briefu", "Heurystyki certyfikatów (ISO, IATF, FDA, CE...)", "Detekcja red-flagów (uśpione, zepsute kontakty)"], output: "Score 0–100 + uzasadnienie" },
          { icon: Sparkles, name: "Enrichment", role: "Uzupełnia luki", tone: "emerald", bullets: ["Kontakty do decydentów (email, LinkedIn)", "Dowody certyfikatów (URL dokumentów)", "Dedup względem istniejącej Bazy Dostawców", "Dane wielkości i footprintu"], output: "Kompletny profil dostawcy" },
          { icon: ShieldCheck, name: "Auditor", role: "Finalna walidacja", tone: "violet", bullets: ["Cross-check deklaracji capability", "Flaguje niespójności do reviewera", "Weryfikuje sygnały dostarczalności", "Pisze uzasadnienie kwalifikacji"], output: "Shortlista audit-ready" },
        ],
  },
  brief: {
    title: isEN ? "From a sentence to a structured search" : "Ze zdania do ustrukturyzowanego searchu",
    subtitle: isEN ? "You write how you'd brief a colleague. AI parses it into filters, certifications, regions and capacity." : "Piszesz tak jak briefujesz kolegę. AI parsuje to na filtry, certyfikaty, regiony i moce.",
    prompt: isEN
      ? "Injection-molding vendors in the EU for automotive interior parts, IATF 16949 required, 50k–500k units/year, lead time under 8 weeks."
      : "Wtryskarnie w UE do części wnętrz motoryzacyjnych, wymagany IATF 16949, 50k–500k szt./rok, lead time poniżej 8 tygodni.",
    chips: isEN
      ? [
          { label: "Category", val: "Plastic injection", tone: "primary" },
          { label: "Region", val: "EU (15 countries)", tone: "sky" },
          { label: "Certification", val: "IATF 16949", tone: "emerald" },
          { label: "Vertical", val: "Automotive interior", tone: "amber" },
          { label: "Volume", val: "50k–500k / yr", tone: "violet" },
          { label: "Lead time", val: "< 8 weeks", tone: "rose" },
        ]
      : [
          { label: "Kategoria", val: "Wtrysk tworzyw", tone: "primary" },
          { label: "Region", val: "UE (15 krajów)", tone: "sky" },
          { label: "Certyfikat", val: "IATF 16949", tone: "emerald" },
          { label: "Branża", val: "Wnętrza motoryzacyjne", tone: "amber" },
          { label: "Wolumen", val: "50k–500k / rok", tone: "violet" },
          { label: "Lead time", val: "< 8 tyg.", tone: "rose" },
        ],
  },
  scoring: {
    title: isEN ? "Scoring anatomy — every vendor dissected" : "Anatomia scoringu — każdy vendor rozbity",
    subtitle: isEN ? "You see the reasoning. No black box." : "Widzisz uzasadnienie. Bez czarnej skrzynki.",
    signals: isEN
      ? [
          { label: "Capability match", score: 92, tone: "emerald", detail: "Injection molding, PA66, automotive — website evidence strong" },
          { label: "Certification", score: 100, tone: "sky", detail: "IATF 16949:2016 valid to 2027-03, cert PDF available" },
          { label: "Capacity fit", score: 78, tone: "amber", detail: "Declared 3M units/year; 10% of capacity covers your ask" },
          { label: "Trust signals", score: 85, tone: "primary", detail: "17 clients listed, 4 automotive case studies, ISO wall-of-fame" },
          { label: "Red flags", score: 95, tone: "violet", detail: "None — contact forms work, domain registered 12 years, active LinkedIn" },
        ]
      : [
          { label: "Dopasowanie capability", score: 92, tone: "emerald", detail: "Wtrysk, PA66, motoryzacja — mocne dowody na stronie" },
          { label: "Certyfikacja", score: 100, tone: "sky", detail: "IATF 16949:2016 ważny do 2027-03, PDF dostępny" },
          { label: "Dopasowanie mocy", score: 78, tone: "amber", detail: "Deklarowane 3 mln szt./rok; 10% mocy pokrywa Twój ask" },
          { label: "Sygnały zaufania", score: 85, tone: "primary", detail: "17 klientów wymienionych, 4 case studies moto, wall-of-fame ISO" },
          { label: "Red flags", score: 95, tone: "violet", detail: "Brak — formularze działają, domena 12 lat, aktywny LinkedIn" },
        ],
    total: 90,
  },
  faq: {
    title: isEN ? "Questions before you start" : "Pytania zanim zaczniesz",
    items: isEN
      ? [
          { q: "How accurate is the AI scoring?", a: "~85% precision measured vs manual procurement review across the last 90 days of production campaigns. Top candidates should still be verified manually — AI gets you to a shortlist of 20–30 real contenders in minutes; final decision stays with your team." },
          { q: "What does one credit get me?", a: "One campaign = one credit. Returns 50–250 qualified vendors (niche = lower, mainstream = higher). Average ~120/credit. 10 free credits = 10 full production campaigns." },
          { q: "Which certifications can I filter on?", a: "ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS, GOTS, GMP, ISO 22716, ISO 14001, ISO 27001 and more. Filter applied at Screener stage — non-compliant vendors never reach enrichment." },
          { q: "Can I export to my ERP / Ariba / Coupa?", a: "One-click Excel on every tier. REST API for SAP Ariba, Coupa, Salesforce, custom ERP on Enterprise. Dedupe runs against your existing supplier master automatically." },
          { q: "What if I want to re-run a category later?", a: "90-day cache TTL means a follow-up campaign costs roughly half and finishes in minutes. New directory entries are picked up automatically; cached duplicates are skipped." },
        ]
      : [
          { q: "Jaka jest precyzja scoringu AI?", a: "~85% precyzji mierzonej vs ręczny procurement review na 90 dniach kampanii produkcyjnych. Top kandydatów nadal waliduj ręcznie — AI prowadzi Cię do shortlisty 20–30 realnych graczy w minuty; finalna decyzja zostaje u Ciebie." },
          { q: "Co dostaję za jeden kredyt?", a: "Jedna kampania = jeden kredyt. Zwraca 50–250 zakwalifikowanych vendorów (niche = niżej, mainstream = wyżej). Średnio ~120/kredyt. 10 darmowych = 10 pełnych kampanii produkcyjnych." },
          { q: "Po jakich certyfikatach mogę filtrować?", a: "ISO 9001, IATF 16949, FSC, PEFC, FDA, CE, OEKO-TEX, BRC, IFS, GOTS, GMP, ISO 22716, ISO 14001, ISO 27001 i więcej. Filtr stosowany na etapie Screenera — niezgodni nie docierają do enrichmentu." },
          { q: "Mogę eksportować do ERP / Ariba / Coupa?", a: "Jeden-click Excel na każdym tierze. REST API do SAP Ariba, Coupa, Salesforce, customowego ERP na Enterprise. Dedup leci względem Twojego existing supplier master automatycznie." },
          { q: "A co jeśli chcę re-run kategorię później?", a: "90-dniowy cache TTL oznacza że kampania follow-up kosztuje ~połowę i kończy się w minuty. Nowe wpisy katalogowe są wychwytywane; zachowane duplikaty pomijane." },
        ],
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", border: "border-violet-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" },
}

export function AiSourcingFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-sky-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-primary pointer-events-none" />
          <div className="absolute -bottom-20 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.05] blur-[120px] bg-sky-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {isEN ? "All modules" : "Wszystkie moduły"}
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-5">
                  <Brain className="h-3 w-3" />
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a href={appendUtm(APP_URL, "feature_ai_sourcing_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_ai_sourcing_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                    {t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 text-foreground hover:bg-slate-50 transition-all">{t.hero.secondary}</Link>
                </div>
              </div>

              {/* Hero visual: live pipeline card */}
              <RevealOnScroll>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-sky-100/60 blur-2xl" />
                  <div className="relative rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium"><Cpu className="h-3.5 w-3.5" />{isEN ? "Pipeline live" : "Pipeline live"}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{isEN ? "Scanning" : "Skanowanie"}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      {t.pipeline.stages.slice(0, 4).map((s, i) => {
                        const c = toneMap[s.tone]
                        const pct = [100, 72, 34, 0][i]
                        return (
                          <motion.div key={s.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
                              <s.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900">{s.name}</span>
                                <span className="text-[10px] tabular-nums text-slate-500">{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }} className={`h-full ${c.bar}`} />
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                    <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{isEN ? "Found so far" : "Znalezione"}</span>
                      <span className="font-extrabold text-primary tabular-nums text-lg">147</span>
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

        {/* PIPELINE ARCHITECTURE */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-12">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Zap className="h-3 w-3" />{isEN ? "Architecture" : "Architektura"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.pipeline.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.pipeline.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="space-y-4">
              {t.pipeline.stages.map((s, i) => {
                const c = toneMap[s.tone]
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-5 items-start rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col items-center">
                        <div className={`h-14 w-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center shadow-sm`}>
                          <s.icon className="h-6 w-6" />
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">#{i + 1}</div>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold">{s.name}</h3>
                          <span className={`text-xs font-semibold ${c.text}`}>{s.role}</span>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                          {s.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className={`h-3.5 w-3.5 ${c.text} shrink-0 mt-0.5`} />{b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="hidden md:block">
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">{isEN ? "Output" : "Wynik"}</div>
                        <div className={`text-xs font-semibold ${c.text} ${c.bg} px-2.5 py-1 rounded-lg`}>{s.output}</div>
                      </div>
                    </div>
                    {i < t.pipeline.stages.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ChevronRight className="h-5 w-5 text-slate-300 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* BRIEF → QUERY */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.brief.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.brief.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5" />{isEN ? "Your plain-language brief" : "Twój brief w naturalnym języku"}
                </div>
                <div className="p-5 text-base font-medium text-slate-800 italic leading-relaxed border-b border-slate-100">"{t.brief.prompt}"</div>
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />{isEN ? "AI parses into" : "AI parsuje na"}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {t.brief.chips.map((c, i) => {
                      const tone = toneMap[c.tone]
                      return (
                        <motion.div key={c.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`rounded-xl border ${tone.border} ${tone.bg} p-3`}>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${tone.text} mb-0.5`}>{c.label}</div>
                          <div className="text-sm font-semibold text-slate-900">{c.val}</div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* SCORING ANATOMY */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Award className="h-3 w-3" />{isEN ? "Scoring" : "Scoring"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.scoring.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.scoring.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">🇩🇪</div>
                    <div>
                      <div className="text-base font-bold">KunststoffTech Süd GmbH</div>
                      <div className="text-xs text-slate-500">Stuttgart, DE • IATF 16949 • Injection molding</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isEN ? "Total score" : "Suma"}</div>
                    <div className="text-4xl font-extrabold tabular-nums text-emerald-600">{t.scoring.total}</div>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {t.scoring.signals.map((sig, i) => {
                    const c = toneMap[sig.tone]
                    return (
                      <motion.div key={sig.label} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="grid grid-cols-[1fr_auto] md:grid-cols-[220px_1fr_auto] gap-4 items-center px-6 py-4">
                        <div className="text-sm font-semibold text-slate-800">{sig.label}</div>
                        <div className="hidden md:block text-xs text-slate-500 italic leading-snug">{sig.detail}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${sig.score}%` }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.06, duration: 0.7 }} className={`h-full ${c.bar}`} />
                          </div>
                          <span className="text-sm font-bold tabular-nums text-slate-900 w-8 text-right">{sig.score}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{isEN ? "Reasoning visible in the UI — you can override or flag any signal." : "Uzasadnienie widoczne w UI — możesz nadpisać lub flagować dowolny sygnał."}</span>
                  <button className="inline-flex items-center gap-1 text-primary font-semibold">
                    <FileSpreadsheet className="h-3.5 w-3.5" />{isEN ? "Export shortlist" : "Eksport shortlisty"}
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* LANGUAGE COVERAGE */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-[11px] font-bold text-violet-800 uppercase tracking-wider mb-3">
                  <Globe className="h-3 w-3" />{isEN ? "Coverage" : "Pokrycie"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{isEN ? "26 languages natively — not Google Translate after the fact" : "26 języków natywnie — nie Google Translate po fakcie"}</h2>
                <p className="text-muted-foreground leading-relaxed">{isEN ? "The Strategy agent writes queries in the target language from the start. Directory coverage calibrated per market." : "Agent Strategii pisze zapytania w języku docelowym od początku. Pokrycie katalogów kalibrowane per rynek."}</p>
              </div>
            </RevealOnScroll>

            <div className="flex flex-wrap gap-2">
              {["PL", "DE", "EN", "FR", "ES", "IT", "NL", "PT", "CZ", "SK", "HU", "RO", "TR", "GR", "SE", "DK", "NO", "FI", "LT", "LV", "EE", "HR", "SI", "BG", "UA", "RU"].map((code, i) => (
                <motion.span key={code} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300 transition-colors">
                  <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">{code}</span>
                </motion.span>
              ))}
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-sky-600 text-white p-10 md:p-16 text-center">
              <div className="absolute top-10 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.2] blur-[80px] bg-white pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Start with 10 free credits" : "Zacznij z 10 darmowymi kredytami"}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{isEN ? "10 full production campaigns. No credit card. Your first shortlist lands in 3 minutes." : "10 pełnych kampanii produkcyjnych. Bez karty. Pierwsza shortlista w 3 minuty."}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "feature_ai_sourcing_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_ai_sourcing_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-primary hover:bg-sky-50 shadow-lg hover:scale-[1.02] transition-all">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
