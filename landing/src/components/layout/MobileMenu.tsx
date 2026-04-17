import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"
import { cn } from "@/lib/utils"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  appUrl: string
}

const featureLinks = [
  { label: 'AI Sourcing', to: pathFor('fAiSourcing') },
  { label: 'Email Outreach', to: pathFor('fEmailOutreach') },
  { label: 'Supplier Portal', to: pathFor('fSupplierPortal') },
  { label: isEN ? 'Offer Comparison' : 'Porównywarka ofert', to: pathFor('fOfferComparison') },
]

const industryLinks = [
  { label: isEN ? 'Manufacturing' : 'Produkcja', to: pathFor('iManufacturing') },
  { label: isEN ? 'Events' : 'Eventy', to: pathFor('iEvents') },
  { label: isEN ? 'Construction' : 'Budownictwo', to: pathFor('iConstruction') },
  { label: isEN ? 'Retail & E-com' : 'Retail & E-com', to: pathFor('iRetail') },
]

const linkClass = "px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors border-b border-black/[0.06]"
const subLinkClass = "block px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"

export function MobileMenu({ open, onClose, appUrl }: MobileMenuProps) {
  const [productOpen, setProductOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button when menu opens
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

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
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.openMenu}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[min(320px,85vw)] bg-background border-l border-border shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col min-h-full p-4">
              <div className="flex justify-end mb-2">
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label={t.nav.closeMenu}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-1 mt-2">
                {/* Product — expandable */}
                <button
                  onClick={() => setProductOpen(!productOpen)}
                  className={cn(linkClass, "flex items-center justify-between w-full text-left")}
                >
                  {t.nav.product}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", productOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {productOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="py-1">
                        <p className="px-6 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                          {isEN ? 'Features' : 'Funkcje'}
                        </p>
                        {featureLinks.map((link) => (
                          <Link key={link.to} to={link.to} onClick={onClose} className={subLinkClass}>
                            {link.label}
                          </Link>
                        ))}
                        <Link to={pathFor('featuresHub')} onClick={onClose} className={cn(subLinkClass, "text-primary font-semibold")}>
                          {t.nav.allFeatures} →
                        </Link>

                        <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                          {isEN ? 'Industries' : 'Branże'}
                        </p>
                        {industryLinks.map((link) => (
                          <Link key={link.to} to={link.to} onClick={onClose} className={subLinkClass}>
                            {link.label}
                          </Link>
                        ))}
                        <Link to={pathFor('industriesHub')} onClick={onClose} className={cn(subLinkClass, "text-primary font-semibold")}>
                          {t.nav.allIndustries} →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flat links */}
                <Link to={pathFor('pricing')} onClick={onClose} className={linkClass}>
                  {t.nav.pricing}
                </Link>
                <Link to={pathFor('integrationsHub')} onClick={onClose} className={linkClass}>
                  {t.nav.integrations}
                </Link>
                <Link to={pathFor('about')} onClick={onClose} className={linkClass}>
                  {t.nav.company}
                </Link>
              </nav>

              {/* CTAs */}
              <div className="mt-auto pt-6 flex flex-col gap-3">
                <a
                  href={appendUtm(appUrl, 'mobile_login')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('mobile_login')}
                  className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 border border-border bg-background text-foreground hover:bg-accent px-6 py-2.5 text-sm w-full"
                >
                  {t.nav.login}
                </a>
                <Link
                  to={pathFor('contact')}
                  onClick={() => {
                    trackCtaClick('mobile_cta')
                    onClose()
                  }}
                  className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md px-6 py-2.5 text-sm w-full"
                >
                  {t.nav.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
