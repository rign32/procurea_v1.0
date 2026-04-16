// Integrations hub content — ERP/CRM systems available out of the box.
// All listed systems are in the offer. Per-client customization is part of
// onboarding (Enterprise Custom tier) — we tailor field mapping, workflow,
// custom fields, SSO, etc. to the customer's stack.

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type IntegrationType = 'native' | 'custom'

export interface Integration {
  slug: string
  name: string
  category: 'ERP' | 'CRM'
  logo: string     // short text (first letters) — we use text logo for now
  integrationType: IntegrationType
  // Short one-liner describing the tech (OAuth 2.0, OData v4, REST, RFC/BAPI, x509, etc.)
  descEn: string
  descPl: string
  // List of data objects exchanged in both directions
  dataFlowEn: string[]
  dataFlowPl: string[]
  // What the integration lets you do in Procurea once connected
  capabilitiesEn: string[]
  capabilitiesPl: string[]
  // What we customize per client during onboarding
  customizationEn: string
  customizationPl: string
  tiersEn: string
  tiersPl: string
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: 'sap',
    name: 'SAP S/4HANA',
    category: 'ERP',
    logo: 'SAP',
    integrationType: 'native',
    descEn: 'Native OAuth 2.0 via SAP API Business Hub. OData v2/v4 against Business Partner and Procurement services.',
    descPl: 'Natywna integracja OAuth 2.0 przez SAP API Business Hub. OData v2/v4 na usługach Business Partner i Procurement.',
    dataFlowEn: ['Business Partner / Vendor master', 'Purchase Orders', 'Purchase Requisitions', 'Financial data (payment terms, bank details)', 'Contract metadata'],
    dataFlowPl: ['Business Partner / dane vendorów', 'Zamówienia (Purchase Orders)', 'Zapotrzebowania (Purchase Requisitions)', 'Dane finansowe (warunki płatności, rachunki)', 'Metadane kontraktów'],
    capabilitiesEn: ['Deep-link from Procurea to the exact BP record in S/4HANA', 'Auto-create Business Partner on sourcing selection', 'Bi-directional sync of the supplier database', 'Tag discovered suppliers as already-in / maybe-match / new'],
    capabilitiesPl: ['Deep-link z Procurea do konkretnego rekordu BP w S/4HANA', 'Auto-tworzenie Business Partnera po wyborze w sourcingu', 'Dwukierunkowa synchronizacja bazy dostawców', 'Tagowanie znalezionych dostawców jako already-in / maybe-match / new'],
    customizationEn: 'Field mapping to your BP roles and groupings, custom Z-fields, approval workflow hooks, SSO with your IdP (Azure AD, Okta, SAML).',
    customizationPl: 'Mapowanie pól na Twoje role i grupowania BP, własne pola Z, haki do workflow zatwierdzeń, SSO z Twoim IdP (Azure AD, Okta, SAML).',
    tiersEn: 'Enterprise Full, Enterprise Custom',
    tiersPl: 'Enterprise Full, Enterprise Custom',
  },
  {
    slug: 'sap-ecc',
    name: 'SAP ECC (on-prem)',
    category: 'ERP',
    logo: 'ECC',
    integrationType: 'custom',
    descEn: 'On-prem SAP via RFC / BAPI / IDocs, with optional SAP PI/PO middleware. x509 certificate auth and VPN tunnel where required.',
    descPl: 'On-premise SAP przez RFC / BAPI / IDocs, opcjonalnie middleware SAP PI/PO. Autoryzacja przez certyfikaty x509 i tunel VPN, jeśli wymagane.',
    dataFlowEn: ['LFA1 / LFB1 vendor master', 'Purchase Orders (EKKO/EKPO)', 'Purchase Requisitions (EBAN)', 'Company code and payment terms', 'Contract headers (EKKO)'],
    dataFlowPl: ['Master vendorów LFA1 / LFB1', 'Zamówienia (EKKO/EKPO)', 'Zapotrzebowania (EBAN)', 'Kod jednostki i warunki płatności', 'Nagłówki kontraktów (EKKO)'],
    capabilitiesEn: ['Deep-link to vendor record in SAP GUI / Fiori', 'Auto-create vendor via BAPI_VENDOR_CREATE after approval', 'Nightly reconcile of supplier database', 'Purchase order export from Procurea to EKKO'],
    capabilitiesPl: ['Deep-link do rekordu vendora w SAP GUI / Fiori', 'Auto-tworzenie vendora przez BAPI_VENDOR_CREATE po akceptacji', 'Nocny reconcile bazy dostawców', 'Eksport PO z Procurea do EKKO'],
    customizationEn: 'RFC function selection, custom BAPI wrappers, IDoc types, field mapping against your vendor schema, VPN/SNC setup, enterprise approval rules.',
    customizationPl: 'Wybór funkcji RFC, własne wrappery BAPI, typy IDoc, mapowanie pól na Twój schemat vendorów, konfiguracja VPN/SNC, enterprise reguły akceptacji.',
    tiersEn: 'Enterprise Custom',
    tiersPl: 'Enterprise Custom',
  },
  {
    slug: 'oracle-netsuite',
    name: 'Oracle NetSuite',
    category: 'ERP',
    logo: 'NS',
    integrationType: 'native',
    descEn: 'Native integration via SuiteTalk REST with Token-Based Authentication (TBA). Optional SuiteScript hooks for custom workflows.',
    descPl: 'Natywna integracja przez SuiteTalk REST z Token-Based Authentication (TBA). Opcjonalne haki SuiteScript dla własnych workflowów.',
    dataFlowEn: ['Vendor master', 'Purchase Orders', 'Vendor Bills', 'Currency and payment terms', 'Custom record types'],
    dataFlowPl: ['Master dostawców', 'Zamówienia (Purchase Orders)', 'Faktury dostawców (Vendor Bills)', 'Waluta i warunki płatności', 'Własne typy rekordów'],
    capabilitiesEn: ['Deep-link to Vendor record in NetSuite', 'Auto-create vendor on sourcing selection', 'Sync supplier database bi-directionally', 'Surface existing PO history in Procurea'],
    capabilitiesPl: ['Deep-link do rekordu Vendora w NetSuite', 'Auto-tworzenie vendora po wyborze w sourcingu', 'Dwukierunkowy sync bazy dostawców', 'Historia PO widoczna w Procurea'],
    customizationEn: 'Subsidiary mapping for OneWorld, custom fields and record types, SuiteScript triggers, saved searches, SSO via SAML.',
    customizationPl: 'Mapowanie subsidiaries dla OneWorld, własne pola i typy rekordów, triggery SuiteScript, saved searches, SSO przez SAML.',
    tiersEn: 'Enterprise, Enterprise Custom',
    tiersPl: 'Enterprise, Enterprise Custom',
  },
  {
    slug: 'oracle-fusion-cloud',
    name: 'Oracle Fusion Cloud',
    category: 'ERP',
    logo: 'OFC',
    integrationType: 'native',
    descEn: 'REST APIs via Oracle SCM Cloud and Procurement Cloud. OAuth 2.0 with JWT assertions for service accounts.',
    descPl: 'REST API przez Oracle SCM Cloud i Procurement Cloud. OAuth 2.0 z JWT assertions dla kont serwisowych.',
    dataFlowEn: ['Supplier master', 'Supplier sites and contacts', 'Purchase Orders', 'Sourcing awards', 'Financial data (payment terms, tax)'],
    dataFlowPl: ['Master dostawców', 'Lokalizacje i kontakty dostawców', 'Zamówienia (Purchase Orders)', 'Wyniki sourcingu (awards)', 'Dane finansowe (warunki płatności, podatki)'],
    capabilitiesEn: ['Deep-link to Supplier profile in Fusion', 'Auto-create Supplier + Site after approval', 'Reconcile supplier database', 'Feed discovered suppliers into Oracle Sourcing'],
    capabilitiesPl: ['Deep-link do profilu Supplier w Fusion', 'Auto-tworzenie Supplier + Site po akceptacji', 'Reconcile bazy dostawców', 'Zasilanie Oracle Sourcing znalezionymi dostawcami'],
    customizationEn: 'Business Unit mapping, DFF/EFF custom fields, approval workflow integration, SSO with Oracle IDCS or external SAML IdP.',
    customizationPl: 'Mapowanie Business Unit, własne pola DFF/EFF, integracja z workflow akceptacji, SSO z Oracle IDCS lub zewnętrznym IdP SAML.',
    tiersEn: 'Enterprise Full, Enterprise Custom',
    tiersPl: 'Enterprise Full, Enterprise Custom',
  },
  {
    slug: 'dynamics-365-bc',
    name: 'Microsoft Dynamics 365 Business Central',
    category: 'ERP',
    logo: 'D365',
    integrationType: 'native',
    descEn: 'Native OAuth 2.0 via Microsoft Entra ID. OData v4 against Business Central APIs with optional AL extensions.',
    descPl: 'Natywna integracja OAuth 2.0 przez Microsoft Entra ID. OData v4 na API Business Central z opcjonalnymi rozszerzeniami AL.',
    dataFlowEn: ['Vendor master', 'Purchase Orders', 'Purchase Invoices', 'Payment terms and dimensions', 'Item catalog references'],
    dataFlowPl: ['Master vendorów', 'Zamówienia (Purchase Orders)', 'Faktury zakupu', 'Warunki płatności i wymiary', 'Referencje katalogu Items'],
    capabilitiesEn: ['Deep-link to Vendor card in Business Central', 'Auto-create Vendor on sourcing selection', 'Bi-directional supplier database sync', 'Surface vendor balances inline in Procurea'],
    capabilitiesPl: ['Deep-link do karty Vendora w Business Central', 'Auto-tworzenie Vendora po wyborze w sourcingu', 'Dwukierunkowy sync bazy dostawców', 'Salda vendorów widoczne inline w Procurea'],
    customizationEn: 'Dimension mapping, custom AL fields, posting group rules, approval workflow hooks, SSO via Entra ID.',
    customizationPl: 'Mapowanie wymiarów, własne pola AL, reguły posting groups, haki do workflow akceptacji, SSO przez Entra ID.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  {
    slug: 'dynamics-365-fo',
    name: 'Microsoft Dynamics 365 Finance & Operations',
    category: 'ERP',
    logo: 'F&O',
    integrationType: 'native',
    descEn: 'OAuth 2.0 via Microsoft Entra ID. Data Management Framework (DMF) + OData REST for large-volume enterprise flows.',
    descPl: 'OAuth 2.0 przez Microsoft Entra ID. Data Management Framework (DMF) + OData REST dla dużych przepływów enterprise.',
    dataFlowEn: ['Vendor master with addresses and contacts', 'Purchase Orders and agreements', 'Purchase Requisitions', 'Legal entity and currency data', 'Financial dimensions'],
    dataFlowPl: ['Master vendorów z adresami i kontaktami', 'Zamówienia i agreementy', 'Zapotrzebowania (Purchase Requisitions)', 'Dane legal entity i waluty', 'Wymiary finansowe'],
    capabilitiesEn: ['Deep-link to Vendor record in F&O', 'Auto-create Vendor across legal entities', 'Sync supplier database per legal entity', 'Expose existing purchase agreements to sourcing team'],
    capabilitiesPl: ['Deep-link do rekordu Vendora w F&O', 'Auto-tworzenie Vendora w wielu legal entities', 'Sync bazy dostawców per legal entity', 'Widoczność istniejących purchase agreements dla zespołu sourcingu'],
    customizationEn: 'Legal entity routing, financial dimension mapping, DMF data entity selection, custom workflow triggers, SSO via Entra ID or SAML.',
    customizationPl: 'Routing per legal entity, mapowanie wymiarów finansowych, wybór data entities w DMF, własne triggery workflow, SSO przez Entra ID lub SAML.',
    tiersEn: 'Enterprise, Enterprise Custom',
    tiersPl: 'Enterprise, Enterprise Custom',
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    logo: 'SF',
    integrationType: 'native',
    descEn: 'Native OAuth 2.0 Connected Apps. REST + Bulk API against Accounts, Contacts, and custom Supplier objects.',
    descPl: 'Natywne OAuth 2.0 Connected Apps. REST + Bulk API na Accounts, Contacts i własnych obiektach Supplier.',
    dataFlowEn: ['Account master', 'Contacts and relationships', 'Opportunities linked to sourcing', 'Custom Supplier objects', 'Activity history'],
    dataFlowPl: ['Master Accountów', 'Kontakty i relacje', 'Opportunities powiązane z sourcingiem', 'Własne obiekty Supplier', 'Historia aktywności'],
    capabilitiesEn: ['Deep-link from Procurea to Account / Contact record', 'Auto-create Account + Contact on sourcing selection', 'Map sourcing results to existing CRM hierarchy', 'Log sourcing activity as Tasks or Activity records'],
    capabilitiesPl: ['Deep-link z Procurea do rekordu Account / Contact', 'Auto-tworzenie Account + Contact po wyborze w sourcingu', 'Mapowanie wyników sourcingu na istniejącą hierarchię CRM', 'Logowanie aktywności sourcingu jako Tasks lub Activity'],
    customizationEn: 'Custom object and field mapping, record types, validation rules, Apex triggers for complex logic, SSO via Salesforce SAML or your IdP.',
    customizationPl: 'Mapowanie własnych obiektów i pól, record types, validation rules, triggery Apex dla złożonej logiki, SSO przez Salesforce SAML lub Twój IdP.',
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

  integrationTypeLabel: {
    native: isEN ? 'Native integration' : 'Integracja natywna',
    custom: isEN ? 'Custom for your stack' : 'Custom pod Twój stack',
  },
  dataFlowLabel: isEN ? 'Data flow' : 'Przepływ danych',
  capabilitiesLabel: isEN ? 'Capabilities' : 'Możliwości',
  customizationLabel: isEN ? 'Customization' : 'Customizacja',

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

  logosSectionTitle: isEN
    ? '50+ other ERP & CRM systems'
    : '50+ innych systemów ERP i CRM',
  logosSectionBody: isEN
    ? 'Beyond the core seven, we also connect to popular mid-market ERPs and accounting tools — QuickBooks, Sage, Odoo, Xero, Zoho, and more. Same onboarding, same per-tenant customization.'
    : 'Poza główną siódemką łączymy się także z popularnymi mid-market ERP i narzędziami księgowymi — QuickBooks, Sage, Odoo, Xero, Zoho i innymi. Ten sam onboarding, ta sama customizacja per-tenant.',

  ctaSectionTitle: isEN
    ? 'Your system not in the list?'
    : 'Nie ma Twojego systemu na liście?',
  ctaSectionBody: isEN
    ? 'We build custom adapters for enterprise stacks — legacy on-prem, industry-specific ERP, or proprietary databases. Tell us what you run and we scope the adapter as part of Enterprise Custom onboarding.'
    : 'Budujemy custom adaptery dla enterprise stacków — legacy on-prem, branżowe ERP lub własne bazy. Powiedz nam z czego korzystasz, a zaprojektujemy adapter w ramach onboardingu Enterprise Custom.',
}
