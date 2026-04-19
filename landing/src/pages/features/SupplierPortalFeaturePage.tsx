import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Link2, Smartphone, ShieldCheck, UploadCloud, Sparkles,
  FileCheck2, MessageSquare, Globe, CheckCircle2, KeyRound, Layers, Clock,
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
    badge: "Supplier Portal",
    title: isEN ? "Magic link, no login — suppliers submit structured quotes in 3 minutes" : "Magic link, bez logowania — dostawcy składają strukturalne oferty w 3 minuty",
    subtitle: isEN
      ? "Your supplier gets an email with one link. They click, land on a localized form, fill in per-BOQ-line pricing, attach docs, submit. No account creation, no password reset emails, no training call. Mobile-first for factory floors without laptops."
      : "Twój dostawca dostaje maila z jednym linkiem. Klika, ląduje na zlokalizowanym formularzu, wypełnia ceny per linia BOQ, dołącza dokumenty, wysyła. Bez konta, bez resetów hasła, bez call szkoleniowych. Mobile-first dla hal produkcyjnych bez laptopów.",
    primary: isEN ? "See a live portal" : "Zobacz portal na żywo",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "0", l: isEN ? "supplier logins to remember" : "loginów do zapamiętania", d: isEN ? "magic-link auth" : "auth magic-link" },
    { v: "78%", l: isEN ? "completion rate on portal RFQs" : "completion rate RFQ w portalu", d: isEN ? "vs 31% PDF attachments" : "vs 31% PDF-y" },
    { v: "26", l: isEN ? "languages — auto-localized" : "języków — auto-lokalizacja", d: isEN ? "based on supplier locale" : "na bazie lokalizacji" },
    { v: "3 min", l: isEN ? "median submission time" : "mediana czasu oferty", d: isEN ? "5 BOQ lines, mobile" : "5 linii BOQ, mobile" },
  ],
  flow: {
    title: isEN ? "4 taps from email to submitted offer" : "4 tapnięcia od maila do złożonej oferty",
    steps: isEN
      ? [
          { icon: Link2, title: "Email arrives", body: "Localized subject line, personalized body, one magic link. No attachments.", tone: "sky" },
          { icon: Smartphone, title: "Mobile-first portal opens", body: "Responsive form, renders in supplier's language, pre-populated with known data.", tone: "primary" },
          { icon: FileCheck2, title: "Structured fields fill in", body: "Per-line pricing, MOQ, lead time, Incoterms, currency, attachments.", tone: "amber" },
          { icon: UploadCloud, title: "Submit confirms instantly", body: "Email receipt, thread notification back to your inbox. You see offer in portal in real time.", tone: "emerald" },
        ]
      : [
          { icon: Link2, title: "Email przychodzi", body: "Zlokalizowany subject, spersonalizowany body, jeden magic link. Bez załączników.", tone: "sky" },
          { icon: Smartphone, title: "Mobile-first portal się otwiera", body: "Responsive form, renderuje się w języku dostawcy, prepopulated znanymi danymi.", tone: "primary" },
          { icon: FileCheck2, title: "Wypełnia pola strukturalne", body: "Ceny per linia, MOQ, lead time, Incoterms, waluta, załączniki.", tone: "amber" },
          { icon: UploadCloud, title: "Submit potwierdza natychmiast", body: "Email potwierdzenia, notyfikacja wątku do Twojego inboxu. Widzisz ofertę w portalu w real time.", tone: "emerald" },
        ],
  },
  security: {
    title: isEN ? "Magic-link security, explained for your CISO" : "Bezpieczeństwo magic-link, wyjaśnione dla Twojego CISO",
    items: isEN
      ? [
          { icon: KeyRound, label: "Single-use token", desc: "Tokens expire after first use or 72 hours — whichever first." },
          { icon: ShieldCheck, label: "Bound to contact email", desc: "Forwarded links fail if opened from a different email domain." },
          { icon: Clock, label: "Session-bound uploads", desc: "File uploads require active session; re-auth needed for edits after 30 min." },
          { icon: Globe, label: "EU data residency", desc: "All uploads and form data stored in EU infrastructure." },
        ]
      : [
          { icon: KeyRound, label: "Token jednorazowy", desc: "Tokeny wygasają po pierwszym użyciu albo 72h — co nastąpi pierwsze." },
          { icon: ShieldCheck, label: "Powiązany z emailem kontaktu", desc: "Przekazane linki nie zadziałają z innego emaila." },
          { icon: Clock, label: "Uploady związane z sesją", desc: "Pliki wymagają aktywnej sesji; re-auth potrzebny do edycji po 30 min." },
          { icon: Globe, label: "Rezydencja danych UE", desc: "Uploady i dane formularza w infrastrukturze UE." },
        ],
  },
  qa: {
    title: isEN ? "Clarifications thread — no more email ping-pong" : "Wątek wyjaśnień — koniec z ping-pongiem maili",
    example: isEN
      ? [
          { from: "Supplier", name: "Polfiber Sp. z o.o.", msg: "For line 3.1.7, can you confirm thermal conductivity requirement — 0.031 or 0.034 W/m·K?", time: "12:14" },
          { from: "Buyer", name: "Anna Kowalska (Procurea)", msg: "0.031 is required per local building code; please quote that grade only.", time: "12:22" },
          { from: "Supplier", name: "Polfiber Sp. z o.o.", msg: "Confirmed. Quote updated — new unit price €21.40 / m².", time: "12:35" },
        ]
      : [
          { from: "Dostawca", name: "Polfiber Sp. z o.o.", msg: "Dla linii 3.1.7, proszę potwierdzić wymaganie przewodności cieplnej — 0,031 czy 0,034 W/m·K?", time: "12:14" },
          { from: "Kupujący", name: "Anna Kowalska (Procurea)", msg: "Wymagane 0,031 zgodnie z WT; proszę wycenić tylko tę klasę.", time: "12:22" },
          { from: "Dostawca", name: "Polfiber Sp. z o.o.", msg: "Potwierdzone. Oferta zaktualizowana — nowa cena 21,40 zł / m².", time: "12:35" },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "What happens if the supplier loses the email?", a: "They request a new magic link from the portal page. You see all token requests in the audit log." },
          { q: "Can multiple people from the supplier team collaborate?", a: "Yes — they share the magic link within their team. All actions log under the same supplier session; you see which contact submitted." },
          { q: "How do suppliers upload attachments (cert PDFs, price sheets)?", a: "Drag-drop or file picker. Up to 50 MB per file. Virus-scanned on upload. Stored encrypted alongside the supplier record." },
          { q: "Is the portal really usable on a phone?", a: "Yes. We test on iOS Safari and Android Chrome weekly. 60% of supplier submissions in our pilot came from mobile devices." },
          { q: "What if a supplier prefers replying by email?", a: "You can still accept email replies — they're threaded into the campaign view. But the structured portal path gets 2× higher completion because the fields are explicit." },
        ]
      : [
          { q: "Co jeśli dostawca zgubi maila?", a: "Żąda nowego magic linka ze strony portalu. Wszystkie requesty tokenów widzisz w audit logu." },
          { q: "Czy wiele osób z zespołu dostawcy może współpracować?", a: "Tak — dzielą się linkiem w zespole. Wszystkie akcje logują się pod tą samą sesją dostawcy; widzisz który kontakt złożył." },
          { q: "Jak dostawcy uploadują załączniki (PDF certów, cenniki)?", a: "Drag-drop lub file picker. Do 50 MB per plik. Virus-scan przy uploadzie. Szyfrowane, trzymane przy rekordzie dostawcy." },
          { q: "Czy portal jest naprawdę użyteczny na telefonie?", a: "Tak. Testujemy iOS Safari i Android Chrome co tydzień. 60% zgłoszeń w pilocie przyszło z mobilnych." },
          { q: "A jeśli dostawca woli odpowiadać mailem?", a: "Nadal akceptujesz maile — threadują się w widoku kampanii. Ale ścieżka portal dostaje 2× wyższy completion bo pola są explicit." },
        ],
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string }> = {
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
}

export function SupplierPortalFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-cyan-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-cyan-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-[11px] font-bold text-cyan-800 uppercase tracking-wider mb-5">
                  <Link2 className="h-3 w-3" />{t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_portal_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_portal_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              {/* Hero: phone mockup */}
              <RevealOnScroll>
                <div className="relative mx-auto w-[260px]">
                  <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-cyan-200/40 to-primary/10 blur-2xl scale-110" />
                  <div className="relative rounded-[40px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden">
                    <div className="h-6 bg-slate-900 flex items-center justify-center">
                      <div className="w-24 h-4 rounded-full bg-slate-800" />
                    </div>
                    <div className="bg-white p-4">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">procurea.io/offer</div>
                      <div className="text-sm font-bold mb-3">{isEN ? "RFQ #218 — Residential development" : "RFQ #218 — Osiedle"}</div>
                      <div className="space-y-2 mb-3">
                        {[
                          { l: isEN ? "Line 3.1.7 — EPS 100" : "Linia 3.1.7 — EPS 100", v: "€21.40" },
                          { l: isEN ? "Line 4.2.5 — PVC windows" : "Linia 4.2.5 — Okna PCV", v: "€398" },
                          { l: isEN ? "Lead time" : "Lead time", v: "5 weeks" },
                        ].map((r) => (
                          <div key={r.l} className="rounded-lg border border-slate-200 p-2">
                            <div className="text-[10px] text-slate-500 mb-0.5">{r.l}</div>
                            <div className="text-xs font-bold text-slate-900">{r.v}</div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full text-[11px] font-bold py-2.5 rounded-lg bg-primary text-white">{isEN ? "Submit offer" : "Złóż ofertę"}</button>
                      <div className="mt-2 text-center text-[9px] text-slate-400">{isEN ? "🔒 Magic-link session · EU hosted" : "🔒 Sesja magic-link · UE hosted"}</div>
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

        {/* FLOW */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.flow.title}</h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.flow.steps.map((s, i) => {
                const c = toneMap[s.tone]
                return (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-5 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.text}`}><s.icon className="h-6 w-6" /></div>
                      <span className="text-5xl font-extrabold text-slate-100 leading-none">{i + 1}</span>
                    </div>
                    <h3 className="text-base font-bold mb-1.5">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <ShieldCheck className="h-3 w-3" />Security
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t.security.title}</h2>
              </div>
            </RevealOnScroll>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.security.items.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-3"><item.icon className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Q&A THREAD */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-3">
                  <MessageSquare className="h-3 w-3" />Q&A
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t.qa.title}</h2>
              </div>
            </RevealOnScroll>
            <div className="space-y-3">
              {t.qa.example.map((m, i) => {
                const isSupplier = m.from === "Supplier" || m.from === "Dostawca"
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: isSupplier ? -8 : 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`rounded-2xl border p-4 ${isSupplier ? "border-slate-200 bg-white" : "border-primary/20 bg-primary/5 ml-6"}`}>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className={`text-xs font-bold ${isSupplier ? "text-slate-900" : "text-primary"}`}>{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{m.msg}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ + CTA */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions before rolling out" : "Pytania zanim wdrożysz"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Suppliers log in to nothing, yet submit everything" : "Dostawcy nie logują się nigdzie, a składają wszystko"}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{isEN ? "Start a campaign, watch portal completion rate triple." : "Uruchom kampanię, obserwuj potrójny completion rate portalu."}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "feature_portal_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_portal_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
