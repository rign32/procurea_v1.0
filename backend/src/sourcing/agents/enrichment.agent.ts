import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';
import { EmailFallbackService } from './email-fallback.service';

@Injectable()
export class EnrichmentAgentService {
    private readonly logger = new Logger(EnrichmentAgentService.name);

    constructor(
        private readonly geminiService: GeminiService,
        private readonly emailFallbackService: EmailFallbackService,
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
WAŻNE: Odpowiadaj WYŁĄCZNIE w języku ${EnrichmentAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.
Specjalizacja, kraj, miasto — WSZYSTKO w języku ${EnrichmentAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}. Nawet jeśli dane wejściowe są w innym języku, PRZETŁUMACZ na ${EnrichmentAgentService.LANGUAGE_NAMES[userLanguage] || userLanguage}.

Uzupełnij dane firmy na podstawie kontekstu wyszukiwania.

DANE Z ANALIZY:
${JSON.stringify(analystData, null, 2)}

DOMENA FIRMY: ${targetDomain}

UWAGA DOMENA: Jeśli domena źródłowa to portal/katalog firm (np. cybermadeinpoland.pl, plastech.pl, europages.com, kompass.com, dnb.com, industrystock.com),
to NIE jest strona firmy. W polu "website" podaj PRAWDZIWY URL strony firmy
(wydedukuj z nazwy firmy, danych kontaktowych, lub kontekstu). Jeśli nie da się ustalić, zostaw pole puste "".

KONTEKST WYSZUKIWANIA:
${searchContext.substring(0, 3000)}

ZADANIA:
1. Lokalizacja: Miasto i Kraj
2. Wielkość Firmy: np. "50-200", "200-500"
3. Specjalizacja: max 5 słów
4. Certyfikaty — STRUKTURALNIE. Dla KAŻDEGO certyfikatu (ISO 9001, ISO 14001, IATF 16949,
   AS 9100, ISO 13485, CE, MDR, RoHS, REACH, HACCP, BRCGS, IFS, FSC, BSCI, Organic EU,
   Fair Trade, itp.) zwróć obiekt w "certificates_structured" z polami:
     - code (np. "ISO 9001:2015"), issuer (TÜV/DEKRA/DNV/Bureau Veritas/SGS/Intertek),
       certNumber (numer rejestracyjny), issuedAt (YYYY-MM-DD), validUntil (YYYY-MM-DD),
       documentUrl (link do PDF na stronie dostawcy), evidenceQuote (cytat ≤120 znaków).
   Jeśli któregoś pola brak na stronie — POMIŃ to pole (nie wymyślaj). Zachowaj też
   listę skrótów w "certificates" (string[]) dla kompatybilności wstecznej.
   Jeśli dane analizy już zawierają "certificates_structured" — zweryfikuj i dopełnij
   (nie kasuj istniejących wpisów chyba że są oczywistymi błędami).

=== KONTEKST PRODUKTU ===
PRODUKT DOCELOWY: ${productContext?.coreProduct || 'N/A'}

INSTRUKCJA: Specjalizacja musi RZETELNIE opisywać GŁÓWNĄ działalność firmy (max 5 słów).
NIE dostosowuj specjalizacji do produktu docelowego — opisz CO FIRMA FAKTYCZNIE ROBI.
Przykłady:
- Producent rur z tworzyw → "Produkcja rur z tworzyw sztucznych" (NIE "granulat tworzywowy")
- Producent maszyn do granulacji → "Maszyny do granulacji tworzyw" (NIE "granulat tworzywowy")
- Producent granulatu PE → "Produkcja granulatu polietylenowego" (TO jest trafne)

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
    "certificates_structured": [
      {
        "code": "ISO 9001:2015",
        "issuer": "TÜV SÜD",
        "certNumber": "12 100 45678",
        "issuedAt": "2023-01-15",
        "validUntil": "2026-01-14",
        "documentUrl": "https://example.com/iso9001.pdf",
        "evidenceQuote": "Cytat ze strony"
      }
    ],
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

        const MAX_ENRICHMENT_RETRIES = 2;
        for (let attempt = 0; attempt <= MAX_ENRICHMENT_RETRIES; attempt++) {
            try {
                const responseText = await this.geminiService.generateContent(systemPrompt);
                const result = parseAiJson(responseText);

                // Ensure domain data is consistent
                if (result.enriched_data) {
                    // Don't overwrite website with portal/catalog URL — keep AI-deduced URL if available
                    const isPortal = this.isPortalUrl(targetDomain);
                    if (!isPortal) {
                        result.enriched_data.website = targetDomain;
                    } else if (!result.enriched_data.website || result.enriched_data.website === targetDomain) {
                        // AI didn't find a real URL either — keep portal as fallback
                        result.enriched_data.website = targetDomain;
                    }
                    result.enriched_data.domain_display = isPortal
                        ? this.extractDomainForDisplay(result.enriched_data.website || targetDomain)
                        : targetDisplayDomain;
                    // Use Gemini-found emails if available, otherwise fallback to domain-based generation
                    let emails: string[] = result.enriched_data.contact_emails || [];

                    if (emails.length === 0 && (result.enriched_data.website || targetDomain)) {
                        try {
                            const fallbackEmails = await this.emailFallbackService.generateWithValidation({
                                website: result.enriched_data.website || targetDomain,
                                country: result.enriched_data.country,
                            });
                            if (fallbackEmails.length > 0) {
                                emails = fallbackEmails.map(fe => fe.email);
                                result.enriched_data.emailSource = 'fallback-domain-generated';
                                this.logger.log(`Fallback generated ${emails.length} candidate emails for ${result.enriched_data.website || targetDomain}`);
                            }
                        } catch (fallbackErr) {
                            this.logger.warn(`Email fallback failed for ${targetDomain}: ${fallbackErr.message}`);
                        }
                    }

                    result.enriched_data.contact_emails = emails;
                }

                return result;
            } catch (e) {
                if (attempt < MAX_ENRICHMENT_RETRIES) {
                    this.logger.warn(`Enrichment retry ${attempt + 1}/${MAX_ENRICHMENT_RETRIES}: ${e.message}`);
                    await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
                    continue;
                }
                this.logger.error('Failed to execute Enrichment Agent after retries', e);
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

    private isPortalUrl(url: string): boolean {
        const PORTAL_DOMAINS = [
            'europages.com', 'kompass.com', 'thomasnet.com', 'globalspec.com',
            'wer-liefert-was.de', 'wlw.de', 'industrystock.com', 'exportpages.com',
            'alibaba.com', 'made-in-china.com', 'indiamart.com', 'directindustry.com',
            'panoramafirm.pl', 'pkt.pl', 'firmy.net', 'baza-firm.pl',
            'plastech.pl', 'tworzywa.pl', 'tworzywa.org',
            'cybermadeinpoland.pl', 'dnb.com', 'zoominfo.com', 'crunchbase.com',
            'linkedin.com', 'facebook.com', 'wikipedia.org',
            'plasteurope.com', 'plasticsnews.com', 'manufacturing.net',
            'globalsources.com', 'tradekey.com', 'yellow-pages.com',
        ];
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
            return PORTAL_DOMAINS.some(p => hostname === p || hostname.endsWith('.' + p));
        } catch {
            return false;
        }
    }
}
