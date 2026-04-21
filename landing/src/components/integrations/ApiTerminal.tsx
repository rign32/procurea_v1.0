import { useState } from "react"
import { Key, Webhook, Code, CheckCircle2 } from "lucide-react"
import { apiSection } from "@/content/integrations"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type TabKey = "rest" | "webhooks" | "sdk"

const TABS: Array<{ key: TabKey; icon: typeof Key; labelEn: string; labelPl: string }> = [
  { key: "rest", icon: Key, labelEn: "REST API", labelPl: "REST API" },
  { key: "webhooks", icon: Webhook, labelEn: "Webhooks", labelPl: "Webhooks" },
  { key: "sdk", icon: Code, labelEn: "SDKs", labelPl: "SDK" },
]

export function ApiTerminal() {
  const [active, setActive] = useState<TabKey>("rest")
  const idx = active === "rest" ? 0 : active === "webhooks" ? 1 : 2
  const resource = apiSection.resources[idx]

  return (
    <div className="rounded-3xl bg-slate-950 text-slate-100 overflow-hidden shadow-[0_24px_64px_-16px_rgba(2,6,23,0.45)] border border-slate-800">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </div>
        <div className="ml-3 font-mono text-[11px] text-slate-400 tracking-[0.08em]">
          procurea.dev — developer platform
        </div>
        <div className="ml-auto font-mono text-[10.5px] text-slate-500 uppercase tracking-[0.14em]">
          v1
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "text-white bg-slate-800/70 border-b-2 border-primary"
                  : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {isEN ? t.labelEn : t.labelPl}
            </button>
          )
        })}
      </div>

      {/* Body — two columns: description+bullets + code snippet */}
      <div className="grid md:grid-cols-[1.1fr_1.4fr]">
        <div className="p-6 sm:p-8 border-r border-slate-800">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-3">
            {resource.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-5">
            {resource.description}
          </p>
          <ul className="space-y-2.5">
            {resource.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-400 font-bold">
              {resource.snippetLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10.5px] text-emerald-300 uppercase tracking-[0.08em]">
                {isEN ? "Live example" : "Przykład na żywo"}
              </span>
            </div>
          </div>
          <pre className="rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-[12.5px] leading-[1.6] p-4 overflow-x-auto font-mono">
            <code>{resource.snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
