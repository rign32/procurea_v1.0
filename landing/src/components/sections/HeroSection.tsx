import { useEffect, useRef, useState } from "react"
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { pathFor } from "@/i18n/paths"
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
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  Shield as ShieldBlacklist,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react"
import { trackCtaClick } from "@/lib/analytics"
import { appendUtm } from "@/lib/utm"
import { t } from "@/i18n"

const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

/* ─── constants ─── */

const statIcons = [Zap, Users, TrendingDown]
const statGradients = [
  "from-amber-400 to-orange-500",
  "from-brand-400 to-brand-600",
  "from-emerald-400 to-teal-600",
]

const sidebarIcons = [LayoutDashboard, Search, Mail, Building2, ShieldBlacklist, FileText, CheckCircle2, Users, BookOpen, Clock, Settings]
const fullPlanItems = new Set(["rfqs", "contracts", "approvals", "workspaces", "sequences"])

const agentColors = [
  { color: "bg-emerald-500", ring: "ring-emerald-500/20" },
  { color: "bg-orange-500", ring: "ring-orange-500/20" },
  { color: "bg-red-400", ring: "ring-red-400/20" },
  { color: "bg-emerald-500", ring: "ring-emerald-500/20" },
]

const supplierFlags = ["🇩🇪", "🇵🇱", "🇳🇱", "🇮🇹", "🇫🇷", "🇨🇿"]
const supplierScores = [93, 89, 82, 78, 76, 74]
const supplierCerts = [
  ["ISO 14001", "FSC", "BRC"],
  ["ISO 9001", "FSC"],
  ["ISO 14001", "PEFC"],
  ["FSC", "PEFC"],
  ["BRC", "ISO 22000"],
  ["ISO 9001"],
]

/* ─── component ─── */

export function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mockupRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [mockupVisible, setMockupVisible] = useState(false)
  const supplierCount = useAnimatedCounter(183, 2000, mockupVisible)

  // Scroll-based perspective for mockup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const mockupRotateX = useTransform(scrollYProgress, [0, 0.5], [2, 0])
  const mockupScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98])

  useEffect(() => {
    const el = mockupRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMockupVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

  const sidebarKeys = ["dashboard", "campaigns", "rfqs", "suppliers", "blacklist", "contracts", "approvals", "workspaces", "documents", "sequences", "settings"] as const
  const sidebarActive = [false, true, false, false, false, false, false, false, false, false, false]

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* ── Rich mesh gradient background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-mesh-gradient" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Animated gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary orb - top right */}
        <div
          className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full opacity-[0.12] blur-[120px] animate-float"
          style={{
            background: "radial-gradient(circle, #5E8C8F, #2A5C5D, transparent 70%)",
            transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        {/* Secondary orb - bottom left */}
        <div
          className="absolute -bottom-20 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[100px] animate-float-delayed"
          style={{
            background: "radial-gradient(circle, #7AADAF, #C5E0E2, transparent 70%)",
            transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        {/* Accent orb - center */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px] animate-float-slow"
          style={{
            background: "radial-gradient(circle, #A9CDD0, transparent 70%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-24 sm:pt-32 lg:pt-40 pb-16 lg:pb-20 text-center max-w-4xl mx-auto">

          {/* Badge with shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-emerald-200/60 text-sm font-medium text-emerald-700 mb-10 relative overflow-hidden"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: "200% 100%" }} />
            <div className="absolute inset-0 bg-emerald-50/80 -z-10" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="relative">{t.hero.badge}</span>
          </motion.div>

          {/* Headline - MASSIVE */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-extrabold tracking-[-0.04em] leading-[1.02] mb-7"
          >
            {t.hero.headlinePart1}
            <br />
            <span className="relative inline-block">
              <span
                className="bg-gradient-to-r from-brand-700 via-brand-400 to-brand-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x"
              >
                {t.hero.headlineHighlight}
              </span>
            </span>
            {t.hero.headlinePart2}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto text-balance"
          >
            {t.hero.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-center gap-4 mb-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary CTA with glow */}
              <motion.a
                href={appendUtm(APP_URL, 'hero_signup')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('hero_signup')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center"
              >
                <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-brand-500 via-emerald-400 to-brand-400 opacity-40 blur-md animate-pulse" />
                <span className="relative group inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-4 shadow-lg">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.a>
              {/* Secondary CTA - ghost */}
              <a
                href={`#${t.sectionIds.demo}`}
                onClick={() => trackCtaClick("hero_demo")}
                className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 border border-border/80 bg-white/50 backdrop-blur-sm text-foreground hover:bg-white hover:border-brand-300 hover:text-brand-700 text-base px-8 py-4 hover:shadow-lg hover:shadow-brand-500/5"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
            {/* Pricing link below CTAs */}
            <Link
              to={pathFor("pricing")}
              onClick={() => trackCtaClick("hero_pricing_link")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t.hero.ctaPricingLink} &rarr;
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted-foreground"
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

        {/* ===== Platform Mockup ===== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const }}
          ref={mockupRef}
          className="relative max-w-5xl mx-auto pb-24 lg:pb-32"
          style={{
            perspective: "1200px",
          }}
        >
          {/* Floating glow behind mockup */}
          <div className="absolute -inset-8 rounded-3xl pointer-events-none animate-pulse-glow" style={{ background: "radial-gradient(ellipse at center, rgba(94,140,143,0.12) 0%, rgba(94,140,143,0.04) 50%, transparent 70%)" }} />
          <div className="absolute -inset-12 bg-gradient-to-tr from-brand-400/[0.06] via-transparent to-brand-400/[0.06] rounded-3xl blur-2xl pointer-events-none" />

          {/* Mockup with perspective transform */}
          <motion.div
            style={{
              rotateX: mockupRotateX,
              scale: mockupScale,
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            {/* Gradient border frame */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-brand-300/40 via-border/30 to-brand-400/20 pointer-events-none" />

            <div className="relative rounded-2xl border border-transparent bg-white shadow-premium-lg overflow-hidden ring-1 ring-black/[0.04]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-gradient-to-b from-gray-50 to-gray-50/80 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-lg bg-white/80 border border-border/50 text-xs text-muted-foreground w-48 sm:w-64 justify-center shadow-xs">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    {t.hero.browserUrl}
                  </div>
                </div>
                <div className="hidden sm:block w-[54px]" />
              </div>

              {/* App content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden lg:flex flex-col w-56 border-r border-border/40 bg-gradient-to-b from-gray-50/80 to-white py-4 px-3 shrink-0">
                  <div className="flex items-center gap-2 px-2 mb-5">
                    <img src="/logo-procurea.png" alt="P" className="h-7 w-7 rounded-lg shadow-xs" />
                    <span className="text-sm font-semibold text-foreground">Procurea</span>
                  </div>

                  <nav className="flex flex-col gap-0.5">
                    {sidebarKeys.map((key, i) => {
                      const Icon = sidebarIcons[i]
                      const isFull = fullPlanItems.has(key)
                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            sidebarActive[i]
                              ? "bg-brand-50 text-brand-700 font-medium shadow-xs"
                              : "text-muted-foreground hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{t.hero.sidebar[key]}</span>
                          {key === "approvals" && (
                            <span className="ml-auto text-[9px] font-bold leading-none rounded-full px-1.5 py-0.5 bg-red-500 text-white">3</span>
                          )}
                          {key !== "approvals" && isFull && (
                            <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded px-1 py-0.5 leading-none">Full</span>
                          )}
                        </div>
                      )
                    })}
                  </nav>
                </div>

                {/* Main content area */}
                <div className="flex-1 min-w-0">
                  <div className="px-4 sm:px-5 py-3 border-b border-border/40 bg-white">
                    <div className="flex items-center gap-2 mb-0.5">
                      <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-bold text-foreground">{t.hero.mockup.campaignTitle}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ml-5.5 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                        {t.hero.mockup.statusInProgress}
                      </span>
                      <span>{t.hero.mockup.createdAt}</span>
                      <span>·</span>
                      <span>{t.hero.mockup.region}</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-gray-50/30">
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Agent cards */}
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                          {t.hero.mockup.agents.map((agent, idx) => (
                            <motion.div
                              key={agent.name}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 1.0 + idx * 0.1 }}
                              className="group/agent rounded-xl border border-border/50 bg-white p-3.5 transition-all duration-300 hover:shadow-md hover:border-brand-200/60 hover:-translate-y-0.5"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${agentColors[idx].color} ring-2 ring-offset-1 ${agentColors[idx].ring}`} />
                                <span className="text-xs font-bold text-foreground">{agent.name}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{agent.desc}</p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.4 }}
                          className="flex items-center gap-3 rounded-xl border border-brand-200/40 bg-gradient-to-r from-white via-brand-50/40 to-white px-4 py-2.5 bg-[length:200%_100%] animate-shimmer"
                        >
                          <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />
                          <span className="text-xs text-muted-foreground flex-1">{t.hero.mockup.progressLabel}</span>
                          <span className="text-lg font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent tabular-nums">{supplierCount}</span>
                        </motion.div>
                      </div>

                      {/* Stats sidebar */}
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="hidden sm:flex flex-col w-40 shrink-0 rounded-xl border border-border/50 bg-white p-4"
                      >
                        <div className="flex items-center gap-1.5 mb-4">
                          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{t.hero.mockup.statsLabel}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-1">{t.hero.mockup.suppliersFound}</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent tabular-nums">{supplierCount}</div>
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <div className="text-[11px] text-muted-foreground mb-1">{t.hero.mockup.duration}</div>
                          <div className="text-sm font-semibold text-foreground">18m 12s</div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Suppliers live list */}
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
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.5 + idx * 0.12 }}
                            className="group/supplier rounded-xl border border-border/50 bg-white p-3 transition-all duration-300 hover:shadow-md hover:border-brand-200/60 hover:-translate-y-0.5"
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <span className="text-xs font-bold text-foreground">{supplier.name}</span>
                              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
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
                                  className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 text-gray-500 border border-gray-100"
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
          </motion.div>

          {/* ── Stats bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex justify-center -mt-7 relative z-10"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-0 rounded-2xl border border-border/60 bg-white/95 backdrop-blur-md shadow-premium overflow-hidden">
              {t.hero.stats.map((stat, i) => {
                const Icon = statIcons[i]
                return (
                  <div
                    key={stat.label}
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 ${
                      i < t.hero.stats.length - 1 ? "border-r border-border/40" : ""
                    }`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 hidden sm:block bg-gradient-to-br ${statGradients[i]} bg-clip-text`} style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#5E8C8F" : "#10b981" }} />
                    <div className="text-left">
                      <div className={`text-sm sm:text-base md:text-lg font-bold tracking-tight bg-gradient-to-r ${statGradients[i]} bg-clip-text text-transparent`}>{stat.value}</div>
                      <div className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
