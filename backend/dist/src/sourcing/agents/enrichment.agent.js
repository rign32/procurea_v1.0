"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EnrichmentAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentAgentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../common/services/gemini.service");
const google_search_service_1 = require("../../common/services/google-search.service");
let EnrichmentAgentService = EnrichmentAgentService_1 = class EnrichmentAgentService {
    geminiService;
    googleSearch;
    logger = new common_1.Logger(EnrichmentAgentService_1.name);
    constructor(geminiService, googleSearch) {
        this.geminiService = geminiService;
        this.googleSearch = googleSearch;
    }
    normalizeToRootDomain(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        }
        catch (e) {
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
    extractDomainForDisplay(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        }
        catch (e) {
            return url;
        }
    }
    isAggregatorOrBlogPage(url) {
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
    async findRealCompanyDomain(companyName, originalSourceUrl) {
        if (!companyName || companyName.length < 3)
            return null;
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
                    if (resultDomain === originalDomain)
                        continue;
                    if (this.isAggregatorOrBlogPage(result.link))
                        continue;
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
        }
        catch (e) {
            this.logger.error(`[DOMAIN DISCOVERY] Error: ${e.message}`);
            return null;
        }
    }
    async aggressiveEmailDiscovery(companyName, domain, campaignId) {
        const emails = new Set();
        const displayDomain = this.extractDomainForDisplay(domain);
        this.logger.log(`[EMAIL DISCOVERY] Starting optimized search for: ${companyName} (${displayDomain})`);
        const emailQueries = [
            `"${companyName}" email contact info site:${displayDomain} OR site:linkedin.com`
        ];
        try {
            const remaining = this.googleSearch.getRemainingBudget(campaignId);
            if (remaining <= 2) {
                this.logger.log(`[EMAIL DISCOVERY] Budget low (${remaining}), using generated emails for ${displayDomain}`);
                return [`info@${displayDomain}`, `contact@${displayDomain}`, `sales@${displayDomain}`];
            }
            const searchPromises = emailQueries.map(q => this.googleSearch.searchExtended(q, undefined, undefined, campaignId).catch(() => []));
            const allResults = await Promise.all(searchPromises);
            const flatResults = allResults.flat();
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            for (const result of flatResults) {
                const textToSearch = `${result.title} ${result.snippet}`;
                const foundEmails = textToSearch.match(emailRegex) || [];
                for (const email of foundEmails) {
                    const cleanEmail = email.toLowerCase().trim();
                    if (this.isValidBusinessEmail(cleanEmail, displayDomain, companyName)) {
                        emails.add(cleanEmail);
                    }
                }
            }
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
        }
        catch (e) {
            this.logger.error(`[EMAIL DISCOVERY] Error: ${e.message}`);
            return [
                `info@${displayDomain}`,
                `contact@${displayDomain}`
            ];
        }
    }
    isValidBusinessEmail(email, domain, companyName) {
        const forbidden = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com'];
        const domainPart = email.split('@')[1];
        if (forbidden.includes(domainPart))
            return false;
        return true;
    }
    async execute(analystData, originalUrl, campaignId) {
        const companyName = analystData.company_name || 'Unknown';
        const targetDomain = this.normalizeToRootDomain(originalUrl);
        const targetDisplayDomain = this.extractDomainForDisplay(targetDomain);
        const domainSource = 'original';
        const discoveredEmails = await this.aggressiveEmailDiscovery(companyName, targetDomain, campaignId);
        let searchContext = "";
        searchContext = `Analyst Extracted Data: ${JSON.stringify(analystData)}`;
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
            if (result.enriched_data) {
                result.enriched_data.website = targetDomain;
                result.enriched_data.domain_display = targetDisplayDomain;
                if (discoveredEmails.length > 0) {
                    result.enriched_data.contact_emails = discoveredEmails;
                }
            }
            return result;
        }
        catch (e) {
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
};
exports.EnrichmentAgentService = EnrichmentAgentService;
exports.EnrichmentAgentService = EnrichmentAgentService = EnrichmentAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        google_search_service_1.GoogleSearchService])
], EnrichmentAgentService);
//# sourceMappingURL=enrichment.agent.js.map