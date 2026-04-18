import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import { BLOG_POSTS } from "@/content/blog"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const CATEGORY_COLORS: Record<string, string> = {
  'AI & Automation': 'bg-blue-100 text-blue-700',
  'AI i Automatyzacja': 'bg-blue-100 text-blue-700',
  'Supply Chain': 'bg-emerald-100 text-emerald-700',
  'Łańcuch Dostaw': 'bg-emerald-100 text-emerald-700',
  'Best Practices': 'bg-amber-100 text-amber-700',
  'Najlepsze Praktyki': 'bg-amber-100 text-amber-700',
  'Procurement Process': 'bg-violet-100 text-violet-700',
  'Proces Procurement': 'bg-violet-100 text-violet-700',
  'Supplier Management': 'bg-rose-100 text-rose-700',
  'Zarządzanie Dostawcami': 'bg-rose-100 text-rose-700',
}

const CARD_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-violet-600 to-purple-700',
  'from-rose-500 to-pink-600',
]

export function BlogIndexPage() {
  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-white to-slate-50/30 bg-mesh-gradient overflow-hidden">
          <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] bg-primary pointer-events-none" />
          <AnimatedGrid color="hsl(var(--foreground) / 0.02)" spacing={48} className="opacity-50" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
              {isEN ? 'BLOG' : 'BLOG'}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              {isEN ? 'Procurement insights & guides' : 'Wiedza i przewodniki procurement'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {isEN
                ? 'Practical articles on AI sourcing, supplier management, and procurement automation. Written by practitioners, not marketers.'
                : 'Praktyczne artykuły o AI sourcingu, zarządzaniu dostawcami i automatyzacji procurement. Pisane przez praktyków, nie marketerów.'}
            </p>
          </div>
        </section>

        {/* Article grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {BLOG_POSTS.map((post, i) => (
                <RevealOnScroll key={post.slug} delay={i * 0.08}>
                  <Link
                    to={`${pathFor('blogIndex')}/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
                  >
                    {/* Gradient image placeholder */}
                    <div className={`h-44 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">{i + 1}</span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      {/* Category + meta */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>

                      <h2 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <time className="text-xs text-muted-foreground" dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span className="text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                          {isEN ? 'Read more →' : 'Czytaj dalej →'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default BlogIndexPage
