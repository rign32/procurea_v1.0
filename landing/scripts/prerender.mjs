#!/usr/bin/env node
// Post-build static HTML prerender.
// For each route in routesMeta config, generate dist/<route>/index.html
// with route-specific <title>/<meta>/OG/JSON-LD baked into <head>.
//
// This gives social crawlers (FB/LinkedIn/Twitter) and Google unique
// meta per URL without needing full SSR.
//
// Usage: node scripts/prerender.mjs [--mode=production|production-en|staging|staging-en]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const mode = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'production'
const isEN = mode === 'production-en' || mode === 'staging-en'
const isStaging = mode === 'staging' || mode === 'staging-en'

let DIST, SITE
if (isStaging) {
  DIST = isEN ? join(ROOT, 'dist-staging-en') : join(ROOT, 'dist-staging')
  SITE = isEN ? 'https://procurea-landing-staging-en.web.app' : 'https://procurea-landing-staging.web.app'
} else {
  DIST = isEN ? join(ROOT, 'dist-en') : join(ROOT, 'dist')
  SITE = isEN ? 'https://procurea.io' : 'https://procurea.pl'
}
const LANG = isEN ? 'en' : 'pl'

// Mirror of routesMeta.ts (lightweight — we can't import TS here).
// Keep in sync when adding routes.
const ROUTES_PL = [
  '/', '/cennik', '/o-nas', '/kontakt', '/funkcje', '/dla-kogo', '/integracje',
  '/regulamin', '/polityka-prywatnosci', '/rodo', '/bezpieczenstwo', '/zgodnosc',
  '/dla-kogo/produkcja', '/dla-kogo/eventy', '/dla-kogo/budownictwo', '/dla-kogo/retail-ecommerce',
  '/dla-kogo/gastronomia', '/dla-kogo/ochrona-zdrowia', '/dla-kogo/logistyka', '/dla-kogo/mro-utrzymanie-ruchu',
  '/funkcje/ai-sourcing', '/funkcje/outreach-mailowy', '/funkcje/supplier-portal', '/funkcje/porownywarka-ofert',
  '/porownanie',
  '/partnerzy',
]

const ROUTES_EN = [
  '/', '/pricing', '/about', '/contact', '/features', '/industries', '/integrations',
  '/terms', '/privacy', '/gdpr', '/security', '/compliance',
  '/industries/manufacturing', '/industries/events', '/industries/construction', '/industries/retail-ecommerce',
  '/industries/horeca', '/industries/healthcare', '/industries/logistics', '/industries/mro',
  '/features/ai-sourcing', '/features/email-outreach', '/features/supplier-portal', '/features/offer-comparison',
  '/vs-manual-sourcing',
  '/partners',
]

const META = {
  '/': {
    title: 'Procurea — AI-powered procurement automation',
    description: 'AI Sourcing + Procurement automation for global teams. Find verified suppliers in minutes. Integrates with SAP, Oracle, Dynamics, Salesforce.',
  },
  '/cennik': { title: 'Cennik — Procurea', description: 'Sourcing od $199/mies. Full Workflow Bundle (Sourcing + Procurement) od $399/mies. Enterprise Custom dostępny. Roczne rozliczenie oszczędza 20%.' },
  '/pricing': { title: 'Pricing — Procurea', description: 'Sourcing from $199/mo. Full Workflow Bundle (Sourcing + Procurement) from $399/mo. Enterprise Custom available. Annual billing saves 20%.' },
  '/o-nas': { title: 'O nas — Procurea', description: 'Procurea buduje AI-native automatyzację procurement dla globalnych zespołów.' },
  '/about': { title: 'About Procurea — AI-native procurement automation', description: 'Procurea builds AI-native procurement automation for global teams. Learn about our mission, team, and technology stack.' },
  '/kontakt': { title: 'Kontakt — Procurea', description: 'Porozmawiajmy o demo, planie Procurement, lub integracjach ERP. Odpowiadamy w ciągu 24h.' },
  '/contact': { title: 'Contact us — Procurea', description: 'Talk to us about enterprise demo, Procurement add-on, or ERP integrations. Response within 24 hours.' },
  '/funkcje': { title: 'Funkcje — Procurea', description: 'AI Sourcing, RFQ Automation, Supplier Portal, Porównywarka Ofert, Wielojęzyczny Outreach, Raporty PDF/PPTX i więcej.' },
  '/features': { title: 'Features — Procurea', description: 'AI Sourcing, RFQ Automation, Supplier Portal, Offer Comparison, Multilingual Outreach, PDF Reports, and more.' },
  '/dla-kogo': { title: 'Dla kogo — Procurea', description: 'Produkcja, Eventy, Budownictwo, Retail, Healthcare, HoReCa, Logistyka, MRO — automatyzacja procurement dostosowana do branży.' },
  '/industries': { title: 'Who is Procurea for — Industries', description: 'Manufacturing, Events, Construction, Retail, Healthcare, HoReCa, Logistics, MRO — procurement automation tailored per industry.' },
  '/integracje': { title: 'Integracje — Procurea działa z Twoim ERP', description: 'SAP S/4HANA, Oracle NetSuite, Oracle Fusion Cloud, Dynamics 365, Salesforce i 50+ więcej przez Merge.dev. Bez duplikacji danych.' },
  '/integrations': { title: 'Integrations — Procurea works with your stack', description: 'SAP S/4HANA, Oracle NetSuite, Oracle Fusion Cloud, Dynamics 365, Salesforce, and 50+ more via Merge.dev. No duplicate data entry.' },
  // Industries
  '/dla-kogo/produkcja': { title: 'AI procurement dla Produkcji — Procurea', description: 'Wyszukiwanie dostawców dla fabryk, OEM i kupujących przemysłowych. Alternatywni dostawcy, dual sourcing, kwalifikacja z certyfikatami (ISO 9001, IATF 16949).' },
  '/industries/manufacturing': { title: 'AI procurement for Manufacturing — Procurea', description: 'Supplier discovery for factories, OEMs, and industrial buyers. Alternative vendors, dual sourcing, supplier qualification with certificates (ISO 9001, IATF 16949).' },
  '/dla-kogo/eventy': { title: 'Sourcing dla Agencji Eventowych — Procurea', description: 'Lokalni dostawcy w 48h — catering, AV, scenografia, gadżety. Sourcing w obcym mieście dla event producerów.' },
  '/industries/events': { title: 'Sourcing for Event Agencies — Procurea', description: 'Find local vendors in 48h — catering, AV, scenography, gadgets. Sourcing in foreign cities made fast for event producers.' },
  '/dla-kogo/budownictwo': { title: 'Procurement dla Budownictwa — Procurea', description: 'Materiały i podwykonawcy dla deweloperów i generalnych wykonawców. RFQ do 30+ podwykonawców naraz, porównanie cenowe.' },
  '/industries/construction': { title: 'Procurement for Construction — Procurea', description: 'Materials and subcontractors for developers and general contractors. RFQ to 30+ subcontractors at once, tiered pricing comparison.' },
  '/dla-kogo/retail-ecommerce': { title: 'Sourcing Private Label dla Retail & E-commerce — Procurea', description: 'Producenci private label w Europie, Turcji, nearshore. Migracja z Chin z 18+ alternatywnymi fabrykami w tygodniach zamiast miesięcy.' },
  '/industries/retail-ecommerce': { title: 'Private label sourcing for Retail & E-commerce — Procurea', description: 'Private label manufacturers in Europe, Turkey, nearshore. Migrate from China with 18+ alternative factories in weeks instead of months.' },
  '/dla-kogo/gastronomia': { title: 'Procurement dla HoReCa — Procurea', description: 'Sourcing składników F&B, sprzętu kuchennego i zastawy stołowej dla restauracji, hoteli i cateringu. Dostawcy z certyfikatami HACCP/IFS/BRC wyszukani przez AI.' },
  '/industries/horeca': { title: 'Procurement for HoReCa — Procurea', description: 'F&B ingredient sourcing, kitchen equipment, tableware for restaurants, hotels, and catering. HACCP/IFS/BRC certified suppliers discovered by AI.' },
  '/dla-kogo/ochrona-zdrowia': { title: 'Sourcing wyrobów medycznych — Procurea', description: 'Producenci wyrobów medycznych z certyfikatami CE/MDR/ISO 13485. Compliance-first AI sourcing dla szpitali i klinik.' },
  '/industries/healthcare': { title: 'Medical device sourcing for Healthcare — Procurea', description: 'CE/MDR/ISO 13485-certified medical device manufacturers and disposable suppliers. Compliance-first AI sourcing for hospitals and clinics.' },
  '/dla-kogo/logistyka': { title: 'Sourcing dostawców dla Logistyki — Procurea', description: 'Sprzęt magazynowy, części zamienne do floty i dostawcy usług 3PL. AI-powered wyszukiwanie dostawców na rynkach i w językach.' },
  '/industries/logistics': { title: 'Supplier sourcing for Logistics — Procurea', description: 'Warehouse equipment, fleet spare parts, and 3PL service providers. AI-powered supplier discovery across markets and languages.' },
  '/dla-kogo/mro-utrzymanie-ruchu': { title: 'Procurement MRO — Procurea', description: 'Przemysłowe części zamienne, dostawcy usług maintenance i zarządzania obiektami. Zmniejsz przestoje z zakwalifikowanymi backup dostawcami i konkurencyjnymi RFQ.' },
  '/industries/mro': { title: 'MRO procurement — Procurea', description: 'Industrial spare parts, maintenance service providers, and facilities management. Reduce downtime with pre-qualified backup suppliers and competitive RFQ.' },
  // Features
  '/funkcje/ai-sourcing': { title: 'AI Sourcing — Procurea', description: 'Opisz czego szukasz. AI dostarcza zweryfikowaną listę dostawców w kilka minut. Dostępne od Starter Sourcing ($199/mies).' },
  '/features/ai-sourcing': { title: 'AI Sourcing — Procurea', description: 'Describe what you need. AI delivers a verified supplier shortlist in minutes. Available from Starter Sourcing ($199/mo).' },
  '/funkcje/outreach-mailowy': { title: 'Email Outreach (Automatyzacja RFQ) — Procurea', description: 'Wyślij RFQ do setek dostawców jednym kliknięciem — zlokalizowane per kraj. Dostępne z Procurement add-on.' },
  '/features/email-outreach': { title: 'Email Outreach (RFQ Automation) — Procurea', description: 'Send RFQ to hundreds of suppliers with one click — localized per supplier country. Available with Procurement add-on.' },
  '/funkcje/supplier-portal': { title: 'Supplier Portal — Procurea', description: 'Portal z magic-link gdzie dostawcy składają oferty — bez logowania, bez friction. Tiered pricing, warianty, załączniki.' },
  '/features/supplier-portal': { title: 'Supplier Portal — Procurea', description: 'Magic-link portal where suppliers submit offers — no login, no friction. Quantity breaks, variants, attachments included.' },
  '/funkcje/porownywarka-ofert': { title: 'Porównywarka Ofert & Raporty — Procurea', description: 'Porównanie side-by-side wszystkich odpowiedzi RFQ — cena, MOQ, lead time, certyfikaty. Eksport do PDF/PPTX.' },
  '/features/offer-comparison': { title: 'Offer Comparison & Reports — Procurea', description: 'Side-by-side comparison of all RFQ responses — price, MOQ, lead time, certifications. Export to PDF/PPTX. Available from Professional +Procurement.' },
  // Legal
  '/regulamin': { title: 'Regulamin — Procurea', description: 'Regulamin korzystania z platformy Procurea.' },
  '/terms': { title: 'Terms of Service — Procurea', description: 'Procurea platform terms of service.' },
  '/polityka-prywatnosci': { title: 'Polityka Prywatności — Procurea', description: 'Polityka prywatności Procurea.' },
  '/privacy': { title: 'Privacy Policy — Procurea', description: 'Procurea privacy policy.' },
  '/rodo': { title: 'RODO — Procurea', description: 'Informacje o przetwarzaniu danych osobowych zgodnie z RODO.' },
  '/gdpr': { title: 'GDPR — Procurea', description: 'GDPR compliance information.' },
  '/bezpieczenstwo': { title: 'Bezpieczenstwo — Procurea', description: 'Infrastruktura Google Cloud, szyfrowanie AES-256, OAuth 2.0, izolacja danych i monitoring 24/7.' },
  '/security': { title: 'Security — Procurea', description: 'Google Cloud infrastructure, AES-256 encryption, OAuth 2.0 authentication, data isolation, and 24/7 monitoring.' },
  '/zgodnosc': { title: 'Zgodnosc i ochrona danych — Procurea', description: 'Zgodnosc z RODO, rezydencja danych w UE, retencja danych, podprocesory i prawo do usuniecia danych.' },
  '/compliance': { title: 'Compliance & Data Protection — Procurea', description: 'GDPR compliance, EU data residency, data retention policies, sub-processors, and right to deletion.' },
  '/porownanie': { title: 'Procurea vs Reczny Sourcing — Porownanie', description: 'Porownanie AI procurement automation z tradycyjnym sourcingiem dostawcow. 30 godzin vs 20 minut.' },
  '/vs-manual-sourcing': { title: 'Procurea vs Manual Sourcing — Comparison', description: 'Compare AI procurement automation to traditional supplier sourcing. 30 hours vs 20 minutes.' },
  '/partnerzy': { title: 'Program partnerski — Procurea', description: 'Zostań partnerem Procurea. Współpracujemy z konsultantami ERP, agencjami procurement i partnerami technologicznymi.' },
  '/partners': { title: 'Partner Program — Procurea', description: 'Partner with Procurea. We work with ERP consultants, procurement agencies, and technology partners to bring AI sourcing to more teams.' },
}

// hreflang alternate mapping (PL slug ↔ EN slug)
const ALT_MAP = {
  '/': '/',
  '/cennik': '/pricing', '/pricing': '/cennik',
  '/o-nas': '/about', '/about': '/o-nas',
  '/kontakt': '/contact', '/contact': '/kontakt',
  '/funkcje': '/features', '/features': '/funkcje',
  '/dla-kogo': '/industries', '/industries': '/dla-kogo',
  '/integracje': '/integrations', '/integrations': '/integracje',
  '/regulamin': '/terms', '/terms': '/regulamin',
  '/polityka-prywatnosci': '/privacy', '/privacy': '/polityka-prywatnosci',
  '/rodo': '/gdpr', '/gdpr': '/rodo',
  '/bezpieczenstwo': '/security', '/security': '/bezpieczenstwo',
  '/zgodnosc': '/compliance', '/compliance': '/zgodnosc',
  '/dla-kogo/produkcja': '/industries/manufacturing', '/industries/manufacturing': '/dla-kogo/produkcja',
  '/dla-kogo/eventy': '/industries/events', '/industries/events': '/dla-kogo/eventy',
  '/dla-kogo/budownictwo': '/industries/construction', '/industries/construction': '/dla-kogo/budownictwo',
  '/dla-kogo/retail-ecommerce': '/industries/retail-ecommerce', '/industries/retail-ecommerce': '/dla-kogo/retail-ecommerce',
  '/dla-kogo/gastronomia': '/industries/horeca', '/industries/horeca': '/dla-kogo/gastronomia',
  '/dla-kogo/ochrona-zdrowia': '/industries/healthcare', '/industries/healthcare': '/dla-kogo/ochrona-zdrowia',
  '/dla-kogo/logistyka': '/industries/logistics', '/industries/logistics': '/dla-kogo/logistyka',
  '/dla-kogo/mro-utrzymanie-ruchu': '/industries/mro', '/industries/mro': '/dla-kogo/mro-utrzymanie-ruchu',
  '/porownanie': '/vs-manual-sourcing', '/vs-manual-sourcing': '/porownanie',
  '/partnerzy': '/partners', '/partners': '/partnerzy',
  '/funkcje/ai-sourcing': '/features/ai-sourcing', '/features/ai-sourcing': '/funkcje/ai-sourcing',
  '/funkcje/outreach-mailowy': '/features/email-outreach', '/features/email-outreach': '/funkcje/outreach-mailowy',
  '/funkcje/supplier-portal': '/features/supplier-portal', '/features/supplier-portal': '/funkcje/supplier-portal',
  '/funkcje/porownywarka-ofert': '/features/offer-comparison', '/features/offer-comparison': '/funkcje/porownywarka-ofert',
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function transformHtml(template, path, meta) {
  const canonical = `${SITE}${path}`
  const altPath = ALT_MAP[path] || '/'
  const altSite = isStaging
    ? (isEN ? 'https://procurea-landing-staging.web.app' : 'https://procurea-landing-staging-en.web.app')
    : (isEN ? 'https://procurea.pl' : 'https://procurea.io')
  const altLang = isEN ? 'pl' : 'en'
  const currentLang = isEN ? 'en' : 'pl'

  let html = template

  // Staging: inject noindex meta right after <head>
  if (isStaging && !html.includes('name="robots"')) {
    html = html.replace(
      '<head>',
      '<head>\n    <meta name="robots" content="noindex, nofollow" />'
    )
  }

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)

  // Description
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`)

  // OG title / description / url
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`)
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`)
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)

  // Twitter
  html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`)
  html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`)

  // Canonical
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)

  // hreflang alternates — replace all 3 existing alternate links with new set
  const hreflangBlock = `<link rel="alternate" hreflang="${currentLang}" href="${canonical}" />\n    <link rel="alternate" hreflang="${altLang}" href="${altSite}${altPath}" />\n    <link rel="alternate" hreflang="x-default" href="${isEN ? canonical : altSite + altPath}" />`
  html = html.replace(
    /<link rel="alternate" hreflang="pl"[^>]*\/>\s*<link rel="alternate" hreflang="en"[^>]*\/>\s*<link rel="alternate" hreflang="x-default"[^>]*\/>/,
    hreflangBlock
  )

  return html
}

function main() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error(`[prerender] ${indexPath} not found — run vite build first`)
    process.exit(1)
  }

  const template = readFileSync(indexPath, 'utf8')
  const routes = isEN ? ROUTES_EN : ROUTES_PL

  let count = 0
  for (const path of routes) {
    const meta = META[path]
    if (!meta) {
      console.warn(`[prerender] no meta for ${path} — skipping`)
      continue
    }

    const html = transformHtml(template, path, meta)

    if (path === '/') {
      // overwrite dist/index.html with prerendered version
      writeFileSync(indexPath, html, 'utf8')
    } else {
      // dist/<path>/index.html
      const targetDir = join(DIST, path)
      mkdirSync(targetDir, { recursive: true })
      writeFileSync(join(targetDir, 'index.html'), html, 'utf8')
    }
    count++
  }

  console.log(`[prerender] generated ${count} HTML files in ${DIST} (lang=${LANG})`)

  // --- Sitemap generation (production only, overwritten for staging below) ---
  {
    const LASTMOD = '2026-04-18'

    // Priority / changefreq rules
    function getSitemapMeta(route) {
      if (route === '/') return { priority: '1.0', changefreq: 'weekly' }

      // Hub pages
      const hubPages = ['/pricing', '/cennik', '/features', '/funkcje', '/industries', '/dla-kogo']
      if (hubPages.includes(route)) return { priority: '0.8', changefreq: 'weekly' }

      // Secondary pages
      const secondaryPages = ['/integrations', '/integracje', '/about', '/o-nas', '/contact', '/kontakt']
      if (secondaryPages.includes(route)) return { priority: '0.7', changefreq: 'monthly' }

      // Legal
      const legalPages = ['/terms', '/regulamin', '/privacy', '/polityka-prywatnosci', '/gdpr', '/rodo', '/security', '/bezpieczenstwo', '/compliance', '/zgodnosc']
      if (legalPages.includes(route)) return { priority: '0.3', changefreq: 'yearly' }

      // Individual feature / industry pages (everything else)
      return { priority: '0.6', changefreq: 'monthly' }
    }

    const urls = routes.map(route => {
      const { priority, changefreq } = getSitemapMeta(route)
      const loc = `${SITE}${route === '/' ? '/' : route}`
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    }).join('\n')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf8')
    console.log(`[prerender] sitemap.xml generated with ${routes.length} URLs`)
  }

  // Staging: replace robots.txt and sitemap.xml with noindex versions.
  // Search engines should never see staging content.
  if (isStaging) {
    writeFileSync(
      join(DIST, 'robots.txt'),
      'User-agent: *\nDisallow: /\n',
      'utf8'
    )
    // Remove any prod sitemap.xml that may have been emitted by the vite plugin
    const sitemapPath = join(DIST, 'sitemap.xml')
    if (existsSync(sitemapPath)) {
      writeFileSync(sitemapPath, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n', 'utf8')
    }
    console.log(`[prerender] staging mode — robots.txt set to Disallow: /`)
  }
}

main()
