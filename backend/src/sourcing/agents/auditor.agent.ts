import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';

@Injectable()
export class AuditorAgentService {
    private readonly logger = new Logger(AuditorAgentService.name);

    constructor(private readonly geminiService: GeminiService) { }

    /**
     * Extract core domain name for validation (without TLD and www)
     * e.g., "https://www.granulat.com.pl" -> "granulat"
     */
    private extractCoreDomainName(url: string): string {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname.replace(/^www\./, '');
            // Get the main part (before first dot or the whole thing for short domains)
            const parts = hostname.split('.');
            // Return the first meaningful part
            return parts[0].toLowerCase();
        } catch (e) {
            return url.toLowerCase();
        }
    }

    private static readonly LANGUAGE_NAMES: Record<string, string> = {
        pl: 'polskim', en: 'English', de: 'Deutsch', fr: 'français',
        it: 'italiano', es: 'español', cs: 'čeština', nl: 'Nederlands',
        sv: 'svenska', da: 'dansk', ro: 'română', hu: 'magyar',
        pt: 'português', fi: 'suomi', ja: '日本語', ko: '한국어', zh: '中文',
    };

    async execute(
        websiteData: any,
        registryData: any,
        userLanguage: string = 'pl',
        productContext?: {
            coreProduct: string;
            positiveSignals: string[];
            negativeSignals: string[];
            supplyChainPosition?: string;
            disambiguationNote?: string;
            productCategory?: string;
        },
        sourcingContext?: { industry?: string; sourcingMode?: 'product' | 'service' | 'mixed'; city?: string },
    ): Promise<any> {
        this.logger.log('Executing Auditor Agent - LEAD CLASSIFIER MODE...');

        // Pre-validation checks
        const websiteDomain = websiteData?.website || websiteData?.url || '';
        const coreDomainName = this.extractCoreDomainName(websiteDomain);
        const companyName = (websiteData?.company_name || registryData?.name || '').toLowerCase();

        this.logger.log(`Validating: Domain="${coreDomainName}" vs Company="${companyName}"`);

        const systemPrompt = `
Jesteś Specjalistą ds. Klasyfikacji Dostawców (Lead Classifier).

CEL TWOJEJ PRACY: stworzyć SHORTLISTĘ potencjalnych dostawców do skontaktowania się przez RFQ.
NIE jesteś bramkarzem. Klient sam zdecyduje z kim się skontaktuje na podstawie scoringu.
Producent NIE musi mieć każdego produktu wymienionego na stronie — większość firm produkujących
na zamówienie listuje TYLKO przykładowe portfolio.

ZASADA NACZELNA: jak masz wątpliwość → PRZEPUŚĆ z odpowiednim match_score.
Tylko evidently-wrong przypadki (blog, fałszywka, kompletnie inna branża) → REJECTED.

=== KLASYFIKACJA TYPU FIRMY (jedyny twardy filtr — i tylko gdy klient pyta o producenta) ===

Screener zaklasyfikował firmę jako: ${websiteData.company_type || 'NIEJASNY'}

Zweryfikuj klasyfikację. Pole "verified_company_type" w golden_record MUSI być wypełnione: "PRODUCENT" | "HANDLOWIEC" | "NIEJASNY".

UWAGA: niejednoznaczne przypadki (np. firma która produkuje swoje + sprzedaje cudze) zostaw jako PRODUCENT — nie HANDLOWIEC. Klient dopyta przez RFQ.

=== ZASADY SOFT-WALIDACJI (warnings, NIE REJECTED) ===

Niektóre rzeczy są podejrzane, ale NIE są podstawą do odrzucenia. Dodaj je do "warnings" tablicy w odpowiedzi, ale supplier i tak idzie na shortlistę z odpowiednim match_score:
- Domena nie pasuje 1:1 do nazwy firmy (akronimy/holdingi/marki to normalna rzecz — "tecpol.pl" = "Technoplast Polska")
- TLD nie pasuje 1:1 do kraju (np. ".ro" subdomena chińskiej firmy = marketing landing page; firma wciąż realna)
- Strona po angielsku ale firma w Chinach → globalne firmy mają wielojęzyczne sajty
- Firma ma portfolio wielu producentów → może być integrator/CDMO, nie czysty handlowiec — przepuść z dopiskiem warning

REJECTED tylko dla skrajnych przypadków:
- URL to wyraźnie blog/artykuł/news (ścieżka /blog/, /news/, /article/, /post/, /research/, /publication/, /paper/)
- Strona to portal/agregator/katalog z LISTINGAMI wielu firm (ChemicalBook, Pharmacompass, OZON, Alibaba listing page)
- Dane EVIDENTLY sfabrykowane (np. firma "Google LLC" na domenie farmaceutycznej)
- Strona z totalnie innej branży niż docelowa kategoria (np. szukamy farma → IT consulting / SaaS / e-commerce niepowiązany)
- Strona zamknięta / błąd 404 / nieistniejąca firma

DANE ZE STRONY WWW (Enrichment Agent output):
${JSON.stringify(websiteData, null, 2)}

DANE Z REJESTRU (jeśli dostępne):
${JSON.stringify(registryData, null, 2)}

DOMENA DO WALIDACJI: ${websiteDomain}
RDZEŃ DOMENY: ${coreDomainName}

=== ZASADA NACZELNA — PROGI ODRZUCENIA ===
Reject (REJECTED) TYLKO gdy zachodzi jeden z poniższych:
1. Blog/artykuł/news (URL zawiera /blog/, /news/, /article/, /post/, /research/)
2. Strona ewidentnie z innej branży niż docelowa kategoria (np. szukamy pharma → IT consulting)
3. Dystrybutor / sklep / hurtownia (gdy klient szuka PRODUCENTA)
4. Firma kompletnie zmyślona / dane sfabrykowane (nierealna kombinacja)
5. Strona to portal/agregator/katalog z listingami wielu firm (np. ChemicalBook, Pharmacompass)

We wszystkich INNYCH przypadkach → APPROVED z odpowiednim match_score (skala 0-100):
- 90-100: silne dopasowanie (kategoria pasuje + ślady produktu na stronie + wiarygodny producent)
- 70-89: dobre dopasowanie (producent w pasującej kategorii, brak explicit produktu, ale kategoria zgodna)
- 50-69: prawdopodobne dopasowanie (producent o szerszej specjalizacji obejmującej kategorię)
- 30-49: spekulatywne (producent w pokrewnej branży, dalekie dopasowanie)
- <30: bardzo słabe (rzadko, ale przepuszczasz dla kompletności)

NIE WYMAGAJ explicit wymienienia konkretnego produktu na stronie. Producenci API typowo robią
200+ molekuł i listują tylko przykładowe portfolio. Klient zapyta przez RFQ czy mają tę molekułę.

NIE ODRZUCAJ za:
- Brak explicit produktu na stronie ("nie wymienia Metforminu" → przepuść z match_score 50-70)
- Domenę nieidealnie pasującą do kraju ("ro.firma.com a firma w Chinach" → przepuść)
- Specjalizację "zbyt szeroką" ("API manufacturer" → 70+ score, bo to dokładnie pasuje do API search)
- Nazwy domeny nieidealnie pasujące do firmy (akronimy, marki, holdingi są normalne)

Pamiętaj: nasi klienci kontaktują się z firmami z listy aby się dowiedzieć czego się nie da
sprawdzić ze strony. Twoim zadaniem jest dostarczyć taką listę, nie ją wyfiltrować na 0.

${sourcingContext?.sourcingMode === 'service' || sourcingContext?.sourcingMode === 'mixed' ? `
=== TRYB SERVICE SOURCING (${sourcingContext?.sourcingMode.toUpperCase()}) — NADRZĘDNE REGUŁY ===
Klient szuka WYKONAWCÓW USŁUG (branża: ${sourcingContext?.industry || 'general'}${sourcingContext?.city ? `, miasto: ${sourcingContext.city}` : ''}).

AKCEPTUJ firmy świadczące usługi z portfolio realizacji, licencjami zawodowymi, obsługą wymaganej lokalizacji.
ODRZUĆ TYLKO: e-commerce bez usług, blogi/portale/katalogi, firmy z innych branż, firmy poza regionem bez oddziału lokalnego.
UWAGA: Reguły "PRODUCES-vs-USES" i "surowiec-vs-wyrób gotowy" NIE OBOWIĄZUJĄ w trybie service.
` : ''}
=== KONTEKST PRODUKTU (KRYTYCZNY) ===
PRODUKT DOCELOWY: ${productContext?.coreProduct || 'N/A'}
KATEGORIA: ${productContext?.productCategory || 'N/A'}
POZYCJA W ŁAŃCUCHU DOSTAW: ${productContext?.supplyChainPosition || 'N/A'}
UWAGA: ${productContext?.disambiguationNote || 'brak'}

SYGNAŁY POZYTYWNE (firma produkuje/sprzedaje ten produkt):
${productContext?.positiveSignals?.map(s => `  ✅ ${s}`).join('\n') || 'brak'}

SYGNAŁY NEGATYWNE (firma NIE jest dostawcą tego produktu):
${productContext?.negativeSignals?.map(s => `  ❌ ${s}`).join('\n') || 'brak'}

=== KLASYFIKACJA PRODUKTOWA (SCORING, NIE BLOKADA) ===

Oceń jak prawdopodobne jest że firma produkuje (lub może produkować na zamówienie) szukany produkt:

KATEGORIA i SPECJALIZACJA — czy pasują do kategorii produktu docelowego?
- Kategoria 1:1 (np. "Pharmaceutical Manufacturing" gdy szukamy API) → match_score 80-100
- Specjalizacja w łańcuchu dostaw (np. "API and chemical intermediates manufacturer") → 70-90
- Pokrewna branża (np. "Chemical synthesis services") → 50-70
- Producent w szerszej kategorii (np. "Specialty chemicals manufacturer") → 40-60

ŚLADY PRODUKTU NA STRONIE — bonus, nie wymóg:
- Explicit nazwa produktu wymieniona → +15 do score
- CAS number lub formuła chemiczna pasują → +10
- Sygnały pozytywne (z productContext) → +5 każdy
- Sygnały negatywne (z productContext) → -10 każdy

REJECTED tylko w skrajnych przypadkach (powtarzam):
- Firma KOMPLETNIE z innej branży (np. szukamy farma → IT consulting, software, marketing)
- Firma sprzedaje GOTOWE WYROBY a klient szuka SUROWCA (np. szukamy granulatu → firma robi rury)
  ALE: jak firma produkuje OBYDWA (np. integrated manufacturer) → APPROVED z średnim score
- Firma to portal/katalog/agregator listingów

Wszystko inne idzie z odpowiednim match_score. Nie filtrujemy aż do zera —
tworzymy shortlistę z odpowiednim rankingiem dla decyzji klienta.

${productContext?.supplyChainPosition === 'raw material' ? `
UWAGA — SZUKAMY SUROWCA:
Produkt "${productContext?.coreProduct}" jest SUROWCEM. Akceptuj TYLKO:
- Producentów/wytwórców tego surowca
- Dystrybutorów/handlowców tego surowca
- Recyklerów/regranulatorów tego surowca
ODRZUĆ producentów gotowych wyrobów z tego surowca!
` : ''}
Firma musi WYTWARZAĆ lub SPRZEDAWAĆ szukany produkt, nie tylko działać w powiązanej branży.

=== ZADANIE ===
1. Oceń czy dane są SPÓJNE i WIARYGODNE.
2. Wykryj wszelkie oznaki fałszywych danych.
3. Sprawdź czy firma RZECZYWIŚCIE produkuje/sprzedaje PRODUKT DOCELOWY (nie tylko powiązany).
4. Zwróć "Golden Record" TYLKO jeśli dane przejdą walidację.
5. Jeśli dane są PODEJRZANE lub NIESPÓJNE → ustaw is_valid: false i wyjaśnij dlaczego.

JĘZYK WYJŚCIA: Wszystkie pola tekstowe (rejection_reason, warnings, specialization, country, city) MUSZĄ być w języku ${AuditorAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.
Nazwy firm pozostaw oryginalne — NIE tłumacz nazw własnych.

Zwróć JSON:
{
  "is_valid": true/false,
  "is_match": true/false,
  "validation_result": "APPROVED" | "REJECTED" | "NEEDS_REVIEW",
  "confidence_score": 0.0-1.0,
  "match_score": 0-100,
  "match_label": "high" | "likely" | "speculative",
  "match_reasoning": "Krótkie uzasadnienie scoringu (max 200 znaków)",
  "rejection_reason": "Wyjaśnienie odrzucenia lub null (TYLKO gdy validation_result=REJECTED)",
  "warnings": ["Lista ostrzeżeń"],
  "checks_performed": {
    "domain_company_match": true/false,
    "is_blog_or_article": true/false,
    "is_distributor": true/false,
    "location_domain_consistent": true/false
  },
  "golden_record": {
    "company_name": "Zweryfikowana nazwa firmy",
    "website": "${websiteDomain.split('/').slice(0, 3).join('/')}",
    "country": "Kraj",
    "city": "Miasto lub null",
    "specialization": "Specjalizacja",
    "employee_count": "Liczba pracowników lub null",
    "certificates": ["ISO 9001"],
    "certificates_structured": [
      {
        "code": "ISO 9001:2015",
        "issuer": "TÜV SÜD",
        "certNumber": "12 100 45678",
        "issuedAt": "2023-01-15",
        "validUntil": "2026-01-14",
        "documentUrl": "https://example.com/iso9001.pdf",
        "evidenceQuote": "Cytat ze strony dostawcy (max 120 znaków)"
      }
    ],
    "contact_emails": ["email@company.com"],
    "is_verified_manufacturer": true/false,
    "verified_company_type": "PRODUCENT|HANDLOWIEC|NIEJASNY"
  }
}

WAŻNE — certyfikaty_strukturalne:
Zachowaj wpisy z etapów wcześniejszych (screener + enrichment) o ile są wiarygodne.
Odrzuć wpisy podejrzane (np. certyfikaty bez związku z branżą firmy, ewidentnie zmyślone
numery rejestrowe). Dla każdego pozostawionego certu: NIE WYMYŚLAJ brakujących pól
(certNumber/issuedAt/validUntil/documentUrl) — jeśli ich nie ma w danych wejściowych,
po prostu je pomiń.
        `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const result = parseAiJson(responseText);

            // Post-processing: Log validation result
            if (result.validation_result === 'REJECTED') {
                this.logger.warn(`AUDITOR REJECTED: ${websiteDomain} - Reason: ${result.rejection_reason}`);
            } else if (result.validation_result === 'APPROVED') {
                this.logger.log(`AUDITOR APPROVED: ${websiteDomain} - Confidence: ${result.confidence_score}`);
            }

            return result;
        } catch (e) {
            this.logger.error('Failed to execute Auditor Agent', e);

            // FALLBACK: If AI fails, do basic domain-name check but NEVER reject outright
            // Reason: Many legitimate companies have domains that don't match their legal name
            // (holdings, rebrands, abbreviations). Rejecting here causes 0-supplier cascading failure.
            const domainIncludesCompanyName = companyName.includes(coreDomainName) ||
                coreDomainName.includes(companyName.split(' ')[0]);
            const domainMismatch = !domainIncludesCompanyName && companyName.length > 3 && coreDomainName.length > 3;

            if (domainMismatch) {
                this.logger.warn(`FALLBACK NEEDS_REVIEW: Domain "${coreDomainName}" doesn't match company "${companyName}"`);
            }

            // Always return NEEDS_REVIEW in fallback — let pipeline decide with thresholds
            return {
                is_valid: true,
                is_match: !domainMismatch,
                validation_result: 'NEEDS_REVIEW',
                confidence_score: domainMismatch ? 0.4 : 0.55,
                rejection_reason: null,
                warnings: [
                    'AI verification unavailable — fallback heuristic used.',
                    ...(domainMismatch ? [`Domain "${coreDomainName}" doesn't match company "${companyName}"`] : []),
                ],
                checks_performed: {
                    domain_company_match: !domainMismatch,
                    is_blog_or_article: false,
                    is_distributor: false,
                    location_domain_consistent: !domainMismatch,
                },
                golden_record: {
                    company_name: registryData?.name || websiteData?.company_name || "Unknown Company",
                    website: websiteDomain.split('/').slice(0, 3).join('/'),
                    country: websiteData?.country || null,
                    city: websiteData?.city || null,
                    specialization: websiteData?.specialization || null,
                    employee_count: websiteData?.employee_count || null,
                    certificates: websiteData?.certificates || [],
                    certificates_structured: websiteData?.certificates_structured || [],
                    contact_emails: websiteData?.contact_emails || [],
                    is_verified_manufacturer: false,
                    verified_company_type: 'NIEJASNY'
                }
            };
        }
    }
}
