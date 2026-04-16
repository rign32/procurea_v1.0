import { useEffect, useState } from "react"
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
 * Cal.com inline embed with a 30-min intro slot (procurea/15min).
 * The Cal widget loads client-side only — SSR/prerender skips it to avoid
 * hydration mismatches.
 */
export function CalEmbed({
  calLink = "procurea/15min",
  namespace = "15min",
  height = 640,
}: CalEmbedProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    ;(async () => {
      const cal = await getCalApi({ namespace })
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" })
    })()
  }, [namespace])

  if (!mounted) {
    return (
      <div
        className="w-full rounded-2xl border border-black/[0.08] bg-slate-50 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-sm text-muted-foreground">Loading calendar…</div>
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
          // the Cal SDK expects string here in their example
          useSlotsViewOnSmallScreen: "true" as unknown as string,
        }}
      />
    </div>
  )
}
