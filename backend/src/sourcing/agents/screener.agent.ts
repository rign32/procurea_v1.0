import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';
import {
  detectCertificateType,
  type ExtractedCertificate,
} from '../../suppliers/certificate-types';

/**
 * Product context provided by the pipeline's Phase 0 analysis.
 * Used to distinguish PRODUCERS of a product from companies that merely USE it.
 */
export interface ProductContext {
    coreProduct: string;              // "farba proszkowa / powder coating paint"
    productCategory: string;          // "Paints & Coatings"
    specAttributes: string[];         // ["RAL 9005"] — ambiguous terms
    positiveSignals: string[];        // ["paint manufacturer", "powder coating", "lakiernia"]
    negativeSignals: string[];        // ["door manufacturer", "window frames", "roofing"]
    disambiguationNote: string;       // Explanation for downstream agents
    productTranslations: Record<string, string>;  // {"de": "Pulverlack RAL 9005"}
    // Extended fields for strategy diversification
    industryAssociations?: string[];  // ["European Powder Coating Association"]
    majorTradeShows?: string[];       // ["PaintExpo", "European Coatings Show"]
    alternativeNames?: string[];      // ["powder paint", "thermosetting paint"]
    supplyChainPosition?: string;     // "raw material" | "component" | "finished good"
}

/**
 * Screener Agent = merged Explorer + Analyst
 * Single Gemini call that:
 *   1. Determines if page belongs to a real manufacturer (Explorer role)
 *   2. Extracts structured company data and scores match (Analyst role)
 *   3. Validates PRODUCES-vs-USES distinction using product context
 *
 * This saves 1 Gemini round-trip per URL while maintaining the same quality.
 */
@Injectable()
export class ScreenerAgentService {
    private readonly logger = new Logger(ScreenerAgentService.name);

    constructor(private readonly geminiService: GeminiService) { }

    private static readonly LANGUAGE_NAMES: Record<string, string> = {
        pl: 'polskim', en: 'English', de: 'Deutsch', fr: 'français',
        it: 'italiano', es: 'español', cs: 'čeština', nl: 'Nederlands',
        sv: 'svenska', da: 'dansk', ro: 'română', hu: 'magyar',
        pt: 'português', fi: 'suomi', ja: '日本語', ko: '한국어', zh: '中文',
    };

    async execute(
        url: string,
        content: string,
        rfqData: any,
        productContext?: ProductContext,
        userLanguage: string = 'pl',
        requiredCertificates?: string[],
        sourcingContext?: { industry?: string; sourcingMode?: 'product' | 'service' | 'mixed'; city?: string },
    ): Promise<{
        company_type: 'PRODUCENT' | 'HANDLOWIEC' | 'NIEJASNY';
        company_type_confidence: number;
        company_type_evidence: string;
        is_relevant: boolean;
        page_type: string;
        reason: string;
        capability_match_score: number;
        match_reason: string;
        risks: string[];
        extracted_data: {
            company_name: string;
            vat_id?: string;
            address?: string;
            country?: string;
            city?: string;
            email?: string;
            phone?: string;
            website?: string;
            specialization?: string;
            certificates?: string[];
            certificates_structured?: ExtractedCertificate[];
            employee_count?: string;
        };
        mentioned_companies?: { name: string; url?: string }[];
        website_trust_score?: number;
        trust_signals?: any;
    }> {
        this.logger.log(`Executing Screener Agent for ${url}...`);

        // Build product context block for prompt
        let productContextBlock = '';
        if (productContext) {
            productContextBlock = `
=== KONTEKST PRODUKTU (KRYTYCZNY) ===
PRODUKT DOCELOWY: ${productContext.coreProduct}
KATEGORIA: ${productContext.productCategory}
POZYCJA W ŁAŃCUCHU DOSTAW: ${productContext.supplyChainPosition || 'N/A'}
ATRYBUTY SPECYFIKACJI (mogą być niejednoznaczne): ${productContext.specAttributes.join(', ') || 'brak'}

SYGNAŁY POZYTYWNE (firma PRODUKUJE/SPRZEDAJE ten produkt):
${productContext.positiveSignals.map(s => `  ✅ ${s}`).join('\n')}

SYGNAŁY NEGATYWNE (firma NIE JEST dostawcą tego produktu):
${productContext.negativeSignals.map(s => `  ❌ ${s}`).join('\n')}

UWAGA DISAMBIGUACYJNA: ${productContext.disambiguationNote}

=== KRYTYCZNE REGUŁY WALIDACJI PRODUKTOWEJ ===

REGUŁA 1 — PRODUKUJE vs UŻYWA JAKO SUROWIEC:
Firma która KUPUJE ten produkt jako input do SWOJEJ produkcji → is_relevant: false
Przykłady:
- Szukamy "granulat tworzywowy" → firma produkuje RURY z granulatu → is_relevant: false (KUPUJE granulat, nie sprzedaje)
- Szukamy "stal nierdzewna" → firma produkuje ZBIORNIKI ze stali → is_relevant: false (KUPUJE stal)
- Szukamy "farba proszkowa RAL 9005" → producent drzwi malowanych tą farbą → is_relevant: false (KUPUJE farbę)

REGUŁA 2 — PRODUKUJE PRODUKT vs PRODUKUJE MASZYNY DO PRODUKTU:
Firma która produkuje MASZYNY/URZĄDZENIA do wytwarzania tego produktu → is_relevant: false
Przykłady:
- Szukamy "granulat tworzywowy" → firma produkuje MASZYNY do granulacji → is_relevant: false (sprzedaje MASZYNY, nie granulat)
- Szukamy "olej hydrauliczny" → firma produkuje POMPY hydrauliczne → is_relevant: false (sprzedaje SPRZĘT, nie olej)
- Szukamy "beton" → firma produkuje BETONIARKI → is_relevant: false (sprzedaje MASZYNY, nie beton)

REGUŁA 3 — SUROWIEC vs WYRÓB GOTOWY:
${productContext.supplyChainPosition === 'raw material' ? `
TEN PRODUKT JEST SUROWCEM. Szukamy PRODUCENTÓW/DOSTAWCÓW surowca.
ODRZUĆ firmy, które:
- Przetwarzają ten surowiec w gotowe wyroby (rury, opakowania, profile, itp.)
- Produkują maszyny do obróbki tego surowca
- Używają tego surowca w swojej produkcji

AKCEPTUJ firmy, które:
- Wytwarzają/produkują sam surowiec (producent granulatu, rafineria, huta)
- Sprzedają/dystrybuują surowiec (dystrybutor, handlowiec surowcami)
- Recyklingują/regranulują surowiec (recykler)
` : `
Produkt NIE jest surowcem — stosuj standardowe reguły dopasowania.
`}

Jeśli firma to producent MASZYN lub WYROBÓW GOTOWYCH z tego materiału:
  is_relevant: false, page_type: "Wrong Product Manufacturer", capability_match_score: 0

REGUŁA 4 — PRODUKUJE PRODUKT vs PRODUKUJE PRODUKT KOMPLEMENTARNY/WSPIERAJĄCY:
Firma która produkuje produkty KOMPLEMENTARNE, WSPOMAGAJĄCE, lub POWIĄZANE z szukanym produktem,
ale NIE sam produkt → is_relevant: false
Przykłady:
- Szukamy "kontroler IoT" → firma produkuje "szyfrowanie dla IoT" → is_relevant: false (komplementarny)
- Szukamy "olej hydrauliczny" → firma produkuje "napędy hydrauliczne" → is_relevant: false (UŻYWA olej)
- Szukamy "granulat tworzywowy" → firma produkuje "barwniki do tworzyw" → is_relevant: false (dodatek)
- Szukamy "farba proszkowa" → firma produkuje "pistolety do malowania" → is_relevant: false (sprzęt)
- Szukamy "klej przemysłowy" → firma produkuje "dozowniki kleju" → is_relevant: false (sprzęt)

Kluczowa różnica: firma musi WYTWARZAĆ lub SPRZEDAWAĆ dokładnie TEN produkt.
"Rozwiązania dla X", "komponenty do X", "oprogramowanie do X" → to NIE jest X.
`;
        }

        // Build RFQ data block — use structured context if available, otherwise fallback to JSON
        const rfqBlock = productContext
            ? `PRODUKT: ${productContext.coreProduct}\nKATEGORIA: ${productContext.productCategory}`
            : `DANE RFQ:\n${JSON.stringify(rfqData)}`;

        const isServiceMode = sourcingContext?.sourcingMode === 'service' || sourcingContext?.sourcingMode === 'mixed';
        const serviceOverrideBlock = isServiceMode ? `
=== TRYB SERVICE SOURCING (${sourcingContext?.sourcingMode?.toUpperCase()}) — NADRZĘDNE REGUŁY ===
Klient szuka WYKONAWCÓW USŁUG (branża: ${sourcingContext?.industry || 'general'}${sourcingContext?.city ? `, lokalizacja: ${sourcingContext.city}` : ''}).

UWAGA — te reguły NADPISUJĄ standardową logikę PRODUCENT/HANDLOWIEC:
1. PRODUCENT w trybie SERVICE = firma świadcząca daną usługę.
   Sygnały pozytywne: "świadczymy usługi", "wykonujemy", "oferujemy", "we offer services",
   "contractors", "we specialize in", "firma cateringowa", "event agency", "HVAC contractor",
   portfolio realizacji, case studies, licencje/uprawnienia zawodowe, cennik usług.
2. HANDLOWIEC w trybie SERVICE = agencja pośrednicząca / platforma rezerwacji.
3. REGUŁY 1-4 Z KONTEKSTU PRODUKTU (PRODUCES-vs-USES, surowiec-vs-wyrób) NIE OBOWIĄZUJĄ.
4. Odrzucaj TYLKO e-commerce towarów, portale/katalogi, firmy bez oferty usługowej.
5. Dla events: firma MUSI obsługiwać lokalnie w podanym mieście/regionie.
` : '';

        const systemPrompt = `
Jesteś Autonomicznym Skautem i Analitykiem Przemysłowym (Industrial Screener & Analyst).
JĘZYK: Odpowiadaj WYŁĄCZNIE w języku ${ScreenerAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}. Wszystkie pola tekstowe MUSZĄ być w języku ${ScreenerAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.

Masz TRZY zadania w jednym kroku:

=== KLASYFIKACJA FIRMY (KRYTYCZNE — wykonaj NAJPIERW) ===

Określ typ firmy na podstawie treści strony. SĄ TYLKO 3 KATEGORIE:

PRODUCENT — firma SAMA WYTWARZA produkty:
  Sygnały: "zakład produkcyjny", "fabryka", "linia produkcyjna", "produkujemy",
           "manufacturing", "Herstellung", "wir produzieren", "our factory",
           "Produktionsstandort", "production facility", "usine de production",
           "impianto di produzione", "eigen productie", "we manufacture",
           "our production", "zakład chemiczny", "synteza", "linia technologiczna",
           własne produkty z własnymi markami, opisy procesów technologicznych,
           zdjęcia hal produkcyjnych, maszyn, laboratoriów,
           jeden producent z własnymi produktami,
           karty techniczne (TDS/SDS), własny katalog produktów ze specyfikacjami,
           opisy procesów R&D, laboratoria badawcze, kontrola jakości

REGUŁA: Firma posiadająca WŁASNY katalog produktów z kartami technicznymi
(TDS, SDS, specyfikacje techniczne) = PRODUCENT z confidence >= 75.

HANDLOWIEC — firma ODSPRZEDAJE produkty innych (dystrybutor, sklep, retailer, hurtownia,
             e-commerce, pośrednik — to JEDNO I TO SAMO z perspektywy sourcingu):
  Sygnały: "dystrybutor", "sklep", "shop", "koszyk", "dodaj do koszyka", "kup teraz",
           "buy now", "add to cart", "cena brutto/netto", "autoryzowany dealer",
           "w ofercie mamy produkty firmy X, Y, Z", "distributor", "reseller",
           wiele marek w jednym miejscu, porównywarka cen, marketplace,
           "reprezentujemy", "jesteśmy wyłącznym przedstawicielem",
           domena zawiera "sklep", "shop", "store"

NIEJASNY — brak wystarczających dowodów na którykolwiek typ.
  UWAGA: Niejasny to TYMCZASOWY status — wymaga pogłębionego researchu.

Ustaw company_type_confidence: 0-100 (jak pewny jesteś klasyfikacji).
Ustaw company_type_evidence: krótki cytat ze strony lub obserwacja uzasadniająca klasyfikację.

=== ZADANIE 1 — SCREENING ===
Oceń czy strona należy do REALNEGO PRODUCENTA/DOSTAWCY.
Typy stron: "Manufacturer", "Distributor", "Directory", "Blog/Article", "Wrong Product Manufacturer", "Irrelevant"
Jeśli strona to katalog, blog, artykuł lub inna nie-firmowa strona → is_relevant: false.

=== ZADANIE 2 — DIRECTORY MINING (tylko jeśli page_type = "Directory") ===
Jeśli strona to PORTAL BRANŻOWY / KATALOG FIRM (np. Plastech, tworzywa.pl, Europages):
  - is_relevant: false (portal sam w sobie NIE jest dostawcą)
  - Ale WYLISTUJ firmy wymienione na stronie, które mogą być producentami docelowego produktu
  - Podaj ich nazwy i URL-e STRON FIRMOWYCH (NIE URL profilu na portalu!)
  - Jeśli na stronie jest link do strony firmy (np. "www.mkkolibri.pl"), użyj TEGO linku
  - Jeśli brak bezpośredniego linku do strony firmy, zostaw url jako pusty string ""
  - Limit: max 20 firm, tylko te powiązane z docelowym produktem
  - Zwróć w polu "mentioned_companies"

=== ZADANIE 3 — ANALIZA ===
Jeśli strona jest relevantna (is_relevant: true), wydobądź TWARDE DANE o dostawcy.
Jeśli is_relevant: false, zwróć puste extracted_data i capability_match_score: 0.
${serviceOverrideBlock}${productContextBlock}
DANE WEJŚCIOWE:
${rfqBlock}

URL: ${url}

TREŚĆ STRONY:
${content.substring(0, 25000)}

=== WYMAGANE CERTYFIKATY ===
${requiredCertificates?.length ? `Klient wymaga: ${requiredCertificates.join(', ')}
Jeśli firma posiada wymagane certyfikaty → BONUS +5-10 do capability_match_score.
Nie KARZ za brak certyfikatów na stronie (firma może je mieć ale nie wymieniać).` : 'Brak wymaganych certyfikatów.'}

=== SKALA OCENY capability_match_score (TYLKO DOPASOWANIE PRODUKTOWE) ===
80-100: Firma ma ten dokładny produkt w ofercie (dowody na stronie)
60-79:  Firma jest w odpowiedniej branży, prawdopodobnie ma ten produkt
40-59:  Niejasne — powiązanie tangencjalne
0-39:   Zła branża — firma jedynie wspomina/używa produktu, ale go nie produkuje
UWAGA: company_type jest NIEZALEŻNY od capability_match_score.
Handlowiec może mieć score 90 (bo sprzedaje dokładnie ten produkt).
Producent może mieć score 40 (bo jest w powiązanej branży).

=== TRUDNE PRZYPADKI (Borderline) ===
Wielu REALNYCH PRODUCENTÓW ma kiepskie strony internetowe. NIE KARZ za:
- Brak nowoczesnego designu strony (mały producent = normalne)
- Krótkie/minimalne opisy produktów
- Brak certyfikatów na stronie (mogą istnieć, ale nie są wymienione)
- Strony w jednym języku (mały producent krajowy)
- Mało treści na stronie (niektóre firmy mają minimalistyczne strony)

NATOMIAST ZDECYDOWANIE KAR za:
- "dodaj do koszyka", "kup teraz", "buy now", "add to cart"
- Strona z cenami wielu produktów różnych marek
- URL/domena zawiera "sklep", "shop", "store", "buy"
- Porównywarka cen, marketplace
- "dystrybutor", "reseller", "autoryzowany dealer"
- Wiele marek/producentów w ofercie
- Artykuły blogowe/newsowe o produkcie (nie producent)
- Strony spamowe lub SEO-baitowe

WAŻNE: Domena zawierająca "sklep" lub "shop" = SILNY sygnał handlowca.
Przykłady:
- "pokrycia-dachowe-sklep.pl" → company_type: "HANDLOWIEC"
- "styropian-sklep.pl" → company_type: "HANDLOWIEC"
- "cherbsloeh.pl" pisze na stronie "dystrybutor" → company_type: "HANDLOWIEC"

GDY WĄTPLIWOŚCI (score 40-59): Ustaw is_relevant: true z niższym score.
Lepiej przepuścić wątpliwy wynik do etapu enrichment niż odrzucić potencjalnego producenta.
Nasz kolejny etap (enrichment + auditor) zweryfikuje firmę dokładniej.

INSTRUKCJE EKSTRAKCJI (tylko jeśli is_relevant: true):
1. Przeanalizuj treść pod kątem dopasowania do RFQ.
2. Wydobądź dane firmy. Jeśli nazwy firmy nie ma wprost (np. w stopce), UŻYJ NAZWY DOMENY jako nazwy firmy (np. "granulat.com" -> "Granulat"). NIE zwracaj "Unknown" ani "Należy ustalić".
3. Lokalizacja: Jeśli brak adresu, wywnioskuj kraj z domeny (.pl -> Polska, .de -> Niemcy) lub numeru telefonu (+48 -> Polska). Wpisz miasto, jeśli znajdziesz.
4. Certyfikaty — WAŻNE, wymagana STRUKTURALNA ekstrakcja:
   Znajdź każdy certyfikat wymieniony na stronie (ISO 9001, ISO 14001, IATF 16949, AS 9100,
   ISO 13485, CE, MDR, RoHS, REACH, HACCP, BRCGS, IFS, FSC, BSCI, Organic EU, MSC, Kosher,
   Halal, Fair Trade i in.) i dla KAŻDEGO zwróć obiekt w polu "certificates_structured":
     - code: etykieta jak na stronie, np. "ISO 9001:2015"
     - issuer: nazwa jednostki certyfikującej (TÜV SÜD, DEKRA, Bureau Veritas, DNV, SGS,
       Intertek, Polskie Centrum Badań i Certyfikacji, itp.) — jeśli jest wymieniona
     - certNumber: numer rejestracyjny certyfikatu (zwykle koło pieczęci albo pod nazwą
       certyfikatu, np. "12 100 45678", "PL-1234-2024")
     - issuedAt: data wydania (format ISO YYYY-MM-DD) — jeśli podana
     - validUntil: data ważności (format ISO YYYY-MM-DD) — jeśli podana
     - documentUrl: pełny URL do pliku PDF/obrazu certyfikatu na stronie (szukaj linków
       typu /certyfikat.pdf, /cert/iso9001.pdf, /uploads/*.pdf)
     - evidenceQuote: krótki fragment tekstu ze strony (max 120 znaków), gdzie cert był
       wzmiankowany — dla audytu
   NIE WYMYŚLAJ danych — jeśli numeru / daty / URL-a nie ma na stronie, POMIŃ te pola
   (nie ustawiaj na puste stringi). Zachowaj też listę skrótów w "certificates" (string[])
   dla kompatybilności wstecznej.
5. Specjalizacja: Krótkie zdanie opisujące co robią (np. "Wtrysk tworzyw sztucznych i budowa form").
6. Wielkość: Szukaj haseł typu "employees", "staff", "pracowników". Jeśli brak, oszacuj lub zostaw pusty string.

FORMAT WYJŚCIOWY (JSON Only):
{
  "company_type": "PRODUCENT|HANDLOWIEC|NIEJASNY",
  "company_type_confidence": 0-100,
  "company_type_evidence": "Cytat lub obserwacja uzasadniająca klasyfikację",
  "is_relevant": true,
  "page_type": "Manufacturer",
  "reason": "Krótkie uzasadnienie screeningu",
  "capability_match_score": 0-100,
  "match_reason": "Zwięzłe uzasadnienie oceny dopasowania (1 zdanie).",
  "website_trust_score": 0-100,
  "trust_signals": {
    "has_product_catalog": true,
    "has_company_history": true,
    "has_certifications_page": false,
    "has_contact_form": true,
    "content_depth": "rich|moderate|minimal",
    "languages_count": 1,
    "is_professional_design": true
  },
  "risks": ["Ryzyko 1", "Ryzyko 2"],
  "extracted_data": {
    "company_name": "Pełna nazwa lub Domena (z dużej litery)",
    "vat_id": "Numer NIP/VAT (jeśli znaleziono)",
    "address": "Ulica, Miasto, Kraj",
    "country": "Kod kraju (PL, DE, etc.) lub pełna nazwa",
    "city": "Miasto (jeśli znaleziono)",
    "email": "Email kontaktowy",
    "phone": "Telefon",
    "website": "URL strony głównej",
    "specialization": "Krótki opis działalności (max 5-7 słów)",
    "certificates": ["ISO 9001", "IATF 16949"],
    "certificates_structured": [
      {
        "code": "ISO 9001:2015",
        "issuer": "TÜV SÜD",
        "certNumber": "12 100 45678",
        "issuedAt": "2023-01-15",
        "validUntil": "2026-01-14",
        "documentUrl": "https://example.com/certyfikaty/iso9001.pdf",
        "evidenceQuote": "Posiadamy certyfikat ISO 9001:2015 wydany przez TÜV SÜD nr 12 100 45678"
      }
    ],
    "employee_count": "Liczba pracowników (np. '50-100' lub '500+')"
  },
  "mentioned_companies": [
    {"name": "Nazwa Firmy", "url": "https://firmowa-strona.pl"}
  ]
}

=== WEBSITE TRUST SCORE (website_trust_score 0-100) ===
Oceń WIARYGODNOŚĆ I PROFESJONALIZM strony firmy:
- has_product_catalog (dedykowany katalog z parametrami/specyfikacjami): +20
- has_company_history (sekcja "O nas"/"About Us" z historią firmy): +15
- has_certifications_page (certyfikaty z numerami/datami ważności): +15
- has_contact_form (formularz kontaktowy lub pełne dane: adres+tel+email): +10
- content_depth rich (szczegółowe opisy produktów, dane techniczne): +15 / moderate: +8 / minimal: +3
- languages_count >= 2 (strona w wielu językach = profesjonalizm): +15
- is_professional_design (nowoczesny layout, responsive, czytelny): +10
UWAGA: Nie karz za brak nowoczesnego designu — starsze strony firmowe mogą należeć do solidnych producentów.
UWAGA: "mentioned_companies" zwracaj TYLKO gdy page_type = "Directory". W pozostałych przypadkach pomiń to pole.

JĘZYK WYJŚCIA: Wszystkie pola tekstowe (reason, match_reason, risks, company_type_evidence,
specialization, extracted_data.specialization) MUSZĄ być w języku ${ScreenerAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.
Nazwy firm pozostaw oryginalne — NIE tłumacz nazw własnych.
        `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            return parseAiJson(responseText);
        } catch (e) {
            this.logger.error('Failed to execute Screener Agent', e);

            // FALLBACK: Use productContext signals for smarter keyword matching when available
            const baseKeywords = ['manufacturer', 'producent', 'factory', 'fabryka', 'cnc', 'machining', 'obróbka'];
            const positiveKeywords = productContext?.positiveSignals?.length
                ? [...baseKeywords, ...productContext.positiveSignals]
                : baseKeywords;

            const contentLower = content.toLowerCase();
            const hasPositive = positiveKeywords.some(k => contentLower.includes(k.toLowerCase()));

            // If product context exists, also check for negative signals (wrong product)
            let hasNegative = false;
            if (productContext?.negativeSignals?.length) {
                hasNegative = productContext.negativeSignals.some(k => contentLower.includes(k.toLowerCase()));
            }

            const isRelevant = hasPositive && !hasNegative;

            // Fallback company_type classification
            const shopSignals = ['sklep', 'shop', 'store', 'koszyk', 'cart', 'dystrybutor', 'distributor', 'reseller'];
            const hasShopSignal = shopSignals.some(k => contentLower.includes(k));
            const manufacturerSignals = ['producent', 'manufacturer', 'fabryka', 'factory', 'zakład produkcyjny', 'manufacturing'];
            const hasMfgSignal = manufacturerSignals.some(k => contentLower.includes(k));

            const fallbackCompanyType = hasShopSignal ? 'HANDLOWIEC' as const
                : (hasMfgSignal ? 'PRODUCENT' as const : 'NIEJASNY' as const);

            // Score based on number of positive keyword hits (range 30-65) instead of flat 50
            const matchCount = positiveKeywords.filter(k => contentLower.includes(k.toLowerCase())).length;
            const fallbackScore = isRelevant ? Math.min(30 + matchCount * 8, 65) : 0;

            return {
                company_type: fallbackCompanyType,
                company_type_confidence: hasShopSignal || hasMfgSignal ? 60 : 20,
                company_type_evidence: 'Fallback keyword match',
                is_relevant: isRelevant,
                page_type: isRelevant ? 'Manufacturer (Fallback)' : (hasNegative ? 'Wrong Product Manufacturer (Fallback)' : 'Irrelevant'),
                reason: 'AI unavailable, fallback keyword match.',
                capability_match_score: fallbackScore,
                match_reason: `AI unavailable. Fallback keyword match (${matchCount} signals, score=${fallbackScore}).`,
                website_trust_score: 30,
                risks: [],
                extracted_data: {
                    company_name: 'Detected Supplier',
                    country: 'Unknown',
                },
            };
        }
    }
}
