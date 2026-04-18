import { motion } from "framer-motion"
import {
  Mail,
  Send,
  Globe,
  Clock,
  CheckCircle,
  Paperclip,
} from "lucide-react"

type DeliveryStatus = "sent" | "delivered" | "opened" | "responded"

type Row = {
  flag: string
  name: string
  lang: string
  status: DeliveryStatus
}

const ROWS: Row[] = [
  { flag: "🇩🇪", name: "EcoPack Solutions GmbH", lang: "DE", status: "responded" },
  { flag: "🇵🇱", name: "Zielone Pudełka Sp. z o.o.", lang: "PL", status: "responded" },
  { flag: "🇮🇹", name: "Imballaggi Verdi SrL", lang: "IT", status: "opened" },
  { flag: "🇳🇱", name: "BioBox Netherlands BV", lang: "EN", status: "opened" },
  { flag: "🇫🇷", name: "Emballage Bio SAS", lang: "FR", status: "delivered" },
  { flag: "🇪🇸", name: "Envases Ecológicos SL", lang: "ES", status: "delivered" },
  { flag: "🇨🇿", name: "GreenPack CZ s.r.o.", lang: "CS", status: "sent" },
  { flag: "🇦🇹", name: "Verpackungs Austria GmbH", lang: "DE", status: "sent" },
]

const STATUS_ORDER: DeliveryStatus[] = ["sent", "delivered", "opened", "responded"]

function cellStyle(rowStatus: DeliveryStatus, colStatus: DeliveryStatus): string {
  const rowIdx = STATUS_ORDER.indexOf(rowStatus)
  const colIdx = STATUS_ORDER.indexOf(colStatus)
  if (colIdx > rowIdx) return "text-gray-300"
  if (colStatus === "responded") return "text-emerald-600"
  if (colStatus === "opened") return "text-amber-600"
  if (colStatus === "delivered") return "text-gray-500"
  return "text-brand-500"
}

function statusBadge(status: DeliveryStatus): { label: string; cls: string } {
  if (status === "responded") return { label: "Responded", cls: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-500/10" }
  if (status === "opened") return { label: "Opened", cls: "text-amber-700 bg-amber-50 ring-1 ring-amber-500/10" }
  if (status === "delivered") return { label: "Delivered", cls: "text-gray-600 bg-gray-100 ring-1 ring-gray-400/10" }
  return { label: "Sent", cls: "text-blue-700 bg-blue-50 ring-1 ring-blue-500/10" }
}

export function EmailOutreachMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden ring-1 ring-black/[0.03]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-foreground">RFQ — Packaging EU</h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold ring-1 ring-emerald-500/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-medium">+3d</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium">+7d</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium">+14d</span>
            <span className="ml-1 text-[9px] font-semibold uppercase tracking-wider text-brand-600">
              Follow-up
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm transition-colors">
            <Send className="h-3.5 w-3.5" />
            Send bulk
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-0">
        {/* Left: composer preview */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="border-b lg:border-b-0 lg:border-r border-border/60 p-5 bg-gray-50/30"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Composer
          </div>

          <div className="rounded-xl border border-border/60 bg-white p-3.5 mb-3">
            <div className="text-[10px] text-muted-foreground mb-1">Subject</div>
            <div className="text-xs font-bold text-foreground mb-3 leading-snug">
              RFQ — Biodegradable packaging, 50k units/month
            </div>
            <div className="text-[10px] text-muted-foreground mb-1">Body preview</div>
            <div className="text-[11px] text-foreground/80 leading-relaxed line-clamp-3">
              Hello, we are sourcing biodegradable packaging for our consumer goods line.
              Looking for tier-1 suppliers with FSC / ISO 14001 certification who can
              deliver 50,000 units per month across the EU...
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              spec-sheet.pdf
            </div>
          </div>

          <div className="rounded-xl border border-brand-200/60 bg-brand-50/40 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe className="h-3 w-3 text-brand-600" />
              <span className="text-[11px] font-bold text-brand-700">Auto-translated</span>
            </div>
            <div className="text-[10px] text-muted-foreground mb-1.5">
              Each supplier receives the RFQ in their native language
            </div>
            <div className="flex flex-wrap gap-1">
              {["DE", "PL", "IT", "FR", "ES", "NL", "CS"].map((l) => (
                <span
                  key={l}
                  className="px-1.5 py-0.5 rounded bg-white border border-border/60 text-[9px] font-bold text-brand-700"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: delivery tracker */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Delivery tracker
            </div>
            <div className="text-[11px] text-muted-foreground">Live · updated 12s ago</div>
          </div>

          <div className="rounded-xl border border-border/60 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-2 px-3 py-2 bg-gray-50/80 border-b border-border/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Supplier
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Sent
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Delivered
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Opened
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Status
              </div>
            </div>

            {/* Rows */}
            {ROWS.map((row, idx) => {
              const badge = statusBadge(row.status)
              return (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.06 }}
                  className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-2 px-3 py-2 items-center border-b border-border/40 last:border-0 hover:bg-slate-50/80 transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm leading-none shrink-0">{row.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-foreground truncate">{row.name}</div>
                      <div className="text-[9px] text-muted-foreground font-medium">{row.lang}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className={`h-3 w-3 mx-auto ${cellStyle(row.status, "sent")}`} />
                  </div>
                  <div className="text-center">
                    <CheckCircle className={`h-3 w-3 mx-auto ${cellStyle(row.status, "delivered")}`} />
                  </div>
                  <div className="text-center">
                    <CheckCircle className={`h-3 w-3 mx-auto ${cellStyle(row.status, "opened")}`} />
                  </div>
                  <div className="flex justify-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Stats footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="grid grid-cols-4 gap-2 mt-3 rounded-xl border border-border/60 bg-gradient-to-r from-gray-50/60 to-brand-50/30 px-3 py-2.5"
          >
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Sent</div>
              <div className="text-sm font-bold text-foreground">200</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Delivered</div>
              <div className="text-sm font-bold text-foreground">198</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Opened</div>
              <div className="text-sm font-bold text-amber-700">124</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Responded</div>
              <div className="text-sm font-bold text-emerald-700">41</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
