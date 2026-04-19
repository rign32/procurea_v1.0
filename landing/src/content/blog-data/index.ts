// Blog post aggregator — merges skeletons with full-content Wave 1 / Wave 2 / Wave 3 posts
// Wave 1, 2, 3 full-content posts OVERRIDE matching-slug skeletons (status → 'published')

import type { RichBlogPost } from './types'
import { BLOG_SKELETONS } from './skeletons'
import { WAVE_1_POSTS } from './wave-1'
import { WAVE_2_POSTS } from './wave-2'
import { WAVE_3_POSTS } from './wave-3'

export function getAllBlogPosts(): RichBlogPost[] {
  const bySlug = new Map<string, RichBlogPost>()
  for (const post of BLOG_SKELETONS) {
    bySlug.set(post.slug, post)
  }
  for (const post of WAVE_1_POSTS) {
    bySlug.set(post.slug, { ...post, status: 'published' })
  }
  for (const post of WAVE_2_POSTS) {
    bySlug.set(post.slug, { ...post, status: 'published' })
  }
  for (const post of WAVE_3_POSTS) {
    bySlug.set(post.slug, { ...post, status: 'published' })
  }
  const all = Array.from(bySlug.values())
  all.sort((a, b) => b.date.localeCompare(a.date))
  return all
}

export function getPublishedBlogPosts(): RichBlogPost[] {
  return getAllBlogPosts().filter(p => p.status === 'published' || p.status === 'scheduled')
}

export function getBlogPostBySlug(slug: string): RichBlogPost | undefined {
  return getAllBlogPosts().find(p => p.slug === slug)
}

export function getRelatedPosts(slug: string, limit = 3): RichBlogPost[] {
  const post = getBlogPostBySlug(slug)
  if (!post) return []
  const all = getAllBlogPosts()
  const found = post.relatedPosts
    .map(relSlug => all.find(p => p.slug === relSlug))
    .filter((p): p is RichBlogPost => Boolean(p))
    .slice(0, limit)
  if (found.length >= limit) return found
  const fallback = all.filter(
    p => p.pillar === post.pillar && p.slug !== slug && !post.relatedPosts.includes(p.slug)
  )
  return [...found, ...fallback].slice(0, limit)
}

export function getBlogSlugs(): string[] {
  return getAllBlogPosts().map(p => p.slug)
}

export { BLOG_SKELETONS, WAVE_1_POSTS, WAVE_2_POSTS, WAVE_3_POSTS }
export * from './types'
