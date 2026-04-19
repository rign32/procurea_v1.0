import { Link } from "react-router-dom"
import { ArrowRight, BookOpen } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { getAllBlogPosts } from "@/content/blog-data"
import { pathMappings } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PILLAR_COLORS: Record<string, string> = {
  'ai-sourcing-automation': 'from-brand-400 via-brand-600 to-slate-800',
  'erp-crm-integration': 'from-purple-400 via-purple-600 to-slate-800',
  'multilingual-outreach': 'from-emerald-400 via-teal-600 to-slate-800',
  'supplier-intelligence': 'from-amber-400 via-orange-500 to-rose-600',
  'offer-comparison': 'from-rose-400 via-pink-500 to-slate-800',
  'supply-chain-strategy': 'from-slate-400 via-slate-600 to-slate-800',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    month: 'short',
    day: 'numeric',
  })
}

export function LatestContentSection() {
  // Get top 3 published posts (or most recent if all published)
  const posts = getAllBlogPosts()
    .filter(p => p.status === 'published')
    .slice(0, 3)

  if (posts.length === 0) {
    return null
  }

  const blogBase = pathMappings.blogIndex[LANG]
  const resourcesBase = pathMappings.resourcesHub[LANG]

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
      <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/[0.04] blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-600 mb-4">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? 'From the blog' : 'Z bloga'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-5 text-slate-900 max-w-3xl">
              {isEN
                ? 'Procurement insights, written by practitioners'
                : 'Wiedza o procurement, pisana przez praktyków'}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              {isEN
                ? 'Sharp analysis of sourcing, supplier management, and AI procurement. No corporate voice.'
                : 'Konkretne analizy sourcingu, zarządzania dostawcami i AI w procurement. Bez corporate voice.'}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:gap-7 md:grid-cols-3 mb-12">
          {posts.map(post => {
            const title = isEN ? post.title : post.titlePl || post.title
            const excerpt = isEN ? post.excerpt : post.excerptPl || post.excerpt
            const readTime = isEN ? post.readTime : post.readTimePl || post.readTime
            const category = isEN ? post.category : post.categoryPl || post.category
            const gradient = PILLAR_COLORS[post.pillar] || PILLAR_COLORS['supply-chain-strategy']
            return (
              <RevealOnScroll key={post.slug}>
                <Link
                  to={`${blogBase}/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradient} overflow-hidden`}>
                    <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay" aria-hidden="true">
                      <defs>
                        <pattern id={`home-pat-${post.slug}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="1.5" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#home-pat-${post.slug})`} />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                        {category}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="text-xs text-slate-500">{readTime}</span>
                    </div>
                    <h3 className="font-bold font-display tracking-tight text-lg sm:text-xl leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-brand-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                      {excerpt}
                    </p>
                    <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                      <time className="text-xs text-slate-500" dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                      <span className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isEN ? 'Read' : 'Czytaj'}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={blogBase}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-black/[0.1] px-6 py-3 text-sm font-semibold text-slate-900 hover:border-brand-500/40 hover:shadow-sm transition-all"
          >
            {isEN ? 'Browse all articles' : 'Wszystkie artykuły'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to={resourcesBase}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 shadow-sm hover:shadow-md transition-all"
          >
            {isEN ? 'Visit resource hub' : 'Przejdź do centrum wiedzy'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LatestContentSection
