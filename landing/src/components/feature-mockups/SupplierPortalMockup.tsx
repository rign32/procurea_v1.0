import { motion } from "framer-motion"
import {
  CheckCircle,
  Paperclip,
  Shield,
  Clock,
  Globe,
  Building2,
  FileText,
} from "lucide-react"

type StepState = "done" | "active" | "pending"

const STEPS: { n: number; label: string; state: StepState }[] = [
  { n: 1, label: "Basics", state: "done" },
  { n: 2, label: "Pricing", state: "active" },
  { n: 3, label: "Attachments", state: "pending" },
  { n: 4, label: "Review", state: "pending" },
]

const TIERS = [
  { range: "1 – 999 units", price: "€2.40" },
  { range: "1,000 – 9,999 units", price: "€2.10" },
  { range: "10,000+ units", price: "€1.85" },
]

function stepCircleCls(state: StepState): string {
  if (state === "done") return "bg-emerald-500 text-white border-emerald-500"
  if (state === "active") return "bg-brand-600 text-white border-brand-600"
  return "bg-white text-gray-400 border-gray-200"
}

function stepLabelCls(state: StepState): string {
  if (state === "done") return "text-emerald-700"
  if (state === "active") return "text-brand-700 font-bold"
  return "text-gray-400"
}

export function SupplierPortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden ring-1 ring-black/[0.03]"
    >
      {/* Portal header — external supplier-facing view */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-white/60 leading-none mb-0.5">Invited by Northwind Industries</div>
            <div className="text-sm font-bold">Welcome, Acme Packaging GmbH</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/70">
            <Shield className="h-3 w-3" />
            Secure link
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-semibold">
            <Globe className="h-3 w-3" />
            <select className="bg-transparent appearance-none outline-none cursor-pointer pr-1">
              <option>DE</option>
              <option>EN</option>
              <option>PL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-gray-50/40"
      >
        {STEPS.map((step, idx) => (
          <div key={step.n} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${stepCircleCls(step.state)}`}
              >
                {step.state === "done" ? <CheckCircle className="h-3 w-3" /> : step.n}
              </div>
              <div className={`text-xs ${stepLabelCls(step.state)}`}>{step.label}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${
                  step.state === "done" ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </motion.div>

      <div className="p-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-4"
        >
          <h4 className="text-sm font-bold text-foreground mb-1">Step 2 · Pricing</h4>
          <p className="text-[11px] text-muted-foreground">Provide your volume-based pricing tiers, MOQ, and delivery terms.</p>
        </motion.div>

        {/* Price tiers table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-xl border border-border/60 overflow-hidden mb-4"
        >
          <div className="grid grid-cols-[1.8fr_1fr_auto] gap-2 px-3 py-2 bg-gray-50/80 border-b border-border/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volume tier</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit price</div>
            <div className="w-6" />
          </div>
          {TIERS.map((tier) => (
            <div
              key={tier.range}
              className="grid grid-cols-[1.8fr_1fr_auto] gap-2 px-3 py-2.5 items-center border-b border-border/40 last:border-0"
            >
              <div className="text-xs font-medium text-foreground">{tier.range}</div>
              <div className="text-xs font-bold text-foreground font-mono">{tier.price}</div>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          ))}
        </motion.div>

        {/* Inputs grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
        >
          <div className="rounded-xl border border-border/60 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              MOQ
            </div>
            <div className="text-sm font-bold text-foreground">500 units</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Lead time
            </div>
            <div className="text-sm font-bold text-foreground">4 weeks</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Incoterms
            </div>
            <div className="text-sm font-bold text-foreground">EXW Hamburg</div>
          </div>
        </motion.div>

        {/* Attachments preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="rounded-xl border border-dashed border-border bg-gray-50/40 p-3 mb-4"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-foreground">Attachments</span>
            <span className="text-[10px] text-muted-foreground">(2)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "sample.pdf", size: "1.2 MB" },
              { name: "certificate.pdf", size: "840 KB" },
            ].map((f) => (
              <div
                key={f.name}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-border/60"
              >
                <FileText className="h-3 w-3 text-brand-600" />
                <span className="text-[11px] font-medium text-foreground">{f.name}</span>
                <span className="text-[9px] text-muted-foreground">{f.size}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 border-t border-border/60 bg-gray-50/60">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Valid until <span className="font-semibold text-foreground">30.04.2026</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-gray-100">
            Back
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm">
            Save & continue
            <CheckCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
