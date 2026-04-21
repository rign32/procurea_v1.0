import type { ReactElement } from "react"
import { motion } from "framer-motion"
import {
  Dynamics365Logo,
  MicrosoftLogo,
  NetSuiteLogo,
  OdooLogo,
  OracleLogo,
  ProcureaMark,
  QuickBooksLogo,
  SageLogo,
  SalesforceLogo,
  SapLogo,
  XeroLogo,
} from "./BrandLogos"

/**
 * Cinematic hero visual — Procurea in the middle, 10 orbiting ERP/CRM logos
 * on three concentric rings, with animated data flow and rotating ring
 * decorations. Pure SVG + CSS animations + Framer Motion for entrance stagger.
 */

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const CX = 900
const CY = 500

type Ring = {
  r: number
  logos: Array<{
    angle: number // degrees, 0 = right, 90 = down (SVG coords)
    logo: (p: any) => ReactElement
    w: number
    name: string
    brandAccent: string
    featured?: boolean
  }>
}

// Inner ring — flagship 4
const innerRing: Ring = {
  r: 230,
  logos: [
    { angle: -90, logo: SapLogo, w: 220, name: "SAP S/4HANA", brandAccent: "#003F72", featured: true },
    { angle: 0, logo: SalesforceLogo, w: 220, name: "Salesforce", brandAccent: "#00A1E0" },
    { angle: 90, logo: Dynamics365Logo, w: 240, name: "Dynamics 365", brandAccent: "#0078D4" },
    { angle: 180, logo: NetSuiteLogo, w: 220, name: "NetSuite", brandAccent: "#C74634" },
  ],
}

// Middle ring — 4 systems
const middleRing: Ring = {
  r: 400,
  logos: [
    { angle: -45, logo: OracleLogo, w: 180, name: "Oracle Fusion Cloud", brandAccent: "#C74634" },
    { angle: -135, logo: MicrosoftLogo, w: 200, name: "Microsoft", brandAccent: "#00A4EF" },
    { angle: 45, logo: QuickBooksLogo, w: 180, name: "QuickBooks", brandAccent: "#2CA01C" },
    { angle: 135, logo: XeroLogo, w: 180, name: "Xero", brandAccent: "#13B5EA" },
  ],
}

// Outer ring — 2 systems + "+ 50 more" badge
const outerRing: Ring = {
  r: 560,
  logos: [
    { angle: -20, logo: SageLogo, w: 160, name: "Sage Intacct", brandAccent: "#00D639" },
    { angle: 200, logo: OdooLogo, w: 160, name: "Odoo", brandAccent: "#714B67" },
  ],
}

function polarToXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

/* ══════════ Logo tile (entrance animated + float loop) ══════════ */

function LogoTile({
  x,
  y,
  w,
  Logo,
  name,
  brandAccent,
  featured,
  delay,
  floatDuration,
}: {
  x: number
  y: number
  w: number
  Logo: (p: any) => ReactElement
  name: string
  brandAccent: string
  featured?: boolean
  delay: number
  floatDuration: number
}) {
  const h = w * 0.5
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform={`translate(${x - w / 2}, ${y - h / 2})`}>
          {/* Soft shadow */}
          <rect
            x="3"
            y={h - 2}
            width={w - 6}
            height="12"
            rx="6"
            fill="#0B1324"
            opacity="0.08"
            filter="blur(8px)"
          />
          {/* Card */}
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            rx="18"
            fill="#fff"
            stroke={featured ? brandAccent : "rgba(11, 19, 36, 0.08)"}
            strokeWidth={featured ? 2 : 1}
          />
          {/* Brand accent bar at top */}
          <rect x="0" y="0" width={w} height="3" rx="1.5" fill={brandAccent} opacity="0.9" />
          {/* Logo itself */}
          <foreignObject x="10" y="6" width={w - 20} height={h - 14}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Logo width="100%" height="100%" preserveAspectRatio="xMidYMid meet" title={name} />
            </div>
          </foreignObject>
        </g>
      </motion.g>
    </motion.g>
  )
}

/* ══════════ Data particle traveling a connection line ══════════ */

function DataParticle({ x1, y1, x2, y2, duration, delay, reverse }: {
  x1: number
  y1: number
  x2: number
  y2: number
  duration: number
  delay: number
  reverse?: boolean
}) {
  const path = reverse ? `M ${x2},${y2} L ${x1},${y1}` : `M ${x1},${y1} L ${x2},${y2}`
  return (
    <g>
      {/* Glow trail */}
      <circle r="5" fill="hsl(var(--ds-accent))" opacity="0.2" filter="blur(4px)">
        <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
        <animate attributeName="opacity" values="0;0.3;0" dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      {/* Core */}
      <circle r="3" fill="hsl(var(--ds-accent))">
        <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
    </g>
  )
}

/* ══════════ Background star ══════════ */

function Star({ x, y, size, baseDelay }: { x: number; y: number; size: number; baseDelay: number }) {
  return (
    <circle cx={x} cy={y} r={size} fill="hsl(var(--ds-accent))" opacity="0.3">
      <animate
        attributeName="opacity"
        values="0.1;0.6;0.1"
        dur={`${3 + (baseDelay % 4)}s`}
        begin={`${baseDelay}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

/* ══════════ Main component ══════════ */

export function IntegrationConstellation() {
  // Pre-computed star positions (deterministic, don't re-render on state changes)
  const stars = Array.from({ length: 38 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280
    const rnd = (s: number) => ((s * 9301 + 49297) % 233280) / 233280
    return {
      x: rnd(seed) * 1800,
      y: rnd(seed + 17) * 1000,
      size: 1 + rnd(seed + 31) * 1.4,
      delay: rnd(seed + 47) * 5,
    }
  })

  const allRings = [innerRing, middleRing, outerRing]
  const connections: Array<{ x1: number; y1: number; x2: number; y2: number; ringIdx: number; logoIdx: number }> = []
  allRings.forEach((ring, ringIdx) => {
    ring.logos.forEach((l, logoIdx) => {
      const { x, y } = polarToXY(l.angle, ring.r)
      connections.push({ x1: CX, y1: CY, x2: x, y2: y, ringIdx, logoIdx })
    })
  })

  return (
    <div className="relative w-full">
      {/* Ambient glows — positioned absolutely BEHIND the svg */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full blur-[120px] opacity-30"
          style={{ background: "radial-gradient(circle, hsl(var(--ds-accent)) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[30%] aspect-square rounded-full blur-[90px] opacity-[0.15]"
          style={{ background: "radial-gradient(circle, #0078D4 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[15%] left-[8%] w-[28%] aspect-square rounded-full blur-[90px] opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #C74634 0%, transparent 70%)" }}
        />
      </div>

      <svg
        viewBox="0 0 1800 1000"
        className="relative w-full h-auto"
        style={{ aspectRatio: "1800 / 1000" }}
        aria-hidden="true"
      >
        <defs>
          {/* Line gradients — from center (accent) fading to each ring */}
          <radialGradient id="lineGradient" cx={CX} cy={CY} r="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.45" />
            <stop offset="50%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.04" />
          </radialGradient>

          <radialGradient id="centerGlow" cx={CX} cy={CY} r="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.35" />
            <stop offset="70%" stopColor="hsl(var(--ds-accent))" stopOpacity="0.0" />
          </radialGradient>

          {/* Ring stroke — gradient around the circumference */}
          <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(var(--ds-accent))" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="hsl(var(--ds-accent))" stopOpacity="0.08" />
            <stop offset="1" stopColor="hsl(var(--ds-accent))" stopOpacity="0.35" />
          </linearGradient>

          {/* Mesh grid for subtle texture */}
          <pattern id="mesh" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.04" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Subtle mesh grid background */}
        <rect x="0" y="0" width="1800" height="1000" fill="url(#mesh)" />

        {/* Twinkling stars */}
        {stars.map((s, i) => (
          <Star key={`s-${i}`} x={s.x} y={s.y} size={s.size} baseDelay={s.delay} />
        ))}

        {/* Center glow */}
        <circle cx={CX} cy={CY} r="260" fill="url(#centerGlow)" />

        {/* Rotating dashed outer ring — purely decorative */}
        <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: "spin-cw 180s linear infinite" }}>
          <circle
            cx={CX}
            cy={CY}
            r={outerRing.r}
            fill="none"
            stroke="url(#ringStroke)"
            strokeWidth="1.5"
            strokeDasharray="2 18"
          />
        </g>

        {/* Rotating middle ring (counter-clockwise) */}
        <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: "spin-ccw 240s linear infinite" }}>
          <circle
            cx={CX}
            cy={CY}
            r={middleRing.r}
            fill="none"
            stroke="url(#ringStroke)"
            strokeWidth="1.2"
            strokeDasharray="3 14"
          />
        </g>

        {/* Inner ring — static */}
        <circle
          cx={CX}
          cy={CY}
          r={innerRing.r}
          fill="none"
          stroke="hsl(var(--ds-accent))"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />

        {/* Connection lines — from center to each logo */}
        {connections.map((c, i) => (
          <line
            key={`conn-${i}`}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke="url(#lineGradient)"
            strokeWidth={c.ringIdx === 0 ? 1.8 : 1.2}
            strokeLinecap="round"
            strokeDasharray={c.ringIdx === 0 ? "none" : "2 8"}
          />
        ))}

        {/* Data particles — multiple per line, staggered, both directions for featured */}
        {connections.map((c, i) => {
          const isInner = c.ringIdx === 0
          const speed = isInner ? 2.6 : c.ringIdx === 1 ? 3.6 : 4.4
          return (
            <g key={`p-${i}`}>
              <DataParticle x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} duration={speed} delay={(i * 0.25) % speed} />
              {isInner && (
                <DataParticle
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  duration={speed * 1.3}
                  delay={((i + 2) * 0.3) % (speed * 1.3)}
                  reverse
                />
              )}
            </g>
          )
        })}

        {/* Ring logos */}
        {allRings.flatMap((ring, ringIdx) =>
          ring.logos.map((l, logoIdx) => {
            const { x, y } = polarToXY(l.angle, ring.r)
            const delay = 0.25 + ringIdx * 0.18 + logoIdx * 0.07
            return (
              <LogoTile
                key={`${ringIdx}-${logoIdx}`}
                x={x}
                y={y}
                w={l.w}
                Logo={l.logo}
                name={l.name}
                brandAccent={l.brandAccent}
                featured={l.featured}
                delay={delay}
                floatDuration={4 + (ringIdx + logoIdx) * 0.3}
              />
            )
          })
        )}

        {/* "+ 50 more" badge on outer ring */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {(() => {
            const { x, y } = polarToXY(90, outerRing.r)
            const w = 180
            const h = 64
            return (
              <g transform={`translate(${x - w / 2}, ${y - h / 2})`}>
                <rect x="3" y={h - 2} width={w - 6} height="10" rx="5" fill="#0B1324" opacity="0.08" filter="blur(6px)" />
                <rect x="0" y="0" width={w} height={h} rx="16" fill="#fff" stroke="hsl(var(--ds-accent))" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 4" />
                <text
                  x={w / 2}
                  y={h / 2 - 4}
                  textAnchor="middle"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize="18"
                  fontWeight="800"
                  fill="hsl(var(--ds-accent))"
                >
                  + 50 more
                </text>
                <text
                  x={w / 2}
                  y={h / 2 + 16}
                  textAnchor="middle"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize="10"
                  fontWeight="700"
                  fill="#64748B"
                  letterSpacing="1.5"
                >
                  {isEN ? "VIA MERGE.DEV" : "PRZEZ MERGE.DEV"}
                </text>
              </g>
            )
          })()}
        </motion.g>

        {/* Center — Procurea with multi-layer pulsing halo */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* Halo ring 1 */}
          <circle cx={CX} cy={CY} r="140" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.2" strokeWidth="1">
            <animate attributeName="r" values="130;170;130" dur="4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.4;0.05;0.4" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Halo ring 2 */}
          <circle cx={CX} cy={CY} r="120" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.25" strokeWidth="1.5">
            <animate attributeName="r" values="115;155;115" dur="4s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.45;0.08;0.45" dur="4s" begin="1s" repeatCount="indefinite" />
          </circle>
          {/* Soft halo fill */}
          <circle cx={CX} cy={CY} r="110" fill="hsl(var(--ds-accent))" opacity="0.14" />
          {/* Inner disc */}
          <circle cx={CX} cy={CY} r="95" fill="hsl(var(--ds-accent))" opacity="0.1" />
          {/* Procurea mark */}
          <g transform={`translate(${CX - 72}, ${CY - 72})`}>
            <ProcureaMark width="144" height="144" />
          </g>
        </motion.g>
      </svg>

      {/* Scoped keyframes for ring rotation */}
      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
