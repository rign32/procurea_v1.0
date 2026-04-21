import { useMemo, useState } from "react"
import { ShieldCheck, AlertTriangle, CheckCircle2, Circle } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type Dimension = "financial" | "operational" | "geopolitical" | "esg" | "cyber"

interface Check {
  id: string
  dim: Dimension
  label: { en: string; pl: string }
  hint: { en: string; pl: string }
  weight: number // 1 = standard, 2 = auto-reject-able
}

const CHECKS: Check[] = [
  { id: "c1",  dim: "financial",    weight: 2, label: { en: "Credit score above sector median (D&B / Creditreform)", pl: "Rating kredytowy powyżej mediany branży (D&B / Creditreform)" }, hint: { en: "Below bottom quartile = auto-reject", pl: "Poniżej dolnego kwartyla = auto-odrzucenie" } },
  { id: "c2",  dim: "financial",    weight: 1, label: { en: "Revenue growth positive over 3 years", pl: "Wzrost przychodów dodatni przez 3 lata" }, hint: { en: "Regional DB filings show this", pl: "Sprawozdania regionalne pokazują" } },
  { id: "c3",  dim: "operational",  weight: 2, label: { en: "No single-plant concentration (>60% capacity)", pl: "Brak koncentracji na jednym zakładzie (>60% mocy)" }, hint: { en: "Single plant = single point of failure", pl: "Jeden zakład = jeden punkt awarii" } },
  { id: "c4",  dim: "operational",  weight: 1, label: { en: "PPM quality rate under 500 last 12 months", pl: "Współczynnik PPM poniżej 500 w ost. 12 miesiącach" }, hint: { en: "Industry median for machined parts", pl: "Mediana branży dla części obrabianych" } },
  { id: "c5",  dim: "geopolitical", weight: 2, label: { en: "Not on OFAC / EU sanctions list", pl: "Nie na liście sankcji OFAC / UE" }, hint: { en: "Run name + UBO through VIES + OFAC", pl: "Sprawdź nazwę + UBO w VIES + OFAC" } },
  { id: "c6",  dim: "geopolitical", weight: 1, label: { en: "Country risk rating Moody's Baa2 or better", pl: "Rating ryzyka kraju Moody's Baa2 lub lepszy" }, hint: { en: "Below Ba1 = auto-flag for review", pl: "Poniżej Ba1 = flaga do przeglądu" } },
  { id: "c7",  dim: "esg",          weight: 1, label: { en: "ISO 14001 or equivalent environmental cert", pl: "ISO 14001 lub równoważny cert. środowiskowy" }, hint: { en: "CSRD scope 3 reporting needs this", pl: "Raportowanie CSRD scope 3 tego wymaga" } },
  { id: "c8",  dim: "esg",          weight: 1, label: { en: "SMETA / BSCI / Sedex social audit in last 24m", pl: "Audyt społeczny SMETA / BSCI / Sedex w ost. 24 mies." }, hint: { en: "Required for EU retailers, growing trend", pl: "Wymagane dla detalu UE, trend rosnący" } },
  { id: "c9",  dim: "cyber",        weight: 2, label: { en: "ISO 27001 or evidence of active security program", pl: "ISO 27001 lub dowód aktywnego programu security" }, hint: { en: "Or SOC 2 Type II for SaaS suppliers", pl: "Lub SOC 2 Type II dla dostawców SaaS" } },
  { id: "c10", dim: "cyber",        weight: 1, label: { en: "Breach disclosure SLA ≤ 72 hours in contract", pl: "SLA zgłaszania incydentów ≤ 72h w umowie" }, hint: { en: "Matches GDPR / NIS2 requirement", pl: "Zgodne z GDPR / NIS2" } },
]

const DIM_COLORS: Record<Dimension, string> = {
  financial:    "bg-blue-50 text-blue-800 border-blue-200",
  operational:  "bg-purple-50 text-purple-800 border-purple-200",
  geopolitical: "bg-amber-50 text-amber-800 border-amber-200",
  esg:          "bg-emerald-50 text-emerald-800 border-emerald-200",
  cyber:        "bg-rose-50 text-rose-800 border-rose-200",
}

const DIM_LABELS: Record<Dimension, { en: string; pl: string }> = {
  financial:    { en: "Financial",    pl: "Finansowe" },
  operational:  { en: "Operational",  pl: "Operacyjne" },
  geopolitical: { en: "Geopolitical", pl: "Geopolityczne" },
  esg:          { en: "ESG",          pl: "ESG" },
  cyber:        { en: "Cyber",        pl: "Cyber" },
}

export function RiskChecklistWidget() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }

  const { score, autoReject } = useMemo(() => {
    const totalWeight = CHECKS.reduce((a, c) => a + c.weight, 0)
    const metWeight = CHECKS.filter(c => checked.has(c.id)).reduce((a, c) => a + c.weight, 0)
    const autoRejectFails = CHECKS.filter(c => c.weight === 2 && !checked.has(c.id))
    return {
      score: Math.round((metWeight / totalWeight) * 100),
      autoReject: autoRejectFails.length,
    }
  }, [checked])

  const hasAnyCheck = checked.size > 0
  const verdict = useMemo(() => {
    if (!hasAnyCheck) return { en: "Tick the checks you've verified", pl: "Odhacz punkty, które zweryfikowałeś", tone: "neutral" as const }
    if (score >= 85 && autoReject === 0) return { en: "Pass — proceed to RFQ", pl: "Zielone światło — RFQ", tone: "good" as const }
    if (score >= 65 && autoReject === 0) return { en: "Conditional — flag for review", pl: "Warunkowe — do przeglądu", tone: "warn" as const }
    if (autoReject >= 1 && score >= 40) return { en: "Auto-reject triggered", pl: "Auto-odrzucenie", tone: "bad" as const }
    return { en: "Too many gaps still", pl: "Jeszcze za mało spełnionych", tone: "warn" as const }
  }, [score, autoReject, hasAnyCheck])

  return (
    <div className="rounded-2xl bg-white border border-black/[0.08] overflow-hidden shadow-[0_4px_14px_rgba(11,18,32,0.06)]">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-black/[0.06] bg-gradient-to-br from-[#e7ecf5] to-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#162a52] font-bold mb-2">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? "10-point preview · live scoring" : "Podgląd 10-punktowy · scoring na żywo"}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 leading-tight">
              {isEN ? (
                <>Tick what you've verified — <em className="italic text-[#162a52]">get an instant verdict.</em></>
              ) : (
                <>Odhacz co zweryfikowane — <em className="italic text-[#162a52]">werdykt na żywo.</em></>
              )}
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              {isEN
                ? "Half the full checklist. The complete 20-point version has source URLs, cadence tables and printable one-pagers."
                : "Połowa pełnej checklisty. Wersja 20-punktowa ma źródła, tabele cykliczności i wydruki A4."}
            </p>
          </div>

          {/* Score gauge */}
          <div className="text-center min-w-[120px]">
            <div
              className={`text-5xl font-mono font-bold tabular-nums tracking-tight ${
                !hasAnyCheck ? "text-slate-300" :
                verdict.tone === "good" ? "text-emerald-600" :
                verdict.tone === "warn" ? "text-amber-600" :
                "text-rose-600"
              }`}
            >
              {score}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 mt-1">
              {isEN ? "Risk score" : "Wynik ryzyka"}
            </div>
          </div>
        </div>

        {/* Verdict banner */}
        <div
          className={`mt-4 p-3 rounded-lg flex gap-3 items-center border ${
            verdict.tone === "neutral" ? "bg-slate-50 border-slate-200 text-slate-700" :
            verdict.tone === "good" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
            verdict.tone === "warn" ? "bg-amber-50 border-amber-200 text-amber-900" :
            "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {verdict.tone === "good" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          ) : verdict.tone === "neutral" ? (
            <Circle className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          )}
          <div>
            <div className="font-bold text-sm">{verdict[isEN ? "en" : "pl"]}</div>
            {hasAnyCheck && autoReject >= 1 && (
              <div className="text-xs mt-0.5 opacity-85">
                {isEN
                  ? `${autoReject} high-weight check${autoReject > 1 ? "s" : ""} not met — investigate before proceeding.`
                  : `${autoReject} krytyczn${autoReject > 1 ? "ych" : "a"} kontrol${autoReject > 1 ? "i" : "a"} niespełnion${autoReject > 1 ? "ych" : "a"} — zbadaj przed decyzją.`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checks */}
      <ul className="divide-y divide-black/[0.05]">
        {CHECKS.map(c => {
          const isChecked = checked.has(c.id)
          const isAutoReject = c.weight === 2
          return (
            <li key={c.id} className={`p-4 sm:p-5 hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-emerald-50/30" : ""}`}>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className="flex gap-3 w-full text-left group"
                aria-pressed={isChecked}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {isChecked ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Circle className={`h-5 w-5 transition-colors ${isAutoReject ? "text-rose-400 group-hover:text-rose-600" : "text-slate-300 group-hover:text-slate-500"}`} aria-hidden="true" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[9.5px] uppercase tracking-[0.1em] font-bold ${DIM_COLORS[c.dim]}`}
                    >
                      {DIM_LABELS[c.dim][isEN ? "en" : "pl"]}
                    </span>
                    {isAutoReject && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[9.5px] uppercase tracking-[0.1em] font-bold">
                        {isEN ? "High weight" : "Krytyczne"}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${isChecked ? "text-slate-900" : "text-slate-800"}`}>
                    {c.label[isEN ? "en" : "pl"]}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{c.hint[isEN ? "en" : "pl"]}</div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RiskChecklistWidget
