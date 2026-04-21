// Integrations hub content — ERP/CRM systems + API/webhooks.
// Natywne adaptery są w standardowej ofercie. Mniej popularne systemy (Xero, Odoo,
// QuickBooks, Sage) łączymy przez Merge.dev jako single-connector aggregator.
// Per-client customization is part of Enterprise Custom onboarding.

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type IntegrationType = 'native' | 'merge-dev' | 'custom'
export type IntegrationCategory = 'ERP' | 'CRM' | 'Accounting' | 'API'

export interface Integration {
  slug: string
  name: string
  category: IntegrationCategory
  /** Short text logo (2-4 chars) */
  logo: string
  /** Tailwind gradient classes for the logo tile — brand-color hint */
  brandGradient: string
  integrationType: IntegrationType
  /** Mark as flagship to render in featured row */
  featured?: boolean
  searchKeywords: string[]
  descEn: string
  descPl: string
  dataFlowEn: string[]
  dataFlowPl: string[]
  capabilitiesEn: string[]
  capabilitiesPl: string[]
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
    brandGradient: 'from-sky-600 via-blue-700 to-blue-900',
    integrationType: 'native',
    featured: true,
    searchKeywords: ['sap', 's4hana', 's/4hana', 'hana', 'erp', 'enterprise', 'business partner'],
    descEn: 'Sync your S/4HANA procurement module — Business Partners, Purchase Orders, and Requisitions flow bi-directionally so sourcing results land in the right org structure automatically.',
    descPl: 'Synchronizacja modułu procurement S/4HANA — Business Partnerzy, zamówienia i zapotrzebowania przepływają dwukierunkowo, a wyniki sourcingu trafiają do właściwej struktury organizacyjnej.',
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
    brandGradient: 'from-blue-700 via-blue-800 to-slate-900',
    integrationType: 'custom',
    searchKeywords: ['sap', 'ecc', 'on-prem', 'on-premise', 'rfc', 'bapi', 'idoc', 'legacy', 'r3'],
    descEn: 'Connect your legacy on-prem SAP without migrating to S/4HANA. We bridge via RFC/BAPI/IDocs so your vendor master and PO data stay in sync with Procurea.',
    descPl: 'Połącz swoje legacy SAP on-prem bez migracji do S/4HANA. Integrujemy przez RFC/BAPI/IDocs, dzięki czemu master vendorów i zamówienia są zsynchronizowane z Procurea.',
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
    brandGradient: 'from-red-600 via-red-700 to-rose-900',
    integrationType: 'native',
    featured: true,
    searchKeywords: ['oracle', 'netsuite', 'net suite', 'erp', 'oneworld', 'suitescript'],
    descEn: 'Cloud-native auto-sync for mid-market teams. Vendors, POs, and bills flow between NetSuite and Procurea in real time — including OneWorld multi-subsidiary setups.',
    descPl: 'Natywna synchronizacja w chmurze dla mid-market. Dostawcy, zamówienia i faktury przepływają między NetSuite a Procurea w czasie rzeczywistym — w tym konfiguracje OneWorld multi-subsidiary.',
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
    brandGradient: 'from-red-700 via-rose-800 to-slate-900',
    integrationType: 'native',
    searchKeywords: ['oracle', 'fusion', 'cloud', 'erp', 'scm', 'procurement cloud'],
    descEn: 'Enterprise-grade bidirectional sync with Oracle SCM and Procurement Cloud. Suppliers, sites, awards, and financial data reconcile automatically across business units.',
    descPl: 'Dwukierunkowa synchronizacja enterprise z Oracle SCM i Procurement Cloud. Dostawcy, lokalizacje, wyniki sourcingu i dane finansowe uzgadniają się automatycznie między business unitami.',
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
    brandGradient: 'from-teal-500 via-cyan-700 to-blue-900',
    integrationType: 'native',
    featured: true,
    searchKeywords: ['dynamics', 'd365', 'business central', 'bc', 'microsoft', 'nav', 'navision', 'entra id'],
    descEn: 'SMB-friendly quick setup via Microsoft Entra ID. Connect your Vendor cards, POs, and invoices to Procurea in minutes — no custom development needed.',
    descPl: 'Szybka konfiguracja dla SMB przez Microsoft Entra ID. Podłącz karty vendorów, zamówienia i faktury do Procurea w kilka minut — bez programowania.',
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
    brandGradient: 'from-cyan-700 via-teal-800 to-slate-900',
    integrationType: 'native',
    searchKeywords: ['dynamics', 'd365', 'f&o', 'finance', 'operations', 'microsoft', 'ax', 'axapta', 'fno'],
    descEn: 'Deep procurement module connectivity for enterprise D365 F&O. Sync vendors across legal entities, surface purchase agreements, and route new suppliers through your approval workflow.',
    descPl: 'Głęboka integracja z modułem procurement enterprise D365 F&O. Synchronizacja vendorów między legal entities, widoczność purchase agreements i routing nowych dostawców przez workflow akceptacji.',
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
    brandGradient: 'from-sky-500 via-cyan-600 to-blue-800',
    integrationType: 'native',
    featured: true,
    searchKeywords: ['salesforce', 'sfdc', 'crm', 'sales cloud', 'apex', 'account', 'opportunity'],
    descEn: 'Bridge CRM intelligence with procurement. Map sourcing results to your Account hierarchy, auto-create Contacts from discovered suppliers, and log sourcing activity as CRM Tasks.',
    descPl: 'Pomost między CRM a procurement. Mapuj wyniki sourcingu na hierarchię Accountów, auto-twórz Kontakty ze znalezionych dostawców i loguj aktywność sourcingową jako Tasks w CRM.',
    dataFlowEn: ['Account master', 'Contacts and relationships', 'Opportunities linked to sourcing', 'Custom Supplier objects', 'Activity history'],
    dataFlowPl: ['Master Accountów', 'Kontakty i relacje', 'Opportunities powiązane z sourcingiem', 'Własne obiekty Supplier', 'Historia aktywności'],
    capabilitiesEn: ['Deep-link from Procurea to Account / Contact record', 'Auto-create Account + Contact on sourcing selection', 'Map sourcing results to existing CRM hierarchy', 'Log sourcing activity as Tasks or Activity records'],
    capabilitiesPl: ['Deep-link z Procurea do rekordu Account / Contact', 'Auto-tworzenie Account + Contact po wyborze w sourcingu', 'Mapowanie wyników sourcingu na istniejącą hierarchię CRM', 'Logowanie aktywności sourcingu jako Tasks lub Activity'],
    customizationEn: 'Custom object and field mapping, record types, validation rules, Apex triggers for complex logic, SSO via Salesforce SAML or your IdP.',
    customizationPl: 'Mapowanie własnych obiektów i pól, record types, validation rules, triggery Apex dla złożonej logiki, SSO przez Salesforce SAML lub Twój IdP.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  // ─── Via Merge.dev (50+ mid-market systems, single connector) ───
  {
    slug: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'Accounting',
    logo: 'QB',
    brandGradient: 'from-green-600 via-emerald-700 to-teal-900',
    integrationType: 'merge-dev',
    searchKeywords: ['quickbooks', 'qbo', 'intuit', 'accounting', 'bookkeeping'],
    descEn: 'Sync vendors, bills, and payments with QuickBooks Online via Merge.dev — a single secure connector that keeps Procurea and your bookkeeping in sync.',
    descPl: 'Synchronizacja vendorów, faktur i płatności z QuickBooks Online przez Merge.dev — jeden bezpieczny konektor utrzymujący Procurea i księgowość w sync.',
    dataFlowEn: ['Vendor list', 'Bills and bill payments', 'Chart of accounts', 'Tax codes and currencies'],
    dataFlowPl: ['Lista vendorów', 'Faktury i płatności', 'Plan kont', 'Kody podatkowe i waluty'],
    capabilitiesEn: ['Auto-create Vendor in QuickBooks after approval', 'Match discovered suppliers against existing QBO vendors', 'Export Purchase Orders as Bills', 'Reconcile supplier database weekly'],
    capabilitiesPl: ['Auto-tworzenie Vendora w QuickBooks po akceptacji', 'Matchowanie znalezionych dostawców do istniejących w QBO', 'Eksport Purchase Orders jako Bills', 'Tygodniowy reconcile bazy dostawców'],
    customizationEn: 'Account mapping, tax treatment, multi-currency handling. Setup in 10 minutes via Merge.dev OAuth flow.',
    customizationPl: 'Mapowanie kont, obsługa podatków, multi-currency. Setup w 10 minut przez OAuth Merge.dev.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  {
    slug: 'xero',
    name: 'Xero',
    category: 'Accounting',
    logo: 'XE',
    brandGradient: 'from-sky-400 via-cyan-600 to-blue-800',
    integrationType: 'merge-dev',
    searchKeywords: ['xero', 'accounting', 'bookkeeping', 'small business'],
    descEn: 'Small-business accounting sync via Merge.dev. Vendors, bills, and spend categories flow into Procurea so your sourcing pipeline is always reconciled.',
    descPl: 'Synchronizacja księgowości small-business przez Merge.dev. Vendorzy, faktury i kategorie wydatków przepływają do Procurea, a pipeline sourcingu jest zawsze zreconcilowany.',
    dataFlowEn: ['Contacts (vendors and customers)', 'Bills and purchase orders', 'Tracking categories', 'Tax rates'],
    dataFlowPl: ['Kontakty (vendorzy i klienci)', 'Faktury i zamówienia', 'Kategorie śledzenia', 'Stawki VAT'],
    capabilitiesEn: ['Auto-create Contact as Vendor', 'Sync Bills bi-directionally', 'Map tracking categories to Procurea tags', 'Nightly reconcile of supplier list'],
    capabilitiesPl: ['Auto-tworzenie Contact jako Vendor', 'Dwukierunkowy sync Bills', 'Mapowanie kategorii śledzenia na tagi Procurea', 'Nocny reconcile listy dostawców'],
    customizationEn: 'Tracking category mapping, tax rule setup, multi-org (Partner Network) handling. OAuth-based connection.',
    customizationPl: 'Mapowanie kategorii śledzenia, reguły VAT, multi-org (Partner Network). Połączenie przez OAuth.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
  {
    slug: 'sage-intacct',
    name: 'Sage Intacct',
    category: 'Accounting',
    logo: 'SI',
    brandGradient: 'from-emerald-600 via-green-700 to-slate-900',
    integrationType: 'merge-dev',
    searchKeywords: ['sage', 'intacct', 'accounting', 'erp', 'mid-market'],
    descEn: 'Mid-market accounting sync via Merge.dev. Dimension structures, vendor entities, and PO data flow into Procurea without custom integration work.',
    descPl: 'Synchronizacja księgowości mid-market przez Merge.dev. Struktury wymiarów, encje vendorów i dane PO przepływają do Procurea bez custom integracji.',
    dataFlowEn: ['Vendor master', 'Purchase Orders', 'Bills and payments', 'Dimensional data (locations, departments)', 'Vendor groups'],
    dataFlowPl: ['Master vendorów', 'Purchase Orders', 'Faktury i płatności', 'Dane wymiarowe (lokalizacje, działy)', 'Grupy vendorów'],
    capabilitiesEn: ['Auto-create Vendor across entities', 'Sync PO lifecycle', 'Respect dimension-based access', 'Reconcile supplier master nightly'],
    capabilitiesPl: ['Auto-tworzenie Vendora w wielu encjach', 'Sync cyklu życia PO', 'Dostęp oparty o wymiary', 'Nocny reconcile master dostawców'],
    customizationEn: 'Entity mapping for multi-entity orgs, dimension structure alignment, approval routing hooks. Merge.dev managed.',
    customizationPl: 'Mapowanie encji dla multi-entity, dopasowanie struktury wymiarów, haki routingu akceptacji. Zarządzane przez Merge.dev.',
    tiersEn: 'Enterprise, Enterprise Custom',
    tiersPl: 'Enterprise, Enterprise Custom',
  },
  {
    slug: 'odoo',
    name: 'Odoo',
    category: 'ERP',
    logo: 'OD',
    brandGradient: 'from-purple-600 via-violet-700 to-indigo-900',
    integrationType: 'merge-dev',
    searchKeywords: ['odoo', 'erp', 'open source', 'purchase', 'accounting'],
    descEn: 'Open-source ERP connected via Merge.dev. Sync partners (vendors), purchase orders, and invoices between Odoo and Procurea for fast mid-market deployments.',
    descPl: 'Open-source ERP podłączony przez Merge.dev. Synchronizacja partnerów (vendorów), zamówień i faktur między Odoo a Procurea dla szybkich wdrożeń mid-market.',
    dataFlowEn: ['res.partner (vendors)', 'Purchase Orders (purchase.order)', 'Vendor Bills', 'Product references', 'Accounting journals'],
    dataFlowPl: ['res.partner (vendorzy)', 'Zamówienia (purchase.order)', 'Vendor Bills', 'Referencje produktów', 'Dzienniki księgowe'],
    capabilitiesEn: ['Auto-create res.partner as Vendor', 'Export PO from Procurea to Odoo', 'Tag matched suppliers in both systems', 'Nightly reconcile'],
    capabilitiesPl: ['Auto-tworzenie res.partner jako Vendor', 'Eksport PO z Procurea do Odoo', 'Tagowanie dopasowanych dostawców w obu systemach', 'Nocny reconcile'],
    customizationEn: 'Works with Odoo 15+ (SaaS or self-hosted). Custom field mapping via Odoo modules, module-level access control.',
    customizationPl: 'Działa z Odoo 15+ (SaaS lub self-hosted). Mapowanie custom fields przez moduły Odoo, access control na poziomie modułu.',
    tiersEn: 'Professional +Procurement, Enterprise, Enterprise Custom',
    tiersPl: 'Professional +Procurement, Enterprise, Enterprise Custom',
  },
]

export const INTEGRATION_CATEGORIES: Array<{ key: IntegrationCategory | 'all'; labelEn: string; labelPl: string }> = [
  { key: 'all', labelEn: 'All', labelPl: 'Wszystkie' },
  { key: 'ERP', labelEn: 'ERP', labelPl: 'ERP' },
  { key: 'CRM', labelEn: 'CRM', labelPl: 'CRM' },
  { key: 'Accounting', labelEn: 'Accounting', labelPl: 'Księgowość' },
  { key: 'API', labelEn: 'API & Webhooks', labelPl: 'API i Webhooks' },
]

/* ═════════════════════ COPY ═════════════════════ */

export const integrationsCopy = {
  heroEyebrow: isEN ? 'Integrations · API · Webhooks' : 'Integracje · API · Webhooks',
  heroTitle: isEN
    ? 'Procurea fits inside your stack — not the other way around'
    : 'Procurea wpasowuje się w Twój stack — a nie odwrotnie',
  heroSubtitle: isEN
    ? 'Native adapters for the seven most-used ERPs. 50+ additional systems via Merge.dev. REST API and webhooks for everything else. No duplicate data entry, deep-link to every record.'
    : 'Natywne adaptery dla siedmiu najpopularniejszych ERP. 50+ dodatkowych systemów przez Merge.dev. REST API i webhooks dla reszty. Bez duplikacji danych, deep-link do każdego rekordu.',
  heroStats: isEN
    ? [
        { value: '7', label: 'Native adapters' },
        { value: '50+', label: 'Via Merge.dev' },
        { value: 'REST', label: 'API + Webhooks' },
        { value: 'SOC 2', label: 'Type II (in process)' },
      ]
    : [
        { value: '7', label: 'Natywnych adapterów' },
        { value: '50+', label: 'Przez Merge.dev' },
        { value: 'REST', label: 'API + Webhooks' },
        { value: 'SOC 2', label: 'Type II (w procesie)' },
      ],

  integrationTypeLabel: {
    native: isEN ? 'Native integration' : 'Integracja natywna',
    'merge-dev': isEN ? 'Via Merge.dev' : 'Przez Merge.dev',
    custom: isEN ? 'Custom for your stack' : 'Custom pod Twój stack',
  } as Record<IntegrationType, string>,
  dataFlowLabel: isEN ? 'Data flow' : 'Przepływ danych',
  capabilitiesLabel: isEN ? 'Capabilities' : 'Możliwości',
  customizationLabel: isEN ? 'Customization' : 'Customizacja',
  tierLabel: isEN ? 'Available on' : 'Dostępne w',
  ctaLabel: isEN ? 'Talk to us' : 'Porozmawiaj z nami',
  learnMoreLabel: isEN ? 'Learn more' : 'Dowiedz się więcej',

  featuredTitle: isEN ? 'Most-requested integrations' : 'Najczęściej wybierane integracje',
  featuredSubtitle: isEN
    ? 'Native bidirectional sync, deep-link to every record, auto-create on approval. Ready to switch on.'
    : 'Natywna synchronizacja dwukierunkowa, deep-link do każdego rekordu, auto-tworzenie po akceptacji. Gotowe do włączenia.',

  allTitle: isEN ? 'All supported systems' : 'Wszystkie obsługiwane systemy',
  allSubtitle: isEN
    ? 'Filter by category or search by system name.'
    : 'Filtruj po kategorii lub wyszukaj po nazwie systemu.',

  searchPlaceholder: isEN ? 'Search — SAP, Oracle, Dynamics, NetSuite…' : 'Szukaj — SAP, Oracle, Dynamics, NetSuite…',
  noResults: isEN ? 'No pre-built integration for that system yet.' : 'Nie mamy jeszcze gotowej integracji z tym systemem.',
  noResultsCta: isEN ? 'Request a custom adapter →' : 'Zgłoś custom adapter →',

  valueTitle: isEN ? 'Why integrate Procurea with your stack?' : 'Dlaczego warto zintegrować Procurea?',
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

  ctaSectionTitle: isEN ? 'Your system not in the list?' : 'Nie ma Twojego systemu na liście?',
  ctaSectionBody: isEN
    ? 'We build custom adapters for enterprise stacks — legacy on-prem, industry-specific ERP, or proprietary databases. Tell us what you run and we scope the adapter as part of Enterprise Custom onboarding.'
    : 'Budujemy custom adaptery dla enterprise stacków — legacy on-prem, branżowe ERP lub własne bazy. Powiedz nam z czego korzystasz, a zaprojektujemy adapter w ramach onboardingu Enterprise Custom.',
}

/* ═════════════════════ API / WEBHOOKS SECTION ═════════════════════ */

export interface ApiResource {
  title: string
  description: string
  bullets: string[]
  snippetLabel: string
  snippet: string
}

export const apiSection = {
  eyebrow: isEN ? 'Developer Platform' : 'Platforma deweloperska',
  title: isEN
    ? 'Build your own integration'
    : 'Zbuduj własną integrację',
  subtitle: isEN
    ? 'For stacks we do not natively support, Procurea exposes a REST API and real-time webhooks. Access is gated to Enterprise and Enterprise Custom tiers — request a sandbox key via the form below.'
    : 'Dla stacków, których nie obsługujemy natywnie, Procurea udostępnia REST API oraz real-time webhooks. Dostęp tylko dla planów Enterprise i Enterprise Custom — poproś o klucz sandbox przez formularz poniżej.',

  resources: isEN ? [
    {
      title: 'REST API',
      description: 'Read and write suppliers, campaigns, offers, and purchase orders. OAuth 2.0 + API keys. JSON over HTTPS.',
      bullets: [
        'OAuth 2.0 (authorization code + client credentials)',
        'Rate limit: 600 req/min per tenant',
        'Pagination via cursor, filters on every collection',
        'Idempotency keys for POST endpoints',
      ],
      snippetLabel: 'Example: search suppliers',
      snippet: `curl -X GET \\
  "https://api.procurea.example/v1/suppliers?q=valve&country=DE" \\
  -H "Authorization: Bearer \${PROCUREA_API_KEY}" \\
  -H "Accept: application/json"`,
    },
    {
      title: 'Webhooks',
      description: 'Subscribe to real-time events — supplier lifecycle, campaign state, offer submissions, approvals. HMAC-signed payloads.',
      bullets: [
        'HMAC-SHA256 signature header (verify before processing)',
        'At-least-once delivery with exponential backoff',
        'Configure up to 10 endpoints per tenant',
        'Event replay from admin panel (last 30 days)',
      ],
      snippetLabel: 'Example event payload',
      snippet: `{
  "event": "supplier.approved",
  "tenant_id": "org_7fQ…",
  "data": {
    "supplier_id": "sup_3Xa…",
    "name": "Fabryka Komponentów Sp. z o.o.",
    "country": "PL",
    "vat": "PL5271234567",
    "approved_by": "user_2Yz…",
    "approved_at": "2026-04-21T14:03:22Z"
  }
}`,
    },
    {
      title: 'SDKs',
      description: 'Official clients handle auth, retries, and typed models. Python and Node available; others on request.',
      bullets: [
        'Node / TypeScript — types generated from OpenAPI',
        'Python 3.10+ — async-first, works with FastAPI',
        'Postman collection + OpenAPI 3 spec on request',
        'Java and .NET — quoted per Enterprise onboarding',
      ],
      snippetLabel: 'Example: Node.js',
      snippet: `import { Procurea } from '@procurea/sdk'

const client = new Procurea({ apiKey: process.env.PROCUREA_API_KEY })

const { data } = await client.suppliers.search({
  query: 'valve',
  country: 'DE',
  limit: 25,
})`,
    },
  ] as ApiResource[] : [
    {
      title: 'REST API',
      description: 'Odczyt i zapis dostawców, kampanii, ofert i zamówień. OAuth 2.0 + klucze API. JSON przez HTTPS.',
      bullets: [
        'OAuth 2.0 (authorization code + client credentials)',
        'Limit: 600 req/min per tenant',
        'Paginacja przez cursor, filtry na każdej kolekcji',
        'Klucze idempotency dla POST-ów',
      ],
      snippetLabel: 'Przykład: wyszukaj dostawców',
      snippet: `curl -X GET \\
  "https://api.procurea.example/v1/suppliers?q=valve&country=DE" \\
  -H "Authorization: Bearer \${PROCUREA_API_KEY}" \\
  -H "Accept: application/json"`,
    },
    {
      title: 'Webhooks',
      description: 'Subskrybuj zdarzenia w czasie rzeczywistym — cykl życia dostawcy, stan kampanii, oferty, akceptacje. Payloady podpisane HMAC.',
      bullets: [
        'Sygnatura HMAC-SHA256 w nagłówku (weryfikuj przed przetworzeniem)',
        'Dostawa at-least-once z exponential backoff',
        'Do 10 endpointów per tenant',
        'Replay zdarzeń z panelu (ostatnie 30 dni)',
      ],
      snippetLabel: 'Przykładowy payload zdarzenia',
      snippet: `{
  "event": "supplier.approved",
  "tenant_id": "org_7fQ…",
  "data": {
    "supplier_id": "sup_3Xa…",
    "name": "Fabryka Komponentów Sp. z o.o.",
    "country": "PL",
    "vat": "PL5271234567",
    "approved_by": "user_2Yz…",
    "approved_at": "2026-04-21T14:03:22Z"
  }
}`,
    },
    {
      title: 'SDKs',
      description: 'Oficjalne klienty obsługują auth, retries i typy. Python i Node dostępne od razu; inne na zamówienie.',
      bullets: [
        'Node / TypeScript — typy generowane z OpenAPI',
        'Python 3.10+ — async-first, działa z FastAPI',
        'Kolekcja Postman + spec OpenAPI 3 na żądanie',
        'Java i .NET — wycena w ramach Enterprise onboardingu',
      ],
      snippetLabel: 'Przykład: Node.js',
      snippet: `import { Procurea } from '@procurea/sdk'

const client = new Procurea({ apiKey: process.env.PROCUREA_API_KEY })

const { data } = await client.suppliers.search({
  query: 'valve',
  country: 'DE',
  limit: 25,
})`,
    },
  ],

  accessBannerTitle: isEN ? 'API access is gated' : 'Dostęp do API jest kontrolowany',
  accessBannerBody: isEN
    ? 'We do not publish a public sandbox. Request a tenant-scoped API key through the Enterprise onboarding — we send docs, SDK, and Postman collection after a short call.'
    : 'Nie udostępniamy publicznego sandboxa. Klucz API z przypisanym tenantem otrzymasz po krótkiej rozmowie w ramach onboardingu Enterprise — wtedy wysyłamy dokumentację, SDK i kolekcję Postman.',
  accessBannerCta: isEN ? 'Request API access' : 'Poproś o dostęp do API',

  securityTitle: isEN ? 'Security & compliance' : 'Bezpieczeństwo i zgodność',
  securityItems: isEN ? [
    { label: 'Auth', value: 'OAuth 2.0, SAML SSO, scoped API keys' },
    { label: 'Transport', value: 'TLS 1.3, HSTS, certificate pinning for SDKs' },
    { label: 'Data residency', value: 'GCP europe-west1 (Belgium). US region on request.' },
    { label: 'Compliance', value: 'GDPR / RODO, ISO 27001 in progress, SOC 2 Type II in progress' },
    { label: 'Audit', value: 'Immutable event log, tenant-scoped access traces' },
    { label: 'Isolation', value: 'Per-tenant row-level security in PostgreSQL, separate encryption keys on request' },
  ] : [
    { label: 'Auth', value: 'OAuth 2.0, SAML SSO, scoped API keys' },
    { label: 'Transport', value: 'TLS 1.3, HSTS, pinning certyfikatów w SDK' },
    { label: 'Data residency', value: 'GCP europe-west1 (Belgia). Region US na żądanie.' },
    { label: 'Zgodność', value: 'GDPR / RODO, ISO 27001 w procesie, SOC 2 Type II w procesie' },
    { label: 'Audyt', value: 'Immutable event log, per-tenant ślad dostępu' },
    { label: 'Izolacja', value: 'Per-tenant row-level security w PostgreSQL, osobne klucze szyfrowania na żądanie' },
  ],
}
