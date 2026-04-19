// Inline visual components for blog post bodies.
// Break up walls of text: callouts, stats, tables, diagrams, comparisons.
// All components are self-contained, presentational, and render inline inside a <article> flow.

import { useId } from 'react'
import { Quote, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

// -------------------------------------------------------------------------
// 1. PullQuote — large callout with branded quote marks
// -------------------------------------------------------------------------
export interface PullQuoteProps {
  text: string
  author?: string
  role?: string
}

export function PullQuote({ text, author, role }: PullQuoteProps) {
  return (
    <figure className="my-10 not-prose">
      <blockquote className="relative rounded-2xl border-l-4 border-brand-500 bg-gradient-to-br from-brand-50/80 via-white to-white px-6 py-8 sm:px-10 sm:py-10 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
        <Quote
          className="absolute -top-3 left-6 h-8 w-8 text-brand-500 bg-white rounded-full p-1.5 shadow-[0_2px_8px_-2px_rgba(90,140,143,0.4)]"
          aria-hidden="true"
        />
        <p className="text-xl sm:text-2xl font-display font-semibold leading-relaxed text-slate-900 tracking-tight">
          &ldquo;{text}&rdquo;
        </p>
        {(author || role) && (
          <figcaption className="mt-5 flex items-center gap-2 text-sm">
            {author && (
              <span className="font-semibold text-slate-900">{author}</span>
            )}
            {author && role && <span className="text-slate-400">·</span>}
            {role && <span className="text-slate-600">{role}</span>}
          </figcaption>
        )}
      </blockquote>
    </figure>
  )
}

// -------------------------------------------------------------------------
// 2. StatBlock — row of large numeric stat pills
// -------------------------------------------------------------------------
export interface StatItem {
  value: string
  label: string
}

export interface StatBlockProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}

const STAT_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-rose-600',
]

export function StatBlock({ stats, columns = 3 }: StatBlockProps) {
  const gridClass =
    columns === 4
      ? 'sm:grid-cols-2 md:grid-cols-4'
      : columns === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-3'

  return (
    <div className={`my-10 not-prose grid grid-cols-1 ${gridClass} gap-4`}>
      {stats.map((stat, i) => {
        const gradient = STAT_GRADIENTS[i % STAT_GRADIENTS.length]
        return (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]`}
          >
            <div className="relative z-10">
              <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-white/85 leading-snug">
                {stat.label}
              </div>
            </div>
            <div
              className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
          </div>
        )
      })}
    </div>
  )
}

// -------------------------------------------------------------------------
// 3. KeyTakeawayBox — summary bullet box at end of section
// -------------------------------------------------------------------------
export interface KeyTakeawayBoxProps {
  title?: string
  items: string[]
}

export function KeyTakeawayBox({ title = 'Key Takeaway', items }: KeyTakeawayBoxProps) {
  return (
    <aside className="my-10 not-prose rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-6 sm:p-7 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_4px_12px_-2px_rgba(90,140,143,0.5)]">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2
              className="h-5 w-5 flex-shrink-0 text-brand-500 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-base leading-relaxed text-slate-800">{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

// -------------------------------------------------------------------------
// 4. WarningBox — amber/rose callout for red flags and common mistakes
// -------------------------------------------------------------------------
export interface WarningBoxProps {
  title: string
  text: string
  tone?: 'warning' | 'danger'
}

export function WarningBox({ title, text, tone = 'warning' }: WarningBoxProps) {
  const toneClasses =
    tone === 'danger'
      ? {
          border: 'border-l-4 border-rose-500',
          bg: 'bg-rose-50/70',
          badgeBg: 'bg-rose-500',
          title: 'text-rose-900',
          body: 'text-rose-900/80',
        }
      : {
          border: 'border-l-4 border-amber-500',
          bg: 'bg-amber-50/70',
          badgeBg: 'bg-amber-500',
          title: 'text-amber-900',
          body: 'text-amber-900/80',
        }

  return (
    <aside
      role="note"
      className={`my-8 not-prose rounded-2xl ${toneClasses.border} ${toneClasses.bg} p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${toneClasses.badgeBg} text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)]`}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className={`font-display font-bold text-lg leading-snug ${toneClasses.title}`}>
            {title}
          </h3>
          <p className={`mt-1.5 text-sm sm:text-base leading-relaxed ${toneClasses.body}`}>
            {text}
          </p>
        </div>
      </div>
    </aside>
  )
}

// -------------------------------------------------------------------------
// 5. ComparisonTable — styled data table with optional highlighted row
// -------------------------------------------------------------------------
export interface ComparisonTableProps {
  headers: string[]
  rows: (string | number)[][]
  /** Zero-based index of a row to highlight as "winner". */
  highlighted?: number
  caption?: string
}

export function ComparisonTable({ headers, rows, highlighted, caption }: ComparisonTableProps) {
  return (
    <div className="my-10 not-prose">
      <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
        <table className="w-full min-w-[640px] text-sm">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <thead className="sticky top-0 bg-slate-900 text-white">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider ${
                    i === 0 ? 'rounded-tl-2xl' : ''
                  } ${i === headers.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const isHighlighted = rIdx === highlighted
              const zebra = rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
              return (
                <tr
                  key={rIdx}
                  className={`${
                    isHighlighted
                      ? 'bg-gradient-to-r from-brand-50 to-brand-100/70 ring-1 ring-inset ring-brand-400'
                      : zebra
                  } border-t border-black/[0.05]`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3.5 align-top leading-relaxed ${
                        cIdx === 0
                          ? isHighlighted
                            ? 'font-semibold text-brand-800'
                            : 'font-semibold text-slate-900'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------
// 6. BeforeAfter — two-column "old way vs new way" comparison
// -------------------------------------------------------------------------
export interface BeforeAfterProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterProps) {
  return (
    <div className="my-10 not-prose grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      {/* Before */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {beforeLabel}
          </span>
        </div>
        <p className="font-display font-semibold text-lg sm:text-xl leading-snug text-slate-500 line-through decoration-slate-400/60 decoration-1">
          {before}
        </p>
      </div>
      {/* Arrow on desktop */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
      {/* After */}
      <div className="relative rounded-2xl border border-brand-300 bg-gradient-to-br from-brand-50 via-white to-brand-50/60 p-6 shadow-[0_8px_24px_-6px_rgba(90,140,143,0.25)]">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
            {afterLabel}
          </span>
        </div>
        <p className="font-display font-bold text-lg sm:text-xl leading-snug text-brand-800 tracking-tight">
          {after}
        </p>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------
// 7. StepByStep — numbered vertical process with connecting line
// -------------------------------------------------------------------------
export interface StepItem {
  title: string
  description: string
}

export interface StepByStepProps {
  steps: StepItem[]
}

export function StepByStep({ steps }: StepByStepProps) {
  return (
    <ol className="my-10 not-prose relative space-y-6">
      {/* Connecting line */}
      <span
        className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-brand-500 via-brand-300 to-brand-100"
        aria-hidden="true"
      />
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-5">
          <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-bold text-base shadow-[0_4px_12px_-2px_rgba(90,140,143,0.45)]">
            {i + 1}
          </span>
          <div className="flex-1 pt-1 pb-2">
            <h3 className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-snug">
              {step.title}
            </h3>
            <p className="mt-1.5 text-base leading-relaxed text-slate-700">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

// -------------------------------------------------------------------------
// 8. StatsTimeline — horizontal bar chart (inline SVG) for progression / funnel
// -------------------------------------------------------------------------
export interface StatsTimelineItem {
  label: string
  value: number
  /** Optional raw-value label shown at bar end (e.g. "500 URLs"). Defaults to value. */
  display?: string
}

export interface StatsTimelineProps {
  data: StatsTimelineItem[]
  /** Accessible title for screen readers. */
  title?: string
}

export function StatsTimeline({ data, title = 'Progression chart' }: StatsTimelineProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  const titleId = useId()

  return (
    <figure className="my-10 not-prose rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-7 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
      <figcaption id={titleId} className="sr-only">
        {title}
      </figcaption>
      <div role="img" aria-labelledby={titleId} className="space-y-4">
        {data.map((item, i) => {
          const pct = Math.max(4, (item.value / max) * 100)
          const display = item.display ?? String(item.value)
          return (
            <div key={i} className="flex items-center gap-4">
              <div className="w-28 sm:w-36 flex-shrink-0 text-sm font-semibold text-slate-700 text-right">
                {item.label}
              </div>
              <div className="flex-1 relative h-8 rounded-lg bg-slate-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-400 rounded-lg transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-slate-900 tabular-nums">
                  {display}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

// -------------------------------------------------------------------------
// 9. CountryCard — country highlight for nearshoring posts
// -------------------------------------------------------------------------
export interface CountryHighlight {
  label: string
  value: string
}

export interface CountryCardProps {
  flag: string // emoji
  country: string
  highlights: CountryHighlight[]
  tagline?: string
}

export function CountryCard({ flag, country, highlights, tagline }: CountryCardProps) {
  return (
    <div className="my-8 not-prose rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] transition-shadow">
      <div className="flex items-start gap-4 mb-5">
        <div className="text-5xl leading-none" aria-hidden="true">
          {flag}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-slate-900 leading-tight">
            {country}
          </h3>
          {tagline && (
            <p className="mt-1 text-sm text-slate-600 leading-snug">{tagline}</p>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="rounded-xl bg-slate-50 px-4 py-3 border border-black/[0.04]"
          >
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {h.label}
            </dt>
            <dd className="mt-1 font-display font-semibold text-base text-slate-900 leading-snug">
              {h.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// -------------------------------------------------------------------------
// 10. ProcessDiagram — simple SVG flow chart with nodes + arrows
// -------------------------------------------------------------------------
export interface DiagramNode {
  id: string
  label: string
  x: number // 0-100 (percent)
  y: number // 0-100 (percent)
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
}

export interface ProcessDiagramProps {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  /** Viewport height in px (width is 100% of container). */
  height?: number
  title?: string
}

export function ProcessDiagram({
  nodes,
  edges,
  height = 280,
  title = 'Process flow diagram',
}: ProcessDiagramProps) {
  const titleId = useId()
  const markerId = useId()
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  // We use a 1000x500 viewBox so node coordinates (0-100) map cleanly to (0-1000, 0-500).
  const VB_W = 1000
  const VB_H = 500
  const NODE_W = 160
  const NODE_H = 64

  return (
    <figure className="my-10 not-prose rounded-2xl border border-black/[0.08] bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
      <figcaption id={titleId} className="sr-only">
        {title}
      </figcaption>
      <svg
        role="img"
        aria-labelledby={titleId}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ height }}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#5E8C8F" />
          </marker>
          <linearGradient id={`${markerId}-node`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EDF4F4" />
            <stop offset="100%" stopColor="#C5E0E2" />
          </linearGradient>
        </defs>

        {/* Edges first so nodes paint on top */}
        {edges.map((e, i) => {
          const from = nodeMap.get(e.from)
          const to = nodeMap.get(e.to)
          if (!from || !to) return null
          const fx = (from.x / 100) * VB_W
          const fy = (from.y / 100) * VB_H
          const tx = (to.x / 100) * VB_W
          const ty = (to.y / 100) * VB_H
          // Shorten the edge so arrow sits outside the node box
          const dx = tx - fx
          const dy = ty - fy
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const pad = NODE_W / 2 + 6
          const x2 = tx - (dx / len) * pad
          const y2 = ty - (dy / len) * (NODE_H / 2 + 6)
          const x1 = fx + (dx / len) * pad
          const y1 = fy + (dy / len) * (NODE_H / 2 + 6)
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#5E8C8F"
                strokeWidth={2.5}
                markerEnd={`url(#${markerId})`}
                strokeLinecap="round"
              />
              {e.label && (
                <g>
                  <rect
                    x={midX - 40}
                    y={midY - 11}
                    width={80}
                    height={22}
                    rx={11}
                    fill="white"
                    stroke="#C5E0E2"
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#2A5C5D"
                  >
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {nodes.map((n, i) => {
          const cx = (n.x / 100) * VB_W
          const cy = (n.y / 100) * VB_H
          return (
            <g key={i}>
              <rect
                x={cx - NODE_W / 2}
                y={cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={16}
                fill={`url(#${markerId}-node)`}
                stroke="#5E8C8F"
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fill="#1A3A3B"
                style={{ fontFamily: 'Inter Tight, Inter, system-ui, sans-serif' }}
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// -------------------------------------------------------------------------
// Optional "section footer" CTA variant used as a fallback export if ever needed.
// Not part of the 10-component spec but kept lightweight for consistency.
// -------------------------------------------------------------------------
export function InlineArrowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  )
}
