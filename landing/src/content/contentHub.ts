// Unified content hub aggregator — combines blog posts + downloadable resources
// into a single filterable list. Case studies were retired 2026-04-21.

import { BLOG_POSTS } from './blog'
import { getAllBlogPosts } from './blog-data'
import { RESOURCES } from './resources'
import { pathMappings } from '../i18n/paths'

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'

export type ContentType = 'blog' | 'resource'

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

const BADGE_COLORS: Record<ContentType, BadgeColor> = {
  blog: 'teal',
  resource: 'amber',
}

const TYPE_LABELS: Record<ContentType, { en: string; pl: string }> = {
  blog: { en: 'Article', pl: 'Artykuł' },
  resource: { en: 'Guide', pl: 'Przewodnik' },
}

function blogHref(slug: string): string {
  return `${pathMappings.blogIndex[LANG]}/${slug}`
}

function resourceHref(slug: string): string {
  return `${pathMappings.resourcesHub[LANG]}/${slug}`
}

export function getAllHubItems(): HubItem[] {
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

  const all = [...blogItems, ...resourceItems]
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
  { key: 'blog', labelEn: 'Articles', labelPl: 'Artykuły' },
  { key: 'resource', labelEn: 'Guides & Templates', labelPl: 'Przewodniki i szablony' },
]
