import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: { label: string; href: string }[]
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
                  aria-label="Zamknij menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 mt-6">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="px-4 py-3 text-base font-medium text-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* CTAs */}
              <div className="mt-auto flex flex-col gap-3">
                <a href={appUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full">
                    Zaloguj się
                  </Button>
                </a>
                <a href={appUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" className="w-full">
                    Testuj za darmo
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
