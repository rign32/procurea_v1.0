import { motion } from "framer-motion"
import {
  Brain,
  Search,
  BarChart3,
  Sparkles,
  Download,
  MapPin,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react"

type AgentStatus = "done" | "running" | "queued"

type Agent = {
  name: string
  icon: typeof Brain
  progress: number
  status: AgentStatus
  gradient: string
  iconBg: string
  iconColor: string
}

const AGENTS: Agent[] = [
  {
    name: "Strategy",
    icon: Brain,
    progress: 100,
    status: "done",
    gradient: "from-teal-500 to-teal-700",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    name: "Scanning",
    icon: Search,
    progress: 74,
    status: "running",
    gradient: "from-amber-400 to-amber-600",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    name: "Analysis",
    icon: BarChart3,
    progress: 32,
    status: "running",
    gradient: "from-slate-400 to-slate-600",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    name: "Enrichment",
    icon: Sparkles,
    progress: 0,
    status: "queued",
    gradient: "from-emerald-400 to-emerald-600",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
]

const SUPPLIERS = [
  { flag: "🇩🇪", name: "EcoPack Solutions GmbH", country: "Hamburg, DE", score: 92, certs: ["ISO 14001", "FSC"] },
  { flag: "🇵🇱", name: "Zielone Pudełka Sp. z o.o.", country: "Wrocław, PL", score: 91, certs: ["FSC", "BRC"] },
  { flag: "🇳🇱", name: "BioBox Netherlands BV", country: "Rotterdam, NL", score: 85, certs: ["ISO 14001"] },
  { flag: "🇮🇹", name: "Imballaggi Verdi SrL", country: "Milano, IT", score: 78, certs: ["PEFC"] },
]

function statusLabel(status: AgentStatus): string {
  if (status === "done") return "Done"
  if (status === "running") return "In progress"
  return "Queued"
}

function statusStyle(status: AgentStatus): string {
  if (status === "done") return "text-emerald-700 bg-emerald-50"
  if (status === "running") return "text-amber-700 bg-amber-50"
  return "text-gray-500 bg-gray-100"
}

export function AiSourcingMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden ring-1 ring-black/[0.03]"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-foreground">Packaging EU</h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Running
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <Clock className="h-3 w-3" />
          00:12:34
        </div>
      </div>

      <div className="p-5">
        {/* Agents grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {AGENTS.map((agent, idx) => {
            const Icon = agent.icon
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.1 }}
                className="rounded-xl border border-border/60 bg-white p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-md ${agent.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 ${agent.iconColor}`} />
                    </div>
                    <span className="text-xs font-bold text-foreground">{agent.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusStyle(agent.status)}`}>
                    {statusLabel(agent.status)}
                  </span>
                </div>
                <div className="relative h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${agent.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${agent.gradient}`}
                  />
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground">
                  {agent.progress}%
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Live supplier stream counter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-brand-50/40 to-emerald-50/40 px-4 py-3 mb-4"
        >
          <Loader2 className="h-4 w-4 text-brand-500 animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground">Live supplier stream</div>
            <div className="text-[11px] text-muted-foreground">Qualified suppliers matching your brief</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
              183
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">found</span>
          </div>
        </motion.div>

        {/* Supplier preview list */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-foreground">Latest matches</span>
            <span className="text-[11px] text-muted-foreground">Auto-ranked by capability fit</span>
          </div>
          <div className="space-y-2">
            {SUPPLIERS.map((s, idx) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-white p-3 hover:shadow-sm transition-shadow"
              >
                <span className="text-lg leading-none">{s.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{s.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {s.country}
                  </div>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 max-w-[140px] justify-end">
                  {s.certs.map((c) => (
                    <span key={c} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-600">
                      {c}
                    </span>
                  ))}
                </div>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                    s.score >= 90
                      ? "text-emerald-700 bg-emerald-50"
                      : s.score >= 70
                        ? "text-amber-700 bg-amber-50"
                        : "text-gray-600 bg-gray-100"
                  }`}
                >
                  {s.score}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-gray-50/60">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Ready for outreach — 183 verified suppliers
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm">
          <Download className="h-3.5 w-3.5" />
          Export to Excel
        </button>
      </div>
    </motion.div>
  )
}
