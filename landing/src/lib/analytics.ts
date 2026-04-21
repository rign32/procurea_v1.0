declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const isBrowser = typeof window !== 'undefined'

function gtag(...args: any[]) {
  if (isBrowser && window.gtag) window.gtag(...args)
}

// ---------------------------------------------------------------------------
// Core event
// ---------------------------------------------------------------------------

export function trackEvent(name: string, params?: Record<string, any>) {
  gtag('event', name, params ?? {})
}

// ---------------------------------------------------------------------------
// Page view (SPA)
// ---------------------------------------------------------------------------
// GA4 fires an initial page_view on load, but React Router navigations are
// client-side and don't trigger it. We fire a manual page_view on every route
// change, enriched with page_group (home/feature/industry/blog/resource/...).

const PAGE_GROUP_RULES: Array<[RegExp, string]> = [
  [/^\/$/, 'home'],
  [/^\/(cennik|pricing)$/, 'pricing'],
  [/^\/(kontakt|contact)$/, 'contact'],
  [/^\/(o-nas|about)$/, 'about'],
  [/^\/(partnerzy|partners)$/, 'partners'],
  [/^\/(porownanie|vs-manual-sourcing)$/, 'comparison'],
  [/^\/(funkcje|features)\/?$/, 'features-hub'],
  [/^\/(funkcje|features)\//, 'feature-detail'],
  [/^\/(dla-kogo|industries)\/?$/, 'industries-hub'],
  [/^\/(dla-kogo|industries)\//, 'industry-detail'],
  [/^\/(integracje|integrations)/, 'integrations'],
  [/^\/(materialy|resources)\/?$/, 'content-hub'],
  [/^\/(materialy|resources)\//, 'resource-detail'],
  [/^\/blog\//, 'blog-post'],
  [/^\/(regulamin|terms|polityka-prywatnosci|privacy|rodo|gdpr|bezpieczenstwo|security|zgodnosc|compliance)/, 'legal'],
]

function pageGroupFor(pathname: string): string {
  for (const [pattern, group] of PAGE_GROUP_RULES) {
    if (pattern.test(pathname)) return group
  }
  return 'other'
}

export function trackPageView(pathname: string, search = '') {
  if (!isBrowser) return
  const pagePath = pathname + search
  const pageLocation = window.location.origin + pagePath
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: pageLocation,
    page_title: document.title,
    page_group: pageGroupFor(pathname),
  })
}

// ---------------------------------------------------------------------------
// UTM + traffic source capture (one-shot per session, exposed as user props)
// ---------------------------------------------------------------------------

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const UTM_STORAGE_KEY = 'procurea.utm.v1'

type UtmBag = Partial<Record<(typeof UTM_KEYS)[number] | 'gclid' | 'fbclid' | 'referrer' | 'landing_page', string>>

export function initAttribution() {
  if (!isBrowser) return
  try {
    const url = new URL(window.location.href)
    const existingRaw = sessionStorage.getItem(UTM_STORAGE_KEY)
    const existing: UtmBag = existingRaw ? JSON.parse(existingRaw) : {}
    const next: UtmBag = { ...existing }

    let updated = false
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k)
      if (v && next[k] !== v) {
        next[k] = v
        updated = true
      }
    }
    const gclid = url.searchParams.get('gclid')
    if (gclid && next.gclid !== gclid) { next.gclid = gclid; updated = true }
    const fbclid = url.searchParams.get('fbclid')
    if (fbclid && next.fbclid !== fbclid) { next.fbclid = fbclid; updated = true }

    // First-touch referrer + landing page (only set if empty)
    if (!next.referrer) {
      next.referrer = document.referrer || '(direct)'
      updated = true
    }
    if (!next.landing_page) {
      next.landing_page = url.pathname
      updated = true
    }

    if (updated) sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(next))

    // Attach as GA4 user properties (visible as custom dimensions once registered in GA admin)
    gtag('set', 'user_properties', {
      first_utm_source: next.utm_source ?? null,
      first_utm_medium: next.utm_medium ?? null,
      first_utm_campaign: next.utm_campaign ?? null,
      first_referrer: next.referrer ?? null,
      first_landing_page: next.landing_page ?? null,
    })
  } catch {
    // Fail silent — attribution is best-effort
  }
}

// ---------------------------------------------------------------------------
// High-level event helpers (inbound funnel)
// ---------------------------------------------------------------------------

export function trackCtaClick(location: string, extras?: Record<string, any>) {
  trackEvent('cta_click', { cta_location: location, ...extras })
}

export function trackSectionView(sectionId: string) {
  trackEvent('section_view', { section_id: sectionId })
}

export function trackOutboundClick(href: string, label?: string) {
  trackEvent('outbound_click', { link_url: href, link_label: label })
}

export function trackAppClick(location: string) {
  // Specifically for clicks that hand off to app.procurea.{pl|io}
  trackEvent('app_click', { cta_location: location })
}

export function trackFormStart(formId: string) {
  trackEvent('form_start', { form_id: formId })
}

export function trackFormSubmit(formId: string, extras?: Record<string, any>) {
  trackEvent('form_submit', { form_id: formId, ...extras })
}

export function trackLeadSubmit(source: string, extras?: Record<string, any>) {
  // Marked as a GA4 "conversion" candidate — flip in GA admin
  trackEvent('lead_submit', { source, ...extras })
}

export function trackLeadMagnetDownload(slug: string, extras?: Record<string, any>) {
  // Marked as a GA4 "conversion" candidate — flip in GA admin
  trackEvent('lead_magnet_download', { resource_slug: slug, ...extras })
}

export function trackNewsletterSignup(source: string) {
  trackEvent('newsletter_signup', { source })
}

export function trackBlogRead(slug: string, milestone: 25 | 50 | 75 | 90) {
  trackEvent('blog_read', { blog_slug: slug, percent: milestone })
}

export function trackSearch(query: string) {
  trackEvent('search', { search_term: query })
}

export function trackVideoPlay(videoId: string) {
  trackEvent('video_play', { video_id: videoId })
}

// ---------------------------------------------------------------------------
// Scroll + section observers
// ---------------------------------------------------------------------------

const trackedSections = new Set<string>()

export function initSectionTracking() {
  if (!isBrowser) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).dataset.trackSection
          if (id && !trackedSections.has(id)) {
            trackedSections.add(id)
            trackSectionView(id)
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  requestAnimationFrame(() => {
    document.querySelectorAll('[data-track-section]').forEach((el) => {
      observer.observe(el)
    })
  })

  return () => observer.disconnect()
}

export function initScrollDepthTracking(onMilestone?: (m: 25 | 50 | 75 | 90) => void) {
  if (!isBrowser) return

  const milestones = [25, 50, 75, 90] as const
  const fired = new Set<number>()

  const handler = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) return
    const scrollPct = Math.round((window.scrollY / docHeight) * 100)
    milestones.forEach((m) => {
      if (scrollPct >= m && !fired.has(m)) {
        fired.add(m)
        trackEvent('scroll_depth', { percent: m })
        onMilestone?.(m)
      }
    })
  }

  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}

// ---------------------------------------------------------------------------
// Outbound-link auto-tracking (one-shot init)
// ---------------------------------------------------------------------------

let outboundInit = false
export function initOutboundTracking() {
  if (!isBrowser || outboundInit) return
  outboundInit = true

  const isInternal = (href: string) => {
    try {
      const u = new URL(href, window.location.href)
      if (u.origin === window.location.origin) return true
      const h = u.hostname
      if (/\.procurea\.(pl|io)$/.test(h) || h === 'procurea.pl' || h === 'procurea.io') return true
      return false
    } catch {
      return true
    }
  }

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      try {
        const u = new URL(href, window.location.href)
        const h = u.hostname
        if (/^app\.procurea\.(pl|io)$/.test(h)) {
          trackAppClick(anchor.dataset.ctaLocation || anchor.textContent?.trim().slice(0, 60) || 'unknown')
          return
        }
        if (!isInternal(href)) {
          trackOutboundClick(u.href, anchor.textContent?.trim().slice(0, 80) || undefined)
        }
      } catch {
        // ignore malformed href
      }
    },
    { capture: true }
  )
}
