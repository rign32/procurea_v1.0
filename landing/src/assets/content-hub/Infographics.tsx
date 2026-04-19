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
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" aria-hidden="true">
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
      <svg viewBox="0 0 500 440" className="w-full h-auto" aria-hidden="true">
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
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md mx-auto" aria-hidden="true">
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

/* ------------------------------------------------------------------ */
/* 6. RfqAutomationFlow — 5-stage horizontal workflow                   */
/* ------------------------------------------------------------------ */
interface RfqStage {
  label: string
  sub: string
}

const DEFAULT_RFQ_STAGES: RfqStage[] = [
  { label: "Spec", sub: "Brief + fields" },
  { label: "Distribute", sub: "Multi-supplier send" },
  { label: "Collect", sub: "Normalize replies" },
  { label: "Score", sub: "Weighted compare" },
  { label: "Select", sub: "Award + handoff" },
]

interface RfqAutomationFlowProps extends InfographicProps {
  stages?: RfqStage[]
}

export function RfqAutomationFlow({
  className,
  ariaLabel = "5-stage RFQ automation workflow: Spec, Distribute, Collect, Score, Select",
  stages = DEFAULT_RFQ_STAGES,
}: RfqAutomationFlowProps) {
  const colors = ["#2A5C5D", "#3F7A7D", "#5E8C8F", "#7AADAF", "#A5CCCE"]
  return (
    <div
      className={cn("w-full py-6", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 640 170" className="w-full h-auto" aria-hidden="true">
        <defs>
          <marker
            id="rfq-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5E8C8F" />
          </marker>
        </defs>
        {stages.map((s, i) => {
          const x = 20 + i * 122
          const cx = x + 50
          const color = colors[i] || "#5E8C8F"
          return (
            <g key={i}>
              {/* connector line to next stage */}
              {i < stages.length - 1 && (
                <line
                  x1={x + 100}
                  y1={70}
                  x2={x + 120}
                  y2={70}
                  stroke="#5E8C8F"
                  strokeWidth="2"
                  markerEnd="url(#rfq-arrow)"
                  strokeLinecap="round"
                />
              )}
              {/* node circle */}
              <circle cx={cx} cy={70} r="34" fill="white" stroke={color} strokeWidth="2.5" />
              <circle cx={cx} cy={70} r="26" fill={color} opacity="0.12" />
              <text
                x={cx}
                y={66}
                textAnchor="middle"
                fontFamily="Inter Tight, Inter, sans-serif"
                fontSize="13"
                fontWeight="800"
                fill={color}
                letterSpacing="-0.02em"
              >
                0{i + 1}
              </text>
              <text
                x={cx}
                y={82}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="9"
                fontWeight="600"
                fill="#0F172B"
                letterSpacing="0.08em"
              >
                STAGE
              </text>
              {/* label below */}
              <text
                x={cx}
                y={128}
                textAnchor="middle"
                fontFamily="Inter Tight, Inter, sans-serif"
                fontSize="15"
                fontWeight="700"
                fill="#0F172B"
                letterSpacing="-0.02em"
              >
                {s.label}
              </text>
              <text
                x={cx}
                y={146}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontWeight="500"
                fill="#8E8396"
              >
                {s.sub}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 7. VatViesVerificationSteps — 3-step process with 3-min clock       */
/* ------------------------------------------------------------------ */
interface VatViesStepsProps extends InfographicProps {
  totalMinutes?: number
}

export function VatViesVerificationSteps({
  className,
  ariaLabel = "3-step VAT VIES verification: input VAT, check VIES, get result. Under 3 minutes total.",
  totalMinutes = 3,
}: VatViesStepsProps) {
  const steps = [
    { n: 1, title: "Input VAT", sub: "Country prefix + number", color: "#5E8C8F" },
    { n: 2, title: "VIES check", sub: "EU registry lookup", color: "#2A5C5D" },
    { n: 3, title: "Result", sub: "Valid · Owner · Address", color: "#10B981" },
  ]

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white shadow-premium p-5 sm:p-7",
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
        {/* steps */}
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li
              key={i}
              className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-display font-bold text-sm mb-2"
                style={{ background: s.color }}
                aria-hidden="true"
              >
                {s.n}
              </div>
              <div className="font-display font-bold text-slate-900 text-base tracking-tight leading-tight">
                {s.title}
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">{s.sub}</div>
              {/* connector */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:block absolute top-1/2 right-[-14px] w-7 h-0.5 bg-slate-300"
                />
              )}
            </li>
          ))}
        </ol>
        {/* clock */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 120 120" className="w-28 h-28" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              strokeDasharray={`${(totalMinutes / 60) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              strokeDashoffset={(Math.PI / 2) * 52}
              transform="rotate(-90 60 60)"
              strokeLinecap="round"
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              fontFamily="Inter Tight, Inter, sans-serif"
              fontSize="30"
              fontWeight="800"
              fill="#0F172B"
              letterSpacing="-0.04em"
            >
              {totalMinutes}
            </text>
            <text
              x="60"
              y="76"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              fontWeight="600"
              fill="#10B981"
              letterSpacing="0.12em"
            >
              MIN
            </text>
          </svg>
          <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Total time
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 8. SupplierRiskRadar — pentagon radar chart, 5 axes                 */
/* ------------------------------------------------------------------ */
interface RiskAxis {
  label: string
  score: number // 0..10 (higher = higher risk)
}

const DEFAULT_RISK_AXES: RiskAxis[] = [
  { label: "Financial", score: 6 },
  { label: "Operational", score: 4 },
  { label: "Geopolitical", score: 7 },
  { label: "ESG", score: 5 },
  { label: "Cyber", score: 3 },
]

interface SupplierRiskRadarProps extends InfographicProps {
  axes?: RiskAxis[]
}

export function SupplierRiskRadar({
  className,
  ariaLabel = "Supplier risk radar across 5 dimensions: financial, operational, geopolitical, ESG, cyber",
  axes = DEFAULT_RISK_AXES,
}: SupplierRiskRadarProps) {
  const cx = 200
  const cy = 200
  const maxR = 140
  const n = axes.length

  const points = axes.map((a, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    const r = (a.score / 10) * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (maxR + 30) * Math.cos(angle),
      labelY: cy + (maxR + 30) * Math.sin(angle),
      axisX: cx + maxR * Math.cos(angle),
      axisY: cy + maxR * Math.sin(angle),
    }
  })

  // gridlines
  const rings = [0.25, 0.5, 0.75, 1]

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md mx-auto" aria-hidden="true">
        {/* concentric rings */}
        {rings.map((f, i) => {
          const r = f * maxR
          const ringPts = Array.from({ length: n }, (_, j) => {
            const angle = -Math.PI / 2 + (j * 2 * Math.PI) / n
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
          }).join(" ")
          return (
            <polygon
              key={`ring-${i}`}
              points={ringPts}
              fill="none"
              stroke="rgba(15,23,43,0.08)"
              strokeWidth="1"
            />
          )
        })}
        {/* axes */}
        {points.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={p.axisX}
            y2={p.axisY}
            stroke="rgba(15,23,43,0.08)"
            strokeWidth="1"
          />
        ))}
        {/* filled area */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(199,111,150,0.2)"
          stroke="#C76F96"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* dots + value chips */}
        {points.map((p, i) => (
          <g key={`pt-${i}`}>
            <circle cx={p.x} cy={p.y} r="5" fill="#C76F96" stroke="white" strokeWidth="2" />
          </g>
        ))}
        {/* labels */}
        {points.map((p, i) => (
          <g key={`lbl-${i}`}>
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter Tight, Inter, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#0F172B"
              letterSpacing="-0.02em"
            >
              {axes[i].label}
            </text>
            <text
              x={p.labelX}
              y={p.labelY + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              fontWeight="600"
              fill="#C76F96"
            >
              {axes[i].score}/10
            </text>
          </g>
        ))}
        {/* center label */}
        <circle cx={cx} cy={cy} r="3" fill="#0F172B" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 9. AiFeaturesMatrix — 7 feature cards in a grid                      */
/* ------------------------------------------------------------------ */
interface AiFeature {
  name: string
  icon: string // emoji or short glyph
  color: string
}

const DEFAULT_AI_FEATURES: AiFeature[] = [
  { name: "Supplier discovery", icon: "◎", color: "#5E8C8F" },
  { name: "Generative RFx", icon: "✎", color: "#2A5C5D" },
  { name: "Risk scoring", icon: "△", color: "#C76F96" },
  { name: "Spend classification", icon: "▦", color: "#D69722" },
  { name: "Contract extraction", icon: "⌘", color: "#5E4B8F" },
  { name: "Multilingual outreach", icon: "◈", color: "#10B981" },
  { name: "Offer comparison", icon: "≡", color: "#A9B28A" },
]

interface AiFeaturesMatrixProps extends InfographicProps {
  features?: AiFeature[]
}

export function AiFeaturesMatrix({
  className,
  ariaLabel = "Seven AI procurement features arranged in a matrix",
  features = DEFAULT_AI_FEATURES,
}: AiFeaturesMatrixProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((f, i) => (
          <li
            key={i}
            className="relative rounded-2xl border border-slate-200 bg-white p-4 flex flex-col items-start gap-2 transition-all hover:-translate-y-0.5 hover:shadow-premium"
          >
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold text-white"
              style={{ background: f.color }}
              aria-hidden="true"
            >
              {f.icon}
            </span>
            <div className="font-display font-bold text-slate-900 text-sm leading-tight tracking-tight">
              {f.name}
            </div>
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 text-[10px] font-mono font-semibold text-slate-400 tabular-nums"
            >
              0{i + 1}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 10. VendorScoringScorecard — 10 criteria + score bars                */
/* ------------------------------------------------------------------ */
interface ScoringRow {
  label: string
  weight: number // percent
  score: number // 0..10
}

const DEFAULT_SCORING: ScoringRow[] = [
  { label: "Price competitiveness", weight: 20, score: 8 },
  { label: "Product quality", weight: 15, score: 9 },
  { label: "Lead time", weight: 10, score: 7 },
  { label: "MOQ flexibility", weight: 8, score: 6 },
  { label: "Certifications", weight: 10, score: 9 },
  { label: "Financial health", weight: 10, score: 8 },
  { label: "Communication", weight: 7, score: 7 },
  { label: "ESG / sustainability", weight: 8, score: 6 },
  { label: "Capacity", weight: 7, score: 8 },
  { label: "Reference checks", weight: 5, score: 9 },
]

interface VendorScoringScorecardProps extends InfographicProps {
  rows?: ScoringRow[]
  vendorName?: string
}

export function VendorScoringScorecard({
  className,
  ariaLabel = "Vendor scorecard across 10 weighted criteria with total weighted score",
  rows = DEFAULT_SCORING,
  vendorName = "Vendor A",
}: VendorScoringScorecardProps) {
  const total = rows.reduce((sum, r) => sum + (r.score * r.weight) / 10, 0)
  // total is already on 0..100 scale since weights sum to 100, score/10 * weight
  const totalRounded = Math.round(total)

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden",
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Weighted scorecard
          </div>
          <div className="font-display font-bold text-slate-900 text-base tracking-tight">
            {vendorName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Total
          </div>
          <div className="font-display font-bold text-2xl tracking-tight text-brand-700 tabular-nums">
            {totalRounded}
            <span className="text-slate-400 text-base font-semibold">/100</span>
          </div>
        </div>
      </header>
      <ul className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1fr_80px_100px_40px] items-center gap-3 px-5 py-2.5 text-sm">
            <span className="font-semibold text-slate-900 truncate">{r.label}</span>
            <span className="tabular-nums text-xs font-semibold text-slate-500 text-right">
              w {r.weight}%
            </span>
            <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${r.score * 10}%`,
                  background: `linear-gradient(90deg, #5E8C8F, #2A5C5D)`,
                }}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs font-display font-bold text-slate-900 tabular-nums text-right">
              {r.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 11. TcoIceberg — iceberg: tip unit price, submerged hidden costs    */
/* ------------------------------------------------------------------ */
interface TcoIcebergProps extends InfographicProps {
  visibleLabel?: string
  submergedLabels?: string[]
}

export function TcoIceberg({
  className,
  ariaLabel = "Total cost of ownership iceberg: unit price is only the tip; logistics, duties, quality, and switching costs are submerged",
  visibleLabel = "Unit price · 15%",
  submergedLabels = [
    "Logistics & duties",
    "Quality & rework",
    "Payment terms",
    "Onboarding & switching",
    "Compliance & audits",
  ],
}: TcoIcebergProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 500 420" className="w-full h-auto max-w-xl mx-auto" aria-hidden="true">
        <defs>
          <linearGradient id="tco-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E9F3F4" />
            <stop offset="100%" stopColor="#C8DDDE" />
          </linearGradient>
          <linearGradient id="tco-sea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A5C5D" />
            <stop offset="100%" stopColor="#0F172B" />
          </linearGradient>
          <linearGradient id="tco-tip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C8DDDE" />
          </linearGradient>
          <linearGradient id="tco-base" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7AADAF" />
            <stop offset="100%" stopColor="#2A5C5D" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="500" height="155" fill="url(#tco-sky)" />
        {/* sea */}
        <rect x="0" y="155" width="500" height="265" fill="url(#tco-sea)" />
        {/* waterline */}
        <line x1="0" y1="155" x2="500" y2="155" stroke="white" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

        {/* iceberg tip (above water) */}
        <polygon
          points="250,40 220,155 290,155"
          fill="url(#tco-tip)"
          stroke="#5E8C8F"
          strokeWidth="1.5"
        />

        {/* iceberg base (submerged) */}
        <polygon
          points="220,155 290,155 360,355 160,355"
          fill="url(#tco-base)"
          opacity="0.92"
          stroke="#2A5C5D"
          strokeWidth="1.5"
        />

        {/* tip label */}
        <g>
          <line x1="290" y1="90" x2="410" y2="70" stroke="#2A5C5D" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="410" y="54" width="82" height="34" rx="8" fill="white" stroke="#2A5C5D" strokeWidth="1.5" />
          <text
            x="451"
            y="72"
            textAnchor="middle"
            fontFamily="Inter Tight, Inter, sans-serif"
            fontSize="11"
            fontWeight="800"
            fill="#2A5C5D"
            letterSpacing="-0.02em"
          >
            {visibleLabel.split(" · ")[0]}
          </text>
          <text
            x="451"
            y="84"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="#C76F96"
          >
            {visibleLabel.split(" · ")[1] || ""}
          </text>
        </g>

        {/* submerged labels */}
        {submergedLabels.slice(0, 5).map((l, i) => {
          const y = 200 + i * 32
          return (
            <g key={i}>
              <line x1="160" y1={y} x2="40" y2={y} stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
              <rect x="16" y={y - 12} width="120" height="24" rx="6" fill="white" opacity="0.96" />
              <text
                x="76"
                y={y + 4}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontWeight="700"
                fill="#0F172B"
              >
                {l}
              </text>
            </g>
          )
        })}

        {/* "85% hidden" big label */}
        <g transform="translate(380 260)">
          <rect x="-60" y="-24" width="120" height="48" rx="12" fill="#C76F96" />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fontFamily="Inter Tight, Inter, sans-serif"
            fontSize="20"
            fontWeight="800"
            fill="white"
            letterSpacing="-0.04em"
          >
            85%
          </text>
          <text
            x="0"
            y="14"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="white"
            letterSpacing="0.14em"
          >
            HIDDEN COSTS
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 12. DatabaseDecayChart — line chart of data freshness over 12 mo    */
/* ------------------------------------------------------------------ */
interface DatabaseDecayChartProps extends InfographicProps {
  /** monthly freshness percentage (12 points, 0..100) */
  monthlyFreshness?: number[]
}

const DEFAULT_DECAY = [100, 94, 88, 82, 76, 71, 66, 62, 58, 55, 52, 60] // 60% fresh = 40% stale after year

export function DatabaseDecayChart({
  className,
  ariaLabel = "Supplier database freshness decays from 100% to ~60% over 12 months (40% stale)",
  monthlyFreshness = DEFAULT_DECAY,
}: DatabaseDecayChartProps) {
  const w = 560
  const h = 240
  const padL = 46
  const padR = 24
  const padT = 20
  const padB = 36
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  const stepX = plotW / (monthlyFreshness.length - 1)
  const toY = (v: number) => padT + plotH - (v / 100) * plotH
  const points = monthlyFreshness.map((v, i) => ({
    x: padL + i * stepX,
    y: toY(v),
    v,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${padL} ${padT + plotH} Z`

  return (
    <div
      className={cn("w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-premium", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-hidden="true">
        <defs>
          <linearGradient id="decay-area" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(199,111,150,0.35)" />
            <stop offset="100%" stopColor="rgba(199,111,150,0)" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              y1={toY(g)}
              x2={w - padR}
              y2={toY(g)}
              stroke="rgba(15,23,43,0.06)"
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={toY(g) + 3}
              textAnchor="end"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              fontWeight="600"
              fill="#8E8396"
            >
              {g}%
            </text>
          </g>
        ))}

        {/* x-axis labels */}
        {["M1", "M3", "M6", "M9", "M12"].map((lbl, i) => {
          const idx = [0, 2, 5, 8, 11][i]
          return (
            <text
              key={lbl}
              x={padL + idx * stepX}
              y={h - 14}
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              fontWeight="600"
              fill="#8E8396"
            >
              {lbl}
            </text>
          )
        })}

        {/* stale zone (below 60%) */}
        <rect
          x={padL}
          y={toY(60)}
          width={plotW}
          height={padT + plotH - toY(60)}
          fill="rgba(199,111,150,0.08)"
        />
        <text
          x={w - padR - 6}
          y={toY(60) + 14}
          textAnchor="end"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#C76F96"
          letterSpacing="0.1em"
        >
          STALE ZONE
        </text>

        {/* area fill */}
        <path d={areaPath} fill="url(#decay-area)" />

        {/* line */}
        <path d={linePath} fill="none" stroke="#C76F96" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* endpoint markers */}
        <circle cx={points[0].x} cy={points[0].y} r="5" fill="white" stroke="#C76F96" strokeWidth="2.5" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#C76F96" stroke="white" strokeWidth="2" />

        {/* endpoint labels */}
        <text
          x={points[0].x + 8}
          y={points[0].y - 8}
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#0F172B"
        >
          100% fresh
        </text>
        <text
          x={points[points.length - 1].x - 8}
          y={points[points.length - 1].y - 10}
          textAnchor="end"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#C76F96"
        >
          ~40% stale
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 13. ErpComparisonGrid — 3-col: SAP / NetSuite / Salesforce          */
/* ------------------------------------------------------------------ */
interface ErpColumn {
  name: string
  syncStatus: "native" | "merge" | "api" | "roadmap"
  note: string
  color: string
}

const DEFAULT_ERP_COLUMNS: ErpColumn[] = [
  {
    name: "SAP S/4HANA",
    syncStatus: "api",
    note: "OData / RFC bridge · on roadmap",
    color: "#0284C7",
  },
  {
    name: "NetSuite",
    syncStatus: "merge",
    note: "Via Merge.dev — bi-directional",
    color: "#16A34A",
  },
  {
    name: "Salesforce",
    syncStatus: "native",
    note: "Native OAuth · Opportunities + Accounts",
    color: "#5E4B8F",
  },
]

const SYNC_LABEL: Record<ErpColumn["syncStatus"], { text: string; bg: string; fg: string }> = {
  native: { text: "Native sync", bg: "bg-emerald-100", fg: "text-emerald-700" },
  merge: { text: "Via Merge.dev", bg: "bg-sky-100", fg: "text-sky-700" },
  api: { text: "Custom API", bg: "bg-amber-100", fg: "text-amber-700" },
  roadmap: { text: "On roadmap", bg: "bg-slate-100", fg: "text-slate-700" },
}

interface ErpComparisonGridProps extends InfographicProps {
  columns?: ErpColumn[]
}

export function ErpComparisonGrid({
  className,
  ariaLabel = "Procurea sync status across SAP, NetSuite, and Salesforce",
  columns = DEFAULT_ERP_COLUMNS,
}: ErpComparisonGridProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {columns.map((c, i) => {
          const status = SYNC_LABEL[c.syncStatus]
          return (
            <div
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-premium hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] transition-shadow"
            >
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white font-display font-bold text-lg mb-3 tracking-tight"
                style={{ background: c.color }}
                aria-hidden="true"
              >
                {c.name.charAt(0)}
              </div>
              <div className="font-display font-bold text-slate-900 text-base leading-tight tracking-tight mb-1">
                {c.name}
              </div>
              <div className="text-xs text-slate-500 mb-3 leading-snug">{c.note}</div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                  status.bg,
                  status.fg
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    c.syncStatus === "native" && "bg-emerald-500",
                    c.syncStatus === "merge" && "bg-sky-500",
                    c.syncStatus === "api" && "bg-amber-500",
                    c.syncStatus === "roadmap" && "bg-slate-500"
                  )}
                  aria-hidden="true"
                />
                {status.text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 14. BuyersGuideQuestions — 12 question cards in 3x4 grid            */
/* ------------------------------------------------------------------ */
interface GuideQuestion {
  category: string
  icon: string
  q: string
}

const DEFAULT_QUESTIONS: GuideQuestion[] = [
  { category: "Data", icon: "◈", q: "Where does your supplier data come from?" },
  { category: "Data", icon: "◉", q: "How fresh is each record?" },
  { category: "Data", icon: "✦", q: "How many regions are covered?" },
  { category: "AI", icon: "✎", q: "Which model powers your scoring?" },
  { category: "AI", icon: "△", q: "Can we see the reasoning?" },
  { category: "AI", icon: "◎", q: "How do you handle hallucinations?" },
  { category: "Workflow", icon: "⇄", q: "How does it integrate with our ERP?" },
  { category: "Workflow", icon: "≡", q: "Can we export to our CRM?" },
  { category: "Workflow", icon: "✉", q: "How do we send outreach?" },
  { category: "Proof", icon: "€", q: "What does a pilot really cost?" },
  { category: "Proof", icon: "★", q: "Show me 3 references in our industry." },
  { category: "Proof", icon: "⏱", q: "How long is a realistic ramp-up?" },
]

const CAT_COLOR: Record<string, string> = {
  Data: "#5E8C8F",
  AI: "#5E4B8F",
  Workflow: "#D69722",
  Proof: "#C76F96",
}

interface BuyersGuideQuestionsProps extends InfographicProps {
  questions?: GuideQuestion[]
}

export function BuyersGuideQuestions({
  className,
  ariaLabel = "Twelve questions to ask any AI sourcing vendor, grouped in four themes",
  questions = DEFAULT_QUESTIONS,
}: BuyersGuideQuestionsProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {questions.map((q, i) => {
          const color = CAT_COLOR[q.category] || "#5E8C8F"
          return (
            <li
              key={i}
              className="group relative rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-premium"
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold flex-shrink-0"
                  style={{ background: color }}
                  aria-hidden="true"
                >
                  {q.icon}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-[9px] font-bold uppercase tracking-[0.12em] mb-0.5"
                    style={{ color }}
                  >
                    Q{String(i + 1).padStart(2, "0")} · {q.category}
                  </div>
                  <div className="text-[12px] font-semibold text-slate-900 leading-snug">
                    {q.q}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 15. GermanSourcingMap — stylized DE map with hubs highlighted        */
/* ------------------------------------------------------------------ */
interface GermanHub {
  name: string
  x: number
  y: number
  size: "lg" | "md" | "sm"
  specialty: string
}

const DEFAULT_GERMAN_HUBS: GermanHub[] = [
  { name: "NRW", x: 95, y: 160, size: "lg", specialty: "Steel · Auto · Chemicals" },
  { name: "Bavaria", x: 230, y: 280, size: "lg", specialty: "Automotive · Precision" },
  { name: "Baden-Württemberg", x: 165, y: 295, size: "lg", specialty: "Machinery · EV" },
  { name: "Hamburg", x: 175, y: 80, size: "md", specialty: "Logistics · Aerospace" },
  { name: "Saxony", x: 270, y: 175, size: "md", specialty: "Microelectronics" },
  { name: "Berlin-Brandenburg", x: 270, y: 130, size: "sm", specialty: "Tech · Tesla" },
]

interface GermanSourcingMapProps extends InfographicProps {
  hubs?: GermanHub[]
}

export function GermanSourcingMap({
  className,
  ariaLabel = "Map of Germany highlighting key manufacturing hubs: NRW, Bavaria, Baden-Württemberg, Hamburg, Saxony, Berlin",
  hubs = DEFAULT_GERMAN_HUBS,
}: GermanSourcingMapProps) {
  const HUB_RADIUS: Record<GermanHub["size"], number> = { lg: 14, md: 10, sm: 7 }

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-premium",
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
        <svg viewBox="0 0 400 420" className="w-full h-auto max-w-xs mx-auto" aria-hidden="true">
          {/* stylized germany silhouette (simplified polygon) */}
          <defs>
            <linearGradient id="de-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E9F3F4" />
              <stop offset="100%" stopColor="#C8DDDE" />
            </linearGradient>
          </defs>
          <path
            d="M 160 30
               L 210 40
               L 240 75
               L 225 115
               L 285 105
               L 315 145
               L 310 200
               L 335 240
               L 325 290
               L 280 315
               L 260 355
               L 220 365
               L 175 340
               L 130 355
               L 95 310
               L 60 260
               L 65 210
               L 50 170
               L 80 140
               L 70 95
               L 105 70
               L 135 60
               Z"
            fill="url(#de-grad)"
            stroke="#5E8C8F"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* hubs */}
          {hubs.map((h, i) => {
            const r = HUB_RADIUS[h.size]
            const color = h.size === "lg" ? "#C76F96" : h.size === "md" ? "#D69722" : "#2A5C5D"
            return (
              <g key={i}>
                {/* pulse */}
                <circle cx={h.x} cy={h.y} r={r + 6} fill={color} opacity="0.15" />
                <circle cx={h.x} cy={h.y} r={r} fill={color} stroke="white" strokeWidth="2" />
                <text
                  x={h.x}
                  y={h.y - r - 6}
                  textAnchor="middle"
                  fontFamily="Inter Tight, Inter, sans-serif"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0F172B"
                  letterSpacing="-0.02em"
                >
                  {h.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* legend / hubs list */}
        <ul className="space-y-2.5 text-sm">
          {hubs.map((h, i) => {
            const color = h.size === "lg" ? "#C76F96" : h.size === "md" ? "#D69722" : "#2A5C5D"
            return (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <div>
                  <div className="font-display font-bold text-slate-900 text-sm tracking-tight leading-tight">
                    {h.name}
                  </div>
                  <div className="text-xs text-slate-500">{h.specialty}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default {
  ThirtyHourBreakdown,
  SourcingFunnel,
  NearshoreCountryComparison,
  ContentPillarsDiagram,
  ComplianceShield,
  RfqAutomationFlow,
  VatViesVerificationSteps,
  SupplierRiskRadar,
  AiFeaturesMatrix,
  VendorScoringScorecard,
  TcoIceberg,
  DatabaseDecayChart,
  ErpComparisonGrid,
  BuyersGuideQuestions,
  GermanSourcingMap,
}
