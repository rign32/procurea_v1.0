import { useState } from "react"
import { Link } from "react-router-dom"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import { MobileMenu } from "./MobileMenu"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackCtaClick } from "@/lib/analytics"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const navLinks = [
  { label: t.nav.howItWorks, href: `#${t.sectionIds.howItWorks}` },
  { label: t.nav.features, href: `#${t.sectionIds.features}` },
  { label: t.nav.audience, href: `#${t.sectionIds.audience}` },
  { label: t.nav.faq, href: `#${t.sectionIds.faq}` },
]

export function Navbar() {
  const { isScrolled } = useScrollProgress()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/70 backdrop-blur-xl border-b border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
                <span className="text-sm font-bold">P</span>
              </div>
              <span className="text-lg font-bold tracking-tight">Procurea</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Beta
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.03]"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2.5">
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_login')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.login}
              </a>
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('navbar_cta')}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {t.nav.cta}
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-foreground hover:bg-black/[0.04] transition-colors"
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        appUrl={APP_URL}
      />
    </>
  )
}
