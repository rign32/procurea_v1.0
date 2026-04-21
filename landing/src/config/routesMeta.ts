// Single source of truth for per-route SEO metadata.
// Consumed by:
//   1. Client-side: React 19 native metadata hoisting (each page renders <title>/<meta>)
//   2. Build-time: scripts/prerender.mjs generates dist/<route>/index.html with meta baked in

export interface RouteMeta {
  title: string
  description: string
  canonical: string           // absolute URL
  ogImage?: string            // absolute URL, defaults to /hero-screenshot.png
  jsonLd?: Record<string, unknown>  // structured data
  noindex?: boolean
}

const SITE_PL = 'https://procurea.pl'
const SITE_EN = 'https://procurea.io'

// Helper: site root based on env
const site = () => (import.meta.env.VITE_LANGUAGE === 'en' ? SITE_EN : SITE_PL)

export function metaFor(path: string): RouteMeta {
  const S = site()
  const canonical = `${S}${path}`

  // Meta per path (both PL and EN slugs handled in same switch)
  switch (path) {
    case '/':
      return {
        title: 'Procurea — AI-powered procurement automation',
        description: 'AI Sourcing + Procurement automation for global teams. Find verified suppliers in minutes. Integrates with SAP, Oracle, Dynamics, Salesforce.',
        canonical,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Procurea',
          url: S,
          description: 'AI-powered procurement automation platform',
          foundingDate: '2025',
          founder: { '@type': 'Person', name: 'Rafał Reiwer' },
        },
      }

    case '/cennik':
    case '/pricing':
      return {
        title: 'Pricing — Procurea',
        description: 'Starter from $69/month (10 sourcing campaigns), Growth $159/month (50), Scale $299/month (150). AI Procurement workflow add-on $29 per run. 3 free campaigns on signup — no credit card.',
        canonical,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Procurea',
          description: 'AI procurement automation platform',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '69',
            offerCount: '3',
          },
        },
      }

    case '/o-nas':
    case '/about':
      return {
        title: 'About Procurea — AI-native procurement automation',
        description: 'Procurea builds AI-native procurement automation for global teams. Learn about our mission, team, and technology stack.',
        canonical,
      }

    case '/kontakt':
    case '/contact':
      return {
        title: 'Contact us — Procurea',
        description: 'Talk to us about enterprise demo, Procurement add-on, or ERP integrations. Response within 24 hours.',
        canonical,
      }

    // Feature hub
    case '/funkcje':
    case '/features':
      return {
        title: 'Features — Procurea',
        description: 'AI Sourcing, RFQ Automation, Supplier Portal, Offer Comparison, Multilingual Outreach, PDF Reports, and more.',
        canonical,
      }

    // Industry hub
    case '/dla-kogo':
    case '/industries':
      return {
        title: 'Who is Procurea for — Industries',
        description: 'Manufacturing, Events, Construction, Retail, Healthcare, HoReCa, Logistics, MRO — procurement automation tailored per industry.',
        canonical,
      }

    // Integrations hub
    case '/integracje':
    case '/integrations':
      return {
        title: 'Integrations — Procurea works with your stack',
        description: 'NetSuite, Dynamics 365 Business Central, QuickBooks, Xero, Sage and 50+ more ERP/CRM systems via Merge.dev. SAP S/4HANA + Salesforce — Enterprise Custom or roadmap. No duplicate data entry.',
        canonical,
      }

    // Industry MVP P0 pages
    case '/dla-kogo/produkcja':
    case '/industries/manufacturing':
      return {
        title: 'AI procurement for Manufacturing — Procurea',
        description: 'Supplier discovery for factories, OEMs, and industrial buyers. Alternative vendors, dual sourcing, supplier qualification with certificates (ISO 9001, IATF 16949).',
        canonical,
      }

    case '/dla-kogo/eventy':
    case '/industries/events':
      return {
        title: 'Sourcing for Event Agencies — Procurea',
        description: 'Find local vendors in 48h — catering, AV, scenography, gadgets. Sourcing in foreign cities made fast for event producers.',
        canonical,
      }

    case '/dla-kogo/budownictwo':
    case '/industries/construction':
      return {
        title: 'Procurement for Construction — Procurea',
        description: 'Materials and subcontractors for developers and general contractors. RFQ to 30+ subcontractors at once, tiered pricing comparison.',
        canonical,
      }

    case '/dla-kogo/retail-ecommerce':
    case '/industries/retail-ecommerce':
      return {
        title: 'Private label sourcing for Retail & E-commerce — Procurea',
        description: 'Private label manufacturers in Europe, Turkey, nearshore. Migrate from China with 18+ alternative factories in weeks instead of months.',
        canonical,
      }

    // Industry round 2 pages
    case '/dla-kogo/gastronomia':
    case '/industries/horeca':
      return {
        title: 'Procurement for HoReCa — Procurea',
        description: 'F&B ingredient sourcing, kitchen equipment, tableware for restaurants, hotels, and catering. HACCP/IFS/BRC certified suppliers discovered by AI.',
        canonical,
      }

    case '/dla-kogo/ochrona-zdrowia':
    case '/industries/healthcare':
      return {
        title: 'Medical device sourcing for Healthcare — Procurea',
        description: 'CE/MDR/ISO 13485-certified medical device manufacturers and disposable suppliers. Compliance-first AI sourcing for hospitals and clinics.',
        canonical,
      }

    case '/dla-kogo/logistyka':
    case '/industries/logistics':
      return {
        title: 'Supplier sourcing for Logistics — Procurea',
        description: 'Warehouse equipment, fleet spare parts, and 3PL service providers. AI-powered supplier discovery across markets and languages.',
        canonical,
      }

    case '/dla-kogo/mro-utrzymanie-ruchu':
    case '/industries/mro':
      return {
        title: 'MRO procurement — Procurea',
        description: 'Industrial spare parts, maintenance service providers, and facilities management. Reduce downtime with pre-qualified backup suppliers and competitive RFQ.',
        canonical,
      }

    // Feature MVP P0 pages
    case '/funkcje/ai-sourcing':
    case '/features/ai-sourcing':
      return {
        title: 'AI Sourcing — Procurea',
        description: 'Describe what you need. AI delivers a verified supplier shortlist in minutes. From $89 / 10 credits. Free credits on signup.',
        canonical,
      }

    case '/funkcje/outreach-mailowy':
    case '/features/email-outreach':
      return {
        title: 'Email Outreach (RFQ Automation) — Procurea',
        description: 'Send RFQ to hundreds of suppliers with one click — localized per supplier country. Available with Procurement add-on.',
        canonical,
      }

    case '/funkcje/supplier-portal':
    case '/features/supplier-portal':
      return {
        title: 'Supplier Portal — Procurea',
        description: 'Magic-link portal where suppliers submit offers — no login, no friction. Quantity breaks, variants, attachments included.',
        canonical,
      }

    case '/funkcje/porownywarka-ofert':
    case '/features/offer-comparison':
      return {
        title: 'Offer Comparison & Reports — Procurea',
        description: 'Side-by-side comparison of all RFQ responses — price, MOQ, lead time, certifications. Export to PDF/PPTX. Part of AI Procurement credits.',
        canonical,
      }

    // Legal
    case '/regulamin':
      return {
        title: 'Regulamin — Procurea',
        description: 'Regulamin korzystania z platformy Procurea.',
        canonical,
      }
    case '/terms':
      return {
        title: 'Terms of Service — Procurea',
        description: 'Procurea platform terms of service.',
        canonical,
      }
    case '/polityka-prywatnosci':
      return {
        title: 'Polityka Prywatności — Procurea',
        description: 'Polityka prywatności Procurea.',
        canonical,
      }
    case '/privacy':
      return {
        title: 'Privacy Policy — Procurea',
        description: 'Procurea privacy policy.',
        canonical,
      }
    case '/rodo':
      return {
        title: 'RODO — Procurea',
        description: 'Informacje o przetwarzaniu danych osobowych zgodnie z RODO.',
        canonical,
      }
    case '/gdpr':
      return {
        title: 'GDPR — Procurea',
        description: 'GDPR compliance information.',
        canonical,
      }

    case '/bezpieczenstwo':
      return {
        title: 'Bezpieczenstwo — Procurea',
        description: 'Infrastruktura Google Cloud, szyfrowanie AES-256, OAuth 2.0, izolacja danych i monitoring 24/7.',
        canonical,
      }
    case '/security':
      return {
        title: 'Security — Procurea',
        description: 'Google Cloud infrastructure, AES-256 encryption, OAuth 2.0 authentication, data isolation, and 24/7 monitoring.',
        canonical,
      }
    case '/zgodnosc':
      return {
        title: 'Zgodnosc i ochrona danych — Procurea',
        description: 'Zgodnosc z RODO, rezydencja danych w UE, retencja danych, podprocesory i prawo do usuniecia danych.',
        canonical,
      }
    case '/compliance':
      return {
        title: 'Compliance & Data Protection — Procurea',
        description: 'GDPR compliance, EU data residency, data retention policies, sub-processors, and right to deletion.',
        canonical,
      }

    case '/partnerzy':
      return {
        title: 'Program partnerski — Procurea',
        description: 'Zostań partnerem Procurea. Współpracujemy z konsultantami ERP, agencjami procurement i partnerami technologicznymi.',
        canonical,
      }
    case '/partners':
      return {
        title: 'Partner Program — Procurea',
        description: 'Partner with Procurea. We work with ERP consultants, procurement agencies, and technology partners to bring AI sourcing to more teams.',
        canonical,
      }

    case '/porownanie':
      return {
        title: 'Procurea vs Reczny Sourcing — Porownanie',
        description: 'Porownanie AI procurement automation z tradycyjnym sourcingiem dostawcow. 30 godzin vs 20 minut. 5-15 vs 50-250 dostawcow.',
        canonical,
      }
    case '/vs-manual-sourcing':
      return {
        title: 'Procurea vs Manual Sourcing — Comparison',
        description: 'Compare AI procurement automation to traditional supplier sourcing. 30 hours vs 20 minutes. 5-15 vs 50-250 suppliers found.',
        canonical,
      }

    // Unified Content Hub — absorbed blog index + resources index + case studies index
    case '/materialy':
      return {
        title: 'Centrum Wiedzy Procurement — artykuly, przewodniki i szablony | Procurea',
        description: 'Wszystko o procurement w jednym miejscu: artykuly, przewodniki do pobrania, szablony, playbooki i kalkulatory. RFQ, TCO, scoring dostawcy, nearshore. Excel, PDF, Notion.',
        canonical,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Centrum Wiedzy Procurea',
          url: canonical,
        },
      }
    case '/resources':
      return {
        title: 'Procurement Content Hub — Articles, Guides & Templates | Procurea',
        description: 'Everything procurement in one place: articles, downloadable guides, templates, playbooks, and calculators. RFQ comparison, TCO calculator, supplier risk checklist, nearshore playbook, vendor scoring.',
        canonical,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Procurea Content Hub',
          url: canonical,
        },
      }

    // Legacy /library paths — kept as canonical hints only; React Router redirects at runtime
    case '/materialy/library':
    case '/resources/library':
      return {
        title: 'Redirecting…',
        description: '',
        canonical,
        noindex: true,
      }

    default:
      return {
        title: 'Procurea',
        description: 'AI-powered procurement automation.',
        canonical,
        noindex: true,
      }
  }
}

function isEN(): boolean {
  return import.meta.env.VITE_LANGUAGE === 'en'
}

// List of all static routes for prerender script
export const STATIC_ROUTES_PL = [
  '/',
  '/cennik',
  '/o-nas',
  '/kontakt',
  '/funkcje',
  '/dla-kogo',
  '/integracje',
  '/regulamin',
  '/polityka-prywatnosci',
  '/rodo',
  '/bezpieczenstwo',
  '/zgodnosc',
  // MVP P0 industries
  '/dla-kogo/produkcja',
  '/dla-kogo/eventy',
  '/dla-kogo/budownictwo',
  '/dla-kogo/retail-ecommerce',
  // Round 2 industries
  '/dla-kogo/gastronomia',
  '/dla-kogo/ochrona-zdrowia',
  '/dla-kogo/logistyka',
  '/dla-kogo/mro-utrzymanie-ruchu',
  // MVP P0 features
  '/funkcje/ai-sourcing',
  '/funkcje/outreach-mailowy',
  '/funkcje/supplier-portal',
  '/funkcje/porownywarka-ofert',
  // Comparison
  '/porownanie',
  // Partners
  '/partnerzy',
  // Content Hub (unified — absorbed blog index + case studies)
  '/materialy',
]

export const STATIC_ROUTES_EN = [
  '/',
  '/pricing',
  '/about',
  '/contact',
  '/features',
  '/industries',
  '/integrations',
  '/terms',
  '/privacy',
  '/gdpr',
  '/security',
  '/compliance',
  // MVP P0 industries
  '/industries/manufacturing',
  '/industries/events',
  '/industries/construction',
  '/industries/retail-ecommerce',
  // Round 2 industries
  '/industries/horeca',
  '/industries/healthcare',
  '/industries/logistics',
  '/industries/mro',
  // MVP P0 features
  '/features/ai-sourcing',
  '/features/email-outreach',
  '/features/supplier-portal',
  '/features/offer-comparison',
  // Comparison
  '/vs-manual-sourcing',
  // Partners
  '/partners',
  // Content Hub (unified — absorbed blog index + case studies)
  '/resources',
]
