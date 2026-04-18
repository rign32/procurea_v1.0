import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Search } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh-gradient">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center pt-16 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-30" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-lg px-4 sm:px-6 text-center">
          {/* Icon with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl animate-pulse-glow" />
            <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-black/[0.06]">
              <Search className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* 404 number */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-7xl sm:text-9xl font-extrabold tracking-tight bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-clip-text text-transparent mb-4 select-none"
          >
            404
          </motion.h1>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          >
            {isEN ? 'Page not found' : 'Nie znaleziono strony'}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-muted-foreground mb-8 leading-relaxed"
          >
            {isEN
              ? "The page you're looking for doesn't exist or has been moved."
              : 'Strona, której szukasz, nie istnieje lub została przeniesiona.'}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              to={pathFor('home')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] shadow-sm transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEN ? 'Back to home' : 'Wróć na stronę główną'}
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
