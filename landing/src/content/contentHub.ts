// Unified content hub aggregator — combines blog posts, lead magnets, case studies
// into a single filterable list (mimicking procure.ai/resources pattern)

import { BLOG_POSTS } from './blog'
import { getAllBlogPosts } from './blog-data'
import { RESOURCES } from './resources'
import { CASE_STUDIES } from './caseStudies'
import { pathMappings } from '../i18n/paths'

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'

export type ContentType = 'blog' | 'resource' | 'case-study'

export type BadgeColor = 'teal' | 'amber' | 'emerald' | 'purple' | 'pink'

export interface HubItem {
  type: ContentType
  slug: string
  title: string
  excerpt: string
  category: string
  categoryLabel: string
  badgeColor: BadgeColor
  date: string
  readingTime?: string
  heroImage?: string
  href: string
  isFeatured: boolean
}

// Badge color per content type
const BADGE_COLORS: Record<ContentType, BadgeColor> = {
  blog: 'teal',
  resource: 'amber',
  'case-study': 'emerald',
}

// Type labels per language
const TYPE_LABELS: Record<ContentType, { en: string; pl: string }> = {
  blog: { en: 'Article', pl: 'Artykuł' },
  resource: { en: 'Guide', pl: 'Przewodnik' },
  'case-study': { en: 'Case Study', pl: 'Case Study' },
}

function blogHref(slug: string): string {
  return `${pathMappings.blogIndex[LANG]}/${slug}`
}

function resourceHref(slug: string): string {
  return `${pathMappings.resourcesHub[LANG]}/library/${slug}`
}

function caseStudyHref(slug: string): string {
  return `${pathMappings.caseStudiesHub[LANG]}/${slug}`
}

export function getAllHubItems(): HubItem[] {
  // Use rich BlogPost data — includes all 20 posts (skeleton + Wave 1 full)
  const richPosts = getAllBlogPosts()
  const blogItems: HubItem[] = richPosts.map((post, index) => {
    const isPl = LANG === 'pl'
    const title = isPl ? post.titlePl || post.title : post.title
    const excerpt = isPl ? post.excerptPl || post.excerpt : post.excerpt
    const category = isPl ? post.categoryPl || post.category : post.category
    const readingTime = isPl ? post.readTimePl || post.readTime : post.readTime
    return {
      type: 'blog',
      slug: post.slug,
      title,
      excerpt,
      category,
      categoryLabel: category,
      badgeColor: BADGE_COLORS.blog,
      date: post.date,
      readingTime,
      href: blogHref(post.slug),
      isFeatured: index === 0 && post.status === 'published',
    }
  })
  // keep legacy BLOG_POSTS import usage in case any tests reference it
  void BLOG_POSTS

  const resourceItems: HubItem[] = RESOURCES.filter(r => r.status !== 'draft').map(r => ({
    type: 'resource',
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.formatLabel,
    categoryLabel: r.formatLabel,
    badgeColor: BADGE_COLORS.resource,
    date: r.publishedAt,
    href: resourceHref(r.slug),
    isFeatured: false,
  }))

  const caseStudyItems: HubItem[] = CASE_STUDIES.map(cs => ({
    type: 'case-study',
    slug: cs.slug,
    title: cs.title,
    excerpt: cs.excerpt,
    category: cs.industryLabel,
    categoryLabel: cs.industryLabel,
    badgeColor: BADGE_COLORS['case-study'],
    date: cs.publishedAt,
    href: caseStudyHref(cs.slug),
    isFeatured: false,
  }))

  const all = [...blogItems, ...resourceItems, ...caseStudyItems]
  all.sort((a, b) => b.date.localeCompare(a.date))
  return all
}

export function filterHubItems(items: HubItem[], type: ContentType | 'all'): HubItem[] {
  if (type === 'all') return items
  return items.filter(item => item.type === type)
}

export function getTypeLabel(type: ContentType, lang: 'en' | 'pl' = LANG): string {
  return TYPE_LABELS[type][lang]
}

export const contentTypes: Array<{ key: ContentType | 'all'; labelEn: string; labelPl: string }> = [
  { key: 'all', labelEn: 'All', labelPl: 'Wszystkie' },
  { key: 'blog', labelEn: 'Blog', labelPl: 'Blog' },
  { key: 'resource', labelEn: 'Guides & Templates', labelPl: 'Przewodniki i szablony' },
  { key: 'case-study', labelEn: 'Case Studies', labelPl: 'Case Studies' },
]
