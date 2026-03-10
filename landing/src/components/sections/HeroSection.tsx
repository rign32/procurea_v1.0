import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import {
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingDown,
  Users,
  BarChart3,
  Shield,
  MapPin,
  Building2,
  BookOpen,
  Settings,
  LayoutDashboard,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

const statIcons = [Users, Zap, TrendingDown]
const statColors = ["text-indigo-500", "text-amber-500", "text-emerald-500"]

const sidebarIcons = [LayoutDashboard, Search, Building2, BookOpen, Settings]

const agentColors = [
  { color: "bg-emerald-500", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { color: "bg-orange-500", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { color: "bg-red-400", iconBg: "bg-red-100", iconColor: "text-red-500" },
  { color: "bg-emerald-500", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
]

const supplierFlags = ["🇩🇪", "🇩🇪", "🇩🇪"]
const supplierScores = [83, 92, 64]
const supplierCerts = [["ISO 9001", "ISO 14001", "ISO 50001"], ["ISO 9001"], ["ISO 9001"]]

export function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const sidebarKeys = ['dashboard', 'campaigns', 'suppliers', 'registry', 'settings'] as const
  const sidebarActive = [false, true, false, false, false]

  return (
    <section className="relative overflow-hidden pt-16">
      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[100px]"
          style={{
            background: "radial-gradient(circle, #6366f1, #8b5cf6, transparent 70%)",
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[80px]"
          style={{
            background: "radial-gradient(circle, #3b82f6, #06b6d4, transparent 70%)",
            transform: `translate(${mousePos.x * -4}px, ${mousePos.y * -4}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-16 sm:pt-24 lg:pt-32 pb-16 lg:pb-20 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-700 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t.hero.badge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6"
          >
            {t.hero.headlinePart1}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500 bg-clip-text text-transparent">
              {t.hero.headlineHighlight}
            </span>
            {t.hero.headlinePart2}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            {t.hero.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackCtaClick('hero_primary')}>
              <Button size="lg" className="group text-base px-8 py-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all">
                {t.hero.ctaPrimary}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href={`#${t.sectionIds.howItWorks}`} onClick={() => trackCtaClick('hero_how_it_works')}>
              <Button variant="secondary" size="lg" className="text-base px-8 py-4">
                {t.hero.ctaSecondary}
              </Button>
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {t.hero.trustFreeAccess}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {t.hero.trustNoCreditCard}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {t.hero.trustBeta}
            </span>
          </motion.div>
        </div>

        {/* ===== Platform Visualization ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative max-w-5xl mx-auto pb-20 lg:pb-28"
        >
          <div className="absolute -inset-6 bg-gradient-to-b from-indigo-500/[0.08] via-violet-500/[0.06] to-blue-500/[0.03] rounded-3xl blur-3xl pointer-events-none" />
          <div className="absolute -inset-8 bg-gradient-to-tr from-indigo-400/[0.04] via-transparent to-violet-400/[0.04] rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl border border-border/60 bg-white shadow-2xl shadow-indigo-500/[0.06] overflow-hidden ring-1 ring-black/[0.03]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-border/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-white border border-border/60 text-xs text-muted-foreground w-64 justify-center">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  {t.hero.browserUrl}
                </div>
              </div>
              <div className="w-[54px]" />
            </div>

            {/* App content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden lg:flex flex-col w-48 border-r border-border/50 bg-gray-50/50 py-4 px-3 shrink-0">
                <div className="flex items-center gap-2 px-2 mb-5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <span className="text-xs font-bold">P</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">Procurea</span>
                </div>

                <nav className="flex flex-col gap-0.5">
                  {sidebarKeys.map((key, i) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                        sidebarActive[i]
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {(() => { const Icon = sidebarIcons[i]; return <Icon className="h-3.5 w-3.5" /> })()}
                      {t.hero.sidebar[key]}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main content area */}
              <div className="flex-1 min-w-0">
                <div className="px-4 sm:px-5 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-0.5">
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">{t.hero.mockup.campaignTitle}</h3>
                  </div>
                  <div className="flex items-center gap-2 ml-5.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                      {t.hero.mockup.statusInProgress}
                    </span>
                    <span>{t.hero.mockup.createdAt}</span>
                    <span>·</span>
                    <span>{t.hero.mockup.region}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        {t.hero.mockup.agents.map((agent, idx) => (
                          <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 1.0 + idx * 0.1 }}
                            className="rounded-xl border border-border/60 bg-white p-3.5 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${agentColors[idx].color} ring-2 ring-offset-1 ${agentColors[idx].color}/20`} />
                              <span className="text-xs font-bold text-foreground">{agent.name}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">{agent.desc}</p>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-gray-50 px-4 py-2.5"
                      >
                        <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                        <span className="text-xs text-muted-foreground flex-1">{t.hero.mockup.progressLabel}</span>
                        <span className="text-lg font-bold text-indigo-600">3</span>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      className="hidden sm:flex flex-col w-40 shrink-0 rounded-xl border border-border/60 bg-white p-4"
                    >
                      <div className="flex items-center gap-1.5 mb-4">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">{t.hero.mockup.statsLabel}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mb-1">{t.hero.mockup.suppliersFound}</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">3</div>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="text-[11px] text-muted-foreground mb-1">{t.hero.mockup.duration}</div>
                        <div className="text-sm font-semibold text-foreground">2m 34s</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-foreground">{t.hero.mockup.suppliersLive}</span>
                      <span className="text-[11px] text-muted-foreground">{t.hero.mockup.suppliersCount}</span>
                      <span className="relative flex h-1.5 w-1.5 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {t.hero.mockSuppliers.map((supplier, idx) => (
                        <motion.div
                          key={supplier.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.5 + idx * 0.15 }}
                          className="rounded-xl border border-border/60 bg-white p-3"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <span className="text-xs font-bold text-foreground">{supplier.name}</span>
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                              supplierScores[idx] >= 90
                                ? "text-emerald-700 bg-emerald-50"
                                : supplierScores[idx] >= 70
                                ? "text-amber-700 bg-amber-50"
                                : "text-gray-600 bg-gray-100"
                            }`}>
                              {supplierScores[idx]}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5">
                            <span>{supplierFlags[idx]}</span>
                            <MapPin className="h-2.5 w-2.5" />
                            {supplier.location}
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-2 font-medium">
                            {supplier.spec}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {supplierCerts[idx].map((cert) => (
                              <span
                                key={cert}
                                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-500"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="flex justify-center -mt-6 relative z-10"
          >
            <div className="inline-flex items-center gap-0 rounded-2xl border border-border bg-white/90 backdrop-blur-sm shadow-lg shadow-black/[0.05] overflow-hidden">
              {t.hero.stats.map((stat, i) => {
                const Icon = statIcons[i]
                return (
                  <div
                    key={stat.label}
                    className={`flex items-center gap-3 px-5 sm:px-7 py-3.5 ${
                      i < t.hero.stats.length - 1 ? "border-r border-border" : ""
                    }`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${statColors[i]} hidden sm:block`} />
                    <div className="text-left">
                      <div className="text-base sm:text-lg font-bold tracking-tight">{stat.value}</div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
