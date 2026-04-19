import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Scale, Sparkles, SlidersHorizontal, Download, Trophy, Globe2,
  TrendingDown, CheckCircle2, Calculator, FileSpreadsheet,
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
    badge: isEN ? "Offer Comparison" : "Porównywarka ofert",
    title: isEN ? "Every quote, side by side — with weights you control" : "Każda oferta, side by side — z wagami które kontrolujesz",
    subtitle: isEN
      ? "Stop pasting PDFs into Excel at midnight. Procurea pulls structured quotes into one table, normalizes currency and Incoterms, applies your weights (price, lead time, compliance, references), and recommends a winner — with the reasoning trail for the committee."
      : "Przestań klejeniem PDF-ów do Excela o północy. Procurea wciąga strukturalne oferty do jednej tabeli, normalizuje walutę i Incoterms, stosuje Twoje wagi (cena, lead time, compliance, referencje) i rekomenduje zwycięzcę — z uzasadnieniem dla komisji.",
    primary: isEN ? "See the comparison grid" : "Zobacz grid porównania",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "4–8h", l: isEN ? "saved per RFQ" : "oszczędzone per RFQ", d: isEN ? "no Excel stitching" : "bez sklejania Excela" },
    { v: "1 table", l: isEN ? "for all offers" : "na wszystkie oferty", d: isEN ? "normalized side-by-side" : "znormalizowane" },
    { v: "0 PDFs", l: isEN ? "to parse manually" : "do parsowania ręcznie", d: isEN ? "structured portal input" : "strukturalny input portalu" },
    { v: "Weighted", l: isEN ? "scoring, your rules" : "scoring, Twoje reguły", d: isEN ? "re-rank in real time" : "re-rank w real time" },
  ],
  // Weighted scoring config
  weights: {
    title: isEN ? "Adjust weights, watch the winner change in real time" : "Dostosuj wagi, obserwuj jak zwycięzca się zmienia",
    subtitle: isEN ? "Set your priorities (price-heavy, compliance-heavy, lead-time-heavy). Ranking updates as you slide." : "Ustaw priorytety (cena, compliance, lead time). Ranking aktualizuje się przy przesuwaniu suwaków.",
    criteria: isEN
      ? [
          { name: "Unit price", weight: 40, tone: "primary" },
          { name: "Lead time", weight: 20, tone: "sky" },
          { name: "Compliance (certs)", weight: 20, tone: "emerald" },
          { name: "References", weight: 15, tone: "amber" },
          { name: "Payment terms", weight: 5, tone: "violet" },
        ]
      : [
          { name: "Cena jednostkowa", weight: 40, tone: "primary" },
          { name: "Lead time", weight: 20, tone: "sky" },
          { name: "Compliance (certy)", weight: 20, tone: "emerald" },
          { name: "Referencje", weight: 15, tone: "amber" },
          { name: "Warunki płatności", weight: 5, tone: "violet" },
        ],
    total: 100,
  },
  // Comparison grid
  grid: {
    title: isEN ? "The comparison grid — 4 bidders, normalized" : "Grid porównania — 4 bidderów, znormalizowani",
    subtitle: isEN ? "Currencies converted to your working currency. Incoterms normalized to landed cost. Missing fields flagged." : "Waluty przeliczane na walutę roboczą. Incoterms znormalizowane do landed cost. Brakujące pola flagowane.",
    header: isEN ? ["Criterion", "Bidder A", "Bidder B", "Bidder C", "Bidder D"] : ["Kryterium", "Bidder A", "Bidder B", "Bidder C", "Bidder D"],
    rows: isEN
      ? [
          { crit: "Unit price (€)", a: "€1,180", b: "€1,210", c: "€1,140", d: "€1,150", best: "c" },
          { crit: "Lead time", a: "4 wks", b: "3 wks", c: "6 wks", d: "3 wks", best: "b" },
          { crit: "IATF 16949", a: "✓", b: "✓", c: "✓", d: "✓", best: null },
          { crit: "ISO 14001", a: "✓", b: "—", c: "✓", d: "✓", best: null, warn: ["b"] },
          { crit: "References (auto)", a: "8", b: "12", c: "4", d: "15", best: "d" },
          { crit: "Payment terms", a: "60 days", b: "30 days", c: "45 days", d: "45 days", best: "b" },
        ]
      : [
          { crit: "Cena jedn. (€)", a: "1 180 €", b: "1 210 €", c: "1 140 €", d: "1 150 €", best: "c" },
          { crit: "Lead time", a: "4 tyg", b: "3 tyg", c: "6 tyg", d: "3 tyg", best: "b" },
          { crit: "IATF 16949", a: "✓", b: "✓", c: "✓", d: "✓", best: null },
          { crit: "ISO 14001", a: "✓", b: "—", c: "✓", d: "✓", best: null, warn: ["b"] },
          { crit: "Referencje (auto)", a: "8", b: "12", c: "4", d: "15", best: "d" },
          { crit: "Płatność", a: "60 dni", b: "30 dni", c: "45 dni", d: "45 dni", best: "b" },
        ],
    scores: { a: 74, b: 78, c: 69, d: 86 },
    winner: "d",
  },
  // Normalization
  normalize: {
    title: isEN ? "Apples-to-apples normalization — the math Excel can't do" : "Normalizacja apples-to-apples — matematyka, której Excel nie zrobi",
    pillars: isEN
      ? [
          { label: "Currency conversion", desc: "EUR / PLN / USD / TRY auto-converted to your working currency with daily rates." },
          { label: "Incoterms normalization", desc: "EXW / FOB / CIF / DDP normalized to landed cost including freight + duty + insurance." },
          { label: "Volume-tier resolution", desc: "Tiered price lists resolved at your target volume — no more 'from €x' ambiguity." },
          { label: "Payment terms → NPV", desc: "60-day vs 30-day payment terms converted to NPV-adjusted effective unit price." },
          { label: "Unit normalization", desc: "kg / lb, m / ft, pcs / dozens auto-converted. No mis-comparison on units." },
          { label: "Missing-data flags", desc: "Any field not filled by the bidder surfaces as red flag; never silently treated as zero." },
        ]
      : [
          { label: "Przeliczenie walut", desc: "EUR / PLN / USD / TRY auto na walutę roboczą po dziennych kursach." },
          { label: "Normalizacja Incoterms", desc: "EXW / FOB / CIF / DDP znormalizowane do landed cost z frachtem + cłem + ubezp." },
          { label: "Rozliczenie tierów wolumenu", desc: "Tiered cenniki rozliczone przy Twoim docelowym wolumenie — koniec 'od €x' niejednoznaczności." },
          { label: "Warunki płatności → NPV", desc: "60-dni vs 30-dni przeliczone na cenę jednostkową skorygowaną o NPV." },
          { label: "Normalizacja jednostek", desc: "kg / lb, m / ft, szt / tuziny auto. Bez mispricingu na jednostkach." },
          { label: "Flagi brakujących danych", desc: "Każde niewypełnione pole bidder'a surfaced jako red flag; nigdy nie traktowane jako zero." },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "Can I export the comparison to PDF for a tender committee?", a: "Yes — one click exports a formatted PDF with grid, weighted scoring breakdown, winner recommendation and reasoning. Audit-ready for public-tender evaluation records." },
          { q: "What if two bidders are tied on total score?", a: "Ties are shown explicitly. Procurea surfaces the tie-breaker criterion (e.g. which scored higher on compliance or lead time) and lets you override with a manual decision note." },
          { q: "Can I re-run scoring with different weights without re-collecting quotes?", a: "Yes. Weights are applied client-side in real time. Drag sliders, watch re-rank. Collected quotes stay unchanged." },
          { q: "How do you handle bidders who quoted in different currencies?", a: "Daily FX rates pulled at submission time (locked for audit). You can switch display currency without re-submitting." },
          { q: "Is the winner recommendation auto-binding?", a: "No — it's a recommendation with visible reasoning. Final award is your decision; we log who approved and when for audit." },
        ]
      : [
          { q: "Mogę eksportować porównanie do PDF dla komisji tenderowej?", a: "Tak — jeden klik eksportuje sformatowany PDF z grid, breakdown scoringu, rekomendacją zwycięzcy i uzasadnieniem. Audit-ready pod ewaluacje tenderów publicznych." },
          { q: "Co jeśli dwóch bidderów ma ten sam total?", a: "Ex-aequo pokazane explicit. Procurea wyciąga kryterium tie-breakera (np. kto wyżej na compliance albo lead time) i pozwala nadpisać manualną notą." },
          { q: "Mogę re-run scoring z innymi wagami bez zbierania ofert od nowa?", a: "Tak. Wagi stosowane client-side w real time. Przeciągaj suwaki, obserwuj re-rank. Zebrane oferty bez zmian." },
          { q: "Jak obsługujecie bidderów z różnymi walutami?", a: "Dzienne kursy FX pobrane przy złożeniu (zablokowane pod audyt). Możesz przełączać walutę wyświetlania bez ponownego submit." },
          { q: "Czy rekomendacja zwycięzcy jest auto-bindująca?", a: "Nie — to rekomendacja z widocznym uzasadnieniem. Finalny award to Twoja decyzja; logujemy kto zatwierdził i kiedy pod audyt." },
        ],
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500" },
}

export function OfferComparisonFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-5">
                  <Scale className="h-3 w-3" />{t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_compare_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_compare_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/60">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Trophy className="h-3.5 w-3.5 text-amber-600" />{isEN ? "Winner — Bidder D" : "Zwycięzca — Bidder D"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">86/100</span>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {[{n:"D",s:86,t:"bg-emerald-500"},{n:"B",s:78,t:"bg-sky-500"},{n:"A",s:74,t:"bg-slate-400"},{n:"C",s:69,t:"bg-slate-400"}].map((r) => (
                      <div key={r.n} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">{r.n}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.s}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} className={`h-full ${r.t}`} />
                        </div>
                        <span className="text-xs font-bold tabular-nums w-8 text-right">{r.s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                    <Calculator className="h-3.5 w-3.5" />{isEN ? "Weighted by: price 40% · lead 20% · compliance 20% · refs 15% · payment 5%" : "Wagi: cena 40% · lead 20% · compliance 20% · ref 15% · płatność 5%"}
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden">
              {t.stats.map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white p-5">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight">{s.v}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{s.l}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WEIGHTS */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <SlidersHorizontal className="h-3 w-3" />{isEN ? "Weights" : "Wagi"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.weights.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.weights.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="space-y-5">
                  {t.weights.criteria.map((c, i) => {
                    const tone = toneMap[c.tone]
                    return (
                      <motion.div key={c.name} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                          <span className={`text-sm font-extrabold tabular-nums ${tone.text}`}>{c.weight}%</span>
                        </div>
                        <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.weight}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.06, duration: 0.8 }} className={`h-full ${tone.bar} rounded-full`} />
                          <div className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-slate-900 shadow-md" style={{ left: `calc(${c.weight}% - 10px)` }} />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{isEN ? "Total must equal" : "Suma musi być"} 100%</span>
                  <span className="font-extrabold text-emerald-600 text-lg">{t.weights.total}%</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* COMPARISON GRID */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.grid.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.grid.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        {t.grid.header.map((h, i) => (
                          <th key={h} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${i === 0 ? "text-left" : "text-center"}`}>
                            {h}{t.grid.winner === ["", "a", "b", "c", "d"][i] && <Trophy className="inline-block h-3 w-3 ml-1 text-amber-600" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.grid.rows.map((row) => (
                        <tr key={row.crit} className="border-b border-slate-50 hover:bg-slate-50/40">
                          <td className="px-5 py-3 font-semibold text-slate-800">{row.crit}</td>
                          {(["a", "b", "c", "d"] as const).map((k) => {
                            const isBest = row.best === k
                            const isWarn = (row as any).warn?.includes(k)
                            return (
                              <td key={k} className={`px-5 py-3 text-center tabular-nums ${isBest ? "font-bold bg-emerald-50/70 text-emerald-700" : isWarn ? "bg-rose-50/60 text-rose-600" : "text-slate-700"}`}>
                                {row[k]}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="px-5 py-4 text-[11px] uppercase tracking-wider opacity-80">{isEN ? "Weighted score" : "Score ważony"}</td>
                        {(["a", "b", "c", "d"] as const).map((k) => {
                          const isWin = t.grid.winner === k
                          return (
                            <td key={k} className={`px-5 py-4 text-center tabular-nums text-lg ${isWin ? "bg-emerald-500" : ""}`}>
                              {t.grid.scores[k]}{isWin && <Trophy className="inline-block h-3.5 w-3.5 ml-1" />}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 italic">{isEN ? "Illustrative. Real campaigns include 10–30 criteria." : "Ilustracyjnie. Rzeczywiste kampanie 10–30 kryteriów."}</span>
                  <button className="text-xs font-semibold text-primary flex items-center gap-1"><Download className="h-3 w-3" />{isEN ? "Export PDF" : "Eksport PDF"}</button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* NORMALIZATION */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <Calculator className="h-3 w-3" />{isEN ? "Normalization" : "Normalizacja"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t.normalize.title}</h2>
              </div>
            </RevealOnScroll>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {t.normalize.pillars.map((p, i) => (
                <motion.div key={p.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-3"><CheckCircle2 className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold mb-1">{p.label}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions from committee chairs" : "Pytania od przewodniczących komisji"}</h2>
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

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-slate-800 to-emerald-600 text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Award a tender with confidence" : "Awarduj tender z pewnością"}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{isEN ? "Weighted scoring, normalized offers, committee-ready PDF. No more midnight Excel." : "Ważony scoring, znormalizowane oferty, PDF gotowy na komisję. Koniec nocnego Excela."}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "feature_compare_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_compare_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-primary hover:bg-slate-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
                <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/10">{isEN ? "Book a demo" : "Umów demo"}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
