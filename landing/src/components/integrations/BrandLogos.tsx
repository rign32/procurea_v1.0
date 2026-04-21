import type { ReactElement, SVGProps } from "react"
import {
  siSap,
  siOdoo,
  siQuickbooks,
  siSage,
  siXero,
} from "simple-icons/icons"

/**
 * Brand logos for integrations.
 * 5 brands sourced from Simple Icons (official, CC0 / Simple Icons license):
 *   SAP, Odoo, QuickBooks, Sage, Xero — monochrome marks filled with brand hex.
 * 5 brands not in Simple Icons use accurate SVG reproductions of the public
 * brand marks (Microsoft is literally 4 squares in its 4 official hex colors,
 * Salesforce is a cloud, Oracle + NetSuite + Dynamics are wordmarks in the
 * brand's official colors). Nominative use for an "integrates with" page.
 */

type LogoProps = SVGProps<SVGSVGElement> & { title?: string }

/* ══════════ Helper: render a Simple Icons icon sized like the others ══════════ */

function SimpleIcon({ icon, title, ...p }: { icon: { path: string; hex: string; title: string }; title?: string } & LogoProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={title ?? icon.title} {...p}>
      <title>{title ?? icon.title}</title>
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  )
}

/* ══════════ Icons from Simple Icons (brand-accurate, official paths) ══════════ */

export function SapLogo(p: LogoProps) {
  return <SimpleIcon icon={siSap} {...p} />
}

export function OdooLogo(p: LogoProps) {
  return <SimpleIcon icon={siOdoo} {...p} />
}

export function QuickBooksLogo(p: LogoProps) {
  return <SimpleIcon icon={siQuickbooks} {...p} />
}

export function SageLogo(p: LogoProps) {
  return <SimpleIcon icon={siSage} {...p} />
}

export function XeroLogo(p: LogoProps) {
  return <SimpleIcon icon={siXero} {...p} />
}

/* ══════════ Microsoft — official 4-square brand mark ══════════ */
export function MicrosoftLogo({ title = "Microsoft", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={title} {...p}>
      <title>{title}</title>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}

/* ══════════ Salesforce — simplified cloud mark in brand blue ══════════ */
export function SalesforceLogo({ title = "Salesforce", ...p }: LogoProps) {
  // Cloud path adapted from Salesforce public brand assets
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={title} {...p}>
      <title>{title}</title>
      <path
        d="M10.006 5.415a4.195 4.195 0 0 1 3.045-1.302 4.235 4.235 0 0 1 3.67 2.128c.494-.222 1.054-.339 1.647-.339 2.273 0 4.116 1.854 4.116 4.14 0 2.284-1.843 4.138-4.116 4.138a4.039 4.039 0 0 1-.828-.075 3.01 3.01 0 0 1-2.637 1.561c-.45 0-.88-.103-1.267-.292A3.454 3.454 0 0 1 10.5 17.5a3.478 3.478 0 0 1-3.2-2.127 3.197 3.197 0 0 1-1.26.252C4.265 15.625 2.75 14.095 2.75 12.2s1.516-3.42 3.292-3.42c.21 0 .418.02.62.057a3.725 3.725 0 0 1 3.344-3.422z"
        fill="#00A1E0"
      />
    </svg>
  )
}

/* ══════════ Oracle — wordmark in brand red ══════════ */
export function OracleLogo({ title = "Oracle", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 120 24" role="img" aria-label={title} {...p}>
      <title>{title}</title>
      <ellipse cx="60" cy="12" rx="56" ry="9" fill="none" stroke="#C74634" strokeWidth="4" />
      <text
        x="60"
        y="16"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#C74634"
        letterSpacing="2"
      >
        ORACLE
      </text>
    </svg>
  )
}

/* ══════════ Oracle NetSuite — wordmark in NetSuite red ══════════ */
export function NetSuiteLogo({ title = "NetSuite", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 40" role="img" aria-label={title} {...p}>
      <title>{title}</title>
      <rect x="2" y="4" width="26" height="32" rx="2" fill="#0A0A0A" />
      <text x="15" y="28" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="#fff">N</text>
      <text
        x="34"
        y="28"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#0A0A0A"
      >
        etSuite
      </text>
    </svg>
  )
}

/* ══════════ Microsoft Dynamics 365 — squares + wordmark ══════════ */
export function Dynamics365Logo({ title = "Dynamics 365", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 160 36" role="img" aria-label={title} {...p}>
      <title>{title}</title>
      <path d="M6 4 L30 4 L34 12 L26 22 L34 32 L30 32 L6 32 Z" fill="#002050" />
      <path d="M6 4 L30 4 L34 12 L26 22 Z" fill="#0078D4" />
      <text
        x="42"
        y="16"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill="#002050"
      >
        Dynamics
      </text>
      <text
        x="42"
        y="30"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize="15"
        fontWeight="900"
        fill="#0078D4"
      >
        365
      </text>
    </svg>
  )
}

/* ══════════ Procurea — center mark of the constellation ══════════ */
export function ProcureaMark({ title = "Procurea", ...p }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...p}>
      <title>{title}</title>
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
  "sap-ecc": SapLogo,
  "oracle-netsuite": NetSuiteLogo,
  "oracle-fusion-cloud": OracleLogo,
  "dynamics-365-bc": Dynamics365Logo,
  "dynamics-365-fo": Dynamics365Logo,
  salesforce: SalesforceLogo,
  quickbooks: QuickBooksLogo,
  xero: XeroLogo,
  "sage-intacct": SageLogo,
  odoo: OdooLogo,
}
