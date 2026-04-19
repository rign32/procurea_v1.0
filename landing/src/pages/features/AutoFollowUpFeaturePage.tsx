import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Repeat, Clock, Send, PauseCircle, CheckCircle2, MessageSquare, Zap, Bell,
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
    badge: isEN ? "Auto Follow-up" : "Auto Follow-up",
    title: isEN ? "Sequences that nudge non-responders — and stop the second they reply" : "Sekwencje docierające do nierespondentów — i zatrzymujące się w sekundzie odpowiedzi",
    subtitle: isEN
      ? "Default 3-step sequence: first send → D+3 soft nudge → D+7 escalation → D+14 final. Smart-pause detects replies and halts the thread instantly. A/B the copy per step. Localized per language."
      : "Domyślna sekwencja 3-krokowa: pierwsza wysyłka → D+3 soft nudge → D+7 eskalacja → D+14 final. Smart-pause wykrywa odpowiedzi i zatrzymuje wątek natychmiast. A/B treści per krok. Zlokalizowane per język.",
    primary: isEN ? "Design a sequence" : "Zaprojektuj sekwencję",
    secondary: isEN ? "Book a demo" : "Umów demo",
  },
  stats: [
    { v: "+42%", l: isEN ? "total reply rate" : "całkowity reply rate", d: isEN ? "with 3 nudges vs 1 send" : "z 3 nudge vs 1 send" },
    { v: "0.3s", l: isEN ? "smart-pause latency" : "latencja smart-pause", d: isEN ? "from reply to halt" : "od odpowiedzi do stop" },
    { v: "A/B", l: isEN ? "split testing per step" : "split testing per krok", d: isEN ? "winner auto-picked" : "zwycięzca auto" },
    { v: "26", l: isEN ? "languages localized" : "języków zlokalizowanych", d: isEN ? "per step, per supplier" : "per krok, per dostawca" },
  ],
  sequence: {
    title: isEN ? "Default 4-step sequence (editable)" : "Domyślna sekwencja 4-krokowa (edytowalna)",
    steps: isEN
      ? [
          { day: "D+0", title: "First send", tone: "sky", tone2: "Professional", subject: "RFQ — Injection molding, PA66 GF30, IATF 16949", preview: "Hello {{firstName}}, I'm sourcing injection molders for a 250k-unit automotive project...", rate: "First touch" },
          { day: "D+3", title: "Soft nudge", tone: "primary", tone2: "Friendly", subject: "Re: RFQ — any interest?", preview: "Just following up in case my previous message got lost. Happy to share more specs...", rate: "+18% total" },
          { day: "D+7", title: "Escalation", tone: "amber", tone2: "Urgent", subject: "Final call — RFQ closing Friday", preview: "We're narrowing our shortlist this week. If you'd like to participate...", rate: "+21% total" },
          { day: "D+14", title: "Closeout", tone: "violet", tone2: "Respectful exit", subject: "Closing — thank you for your time", preview: "If now isn't the right time, no problem. We'll keep your company in our database for future projects...", rate: "+3% total" },
        ]
      : [
          { day: "D+0", title: "Pierwsza wysyłka", tone: "sky", tone2: "Profesjonalna", subject: "RFQ — Wtrysk, PA66 GF30, IATF 16949", preview: "Dzień dobry {{firstName}}, szukam wtryskarni do projektu motoryzacyjnego 250k szt...", rate: "Pierwszy dotyk" },
          { day: "D+3", title: "Soft nudge", tone: "primary", tone2: "Przyjazna", subject: "Re: RFQ — zainteresowanie?", preview: "Ponawiam na wypadek gdyby poprzednia wiadomość się zgubiła. Chętnie podzielę się spec...", rate: "+18% total" },
          { day: "D+7", title: "Eskalacja", tone: "amber", tone2: "Pilna", subject: "Ostatni dzwonek — RFQ zamyka się w piątek", preview: "Zawężamy shortlistę w tym tygodniu. Jeśli chcą Państwo uczestniczyć...", rate: "+21% total" },
          { day: "D+14", title: "Closeout", tone: "violet", tone2: "Uprzejme zamknięcie", subject: "Zamykamy — dziękujemy za czas", preview: "Jeśli teraz nie jest dobry czas, OK. Zostawiamy Państwa w bazie na przyszłe projekty...", rate: "+3% total" },
        ],
  },
  smartPause: {
    title: isEN ? "Smart-pause — the thing that stops you from being that spammer" : "Smart-pause — to co zatrzymuje Cię przed byciem tym spamerem",
    subtitle: isEN ? "The second a supplier replies, we halt their sequence. No more 'got your quote, here's my nudge' awkwardness." : "W sekundzie gdy dostawca odpowie, zatrzymujemy jego sekwencję. Koniec z 'dostałem ofertę, oto mój nudge'.",
    events: isEN
      ? [
          { t: "12:14", name: "Polfiber Sp. z o.o.", event: "D+3 nudge scheduled", tone: "sky" },
          { t: "12:42", name: "Polfiber Sp. z o.o.", event: "Supplier replied — nudge paused", tone: "emerald" },
          { t: "12:43", name: "Polfiber Sp. z o.o.", event: "Sequence marked complete", tone: "violet" },
        ]
      : [
          { t: "12:14", name: "Polfiber Sp. z o.o.", event: "Nudge D+3 zaplanowany", tone: "sky" },
          { t: "12:42", name: "Polfiber Sp. z o.o.", event: "Dostawca odpowiedział — nudge wstrzymany", tone: "emerald" },
          { t: "12:43", name: "Polfiber Sp. z o.o.", event: "Sekwencja oznaczona complete", tone: "violet" },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "Can I customize timing (e.g. longer gaps for big enterprises)?", a: "Yes. Every step has editable timing, copy and audience segmentation. Global default is 0 / 3 / 7 / 14 days; change per campaign or per tier." },
          { q: "What triggers smart-pause?", a: "Inbound email threaded to the original Message-ID, or any portal action (opening the RFQ, starting a quote). Bounces, OOO replies and auto-responders don't trigger pause." },
          { q: "Can I A/B test copy at each step?", a: "Yes. Define two variants per step; the system sends 50/50 and picks the winner by reply rate after 20+ sends. Ongoing sequences auto-switch to the winning variant." },
          { q: "What if the supplier wants to be removed?", a: "One-click unsubscribe works in every email. Unsubscribes propagate across campaigns — they'll never get another nudge from your account." },
        ]
      : [
          { q: "Mogę dostosować timing (np. dłuższe gapy dla dużych enterprise)?", a: "Tak. Każdy krok ma edytowalny timing, treść i segmentację audience. Globalny default 0 / 3 / 7 / 14 dni; zmień per kampania albo tier." },
          { q: "Co wyzwala smart-pause?", a: "Inbound email threadowany do oryginalnego Message-ID, albo dowolna akcja w portalu (otwarcie RFQ, rozpoczęcie oferty). Bounce, OOO, auto-respondery nie wyzwalają pauzy." },
          { q: "Mogę A/B testować treść w każdym kroku?", a: "Tak. Zdefiniuj dwa warianty per krok; system wysyła 50/50 i wybiera zwycięzcę po reply rate po 20+ wysyłkach. Trwające sekwencje auto-przełączają się na winning wariant." },
          { q: "A jeśli dostawca chce zostać usunięty?", a: "One-click unsubscribe w każdym mailu. Unsubscribes propagują się między kampaniami — nie dostaną już żadnego nudge z Twojego konta." },
        ],
  },
}

const toneMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500", border: "border-sky-200" },
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", border: "border-primary/30" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", border: "border-violet-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" },
}

export function AutoFollowUpFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-amber-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-amber-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-5"><Repeat className="h-3 w-3" />{t.hero.badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_follow_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_follow_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>
              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-amber-600" /><span className="font-medium text-slate-600">{isEN ? "Live feed" : "Live feed"}</span></div>
                  <div className="p-5 space-y-2.5">
                    {t.smartPause.events.map((e, i) => {
                      const c = toneMap[e.tone]
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums w-10 mt-0.5">{e.t}</span>
                          <div className={`h-2 w-2 rounded-full ${c.bar} mt-1.5 shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">{e.name}</div>
                            <div className="text-[11px] text-slate-600">{e.event}</div>
                          </div>
                        </motion.div>
                      )
                    })}
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

        {/* SEQUENCE */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 max-w-3xl">{t.sequence.title}</h2>
            </RevealOnScroll>
            <div className="relative">
              <div className="absolute left-9 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-300 via-primary via-amber-300 to-violet-300" />
              <div className="space-y-5">
                {t.sequence.steps.map((s, i) => {
                  const c = toneMap[s.tone]
                  return (
                    <motion.div key={s.title} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative pl-20">
                      <div className={`absolute left-0 top-0 h-[76px] w-[76px] rounded-2xl ${c.bg} ${c.text} ring-4 ring-white flex flex-col items-center justify-center font-mono font-bold text-xs shadow-sm`}>
                        <div className="text-[9px] opacity-70">{isEN ? "DAY" : "DZIEŃ"}</div>
                        <div className="text-lg">{s.day.replace("D+", "")}</div>
                      </div>
                      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-baseline gap-3">
                            <h3 className="text-lg font-bold">{s.title}</h3>
                            <span className={`text-xs font-semibold italic ${c.text}`}>{s.tone2}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>{s.rate}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{isEN ? "Subject" : "Temat"}</div>
                          <div className="text-xs font-bold text-slate-900 mb-2">{s.subject}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{isEN ? "Body preview" : "Podgląd treści"}</div>
                          <div className="text-xs text-slate-700 italic leading-relaxed">{s.preview}</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SMART PAUSE */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <PauseCircle className="h-3 w-3" />Smart-pause
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.smartPause.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.smartPause.subtitle}</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {t.smartPause.events.map((e, i) => {
                  const c = toneMap[e.tone]
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
                      <span className="text-xs font-mono text-slate-400 tabular-nums w-14">{e.t}</span>
                      <div className={`h-2.5 w-2.5 rounded-full ${c.bar} ring-4 ring-white shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900">{e.name}</div>
                        <div className="text-xs text-slate-600">{e.event}</div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>{i === 0 ? "Queued" : i === 1 ? "Paused" : "Done"}</span>
                    </motion.div>
                  )
                })}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions before you automate" : "Pytania zanim zautomatyzujesz"}</h2>
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "+42% reply rate, zero hand-written nudges" : "+42% reply rate, zero ręcznych nudge"}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <a href={appendUtm(APP_URL, "feature_follow_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_follow_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-amber-700 hover:bg-amber-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
