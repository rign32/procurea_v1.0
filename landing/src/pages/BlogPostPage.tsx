import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { trackCtaClick } from "@/lib/analytics"
import { getBlogPost, BLOG_POSTS } from "@/content/blog"
import { pathFor } from "@/i18n/paths"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'
const APP_URL = import.meta.env.VITE_APP_URL || "https://app.procurea.pl/login"

function appendUtm(url: string, source: string) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=blog&utm_medium=cta&utm_campaign=${source}`
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {isEN ? 'Article not found' : 'Artykuł nie znaleziony'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isEN
              ? 'The article you are looking for does not exist or has been moved.'
              : 'Artykuł, którego szukasz, nie istnieje lub został przeniesiony.'}
          </p>
          <Link
            to={pathFor('blogIndex')}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEN ? 'Back to blog' : 'Wróć do bloga'}
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // Find related posts (all except current, max 2)
  const related = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 2)

  const paragraphs = post.content.split('\n\n')

  return (
    <div className="min-h-screen">
      <RouteMeta
        override={{
          title: `${post.title} — Procurea Blog`,
          description: post.excerpt,
        }}
      />
      <Navbar />

      <main id="main-content">
        {/* Article header */}
        <section className="relative pt-32 pb-12 bg-gradient-to-b from-white to-slate-50/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              to={pathFor('blogIndex')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isEN ? 'All articles' : 'Wszystkie artykuły'}
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground">{post.readTime}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              {post.title}
            </h1>

            <time className="text-sm text-muted-foreground" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </section>

        {/* Article body */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-gray max-w-none">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-base sm:text-lg leading-relaxed text-gray-700 mb-6">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <RevealOnScroll>
          <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-950">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {isEN
                  ? 'Ready to automate your procurement?'
                  : 'Gotowy na automatyzację procurement?'}
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                {isEN
                  ? 'Try Procurea free — get AI-sourced supplier shortlists in minutes, not weeks.'
                  : 'Wypróbuj Procurea za darmo — otrzymaj listy dostawców wyszukane przez AI w minuty, nie tygodnie.'}
              </p>
              <a
                href={appendUtm(APP_URL, `blog_${post.slug}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick(`blog_${post.slug}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-blue-500 hover:shadow-xl transition-all duration-200"
              >
                {isEN ? 'Try Procurea free' : 'Wypróbuj Procurea za darmo'}
              </a>
            </div>
          </section>
        </RevealOnScroll>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-semibold mb-8">
                {isEN ? 'Related articles' : 'Powiązane artykuły'}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {related.map(r => (
                  <Link
                    key={r.slug}
                    to={`${pathFor('blogIndex')}/${r.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="text-xs text-muted-foreground">{r.category}</span>
                    <h4 className="mt-1 font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {r.title}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default BlogPostPage
