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
var AuditorAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorAgentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../common/services/gemini.service");
let AuditorAgentService = AuditorAgentService_1 = class AuditorAgentService {
    geminiService;
    logger = new common_1.Logger(AuditorAgentService_1.name);
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    extractCoreDomainName(url) {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname.replace(/^www\./, '');
            const parts = hostname.split('.');
            return parts[0].toLowerCase();
        }
        catch (e) {
            return url.toLowerCase();
        }
    }
    async execute(websiteData, registryData) {
        this.logger.log('Executing Auditor Agent - STRICT VALIDATION MODE...');
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
   
3. **WYKRYWANIE DYSTRYBUTORÓW**:
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

=== ZADANIE ===
1. Oceń czy dane są SPÓJNE i WIARYGODNE.
2. Wykryj wszelkie oznaki fałszywych danych.
3. Zwróć "Golden Record" TYLKO jeśli dane przejdą walidację.
4. Jeśli dane są PODEJRZANE lub NIESPÓJNE → ustaw is_valid: false i wyjaśnij dlaczego.

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
    "is_verified_manufacturer": true/false
  }
}
        `;
        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonString);
            if (result.validation_result === 'REJECTED') {
                this.logger.warn(`AUDITOR REJECTED: ${websiteDomain} - Reason: ${result.rejection_reason}`);
            }
            else if (result.validation_result === 'APPROVED') {
                this.logger.log(`AUDITOR APPROVED: ${websiteDomain} - Confidence: ${result.confidence_score}`);
            }
            return result;
        }
        catch (e) {
            this.logger.error('Failed to execute Auditor Agent', e);
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
                    is_verified_manufacturer: true
                }
            };
        }
    }
};
exports.AuditorAgentService = AuditorAgentService;
exports.AuditorAgentService = AuditorAgentService = AuditorAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], AuditorAgentService);
//# sourceMappingURL=auditor.agent.js.map