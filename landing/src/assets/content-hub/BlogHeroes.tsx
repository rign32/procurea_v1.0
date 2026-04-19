import type React from "react"
import { cn } from "@/lib/utils"

/**
 * Blog Hero Illustrations
 * -----------------------
 * 20 unique SVG illustrations — one per blog post. Each component:
 *   - Renders a 16:9 canvas (1200×675 viewBox)
 *   - Fills its parent via absolute positioning (inset-0)
 *   - Accepts `className` (parent sizing) and optional `title` (typography overlay)
 *   - Uses pillar palette: brand/teal for AI Sourcing, purple for ERP,
 *     emerald for Multilingual, amber for Supplier Intel, rose for Comparison
 *
 * Design language:
 *   - Geometric, not cartoon — B2B procurement audience
 *   - Data-forward: numbers, grids, charts, bars — not abstract art
 *   - Visual metaphor first, typography second
 *   - ~5-7 KB gzipped per component
 *
 * Usage:
 *   <div className="aspect-[16/9] rounded-2xl overflow-hidden">
 *     <HowToFind100SuppliersHero className="w-full h-full" title="..." />
 *   </div>
 */

interface HeroProps {
  className?: string
  /** Optional title overlay rendered in the SVG (large, contrast-aware). */
  title?: string
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function HeroFrame({
  children,
  className,
  bg,
  ariaLabel,
  title,
  titleColor = "rgba(255,255,255,0.95)",
}: {
  children: React.ReactNode
  className?: string
  bg: string
  ariaLabel: string
  title?: string
  titleColor?: string
}) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)} style={{ background: bg }}>
      <svg
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={ariaLabel}
      >
        {children}
        {title && (
          <g>
            <rect x="0" y="560" width="1200" height="115" fill="rgba(0,0,0,0.22)" />
            <text
              x="60"
              y="630"
              fill={titleColor}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="700"
              fontSize="34"
              letterSpacing="-0.5"
            >
              {title.length > 68 ? `${title.slice(0, 65)}…` : title}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* ================================================================== */
/* WAVE 1                                                              */
/* ================================================================== */

/* 1. how-to-find-100-verified-suppliers-in-under-an-hour
   Metaphor: 100 dots converging to a focused circle + clock face */
export function HowToFind100SuppliersHero({ className, title }: HeroProps) {
  const dots = Array.from({ length: 100 }).map((_, i) => {
    // Fibonacci/spiral positions scattered around the canvas
    const angle = i * 137.5 * (Math.PI / 180)
    const r = 30 + Math.sqrt(i) * 32
    const cx = 420 + Math.cos(angle) * r
    const cy = 320 + Math.sin(angle) * r * 0.78
    return { cx, cy, i }
  })
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #4A7174 45%, #1A3A3B 100%)"
      ariaLabel="100 supplier dots converging into focused circle with hourly clock"
      title={title}
    >
      <defs>
        <radialGradient id="w1h1-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="65%" stopColor="rgba(122,173,175,0.6)" />
          <stop offset="100%" stopColor="rgba(122,173,175,0)" />
        </radialGradient>
        <pattern id="w1h1-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60 0 L0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w1h1-grid)" />

      {/* scattered 100 dots */}
      <g>
        {dots.map((d) => (
          <circle
            key={d.i}
            cx={d.cx}
            cy={d.cy}
            r={d.i < 24 ? 4.5 : 2.5}
            fill={d.i < 24 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"}
          />
        ))}
      </g>

      {/* faint connecting arcs pointing to focus core */}
      <g stroke="rgba(255,255,255,0.15)" fill="none" strokeWidth="1">
        {dots.slice(0, 18).map((d) => (
          <line key={d.i} x1={d.cx} y1={d.cy} x2="420" y2="320" />
        ))}
      </g>

      {/* Focused core showing "100" */}
      <g transform="translate(420 320)">
        <circle r="130" fill="url(#w1h1-core)" />
        <circle r="100" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        <text
          textAnchor="middle"
          y="18"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="86"
          letterSpacing="-3"
        >
          100
        </text>
      </g>

      {/* clock / 1h indicator on right */}
      <g transform="translate(930 310)">
        <circle r="140" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
        <circle r="140" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="5"
          strokeDasharray="73 1000" strokeDashoffset="0" transform="rotate(-90)" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
          <line
            key={i}
            x1="0" y1={i % 3 === 0 ? -125 : -130}
            x2="0" y2="-140"
            stroke="rgba(255,255,255,0.7)" strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
            transform={`rotate(${deg})`}
          />
        ))}
        {/* hands */}
        <line x1="0" y1="0" x2="0" y2="-80" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="68" y2="0" stroke="white" strokeWidth="3" strokeLinecap="round"
          transform="rotate(-30)" />
        <circle r="7" fill="white" />
        <text y="58" textAnchor="middle" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="22">
          &lt; 1h
        </text>
      </g>
    </HeroFrame>
  )
}

/* 2. the-30-hour-problem
   Metaphor: Clock "30h" cracking / breaking apart into "20min" */
export function The30HourProblemHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #4A7174 50%, #1A3A3B 100%)"
      ariaLabel="30 hour clock breaking apart into 20 minute target"
      title={title}
    >
      <defs>
        <pattern id="w1h2-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0 L0 0 0 48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w1h2-grid)" />

      {/* left cluster: broken 30h clock */}
      <g transform="translate(340 300)">
        {/* fragmented clock arcs */}
        <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round">
          <path d="M -130 -60 A 160 160 0 0 1 -20 -158" />
          <path d="M 150 -40 A 160 160 0 0 1 110 110" transform="rotate(5)" />
          <path d="M 60 158 A 160 160 0 0 1 -110 110" />
        </g>
        {/* cracks radiating */}
        <g stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <line x1="0" y1="0" x2="-180" y2="-90" />
          <line x1="0" y1="0" x2="170" y2="-20" />
          <line x1="0" y1="0" x2="20" y2="200" />
        </g>
        {/* center text */}
        <circle r="80" fill="rgba(255,255,255,0.08)" />
        <text textAnchor="middle" y="-5" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="70" letterSpacing="-2">
          30h
        </text>
        <text textAnchor="middle" y="30" fill="rgba(255,255,255,0.7)"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="14" letterSpacing="2">
          MANUAL SOURCING
        </text>
      </g>

      {/* arrow to collapsed target */}
      <g stroke="rgba(255,255,255,0.9)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M 540 300 Q 660 260 780 300" markerEnd="url(#arrow-w1h2)" />
      </g>
      <defs>
        <marker id="arrow-w1h2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="white" />
        </marker>
      </defs>

      {/* right: "20min" compact target */}
      <g transform="translate(900 300)">
        <circle r="128" fill="rgba(94,140,143,0.35)" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
        <circle r="88" fill="rgba(255,255,255,0.12)" />
        <circle r="44" fill="rgba(255,255,255,0.25)" />
        <text textAnchor="middle" y="-2" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="54" letterSpacing="-1.5">
          20min
        </text>
        <text textAnchor="middle" y="28" fill="rgba(255,255,255,0.8)"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="13" letterSpacing="2">
          WITH AI
        </text>
      </g>
    </HeroFrame>
  )
}

/* 3. european-nearshoring-guide-2026
   Metaphor: Europe silhouette with highlighted zones, arrows from China */
export function EuropeanNearshoringHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #CDD1B0 0%, #A9B28A 45%, #4C5E3A 100%)"
      ariaLabel="European nearshoring map with arrows from China"
      title={title}
    >
      <defs>
        <pattern id="w1h3-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.18)" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w1h3-dots)" />

      {/* Europe blob shape (stylised) */}
      <g transform="translate(670 340)">
        <path
          d="M -280 -170
             C -240 -200 -160 -190 -120 -180
             C -80 -220 -20 -230 30 -210
             C 90 -200 150 -190 200 -160
             C 250 -130 280 -80 260 -20
             C 280 40 260 110 200 150
             C 150 190 80 200 20 190
             C -40 210 -120 200 -180 170
             C -240 140 -290 80 -290 20
             C -300 -40 -300 -110 -280 -170 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
        />
        {/* country pins — Poland, Turkey, Portugal */}
        <g>
          {/* Poland */}
          <circle cx="-20" cy="-80" r="22" fill="#F5C451" stroke="white" strokeWidth="3" />
          <text x="-20" y="-72" textAnchor="middle" fill="#1A3A3B"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14">PL</text>
          <text x="-20" y="-110" textAnchor="middle" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">Poland</text>

          {/* Portugal */}
          <circle cx="-220" cy="40" r="22" fill="#E7A3BE" stroke="white" strokeWidth="3" />
          <text x="-220" y="48" textAnchor="middle" fill="#1A3A3B"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14">PT</text>
          <text x="-220" y="12" textAnchor="middle" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">Portugal</text>

          {/* Turkey */}
          <circle cx="180" cy="90" r="22" fill="#7AADAF" stroke="white" strokeWidth="3" />
          <text x="180" y="98" textAnchor="middle" fill="#1A3A3B"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14">TR</text>
          <text x="180" y="62" textAnchor="middle" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">Turkey</text>
        </g>
      </g>

      {/* China origin top-right */}
      <g transform="translate(1110 130)">
        <rect x="-56" y="-24" width="112" height="48" rx="24" fill="rgba(0,0,0,0.4)" />
        <text textAnchor="middle" y="6" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16">China</text>
      </g>

      {/* arrows from China curving to Europe */}
      <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8">
        <path d="M 1060 150 Q 850 120 700 240" />
        <path d="M 1060 150 Q 900 170 460 350" />
        <path d="M 1060 150 Q 920 230 870 410" />
      </g>
      <g fill="rgba(255,255,255,0.95)">
        <path d="M 700 240 l -12 -6 l 2 12 z" />
        <path d="M 460 350 l -12 -4 l 0 12 z" />
        <path d="M 870 410 l -10 -8 l -2 12 z" />
      </g>
    </HeroFrame>
  )
}

/* 4. rfq-automation-workflows
   Metaphor: Envelopes flowing into structured grid */
export function RfqAutomationHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #4A7174 100%)"
      ariaLabel="Email envelopes flowing into structured RFQ grid"
      title={title}
    >
      <defs>
        <pattern id="w1h4-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w1h4-grid)" />

      {/* scattered envelopes on left */}
      <g>
        {[
          [100, 120, -15], [60, 240, 10], [140, 340, -8], [40, 420, 20],
          [150, 480, -12], [80, 150, 25], [220, 200, -6], [180, 380, 15],
        ].map(([x, y, rot], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <rect x="-40" y="-24" width="80" height="48" rx="4"
              fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <path d="M -40 -24 L 0 4 L 40 -24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* flow arrows converging */}
      <g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
        <path d="M 260 150 Q 400 250 530 260" />
        <path d="M 280 340 L 530 330" />
        <path d="M 240 440 Q 400 400 530 380" />
      </g>

      {/* structured grid / table on right */}
      <g transform="translate(540 100)">
        <rect width="620" height="480" rx="16"
          fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        {/* header */}
        <rect x="0" y="0" width="620" height="54" rx="16" fill="rgba(255,255,255,0.15)" />
        <text x="30" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16">
          Supplier
        </text>
        <text x="260" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16">
          Price
        </text>
        <text x="380" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16">
          Lead time
        </text>
        <text x="520" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16">
          Score
        </text>

        {/* rows */}
        {[
          [78, "ACME GmbH", "€12.40", "14 days", "92"],
          [138, "Polskie Stal", "€11.80", "10 days", "88"],
          [198, "Karadeniz", "€10.60", "18 days", "84"],
          [258, "Porto Metal", "€12.10", "12 days", "81"],
          [318, "Bohemia Co.", "€13.20", "9 days", "79"],
          [378, "Lyon Forge", "€12.90", "16 days", "76"],
        ].map(([y, n, p, lt, sc], i) => (
          <g key={i}>
            <rect x="0" y={y as number} width="620" height="48"
              fill={i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent"} />
            <text x="30" y={(y as number) + 30} fill="rgba(255,255,255,0.92)"
              fontFamily="Inter, sans-serif" fontWeight="600" fontSize="15">{n}</text>
            <text x="260" y={(y as number) + 30} fill="rgba(255,255,255,0.78)"
              fontFamily="Inter, sans-serif" fontSize="15">{p}</text>
            <text x="380" y={(y as number) + 30} fill="rgba(255,255,255,0.78)"
              fontFamily="Inter, sans-serif" fontSize="15">{lt}</text>
            <g transform={`translate(520 ${(y as number) + 16})`}>
              <rect width="72" height="26" rx="13" fill="rgba(122,173,175,0.45)" />
              <text x="36" y="18" textAnchor="middle" fill="white"
                fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">{sc}</text>
            </g>
          </g>
        ))}
      </g>
    </HeroFrame>
  )
}

/* 5. turkey-vs-poland-vs-portugal-textiles
   Metaphor: 3 columns comparison with textile weave motif */
export function TurkeyPolandPortugalHero({ className, title }: HeroProps) {
  const columns = [
    { label: "Turkey", flag: "#E30A17", score: 86, price: "€3.80", lead: "12d", x: 180 },
    { label: "Poland", flag: "#DC143C", score: 82, price: "€4.20", lead: "8d", x: 540 },
    { label: "Portugal", flag: "#006600", score: 79, price: "€4.60", lead: "10d", x: 900 },
  ]
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #E7A3BE 0%, #C76F96 50%, #7B3A5C 100%)"
      ariaLabel="Three column comparison of Turkey Poland Portugal textiles"
      title={title}
    >
      <defs>
        {/* fabric weave pattern */}
        <pattern id="w1h5-weave" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 12 12 M 12 0 L 0 12" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w1h5-weave)" />

      {columns.map((c, i) => (
        <g key={i} transform={`translate(${c.x} 80)`}>
          <rect width="220" height="400" rx="14"
            fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          {/* flag strip */}
          <rect y="0" width="220" height="6" rx="3" fill={c.flag} />
          {/* country */}
          <text x="110" y="60" textAnchor="middle" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="28">{c.label}</text>
          {/* textile fold icon */}
          <g transform="translate(110 130)">
            <path d="M -50 0 L 50 0 L 40 60 L -40 60 Z"
              fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2" />
            <path d="M -40 20 L 40 20" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M -40 38 L 40 38" stroke="white" strokeWidth="1" opacity="0.5" />
          </g>
          {/* stats */}
          <g transform="translate(0 220)">
            <text x="20" y="0" fill="rgba(255,255,255,0.75)"
              fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="1.5">SCORE</text>
            <text x="20" y="30" fill="white"
              fontFamily="Inter, sans-serif" fontWeight="800" fontSize="30">{c.score}</text>
            <text x="20" y="70" fill="rgba(255,255,255,0.75)"
              fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="1.5">PRICE/M</text>
            <text x="20" y="100" fill="white"
              fontFamily="Inter, sans-serif" fontWeight="700" fontSize="22">{c.price}</text>
            <text x="20" y="140" fill="rgba(255,255,255,0.75)"
              fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="1.5">LEAD TIME</text>
            <text x="20" y="170" fill="white"
              fontFamily="Inter, sans-serif" fontWeight="700" fontSize="22">{c.lead}</text>
          </g>
        </g>
      ))}

      {/* VS badges between columns */}
      {[420, 780].map((x, i) => (
        <g key={i} transform={`translate(${x} 280)`}>
          <circle r="26" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2" />
          <text textAnchor="middle" y="6" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16">VS</text>
        </g>
      ))}
    </HeroFrame>
  )
}

/* ================================================================== */
/* WAVE 2                                                              */
/* ================================================================== */

/* 6. vat-vies-verification-3-minute-check
   Metaphor: Shield with "VAT" + 3-min timer */
export function VatViesVerificationHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #F5C451 0%, #D69722 50%, #8F5E0E 100%)"
      ariaLabel="VAT VIES verification shield with 3-minute timer"
      title={title}
    >
      <defs>
        <pattern id="w2h6-hatch" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h6-hatch)" />

      {/* Big shield with VAT */}
      <g transform="translate(420 310)">
        <path
          d="M 0 -200 L 160 -140 L 160 40 C 160 130 90 190 0 220 C -90 190 -160 130 -160 40 L -160 -140 Z"
          fill="rgba(255,255,255,0.16)"
          stroke="white"
          strokeWidth="3"
        />
        <text textAnchor="middle" y="-30" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="76" letterSpacing="-2">VAT</text>
        <path d="M -60 50 L -15 95 L 70 0"
          fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <text textAnchor="middle" y="170" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" letterSpacing="3">VERIFIED VIA VIES</text>
      </g>

      {/* 3-min timer circle */}
      <g transform="translate(920 310)">
        <circle r="150" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" />
        {/* progress arc - ~18% (3/60) */}
        <circle r="150" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="6"
          strokeDasharray="170 1000" transform="rotate(-90)" strokeLinecap="round" />
        {/* tick marks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i}
            x1="0" y1={-140} x2="0" y2={-128}
            stroke="rgba(255,255,255,0.6)" strokeWidth="2"
            transform={`rotate(${i * 30})`} />
        ))}
        <text textAnchor="middle" y="-10" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="78" letterSpacing="-3">3</text>
        <text textAnchor="middle" y="35" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="20" letterSpacing="3">MINUTES</text>
      </g>
    </HeroFrame>
  )
}

/* 7. ai-procurement-software-7-features-2026
   Metaphor: 7 feature tiles on radar dashboard; inline lucide-style SVG icons */
export function AiProcurement7FeaturesHero({ className, title }: HeroProps) {
  // Inline path-based glyph per feature (lucide-inspired, 24-unit viewbox centered on 0,0)
  const Icon = ({ kind }: { kind: string }) => {
    const s = "rgba(255,255,255,0.98)"
    const w = 1.8
    switch (kind) {
      case "search": // magnifier
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="-2" cy="-2" r="7" />
            <path d="M 3.2 3.2 L 8 8" />
          </g>
        )
      case "mail": // envelope
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <rect x="-9" y="-6" width="18" height="12" rx="2" />
            <path d="M -9 -5 L 0 2 L 9 -5" />
          </g>
        )
      case "compare": // scale / double-arrow
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M -8 -3 L 8 -3 M 4 -6 L 8 -3 L 4 0" />
            <path d="M 8 4 L -8 4 M -4 1 L -8 4 L -4 7" />
          </g>
        )
      case "shield-check": // shield with check
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 0 -9 L 8 -6 L 8 2 C 8 6 4 9 0 10 C -4 9 -8 6 -8 2 L -8 -6 Z" />
            <path d="M -3.5 0 L -1 2.5 L 4 -2.5" />
          </g>
        )
      case "sync": // rotate / sync arrows
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 8 -3 A 8 8 0 1 0 8 4" />
            <path d="M 8 -7 L 8 -3 L 4 -3" />
            <path d="M -8 7 L -8 3 L -4 3" />
          </g>
        )
      case "chart": // bar chart
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M -8 8 L 8 8" />
            <rect x="-6" y="0" width="3" height="8" />
            <rect x="-1" y="-4" width="3" height="12" />
            <rect x="4" y="-7" width="3" height="15" />
          </g>
        )
      case "send": // paper plane / outreach
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9 -8 L -8 -1 L -1 1 L 2 8 Z" />
            <path d="M 9 -8 L -1 1" />
          </g>
        )
      default:
        return null
    }
  }

  // 7 features on circle of radius R around center (600,330), starting at top
  const R = 230
  const kinds = ["search", "mail", "compare", "shield-check", "sync", "chart", "send"]
  const labels = ["Sourcing", "RFQ", "Compare", "Verify", "ERP Sync", "Score", "Outreach"]
  const features = kinds.map((kind, i) => {
    const a = ((i * 360) / 7 - 90) * (Math.PI / 180)
    return {
      x: 600 + Math.cos(a) * R,
      y: 330 + Math.sin(a) * R,
      kind,
      label: labels[i],
    }
  })

  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #4A7174 50%, #1A3A3B 100%)"
      ariaLabel="Seven AI procurement features arranged as radar dashboard"
      title={title}
    >
      <defs>
        <radialGradient id="w2h7-radar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(122,173,175,0.35)" />
          <stop offset="100%" stopColor="rgba(122,173,175,0)" />
        </radialGradient>
        <pattern id="w2h7-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h7-grid)" />

      {/* concentric rings */}
      <g transform="translate(600 330)" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1">
        <circle r="90" />
        <circle r="160" />
        <circle r="230" />
        <circle r="300" />
      </g>
      <circle cx="600" cy="330" r="300" fill="url(#w2h7-radar)" />

      {/* radar sweep arc */}
      <g transform="translate(600 330)">
        <path
          d="M 0 0 L 300 0 A 300 300 0 0 0 212 -212 Z"
          fill="rgba(245,196,81,0.12)"
          stroke="rgba(245,196,81,0.3)"
          strokeWidth="1"
        />
      </g>

      {/* 7 rays */}
      <g transform="translate(600 330)" stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        {Array.from({ length: 7 }).map((_, i) => {
          const a = ((i * 360) / 7 - 90) * (Math.PI / 180)
          return (
            <line key={i} x1="0" y1="0"
              x2={Math.cos(a) * 300} y2={Math.sin(a) * 300} />
          )
        })}
      </g>

      {/* center hub — AI badge */}
      <g transform="translate(600 330)">
        <circle r="74" fill="rgba(245,196,81,0.22)" stroke="#F5C451" strokeWidth="2.5" />
        <circle r="58" fill="rgba(26,58,59,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
        <text textAnchor="middle" y="-2" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="34" letterSpacing="-1">AI</text>
        <text textAnchor="middle" y="22" fill="rgba(255,255,255,0.8)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11" letterSpacing="2">7 FEATURES</text>
      </g>

      {/* feature nodes around the ring */}
      {features.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          {/* outer accent ring */}
          <circle r="36" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
          {/* icon disc */}
          <circle r="28" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
          <Icon kind={f.kind} />
          {/* label pill */}
          <g transform="translate(0 58)">
            <rect x="-48" y="-14" width="96" height="28" rx="14"
              fill="rgba(15,23,43,0.55)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            <text textAnchor="middle" y="5" fill="white"
              fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13">{f.label}</text>
          </g>
        </g>
      ))}
    </HeroFrame>
  )
}

/* 8. supplier-risk-management-2026
   Metaphor: Shield with 5 risk axes radiating out; inline lucide-style SVG icons */
export function SupplierRiskManagementHero({ className, title }: HeroProps) {
  // Risk axis glyphs as pure SVG paths
  const RiskIcon = ({ kind }: { kind: string }) => {
    const s = "white"
    const w = 2
    switch (kind) {
      case "financial": // trending down / bar with arrow
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M -8 -6 L -3 -1 L 1 -4 L 8 3" />
            <path d="M 4 3 L 8 3 L 8 -1" />
          </g>
        )
      case "operations": // gear
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="0" r="3.2" />
            <path d="M 0 -8 L 0 -5 M 0 5 L 0 8 M -8 0 L -5 0 M 5 0 L 8 0 M -5.6 -5.6 L -3.5 -3.5 M 3.5 3.5 L 5.6 5.6 M 5.6 -5.6 L 3.5 -3.5 M -3.5 3.5 L -5.6 5.6" />
          </g>
        )
      case "geopolitical": // globe
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="0" r="8" />
            <path d="M -8 0 L 8 0" />
            <path d="M 0 -8 C 4 -4 4 4 0 8 C -4 4 -4 -4 0 -8 Z" />
          </g>
        )
      case "esg": // leaf
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 8 -8 C 8 4 4 8 -4 8 C -8 8 -8 4 -8 0 C -8 -6 0 -8 8 -8 Z" />
            <path d="M -6 6 L 6 -6" />
          </g>
        )
      case "cyber": // lock
        return (
          <g fill="none" stroke={s} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
            <rect x="-6" y="-1" width="12" height="9" rx="1.5" />
            <path d="M -4 -1 L -4 -5 A 4 4 0 0 1 4 -5 L 4 -1" />
            <circle cx="0" cy="3.5" r="1" fill={s} stroke="none" />
          </g>
        )
      default:
        return null
    }
  }

  // 5 axes radiating from shield center (600,330), endpoints on circle
  const cx = 600
  const cy = 330
  const axes = [
    { kind: "financial", label: "FINANCIAL", sub: "Credit & liquidity", score: 92, angle: -90 },
    { kind: "operations", label: "OPERATIONS", sub: "Delivery & quality", score: 78, angle: -18 },
    { kind: "geopolitical", label: "GEOPOLITICAL", sub: "Country & trade", score: 64, angle: 54 },
    { kind: "esg", label: "ESG", sub: "Compliance", score: 86, angle: 126 },
    { kind: "cyber", label: "CYBER", sub: "Data & IT", score: 71, angle: 198 },
  ]

  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #F5C451 0%, #D69722 50%, #5C3D08 100%)"
      ariaLabel="Supplier risk shield with five radiating risk axes"
      title={title}
    >
      <defs>
        <pattern id="w2h8-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0 L0 0 0 36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
        <radialGradient id="w2h8-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h8-grid)" />

      {/* soft glow behind shield */}
      <circle cx={cx} cy={cy} r="300" fill="url(#w2h8-glow)" />

      {/* concentric reference circles for "radar" feel */}
      <g transform={`translate(${cx} ${cy})`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1">
        <circle r="150" />
        <circle r="220" />
        <circle r="290" strokeDasharray="3 6" />
      </g>

      {/* axis connector lines — endpoint radius modulated by score (risk endpoint sizing) */}
      <g stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeDasharray="4 5" fill="none">
        {axes.map((a, i) => {
          const rad = (a.angle * Math.PI) / 180
          const endR = 230 + (100 - a.score) * 0.6
          return (
            <line
              key={i}
              x1={cx + Math.cos(rad) * 90}
              y1={cy + Math.sin(rad) * 90}
              x2={cx + Math.cos(rad) * endR}
              y2={cy + Math.sin(rad) * endR}
            />
          )
        })}
      </g>

      {/* Central shield */}
      <g transform={`translate(${cx} ${cy})`}>
        {/* outer shield outline */}
        <path
          d="M 0 -155 L 130 -110 L 130 30 C 130 110 70 160 0 180 C -70 160 -130 110 -130 30 L -130 -110 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="white"
          strokeWidth="3"
        />
        {/* inner shield accent */}
        <path
          d="M 0 -130 L 108 -92 L 108 25 C 108 92 60 135 0 152 C -60 135 -108 92 -108 25 L -108 -92 Z"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        {/* check mark */}
        <path d="M -38 8 L -8 38 L 44 -22"
          fill="none" stroke="white" strokeWidth="10"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* caption */}
        <text textAnchor="middle" y="80" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14" letterSpacing="3">RISK MONITORING</text>
        <text textAnchor="middle" y="108" fill="rgba(255,255,255,0.8)"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="2">5 DIMENSIONS</text>
      </g>

      {/* axis endpoint cards with icon + label + score chip */}
      {axes.map((a, i) => {
        const rad = (a.angle * Math.PI) / 180
        const endR = 230 + (100 - a.score) * 0.6
        const ex = cx + Math.cos(rad) * endR
        const ey = cy + Math.sin(rad) * endR
        // card anchoring offset based on angle quadrant to avoid shield overlap
        const right = Math.cos(rad) >= 0
        const down = Math.sin(rad) >= 0
        const cardOffsetX = right ? 24 : -24 - 170
        const cardOffsetY = down ? 24 : -24 - 72
        // icon disc sized by risk (lower score = larger dot = higher risk emphasis)
        const discR = 22 + (100 - a.score) * 0.12
        return (
          <g key={i}>
            {/* endpoint disc */}
            <g transform={`translate(${ex} ${ey})`}>
              <circle r={discR + 4} fill="rgba(255,255,255,0.15)" />
              <circle r={discR} fill="rgba(26,58,59,0.75)" stroke="white" strokeWidth="2" />
              <RiskIcon kind={a.kind} />
            </g>
            {/* label card */}
            <g transform={`translate(${ex + cardOffsetX} ${ey + cardOffsetY})`}>
              <rect width="170" height="72" rx="12"
                fill="rgba(15,23,43,0.7)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <text x="16" y="26" fill="white"
                fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" letterSpacing="1.4">{a.label}</text>
              <text x="16" y="46" fill="rgba(255,255,255,0.72)"
                fontFamily="Inter, sans-serif" fontWeight="500" fontSize="11">{a.sub}</text>
              {/* score chip */}
              <g transform="translate(120 44)">
                <rect x="0" y="0" width="40" height="20" rx="10"
                  fill={a.score >= 80 ? "rgba(122,173,175,0.85)" : a.score >= 70 ? "rgba(245,196,81,0.9)" : "rgba(231,110,110,0.9)"} />
                <text x="20" y="14" textAnchor="middle" fill="#1A3A3B"
                  fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12">{a.score}</text>
              </g>
            </g>
          </g>
        )
      })}
    </HeroFrame>
  )
}

/* 9. german-manufacturer-sourcing
   Metaphor: German flag motif + factory icons + translate symbol */
export function GermanManufacturerHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #3A4B5E 0%, #2B3A47 50%, #1A2530 100%)"
      ariaLabel="German manufacturer sourcing with flag and factory icons"
      title={title}
    >
      <defs>
        <pattern id="w2h9-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0 L0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h9-grid)" />

      {/* German flag ribbon top */}
      <g>
        <rect x="0" y="60" width="1200" height="26" fill="#000" />
        <rect x="0" y="86" width="1200" height="26" fill="#DD0000" />
        <rect x="0" y="112" width="1200" height="26" fill="#FFCE00" />
      </g>

      {/* Factory cluster */}
      <g transform="translate(270 460)" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2.5">
        {/* factory 1 */}
        <path d="M 0 0 L 0 -80 L 40 -80 L 40 -120 L 80 -80 L 80 0 Z" />
        <rect x="10" y="-30" width="20" height="30" fill="rgba(255,255,255,0.4)" />
        <rect x="50" y="-50" width="20" height="20" fill="rgba(255,255,255,0.4)" />
        {/* factory 2 */}
        <path d="M 110 0 L 110 -100 L 150 -130 L 190 -100 L 190 0 Z" />
        <rect x="130" y="-50" width="20" height="20" fill="rgba(255,255,255,0.4)" />
        <rect x="160" y="-50" width="20" height="20" fill="rgba(255,255,255,0.4)" />
        {/* chimney */}
        <rect x="56" y="-170" width="16" height="50" fill="white" />
      </g>

      {/* Badge: "Made in Germany" */}
      <g transform="translate(720 320)">
        <rect x="-170" y="-50" width="340" height="100" rx="12"
          fill="rgba(255,255,255,0.14)" stroke="white" strokeWidth="2" />
        <text textAnchor="middle" y="-10" fill="rgba(255,255,255,0.75)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" letterSpacing="3">MADE IN</text>
        <text textAnchor="middle" y="26" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="34" letterSpacing="-0.5">GERMANY</text>
      </g>

      {/* Translate bubble */}
      <g transform="translate(1000 250)">
        <rect x="-70" y="-32" width="140" height="64" rx="14"
          fill="rgba(122,173,175,0.25)" stroke="rgba(122,173,175,0.9)" strokeWidth="2" />
        <text x="-40" y="6" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18">EN</text>
        <path d="M -10 0 L 10 0 M 2 -8 L 10 0 L 2 8"
          stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="36" y="6" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18">DE</text>
      </g>
    </HeroFrame>
  )
}

/* 10. rfq-comparison-template-buyers-use
   Metaphor: Spreadsheet with scoring formula visualisation */
export function RfqComparisonTemplateHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #E7A3BE 0%, #C76F96 50%, #5C2543 100%)"
      ariaLabel="RFQ comparison spreadsheet template with scoring formula"
      title={title}
    >
      <defs>
        <pattern id="w2h10-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0 L0 0 0 28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h10-grid)" />

      {/* Spreadsheet */}
      <g transform="translate(100 120)">
        <rect width="750" height="440" rx="16"
          fill="rgba(255,255,255,0.94)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        {/* header row */}
        <rect width="750" height="46" rx="16" fill="#1A3A3B" />
        {["Criterion", "Weight", "Supplier A", "Supplier B", "Supplier C"].map((h, i) => (
          <text key={i} x={30 + i * 144} y="30" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13">{h}</text>
        ))}
        {/* data rows */}
        {[
          ["Price", "40%", "9.2", "8.4", "7.8"],
          ["Quality", "25%", "8.5", "9.1", "8.7"],
          ["Lead time", "15%", "7.8", "8.9", "8.2"],
          ["References", "10%", "9.0", "7.5", "8.4"],
          ["Certifications", "10%", "8.8", "8.2", "9.3"],
        ].map((row, i) => (
          <g key={i}>
            <rect x="0" y={54 + i * 56} width="750" height="56"
              fill={i % 2 === 0 ? "rgba(231,163,190,0.1)" : "white"} />
            {row.map((cell, j) => (
              <text key={j} x={30 + j * 144} y={54 + i * 56 + 34}
                fill={j === 0 ? "#1A3A3B" : "#4A5568"}
                fontFamily="Inter, sans-serif" fontWeight={j === 0 ? "700" : "500"} fontSize="14">
                {cell}
              </text>
            ))}
          </g>
        ))}
        {/* total row */}
        <rect x="0" y="340" width="750" height="60" fill="#C76F96" />
        <text x="30" y="378" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16">TOTAL</text>
        <text x="318" y="378" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18">8.72</text>
        <text x="462" y="378" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18">8.48</text>
        <text x="606" y="378" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18">8.16</text>
      </g>

      {/* Formula block */}
      <g transform="translate(900 280)">
        <rect x="-140" y="-90" width="280" height="180" rx="14"
          fill="rgba(0,0,0,0.45)" stroke="white" strokeWidth="1.5" />
        <text textAnchor="middle" y="-55" fill="rgba(255,255,255,0.75)"
          fontFamily="JetBrains Mono, monospace" fontWeight="600" fontSize="11" letterSpacing="2">FORMULA</text>
        <text textAnchor="middle" y="-20" fill="white"
          fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="16">Σ(score × weight)</text>
        <line x1="-100" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.4)" />
        <text textAnchor="middle" y="38" fill="rgba(231,163,190,1)"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="36">8.72</text>
        <text textAnchor="middle" y="68" fill="rgba(255,255,255,0.7)"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="2">WEIGHTED SCORE</text>
      </g>
    </HeroFrame>
  )
}

/* 11. china-plus-one-strategy
   Metaphor: Origin (China) + 1 arrow branching to 5 alt countries */
export function ChinaPlusOneHero({ className, title }: HeroProps) {
  const alts = [
    { x: 730, y: 150, label: "Vietnam" },
    { x: 870, y: 260, label: "India" },
    { x: 910, y: 420, label: "Mexico" },
    { x: 810, y: 530, label: "Poland" },
    { x: 680, y: 580, label: "Turkey" },
  ]
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #CDD1B0 0%, #7A8A5E 60%, #3D4A2B 100%)"
      ariaLabel="China plus one strategy branching to five alternative countries"
      title={title}
    >
      <defs>
        <pattern id="w2h11-dot" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.15)" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h11-dot)" />

      {/* China origin big circle */}
      <g transform="translate(290 360)">
        <circle r="140" fill="rgba(227,10,23,0.25)" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
        <circle r="100" fill="rgba(227,10,23,0.45)" />
        <text textAnchor="middle" y="-5" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="38" letterSpacing="-1">China</text>
        <text textAnchor="middle" y="30" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" letterSpacing="2">ORIGIN</text>
      </g>

      {/* "+1" badge between */}
      <g transform="translate(520 360)">
        <circle r="50" fill="white" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        <text textAnchor="middle" y="14" fill="#2B3A47"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1">+1</text>
      </g>

      {/* diverging arrows */}
      <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round">
        {alts.map((a, i) => (
          <path key={i} d={`M 570 360 Q ${(570 + a.x) / 2} ${(360 + a.y) / 2 - 30} ${a.x} ${a.y}`} />
        ))}
      </g>

      {/* alt country chips */}
      {alts.map((a, i) => (
        <g key={i} transform={`translate(${a.x} ${a.y})`}>
          <circle r="38" fill="rgba(94,140,143,0.45)" stroke="white" strokeWidth="2.5" />
          <text textAnchor="middle" y="6" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">{a.label}</text>
        </g>
      ))}
    </HeroFrame>
  )
}

/* 12. vendor-scoring-10-criteria
   Metaphor: Scorecard with 10 criteria bars filling up */
export function VendorScoring10CriteriaHero({ className, title }: HeroProps) {
  const criteria = [
    { label: "Price", fill: 88 },
    { label: "Quality", fill: 94 },
    { label: "Lead time", fill: 82 },
    { label: "References", fill: 76 },
    { label: "Certifications", fill: 90 },
    { label: "Financial stability", fill: 68 },
    { label: "ESG compliance", fill: 72 },
    { label: "Communication", fill: 85 },
    { label: "Capacity", fill: 79 },
    { label: "Warranty", fill: 64 },
  ]
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #F5C451 0%, #D69722 50%, #5C3D08 100%)"
      ariaLabel="Vendor scoring scorecard with 10 criteria bars"
      title={title}
    >
      <defs>
        <pattern id="w2h12-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h12-grid)" />

      {/* title on right */}
      <g transform="translate(960 290)">
        <circle r="120" fill="rgba(255,255,255,0.14)" stroke="white" strokeWidth="3" />
        <text textAnchor="middle" y="-8" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="76" letterSpacing="-3">10</text>
        <text textAnchor="middle" y="28" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="15" letterSpacing="2">CRITERIA</text>
      </g>

      {/* 10 horizontal bars */}
      <g transform="translate(100 100)">
        {criteria.map((c, i) => {
          const y = i * 45
          return (
            <g key={i} transform={`translate(0 ${y})`}>
              <text x="0" y="24" fill="rgba(255,255,255,0.92)"
                fontFamily="Inter, sans-serif" fontWeight="600" fontSize="14">{c.label}</text>
              <rect x="220" y="8" width="420" height="24" rx="12"
                fill="rgba(0,0,0,0.3)" />
              <rect x="220" y="8" width={420 * (c.fill / 100)} height="24" rx="12"
                fill="white" />
              <text x={220 + 420 * (c.fill / 100) - 10} y="26" textAnchor="end"
                fill="#8F5E0E" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13">
                {c.fill}
              </text>
            </g>
          )
        })}
      </g>
    </HeroFrame>
  )
}

/* 13. supplier-certifications-guide
   Metaphor: Stacked certification badges (ISO, IATF, FDA) with verify check */
export function SupplierCertificationsHero({ className, title }: HeroProps) {
  const badges = [
    { x: 340, y: 280, label: "ISO 9001", sub: "Quality", color: "#F5C451" },
    { x: 500, y: 200, label: "IATF 16949", sub: "Automotive", color: "#7AADAF" },
    { x: 660, y: 280, label: "ISO 14001", sub: "Environment", color: "#A9B28A" },
    { x: 500, y: 400, label: "FDA", sub: "US Market", color: "#E7A3BE" },
    { x: 340, y: 440, label: "CE", sub: "EU Market", color: "#C4A7E7" },
    { x: 660, y: 440, label: "REACH", sub: "Chemicals", color: "#E9A26C" },
  ]
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #F5C451 0%, #D69722 50%, #5C3D08 100%)"
      ariaLabel="Supplier certification badges stacked with verify check"
      title={title}
    >
      <defs>
        <pattern id="w2h13-hatch" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w2h13-hatch)" />

      {/* scattered badges */}
      {badges.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          {/* hex-ish rounded badge */}
          <circle r="58" fill={b.color} stroke="white" strokeWidth="3" opacity="0.95" />
          <circle r="46" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="2 4" />
          <text textAnchor="middle" y="-2" fill="#1A3A3B"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14">{b.label}</text>
          <text textAnchor="middle" y="18" fill="rgba(26,58,59,0.7)"
            fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11">{b.sub}</text>
        </g>
      ))}

      {/* verify checkmark big on right */}
      <g transform="translate(940 330)">
        <circle r="130" fill="rgba(255,255,255,0.14)" stroke="white" strokeWidth="3" />
        <path d="M -55 10 L -15 55 L 60 -35"
          fill="none" stroke="white" strokeWidth="14"
          strokeLinecap="round" strokeLinejoin="round" />
        <text textAnchor="middle" y="100" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="15" letterSpacing="3">VERIFIED</text>
      </g>
    </HeroFrame>
  )
}

/* ================================================================== */
/* WAVE 3                                                              */
/* ================================================================== */

/* 14. supplier-database-stale-40-percent
   Metaphor: Database cylinder with 40% decaying/crumbling */
export function SupplierDatabaseStaleHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #4C3A7A 0%, #2E2259 50%, #1A1640 100%)"
      ariaLabel="Database cylinder with 40 percent stale data visualization"
      title={title}
    >
      <defs>
        <pattern id="w3h14-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0 L0 0 0 36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
        <linearGradient id="w3h14-decay" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8F5E0E" />
          <stop offset="100%" stopColor="#D69722" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h14-grid)" />

      {/* Database cylinder */}
      <g transform="translate(420 170)">
        {/* top ellipse */}
        <ellipse cx="160" cy="0" rx="160" ry="40" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2.5" />
        {/* body */}
        <path d="M 0 0 L 0 340 A 160 40 0 0 0 320 340 L 320 0" fill="rgba(122,173,175,0.3)" />
        {/* bottom ellipse */}
        <ellipse cx="160" cy="340" rx="160" ry="40" fill="rgba(122,173,175,0.5)" stroke="white" strokeWidth="2.5" />
        {/* side lines */}
        <line x1="0" y1="0" x2="0" y2="340" stroke="white" strokeWidth="2.5" />
        <line x1="320" y1="0" x2="320" y2="340" stroke="white" strokeWidth="2.5" />
        {/* horizontal band dividers */}
        <ellipse cx="160" cy="120" rx="160" ry="40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="4 4" />
        <ellipse cx="160" cy="220" rx="160" ry="40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="4 4" />

        {/* 40% decaying layer (bottom portion) */}
        <path d="M 0 204 L 0 340 A 160 40 0 0 0 320 340 L 320 204 A 160 40 0 0 1 0 204"
          fill="url(#w3h14-decay)" opacity="0.7" />

        {/* cracks */}
        <g stroke="rgba(255,220,150,0.9)" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M 60 230 L 90 260 L 80 300 L 110 330" />
          <path d="M 200 220 L 230 270 L 210 310" />
          <path d="M 260 250 L 290 300" />
        </g>
      </g>

      {/* 40% big label */}
      <g transform="translate(960 330)">
        <text textAnchor="middle" fill="#F5C451"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="170" letterSpacing="-6"
          y="30">
          40%
        </text>
        <text textAnchor="middle" y="80" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" letterSpacing="3">STALE PER YEAR</text>
      </g>
    </HeroFrame>
  )
}

/* 15. netsuite-supplier-management
   Metaphor: NetSuite-style vendor record with sync arrows */
export function NetSuiteSupplierHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #4C3A7A 0%, #5E4B8F 50%, #2E2259 100%)"
      ariaLabel="NetSuite vendor record card with sync arrows"
      title={title}
    >
      <defs>
        <pattern id="w3h15-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h15-dots)" />

      {/* left card — Procurea */}
      <g transform="translate(100 160)">
        <rect width="380" height="360" rx="16"
          fill="rgba(255,255,255,0.96)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
        <rect width="380" height="54" rx="16" fill="#5E8C8F" />
        <text x="24" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16">
          Procurea · Supplier
        </text>
        {/* fields */}
        {[
          ["Name", "Stal-Pro GmbH"],
          ["VAT", "DE123456789"],
          ["Score", "88 / 100"],
          ["Contact", "schmidt@stalpro.de"],
          ["Country", "Germany"],
          ["Certification", "ISO 9001, IATF"],
        ].map(([k, v], i) => (
          <g key={i} transform={`translate(24 ${86 + i * 42})`}>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="1">
              {k.toUpperCase()}
            </text>
            <text y="20" fill="#1A3A3B" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="14">{v}</text>
          </g>
        ))}
      </g>

      {/* sync arrows */}
      <g transform="translate(600 340)" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
        <path d="M -60 -30 L 60 -30" />
        <path d="M 40 -50 L 60 -30 L 40 -10" strokeLinejoin="round" />
        <path d="M 60 30 L -60 30" />
        <path d="M -40 10 L -60 30 L -40 50" strokeLinejoin="round" />
      </g>
      <text x="600" y="260" textAnchor="middle" fill="rgba(255,255,255,0.8)"
        fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" letterSpacing="3">TWO-WAY SYNC</text>

      {/* right card — NetSuite */}
      <g transform="translate(720 160)">
        <rect width="380" height="360" rx="16"
          fill="rgba(255,255,255,0.96)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
        <rect width="380" height="54" rx="16" fill="#2E2259" />
        <text x="24" y="34" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16">
          NetSuite · Vendor
        </text>
        {[
          ["Vendor ID", "V-00284"],
          ["Tax ID", "DE123456789"],
          ["Rating", "A"],
          ["Primary email", "schmidt@stalpro.de"],
          ["Subsidiary", "EMEA"],
          ["Category", "Raw Materials"],
        ].map(([k, v], i) => (
          <g key={i} transform={`translate(24 ${86 + i * 42})`}>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="1">
              {k.toUpperCase()}
            </text>
            <text y="20" fill="#1A3A3B" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="14">{v}</text>
          </g>
        ))}
      </g>
    </HeroFrame>
  )
}

/* 16. sap-ariba-alternative-procurement
   Metaphor: Side-by-side comparison — enterprise complexity (left) vs mid-market focus (right) */
export function SapAribaAlternativeHero({ className, title }: HeroProps) {
  // Left cluster: dense tangled network of nodes (enterprise complexity)
  // Deterministic pseudo-random seed → no Math.random in render
  const leftNodes = [
    { x: 90, y: 180 }, { x: 150, y: 260 }, { x: 70, y: 330 }, { x: 160, y: 400 },
    { x: 95, y: 470 }, { x: 220, y: 200 }, { x: 250, y: 340 }, { x: 210, y: 480 },
    { x: 310, y: 250 }, { x: 320, y: 420 }, { x: 380, y: 330 }, { x: 290, y: 160 },
  ]
  const leftEdges: [number, number][] = [
    [0, 1], [1, 2], [1, 3], [3, 4], [0, 5], [5, 6], [6, 7],
    [1, 6], [5, 8], [6, 10], [7, 9], [8, 10], [9, 10], [3, 6],
    [2, 4], [5, 11], [8, 11], [2, 3], [4, 7], [9, 7], [6, 8],
  ]

  // Right side: clean linear flow with 4 nodes
  const rightNodes = [
    { x: 720, y: 320, label: "Sourcing" },
    { x: 860, y: 320, label: "RFQ" },
    { x: 1000, y: 320, label: "Compare" },
    { x: 1140, y: 320, label: "Award" },
  ]

  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #1A3A3B 50%, #0F2527 100%)"
      ariaLabel="SAP Ariba alternative — enterprise complexity vs mid-market clarity"
      title={title}
    >
      <defs>
        <pattern id="w3h16-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
        <linearGradient id="w3h16-leftFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="w3h16-rightGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(245,196,81,0)" />
          <stop offset="100%" stopColor="rgba(245,196,81,0.14)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h16-grid)" />

      {/* background tinting for each side */}
      <rect x="0" y="0" width="560" height="675" fill="url(#w3h16-leftFade)" />
      <rect x="640" y="0" width="560" height="675" fill="url(#w3h16-rightGlow)" />

      {/* Vertical divider */}
      <g transform="translate(600 0)">
        <line x1="0" y1="40" x2="0" y2="635" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 8" />
        <g transform="translate(0 338)">
          <circle r="36" fill="rgba(15,23,43,0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text textAnchor="middle" y="6" fill="rgba(255,255,255,0.9)"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16" letterSpacing="1">VS</text>
        </g>
      </g>

      {/* ============ LEFT: Enterprise (muted, complex) ============ */}
      {/* tangled edges */}
      <g stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none">
        {leftEdges.map(([a, b], i) => (
          <line key={i}
            x1={leftNodes[a].x} y1={leftNodes[a].y}
            x2={leftNodes[b].x} y2={leftNodes[b].y} />
        ))}
      </g>
      {/* dollar/cost spray — small $ glyphs rendered as coin-shape paths (no unicode $ in text nodes actually fine; keep as plain text) */}
      <g>
        {leftNodes.map((n, i) => (
          <g key={i} transform={`translate(${n.x} ${n.y})`}>
            <circle r="10" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
            <circle r="4" fill="rgba(255,255,255,0.55)" />
          </g>
        ))}
      </g>
      {/* cost callout */}
      <g transform="translate(260 560)">
        <rect x="-130" y="-30" width="260" height="60" rx="10"
          fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <text x="-110" y="-4" fill="rgba(255,255,255,0.65)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10" letterSpacing="2">IMPLEMENTATION</text>
        <text x="-110" y="20" fill="rgba(255,255,255,0.95)"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22" letterSpacing="-0.5">6–18 months</text>
        <text x="120" y="18" textAnchor="end" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13">50+ modules</text>
      </g>

      {/* Left side header */}
      <g transform="translate(80 100)">
        <text fill="rgba(255,255,255,0.55)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" letterSpacing="3">ENTERPRISE PATH</text>
        <g transform="translate(0 28)">
          <text fill="rgba(255,255,255,0.85)"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="36" letterSpacing="-1">SAP Ariba</text>
          {/* strikethrough */}
          <line x1="-6" y1="-10" x2="196" y2="-10" stroke="#F5C451" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* ============ RIGHT: Procurea (clean, focused) ============ */}
      {/* linear flow line */}
      <g>
        <line x1="720" y1="320" x2="1140" y2="320"
          stroke="rgba(245,196,81,0.85)" strokeWidth="2.5" strokeLinecap="round" />
        {/* arrow heads */}
        {rightNodes.slice(0, -1).map((n, i) => (
          <g key={i} transform={`translate(${(n.x + rightNodes[i + 1].x) / 2} 320)`}
            fill="#F5C451">
            <path d="M -6 -6 L 6 0 L -6 6 Z" />
          </g>
        ))}
      </g>
      {/* clean nodes */}
      {rightNodes.map((n, i) => (
        <g key={i} transform={`translate(${n.x} ${n.y})`}>
          <circle r="30" fill="rgba(245,196,81,0.18)" stroke="#F5C451" strokeWidth="2" />
          <circle r="18" fill="rgba(26,58,59,0.95)" stroke="#F5C451" strokeWidth="1.5" />
          <text textAnchor="middle" y="5" fill="#F5C451"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14">{i + 1}</text>
          <text textAnchor="middle" y="58" fill="rgba(255,255,255,0.95)"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13">{n.label}</text>
        </g>
      ))}

      {/* Right side header — "THE ALTERNATIVE" + Procurea */}
      <g transform="translate(1120 100)">
        <text textAnchor="end" fill="#F5C451"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" letterSpacing="3">MID-MARKET PATH</text>
        <text y="32" textAnchor="end" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="36" letterSpacing="-1">Procurea</text>
      </g>

      {/* Right-side cost/speed callout */}
      <g transform="translate(940 560)">
        <rect x="-200" y="-30" width="400" height="60" rx="10"
          fill="rgba(245,196,81,0.14)" stroke="#F5C451" strokeWidth="1.5" />
        <text x="-180" y="-4" fill="#F5C451"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10" letterSpacing="2">TIME TO VALUE</text>
        <text x="-180" y="20" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22" letterSpacing="-0.5">Days, not months</text>
        <text x="180" y="18" textAnchor="end" fill="rgba(255,255,255,0.9)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13">1 focused workflow</text>
      </g>
    </HeroFrame>
  )
}

/* 17. tco-beat-lowest-price-trap
   Metaphor: Iceberg — tip = price, bulk = hidden costs */
export function TcoIcebergHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(180deg, #5E8C8F 0%, #4A7174 40%, #0F172B 100%)"
      ariaLabel="TCO iceberg metaphor with hidden costs below waterline"
      title={title}
    >
      {/* waterline */}
      <line x1="0" y1="260" x2="1200" y2="260" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeDasharray="12 8" />
      <text x="40" y="250" fill="rgba(255,255,255,0.7)"
        fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13" letterSpacing="2">WATERLINE · UNIT PRICE</text>

      {/* iceberg tip (above) */}
      <g transform="translate(600 260)">
        <path d="M -80 0 L -30 -130 L 40 -90 L 90 0 Z"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(255,255,255,1)" strokeWidth="2" />
        <text textAnchor="middle" y="-40" fill="#1A3A3B"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22">Price</text>
        <text textAnchor="middle" y="-18" fill="#4A5568"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="12">visible</text>
      </g>

      {/* iceberg bulk (below) */}
      <g transform="translate(600 260)">
        <path d="M -200 0 L -250 120 L -180 240 L -90 320 L 90 330 L 190 280 L 260 180 L 200 40 L 90 0 Z"
          fill="rgba(122,173,175,0.35)"
          stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

        {/* hidden cost labels inside */}
        {[
          { x: -140, y: 80, label: "Shipping" },
          { x: 80, y: 90, label: "Customs" },
          { x: -80, y: 170, label: "Quality failure" },
          { x: 140, y: 180, label: "Lead time risk" },
          { x: -30, y: 260, label: "Warranty & rework" },
        ].map((h, i) => (
          <g key={i} transform={`translate(${h.x} ${h.y})`}>
            <rect x="-70" y="-14" width="140" height="28" rx="14"
              fill="rgba(0,0,0,0.38)" />
            <text textAnchor="middle" y="5" fill="white"
              fontFamily="Inter, sans-serif" fontWeight="600" fontSize="12">{h.label}</text>
          </g>
        ))}
      </g>

      {/* TCO label on right */}
      <g transform="translate(1050 400)">
        <rect x="-90" y="-50" width="180" height="100" rx="14"
          fill="rgba(245,196,81,0.25)" stroke="#F5C451" strokeWidth="2" />
        <text textAnchor="middle" y="-15" fill="#F5C451"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" letterSpacing="3">TRUE TCO</text>
        <text textAnchor="middle" y="25" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="38" letterSpacing="-1">+42%</text>
      </g>
    </HeroFrame>
  )
}

/* 18. sourcing-funnel-explained
   Metaphor: 5-step funnel with 500→120→40→15→3 */
export function SourcingFunnelHero({ className, title }: HeroProps) {
  const steps = [
    { w: 880, y: 130, n: "500", label: "Searched", c: "#7AADAF" },
    { w: 720, y: 220, n: "120", label: "Screened", c: "#5E8C8F" },
    { w: 560, y: 310, n: "40", label: "Qualified", c: "#4A7174" },
    { w: 360, y: 400, n: "15", label: "RFQ sent", c: "#2A5C5D" },
    { w: 180, y: 490, n: "3", label: "Shortlist", c: "#F5C451" },
  ]
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #1A3A3B 50%, #0F2527 100%)"
      ariaLabel="Sourcing funnel 500 to 120 to 40 to 15 to 3"
      title={title}
    >
      <defs>
        <pattern id="w3h18-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h18-grid)" />

      {steps.map((s, i) => (
        <g key={i} transform={`translate(${600 - s.w / 2} ${s.y})`}>
          <rect width={s.w} height="70" rx="35" fill={s.c}
            opacity={0.88} stroke="white" strokeWidth="1.5" />
          <text x="38" y="44" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="34">{s.n}</text>
          <text x={s.w - 38} y="44" textAnchor="end" fill="rgba(255,255,255,0.92)"
            fontFamily="Inter, sans-serif" fontWeight="600" fontSize="16">{s.label}</text>
        </g>
      ))}

      {/* drop arrows between */}
      {steps.slice(0, -1).map((_, i) => (
        <g key={i} transform={`translate(600 ${steps[i].y + 74})`} fill="rgba(255,255,255,0.55)">
          <path d="M -8 0 L 8 0 L 0 16 Z" />
        </g>
      ))}
    </HeroFrame>
  )
}

/* 19. salesforce-for-procurement
   Metaphor: Salesforce-cloud shape with procurement arrows */
export function SalesforceProcurementHero({ className, title }: HeroProps) {
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #4C3A7A 0%, #5E4B8F 50%, #2E2259 100%)"
      ariaLabel="Salesforce cloud with procurement arrows flowing in"
      title={title}
    >
      <defs>
        <pattern id="w3h19-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h19-grid)" />

      {/* cloud shape */}
      <g transform="translate(600 320)">
        <path
          d="M -180 60 C -220 60 -240 20 -220 -10 C -230 -50 -190 -80 -150 -70 C -140 -120 -60 -140 -10 -110 C 30 -160 120 -140 130 -80 C 180 -80 210 -40 190 0 C 220 20 200 70 150 70 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="white"
          strokeWidth="3"
        />
        <text textAnchor="middle" y="-20" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="28">Salesforce</text>
        <text textAnchor="middle" y="10" fill="rgba(255,255,255,0.82)"
          fontFamily="Inter, sans-serif" fontWeight="600" fontSize="14" letterSpacing="2">+ PROCUREMENT</text>
      </g>

      {/* incoming procurement chips */}
      {[
        { x: 120, y: 140, label: "Supplier" },
        { x: 140, y: 300, label: "RFQ" },
        { x: 120, y: 460, label: "PO" },
        { x: 1080, y: 140, label: "Contract" },
        { x: 1060, y: 300, label: "Payment" },
        { x: 1080, y: 460, label: "Invoice" },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y})`}>
          <rect x="-60" y="-22" width="120" height="44" rx="22"
            fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <text textAnchor="middle" y="6" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14">{c.label}</text>
        </g>
      ))}

      {/* arrows pointing inward to cloud */}
      <g fill="none" stroke="rgba(245,196,81,0.8)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5">
        <path d="M 190 150 Q 340 200 420 280" />
        <path d="M 210 300 L 420 310" />
        <path d="M 190 450 Q 340 400 420 340" />
        <path d="M 1010 150 Q 860 210 780 290" />
        <path d="M 990 300 L 780 320" />
        <path d="M 1010 450 Q 860 400 780 350" />
      </g>
    </HeroFrame>
  )
}

/* 20. buyers-guide-12-questions-ai-sourcing
   Metaphor: 12 question bubbles arranged around center */
export function BuyersGuide12QuestionsHero({ className, title }: HeroProps) {
  const bubbles = Array.from({ length: 12 }).map((_, i) => {
    const angle = ((i * 360) / 12 - 90) * (Math.PI / 180)
    const r = 220
    return {
      x: 600 + Math.cos(angle) * r,
      y: 320 + Math.sin(angle) * r * 0.78,
      n: i + 1,
    }
  })
  return (
    <HeroFrame
      className={className}
      bg="linear-gradient(135deg, #2A5C5D 0%, #4A7174 50%, #1A3A3B 100%)"
      ariaLabel="Twelve question bubbles around central guide"
      title={title}
    >
      <defs>
        <pattern id="w3h20-dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width="1200" height="675" fill="url(#w3h20-dots)" />

      {/* faint connector lines */}
      <g stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" strokeDasharray="2 5">
        {bubbles.map((b, i) => (
          <line key={i} x1="600" y1="320" x2={b.x} y2={b.y} />
        ))}
      </g>

      {/* bubbles with question marks */}
      {bubbles.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <circle r="40" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <text textAnchor="middle" y="-3" fill="rgba(255,255,255,0.7)"
            fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10" letterSpacing="2">Q{b.n}</text>
          <text textAnchor="middle" y="22" fill="white"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24">?</text>
        </g>
      ))}

      {/* center "12" */}
      <g transform="translate(600 320)">
        <circle r="110" fill="rgba(245,196,81,0.2)" stroke="#F5C451" strokeWidth="3" />
        <circle r="84" fill="rgba(255,255,255,0.12)" />
        <text textAnchor="middle" y="4" fill="white"
          fontFamily="Inter, sans-serif" fontWeight="900" fontSize="84" letterSpacing="-4">12</text>
        <text textAnchor="middle" y="42" fill="rgba(255,255,255,0.85)"
          fontFamily="Inter, sans-serif" fontWeight="700" fontSize="13" letterSpacing="3">QUESTIONS</text>
      </g>
    </HeroFrame>
  )
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const BLOG_HEROES: Record<string, React.FC<HeroProps>> = {
  // Wave 1
  'how-to-find-100-verified-suppliers-in-under-an-hour': HowToFind100SuppliersHero,
  'the-30-hour-problem': The30HourProblemHero,
  'european-nearshoring-guide-2026': EuropeanNearshoringHero,
  'rfq-automation-workflows': RfqAutomationHero,
  'turkey-vs-poland-vs-portugal-textiles': TurkeyPolandPortugalHero,
  // Wave 2
  'vat-vies-verification-3-minute-check': VatViesVerificationHero,
  'ai-procurement-software-7-features-2026': AiProcurement7FeaturesHero,
  'supplier-risk-management-2026': SupplierRiskManagementHero,
  'german-manufacturer-sourcing': GermanManufacturerHero,
  'rfq-comparison-template-buyers-use': RfqComparisonTemplateHero,
  'china-plus-one-strategy': ChinaPlusOneHero,
  'vendor-scoring-10-criteria': VendorScoring10CriteriaHero,
  'supplier-certifications-guide': SupplierCertificationsHero,
  // Wave 3
  'supplier-database-stale-40-percent': SupplierDatabaseStaleHero,
  'netsuite-supplier-management': NetSuiteSupplierHero,
  'sap-ariba-alternative-procurement': SapAribaAlternativeHero,
  'tco-beat-lowest-price-trap': TcoIcebergHero,
  'sourcing-funnel-explained': SourcingFunnelHero,
  'salesforce-for-procurement': SalesforceProcurementHero,
  'buyers-guide-12-questions-ai-sourcing': BuyersGuide12QuestionsHero,
}

export default BLOG_HEROES
