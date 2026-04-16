// Integrations hub content — list of ERP/CRM systems with honest status badges.
// Reference: user's ERP/CRM integration strategy doc (phases 0-4).
//
// Status meaning:
//   'pilot'    — adapter working for 1-3 clients, beta for new sign-ups
//   'roadmap'  — planned with a rough delivery window (Q3/Q4 2026)
//   'custom'   — Enterprise Custom only (per-client adapter, e.g. SAP ECC)
//
// DO NOT mark integrations as 'available' unless the adapter is in production.

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type IntegrationStatus = 'pilot' | 'roadmap' | 'custom'

export interface Integration {
  slug: string
  name: string
  category: 'ERP' | 'CRM'
  logo: string     // short text (first letters) — we use text logo for now
  status: IntegrationStatus
  eta?: string     // e.g. 'Q3 2026' for roadmap
  descEn: string
  descPl: string
  tiersEn: string  // e.g. 'Professional +Procurement, Enterprise, Enterprise Custom'
  tiersPl: string
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: 'dynamics-365-bc',
    name: 'Microsoft Dynamics 365 Business Central',
    category: 'ERP',
    logo: 'D365',
    status: 'pilot',
    descEn: 'Native OAuth 2.0 integration via OData v4. Sync vendors bi-directionally, deep-link to Business Central records, auto-create vendor on sourcing selection.',
    descPl: 'Natywna integracja OAuth 2.0 przez OData v4. Synchronizacja vendorów dwukierunkowo, deep-link do rekordów Business Central, auto-tworzenie vendora po wyborze w sourcingu.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    logo: 'SF',
    status: 'roadmap',
    eta: 'Q3 2026',
    descEn: 'OAuth 2.0 Connected Apps. Map sourcing results to Salesforce Accounts and Contacts. Ideal for teams using Salesforce alongside Coupa/Ariba.',
    descPl: 'OAuth 2.0 Connected Apps. Mapowanie wyników sourcingu do Salesforce Accounts i Contacts. Idealne dla zespołów używających Salesforce wraz z Coupa/Ariba.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  {
    slug: 'oracle-netsuite',
    name: 'Oracle NetSuite',
    category: 'ERP',
    logo: 'NS',
    status: 'roadmap',
    eta: 'Q3 2026',
    descEn: 'Token-based Authentication (TBA) via SuiteTalk REST. The most popular Oracle ERP in mid-market — vendor sync, purchase order creation, deep-linking.',
    descPl: 'Token-based Authentication (TBA) przez SuiteTalk REST. Najpopularniejszy Oracle ERP w mid-market — synchronizacja vendorów, tworzenie PO, deep-linking.',
    tiersEn: 'Enterprise, Enterprise Custom',
    tiersPl: 'Enterprise, Enterprise Custom',
  },
  {
    slug: 'dynamics-365-fo',
    name: 'Microsoft Dynamics 365 Finance & Operations',
    category: 'ERP',
    logo: 'F&O',
    status: 'roadmap',
    eta: 'Q4 2026',
    descEn: 'OAuth 2.0 + OData REST. Enterprise-scale Dynamics deployment with broader data model than Business Central.',
    descPl: 'OAuth 2.0 + OData REST. Enterprise Dynamics z szerszym modelem danych niż Business Central.',
    tiersEn: 'Enterprise, Enterprise Custom',
    tiersPl: 'Enterprise, Enterprise Custom',
  },
  {
    slug: 'oracle-fusion-cloud',
    name: 'Oracle Fusion Cloud',
    category: 'ERP',
    logo: 'OFC',
    status: 'roadmap',
    eta: 'Q4 2026',
    descEn: 'REST APIs via Oracle SCM Cloud. For large enterprise running Oracle Fusion with procurement workflow requirements.',
    descPl: 'REST API przez Oracle SCM Cloud. Dla dużych enterprise używających Oracle Fusion z wymaganiami procurement workflow.',
    tiersEn: 'Enterprise Full, Enterprise Custom',
    tiersPl: 'Enterprise Full, Enterprise Custom',
  },
  {
    slug: 'sap',
    name: 'SAP S/4HANA Cloud',
    category: 'ERP',
    logo: 'SAP',
    status: 'roadmap',
    eta: 'Q4 2026 / 2027',
    descEn: 'OAuth 2.0 via SAP API Business Hub. OData v2/v4 for Business Partner master data, vendor lifecycle, and PO creation.',
    descPl: 'OAuth 2.0 przez SAP API Business Hub. OData v2/v4 dla danych Business Partner, lifecycle vendorów i tworzenia PO.',
    tiersEn: 'Enterprise Full, Enterprise Custom',
    tiersPl: 'Enterprise Full, Enterprise Custom',
  },
  {
    slug: 'sap-ecc',
    name: 'SAP ECC (on-prem)',
    category: 'ERP',
    logo: 'ECC',
    status: 'custom',
    descEn: 'Legacy on-prem SAP via RFC/BAPI/IDocs or SAP PI/PO middleware. Custom engagement only — estimated 3-6 months for enterprise adapter.',
    descPl: 'On-premise SAP przez RFC/BAPI/IDocs lub middleware SAP PI/PO. Tylko custom — szacowane 3-6 miesięcy na enterprise adapter.',
    tiersEn: 'Enterprise Custom only',
    tiersPl: 'Tylko Enterprise Custom',
  },
  {
    slug: 'merge-dev',
    name: 'Merge.dev (50+ systems)',
    category: 'ERP',
    logo: '50+',
    status: 'roadmap',
    eta: 'Q4 2026',
    descEn: 'Unified API covering 50+ mid-market ERPs and accounting tools (QuickBooks, Sage, Odoo, Xero, Zoho, and more). Long-tail integration coverage.',
    descPl: 'Ujednolicone API pokrywające 50+ mid-market ERP i narzędzi księgowych (QuickBooks, Sage, Odoo, Xero, Zoho i więcej). Pokrycie long-tail integracji.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
]

export const integrationsCopy = {
  heroTitle: isEN
    ? 'Procurea works with your stack'
    : 'Procurea działa z Twoim stackiem',
  heroSubtitle: isEN
    ? 'Sourcing results enriched with your ERP state — already-in / maybe-match / new. No duplicate data entry. Deep-link to records, auto-create vendors on selection.'
    : 'Wyniki sourcingu wzbogacone o stan Twojego ERP — already-in / maybe-match / new. Bez duplikacji danych. Deep-link do rekordów, auto-tworzenie vendorów po wyborze.',

  statusPilotLabel: isEN ? 'Pilot' : 'Pilot',
  statusRoadmapLabel: isEN ? 'Roadmap' : 'Roadmap',
  statusCustomLabel: isEN ? 'Custom only' : 'Tylko custom',

  tierLabel: isEN ? 'Available on' : 'Dostępne w',
  ctaLabel: isEN ? 'Talk to us' : 'Porozmawiaj z nami',

  valueTitle: isEN ? 'Why integrate?' : 'Po co integracja?',
  valueProps: isEN ? [
    {
      title: 'No duplicate data entry',
      body: 'Sourcing pipeline checks every discovered supplier against your ERP via VAT/NIP, domain, and fuzzy name match. Tag as already-in, maybe-match, or new.',
    },
    {
      title: 'Deep-link to ERP records',
      body: 'Click on a supplier in Procurea → jump directly to the Business Partner / Vendor record in SAP, Oracle, Dynamics, or Salesforce.',
    },
    {
      title: 'Auto-create on selection',
      body: 'When you accept a new supplier in Procurea, we create the record in your ERP (prospect or active vendor, per your org config).',
    },
    {
      title: 'Per-tenant configuration',
      body: 'Each customer picks their own ERP adapter. No single point of integration — your SAP, your rules.',
    },
  ] : [
    {
      title: 'Bez duplikacji danych',
      body: 'Pipeline sourcingu sprawdza każdego znalezionego dostawcę w Twoim ERP przez VAT/NIP, domenę i fuzzy match nazwy. Oznacza: already-in, maybe-match lub new.',
    },
    {
      title: 'Deep-link do rekordów ERP',
      body: 'Kliknij dostawcę w Procurea → przejdź bezpośrednio do rekordu Business Partner / Vendor w SAP, Oracle, Dynamics lub Salesforce.',
    },
    {
      title: 'Auto-create po wyborze',
      body: 'Gdy akceptujesz nowego dostawcę w Procurea, tworzymy rekord w Twoim ERP (prospect lub active vendor, zgodnie z konfiguracją organizacji).',
    },
    {
      title: 'Konfiguracja per-tenant',
      body: 'Każdy klient wybiera swój adapter ERP. Nie ma jednego punktu integracji — Twój SAP, Twoje reguły.',
    },
  ],

  ctaSectionTitle: isEN
    ? "Don't see your system?"
    : 'Nie widzisz swojego systemu?',
  ctaSectionBody: isEN
    ? 'We cover 50+ additional ERP and accounting systems via Merge.dev. For enterprise on-prem or custom stacks, we build per-client adapters.'
    : 'Pokrywamy 50+ dodatkowych ERP i systemów księgowych przez Merge.dev. Dla enterprise on-prem lub custom stacków budujemy adaptery per-klient.',
}
