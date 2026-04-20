import { Link } from "react-router-dom"
import { ArrowRight, BookOpen } from "lucide-react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { getAllBlogPosts } from "@/content/blog-data"
import { pathMappings } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PILLAR_COLORS: Record<string, string> = {
  'ai-sourcing-automation': 'from-brand-500 via-brand-700 to-[hsl(var(--ds-ink))]',
  'erp-crm-integration':    'from-brand-400 via-brand-600 to-[hsl(var(--ds-ink-2))]',
  'multilingual-outreach':  'from-brand-500 via-brand-700 to-[hsl(var(--ds-ink))]',
  'supplier-intelligence':  'from-[hsl(var(--ds-cta))] via-brand-500 to-[hsl(var(--ds-ink))]',
  'offer-comparison':       'from-brand-400 via-brand-600 to-[hsl(var(--ds-ink))]',
  'supply-chain-strategy':  'from-[hsl(var(--ds-ink-3))] via-[hsl(var(--ds-ink-2))] to-[hsl(var(--ds-ink))]',
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
    <section className="py-[clamp(56px,8vw,112px)] bg-[hsl(var(--ds-bg-2))]/40 relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <RevealOnScroll>
          <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {isEN ? 'From the blog' : 'Z bloga'}
            </span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[26ch] text-[hsl(var(--ds-ink))]">
              {isEN
                ? 'Procurement insights, written by practitioners'
                : 'Wiedza o procurement, pisana przez praktyków'}
            </h2>
            <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch]">
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
                  className="group flex flex-col rounded-[14px] border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] overflow-hidden h-full hover:shadow-[0_8px_28px_-4px_rgba(14,22,20,0.10)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ds-accent))] focus-visible:ring-offset-2"
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
                      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-[hsl(var(--ds-accent))]">
                        {category}
                      </span>
                      <span className="text-[hsl(var(--ds-muted-2))]" aria-hidden="true">·</span>
                      <span className="font-mono text-[10.5px] text-[hsl(var(--ds-muted))]">{readTime}</span>
                    </div>
                    <h3 className="font-bold font-display tracking-[-0.02em] text-lg sm:text-xl leading-tight line-clamp-2 mb-2 text-[hsl(var(--ds-ink))] group-hover:text-[hsl(var(--ds-accent))] transition-colors">
                      {title}
                    </h3>
                    <p className="text-[14px] text-[hsl(var(--ds-ink-2))] leading-relaxed line-clamp-3 flex-1">
                      {excerpt}
                    </p>
                    <div className="mt-5 pt-4 border-t border-[hsl(var(--ds-rule))] flex items-center justify-between">
                      <time className="font-mono text-[11px] text-[hsl(var(--ds-muted))]" dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                      <span className="text-sm font-semibold text-[hsl(var(--ds-accent))] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={blogBase} className="btn-ds btn-ds-ghost">
            {isEN ? 'Browse all articles' : 'Wszystkie artykuły'}
            <span className="arrow" aria-hidden>→</span>
          </Link>
          <Link to={resourcesBase} className="btn-ds btn-ds-secondary">
            {isEN ? 'Visit resource hub' : 'Przejdź do centrum wiedzy'}
            <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LatestContentSection
