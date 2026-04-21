import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Download } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { pathFor } from "@/i18n/paths"
import { getRelatedContentForIndustry } from "@/content/relatedContent"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

interface Props {
  industrySlug: string
  /** Visual tone — aligns colour accent to each industry page's hero */
  tone?: "indigo" | "fuchsia" | "sky" | "emerald" | "teal" | "rose" | "amber" | "primary"
}

const TONES: Record<NonNullable<Props["tone"]>, { ring: string; hover: string }> = {
  indigo: { ring: "ring-indigo-500/40", hover: "hover:border-indigo-400/40" },
  fuchsia: { ring: "ring-fuchsia-500/40", hover: "hover:border-fuchsia-400/40" },
  sky: { ring: "ring-sky-500/40", hover: "hover:border-sky-400/40" },
  emerald: { ring: "ring-emerald-500/40", hover: "hover:border-emerald-400/40" },
  teal: { ring: "ring-teal-500/40", hover: "hover:border-teal-400/40" },
  rose: { ring: "ring-rose-500/40", hover: "hover:border-rose-400/40" },
  amber: { ring: "ring-amber-500/40", hover: "hover:border-amber-400/40" },
  primary: { ring: "ring-primary/40", hover: "hover:border-primary/40" },
}

export function IndustryRelatedResources({ industrySlug, tone = "primary" }: Props) {
  const items = getRelatedContentForIndustry(industrySlug)
  if (items.length === 0) return null

  const t = TONES[tone]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">
                {isEN ? "Dig deeper" : "Zgłęb temat"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {isEN ? "Related reading" : "Powiązane materiały"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {isEN
                  ? "Articles and downloadable guides tuned to this industry — pick what is useful on Monday."
                  : "Artykuły i przewodniki do pobrania dopasowane do tej branży — wybierz to, co pomoże Ci w poniedziałek."}
              </p>
            </div>
            <Link
              to={pathFor("resourcesHub")}
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 shrink-0 ml-6"
            >
              {isEN ? "Content hub" : "Centrum wiedzy"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.slug}
                to={item.href}
                className={`group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 ${t.hover} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.ring}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {item.type === "blog" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                      <BookOpen className="h-3 w-3" aria-hidden="true" />
                      {isEN ? "Article" : "Artykuł"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                      <Download className="h-3 w-3" aria-hidden="true" />
                      {isEN ? "Guide" : "Przewodnik"}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold tracking-tight leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {item.excerpt}
                </p>
                <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 uppercase tracking-[0.08em]">
                    {item.meta}
                  </span>
                  <span className="font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {item.type === "blog"
                      ? isEN ? "Read" : "Czytaj"
                      : isEN ? "Download" : "Pobierz"}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <Link
              to={pathFor("resourcesHub")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
            >
              {isEN ? "Browse content hub" : "Przejdź do centrum wiedzy"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
