import {
  AiSourcingHero,
  ErpIntegrationHero,
  MultilingualHero,
  SupplierIntelHero,
  OfferComparisonHero,
  type PillarSlug,
} from "./HeroBackgrounds"

/**
 * OG Image Templates — 1200x630
 * ------------------------------
 * Each template renders a full OG-sized card (1200x630) with:
 *   - Pillar-themed hero background
 *   - Large title text (safe-zone aware)
 *   - Optional eyebrow / pillar label
 *   - Procurea wordmark bottom-left + URL bottom-right
 *
 * Render pipeline (later):
 *   1. Use `renderToStaticMarkup(<OgImage … />)` in a prerender script.
 *   2. Convert SVG → PNG via `resvg-js` or `@vercel/og`.
 *   3. Write to `public/og/<slug>.png`.
 *
 * For now these are React components — the wrapper fixes exact pixel size
 * so screenshotters (Puppeteer) can snapshot them 1:1.
 *
 * Safe zones (critical — some platforms crop edges):
 *   - 60px outer padding on all sides
 *   - Title must fit in 1080x380 central block
 *   - Logo bottom-left, URL bottom-right — both within 60px padding
 */

export interface OgImageProps {
  /** Post title — keep ≤72 chars for single-line. ≤120 chars for two lines. */
  title: string
  /** Optional eyebrow above title (pillar name, category). */
  eyebrow?: string
  /** Pillar slug — determines hero background. */
  pillar: PillarSlug
  /** Optional author name (bottom center-right). */
  author?: string
  /** Optional URL override for bottom-right. Default: procurea.pl */
  url?: string
  /** Variant: 'default' (full background) or 'split' (background left, content right). */
  variant?: "default" | "split"
}

const HERO_FOR: Record<PillarSlug, React.ComponentType<{ className?: string; tone?: "default" | "light" | "dark" }>> = {
  "ai-sourcing": AiSourcingHero,
  "erp-integration": ErpIntegrationHero,
  "multilingual": MultilingualHero,
  "supplier-intel": SupplierIntelHero,
  "offer-comparison": OfferComparisonHero,
}

const PILLAR_LABEL: Record<PillarSlug, string> = {
  "ai-sourcing": "AI Sourcing Automation",
  "erp-integration": "ERP & CRM Integration",
  "multilingual": "Multilingual Outreach",
  "supplier-intel": "Supplier Intelligence",
  "offer-comparison": "Offer Comparison",
}

/* ------------------------------------------------------------------ */
/* Reusable brand wordmark — inline SVG, no PNG import                 */
/* ------------------------------------------------------------------ */
export function ProcureaWordmark({ height = 36, color = "white" }: { height?: number; color?: string }) {
  return (
    <svg
      height={height}
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Procurea"
    >
      {/* mark */}
      <g transform="translate(0 8)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
        <path d="M 14 34 L 14 14 L 26 14 C 32 14 34 17 34 22 C 34 27 32 30 26 30 L 20 30" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* wordmark */}
      <text x="58" y="40" fontFamily="Inter Tight, Inter, sans-serif" fontSize="30" fontWeight="700" fill={color} letterSpacing="-0.02em">
        Procurea
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Main OG image                                                        */
/* ------------------------------------------------------------------ */
export function OgImage({
  title,
  eyebrow,
  pillar,
  author,
  url = "procurea.pl",
  variant = "default",
}: OgImageProps) {
  const Hero = HERO_FOR[pillar]
  const label = eyebrow ?? PILLAR_LABEL[pillar]

  if (variant === "split") {
    return (
      <div
        style={{ width: 1200, height: 630 }}
        className="relative flex overflow-hidden bg-slate-925 font-sans"
      >
        {/* left: hero */}
        <div className="relative w-[480px] h-full">
          <Hero tone="dark" />
        </div>

        {/* right: content */}
        <div className="relative flex-1 flex flex-col justify-between p-16 bg-slate-925 text-white">
          <div>
            {label && (
              <span className="inline-block text-sm font-semibold uppercase tracking-[0.18em] text-brand-300 mb-6">
                {label}
              </span>
            )}
            <h1
              className="font-display font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 56, maxWidth: 620 }}
            >
              {title}
            </h1>
          </div>
          <div className="flex items-end justify-between">
            <ProcureaWordmark height={40} />
            <div className="text-right text-sm text-white/60">
              {author && <div className="mb-1 font-medium text-white/80">{author}</div>}
              <div>{url}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // default: full-bleed hero with gradient scrim
  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative overflow-hidden font-sans"
    >
      <Hero tone="dark" />

      {/* content area */}
      <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
        <div>
          {label && (
            <span className="inline-block text-sm font-semibold uppercase tracking-[0.18em] bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/25 mb-10">
              {label}
            </span>
          )}
          <h1
            className="font-display font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            style={{ fontSize: 72, maxWidth: 1000 }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-end justify-between">
          <ProcureaWordmark height={44} />
          <div className="text-right text-base text-white/80">
            {author && <div className="mb-1 font-semibold">{author}</div>}
            <div>{url}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lead-magnet OG variant (amber emphasis, CTA-forward)                */
/* ------------------------------------------------------------------ */
export function LeadMagnetOg({ title, subtitle, url = "procurea.pl" }: { title: string; subtitle?: string; url?: string }) {
  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative overflow-hidden font-sans"
    >
      <SupplierIntelHero tone="dark" />
      <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
        <div>
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.18em] bg-amber-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200/50 mb-10">
            Free Download
          </span>
          <h1
            className="font-display font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            style={{ fontSize: 68, maxWidth: 980 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-xl text-white/85 max-w-[900px] leading-snug">{subtitle}</p>
          )}
        </div>
        <div className="flex items-end justify-between">
          <ProcureaWordmark height={44} />
          <div className="text-right text-base text-white/80">{url}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Case Study OG variant — emerald overlay                             */
/* ------------------------------------------------------------------ */
export function CaseStudyOg({
  title,
  industry,
  keyStat,
  url = "procurea.pl",
}: {
  title: string
  industry: string
  keyStat: string
  url?: string
}) {
  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative overflow-hidden font-sans"
    >
      {/* emerald gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #064E3B 0%, #047857 50%, #022C22 100%)" }}
      />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(52,211,153,0.3) 0px, transparent 40%), radial-gradient(circle at 80% 90%, rgba(16,185,129,0.25) 0px, transparent 35%)",
      }} />

      <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
        <div>
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.18em] bg-emerald-400/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/40 mb-8">
            Case Study · {industry}
          </span>
          <h1
            className="font-display font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontSize: 62, maxWidth: 960 }}
          >
            {title}
          </h1>
          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-display font-bold text-emerald-300" style={{ fontSize: 96, lineHeight: 1 }}>
              {keyStat}
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <ProcureaWordmark height={44} />
          <div className="text-right text-base text-white/75">{url}</div>
        </div>
      </div>
    </div>
  )
}
