// Blog hero + inline + OG image registry.
// Maps post slug → webp image paths served from /public/blog/<slug>/.
// When a slug has entries here, BlogIndexPage/BlogPostPage render raster <img>
// instead of the legacy SVG BlogHero component.

export interface BlogPostImages {
  hero: string
  inline1?: string
  inline2?: string
  inline3?: string
  og?: string
}

function postImages(slug: string, inlines: number, hasOg = true): BlogPostImages {
  const base = `/blog/${slug}`
  const entry: BlogPostImages = { hero: `${base}/hero.webp` }
  if (inlines >= 1) entry.inline1 = `${base}/inline-1.webp`
  if (inlines >= 2) entry.inline2 = `${base}/inline-2.webp`
  if (inlines >= 3) entry.inline3 = `${base}/inline-3.webp`
  if (hasOg) entry.og = `${base}/og.webp`
  return entry
}

export const BLOG_POST_IMAGES: Record<string, BlogPostImages> = {
  // Group 1 — AI Sourcing Automation
  'how-to-find-100-verified-suppliers-in-under-an-hour': postImages('how-to-find-100-verified-suppliers-in-under-an-hour', 2),
  'the-30-hour-problem': postImages('the-30-hour-problem', 2),
  'ai-procurement-software-7-features-2026': postImages('ai-procurement-software-7-features-2026', 2),
  'sourcing-funnel-explained': postImages('sourcing-funnel-explained', 2),
  'buyers-guide-12-questions-ai-sourcing': postImages('buyers-guide-12-questions-ai-sourcing', 2),

  // Group 2 — ERP & CRM Integration
  'netsuite-supplier-management': postImages('netsuite-supplier-management', 2),
  'sap-ariba-alternative-procurement': postImages('sap-ariba-alternative-procurement', 2),
  'salesforce-for-procurement': postImages('salesforce-for-procurement', 2),

  // Group 3 — Multilingual Outreach / Nearshoring
  'european-nearshoring-guide-2026': postImages('european-nearshoring-guide-2026', 3),
  'turkey-vs-poland-vs-portugal-textiles': postImages('turkey-vs-poland-vs-portugal-textiles', 2),
  'german-manufacturer-sourcing': postImages('german-manufacturer-sourcing', 2),
  'china-plus-one-strategy': postImages('china-plus-one-strategy', 2),

  // Group 4 — Supplier Intelligence & Risk
  'vat-vies-verification-3-minute-check': postImages('vat-vies-verification-3-minute-check', 2),
  'supplier-risk-management-2026': postImages('supplier-risk-management-2026', 3),
  'supplier-certifications-guide': postImages('supplier-certifications-guide', 2),
  'supplier-database-stale-40-percent': postImages('supplier-database-stale-40-percent', 2),

  // Group 5 — Offer Comparison
  'rfq-automation-workflows': postImages('rfq-automation-workflows', 2),
  'rfq-comparison-template-buyers-use': postImages('rfq-comparison-template-buyers-use', 2),
  'vendor-scoring-10-criteria': postImages('vendor-scoring-10-criteria', 2),
  'tco-beat-lowest-price-trap': postImages('tco-beat-lowest-price-trap', 3),
}

export function getBlogPostImages(slug: string): BlogPostImages | undefined {
  return BLOG_POST_IMAGES[slug]
}
