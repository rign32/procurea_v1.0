import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';

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

    async execute(websiteData: any, registryData: any, userLanguage: string = 'pl', productContext?: {
        coreProduct: string;
        positiveSignals: string[];
        negativeSignals: string[];
        supplyChainPosition?: string;
        disambiguationNote?: string;
        productCategory?: string;
    }): Promise<any> {
        this.logger.log('Executing Auditor Agent - STRICT VALIDATION MODE...');

        // Pre-validation checks
        const websiteDomain = websiteData?.website || websiteData?.url || '';
        const coreDomainName = this.extractCoreDomainName(websiteDomain);
        const companyName = (websiteData?.company_name || registryData?.name || '').toLowerCase();

        this.logger.log(`Validating: Domain="${coreDomainName}" vs Company="${companyName}"`);

        const systemPrompt = `
Jesteś Specjalistą ds. Compliance i Walidacji Danych (Data Auditor).
Twoją GŁÓWNĄ odpowiedzialnością jest WYKRYCIE I ODRZUCENIE fałszywych lub niespójnych danych.

=== KRYTYCZNE REGUŁY WALIDACJI ===

1. **SPÓJNOŚĆ NAZWY FIRMY Z DOMENĄ**:
   - Nazwa firmy MUSI mieć logiczny związek z domeną.
   - PRZYKŁADY POPRAWNE:
     * Domena: "granulat.com.pl" → Firma: "Granulat Sp. z o.o." ✓
     * Domena: "stalpol.pl" → Firma: "Stal-Pol Rzeszów" ✓
     * Domena: "precision-cnc.de" → Firma: "Precision CNC GmbH" ✓
   - PRZYKŁADY BŁĘDNE (ODRZUĆ!):
     * Domena: "granulat.com.pl" → Firma: "American Bureau of Shipping" ✗ FALSYFIKAT!
     * Domena: "plastics.pl" → Firma: "Google LLC" ✗ FALSYFIKAT!
   
2. **WYKRYWANIE ARTYKUŁÓW/BLOGÓW**:
   - Jeśli URL zawiera "/blog/", "/news/", "/article/", "/post/" → to NIE jest strona firmy, ODRZUĆ!
   
3. **WERYFIKACJA TYPU FIRMY**:
   - Screener zaklasyfikował firmę jako: ${websiteData.company_type || 'NIEJASNY'}
   - ZWERYFIKUJ tę klasyfikację na podstawie danych.
   - Jeśli screener mówi PRODUCENT ale dane wskazują na handlowca → ZMIEŃ klasyfikację
   - Pole "verified_company_type" w golden_record MUSI być wypełnione
   - Użyj tylko: "PRODUCENT" | "HANDLOWIEC" | "NIEJASNY"

4. **WYKRYWANIE DYSTRYBUTORÓW**:
   - Jeśli na stronie są produkty WIELU różnych producentów → to DYSTRYBUTOR/SKLEP, oznacz!
   
4. **WALIDACJA LOKALIZACJI**:
   - Jeśli domena kończy się na ".pl" ale firma jest rzekomo z USA → PODEJRZANE!
   - Jeśli domena kończy się na ".de" ale lokalizacja to "China" → PODEJRZANE!

DANE ZE STRONY WWW (Enrichment Agent output):
${JSON.stringify(websiteData, null, 2)}

DANE Z REJESTRU (jeśli dostępne):
${JSON.stringify(registryData, null, 2)}

DOMENA DO WALIDACJI: ${websiteDomain}
RDZEŃ DOMENY: ${coreDomainName}

=== WAŻNE: NIE ODRZUCAJ ZBYT AGRESYWNIE ===
Wiele LEGALNYCH firm ma nazwy domen RÓŻNE od nazwy firmy. Oto POPRAWNE przykłady:
- Domena "tecpol.pl" → Firma "Technoplast Polska Sp. z o.o." = POPRAWNE (skrót)
- Domena "abc-solutions.de" → Firma "ABC Kunststofftechnik GmbH" = POPRAWNE (osobna marka)
- Domena "mkg.pl" → Firma "MKG Granulaty Sp. z o.o." = POPRAWNE (akronim)
- Domena "eurocomposites.lu" → Firma "Euro-Composites S.A." = POPRAWNE (wariant nazwy)

Odrzuć (REJECTED) TYLKO gdy:
1. Domena i nazwa firmy są KOMPLETNIE NIEZWIĄZANE (np. domena o plastiku, firma stalowa)
2. URL wyraźnie wskazuje na blog/artykuł (/blog/, /news/, /article/)
3. Dane są ewidentnie sfabrykowane (nierealna kombinacja)

validation_result: Przy odrzuceniu z powodu SPÓJNOŚCI DANYCH → daj szansę (NEEDS_REVIEW).
Ale przy odrzuceniu z powodu ZŁEGO PRODUKTU → odrzuć zdecydowanie (REJECTED).
Walidacja produktowa jest WAŻNIEJSZA niż walidacja spójności danych.

=== KONTEKST PRODUKTU (KRYTYCZNY) ===
PRODUKT DOCELOWY: ${productContext?.coreProduct || 'N/A'}
KATEGORIA: ${productContext?.productCategory || 'N/A'}
POZYCJA W ŁAŃCUCHU DOSTAW: ${productContext?.supplyChainPosition || 'N/A'}
UWAGA: ${productContext?.disambiguationNote || 'brak'}

SYGNAŁY POZYTYWNE (firma produkuje/sprzedaje ten produkt):
${productContext?.positiveSignals?.map(s => `  ✅ ${s}`).join('\n') || 'brak'}

SYGNAŁY NEGATYWNE (firma NIE jest dostawcą tego produktu):
${productContext?.negativeSignals?.map(s => `  ❌ ${s}`).join('\n') || 'brak'}

=== WALIDACJA PRODUKTOWA (KRYTYCZNA) ===

KROK 1: Sprawdź czy specjalizacja firmy RZECZYWIŚCIE pokrywa się z produktem docelowym.
KROK 2: Sprawdź czy firma SPRZEDAJE ten produkt, czy tylko go KUPUJE/UŻYWA.
KROK 3: Sprawdź czy firma produkuje PRODUKT, czy MASZYNY do jego produkcji.

ODRZUĆ (REJECTED) gdy:
- Firma produkuje INNY produkt niż docelowy (np. szukamy oleju → firma produkuje pompy)
- Firma PRZETWARZA surowiec w gotowe wyroby (np. szukamy granulatu → firma produkuje rury Z granulatu)
- Firma produkuje MASZYNY/URZĄDZENIA do obróbki tego produktu (np. szukamy granulatu → firma produkuje ekstruzery/granulatory)
- Firma jest z KOMPLETNIE INNEJ branży

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
  "rejection_reason": "Wyjaśnienie odrzucenia lub null",
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
    "contact_emails": ["email@company.com"],
    "is_verified_manufacturer": true/false,
    "verified_company_type": "PRODUCENT|HANDLOWIEC|NIEJASNY"
  }
}
        `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonString);

            // Post-processing: Log validation result
            if (result.validation_result === 'REJECTED') {
                this.logger.warn(`AUDITOR REJECTED: ${websiteDomain} - Reason: ${result.rejection_reason}`);
            } else if (result.validation_result === 'APPROVED') {
                this.logger.log(`AUDITOR APPROVED: ${websiteDomain} - Confidence: ${result.confidence_score}`);
            }

            return result;
        } catch (e) {
            this.logger.error('Failed to execute Auditor Agent', e);

            // STRICT FALLBACK: If AI fails, do basic domain-name check
            const domainIncludesCompanyName = companyName.includes(coreDomainName) ||
                coreDomainName.includes(companyName.split(' ')[0]);

            if (!domainIncludesCompanyName && companyName.length > 3 && coreDomainName.length > 3) {
                this.logger.warn(`FALLBACK REJECTION: Domain "${coreDomainName}" doesn't match company "${companyName}"`);
                return {
                    is_valid: false,
                    is_match: false,
                    validation_result: 'REJECTED',
                    confidence_score: 0.2,
                    rejection_reason: `Domain "${coreDomainName}" does not match company name "${companyName}". Possible data falsification.`,
                    warnings: ["AI verification failed, basic check rejected the record."],
                    checks_performed: {
                        domain_company_match: false,
                        is_blog_or_article: false,
                        is_distributor: false,
                        location_domain_consistent: false
                    },
                    golden_record: null
                };
            }

            // If basic check passes, return with caution
            return {
                is_valid: true,
                is_match: true,
                validation_result: 'NEEDS_REVIEW',
                confidence_score: 0.5,
                rejection_reason: null,
                warnings: ["AI verification failed, record passed basic domain check but needs manual review."],
                checks_performed: {
                    domain_company_match: true,
                    is_blog_or_article: false,
                    is_distributor: false,
                    location_domain_consistent: true
                },
                golden_record: {
                    company_name: registryData?.name || websiteData?.company_name || "Unknown Company",
                    website: websiteDomain.split('/').slice(0, 3).join('/'),
                    country: websiteData?.country || null,
                    city: websiteData?.city || null,
                    specialization: websiteData?.specialization || null,
                    employee_count: websiteData?.employee_count || null,
                    certificates: websiteData?.certificates || [],
                    contact_emails: websiteData?.contact_emails || [],
                    is_verified_manufacturer: false,
                    verified_company_type: 'NIEJASNY'
                }
            };
        }
    }
}
