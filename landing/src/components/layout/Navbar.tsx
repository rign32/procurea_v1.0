import { useState } from "react"
import { Link } from "react-router-dom"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import { MobileMenu } from "./MobileMenu"
import { NavDropdown, NavDropdownGroup, type DropdownSection } from "./NavDropdown"
import { Menu, Search, Mail, LayoutGrid, Zap, Sparkles, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

/* ---------- Dropdown data ---------- */

const modulesSections: DropdownSection[] = [
  {
    label: 'AI Sourcing',
    items: [
      {
        label: 'AI Sourcing',
        to: pathFor('fAiSourcing'),
        description: isEN ? 'Find 250 vendors in 20 minutes' : 'Znajdz 250 dostawcow w 20 minut',
        icon: <Search className="h-4 w-4" />,
      },
      {
        label: isEN ? 'Supplier Database' : 'Baza Dostawcow',
        to: pathFor('fCompanyRegistry'),
        description: isEN ? 'AI scores, contacts, campaign history' : 'Oceny AI, kontakty, historia kampanii',
        icon: <Building2 className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'AI Procurement',
    items: [
      {
        label: 'Email Outreach',
        to: pathFor('fEmailOutreach'),
        description: isEN ? "RFQ in supplier's local language" : 'RFQ w jezyku dostawcy',
        icon: <Mail className="h-4 w-4" />,
      },
      {
        label: 'Supplier Portal',
        to: pathFor('fSupplierPortal'),
        description: isEN ? 'Magic-link offer collection' : 'Zbieranie ofert przez magic-link',
        icon: <LayoutGrid className="h-4 w-4" />,
      },
      {
        label: isEN ? 'Offer Comparison' : 'Porownywarka ofert',
        to: pathFor('fOfferComparison'),
        description: isEN ? 'Side-by-side weighted ranking' : 'Ranking wazony side-by-side',
        icon: <Zap className="h-4 w-4" />,
      },
      {
        label: 'AI Insights',
        to: pathFor('featuresHub'),
        description: isEN ? 'Procurement reports that write themselves' : 'Raporty procurement, ktore same sie pisza',
        icon: <Sparkles className="h-4 w-4" />,
      },
    ],
    footer: { label: isEN ? 'All modules →' : 'Wszystkie moduly →', to: pathFor('featuresHub') },
  },
]

const industriesSections: DropdownSection[] = [
  {
    label: isEN ? 'Industries' : 'Branze',
    items: [
      { label: isEN ? 'Manufacturing' : 'Produkcja', to: pathFor('iManufacturing') },
      { label: isEN ? 'Events' : 'Eventy', to: pathFor('iEvents') },
      { label: isEN ? 'Construction' : 'Budownictwo', to: pathFor('iConstruction') },
      { label: isEN ? 'Retail & E-com' : 'Retail & E-com', to: pathFor('iRetail') },
      { label: isEN ? 'HoReCa' : 'HoReCa', to: pathFor('iHoreca') },
      { label: isEN ? 'Healthcare' : 'Ochrona zdrowia', to: pathFor('iHealthcare') },
      { label: isEN ? 'Logistics' : 'Logistyka', to: pathFor('iLogistics') },
      { label: 'MRO', to: pathFor('iMro') },
    ],
    footer: { label: isEN ? 'All industries →' : 'Wszystkie branze →', to: pathFor('industriesHub') },
  },
]

/* ---------- Shared styles ---------- */

const linkClass =
  "px-3 py-2 text-sm text-[hsl(var(--ds-ink-2))] hover:text-foreground transition-colors duration-150 rounded-lg hover:bg-[hsl(var(--ds-bg-2))]"

/* ---------- Navbar ---------- */

export function Navbar() {
  const { isScrolled, progress } = useScrollProgress()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Skip to content -- visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        {LANG === 'en' ? 'Skip to content' : 'Przejdz do tresci'}
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          "bg-[hsl(var(--ds-bg))]/85 backdrop-blur-[10px] backdrop-saturate-[1.4] border-b border-[hsl(var(--ds-rule))]",
          isScrolled && "bg-[hsl(var(--ds-bg))]/95 shadow-[0_1px_3px_rgba(14,22,20,0.05)]"
        )}
      >
        <nav role="navigation" aria-label="Main navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo — navy brand mark */}
            <Link
              to={pathFor('home')}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <span
                aria-hidden
                className="grid place-items-center h-[26px] w-[26px] rounded-[7px] bg-[hsl(var(--ds-accent))] text-white font-mono text-[13px] font-semibold transition-transform duration-200 group-hover:scale-[1.06]"
              >
                P
              </span>
              <span className="text-[17px] font-bold tracking-[-0.01em] text-foreground">
                Procurea
              </span>
            </Link>

            {/* Desktop nav -- visible at lg (1024px) and up */}
            <NavDropdownGroup>
              <div className="hidden lg:flex items-center gap-0.5">
                <Link to={pathFor('home')} className={linkClass}>
                  {t.nav.product}
                </Link>
                <NavDropdown
                  label={isEN ? 'Modules' : 'Moduly'}
                  sections={modulesSections}
                  columns={2}
                />
                <NavDropdown
                  label={isEN ? 'Industries' : 'Branze'}
                  sections={industriesSections}
                  columns={1}
                />
                <Link to={pathFor('pricing')} className={linkClass}>
                  {t.nav.pricing}
                </Link>
                <Link to={pathFor('integrationsHub')} className={linkClass}>
                  {t.nav.integrations}
                </Link>
                <Link to={pathFor('resourcesHub')} className={linkClass}>
                  {isEN ? 'Resources' : 'Materialy'}
                </Link>
                <Link to={pathFor('about')} className={linkClass}>
                  {t.nav.company}
                </Link>
              </div>
            </NavDropdownGroup>

            {/* Desktop CTA -- visible at lg and up */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href={appendUtm(APP_URL, 'navbar_login')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_login')}
                className="px-3 py-2 text-sm text-[hsl(var(--ds-ink-2))] hover:text-foreground hover:bg-[hsl(var(--ds-bg-2))] rounded-lg transition-colors duration-150"
              >
                {t.nav.login}
              </a>
              <a
                href={appendUtm(APP_URL, 'navbar_signup')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_signup')}
                className="btn-ds btn-ds-primary btn-ds-sm"
              >
                {t.nav.cta}
                <span className="arrow" aria-hidden>→</span>
              </a>
            </div>

            {/* Mobile hamburger -- visible below lg */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl text-foreground hover:bg-black/[0.04] transition-colors"
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        {/* Scroll progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-[hsl(var(--ds-accent))] via-[hsl(var(--ds-accent-2))] to-[hsl(var(--ds-cta))] transition-[width] duration-200 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        appUrl={APP_URL}
      />
    </>
  )
}
