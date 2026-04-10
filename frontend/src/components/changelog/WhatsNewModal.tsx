import { useState, useEffect, useCallback } from "react"
import { Sparkles, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { isEN } from "@/i18n"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { changelog } from "@/data/changelog"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "procurea_lastSeenVersion"

function getLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setLastSeenVersion(version: string) {
  try {
    localStorage.setItem(STORAGE_KEY, version)
  } catch {
    // localStorage unavailable
  }
}

function isNewerVersion(current: string, lastSeen: string | null): boolean {
  if (!lastSeen) return true
  const parse = (v: string) => v.split(".").map(Number)
  const c = parse(current)
  const l = parse(lastSeen)
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cv = c[i] ?? 0
    const lv = l[i] ?? 0
    if (cv > lv) return true
    if (cv < lv) return false
  }
  return false
}

export function WhatsNewModal() {
  const [open, setOpen] = useState(false)

  const latestEntry = changelog[0]
  const latestVersion = latestEntry?.version ?? ''

  // Auto-show on first visit when there's a new version
  useEffect(() => {
    if (!latestEntry) return
    const lastSeen = getLastSeenVersion()
    if (isNewerVersion(latestVersion, lastSeen)) {
      // Small delay so the app renders first
      const timer = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [latestEntry, latestVersion])

  const handleClose = useCallback(() => {
    setOpen(false)
    setLastSeenVersion(latestVersion)
  }, [latestVersion])

  const handleOpenManually = useCallback(() => {
    setOpen(true)
  }, [])

  if (!latestEntry) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return isEN
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : date.toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <>
      {/* Sidebar trigger button */}
      <button
        onClick={handleOpenManually}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground w-full"
      >
        <Sparkles className="h-4 w-4" />
        {isEN ? "What's New" : "Co nowego"}
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isEN ? latestEntry.title.en : latestEntry.title.pl}
              </DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">
                v{latestEntry.version}
              </Badge>
              <span>{formatDate(latestEntry.date)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2">
            <AnimatePresence>
              <ul className="space-y-2">
                {latestEntry.items.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="flex items-start gap-2.5 rounded-md p-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{isEN ? item.en : item.pl}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full sm:w-auto">
              {isEN ? "Got it!" : "Rozumiem!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
