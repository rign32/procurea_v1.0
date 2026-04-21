import type { ReactElement } from "react"
import {
  Dynamics365Logo,
  MicrosoftLogo,
  NetSuiteLogo,
  OracleLogo,
  ProcureaMark,
  QuickBooksLogo,
  SalesforceLogo,
  SapLogo,
  XeroLogo,
} from "./BrandLogos"

/**
 * Hero constellation — Procurea in the middle + 8 ERP/CRM logos
 * orbiting on a single ring. Light on animation: just data particles
 * flowing on 8 connection lines + a pulsing center halo.
 * Logos rendered directly (not wrapped in another <svg>) to avoid
 * clipping bugs in nested-svg rendering.
 */

const CX = 500
const CY = 400
const R = 280

type LogoDef = {
  angle: number
  Logo: (p: Record<string, unknown>) => ReactElement
  w: number
  brandAccent: string
  label: string
  featured?: boolean
}

// 8 logos around the ring — cardinal points = flagship, diagonals = next-tier
const LOGOS: LogoDef[] = [
  { angle: -90, Logo: SapLogo, w: 150, brandAccent: "#0057A7", label: "SAP", featured: true },
  { angle: -45, Logo: OracleLogo, w: 140, brandAccent: "#C74634", label: "Oracle" },
  { angle: 0, Logo: SalesforceLogo, w: 150, brandAccent: "#00A1E0", label: "Salesforce", featured: true },
  { angle: 45, Logo: QuickBooksLogo, w: 140, brandAccent: "#2CA01C", label: "QuickBooks" },
  { angle: 90, Logo: Dynamics365Logo, w: 160, brandAccent: "#0078D4", label: "Dynamics 365", featured: true },
  { angle: 135, Logo: XeroLogo, w: 140, brandAccent: "#13B5EA", label: "Xero" },
  { angle: 180, Logo: NetSuiteLogo, w: 150, brandAccent: "#C74634", label: "NetSuite", featured: true },
  { angle: -135, Logo: MicrosoftLogo, w: 140, brandAccent: "#00A4EF", label: "Microsoft" },
]

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function LogoTile({ angle, Logo, w, brandAccent, label, featured }: LogoDef) {
  const { x, y } = polar(angle, R)
  const h = w * 0.5
  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`}>
      <ellipse cx={w / 2} cy={h + 6} rx={w / 2 - 6} ry="5" fill="#0B1324" opacity="0.08" />
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="12"
        fill="#fff"
        stroke={featured ? brandAccent : "rgba(11, 19, 36, 0.1)"}
        strokeWidth={featured ? 1.5 : 1}
        strokeOpacity={featured ? 0.4 : 1}
      />
      <rect x="0" y="0" width={w} height="2.5" rx="1.25" fill={brandAccent} opacity="0.9" />
      {/* Render Logo directly via spread props — no wrapper svg → no clipping */}
      <Logo
        x={8}
        y={5}
        width={w - 16}
        height={h - 10}
        preserveAspectRatio="xMidYMid meet"
        aria-label={label}
      />
    </g>
  )
}

function DataParticle({ x1, y1, x2, y2, duration, delay }: {
  x1: number
  y1: number
  x2: number
  y2: number
  duration: number
  delay: number
}) {
  const path = `M ${x1},${y1} L ${x2},${y2}`
  return (
    <>
      <circle r="4" fill="hsl(var(--ds-accent))" opacity="0.3" style={{ filter: "blur(3px)" }}>
        <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
        <animate
          attributeName="opacity"
          values="0;0.35;0"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
      <circle r="2.5" fill="hsl(var(--ds-accent))">
        <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.15;0.85;1"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    </>
  )
}

export function IntegrationConstellation() {
  return (
    <div className="relative w-full max-w-[600px] mx-auto" aria-hidden="true">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--ds-accent) / 0.12) 0%, transparent 60%)",
        }}
      />

      <svg viewBox="0 0 1000 800" className="relative w-full h-auto">
        <defs>
          <radialGradient id="lineFade" cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id="haloGlow" cx={CX} cy={CY} r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--ds-accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="hsl(var(--ds-accent))"
          strokeOpacity="0.15"
          strokeWidth="1.5"
          strokeDasharray="4 10"
        />

        {/* Connection lines — center to each logo */}
        {LOGOS.map((l, i) => {
          const { x, y } = polar(l.angle, R)
          return (
            <line
              key={`line-${i}`}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="url(#lineFade)"
              strokeWidth={l.featured ? 1.6 : 1.2}
              strokeLinecap="round"
            />
          )
        })}

        {/* Data particles — one per line + reverse on featured, heavily staggered */}
        {LOGOS.map((l, i) => {
          const { x, y } = polar(l.angle, R)
          const dur = 3.8
          return (
            <g key={`p-${i}`}>
              <DataParticle x1={CX} y1={CY} x2={x} y2={y} duration={dur} delay={(i * 0.55) % dur} />
              {l.featured && (
                <DataParticle
                  x1={x}
                  y1={y}
                  x2={CX}
                  y2={CY}
                  duration={dur * 1.2}
                  delay={((i * 0.55) + dur / 2) % (dur * 1.2)}
                />
              )}
            </g>
          )
        })}

        {/* Center glow */}
        <circle cx={CX} cy={CY} r="160" fill="url(#haloGlow)" />

        {/* Pulsing halo */}
        <circle cx={CX} cy={CY} r="120" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.3" strokeWidth="1.5">
          <animate attributeName="r" values="108;145;108" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.45;0.05;0.45" dur="3.6s" repeatCount="indefinite" />
        </circle>

        {/* Procurea mark (direct prop spread, no wrapper svg) */}
        <g transform={`translate(${CX - 60}, ${CY - 60})`}>
          <circle cx="60" cy="60" r="70" fill="hsl(var(--ds-accent))" opacity="0.12" />
          <ProcureaMark x={0} y={0} width={120} height={120} aria-label="Procurea" />
        </g>

        {/* Logo tiles on the ring */}
        {LOGOS.map((l) => (
          <LogoTile key={l.label} {...l} />
        ))}
      </svg>
    </div>
  )
}
