import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { cn } from "@/lib/utils"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  appUrl: string
}

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

interface NavGroup {
  label: string
  items: { label: string; to: string; badge?: string }[]
  seeAll?: { label: string; to: string }
}

const featuresGroup: NavGroup = {
  label: t.nav.features,
  items: [
    { label: 'AI Sourcing', to: pathFor('fAiSourcing') },
    { label: 'Company Registry', to: pathFor('fCompanyRegistry') },
    { label: 'Email Outreach', to: pathFor('fEmailOutreach') },
    { label: 'Supplier Portal', to: pathFor('fSupplierPortal') },
    { label: isEN ? 'Offer Comparison' : 'Porównywarka Ofert', to: pathFor('fOfferComparison') },
    { label: 'AI Insights', to: pathFor('fAiInsights') },
  ],
  seeAll: { label: isEN ? 'All features' : 'Wszystkie funkcje', to: pathFor('featuresHub') },
}

const industriesGroup: NavGroup = {
  label: t.nav.audience,
  items: [
    { label: isEN ? 'Manufacturing' : 'Produkcja', to: pathFor('iManufacturing') },
    { label: isEN ? 'Events' : 'Eventy', to: pathFor('iEvents') },
    { label: isEN ? 'Construction' : 'Budownictwo', to: pathFor('iConstruction') },
    { label: 'Retail & E-commerce', to: pathFor('iRetail') },
    { label: 'HoReCa', to: pathFor('industriesHub'), badge: 'Soon' },
    { label: isEN ? 'Healthcare' : 'Ochrona zdrowia', to: pathFor('industriesHub'), badge: 'Soon' },
  ],
  seeAll: { label: isEN ? 'All industries' : 'Wszystkie branże', to: pathFor('industriesHub') },
}

function Accordion({ group, onClose }: { group: NavGroup; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/[0.06]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold text-foreground hover:bg-black/[0.02] transition-colors rounded-lg"
      >
        {group.label}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="pb-2">
          {group.items.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-black/[0.02] transition-colors"
            >
              {item.label}
              {item.badge && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          {group.seeAll && (
            <Link
              to={group.seeAll.to}
              onClick={onClose}
              className="block px-6 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              {group.seeAll.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

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

              {/* Navigation groups */}
              <nav className="flex flex-col gap-1 mt-2">
                <Accordion group={featuresGroup} onClose={onClose} />
                <Accordion group={industriesGroup} onClose={onClose} />
                <Link
                  to={pathFor('integrationsHub')}
                  onClick={onClose}
                  className="px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors border-b border-black/[0.06]"
                >
                  {t.nav.integrations}
                </Link>
                <Link
                  to={pathFor('pricing')}
                  onClick={onClose}
                  className="px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors border-b border-black/[0.06]"
                >
                  {t.nav.pricing}
                </Link>
                <Link
                  to={pathFor('contact')}
                  onClick={onClose}
                  className="px-4 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-black/[0.02] transition-colors"
                >
                  {isEN ? 'Contact' : 'Kontakt'}
                </Link>
              </nav>

              {/* CTAs */}
              <div className="mt-auto pt-6 flex flex-col gap-3">
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
