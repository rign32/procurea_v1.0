import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { appendUtm } from "@/lib/utm"
import { trackCtaClick } from "@/lib/analytics"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

/* ─────────── Plans — same features across tiers, differ only in volume ─────────── */

type PlanCta = 'self-serve' | 'featured'

interface Plan {
  name: string
  price: string
  unit: string
  runs: string
  perRun: string
  tagline: string
  cta: { label: string; kind: PlanCta; interestTag?: string }
  featured?: boolean
}

const plans: Plan[] = isEN
  ? [
      {
        name: "Starter",
        price: "$69",
        unit: "/ month",
        runs: "10 sourcing campaigns",
        perRun: "$6.90 / campaign",
        tagline: "For a single buyer running occasional RFQs.",
        cta: { label: "Start free", kind: "self-serve" },
      },
      {
        name: "Growth",
        price: "$159",
        unit: "/ month",
        runs: "50 sourcing campaigns",
        perRun: "$3.18 / campaign",
        tagline: "For procurement teams of 2–5 at an SMB manufacturer or builder.",
        cta: { label: "Start Growth", kind: "featured", interestTag: "growth_plan" },
        featured: true,
      },
      {
        name: "Scale",
        price: "$299",
        unit: "/ month",
        runs: "150 sourcing campaigns",
        perRun: "$1.99 / campaign",
        tagline: "For multi-site, multi-category operations.",
        cta: { label: "Start Scale", kind: "self-serve", interestTag: "scale_plan" },
      },
    ]
  : [
      {
        name: "Starter",
        price: "289 zł",
        unit: "/ miesiąc",
        runs: "10 kampanii sourcingowych",
        perRun: "28,90 zł / kampania",
        tagline: "Dla jednego kupca prowadzącego kilka RFQ miesięcznie.",
        cta: { label: "Zacznij za darmo", kind: "self-serve" },
      },
      {
        name: "Growth",
        price: "649 zł",
        unit: "/ miesiąc",
        runs: "50 kampanii sourcingowych",
        perRun: "12,98 zł / kampania",
        tagline: "Dla 2–5 osobowych zespołów procurement w SMB produkcji lub budownictwie.",
        cta: { label: "Zacznij Growth", kind: "featured", interestTag: "growth_plan" },
        featured: true,
      },
      {
        name: "Scale",
        price: "1 199 zł",
        unit: "/ miesiąc",
        runs: "150 kampanii sourcingowych",
        perRun: "7,99 zł / kampania",
        tagline: "Dla multi-site, multi-category operacji.",
        cta: { label: "Zacznij Scale", kind: "self-serve", interestTag: "scale_plan" },
      },
    ]

/* ─────────── Shared features — same for every plan ─────────── */

const sharedFeatures = isEN
  ? [
      "AI pipeline: up to 250 verified suppliers per run",
      "Worldwide research in 30+ business languages",
      "Supplier Database with AI scores & campaign history",
      "One-click Excel export of the full supplier list",
      "Deduplication against your existing vendor base",
      "ERP connectors (NetSuite, Dynamics 365 BC, QuickBooks, Xero)",
      "Shared inbox, approvals, team comments",
      "3 free sourcing runs on signup — no credit card",
    ]
  : [
      "AI pipeline: do 250 zweryfikowanych dostawców na kampanię",
      "Research na całym świecie — 30+ języków biznesowych",
      "Baza Dostawców z ocenami AI i historią kampanii",
      "Eksport pełnej listy dostawców do Excela jednym kliknięciem",
      "Deduplikacja wobec istniejącej bazy dostawców",
      "Konektory ERP (NetSuite, Dynamics 365 BC, QuickBooks, Xero)",
      "Wspólny inbox, approvals, komentarze zespołu",
      "3 darmowe kampanie sourcingowe po rejestracji — bez karty",
    ]

/* ─────────── AI Procurement add-on ─────────── */

const procurementFeatures = isEN
  ? [
      "Contact enrichment — decision-makers, emails, phones",
      "Email outreach localized per supplier country (30+ languages)",
      "Auto follow-up sequences on your schedule",
      "Supplier Portal (magic link — no login for suppliers)",
      "Structured offer collection (MOQ, lead time, quantity breaks)",
      "Side-by-side offer comparison with weighted ranking",
      "AI Insights PDF/PPTX reports — ready for your CFO",
    ]
  : [
      "Enrichment kontaktów — decydenci, emaile, telefony",
      "Email outreach zlokalizowany per kraj dostawcy (30+ języków)",
      "Automatyczne sekwencje follow-up na Twoim harmonogramie",
      "Supplier Portal (magic link — dostawcy bez logowania)",
      "Strukturalne zbieranie ofert (MOQ, lead time, quantity breaks)",
      "Porównanie ofert side-by-side z rankingiem ważonym",
      "Raporty AI Insights PDF/PPTX — gotowe dla CFO",
    ]

/* ─────────── Credit packs — AI Sourcing pay-as-you-go only ─────────── */

interface CreditPack {
  label: string
  credits: string
  price: string
  perRun: string
  save?: string
  best?: boolean
  cta: { label: string; kind: 'buy' | 'contact'; interestTag?: string }
}

const creditPacks: CreditPack[] = isEN
  ? [
      { label: "Starter pack", credits: "10 campaigns",  price: "$179", perRun: "$17.90 / campaign",                       cta: { label: "Buy pack",  kind: "buy",     interestTag: "payg_10" } },
      { label: "Team pack",    credits: "25 campaigns",  price: "$349", perRun: "$13.96 / campaign", save: "Save 22%", best: true, cta: { label: "Buy pack",  kind: "buy",     interestTag: "payg_25" } },
      { label: "Scale pack",   credits: "50 campaigns",  price: "$599", perRun: "$11.98 / campaign", save: "Save 33%",      cta: { label: "Buy pack",  kind: "buy",     interestTag: "payg_50" } },
      { label: "Enterprise",   credits: "Unlimited",     price: "Custom", perRun: "Tailored to your volume",                cta: { label: "Talk to sales", kind: "contact", interestTag: "enterprise_custom" } },
    ]
  : [
      { label: "Pakiet startowy",  credits: "10 kampanii",  price: "790 zł",        perRun: "79 zł / kampania",                            cta: { label: "Kup pakiet",         kind: "buy",     interestTag: "payg_10" } },
      { label: "Pakiet zespołu",   credits: "25 kampanii",  price: "1 499 zł",      perRun: "59,96 zł / kampania", save: "−22%", best: true, cta: { label: "Kup pakiet",         kind: "buy",     interestTag: "payg_25" } },
      { label: "Pakiet skalujący", credits: "50 kampanii",  price: "2 499 zł",      perRun: "49,98 zł / kampania", save: "−33%",             cta: { label: "Kup pakiet",         kind: "buy",     interestTag: "payg_50" } },
      { label: "Enterprise",       credits: "Bez limitu",   price: "Indywidualnie", perRun: "Dopasowane do wolumenu",                       cta: { label: "Porozmawiaj z nami", kind: "contact", interestTag: "enterprise_custom" } },
    ]

/* ─────────── FAQ ─────────── */

const faq = isEN
  ? [
      { q: 'What counts as a "sourcing run"?',                     a: 'One spec / category + region combination, returning a ranked list of up to 250 verified suppliers. You can export, shortlist and (if you add AI Procurement) send RFQs from the same run without consuming extra sourcing credits.' },
      { q: 'What is AI Procurement and when do I need it?',         a: 'AI Procurement extends any sourcing run with the full RFQ workflow — contact enrichment, localized email outreach, Supplier Portal, offer collection, side-by-side comparison, AI Insights reports. $29 per workflow, charged only on runs where you activate it.' },
      { q: 'Do I have to buy AI Procurement for every run?',         a: 'No. AI Procurement is opt-in per run. Run sourcing alone when you only need a supplier list; add the $29 workflow on the runs where you actually want RFQ outreach and offer collection.' },
      { q: 'What if I run out of sourcing runs mid-month?',          a: 'Top up with any Sourcing credit pack — they stack. Or upgrade your plan and we\'ll prorate the difference.' },
      { q: 'Do you offer a free trial?',                             a: 'Yes. 3 free sourcing runs on signup. No credit card.' },
      { q: 'Annual billing discount?',                               a: 'Yes — 15% off on all plans billed annually.' },
      { q: 'Is there a setup fee?',                                  a: 'No. On Growth and Scale, onboarding is included.' },
    ]
  : [
      { q: 'Co liczy się jako „sourcing run"?',                      a: 'Jedna specyfikacja / kategoria + region, zwraca ranking do 250 zweryfikowanych dostawców. Z tego samego runu możesz eksportować, shortlistować i (po dodaniu AI Procurement) wysyłać RFQ bez zużywania dodatkowych kredytów sourcingowych.' },
      { q: 'Co to jest AI Procurement i kiedy go potrzebuję?',       a: 'AI Procurement rozszerza dowolny run sourcingowy o pełny workflow RFQ — enrichment kontaktów, zlokalizowany outreach email, Supplier Portal, zbieranie ofert, porównanie side-by-side, raporty AI Insights. 129 zł za workflow, płacone tylko przy runach, w których go aktywujesz.' },
      { q: 'Czy muszę kupić AI Procurement dla każdego runu?',       a: 'Nie. AI Procurement jest opt-in per run. Uruchom sam sourcing, kiedy potrzebujesz tylko listy dostawców; dodaj workflow 129 zł na tych runach, na których naprawdę chcesz outreach RFQ i zbieranie ofert.' },
      { q: 'Co jeśli skończą mi się runy w środku miesiąca?',        a: 'Doładuj dowolnym pakietem kredytów Sourcingowych — stakują się. Albo przejdź na wyższy plan, a przeliczymy różnicę proporcjonalnie.' },
      { q: 'Czy oferujecie darmowy trial?',                           a: 'Tak. 3 darmowe runy sourcingowe po rejestracji. Bez karty.' },
      { q: 'Rabat za rozliczenie roczne?',                            a: 'Tak — 15% zniżki na wszystkie plany przy rozliczeniu rocznym.' },
      { q: 'Czy jest opłata wdrożeniowa?',                            a: 'Nie. Na Growth i Scale onboarding jest wliczony.' },
    ]

/* ─────────── Plan card ─────────── */

function PlanCard({ plan }: { plan: Plan }) {
  const ctaClass =
    plan.cta.kind === "featured" ? "btn-ds btn-ds-secondary" : "btn-ds btn-ds-ghost"

  const ctaElement = (
    <a
      href={appendUtm(APP_URL, `pricing_${plan.name.toLowerCase()}`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCtaClick(`pricing_${plan.name.toLowerCase()}`)}
      className={`${ctaClass} w-full justify-center mt-auto`}
    >
      {plan.cta.label}
    </a>
  )

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative flex flex-col gap-4 rounded-[14px] bg-[hsl(var(--ds-surface))] p-7 transition-shadow duration-200 ${
        plan.featured
          ? "border-[1.5px] border-[hsl(var(--ds-accent))] shadow-[0_4px_12px_rgba(14,22,20,0.06),0_12px_32px_rgba(14,22,20,0.05)] hover:shadow-[0_8px_20px_rgba(14,22,20,0.08),0_16px_40px_rgba(14,22,20,0.08)]"
          : "border border-[hsl(var(--ds-rule))] hover:border-[hsl(var(--ds-ink-3))] hover:shadow-[0_4px_16px_-4px_rgba(14,22,20,0.08)]"
      }`}
    >
      {plan.featured && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute -top-[11px] left-1/2 -translate-x-1/2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[hsl(var(--ds-accent))] text-white px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_2px_8px_rgba(22,42,82,0.25)]"
        >
          {isEN ? "Most popular" : "Najpopularniejsze"}
        </motion.span>
      )}

      <div>
        <h3 className="text-[16px] font-semibold text-[hsl(var(--ds-ink))] mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[40px] font-semibold tracking-[-0.02em] leading-none text-[hsl(var(--ds-ink))]">
            {plan.price}
          </span>
          <span className="text-[13px] text-[hsl(var(--ds-muted))]">{plan.unit}</span>
        </div>
      </div>

      <p className="text-[13px] leading-[1.5] text-[hsl(var(--ds-muted))]">
        {plan.tagline}
      </p>

      <div className="flex flex-col gap-1 rounded-[10px] bg-[hsl(var(--ds-accent-soft))] px-4 py-3">
        <span className="font-mono text-[15px] font-semibold text-[hsl(var(--ds-ink))]">
          {plan.runs}
        </span>
        <span className="text-[12px] text-[hsl(var(--ds-muted))]">
          {plan.perRun}
        </span>
      </div>

      <p className="text-[12.5px] leading-[1.5] text-[hsl(var(--ds-ink-3))] flex-1">
        {isEN
          ? <>All features included. Add <strong>AI Procurement workflow</strong> ($29 / run) only when you want RFQ outreach.</>
          : <>Wszystkie funkcje w cenie. Dodaj <strong>AI Procurement workflow</strong> (129 zł / run) tylko gdy chcesz outreach RFQ.</>}
      </p>

      {ctaElement}
    </motion.div>
  )
}

/* ─────────── Page ─────────── */

export function PricingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--ds-bg))]">
      <RouteMeta />
      <Navbar />

      <main id="main-content" className="pb-20">
        {/* Hero — compact so plans show above the fold */}
        <section className="hero-wash border-b border-[hsl(var(--ds-rule))]">
          <div className="mx-auto max-w-[820px] px-[clamp(20px,4vw,72px)] pt-[clamp(72px,6vw,96px)] pb-[clamp(20px,2.5vw,32px)] text-center">
            <span className="eyebrow mb-4 inline-flex">
              <span className="eyebrow-dot" />
              {isEN ? "Pricing" : "Cennik"}
            </span>
            <h1 className="font-display text-[clamp(30px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] mb-4 text-balance text-[hsl(var(--ds-ink))]">
              {isEN ? "Pay for sourcing runs. Add procurement on demand." : "Płać za kampanie sourcingowe. Procurement dodawaj kiedy potrzebujesz."}
            </h1>
            <RevealOnScroll>
              <p className="text-[15.5px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[56ch] mx-auto">
                {isEN
                  ? 'All features in every plan — plans differ only in how many sourcing runs you get per month. Add AI Procurement workflow ($29 / run) when you want full RFQ outreach.'
                  : 'Wszystkie funkcje w każdym planie — plany różnią się tylko liczbą kampanii sourcingowych na miesiąc. Dodaj AI Procurement workflow (129 zł / run) gdy chcesz pełny outreach RFQ.'}
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Plans grid */}
        <section id="plans" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pt-[clamp(36px,4vw,56px)] pb-[clamp(28px,3vw,44px)]">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="h-full"
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Shared features — one block for all plans */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
          <RevealOnScroll>
            <div className="rounded-[14px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] p-[clamp(24px,3.5vw,40px)]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                <div>
                  <span className="eyebrow mb-2 inline-flex">
                    <span className="eyebrow-dot" />
                    {isEN ? 'In every plan' : 'W każdym planie'}
                  </span>
                  <h2 className="text-[clamp(20px,2.4vw,28px)] font-bold leading-[1.2] text-[hsl(var(--ds-ink))] max-w-[28ch]">
                    {isEN ? 'Same features for everyone. You choose volume.' : 'Te same funkcje dla każdego. Wybierasz wolumen.'}
                  </h2>
                </div>
                <p className="text-[14px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[42ch]">
                  {isEN
                    ? 'No feature gating, no "enterprise-only" tier locks. Every plan gets the full Sourcing product. You pay for how many runs you need per month.'
                    : 'Bez feature gating, bez zamkniętych „enterprise-only" poziomów. Każdy plan ma pełny produkt Sourcing. Płacisz za liczbę runów miesięcznie.'}
                </p>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 list-none p-0 m-0">
                {sharedFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="text-[13.5px] leading-[1.5] text-[hsl(var(--ds-ink-2))] flex items-start gap-2.5"
                  >
                    <span
                      aria-hidden
                      className="mt-[3px] h-[14px] w-[14px] rounded-full bg-[hsl(var(--ds-accent-soft))] shrink-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, hsl(var(--ds-accent)) 0 28%, transparent 30%)",
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        </section>

        {/* AI Procurement add-on */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
          <RevealOnScroll>
            <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(24px,3vw,40px)]">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {isEN ? 'Add-on · pay per run' : 'Dodatek · płacisz za run'}
              </span>
              <h2 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] max-w-[30ch] text-[hsl(var(--ds-ink))]">
                {isEN ? 'Extend any run with AI Procurement workflow.' : 'Rozszerz dowolny run o AI Procurement workflow.'}
              </h2>
              <p className="text-[16px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
                {isEN
                  ? 'Got a supplier list? Turn it into offers. $29 per workflow — activated only on the runs where you want full RFQ outreach and offer collection.'
                  : 'Masz listę dostawców? Zamień ją w oferty. 129 zł za workflow — aktywowany tylko na tych runach, na których chcesz pełny outreach RFQ i zbieranie ofert.'}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-[1fr_1.2fr] gap-0 rounded-[14px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] overflow-hidden">
            <div className="p-[clamp(24px,3.5vw,40px)] md:border-r border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-accent-soft))]/50 flex flex-col gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--ds-muted))]">
                {isEN ? 'AI Procurement workflow' : 'AI Procurement workflow'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[48px] font-semibold tracking-[-0.02em] leading-none text-[hsl(var(--ds-ink))]">
                  {isEN ? '$29' : '129 zł'}
                </span>
                <span className="text-[14px] text-[hsl(var(--ds-muted))]">
                  {isEN ? '/ run' : '/ run'}
                </span>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[hsl(var(--ds-ink-3))]">
                {isEN
                  ? 'Opt-in per sourcing run. Requires an active Sourcing plan — not sold separately.'
                  : 'Opt-in per run sourcingowy. Wymaga aktywnego planu Sourcing — nie sprzedawany osobno.'}
              </p>
              <Link
                to={`${pathFor('contact')}?interest=ai_procurement#calendar`}
                onClick={() => trackCtaClick('pricing_procurement_demo')}
                className="btn-ds btn-ds-ghost w-full justify-center mt-auto"
              >
                {isEN ? 'See how it works' : 'Zobacz jak działa'}
              </Link>
            </div>
            <div className="p-[clamp(24px,3.5vw,40px)]">
              <h3 className="text-[15px] font-semibold text-[hsl(var(--ds-ink))] mb-4">
                {isEN ? 'Each workflow includes:' : 'Każdy workflow zawiera:'}
              </h3>
              <ul className="grid gap-2.5 list-none p-0 m-0">
                {procurementFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="text-[13.5px] leading-[1.5] text-[hsl(var(--ds-ink-2))] flex items-start gap-2.5"
                  >
                    <span
                      aria-hidden
                      className="mt-[3px] h-[14px] w-[14px] rounded-full bg-[hsl(var(--ds-accent-soft))] shrink-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, hsl(var(--ds-accent)) 0 28%, transparent 30%)",
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Credit packs — AI Sourcing pay-as-you-go */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
          <RevealOnScroll>
            <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(24px,3vw,40px)]">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {isEN ? 'Pay-as-you-go · AI Sourcing only' : 'Pay-as-you-go · tylko AI Sourcing'}
              </span>
              <h2 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] max-w-[30ch] text-[hsl(var(--ds-ink))]">
                {isEN ? 'Or: buy sourcing runs in packs.' : 'Albo: kupuj runy sourcingowe w pakietach.'}
              </h2>
              <p className="text-[16px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
                {isEN
                  ? 'No subscription — buy a pack, runs never expire. One credit = one sourcing run (up to 250 suppliers). Procurement workflow stays $29 / run.'
                  : 'Bez subskrypcji — kup pakiet, runy nigdy nie wygasają. Jeden kredyt = jeden run sourcingowy (do 250 dostawców). Procurement workflow pozostaje 129 zł / run.'}
              </p>
            </div>
          </RevealOnScroll>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {creditPacks.map((c) => {
              const ctaElement = c.cta.kind === 'contact' ? (
                <Link
                  to={`${pathFor('contact')}?interest=${c.cta.interestTag ?? 'enterprise_custom'}#calendar`}
                  onClick={() => trackCtaClick(`pricing_pack_${c.cta.interestTag ?? 'contact'}`)}
                  className="btn-ds btn-ds-ghost w-full justify-center mt-4"
                >
                  {c.cta.label}
                </Link>
              ) : (
                <a
                  href={appendUtm(APP_URL, `pricing_pack_${c.cta.interestTag ?? 'payg'}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick(`pricing_pack_${c.cta.interestTag ?? 'payg'}`)}
                  className={`btn-ds w-full justify-center mt-4 ${c.best ? 'btn-ds-secondary' : 'btn-ds-ghost'}`}
                >
                  {c.cta.label}
                </a>
              )

              return (
                <motion.div
                  key={c.label}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                  className={`relative flex flex-col rounded-[12px] bg-[hsl(var(--ds-surface))] p-[18px] ${
                    c.best
                      ? 'border border-[hsl(var(--ds-accent))]'
                      : 'border border-[hsl(var(--ds-rule))]'
                  }`}
                >
                  {c.save && (
                    <span className="absolute top-2.5 right-2.5 font-mono text-[10px] font-medium px-2 py-[3px] rounded-full bg-[#e6f2ec] text-[hsl(var(--ds-good))]">
                      {c.save}
                    </span>
                  )}
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--ds-muted))]">
                    {c.label}
                  </div>
                  <div className="font-mono text-[22px] font-semibold my-2 text-[hsl(var(--ds-ink))]">
                    {c.credits}
                  </div>
                  <div className="text-[13px] text-[hsl(var(--ds-muted))] flex-1">
                    {c.price} · {c.perRun}
                  </div>
                  {ctaElement}
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pb-[clamp(48px,6vw,80px)]">
          <RevealOnScroll>
            <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(28px,4vw,48px)]">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {isEN ? 'Pricing FAQ' : 'FAQ o cennik'}
              </span>
              <h2 className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.15] text-[hsl(var(--ds-ink))]">
                {isEN ? 'Common questions' : 'Częste pytania'}
              </h2>
            </div>
          </RevealOnScroll>

          <div className="max-w-[760px] mx-auto grid gap-2">
            {faq.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group rounded-[10px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] p-[14px_18px] open:border-[hsl(var(--ds-ink-3))] transition-colors"
              >
                <summary className="cursor-pointer list-none flex justify-between gap-4 text-[15px] font-semibold text-[hsl(var(--ds-ink))] [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="font-mono text-[20px] text-[hsl(var(--ds-muted))] transition-transform group-open:rotate-45 leading-none"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[hsl(var(--ds-ink-2))]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
          <div className="cta-block-ds grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-[clamp(24px,2.8vw,34px)] font-bold leading-[1.15] text-white max-w-[18ch]">
                {isEN ? 'Not sure which plan fits?' : 'Nie wiesz, który plan pasuje?'}
              </h2>
              <p className="mt-3 text-white/70">
                {isEN
                  ? "Tell us your category volume — we'll pick a plan and show you a projected ROI in 15 minutes."
                  : 'Powiedz nam o wolumenie Twoich kategorii — wybierzemy plan i pokażemy projekcję ROI w 15 minut.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={`${pathFor('contact')}#calendar`} className="btn-ds btn-ds-primary">
                {isEN ? 'Book a demo' : 'Umów demo'}
                <span className="arrow" aria-hidden>→</span>
              </Link>
              <a
                href={appendUtm(APP_URL, 'pricing_final_signup')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ds btn-ds-dark"
              >
                {isEN ? 'Start free' : 'Zacznij za darmo'}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
