import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"
import { pathFor } from "@/i18n/paths"
import { cn } from "@/lib/utils"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  appUrl: string
}

interface MobileSection {
  label: string
  links: { label: string; to: string }[]
  footerLabel?: string
  footerTo?: string
}

const modulesSection: MobileSection = {
  label: isEN ? "Modules" : "Moduly",
  links: [
    { label: "AI Sourcing", to: pathFor("fAiSourcing") },
    { label: isEN ? "Supplier Database" : "Baza Dostawcow", to: pathFor("fCompanyRegistry") },
    { label: "Email Outreach", to: pathFor("fEmailOutreach") },
    { label: "Supplier Portal", to: pathFor("fSupplierPortal") },
    {
      label: isEN ? "Offer Comparison" : "Porownywarka ofert",
      to: pathFor("fOfferComparison"),
    },
    { label: "AI Insights", to: pathFor("featuresHub") },
  ],
  footerLabel: isEN ? "All modules" : "Wszystkie moduly",
  footerTo: pathFor("featuresHub"),
}

const industrySection: MobileSection = {
  label: isEN ? "Industries" : "Branze",
  links: [
    { label: isEN ? "Manufacturing" : "Produkcja", to: pathFor("iManufacturing") },
    { label: isEN ? "Events" : "Eventy", to: pathFor("iEvents") },
    { label: isEN ? "Construction" : "Budownictwo", to: pathFor("iConstruction") },
    { label: isEN ? "Retail & E-com" : "Retail & E-com", to: pathFor("iRetail") },
    { label: isEN ? "HoReCa" : "HoReCa", to: pathFor("iHoreca") },
    { label: isEN ? "Healthcare" : "Ochrona zdrowia", to: pathFor("iHealthcare") },
    { label: isEN ? "Logistics" : "Logistyka", to: pathFor("iLogistics") },
    { label: "MRO", to: pathFor("iMro") },
  ],
  footerLabel: t.nav.allIndustries,
  footerTo: pathFor("industriesHub"),
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const menuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] as const } },
}

function CollapsibleSection({
  section,
  onClose,
}: {
  section: MobileSection
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-2 py-3.5 text-lg font-semibold text-foreground"
      >
        {section.label}
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-2 pl-2 space-y-0.5">
              {section.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="block px-3 py-2.5 text-base text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.03]"
                >
                  {link.label}
                </Link>
              ))}
              {section.footerTo && (
                <Link
                  to={section.footerTo}
                  onClick={onClose}
                  className="block px-3 py-2.5 text-sm font-semibold text-primary"
                >
                  {section.footerLabel} &rarr;
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MobileMenu({ open, onClose, appUrl }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button when menu opens
  useEffect(() => {
    if (open) {
      closeRef.current?.focus()
      // Lock body scroll
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.openMenu}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-2xl"
        >
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col min-h-full"
          >
            {/* Header with close */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between px-5 pt-4 pb-2"
            >
              <Link
                to={pathFor("home")}
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <img
                  src="/logo-procurea.png"
                  alt="Procurea"
                  className="h-8 w-8 rounded-lg"
                />
                <span className="text-lg font-bold tracking-tight">Procurea</span>
              </Link>
              <button
                ref={closeRef}
                onClick={onClose}
                className="flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
                aria-label={t.nav.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>

            {/* Divider */}
            <div className="mx-5 border-t border-black/[0.06]" />

            {/* Navigation */}
            <nav className="flex-1 px-5 py-4 space-y-1 overflow-y-auto">
              <motion.div variants={itemVariants}>
                <Link
                  to={pathFor("home")}
                  onClick={onClose}
                  className="block px-2 py-3.5 text-lg font-semibold text-foreground"
                >
                  {t.nav.product}
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <CollapsibleSection section={modulesSection} onClose={onClose} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <CollapsibleSection section={industrySection} onClose={onClose} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  to={pathFor("pricing")}
                  onClick={onClose}
                  className="block px-2 py-3.5 text-lg font-semibold text-foreground"
                >
                  {t.nav.pricing}
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  to={pathFor("integrationsHub")}
                  onClick={onClose}
                  className="block px-2 py-3.5 text-lg font-semibold text-foreground"
                >
                  {t.nav.integrations}
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  to={pathFor("resourcesHub")}
                  onClick={onClose}
                  className="block px-2 py-3.5 text-lg font-semibold text-foreground"
                >
                  {isEN ? "Content Hub" : "Centrum Wiedzy"}
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  to={pathFor("about")}
                  onClick={onClose}
                  className="block px-2 py-3.5 text-lg font-semibold text-foreground"
                >
                  {t.nav.company}
                </Link>
              </motion.div>
            </nav>

            {/* CTAs at bottom */}
            <motion.div
              variants={itemVariants}
              className="px-5 pb-8 pt-2 space-y-3 border-t border-black/[0.06]"
            >
              <a
                href={appendUtm(appUrl, "mobile_signup")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackCtaClick("mobile_signup")
                  onClose()
                }}
                className="flex items-center justify-center w-full rounded-xl font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-3.5"
              >
                {t.nav.cta}
              </a>
              <a
                href={appendUtm(appUrl, "mobile_login")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick("mobile_login")}
                className="flex items-center justify-center w-full rounded-xl font-medium text-base border border-black/[0.08] text-foreground hover:bg-black/[0.03] transition-all duration-200 px-6 py-3.5"
              >
                {t.nav.login}
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
