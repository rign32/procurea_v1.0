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

    /**
     * Generate probable contact emails based on domain patterns.
     * Email search via Google is currently disabled to preserve search budget.
     */
    private generateContactEmails(companyName: string, domain: string): string[] {
        const displayDomain = this.extractDomainForDisplay(domain);
        this.logger.log(`[EMAIL] Generating probable emails for: ${companyName} (${displayDomain})`);
        return [
            `info@${displayDomain}`,
            `contact@${displayDomain}`,
            `sales@${displayDomain}`,
        ];
    }

    async execute(analystData: any, originalUrl: string): Promise<any> {
        const companyName = analystData.company_name || 'Unknown';
        const targetDomain = this.normalizeToRootDomain(originalUrl);
        const targetDisplayDomain = this.extractDomainForDisplay(targetDomain);
        const domainSource = 'original';

        // STEP 2: GENERATE PROBABLE EMAILS (search-based discovery disabled)
        const discoveredEmails = this.generateContactEmails(companyName, targetDomain);

        // STEP 3: General company data searches - DISABLED FOR COST SAVINGS
        // We rely on AnalystAgent's on-page extraction.
        let searchContext = "";

        // Use Analyst data as context instead of new searches
        searchContext = `Analyst Extracted Data: ${JSON.stringify(analystData)}`;

        // STEP 4: AI Enrichment
        const systemPrompt = `
Jesteś Inżynierem Danych (Data Enrichment Specialist).
Uzupełnij dane firmy na podstawie kontekstu wyszukiwania.

DANE Z ANALIZY:
${JSON.stringify(analystData, null, 2)}

DOMENA FIRMY: ${targetDomain}
ZNALEZIONE EMAILE: ${discoveredEmails.join(', ') || 'BRAK - KRYTYCZNE!'}

KONTEKST WYSZUKIWANIA:
${searchContext.substring(0, 3000)}

ZADANIA:
1. Lokalizacja: Miasto i Kraj
2. Wielkość Firmy: np. "50-200", "200-500"
3. Specjalizacja: max 5 słów
4. Certyfikaty: lista ISO/IATF/AS9100

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
    "contact_emails": ${JSON.stringify(discoveredEmails)}
  },
  "verification": {
    "is_verified_manufacturer": true,
    "has_contact_email": ${discoveredEmails.length > 0},
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

                // Keep emails from analyst/screener if present, don't override with guesses
                if (!result.enriched_data.contact_emails || result.enriched_data.contact_emails.length === 0) {
                    // Only use generated emails as last resort
                    result.enriched_data.contact_emails = discoveredEmails;
                }
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
                    contact_emails: discoveredEmails
                },
                verification: {
                    is_verified_manufacturer: false,
                    has_contact_email: discoveredEmails.length > 0,
                    confidence_score: 50
                }
            };
        }
    }
}
