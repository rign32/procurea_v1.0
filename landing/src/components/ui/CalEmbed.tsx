import { useEffect, useRef, useState } from "react"
import Cal, { getCalApi } from "@calcom/embed-react"

interface CalEmbedProps {
  /** Cal.com link, e.g. "procurea/15min" */
  calLink?: string
  /** Namespace used to initialize Cal API */
  namespace?: string
  /** Inline height in px; defaults to 640 */
  height?: number
}

/**
 * Cal.com inline embed with lazy loading — only mounts when the container
 * scrolls into view, avoiding heavy 3rd-party JS on initial page load.
 */
export function CalEmbed({
  calLink = "procurea/15min",
  namespace = "15min",
  height = 640,
}: CalEmbedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [calReady, setCalReady] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Lazy-load: only start when in viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Init Cal API once visible
  useEffect(() => {
    if (!isVisible) return
    setCalReady(true)
    ;(async () => {
      const cal = await getCalApi({ namespace })
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" })
    })()
  }, [isVisible, namespace])

  if (!calReady) {
    return (
      <div
        ref={sentinelRef}
        className="w-full rounded-2xl border border-black/[0.08] bg-slate-50 flex items-center justify-center animate-pulse"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <div className="text-sm text-muted-foreground">Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.08]">
      <Cal
        namespace={namespace}
        calLink={calLink}
        style={{ width: "100%", height: `${height}px`, overflow: "auto" }}
        config={{
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true" as unknown as string,
        }}
      />
    </div>
  )
}
