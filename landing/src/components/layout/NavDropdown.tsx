import { useEffect, useRef, useCallback, useId, createContext, useContext, useState } from "react"
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

/* ─── Coordinated open state across sibling dropdowns ─── */

interface NavDropdownCtx {
  activeIdRef: React.MutableRefObject<string | null>
  activeId: string | null
  setActive: (id: string | null) => void
}

const NavDropdownContext = createContext<NavDropdownCtx>({
  activeIdRef: { current: null },
  activeId: null,
  setActive: () => {},
})

export function NavDropdownGroup({ children }: { children: React.ReactNode }) {
  const [activeId, _setActive] = useState<string | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const setActive = useCallback((id: string | null) => {
    activeIdRef.current = id
    _setActive(id)
  }, [])
  return (
    <NavDropdownContext.Provider value={{ activeIdRef, activeId, setActive }}>
      {children}
    </NavDropdownContext.Provider>
  )
}

/* ─── Panel variants ─── */

const panelVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.985 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const },
  },
  exit: {
    opacity: 0, y: 2, scale: 0.99,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
}

/**
 * Mega-menu dropdown for Navbar. Wrap sibling dropdowns in <NavDropdownGroup>
 * so only one is open at a time (coordinated close).
 */
export function NavDropdown({ label, sections, columns = 2 }: NavDropdownProps) {
  const id = useId()
  const { activeIdRef, activeId, setActive } = useContext(NavDropdownContext)
  const open = activeId === id

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer()
    setActive(id) // Switching clears any previous active; prior panel AnimatePresence-exits
  }, [clearCloseTimer, id, setActive])

  const handleMouseLeave = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => {
      // Only clear if this dropdown is still the active one (mouse may have moved to a sibling)
      if (activeIdRef.current === id) setActive(null)
    }, 120)
  }, [clearCloseTimer, activeIdRef, id, setActive])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, setActive])

  // Close on Escape and return focus
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setActive])

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
        onClick={() => setActive(open ? null : id)}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-lg",
          open
            ? "text-foreground bg-[hsl(var(--ds-bg-2))]"
            : "text-[hsl(var(--ds-ink-2))] hover:text-foreground hover:bg-[hsl(var(--ds-bg-2))]"
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

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key={id}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50",
              panelWidth
            )}
          >
            <div className="rounded-[14px] bg-[hsl(var(--ds-surface))] shadow-[0_20px_60px_-12px_rgba(14,22,20,0.18),0_8px_20px_-8px_rgba(14,22,20,0.12)] border border-[hsl(var(--ds-rule))] overflow-hidden">
              <div className={cn("grid gap-0", colsClass)}>
                {sections.map((section, idx) => (
                  <div
                    key={section.label}
                    className={cn(
                      "p-5",
                      idx > 0 && columns >= 2 && "border-l border-[hsl(var(--ds-rule))]"
                    )}
                  >
                    <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3 px-2.5">
                      {section.label}
                    </h3>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.to + item.label}>
                          <Link
                            to={item.to}
                            onClick={() => setActive(null)}
                            className="flex items-start gap-3 px-2.5 py-2.5 rounded-[10px] hover:bg-[hsl(var(--ds-bg-2))] transition-colors duration-150 group"
                          >
                            {item.icon && (
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--ds-accent-soft))] text-[hsl(var(--ds-accent))] transition-colors duration-150 group-hover:bg-[hsl(var(--ds-accent))] group-hover:text-white">
                                {item.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[hsl(var(--ds-ink))] group-hover:text-[hsl(var(--ds-accent))] transition-colors duration-150">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-[hsl(var(--ds-cta-ink))] bg-[hsl(var(--ds-cta))] rounded-full px-1.5 py-0.5">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-[hsl(var(--ds-muted))] mt-0.5 leading-snug">
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
                        onClick={() => setActive(null)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--ds-accent))] hover:gap-2 transition-all duration-200 px-2.5"
                      >
                        {section.footer.label}
                        <span className="transition-transform duration-200">→</span>
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
