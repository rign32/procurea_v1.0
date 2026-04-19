import { cn } from "@/lib/utils"

/**
 * Lead Magnet Covers
 * -------------------
 * 3:4 portrait covers for lead magnets in ResourcePage.tsx preview slot.
 * All amber-themed (lead magnet pillar color) with distinct content motifs.
 *
 * Usage:
 *   <div className="aspect-[3/4] rounded-xl overflow-hidden">
 *     <RfqComparisonTemplateCover className="w-full h-full" />
 *   </div>
 *
 *   // Or via registry:
 *   const Cover = LEAD_MAGNET_COVERS[resource.slug]
 *   {Cover && <Cover />}
 *
 * Accessibility: every SVG has role="img" + aria-label.
 * Weight: each component ≤2KB gzipped (no external images).
 */

interface CoverProps {
  className?: string
  /** Optional override of the aria-label. */
  ariaLabel?: string
}

/* ------------------------------------------------------------------ */
/* Shared amber frame                                                   */
/* ------------------------------------------------------------------ */
function AmberFrame({
  children,
  className,
  ariaLabel,
  badge,
}: {
  children: React.ReactNode
  className?: string
  ariaLabel: string
  /** Small badge label rendered top-left, e.g. "XLSX" or "PDF · 6p" */
  badge?: string
}) {
  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden flex flex-col",
        className
      )}
      style={{
        background:
          "linear-gradient(155deg, #F5C451 0%, #E0A637 45%, #B37C1C 100%)",
      }}
      role="img"
      aria-label={ariaLabel}
    >
      {/* subtle hatch pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="cover-hatch"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="32"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cover-hatch)" />
      </svg>

      {/* soft radial highlight, top-left */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.35) 0px, transparent 45%)",
        }}
      />

      {/* optional badge */}
      {badge && (
        <div className="relative z-10 px-5 pt-5">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
            {badge}
          </span>
        </div>
      )}

      {/* motif area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-5">
        {children}
      </div>

      {/* bottom wordmark band */}
      <div className="relative z-10 px-5 pb-5 flex items-center justify-between text-white/90">
        <span className="text-[11px] font-semibold tracking-tight font-display">
          Procurea
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/70">
          Free
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1. RFQ Comparison Template — spreadsheet columns                    */
/* ------------------------------------------------------------------ */
export function RfqComparisonTemplateCover({
  className,
  ariaLabel = "RFQ comparison template cover",
}: CoverProps) {
  return (
    <AmberFrame className={className} ariaLabel={ariaLabel} badge="XLSX · Template">
      <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
        {/* spreadsheet card */}
        <rect
          x="18"
          y="18"
          width="164"
          height="184"
          rx="10"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
        />
        {/* header row */}
        <rect x="18" y="18" width="164" height="28" rx="10" fill="rgba(179,124,28,0.95)" />
        <rect x="18" y="36" width="164" height="10" fill="rgba(179,124,28,0.95)" />
        {/* header cell separators */}
        <line x1="66" y1="18" x2="66" y2="46" stroke="rgba(255,255,255,0.4)" />
        <line x1="106" y1="18" x2="106" y2="46" stroke="rgba(255,255,255,0.4)" />
        <line x1="146" y1="18" x2="146" y2="46" stroke="rgba(255,255,255,0.4)" />

        <text
          x="42"
          y="37"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="8"
          fontWeight="600"
          fill="white"
        >
          Criteria
        </text>
        <text x="86" y="37" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="white">V1</text>
        <text x="126" y="37" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="white">V2</text>
        <text x="164" y="37" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="white">V3</text>

        {/* body rows */}
        {[
          ["Price", "€420", "€398", "€445"],
          ["Lead time", "14d", "21d", "10d"],
          ["MOQ", "500", "300", "750"],
          ["Certs", "ISO", "ISO+", "ISO"],
          ["Payment", "30d", "45d", "15d"],
          ["Score", "7.8", "8.4", "7.1"],
        ].map(([label, a, b, c], i) => {
          const y = 56 + i * 22
          return (
            <g key={i}>
              {i % 2 === 1 && (
                <rect x="18" y={y - 8} width="164" height="22" fill="rgba(245,196,81,0.1)" />
              )}
              <text x="26" y={y + 4} fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="#2A5C5D">
                {label}
              </text>
              <text x="86" y={y + 4} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fill="#1A3A3B">{a}</text>
              <text x="126" y={y + 4} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fill="#1A3A3B">{b}</text>
              <text x="164" y={y + 4} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fill="#1A3A3B">{c}</text>
              <line x1="18" y1={y + 12} x2="182" y2={y + 12} stroke="rgba(179,124,28,0.12)" />
            </g>
          )
        })}

        {/* highlight best column */}
        <rect x="106" y="46" width="40" height="146" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.5)" strokeWidth="1" strokeDasharray="2 2" rx="4" />
        <circle cx="126" cy="184" r="6" fill="#10B981" />
        <path d="M 123 184 L 125 186 L 129 182" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </AmberFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Supplier Risk Checklist — shield + checkmarks                    */
/* ------------------------------------------------------------------ */
export function SupplierRiskChecklistCover({
  className,
  ariaLabel = "Supplier risk checklist cover",
}: CoverProps) {
  return (
    <AmberFrame className={className} ariaLabel={ariaLabel} badge="PDF · 6 pages">
      <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
        {/* shield backdrop */}
        <g transform="translate(100 95)">
          <path
            d="M 0 -72 L 58 -52 L 58 12 C 58 48 32 70 0 80 C -32 70 -58 48 -58 12 L -58 -52 Z"
            fill="rgba(255,255,255,0.18)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
          />
          {/* big check inside shield */}
          <path
            d="M -22 6 L -6 22 L 26 -16"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* checklist bars below */}
        <g transform="translate(30 170)">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${i * 14})`}>
              <circle cx="6" cy="6" r="5" fill="white" />
              <path
                d="M 3.5 6 L 5.5 8 L 8.5 4"
                stroke="#B37C1C"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="18" y="3" width={90 - i * 14} height="6" rx="3" fill="rgba(255,255,255,0.8)" />
            </g>
          ))}
        </g>

        {/* 20 points badge */}
        <g transform="translate(155 40)">
          <circle r="22" fill="white" />
          <text
            textAnchor="middle"
            y="0"
            fontFamily="Inter Tight, Inter, sans-serif"
            fontSize="18"
            fontWeight="800"
            fill="#B37C1C"
            letterSpacing="-0.03em"
          >
            20
          </text>
          <text
            textAnchor="middle"
            y="12"
            fontFamily="Inter, sans-serif"
            fontSize="7"
            fontWeight="600"
            fill="#B37C1C"
            letterSpacing="0.05em"
          >
            POINTS
          </text>
        </g>
      </svg>
    </AmberFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 3. TCO Calculator — keys + cost bars                                */
/* ------------------------------------------------------------------ */
export function TcoCalculatorCover({
  className,
  ariaLabel = "TCO calculator cover",
}: CoverProps) {
  return (
    <AmberFrame className={className} ariaLabel={ariaLabel} badge="XLSX · Calculator">
      <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
        {/* stacked cost bars */}
        <g transform="translate(26 18)">
          <text
            x="0"
            y="8"
            fontFamily="Inter, sans-serif"
            fontSize="8"
            fontWeight="600"
            fill="rgba(255,255,255,0.85)"
            letterSpacing="0.08em"
          >
            LANDED COST
          </text>

          {[
            { label: "Price", w: 60, c: "rgba(255,255,255,0.95)" },
            { label: "Freight", w: 34, c: "rgba(255,255,255,0.75)" },
            { label: "Duty", w: 22, c: "rgba(255,255,255,0.55)" },
            { label: "Quality", w: 14, c: "rgba(255,255,255,0.4)" },
            { label: "Switch", w: 8, c: "rgba(255,255,255,0.25)" },
          ].map((b, i) => (
            <g key={i} transform={`translate(0 ${20 + i * 16})`}>
              <rect x="0" y="0" width={b.w + 40} height="12" rx="3" fill={b.c} />
              <text
                x="-2"
                y="9"
                textAnchor="end"
                fontFamily="Inter, sans-serif"
                fontSize="8"
                fontWeight="600"
                fill="rgba(255,255,255,0.9)"
              >
                {b.label}
              </text>
            </g>
          ))}
        </g>

        {/* calculator body */}
        <g transform="translate(44 122)">
          <rect
            x="0"
            y="0"
            width="112"
            height="82"
            rx="10"
            fill="rgba(255,255,255,0.95)"
            stroke="white"
            strokeWidth="1"
          />
          {/* display */}
          <rect x="8" y="8" width="96" height="18" rx="4" fill="#1A3A3B" />
          <text
            x="100"
            y="21"
            textAnchor="end"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            fontWeight="700"
            fill="#7AADAF"
          >
            €1,204.58
          </text>
          {/* keys */}
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={8 + c * 24}
                y={30 + r * 12}
                width="20"
                height="8"
                rx="2"
                fill={
                  c === 3
                    ? "#B37C1C"
                    : "rgba(179,124,28,0.18)"
                }
              />
            ))
          )}
        </g>
      </svg>
    </AmberFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Vendor Scoring Framework — scorecard grid                        */
/* ------------------------------------------------------------------ */
export function VendorScoringFrameworkCover({
  className,
  ariaLabel = "Vendor scoring framework cover",
}: CoverProps) {
  return (
    <AmberFrame className={className} ariaLabel={ariaLabel} badge="PDF · 8 pages">
      <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
        {/* scorecard body */}
        <rect
          x="22"
          y="18"
          width="156"
          height="184"
          rx="10"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(255,255,255,0.9)"
        />
        {/* header */}
        <rect x="22" y="18" width="156" height="24" rx="10" fill="#B37C1C" />
        <rect x="22" y="32" width="156" height="10" fill="#B37C1C" />
        <text
          x="100"
          y="34"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="9"
          fontWeight="700"
          fill="white"
          letterSpacing="0.1em"
        >
          VENDOR SCORECARD
        </text>

        {/* 10 rows of criteria with bars */}
        {[
          ["Price", 0.9],
          ["Quality", 0.8],
          ["Lead time", 0.65],
          ["MOQ", 0.75],
          ["Payment", 0.55],
          ["Certs", 0.95],
          ["Capacity", 0.7],
          ["Financial", 0.6],
          ["ESG", 0.5],
          ["Response", 0.85],
        ].map(([label, pct], i) => {
          const y = 54 + i * 13
          const width = 80 * (pct as number)
          return (
            <g key={i}>
              <text
                x="32"
                y={y + 3}
                fontFamily="Inter, sans-serif"
                fontSize="7"
                fontWeight="600"
                fill="#1A3A3B"
              >
                {label as string}
              </text>
              {/* track */}
              <rect x="78" y={y - 3} width="80" height="7" rx="3" fill="rgba(179,124,28,0.12)" />
              {/* fill */}
              <rect x="78" y={y - 3} width={width} height="7" rx="3" fill="#B37C1C" />
              {/* score */}
              <text
                x="164"
                y={y + 3}
                textAnchor="end"
                fontFamily="Inter, sans-serif"
                fontSize="7"
                fontWeight="700"
                fill="#2A5C5D"
              >
                {((pct as number) * 10).toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* total pill */}
        <g transform="translate(100 196)">
          <rect x="-30" y="-8" width="60" height="14" rx="7" fill="#10B981" />
          <text
            textAnchor="middle"
            y="2"
            fontFamily="Inter, sans-serif"
            fontSize="8"
            fontWeight="700"
            fill="white"
          >
            TOTAL 7.25
          </text>
        </g>
      </svg>
    </AmberFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Nearshore Migration Playbook — Europe outline + arrows            */
/* ------------------------------------------------------------------ */
export function NearshoreMigrationPlaybookCover({
  className,
  ariaLabel = "Nearshore migration playbook cover",
}: CoverProps) {
  return (
    <AmberFrame className={className} ariaLabel={ariaLabel} badge="PDF · 14 pages">
      <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
        {/* stylized Europe outline — simplified blobs per region */}
        <g transform="translate(100 100)">
          {/* outer glow ring */}
          <circle r="78" fill="rgba(255,255,255,0.08)" />
          <circle r="62" fill="rgba(255,255,255,0.12)" />

          {/* simplified Europe shape — abstract polygon */}
          <path
            d="
              M -50 -30
              Q -58 -12 -44 6
              Q -50 18 -38 26
              Q -24 36 -8 32
              Q 6 38 22 30
              Q 36 34 44 20
              Q 54 8 50 -8
              Q 56 -22 40 -32
              Q 20 -42 0 -38
              Q -24 -46 -42 -40
              Q -54 -42 -50 -30 Z
            "
            fill="rgba(255,255,255,0.9)"
            stroke="rgba(255,255,255,1)"
            strokeWidth="1"
          />

          {/* pins: China (off-map, east), migrating toward PL/TR/PT/IT */}
          {/* source pin (China — right edge) */}
          <g transform="translate(70 -10)">
            <circle r="5" fill="#1A3A3B" />
            <circle r="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* destination pins */}
          {[
            [-10, -10, "PL"],
            [22, 4, "RO"],
            [-34, 8, "PT"],
            [4, 20, "IT"],
            [30, -18, "TR"],
          ].map(([x, y, label], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="6" fill="#10B981" />
              <circle r="10" fill="rgba(16,185,129,0.3)" />
              <text
                y="-12"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="7"
                fontWeight="700"
                fill="#1A3A3B"
              >
                {label as string}
              </text>
            </g>
          ))}

          {/* arrows from source */}
          <g stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M 65 -10 Q 30 -40 -10 -10" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
            <path d="M 65 -10 Q 50 0 30 -18" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
            <path d="M 65 -10 Q 30 30 -34 8" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(255,255,255,0.85)" />
            </marker>
          </defs>
        </g>

        {/* title banner */}
        <g transform="translate(100 200)">
          <rect x="-70" y="-8" width="140" height="14" rx="7" fill="rgba(255,255,255,0.9)" />
          <text
            textAnchor="middle"
            y="2"
            fontFamily="Inter, sans-serif"
            fontSize="7"
            fontWeight="700"
            fill="#B37C1C"
            letterSpacing="0.12em"
          >
            CHINA + 1 PLAYBOOK
          </text>
        </g>
      </svg>
    </AmberFrame>
  )
}

/* ------------------------------------------------------------------ */
/* Registry — map resource slug to cover component                     */
/* ------------------------------------------------------------------ */
export const LEAD_MAGNET_COVERS: Record<
  string,
  React.FC<{ className?: string }>
> = {
  "rfq-comparison-template": RfqComparisonTemplateCover,
  "supplier-risk-checklist-2026": SupplierRiskChecklistCover,
  "tco-calculator": TcoCalculatorCover,
  "vendor-scoring-framework": VendorScoringFrameworkCover,
  "nearshore-migration-playbook": NearshoreMigrationPlaybookCover,
}

export default LEAD_MAGNET_COVERS
