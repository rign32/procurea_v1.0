import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { t } from "@/i18n"

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.legal.backToHome}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {t.legal.lastUpdatedPrefix} {lastUpdated}
          </p>

          <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
