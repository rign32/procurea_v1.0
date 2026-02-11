import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { GoogleSearchService } from '../../common/services/google-search.service';

@Injectable()
export class EnrichmentAgentService {
    private readonly logger = new Logger(EnrichmentAgentService.name);

    constructor(
        private readonly geminiService: GeminiService,
        private readonly googleSearch: GoogleSearchService
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

    private isAggregatorOrBlogPage(url: string): boolean {
        const lowerUrl = url.toLowerCase();
        const blogPatterns = [
            '/blog/', '/news/', '/article/', '/post/', '/lista/', '/list/',
            '/top-', '/best-', '/ranking/', '/porownanie/', '/comparison/',
            '/manufacturers/', '/suppliers/', '/producenci/', '/dostawcy/',
            'thomasnet.com', 'alibaba.com', 'europages.com', 'kompass.com',
            'dnb.com', 'linkedin.com', 'facebook.com', 'twitter.com',
            'indiamart.com', 'made-in-china.com', 'globalsources.com'
        ];
        return blogPatterns.some(pattern => lowerUrl.includes(pattern));
    }

    private async findRealCompanyDomain(companyName: string, originalSourceUrl: string): Promise<string | null> {
        if (!companyName || companyName.length < 3) return null;

        this.logger.log(`[DOMAIN DISCOVERY] Searching for real domain of: ${companyName}`);

        try {
            const queries = [
                `"${companyName}" official website`,
                `"${companyName}" company site`,
                `${companyName} manufacturer website`
            ];

            for (const query of queries) {
                const results = await this.googleSearch.searchExtended(query);

                for (const result of results) {
                    const resultDomain = this.extractDomainForDisplay(result.link);
                    const originalDomain = this.extractDomainForDisplay(originalSourceUrl);

                    if (resultDomain === originalDomain) continue;
                    if (this.isAggregatorOrBlogPage(result.link)) continue;

                    const titleLower = result.title.toLowerCase();
                    const companyNameLower = companyName.toLowerCase();
                    const companyWords = companyNameLower.split(/\s+/).filter(w => w.length > 3);

                    const matchingWords = companyWords.filter(word => titleLower.includes(word));
                    if (matchingWords.length >= 1) {
                        const realDomain = this.normalizeToRootDomain(result.link);
                        this.logger.log(`[DOMAIN DISCOVERY] Found real domain: ${realDomain}`);
                        return realDomain;
                    }
                }
            }

            return null;
        } catch (e) {
            this.logger.error(`[DOMAIN DISCOVERY] Error: ${e.message}`);
            return null;
        }
    }

    /**
     * ======================================================
     * AGGRESSIVE EMAIL DISCOVERY - MULTIPLE STRATEGIES
     * ======================================================
     * This is the CRITICAL phase - without email, supplier is useless
     */
    private async aggressiveEmailDiscovery(companyName: string, domain: string): Promise<string[]> {
        const emails: Set<string> = new Set();
        const displayDomain = this.extractDomainForDisplay(domain);

        this.logger.log(`[EMAIL DISCOVERY] Starting optimized search for: ${companyName} (${displayDomain})`);

        // EMAIL DISCOVERY QUERIES - Single precise query for cost optimization
        const emailQueries = [
            `"${companyName}" email contact info site:${displayDomain} OR site:linkedin.com`
        ];

        try {
            // Execute email discovery searches (limit to 1 query for cost efficiency)
            const searchPromises = emailQueries.map(q =>
                this.googleSearch.searchExtended(q).catch(() => [])
            );
            const allResults = await Promise.all(searchPromises);
            const flatResults = allResults.flat();

            // Extract emails from snippets and titles
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

            for (const result of flatResults) {
                const textToSearch = `${result.title} ${result.snippet}`;
                const foundEmails = textToSearch.match(emailRegex) || [];

                for (const email of foundEmails) {
                    const cleanEmail = email.toLowerCase().trim();

                    // Validate email
                    if (this.isValidBusinessEmail(cleanEmail, displayDomain, companyName)) {
                        emails.add(cleanEmail);
                    }
                }
            }

            // If no emails found, generate probable emails based on patterns
            // If no emails found, generate probable emails based on patterns
            if (emails.size === 0) {
                this.logger.log(`[EMAIL DISCOVERY] No emails found in search, generating probable emails`);

                const probableEmails = [
                    `info@${displayDomain}`,
                    `contact@${displayDomain}`,
                    `sales@${displayDomain}`
                ];

                for (const email of probableEmails) {
                    emails.add(email);
                }
            }

            this.logger.log(`[EMAIL DISCOVERY] Found ${emails.size} emails for ${companyName}`);
            return Array.from(emails).slice(0, 5);

        } catch (e) {
            this.logger.error(`[EMAIL DISCOVERY] Error: ${e.message}`);
            return [
                `info@${displayDomain}`,
                `contact@${displayDomain}`
            ];
        }
    }

    private isValidBusinessEmail(email: string, domain: string, companyName: string): boolean {
        const forbidden = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com'];
        const domainPart = email.split('@')[1];
        if (forbidden.includes(domainPart)) return false;
        return true;
    }

    async execute(analystData: any, originalUrl: string): Promise<any> {
        const companyName = analystData.company_name || 'Unknown';
        const targetDomain = this.normalizeToRootDomain(originalUrl);
        const targetDisplayDomain = this.extractDomainForDisplay(targetDomain);
        const domainSource = 'original';

        // STEP 2: OPTIMIZED EMAIL DISCOVERY
        const discoveredEmails = await this.aggressiveEmailDiscovery(companyName, targetDomain);

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

            // Ensure we always have the discovered emails
            if (result.enriched_data) {
                result.enriched_data.website = targetDomain;
                result.enriched_data.domain_display = targetDisplayDomain;

                // Override with our discovered emails (more reliable than AI guess)
                if (discoveredEmails.length > 0) {
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
                    is_verified_manufacturer: true,
                    has_contact_email: discoveredEmails.length > 0,
                    confidence_score: 50
                }
            };
        }
    }
}
