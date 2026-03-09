import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';

@Injectable()
export class EnrichmentAgentService {
    private readonly logger = new Logger(EnrichmentAgentService.name);

    constructor(
        private readonly geminiService: GeminiService,
    ) { }

    private normalizeToRootDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch (e) {
            this.logger.warn(`Could not parse URL: ${url}`);
            if (url.includes('/')) {
                const parts = url.split('/');
                if (parts.length >= 3) {
                    return `${parts[0]}//${parts[2]}`;
                }
            }
            return url;
        }
    }

    private extractDomainForDisplay(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }

    private static readonly LANGUAGE_NAMES: Record<string, string> = {
        pl: 'polskim', en: 'English', de: 'Deutsch', fr: 'français',
        it: 'italiano', es: 'español', cs: 'čeština', nl: 'Nederlands',
        sv: 'svenska', da: 'dansk', ro: 'română', hu: 'magyar',
        pt: 'português', fi: 'suomi', ja: '日本語', ko: '한국어', zh: '中文',
    };

    async execute(analystData: any, originalUrl: string, userLanguage: string = 'pl', productContext?: { coreProduct: string; positiveSignals: string[]; negativeSignals: string[] }): Promise<any> {
        const companyName = analystData.company_name || 'Unknown';
        const targetDomain = this.normalizeToRootDomain(originalUrl);
        const targetDisplayDomain = this.extractDomainForDisplay(targetDomain);
        const domainSource = 'original';

        // Use Analyst data as context instead of new searches
        const searchContext = `Analyst Extracted Data: ${JSON.stringify(analystData)}`;

        // AI Enrichment
        const systemPrompt = `
Jesteś Inżynierem Danych (Data Enrichment Specialist).
Uzupełnij dane firmy na podstawie kontekstu wyszukiwania.

DANE Z ANALIZY:
${JSON.stringify(analystData, null, 2)}

DOMENA FIRMY: ${targetDomain}

KONTEKST WYSZUKIWANIA:
${searchContext.substring(0, 3000)}

ZADANIA:
1. Lokalizacja: Miasto i Kraj
2. Wielkość Firmy: np. "50-200", "200-500"
3. Specjalizacja: max 5 słów
4. Certyfikaty: lista ISO/IATF/AS9100

=== KONTEKST PRODUKTU (KRYTYCZNY) ===
PRODUKT DOCELOWY: ${productContext?.coreProduct || 'N/A'}
SYGNAŁY POZYTYWNE: ${productContext?.positiveSignals?.join(', ') || 'brak'}
SYGNAŁY NEGATYWNE: ${productContext?.negativeSignals?.join(', ') || 'brak'}

INSTRUKCJA: Specjalizacja MUSI odnosić się do produktu docelowego, NIE do innego produktu
który firma może mieć w ofercie. Jeśli firma produkuje wiele produktów, wymień TEN
który jest relevantny do zapytania.

JĘZYK WYJŚCIA: Wszystkie pola tekstowe (specialization, country, city) MUSZĄ być w języku ${EnrichmentAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.
Nazwy firm pozostaw oryginalne — NIE tłumacz nazw własnych.

Zwróć JSON:
{
  "enriched_data": {
    "company_name": "${companyName}",
    "website": "${targetDomain}",
    "domain_display": "${targetDisplayDomain}",
    "domain_verified": ${domainSource === 'original'},
    "country": "Kraj lub null",
    "city": "Miasto lub null",
    "employee_count": "np. '50-200' lub null",
    "certificates": ["ISO 9001"],
    "specialization": "Krótki opis",
    "contact_emails": []
  },
  "verification": {
    "is_verified_manufacturer": true,
    "has_contact_email": false,
    "confidence_score": 0-100
  }
}
        `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonString);

            // Ensure domain data is consistent
            if (result.enriched_data) {
                result.enriched_data.website = targetDomain;
                result.enriched_data.domain_display = targetDisplayDomain;
                // Always return empty emails — email generation is disabled
                result.enriched_data.contact_emails = [];
            }

            return result;
        } catch (e) {
            this.logger.error('Failed to execute Enrichment Agent', e);
            return {
                enriched_data: {
                    ...analystData,
                    website: targetDomain,
                    domain_display: targetDisplayDomain,
                    domain_verified: false,
                    contact_emails: []
                },
                verification: {
                    is_verified_manufacturer: false,
                    has_contact_email: false,
                    confidence_score: 50
                }
            };
        }
    }
}
