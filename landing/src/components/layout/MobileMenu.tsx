import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: { label: string; to: string }[]
  appUrl: string
}

export function MobileMenu({ open, onClose, links, appUrl }: MobileMenuProps) {
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-background border-l border-border shadow-2xl"
          >
            <div className="flex flex-col h-full p-6">
              {/* Close */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label={t.nav.closeMenu}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 mt-6">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className="px-4 py-3 text-base font-medium text-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* CTAs */}
              <div className="mt-auto flex flex-col gap-3">
                <a href={appendUtm(appUrl, 'mobile_login')} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick('mobile_login')}>
                  <Button variant="secondary" className="w-full">
                    {t.nav.login}
                  </Button>
                </a>
                <a href={appendUtm(appUrl, 'mobile_cta')} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick('mobile_cta')}>
                  <Button variant="primary" className="w-full">
                    {t.nav.cta}
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
