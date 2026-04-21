// JSON-LD helpers for SEO schema. Keep serialization minimal — Google is
// strict about unknown properties showing up in rich-result validation.

const SITE_EN = 'https://procurea.io'
const SITE_PL = 'https://procurea.pl'

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'
const SITE = isEN ? SITE_EN : SITE_PL

export function abs(path: string): string {
  if (!path) return SITE
  if (path.startsWith('http')) return path
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`
}

export interface Crumb {
  name: string
  /** Relative path (`/funkcje/ai-sourcing`) or absolute URL */
  path: string
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  if (!crumbs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'Procurea',
    url: SITE,
    logo: `${SITE}/logo-procurea.png`,
    foundingDate: '2025',
    founder: { '@type': 'Person', name: 'Rafał Reiwer' },
    sameAs: [
      'https://www.linkedin.com/company/procurea',
    ],
    description: isEN
      ? 'AI-powered procurement automation platform.'
      : 'Platforma AI do automatyzacji procurement.',
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: 'Procurea',
    inLanguage: isEN ? 'en' : 'pl',
    publisher: { '@id': `${SITE}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}${isEN ? '/resources' : '/materialy'}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
