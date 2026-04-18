import { motion } from "framer-motion"
import {
  Star,
  Download,
  Sparkles,
  BarChart3,
  MessageSquare,
  ChevronDown,
  TrendingDown,
} from "lucide-react"

type Offer = {
  supplier: string
  flag: string
  price1k: string
  price10k: string
  moq: string
  leadTime: string
  certs: string[]
  score: number
}

const OFFERS: Offer[] = [
  {
    supplier: "EcoPack Solutions GmbH",
    flag: "🇩🇪",
    price1k: "€2.10",
    price10k: "€1.85",
    moq: "500",
    leadTime: "4w",
    certs: ["ISO 14001", "FSC"],
    score: 92,
  },
  {
    supplier: "Zielone Pudełka Sp. z o.o.",
    flag: "🇵🇱",
    price1k: "€2.05",
    price10k: "€1.92",
    moq: "1,000",
    leadTime: "5w",
    certs: ["FSC", "BRC"],
    score: 88,
  },
  {
    supplier: "BioBox Netherlands BV",
    flag: "🇳🇱",
    price1k: "€2.25",
    price10k: "€1.95",
    moq: "750",
    leadTime: "3w",
    certs: ["ISO 14001"],
    score: 85,
  },
  {
    supplier: "Imballaggi Verdi SrL",
    flag: "🇮🇹",
    price1k: "€2.35",
    price10k: "€2.08",
    moq: "500",
    leadTime: "6w",
    certs: ["PEFC"],
    score: 79,
  },
  {
    supplier: "GreenPack CZ s.r.o.",
    flag: "🇨🇿",
    price1k: "€2.20",
    price10k: "€2.05",
    moq: "2,000",
    leadTime: "7w",
    certs: ["FSC"],
    score: 74,
  },
]

function scoreCls(score: number): string {
  if (score >= 90) return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-500/10"
  if (score >= 80) return "text-amber-700 bg-amber-50 ring-1 ring-amber-500/10"
  return "text-gray-600 bg-gray-100 ring-1 ring-gray-400/10"
}

export function OfferComparisonMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden ring-1 ring-black/[0.03]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 border-b border-border/60 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-foreground">5 offers received</h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold ring-1 ring-emerald-500/10">
            Ready to compare
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Ranking by
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-white text-[11px] font-semibold text-foreground">
            Price + Lead Time
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-0">
        {/* Left: comparison table */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-border/60">
          <div className="rounded-xl border border-border/60 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1.8fr_0.8fr_0.8fr_0.6fr_0.6fr_0.9fr_0.7fr] gap-2 px-3 py-2 bg-gray-50/80 border-b border-border/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Supplier</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">@ 1k</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">@ 10k</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">MOQ</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Lead</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Certs</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Score</div>
            </div>

            {OFFERS.map((offer, idx) => {
              const isBest = idx === 0
              return (
                <motion.div
                  key={offer.supplier}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.08 }}
                  className={`grid grid-cols-[1.8fr_0.8fr_0.8fr_0.6fr_0.6fr_0.9fr_0.7fr] gap-2 px-3 py-2.5 items-center border-b border-border/40 last:border-0 hover:bg-slate-50/80 transition-colors duration-150 ${
                    isBest ? "border-emerald-400/50 bg-emerald-50/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm leading-none shrink-0">{offer.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-foreground truncate">{offer.supplier}</span>
                      </div>
                      {isBest && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                            Recommended
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-foreground text-right font-mono">{offer.price1k}</div>
                  <div className="text-[11px] font-semibold text-foreground text-right font-mono">{offer.price10k}</div>
                  <div className="text-[11px] text-muted-foreground text-right font-mono">{offer.moq}</div>
                  <div className="text-[11px] text-muted-foreground text-right font-mono">{offer.leadTime}</div>
                  <div className="flex flex-wrap gap-0.5">
                    {offer.certs.map((c) => (
                      <span key={c} className="px-1 py-0.5 rounded text-[8px] font-medium bg-gray-100 text-gray-600">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${scoreCls(offer.score)}`}>
                      {offer.score}%
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Savings callout */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl border border-emerald-200/60 bg-emerald-50/40"
          >
            <TrendingDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-emerald-800">
              <span className="font-bold">12% savings</span> vs. current supplier on 10k volume tier
            </div>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-5 bg-gray-50/30"
        >
          {/* AI Insights */}
          <div className="rounded-xl border border-brand-200/60 bg-gradient-to-br from-brand-50/60 to-white p-3.5 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">AI Insights</span>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
              <span className="font-bold text-foreground">Best value: EcoPack GmbH.</span>{" "}
              Negotiation leverage <span className="font-bold">8%</span> — two suppliers within
              5% of their price with faster lead time.
            </p>
            <div className="rounded-lg bg-white/60 border border-border/40 p-2 text-[10px] text-muted-foreground leading-relaxed">
              Consider splitting volume: 70% to EcoPack (long-term), 30% to BioBox NL (faster 3w
              delivery for urgent orders).
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Counter-offer
            </button>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border/60 text-foreground text-xs font-semibold hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border/60 text-foreground text-xs font-semibold hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export PPTX
            </button>
          </div>

          {/* Decision helper */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Decision criteria
            </div>
            <div className="space-y-1">
              {[
                { label: "Price weight", value: "40%" },
                { label: "Lead time weight", value: "30%" },
                { label: "Certifications", value: "20%" },
                { label: "Risk", value: "10%" },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-bold text-foreground font-mono">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
