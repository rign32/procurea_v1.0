import { useState } from "react"
import { Link } from "react-router-dom"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import { MobileMenu } from "./MobileMenu"
import { NavDropdown, type DropdownSection } from "./NavDropdown"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Mega-menu sections for Funkcje / Features
const featuresSections: DropdownSection[] = [
  {
    label: 'AI Sourcing',
    items: [
      { label: 'AI Sourcing', to: pathFor('fAiSourcing'), description: isEN ? '50–250 vendors per campaign, 26 languages' : '50–250 dostawców na kampanię, 26 języków' },
      { label: 'Company Registry', to: pathFor('fCompanyRegistry'), description: isEN ? 'VAT / EORI / financial verification' : 'Weryfikacja VAT / EORI / finanse' },
    ],
    footer: { label: isEN ? 'All Sourcing features' : 'Wszystkie funkcje Sourcing', to: pathFor('featuresHub') },
  },
  {
    label: 'AI Procurement',
    items: [
      { label: 'Email Outreach', to: pathFor('fEmailOutreach'), description: isEN ? 'Bulk RFQ in local language' : 'Bulk RFQ w języku lokalnym' },
      { label: 'Supplier Portal', to: pathFor('fSupplierPortal'), description: isEN ? 'Magic-link offer collection' : 'Zbieranie ofert przez magic-link' },
      { label: isEN ? 'Offer Comparison' : 'Porównywarka Ofert', to: pathFor('fOfferComparison'), description: isEN ? 'Side-by-side with PDF/PPTX export' : 'Side-by-side z eksportem PDF/PPTX' },
      { label: 'AI Insights', to: pathFor('fAiInsights'), description: isEN ? 'Auto-generated executive reports' : 'Auto-generowane raporty dla zarządu' },
    ],
    footer: { label: isEN ? 'All Procurement features' : 'Wszystkie funkcje Procurement', to: pathFor('featuresHub') },
  },
]

// Mega-menu sections for Dla kogo / Industries
const industriesSections: DropdownSection[] = [
  {
    label: isEN ? 'Available now' : 'Dostępne teraz',
    items: [
      { label: isEN ? 'Manufacturing' : 'Produkcja', to: pathFor('iManufacturing'), description: isEN ? 'Raw materials, components, MRO' : 'Surowce, komponenty, MRO' },
      { label: isEN ? 'Events' : 'Eventy', to: pathFor('iEvents'), description: isEN ? 'Catering, AV, scenography — 48h sourcing' : 'Catering, AV, scenografia — sourcing 48h' },
      { label: isEN ? 'Construction' : 'Budownictwo', to: pathFor('iConstruction'), description: isEN ? 'Subcontractors + materials' : 'Podwykonawcy + materiały' },
      { label: 'Retail & E-commerce', to: pathFor('iRetail'), description: isEN ? 'Private label manufacturers' : 'Producenci private label' },
    ],
    footer: { label: isEN ? 'All industries' : 'Wszystkie branże', to: pathFor('industriesHub') },
  },
  {
    label: isEN ? 'Coming next' : 'Wkrótce',
    items: [
      { label: 'HoReCa', to: pathFor('industriesHub'), badge: 'Soon' },
      { label: isEN ? 'Healthcare' : 'Ochrona zdrowia', to: pathFor('industriesHub'), badge: 'Soon' },
      { label: isEN ? 'Logistics' : 'Logistyka', to: pathFor('industriesHub'), badge: 'Soon' },
      { label: 'MRO', to: pathFor('industriesHub'), badge: 'Soon' },
    ],
  },
]

export function Navbar() {
  const { isScrolled } = useScrollProgress()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          // Always semi-opaque so content never shows through the navbar (fixes overlap reported in user review).
          'bg-white/85 backdrop-blur-xl border-b border-black/[0.05]',
          isScrolled && 'bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to={pathFor('home')} className="flex items-center gap-2 group shrink-0">
              <img src="/logo-procurea.png" alt="Procurea" className="h-8 w-8 rounded-lg transition-transform duration-200 group-hover:scale-105" />
              <span className="text-lg font-bold tracking-tight">Procurea</span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider hidden sm:inline-flex">
                Beta
              </span>
            </Link>

            {/* Desktop nav — visible only at lg (1024px) and up to prevent overlap */}
            <div className="hidden lg:flex items-center gap-1">
              <NavDropdown label={t.nav.features} sections={featuresSections} columns={2} />
              <NavDropdown label={t.nav.audience} sections={industriesSections} columns={2} />
              <Link
                to={pathFor('integrationsHub')}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.03]"
              >
                {t.nav.integrations}
              </Link>
              <Link
                to={pathFor('pricing')}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.03]"
              >
                {t.nav.pricing}
              </Link>
            </div>

            {/* Desktop CTA — visible at lg and up */}
            <div className="hidden lg:flex items-center gap-2.5 shrink-0">
              <a
                href={appendUtm(APP_URL, 'navbar_login')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_login')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.login}
              </a>
              <a
                href={appendUtm(APP_URL, 'navbar_cta')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_cta')}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {t.nav.cta}
              </a>
            </div>

            {/* Mobile hamburger — visible below lg (anything under 1024px) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-foreground hover:bg-black/[0.04] transition-colors"
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} appUrl={APP_URL} />
    </>
  )
}
