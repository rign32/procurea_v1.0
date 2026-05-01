import { Injectable, Logger, NotFoundException, Optional, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { normalizeCountry, getLanguageForCountry } from '../common/normalize-country';
import { PrismaService } from '../prisma/prisma.service';
import { ProductContext } from './agents/screener.agent';
import { StrategyAgentService, REGION_LANGUAGE_CONFIG, SANCTIONED_COUNTRIES } from './agents/strategy.agent';
import { ScreenerAgentService } from './agents/screener.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { ExpansionAgentService } from './agents/expansion.agent';
import { GoogleSearchService } from '../common/services/google-search.service';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService, CachedSearchResult } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { CreateCampaignDto } from './sourcing.controller';
import { SourcingGateway } from './sourcing.gateway';
import { EmailService } from '../email/email.service';
import { GeminiService } from '../common/services/gemini.service';
import { ObservabilityService } from '../observability/observability.service';
import { SalesOpsService } from '../sales-ops/sales-ops.service';
import { ApolloEnrichmentAgent } from './agents/apollo-enrichment.agent';
import { ConfigService } from '@nestjs/config';
import { VatValidationService } from '../common/services/vat-validation.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { CertificatesService } from '../suppliers/certificates.service';
import {
  normalizeExtractedCertificates,
  parseLooseDate,
  type ExtractedCertificate,
} from '../suppliers/certificate-types';
import { checkRequiredCerts } from './cert-taxonomy';
import { v4 as uuidv4 } from 'uuid';
import pLimit = require('p-limit');
import * as XLSX from 'xlsx';

/**
 * Thread-safe counter for limiting concurrent supplier creation.
 * Uses pre-increment (tryReserve) so parallel workers can't overshoot the limit.
 */
class AtomicCounter {
    private _value = 0;
    get value(): number { return this._value; }
    /** Try to reserve a slot. Returns true if the count was below max and slot was reserved. */
    tryReserve(max: number): boolean {
        if (this._value >= max) return false;
        this._value++;
        return true;
    }
    /** Release a slot (when processSupplierUrl returned 0 = didn't actually qualify). */
    release(): void {
        this._value = Math.max(0, this._value - 1);
    }
}

// Known industry portals / directories — never save as suppliers, always mine
const PORTAL_DOMAINS = new Set([
    // Polish portals
    'tworzywa.org', 'plastech.pl', 'tworzywa.pl',
    'panoramafirm.pl', 'pkt.pl', 'firmy.net', 'baza-firm.pl',
    'pfrn.pl', 'firmeo.com',
    // European B2B directories
    'europages.com', 'europages.co.uk', 'europages.de', 'europages.fr',
    'europages.it', 'europages.es', 'europages.nl',
    'kompass.com', 'thomasnet.com', 'globalspec.com',
    'wer-liefert-was.de', 'wlw.de',
    'industrystock.com', 'exportpages.com',
    // Global directories
    'alibaba.com', 'made-in-china.com', 'indiamart.com',
    'directindustry.com', 'tradekey.com', 'go4worldbusiness.com',
    'globalsources.com', 'ec21.com', 'ecvv.com',
    // Business data
    'yellow-pages.com', 'dnb.com', 'hoovers.com',
    'zoominfo.com', 'crunchbase.com',
    // Industry-specific
    'plasteurope.com', 'plasticsportal.net', 'plasticsnews.com',
    'manufacturing.net', 'zycon.com', 'mfg.com',
    // Social / non-supplier
    'linkedin.com', 'facebook.com', 'twitter.com', 'youtube.com',
    'wikipedia.org', 'reddit.com',
]);

// Known e-commerce / marketplace domains — hard-reject before scraping
const SHOP_DOMAINS = new Set([
    'allegro.pl', 'ceneo.pl', 'olx.pl', 'amazon.com', 'amazon.de',
    'ebay.com', 'ebay.de', 'aliexpress.com', 'wish.com',
    'empik.com', 'morele.net', 'x-kom.pl', 'mediamarkt.pl',
]);

function isPortalDomain(domain: string): boolean {
    const clean = domain.replace(/^www\./, '').toLowerCase();
    return PORTAL_DOMAINS.has(clean) || [...PORTAL_DOMAINS].some(p => clean.endsWith('.' + p));
}

/**
 * Infer country from domain TLD when enrichment couldn't determine it.
 * Only uses country-code TLDs (.pl, .de, .cz etc.), NOT generic TLDs (.com, .net, .org).
 */
function inferCountryFromTLD(domain: string): string | null {
    const clean = domain.replace(/^www\./, '').toLowerCase();
    const parts = clean.split('.');
    const tld = parts[parts.length - 1];
    const TLD_TO_COUNTRY: Record<string, string> = {
        'pl': 'Polska', 'de': 'Niemcy', 'cz': 'Czechy', 'sk': 'Słowacja',
        'hu': 'Węgry', 'at': 'Austria', 'fr': 'Francja', 'it': 'Włochy',
        'es': 'Hiszpania', 'nl': 'Holandia', 'be': 'Belgia', 'ch': 'Szwajcaria',
        'se': 'Szwecja', 'dk': 'Dania', 'no': 'Norwegia', 'fi': 'Finlandia',
        'pt': 'Portugalia', 'ro': 'Rumunia', 'bg': 'Bułgaria', 'hr': 'Chorwacja',
        'si': 'Słowenia', 'lt': 'Litwa', 'lv': 'Łotwa', 'ee': 'Estonia',
        'ie': 'Irlandia', 'lu': 'Luksemburg', 'uk': 'Wielka Brytania',
        'jp': 'Japonia', 'kr': 'Korea Południowa', 'cn': 'Chiny', 'tw': 'Tajwan', 'hk': 'Hongkong', 'mo': 'Makao',
        'in': 'Indie', 'br': 'Brazylia', 'mx': 'Meksyk', 'au': 'Australia',
        'tr': 'Turcja', 'ua': 'Ukraina', 'ru': 'Rosja',
    };
    // Handle compound TLDs like .co.uk, .co.jp
    if (parts.length >= 3 && parts[parts.length - 2] === 'co') {
        return TLD_TO_COUNTRY[tld] || null;
    }
    return TLD_TO_COUNTRY[tld] || null;
}

function parseEmployeeCount(raw: string | undefined): number | null {
    if (!raw || raw === 'N/A') return null;
    const cleaned = raw.replace(/[^\d\-+]/g, '');
    const parts = cleaned.split('-');
    const last = parts[parts.length - 1].replace('+', '');
    const num = parseInt(last, 10);
    return isNaN(num) ? null : num;
}

const MAX_EMPLOYEE_COUNT = 10000;

/**
 * Normalize company name for fuzzy deduplication.
 * Strips legal suffixes, special chars, and normalizes whitespace.
 */
function normalizeCompanyNameForDedup(name: string): string {
    return name
        .toLowerCase()
        .trim()
        // Remove legal suffixes (Polish, German, English, Dutch, Italian, French, etc.)
        .replace(/\b(sp\.?\s*z\s*o\.?\s*o\.?|sp\.?\s*j\.?|sp\.?\s*k\.?|s\.?\s*a\.?|s\.?\s*c\.?)\b/gi, '')
        .replace(/\b(gmbh|ag|kg|ohg|e\.?\s*k\.?|ug|mbh|co\.?\s*kg)\b/gi, '')
        .replace(/\b(ltd\.?|limited|llc|inc\.?|corp\.?|corporation|plc|co\.?)\b/gi, '')
        .replace(/\b(b\.?\s*v\.?|n\.?\s*v\.?|v\.?\s*o\.?\s*f\.?|c\.?\s*v\.?)\b/gi, '')
        .replace(/\b(s\.?\s*r\.?\s*l\.?|s\.?\s*p\.?\s*a\.?|s\.?\s*a\.?\s*s\.?|s\.?\s*n\.?\s*c\.?)\b/gi, '')
        .replace(/\b(sarl|sas|eurl|sa)\b/gi, '')
        .replace(/\b(ab|oy|as|aps|a\/s)\b/gi, '')
        // Remove punctuation and special chars
        .replace(/[.,\-–—&+()'"\/\\]/g, ' ')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Maps language code to Google Search locale parameters (gl=country, hl=language)
 * This ensures search results are localized for each target market.
 */
function languageToGoogleLocale(lang: string): { gl: string; hl: string } {
    const mapping: Record<string, { gl: string; hl: string }> = {
        pl: { gl: 'pl', hl: 'pl' },
        de: { gl: 'de', hl: 'de' },
        en: { gl: 'gb', hl: 'en' },
        fr: { gl: 'fr', hl: 'fr' },
        cs: { gl: 'cz', hl: 'cs' },
        it: { gl: 'it', hl: 'it' },
        es: { gl: 'es', hl: 'es' },
        pt: { gl: 'pt', hl: 'pt' },
        nl: { gl: 'nl', hl: 'nl' },
        sv: { gl: 'se', hl: 'sv' },
        ro: { gl: 'ro', hl: 'ro' },
        da: { gl: 'dk', hl: 'da' },
        hu: { gl: 'hu', hl: 'hu' },
        fi: { gl: 'fi', hl: 'fi' },
        ja: { gl: 'jp', hl: 'ja' },
        ko: { gl: 'kr', hl: 'ko' },
        zh: { gl: 'cn', hl: 'zh' },
        tr: { gl: 'tr', hl: 'tr' },
        ar: { gl: 'ae', hl: 'ar' },
        he: { gl: 'il', hl: 'he' },
        el: { gl: 'gr', hl: 'el' },
        vi: { gl: 'vn', hl: 'vi' },
        th: { gl: 'th', hl: 'th' },
        id: { gl: 'id', hl: 'id' },
        ms: { gl: 'my', hl: 'ms' },
        hi: { gl: 'in', hl: 'hi' },
        bg: { gl: 'bg', hl: 'bg' },  // Bulgarian
        hr: { gl: 'hr', hl: 'hr' },  // Croatian
        et: { gl: 'ee', hl: 'et' },  // Estonian
        lv: { gl: 'lv', hl: 'lv' },  // Latvian
        lt: { gl: 'lt', hl: 'lt' },  // Lithuanian
        sk: { gl: 'sk', hl: 'sk' },  // Slovak
        sl: { gl: 'si', hl: 'sl' },  // Slovenian
    };
    return mapping[lang] || { gl: 'us', hl: 'en' };
}

export interface Supplier {
    url: string;
    explorerResult?: any;
    analystResult?: any;
    enrichmentResult?: any;
    auditorResult?: any;
    name?: string;
    country?: string;
    website?: string;
    analysis?: {
        suitabilityScore: number;
        reasoning: string;
    };
}

export interface CampaignState {
    id: string;
    status: string;
    stage: string;
    results: Supplier[];
    logs: string[];
}

// Language-specific worker result
interface LanguageWorkerResult {
    language: string;
    country: string;
    suppliersFound: number;
    errors: string[];
}

// URL collected during Phase 2A (search-only), processed in Phase 2B
interface CollectedUrl {
    url: string;
    originLanguage: string;
    originCountry: string;
    workerTag: string;
}

@Injectable()
export class SourcingService {
    private readonly logger = new Logger(SourcingService.name);

    // Concurrency limit for parallel URL processing within each worker
    private readonly urlLimit = pLimit(parseInt(process.env.URL_LIMIT || '40', 10));

    // Deep Research counter per campaign (cap expensive subpage scraping)
    private readonly deepResearchCounts = new Map<string, number>();
    private readonly MAX_DEEP_RESEARCH = parseInt(process.env.MAX_DEEP_RESEARCH || '50', 10);

    // Campaign cancellation flags (in-memory, per-instance)
    private readonly cancelledCampaigns = new Set<string>();
    private readonly campaignStartTimes = new Map<string, number>();
    private readonly campaignTimers = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly campaignAbortControllers = new Map<string, AbortController>();
    private readonly campaignLowYield = new Map<string, boolean>();
    private readonly campaignStats = new Map<string, { processedUrls: number; screenerPassed: number; auditorApproved: number; auditorRejected: number; geminiFallbacks: number; rejectionReasons: Map<string, number> }>();
    private readonly PIPELINE_TIMEOUT_MS = parseInt(process.env.PIPELINE_TIMEOUT_MS || '1800000', 10); // 30 min
    private readonly PIPELINE_SUPPLIER_LIMIT = parseInt(process.env.PIPELINE_SUPPLIER_LIMIT || '500', 10);

    constructor(
        private readonly prisma: PrismaService,
        private readonly strategyAgent: StrategyAgentService,
        private readonly screenerAgent: ScreenerAgentService,
        private readonly enrichmentAgent: EnrichmentAgentService,
        private readonly auditorAgent: AuditorAgentService,
        private readonly expansionAgent: ExpansionAgentService,
        private readonly searchService: GoogleSearchService,
        private readonly scrapingService: ScrapingService,
        @Optional() private readonly sourcingGateway: SourcingGateway,
        private readonly queryCache: QueryCacheService,
        private readonly companyRegistry: CompanyRegistryService,
        private readonly emailService: EmailService,
        private readonly geminiService: GeminiService,
        private readonly observability: ObservabilityService,
        @Inject(forwardRef(() => SalesOpsService)) private readonly salesOps: SalesOpsService,
        private readonly apolloEnrichment: ApolloEnrichmentAgent,
        private readonly configService: ConfigService,
        @Optional() private readonly vatValidation: VatValidationService,
        private readonly tenantContext: TenantContextService,
        private readonly certificatesService: CertificatesService,
    ) { }

    /**
     * Persist AI-discovered certificates to SupplierCertificate with source=PIPELINE.
     * Runs fire-and-forget after supplier creation so a cert-write failure never
     * breaks the sourcing pipeline.
     */
    private async persistPipelineCertificates(
        supplierId: string,
        auditorGolden: any,
        enrichmentData: any,
        screenerData: any,
        sourceUrl: string,
        opts: { vatVerified?: boolean } = {},
    ): Promise<void> {
        try {
            // Priority: Auditor > Enrichment > Screener (later stages have validated the data).
            const rawStructured =
                auditorGolden?.certificates_structured ??
                enrichmentData?.certificates_structured ??
                screenerData?.extracted_data?.certificates_structured ??
                [];
            const certs: ExtractedCertificate[] = normalizeExtractedCertificates(rawStructured);
            if (certs.length === 0) return;

            for (const cert of certs) {
                try {
                    const validUntilDate = parseLooseDate(cert.validUntil);
                    const issuedAtDate = parseLooseDate(cert.issuedAt);
                    // VIES-confirmed suppliers: promote cert to VERIFIED (company proven to exist in
                    // the national VAT registry — strong enough proof-of-existence to trust the claim).
                    // Otherwise let createInternal derive EVIDENCED/EXTRACTED from hard signals.
                    const verificationStatus = opts.vatVerified ? 'VERIFIED' as const : undefined;
                    await this.certificatesService.createInternal(supplierId, {
                        type: cert.type || 'OTHER',
                        code: cert.code,
                        issuer: cert.issuer || undefined,
                        certNumber: cert.certNumber || undefined,
                        issuedAt: issuedAtDate ? issuedAtDate.toISOString() : null,
                        validUntil: validUntilDate ? validUntilDate.toISOString() : null,
                        sourceUrl: cert.documentUrl || sourceUrl || undefined,
                        source: 'PIPELINE',
                        verificationStatus,
                    });
                } catch (certErr: any) {
                    // Duplicate / validation errors per-cert must not break the loop.
                    this.logger.debug(
                        `PIPELINE cert skip for supplier ${supplierId} (${cert.code}): ${certErr.message}`,
                    );
                }
            }
        } catch (err: any) {
            this.logger.warn(`persistPipelineCertificates failed for ${supplierId}: ${err.message}`);
        }
    }

    /**
     * CRITICAL: Normalize URL to ROOT DOMAIN only.
     */
    private normalizeToRootDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch (e) {
            return url;
        }
    }

    /**
     * Extract domain for deduplication
     */
    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }

    private async log(campaignId: string, message: string, severityOverride?: 'info' | 'warning' | 'error' | 'critical') {
        // Auto-detect severity from message content if not explicitly provided
        const severity = severityOverride || this.inferLogSeverity(message);
        this.logger.log(`[${campaignId}] ${message}`);
        try {
            await this.prisma.log.create({
                data: { campaignId, message, severity }
            });
        } catch (e) {
            this.logger.error(`Failed to save log: ${e.message}`);
        }
        this.sourcingGateway?.emitLog(campaignId, message);
    }

    /**
     * Sprint 3 — deterministic post-Auditor filters. Wizard fields the buyer
     * picked (CE/MDR cert, MOQ ceiling, lead-time max, voivodeship for PL
     * construction, nearshore vs offshore) translate into HARD reject rules:
     * if the supplier's extracted/audited data fails one, drop them entirely
     * instead of letting them slip through with a soft score penalty.
     *
     * Returns `{ passes: false, bucket, reason }` so the caller can bump the
     * matching counter in CampaignMetrics + log a precise reason for the UI.
     */
    private applyHardFilters(
        golden: any,
        screenerExtracted: any,
        dto: CreateCampaignDto,
    ): { passes: boolean; bucket?: string; reason?: string; certificateMatch?: { status: 'verified' | 'unknown'; missing: string[]; verified: string[] } } {
        const sc = (dto.searchCriteria || {}) as any;

        // A) Required certificates — annotate, don't reject.
        // Buyer-listed certs that the supplier publicly advertises → status 'verified'.
        // Anything missing (could be unpublished, per-batch doc, or unknown term) →
        // status 'unknown'. The supplier still passes; UI sorts verified to the top
        // and labels the rest "needs supplier confirmation". A hard reject here drops
        // valid manufacturers whose homepage simply doesn't list every cert.
        const required: string[] = (sc.requiredCertificates || []).map((c: string) => c.trim()).filter(Boolean);
        let certificateMatch: { status: 'verified' | 'unknown'; missing: string[]; verified: string[] } | undefined;
        if (required.length > 0) {
            const found: string[] = [
                ...(golden?.certificates || []),
                ...(screenerExtracted?.certificates || []),
            ];
            const certCheck = checkRequiredCerts(required, found);
            const missingFromHomepage = [...certCheck.missing, ...certCheck.softPass, ...certCheck.unknown];
            const verifiedOnHomepage = required.filter(r => !missingFromHomepage.includes(r) && !certCheck.softPass.includes(r) && !certCheck.unknown.includes(r));
            certificateMatch = {
                status: certCheck.missing.length === 0 ? 'verified' : 'unknown',
                missing: certCheck.missing,
                verified: verifiedOnHomepage,
            };
        }

        // B) MOQ ceiling — supplier MOQ above buyer's tolerance is non-viable.
        const userMoq: number | undefined = sc.moq;
        const supplierMoq: number | undefined = screenerExtracted?.moq ?? golden?.moq;
        if (userMoq && supplierMoq && supplierMoq > userMoq) {
            return { passes: false, bucket: 'HARD_FILTER_MOQ', reason: `supplier MOQ ${supplierMoq} > requested ${userMoq}` };
        }

        // C) Lead-time ceiling.
        const userLeadWeeks: number | undefined = sc.leadTimeWeeks;
        const supplierLeadWeeks: number | undefined = screenerExtracted?.leadTimeWeeks ?? golden?.leadTimeWeeks;
        if (userLeadWeeks && supplierLeadWeeks && supplierLeadWeeks > userLeadWeeks) {
            return { passes: false, bucket: 'HARD_FILTER_LEAD_TIME', reason: `supplier ${supplierLeadWeeks}w > requested ${userLeadWeeks}w` };
        }

        // D) Sourcing geography — nearshore selected but supplier is in offshore Asia.
        const geography: string | undefined = sc.sourcingGeography;
        const country: string = String(golden?.country || screenerExtracted?.country || '').toLowerCase();
        if (geography === 'nearshore') {
            const offshore = ['china', 'chiny', '中国', 'india', 'indie', 'vietnam', 'wietnam', 'thailand', 'tajlandia', 'indonesia', 'indonezja', 'pakistan'];
            if (offshore.some(off => country.includes(off))) {
                return { passes: false, bucket: 'HARD_FILTER_GEOGRAPHY', reason: `${country} is offshore, buyer chose nearshore` };
            }
        }

        // E) Voivodeships (PL construction) — narrow site-level locality.
        const voivodeships: string[] | undefined = sc.voivodeships;
        if (voivodeships && voivodeships.length > 0) {
            const cityRaw: string = String(golden?.city || screenerExtracted?.city || '').toLowerCase();
            // Mapowanie najczęstszych miast PL → kod województwa. Suppliery z miast spoza
            // mapy nie są odrzucane (false negative bezpieczniejszy niż false positive).
            const PL_CITY_VOIV: Record<string, string> = {
                'warszawa': 'MZ', 'warsaw': 'MZ', 'płock': 'MZ', 'radom': 'MZ', 'siedlce': 'MZ',
                'wrocław': 'DS', 'wroclaw': 'DS', 'wałbrzych': 'DS', 'legnica': 'DS', 'jelenia góra': 'DS',
                'kraków': 'MA', 'krakow': 'MA', 'tarnów': 'MA', 'nowy sącz': 'MA',
                'gdańsk': 'PM', 'gdansk': 'PM', 'gdynia': 'PM', 'sopot': 'PM', 'słupsk': 'PM',
                'poznań': 'WP', 'poznan': 'WP', 'kalisz': 'WP', 'konin': 'WP', 'leszno': 'WP',
                'łódź': 'LD', 'lodz': 'LD', 'piotrków': 'LD',
                'katowice': 'SL', 'sosnowiec': 'SL', 'gliwice': 'SL', 'częstochowa': 'SL', 'bytom': 'SL', 'bielsko-biała': 'SL',
                'bydgoszcz': 'KP', 'toruń': 'KP', 'torun': 'KP', 'włocławek': 'KP', 'grudziądz': 'KP',
                'lublin': 'LU', 'chełm': 'LU', 'zamość': 'LU',
                'zielona góra': 'LB', 'gorzów': 'LB',
                'opole': 'OP',
                'rzeszów': 'PK', 'rzeszow': 'PK', 'przemyśl': 'PK',
                'białystok': 'PD', 'bialystok': 'PD', 'łomża': 'PD', 'suwałki': 'PD',
                'kielce': 'SK',
                'olsztyn': 'WN', 'elbląg': 'WN', 'ełk': 'WN',
                'szczecin': 'ZP', 'koszalin': 'ZP', 'stargard': 'ZP',
            };
            const matched = Object.entries(PL_CITY_VOIV).find(([city]) => cityRaw.includes(city));
            const supplierVoiv = matched?.[1];
            if (supplierVoiv && !voivodeships.includes(supplierVoiv)) {
                return { passes: false, bucket: 'HARD_FILTER_VOIVODESHIP', reason: `${cityRaw} is in ${supplierVoiv}, buyer wants ${voivodeships.join(',')}` };
            }
        }

        return { passes: true, certificateMatch };
    }

    private inferLogSeverity(message: string): 'info' | 'warning' | 'error' | 'critical' {
        const m = message.toUpperCase();
        if (m.includes('🚨') || m.includes('CRASH') || m.includes('ZERO_SUPPLIERS')) return 'critical';
        if (m.includes('[ERROR]') || m.includes('FAILED') || m.includes('Error:')) return 'error';
        if (m.includes('⚠️') || m.includes('REJECTED') || m.includes('LOW YIELD') || m.includes('MISMATCH') || m.includes('[BUDGET]')) return 'warning';
        return 'info';
    }

    async create(dto: CreateCampaignDto, userId?: string) {
        const briefMeta = (dto.searchCriteria as any)?.parsedBrief;
        const industry = dto.searchCriteria?.industry || null;
        const sourcingMode = (dto.searchCriteria?.sourcingMode as string | undefined) || null;

        // Auto-pick an industry/mode-matched system default sequence when buyer didn't
        // choose one explicitly — events get an events-specific opener, services get a
        // service opener, product mode gets the classic RFQ template.
        let effectiveSequenceId = dto.sequenceTemplateId || null;
        if (!effectiveSequenceId && sourcingMode) {
            const match = await this.prisma.sequenceTemplate.findFirst({
                where: {
                    isSystem: true,
                    OR: [
                        { industry, sourcingMode },
                        { industry: null, sourcingMode },
                    ],
                },
                orderBy: [{ industry: 'desc' }], // industry-specific first (NULL last)
            });
            if (match) effectiveSequenceId = match.id;
        }

        const campaign = await this.prisma.campaign.create({
            data: {
                name: dto.name || 'New Campaign',
                language: dto.language || 'pl',
                status: 'RUNNING',
                stage: 'STRATEGY',
                sequenceTemplateId: effectiveSequenceId,
                searchCriteria: dto.searchCriteria ? JSON.parse(JSON.stringify(dto.searchCriteria)) : undefined,
                industry: dto.searchCriteria?.industry || null,
                sourcingMode: dto.searchCriteria?.sourcingMode || null,
                brief: dto.searchCriteria?.brief || null,
                parsedBrief: briefMeta ? JSON.parse(JSON.stringify(briefMeta)) : undefined,
            }
        });

        // Always create an RfqRequest shell to maintain campaign-registry linkage
        await this.prisma.rfqRequest.create({
            data: {
                productName: dto.name || 'New RFQ',
                quantity: dto.searchCriteria?.quantity || 0,
                status: 'DRAFT',
                campaignId: campaign.id,
                deliveryLocationId: dto.searchCriteria?.deliveryLocationId || null,
                category: dto.searchCriteria?.category || null,
                material: dto.searchCriteria?.material || null,
                description: dto.searchCriteria?.description || dto.name || null,
                eau: dto.searchCriteria?.eau || null,
                ownerId: userId || null,
                targetPrice: dto.searchCriteria?.targetPrice || null,
                currency: dto.searchCriteria?.currency || 'EUR',
                incoterms: dto.searchCriteria?.incoterms || null,
                paymentTerms: dto.searchCriteria?.paymentTerms || null,
                desiredDeliveryDate: dto.searchCriteria?.desiredDeliveryDate ? new Date(dto.searchCriteria.desiredDeliveryDate) : null,
                offerDeadline: dto.searchCriteria?.offerDeadline ? new Date(dto.searchCriteria.offerDeadline) : null,
            }
        });

        // Fetch user language for translated pipeline output
        // Priority: dto.language (from frontend) > user.language (from DB) > 'pl' (default)
        let userLanguage = dto.language || 'pl';
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { language: true, plan: true, searchCredits: true, organizationId: true },
            });
            if (!dto.language) {
                userLanguage = user?.language || 'pl';
            }

            // Fetch org data for credit check
            let org: { searchCredits: number; plan: string; trialCreditsUsed: boolean } | null = null;
            if (user?.organizationId) {
                org = await this.prisma.organization.findUnique({
                    where: { id: user.organizationId },
                    select: { searchCredits: true, plan: true, trialCreditsUsed: true },
                });
            }

            const effectivePlan = org?.plan ?? user?.plan;

            // Credit check — unlimited plan bypasses
            if (effectivePlan !== 'unlimited') {
                const orgCredits = org?.searchCredits ?? 0;
                const personalCredits = user?.searchCredits ?? 0;

                if (orgCredits <= 0 && personalCredits <= 0) {
                    await this.prisma.rfqRequest.deleteMany({ where: { campaignId: campaign.id } });
                    await this.prisma.campaign.delete({ where: { id: campaign.id } });
                    throw new BadRequestException('Brak kredytów wyszukiwania. Kup pakiet w ustawieniach.');
                }

                // Deduct: org pool first, then personal
                let trialJustEnded = false;
                if (orgCredits > 0 && user?.organizationId) {
                    // Deduct from org shared pool
                    await this.prisma.$transaction(async (tx) => {
                        const updatedOrg = await tx.organization.update({
                            where: { id: user.organizationId! },
                            data: { searchCredits: { decrement: 1 } },
                        });
                        await tx.orgCreditTransaction.create({
                            data: {
                                organizationId: user.organizationId!,
                                userId,
                                amount: -1,
                                type: 'CONSUMPTION',
                                description: `Kampania: ${dto.name || 'New Campaign'}`,
                                campaignId: campaign.id,
                                balanceAfter: updatedOrg.searchCredits,
                            },
                        });

                        if (updatedOrg.searchCredits <= 0 && !updatedOrg.trialCreditsUsed) {
                            await tx.organization.update({
                                where: { id: user.organizationId! },
                                data: { trialCreditsUsed: true },
                            });
                            trialJustEnded = true;
                        }
                    });
                } else {
                    // Fallback: deduct from personal credits
                    await this.prisma.$transaction(async (tx) => {
                        await tx.user.update({ where: { id: userId }, data: { searchCredits: { decrement: 1 } } });
                        const updated = await tx.user.findUnique({
                            where: { id: userId },
                            select: { searchCredits: true, trialCreditsUsed: true },
                        });
                        await tx.creditTransaction.create({
                            data: {
                                userId,
                                amount: -1,
                                type: 'CONSUMPTION',
                                description: `Kampania: ${dto.name || 'New Campaign'}`,
                                campaignId: campaign.id,
                                balanceAfter: updated?.searchCredits ?? 0,
                            },
                        });

                        if ((updated?.searchCredits ?? 0) <= 0 && !updated?.trialCreditsUsed) {
                            await tx.user.update({
                                where: { id: userId },
                                data: { trialCreditsUsed: true },
                            });
                            trialJustEnded = true;
                        }
                    });
                }

                // Send trial ended email (outside transaction, non-blocking)
                if (trialJustEnded) {
                    const freshUser = await this.prisma.user.findUnique({
                        where: { id: userId },
                        select: { email: true, name: true, language: true },
                    });
                    if (freshUser) {
                        this.emailService.sendTrialEndedEmail(
                            freshUser.email, freshUser.name, freshUser.language,
                        ).catch(e => this.logger.error('Trial ended email failed', e));

                        this.observability.recordEvent('conversion', 'trial_exhausted', 'warning', {
                            title: `Trial wyczerpany: ${freshUser.name || freshUser.email}`,
                            userId,
                            userEmail: freshUser.email,
                        }).catch(() => {});

                        // SalesOps: notify about trial credits exhausted
                        this.salesOps.handleTrialCreditsExhausted({
                            email: freshUser.email,
                            name: freshUser.name || freshUser.email,
                            campaignName: dto.name || 'New Campaign',
                        }).catch(e => this.logger.warn(`Sales ops trial exhausted notification failed: ${e.message}`));
                    }
                }
            }
        }

        // PRE-FLIGHT HEALTH CHECK — verify Gemini + Serper actually respond before
        // we kick off the pipeline. If either external service is down, mark campaign
        // PENDING_INFRA and don't start. Saves Serper credits when Gemini is down (and
        // vice versa), and gives the user a clear "service temporarily unavailable"
        // status instead of a half-failed campaign with random 0-N suppliers.
        const [geminiOk, serperOk] = await Promise.all([
            this.geminiService.isLiveHealthy().catch(() => false),
            this.searchService.isLiveHealthy().catch(() => false),
        ]);
        if (!geminiOk || !serperOk) {
            const reasons: string[] = [];
            if (!geminiOk) reasons.push('AI generation (Gemini)');
            if (!serperOk) reasons.push('search (Serper)');
            const reason = `Service temporarily unavailable: ${reasons.join(' + ')}. We'll auto-resume the campaign as soon as the service is back.`;
            await this.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'PENDING_INFRA', stage: 'WAITING_FOR_INFRA' },
            });
            await this.log(campaign.id, `[PRE-FLIGHT] ${reason}`);
            this.observability.recordEvent('campaign', 'preflight_unhealthy', 'warning', {
                title: `Campaign ${campaign.name || campaign.id} paused — infra unhealthy`,
                campaignId: campaign.id,
                message: reason,
            }).catch(() => {});
            return { id: campaign.id, status: 'PENDING_INFRA', reason };
        }

        // Run async to not block request
        this.runMultimodalPipeline(campaign.id, dto, userLanguage).catch(async err => {
            this.logger.error(`Campaign ${campaign.id} failed`, err);
            await this.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'FAILED' }
            });
            await this.log(campaign.id, `Error: ${err.message}`);
            this.sourcingGateway?.emitError(campaign.id, err.message);
            this.observability.recordEvent('campaign', 'pipeline_crash', 'critical', {
                title: `Pipeline crash: ${campaign.name || campaign.id}`,
                campaignId: campaign.id,
                message: err.message?.substring(0, 500),
            }).catch(() => {});
        });

        return { id: campaign.id, status: 'STARTED' };
    }

    async findAll(filters?: { status?: string; search?: string }, userId?: string, pagination?: { page: number; pageSize: number }) {
        const where: any = { deletedAt: null };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }

        // Organization isolation + sharing-aware filtering (via TenantContext)
        if (userId) {
            const tenant = await this.tenantContext.resolve(userId);
            where.rfqRequest = tenant.campaignOwnerFilter();
        }

        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 50;
        const skip = (page - 1) * pageSize;

        const [campaigns, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where,
                include: {
                    _count: {
                        select: { suppliers: true }
                    },
                    suppliers: {
                        select: {
                            id: true,
                            name: true,
                            country: true,
                            website: true,
                            contactEmails: true,
                            contacts: {
                                select: {
                                    name: true,
                                    role: true,
                                    email: true,
                                    phone: true
                                }
                            },
                            originLanguage: true,
                            originCountry: true
                        }
                    },
                    rfqRequest: {
                        select: {
                            id: true,
                            publicId: true,
                            productName: true,
                            status: true,
                            _count: { select: { offers: true } },
                            offers: {
                                where: { status: { in: ['PENDING', 'SUBMITTED', 'VIEWED'] } },
                                select: { id: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.campaign.count({ where }),
        ]);

        const data = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            stage: c.stage,
            createdAt: c.createdAt,
            rfqRequestId: c.rfqRequest?.id || null,
            rfqRequest: c.rfqRequest || null,
            stats: {
                suppliersFound: c._count.suppliers,
                // Show 0 qualified suppliers while RUNNING or COMPLETED (awaiting user review)
                // Only count suppliers with emails after campaign is ACCEPTED
                suppliersContacted: (c.status === 'RUNNING' || c.status === 'COMPLETED')
                    ? 0
                    : c.suppliers.filter(s => s.contactEmails && s.contactEmails.length > 0).length,
                offersReceived: (c.rfqRequest as any)?._count?.offers || 0,
                pendingOffers: (c.rfqRequest as any)?.offers?.length || 0,
            },
            tags: [...new Set(c.suppliers.map(s => s.originCountry).filter(Boolean))]
        }));
        return { data, total, page, pageSize };
    }

    async findOne(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    where: { deletedAt: null },
                    include: { contacts: true },
                    orderBy: { analysisScore: 'desc' },
                },
                logs: { orderBy: { timestamp: 'asc' } }
            }
        });

        if (!campaign) return { status: 'NOT_FOUND' };

        return {
            ...campaign,
            logs: campaign.logs.map(l => l.message),
            results: campaign.suppliers.map(s => ({
                ...s,
                analysis: {
                    suitabilityScore: s.analysisScore || 0,
                    reasoning: s.analysisReason || ''
                }
            }))
        };
    }

    /**
     * 5.6 INTELLIGENT RE-RUN — create new campaign based on original's searchCriteria,
     * excluding already-found suppliers. Triggered when < 100 suppliers or user wants more.
     */
    async rerunCampaign(originalId: string, userId?: string) {
        const original = await this.prisma.campaign.findUnique({
            where: { id: originalId },
            select: { name: true, language: true, searchCriteria: true, sequenceTemplateId: true, suppliers: { select: { website: true }, where: { deletedAt: null } } },
        });
        if (!original) throw new NotFoundException(`Campaign ${originalId} not found`);
        if (!original.searchCriteria) throw new BadRequestException('Original campaign has no searchCriteria — cannot re-run');

        const sc = original.searchCriteria as any;

        // Build new DTO, reusing original searchCriteria
        const newDto: CreateCampaignDto = {
            name: `${original.name} (re-run)`,
            language: original.language,
            sequenceTemplateId: original.sequenceTemplateId || undefined,
            searchCriteria: sc,
        };

        // Create new campaign
        const result = await this.create(newDto, userId);

        // Log linkage
        await this.log(result.id, `[RE-RUN] Based on campaign ${originalId}. Original had ${original.suppliers.length} suppliers. Excluded domains will be deduplicated via CompanyRegistry.`);

        return { ...result, rerunOf: originalId };
    }

    // Customer-support path: given a user's email, soft-delete their most recent
    // campaign and re-run it under their own userId, then send an apology email.
    // Used after a platform-side pipeline failure where the user shouldn't have
    // to click anything. Callable only from the admin-guarded controller route.
    async adminRerunForUser(email: string, originalCampaignId?: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, language: true },
        });
        if (!user) throw new NotFoundException(`User with email ${email} not found`);

        // Campaign ownership is indirect: Campaign.rfqRequest.ownerId points to User
        const original = originalCampaignId
            ? await this.prisma.campaign.findFirst({
                where: { id: originalCampaignId, deletedAt: null, rfqRequest: { ownerId: user.id } },
                select: { id: true, name: true, language: true, searchCriteria: true, sequenceTemplateId: true },
            })
            : await this.prisma.campaign.findFirst({
                where: { deletedAt: null, rfqRequest: { ownerId: user.id } },
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, language: true, searchCriteria: true, sequenceTemplateId: true },
            });
        if (!original) throw new NotFoundException(`No campaign found for ${email}`);
        if (!original.searchCriteria) throw new BadRequestException(`Original campaign ${original.id} has no searchCriteria`);

        // Soft-delete original so the user's dashboard shows only the new run
        await this.prisma.campaign.update({
            where: { id: original.id },
            data: { deletedAt: new Date() },
        });

        // Re-run as the original owner (not as the calling admin)
        const newDto: CreateCampaignDto = {
            name: original.name,
            language: original.language || undefined,
            sequenceTemplateId: original.sequenceTemplateId || undefined,
            searchCriteria: original.searchCriteria as any,
        };
        const created = await this.create(newDto, user.id);
        await this.log(created.id, `[ADMIN RE-RUN] Support-triggered rerun of ${original.id} for ${email} after platform failure`);

        // Apology email — fire-and-forget, don't block the response
        this.emailService.sendCampaignRerunApologyEmail(
            user.email,
            original.name,
            user.language || original.language || undefined,
        ).catch(err => this.logger.error(`Apology email failed for ${email}: ${err.message}`));

        return {
            originalCampaignId: original.id,
            newCampaignId: created.id,
            userId: user.id,
            userEmail: user.email,
            apologyEmailSent: true,
        };
    }

    /**
     * 4.2 CAMPAIGN HEALTH DASHBOARD — overview of running + recent campaigns for operations
     */
    async getCampaignHealth() {
        const [running, recentCompleted, zeroSupplierAlerts] = await Promise.all([
            // Running campaigns
            this.prisma.campaign.findMany({
                where: { status: 'RUNNING', deletedAt: null },
                select: { id: true, name: true, createdAt: true, stage: true, _count: { select: { suppliers: true } } },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            // Recent completed (last 30 days)
            this.prisma.campaign.findMany({
                where: { status: { in: ['COMPLETED', 'ACCEPTED'] }, deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                select: { id: true, name: true, createdAt: true, updatedAt: true, _count: { select: { suppliers: true } }, metrics: true },
                orderBy: { updatedAt: 'desc' },
                take: 20,
            }),
            // Zero supplier campaigns (last 7 days)
            this.prisma.campaign.findMany({
                where: {
                    status: { in: ['COMPLETED', 'FAILED'] },
                    deletedAt: null,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    suppliers: { none: {} },
                },
                select: { id: true, name: true, createdAt: true, status: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        // Compute averages from recent campaigns with metrics
        const metricsArr = recentCompleted.filter(c => c.metrics).map(c => c.metrics!);
        const avgSuppliers = recentCompleted.length > 0
            ? Math.round(recentCompleted.reduce((s, c) => s + c._count.suppliers, 0) / recentCompleted.length) : 0;
        const avgDuration = metricsArr.length > 0
            ? Math.round(metricsArr.reduce((s, m) => s + (m.totalDurationMs || 0), 0) / metricsArr.length / 1000) : 0;

        return {
            running: running.map(c => ({
                id: c.id, name: c.name, startedAt: c.createdAt, stage: c.stage,
                suppliers: c._count.suppliers,
                elapsed: `${Math.round((Date.now() - c.createdAt.getTime()) / 60000)}m`,
            })),
            recentCompleted: recentCompleted.map(c => ({
                id: c.id, name: c.name, completedAt: c.updatedAt,
                suppliers: c._count.suppliers,
                duration: c.metrics?.totalDurationMs ? `${Math.round(c.metrics.totalDurationMs / 60000)}m` : '?',
                lowYield: c.metrics?.lowYieldModeUsed || false,
            })),
            alerts: zeroSupplierAlerts.map(c => ({
                type: 'zero_suppliers', campaignId: c.id, name: c.name, completedAt: c.createdAt, status: c.status,
            })),
            averages: {
                avgSuppliersPerCampaign: avgSuppliers,
                avgDurationSeconds: avgDuration,
                totalCampaigns30d: recentCompleted.length,
                zeroSupplierCount7d: zeroSupplierAlerts.length,
            },
        };
    }

    async updateCampaign(id: string, data: { name?: string }) {
        return this.prisma.campaign.update({
            where: { id },
            data,
        });
    }

    /**
     * Clone a campaign: copies searchCriteria + RFQ product details, then auto-starts a new campaign.
     */
    async cloneCampaign(campaignId: string, userId?: string) {
        const source = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { rfqRequest: true },
        });
        if (!source) throw new NotFoundException('Campaign not found');

        const searchCriteria = source.searchCriteria
            ? JSON.parse(JSON.stringify(source.searchCriteria))
            : undefined;

        // Reconstruct the DTO that `create()` expects
        const cloneDto: CreateCampaignDto = {
            name: `${source.name} (copy)`,
            language: source.language || 'pl',
            sequenceTemplateId: source.sequenceTemplateId || undefined,
            searchCriteria,
        };

        // Delegate to the regular create method which handles credit checks, RFQ creation, and pipeline launch
        return this.create(cloneDto, userId);
    }

    async softDelete(id: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign) throw new NotFoundException('Campaign not found');
        await this.prisma.campaign.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
        return { success: true };
    }

    async exportCSV(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    where: { deletedAt: null },
                    include: { contacts: true },
                },
            },
        });
        if (!campaign) throw new NotFoundException('Campaign not found');

        // Create Excel-friendly data rows
        const rows = campaign.suppliers.map(s => ({
            'Company Name': s.name || '',
            'Website': s.website || '',
            'Country': s.country || '',
            'City': s.city || '',
            'Contact Emails': s.contactEmails || '',
            'Analysis Score': s.analysisScore || 0,
            'Reason': s.analysisReason || '',
            'Specialization': s.specialization || '',
            'Certificates': s.certificates || '',
            'Employee Count': s.employeeCount || '',
        }));

        // Generate Excel workbook
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

        return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.campaign.update({
            where: { id },
            data: { status }
        });
    }

    async stopCampaign(id: string) {
        this.cancelledCampaigns.add(id);
        await this.log(id, `[STOP] Campaign manually stopped by user`);
        await this.prisma.campaign.update({
            where: { id },
            data: { status: 'STOPPED' },
        });
        this.sourcingGateway?.emitCompleted(id, 'STOPPED');
        return { success: true, message: 'Campaign stop signal sent' };
    }

    private shouldStop(campaignId: string, qualifiedCount: number): string | null {
        if (this.cancelledCampaigns.has(campaignId)) return 'USER_STOPPED';
        const startTime = this.campaignStartTimes.get(campaignId);
        if (startTime && Date.now() - startTime > this.PIPELINE_TIMEOUT_MS) return 'TIMEOUT';
        if (qualifiedCount >= this.PIPELINE_SUPPLIER_LIMIT) return 'SUPPLIER_LIMIT';
        return null;
    }

    /**
     * Promise.allSettled with a campaign-aware timeout.
     * Returns early if timeout expires — remaining promises treated as rejected.
     */
    private allSettledWithTimeout<T>(
        promises: Promise<T>[],
        maxMs: number,
        campaignId: string,
    ): Promise<PromiseSettledResult<T>[]> {
        if (promises.length === 0) return Promise.resolve([]);

        const startTime = this.campaignStartTimes.get(campaignId);
        const elapsed = startTime ? Date.now() - startTime : 0;
        const remaining = Math.max(0, this.PIPELINE_TIMEOUT_MS - elapsed);
        const effectiveTimeout = Math.min(maxMs, remaining);

        if (effectiveTimeout <= 0) {
            return Promise.resolve(
                promises.map(() => ({
                    status: 'rejected' as const,
                    reason: new Error('Pipeline timeout exceeded'),
                }))
            );
        }

        return Promise.race([
            Promise.allSettled(promises),
            new Promise<PromiseSettledResult<T>[]>((resolve) =>
                setTimeout(() => {
                    this.logger.warn(`[${campaignId}] allSettledWithTimeout: ${effectiveTimeout}ms elapsed, resolving early`);
                    // Signal queued URLs to bail out immediately
                    this.campaignAbortControllers.get(campaignId)?.abort();
                    resolve(
                        promises.map(() => ({
                            status: 'rejected' as const,
                            reason: new Error('Timeout waiting for promise'),
                        }))
                    );
                }, effectiveTimeout)
            ),
        ]);
    }

    /**
     * Wrap a promise with a timeout. Rejects with descriptive error if timeout exceeded.
     */
    private withUrlTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Per-URL timeout (${ms}ms): ${label}`));
            }, ms);
            promise.then(
                val => { clearTimeout(timer); resolve(val); },
                err => { clearTimeout(timer); reject(err); }
            );
        });
    }

    async getLogs(campaignId: string, since?: string) {
        const whereClause: any = { campaignId };

        if (since) {
            whereClause.timestamp = {
                gt: new Date(since)
            };
        }

        const logs = await this.prisma.log.findMany({
            where: whereClause,
            orderBy: { timestamp: 'asc' },
            select: {
                message: true,
                timestamp: true
            }
        });

        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                status: true,
                stage: true,
                _count: {
                    select: { suppliers: true }
                }
            }
        });

        // Fetch suppliers for real-time polling feed
        const suppliers = await this.prisma.supplier.findMany({
            where: { campaignId },
            include: { contacts: true },
            orderBy: { analysisScore: 'desc' },
        });

        return {
            logs: logs.map(l => ({
                message: l.message,
                timestamp: l.timestamp
            })),
            status: campaign?.status || 'UNKNOWN',
            stage: campaign?.stage || 'UNKNOWN',
            suppliersFound: campaign?._count.suppliers || 0,
            suppliers: suppliers.map(s => ({
                ...s,
                analysisScore: s.analysisScore || 0,
                analysisReason: s.analysisReason || '',
            })),
        };
    }

    /**
     * ========================================
     * PRODUCT CONTEXT ANALYSIS (Phase 0)
     * ========================================
     * Single Gemini call that analyzes product semantics to distinguish
     * companies that PRODUCE the target product from those that merely USE it.
     * Returns null on failure — pipeline proceeds without disambiguation.
     */
    private async analyzeProductContext(dto: CreateCampaignDto, cleanProductName: string): Promise<ProductContext | null> {
        try {
            const prompt = `
You are a Product Semantics Analyst. Analyze the following product request and provide disambiguation context.

PRODUCT NAME: "${cleanProductName}"
DESCRIPTION: "${dto.searchCriteria?.description || cleanProductName || ''}"
KEYWORDS: [${(dto.searchCriteria?.keywords || []).join(', ')}]
CATEGORY: "${dto.searchCriteria?.category || dto.searchCriteria?.industry || ''}"
MATERIAL: "${dto.searchCriteria?.material || ''}"

YOUR TASK:
1. Identify the CORE PRODUCT the user wants to source (not ambiguous specification attributes)
2. Identify AMBIGUOUS TERMS that could match wrong companies (e.g., "RAL 9005" is a color code used everywhere, not specific to paint)
3. Generate POSITIVE SIGNALS — keywords that indicate a company PRODUCES this product
4. Generate NEGATIVE SIGNALS — keywords that indicate a company USES this product but doesn't produce it
5. Provide a disambiguation note explaining potential confusion
6. Translate the product name for key languages (de, pl, en, fr, it, es, cs)
7. List INDUSTRY ASSOCIATIONS related to this product (international and regional)
8. List MAJOR TRADE SHOWS / EXHIBITIONS for this product category
9. List ALTERNATIVE NAMES this product goes by in the industry (synonyms, trade names)
10. Identify SUPPLY CHAIN POSITION (raw material, component, sub-assembly, finished good)

EXAMPLES:
- "farba RAL 9005" → core product is "powder paint / farba proszkowa", RAL 9005 is just a color code
  - Positive: ["paint manufacturer", "powder coating producer", "lakiernia proszkowa", "Pulverlack Hersteller"]
  - Negative: ["door manufacturer", "window frames", "roofing", "producent drzwi", "producent okien"]
  - Associations: ["European Powder Coating Association", "Stowarzyszenie Producentów Farb i Lakierów"]
  - Trade shows: ["PaintExpo", "European Coatings Show"]
  - Alternative names: ["powder paint", "thermosetting paint", "farba elektrostatyczna", "Pulverlack"]
- "śruba M8x40" → core product is "śruba / bolt / screw", M8x40 is a dimension spec
  - Positive: ["fastener manufacturer", "producent śrub", "Schraubenhersteller"]
  - Negative: ["furniture assembly", "montaż mebli"]

OUTPUT FORMAT (JSON only):
{
  "coreProduct": "the actual product being sourced (bilingual: native + English)",
  "productCategory": "broad industry category",
  "specAttributes": ["list of specification attributes that are ambiguous"],
  "positiveSignals": ["5-10 keywords indicating PRODUCER of this product, in relevant languages"],
  "negativeSignals": ["5-10 keywords indicating companies that USE but don't PRODUCE this product"],
  "disambiguationNote": "1-2 sentence explanation of why search results might be confused",
  "productTranslations": {"de": "German name", "pl": "Polish name", "en": "English name", "fr": "French name", "it": "Italian name", "es": "Spanish name", "cs": "Czech name"},
  "industryAssociations": ["3-5 relevant industry associations (international + regional)"],
  "majorTradeShows": ["3-5 major trade fairs/exhibitions for this product category"],
  "alternativeNames": ["3-7 alternative names / synonyms / trade names for this product"],
  "supplyChainPosition": "raw material | component | sub-assembly | finished good"
}
`;

            const responseText = await this.geminiService.generateContent(prompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonString);

            // Validate required fields
            if (!parsed.coreProduct || !parsed.productCategory) {
                this.logger.warn('[CONTEXT] Product context response missing required fields');
                return null;
            }

            return {
                coreProduct: parsed.coreProduct || '',
                productCategory: parsed.productCategory || '',
                specAttributes: Array.isArray(parsed.specAttributes) ? parsed.specAttributes : [],
                positiveSignals: Array.isArray(parsed.positiveSignals) ? parsed.positiveSignals : [],
                negativeSignals: Array.isArray(parsed.negativeSignals) ? parsed.negativeSignals : [],
                disambiguationNote: parsed.disambiguationNote || '',
                productTranslations: parsed.productTranslations || {},
                industryAssociations: Array.isArray(parsed.industryAssociations) ? parsed.industryAssociations : [],
                majorTradeShows: Array.isArray(parsed.majorTradeShows) ? parsed.majorTradeShows : [],
                alternativeNames: Array.isArray(parsed.alternativeNames) ? parsed.alternativeNames : [],
                supplyChainPosition: parsed.supplyChainPosition || '',
            } as ProductContext;
        } catch (e) {
            this.logger.error(`[CONTEXT] Product context analysis failed: ${e.message}`);
            return null; // Safe fallback — pipeline continues without disambiguation
        }
    }

    /**
     * ========================================
     * MULTIMODAL PARALLEL PIPELINE
     * ========================================
     * Architecture:
     * 1. Strategy Agent generates language-specific strategies
     * 2. For EACH language strategy, spawn a parallel worker
     * 3. Each worker executes FULL pipeline (Search → Explorer → Analyst → Enrichment → Auditor)
     * 4. All workers run SIMULTANEOUSLY (Promise.allSettled)
     * 5. Aggregate and deduplicate results
     */
    private async runMultimodalPipeline(id: string, dto: CreateCampaignDto, userLanguage: string = 'pl') {
        const { searchCriteria } = dto;
        const processedDomains = new Set<string>(); // Global deduplication by domain
        const processedCompanyNames = new Set<string>(); // Global deduplication by company name
        const qualifiedCounter = new AtomicCounter();

        // Register pipeline start time for auto-stop
        this.campaignStartTimes.set(id, Date.now());
        this.cancelledCampaigns.delete(id); // Clear stale cancel flag
        this.campaignLowYield.set(id, false);
        this.campaignStats.set(id, { processedUrls: 0, screenerPassed: 0, auditorApproved: 0, auditorRejected: 0, geminiFallbacks: 0, rejectionReasons: new Map() });
        const abortController = new AbortController();
        this.campaignAbortControllers.set(id, abortController);
        // Dev environment: default to 10 firms. Production (Cloud Functions): default to 300.
        const isDevEnv = !process.env.FUNCTION_TARGET && !process.env.K_SERVICE;
        const MAX_TOTAL_QUALIFIED = parseInt(process.env.MAX_TOTAL_QUALIFIED || (isDevEnv ? '10' : '500'), 10);
        const MAX_PER_LANGUAGE = parseInt(process.env.MAX_PER_LANGUAGE || (isDevEnv ? '5' : '150'), 10);

        await this.log(id, `[CONFIG] Environment: ${isDevEnv ? 'DEV' : 'PROD'}, MAX_TOTAL_QUALIFIED=${MAX_TOTAL_QUALIFIED}, MAX_PER_LANGUAGE=${MAX_PER_LANGUAGE}`);

        // Auto-timeout: shouldStop() checks elapsed time and returns 'TIMEOUT'
        // This timer is a safety net — if pipeline is truly stuck, force completion
        const autoStopTimer = setTimeout(async () => {
            this.logger.warn(`[${id}] TIMEOUT: Pipeline exceeded ${this.PIPELINE_TIMEOUT_MS / 1000}s`);
            await this.log(id, `[TIMEOUT] Pipeline exceeded ${this.PIPELINE_TIMEOUT_MS / 1000}s — finishing current work`).catch(() => {});
            this.observability.recordEvent('campaign', 'pipeline_timeout', 'warning', {
                title: `Kampania przekroczyła timeout (${this.PIPELINE_TIMEOUT_MS / 60000} min)`,
                campaignId: id,
                message: `${qualifiedCounter.value} dostawców znalezionych przed timeout`,
            }).catch(() => {});
            // Safety net: if still RUNNING after extra 60s, force-complete
            setTimeout(async () => {
                try {
                    const current = await this.prisma.campaign.findUnique({ where: { id }, select: { status: true } });
                    if (current && current.status === 'RUNNING') {
                        this.logger.warn(`[${id}] SAFETY-NET: Force-completing stuck campaign`);
                        await this.prisma.campaign.update({
                            where: { id },
                            data: { stage: 'COMPLETED', status: 'COMPLETED' },
                        });
                        this.sourcingGateway?.emitProgress(id, 'COMPLETED', 100);
                        this.sourcingGateway?.emitCompleted(id);
                    }
                } catch (e: any) {
                    this.logger.error(`[${id}] SAFETY-NET DB update failed: ${e.message}`);
                }
            }, 60000);
        }, this.PIPELINE_TIMEOUT_MS);
        this.campaignTimers.set(id, autoStopTimer);

        try {
            // Extract clean product name — strip "Kampania: ..." prefix from ANY source
            const rawProductName = dto.searchCriteria?.keywords?.[0] || dto.name || '';
            const cleanProductName = rawProductName.replace(/^Kampania:\s*/i, '').trim() || rawProductName;

            // E1: GEMINI HEALTH CHECK — verify AI is responsive before investing pipeline time
            const geminiOk = await this.geminiService.checkConnectivity().catch(() => false);
            if (!geminiOk) {
                await this.log(id, `⚠️ Gemini API connectivity check failed — waiting 30s before retrying...`);
                await new Promise(r => setTimeout(r, 30000));
                const retryOk = await this.geminiService.checkConnectivity().catch(() => false);
                if (!retryOk) {
                    await this.log(id, `⚠️ Gemini still unavailable — proceeding with cache/fallbacks`);
                } else {
                    await this.log(id, `✅ Gemini API recovered after 30s wait`);
                }
            }

            // Geocode buyer delivery location for proximity scoring (non-blocking, cached)
            // --- PHASE 0 + 0.5: PRODUCT CONTEXT + MARKET INTELLIGENCE (parallel) ---
            await this.log(id, `🔬 [CONTEXT] Analyzing product semantics + market intelligence in parallel for: "${cleanProductName}"`);
            const rawCategory = dto.searchCriteria?.category || dto.searchCriteria?.industry || '';
            const rawRegion = searchCriteria.region || 'EU';

            const [productContext, knownManufacturersResult] = await Promise.all([
                // Phase 0: Product Context
                this.analyzeProductContext(dto, cleanProductName),
                // Phase 0.5: Market Intelligence (doesn't require productContext)
                (async () => {
                    try {
                        const regionDisplay = rawRegion === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length
                            ? `Selected countries: ${dto.searchCriteria.targetCountries.join(', ')}`
                            : rawRegion;
                        const intelligencePrompt = `
You are a Market Intelligence Analyst specializing in industrial supply chains.

TASK: Identify the TOP known manufacturers/producers of this product in the given region.

PRODUCT: ${cleanProductName}
CATEGORY: ${rawCategory || 'N/A'}
REGION: ${regionDisplay}

Return a JSON array of known manufacturers. Include:
- Regional champions from the specified countries
- Niche specialists operating in those countries
- Global leaders that have production facilities in the specified countries

IMPORTANT: Only include manufacturers that are headquartered in or have production facilities in the specified region/countries. Do NOT include companies from countries not listed above.

Focus on PRODUCERS (companies that MAKE the product), NOT distributors or traders.

Return JSON:
{
  "known_manufacturers": [
    {"name": "Company Name", "country": "ISO-2 code", "website": "https://example.com", "size": "large|medium|small"},
  ]
}

LIMIT: 10-20 most important manufacturers. Quality over quantity.
`;
                        const intelligenceResponse = await this.geminiService.generateContent(intelligencePrompt);
                        const intelligenceJson = JSON.parse(
                            intelligenceResponse.replace(/```json/g, '').replace(/```/g, '').trim()
                        );
                        return intelligenceJson.known_manufacturers || [];
                    } catch (intelligenceErr: any) {
                        await this.log(id, `[INTELLIGENCE] Market intelligence failed (non-fatal): ${intelligenceErr.message}`);
                        return [];
                    }
                })(),
            ]);

            let knownManufacturers: { name: string; country?: string; website?: string; size?: string }[] = knownManufacturersResult;

            if (productContext) {
                await this.log(id, `🔬 [CONTEXT] Core product: "${productContext.coreProduct}"`);
                await this.log(id, `🔬 [CONTEXT] Category: ${productContext.productCategory}`);
                await this.log(id, `🔬 [CONTEXT] Disambiguation: ${productContext.disambiguationNote}`);
                await this.log(id, `🔬 [CONTEXT] Positive signals: [${productContext.positiveSignals.join(', ')}]`);
                await this.log(id, `🔬 [CONTEXT] Negative signals: [${productContext.negativeSignals.join(', ')}]`);
            } else {
                await this.log(id, `⚠️ [CONTEXT] Product context analysis unavailable — pipeline proceeds without disambiguation`);
            }
            await this.log(id, `[INTELLIGENCE] Identified ${knownManufacturers.length} known manufacturers: ${knownManufacturers.map(m => m.name).join(', ')}`);

            // --- PHASE 1: STRATEGY GENERATION ---
            const strategyParams = {
                productName: cleanProductName,
                description: dto.searchCriteria.description || cleanProductName || '',
                keywords: dto.searchCriteria.keywords || [],
                category: dto.searchCriteria.industry || dto.searchCriteria.category || '',
                material: dto.searchCriteria.material || '',
                region: dto.searchCriteria.region || 'EU',
                eau: dto.searchCriteria.eau || 1000,
                productContext: productContext || undefined,
                targetCountries: dto.searchCriteria.targetCountries,
                excludedCountries: dto.searchCriteria.excludedCountries,
                requiredCertificates: dto.searchCriteria.requiredCertificates,
                industry: dto.searchCriteria.industry || undefined,
                sourcingMode: (dto.searchCriteria as any).sourcingMode || undefined,
                city: (dto.searchCriteria as any).city || undefined,
                eventDate: (dto.searchCriteria as any).eventDate || undefined,
                headcount: (dto.searchCriteria as any).headcount || undefined,
                brief: (dto.searchCriteria as any).brief || undefined,
                voivodeships: (dto.searchCriteria as any).voivodeships || undefined,
                moq: (dto.searchCriteria as any).moq || undefined,
                leadTimeWeeks: (dto.searchCriteria as any).leadTimeWeeks || undefined,
                sourcingGeography: (dto.searchCriteria as any).sourcingGeography || undefined,
                industrySubcategory: (dto.searchCriteria as any).industrySubcategory || undefined,
                eventType: (dto.searchCriteria as any).eventType || undefined,
                constructionStage: (dto.searchCriteria as any).constructionStage || undefined,
                horecaVenueType: (dto.searchCriteria as any).horecaVenueType || undefined,
                healthcareRegClass: (dto.searchCriteria as any).healthcareRegClass || undefined,
                mroUrgency: (dto.searchCriteria as any).mroUrgency || undefined,
                logisticsSla: (dto.searchCriteria as any).logisticsSla || undefined,
                mfgTolerance: (dto.searchCriteria as any).mfgTolerance || undefined,
                retailBrandModel: (dto.searchCriteria as any).retailBrandModel || undefined,
            };

            await this.log(id, `🎯 [STRATEGY] Generating multimodal search strategy for region: ${strategyParams.region}`);
            await this.log(id, `📊 [STRATEGY] Product: "${strategyParams.productName}", Material: ${strategyParams.material || 'N/A'}, Category: ${strategyParams.category || 'N/A'}, Keywords: [${strategyParams.keywords.join(', ')}]`);
            let strategyResult = await this.strategyAgent.execute(strategyParams);
            await this.log(id, `✅ [STRATEGY] Generated ${strategyResult.strategies?.length || 0} language-specific strategies`);

            // Retry strategy if Gemini timeout returned empty strategies
            const STRATEGY_RETRIES = 4;
            for (let retry = 1; retry <= STRATEGY_RETRIES && (!strategyResult.strategies || strategyResult.strategies.length === 0); retry++) {
                const backoff = 5000 * Math.pow(2, retry - 1); // 5s, 10s, 20s, 40s
                await this.log(id, `[STRATEGY] ⚠️ Got 0 strategies (likely Gemini timeout). Retry ${retry}/${STRATEGY_RETRIES} after ${backoff / 1000}s...`);
                await new Promise(r => setTimeout(r, backoff));
                strategyResult = await this.strategyAgent.execute(strategyParams);
                await this.log(id, `[STRATEGY] Retry ${retry} returned ${strategyResult.strategies?.length || 0} strategies`);
            }

            // SMART ABORT — if all 4 strategy retries exhausted and we still have nothing,
            // Gemini is down. Don't continue to fallback queries that burn Serper budget for
            // a campaign that won't have any meaningful AI screening anyway. Mark as
            // PENDING_INFRA and exit so the user gets a clear "we'll resume when AI is back"
            // signal instead of a 0-supplier campaign.
            if (!strategyResult.strategies || strategyResult.strategies.length === 0) {
                await this.log(id, `[STRATEGY] ❌ All ${STRATEGY_RETRIES} retries exhausted — Gemini unhealthy. Aborting before burning Serper credits.`);
                await this.prisma.campaign.update({
                    where: { id },
                    data: { status: 'PENDING_INFRA', stage: 'WAITING_FOR_INFRA' },
                });
                this.observability.recordEvent('campaign', 'aborted_gemini_down', 'warning', {
                    title: `Campaign ${id} aborted — Gemini unavailable after ${STRATEGY_RETRIES} retries`,
                    campaignId: id,
                    message: 'Search budget preserved. Will auto-resume when Gemini health check passes.',
                }).catch(() => {});
                this.sourcingGateway?.emitError(id, 'Gemini AI service is temporarily unavailable. Your campaign is paused and will resume automatically.');
                return;
            }

            this.sourcingGateway?.emitProgress(id, 'STRATEGY', 100);

            // Check timeout after strategy generation
            const stopAfterStrategy = this.shouldStop(id, qualifiedCounter.value);
            if (stopAfterStrategy) {
                const elapsed = Math.round((Date.now() - (this.campaignStartTimes.get(id) || Date.now())) / 1000);
                await this.log(id, `[STOP] Pipeline stopped after Strategy: ${stopAfterStrategy} (${elapsed}s elapsed)`);
                await this.prisma.campaign.update({ where: { id }, data: { stage: 'COMPLETED', status: 'COMPLETED' } });
                this.sourcingGateway?.emitProgress(id, 'COMPLETED', 100);
                this.sourcingGateway?.emitCompleted(id);
                return;
            }

            // Extract language strategies
            const languageStrategies = strategyResult.strategies || [];

            if (languageStrategies.length === 0) {
                await this.log(id, `[ERROR] No language strategies generated. Using fallback.`);

                // Build meaningful fallback queries from campaign data
                const keywords = dto.searchCriteria.keywords?.filter(Boolean) || [];
                const material = dto.searchCriteria.material;
                const category = dto.searchCriteria.category || dto.searchCriteria.industry;
                const description = dto.searchCriteria.description;
                const region = dto.searchCriteria.region || 'EU';

                const fallbackQueries: string[] = [];
                const negatives = ['-amazon', '-ebay', '-aliexpress', '-alibaba', '-allegro'];

                // Build queries from available data
                if (keywords.length > 0) {
                    fallbackQueries.push(`${keywords.join(' ')} manufacturer producer`);
                }
                if (material && description) {
                    fallbackQueries.push(`"${material}" "${description}" manufacturer`);
                }
                if (category) {
                    fallbackQueries.push(`${category} ${material || ''} manufacturer supplier`.trim());
                }
                if (description) {
                    fallbackQueries.push(`${description} producer manufacturer`);
                }

                // Ensure at least one query exists
                if (fallbackQueries.length === 0) {
                    fallbackQueries.push('manufacturer producer supplier');
                }

                // Add region-specific strategies
                if (region === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length) {
                    // Build fallback from selected countries' languages
                    const countryLangMap: Record<string, { langs: string[]; country: string }> = {
                        'PL': { langs: ['pl'], country: 'Polska' },
                        'DE': { langs: ['de'], country: 'Niemcy' },
                        'CZ': { langs: ['cs'], country: 'Czechy' },
                        'SK': { langs: ['cs'], country: 'Słowacja' },
                        'AT': { langs: ['de'], country: 'Austria' },
                        'FR': { langs: ['fr'], country: 'Francja' },
                        'IT': { langs: ['it'], country: 'Włochy' },
                        'ES': { langs: ['es'], country: 'Hiszpania' },
                        'PT': { langs: ['pt'], country: 'Portugalia' },
                        'NL': { langs: ['nl'], country: 'Holandia' },
                        'BE': { langs: ['nl', 'fr'], country: 'Belgia' },
                        'SE': { langs: ['sv'], country: 'Szwecja' },
                        'RO': { langs: ['ro'], country: 'Rumunia' },
                        'DK': { langs: ['da'], country: 'Dania' },
                        'FI': { langs: ['fi'], country: 'Finlandia' },
                        'HU': { langs: ['hu'], country: 'Węgry' },
                        'BG': { langs: ['bg'], country: 'Bułgaria' },
                        'HR': { langs: ['hr'], country: 'Chorwacja' },
                        'SI': { langs: ['sl'], country: 'Słowenia' },
                        'LT': { langs: ['lt'], country: 'Litwa' },
                        'LV': { langs: ['lv'], country: 'Łotwa' },
                        'EE': { langs: ['et'], country: 'Estonia' },
                        'GR': { langs: ['el'], country: 'Grecja' },
                        'IE': { langs: ['en'], country: 'Irlandia' },
                    };
                    const addedLangs = new Set<string>();
                    for (const code of dto.searchCriteria.targetCountries) {
                        const info = countryLangMap[code];
                        if (info) {
                            for (const lang of info.langs) {
                                if (!addedLangs.has(lang)) {
                                    addedLangs.add(lang);
                                    languageStrategies.push({
                                        country: info.country,
                                        language: lang,
                                        queries: fallbackQueries,
                                        negatives: lang === 'pl' ? [...negatives, '-olx', '-ceneo'] : negatives,
                                    });
                                }
                            }
                        }
                    }
                    // Add English fallback only if no languages resolved
                    if (addedLangs.size === 0) {
                        languageStrategies.push({
                            country: 'Global',
                            language: 'en',
                            queries: fallbackQueries,
                            negatives,
                        });
                    }
                } else if (region === 'PL') {
                    // PL fallback — only Polish, no Global/EN worker
                    const plQueries = fallbackQueries.map(q => q.replace(/manufacturer/g, 'producent').replace(/producer/g, 'producent'));
                    languageStrategies.push({
                        country: 'Polska',
                        language: 'pl',
                        queries: plQueries,
                        negatives: [...negatives, '-olx', '-ceneo'],
                    });
                } else if (region === 'EU') {
                    const plQueries = fallbackQueries.map(q => q.replace(/manufacturer/g, 'producent').replace(/producer/g, 'producent'));
                    languageStrategies.push({
                        country: 'Polska',
                        language: 'pl',
                        queries: plQueries,
                        negatives: [...negatives, '-olx', '-ceneo'],
                    });
                    languageStrategies.push({
                        country: 'Global',
                        language: 'en',
                        queries: fallbackQueries,
                        negatives,
                    });
                } else {
                    // GLOBAL, GLOBAL_NO_CN or unknown — top 7 languages for maximum coverage
                    const globalFallbacks = [
                        { country: 'USA', language: 'en' },
                        { country: 'Germany', language: 'de' },
                        { country: 'France', language: 'fr' },
                        { country: 'Italy', language: 'it' },
                        { country: 'Japan', language: 'ja' },
                        { country: 'South Korea', language: 'ko' },
                        { country: 'Poland', language: 'pl' },
                    ];
                    for (const fb of globalFallbacks) {
                        languageStrategies.push({
                            country: fb.country,
                            language: fb.language,
                            queries: fallbackQueries,
                            negatives: fb.language === 'pl'
                                ? [...negatives, '-olx', '-ceneo']
                                : negatives,
                        });
                    }
                }

                await this.log(id, `[FALLBACK] Generated ${languageStrategies.length} fallback strategies with ${fallbackQueries.length} queries each`);
            }

            // --- PHASE 2: STREAMING ARCHITECTURE (Search + Process simultaneously) ---
            const optimizedStrategies = languageStrategies;

            // Adaptive parallelism for search phase
            const maxWorkerLimit = parseInt(process.env.MAX_WORKER_LIMIT || '20', 10);
            const effectiveWorkers = Math.min(optimizedStrategies.length, maxWorkerLimit);
            const searchWorkerLimit = pLimit(effectiveWorkers);

            // Per-worker budget reservation
            const totalBudget = this.searchService.getRemainingBudget(id, 'main');
            const budgetPerWorker = Math.max(3, Math.floor(totalBudget / optimizedStrategies.length));
            await this.log(id, `🔍 [PHASE 2] Starting streaming pipeline: ${optimizedStrategies.length} strategies (${effectiveWorkers} parallel), budget: ${totalBudget} total, ${budgetPerWorker} per worker`);

            // Streaming: process URLs as they arrive from search workers
            const globalSeenDomains = new Set<string>();
            const processingPromises: Promise<number>[] = [];
            let processedCount = 0;
            let totalCollected = 0;
            const perCountryCollected = new Map<string, number>();

            const processUrlImmediately = (item: CollectedUrl) => {
                const domain = this.extractDomain(item.url);
                if (globalSeenDomains.has(domain)) return;
                globalSeenDomains.add(domain);
                processedDomains.add(domain);

                // Track per-country stats for expansion
                perCountryCollected.set(item.workerTag, (perCountryCollected.get(item.workerTag) || 0) + 1);

                const PER_URL_TIMEOUT_MS = parseInt(process.env.PER_URL_TIMEOUT_MS || '90000', 10);
                // Early exit before waiting for pLimit slot (avoids wasting queue time after timeout)
                if (abortController.signal.aborted) return;
                const p = this.urlLimit(async () => {
                    if (abortController.signal.aborted) return 0;
                    const stopReason = this.shouldStop(id, qualifiedCounter.value);
                    if (stopReason) {
                        if (!abortController.signal.aborted) abortController.abort();
                        return 0;
                    }
                    if (!qualifiedCounter.tryReserve(MAX_TOTAL_QUALIFIED)) return 0;
                    let result: number;
                    try {
                        result = await this.withUrlTimeout(
                            this.processSupplierUrl(
                                id, dto, item.url, item.workerTag,
                                processedCompanyNames, item.originLanguage, item.originCountry,
                                productContext || undefined, processedDomains, 0,
                                userLanguage, knownManufacturers
                            ),
                            PER_URL_TIMEOUT_MS,
                            item.url
                        );
                    } catch (err: any) {
                        if (err.message?.includes('Per-URL timeout')) {
                            this.logger.warn(`[${id}] ${item.url} exceeded per-URL timeout (${PER_URL_TIMEOUT_MS}ms)`);
                        }
                        result = 0;
                    }
                    if (result <= 0) {
                        qualifiedCounter.release();
                    }
                    processedCount++;
                    if (processedCount % 50 === 0) {
                        await this.log(id, `[PHASE 2] Progress: ${processedCount} processed — qualified: ${qualifiedCounter.value}`);
                        this.sourcingGateway?.emitProgress(id, 'PROCESSING', Math.min(90, Math.round((processedCount / Math.max(totalCollected, 1)) * 100)));
                    }
                    return result;
                });
                processingPromises.push(p);
            };

            // Search workers collect URLs and stream them to processing per-query (interleaved across countries)
            const searchPromises = optimizedStrategies.map(langStrategy =>
                searchWorkerLimit(async () => {
                    const urls = await this.collectUrlsForStrategy(
                        id,
                        langStrategy,
                        budgetPerWorker,
                        (item: CollectedUrl) => {
                            totalCollected++;
                            processUrlImmediately(item);
                        },
                    );
                    return urls;
                })
            );

            // Wait for search workers (5 min max — gives 30-50 queries × 1-3s each
            // per worker time to actually complete. Was 3 min; under Serper TLS retries
            // queries can take 15-30s in worst case, so 3 min was cutting search short).
            await this.allSettledWithTimeout(searchPromises, 300_000, id);
            this.sourcingGateway?.emitProgress(id, 'SEARCH', 100);
            await this.log(id, `✅ [PHASE 2] Search complete: ${totalCollected} URLs collected, ${globalSeenDomains.size} unique. Waiting for processing to finish...`);

            // Wait for URL processing — dynamic timeout, but tighter:
            // Base: 4 min (was 10). Scale: 1s per URL (was 1.5s). Cap: 10 min (was 20).
            // With max-instances bumped to 50 and per-URL timeout cut to 60s, the old
            // 10-20 min cap was silently consuming pipeline time; this matches reality.
            const dynamicProcessingTimeout = Math.max(240_000, Math.min(globalSeenDomains.size * 1000, 600_000));
            await this.log(id, `[PHASE 2] Processing timeout: ${Math.round(dynamicProcessingTimeout / 1000)}s for ${globalSeenDomains.size} URLs`);
            await this.allSettledWithTimeout(processingPromises, dynamicProcessingTimeout, id);

            await this.log(id, `✅ [PHASE 2] Streaming pipeline complete. Processed: ${processedCount}, Qualified: ${qualifiedCounter.value}/${MAX_TOTAL_QUALIFIED}`);

            // Check stop conditions after Phase 2
            const stopAfter2B = this.shouldStop(id, qualifiedCounter.value);
            if (stopAfter2B) {
                const elapsed = Math.round((Date.now() - (this.campaignStartTimes.get(id) || Date.now())) / 1000);
                await this.log(id, `[STOP] Pipeline stopped after Phase 2: ${stopAfter2B} (${elapsed}s elapsed, ${qualifiedCounter.value} suppliers)`);
            }

            // D4: LOW YIELD MODE — relax thresholds when pipeline is underperforming
            const statsNow = this.campaignStats.get(id);
            if (statsNow && statsNow.processedUrls > 100 && qualifiedCounter.value < 10) {
                this.campaignLowYield.set(id, true);
                await this.log(id, `⚠️ LOW YIELD MODE activated: ${qualifiedCounter.value} suppliers after ${statsNow.processedUrls} URLs — relaxing thresholds`);
            }

            // --- PHASE 2.5: EXPANSION PASS (second sweep for missed suppliers) ---
            // Threshold lowered: only run expansion if we have very low yield (<15 suppliers
            // OR <10% of target). Expansion was running by default and adding 5-10 min for
            // marginal gain — better to spend that time letting Phase 2 process more URLs
            // by raising search budget upfront.
            const EXPANSION_THRESHOLD = Math.max(15, Math.ceil(MAX_TOTAL_QUALIFIED * 0.1));
            if (!stopAfter2B && qualifiedCounter.value < EXPANSION_THRESHOLD) {
                await this.log(id, `[EXPANSION] Coverage at ${qualifiedCounter.value}/${MAX_TOTAL_QUALIFIED} (${Math.round(qualifiedCounter.value / MAX_TOTAL_QUALIFIED * 100)}%) — running expansion pass...`);
                this.sourcingGateway?.emitProgress(id, 'EXPANSION', 0);

                try {
                    // Gather top suppliers for competitor discovery
                    const topSuppliers = await this.prisma.supplier.findMany({
                        where: { campaignId: id, deletedAt: null },
                        orderBy: { analysisScore: 'desc' },
                        take: 10,
                        select: { name: true, country: true, city: true, specialization: true, website: true },
                    });

                    // Identify countries with low coverage
                    const countryCounts = new Map<string, { count: number; language: string }>();
                    for (const strategy of languageStrategies) {
                        const key = strategy.country;
                        if (!countryCounts.has(key)) {
                            countryCounts.set(key, { count: 0, language: strategy.language });
                        }
                    }
                    // Count qualified suppliers per country from DB
                    const suppliersByCountry = await this.prisma.supplier.groupBy({
                        by: ['originCountry'],
                        where: { campaignId: id, deletedAt: null },
                        _count: true,
                    });
                    for (const sc of suppliersByCountry) {
                        const key = sc.originCountry || '';
                        for (const [cKey, cVal] of countryCounts) {
                            if (cKey.toLowerCase() === key.toLowerCase()) {
                                cVal.count = sc._count;
                            }
                        }
                    }
                    const lowCoverageCountries = Array.from(countryCounts.entries())
                        .filter(([_, v]) => v.count < 3)
                        .map(([country, v]) => ({ country, language: v.language, count: v.count }));

                    // Build allowed countries list for expansion agent
                    const expRegion = dto.searchCriteria?.region || 'EU';
                    let expAllowedCountries: string[] | undefined;
                    if (expRegion === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length) {
                        expAllowedCountries = dto.searchCriteria.targetCountries
                            .map((code: string) => StrategyAgentService.COUNTRY_LANGUAGES[code]?.countryName)
                            .filter(Boolean);
                    } else if (REGION_LANGUAGE_CONFIG[expRegion]) {
                        expAllowedCountries = REGION_LANGUAGE_CONFIG[expRegion].countries;
                    }

                    const expansionResult = await this.expansionAgent.execute({
                        productContext: productContext || null,
                        topSuppliers: topSuppliers.map(s => ({
                            name: s.name || '',
                            country: s.country || '',
                            city: s.city || undefined,
                            specialization: s.specialization || undefined,
                            website: s.website || undefined,
                        })),
                        lowCoverageCountries,
                        discoveredDirectories: [],
                        region: expRegion,
                        allowedCountries: expAllowedCountries,
                        industry: dto.searchCriteria?.industry,
                        sourcingMode: (dto.searchCriteria as any)?.sourcingMode,
                        city: (dto.searchCriteria as any)?.city,
                    });

                    await this.log(id, `[EXPANSION] Generated ${expansionResult.expansion_queries.length} expansion queries`);

                    // Filter expansion queries to only allowed countries for this region
                    let filteredExpansionQueries = expansionResult.expansion_queries;
                    const expansionRegionKey = dto.searchCriteria?.region;
                    let expansionAllowedCountries: string[] | undefined;

                    if (expansionRegionKey === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length) {
                        expansionAllowedCountries = dto.searchCriteria.targetCountries
                            .map((code: string) => StrategyAgentService.COUNTRY_LANGUAGES[code]?.countryName)
                            .filter(Boolean);
                    } else if (expansionRegionKey && REGION_LANGUAGE_CONFIG[expansionRegionKey]) {
                        expansionAllowedCountries = REGION_LANGUAGE_CONFIG[expansionRegionKey].countries;
                    }

                    if (expansionAllowedCountries?.length) {
                        const allowedSet = new Set(expansionAllowedCountries.map(c => c.toLowerCase()));
                        const beforeExp = filteredExpansionQueries.length;
                        filteredExpansionQueries = filteredExpansionQueries.filter(eq =>
                            allowedSet.has((eq.country || '').toLowerCase())
                        );
                        const removedExp = beforeExp - filteredExpansionQueries.length;
                        if (removedExp > 0) {
                            await this.log(id, `[EXPANSION] Filtered out ${removedExp} queries for unauthorized countries (allowed: [${expansionAllowedCountries.join(', ')}])`);
                        }
                    }

                    // Group expansion queries by language/country
                    const expansionStrategies = new Map<string, { country: string; language: string; queries: string[]; negatives: string[] }>();

                    for (const eq of filteredExpansionQueries) {
                        const key = `${eq.country}/${eq.language}`;
                        if (!expansionStrategies.has(key)) {
                            expansionStrategies.set(key, {
                                country: eq.country,
                                language: eq.language,
                                queries: [],
                                negatives: ['-amazon', '-ebay', '-aliexpress', '-allegro'],
                            });
                        }
                        expansionStrategies.get(key)!.queries.push(eq.query);
                    }

                    // Expansion also uses collect-then-process
                    const expansionBudgetPerWorker = Math.max(2, Math.floor(
                        this.searchService.getRemainingBudget(id, 'main') / Math.max(1, expansionStrategies.size)
                    ));

                    const expansionCollectPromises = Array.from(expansionStrategies.values()).map(strategy =>
                        searchWorkerLimit(() =>
                            this.collectUrlsForStrategy(id, strategy, expansionBudgetPerWorker)
                        )
                    );

                    const expansionCollectResults = await this.allSettledWithTimeout(expansionCollectPromises, 120000, id);
                    const expansionUrlsRaw: CollectedUrl[] = [];
                    for (const result of expansionCollectResults) {
                        if (result.status === 'fulfilled') expansionUrlsRaw.push(...result.value);
                    }

                    // Dedup expansion URLs against already-processed domains
                    const expansionUrls: CollectedUrl[] = [];
                    for (const item of expansionUrlsRaw) {
                        const domain = this.extractDomain(item.url);
                        if (processedDomains.has(domain)) continue;
                        processedDomains.add(domain);
                        expansionUrls.push(item);
                    }
                    await this.log(id, `[EXPANSION] Collected ${expansionUrlsRaw.length} → ${expansionUrls.length} unique expansion URLs`);

                    let expansionFound = 0;
                    const expansionProcessPromises = expansionUrls.map(item =>
                        this.urlLimit(async () => {
                            const expStop = this.shouldStop(id, qualifiedCounter.value);
                            if (expStop || !qualifiedCounter.tryReserve(MAX_TOTAL_QUALIFIED)) return 0;
                            const result = await this.processSupplierUrl(
                                id, dto, item.url, item.workerTag,
                                processedCompanyNames, item.originLanguage, item.originCountry,
                                productContext || undefined, processedDomains, 0,
                                userLanguage, knownManufacturers
                            );
                            if (result <= 0) {
                                qualifiedCounter.release();
                            } else {
                                expansionFound += result;
                            }
                            return result;
                        })
                    );

                    await this.allSettledWithTimeout(expansionProcessPromises, 120000, id);

                    await this.log(id, `[EXPANSION] Expansion pass found ${expansionFound} additional suppliers. Total: ${qualifiedCounter.value}`);
                    this.sourcingGateway?.emitProgress(id, 'EXPANSION', 100);
                } catch (expansionErr: any) {
                    await this.log(id, `[EXPANSION] Expansion pass error (non-fatal): ${expansionErr.message}`);
                }
            } else {
                await this.log(id, `[EXPANSION] Coverage at ${qualifiedCounter.value}/${MAX_TOTAL_QUALIFIED} — expansion pass not needed.`);
            }

            // --- PHASE 2.7: COVERAGE CHECK — find missing known manufacturers ---
            const stopBeforeCoverage = this.shouldStop(id, qualifiedCounter.value);
            if (!stopBeforeCoverage && knownManufacturers.length > 0) {
                try {
                    const foundSuppliers = await this.prisma.supplier.findMany({
                        where: { campaignId: id, deletedAt: null },
                        select: { name: true, website: true },
                    });

                    const foundNames = new Set(foundSuppliers.map(s => (s.name || '').toLowerCase().trim()));
                    const foundDomains = new Set(foundSuppliers.map(s => this.extractDomain(s.website || '')).filter(Boolean));

                    const missingLeaders = knownManufacturers.filter(km => {
                        const nameMatch = foundNames.has(km.name.toLowerCase().trim()) ||
                            [...foundNames].some(fn => fn.includes(km.name.toLowerCase().split(' ')[0]) || km.name.toLowerCase().includes(fn.split(' ')[0]));
                        const domainMatch = km.website ? foundDomains.has(this.extractDomain(km.website)) : false;
                        return !nameMatch && !domainMatch;
                    });

                    await this.log(id, `[COVERAGE] ${foundSuppliers.length} suppliers found, ${knownManufacturers.length} known leaders, ${missingLeaders.length} missing`);

                    if (missingLeaders.length > 0) {
                        await this.log(id, `[COVERAGE] Missing leaders: ${missingLeaders.map(m => m.name).join(', ')}`);

                        for (const leader of missingLeaders.slice(0, 10)) {
                            const leaderStop = this.shouldStop(id, qualifiedCounter.value);
                            if (leaderStop || qualifiedCounter.value >= MAX_TOTAL_QUALIFIED) {
                                if (leaderStop) await this.log(id, `[COVERAGE] Stopping leader processing: ${leaderStop}`);
                                break;
                            }

                            if (leader.website) {
                                // Direct URL — try processSupplierUrl
                                const leaderDomain = this.extractDomain(leader.website);
                                if (!processedDomains.has(leaderDomain)) {
                                    processedDomains.add(leaderDomain);
                                    await this.log(id, `[LEADER-DIRECT] Trying ${leader.name} → ${leader.website}`);
                                    if (!qualifiedCounter.tryReserve(MAX_TOTAL_QUALIFIED)) break;
                                    const result = await this.processSupplierUrl(
                                        id, dto, leader.website, '[LEADER-DIRECT]',
                                        processedCompanyNames, 'en', leader.country || 'EU',
                                        productContext || undefined, processedDomains, 0,
                                        userLanguage, knownManufacturers
                                    );
                                    if (result <= 0) {
                                        qualifiedCounter.release();
                                    } else {
                                        await this.log(id, `[LEADER-DIRECT] ${leader.name} QUALIFIED`);
                                    }
                                }
                            } else {
                                // Search for the company
                                await this.log(id, `[LEADER-SEARCH] Searching for: ${leader.name}`);
                                try {
                                    const searchResults = await this.searchService.searchExtended(
                                        `"${leader.name}" official website ${cleanProductName}`,
                                        { gl: 'us', hl: 'en' }, undefined, id
                                    );
                                    for (const sr of searchResults.slice(0, 3)) {
                                        const srDomain = this.extractDomain(sr.link);
                                        if (processedDomains.has(srDomain)) continue;
                                        processedDomains.add(srDomain);
                                        if (!qualifiedCounter.tryReserve(MAX_TOTAL_QUALIFIED)) break;
                                        const result = await this.processSupplierUrl(
                                            id, dto, sr.link, '[LEADER-SEARCH]',
                                            processedCompanyNames, 'en', leader.country || 'EU',
                                            productContext || undefined, processedDomains, 0,
                                            userLanguage, knownManufacturers
                                        );
                                        if (result <= 0) {
                                            qualifiedCounter.release();
                                        } else {
                                            await this.log(id, `[LEADER-SEARCH] ${leader.name} QUALIFIED via ${srDomain}`);
                                            break;
                                        }
                                    }
                                } catch { /* skip */ }
                            }
                        }
                    }

                    // Coverage report
                    const finalFoundCount = await this.prisma.supplier.count({ where: { campaignId: id, deletedAt: null } });
                    const coveragePercent = knownManufacturers.length > 0
                        ? Math.round((1 - missingLeaders.length / knownManufacturers.length) * 100) : 100;
                    await this.log(id, `[COVERAGE REPORT] Leaders coverage: ${coveragePercent}% (${knownManufacturers.length - missingLeaders.length}/${knownManufacturers.length}). Total suppliers: ${finalFoundCount}`);
                } catch (coverageErr: any) {
                    await this.log(id, `[COVERAGE] Coverage check failed (non-fatal): ${coverageErr.message}`);
                }
            }

            // --- PHASE 2.8: SIMILARITY DISCOVERY (when < 100 suppliers, find "companies like top results") ---
            const SIMILARITY_THRESHOLD = 100;
            const stopBeforeSimilarity = this.shouldStop(id, qualifiedCounter.value);
            if (!stopBeforeSimilarity && qualifiedCounter.value < SIMILARITY_THRESHOLD && qualifiedCounter.value > 0) {
                try {
                    await this.log(id, `🔍 [SIMILARITY] Only ${qualifiedCounter.value} suppliers (< ${SIMILARITY_THRESHOLD}) — running similarity discovery...`);
                    this.sourcingGateway?.emitProgress(id, 'SIMILARITY', 0);

                    // Get top-scoring suppliers as seeds
                    const topSeeds = await this.prisma.supplier.findMany({
                        where: { campaignId: id, deletedAt: null },
                        orderBy: { analysisScore: 'desc' },
                        take: Math.min(10, qualifiedCounter.value),
                        select: { name: true, country: true, specialization: true, website: true },
                    });

                    // Generate competitor/similar company queries from top seeds
                    const similarityQueries: string[] = [];
                    for (const seed of topSeeds.slice(0, 5)) {
                        const seedName = (seed.name || '').replace(/\b(sp\.?\s*z\s*o\.?\s*o\.?|gmbh|ltd|s\.?a\.?|s\.?r\.?l\.?|bv|ag|inc|corp)\b/gi, '').trim();
                        if (seedName.length < 3) continue;
                        similarityQueries.push(
                            `"${seedName}" competitors ${cleanProductName}`,
                            `companies similar to "${seedName}" ${seed.specialization || cleanProductName}`,
                        );
                        if (seed.country) {
                            similarityQueries.push(`${cleanProductName} manufacturer ${seed.country} -"${seedName}"`);
                        }
                    }

                    // Add certification-based queries if requiredCertificates specified
                    const requiredCerts = dto.searchCriteria?.requiredCertificates || [];
                    for (const cert of requiredCerts.slice(0, 2)) {
                        similarityQueries.push(`"${cert}" certified ${cleanProductName} manufacturer`);
                    }

                    // Add B2B marketplace deep queries
                    const marketplaceQueries = [
                        `site:europages.com "${cleanProductName}" manufacturer`,
                        `site:kompass.com "${cleanProductName}" producer`,
                    ];
                    if (searchCriteria.region === 'GLOBAL' || searchCriteria.region === 'CN') {
                        marketplaceQueries.push(`site:made-in-china.com "${cleanProductName}" factory`);
                    }

                    const allSimilarityQueries = [...new Set([...similarityQueries, ...marketplaceQueries])];
                    await this.log(id, `[SIMILARITY] Generated ${allSimilarityQueries.length} similarity queries from ${topSeeds.length} seed suppliers`);

                    // Execute similarity queries
                    let similarityFound = 0;
                    const negatives = languageStrategies[0]?.negatives || ['-amazon', '-ebay', '-alibaba'];
                    const negStr = negatives.join(' ');

                    for (const query of allSimilarityQueries) {
                        const stopMid = this.shouldStop(id, qualifiedCounter.value);
                        if (stopMid || qualifiedCounter.value >= SIMILARITY_THRESHOLD) break;

                        try {
                            const results = await this.searchService.searchExtended(
                                `${query} ${negStr}`, { gl: 'us', hl: 'en' }, undefined, id
                            );

                            for (const r of results) {
                                const rDomain = this.extractDomain(r.link);
                                if (processedDomains.has(rDomain)) continue;
                                if (qualifiedCounter.value >= MAX_TOTAL_QUALIFIED) break;

                                processedDomains.add(rDomain);
                                if (!qualifiedCounter.tryReserve(MAX_TOTAL_QUALIFIED)) break;
                                const result = await this.processSupplierUrl(
                                    id, dto, r.link, '[SIMILARITY]',
                                    processedCompanyNames, 'en', 'Global',
                                    productContext || undefined, processedDomains, 0,
                                    userLanguage, knownManufacturers
                                );
                                if (result <= 0) {
                                    qualifiedCounter.release();
                                } else {
                                    similarityFound++;
                                }
                            }
                        } catch (searchErr: any) {
                            if (searchErr.message?.startsWith('BUDGET_EXHAUSTED')) {
                                await this.log(id, `[SIMILARITY] Budget exhausted — stopping`);
                                break;
                            }
                            // Skip individual query errors
                        }
                    }

                    await this.log(id, `✅ [SIMILARITY] Found ${similarityFound} additional suppliers via similarity. Total: ${qualifiedCounter.value}`);
                    this.sourcingGateway?.emitProgress(id, 'SIMILARITY', 100);
                } catch (simErr: any) {
                    await this.log(id, `[SIMILARITY] Error (non-fatal): ${simErr.message}`);
                }
            } else if (!stopBeforeSimilarity && qualifiedCounter.value >= SIMILARITY_THRESHOLD) {
                await this.log(id, `[SIMILARITY] ${qualifiedCounter.value} suppliers >= ${SIMILARITY_THRESHOLD} — similarity discovery not needed.`);
            }

            // --- PHASE 3: AGGREGATE RESULTS ---
            // Re-count from DB for accuracy (includes expansion + similarity results)
            const finalSupplierCount = await this.prisma.supplier.count({
                where: { campaignId: id, deletedAt: null },
            });

            // Per-country stats from DB
            const countryStats = await this.prisma.supplier.groupBy({
                by: ['originCountry'],
                where: { campaignId: id, deletedAt: null },
                _count: true,
            });
            const languageStats = countryStats
                .map(cs => `${cs.originCountry || '?'}: ${cs._count}`)
                .sort((a, b) => parseInt(b.split(': ')[1]) - parseInt(a.split(': ')[1]));

            const elapsed = Math.round((Date.now() - (this.campaignStartTimes.get(id) || Date.now())) / 1000);
            const finalStopReason = this.shouldStop(id, qualifiedCounter.value);

            await this.log(id, `[RESULTS] Per-country: ${languageStats.join(' | ')}`);
            await this.log(id, `[ANALYSIS] Total suppliers found: ${finalSupplierCount} | URLs processed: ${processedCount}/${globalSeenDomains.size} | Time: ${elapsed}s`);

            // D5: Pipeline summary with rejection breakdown
            const pipelineStats = this.campaignStats.get(id);
            if (pipelineStats) {
                const topReasons = [...pipelineStats.rejectionReasons.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([reason, count]) => `${reason}: ${count}`)
                    .join(', ');
                await this.log(id, `📊 PIPELINE SUMMARY:\n- URLs processed: ${pipelineStats.processedUrls}\n- Auditor approved: ${pipelineStats.auditorApproved}, rejected: ${pipelineStats.auditorRejected}\n- Gemini fallbacks: ${pipelineStats.geminiFallbacks}\n- Low yield mode: ${this.campaignLowYield.get(id) ? 'YES' : 'NO'}\n- Top rejection reasons: ${topReasons || 'none'}`);

                // Persist CampaignMetrics to DB
                await this.prisma.campaignMetrics.upsert({
                    where: { campaignId: id },
                    create: {
                        campaignId: id,
                        urlsProcessed: pipelineStats.processedUrls,
                        urlsCollected: globalSeenDomains.size,
                        auditorApproved: pipelineStats.auditorApproved,
                        auditorRejected: pipelineStats.auditorRejected,
                        totalDurationMs: Date.now() - (this.campaignStartTimes.get(id) || Date.now()),
                        lowYieldModeUsed: this.campaignLowYield.get(id) || false,
                        rejectionReasons: Object.fromEntries(pipelineStats.rejectionReasons),
                        costPerSupplier: finalSupplierCount > 0 ? undefined : undefined, // Calculated separately via API usage
                    },
                    update: {
                        urlsProcessed: pipelineStats.processedUrls,
                        urlsCollected: globalSeenDomains.size,
                        auditorApproved: pipelineStats.auditorApproved,
                        auditorRejected: pipelineStats.auditorRejected,
                        totalDurationMs: Date.now() - (this.campaignStartTimes.get(id) || Date.now()),
                        lowYieldModeUsed: this.campaignLowYield.get(id) || false,
                        rejectionReasons: Object.fromEntries(pipelineStats.rejectionReasons),
                    },
                }).catch(e => this.logger.error(`Failed to save CampaignMetrics: ${e.message}`));
            }

            if (finalStopReason === 'USER_STOPPED') {
                await this.log(id, `[STOPPED] Pipeline stopped by user (${elapsed}s, ${finalSupplierCount} suppliers)`);
            } else if (finalStopReason === 'TIMEOUT') {
                await this.log(id, `[COMPLETED] Pipeline completed (time limit reached: ${elapsed}s, ${finalSupplierCount} suppliers)`);
            } else if (finalStopReason) {
                await this.log(id, `[COMPLETED] Pipeline completed: ${finalStopReason} (${elapsed}s, ${finalSupplierCount} suppliers)`);
            } else {
                await this.log(id, `[COMPLETED] Pipeline finished successfully! (${elapsed}s, ${finalSupplierCount} suppliers)`);
            }

            // STOPPED only for manual user cancellation, NOT for timeout
            // Timeout = pipeline finished naturally (ran out of time) → COMPLETED
            const wasManualStop = this.cancelledCampaigns.has(id) &&
                !(this.campaignStartTimes.get(id) && Date.now() - this.campaignStartTimes.get(id)! > this.PIPELINE_TIMEOUT_MS);
            const finalStatus = wasManualStop ? 'STOPPED' : 'COMPLETED';
            await this.prisma.campaign.update({
                where: { id },
                data: { stage: 'COMPLETED', status: finalStatus }
            });
            this.sourcingGateway?.emitProgress(id, 'COMPLETED', 100);
            this.sourcingGateway?.emitCompleted(id);

            // Send feedback email immediately after completion
            if (finalStatus === 'COMPLETED') {
                // Notify SalesOps: deal → AI Sourcing stage
                try {
                    const campaignForOps = await this.prisma.campaign.findUnique({
                        where: { id },
                        include: {
                            rfqRequest: {
                                include: { owner: { select: { email: true, name: true, trialCreditsUsed: true } } },
                            },
                        },
                    });
                    const ownerEmail = campaignForOps?.rfqRequest?.owner?.email;
                    const ownerName = campaignForOps?.rfqRequest?.owner?.name;
                    if (ownerEmail) {
                        await this.salesOps.handleAiSourcingCompleted({
                            email: ownerEmail,
                            name: ownerName || ownerEmail,
                            campaignName: campaignForOps?.name || 'Unknown',
                            suppliersFound: finalSupplierCount,
                            elapsedSeconds: elapsed,
                            isTrialCredit: !campaignForOps?.rfqRequest?.owner?.trialCreditsUsed,
                        });
                    }
                } catch (e: any) {
                    this.logger.warn(`Sales ops AI sourcing notification failed: ${e.message}`);
                }

                this.sendFeedbackEmail(id).catch(err =>
                    this.logger.error(`Feedback email error for campaign ${id}:`, err)
                );

                // Alert based on supplier count
                if (finalSupplierCount === 0) {
                    // CRITICAL: 0 suppliers = pipeline completely failed to deliver
                    const ps = this.campaignStats.get(id);
                    this.observability.recordEvent('campaign', 'zero_suppliers', 'critical', {
                        title: `🚨 KAMPANIA 0 DOSTAWCÓW: ${dto.name || id}`,
                        campaignId: id,
                        message: `Czas: ${elapsed}s | URLs: ${processedCount}/${globalSeenDomains.size} | Auditor rejected: ${ps?.auditorRejected || '?'} | Gemini fallbacks: ${ps?.geminiFallbacks || '?'} | Low yield: ${this.campaignLowYield.get(id) ? 'YES' : 'NO'}`,
                        metadata: { supplierCount: 0, elapsed, processedUrls: processedCount, auditorRejected: ps?.auditorRejected, geminiFallbacks: ps?.geminiFallbacks },
                    }).catch(() => {});
                } else if (finalSupplierCount < 30) {
                    this.observability.recordEvent('campaign', 'low_supplier_count', 'warning', {
                        title: `Kampania zakończona z ${finalSupplierCount} dostawcami (< 30)`,
                        campaignId: id,
                        message: `Czas: ${elapsed}s | URLs: ${processedCount}/${globalSeenDomains.size}`,
                        metadata: { supplierCount: finalSupplierCount, elapsed, processedUrls: processedCount },
                    }).catch(() => {});
                }
            }

        } catch (e: any) {
            this.logger.error(`Pipeline error: ${e.message}`);
            // Only update to ERROR if not already COMPLETED by auto-timeout
            try {
                const current = await this.prisma.campaign.findUnique({ where: { id }, select: { status: true } });
                if (current && current.status === 'RUNNING') {
                    await this.prisma.campaign.update({
                        where: { id },
                        data: { status: 'ERROR' }
                    });
                }
            } catch { /* ignore DB errors during cleanup */ }
            await this.log(id, `Error: ${e.message}`);
            this.sourcingGateway?.emitError(id, e.message);
            this.observability.recordEvent('campaign', 'pipeline_error', 'critical', {
                title: `Pipeline error: ${e.message?.substring(0, 100)}`,
                campaignId: id,
                message: e.stack?.substring(0, 500),
            }).catch(() => {});
        } finally {
            // ALWAYS cleanup, regardless of how we exit
            const timer = this.campaignTimers.get(id);
            if (timer) clearTimeout(timer);
            this.campaignTimers.delete(id);
            this.cancelledCampaigns.delete(id);
            this.campaignStartTimes.delete(id);
            this.deepResearchCounts.delete(id);
            this.campaignAbortControllers.delete(id);
            this.campaignLowYield.delete(id);
            this.campaignStats.delete(id);
        }
    }

    /**
     * Send feedback request email after campaign completion.
     * Only sent during trial period (trialCreditsUsed === false).
     * Checks feedbackEmailSentAt to prevent duplicates.
     */
    private async sendFeedbackEmail(campaignId: string): Promise<void> {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                rfqRequest: {
                    include: {
                        owner: { select: { email: true, name: true, language: true, trialCreditsUsed: true } },
                    },
                },
            },
        });

        if (!campaign || campaign.feedbackEmailSentAt) return;

        // Only send feedback survey during trial period
        if (campaign.rfqRequest?.owner?.trialCreditsUsed === true) {
            this.logger.log(`Skipping feedback email for campaign "${campaign.name}" — user is post-trial (paid)`);
            return;
        }

        const ownerEmail = campaign.rfqRequest?.owner?.email;
        if (!ownerEmail) {
            this.logger.warn(`Campaign ${campaignId} has no owner email, skipping feedback`);
            return;
        }

        const ownerLocale = campaign.rfqRequest?.owner?.language || 'pl';
        const sent = await this.emailService.sendFeedbackRequestEmail(
            ownerEmail,
            campaign.name,
            campaign.id,
            ownerLocale,
        );

        if (sent) {
            await this.prisma.campaign.update({
                where: { id: campaignId },
                data: { feedbackEmailSentAt: new Date() },
            });
            this.logger.log(`Feedback email sent for campaign "${campaign.name}" to ${ownerEmail}`);
        }
    }

    /**
     * ========================================
     * LANGUAGE WORKER
     * ========================================
     * Executes FULL pipeline for a single language/country:
     * Search → Explorer → Analyst → Enrichment → Auditor
     */
    private async executeLanguageWorker(
        campaignId: string,
        dto: CreateCampaignDto,
        langStrategy: { country: string; language: string; queries: string[]; negatives: string[] },
        globalProcessedDomains: Set<string>,
        globalProcessedCompanyNames: Set<string>,
        maxPerLanguage: number,
        getGlobalCount: () => number,
        getMaxTotal: () => number,
        incrementGlobalCount: (count: number) => void,
        productContext?: ProductContext,
        userLanguage: string = 'pl',
        knownManufacturers: { name: string; country?: string; website?: string; size?: string }[] = []
    ): Promise<LanguageWorkerResult> {
        const { country, language, queries, negatives } = langStrategy;
        const workerTag = `[${country.toUpperCase()}/${language.toUpperCase()}]`;

        await this.log(campaignId, `${workerTag} Worker started with ${queries.length} queries`);

        let localQualified = 0;
        const errors: string[] = [];

        try {
            for (const query of queries) {
                // Check global limit
                if (getGlobalCount() >= getMaxTotal()) {
                    await this.log(campaignId, `${workerTag} Global limit reached. Stopping.`);
                    break;
                }
                if (localQualified >= maxPerLanguage) {
                    await this.log(campaignId, `${workerTag} Language limit (${maxPerLanguage}) reached.`);
                    break;
                }

                // Build query with negatives
                const fullQuery = `${query} ${negatives.join(' ')}`;

                // --- SEARCH ---
                let urls: string[] = [];
                const cachedResults = await this.queryCache.getCachedResults(query);

                if (cachedResults) {
                    urls = cachedResults.map(r => r.link);
                    await this.log(campaignId, `${workerTag} [CACHE] "${query.substring(0, 25)}..." (${urls.length} URLs)`);
                } else {
                    // Check search budget before making API call
                    const remaining = this.searchService.getRemainingBudget(campaignId, 'main');
                    if (remaining <= 0) {
                        await this.log(campaignId, `${workerTag} [BUDGET] Search budget exhausted. Stopping.`);
                        break;
                    }
                    const locale = languageToGoogleLocale(language);
                    await this.log(campaignId, `${workerTag} [SEARCH] "${query.substring(0, 25)}..." (budget: ${remaining}, locale: ${locale.gl}${language === 'en' ? '+us' : ''})`);

                    // For English: search BOTH US and UK markets for maximum coverage
                    let rawResults: { title: string; link: string; snippet: string }[];
                    try {
                        if (language === 'en') {
                            const [usResults, gbResults] = await Promise.all([
                                this.searchService.searchExtended(fullQuery, { gl: 'us', hl: 'en' }, undefined, campaignId),
                                this.searchService.searchExtended(fullQuery, { gl: 'gb', hl: 'en' }, undefined, campaignId),
                            ]);
                            const seen = new Set<string>();
                            rawResults = [];
                            for (const r of [...usResults, ...gbResults]) {
                                if (!seen.has(r.link)) { seen.add(r.link); rawResults.push(r); }
                            }
                        } else {
                            rawResults = await this.searchService.searchExtended(fullQuery, locale, undefined, campaignId);
                        }
                    } catch (searchErr: any) {
                        if (searchErr.message?.startsWith('BUDGET_EXHAUSTED')) {
                            await this.log(campaignId, `${workerTag} [BUDGET] Search budget exhausted — stopping worker`);
                            break;
                        }
                        await this.log(campaignId, `${workerTag} [SEARCH] Error: ${searchErr.message} — skipping query`);
                        continue;
                    }
                    urls = rawResults.map(r => r.link);

                    if (rawResults.length > 0) {
                        await this.queryCache.cacheResults(query, rawResults);
                    }
                }

                // --- PROCESS URLs IN PARALLEL (concurrency limited to 3) ---
                // Pre-filter: deduplicate and check limits before spawning parallel work
                const urlsToProcess: string[] = [];
                for (const url of urls) {
                    if (getGlobalCount() + urlsToProcess.length >= getMaxTotal()) break;
                    if (localQualified + urlsToProcess.length >= maxPerLanguage) break;

                    const domain = this.extractDomain(url);
                    if (globalProcessedDomains.has(domain)) continue;
                    globalProcessedDomains.add(domain);
                    urlsToProcess.push(url);
                }

                const urlResults = await Promise.allSettled(
                    urlsToProcess.map(url =>
                        this.urlLimit(async () => {
                            // Re-check limits (may have changed during parallel execution)
                            if (getGlobalCount() >= getMaxTotal() || localQualified >= maxPerLanguage) {
                                return 0;
                            }
                            return this.processSupplierUrl(
                                campaignId,
                                dto,
                                url,
                                workerTag,
                                globalProcessedCompanyNames,
                                language,
                                country,
                                productContext,
                                globalProcessedDomains,
                                0,
                                userLanguage,
                                knownManufacturers
                            );
                        })
                    )
                );

                for (const result of urlResults) {
                    if (result.status === 'fulfilled' && (result.value as number) > 0) {
                        const count = result.value as number;
                        localQualified += count;
                        incrementGlobalCount(count);
                    } else if (result.status === 'rejected') {
                        errors.push(result.reason?.message || 'Unknown error');
                    }
                }
            }

            await this.log(campaignId, `${workerTag} Worker completed. Found ${localQualified} suppliers.`);

            return {
                language,
                country,
                suppliersFound: localQualified,
                errors
            };

        } catch (e: any) {
            await this.log(campaignId, `${workerTag} Worker error: ${e.message}`);
            return {
                language,
                country,
                suppliersFound: localQualified,
                errors: [...errors, e.message]
            };
        }
    }

    /**
     * ========================================
     * PHASE 2A: COLLECT URLs FOR STRATEGY
     * ========================================
     * Search-only: executes all queries for a single language strategy,
     * collects and deduplicates URLs. No processing — returns URLs for batch processing.
     */
    private async collectUrlsForStrategy(
        campaignId: string,
        langStrategy: { country: string; language: string; queries: string[]; negatives: string[] },
        budgetForWorker: number,
        onUrlFound?: (item: CollectedUrl) => void,
    ): Promise<CollectedUrl[]> {
        const { country, language, queries, negatives } = langStrategy;
        const workerTag = `[${country.toUpperCase()}/${language.toUpperCase()}]`;
        const collected: CollectedUrl[] = [];
        const localSeenDomains = new Set<string>();
        let searchesUsed = 0;

        await this.log(campaignId, `${workerTag} [COLLECT] Starting URL collection (${queries.length} queries, budget: ${budgetForWorker})`);

        for (const query of queries) {
            // Per-worker budget check
            if (searchesUsed >= budgetForWorker) {
                await this.log(campaignId, `${workerTag} [COLLECT] Worker budget exhausted (${searchesUsed}/${budgetForWorker})`);
                break;
            }

            // Also check global budget
            const remaining = this.searchService.getRemainingBudget(campaignId, 'main');
            if (remaining <= 0) {
                await this.log(campaignId, `${workerTag} [COLLECT] Global budget exhausted`);
                break;
            }

            const fullQuery = `${query} ${negatives.join(' ')}`;

            let urls: string[] = [];
            const cachedResults = await this.queryCache.getCachedResults(query);

            if (cachedResults) {
                urls = cachedResults.map(r => r.link);
                await this.log(campaignId, `${workerTag} [CACHE] "${query.substring(0, 30)}..." (${urls.length} URLs)`);
            } else {
                const locale = languageToGoogleLocale(language);

                try {
                    if (language === 'en') {
                        const [usResults, gbResults] = await Promise.all([
                            this.searchService.searchExtended(fullQuery, { gl: 'us', hl: 'en' }, undefined, campaignId),
                            this.searchService.searchExtended(fullQuery, { gl: 'gb', hl: 'en' }, undefined, campaignId),
                        ]);
                        searchesUsed += 2;
                        const seen = new Set<string>();
                        const rawResults: { title: string; link: string; snippet: string }[] = [];
                        for (const r of [...usResults, ...gbResults]) {
                            if (!seen.has(r.link)) { seen.add(r.link); rawResults.push(r); }
                        }
                        urls = rawResults.map(r => r.link);
                        if (rawResults.length > 0) {
                            await this.queryCache.cacheResults(query, rawResults);
                        }
                    } else {
                        const rawResults = await this.searchService.searchExtended(fullQuery, locale, undefined, campaignId);
                        searchesUsed += 1;
                        urls = rawResults.map(r => r.link);
                        if (rawResults.length > 0) {
                            await this.queryCache.cacheResults(query, rawResults);
                        }
                    }
                } catch (searchErr: any) {
                    if (searchErr.message?.startsWith('BUDGET_EXHAUSTED')) {
                        await this.log(campaignId, `${workerTag} [BUDGET] Expansion budget exhausted — stopping`);
                        break;
                    }
                    await this.log(campaignId, `${workerTag} [SEARCH] Expansion error: ${searchErr.message} — skipping`);
                    continue;
                }
            }

            // Per-worker deduplication + immediate streaming to processing
            for (const url of urls) {
                const domain = this.extractDomain(url);
                if (localSeenDomains.has(domain)) continue;
                localSeenDomains.add(domain);
                const item: CollectedUrl = {
                    url,
                    originLanguage: language,
                    originCountry: country,
                    workerTag,
                };
                collected.push(item);
                // Stream URL to processing immediately (interleaved across countries)
                if (onUrlFound) onUrlFound(item);
            }
        }

        await this.log(campaignId, `${workerTag} [COLLECT] Done. ${collected.length} unique URLs, ${searchesUsed} searches used`);
        return collected;
    }

    /**
     * ========================================
     * PROCESS SINGLE SUPPLIER URL
     * ========================================
     * Full A-Z pipeline for one URL:
     * Explorer → Analyst → Enrichment → Auditor → Save
     */
    private async processSupplierUrl(
        campaignId: string,
        dto: CreateCampaignDto,
        url: string,
        workerTag: string,
        processedCompanyNames: Set<string>,
        originLanguage: string,
        originCountry: string,
        productContext?: ProductContext,
        globalProcessedDomains?: Set<string>,
        depth: number = 0,
        userLanguage: string = 'pl',
        knownManufacturers: { name: string; country?: string; website?: string; size?: string }[] = []
    ): Promise<number> {
        const urlStartTime = Date.now();
        const domain = this.extractDomain(url);
        const isLowYield = this.campaignLowYield.get(campaignId) || false;
        const stats = this.campaignStats.get(campaignId);
        if (stats) stats.processedUrls++;
        try {
            // TIMEOUT CHECK — don't start expensive processing if pipeline timed out
            if (this.shouldStop(campaignId, 0)) return 0;

            // BLACKLIST CHECK — must happen before ANY processing
            // Graceful: DB errors treated as "not blacklisted" to survive transient Cloud SQL disconnects
            try {
                if (await this.companyRegistry.isBlacklisted(domain)) {
                    await this.log(campaignId, `${workerTag} [BLACKLISTED] ${domain} — skipping`);
                    return 0;
                }
            } catch { /* DB unreachable — continue without blacklist check */ }

            // SHOP CHECK — known marketplaces/e-commerce, hard-reject
            const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
            if (SHOP_DOMAINS.has(domain) || SHOP_DOMAINS.has(cleanDomain)) {
                await this.log(campaignId, `${workerTag} SHOP REJECTED: ${domain}`);
                return 0;
            }

            // SHOP PATTERN CHECK — detect shop/sklep/store in domain name
            const shopPatterns = ['shop', 'sklep', 'store', 'boutique', 'market'];
            const domainBase = cleanDomain.split('.')[0];
            const isShopDomain = shopPatterns.some(p =>
                domainBase.includes(`-${p}`) || domainBase.includes(`${p}-`) ||
                domainBase.includes(`_${p}`) || domainBase.includes(`${p}_`) ||
                domainBase === p
            );
            if (isShopDomain) {
                await this.log(campaignId, `${workerTag} SHOP PATTERN REJECTED: ${domain}`);
                return 0;
            }

            // 0. CHECK GLOBAL REGISTRY CACHE FIRST!
            // Graceful: DB errors treated as cache miss to survive transient Cloud SQL disconnects
            let cachedSupplier: any = null;
            try {
                cachedSupplier = await this.companyRegistry.getByDomain(domain);
            } catch { /* DB unreachable — proceed without cache */ }

            if (cachedSupplier && !this.companyRegistry.isStale(cachedSupplier.lastProcessedAt)) {
                await this.log(campaignId, `${workerTag} [CACHE HIT] ${cachedSupplier.name || domain} - reusing cached data`);

                const cachedEnrichedData = {
                    company_name: cachedSupplier.name,
                    website: `https://${cachedSupplier.domain}`,
                    country: normalizeCountry(cachedSupplier.country),
                    city: cachedSupplier.city,
                    specialization: cachedSupplier.specialization,
                    certificates: cachedSupplier.certificates,
                    employee_count: cachedSupplier.employeeCount,
                    contact_emails: cachedSupplier.contactEmails?.split(',').map(e => e.trim()).filter(Boolean) || []
                };

                const cached = await this.saveSupplierFromCache(
                    campaignId, workerTag, cachedSupplier, cachedEnrichedData,
                    dto, processedCompanyNames, originLanguage, originCountry, userLanguage, productContext
                );
                return cached ? 1 : 0;
            }

            // PORTAL CHECK — portals are not suppliers, force directory mining
            if (isPortalDomain(domain)) {
                await this.log(campaignId, `${workerTag} [PORTAL] ${domain} — forcing directory mining`);
                const content = await this.scrapingService.fetchContent(url);
                const screenerResult = await this.screenerAgent.execute(url, content, dto, productContext, userLanguage, dto.searchCriteria?.requiredCertificates, { industry: dto.searchCriteria?.industry, sourcingMode: (dto.searchCriteria as any)?.sourcingMode, city: (dto.searchCriteria as any)?.city });
                const mentionedCompanies = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedCompanies.length > 0) {
                    await this.log(campaignId, `${workerTag} [PORTAL] ${domain} → ${mentionedCompanies.length} companies to mine`);
                    const MAX_PORTAL_LEADS = 15;
                    const portalLeads: typeof mentionedCompanies = [];
                    for (const company of mentionedCompanies) {
                        if (portalLeads.length >= MAX_PORTAL_LEADS) break;
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        portalLeads.push(company);
                    }
                    // Parallel: each mined company processed concurrently instead of blocking parent slot
                    const portalResults = await Promise.allSettled(
                        portalLeads.map(company =>
                            this.processSupplierUrl(
                                campaignId, dto, company.url!, workerTag,
                                processedCompanyNames, originLanguage, originCountry,
                                productContext, globalProcessedDomains, 1,
                                userLanguage, knownManufacturers
                            ).catch(() => 0)
                        )
                    );
                    return portalResults.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
                }
                return 0;
            }

            // 0.5. URL NORMALIZATION — strip CDN/static subdomains, use root domain
            const NON_CONTENT_SUBDOMAINS = ['cdn', 'static', 'assets', 'media', 'img', 'images', 'files', 'download', 'dl', 'api', 'mail', 'webmail', 'ftp'];
            let effectiveUrl = url;
            try {
                const urlObj = new URL(url);
                const hostParts = urlObj.hostname.replace(/^www\./, '').split('.');
                if (hostParts.length >= 3 && NON_CONTENT_SUBDOMAINS.includes(hostParts[0].toLowerCase())) {
                    const rootDomain = hostParts.slice(1).join('.');
                    effectiveUrl = `${urlObj.protocol}//www.${rootDomain}`;
                    await this.log(campaignId, `${workerTag} URL NORMALIZED: ${url} → ${effectiveUrl} (stripped "${hostParts[0]}" subdomain)`);
                }
            } catch { /* keep original URL */ }

            // 1. SCREENER (merged Explorer + Analyst — single Gemini call)
            await this.log(campaignId, `${workerTag} Screening: ${domain}`);
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url: effectiveUrl, status: 'SCREENING' });

            let content = await this.scrapingService.fetchContent(effectiveUrl);

            // FALLBACK: If content is error/empty, try root domain
            if ((content.startsWith('Error') || content.length < 100) && effectiveUrl === url) {
                try {
                    const urlObj = new URL(url);
                    const rootUrl = `${urlObj.protocol}//${urlObj.hostname.replace(/^www\./, '')}`;
                    if (rootUrl !== url) {
                        await this.log(campaignId, `${workerTag} SCRAPE FALLBACK: ${url} failed, trying root ${rootUrl}`);
                        content = await this.scrapingService.fetchContent(rootUrl);
                    }
                } catch { /* keep error content */ }
            }

            const screenerResult = await this.screenerAgent.execute(effectiveUrl, content, dto, productContext, userLanguage, dto.searchCriteria?.requiredCertificates, { industry: dto.searchCriteria?.industry, sourcingMode: (dto.searchCriteria as any)?.sourcingMode, city: (dto.searchCriteria as any)?.city });

            if (!screenerResult.is_relevant) {
                // DIRECTORY MINING: extract leads from industry portals
                const mentionedCompanies = screenerResult.mentioned_companies || [];
                if (depth === 0
                    && screenerResult.page_type === 'Directory'
                    && mentionedCompanies.length > 0
                ) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] ${domain} → ${mentionedCompanies.length} mentioned companies`);

                    const MAX_DIRECTORY_LEADS = 8;
                    const directoryLeads: typeof mentionedCompanies = [];
                    for (const company of mentionedCompanies) {
                        if (directoryLeads.length >= MAX_DIRECTORY_LEADS) break;
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        directoryLeads.push(company);
                    }
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Following ${directoryLeads.length} leads in parallel`);
                    const directoryResults = await Promise.allSettled(
                        directoryLeads.map(company =>
                            this.processSupplierUrl(
                                campaignId, dto, company.url!, workerTag,
                                processedCompanyNames, originLanguage, originCountry,
                                productContext, globalProcessedDomains, 1,
                                userLanguage, knownManufacturers
                            ).catch(() => 0)
                        )
                    );
                    return directoryResults.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
                }

                await this.log(campaignId, `${workerTag} Skipped: Not relevant (${screenerResult.page_type})`);
                return 0;
            }

            const capScore = screenerResult.capability_match_score || 0;
            let isBorderline = false;

            const capScoreRejectThreshold = isLowYield ? 25 : 35;
            if (capScore < capScoreRejectThreshold) {
                // HARD REJECT — clearly irrelevant, but still mine directory leads
                const mentionedFromLowScore = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedFromLowScore.length > 0) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Low-score page ${domain} (${capScore}%) has ${mentionedFromLowScore.length} leads — mining before rejecting`);
                    const MAX_LOW_SCORE_LEADS = 8;
                    const lowScoreLeads: typeof mentionedFromLowScore = [];
                    for (const company of mentionedFromLowScore) {
                        if (lowScoreLeads.length >= MAX_LOW_SCORE_LEADS) break;
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        lowScoreLeads.push(company);
                    }
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Following ${lowScoreLeads.length} low-score leads in parallel`);
                    const lowScoreResults = await Promise.allSettled(
                        lowScoreLeads.map(company =>
                            this.processSupplierUrl(
                                campaignId, dto, company.url!, workerTag,
                                processedCompanyNames, originLanguage, originCountry,
                                productContext, globalProcessedDomains, 1,
                                userLanguage, knownManufacturers
                            ).catch(() => 0)
                        )
                    );
                    return lowScoreResults.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
                }

                await this.log(campaignId, `${workerTag} Skipped: Low match (${capScore}%)`);
                return 0;
            }

            if (capScore < 60) {
                // BORDERLINE (35-59) — proceed to enrichment, but apply stricter auditing
                await this.log(campaignId, `${workerTag} BORDERLINE (${capScore}%) — running enrichment for verification: ${domain}`);
                isBorderline = true;

                // Still mine directory leads from borderline pages
                const mentionedFromBorderline = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedFromBorderline.length > 0) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Borderline page ${domain} has ${mentionedFromBorderline.length} leads — mining in parallel`);
                    const MAX_BORDERLINE_LEADS = 8;
                    const borderlineLeads: typeof mentionedFromBorderline = [];
                    for (const company of mentionedFromBorderline) {
                        if (borderlineLeads.length >= MAX_BORDERLINE_LEADS) break;
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        borderlineLeads.push(company);
                    }
                    // Parallel mining (depth=1 prevents further recursion)
                    await Promise.allSettled(
                        borderlineLeads.map(company =>
                            this.processSupplierUrl(
                                campaignId, dto, company.url!, workerTag,
                                processedCompanyNames, originLanguage, originCountry,
                                productContext, globalProcessedDomains, 1,
                                userLanguage, knownManufacturers
                            ).catch(() => 0)
                        )
                    );
                }
            }

            // 1.5. COMPANY TYPE CLASSIFICATION — hard filter
            const allowedTypes = dto.searchCriteria?.supplierTypes || ['PRODUCENT'];
            const companyType = screenerResult.company_type || 'NIEJASNY';

            if (companyType === 'HANDLOWIEC' && !allowedTypes.includes('HANDLOWIEC')) {
                await this.log(campaignId, `${workerTag} HANDLOWIEC ODRZUCONY: "${screenerResult.extracted_data?.company_name || domain}"`);
                return 0;
            }

            // 1.6. DEEP RESEARCH — when classification is unclear, scrape subpages for more evidence
            // Capped at MAX_DEEP_RESEARCH per campaign to prevent expensive subpage scraping from dominating pipeline
            const campaignDeepCount = this.deepResearchCounts.get(campaignId) || 0;
            const shouldDeepResearch =
                (companyType === 'NIEJASNY' || (screenerResult.company_type_confidence || 0) < 60) &&
                capScore >= 35 && capScore <= 65 &&  // Only borderline cases worth investigating
                campaignDeepCount < this.MAX_DEEP_RESEARCH;

            if (shouldDeepResearch) {
                this.deepResearchCounts.set(campaignId, campaignDeepCount + 1);
                await this.log(campaignId, `${workerTag} DEEP RESEARCH: ${domain} (type=${companyType}, conf=${screenerResult.company_type_confidence}, deep#${campaignDeepCount + 1}/${this.MAX_DEEP_RESEARCH})`);

                const deepResearchPaths = ['/o-nas', '/about', '/about-us', '/o-firmie',
                    '/produkty', '/products', '/oferta', '/ueber-uns', '/kontakt', '/impressum',
                    '/production', '/produkcja', '/unternehmen', '/prodotti', '/technologie', '/technology'];

                let combinedContent = content;
                let pagesChecked = 0;

                for (const path of deepResearchPaths) {
                    if (pagesChecked >= 3) break;  // Reduced from 5 to 3 — get key pages only
                    try {
                        const subpageUrl = new URL(path, url).toString();
                        const subContent = await this.scrapingService.fetchContent(subpageUrl);
                        if (subContent && !subContent.startsWith('Error') && subContent.length > 100) {
                            combinedContent += '\n\n--- PODSTRONA: ' + path + ' ---\n' + subContent;
                            pagesChecked++;
                        }
                    } catch { /* skip */ }
                }

                if (pagesChecked > 0) {
                    const deepResult = await this.screenerAgent.execute(url, combinedContent, dto, productContext, userLanguage, dto.searchCriteria?.requiredCertificates, { industry: dto.searchCriteria?.industry, sourcingMode: (dto.searchCriteria as any)?.sourcingMode, city: (dto.searchCriteria as any)?.city });
                    if (deepResult.company_type !== 'NIEJASNY' ||
                        (deepResult.company_type_confidence || 0) > (screenerResult.company_type_confidence || 0)) {
                        Object.assign(screenerResult, deepResult);
                    }

                    // Re-check company type after deep research
                    const deepCompanyType = screenerResult.company_type || 'NIEJASNY';
                    if (deepCompanyType === 'HANDLOWIEC' && !allowedTypes.includes('HANDLOWIEC')) {
                        await this.log(campaignId, `${workerTag} DEEP RESEARCH -> HANDLOWIEC ODRZUCONY: ${domain}`);
                        return 0;
                    }
                }
            }

            // 1.7. KNOWN MANUFACTURER PROMOTION — if screener returned NIEJASNY but company is in known manufacturers list
            if ((screenerResult.company_type === 'NIEJASNY' || !screenerResult.company_type) && knownManufacturers.length > 0) {
                const companyName = (screenerResult.extracted_data?.company_name || '').toLowerCase();
                const isKnown = knownManufacturers.some(m => {
                    const mDomain = m.website ? this.extractDomain(m.website) : '';
                    return (mDomain && domain.includes(mDomain.replace('www.', ''))) ||
                           (companyName && companyName.length > 3 && (
                               companyName.includes(m.name.toLowerCase()) ||
                               m.name.toLowerCase().includes(companyName)
                           ));
                });
                if (isKnown) {
                    screenerResult.company_type = 'PRODUCENT';
                    screenerResult.company_type_confidence = 75;
                    await this.log(campaignId, `${workerTag} KNOWN MANUFACTURER PROMOTED: ${domain}`);
                }
            }

            // 1.8. NIEJASNY GATE — require minimum confidence for unclassified companies
            const finalCompanyType = screenerResult.company_type || 'NIEJASNY';
            const finalConfidence = screenerResult.company_type_confidence || 0;
            const niejasnyThreshold = isLowYield ? 35 : 50;
            if (finalCompanyType === 'NIEJASNY') {
                if (finalConfidence >= niejasnyThreshold) {
                    // Leave as NIEJASNY — auditor will verify and reclassify
                    await this.log(campaignId, `${workerTag} NIEJASNY PRZEPUSZCZONY: ${domain} (conf=${finalConfidence})`);
                } else {
                    await this.log(campaignId, `${workerTag} NIEJASNY ODRZUCONY: ${domain} (conf=${finalConfidence})`);
                    return 0;
                }
            }

            // 2. ENRICHMENT (skip Gemini call for high-confidence results — screener data is sufficient)
            let enrichmentResult;
            const currentCompanyType = screenerResult.company_type || 'NIEJASNY';
            if (capScore >= 80 && screenerResult.extracted_data?.country && currentCompanyType !== 'NIEJASNY') {
                const displayDomain = this.extractDomain(url);
                const screenerEmail = screenerResult.extracted_data?.email;
                enrichmentResult = {
                    enriched_data: {
                        ...screenerResult.extracted_data,
                        website: this.normalizeToRootDomain(url),
                        domain_display: displayDomain,
                        contact_emails: screenerEmail ? [screenerEmail] : [],
                    },
                    verification: {
                        is_verified_manufacturer: currentCompanyType === 'PRODUCENT',
                        has_contact_email: !!screenerEmail,
                        confidence_score: capScore,
                    },
                };
                await this.log(campaignId, `${workerTag} FAST TRACK (${capScore}%): ${domain} [${currentCompanyType}] — skipping enrichment`);
            } else {
                if (this.shouldStop(campaignId, 0)) return 0;
                this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'ENRICHING' });
                enrichmentResult = await this.enrichmentAgent.execute(screenerResult.extracted_data || {}, url, userLanguage, productContext || undefined);
            }

            // 2.5. LOCAL SUBSIDIARY DETECTION — deferred to post-save (non-blocking)
            // Previously ran synchronously adding ~5s per non-Polish URL on the critical path
            const supplierCountryForLocal = normalizeCountry(
                enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || ''
            );
            const userCountry = 'Polska'; // TODO: from organization settings
            const shouldSearchLocalSubsidiary = supplierCountryForLocal !== userCountry
                && supplierCountryForLocal !== 'Nieznany'
                && !!(enrichmentResult?.enriched_data?.company_name || screenerResult.extracted_data?.company_name);

            // 3. AUDITOR - STRICT VALIDATION
            if (this.shouldStop(campaignId, 0)) return 0;
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'VERIFYING' });
            const enrichedData = enrichmentResult.enriched_data || screenerResult.extracted_data;

            // 5.5 MULTI-SOURCE VERIFICATION — check CompanyRegistry first, Serper only for unknowns
            let multiSourceBonus = 0;
            if (capScore > 50 && depth === 0) {
                try {
                    const msRegistry = await this.companyRegistry.getByDomain(domain).catch(() => null);
                    if (msRegistry && msRegistry.usageCount >= 2) {
                        // Company known across multiple campaigns = high trust
                        multiSourceBonus = 10;
                    } else if (msRegistry && msRegistry.usageCount === 1) {
                        // Known from 1 campaign = moderate trust
                        multiSourceBonus = 4;
                    } else if (enrichedData.company_name && enrichedData.company_name !== 'Detected Supplier') {
                        // Unknown company — Serper fallback for B2B directory check
                        const verifyResults = await this.searchService.searchExtended(
                            `site:europages.com OR site:kompass.com "${enrichedData.company_name}"`,
                            { gl: 'us', hl: 'en', num: 3 }, undefined, campaignId,
                        ).catch(() => []);
                        if (verifyResults.length > 0) {
                            multiSourceBonus = 8;
                        }
                    }
                } catch { /* non-critical */ }
            }

            const registryData = {
                name: enrichedData.company_name || 'Unknown',
                status: 'Active',
                company_type: screenerResult.company_type || 'NIEJASNY',
            };
            const auditorResult = await this.auditorAgent.execute(enrichedData, registryData, userLanguage, productContext ? {
                coreProduct: productContext.coreProduct,
                positiveSignals: productContext.positiveSignals,
                negativeSignals: productContext.negativeSignals,
                supplyChainPosition: productContext.supplyChainPosition,
                disambiguationNote: productContext.disambiguationNote,
                productCategory: productContext.productCategory,
            } : undefined, { industry: dto.searchCriteria?.industry, sourcingMode: (dto.searchCriteria as any)?.sourcingMode, city: (dto.searchCriteria as any)?.city });

            // SHORTLIST MODE — Auditor REJECT only on hard cases (blog/article, completely
            // wrong industry, fabricated data, distributor when buyer wants producer).
            // is_valid=false from data-integrity heuristics (domain mismatch, suspicious
            // location vs TLD) is NOT a reason to drop a lead — it goes in metadata as a
            // warning, supplier still surfaces with appropriate match_score. The buyer
            // contacts; the conversation resolves what the website couldn't.
            if (auditorResult.validation_result === 'REJECTED') {
                await this.log(campaignId, `${workerTag} REJECTED: ${auditorResult.rejection_reason || 'Validation failed'}`);
                if (stats) {
                    stats.auditorRejected++;
                    const reason = auditorResult.rejection_reason?.substring(0, 50) || 'AUDITOR_REJECTED';
                    stats.rejectionReasons.set(reason, (stats.rejectionReasons.get(reason) || 0) + 1);
                }
                return 0;
            }

            // Sprint 3 — HARD FILTERS: deterministic post-Auditor checks. Wizard-collected
            // requirements (MOQ, lead time, voivodeships, nearshore) must drop the supplier
            // here. Certificates DO NOT hard-reject anymore — they annotate the supplier as
            // 'verified' (homepage shows the cert) or 'unknown' (need to confirm with supplier
            // at RFQ time). UI sorts verified to the top. Hard reject on certs dropped valid
            // manufacturers whose homepage simply didn't list every doc the buyer typed.
            const hardFilter = this.applyHardFilters(auditorResult.golden_record, screenerResult.extracted_data, dto);
            if (!hardFilter.passes) {
                const bucket = hardFilter.bucket || 'HARD_FILTER';
                await this.log(campaignId, `${workerTag} ${bucket}: ${hardFilter.reason || ''}`);
                if (stats) {
                    stats.auditorRejected++;
                    stats.rejectionReasons.set(bucket, (stats.rejectionReasons.get(bucket) || 0) + 1);
                }
                return 0;
            }
            const certificateMatch = hardFilter.certificateMatch;
            if (certificateMatch) {
                await this.log(campaignId, `${workerTag} CERT_${certificateMatch.status.toUpperCase()}: ${domain} (verified=[${certificateMatch.verified.join(', ')}], unknown=[${certificateMatch.missing.join(', ')}])`);
            }

            // SHORTLIST MODE — Pipeline rolą jest dostarczyć ranked-list potencjalnych dostawców
            // do RFQ, a nie filtrować do "perfect match". Auditor już REJECTED tylko wyraźny syf
            // (blog/portal/wrong industry). Tu nie odrzucamy więcej. match_score idzie w metadata
            // i UI sortuje po nim.
            const matchScore: number = typeof auditorResult.match_score === 'number'
                ? auditorResult.match_score
                : Math.round((auditorResult.confidence_score || 0.5) * 100);
            const matchLabel: string = auditorResult.match_label
                || (matchScore >= 80 ? 'high' : matchScore >= 50 ? 'likely' : 'speculative');
            const matchReasoning: string = auditorResult.match_reasoning || '';

            // 3.05. AUDITOR RECLASSIFICATION — auditor may override screener's company_type
            const verifiedType = auditorResult?.golden_record?.verified_company_type;
            if (verifiedType && verifiedType !== 'NIEJASNY' && verifiedType !== currentCompanyType) {
                await this.log(campaignId, `${workerTag} AUDITOR REKLASYFIKACJA: ${domain} ${currentCompanyType}->${verifiedType}`);
                if (!allowedTypes.includes(verifiedType)) {
                    await this.log(campaignId, `${workerTag} AUDITOR REKLASYFIKACJA -> ODRZUCONY: ${domain} (${verifiedType})`);
                    return 0;
                }
            }

            // GATE: Supply chain mismatch — hardcoded safety net
            if (productContext?.supplyChainPosition === 'raw material') {
                const spec = (enrichedData.specialization || auditorResult?.golden_record?.specialization || '').toLowerCase();
                const machinePatterns = [
                    'maszyn', 'machine', 'equipment', 'urządze', 'lini', 'extrud', 'wytłaczar',
                    'equipment manufacturer', 'machinery', 'anlagen', 'maschinen'
                ];
                const downstreamPatterns = [
                    'produkcja rur', 'produkcja opakowań', 'produkcja profili', 'produkcja folii',
                    'pipe production', 'packaging production', 'thermoform', 'termoform',
                    'injection mold', 'wtrysk', 'blow mold', 'rozdmuch'
                ];

                const isMachineManufacturer = machinePatterns.some(p => spec.includes(p));
                const isDownstreamProcessor = downstreamPatterns.some(p => spec.includes(p));

                if (isMachineManufacturer || isDownstreamProcessor) {
                    await this.log(campaignId, `${workerTag} SUPPLY CHAIN MISMATCH: "${enrichedData.company_name}" spec="${spec}" → looking for raw material, found ${isMachineManufacturer ? 'machine manufacturer' : 'downstream processor'}`);
                    return 0;
                }
            }

            // 3.1. COUNTRY VALIDATION — hard filters based on region config
            const regionKey = dto.searchCriteria?.region;
            let regionConfig = regionKey ? REGION_LANGUAGE_CONFIG[regionKey] : undefined;

            // CUSTOM region — build allowedCountries from user-selected targetCountries
            if (regionKey === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length) {
                regionConfig = {
                    allowedCountries: dto.searchCriteria.targetCountries.map(
                        (code: string) => normalizeCountry(code)
                    ),
                } as any;
            }
            // Merge user-excluded countries into regionConfig
            if (dto.searchCriteria?.excludedCountries?.length && regionConfig) {
                const userExcluded = dto.searchCriteria.excludedCountries
                    .map((code: string) => normalizeCountry(code))
                    .filter(Boolean);
                regionConfig = {
                    ...regionConfig,
                    excludedCountries: [
                        ...(regionConfig.excludedCountries || []),
                        ...userExcluded,
                    ],
                };
            }
            let supplierCountryNorm = normalizeCountry(
                enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || ''
            );

            // COUNTRY INFERENCE — when enrichment couldn't determine country, infer from context
            if (supplierCountryNorm === 'Nieznany') {
                const tldCountry = inferCountryFromTLD(domain);
                if (tldCountry) {
                    supplierCountryNorm = tldCountry;
                    await this.log(campaignId, `${workerTag} COUNTRY INFERRED FROM TLD: ${domain} → ${tldCountry}`);
                } else if (originCountry && originCountry !== 'Global') {
                    supplierCountryNorm = normalizeCountry(originCountry);
                    await this.log(campaignId, `${workerTag} COUNTRY INFERRED FROM WORKER: ${domain} → ${normalizeCountry(originCountry)}`);
                }
            }

            // 3.1.1 SANCTIONS — universal hard filter
            if (SANCTIONED_COUNTRIES.has(supplierCountryNorm)) {
                await this.log(campaignId, `${workerTag} SANCTIONED COUNTRY: "${enrichedData.company_name}" from ${supplierCountryNorm}`);
                return 0;
            }

            // 3.1.2 EXCLUDED COUNTRIES — negative filter from region config
            // FIXED: Use exact equality instead of substring .includes() to prevent false matches
            // (e.g., "Słowacja" should NOT match exclusion of "Słow")
            if (regionConfig?.excludedCountries) {
                const excluded = regionConfig.excludedCountries.some(
                    (ex: string) => supplierCountryNorm.toLowerCase() === ex.toLowerCase()
                );
                if (excluded) {
                    await this.log(campaignId, `${workerTag} EXCLUDED COUNTRY: "${enrichedData.company_name}" from ${supplierCountryNorm}`);
                    return 0;
                }
            }

            // 3.1.3 ALLOWED COUNTRIES — positive filter (e.g., EU region only allows European countries)
            // Unknown country with generic TLD (.com) gets a pass instead of auto-rejection
            let unknownCountryPenalty = false;
            if (regionConfig?.allowedCountries && regionConfig.allowedCountries.length > 0) {
                if (!regionConfig.allowedCountries.includes(supplierCountryNorm)) {
                    if (supplierCountryNorm === 'Nieznany') {
                        // Don't reject — TLD was generic (.com/.net/.org), country truly unknown
                        // Apply score penalty later to deprioritize
                        unknownCountryPenalty = true;
                        await this.log(campaignId, `${workerTag} UNKNOWN COUNTRY (kept): "${enrichedData.company_name}" — country unknown, will apply score penalty`);
                    } else {
                        await this.log(campaignId, `${workerTag} REGION MISMATCH: "${enrichedData.company_name}" from ${supplierCountryNorm} — not in ${regionKey}`);
                        if (stats) {
                            const reason = 'REGION_MISMATCH';
                            stats.rejectionReasons.set(reason, (stats.rejectionReasons.get(reason) || 0) + 1);
                        }
                        return 0;
                    }
                }
            }

            // 3.2. EMPLOYEE SIZE FILTER — skip mega-corporations
            const employeeStr = enrichmentResult?.enriched_data?.employee_count
                || screenerResult.extracted_data?.employee_count;
            const employeeCount = parseEmployeeCount(employeeStr);
            if (employeeCount !== null && employeeCount > MAX_EMPLOYEE_COUNT) {
                await this.log(campaignId, `${workerTag} TOO LARGE: "${enrichedData.company_name}" (${employeeStr} employees)`);
                return 0;
            }

            // 3.5. EMAIL — collect if available, but don't reject without it
            const emailArray = enrichedData.contact_emails || [];

            // 3.6. COMPANY NAME DEDUPLICATION CHECK (fuzzy — strips legal suffixes)
            const companyName = enrichedData.company_name || screenerResult.extracted_data?.company_name || '';
            const normalizedCompanyName = normalizeCompanyNameForDedup(companyName);

            if (normalizedCompanyName && normalizedCompanyName.length > 2) {
                if (processedCompanyNames.has(normalizedCompanyName)) {
                    await this.log(campaignId, `${workerTag} DUPLICATE: Company "${companyName}" already processed (fuzzy match)`);
                    return 0;
                }
                processedCompanyNames.add(normalizedCompanyName);
            }

            // 4. SAVE (only approved, non-duplicate records with email)

            // FINAL NIEJASNY SAFETY NET — no supplier should ever be saved as NIEJASNY
            let saveCompanyType = (verifiedType && verifiedType !== 'NIEJASNY')
                ? verifiedType
                : (screenerResult.company_type || 'PRODUCENT');

            if (saveCompanyType === 'NIEJASNY') {
                saveCompanyType = 'PRODUCENT';
                await this.log(campaignId, `${workerTag} NIEJASNY->PRODUCENT (forced, score -15%): ${domain}`);
            }

            const capabilityScore = screenerResult.capability_match_score || 50;
            const enrichmentConfidence = enrichmentResult.verification?.confidence_score || 50;
            const websiteTrust = (screenerResult as any).website_trust_score || 50;
            // Weighted formula: capability 50%, enrichment 25%, website trust 25%
            let finalScore = Math.round((capabilityScore * 0.50) + (enrichmentConfidence * 0.25) + (websiteTrust * 0.25));

            // Penalty for forced PRODUCENT classification (was NIEJASNY)
            if (screenerResult.company_type === 'NIEJASNY') {
                const originalScore = finalScore;
                finalScore = Math.max(10, finalScore - 15);
                await this.log(campaignId, `${workerTag} Score penalty: ${originalScore}% → ${finalScore}% (uncertain classification)`);
            }

            // VIES VAT Validation — bonus/penalty for EU suppliers (if VAT number was extracted by Screener)
            // Also propagates VERIFIED tier to any PIPELINE-discovered certs: if the company exists in the
            // national VAT registry, it's a strong enough proof-of-existence to mark cert claims verified.
            const extractedVat = screenerResult.extracted_data?.vat_id;
            let vatVerified = false;
            let vatMetadata: {
                vatVerified: boolean;
                vatCountry: string;
                vatNumber: string;
                registeredName?: string;
                registeredAddress?: string;
                checkedAt: string;
            } | null = null;
            if (this.vatValidation && extractedVat && extractedVat.length >= 8) {
                const vatParsed = this.vatValidation.extractVatFromContent(extractedVat);
                if (vatParsed) {
                    const vatResult = await this.vatValidation.validate(vatParsed.countryCode, vatParsed.vatNumber)
                        .catch(() => null);
                    if (vatResult) {
                        const vatBonus = vatResult.valid ? 15 : -20;
                        finalScore = Math.max(10, Math.min(100, finalScore + vatBonus));
                        vatMetadata = {
                            vatVerified: vatResult.valid,
                            vatCountry: vatParsed.countryCode,
                            vatNumber: vatParsed.vatNumber,
                            registeredName: vatResult.name,
                            registeredAddress: vatResult.address,
                            checkedAt: new Date().toISOString(),
                        };
                        if (vatResult.valid) {
                            vatVerified = true;
                            await this.log(campaignId, `${workerTag} VAT VERIFIED: ${enrichedData.company_name} (+15 trust)${vatResult.name ? ` — "${vatResult.name}"` : ''}`);
                        } else {
                            await this.log(campaignId, `${workerTag} VAT INVALID: ${enrichedData.company_name} (-20 trust)`);
                        }
                    }
                }
            }

            // 5.5 MULTI-SOURCE bonus — found in B2B directories
            if (multiSourceBonus > 0) {
                finalScore = Math.min(100, finalScore + multiSourceBonus);
            }

            // 5.2 FEEDBACK LOOP — boost/penalize based on historical response rate + response speed
            try {
                const fbRegistry = await this.companyRegistry.getByDomain(domain).catch(() => null);
                if (fbRegistry && fbRegistry.rfqsSent >= 2) {
                    const rr = fbRegistry.responseRate || 0;
                    if (rr > 0.3) {
                        finalScore = Math.min(100, finalScore + 10);
                        // Bonus for fast responders — query DB directly for avgResponseTime
                        const fullRecord = await this.prisma.companyRegistry.findUnique({
                            where: { domain }, select: { avgResponseTime: true },
                        }).catch(() => null);
                        const avgHrs = fullRecord?.avgResponseTime || 999;
                        if (avgHrs > 0 && avgHrs < 24) {
                            finalScore = Math.min(100, finalScore + 5);
                        } else if (avgHrs > 0 && avgHrs < 72) {
                            finalScore = Math.min(100, finalScore + 2);
                        }
                    } else if (rr === 0 && fbRegistry.rfqsSent >= 3) {
                        finalScore = Math.max(10, finalScore - 15);
                        await this.log(campaignId, `${workerTag} FEEDBACK PENALTY: ${enrichedData.company_name} (0% response after ${fbRegistry.rfqsSent} RFQs) → -15`);
                    }
                }
            } catch { /* registry unavailable — skip */ }

            // Penalty for unknown country (generic TLD, no inference possible)
            if (unknownCountryPenalty) {
                finalScore = Math.max(10, finalScore - 10);
            }

            // Use enriched website (discovered real domain) instead of original URL
            const finalWebsite = enrichedData.website || this.normalizeToRootDomain(url);

            // If finalWebsite is still a portal domain, skip (directory-mined without real URL)
            if (isPortalDomain(this.extractDomain(finalWebsite))) {
                await this.log(campaignId, `${workerTag} SKIPPED: "${enrichedData.company_name}" has portal URL only (${finalWebsite})`);
                return 0;
            }

            const contactEmailsString = emailArray.join(', ');

            // 4.0.5. TRANSLATE SPECIALIZATION if not in target language
            const rawSpecialization = enrichmentResult?.enriched_data?.specialization || screenerResult.extracted_data?.specialization || 'General';
            const translatedSpecialization = await this.translateSpecialization(rawSpecialization, userLanguage);

            // 4.1. UPDATE/CREATE GLOBAL REGISTRY ENTRY FIRST (to get ID)
            const supplierDomain = this.extractDomain(finalWebsite);
            const registryEntry = await this.companyRegistry.upsert(supplierDomain, {
                name: enrichedData.company_name || screenerResult.extracted_data?.company_name || 'Unknown',
                country: normalizeCountry(enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || 'Europe'),
                city: enrichmentResult?.enriched_data?.city || screenerResult.extracted_data?.city || null,
                specialization: translatedSpecialization,
                certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                employeeCount: enrichmentResult?.enriched_data?.employee_count || screenerResult.extracted_data?.employee_count || 'N/A',
                contactEmails: contactEmailsString,
                explorerResult: screenerResult,
                analystResult: screenerResult,
                enrichmentResult: enrichmentResult,
                auditorResult: auditorResult,
                lastAnalysisScore: finalScore / 10
            }, campaignId);

            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: finalWebsite,
                    name: enrichedData.company_name || screenerResult.extracted_data?.company_name || 'Unknown Company',
                    country: normalizeCountry(enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || 'Europe'),
                    city: enrichmentResult?.enriched_data?.city || screenerResult.extracted_data?.city || null,
                    website: finalWebsite,
                    specialization: translatedSpecialization,
                    certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                    employeeCount: enrichmentResult?.enriched_data?.employee_count || screenerResult.extracted_data?.employee_count || 'N/A',
                    contactEmails: contactEmailsString,
                    explorerResult: JSON.stringify(screenerResult),
                    analystResult: JSON.stringify(screenerResult),
                    enrichmentResult: JSON.stringify(enrichmentResult),
                    auditorResult: JSON.stringify(auditorResult),
                    analysisScore: finalScore / 10,
                    // Flexible blob: VIES VAT + cert match status + match scoring (used by UI sort/badge).
                    // matchScore (0-100) drives the supplier list ranking — high → likely → speculative.
                    metadata: JSON.stringify({
                      ...(vatMetadata ? { vat: vatMetadata } : {}),
                      ...(certificateMatch ? { certificateMatch } : {}),
                      match: {
                        score: matchScore,
                        label: matchLabel,
                        reasoning: matchReasoning,
                      },
                    }),

                    analysisReason: enrichmentResult.verification?.verification_notes || screenerResult.match_reason,
                    originLanguage: originLanguage,
                    originCountry: originCountry,
                    sourceAgent: 'ParallelPipeline',

                    // Company Classification
                    companyType: saveCompanyType,
                    companyTypeConfidence: screenerResult.company_type_confidence || 0,
                    needsManualClassification: ((screenerResult.company_type || 'NIEJASNY') === 'NIEJASNY' && (screenerResult.company_type_confidence || 0) < 60),
                    sourceType: workerTag.includes('LEADER') ? (workerTag.includes('DIRECT') ? 'LEADER_DIRECT' : 'LEADER_SEARCH') : 'SEARCH',

                    // Link to Global Registry
                    registryId: registryEntry.id,

                }
            });

            await this.log(campaignId, `${workerTag} QUALIFIED: ${newSupplier.name} (${finalScore}%) | Emails: ${emailArray.length}`);
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'QUALIFIED', data: newSupplier });

            // Apollo Organizations enrichment — cross-check employee count, industry etc.
            // Fire-and-forget; merges result into Supplier.metadata.apollo when available.
            this.apolloEnrichment
                .enrichOrganization(finalWebsite)
                .then(async (apollo) => {
                    if (!apollo) return;
                    const current = await this.prisma.supplier.findUnique({
                        where: { id: newSupplier.id },
                        select: { metadata: true, employeeCount: true },
                    });
                    let blob: Record<string, any> = {};
                    if (current?.metadata) {
                        try { blob = JSON.parse(current.metadata) || {}; } catch { blob = {}; }
                    }
                    blob.apollo = { ...apollo, enrichedAt: new Date().toISOString() };
                    // Flag mismatch: Apollo employees vs. AI-extracted employeeCount band.
                    const aiEmpStr = (current?.employeeCount || '').toLowerCase();
                    if (apollo.estimatedEmployees && aiEmpStr && aiEmpStr !== 'n/a') {
                        const band = aiEmpStr.match(/(\d+)\s*[-–]\s*(\d+)/);
                        if (band) {
                            const lo = parseInt(band[1], 10);
                            const hi = parseInt(band[2], 10);
                            if (apollo.estimatedEmployees < lo / 2 || apollo.estimatedEmployees > hi * 2) {
                                blob.apollo.employeeMismatch = true;
                            }
                        }
                    }
                    await this.prisma.supplier.update({
                        where: { id: newSupplier.id },
                        data: { metadata: JSON.stringify(blob) },
                    });
                })
                .catch(() => { /* fire-and-forget */ });

            // Persist AI-discovered certs (fire-and-forget — never blocks pipeline).
            // VIES-confirmed suppliers get all their PIPELINE certs promoted to VERIFIED.
            this.persistPipelineCertificates(
                newSupplier.id,
                auditorResult?.golden_record,
                enrichmentResult?.enriched_data,
                screenerResult,
                finalWebsite,
                { vatVerified },
            ).catch(() => {});

            // Fire-and-forget: search for local subsidiary after save (non-blocking)
            if (shouldSearchLocalSubsidiary) {
                const companyNameForLocal = enrichmentResult?.enriched_data?.company_name || screenerResult.extracted_data?.company_name || '';
                this.findLocalSubsidiary(campaignId, newSupplier.id, companyNameForLocal, workerTag).catch(() => {});
            }

            return 1;

        } catch (err: any) {
            const elapsed = Date.now() - urlStartTime;
            await this.log(campaignId, `${workerTag} Error processing ${url} (${Math.round(elapsed / 1000)}s): ${err.message}`);
            return 0;
        } finally {
            const elapsed = Date.now() - urlStartTime;
            if (elapsed > 30000) {
                this.logger.warn(`[${campaignId}] SLOW URL: ${domain} took ${Math.round(elapsed / 1000)}s`);
            }
        }
    }

    /**
     * Translate specialization to target language if needed (post-processing).
     */
    private async translateSpecialization(spec: string, targetLang: string = 'pl'): Promise<string> {
        if (!spec || spec.length < 3) return spec;

        const polishIndicators = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|produkcj|dostaw|handl|przetw|wyrob|czujnik|sensor/i;
        const isPolish = polishIndicators.test(spec);

        // Already in target language — skip translation
        if (targetLang === 'pl' && isPolish) return spec;
        if (targetLang === 'en' && !isPolish) return spec;

        const langNames: Record<string, string> = { pl: 'polski', en: 'English', de: 'Deutsch' };
        const langName = langNames[targetLang] || targetLang;

        try {
            const result = await this.geminiService.generateContent(
                `Translate to ${langName}. Return ONLY the translated text, max 5 words.\n\nText: "${spec}"`
            );
            const translated = result.trim().replace(/^["']|["']$/g, '');
            return translated.length > 0 && translated.length < 100 ? translated : spec;
        } catch { return spec; }
    }

    /**
     * Deferred local subsidiary search — runs after supplier is saved (non-blocking).
     * Updates the supplier's enrichmentResult JSON with local_subsidiary_url if found.
     */
    private async findLocalSubsidiary(
        campaignId: string, supplierId: string, companyName: string, workerTag: string
    ): Promise<void> {
        try {
            const localQuery = `"${companyName}" Polska`;
            const localResults = await this.searchService.searchExtended(
                localQuery, { gl: 'pl', hl: 'pl' }, undefined, campaignId
            );
            if (localResults.length > 0) {
                const localUrl = localResults[0].link;
                const localDomain = this.extractDomain(localUrl);
                if (!isPortalDomain(localDomain) && !SHOP_DOMAINS.has(localDomain.replace(/^www\./, '').toLowerCase())) {
                    const localContent = await this.scrapingService.fetchContent(localUrl);
                    const shortName = normalizeCompanyNameForDedup(companyName);
                    if (localContent && localContent.length > 200 && localContent.toLowerCase().includes(shortName)) {
                        // Update enrichmentResult JSON with subsidiary URL
                        const supplier = await this.prisma.supplier.findUnique({
                            where: { id: supplierId },
                            select: { enrichmentResult: true },
                        });
                        if (supplier) {
                            const enrichResult = supplier.enrichmentResult ? JSON.parse(supplier.enrichmentResult as string) : {};
                            enrichResult.enriched_data = enrichResult.enriched_data || {};
                            enrichResult.enriched_data.local_subsidiary_url = localUrl;
                            await this.prisma.supplier.update({
                                where: { id: supplierId },
                                data: { enrichmentResult: JSON.stringify(enrichResult) },
                            });
                            await this.log(campaignId, `${workerTag} LOCAL SUBSIDIARY (deferred): ${companyName} → ${localDomain}`);
                        }
                    }
                }
            }
        } catch { /* non-fatal — local subsidiary search is optional */ }
    }

    /**
     * Save supplier from CACHE (skip agents, use cached data)
     */
    private async saveSupplierFromCache(
        campaignId: string,
        workerTag: string,
        cachedSupplier: any,
        enrichedData: any,
        dto: CreateCampaignDto,
        processedCompanyNames: Set<string>,
        originLanguage: string,
        originCountry: string,
        userLanguage: string = 'pl',
        productContext?: ProductContext
    ): Promise<boolean> {
        try {
            // Company name deduplication
            const companyName = enrichedData.company_name || '';
            const normalizedCompanyName = normalizeCompanyNameForDedup(companyName);

            if (normalizedCompanyName && normalizedCompanyName.length > 2) {
                if (processedCompanyNames.has(normalizedCompanyName)) {
                    await this.log(campaignId, `${workerTag} CACHE DUPLICATE: Company "${companyName}" already processed`);
                    return false;
                }
                processedCompanyNames.add(normalizedCompanyName);
            }

            // COUNTRY VALIDATION — same filter as fresh pipeline
            let supplierCountry = normalizeCountry(enrichedData.country || '');
            const regionKey = dto?.searchCriteria?.region;
            let regionConfig = regionKey ? REGION_LANGUAGE_CONFIG[regionKey] : undefined;

            // CUSTOM region — build allowedCountries from user-selected targetCountries
            if (regionKey === 'CUSTOM' && dto.searchCriteria?.targetCountries?.length) {
                regionConfig = {
                    allowedCountries: dto.searchCriteria.targetCountries.map(
                        (code: string) => normalizeCountry(code)
                    ),
                } as any;
            }
            // Merge user-excluded countries into regionConfig
            if (dto?.searchCriteria?.excludedCountries?.length && regionConfig) {
                const userExcluded = dto.searchCriteria.excludedCountries
                    .map((code: string) => normalizeCountry(code))
                    .filter(Boolean);
                regionConfig = {
                    ...regionConfig,
                    excludedCountries: [
                        ...(regionConfig.excludedCountries || []),
                        ...userExcluded,
                    ],
                };
            }

            // COUNTRY INFERENCE — when enrichment couldn't determine country, infer from context
            if (supplierCountry === 'Nieznany') {
                const cachedDomain = cachedSupplier.domain || '';
                const tldCountry = inferCountryFromTLD(cachedDomain);
                if (tldCountry) {
                    supplierCountry = tldCountry;
                    await this.log(campaignId, `${workerTag} CACHE COUNTRY INFERRED FROM TLD: ${cachedDomain} → ${tldCountry}`);
                } else if (originCountry && originCountry !== 'Global') {
                    supplierCountry = normalizeCountry(originCountry);
                    await this.log(campaignId, `${workerTag} CACHE COUNTRY INFERRED FROM WORKER: ${cachedDomain} → ${normalizeCountry(originCountry)}`);
                }
            }

            // SANCTIONS — universal hard filter
            if (SANCTIONED_COUNTRIES.has(supplierCountry)) {
                await this.log(campaignId, `${workerTag} CACHE SANCTIONED: "${companyName}" from ${supplierCountry}`);
                return false;
            }

            if (regionConfig?.excludedCountries) {
                const excluded = regionConfig.excludedCountries.some(
                    (ex: string) => supplierCountry.toLowerCase().includes(ex.toLowerCase())
                );
                if (excluded) {
                    await this.log(campaignId, `${workerTag} CACHE EXCLUDED COUNTRY: "${companyName}" from ${supplierCountry}`);
                    return false;
                }
            }

            // ALLOWED COUNTRIES — positive filter
            if (regionConfig?.allowedCountries && regionConfig.allowedCountries.length > 0) {
                if (!regionConfig.allowedCountries.includes(supplierCountry)) {
                    await this.log(campaignId, `${workerTag} CACHE REGION MISMATCH: "${companyName}" from ${supplierCountry} — not in ${regionKey}`);
                    return false;
                }
            }

            // EMPLOYEE SIZE FILTER — same as fresh pipeline
            const employeeCount = parseEmployeeCount(enrichedData.employee_count);
            if (employeeCount !== null && employeeCount > MAX_EMPLOYEE_COUNT) {
                await this.log(campaignId, `${workerTag} CACHE TOO LARGE: "${companyName}" (${enrichedData.employee_count})`);
                return false;
            }

            // PORTAL URL GUARD — same as fresh pipeline
            if (isPortalDomain(this.extractDomain(enrichedData.website || ''))) {
                await this.log(campaignId, `${workerTag} CACHE PORTAL URL: "${companyName}" — skipping`);
                return false;
            }

            // PRODUCT MATCH VALIDATION — run auditor to verify cached firm matches THIS campaign's product
            if (productContext) {
                const registryData = {
                    company_name: enrichedData.company_name,
                    specialization: enrichedData.specialization,
                    country: enrichedData.country,
                    status: 'Active',
                    company_type: cachedSupplier.explorerResult?.company_type || 'NIEJASNY',
                };
                const auditorResult = await this.auditorAgent.execute(enrichedData, registryData, userLanguage, {
                    coreProduct: productContext.coreProduct,
                    positiveSignals: productContext.positiveSignals,
                    negativeSignals: productContext.negativeSignals,
                    supplyChainPosition: productContext.supplyChainPosition,
                    disambiguationNote: productContext.disambiguationNote,
                    productCategory: productContext.productCategory,
                }, { industry: dto.searchCriteria?.industry, sourcingMode: (dto.searchCriteria as any)?.sourcingMode, city: (dto.searchCriteria as any)?.city });
                if (auditorResult.validation_result === 'REJECTED' || auditorResult.is_valid === false) {
                    await this.log(campaignId, `${workerTag} CACHE PRODUCT MISMATCH: "${enrichedData.company_name}" (${enrichedData.specialization}) — ${auditorResult.rejection_reason || 'not matching product'}`);
                    return false;
                }
                // Hard filters apply to cache hits too — buyer's wizard rules must be
                // enforced regardless of where the supplier came from.
                const cacheHardFilter = this.applyHardFilters(
                    auditorResult.golden_record,
                    cachedSupplier.explorerResult?.extracted_data || enrichedData,
                    dto,
                );
                if (!cacheHardFilter.passes) {
                    await this.log(campaignId, `${workerTag} CACHE HARD FILTER ${cacheHardFilter.bucket}: ${cacheHardFilter.reason}`);
                    return false;
                }
            }

            const contactEmails = enrichedData.contact_emails || [];
            const contactEmailsString = Array.isArray(contactEmails) ? contactEmails.join(', ') : contactEmails;
            const finalScore = (cachedSupplier.lastAnalysisScore || 5) * 10;

            // Translate specialization if needed
            const translatedSpecialization = await this.translateSpecialization(
                enrichedData.specialization || 'General', userLanguage
            );

            // Increment usage in registry (and ensure it exists/get ID)
            const registryEntry = await this.companyRegistry.upsert(cachedSupplier.domain, {}, campaignId);

            // Compute cert match from cached certificates so cache-hit suppliers also get the badge
            const requiredCerts: string[] = ((dto.searchCriteria as any)?.requiredCertificates || []).map((c: string) => String(c).trim()).filter(Boolean);
            let cachedCertificateMatch: { status: 'verified' | 'unknown'; missing: string[]; verified: string[] } | undefined;
            if (requiredCerts.length > 0) {
                const found: string[] = Array.isArray(enrichedData.certificates)
                    ? enrichedData.certificates
                    : String(enrichedData.certificates || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                const certCheck = checkRequiredCerts(requiredCerts, found);
                cachedCertificateMatch = {
                    status: certCheck.missing.length === 0 ? 'verified' : 'unknown',
                    missing: certCheck.missing,
                    verified: requiredCerts.filter(r => !certCheck.missing.includes(r) && !certCheck.softPass.includes(r) && !certCheck.unknown.includes(r)),
                };
            }

            // Save to campaign suppliers
            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: enrichedData.website,
                    name: enrichedData.company_name || 'Unknown Company',
                    country: normalizeCountry(enrichedData.country || 'Unknown'),
                    city: enrichedData.city || null,
                    website: enrichedData.website,
                    specialization: translatedSpecialization,
                    certificates: enrichedData.certificates || '',
                    employeeCount: enrichedData.employee_count || 'N/A',
                    contactEmails: contactEmailsString,
                    explorerResult: JSON.stringify(cachedSupplier.explorerResult || {}),
                    analystResult: JSON.stringify(cachedSupplier.analystResult || {}),
                    enrichmentResult: JSON.stringify(cachedSupplier.enrichmentResult || {}),
                    auditorResult: JSON.stringify(cachedSupplier.auditorResult || {}),
                    analysisScore: finalScore / 10,
                    metadata: cachedCertificateMatch ? JSON.stringify({ certificateMatch: cachedCertificateMatch }) : null,

                    analysisReason: 'Data from Global Registry Cache',
                    originLanguage: originLanguage,
                    originCountry: originCountry,
                    sourceAgent: 'Cache/MultimodalWorker',

                    companyType: cachedSupplier.explorerResult?.company_type || 'NIEJASNY',
                    companyTypeConfidence: cachedSupplier.explorerResult?.company_type_confidence || 0,
                    needsManualClassification: false,
                    sourceType: 'SEARCH',

                    registryId: registryEntry.id,

                    contacts: {
                        create: Array.isArray(contactEmails) ? contactEmails.map((email: string) => ({
                            email: email,
                            role: 'Cached Contact',
                            isDecisionMaker: false
                        })) : []
                    }
                }
            });

            await this.log(campaignId, `${workerTag} CACHE QUALIFIED: ${newSupplier.name} (${finalScore}%)`);
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url: enrichedData.website, status: 'QUALIFIED', data: newSupplier });

            // Persist AI-discovered certs from cache (fire-and-forget).
            this.persistPipelineCertificates(
                newSupplier.id,
                cachedSupplier.auditorResult?.golden_record,
                cachedSupplier.enrichmentResult?.enriched_data,
                { extracted_data: cachedSupplier.analystResult },
                enrichedData.website,
            ).catch(() => {});

            return true;
        } catch (err: any) {
            await this.log(campaignId, `${workerTag} Error saving cached supplier: ${err.message}`);
            return false;
        }
    }

    /**
     * Accept campaign: qualify suppliers, create Offers, send INITIAL sequence step.
     */
    async acceptCampaign(campaignId: string, excludedSupplierIds: string[]) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                suppliers: { include: { contacts: true } },
                sequenceTemplate: {
                    include: { steps: { orderBy: { dayOffset: 'asc' as const } } },
                },
                rfqRequest: {
                    include: {
                        owner: { include: { organization: true } },
                    },
                },
            },
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.status !== 'COMPLETED') {
            throw new Error(`Campaign status must be COMPLETED, got: ${campaign.status}`);
        }

        // 1. Soft-delete excluded suppliers
        if (excludedSupplierIds.length > 0) {
            await this.prisma.supplier.updateMany({
                where: { id: { in: excludedSupplierIds }, campaignId },
                data: { deletedAt: new Date() },
            });
        }

        // 2. Get qualified (non-excluded) suppliers
        const qualifiedSuppliers = campaign.suppliers.filter(
            s => !excludedSupplierIds.includes(s.id) && !s.deletedAt,
        );

        this.logger.log(`[ACCEPT] Campaign ${campaignId}: ${qualifiedSuppliers.length} qualified, ${excludedSupplierIds.length} excluded`);

        // 3. Update campaign status
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'ACCEPTED' },
        });

        // 4. Create Offers for each qualified supplier
        const rfqRequestId = campaign.rfqRequest?.id;
        if (!rfqRequestId) {
            this.logger.warn(`[ACCEPT] Campaign ${campaignId} has no rfqRequest — skipping offer creation`);
            return { qualified: qualifiedSuppliers.length, excluded: excludedSupplierIds.length, offersSent: 0 };
        }

        let emailsSent = 0;
        const initialStep = campaign.sequenceTemplate?.steps?.[0]; // dayOffset=0

        for (const supplier of qualifiedSuppliers) {
            // Create Offer
            const offer = await this.prisma.offer.create({
                data: {
                    rfqRequestId,
                    supplierId: supplier.id,
                    status: 'PENDING',
                },
            });

            // Send INITIAL email if sequence template exists
            if (initialStep && campaign.sequenceTemplate) {
                const emails = this.getSupplierEmails(supplier);
                if (emails.length > 0) {
                    try {
                        let subject = this.resolveTemplateVars(
                            initialStep.subject,
                            campaign.rfqRequest!,
                            supplier,
                        );
                        let body = this.resolveTemplateVars(
                            initialStep.bodySnippet,
                            campaign.rfqRequest!,
                            supplier,
                        );

                        // Translate email to supplier's language
                        const targetLang = getLanguageForCountry(supplier.country);
                        let ctaText = 'Złóż ofertę';
                        if (targetLang.code !== 'pl') {
                            this.logger.log(`[ACCEPT] Translating email to ${targetLang.name} for ${supplier.name} (${supplier.country})`);
                            const translated = await this.translateEmail(subject, body, targetLang);
                            subject = translated.subject;
                            body = translated.body;
                            ctaText = translated.ctaText;
                        }

                        const org = campaign.rfqRequest?.owner?.organization;
                        const footerHtml = org ? this.buildAcceptFooterHtml(org) : '';
                        const portalUrl = `${process.env.FRONTEND_URL || 'https://app.procurea.pl'}/offers/${offer.accessToken}`;
                        const recipientEmail = emails[0];

                        const html = `
                            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Procurea</h1>
                                </div>
                                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                    <p style="color: #475569; line-height: 1.6; white-space: pre-line;">${body}</p>
                                    <div style="text-align: center; margin: 24px 0;">
                                        <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            ${ctaText}
                                        </a>
                                    </div>
                                </div>
                                ${footerHtml}
                            </div>
                        `;

                        const emailResult = await this.emailService.sendEmail({
                            to: recipientEmail,
                            subject,
                            html,
                        });

                        if (emailResult.sent) {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, recipientEmail, status: 'SENT' },
                            });
                            emailsSent++;
                        } else {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, recipientEmail, status: 'FAILED' },
                            });
                        }
                    } catch (err: any) {
                        this.logger.error(`[ACCEPT] Failed to send INITIAL to ${supplier.name}: ${err.message}`);
                        await this.prisma.sequenceExecution.create({
                            data: { offerId: offer.id, stepId: initialStep.id, recipientEmail: emails[0], status: 'FAILED' },
                        });
                    }
                }
            }
        }

        // 5. Update status to SENDING
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'SENDING' },
        });

        this.logger.log(`[ACCEPT] Campaign ${campaignId}: ${emailsSent} initial emails sent`);

        // 6. Auto-start contact enrichment (dev only)
        const isDevEnv = !process.env.FUNCTION_TARGET && !process.env.K_SERVICE;
        if (isDevEnv && this.configService.get('APOLLO_API_KEY')) {
            this.logger.log(`[ACCEPT] Starting contact enrichment for campaign ${campaignId}`);
            this.apolloEnrichment.enrichCampaign(campaignId, (current, total, supplierName, level, email) => {
                this.sourcingGateway?.emitContactProgress(campaignId, { current, total, supplierName, level, email });
            }).catch((err) => {
                this.logger.error(`[ACCEPT] Contact enrichment failed for ${campaignId}: ${err.message}`);
            });
        }

        return {
            qualified: qualifiedSuppliers.length,
            excluded: excludedSupplierIds.length,
            offersSent: emailsSent,
        };
    }

    private getSupplierEmails(supplier: any): string[] {
        const contactEmails = supplier.contacts
            ?.map((c: any) => c.email)
            .filter(Boolean) || [];
        if (contactEmails.length > 0) return contactEmails;

        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        }
        return [];
    }

    private resolveTemplateVars(template: string, rfq: any, supplier: any): string {
        const owner = rfq.owner;
        const org = owner?.organization;
        return template
            .replace(/\{\{Product_Name\}\}/g, rfq.productName || '')
            .replace(/\{\{Supplier_Name\}\}/g, supplier.name || '')
            .replace(/\{\{Sender_Name\}\}/g, owner?.name || '')
            .replace(/\{\{Sender_Company\}\}/g, org?.name || '')
            .replace(/\{\{Quantity\}\}/g, String(rfq.quantity || ''))
            .replace(/\{\{Currency\}\}/g, rfq.currency || 'EUR');
    }

    private buildAcceptFooterHtml(org: any): string {
        if (!org.footerEnabled) return '';
        const lines: string[] = [];
        if (org.footerFirstName || org.footerLastName) {
            lines.push(`${org.footerFirstName || ''} ${org.footerLastName || ''}`.trim());
        }
        if (org.footerPosition) lines.push(org.footerPosition);
        if (org.footerCompany) lines.push(org.footerCompany);
        if (org.footerEmail) lines.push(org.footerEmail);
        if (org.footerPhone) lines.push(org.footerPhone);
        if (lines.length === 0) return '';
        return `<div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;"><p style="color: #64748B; font-size: 13px; line-height: 1.6; margin: 0;">${lines.join('<br/>')}</p></div>`;
    }

    /**
     * Translate email subject and body to the target language using Gemini.
     * Returns original text if language is Polish (templates are already in Polish).
     */
    async translateEmail(
        subject: string,
        body: string,
        targetLang: { code: string; name: string },
    ): Promise<{ subject: string; body: string; ctaText: string }> {
        if (targetLang.code === 'pl') {
            return { subject, body, ctaText: 'Złóż ofertę' };
        }

        try {
            const prompt = `Translate the following business email to ${targetLang.name}.
Keep the tone professional and natural - write as a native speaker would.
Do NOT translate company names, person names, or product names.
Also translate the CTA button text "Złóż ofertę" (meaning "Submit your offer/quote").

Subject: ${subject}

Body:
${body}

Respond ONLY with valid JSON (no markdown, no code blocks):
{"subject": "translated subject", "body": "translated body", "ctaText": "translated CTA"}`;

            const response = await this.geminiService.generateContent(prompt);

            // Parse JSON from response (handle potential markdown wrapping)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    subject: parsed.subject || subject,
                    body: parsed.body || body,
                    ctaText: parsed.ctaText || 'Submit Quote',
                };
            }

            this.logger.warn(`[TRANSLATE] Failed to parse Gemini response, using original`);
            return { subject, body, ctaText: 'Submit Quote' };
        } catch (err: any) {
            this.logger.error(`[TRANSLATE] Translation failed: ${err.message}`);
            return { subject, body, ctaText: 'Submit Quote' };
        }
    }
}
