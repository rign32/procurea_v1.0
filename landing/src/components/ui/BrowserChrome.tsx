import { Lock } from "lucide-react"
import { type ReactNode } from "react"

interface BrowserChromeProps {
  children: ReactNode
  url?: string
  variant?: "light" | "dark"
  className?: string
}

export function BrowserChrome({
  children,
  url = "app.procurea.pl/dashboard",
  variant = "light",
  className = "",
}: BrowserChromeProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border shadow-premium-lg ${
        isDark
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-black/[0.08]"
      } ${className}`}
    >
      {/* Chrome bar */}
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${
          isDark
            ? "bg-slate-925 border-slate-800"
            : "bg-slate-50 border-black/[0.06]"
        }`}
      >
        {/* Mac-style window dots */}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/90" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/90" />
          <div className="h-3 w-3 rounded-full bg-green-400/90" />
        </div>

        {/* URL bar */}
        <div
          className={`flex-1 max-w-md mx-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
            isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-white border border-black/[0.06] text-slate-500"
          }`}
        >
          <Lock className="h-3 w-3 shrink-0" />
          <span className="font-medium truncate">{url}</span>
        </div>

        {/* Right-side spacer for symmetry */}
        <div className="w-[52px]" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className={isDark ? "bg-slate-900" : "bg-white"}>{children}</div>
    </div>
  )
}
