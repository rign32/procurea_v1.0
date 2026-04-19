import { cn } from "@/lib/utils"

/**
 * Content Hub Hero Backgrounds
 * -----------------------------
 * Reusable gradient + SVG pattern cards for blog post & pillar heroes.
 * Each background renders 16:9 by default (via `aspect-video` class passed
 * from parent — keep these components aspect-agnostic so they can be reused
 * in OG images, cards, and full-width heroes).
 *
 * Usage:
 *   <div className="relative aspect-video rounded-2xl overflow-hidden">
 *     <AiSourcingHero />
 *     <div className="relative z-10 p-8"> ... title ... </div>
 *   </div>
 *
 * All components:
 *   - Render absolutely positioned (inset-0) so parent controls size.
 *   - Include `role="img"` + `aria-label` on the SVG layer.
 *   - Gzip-friendly: geometry uses <use> + <pattern> whenever possible.
 */

interface HeroProps {
  className?: string
  /** Optional tone override — lighten/darken the overlay. */
  tone?: "default" | "light" | "dark"
  /** ARIA label for the decorative pattern (screen readers). */
  ariaLabel?: string
}

function OverlayGradient({ tone = "default" }: { tone?: HeroProps["tone"] }) {
  const map = {
    default: "from-black/30 via-transparent to-black/10",
    light: "from-black/10 via-transparent to-transparent",
    dark: "from-black/50 via-black/10 to-black/30",
  } as const
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", map[tone ?? "default"])}
    />
  )
}

/* ------------------------------------------------------------------ */
/* 1. AI Sourcing Automation — teal + network nodes                   */
/* ------------------------------------------------------------------ */
export function AiSourcingHero({ className, tone, ariaLabel = "Network nodes pattern" }: HeroProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <pattern id="net-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1200" height="675" fill="url(#net-grid)" />

        {/* connecting lines */}
        <g stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none">
          <path d="M 120 520 Q 300 300 540 420 T 980 200" />
          <path d="M 80 140 Q 300 260 520 180 T 1100 340" />
          <path d="M 200 620 Q 480 480 720 560 T 1120 520" />
          <path d="M 340 60 Q 520 200 680 120 T 1080 80" />
        </g>

        {/* nodes */}
        <g>
          {[
            [120, 520], [540, 420], [980, 200], [80, 140], [520, 180],
            [1100, 340], [200, 620], [720, 560], [1120, 520], [340, 60],
            [680, 120], [1080, 80], [300, 320], [860, 440],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="22" fill="url(#node-glow)" />
              <circle cx={cx} cy={cy} r="5" fill="white" />
            </g>
          ))}
        </g>
      </svg>
      <OverlayGradient tone={tone} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2. ERP/CRM Integration — indigo/purple + connected systems         */
/* ------------------------------------------------------------------ */
export function ErpIntegrationHero({ className, tone, ariaLabel = "Connected systems diagram" }: HeroProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: "linear-gradient(135deg, #4C3A7A 0%, #5E4B8F 40%, #2E2259 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <pattern id="erp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.14)" />
          </pattern>
        </defs>

        <rect width="1200" height="675" fill="url(#erp-dots)" />

        {/* system boxes connected by lines */}
        <g fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" strokeDasharray="4 6">
          <line x1="250" y1="200" x2="600" y2="340" />
          <line x1="950" y1="180" x2="600" y2="340" />
          <line x1="260" y1="520" x2="600" y2="340" />
          <line x1="940" y1="520" x2="600" y2="340" />
        </g>

        {/* corner boxes */}
        {[
          [180, 140, "ERP"],
          [900, 140, "CRM"],
          [180, 480, "API"],
          [900, 480, "DB"],
        ].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="140" height="80" rx="12"
              fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <text x={(x as number) + 70} y={(y as number) + 48} textAnchor="middle"
              fill="rgba(255,255,255,0.85)" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="20">
              {label}
            </text>
          </g>
        ))}

        {/* center hub */}
        <g>
          <circle cx="600" cy="340" r="60" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="600" cy="340" r="32" fill="rgba(255,255,255,0.25)" />
          <circle cx="600" cy="340" r="10" fill="white" />
        </g>
      </svg>
      <OverlayGradient tone={tone} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Multilingual Outreach — sage + globe/meridians                  */
/* ------------------------------------------------------------------ */
export function MultilingualHero({ className, tone, ariaLabel = "Globe with meridians" }: HeroProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: "linear-gradient(135deg, #CDD1B0 0%, #A9B28A 50%, #6F7A52 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <radialGradient id="globe-fill" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* globe */}
        <g transform="translate(600 337)">
          <circle r="240" fill="url(#globe-fill)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          {/* meridians */}
          <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2">
            <ellipse rx="240" ry="90" />
            <ellipse rx="240" ry="160" />
            <ellipse rx="240" ry="220" />
            <ellipse rx="90" ry="240" />
            <ellipse rx="160" ry="240" />
            <ellipse rx="220" ry="240" />
          </g>
          {/* pins */}
          {[
            [-140, -60], [100, -120], [-60, 140], [170, 80], [40, -40],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="white" />
              <circle cx={x} cy={y} r="16" fill="rgba(255,255,255,0.3)" />
            </g>
          ))}
        </g>

        {/* language tags floating */}
        <g fontFamily="Inter, sans-serif" fontSize="18" fill="rgba(255,255,255,0.7)" fontWeight="500">
          <text x="80" y="120">PL</text>
          <text x="1080" y="150">EN</text>
          <text x="100" y="600">DE</text>
          <text x="1060" y="580">FR</text>
          <text x="140" y="360">ES</text>
          <text x="1040" y="380">IT</text>
        </g>
      </svg>
      <OverlayGradient tone={tone} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Supplier Intelligence & Compliance — amber + shield              */
/* ------------------------------------------------------------------ */
export function SupplierIntelHero({ className, tone, ariaLabel = "Shield with verification marks" }: HeroProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: "linear-gradient(135deg, #F5C451 0%, #D69722 50%, #8F5E0E 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <pattern id="amber-hatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1200" height="675" fill="url(#amber-hatch)" />

        {/* shield */}
        <g transform="translate(600 337)">
          <path
            d="M 0 -220 L 180 -160 L 180 40 C 180 140 100 200 0 240 C -100 200 -180 140 -180 40 L -180 -160 Z"
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2.5"
          />
          {/* checkmark */}
          <path
            d="M -70 10 L -20 60 L 80 -60"
            fill="none"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* floating verification badges */}
        <g fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="rgba(255,255,255,0.85)">
          {[
            [140, 140, "ISO 9001"],
            [1060, 180, "IATF"],
            [120, 540, "GDPR"],
            [1040, 520, "FDA"],
          ].map(([x, y, label], i) => (
            <g key={i}>
              <rect x={(x as number) - 50} y={(y as number) - 22} width="100" height="32" rx="16"
                fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.45)" />
              <text x={x as number} y={(y as number) - 1} textAnchor="middle">{label}</text>
            </g>
          ))}
        </g>
      </svg>
      <OverlayGradient tone={tone} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Offer Comparison & Negotiation — pink + scales                   */
/* ------------------------------------------------------------------ */
export function OfferComparisonHero({ className, tone, ariaLabel = "Comparison scales and rows" }: HeroProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: "linear-gradient(135deg, #E7A3BE 0%, #C76F96 50%, #7B3A5C 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <pattern id="pink-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1200" height="675" fill="url(#pink-grid)" />

        {/* scale/balance */}
        <g transform="translate(600 300)" stroke="rgba(255,255,255,0.75)" strokeWidth="3" fill="none" strokeLinecap="round">
          {/* pillar */}
          <line x1="0" y1="-150" x2="0" y2="150" />
          {/* base */}
          <line x1="-70" y1="150" x2="70" y2="150" />
          {/* beam */}
          <line x1="-200" y1="-120" x2="200" y2="-120" />
          <line x1="0" y1="-120" x2="0" y2="-150" />
          {/* ropes */}
          <line x1="-200" y1="-120" x2="-200" y2="-60" />
          <line x1="200" y1="-120" x2="200" y2="-60" />
          {/* pans */}
          <path d="M -260 -60 Q -200 0 -140 -60" />
          <path d="M 140 -60 Q 200 0 260 -60" />
        </g>

        {/* comparison row strips */}
        <g>
          {[420, 480, 540, 600].map((y, i) => (
            <g key={i}>
              <rect x="160" y={y} width="280" height="36" rx="8" fill="rgba(255,255,255,0.14)" />
              <rect x="460" y={y} width="280" height="36" rx="8" fill="rgba(255,255,255,0.14)" />
              <rect x="760" y={y} width="280" height="36" rx="8" fill="rgba(255,255,255,0.14)" />
            </g>
          ))}
        </g>
      </svg>
      <OverlayGradient tone={tone} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero registry — map pillar slug to component                        */
/* ------------------------------------------------------------------ */
export const HERO_BY_PILLAR = {
  "ai-sourcing": AiSourcingHero,
  "erp-integration": ErpIntegrationHero,
  "multilingual": MultilingualHero,
  "supplier-intel": SupplierIntelHero,
  "offer-comparison": OfferComparisonHero,
} as const

export type PillarSlug = keyof typeof HERO_BY_PILLAR
