import { Dynamics365Logo, MicrosoftLogo, NetSuiteLogo, OdooLogo, OracleLogo, ProcureaMark, QuickBooksLogo, SalesforceLogo, SapLogo, XeroLogo } from "./BrandLogos"

/**
 * Hero visual — Procurea in the middle, 10 orbiting ERP/CRM logos
 * connected by animated arcs. Static SVG, pure CSS for pulse.
 */
export function IntegrationConstellation() {
  // Positions around center (500, 300) in viewBox 1000×600
  // Two orbits: inner (R=180) 4 logos, outer (R=280) 6 logos
  const inner = [
    { x: 500, y: 120, logo: SapLogo, w: 120 },
    { x: 680, y: 220, logo: SalesforceLogo, w: 140 },
    { x: 680, y: 380, logo: Dynamics365Logo, w: 150 },
    { x: 500, y: 480, logo: NetSuiteLogo, w: 130 },
  ]
  const outer = [
    { x: 170, y: 170, logo: OracleLogo, w: 120 },
    { x: 120, y: 340, logo: MicrosoftLogo, w: 130 },
    { x: 220, y: 500, logo: QuickBooksLogo, w: 120 },
    { x: 800, y: 500, logo: XeroLogo, w: 110 },
    { x: 860, y: 340, logo: OdooLogo, w: 110 },
    { x: 320, y: 230, logo: null, w: 0 }, // placeholder for visual balance; connection only
  ]

  const cx = 500
  const cy = 300

  return (
    <div className="relative w-full max-w-[1000px] mx-auto aspect-[5/3]">
      <svg viewBox="0 0 1000 600" className="w-full h-full" aria-hidden="true">
        {/* Concentric rings */}
        <circle cx={cx} cy={cy} r="120" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.12" strokeDasharray="4 6" />
        <circle cx={cx} cy={cy} r="200" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.08" strokeDasharray="4 6" />
        <circle cx={cx} cy={cy} r="280" fill="none" stroke="hsl(var(--ds-accent))" strokeOpacity="0.06" strokeDasharray="4 6" />

        {/* Connection lines — inner */}
        {inner.map((p, i) => (
          <line
            key={`il-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="hsl(var(--ds-accent))"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
        ))}

        {/* Connection lines — outer (dashed) */}
        {outer.filter(p => p.logo).map((p, i) => (
          <line
            key={`ol-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="hsl(var(--ds-accent))"
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        ))}

        {/* Data particles — animate along inner lines */}
        {inner.map((p, i) => (
          <circle
            key={`dp-${i}`}
            r="3"
            fill="hsl(var(--ds-accent))"
            opacity="0.8"
          >
            <animateMotion
              dur={`${3 + i * 0.4}s`}
              repeatCount="indefinite"
              path={`M ${cx},${cy} L ${p.x},${p.y}`}
            />
            <animate attributeName="opacity" values="0;1;0" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Outer logos */}
        {outer.filter(p => p.logo).map((p, i) => {
          const Logo = p.logo!
          const w = p.w
          const h = w * 0.5
          return (
            <g key={`og-${i}`} transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}>
              <rect x="0" y="0" width={w} height={h} rx="14" fill="#fff" stroke="hsl(var(--ds-rule))" strokeWidth="1" className="drop-shadow-sm" />
              <foreignObject x="8" y="4" width={w - 16} height={h - 8}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Logo width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* Inner logos (featured — SAP, NetSuite, Dynamics, Salesforce) */}
        {inner.map((p, i) => {
          const Logo = p.logo
          const w = p.w
          const h = w * 0.5
          return (
            <g key={`ig-${i}`} transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}>
              <rect
                x="0"
                y="0"
                width={w}
                height={h}
                rx="14"
                fill="#fff"
                stroke="hsl(var(--ds-accent))"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                className="drop-shadow"
              />
              <foreignObject x="8" y="4" width={w - 16} height={h - 8}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Logo width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* Center — Procurea mark with pulsing halo */}
        <g transform={`translate(${cx - 72}, ${cy - 72})`}>
          <circle cx="72" cy="72" r="80" fill="hsl(var(--ds-accent))" opacity="0.1">
            <animate attributeName="r" values="74;90;74" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="72" cy="72" r="70" fill="hsl(var(--ds-accent))" opacity="0.15" />
          <g transform="translate(22, 22)">
            <ProcureaMark width="100" height="100" />
          </g>
        </g>
      </svg>
    </div>
  )
}
