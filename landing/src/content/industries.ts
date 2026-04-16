// Industry page content — 4 MVP P0 industries with full copy.
// Reference: landing/docs/personas.md (industry sub-personas I1-I5).

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export interface IndustryContent {
  slug: string
  heroTitle: string
  heroSubtitle: string
  painPoints: { title: string; body: string }[]
  howProcureaHelps: { title: string; body: string }[]
  topFeatures: string[] // path keys from paths.ts
  relatedIndustries: string[] // slugs
  ctaTitle: string
  ctaBody: string
  interestTag: string // for /kontakt?interest=
}

// EN content
const industriesEN: Record<string, IndustryContent> = {
  'produkcja': {
    slug: 'manufacturing',
    heroTitle: 'AI procurement automation for manufacturing',
    heroSubtitle:
      'Alternative suppliers for raw materials, components, and MRO — qualified against ISO 9001, IATF 16949, RoHS, REACH. Dual sourcing and supply chain diversification in weeks, not months.',
    painPoints: [
      {
        title: 'Manual supplier search eats your team\'s week',
        body: 'Finding 5-10 qualified vendors for a new category takes analysts 30+ hours — googling, emailing, qualifying certificates. Procurea delivers the list in an hour.',
      },
      {
        title: 'Single-source dependency is a supply chain risk',
        body: 'Post-COVID and post-Ukraine, dual sourcing is not optional. You need backup vendors in nearshore locations fast, with the right certifications, before disruption hits.',
      },
      {
        title: 'Excel supplier databases rot',
        body: 'Contacts go stale (40%/year), certifications expire, tier-2 capacity shifts. A centralized registry with AI enrichment keeps your vendor base current.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Qualified supplier shortlist in minutes',
        body: 'Describe the category (e.g. "plastic injection molding, PA66, Europe, IATF 16949"). AI searches 26 languages, verifies capabilities, filters by certifications. You get 20-100 validated vendors.',
      },
      {
        title: 'RFQ to 50 suppliers in one click',
        body: 'With Procurement add-on: send RFQ in supplier\'s local language, track responses via Supplier Portal (magic link, no login), auto follow-up to non-responders.',
      },
      {
        title: 'Side-by-side offer comparison',
        body: 'Price per unit at tiered quantities, MOQ, lead time, Incoterms, certifications — compared in one table. Export as PDF report for your CFO or board.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['budownictwo', 'logistyka', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Ready to diversify your supplier base?',
    ctaBody: 'Book a 30-minute intro call. We will show you how Procurea handles your specific category (materials, components, MRO, packaging).',
    interestTag: 'industry_manufacturing',
  },
  'eventy': {
    slug: 'events',
    heroTitle: 'Event sourcing in 48 hours — catering, AV, scenography, gadgets',
    heroSubtitle:
      'Find local vendors fast, in any city, for time-critical events. AI searches in local languages so you get authentic local pricing and availability, not Google Ads noise.',
    painPoints: [
      {
        title: 'Sourcing in a foreign city is slow and expensive',
        body: 'You\'re organizing an event in Berlin, Barcelona, or Warsaw. You don\'t know the local vendor landscape. Without local contacts, you pay 30-50% premium or risk unvetted suppliers.',
      },
      {
        title: 'Short deadlines vs long RFQ cycles',
        body: 'Event kickoff in 2 weeks. Standard RFQ process takes 3-4 weeks. You cut corners, miss alternatives, or overpay known vendors.',
      },
      {
        title: 'Different categories = different workflows',
        body: 'Catering for 500 people, AV rental, scenography, on-site staff, gadgets — all need separate vendor research. Juggling 5+ parallel RFQs in spreadsheets breaks down.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Local vendor discovery in 26 languages',
        body: 'Type "catering for 500 people, Berlin Mitte, 18 Dec, vegan options". AI searches local German directories, verified supplier data, fresh contacts. Shortlist in 20 minutes.',
      },
      {
        title: 'RFQ with multilingual templates',
        body: 'Send RFQ in German to Berlin vendors, Polish to Warsaw vendors — automatic translation. Supplier Portal accepts offers in their language, we translate back for your team.',
      },
      {
        title: 'Parallel campaigns for complex events',
        body: 'Run catering, AV, scenography campaigns simultaneously. Compare offers per category, lock in the best, move on. Professional plan = 60 campaigns/month.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fAutoFollowUp'],
    relatedIndustries: ['gastronomia', 'retail-ecommerce'],
    ctaTitle: 'Got an event in 2 weeks?',
    ctaBody: 'Start a free research campaign right now. Your shortlist of local vendors will be ready in 20 minutes.',
    interestTag: 'industry_events',
  },
  'budownictwo': {
    slug: 'construction',
    heroTitle: 'Procurement for construction — materials and subcontractors',
    heroSubtitle:
      'Find qualified subcontractors (HVAC, electrical, finishing) and material suppliers for your next project. RFQ to 30+ vendors at once, compare on price, lead time, and local references.',
    painPoints: [
      {
        title: 'Tender preparation under time pressure',
        body: 'Public tender or private deal requires offers from 5+ qualified bidders in 7-14 days. Traditional outreach means endless phone calls and emails, often missing qualified vendors entirely.',
      },
      {
        title: 'Project-specific vendor qualification',
        body: 'Each project has unique requirements — certifications, insurance, locality, capacity. You need a fresh vendor list per project, not a stale database from last year.',
      },
      {
        title: 'Price comparison across tiered quotes',
        body: 'Construction vendors quote in tiered pricing, volume discounts, and milestone payments. Apples-to-apples comparison in Excel takes hours per RFQ.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Subcontractor discovery by category + location',
        body: 'Search "HVAC subcontractors, residential 200-unit development, Mazowieckie, ISO 9001, Polish-speaking team". AI returns 30-50 qualified companies with recent references.',
      },
      {
        title: 'Bulk RFQ with project specifications',
        body: 'Attach tender docs, BOQ, site plans. Send RFQ to 30+ vendors in one click. Supplier Portal collects structured quotes — no PDF parsing, no email chains.',
      },
      {
        title: 'Offer comparison with BOQ line items',
        body: 'Compare vendors on total price, per-BOQ-item price, lead time, payment terms, certifications, insurance. Export as PDF for tender evaluation committee.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'logistyka'],
    ctaTitle: 'Running a tender this month?',
    ctaBody: 'Book a demo. See how Procurea handles subcontractor RFQ for your project type (residential, commercial, industrial, infrastructure).',
    interestTag: 'industry_construction',
  },
  'retail-ecommerce': {
    slug: 'retail-ecommerce',
    heroTitle: 'Private label sourcing for retail and e-commerce brands',
    heroSubtitle:
      'Find private label manufacturers in Europe, Turkey, and nearshore locations. Migrate from China with 18+ alternative factories in weeks, not months. Verified CE, FDA, GOTS, OEKO-TEX certifications.',
    painPoints: [
      {
        title: 'China sourcing no longer the obvious choice',
        body: 'Tariffs, tensions, shipping costs, and ESG pressure push D2C brands toward nearshore. But finding EU/TR alternatives for cosmetics, apparel, electronics takes weeks of research — brands give up and stay in Alibaba.',
      },
      {
        title: 'MOQ negotiation for small brands',
        body: 'Growing D2C brand can\'t commit to 10,000 unit MOQs. You need manufacturers flexible on minimums, willing to prototype and scale together — not hidden in their website catalog.',
      },
      {
        title: 'Certification and sample verification',
        body: 'Private label means your brand takes legal + reputational risk. You need verified GOTS-certified cotton mills, FDA-registered cosmetic labs, CE-marked electronics OEMs — not shell companies on Alibaba.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Nearshore manufacturer discovery',
        body: 'Specify category, certifications, MOQ range, geography. AI searches industrial registries in Poland, Czech Republic, Italy, Portugal, Turkey. Delivers 20+ qualified factories with capacity data.',
      },
      {
        title: 'Sample + prototype RFQ workflow',
        body: 'Email manufacturers with your spec, budget, timeline. They submit quotes via Supplier Portal — pricing, MOQ, sample cost, lead time, variants. All in one structured table.',
      },
      {
        title: 'Multi-language negotiation',
        body: 'Talk to Italian pattern makers in Italian, Turkish mills in Turkish, Polish factories in Polish. Automatic translation preserves context and increases response rate 2-3x.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'gastronomia'],
    ctaTitle: 'Migrating from China?',
    ctaBody: 'Book a nearshore sourcing strategy call. We will map 15-20 alternative manufacturers for your category in Europe + Turkey.',
    interestTag: 'industry_retail',
  },
}

// PL content
const industriesPL: Record<string, IndustryContent> = {
  'produkcja': {
    slug: 'manufacturing',
    heroTitle: 'Automatyzacja AI procurementu dla przemysłu produkcyjnego',
    heroSubtitle:
      'Alternatywni dostawcy surowców, komponentów i MRO — zakwalifikowani pod ISO 9001, IATF 16949, RoHS, REACH. Dual sourcing i dywersyfikacja łańcucha dostaw w tygodniach, nie miesiącach.',
    painPoints: [
      {
        title: 'Ręczne wyszukiwanie dostawców pochłania tydzień zespołu',
        body: 'Znalezienie 5-10 zakwalifikowanych vendorów dla nowej kategorii zajmuje analitykom 30+ godzin — googlowanie, maile, weryfikacja certyfikatów. Procurea dostarcza listę w godzinę.',
      },
      {
        title: 'Zależność od jednego dostawcy to ryzyko łańcucha dostaw',
        body: 'Po COVID i Ukrainie dual sourcing nie jest opcjonalny. Potrzebujesz backup vendorów w nearshore, z odpowiednimi certyfikatami, zanim wystąpi zakłócenie.',
      },
      {
        title: 'Excel-owe bazy dostawców się dezaktualizują',
        body: 'Kontakty tracą aktualność (40%/rok), certyfikaty wygasają, moce tier-2 się przesuwają. Centralny rejestr z enrichmentem AI utrzymuje bazę aktualną.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Zakwalifikowana lista dostawców w minutach',
        body: 'Opisz kategorię (np. "wtrysk tworzyw, PA66, Europa, IATF 16949"). AI przeszukuje 26 języków, weryfikuje możliwości, filtruje po certyfikatach. Dostajesz 20-100 zwalidowanych vendorów.',
      },
      {
        title: 'RFQ do 50 dostawców jednym kliknięciem',
        body: 'Z Procurement add-on: wyślij RFQ w języku dostawcy, śledź odpowiedzi przez Supplier Portal (magic link, bez logowania), auto follow-up do nierespondentów.',
      },
      {
        title: 'Porównanie ofert side-by-side',
        body: 'Cena jednostkowa przy różnych ilościach, MOQ, lead time, Incoterms, certyfikaty — w jednej tabeli. Eksport do PDF dla CFO lub zarządu.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['budownictwo', 'logistyka', 'mro-utrzymanie-ruchu'],
    ctaTitle: 'Gotowy na dywersyfikację bazy dostawców?',
    ctaBody: 'Umów 30-minutowe spotkanie. Pokażemy jak Procurea radzi sobie z Twoją konkretną kategorią (materiały, komponenty, MRO, opakowania).',
    interestTag: 'industry_manufacturing',
  },
  'eventy': {
    slug: 'events',
    heroTitle: 'Sourcing eventowy w 48h — catering, AV, scenografia, gadżety',
    heroSubtitle:
      'Lokalni dostawcy w każdym mieście dla eventów z krótkim deadlinem. AI szuka w lokalnych językach — dostajesz autentyczne lokalne ceny i dostępność, nie szum Google Ads.',
    painPoints: [
      {
        title: 'Sourcing w obcym mieście jest wolny i drogi',
        body: 'Organizujesz event w Berlinie, Barcelonie, Warszawie. Nie znasz lokalnego rynku. Bez kontaktów płacisz 30-50% premię lub ryzykujesz z niesprawdzonymi dostawcami.',
      },
      {
        title: 'Krótki deadline vs długi cykl RFQ',
        body: 'Event za 2 tygodnie. Standardowy proces RFQ trwa 3-4 tygodnie. Obcinasz rogi, tracisz alternatywy, lub przepłacasz znanym vendorom.',
      },
      {
        title: 'Różne kategorie = różne workflow',
        body: 'Catering dla 500 osób, AV, scenografia, obsługa on-site, gadżety — każda kategoria osobno. Żonglowanie 5+ równoległymi RFQ w Excelu się sypie.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Lokalne wyszukiwanie w 26 językach',
        body: 'Wpisz "catering dla 500 osób, Berlin Mitte, 18 grudnia, opcje wegańskie". AI przeszukuje lokalne niemieckie katalogi, zweryfikowane dane, świeże kontakty. Shortlista w 20 minut.',
      },
      {
        title: 'RFQ z wielojęzycznymi szablonami',
        body: 'Wysyłasz RFQ po niemiecku do Berlina, po polsku do Warszawy — automatyczne tłumaczenie. Supplier Portal przyjmuje oferty w ich języku, my tłumaczymy z powrotem dla Twojego zespołu.',
      },
      {
        title: 'Równoległe kampanie dla złożonych eventów',
        body: 'Prowadź kampanie catering, AV, scenografia jednocześnie. Porównuj oferty per kategoria, blokuj najlepsze, idź dalej. Plan Professional = 60 kampanii/mies.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fAutoFollowUp'],
    relatedIndustries: ['gastronomia', 'retail-ecommerce'],
    ctaTitle: 'Masz event za 2 tygodnie?',
    ctaBody: 'Rozpocznij darmową kampanię research teraz. Twoja shortlista lokalnych dostawców będzie gotowa w 20 minut.',
    interestTag: 'industry_events',
  },
  'budownictwo': {
    slug: 'construction',
    heroTitle: 'Procurement dla budownictwa — materiały i podwykonawcy',
    heroSubtitle:
      'Znajdź zakwalifikowanych podwykonawców (HVAC, elektryka, wykończenia) i dostawców materiałów dla Twojego projektu. RFQ do 30+ vendorów naraz, porównanie po cenie, lead time i lokalnych referencjach.',
    painPoints: [
      {
        title: 'Przygotowanie tendera pod presją czasu',
        body: 'Tender publiczny lub prywatny wymaga ofert od 5+ zakwalifikowanych bidderów w 7-14 dni. Tradycyjne outreach to niekończące się rozmowy i maile, często z pominięciem kwalifikowanych vendorów.',
      },
      {
        title: 'Kwalifikacja vendorów specyficzna dla projektu',
        body: 'Każdy projekt ma unikalne wymagania — certyfikaty, ubezpieczenie, lokalność, moce. Potrzebujesz świeżej listy per projekt, nie przestarzałej bazy sprzed roku.',
      },
      {
        title: 'Porównanie cen z tiered quotes',
        body: 'Vendorzy w budowlance kwotują tiered pricing, volume discounts, milestone payments. Porównanie apples-to-apples w Excelu zajmuje godziny per RFQ.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Wyszukiwanie podwykonawców wg kategorii + lokalizacji',
        body: 'Szukaj "podwykonawcy HVAC, osiedle 200-mieszkań, Mazowieckie, ISO 9001, zespół polsko-języczny". AI zwraca 30-50 zakwalifikowanych firm z ostatnimi referencjami.',
      },
      {
        title: 'Bulk RFQ z specyfikacją projektu',
        body: 'Załącz dokumenty tendera, BOQ, plany. Wyślij RFQ do 30+ vendorów jednym kliknięciem. Supplier Portal zbiera strukturalne oferty — bez parsowania PDF, bez chainów maili.',
      },
      {
        title: 'Porównanie ofert z liniami BOQ',
        body: 'Porównaj vendorów po cenie totalnej, per-BOQ-item, lead time, warunkach płatności, certyfikatach, ubezpieczeniu. Eksport PDF dla komisji tenderowej.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fEmailOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'logistyka'],
    ctaTitle: 'Prowadzisz tender w tym miesiącu?',
    ctaBody: 'Umów demo. Zobacz jak Procurea radzi sobie z podwykonawcami RFQ dla Twojego typu projektu (mieszkalny, komercyjny, przemysłowy, infrastruktura).',
    interestTag: 'industry_construction',
  },
  'retail-ecommerce': {
    slug: 'retail-ecommerce',
    heroTitle: 'Sourcing private label dla marek retail i e-commerce',
    heroSubtitle:
      'Znajdź producentów private label w Europie, Turcji i nearshore. Migruj z Chin z 18+ alternatywnymi fabrykami w tygodniach, nie miesiącach. Zweryfikowane certyfikaty CE, FDA, GOTS, OEKO-TEX.',
    painPoints: [
      {
        title: 'Chiny to już nie oczywisty wybór',
        body: 'Cła, napięcia, koszty wysyłki i presja ESG pchają marki D2C do nearshore. Ale znalezienie EU/TR alternatyw dla kosmetyków, odzieży, elektroniki zajmuje tygodnie — marki się poddają i zostają w Alibaba.',
      },
      {
        title: 'Negocjacja MOQ dla małych marek',
        body: 'Rosnąca marka D2C nie może zaangażować się w MOQ 10,000 sztuk. Potrzebujesz producentów elastycznych w minimach, chętnych do prototypowania i skalowania razem — nie ukrytych w katalogu strony internetowej.',
      },
      {
        title: 'Weryfikacja certyfikatów i sampli',
        body: 'Private label = Twoja marka bierze ryzyko prawne i reputacyjne. Potrzebujesz zweryfikowanych GOTS-certyfikowanych przędzalni, FDA-registered labów kosmetycznych, CE-markowanych OEM elektroniki — nie shell companies na Alibaba.',
      },
    ],
    howProcureaHelps: [
      {
        title: 'Odkrywanie producentów nearshore',
        body: 'Określ kategorię, certyfikaty, zakres MOQ, geografię. AI przeszukuje rejestry przemysłowe w Polsce, Czechach, Włoszech, Portugalii, Turcji. Dostarcza 20+ zakwalifikowanych fabryk z danymi o mocach.',
      },
      {
        title: 'Workflow RFQ z samplami i prototypami',
        body: 'Wyślij maile producentom z Twoją specyfikacją, budżetem, terminem. Oni składają oferty przez Supplier Portal — ceny, MOQ, koszt sampli, lead time, warianty. Wszystko w jednej tabeli.',
      },
      {
        title: 'Negocjacja wielojęzyczna',
        body: 'Rozmawiaj z włoskimi krawcami po włosku, tureckimi przędzalniami po turecku, polskimi fabrykami po polsku. Automatyczne tłumaczenie zachowuje kontekst i zwiększa response rate 2-3x.',
      },
    ],
    topFeatures: ['fAiSourcing', 'fMultilingualOutreach', 'fSupplierPortal', 'fOfferComparison'],
    relatedIndustries: ['produkcja', 'gastronomia'],
    ctaTitle: 'Migrujesz z Chin?',
    ctaBody: 'Umów spotkanie strategiczne. Zmapujemy 15-20 alternatywnych producentów dla Twojej kategorii w Europie + Turcji.',
    interestTag: 'industry_retail',
  },
}

export const industries = isEN ? industriesEN : industriesPL

// Get content by slug — tries both PL and EN slug keys
export function getIndustry(slug: string): IndustryContent | null {
  return industries[slug] || null
}

// Map EN slug → PL key and vice-versa for cross-lookup
export const SLUG_ALIASES: Record<string, string> = {
  'manufacturing': 'produkcja',
  'events': 'eventy',
  'construction': 'budownictwo',
  'retail-ecommerce': 'retail-ecommerce',
}

export function resolveSlug(slug: string): string {
  // If it's an EN slug, map to PL key (our content files use PL keys)
  return SLUG_ALIASES[slug] || slug
}
