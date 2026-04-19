// Blog content — aggregated from blog-data/ (skeletons + Wave 1 full content).
// Preserves the legacy BlogPost shape for backward compatibility with BlogIndexPage/BlogPostPage.
// For rich features (sections, FAQ, cross-links, pillar filters), import from './blog-data' directly.

import type { RichBlogPost } from './blog-data/types'
import { getAllBlogPosts, getBlogPostBySlug } from './blog-data'

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Legacy flat shape — still used by older BlogIndex/BlogPostPage until they migrate to rich shape
export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  content: string
}

function legacyShapeFromRich(post: RichBlogPost): BlogPost {
  const title = isEN ? post.title : post.titlePl || post.title
  const excerpt = isEN ? post.excerpt : post.excerptPl || post.excerpt
  const readTime = isEN ? post.readTime : post.readTimePl || post.readTime
  const category = isEN ? post.category : post.categoryPl || post.category

  // Build a flat content string from sections (skeleton posts get outline only)
  let content: string
  if (post.sections && post.sections.length > 0) {
    content = post.sections
      .map(section => {
        const heading = isEN ? section.heading : section.headingPl
        const body = isEN ? section.body : section.bodyPl
        return `## ${heading}\n\n${body}`
      })
      .join('\n\n')
  } else {
    // Skeleton fallback — just show outline + "coming soon"
    const comingSoon = isEN
      ? `*This article is part of the Procurea content roadmap — full content publishes on ${post.date}.*`
      : `*Ten artykuł jest częścią content roadmap Procurea — pełna treść zostanie opublikowana ${post.date}.*`
    content = `${comingSoon}\n\n${post.outline || excerpt}`
  }

  return {
    slug: post.slug,
    title,
    excerpt,
    date: post.date,
    readTime,
    category,
    content,
  }
}

export const BLOG_POSTS: BlogPost[] = getAllBlogPosts().map(legacyShapeFromRich)

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

// Helpers that return RichBlogPost for new-style consumers
export function getRichBlogPost(slug: string): RichBlogPost | undefined {
  return getBlogPostBySlug(slug)
}

export type { RichBlogPost } from './blog-data/types'
export { getAllBlogPosts, getRelatedPosts, getBlogSlugs } from './blog-data'
