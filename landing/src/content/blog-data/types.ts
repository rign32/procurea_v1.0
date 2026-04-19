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

// Optional inline visual components rendered after the section body.
// Each field is optional — undefined means "don't render that component".
export interface BlogSectionPullQuote {
  text: string
  textPl?: string
  author?: string
  role?: string
  rolePl?: string
}

export interface BlogSectionStatItem {
  value: string
  label: string
  labelPl?: string
}

export interface BlogSectionStatBlock {
  stats: BlogSectionStatItem[]
  columns?: 2 | 3 | 4
}

export interface BlogSectionKeyTakeaway {
  title?: string
  titlePl?: string
  items: string[]
  itemsPl?: string[]
}

export interface BlogSectionWarning {
  title: string
  titlePl?: string
  text: string
  textPl?: string
  tone?: 'warning' | 'danger'
}

export interface BlogSectionBeforeAfter {
  before: string
  beforePl?: string
  after: string
  afterPl?: string
  beforeLabel?: string
  beforeLabelPl?: string
  afterLabel?: string
  afterLabelPl?: string
}

export interface BlogSectionStep {
  title: string
  titlePl?: string
  description: string
  descriptionPl?: string
}

export interface BlogSectionStepByStep {
  steps: BlogSectionStep[]
}

export interface BlogSectionComparisonTable {
  headers: string[]
  headersPl?: string[]
  rows: (string | number)[][]
  rowsPl?: (string | number)[][]
  highlighted?: number
  caption?: string
  captionPl?: string
}

export interface BlogSectionCountryHighlight {
  label: string
  labelPl?: string
  value: string
  valuePl?: string
}

export interface BlogSectionCountryCard {
  flag: string
  country: string
  countryPl?: string
  tagline?: string
  taglinePl?: string
  highlights: BlogSectionCountryHighlight[]
}

export interface BlogSectionStatsTimelineItem {
  label: string
  labelPl?: string
  value: number
  display?: string
  displayPl?: string
}

export interface BlogSectionStatsTimeline {
  data: BlogSectionStatsTimelineItem[]
  title?: string
  titlePl?: string
}

export interface BlogSectionProcessDiagramNode {
  id: string
  label: string
  labelPl?: string
  x: number
  y: number
}

export interface BlogSectionProcessDiagramEdge {
  from: string
  to: string
  label?: string
  labelPl?: string
}

export interface BlogSectionProcessDiagram {
  nodes: BlogSectionProcessDiagramNode[]
  edges: BlogSectionProcessDiagramEdge[]
  height?: number
  title?: string
  titlePl?: string
}

export interface BlogSection {
  heading: string
  headingPl: string
  body: string
  bodyPl: string
  subSections?: BlogSubSection[]
  inlineCta?: BlogInlineCta
  /**
   * Optional key into the infographic registry
   * (`src/assets/content-hub/InfographicRegistry.tsx`).
   * When set, BlogPostPage renders the matching SVG infographic
   * between the section body and its inline CTA (or subSections).
   */
  infographicKey?: string
  /** Optional caption rendered below the infographic (EN). */
  infographicCaption?: string
  /** Optional caption rendered below the infographic (PL). */
  infographicCaptionPl?: string

  // Optional inline visual components — rendered after the section body.
  pullQuote?: BlogSectionPullQuote
  statBlock?: BlogSectionStatBlock
  keyTakeaway?: BlogSectionKeyTakeaway
  warning?: BlogSectionWarning
  beforeAfter?: BlogSectionBeforeAfter
  stepByStep?: BlogSectionStepByStep
  comparisonTable?: BlogSectionComparisonTable
  countryCards?: BlogSectionCountryCard[]
  statsTimeline?: BlogSectionStatsTimeline
  processDiagram?: BlogSectionProcessDiagram
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
