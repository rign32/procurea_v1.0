import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Link } from "react-router-dom"
import { pathFor } from "@/i18n/paths"
import { RouteMeta } from "@/lib/RouteMeta"

interface PagePlaceholderProps {
  title: string
  subtitle: string
  mvpStage: string
  note?: string
}

export function PagePlaceholder({ title, subtitle, mvpStage, note }: PagePlaceholderProps) {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 uppercase tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            {mvpStage}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">{title}</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{subtitle}</p>
          {note && (
            <div className="rounded-xl border border-black/[0.08] bg-slate-50 p-6 mb-8">
              <p className="text-sm text-slate-700 leading-relaxed">{note}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              to={pathFor('home')}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
            >
              ← Back to home
            </Link>
            <Link
              to={pathFor('contact')}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-black/[0.1] text-foreground hover:bg-black/[0.03] transition-all"
            >
              Contact us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
