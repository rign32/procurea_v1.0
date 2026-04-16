// Source of truth for URL mappings PL ↔ EN
// Reference: landing/docs/information-architecture.md

export type PathKey =
  // Meta
  | 'home'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'gdpr'
  // Hubs
  | 'featuresHub'
  | 'industriesHub'
  | 'integrationsHub'
  | 'useCasesHub'
  | 'blogIndex'
  | 'resourcesHub'
  | 'caseStudiesHub'
  // Features (MVP P0)
  | 'fAiSourcing'
  | 'fEmailOutreach'
  | 'fSupplierPortal'
  | 'fOfferComparison'
  // Features (post-MVP)
  | 'fEnrichment'
  | 'fCompanyRegistry'
  | 'fOfferCollection'
  | 'fAutoFollowUp'
  | 'fMultilingualOutreach'
  | 'fPdfReports'
  // Industries (MVP P0)
  | 'iManufacturing'
  | 'iEvents'
  | 'iConstruction'
  | 'iRetail'
  // Industries (post-MVP)
  | 'iHoreca'
  | 'iHealthcare'
  | 'iLogistics'
  | 'iMro'
  // Integration detail pages (post-MVP)
  | 'intSap'
  | 'intOracleNetsuite'
  | 'intOracleFusion'
  | 'intDynamicsBc'
  | 'intDynamicsFo'
  | 'intSalesforce'

export const pathMappings: Record<PathKey, { pl: string; en: string }> = {
  // Meta
  home: { pl: '/', en: '/' },
  pricing: { pl: '/cennik', en: '/pricing' },
  about: { pl: '/o-nas', en: '/about' },
  contact: { pl: '/kontakt', en: '/contact' },
  terms: { pl: '/regulamin', en: '/terms' },
  privacy: { pl: '/polityka-prywatnosci', en: '/privacy' },
  gdpr: { pl: '/rodo', en: '/gdpr' },

  // Hubs
  featuresHub: { pl: '/funkcje', en: '/features' },
  industriesHub: { pl: '/dla-kogo', en: '/industries' },
  integrationsHub: { pl: '/integracje', en: '/integrations' },
  useCasesHub: { pl: '/zastosowania', en: '/use-cases' },
  blogIndex: { pl: '/blog', en: '/blog' },
  resourcesHub: { pl: '/materialy', en: '/resources' },
  caseStudiesHub: { pl: '/case-studies', en: '/case-studies' },

  // Features — MVP P0
  fAiSourcing: { pl: '/funkcje/ai-sourcing', en: '/features/ai-sourcing' },
  fEmailOutreach: { pl: '/funkcje/outreach-mailowy', en: '/features/email-outreach' },
  fSupplierPortal: { pl: '/funkcje/supplier-portal', en: '/features/supplier-portal' },
  fOfferComparison: { pl: '/funkcje/porownywarka-ofert', en: '/features/offer-comparison' },

  // Features — post-MVP
  fEnrichment: { pl: '/funkcje/enrichment-kontaktow', en: '/features/contact-enrichment' },
  fCompanyRegistry: { pl: '/funkcje/company-registry', en: '/features/company-registry' },
  fOfferCollection: { pl: '/funkcje/zbieranie-ofert', en: '/features/offer-collection' },
  fAutoFollowUp: { pl: '/funkcje/auto-follow-up', en: '/features/auto-follow-up' },
  fMultilingualOutreach: { pl: '/funkcje/wielojezyczny-outreach', en: '/features/multilingual-outreach' },
  fPdfReports: { pl: '/funkcje/raporty-pdf-pptx', en: '/features/pdf-reports' },

  // Industries — MVP P0
  iManufacturing: { pl: '/dla-kogo/produkcja', en: '/industries/manufacturing' },
  iEvents: { pl: '/dla-kogo/eventy', en: '/industries/events' },
  iConstruction: { pl: '/dla-kogo/budownictwo', en: '/industries/construction' },
  iRetail: { pl: '/dla-kogo/retail-ecommerce', en: '/industries/retail-ecommerce' },

  // Industries — post-MVP
  iHoreca: { pl: '/dla-kogo/gastronomia', en: '/industries/horeca' },
  iHealthcare: { pl: '/dla-kogo/ochrona-zdrowia', en: '/industries/healthcare' },
  iLogistics: { pl: '/dla-kogo/logistyka', en: '/industries/logistics' },
  iMro: { pl: '/dla-kogo/mro-utrzymanie-ruchu', en: '/industries/mro' },

  // Integration detail pages — post-MVP (scaffolded for future)
  intSap: { pl: '/integracje/sap', en: '/integrations/sap' },
  intOracleNetsuite: { pl: '/integracje/oracle-netsuite', en: '/integrations/oracle-netsuite' },
  intOracleFusion: { pl: '/integracje/oracle-fusion-cloud', en: '/integrations/oracle-fusion-cloud' },
  intDynamicsBc: { pl: '/integracje/dynamics-365-bc', en: '/integrations/dynamics-365-bc' },
  intDynamicsFo: { pl: '/integracje/dynamics-365-fo', en: '/integrations/dynamics-365-fo' },
  intSalesforce: { pl: '/integracje/salesforce', en: '/integrations/salesforce' },
}

const LANGUAGE = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'

export function pathFor(key: PathKey): string {
  return pathMappings[key][LANGUAGE]
}

// Industry and feature slugs — for parametric routes
export const industrySlugs: PathKey[] = [
  'iManufacturing',
  'iEvents',
  'iConstruction',
  'iRetail',
  'iHoreca',
  'iHealthcare',
  'iLogistics',
  'iMro',
]

export const featureSlugs: PathKey[] = [
  'fAiSourcing',
  'fEmailOutreach',
  'fSupplierPortal',
  'fOfferComparison',
  'fEnrichment',
  'fCompanyRegistry',
  'fOfferCollection',
  'fAutoFollowUp',
  'fMultilingualOutreach',
  'fPdfReports',
]
