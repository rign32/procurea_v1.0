import { Link } from "react-router-dom"
import { ArrowLeft, Search } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { pathFor } from "@/i18n/paths"
import { t } from "@/i18n"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center pt-16 pb-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-slate-100 mb-8">
            <Search className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight text-slate-200 mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            {isEN ? 'Page not found' : 'Nie znaleziono strony'}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {isEN
              ? "The page you're looking for doesn't exist or has been moved."
              : 'Strona, której szukasz, nie istnieje lub została przeniesiona.'}
          </p>
          <Link
            to={pathFor('home')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEN ? 'Back to home' : 'Wróć na stronę główną'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
