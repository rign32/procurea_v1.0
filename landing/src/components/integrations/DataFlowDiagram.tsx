import { Search, GitMerge, CheckCircle2, RefreshCw } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

const steps = isEN
  ? [
      {
        icon: Search,
        step: "01",
        title: "Discover",
        body: "AI finds 250+ candidate suppliers from your brief. Sourcing pipeline runs in minutes, not weeks.",
      },
      {
        icon: GitMerge,
        step: "02",
        title: "Match to your ERP",
        body: "Every hit is checked against your Vendor master via VAT/NIP, domain, and fuzzy name match. Tagged as already-in, maybe-match, or new.",
      },
      {
        icon: CheckCircle2,
        step: "03",
        title: "Approve",
        body: "Buyer accepts, rejects, or routes new suppliers through your workflow. Deep-link opens the exact ERP record.",
      },
      {
        icon: RefreshCw,
        step: "04",
        title: "Sync bi-directionally",
        body: "Approved supplier auto-lands in your ERP (BP, Vendor, Account). Future updates reconcile nightly both ways.",
      },
    ]
  : [
      {
        icon: Search,
        step: "01",
        title: "Znajdź",
        body: "AI zwraca 250+ kandydatów dostawców z Twojego briefu. Pipeline sourcingu w minutach, nie tygodniach.",
      },
      {
        icon: GitMerge,
        step: "02",
        title: "Dopasuj do ERP",
        body: "Każdy hit sprawdzany w Twoim masterze vendorów — VAT/NIP, domena, fuzzy match nazwy. Tag: already-in, maybe-match, new.",
      },
      {
        icon: CheckCircle2,
        step: "03",
        title: "Zaakceptuj",
        body: "Buyer akceptuje, odrzuca lub routuje nowego dostawcę przez workflow. Deep-link otwiera rekord w ERP.",
      },
      {
        icon: RefreshCw,
        step: "04",
        title: "Synchronizuj dwukierunkowo",
        body: "Zaakceptowany dostawca ląduje w ERP (BP, Vendor, Account). Kolejne zmiany reconcile nocą w obie strony.",
      },
    ]

export function DataFlowDiagram() {
  return (
    <div className="relative">
      {/* Connecting line (desktop only) */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
        {steps.map((s, i) => {
          const Icon = s.icon
          const accentClass =
            i === 0
              ? "text-sky-700 bg-sky-50 ring-sky-100"
              : i === 1
              ? "text-violet-700 bg-violet-50 ring-violet-100"
              : i === 2
              ? "text-emerald-700 bg-emerald-50 ring-emerald-100"
              : "text-amber-700 bg-amber-50 ring-amber-100"
          return (
            <div key={s.step} className="relative">
              {/* Step number + icon */}
              <div className="flex items-center gap-3 mb-4 relative">
                <div
                  className={`relative z-10 inline-flex items-center justify-center h-16 w-16 rounded-2xl ring-8 ring-white ${accentClass}`}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  {s.step}
                </div>
              </div>

              <h3 className="text-xl font-bold font-display tracking-tight mb-2 text-slate-900">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
