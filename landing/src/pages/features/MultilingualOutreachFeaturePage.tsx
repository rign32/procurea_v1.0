import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Languages, Globe, TrendingUp, Sparkles, MessageSquare, CheckCircle2, Brain,
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
    badge: isEN ? "Multilingual Outreach" : "Wielojęzyczny Outreach",
    title: isEN ? "Speak Turkish to Istanbul, Polish to Warsaw, Italian to Milan — all from one draft" : "Mów po turecku do Istambułu, po polsku do Warszawy, po włosku do Mediolanu — z jednego draftu",
    subtitle: isEN
      ? "26 languages, context-preserved. RFQ specs, product names and numbers stay intact. Suppliers reply in their language — you read in yours. Response rate uplift: 2–3× vs generic English."
      : "26 języków, kontekst zachowany. Specyfikacje RFQ, nazwy produktów i liczby zostają bez zmian. Dostawcy odpowiadają w swoim języku — Ty czytasz w swoim. Uplift response rate: 2–3× vs generyczne EN.",
    primary: isEN ? "Send in 26 languages" : "Wyślij w 26 językach",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "2–3×", l: isEN ? "response rate uplift" : "uplift response rate", d: isEN ? "localized vs generic EN" : "zlokal. vs generic EN" },
    { v: "26", l: isEN ? "languages supported" : "obsługiwanych języków", d: isEN ? "EU + global" : "UE + globalne" },
    { v: "0", l: isEN ? "Google Translate artefacts" : "artefaktów Google Translate", d: isEN ? "Gemini 2.0 Flash" : "Gemini 2.0 Flash" },
    { v: "100%", l: isEN ? "numbers/specs preserved" : "liczb/specyfikacji zachowanych", d: isEN ? "no re-translation errors" : "bez błędów re-tłumaczenia" },
  ],
  uplift: {
    title: isEN ? "Response rate uplift — measured across 18 language pairs" : "Uplift response rate — mierzony w 18 parach językowych",
    subtitle: isEN ? "We A/B tested generic-English vs localized outreach across 50+ campaigns. Local language wins every single pair." : "A/B testowaliśmy generic-EN vs localized outreach w 50+ kampaniach. Lokalny język wygrywa każdą parę.",
    rows: isEN
      ? [
          { lang: "German", flag: "🇩🇪", en: 14, local: 38 },
          { lang: "Polish", flag: "🇵🇱", en: 11, local: 42 },
          { lang: "Italian", flag: "🇮🇹", en: 9, local: 34 },
          { lang: "Turkish", flag: "🇹🇷", en: 6, local: 28 },
          { lang: "French", flag: "🇫🇷", en: 12, local: 31 },
          { lang: "Spanish", flag: "🇪🇸", en: 10, local: 29 },
          { lang: "Czech", flag: "🇨🇿", en: 8, local: 27 },
          { lang: "Portuguese", flag: "🇵🇹", en: 7, local: 26 },
        ]
      : [
          { lang: "Niemiecki", flag: "🇩🇪", en: 14, local: 38 },
          { lang: "Polski", flag: "🇵🇱", en: 11, local: 42 },
          { lang: "Włoski", flag: "🇮🇹", en: 9, local: 34 },
          { lang: "Turecki", flag: "🇹🇷", en: 6, local: 28 },
          { lang: "Francuski", flag: "🇫🇷", en: 12, local: 31 },
          { lang: "Hiszpański", flag: "🇪🇸", en: 10, local: 29 },
          { lang: "Czeski", flag: "🇨🇿", en: 8, local: 27 },
          { lang: "Portugalski", flag: "🇵🇹", en: 7, local: 26 },
        ],
    note: isEN ? "Response rate = suppliers who sent a quote within 14 days. Illustrative averages." : "Response rate = dostawcy którzy wysłali ofertę w 14 dni. Średnie ilustracyjne.",
  },
  preservation: {
    title: isEN ? "What AI preserves vs. what AI translates" : "Co AI zachowuje vs. co AI tłumaczy",
    preserved: isEN
      ? [
          { label: "Product numbers", ex: "SKF 6308-2RS1" },
          { label: "Technical specs", ex: "PA66 GF30, Tg > 100°C" },
          { label: "Certification codes", ex: "IATF 16949:2016" },
          { label: "Volume numbers", ex: "50,000 units / year" },
          { label: "Dates", ex: "2026-06-01" },
          { label: "Currency amounts", ex: "€1,250/t" },
        ]
      : [
          { label: "Numery produktów", ex: "SKF 6308-2RS1" },
          { label: "Specyfikacje techniczne", ex: "PA66 GF30, Tg > 100°C" },
          { label: "Kody certyfikatów", ex: "IATF 16949:2016" },
          { label: "Liczby wolumenu", ex: "50 000 szt. / rok" },
          { label: "Daty", ex: "2026-06-01" },
          { label: "Kwoty walut", ex: "1 250 €/t" },
        ],
    translated: isEN
      ? ["Salutations & sign-offs", "Company descriptions", "Capability requirements", "Lead-time expectations", "Request for quote call-to-action", "Follow-up tonal cues"]
      : ["Zwroty grzecznościowe", "Opisy firmy", "Wymagania capability", "Oczekiwania lead time", "CTA prośby o ofertę", "Tonalność follow-upu"],
  },
  faq: {
    items: isEN
      ? [
          { q: "Is it literally Gemini under the hood?", a: "Yes — Gemini 2.0 Flash for the translation step, with a custom prompt layer that pins technical tokens, numbers and product codes so they survive translation unchanged." },
          { q: "What about languages with non-Latin scripts (Arabic, Chinese, Japanese)?", a: "On the roadmap. Full Latin coverage today (26 EU + Turkish). Non-Latin scripts planned for Q3 2026." },
          { q: "Can I review / edit the localized version before it sends?", a: "Yes. Every campaign has a 'preview all' pane where you can see each rendered email, flag issues, and bulk-approve or edit individually." },
          { q: "How are replies translated back to my language?", a: "Inbound reply threading keeps the supplier's original text. Our UI shows the translated version with a toggle to the original. Audit trail preserves both." },
          { q: "Does localization cost extra?", a: "No — it's built into every campaign. No per-language surcharge, no Google Translate bill." },
        ]
      : [
          { q: "Czy to dosłownie Gemini pod spodem?", a: "Tak — Gemini 2.0 Flash do translation, z custom prompt layer który pinuje tokeny techniczne, liczby i kody produktów żeby przetrwały tłumaczenie bez zmian." },
          { q: "A języki z nie-łacińskim pismem (arabski, chiński, japoński)?", a: "Na roadmapie. Pełne pokrycie łacińskie dziś (26 UE + turecki). Nie-łacińskie planowane Q3 2026." },
          { q: "Mogę przeglądać / edytować zlokalizowaną wersję przed wysłaniem?", a: "Tak. Każda kampania ma 'preview all' gdzie widzisz każdy wyrenderowany mail, flagujesz problemy i bulk-approve albo edytujesz." },
          { q: "Jak tłumaczone są odpowiedzi z powrotem na mój język?", a: "Inbound reply threading zachowuje oryginalny tekst dostawcy. UI pokazuje przetłumaczoną wersję z toggle do oryginału. Audit trail trzyma oba." },
          { q: "Czy lokalizacja kosztuje ekstra?", a: "Nie — wbudowane w każdą kampanię. Bez narzutu per-język, bez rachunku Google Translate." },
        ],
  },
}

export function MultilingualOutreachFeaturePage() {
  const max = Math.max(...t.uplift.rows.map((r) => r.local))
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-violet-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[11px] font-bold text-violet-800 uppercase tracking-wider mb-5"><Languages className="h-3 w-3" />{t.hero.badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_ml_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_ml_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/60">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Globe className="h-3.5 w-3.5" />{isEN ? "Rendering campaign — 6 languages" : "Renderowanie kampanii — 6 języków"}</span>
                  </div>
                  <div className="p-5 space-y-2">
                    {[
                      { f: "🇩🇪", l: "DE", c: "Guten Tag Herr Schmidt..." },
                      { f: "🇵🇱", l: "PL", c: "Dzień dobry Panie Marku..." },
                      { f: "🇮🇹", l: "IT", c: "Buongiorno Sig. Rossi..." },
                      { f: "🇹🇷", l: "TR", c: "Sayın Yılmaz Bey..." },
                      { f: "🇫🇷", l: "FR", c: "Bonjour M. Dubois..." },
                      { f: "🇪🇸", l: "ES", c: "Buenos días Sr. García..." },
                    ].map((r, i) => (
                      <motion.div key={r.l} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50/50">
                        <span className="text-xl">{r.f}</span>
                        <span className="text-[10px] font-bold font-mono text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">{r.l}</span>
                        <span className="text-xs text-slate-700 truncate flex-1">{r.c}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </motion.div>
                    ))}
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

        {/* UPLIFT CHART */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <TrendingUp className="h-3 w-3" />{isEN ? "Response uplift" : "Uplift response"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.uplift.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.uplift.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-6 mb-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-slate-300" />{isEN ? "Generic English" : "Generic EN"}</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-emerald-500" />{isEN ? "Local language" : "Lokalny język"}</div>
              </div>
              <div className="space-y-3">
                {t.uplift.rows.map((r, i) => (
                  <motion.div key={r.lang} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="grid grid-cols-[auto_120px_1fr_auto] items-center gap-4">
                    <span className="text-2xl">{r.flag}</span>
                    <span className="text-sm font-semibold">{r.lang}</span>
                    <div className="relative h-6 bg-slate-50 rounded">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${(r.en / max) * 100}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05, duration: 0.7 }} className="absolute top-0 left-0 h-full bg-slate-300 rounded" />
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${(r.local / max) * 100}%` }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }} className="absolute top-0 left-0 h-full bg-emerald-500 rounded mix-blend-multiply opacity-90" />
                    </div>
                    <span className="text-sm font-extrabold tabular-nums text-emerald-700 w-14 text-right">+{Math.round((r.local - r.en) / r.en * 100)}%</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] italic text-slate-500">{t.uplift.note}</div>
            </div>
          </div>
        </section>

        {/* PRESERVATION */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.preservation.title}</h2>
              </div>
            </RevealOnScroll>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-primary/20 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-bold text-primary uppercase tracking-wider text-sm">{isEN ? "Preserved intact" : "Zachowane bez zmian"}</h3>
                </div>
                <div className="space-y-2">
                  {t.preservation.preserved.map((p) => (
                    <div key={p.label} className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-600">{p.label}</span>
                      <code className="text-[11px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{p.ex}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-base font-bold text-emerald-700 uppercase tracking-wider text-sm">{isEN ? "Localized with context" : "Lokalizowane z kontekstem"}</h3>
                </div>
                <ul className="space-y-2">
                  {t.preservation.translated.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions about translation quality" : "Pytania o jakość tłumaczenia"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "2–3× more replies, zero extra work" : "2–3× więcej odpowiedzi, zero extra pracy"}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <a href={appendUtm(APP_URL, "feature_ml_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_ml_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-violet-700 hover:bg-violet-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
