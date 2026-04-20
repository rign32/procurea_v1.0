import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, UserCheck, Mail, Linkedin, Phone, Users, ShieldCheck,
  Sparkles, CheckCircle2, XCircle, Search,
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
    badge: isEN ? "Contact Enrichment" : "Enrichment Kontaktów",
    title: isEN ? "Decision-maker contacts per supplier — not generic info@ emails" : "Kontakty do decydentów per dostawca — nie generyczne info@",
    subtitle: isEN
      ? "Procurement Lead, Head of Sales, Production Manager — the person who actually signs off. Multi-source enrichment (LinkedIn-class, registries, site scraping) with freshness score per contact. Generic inboxes only as fallback."
      : "Kierownik Zakupów, Head of Sales, Manager Produkcji — osoba, która realnie decyduje. Multi-source enrichment (LinkedIn-class, rejestry, scraping) z freshness score per kontakt. Generyczne skrzynki tylko jako fallback.",
    primary: isEN ? "Start enriching" : "Zacznij enrichment",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "3–5", l: isEN ? "contacts per vendor" : "kontaktów per vendor", d: isEN ? "roles + freshness" : "role + świeżość" },
    { v: "82%", l: isEN ? "deliverable rate" : "deliverable rate", d: isEN ? "verified at enrichment" : "zweryfikowane" },
    { v: "12%", l: isEN ? "generic info@ fallback" : "fallback info@", d: isEN ? "only when no person found" : "tylko gdy brak osoby" },
    { v: "< 90d", l: isEN ? "freshness required" : "wymagana świeżość", d: isEN ? "or re-verified before send" : "albo re-weryfikacja" },
  ],
  before: {
    title: isEN ? "Before enrichment vs. after enrichment" : "Przed enrichmentem vs. po",
    empty: { label: "Polfiber Sp. z o.o.", contact: "info@polfiber.pl", role: "—", freshness: "unknown" },
    rich: isEN ? [
      { name: "Anna Kowalska", role: "Head of Procurement", email: "a.kowalska@polfiber.pl", verified: true, source: "LinkedIn + website" },
      { name: "Marek Nowak", role: "Key Account Sales", email: "m.nowak@polfiber.pl", verified: true, source: "Website team page" },
      { name: "Jan Wiśniewski", role: "Production Lead", linkedin: "Verified", source: "LinkedIn" },
    ] : [
      { name: "Anna Kowalska", role: "Head of Procurement", email: "a.kowalska@polfiber.pl", verified: true, source: "LinkedIn + strona" },
      { name: "Marek Nowak", role: "Key Account Sales", email: "m.nowak@polfiber.pl", verified: true, source: "Strona team" },
      { name: "Jan Wiśniewski", role: "Production Lead", linkedin: "Verified", source: "LinkedIn" },
    ],
  },
  sources: {
    title: isEN ? "Where the data comes from — no black box" : "Skąd się biorą dane — bez czarnej skrzynki",
    items: isEN
      ? [
          { label: "Company website (team / about)", share: 42 },
          { label: "National business registries (VIES, KRS, HR, etc.)", share: 24 },
          { label: "Professional network (LinkedIn-class public data)", share: 20 },
          { label: "Trade directories (Europages, Kompass, Wer liefert was)", share: 9 },
          { label: "Email-pattern heuristics (validated via deliverability signals)", share: 5 },
        ]
      : [
          { label: "Strona firmowa (team / about)", share: 42 },
          { label: "Rejestry biznesowe (VIES, KRS, HR, itd.)", share: 24 },
          { label: "Sieć profesjonalna (LinkedIn-class public)", share: 20 },
          { label: "Katalogi (Europages, Kompass, Wer liefert was)", share: 9 },
          { label: "Heurystyki wzorca email (walidacja sygnałów dostarczalności)", share: 5 },
        ],
  },
  decisionMaker: {
    title: isEN ? "Decision-maker detection — which contact actually signs" : "Detekcja decydenta — który kontakt realnie podpisuje",
    subtitle: isEN ? "AI weighs title, hierarchy clues and LinkedIn activity. Procurement titles win in procurement campaigns; Sales titles win in sales. Freshness matters." : "AI waży tytuł, sygnały hierarchii i aktywność LinkedIn. Tytuły procurement wygrywają w procurement; sales w sales. Liczy się świeżość.",
    titleHits: isEN
      ? [
          { title: "Head of Procurement", weight: 100 },
          { title: "Category Manager", weight: 88 },
          { title: "Procurement Specialist", weight: 76 },
          { title: "Sales Director", weight: 62 },
          { title: "Managing Director / CEO", weight: 58 },
          { title: "Office Manager", weight: 24 },
        ]
      : [
          { title: "Kierownik Zakupów", weight: 100 },
          { title: "Category Manager", weight: 88 },
          { title: "Specjalista ds. Zakupów", weight: 76 },
          { title: "Dyrektor Sprzedaży", weight: 62 },
          { title: "Managing Director / CEO", weight: 58 },
          { title: "Office Manager", weight: 24 },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "Is enrichment GDPR-compliant?", a: "Yes. We process publicly available professional contact data (role-based, not personal). Contacts are flagged with source and last-verified date. Right-to-erasure requests resolve across every workspace." },
          { q: "What if a contact bounces?", a: "Hard bounces are removed from the active list and flagged in the supplier profile. The next enrichment pass looks for a replacement contact in the same role." },
          { q: "Do I pay per contact enriched?", a: "No — enrichment is included in every AI Sourcing campaign. No per-contact fees. No hidden enrichment credits." },
          { q: "Which regions have the best coverage?", a: "Strongest: DACH, Poland, France, Italy, Benelux. Good: CEE, Iberia, Nordics, Turkey. Improving: UK, Ireland, Baltics." },
        ]
      : [
          { q: "Czy enrichment jest zgodny z RODO?", a: "Tak. Przetwarzamy publicznie dostępne profesjonalne dane kontaktowe (role-based, nie osobowe). Kontakty flagowane źródłem i datą ostatniej weryfikacji. Prawo do usunięcia resolwuje się w każdym workspace." },
          { q: "Co jeśli kontakt bounce?", a: "Hard bounce usuwane z aktywnej listy i flagowane w profilu dostawcy. Następny pass enrichmentu szuka zastępcy w tej samej roli." },
          { q: "Płacę per enrichowany kontakt?", a: "Nie — enrichment wliczony w każdą kampanię AI Sourcing. Bez opłat per-kontakt. Bez ukrytych kredytów enrichmentu." },
          { q: "Które regiony mają najlepsze pokrycie?", a: "Najmocniejsze: DACH, Polska, Francja, Włochy, Benelux. Dobre: CEE, Iberia, Skandynawia, Turcja. Poprawiające się: UK, Irlandia, Bałtyckie." },
        ],
  },
}

export function ContactEnrichmentFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-emerald-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-5"><UserCheck className="h-3 w-3" />{t.hero.badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_enrich_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_enrich_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs font-medium text-slate-600 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Polfiber Sp. z o.o.</div>
                  <div className="p-5 space-y-2.5">
                    {t.before.rich.map((c, i) => (
                      <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50/30">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          {c.email ? <Mail className="h-3.5 w-3.5" /> : <Linkedin className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                            {c.verified && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{c.role}</div>
                          <div className="text-[9px] text-emerald-700 truncate">{c.source}</div>
                        </div>
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

        {/* BEFORE / AFTER */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.before.title}</h2>
            </RevealOnScroll>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-6">
                <div className="flex items-center gap-2 mb-4"><XCircle className="h-4 w-4 text-rose-600" /><span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">{isEN ? "Before" : "Przed"}</span></div>
                <div className="text-base font-bold mb-3">{t.before.empty.label}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4" />{t.before.empty.contact}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4" />{t.before.empty.role}</div>
                  <div className="flex items-center gap-2 text-slate-500 italic">{isEN ? "Freshness unknown" : "Świeżość nieznana"}</div>
                </div>
                <div className="mt-5 text-xs text-rose-700 italic">{isEN ? "Response rate on info@ = ~3%" : "Response rate na info@ = ~3%"}</div>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/30 p-6">
                <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{isEN ? "After enrichment" : "Po enrichmentu"}</span></div>
                <div className="space-y-2">
                  {t.before.rich.map((c) => (
                    <div key={c.name} className="flex items-center gap-3 rounded-xl bg-white border border-emerald-100 p-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        {c.email ? <Mail className="h-4 w-4" /> : <Linkedin className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold flex items-center gap-1.5">{c.name}{c.verified && <ShieldCheck className="h-3 w-3 text-emerald-600" />}</div>
                        <div className="text-xs text-slate-600">{c.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-emerald-700 italic">{isEN ? "Response rate on decision-maker = 35–45%" : "Response rate na decydenta = 35–45%"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* SOURCES */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.sources.title}</h2>
            </RevealOnScroll>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <div className="space-y-4">
                {t.sources.items.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">{s.label}</span>
                      <span className="text-sm font-extrabold tabular-nums text-emerald-700">{s.share}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.share}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }} className="h-full bg-gradient-to-r from-emerald-400 to-primary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DECISION MAKER */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.decisionMaker.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.decisionMaker.subtitle}</p>
              </div>
            </RevealOnScroll>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="space-y-3">
                {t.decisionMaker.titleHits.map((h, i) => (
                  <motion.div key={h.title} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="grid grid-cols-[1fr_160px_auto] gap-4 items-center">
                    <span className="text-sm text-slate-800 font-semibold">{h.title}</span>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${h.weight}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.06, duration: 0.7 }} className={`h-full ${h.weight >= 80 ? "bg-emerald-500" : h.weight >= 60 ? "bg-amber-500" : "bg-slate-300"}`} />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-10 text-right">{h.weight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions about enrichment" : "Pytania o enrichment"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Reach decision-makers, not info@" : "Dotrzyj do decydentów, nie info@"}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <a href={appendUtm(APP_URL, "feature_enrich_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_enrich_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
