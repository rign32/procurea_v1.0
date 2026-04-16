#!/usr/bin/env node
// Post-build static HTML prerender.
// For each route in routesMeta config, generate dist/<route>/index.html
// with route-specific <title>/<meta>/OG/JSON-LD baked into <head>.
//
// This gives social crawlers (FB/LinkedIn/Twitter) and Google unique
// meta per URL without needing full SSR.
//
// Usage: node scripts/prerender.mjs [--mode=production|production-en]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const mode = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'production'
const isEN = mode === 'production-en'
const DIST = isEN ? join(ROOT, 'dist-en') : join(ROOT, 'dist')
const SITE = isEN ? 'https://procurea.io' : 'https://procurea.pl'
const LANG = isEN ? 'en' : 'pl'

// Mirror of routesMeta.ts (lightweight — we can't import TS here).
// Keep in sync when adding routes.
const ROUTES_PL = [
  '/', '/cennik', '/o-nas', '/kontakt', '/funkcje', '/dla-kogo', '/integracje',
  '/regulamin', '/polityka-prywatnosci', '/rodo',
  '/dla-kogo/produkcja', '/dla-kogo/eventy', '/dla-kogo/budownictwo', '/dla-kogo/retail-ecommerce',
  '/funkcje/ai-sourcing', '/funkcje/outreach-mailowy', '/funkcje/supplier-portal', '/funkcje/porownywarka-ofert',
]

const ROUTES_EN = [
  '/', '/pricing', '/about', '/contact', '/features', '/industries', '/integrations',
  '/terms', '/privacy', '/gdpr',
  '/industries/manufacturing', '/industries/events', '/industries/construction', '/industries/retail-ecommerce',
  '/features/ai-sourcing', '/features/email-outreach', '/features/supplier-portal', '/features/offer-comparison',
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
  '/dla-kogo/produkcja': '/industries/manufacturing', '/industries/manufacturing': '/dla-kogo/produkcja',
  '/dla-kogo/eventy': '/industries/events', '/industries/events': '/dla-kogo/eventy',
  '/dla-kogo/budownictwo': '/industries/construction', '/industries/construction': '/dla-kogo/budownictwo',
  '/dla-kogo/retail-ecommerce': '/industries/retail-ecommerce', '/industries/retail-ecommerce': '/dla-kogo/retail-ecommerce',
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
  const altSite = isEN ? 'https://procurea.pl' : 'https://procurea.io'
  const altLang = isEN ? 'pl' : 'en'
  const currentLang = isEN ? 'en' : 'pl'

  let html = template

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
}

main()
