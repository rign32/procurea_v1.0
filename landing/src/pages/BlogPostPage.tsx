import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Download, BookOpen, Clock3, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { NewsletterSignupInline } from "@/components/content/NewsletterSignupInline"
import {
  PullQuote,
  StatBlock,
  KeyTakeawayBox,
  WarningBox,
  BeforeAfter,
  StepByStep,
  ComparisonTable,
  CountryCard,
  StatsTimeline,
  ProcessDiagram,
} from "@/components/content/BlogInlineComponents"
import { trackCtaClick } from "@/lib/analytics"
import { getRichBlogPost, getRelatedPosts, type RichBlogPost } from "@/content/blog"
import type { BlogSection } from "@/content/blog-data/types"
import { getResource } from "@/content/resources"
import { pathMappings, type PathKey } from "@/i18n/paths"
import { AuthorAvatar } from "@/assets/content-hub/AuthorAvatars"
import { getInfographic } from "@/assets/content-hub/InfographicRegistry"
import { BLOG_HEROES } from "@/assets/content-hub/BlogHeroes"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const PILLAR_BADGE: Record<string, string> = {
  'ai-sourcing-automation': 'bg-brand-50 text-brand-700 border-brand-200',
  'erp-crm-integration': 'bg-purple-50 text-purple-700 border-purple-200',
  'multilingual-outreach': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'supplier-intelligence': 'bg-amber-50 text-amber-800 border-amber-200',
  'offer-comparison': 'bg-rose-50 text-rose-700 border-rose-200',
  'supply-chain-strategy': 'bg-slate-50 text-slate-700 border-slate-200',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildJsonLd(post: RichBlogPost): object {
  const title = isEN ? post.title : post.titlePl || post.title
  const description = isEN ? post.excerpt : post.excerptPl || post.excerpt
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': post.jsonLdType || 'Article',
    headline: title,
    description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Procurea',
      logo: {
        '@type': 'ImageObject',
        url: 'https://procurea.io/logo-procurea.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${isEN ? 'https://procurea.io' : 'https://procurea.pl'}${pathMappings.blogIndex[LANG]}/${post.slug}`,
    },
  }

  // HowTo specifics
  if (post.jsonLdType === 'HowTo' && post.sections && post.sections.length > 0) {
    base.step = post.sections.map((section, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: isEN ? section.heading : section.headingPl,
      text: isEN ? section.body.slice(0, 250) : section.bodyPl.slice(0, 250),
    }))
  }

  return base
}

function buildFaqJsonLd(post: RichBlogPost): object | null {
  if (!post.faq || post.faq.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(item => ({
      '@type': 'Question',
      name: isEN ? item.question : item.questionPl,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEN ? item.answer : item.answerPl,
      },
    })),
  }
}

// Renders all optional inline visual components configured on a BlogSection
// in a deterministic order — language-aware.
function SectionInlineComponents({ section }: { section: BlogSection }) {
  const Infographic = getInfographic(section.infographicKey)
  const infographicCaption = isEN
    ? section.infographicCaption
    : section.infographicCaptionPl || section.infographicCaption
  return (
    <>
      {Infographic && (
        <figure className="my-10 not-prose">
          <Infographic className="mx-auto" />
          {infographicCaption && (
            <figcaption className="mt-3 text-center text-xs sm:text-sm text-slate-500 italic">
              {infographicCaption}
            </figcaption>
          )}
        </figure>
      )}

      {section.pullQuote && (
        <PullQuote
          text={isEN ? section.pullQuote.text : section.pullQuote.textPl || section.pullQuote.text}
          author={section.pullQuote.author}
          role={isEN ? section.pullQuote.role : section.pullQuote.rolePl || section.pullQuote.role}
        />
      )}

      {section.statBlock && (
        <StatBlock
          stats={section.statBlock.stats.map(s => ({
            value: s.value,
            label: isEN ? s.label : s.labelPl || s.label,
          }))}
          columns={section.statBlock.columns}
        />
      )}

      {section.beforeAfter && (
        <BeforeAfter
          before={isEN ? section.beforeAfter.before : section.beforeAfter.beforePl || section.beforeAfter.before}
          after={isEN ? section.beforeAfter.after : section.beforeAfter.afterPl || section.beforeAfter.after}
          beforeLabel={
            isEN
              ? section.beforeAfter.beforeLabel
              : section.beforeAfter.beforeLabelPl || section.beforeAfter.beforeLabel
          }
          afterLabel={
            isEN
              ? section.beforeAfter.afterLabel
              : section.beforeAfter.afterLabelPl || section.beforeAfter.afterLabel
          }
        />
      )}

      {section.stepByStep && (
        <StepByStep
          steps={section.stepByStep.steps.map(s => ({
            title: isEN ? s.title : s.titlePl || s.title,
            description: isEN ? s.description : s.descriptionPl || s.description,
          }))}
        />
      )}

      {section.comparisonTable && (
        <ComparisonTable
          headers={
            isEN
              ? section.comparisonTable.headers
              : section.comparisonTable.headersPl || section.comparisonTable.headers
          }
          rows={
            isEN
              ? section.comparisonTable.rows
              : section.comparisonTable.rowsPl || section.comparisonTable.rows
          }
          highlighted={section.comparisonTable.highlighted}
          caption={
            isEN
              ? section.comparisonTable.caption
              : section.comparisonTable.captionPl || section.comparisonTable.caption
          }
        />
      )}

      {section.statsTimeline && (
        <StatsTimeline
          data={section.statsTimeline.data.map(d => ({
            label: isEN ? d.label : d.labelPl || d.label,
            value: d.value,
            display: isEN ? d.display : d.displayPl || d.display,
          }))}
          title={
            isEN ? section.statsTimeline.title : section.statsTimeline.titlePl || section.statsTimeline.title
          }
        />
      )}

      {section.countryCards && section.countryCards.length > 0 && (
        <div className="my-8 not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.countryCards.map((c, i) => (
            <CountryCard
              key={i}
              flag={c.flag}
              country={isEN ? c.country : c.countryPl || c.country}
              tagline={isEN ? c.tagline : c.taglinePl || c.tagline}
              highlights={c.highlights.map(h => ({
                label: isEN ? h.label : h.labelPl || h.label,
                value: isEN ? h.value : h.valuePl || h.value,
              }))}
            />
          ))}
        </div>
      )}

      {section.processDiagram && (
        <ProcessDiagram
          nodes={section.processDiagram.nodes.map(n => ({
            id: n.id,
            label: isEN ? n.label : n.labelPl || n.label,
            x: n.x,
            y: n.y,
          }))}
          edges={section.processDiagram.edges.map(e => ({
            from: e.from,
            to: e.to,
            label: isEN ? e.label : e.labelPl || e.label,
          }))}
          height={section.processDiagram.height}
          title={
            isEN
              ? section.processDiagram.title
              : section.processDiagram.titlePl || section.processDiagram.title
          }
        />
      )}

      {section.warning && (
        <WarningBox
          title={isEN ? section.warning.title : section.warning.titlePl || section.warning.title}
          text={isEN ? section.warning.text : section.warning.textPl || section.warning.text}
          tone={section.warning.tone}
        />
      )}

      {section.keyTakeaway && (
        <KeyTakeawayBox
          title={
            isEN
              ? section.keyTakeaway.title
              : section.keyTakeaway.titlePl || section.keyTakeaway.title
          }
          items={
            isEN
              ? section.keyTakeaway.items
              : section.keyTakeaway.itemsPl || section.keyTakeaway.items
          }
        />
      )}
    </>
  )
}

function InlineCtaBlock({ text, href, variant }: { text: string; href: string; variant: string }) {
  const gradient =
    variant === 'magnet'
      ? 'from-amber-500 to-orange-600'
      : variant === 'demo'
        ? 'from-brand-500 to-brand-700'
        : variant === 'calculator'
          ? 'from-purple-500 to-rose-600'
          : 'from-emerald-500 to-teal-600'
  const Icon = variant === 'magnet' ? Download : ArrowRight
  return (
    <div className="my-10">
      <Link
        to={href}
        className={`group relative block rounded-2xl bg-gradient-to-br ${gradient} p-6 sm:p-8 text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-lg sm:text-xl font-bold font-display tracking-tight leading-snug">{text}</p>
          </div>
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors flex-shrink-0">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </div>
  )
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getRichBlogPost(slug) : undefined
  const blogBase = pathMappings.blogIndex[LANG]

  const relatedPosts = useMemo(() => (post ? getRelatedPosts(post.slug, 3) : []), [post])

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
            to={blogBase}
            className="inline-flex items-center gap-2 text-brand-600 hover:underline font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEN ? 'Back to blog' : 'Wróć do bloga'}
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const title = isEN ? post.title : post.titlePl || post.title
  const excerpt = isEN ? post.excerpt : post.excerptPl || post.excerpt
  const readTime = isEN ? post.readTime : post.readTimePl || post.readTime
  const category = isEN ? post.category : post.categoryPl || post.category
  const metaTitle = (isEN ? post.metaTitle : post.metaTitlePl) || `${title} — Procurea Blog`
  const metaDescription = (isEN ? post.metaDescription : post.metaDescriptionPl) || excerpt
  const primaryCtaText = isEN ? post.primaryCta.text : post.primaryCta.textPl
  const leadMagnet = post.leadMagnetSlug ? getResource(post.leadMagnetSlug) : undefined

  const articleJsonLd = buildJsonLd(post)
  const faqJsonLd = buildFaqJsonLd(post)

  const pillarBadgeClass = PILLAR_BADGE[post.pillar] || PILLAR_BADGE['supply-chain-strategy']

  const Hero = BLOG_HEROES[post.slug]

  const isSkeleton = post.status === 'skeleton' || !post.sections || post.sections.length === 0

  return (
    <div className="min-h-screen flex flex-col">
      <RouteMeta
        override={{
          title: metaTitle,
          description: metaDescription,
        }}
      />
      {/* JSON-LD — hoisted via React 19 native head support */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb */}
        <div className="pt-28 sm:pt-32 pb-3">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              to={blogBase}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? 'All articles' : 'Wszystkie artykuły'}
            </Link>
          </div>
        </div>

        {/* Article header */}
        <header className="pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {Hero && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
                <Hero className="w-full h-full" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${pillarBadgeClass}`}
              >
                {category}
              </span>
              {post.status === 'skeleton' && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {isEN ? 'Scheduled' : 'Zaplanowany'}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-5 text-slate-900 leading-tight">
              {title}
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">{excerpt}</p>

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <AuthorAvatar name={post.author.name} size="md" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{post.author.name}</span>
                  <span className="text-xs text-slate-500">{post.author.role}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Article body */}
        <section className="pb-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {isSkeleton ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEN ? 'Full article publishes soon' : 'Pełna treść pojawi się wkrótce'}
                  </h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {isEN
                    ? `This post is on the Procurea content roadmap — scheduled for ${formatDate(post.date)}. Leave your email and we will send it when it is live.`
                    : `Ten artykuł jest w roadmapie Procurea — zaplanowany na ${formatDate(post.date)}. Zostaw email, wyślemy gdy będzie gotowy.`}
                </p>
                {post.outline && (
                  <div className="text-sm text-slate-500 italic mb-6 border-l-2 border-slate-300 pl-4">
                    {isEN ? 'What you will get:' : 'Co znajdziesz w środku:'} {post.outline}
                  </div>
                )}
                <NewsletterSignupInline variant="sidebar" />
              </div>
            ) : (
              <article className="prose prose-lg prose-slate max-w-none">
                {post.sections!.map((section, i) => {
                  const heading = isEN ? section.heading : section.headingPl
                  const body = isEN ? section.body : section.bodyPl
                  return (
                    <div key={i}>
                      <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mt-12 mb-5 text-slate-900 scroll-mt-24" id={`section-${i}`}>
                        {heading}
                      </h2>
                      {body.split('\n\n').map((para, j) => (
                        <p
                          key={j}
                          className="text-base sm:text-lg leading-relaxed text-slate-700 mb-5"
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{ __html: para }}
                        />
                      ))}
                      <SectionInlineComponents section={section} />
                      {section.subSections?.map((sub, k) => (
                        <div key={k}>
                          <h3 className="text-xl font-bold font-display tracking-tight mt-8 mb-3 text-slate-900">
                            {isEN ? sub.heading : sub.headingPl}
                          </h3>
                          {(isEN ? sub.body : sub.bodyPl).split('\n\n').map((para, m) => (
                            <p
                              key={m}
                              className="text-base sm:text-lg leading-relaxed text-slate-700 mb-5"
                              // eslint-disable-next-line react/no-danger
                              dangerouslySetInnerHTML={{ __html: para }}
                            />
                          ))}
                        </div>
                      ))}
                      {section.inlineCta && (
                        <InlineCtaBlock
                          text={isEN ? section.inlineCta.text : section.inlineCta.textPl}
                          href={section.inlineCta.href}
                          variant={section.inlineCta.variant}
                        />
                      )}
                    </div>
                  )
                })}
              </article>
            )}

            {/* FAQ section */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-6 text-slate-900">
                  {isEN ? 'Frequently asked questions' : 'Najczęściej zadawane pytania'}
                </h2>
                <div className="space-y-4">
                  {post.faq.map((item, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-black/[0.08] bg-white p-5 hover:border-brand-500/30 transition-colors"
                    >
                      <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900 list-none">
                        <span>{isEN ? item.question : item.questionPl}</span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 ml-4 group-open:rotate-90 transition-transform" aria-hidden="true" />
                      </summary>
                      <p className="mt-4 text-slate-700 leading-relaxed">
                        {isEN ? item.answer : item.answerPl}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Lead magnet card */}
        {leadMagnet && (
          <section className="pb-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <Link
                  to={`${pathMappings.resourcesHub[LANG]}/library/${leadMagnet.slug}`}
                  className="group relative block rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-8 sm:p-10 text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex-shrink-0">
                      <Download className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">
                        {leadMagnet.formatLabel} · {isEN ? 'Free download' : 'Za darmo'}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight mb-2 leading-tight">
                        {leadMagnet.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                        {leadMagnet.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          </section>
        )}

        {/* Primary CTA block */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-5">
              {isEN ? 'Ready to automate your sourcing?' : 'Gotowy zautomatyzować sourcing?'}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              {isEN
                ? 'Find, verify, and contact 100+ suppliers in under an hour. Free to try — 10 credits, no card required.'
                : 'Znajdź, zweryfikuj i skontaktuj się ze 100+ dostawcami w godzinę. Za darmo — 10 kredytów, bez karty.'}
            </p>
            <Link
              to={post.primaryCta.href}
              onClick={() => trackCtaClick(`blog_${post.slug}_primary`)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {primaryCtaText}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-slate-50/70 border-t border-black/[0.05]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-8">
                {isEN ? 'Keep reading' : 'Czytaj dalej'}
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map(r => {
                  const rTitle = isEN ? r.title : r.titlePl || r.title
                  const rExcerpt = isEN ? r.excerpt : r.excerptPl || r.excerpt
                  return (
                    <Link
                      key={r.slug}
                      to={`${blogBase}/${r.slug}`}
                      className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-3">
                        {isEN ? r.category : r.categoryPl || r.category}
                      </span>
                      <h4 className="font-bold font-display text-lg leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-brand-600 transition-colors">
                        {rTitle}
                      </h4>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{rExcerpt}</p>
                      <span className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isEN ? 'Read' : 'Czytaj'}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features linked from post */}
        {post.relatedFeatures.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">
                {isEN ? 'Procurea features in this article' : 'Funkcje Procurea w tym artykule'}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {post.relatedFeatures.map(key => {
                  const ref = pathMappings[key as PathKey]
                  if (!ref) return null
                  return (
                    <Link
                      key={key}
                      to={ref[LANG]}
                      className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.08] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-500/40 hover:text-brand-600 transition-all"
                    >
                      {key}
                      <ArrowRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                    </Link>
                  )
                })}
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
