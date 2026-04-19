import { cn } from "@/lib/utils"

/**
 * Inline Infographics for blog posts & pillar pages
 * --------------------------------------------------
 * Pure SVG + Tailwind — no external image files. Each infographic accepts
 * optional `className` and sometimes data overrides.
 *
 * All components:
 *   - role="img" + aria-label on the outer SVG/container
 *   - Gzip-friendly (<5KB each)
 *   - Responsive (fluid via viewBox + `w-full h-auto`)
 *   - Accept Tailwind `className` for container control
 *
 * Intended usage in MDX/blog content:
 *   <figure>
 *     <ThirtyHourBreakdown />
 *     <figcaption>Where 30 hours of manual sourcing actually go.</figcaption>
 *   </figure>
 */

interface InfographicProps {
  className?: string
  ariaLabel?: string
}

/* ------------------------------------------------------------------ */
/* 1. ThirtyHourBreakdown — donut chart                                 */
/* ------------------------------------------------------------------ */
interface ThirtyHourBreakdownProps extends InfographicProps {
  data?: Array<{ label: string; hours: number; color: string }>
}

const DEFAULT_30H_DATA = [
  { label: "Google search", hours: 8, color: "#5E8C8F" },
  { label: "Site analysis", hours: 10, color: "#2A5C5D" },
  { label: "Verification", hours: 6, color: "#C76F96" },
  { label: "Outreach", hours: 4, color: "#F5C451" },
  { label: "Comparison", hours: 2, color: "#10B981" },
]

export function ThirtyHourBreakdown({
  className,
  ariaLabel = "Breakdown of 30 hours of manual supplier sourcing across 5 activities",
  data = DEFAULT_30H_DATA,
}: ThirtyHourBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.hours, 0)
  const radius = 70
  const stroke = 28
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * radius

  let cumulative = 0
  const segments = data.map((d, i) => {
    const start = cumulative / total
    const length = d.hours / total
    cumulative += d.hours
    return (
      <circle
        key={i}
        r={radius}
        cx={cx}
        cy={cy}
        fill="none"
        stroke={d.color}
        strokeWidth={stroke}
        strokeDasharray={`${length * circumference} ${circumference}`}
        strokeDashoffset={-start * circumference}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
  })

  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 md:gap-10 py-4",
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      {/* donut */}
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
        {/* track */}
        <circle
          r={radius}
          cx={cx}
          cy={cy}
          fill="none"
          stroke="rgba(15,23,43,0.06)"
          strokeWidth={stroke}
        />
        {segments}
        {/* center label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily="Inter Tight, Inter, sans-serif"
          fontSize="34"
          fontWeight="800"
          fill="#0F172B"
          letterSpacing="-0.04em"
        >
          30h
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="600"
          fill="#8E8396"
          letterSpacing="0.1em"
        >
          PER CAMPAIGN
        </text>
      </svg>

      {/* legend */}
      <ul className="space-y-2.5 text-sm">
        {data.map((d, i) => {
          const pct = Math.round((d.hours / total) * 100)
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: d.color }}
                aria-hidden="true"
              />
              <span className="flex-1 font-medium text-slate-900">
                {d.label}
              </span>
              <span className="font-display font-bold text-slate-900 tabular-nums">
                {d.hours}h
              </span>
              <span className="text-slate-500 tabular-nums w-10 text-right">
                {pct}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2. SourcingFunnel — 5-step funnel                                    */
/* ------------------------------------------------------------------ */
interface SourcingFunnelProps extends InfographicProps {
  steps?: Array<{ value: string; label: string }>
}

const DEFAULT_FUNNEL = [
  { value: "500", label: "Google results" },
  { value: "120", label: "Verified" },
  { value: "40", label: "Contacted" },
  { value: "15", label: "Responses" },
  { value: "3", label: "Shortlist" },
]

export function SourcingFunnel({
  className,
  ariaLabel = "5-step sourcing funnel: 500 results narrow to 3 shortlisted suppliers",
  steps = DEFAULT_FUNNEL,
}: SourcingFunnelProps) {
  return (
    <div
      className={cn("w-full py-6", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ol className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
        {steps.map((step, i) => {
          // funnel narrows from 1.0 → 0.55 width
          const widthRatio = 1 - (i / (steps.length - 1)) * 0.45
          const intensity = 900 - i * 100 // brand-900 → brand-500
          return (
            <li
              key={i}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div
                className="relative w-full flex items-center justify-center rounded-xl text-white px-3 py-5 transition-transform hover:scale-[1.02] duration-200"
                style={{
                  width: `${widthRatio * 100}%`,
                  background: `linear-gradient(135deg, ${funnelColor(i)}, ${funnelColor(i, true)})`,
                  boxShadow: "0 2px 8px -2px rgba(15,23,43,0.12)",
                }}
                data-brand-intensity={intensity}
              >
                <div className="text-center">
                  <div className="font-display font-bold leading-none tracking-tight text-2xl md:text-3xl">
                    {step.value}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                    {step.label}
                  </div>
                </div>
              </div>
              {/* arrow (only between steps, not after last) */}
              {i < steps.length - 1 && (
                <svg
                  className="hidden md:block absolute text-brand-400"
                  width="16"
                  height="16"
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* horizontal arrows (desktop only) */}
      <svg className="hidden md:block w-full h-3 mt-[-28px] pointer-events-none opacity-50" aria-hidden="true" viewBox="0 0 100 3" preserveAspectRatio="none">
        <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="rgba(94,140,143,0.4)" strokeWidth="0.6" strokeDasharray="1 1" />
      </svg>
    </div>
  )
}

function funnelColor(index: number, dark = false): string {
  const stops = [
    ["#7AADAF", "#2A5C5D"],
    ["#5E8C8F", "#2A5C5D"],
    ["#4A7174", "#1A3A3B"],
    ["#2A5C5D", "#0F172B"],
    ["#1A3A3B", "#0F172B"],
  ]
  const pair = stops[Math.min(index, stops.length - 1)]
  return dark ? pair[1] : pair[0]
}

/* ------------------------------------------------------------------ */
/* 3. NearshoreCountryComparison — 3-column comparison card             */
/* ------------------------------------------------------------------ */
interface CountryRow {
  country: string
  flag: string
  cost: string
  moq: string
  leadTime: string
  color: string
}

const DEFAULT_COUNTRIES: CountryRow[] = [
  {
    country: "Turkey",
    flag: "TR",
    cost: "Low",
    moq: "Varies",
    leadTime: "2–3 weeks",
    color: "#C76F96",
  },
  {
    country: "Poland",
    flag: "PL",
    cost: "Mid",
    moq: "Flexible",
    leadTime: "1–2 weeks",
    color: "#5E8C8F",
  },
  {
    country: "Portugal",
    flag: "PT",
    cost: "Mid-high",
    moq: "Small-friendly",
    leadTime: "1–2 weeks",
    color: "#10B981",
  },
]

interface NearshoreComparisonProps extends InfographicProps {
  countries?: CountryRow[]
}

export function NearshoreCountryComparison({
  className,
  ariaLabel = "Nearshore country comparison: Turkey vs Poland vs Portugal",
  countries = DEFAULT_COUNTRIES,
}: NearshoreComparisonProps) {
  const rows = [
    { key: "cost", label: "Cost level" },
    { key: "moq", label: "MOQ" },
    { key: "leadTime", label: "Lead time" },
  ] as const

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden",
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      {/* header row */}
      <div className="grid grid-cols-[120px_repeat(3,1fr)] border-b border-slate-200 bg-slate-50/70">
        <div className="p-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Nearshore
        </div>
        {countries.map((c) => (
          <div
            key={c.country}
            className="p-4 flex items-center gap-2 border-l border-slate-200"
          >
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold tracking-[0.08em] text-white rounded-md w-7 h-7"
              style={{ background: c.color }}
              aria-hidden="true"
            >
              {c.flag}
            </span>
            <span className="font-display font-bold text-slate-900 tracking-tight">
              {c.country}
            </span>
          </div>
        ))}
      </div>

      {/* body rows */}
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={cn(
            "grid grid-cols-[120px_repeat(3,1fr)]",
            i < rows.length - 1 && "border-b border-slate-100"
          )}
        >
          <div className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 bg-slate-50/30">
            {row.label}
          </div>
          {countries.map((c) => (
            <div
              key={`${c.country}-${row.key}`}
              className="p-4 border-l border-slate-100 text-sm font-medium text-slate-900"
            >
              {c[row.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 4. ContentPillarsDiagram — 5 pillars in a pentagon                   */
/* ------------------------------------------------------------------ */
interface PillarNode {
  label: string
  keywords: string
  color: string
}

const DEFAULT_PILLARS: PillarNode[] = [
  { label: "AI Sourcing", keywords: "discovery · scoring", color: "#5E8C8F" },
  { label: "ERP Integration", keywords: "Merge.dev · sync", color: "#5E4B8F" },
  { label: "Multilingual", keywords: "12 languages · localize", color: "#A9B28A" },
  { label: "Supplier Intel", keywords: "risk · compliance", color: "#D69722" },
  { label: "Offer Comparison", keywords: "RFQ · scorecard", color: "#C76F96" },
]

interface ContentPillarsDiagramProps extends InfographicProps {
  pillars?: PillarNode[]
}

export function ContentPillarsDiagram({
  className,
  ariaLabel = "Five content pillars arranged in a pentagon around the Procurea core",
  pillars = DEFAULT_PILLARS,
}: ContentPillarsDiagramProps) {
  const cx = 250
  const cy = 230
  const r = 150
  // pentagon vertices, starting at the top
  const vertices = pillars.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / pillars.length
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  })

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 500 440" className="w-full h-auto">
        <defs>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(94,140,143,0.25)" />
            <stop offset="100%" stopColor="rgba(94,140,143,0)" />
          </radialGradient>
        </defs>

        {/* center glow */}
        <circle cx={cx} cy={cy} r="180" fill="url(#center-glow)" />

        {/* connection lines from each pillar to center */}
        {vertices.map((v, i) => (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={v.x}
            y2={v.y}
            stroke={pillars[i].color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        ))}

        {/* pentagon outline */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="rgba(15,23,43,0.1)"
          strokeWidth="1"
        />

        {/* pillar nodes */}
        {vertices.map((v, i) => {
          const p = pillars[i]
          return (
            <g key={`node-${i}`} transform={`translate(${v.x} ${v.y})`}>
              <circle r="38" fill="white" stroke={p.color} strokeWidth="2.5" />
              <circle r="28" fill={p.color} opacity="0.12" />
              <circle r="8" fill={p.color} />
              {/* label below/above depending on position */}
              <text
                y={v.y < cy ? -52 : 62}
                textAnchor="middle"
                fontFamily="Inter Tight, Inter, sans-serif"
                fontSize="15"
                fontWeight="700"
                fill="#0F172B"
                letterSpacing="-0.02em"
              >
                {p.label}
              </text>
              <text
                y={v.y < cy ? -36 : 78}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontWeight="500"
                fill="#8E8396"
              >
                {p.keywords}
              </text>
            </g>
          )
        })}

        {/* center node */}
        <g transform={`translate(${cx} ${cy})`}>
          <circle r="56" fill="white" stroke="#5E8C8F" strokeWidth="3" />
          <circle r="46" fill="#5E8C8F" opacity="0.08" />
          <text
            y="-4"
            textAnchor="middle"
            fontFamily="Inter Tight, Inter, sans-serif"
            fontSize="18"
            fontWeight="800"
            fill="#0F172B"
            letterSpacing="-0.03em"
          >
            Procurea
          </text>
          <text
            y="14"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fontWeight="600"
            fill="#5E8C8F"
            letterSpacing="0.1em"
          >
            CONTENT HUB
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5. ComplianceShield — shield with certification labels               */
/* ------------------------------------------------------------------ */
interface ComplianceShieldProps extends InfographicProps {
  labels?: string[]
}

const DEFAULT_COMPLIANCE = ["ISO 9001", "IATF 16949", "FDA", "GDPR", "CSRD"]

export function ComplianceShield({
  className,
  ariaLabel = "Compliance shield surrounded by five key certification labels",
  labels = DEFAULT_COMPLIANCE,
}: ComplianceShieldProps) {
  const cx = 200
  const cy = 200
  const badgeRadius = 150
  // 5 positions around shield: top, top-right, bottom-right, bottom-left, top-left
  const positions = labels.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length
    return {
      x: cx + badgeRadius * Math.cos(angle),
      y: cy + badgeRadius * Math.sin(angle),
    }
  })

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md mx-auto">
        <defs>
          <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D69722" />
            <stop offset="100%" stopColor="#8F5E0E" />
          </linearGradient>
        </defs>

        {/* rings */}
        <circle cx={cx} cy={cy} r="160" fill="none" stroke="rgba(214,151,34,0.15)" strokeWidth="1" strokeDasharray="3 5" />
        <circle cx={cx} cy={cy} r="110" fill="none" stroke="rgba(214,151,34,0.2)" strokeWidth="1" />

        {/* shield */}
        <g transform={`translate(${cx} ${cy})`}>
          <path
            d="M 0 -88 L 72 -64 L 72 16 C 72 56 40 80 0 96 C -40 80 -72 56 -72 16 L -72 -64 Z"
            fill="url(#shield-grad)"
            stroke="#8F5E0E"
            strokeWidth="2"
          />
          {/* check */}
          <path
            d="M -28 4 L -8 24 L 32 -20"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* orbiting badges */}
        {positions.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <rect
              x="-42"
              y="-14"
              width="84"
              height="28"
              rx="14"
              fill="white"
              stroke="#D69722"
              strokeWidth="1.5"
            />
            <text
              y="4"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="11"
              fontWeight="700"
              fill="#8F5E0E"
              letterSpacing="0.04em"
            >
              {labels[i]}
            </text>
            {/* tiny connector */}
            <line
              x1="0"
              y1="0"
              x2={(cx - p.x) * 0.22}
              y2={(cy - p.y) * 0.22}
              stroke="rgba(214,151,34,0.35)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

export default {
  ThirtyHourBreakdown,
  SourcingFunnel,
  NearshoreCountryComparison,
  ContentPillarsDiagram,
  ComplianceShield,
}
