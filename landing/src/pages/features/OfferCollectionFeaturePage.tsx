import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, FileCheck2, Zap, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle,
  Paperclip, Hash, Calendar, CircleDollarSign, Scale, History,
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
    badge: isEN ? "Offer Collection" : "Zbieranie Ofert",
    title: isEN ? "Structured quotes, not PDF attachments — every field in its place" : "Strukturalne oferty, nie załączniki PDF — każde pole na swoim miejscu",
    subtitle: isEN
      ? "Bidders fill structured fields (price tiers, MOQ, lead time, Incoterms, payment terms, validity). Validation blocks submission if required fields are missing. Version history per offer. Audit trail on every edit."
      : "Bidderzy wypełniają strukturalne pola (tiered ceny, MOQ, lead time, Incoterms, warunki płatności, ważność). Walidacja blokuje submit przy brakujących wymaganych. Historia wersji per oferta. Audit trail na każdej edycji.",
    primary: isEN ? "See the offer form" : "Zobacz formularz oferty",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "0", l: isEN ? "PDFs to parse" : "PDF-ów do parsowania", d: isEN ? "structured from submission" : "strukturalne od submitu" },
    { v: "4–8h", l: isEN ? "saved per RFQ" : "oszczędzone per RFQ", d: isEN ? "on offer normalization" : "na normalizacji ofert" },
    { v: "v3", l: isEN ? "version history / offer" : "historia wersji / oferta", d: isEN ? "every edit timestamped" : "każda edycja timestamped" },
    { v: "Audit", l: isEN ? "trail on everything" : "trail na wszystkim", d: isEN ? "who changed what, when" : "kto, co, kiedy" },
  ],
  fields: {
    title: isEN ? "The structured fields — no ambiguity, no misunderstanding" : "Strukturalne pola — bez dwuznaczności, bez nieporozumień",
    groups: isEN
      ? [
          { label: "Pricing", icon: CircleDollarSign, items: ["Unit price (per SKU, per volume tier)", "Currency (auto-converted)", "Discount schedule", "Validity period", "Payment terms (days net)"] },
          { label: "Logistics", icon: Scale, items: ["Incoterms (EXW / FOB / CIF / DDP)", "Lead time (days or weeks)", "MOQ (per SKU)", "Packaging spec", "Country of origin"] },
          { label: "Compliance", icon: ShieldCheck, items: ["Certifications (expiry-tracked, buyer-approved)", "Insurance coverage", "Declaration of conformity", "Test reports attached", "Safety data sheet"] },
          { label: "Evidence", icon: Paperclip, items: ["Price sheet (optional)", "Sample images", "Technical datasheet", "Reference letters", "Case studies"] },
        ]
      : [
          { label: "Cennik", icon: CircleDollarSign, items: ["Cena jednostkowa (per SKU, per tier wolumenu)", "Waluta (auto-konwersja)", "Harmonogram rabatów", "Ważność", "Płatność (dni netto)"] },
          { label: "Logistyka", icon: Scale, items: ["Incoterms (EXW / FOB / CIF / DDP)", "Lead time (dni/tyg.)", "MOQ (per SKU)", "Spec opakowania", "Kraj pochodzenia"] },
          { label: "Compliance", icon: ShieldCheck, items: ["Certyfikaty (tracking ważności + akceptacja kupującego)", "Zakres ubezpieczenia", "Deklaracja zgodności", "Załączone raporty", "Karta charakterystyki"] },
          { label: "Dowody", icon: Paperclip, items: ["Cennik (opcjonalnie)", "Zdjęcia sampli", "Datasheet techniczny", "Listy referencyjne", "Case studies"] },
        ],
  },
  validation: {
    title: isEN ? "Validation — what stops a half-baked submission" : "Walidacja — co blokuje niepełne submitowanie",
    rules: isEN
      ? [
          { ok: true, rule: "Required fields filled", detail: "Unit price + MOQ + lead time + validity" },
          { ok: true, rule: "Currency valid ISO-4217 code", detail: "EUR / PLN / USD / TRY accepted" },
          { ok: true, rule: "Incoterms well-known value", detail: "EXW / FOB / CIF / DDP / DAP" },
          { ok: false, rule: "Certification cert number present", detail: "IATF 16949 cert number missing — blocks submit" },
          { ok: true, rule: "Validity date in the future", detail: "Min 14 days from submission" },
          { ok: true, rule: "At least one attachment", detail: "Price sheet OR datasheet" },
        ]
      : [
          { ok: true, rule: "Wymagane pola wypełnione", detail: "Cena + MOQ + lead time + ważność" },
          { ok: true, rule: "Waluta valid ISO-4217", detail: "EUR / PLN / USD / TRY" },
          { ok: true, rule: "Incoterms wartość", detail: "EXW / FOB / CIF / DDP / DAP" },
          { ok: false, rule: "Numer certyfikatu present", detail: "Brakuje numeru IATF 16949 — blokuje submit" },
          { ok: true, rule: "Data ważności w przyszłości", detail: "Min 14 dni od submitu" },
          { ok: true, rule: "Przynajmniej jeden załącznik", detail: "Cennik LUB datasheet" },
        ],
  },
  history: {
    title: isEN ? "Version history — every change tracked" : "Historia wersji — każda zmiana trackowana",
    items: isEN
      ? [
          { v: "v3", time: "Today 14:22", by: "Supplier (Polfiber)", change: "Updated unit price to €21.40 after clarification", tone: "emerald" },
          { v: "v2", time: "Today 12:35", by: "Supplier (Polfiber)", change: "Clarified thermal conductivity to 0.031 W/m·K", tone: "sky" },
          { v: "v1", time: "Yesterday 16:08", by: "Supplier (Polfiber)", change: "Initial offer submitted", tone: "slate" },
        ]
      : [
          { v: "v3", time: "Dziś 14:22", by: "Dostawca (Polfiber)", change: "Zaktualizowana cena jednostkowa 21,40 € po wyjaśnieniu", tone: "emerald" },
          { v: "v2", time: "Dziś 12:35", by: "Dostawca (Polfiber)", change: "Wyjaśniono przewodność cieplną 0,031 W/m·K", tone: "sky" },
          { v: "v1", time: "Wczoraj 16:08", by: "Dostawca (Polfiber)", change: "Oferta pierwotna złożona", tone: "slate" },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "What if a supplier still wants to attach a PDF?", a: "They can — attachments are allowed alongside structured fields. But validation still requires the structured fields, so we capture price/MOQ/lead time in a comparable format either way." },
          { q: "Can we customize required vs optional fields per RFQ?", a: "Yes. Every campaign has a template editor. Mark fields required or optional, add custom fields, reorder. Templates save for reuse." },
          { q: "How do clarifications modify an existing offer?", a: "Bidders can open their portal at any time and submit a revised version. Each version is timestamped and linked to the Q&A thread that triggered it." },
          { q: "Is the audit trail enough for public-tender compliance?", a: "Yes — every submission, edit and clarification has immutable timestamp, IP, session ID and user (bidder contact) logged. Meets EU public-tender evidentiary requirements." },
        ]
      : [
          { q: "A jeśli dostawca chce dołączyć PDF?", a: "Może — załączniki dozwolone obok strukturalnych pól. Ale walidacja nadal wymaga strukturalnych pól, więc łapiemy cenę/MOQ/lead time w porównywalnym formacie." },
          { q: "Możemy customizować wymagane vs opcjonalne pola per RFQ?", a: "Tak. Każda kampania ma edytor template. Oznacz pola wymagane/opcjonalne, dodawaj custom, zmieniaj kolejność. Templates zapisują się do reuse." },
          { q: "Jak wyjaśnienia modyfikują istniejącą ofertę?", a: "Bidderzy mogą otworzyć portal w dowolnym momencie i złożyć zrewidowaną wersję. Każda wersja timestamped i podpięta do wątku Q&A który ją wywołał." },
          { q: "Czy audit trail wystarczy pod public-tender compliance?", a: "Tak — każdy submit, edycja i wyjaśnienie ma niemutowalny timestamp, IP, session ID i user (kontakt biddera). Spełnia wymagania dowodowe tenderów UE." },
        ],
  },
}

export function OfferCollectionFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-sky-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-sky-500 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-5"><FileCheck2 className="h-3 w-3" />{t.hero.badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_offer_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_offer_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs font-medium text-slate-600 flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5 text-sky-700" />{isEN ? "Offer form — Polfiber" : "Formularz oferty — Polfiber"}</div>
                  <div className="p-5 space-y-3">
                    {[
                      { l: isEN ? "Unit price" : "Cena jedn.", v: "€21.40", icon: CircleDollarSign, ok: true },
                      { l: "MOQ", v: "500 m²", icon: Hash, ok: true },
                      { l: "Lead time", v: "5 weeks", icon: Calendar, ok: true },
                      { l: "Incoterms", v: "DDP", icon: Scale, ok: true },
                      { l: "IATF cert #", v: "—", icon: ShieldCheck, ok: false },
                    ].map((r) => (
                      <div key={r.l} className={`flex items-center justify-between p-2.5 rounded-lg border ${r.ok ? "border-slate-200 bg-white" : "border-rose-200 bg-rose-50/60"}`}>
                        <div className="flex items-center gap-2 text-xs text-slate-600"><r.icon className="h-3.5 w-3.5" />{r.l}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tabular-nums">{r.v}</span>
                          {r.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-rose-50 border-t border-rose-100 text-xs text-rose-800 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />{isEN ? "Submit blocked — IATF cert # required" : "Submit zablokowany — wymagany nr certu IATF"}</div>
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

        {/* FIELDS */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.fields.title}</h2>
            </RevealOnScroll>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.fields.groups.map((g, i) => (
                <motion.div key={g.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 mb-3"><g.icon className="h-5 w-5" /></div>
                  <h3 className="text-base font-bold mb-3">{g.label}</h3>
                  <ul className="space-y-1.5">
                    {g.items.map((it) => <li key={it} className="text-xs text-slate-600 flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-sky-600 mt-0.5 shrink-0" />{it}</li>)}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* VALIDATION */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">{t.validation.title}</h2>
            </RevealOnScroll>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {t.validation.rules.map((r, i) => (
                <motion.div key={r.rule} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`flex items-start gap-3 px-5 py-4 border-b border-slate-100 last:border-0 ${r.ok ? "" : "bg-rose-50/40"}`}>
                  {r.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${r.ok ? "text-slate-900" : "text-rose-800"}`}>{r.rule}</div>
                    <div className={`text-xs mt-0.5 ${r.ok ? "text-slate-500" : "text-rose-600"}`}>{r.detail}</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${r.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{r.ok ? "PASS" : "FAIL"}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* VERSION HISTORY */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-[11px] font-bold text-violet-800 uppercase tracking-wider mb-3"><History className="h-3 w-3" />{isEN ? "Audit trail" : "Audit trail"}</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t.history.title}</h2>
              </div>
            </RevealOnScroll>
            <div className="relative pl-9">
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-slate-200 via-violet-300 to-emerald-300" />
              <div className="space-y-4">
                {t.history.items.map((h, i) => (
                  <motion.div key={h.v} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                    <div className={`absolute -left-[33px] top-1 h-5 w-5 rounded-full ring-4 ring-white flex items-center justify-center text-[9px] font-bold text-white ${h.tone === "emerald" ? "bg-emerald-500" : h.tone === "sky" ? "bg-sky-500" : "bg-slate-400"}`}>{h.v}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400">{h.time}</span>
                        <span className="text-xs font-bold text-slate-900">{h.by}</span>
                      </div>
                      <div className="text-sm text-slate-700">{h.change}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions from compliance teams" : "Pytania od compliance"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Structured from submission, comparable forever" : "Strukturalne od submitu, porównywalne na zawsze"}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <a href={appendUtm(APP_URL, "feature_offer_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_offer_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-sky-700 hover:bg-sky-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
