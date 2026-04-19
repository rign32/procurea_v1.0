import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropdownItem {
  label: string
  to: string
  description?: string
  badge?: string
  icon?: React.ReactNode
}

export interface DropdownSection {
  label: string
  items: DropdownItem[]
  footer?: {
    label: string
    to: string
  }
}

interface NavDropdownProps {
  label: string
  sections: DropdownSection[]
  /** Number of grid columns (default 2) */
  columns?: 1 | 2 | 3
}

const panelVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const } },
  exit: { opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" as const } },
}

/**
 * Mega-menu dropdown for Navbar.
 * Opens on hover (with 200ms close delay). Keyboard accessible:
 * click toggles, Escape closes, focus within keeps open.
 */
export function NavDropdown({ label, sections, columns = 2 }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const startCloseTimer = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }, [clearCloseTimer])

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const handleMouseLeave = useCallback(() => {
    startCloseTimer()
  }, [startCloseTimer])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape and return focus
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Cleanup timer on unmount
  useEffect(() => clearCloseTimer, [clearCloseTimer])

  const colsClass =
    columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-3" : "grid-cols-2"
  const panelWidth =
    columns === 1 ? "w-80" : columns === 3 ? "w-[820px]" : "w-[640px]"

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
          open
            ? "text-foreground bg-black/[0.05]"
            : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03]"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50",
              panelWidth
            )}
          >
            <div className="rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(15,23,42,0.18),0_8px_20px_-8px_rgba(15,23,42,0.12)] border border-slate-200/80 overflow-hidden ring-1 ring-slate-900/[0.03]">
              <div className={cn("grid gap-0", colsClass)}>
                {sections.map((section, idx) => (
                  <div
                    key={section.label}
                    className={cn(
                      "p-5",
                      idx > 0 &&
                        columns >= 2 &&
                        "border-l border-black/[0.05]"
                    )}
                  >
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-3 px-2.5">
                      {section.label}
                    </h3>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.to + item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-3 px-2.5 py-2.5 rounded-xl hover:bg-black/[0.03] transition-colors duration-150 group"
                          >
                            {item.icon && (
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary transition-colors duration-150 group-hover:bg-primary/[0.12]">
                                {item.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 border border-amber-200/60 rounded-full px-1.5 py-0.5">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {section.footer && (
                      <Link
                        to={section.footer.to}
                        onClick={() => setOpen(false)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all duration-200 px-2.5"
                      >
                        {section.footer.label}
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          &rarr;
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
