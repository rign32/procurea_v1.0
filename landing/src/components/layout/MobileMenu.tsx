import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  appUrl: string
}

type NavLink =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never }

const navLinks: NavLink[] = [
  { label: t.nav.product, href: '/#product' },
  { label: t.nav.pricing, to: pathFor('pricing') },
  { label: t.nav.integrations, to: pathFor('integrationsHub') },
  { label: t.nav.company, to: pathFor('about') },
]

export function MobileMenu({ open, onClose, appUrl }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-background border-l border-border shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col min-h-full p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label={t.nav.closeMenu}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-1 mt-2">
                {navLinks.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={onClose}
                      className="px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors border-b border-black/[0.06]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to!}
                      onClick={onClose}
                      className="px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors border-b border-black/[0.06]"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              {/* CTAs */}
              <div className="mt-auto pt-6 flex flex-col gap-3">
                <a href={appendUtm(appUrl, 'mobile_login')} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick('mobile_login')}>
                  <Button variant="secondary" className="w-full">
                    {t.nav.login}
                  </Button>
                </a>
                <Link
                  to={pathFor('contact')}
                  onClick={() => {
                    trackCtaClick('mobile_cta')
                    onClose()
                  }}
                >
                  <Button variant="primary" className="w-full">
                    {t.nav.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
