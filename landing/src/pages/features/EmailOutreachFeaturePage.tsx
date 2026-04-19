import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, ChevronRight, Mail, ShieldCheck, Sparkles, Send, Settings, CheckCircle2,
  AlertCircle, Zap, Gauge, Inbox, Globe, Clock,
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
    badge: "Email Outreach",
    title: isEN ? "Send RFQ to 200+ suppliers in one click — from your own domain, not ours" : "Wyślij RFQ do 200+ dostawców jednym kliknięciem — z Twojej domeny, nie naszej",
    subtitle: isEN
      ? "Bulk-send without deliverability hell. Domain auth (SPF/DKIM/DMARC), warmup, rate-limiting, threaded reply tracking. Personalized per supplier, localized per language, trackable per campaign."
      : "Bulk-send bez piekła dostarczalności. Uwierzytelnienie domeny (SPF/DKIM/DMARC), warmup, rate-limiting, trackowanie odpowiedzi w wątkach. Spersonalizowane per dostawca, zlokalizowane per język, trackowalne per kampania.",
    primary: isEN ? "Start an RFQ campaign" : "Rozpocznij kampanię RFQ",
    secondary: isEN ? "See deliverability setup" : "Zobacz setup dostarczalności",
  },
  stats: [
    { v: "94%", l: isEN ? "avg inbox placement" : "średnie inbox placement", d: isEN ? "vs 62% unauthed" : "vs 62% nieuwierzytel." },
    { v: "2–3×", l: isEN ? "response rate uplift" : "uplift response rate", d: isEN ? "localized vs generic EN" : "zlokalizowane vs generic EN" },
    { v: "200+", l: isEN ? "suppliers per RFQ" : "dostawców per RFQ", d: isEN ? "bulk-send controlled" : "bulk-send kontrolowany" },
    { v: "Your", l: isEN ? "sending domain" : "domena nadawcza", d: isEN ? "not procurea.io" : "nie procurea.io" },
  ],
  // Deliverability pillars
  deliverability: {
    title: isEN ? "Deliverability, the part nobody wants to own — we own it" : "Dostarczalność, którą nikt nie chce się zająć — my zajmujemy się",
    subtitle: isEN ? "Bulk email without domain auth hits spam. Procurea sets it up per tenant and verifies continuously." : "Bulk email bez uwierzytelnienia domeny ląduje w spamie. Procurea ustawia to per tenant i ciągle weryfikuje.",
    pillars: isEN
      ? [
          { icon: ShieldCheck, name: "SPF", desc: "Authorize sending servers via DNS TXT. Procurea generates your record and monitors sync.", status: "Active" },
          { icon: ShieldCheck, name: "DKIM", desc: "Cryptographic signing per message. Keys rotated automatically.", status: "Active" },
          { icon: ShieldCheck, name: "DMARC", desc: "Policy + reporting. We ingest DMARC reports and flag alignment failures.", status: "Active" },
          { icon: Gauge, name: "Domain warmup", desc: "30-day ramp from 20/day → 1000/day. Reputation built, not burned.", status: "In progress" },
          { icon: Inbox, name: "Bounce handling", desc: "Hard bounces removed, soft bounces retried, catch-all flagged.", status: "Active" },
          { icon: AlertCircle, name: "Spam-trap detection", desc: "Pre-send list scrubbing blocks known honeypots and seeded addresses.", status: "Active" },
        ]
      : [
          { icon: ShieldCheck, name: "SPF", desc: "Autoryzuj serwery nadawcze przez DNS TXT. Procurea generuje rekord i monitoruje sync.", status: "Aktywny" },
          { icon: ShieldCheck, name: "DKIM", desc: "Kryptograficzne podpisywanie wiadomości. Klucze rotowane automatycznie.", status: "Aktywny" },
          { icon: ShieldCheck, name: "DMARC", desc: "Polityka + raportowanie. Przyjmujemy raporty DMARC i flagujemy niespójności alignment.", status: "Aktywny" },
          { icon: Gauge, name: "Warmup domeny", desc: "30-dniowa rampa z 20/dzień → 1000/dzień. Reputacja budowana, nie palona.", status: "W toku" },
          { icon: Inbox, name: "Obsługa bounce", desc: "Hard bounce usuwane, soft bounce retry, catch-all flagowane.", status: "Aktywny" },
          { icon: AlertCircle, name: "Spam-trap detection", desc: "Scrubbing listy przed wysyłką blokuje znane honeypoty i zasiane adresy.", status: "Aktywny" },
        ],
  },
  // Template personalization
  template: {
    title: isEN ? "Template engine — one draft, 200 personalized emails" : "Silnik template — jeden draft, 200 spersonalizowanych maili",
    subtitle: isEN ? "Merge fields, conditional blocks and language switching are first-class. Preview any recipient before send." : "Merge fields, bloki warunkowe i przełączanie języka to first-class. Podgląd dowolnego odbiorcy przed wysłaniem.",
    before: isEN ? "Hi {{contactFirstName}},\n\nI'm sourcing {{category}} suppliers for a {{volume}} project in {{region}}. Your company came up via {{discoverySource}}, and we'd like to send you an RFQ.\n\n{{#if certRequired}}Required: {{certRequired}}.{{/if}}\n\nBest,\n{{senderName}}" : "Cześć {{contactFirstName}},\n\nSzukam dostawców {{category}} do projektu {{volume}} w {{region}}. Państwa firma pojawiła się przez {{discoverySource}} i chcielibyśmy wysłać Państwu RFQ.\n\n{{#if certRequired}}Wymagane: {{certRequired}}.{{/if}}\n\nPozdrawiam,\n{{senderName}}",
    previews: isEN
      ? [
          { flag: "🇩🇪", lang: "DE", preview: "Guten Tag Herr Schmidt,\n\nIch suche nach Lieferanten für Spritzguss PA66 für ein 250k-Projekt in der EU. Ihre Firma kam über Wer liefert was, und wir möchten Ihnen eine Anfrage senden.\n\nErforderlich: IATF 16949.\n\nMit freundlichen Grüßen,\nAnna Kowalska" },
          { flag: "🇵🇱", lang: "PL", preview: "Dzień dobry Panie Marku,\n\nSzukam dostawców wtrysku PA66 do projektu 250k w UE. Państwa firma pojawiła się przez Kompass i chcielibyśmy wysłać Państwu RFQ.\n\nWymagane: IATF 16949.\n\nPozdrawiam,\nAnna Kowalska" },
          { flag: "🇮🇹", lang: "IT", preview: "Buongiorno Sig. Rossi,\n\nSto cercando fornitori di stampaggio a iniezione PA66 per un progetto da 250k in UE. La vostra azienda è emersa tramite Europages e vorremmo inviarvi una richiesta di offerta.\n\nRichiesto: IATF 16949.\n\nCordiali saluti,\nAnna Kowalska" },
        ]
      : [
          { flag: "🇩🇪", lang: "DE", preview: "Guten Tag Herr Schmidt,\n\nIch suche nach Lieferanten für Spritzguss PA66 für ein 250k-Projekt in der EU. Ihre Firma kam über Wer liefert was, und wir möchten Ihnen eine Anfrage senden.\n\nErforderlich: IATF 16949.\n\nMit freundlichen Grüßen,\nAnna Kowalska" },
          { flag: "🇵🇱", lang: "PL", preview: "Dzień dobry Panie Marku,\n\nSzukam dostawców wtrysku PA66 do projektu 250k w UE. Państwa firma pojawiła się przez Kompass i chcielibyśmy wysłać Państwu RFQ.\n\nWymagane: IATF 16949.\n\nPozdrawiam,\nAnna Kowalska" },
          { flag: "🇮🇹", lang: "IT", preview: "Buongiorno Sig. Rossi,\n\nSto cercando fornitori di stampaggio a iniezione PA66 per un progetto da 250k in UE. La vostra azienda è emersa tramite Europages e vorremmo inviarvi una richiesta di offerta.\n\nRichiesto: IATF 16949.\n\nCordiali saluti,\nAnna Kowalska" },
        ],
  },
  faq: {
    items: isEN
      ? [
          { q: "Do emails really come from my domain?", a: "Yes. SPF/DKIM/DMARC are set up against your sending domain (e.g. procurement@acme.com). Recipients reply directly; we mirror threads into the campaign view." },
          { q: "What if I don't have a sending domain set up?", a: "Use ours in the meantime (procurement@yourname.procurea.io). Inbox placement is lower but works out of the box. Upgrade to your domain anytime." },
          { q: "How fast do I ramp to full send volume?", a: "New domains warm up over 30 days (20/day → 1000/day). Existing domains with good reputation can send at full rate immediately. We monitor engagement and throttle if metrics slip." },
          { q: "Can suppliers reply in their own language?", a: "Yes — replies come into the portal in whatever language they were written. Our system translates for your working view, but keeps the original attached for audit." },
          { q: "Do you track opens and clicks?", a: "Open-pixel is optional per tenant (some B2B procurement teams disable for privacy). Reply tracking works via threading on Message-ID — no tracking pixel required." },
        ]
      : [
          { q: "Czy maile naprawdę idą z mojej domeny?", a: "Tak. SPF/DKIM/DMARC ustawiane na Twojej domenie nadawczej (np. procurement@acme.com). Odbiorcy odpowiadają bezpośrednio; mirrorujemy wątki do widoku kampanii." },
          { q: "A jeśli nie mam jeszcze setupu domeny?", a: "Użyj naszej (procurement@twojanazwa.procurea.io). Inbox placement niższy, ale działa od razu. Upgrade do swojej domeny kiedykolwiek." },
          { q: "Jak szybko rampuję do pełnego wolumenu?", a: "Nowe domeny warmup przez 30 dni (20/dzień → 1000/dzień). Istniejące z dobrą reputacją mogą iść na full od razu. Monitorujemy engagement i throttlujemy jeśli metryki się psują." },
          { q: "Czy dostawcy mogą odpowiadać w swoim języku?", a: "Tak — odpowiedzi przychodzą do portalu w języku w którym napisane. System tłumaczy do Twojego working view, ale oryginał dołączony do audytu." },
          { q: "Trackujecie openy i kliki?", a: "Open-pixel opcjonalny per tenant (niektóre zespoły B2B wyłączają ze względu na prywatność). Tracking odpowiedzi przez threading Message-ID — bez pixela." },
        ],
  },
}

export function EmailOutreachFeaturePage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main id="main-content">
        <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
          <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07] blur-[120px] bg-blue-400 pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.025)" spacing={56} className="opacity-60" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link to={pathFor("featuresHub")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"><ChevronRight className="h-3.5 w-3.5 rotate-180" />{isEN ? "All modules" : "Wszystkie moduły"}</Link>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-5">
                  <Mail className="h-3 w-3" />{t.hero.badge}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">{t.hero.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">{t.hero.subtitle}</p>
                <div className="flex gap-3">
                  <a href={appendUtm(APP_URL, "feature_email_hero_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_email_hero_primary")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">{t.hero.primary}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  <Link to={pathFor("contact")} className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{t.hero.secondary}</Link>
                </div>
              </div>

              <RevealOnScroll>
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/60">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Send className="h-3.5 w-3.5" />{isEN ? "Sending — RFQ #218" : "Wysyłanie — RFQ #218"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />LIVE</span>
                  </div>
                  <div className="p-5 space-y-3.5">
                    {[
                      { l: isEN ? "Queued" : "W kolejce", v: 217, tot: 312, tone: "bg-slate-400" },
                      { l: isEN ? "Sent" : "Wysłane", v: 164, tot: 217, tone: "bg-primary" },
                      { l: isEN ? "Delivered" : "Dostarczone", v: 158, tot: 164, tone: "bg-emerald-500" },
                      { l: isEN ? "Replies" : "Odpowiedzi", v: 42, tot: 158, tone: "bg-amber-500" },
                    ].map((r) => (
                      <div key={r.l}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{r.l}</span>
                          <span className="text-[11px] text-slate-500 tabular-nums">{r.v}<span className="text-slate-400"> / {r.tot}</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${(r.v / r.tot) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} className={`h-full ${r.tone}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 bg-blue-50/40 flex items-center gap-2 text-xs text-blue-800">
                    <ShieldCheck className="h-3.5 w-3.5" />{isEN ? "SPF ✓  DKIM ✓  DMARC ✓  domain reputation: high" : "SPF ✓  DKIM ✓  DMARC ✓  reputacja domeny: wysoka"}
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

        {/* DELIVERABILITY */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <ShieldCheck className="h-3 w-3" />Deliverability
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.deliverability.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.deliverability.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {t.deliverability.pillars.map((p, i) => (
                <motion.div key={p.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><p.icon className="h-5 w-5" /></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">{p.status}</span>
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{p.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEMPLATE */}
        <section className="py-20 bg-slate-50/60 border-y border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <div className="max-w-3xl mb-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
                  <Sparkles className="h-3 w-3" />{isEN ? "Template engine" : "Silnik template"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.template.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.template.subtitle}</p>
              </div>
            </RevealOnScroll>

            <div className="grid lg:grid-cols-2 gap-4">
              <RevealOnScroll>
                <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-xs leading-relaxed h-full overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Settings className="h-3 w-3" />{isEN ? "Template (you write once)" : "Template (piszesz raz)"}
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px]">{t.template.before}</pre>
                </div>
              </RevealOnScroll>

              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />{isEN ? "Rendered per recipient" : "Renderowane per odbiorca"}
                </div>
                {t.template.previews.map((p, i) => (
                  <motion.div key={p.lang} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-slate-500">
                      <span className="text-lg">{p.flag}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{p.lang}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-[11px] text-slate-700 leading-relaxed font-sans">{p.preview}</pre>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ + CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">{isEN ? "Questions before you hit send" : "Pytania zanim klikniesz send"}</h2>
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

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-primary text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{isEN ? "Send your first 200-supplier RFQ today" : "Wyślij pierwsze RFQ do 200 dostawców dzisiaj"}</h2>
              <p className="text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">{isEN ? "Domain auth in 10 minutes. First batch out by lunch." : "Setup domeny w 10 minut. Pierwszy batch wychodzi do lunchu."}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={appendUtm(APP_URL, "feature_email_footer_primary")} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick("feature_email_footer_primary")} className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-white text-blue-700 hover:bg-blue-50 shadow-lg">{isEN ? "Start free" : "Zacznij za darmo"}<ArrowRight className="ml-2 h-4 w-4" /></a>
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
