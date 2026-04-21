import { useMemo, useState } from "react"
import { TrendingDown, RefreshCcw, Check } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

type Scenario = "baseline" | "redsea" | "cbam" | "fx"

interface SupplierInputs {
  id: string
  country: string
  flag: string
  unitPrice: number      // EUR/unit
  freight: number        // EUR/unit
  duty: number           // % of unit price
  leadTimeDays: number
  defectPpm: number
  cbamTonneEur: number   // EUR per tonne CO2e, weight ratio fixed
}

const DEFAULTS: SupplierInputs[] = [
  { id: "cn", country: "China",   flag: "🇨🇳", unitPrice: 8.95,  freight: 2.10, duty: 5,  leadTimeDays: 45, defectPpm: 1800, cbamTonneEur: 30 },
  { id: "tr", country: "Turkey",  flag: "🇹🇷", unitPrice: 10.40, freight: 0.85, duty: 0,  leadTimeDays: 12, defectPpm: 900,  cbamTonneEur: 0  },
  { id: "pl", country: "Poland",  flag: "🇵🇱", unitPrice: 11.20, freight: 0.35, duty: 0,  leadTimeDays: 5,  defectPpm: 600,  cbamTonneEur: 0  },
]

const SCENARIO_LABELS: Record<Scenario, { en: string; pl: string; hint: { en: string; pl: string } }> = {
  baseline: { en: "Baseline", pl: "Bazowe", hint: { en: "Apr 2026 freight indices, no shocks", pl: "Indeksy frachtu kwi 2026, brak szoków" } },
  redsea:   { en: "Red Sea delay", pl: "Morze Czerwone", hint: { en: "+14 days lead time, +40% ocean freight for CN", pl: "+14 dni, +40% fracht oceanu dla CN" } },
  cbam:     { en: "CBAM escalation", pl: "CBAM w górę", hint: { en: "CBAM €80/t from 2028 for non-EU steel", pl: "CBAM €80/t od 2028 dla stali spoza UE" } },
  fx:       { en: "EUR/CNY +8%", pl: "EUR/CNY +8%", hint: { en: "CNY weakening — CN unit price drops 8%", pl: "CNY słabnie — cena jedn. CN spada 8%" } },
}

// Landed cost = (unit + unit*duty%) + freight + inventory_carry(lead-time based) + defect_cost(ppm based) + cbam
const CARRY_RATE_ANNUAL = 0.20          // 20% per year
const DEFECT_REWORK_MULTIPLIER = 3       // 3x unit price per defect
const WEIGHT_KG_PER_UNIT = 2             // 2kg per unit for CBAM CO2 calc
const CO2_KG_PER_KG_STEEL = 1.9          // generic steel EF

function landedCost(s: SupplierInputs, scenario: Scenario): number {
  let unit = s.unitPrice
  let freight = s.freight
  let leadDays = s.leadTimeDays
  let cbam = s.cbamTonneEur

  if (scenario === "redsea" && s.id === "cn") {
    leadDays += 14
    freight *= 1.4
  }
  if (scenario === "cbam" && s.cbamTonneEur > 0) {
    cbam = 80
  }
  if (scenario === "fx" && s.id === "cn") {
    unit *= 0.92
  }

  const dutyCost = unit * (s.duty / 100)
  const inventoryCarry = ((unit + freight + dutyCost) * CARRY_RATE_ANNUAL * leadDays) / 365
  const defectCost = (s.defectPpm / 1_000_000) * unit * DEFECT_REWORK_MULTIPLIER
  const cbamCostPerUnit = (WEIGHT_KG_PER_UNIT * CO2_KG_PER_KG_STEEL * cbam) / 1000

  return unit + freight + dutyCost + inventoryCarry + defectCost + cbamCostPerUnit
}

function formatEur(n: number): string {
  return new Intl.NumberFormat(isEN ? "en-GB" : "pl-PL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n)
}

export function TcoCalculatorWidget() {
  const [suppliers] = useState<SupplierInputs[]>(DEFAULTS)
  const [scenario, setScenario] = useState<Scenario>("baseline")
  const [volume, setVolume] = useState(50_000)

  const rows = useMemo(() => {
    return suppliers
      .map(s => ({
        ...s,
        landed: landedCost(s, scenario),
        baseline: landedCost(s, "baseline"),
      }))
      .sort((a, b) => a.landed - b.landed)
  }, [suppliers, scenario])

  const winner = rows[0]
  const baselineWinner = useMemo(() => {
    return [...suppliers].map(s => ({ ...s, landed: landedCost(s, "baseline") })).sort((a, b) => a.landed - b.landed)[0]
  }, [suppliers])

  const winnerFlipped = winner.id !== baselineWinner.id

  return (
    <div className="rounded-2xl bg-white border border-black/[0.08] overflow-hidden shadow-[0_4px_14px_rgba(11,18,32,0.06)]">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-black/[0.06] bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0f7a4f] font-bold mb-2">
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? "Live TCO preview" : "Podgląd TCO na żywo"}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 leading-tight">
              {isEN ? (
                <>Change the scenario — <em className="italic text-[#0f7a4f]">see the winner flip.</em></>
              ) : (
                <>Zmień scenariusz — <em className="italic text-[#0f7a4f]">zobacz jak zwycięzca się zmienia.</em></>
              )}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-[56ch]">
              {isEN
                ? "This mini is three cost levers on a packaging RFQ. The full workbook has 10 categories and a live sensitivity dashboard."
                : "Mini pokazuje 3 dźwignie kosztowe na RFQ opakowaniowym. Pełny arkusz ma 10 kategorii i dashboard wrażliwości."}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario pills */}
      <div className="px-5 sm:px-6 pt-5 pb-2 flex gap-2 flex-wrap">
        {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              scenario === s
                ? "bg-[#0f7a4f] text-white border-[#0f7a4f]"
                : "bg-white text-slate-700 border-black/[0.08] hover:border-[#0f7a4f] hover:text-[#0f7a4f]"
            }`}
          >
            {SCENARIO_LABELS[s][isEN ? "en" : "pl"]}
          </button>
        ))}
      </div>
      <p className="px-5 sm:px-6 pb-3 font-mono text-[10.5px] uppercase tracking-[0.04em] text-slate-500">
        {SCENARIO_LABELS[scenario].hint[isEN ? "en" : "pl"]}
      </p>

      {/* Volume slider */}
      <div className="px-5 sm:px-6 py-3 border-t border-black/[0.04] bg-slate-50 flex items-center gap-4 flex-wrap">
        <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-600 font-bold">
          {isEN ? "Annual volume" : "Wolumen roczny"}
        </label>
        <input
          type="range"
          min={5_000}
          max={500_000}
          step={5_000}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-[#0f7a4f]"
          aria-label={isEN ? "Annual volume in units" : "Wolumen roczny w sztukach"}
        />
        <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums min-w-[90px] text-right">
          {volume.toLocaleString(isEN ? "en-GB" : "pl-PL")} {isEN ? "units" : "szt"}
        </span>
      </div>

      {/* Table */}
      <div className="p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/[0.08]">
                <th className="text-left py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold">
                  {isEN ? "Supplier" : "Dostawca"}
                </th>
                <th className="text-right py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold">
                  {isEN ? "Unit" : "Jedn."}
                </th>
                <th className="text-right py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold">
                  {isEN ? "Landed" : "Landed"}
                </th>
                <th className="text-right py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold">
                  {isEN ? "Annual cost" : "Roczny koszt"}
                </th>
                <th className="text-right py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold">
                  {isEN ? "vs. best" : "vs. najtańszy"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isWinner = i === 0
                const delta = r.landed - winner.landed
                const annualCost = r.landed * volume
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-black/[0.04] ${isWinner ? "bg-emerald-50/50" : ""}`}
                  >
                    <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{r.flag}</span>
                      {r.country}
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[9px] uppercase tracking-[0.1em] font-bold">
                          <Check className="h-2.5 w-2.5" aria-hidden="true" />
                          {isEN ? "Win" : "Wygrywa"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                      {formatEur(r.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatEur(r.landed)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                      {formatEur(annualCost)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      {isWinner ? (
                        <span className="text-emerald-700 font-bold">—</span>
                      ) : (
                        <span className="text-rose-600">+{formatEur(delta * volume)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {winnerFlipped && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
            <RefreshCcw className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-amber-900 leading-relaxed">
              <strong className="font-bold">{isEN ? "Winner flipped." : "Zwycięzca się zmienił."}</strong>{" "}
              {isEN
                ? `${baselineWinner.flag} ${baselineWinner.country} wins the baseline scenario, but under "${SCENARIO_LABELS[scenario].en}" ${winner.flag} ${winner.country} takes the lead. This is exactly the kind of sensitivity your Finance team wants to see before committing.`
                : `${baselineWinner.flag} ${baselineWinner.country} wygrywa w scenariuszu bazowym, ale w "${SCENARIO_LABELS[scenario].pl}" to ${winner.flag} ${winner.country} wychodzi na prowadzenie. Właśnie taką analizę wrażliwości chce widzieć Twój CFO przed decyzją.`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TcoCalculatorWidget
