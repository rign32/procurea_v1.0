import type { ReactElement } from "react"
import {
  Dynamics365Logo,
  NetSuiteLogo,
  ProcureaMark,
  SalesforceLogo,
  SapLogo,
} from "./BrandLogos"

/**
 * Hero constellation — Procurea in the middle + 4 flagship ERP/CRM logos
 * orbiting on a single ring. Kept light on animation: just data particles
 * flowing on 4 connection lines + a pulsing center halo. No foreignObject,
 * no stars, no rotating rings — so it stays smooth on low-end devices.
 */

const CX = 500
const CY = 400
const R = 240

type LogoDef = {
  angle: number // degrees (-90 = top, 0 = right, 90 = bottom, 180 = left)
  Logo: (p: Record<string, unknown>) => ReactElement
  w: number
  brandAccent: string
  label: string
}

const LOGOS: LogoDef[] = [
  { angle: -90, Logo: SapLogo, w: 200, brandAccent: "#0057A7", label: "SAP" },
  { angle: 0, Logo: SalesforceLogo, w: 200, brandAccent: "#00A1E0", label: "Salesforce" },
  { angle: 90, Logo: Dynamics365Logo, w: 220, brandAccent: "#0078D4", label: "Dynamics 365" },
  { angle: 180, Logo: NetSuiteLogo, w: 200, brandAccent: "#C74634", label: "NetSuite" },
]

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function LogoTile({ angle, Logo, w, brandAccent, label }: LogoDef) {
  const { x, y } = polar(angle, R)
  const h = w * 0.5
  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`}>
      {/* Soft shadow */}
      <ellipse cx={w / 2} cy={h + 6} rx={w / 2 - 8} ry="6" fill="#0B1324" opacity="0.1" />
      {/* Card */}
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="14"
        fill="#fff"
        stroke="rgba(11, 19, 36, 0.08)"
        strokeWidth="1"
      />
      {/* Brand accent bar */}
      <rect x="0" y="0" width={w} height="3" rx="1.5" fill={brandAccent} opacity="0.9" />
      {/* Logo — nested <svg> at this position */}
      <svg
        x="8"
        y="6"
        width={w - 16}
        height={h - 12}
        viewBox="0 0 160 80"
        preserveAspectRatio="xMidYMid meet"
        aria-label={label}
      >
        <Logo />
      </svg>
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
    <div className="relative w-full max-w-[560px] mx-auto" aria-hidden="true">
      {/* Soft ambient glow behind the svg */}
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
            <stop offset="100%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="haloGlow" cx={CX} cy={CY} r="150" gradientUnits="userSpaceOnUse">
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
          strokeOpacity="0.18"
          strokeWidth="1.5"
          strokeDasharray="4 10"
        />

        {/* Connection lines */}
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
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )
        })}

        {/* Data particles (bidirectional for featured) — 8 total, spread across the cycle */}
        {LOGOS.map((l, i) => {
          const { x, y } = polar(l.angle, R)
          const dur = 3.4
          return (
            <g key={`p-${i}`}>
              <DataParticle x1={CX} y1={CY} x2={x} y2={y} duration={dur} delay={i * 0.85} />
              <DataParticle x1={x} y1={y} x2={CX} y2={CY} duration={dur} delay={i * 0.85 + dur / 2} />
            </g>
          )
        })}

        {/* Center glow */}
        <circle cx={CX} cy={CY} r="150" fill="url(#haloGlow)" />

        {/* Pulsing halo */}
        <circle cx={CX} cy={CY} r="110" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.3" strokeWidth="1.5">
          <animate attributeName="r" values="100;135;100" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.45;0.05;0.45" dur="3.6s" repeatCount="indefinite" />
        </circle>

        {/* Procurea mark */}
        <g transform={`translate(${CX - 62}, ${CY - 62})`}>
          <circle cx="62" cy="62" r="72" fill="hsl(var(--ds-accent))" opacity="0.12" />
          <svg width="124" height="124" viewBox="0 0 100 100">
            <ProcureaMark />
          </svg>
        </g>

        {/* Logo tiles on the ring */}
        {LOGOS.map((l) => (
          <LogoTile key={l.label} {...l} />
        ))}
      </svg>
    </div>
  )
}
