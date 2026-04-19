import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Sparkles, FileText, TrendingUp, MessageSquare, BarChart3,
  Bot, Download, Bell, Zap, CheckCircle2,
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
    badge: "AI Insights",
    title: isEN ? "Procurement reports that read themselves — and write your Monday email" : "Raporty procurement, które same się czytają — i piszą Twój poniedziałkowy mail",
    subtitle: isEN
      ? "Ask in plain language: 'what's trending up in bearings this quarter?' Get a narrative answer with charts and recommendations. Weekly auto-reports land in your inbox. Savings attribution, price volatility alerts, supplier concentration warnings — without pivot tables."
      : "Pytaj w naturalnym języku: 'co rośnie w łożyskach tym kwartałem?'. Dostajesz narracyjną odpowiedź z wykresami i rekomendacjami. Cotygodniowe auto-raporty lądują w inboxie. Atrybucja oszczędności, alerty zmienności cen, ostrzeżenia koncentracji — bez pivot tables.",
    primary: isEN ? "Ask your first question" : "Zadaj pierwsze pytanie",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "NL", l: isEN ? "natural-language queries" : "zapytania w naturalnym języku", d: isEN ? "no SQL, no pivots" : "bez SQL, bez pivotów" },
    { v: "Weekly", l: isEN ? "auto-reports by email" : "auto-raporty mailem", d: isEN ? "Monday 9:00 local" : "Poniedziałek 9:00 lokalnie" },
    { v: "3 alerts", l: isEN ? "types out of the box" : "typy out of the box", d: isEN ? "volatility / concentration / cert" : "zmienność / koncentracja / cert" },
    { v: "PDF", l: isEN ? "executive summaries" : "summary dla zarządu", d: isEN ? "audit-ready, branded" : "audit-ready, brandowane" },
  ],
  chat: {
    title: isEN ? "Ask in words you'd use at the water cooler" : "Pytaj słowami z przerwy kawowej",
    subtitle: isEN ? "The query engine runs over your supplier base, campaigns and offers. Citations point back to specific records." : "Silnik zapytań leci po Twojej bazie dostawców, kampaniach i ofertach. Cytaty wskazują konkretne rekordy.",
    qa: isEN
      ? [
          { from: "you", msg: "What's my cheapest bearing supplier in PL right now, and how has their price moved since Q1?" },
          { from: "ai", msg: "**BearingTech Kraków** at €22.40/unit for SKF 6308-2RS1 equivalents. Price dropped 8.3% since 2026-01-15 — they entered Campaign #218 with €24.40 and rebid after your clarification to €22.40. 12 other PL bearings vendors are in your database; only 3 quoted below €25/unit this quarter." },
          { from: "you", msg: "Am I too concentrated on any single supplier across all categories?" },
          { from: "ai", msg: "**Yes — flag on Polfiber**: 34% of your 2026 YTD spend across cotton, linen and packaging. No other vendor above 18%. Consider running a split-sourcing RFQ on their largest category (cotton, €420K) to reduce dependency below the typical 25% threshold." },
        ]
      : [
          { from: "you", msg: "Kto jest teraz moim najtańszym dostawcą łożysk w PL i jak się ruszała cena od Q1?" },
          { from: "ai", msg: "**BearingTech Kraków** po 22,40 €/szt. dla odpowiedników SKF 6308-2RS1. Cena spadła 8,3% od 2026-01-15 — weszli do Kampanii #218 z 24,40 € i re-bidowali po Twoim wyjaśnieniu do 22,40 €. 12 innych PL vendorów łożysk jest w Twojej bazie; tylko 3 kwotowali poniżej 25 €/szt. tym kwartałem." },
          { from: "you", msg: "Czy jestem zbyt skoncentrowany na jednym dostawcy w jakiejkolwiek kategorii?" },
          { from: "ai", msg: "**Tak — flaga na Polfiber**: 34% Twoich wydatków 2026 YTD w bawełnie, lnie i opakowaniach. Żaden inny vendor powyżej 18%. Rozważ split-sourcing RFQ na ich największej kategorii (bawełna, 420 tys. €), żeby zbić zależność poniżej typowego progu 25%." },
        ],
  },
  report: {
    title: isEN ? "Weekly auto-report — lands in your inbox Monday 9:00" : "Cotygodniowy auto-raport — ląduje w inboxie poniedziałek 9:00",
    subtitle: isEN ? "Generated Monday morning from your past-week activity. Headlines first, then the reasoning. One-click PDF for your boss." : "Generowany w poniedziałek rano z aktywności ubiegłego tygodnia. Headline'y najpierw, potem uzasadnienie. Jeden klik PDF dla szefa.",
    sections: isEN
      ? [
          { icon: TrendingUp, label: "Savings YTD", val: "€412K", detail: "22% avg across 8 categories, tracking vs 2025 baseline" },
          { icon: Bell, label: "Alerts (last 7 days)", val: "3", detail: "2 cert expirations < 90d · 1 price volatility > 10%" },
          { icon: BarChart3, label: "Active campaigns", val: "7", detail: "4 awaiting offers · 2 comparison · 1 award pending" },
          { icon: Zap, label: "Top supplier moves", val: "5", detail: "1 Awarded · 2 At-risk → Healthy · 2 Healthy → At-risk" },
        ]
      : [
          { icon: TrendingUp, label: "Oszczędności YTD", val: "412 tys. €", detail: "22% średnio na 8 kategoriach, vs baseline 2025" },
          { icon: Bell, label: "Alerty (ostatnie 7 dni)", val: "3", detail: "2 wygaśnięcia certów < 90d · 1 zmienność > 10%" },
          { icon: BarChart3, label: "Aktywne kampanie", val: "7", detail: "4 czeka na oferty · 2 porównanie · 1 oczekuje award" },
          { icon: Zap, label: "Top ruchy dostawców", val: "5", detail: "1 Awarded · 2 Risk → Healthy · 2 Healthy → Risk" },
        ],
  },
  alerts: {
    title: isEN ? "3 alert types out of the box" : "3 typy alertów out of the box",
    items: isEN
      ? [
          { icon: TrendingUp, title: "Price volatility", desc: "Any category where the delta between lowest and highest current quote exceeds 10% triggers a volatility alert." },
          { icon: Bell, title: "Certification expiry", desc: "Every supplier cert expiring in < 90 days gets a re-verification nudge on both sides." },
          { icon: BarChart3, title: "Supplier concentration", desc: "Any vendor exceeding 25% of your annual spend in a category surfaces as a concentration risk." },
        ]
      : [
          { icon: TrendingUp, title: "Zmienność cen", desc: "Każda kategoria gdzie delta między najniższą a najwyższą aktualną ofertą przekracza 10% wyzwala alert." },
          { icon: Bell, title: "Wygaśnięcie certyfikatów", desc: "Każdy cert dostawcy wygasający < 90 dni dostaje nudge re-weryfikacji po obu stronach." },
          { icon: BarChart3, title: "Koncentracja dostawców", desc: "Każdy vendor przekraczający 25% Twoich rocznych wydatków w kategorii surfaced jako ryzyko koncentracji." },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "Is the AI trained on my data?", a: "No — your data is passed to the Gemini query as retrieved context, not stored in model weights. Every question re-queries the current snapshot; no cross-tenant leakage." },
          { q: "Can I customize the weekly auto-report?", a: "Yes. Choose sections, recipients, timing and language. Branding (logo + colors) per tenant for Enterprise." },
          { q: "What data sources can AI Insights query?", a: "Everything in your Procurea workspace: campaigns, offers, supplier records, scoring history, contact activity. With ERP integration on Enterprise, we can also query connected PO data for landed-spend attribution." },
          { q: "How accurate are the narrative answers?", a: "Factual retrieval (numbers, dates, records) is deterministic — AI only renders the narrative. Citations link to the source record so you can verify. Hallucination on factual claims is near-zero by design." },
        ]
      : [
          { q: "Czy AI trenuje się na moich danych?", a: "Nie — Twoje dane przekazywane są do zapytania Gemini jako retrieved context, nie trzymane w wagach modelu. Każde pytanie re-query-uje aktualny snapshot; brak wycieku między tenantami." },
          { q: "Mogę customizować cotygodniowy auto-raport?", a: "Tak. Wybierz sekcje, odbiorców, timing i język. Branding (logo + kolory) per tenant na Enterprise." },
          { q: "Jakie źródła może query-ować AI Insights?", a: "Wszystko w Twoim workspace Procurea: kampanie, oferty, rekordy dostawców, historia scoringu, aktywność kontaktowa. Z integracją ERP na Enterprise możemy też query-ować dane PO pod atrybucję landed-spend." },
          { q: "Jak dokładne są narracyjne odpowiedzi?", a: "Factual retrieval (liczby, daty, rekordy) jest deterministyczny — AI tylko renderuje narrację. Cytaty linkują do rekordu źródłowego żebyś mógł zweryfikować. Halucynacje na faktach = zero by design." },
        ],
  },
}

export function AiInsightsFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-indigo-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-5"><Sparkles className="h-3 w-3" />{t.hero.badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_insights_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_insights_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-indigo-600" /><span className="font-medium text-slate-600">{isEN ? "Procurea Insights" : "Procurea Insights"}</span></div>
                  <div className="p-5 space-y-3">
                    <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-800 italic">"{t.chat.qa[0].msg}"</div>
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700"><Sparkles className="h-3 w-3" />AI</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{t.chat.qa[1].msg}</p>
                    </div>
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

        {/* CHAT */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-3"><MessageSquare className="h-3 w-3" />Chat</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.chat.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.chat.subtitle}</p>
              </div>
            </RevealOnScroll>
            <div className="space-y-4">
              {t.chat.qa.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: m.from === "ai" ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={`rounded-2xl p-5 max-w-3xl ${m.from === "ai" ? "ml-auto bg-indigo-50 border border-indigo-100" : "bg-white border border-slate-200"}`}>
                  {m.from === "ai" && <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700"><Sparkles className="h-3 w-3" />{isEN ? "AI" : "AI"}</div>}
                  <p className={`text-sm leading-relaxed ${m.from === "you" ? "italic text-slate-700" : "text-slate-800"}`} dangerouslySetInnerHTML={{ __html: m.msg.replace(/\*\*(.+?)\*\*/g, '<strong class="text-indigo-800">$1</strong>') }} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WEEKLY REPORT */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3"><FileText className="h-3 w-3" />{isEN ? "Auto-report" : "Auto-raport"}</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.report.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.report.subtitle}</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isEN ? "Weekly Procurement Report" : "Tygodniowy Raport Procurement"}</div>
                    <div className="text-sm font-bold text-slate-900">Week 16 · 2026</div>
                  </div>
                  <button className="text-xs font-semibold text-primary flex items-center gap-1"><Download className="h-3 w-3" />{isEN ? "PDF" : "PDF"}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {t.report.sections.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 mb-3"><s.icon className="h-4 w-4" /></div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{s.label}</div>
                      <div className="text-2xl font-extrabold tracking-tight tabular-nums">{s.val}</div>
                      <div className="text-[11px] text-slate-600 mt-1 leading-snug">{s.detail}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ALERTS */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.alerts.title}</h2>
            </RevealOnScroll>
            <div className="grid md:grid-cols-3 gap-4">
              {t.alerts.items.map((a, i) => (
                <motion.div key={a.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4"><a.icon className="h-5 w-5" /></div>
                  <h3 className="text-base font-bold mb-2">{a.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{a.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions about AI Insights" : "Pytania o AI Insights"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Your Monday report writes itself" : "Twój poniedziałkowy raport pisze się sam"}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <a href={appendUtm(APP_URL, "feature_insights_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_insights_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
