import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { pathFor } from "@/i18n/paths"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const isEN = t.meta.lang === "en"

const widget = isEN
  ? {
      tab: "app.procurea.io / new-rfq",
      categoryLabel: "Category",
      categoryValue: "Industrial gaskets · NBR · Shore A 70",
      auto: "auto",
      regionLabel: "Region",
      regions: ["US", "Canada", "UK", "+ 1 more"],
      quantityLabel: "Quantity",
      quantityValue: "5,000 units",
      moq: "MOQ ≤ 2,500",
      complianceLabel: "Compliance",
      compliances: ["ISO 9001", "REACH", "RoHS"],
      save: "Save draft",
      run: "Run sourcing",
      resultsHead: { supplier: "Supplier", price: "Price", lead: "Lead", moq: "MOQ", match: "Match" },
    }
  : {
      tab: "app.procurea.pl / nowe-rfq",
      categoryLabel: "Kategoria",
      categoryValue: "Uszczelki przemysłowe · NBR · Shore A 70",
      auto: "auto",
      regionLabel: "Region",
      regions: ["Polska", "Niemcy", "Czechy", "+ 1 więcej"],
      quantityLabel: "Ilość",
      quantityValue: "5 000 szt.",
      moq: "MOQ ≤ 2 500",
      complianceLabel: "Zgodność",
      compliances: ["ISO 9001", "REACH", "RoHS"],
      save: "Zapisz wersję",
      run: "Uruchom sourcing",
      resultsHead: { supplier: "Dostawca", price: "Cena", lead: "Lead", moq: "MOQ", match: "Match" },
    }

type Supplier = { code: string; name: string; meta: string; price: string; lead: string; moq: string; match: number }

const supplierRows: Supplier[] = [
  { code: "GM", name: "Great Lakes Mfg.",  meta: "MI, US · ISO 9001 · IATF", price: "$2.08", lead: "9d",  moq: "2,500", match: 97 },
  { code: "MR", name: "Maple Ridge Rubber", meta: "ON, CA · ISO 9001",        price: "$2.14", lead: "11d", moq: "1,000", match: 94 },
  { code: "SC", name: "Sunbelt Components", meta: "TX, US · ISO 9001",        price: "$1.96", lead: "7d",  moq: "5,000", match: 91 },
]

export function HeroSection() {
  return (
    <section className="hero-wash border-b border-[hsl(var(--ds-rule))]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)] pt-[clamp(96px,10vw,144px)] pb-[clamp(40px,5vw,72px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-[clamp(32px,5vw,72px)] items-center">
          {/* ── Copy ── */}
          <div className="max-w-[46ch]">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="eyebrow mb-5 inline-flex"
            >
              <span className="eyebrow-dot" />
              {t.hero.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[clamp(36px,5.2vw,64px)] font-bold leading-[1.04] tracking-[-0.03em] mb-[18px] text-balance text-[hsl(var(--ds-ink))]"
            >
              {t.hero.headlinePart1}{" "}
              <span className="text-[hsl(var(--ds-accent))]">{t.hero.headlineHighlight}</span>
              {t.hero.headlinePart2}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] mb-7 max-w-[46ch]"
            >
              {t.hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <a
                href={appendUtm(APP_URL, "hero_signup")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick("hero_signup")}
                className="btn-ds btn-ds-primary"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 arrow" />
              </a>
              <a
                href={`#${t.sectionIds.demo}`}
                onClick={() => trackCtaClick("hero_demo")}
                className="btn-ds btn-ds-ghost"
              >
                {t.hero.ctaSecondary}
              </a>
              <Link
                to={pathFor("pricing")}
                onClick={() => trackCtaClick("hero_pricing_link")}
                className="text-sm text-[hsl(var(--ds-muted))] hover:text-[hsl(var(--ds-accent))] transition-colors ml-1"
              >
                {t.hero.ctaPricingLink} →
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[hsl(var(--ds-muted))]"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-[hsl(var(--ds-accent))]" aria-hidden>●</span>
                {t.hero.trustFreeAccess}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[hsl(var(--ds-accent))]" aria-hidden>●</span>
                {t.hero.trustNoCreditCard}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[hsl(var(--ds-accent))]" aria-hidden>●</span>
                {t.hero.trustBeta}
              </span>
            </motion.div>
          </div>

          {/* ── Product shot: sourcer widget ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] },
              y: { duration: 6, times: [0, 0.5, 1], ease: "easeInOut", repeat: Infinity, delay: 1.2 },
            }}
            className="product-shot"
          >
            <div className="ps-chrome">
              <div className="ps-dots"><span /><span /><span /></div>
              <div className="ps-tab">{widget.tab}</div>
            </div>
            <div className="p-[18px]">
              <div className="grid gap-3.5">
                <div className="sourcer-row">
                  <div className="sourcer-label">{widget.categoryLabel}</div>
                  <div className="sourcer-input">
                    <span>{widget.categoryValue}</span>
                    <span className="chip-ds ml-auto">{widget.auto}</span>
                  </div>
                </div>

                <div className="sourcer-row">
                  <div className="sourcer-label">{widget.regionLabel}</div>
                  <div className="sourcer-input">
                    <div className="flex flex-wrap gap-1.5">
                      {widget.regions.map((r) => (
                        <span key={r} className="tag-ds">
                          {r}
                          {!r.startsWith("+") && <span className="opacity-50 cursor-pointer">×</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sourcer-row">
                  <div className="sourcer-label">{widget.quantityLabel}</div>
                  <div className="sourcer-input">
                    <span>{widget.quantityValue}</span>
                    <span className="chip-ds ml-auto">{widget.moq}</span>
                  </div>
                </div>

                <div className="sourcer-row">
                  <div className="sourcer-label">{widget.complianceLabel}</div>
                  <div className="sourcer-input">
                    <div className="flex flex-wrap gap-1.5">
                      {widget.compliances.map((c) => (
                        <span key={c} className="tag-ds">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-1">
                  <button className="btn-ds btn-ds-sm btn-ds-ghost">{widget.save}</button>
                  <button className="btn-ds btn-ds-sm btn-ds-secondary">
                    {widget.run}
                    <span className="arrow" aria-hidden>→</span>
                  </button>
                </div>
              </div>

              {/* Results box */}
              <div className="mt-[18px] border border-[hsl(var(--ds-rule))] rounded-[10px] overflow-hidden bg-[hsl(var(--ds-surface))]">
                <div className="grid grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.7fr] gap-3.5 px-3.5 py-[11px] bg-[hsl(var(--ds-bg-2))] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[hsl(var(--ds-muted))] font-medium">
                  <div>{widget.resultsHead.supplier}</div>
                  <div>{widget.resultsHead.price}</div>
                  <div>{widget.resultsHead.lead}</div>
                  <div>{widget.resultsHead.moq}</div>
                  <div>{widget.resultsHead.match}</div>
                </div>
                {supplierRows.map((s, i) => (
                  <motion.div
                    key={s.code}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className={`grid grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.7fr] gap-3.5 px-3.5 py-[11px] items-center text-[12.5px] ${
                      i === 0 ? "" : "border-t border-[hsl(var(--ds-rule))]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid place-items-center h-[26px] w-[26px] rounded-md bg-[hsl(var(--ds-bg-2))] border border-[hsl(var(--ds-rule))] font-mono font-semibold text-[11px] text-[hsl(var(--ds-ink-2))] shrink-0">
                        {s.code}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] truncate">{s.name}</div>
                        <div className="text-[11px] text-[hsl(var(--ds-muted))] truncate">{s.meta}</div>
                      </div>
                    </div>
                    <div className="num-ds">{s.price}</div>
                    <div className="num-ds">{s.lead}</div>
                    <div className="num-ds">{s.moq}</div>
                    <div>
                      <div className="score-bar"><i style={{ width: `${s.match}%` }} /></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
