import type { ReactElement, SVGProps } from "react"

/**
 * Brand logos for integrations — inline SVG, nominative use.
 * Paths are simplified representations of the official brand marks.
 * Use `color` to override with brand color on hover; `text-current` defaults.
 */

type LogoProps = SVGProps<SVGSVGElement> & { title?: string }

/* ══════════ SAP ══════════ */
export function SapLogo({ title = "SAP", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <defs>
        <linearGradient id="sap-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00A5E0" />
          <stop offset="1" stopColor="#003F72" />
        </linearGradient>
      </defs>
      <path d="M0 10h140l-20 60H0z" fill="url(#sap-g)" />
      <text
        x="70"
        y="52"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="32"
        fontWeight="900"
        fill="#fff"
        letterSpacing="2"
      >
        SAP
      </text>
    </svg>
  )
}

/* ══════════ Oracle ══════════ */
export function OracleLogo({ title = "Oracle", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <ellipse cx="80" cy="40" rx="72" ry="24" fill="none" stroke="#C74634" strokeWidth="10" />
      <text
        x="80"
        y="47"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#C74634"
        letterSpacing="3"
      >
        ORACLE
      </text>
    </svg>
  )
}

/* ══════════ NetSuite ══════════ */
export function NetSuiteLogo({ title = "NetSuite", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <rect x="4" y="18" width="32" height="44" rx="3" fill="#0A0A0A" />
      <text x="20" y="50" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="900" fill="#fff">N</text>
      <text
        x="44"
        y="50"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#0A0A0A"
        letterSpacing="0"
      >
        etSuite
      </text>
    </svg>
  )
}

/* ══════════ Microsoft (4-square mark) ══════════ */
export function MicrosoftLogo({ title = "Microsoft", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <rect x="8" y="16" width="22" height="22" fill="#F25022" />
      <rect x="32" y="16" width="22" height="22" fill="#7FBA00" />
      <rect x="8" y="40" width="22" height="22" fill="#00A4EF" />
      <rect x="32" y="40" width="22" height="22" fill="#FFB900" />
      <text
        x="62"
        y="50"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="500"
        fill="#5E5E5E"
        letterSpacing="-0.5"
      >
        Microsoft
      </text>
    </svg>
  )
}

/* ══════════ Dynamics 365 ══════════ */
export function Dynamics365Logo({ title = "Dynamics 365", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 180 80" role="img" aria-label={title} {...p}>
      <defs>
        <linearGradient id="d365-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00A0E0" />
          <stop offset="1" stopColor="#004E8C" />
        </linearGradient>
      </defs>
      <path d="M10 16 L44 16 L52 28 L40 48 L52 64 L44 64 L10 64 Z" fill="url(#d365-g)" />
      <text x="40" y="48" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="900" fill="#fff">D</text>
      <text
        x="60"
        y="38"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#0B2E50"
      >
        Dynamics
      </text>
      <text
        x="60"
        y="58"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="900"
        fill="#0078D4"
      >
        365
      </text>
    </svg>
  )
}

/* ══════════ Salesforce (cloud) ══════════ */
export function SalesforceLogo({ title = "Salesforce", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 180 80" role="img" aria-label={title} {...p}>
      <path
        d="M48 28 A14 14 0 0 1 72 20 A16 16 0 0 1 98 22 A14 14 0 0 1 120 30 A14 14 0 0 1 118 58 L60 58 A16 16 0 0 1 48 28 Z"
        fill="#00A1E0"
      />
      <text
        x="128"
        y="48"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#032D60"
      >
        salesforce
      </text>
    </svg>
  )
}

/* ══════════ QuickBooks ══════════ */
export function QuickBooksLogo({ title = "QuickBooks", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <circle cx="32" cy="40" r="22" fill="#2CA01C" />
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#fff"
        letterSpacing="-1"
      >
        qb
      </text>
      <text
        x="62"
        y="47"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="17"
        fontWeight="700"
        fill="#393A3D"
      >
        QuickBooks
      </text>
    </svg>
  )
}

/* ══════════ Xero ══════════ */
export function XeroLogo({ title = "Xero", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <circle cx="40" cy="40" r="24" fill="#13B5EA" />
      <text
        x="40"
        y="49"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#fff"
      >
        X
      </text>
      <text
        x="72"
        y="49"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="300"
        fill="#13B5EA"
      >
        xero
      </text>
    </svg>
  )
}

/* ══════════ Sage ══════════ */
export function SageLogo({ title = "Sage", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <path d="M10 52 Q22 40 38 44 Q52 48 60 38" stroke="#00D639" strokeWidth="8" fill="none" strokeLinecap="round" />
      <text
        x="70"
        y="52"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="26"
        fontWeight="800"
        fill="#00693E"
        letterSpacing="-1"
      >
        Sage
      </text>
    </svg>
  )
}

/* ══════════ Odoo ══════════ */
export function OdooLogo({ title = "Odoo", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 80" role="img" aria-label={title} {...p}>
      <circle cx="28" cy="40" r="18" fill="#714B67" />
      <circle cx="60" cy="40" r="14" fill="none" stroke="#714B67" strokeWidth="6" />
      <text
        x="84"
        y="50"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#714B67"
        letterSpacing="-0.5"
      >
        Odoo
      </text>
    </svg>
  )
}

/* ══════════ Procurea (center mark) ══════════ */
export function ProcureaMark({ title = "Procurea", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...p}>
      <defs>
        <linearGradient id="procurea-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(var(--ds-accent))" stopOpacity="0.95" />
          <stop offset="1" stopColor="hsl(var(--ds-accent))" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#procurea-g)" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Geist Mono', Consolas, Menlo, monospace"
        fontSize="52"
        fontWeight="800"
        fill="#fff"
      >
        P
      </text>
    </svg>
  )
}

/* ═══════ Registry — slug → logo component ═══════ */

export const BRAND_LOGOS: Record<string, (p: LogoProps) => ReactElement> = {
  sap: SapLogo,
  'sap-ecc': SapLogo,
  'oracle-netsuite': NetSuiteLogo,
  'oracle-fusion-cloud': OracleLogo,
  'dynamics-365-bc': Dynamics365Logo,
  'dynamics-365-fo': Dynamics365Logo,
  salesforce: SalesforceLogo,
  quickbooks: QuickBooksLogo,
  xero: XeroLogo,
  'sage-intacct': SageLogo,
  odoo: OdooLogo,
}
