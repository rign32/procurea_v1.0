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
// Blog slugs (20 posts — mirrors landing/src/content/blog-data/skeletons.ts)
const BLOG_SLUGS = [
  'how-to-find-100-verified-suppliers-in-under-an-hour',
  'the-30-hour-problem',
  'european-nearshoring-guide-2026',
  'rfq-automation-workflows',
  'turkey-vs-poland-vs-portugal-textiles',
  'vat-vies-verification-3-minute-check',
  'ai-procurement-software-7-features-2026',
  'supplier-risk-management-2026',
  'german-manufacturer-sourcing',
  'rfq-comparison-template-buyers-use',
  'china-plus-one-strategy',
  'vendor-scoring-10-criteria',
  'supplier-certifications-guide',
  'supplier-database-stale-40-percent',
  'netsuite-supplier-management',
  'sap-ariba-alternative-procurement',
  'tco-beat-lowest-price-trap',
  'sourcing-funnel-explained',
  'salesforce-for-procurement',
  'buyers-guide-12-questions-ai-sourcing',
]

// Resource slugs (5 lead magnets — mirrors landing/src/content/resources.ts)
const RESOURCE_SLUGS = [
  'rfq-comparison-template',
  'supplier-risk-checklist-2026',
  'tco-calculator',
  'vendor-scoring-framework',
  'nearshore-migration-playbook',
]

const ROUTES_PL = [
  '/', '/cennik', '/o-nas', '/kontakt', '/funkcje', '/dla-kogo', '/integracje',
  '/regulamin', '/polityka-prywatnosci', '/rodo', '/bezpieczenstwo', '/zgodnosc',
  '/dla-kogo/produkcja', '/dla-kogo/eventy', '/dla-kogo/budownictwo', '/dla-kogo/retail-ecommerce',
  '/dla-kogo/gastronomia', '/dla-kogo/ochrona-zdrowia', '/dla-kogo/logistyka', '/dla-kogo/mro-utrzymanie-ruchu',
  '/funkcje/ai-sourcing', '/funkcje/outreach-mailowy', '/funkcje/supplier-portal', '/funkcje/porownywarka-ofert',
  '/porownanie',
  '/partnerzy',
  // Unified Content Hub — absorbed blog index + case studies
  '/materialy',
  // Blog posts — individual pages still render for SEO
  ...BLOG_SLUGS.map(slug => `/blog/${slug}`),
  // Resources (lead magnets)
  ...RESOURCE_SLUGS.map(slug => `/materialy/${slug}`),
]

const ROUTES_EN = [
  '/', '/pricing', '/about', '/contact', '/features', '/industries', '/integrations',
  '/terms', '/privacy', '/gdpr', '/security', '/compliance',
  '/industries/manufacturing', '/industries/events', '/industries/construction', '/industries/retail-ecommerce',
  '/industries/horeca', '/industries/healthcare', '/industries/logistics', '/industries/mro',
  '/features/ai-sourcing', '/features/email-outreach', '/features/supplier-portal', '/features/offer-comparison',
  '/vs-manual-sourcing',
  '/partners',
  // Unified Content Hub — absorbed blog index + case studies
  '/resources',
  // Blog posts — individual pages still render for SEO
  ...BLOG_SLUGS.map(slug => `/blog/${slug}`),
  // Resources (lead magnets)
  ...RESOURCE_SLUGS.map(slug => `/resources/${slug}`),
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
  // Unified Content Hub
  '/materialy': { title: 'Centrum Wiedzy Procurement — artykuly, przewodniki i szablony | Procurea', description: 'Wszystko o procurement w jednym miejscu: artykuly, przewodniki do pobrania, szablony, playbooki i kalkulatory. RFQ, TCO, scoring dostawcy, nearshore. Excel, PDF, Notion.' },
  '/resources': { title: 'Procurement Content Hub — Articles, Guides & Templates | Procurea', description: 'Everything procurement in one place: articles, downloadable guides, templates, playbooks, and calculators. RFQ comparison, TCO calculator, supplier risk checklist, nearshore playbook, vendor scoring.' },
}

// Blog post titles per slug — mirrors landing/src/content/blog-data/skeletons.ts
const BLOG_META_EN = {
  'how-to-find-100-verified-suppliers-in-under-an-hour': { title: 'How to Find 100+ Verified Suppliers in Under an Hour | Procurea Blog', description: 'The 30-hour manual Excel baseline is dead. Here is the 4-step AI workflow that replaces it — without hiring, without enterprise software, without losing sourcing quality.' },
  'the-30-hour-problem': { title: 'The 30-Hour Problem: Why Manual Sourcing Is Killing Your Margin | Procurea', description: 'Anatomy of a 30-hour sourcing campaign. Cost breakdown, where time goes, and the ROI math that makes automation a no-brainer.' },
  'european-nearshoring-guide-2026': { title: "A Procurement Manager's Guide to European Nearshoring in 2026 | Procurea", description: 'Post-COVID, tariffs, CSRD are pushing production out of China. Country-by-country playbook — Poland, Czech Republic, Turkey, Portugal, Romania, Hungary.' },
  'rfq-automation-workflows': { title: "RFQ Automation: What It Is, Why Excel Won't Cut It, and 5 Workflows That Work | Procurea", description: 'Define RFQ automation. Problem with Excel RFQs. 5 workflows: bulk outreach, templated offers, scoring, follow-ups, comparison. Plus free template.' },
  'turkey-vs-poland-vs-portugal-textiles': { title: 'Turkey vs Poland vs Portugal: Where to Source Textiles in 2026 | Procurea', description: 'Category-specific deep-dive. Country-by-country: capacity, MOQ, certs (GOTS, OEKO-TEX), lead time, price ranges. Decision matrix included.' },
  'vat-vies-verification-3-minute-check': { title: 'VAT VIES Verification: The 3-Minute Check That Saves You €50k | Procurea', description: 'Why VAT verification matters for cross-border procurement, how VIES works, when it gets wrong answers, and how to automate verification at scale.' },
  'ai-procurement-software-7-features-2026': { title: 'AI Procurement Software: 7 Features Worth Paying For in 2026 | Procurea', description: '2026 AI procurement landscape. 7 must-have features, hype vs real, vendor shortlist framework. Honest teardown.' },
  'supplier-risk-management-2026': { title: 'Supplier Risk Management: A 2026 Checklist for Procurement Teams | Procurea', description: 'Risk categories: financial, operational, geopolitical, ESG, cyber. CSDDD, tariffs, CSRD. 20-point checklist + monitoring ops.' },
  'german-manufacturer-sourcing': { title: 'How to Source from German Manufacturers Without Speaking German | Procurea', description: 'Why German suppliers are worth the effort. Where to find them. Language barriers, Mittelstand culture, email templates.' },
  'rfq-comparison-template-buyers-use': { title: 'The Free RFQ Comparison Template Buyers Actually Use [Excel + Notion] | Procurea', description: '10 comparison criteria, tiered pricing, MOQ / lead time / Incoterms, scoring formula. Excel limits + when to upgrade.' },
  'china-plus-one-strategy': { title: 'China+1 Strategy: A Practical Playbook for 2026 Diversification | Procurea', description: 'Context: 2025 tariff shocks. What China+1 means (not China-out). Alt countries by category. Sequencing. Board-ready template.' },
  'vendor-scoring-10-criteria': { title: 'Vendor Scoring: A 10-Criteria Framework for Fair Supplier Evaluation | Procurea', description: 'Why ad-hoc scoring fails audit. 10 criteria, weighting logic, defensibility, template.' },
  'supplier-certifications-guide': { title: 'ISO 9001 vs IATF 16949 vs FDA: Supplier Certifications That Actually Matter | Procurea', description: 'Certification landscape: when each matters, how to verify, expiration tracking, red flags.' },
  'supplier-database-stale-40-percent': { title: 'Why 40% of Your Supplier Database Goes Stale Every Year | Procurea', description: 'The 40% stat. Why data decays. Impact. Continuous refresh vs annual audit. Self-audit template.' },
  'netsuite-supplier-management': { title: 'Oracle NetSuite Supplier Management: What Procurement Teams Actually Need | Procurea', description: 'NetSuite vendor record capabilities + gaps. Third-party tools vs native. Procurea + NetSuite specifics.' },
  'sap-ariba-alternative-procurement': { title: 'SAP Ariba Alternative: Mid-Market Enterprise Sourcing Without the SAP Bill | Procurea', description: 'SAP Ariba cost + complexity reality. What mid-market actually needs. How Procurea delivers 80% of value at 10% of cost.' },
  'tco-beat-lowest-price-trap': { title: 'Total Cost of Ownership (TCO): How to Beat the Lowest-Price Trap | Procurea', description: 'Why lowest unit price ≠ best value. TCO components + worked example + calculator.' },
  'sourcing-funnel-explained': { title: 'From 500 Google Results to 120 Verified Suppliers: The Sourcing Funnel Explained | Procurea', description: 'The funnel: queries → URLs → screened → verified → contacted. Conversion rates at each stage. Where most buyers fail.' },
  'salesforce-for-procurement': { title: 'Salesforce for Procurement: When It Works (And When You Need Something Else) | Procurea', description: 'Why some teams run procurement in Salesforce. When it works vs breaks. Procurea + Salesforce sync patterns.' },
  'buyers-guide-12-questions-ai-sourcing': { title: "Buyer's Guide: 12 Questions to Ask Before Picking an AI Sourcing Tool | Procurea", description: '12-question framework. Search, verification, outreach, comparison, integration, security. How vendors dodge each.' },
}

const BLOG_META_PL = {
  'how-to-find-100-verified-suppliers-in-under-an-hour': { title: 'Jak znalezc 100+ zweryfikowanych dostawcow w godzine | Procurea Blog', description: '30-godzinny baseline Excel umarl. 4-krokowy workflow AI ktory go zastepuje — bez zatrudniania, bez enterprise software.' },
  'the-30-hour-problem': { title: 'Problem 30 godzin: dlaczego reczny sourcing zabija twoja marze | Procurea', description: 'Anatomia 30-godzinnej kampanii sourcingowej. Podzial kosztow, gdzie naprawde idzie czas, matematyka ROI.' },
  'european-nearshoring-guide-2026': { title: 'Przewodnik po europejskim nearshoringu w 2026 | Procurea', description: 'Post-COVID, cla i CSRD wypychaja produkcje z Chin. Playbook kraj-po-kraju — Polska, Czechy, Turcja, Portugalia.' },
  'rfq-automation-workflows': { title: 'Automatyzacja RFQ: 5 workflow ktore dzialaja | Procurea', description: 'Definicja automatyzacji RFQ. 5 workflow: bulk outreach, szablonowe oferty, scoring, follow-upy, porownanie. Darmowy szablon.' },
  'turkey-vs-poland-vs-portugal-textiles': { title: 'Turcja vs Polska vs Portugalia: gdzie szukac tekstyliow | Procurea', description: 'Dogłębna analiza sourcingu tekstyliow. Kraj-po-kraju: moce, MOQ, certyfikaty, lead time, ceny.' },
  'vat-vies-verification-3-minute-check': { title: 'Weryfikacja VAT VIES: 3-minutowa kontrola | Procurea', description: 'Dlaczego weryfikacja VAT ma znaczenie, jak dziala VIES, kiedy sie myli, jak zautomatyzowac.' },
  'ai-procurement-software-7-features-2026': { title: 'Oprogramowanie AI do procurement: 7 funkcji 2026 | Procurea', description: 'Krajobraz AI procurement 2026. 7 must-have funkcji, framework wyboru vendorow. Uczciwy teardown.' },
  'supplier-risk-management-2026': { title: 'Zarzadzanie ryzykiem dostawcow: checklista 2026 | Procurea', description: 'Kategorie ryzyka: finansowe, operacyjne, geopolityczne, ESG, cyber. Ryzyka 2026. 20-punktowa checklista.' },
  'german-manufacturer-sourcing': { title: 'Jak pozyskiwac od niemieckich producentow | Procurea', description: 'Gdzie szukac niemieckich dostawcow, bariery jezykowe, kultura Mittelstand, szablony emaili.' },
  'rfq-comparison-template-buyers-use': { title: 'Darmowy szablon porownania RFQ | Procurea', description: '10 kryteriow porownawczych, pola pricing tiered, MOQ, Incoterms, formula scoringu.' },
  'china-plus-one-strategy': { title: 'Strategia China+1: playbook dywersyfikacji 2026 | Procurea', description: 'Szoki celne 2025. Alt kraje per kategoria. Sekwencjonowanie. Szablon gotowy na zarzad.' },
  'vendor-scoring-10-criteria': { title: 'Scoring dostawcow: framework 10 kryteriow | Procurea', description: 'Dlaczego ad-hoc scoring nie przechodzi audytu. 10 kryteriow + logika wazenia + szablon.' },
  'supplier-certifications-guide': { title: 'ISO 9001, IATF 16949, FDA: certyfikaty dostawcow | Procurea', description: 'Krajobraz certyfikacji: kiedy kazdy ma znaczenie, jak weryfikowac, sledzenie wygasniec.' },
  'supplier-database-stale-40-percent': { title: 'Dlaczego 40% bazy dostawcow starzeje sie co rok | Procurea', description: 'Statystyka 40% — dlaczego dane starzeja sie, konsekwencje, jak naprawic.' },
  'netsuite-supplier-management': { title: 'NetSuite zarzadzanie dostawcami: co naprawde potrzebne | Procurea', description: 'Mozliwosci NetSuite vendor record + luki. Narzedzia third-party vs native.' },
  'sap-ariba-alternative-procurement': { title: 'Alternatywa dla SAP Ariba: enterprise sourcing bez rachunku SAP | Procurea', description: 'Koszty i zlozonosc SAP Ariba. Jak Procurea dostarcza 80% wartosci za 10% kosztow.' },
  'tco-beat-lowest-price-trap': { title: 'Total Cost of Ownership: pokonaj pulapke najnizszej ceny | Procurea', description: 'Dlaczego najnizsza cena ≠ najlepsza wartosc. Komponenty TCO + kalkulator.' },
  'sourcing-funnel-explained': { title: 'Lejek sourcingowy: od 500 wynikow Google do 120 dostawcow | Procurea', description: 'Lejek: zapytania → URL-e → screened → verified → kontakt. Wskazniki konwersji.' },
  'salesforce-for-procurement': { title: 'Salesforce dla procurement: kiedy dziala (i kiedy nie) | Procurea', description: 'Dlaczego niektore zespoly prowadza procurement w Salesforce. Kiedy dziala vs kiedy sie lamie.' },
  'buyers-guide-12-questions-ai-sourcing': { title: 'Przewodnik kupujacego: 12 pytan do AI sourcing | Procurea', description: '12-pytan framework. Jak vendorzy uciekaja przed kazdym pytaniem. Szablon scoringu.' },
}

const RESOURCE_META_EN = {
  'rfq-comparison-template': { title: 'RFQ Comparison Template — Free Excel & Notion | Procurea', description: 'Battle-tested Excel and Notion template for comparing supplier offers side-by-side. 10 criteria, built-in scoring.' },
  'supplier-risk-checklist-2026': { title: 'Supplier Risk Checklist 2026 — 20-Point Verification Guide | Procurea', description: 'Comprehensive 20-point supplier risk verification checklist used by procurement teams to prevent supply chain disruption.' },
  'tco-calculator': { title: 'TCO Calculator — Beat the Lowest-Price Trap | Procurea', description: 'Interactive Excel calculator revealing true Total Cost of Ownership. Beyond unit price: logistics, duties, quality, switching cost.' },
  'vendor-scoring-framework': { title: 'Vendor Scoring Framework — 10-Criteria Template | Procurea', description: 'Defensible 10-criteria vendor scoring framework with weighting logic, ready for your procurement audit.' },
  'nearshore-migration-playbook': { title: 'Nearshore Migration Playbook — China+1 Made Practical | Procurea', description: 'Step-by-step playbook for diversifying supply chain from China to European alternatives. Country comparison + business case.' },
}

const RESOURCE_META_PL = {
  'rfq-comparison-template': { title: 'Szablon porownania RFQ — Excel i Notion | Procurea', description: 'Sprawdzony w boju szablon Excel i Notion do porownywania ofert. 10 kryteriow, wbudowany scoring.' },
  'supplier-risk-checklist-2026': { title: 'Checklista ryzyka dostawcy 2026 — 20 punktow | Procurea', description: 'Kompleksowa 20-punktowa checklista weryfikacji ryzyka dostawcy.' },
  'tco-calculator': { title: 'Kalkulator TCO — pokonaj pulapke najnizszej ceny | Procurea', description: 'Interaktywny kalkulator Excel ujawniajacy prawdziwy Total Cost of Ownership.' },
  'vendor-scoring-framework': { title: 'Framework scoringu dostawcy — szablon 10 kryteriow | Procurea', description: 'Obronny framework scoringu dostawcy z 10 kryteriami i logika wazenia.' },
  'nearshore-migration-playbook': { title: 'Playbook migracji nearshore — China+1 w praktyce | Procurea', description: 'Playbook krok po kroku dla dywersyfikacji lancucha dostaw z Chin do europejskich alternatyw.' },
}

// Merge blog/resource meta into main META based on locale
for (const slug of BLOG_SLUGS) {
  const en = BLOG_META_EN[slug]
  const pl = BLOG_META_PL[slug]
  if (en) META[`/blog/${slug}__en`] = en
  if (pl) META[`/blog/${slug}__pl`] = pl
}
for (const slug of RESOURCE_SLUGS) {
  const en = RESOURCE_META_EN[slug]
  const pl = RESOURCE_META_PL[slug]
  if (en) META[`/resources/${slug}`] = en
  if (pl) META[`/materialy/${slug}`] = pl
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
  // Unified Content Hub (PL ↔ EN)
  '/materialy': '/resources', '/resources': '/materialy',
}

// Blog post pages remain the same URL in both languages (handled via canonical)
for (const slug of BLOG_SLUGS) ALT_MAP[`/blog/${slug}`] = `/blog/${slug}`

// Add resource detail alt for each slug (PL /materialy/:slug ↔ EN /resources/:slug)
for (const slug of RESOURCE_SLUGS) {
  ALT_MAP[`/materialy/${slug}`] = `/resources/${slug}`
  ALT_MAP[`/resources/${slug}`] = `/materialy/${slug}`
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
    // Blog and case-study slugs share the same URL structure in PL/EN, so look up localized META
    let meta = META[path]
    if (!meta) {
      const localizedKey = `${path}__${LANG}`
      meta = META[localizedKey]
    }
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
    const LASTMOD = '2026-04-22'
    const ALT_SITE = isEN ? 'https://procurea.pl' : 'https://procurea.io'
    const ALT_LANG = isEN ? 'pl' : 'en'
    const CURR_LANG = isEN ? 'en' : 'pl'

    // Priority / changefreq rules
    function getSitemapMeta(route) {
      if (route === '/') return { priority: '1.0', changefreq: 'weekly' }

      // Hub pages (including content hub — high organic intent)
      const hubPages = ['/pricing', '/cennik', '/features', '/funkcje', '/industries', '/dla-kogo', '/resources', '/materialy']
      if (hubPages.includes(route)) return { priority: '0.9', changefreq: 'weekly' }

      // Blog posts — fresh content
      if (route.startsWith('/blog/')) return { priority: '0.8', changefreq: 'monthly' }

      // Lead magnets — conversion pages
      if (route.startsWith('/resources/') || route.startsWith('/materialy/')) return { priority: '0.8', changefreq: 'monthly' }

      // Feature / industry detail pages
      if (route.startsWith('/features/') || route.startsWith('/funkcje/') ||
          route.startsWith('/industries/') || route.startsWith('/dla-kogo/')) {
        return { priority: '0.7', changefreq: 'monthly' }
      }

      // Secondary pages
      const secondaryPages = ['/integrations', '/integracje', '/about', '/o-nas', '/contact', '/kontakt',
                              '/partners', '/partnerzy', '/vs-manual-sourcing', '/porownanie']
      if (secondaryPages.includes(route)) return { priority: '0.6', changefreq: 'monthly' }

      // Legal
      const legalPages = ['/terms', '/regulamin', '/privacy', '/polityka-prywatnosci', '/gdpr', '/rodo', '/security', '/bezpieczenstwo', '/compliance', '/zgodnosc']
      if (legalPages.includes(route)) return { priority: '0.3', changefreq: 'yearly' }

      return { priority: '0.5', changefreq: 'monthly' }
    }

    const urls = routes.map(route => {
      const { priority, changefreq } = getSitemapMeta(route)
      const loc = `${SITE}${route === '/' ? '/' : route}`
      const altRoute = ALT_MAP[route]
      const altLoc = altRoute ? `${ALT_SITE}${altRoute === '/' ? '/' : altRoute}` : null

      const lines = [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${LASTMOD}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
      ]
      if (altLoc) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${CURR_LANG}" href="${loc}" />`)
        lines.push(`    <xhtml:link rel="alternate" hreflang="${ALT_LANG}" href="${altLoc}" />`)
        // x-default points to the EN version (primary international)
        const xDefault = isEN ? loc : altLoc
        lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}" />`)
      }
      lines.push('  </url>')
      return lines.join('\n')
    }).join('\n')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
    writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf8')
    console.log(`[prerender] sitemap.xml generated with ${routes.length} URLs (hreflang-enabled)`)

    // Production robots.txt — explicit sitemap + allow crawling
    if (!isStaging) {
      const robotsLines = [
        'User-agent: *',
        'Allow: /',
        '',
        '# Block duplicate/internal paths',
        'Disallow: /api/',
        'Disallow: /*?utm_',
        '',
        `Sitemap: ${SITE}/sitemap.xml`,
      ]
      writeFileSync(join(DIST, 'robots.txt'), robotsLines.join('\n') + '\n', 'utf8')
    }
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
