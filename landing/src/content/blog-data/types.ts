// Rich BlogPost schema for content hub
// Replaces the legacy flat BlogPost in blog.ts (which stays for migration compatibility)

export type BlogPillar =
  | 'ai-sourcing-automation'
  | 'erp-crm-integration'
  | 'multilingual-outreach'
  | 'supplier-intelligence'
  | 'offer-comparison'
  | 'supply-chain-strategy'

export type BlogPersona = 'P1' | 'P2' | 'P3' | 'Mixed'
export type BlogFunnel = 'TOFU' | 'MOFU' | 'BOFU'
export type BlogJsonLdType = 'Article' | 'HowTo' | 'FAQPage'
export type BlogStatus = 'published' | 'skeleton' | 'draft' | 'scheduled'

export interface BlogAuthor {
  name: string
  role: string
  avatarKey?: string // key into AuthorAvatars
}

export interface BlogInlineCta {
  text: string
  textPl: string
  href: string
  variant: 'magnet' | 'trial' | 'demo' | 'calculator'
}

export interface BlogSubSection {
  heading: string
  headingPl: string
  body: string
  bodyPl: string
}

export interface BlogSection {
  heading: string
  headingPl: string
  body: string
  bodyPl: string
  subSections?: BlogSubSection[]
  inlineCta?: BlogInlineCta
}

export interface BlogFaqItem {
  question: string
  questionPl: string
  answer: string
  answerPl: string
}

export interface BlogPrimaryCta {
  text: string
  textPl: string
  href: string
  type: 'trial' | 'demo' | 'magnet' | 'calendar'
}

export interface RichBlogPost {
  slug: string
  // Status — 'skeleton' posts show outline + short excerpt only (Wave 2/3 before Copywriter fills)
  status: BlogStatus

  // Language-aware copy
  title: string
  titlePl?: string
  excerpt: string
  excerptPl?: string

  // Publication
  date: string // ISO publish date
  readTime: string
  readTimePl?: string
  wordCount?: number

  // Categorization
  pillar: BlogPillar
  persona: BlogPersona
  funnel: BlogFunnel
  category: string // EN display label (e.g. "AI Sourcing Automation")
  categoryPl?: string

  // SEO
  primaryKeyword: string
  secondaryKeywords?: string[]
  searchVolume?: number
  metaTitle?: string
  metaTitlePl?: string
  metaDescription?: string
  metaDescriptionPl?: string
  jsonLdType?: BlogJsonLdType

  // Authors
  author: BlogAuthor

  // Content (skeleton posts have empty sections until Copywriter writes)
  outline?: string // 1-line what the post covers (from Notion)
  sections?: BlogSection[]
  faq?: BlogFaqItem[]

  // Cross-linking
  relatedPosts: string[]
  relatedFeatures: string[] // PathKey refs
  relatedIndustries: string[]
  leadMagnetSlug?: string

  // Primary CTA for end-of-post block
  primaryCta: BlogPrimaryCta

  // Hero visual — key into HeroBackgrounds.tsx
  heroBackgroundKey?: string
}

// Backwards-compat for current blog.ts BlogPost shape
export interface LegacyBlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  content: string
}
