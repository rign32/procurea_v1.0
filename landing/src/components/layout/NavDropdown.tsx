import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropdownSection {
  label: string
  items: {
    label: string
    to: string
    description?: string
    badge?: string
  }[]
  footer?: {
    label: string
    to: string
  }
}

interface NavDropdownProps {
  label: string
  sections: DropdownSection[]
  /** How many columns in the mega-menu panel (default 2). */
  columns?: 1 | 2
}

/**
 * Mega-menu dropdown for Navbar. Click trigger (accessibility-friendly),
 * closes on outside click, Escape, or route change. Keyboard focusable.
 */
export function NavDropdown({ label, sections, columns = 2 }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const gridCols = columns === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors rounded-lg',
          open
            ? 'text-foreground bg-black/[0.04]'
            : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.03]'
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50',
            columns === 2 ? 'w-[640px]' : 'w-72'
          )}
        >
          <div className="rounded-2xl bg-white shadow-2xl border border-black/[0.08] overflow-hidden">
            <div className={cn('grid gap-0', gridCols)}>
              {sections.map((section, idx) => (
                <div
                  key={section.label}
                  className={cn(
                    'p-5',
                    idx > 0 && columns === 2 && 'border-l border-black/[0.06]'
                  )}
                >
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    {section.label}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.to + item.label}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="block px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-1.5 py-0.5">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                              {item.description}
                            </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {section.footer && (
                    <Link
                      to={section.footer.to}
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all px-2.5"
                    >
                      {section.footer.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
