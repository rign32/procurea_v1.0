import { useState } from "react"
import { Link } from "react-router-dom"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import { MobileMenu } from "./MobileMenu"
import { NavDropdown, type DropdownSection } from "./NavDropdown"
import { Menu, Search, Mail, LayoutGrid, Zap, FileText, BookOpen, Users, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

/* ---------- Dropdown data ---------- */

const platformSections: DropdownSection[] = [
  {
    label: isEN ? 'Core Platform' : 'Platforma',
    items: [
      {
        label: 'AI Sourcing',
        to: pathFor('fAiSourcing'),
        description: isEN ? 'Find 250 vendors in 20 minutes' : 'Znajdz 250 dostawcow w 20 minut',
        icon: <Search className="h-4 w-4" />,
      },
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
    ],
    footer: { label: t.nav.allFeatures, to: pathFor('featuresHub') },
  },
]

const modulesSections: DropdownSection[] = [
  {
    label: isEN ? 'Industries' : 'Branze',
    items: [
      { label: isEN ? 'Manufacturing' : 'Produkcja', to: pathFor('iManufacturing') },
      { label: isEN ? 'Events' : 'Eventy', to: pathFor('iEvents') },
      { label: isEN ? 'Construction' : 'Budownictwo', to: pathFor('iConstruction') },
      { label: isEN ? 'Retail & E-com' : 'Retail & E-com', to: pathFor('iRetail') },
    ],
    footer: { label: t.nav.allIndustries, to: pathFor('industriesHub') },
  },
  {
    label: isEN ? 'Integrations' : 'Integracje',
    items: [
      {
        label: isEN ? 'All Integrations' : 'Wszystkie integracje',
        to: pathFor('integrationsHub'),
        description: isEN ? 'ERP, CRM, and more' : 'ERP, CRM i wiecej',
      },
    ],
  },
]

const resourcesSections: DropdownSection[] = [
  {
    label: isEN ? 'Learn' : 'Wiedza',
    items: [
      {
        label: 'Blog',
        to: '#',
        description: isEN ? 'Insights on procurement automation' : 'Artykuly o automatyzacji zakupow',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        label: 'Case Studies',
        to: '#',
        description: isEN ? 'How teams save with Procurea' : 'Jak zespoly oszczedzaja z Procurea',
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    label: isEN ? 'Developers' : 'Deweloperzy',
    items: [
      {
        label: isEN ? 'Documentation' : 'Dokumentacja',
        to: '#',
        description: isEN ? 'Guides and references' : 'Przewodniki i dokumentacja',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        label: 'API Docs',
        to: '#',
        description: isEN ? 'REST API reference' : 'Dokumentacja REST API',
        icon: <Code className="h-4 w-4" />,
      },
    ],
  },
]

/* ---------- Shared styles ---------- */

const linkClass =
  "px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-black/[0.03]"

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
          "bg-white/70 backdrop-blur-xl border-b border-black/[0.04]",
          isScrolled && "bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-black/[0.06]"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to={pathFor('home')}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <img
                src="/logo-procurea.png"
                alt="Procurea"
                className="h-8 w-8 rounded-lg transition-transform duration-200 group-hover:scale-110"
              />
              <span className="text-lg font-bold tracking-tight text-foreground">
                Procurea
              </span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline-flex">
                Beta
              </span>
            </Link>

            {/* Desktop nav -- visible at lg (1024px) and up */}
            <div className="hidden lg:flex items-center gap-0.5">
              <NavDropdown
                label={isEN ? 'Platform' : 'Platforma'}
                sections={platformSections}
                columns={1}
              />
              <NavDropdown
                label={isEN ? 'Modules' : 'Moduly'}
                sections={modulesSections}
                columns={2}
              />
              <Link to={pathFor('industriesHub')} className={linkClass}>
                {isEN ? 'Industries' : 'Branze'}
              </Link>
              <Link to={pathFor('pricing')} className={linkClass}>
                {t.nav.pricing}
              </Link>
              <NavDropdown
                label={isEN ? 'Resources' : 'Zasoby'}
                sections={resourcesSections}
                columns={2}
              />
            </div>

            {/* Desktop CTA -- visible at lg and up */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href={appendUtm(APP_URL, 'navbar_login')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_login')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {t.nav.login}
              </a>
              <Link
                to={pathFor('contact')}
                onClick={() => trackCtaClick('navbar_cta')}
                className="relative inline-flex items-center px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(var(--primary-rgb,34,197,94),0.3)]"
              >
                {t.nav.cta}
              </Link>
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
            className="h-full bg-gradient-to-r from-primary via-brand-400 to-emerald-400 transition-[width] duration-150 ease-out"
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
