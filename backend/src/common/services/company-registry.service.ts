import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const STALE_THRESHOLD_DAYS = 30;

export interface CompanyRecord {
    id: string;
    domain: string;
    name: string | null;
    country: string | null;
    city: string | null;
    specialization: string | null;
    certificates: string | null;
    employeeCount: string | null;
    contactEmails: string | null;
    primaryEmail: string | null;
    explorerResult: any | null;
    analystResult: any | null;
    enrichmentResult: any | null;
    auditorResult: any | null;
    lastAnalysisScore: number | null;
    dataQualityScore: number | null;
    usageCount: number;
    campaignsCount: number;
    rfqsSent: number;
    rfqsResponded: number;
    responseRate: number | null;
    isActive: boolean;
    isVerified: boolean;
    isBlacklisted: boolean;
    lastProcessedAt: Date;
    keywords: string[];
}

@Injectable()
export class CompanyRegistryService {
    private readonly logger = new Logger(CompanyRegistryService.name);
    private readonly prisma = new PrismaClient();

    /**
     * Extract root domain from a URL.
     */
    extractDomain(url: string): string {
        try {
            const parsed = new URL(url);
            return parsed.hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return url.toLowerCase();
        }
    }

    /**
     * Check if company data is stale (older than 30 days).
     */
    isStale(lastProcessedAt: Date): boolean {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - STALE_THRESHOLD_DAYS);
        return lastProcessedAt < threshold;
    }

    /**
     * Calculate data quality score (0-100)
     */
    private calculateQualityScore(record: any): number {
        let score = 0;
        if (record.name) score += 15;
        if (record.country) score += 10;
        if (record.city) score += 10;
        if (record.specialization) score += 10;
        if (record.certificates) score += 10;
        if (record.employeeCount) score += 10;
        if (record.contactEmails) score += 25; // Emails are critical!
        if (record.explorerResult) score += 5;
        if (record.enrichmentResult) score += 5;
        return Math.min(score, 100);
    }

    /**
     * PRIMARY LOOKUP: Get a company from the registry by domain.
     * This is the CACHE CHECK - use this before running expensive enrichment!
     */
    async getByDomain(domain: string): Promise<CompanyRecord | null> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        const record = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });

        if (!record) {
            this.logger.debug(`[REGISTRY MISS] ${normalizedDomain}`);
            return null;
        }

        // Check if blacklisted
        if (record.isBlacklisted) {
            this.logger.log(`[REGISTRY BLACKLISTED] ${normalizedDomain}`);
            return null; // Treat as not found to skip processing
        }

        const isStale = this.isStale(record.lastProcessedAt);
        this.logger.log(`[REGISTRY HIT] ${normalizedDomain} | Quality: ${record.dataQualityScore || 0}% | Used: ${record.usageCount}x | ${isStale ? 'STALE' : 'FRESH'}`);

        return {
            ...record,
            explorerResult: record.explorerResult ? JSON.parse(record.explorerResult) : null,
            analystResult: record.analystResult ? JSON.parse(record.analystResult) : null,
            enrichmentResult: record.enrichmentResult ? JSON.parse(record.enrichmentResult) : null,
            auditorResult: record.auditorResult ? JSON.parse(record.auditorResult) : null,
            keywords: record.keywords ? JSON.parse(record.keywords) : []
        };
    }

    /**
     * Check if a domain is blacklisted (dedicated check, separate from cache lookup).
     */
    async isBlacklisted(domain: string): Promise<boolean> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        const record = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain },
            select: { isBlacklisted: true },
        });
        return record?.isBlacklisted === true;
    }

    /**
     * Get a company from the registry by URL (extracts domain first).
     */
    async getByUrl(url: string): Promise<CompanyRecord | null> {
        return this.getByDomain(this.extractDomain(url));
    }

    /**
     * Search registry by company name (fuzzy match)
     */
    async getByName(companyName: string): Promise<CompanyRecord | null> {
        if (!companyName || companyName.length < 3) return null;

        const normalizedName = companyName.toLowerCase().trim();

        const record = await this.prisma.companyRegistry.findFirst({
            where: {
                name: { contains: normalizedName },
                isBlacklisted: false
            }
        });

        if (!record) {
            this.logger.debug(`[REGISTRY NAME MISS] ${normalizedName}`);
            return null;
        }

        this.logger.log(`[REGISTRY NAME HIT] "${normalizedName}" -> ${record.domain}`);

        return {
            ...record,
            explorerResult: record.explorerResult ? JSON.parse(record.explorerResult) : null,
            analystResult: record.analystResult ? JSON.parse(record.analystResult) : null,
            enrichmentResult: record.enrichmentResult ? JSON.parse(record.enrichmentResult) : null,
            auditorResult: record.auditorResult ? JSON.parse(record.auditorResult) : null,
            keywords: record.keywords ? JSON.parse(record.keywords) : []
        };
    }

    /**
     * UPSERT: Add or update a company in the registry.
     * Increments usage counters automatically.
     */
    async upsert(domain: string, data: Partial<Omit<CompanyRecord, 'id' | 'domain' | 'keywords'>>, campaignId?: string): Promise<CompanyRecord> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        // Check if record exists to determine if we increment usageCount
        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });

        const qualityScore = this.calculateQualityScore(data);

        // Merge contact emails if both old and new exist
        let mergedEmails = data.contactEmails || '';
        if (existing?.contactEmails && data.contactEmails) {
            const existingEmails = existing.contactEmails.split(',').map(e => e.trim().toLowerCase());
            const newEmails = data.contactEmails.split(',').map(e => e.trim().toLowerCase());
            const allEmails = [...new Set([...existingEmails, ...newEmails])];
            mergedEmails = allEmails.join(', ');
        }

        const record = await this.prisma.companyRegistry.upsert({
            where: { domain: normalizedDomain },
            update: {
                name: data.name ?? undefined,
                country: data.country ?? undefined,
                city: data.city ?? undefined,
                specialization: data.specialization ?? undefined,
                certificates: data.certificates ?? undefined,
                employeeCount: data.employeeCount ?? undefined,
                contactEmails: mergedEmails || undefined,
                primaryEmail: data.primaryEmail ?? (mergedEmails.split(',')[0]?.trim() || undefined),
                explorerResult: data.explorerResult ? JSON.stringify(data.explorerResult) : undefined,
                analystResult: data.analystResult ? JSON.stringify(data.analystResult) : undefined,
                enrichmentResult: data.enrichmentResult ? JSON.stringify(data.enrichmentResult) : undefined,
                auditorResult: data.auditorResult ? JSON.stringify(data.auditorResult) : undefined,
                lastAnalysisScore: data.lastAnalysisScore ?? undefined,
                dataQualityScore: qualityScore,
                usageCount: { increment: 1 },
                campaignsCount: campaignId ? { increment: 1 } : undefined,
                lastProcessedAt: new Date()
            },
            create: {
                domain: normalizedDomain,
                name: data.name ?? null,
                country: data.country ?? null,
                city: data.city ?? null,
                specialization: data.specialization ?? null,
                certificates: data.certificates ?? null,
                employeeCount: data.employeeCount ?? null,
                contactEmails: data.contactEmails ?? null,
                primaryEmail: data.primaryEmail ?? (data.contactEmails?.split(',')[0]?.trim() || null),
                explorerResult: data.explorerResult ? JSON.stringify(data.explorerResult) : null,
                analystResult: data.analystResult ? JSON.stringify(data.analystResult) : null,
                enrichmentResult: data.enrichmentResult ? JSON.stringify(data.enrichmentResult) : null,
                auditorResult: data.auditorResult ? JSON.stringify(data.auditorResult) : null,
                lastAnalysisScore: data.lastAnalysisScore ?? null,
                dataQualityScore: qualityScore,
                usageCount: 1,
                campaignsCount: 1,
                lastProcessedAt: new Date()
            }
        });

        this.logger.log(`[REGISTRY UPSERT] ${normalizedDomain} | Quality: ${qualityScore}% | Emails: ${(mergedEmails || '').split(',').length}`);

        return {
            ...record,
            explorerResult: record.explorerResult ? JSON.parse(record.explorerResult) : null,
            analystResult: record.analystResult ? JSON.parse(record.analystResult) : null,
            enrichmentResult: record.enrichmentResult ? JSON.parse(record.enrichmentResult) : null,
            auditorResult: record.auditorResult ? JSON.parse(record.auditorResult) : null,
            keywords: record.keywords ? JSON.parse(record.keywords) : []
        };
    }

    /**
     * Record that an RFQ was sent to this supplier
     */
    async recordRfqSent(domain: string): Promise<void> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: {
                rfqsSent: { increment: 1 },
                lastContactedAt: new Date()
            }
        }).catch(() => { });

        this.logger.log(`[REGISTRY RFQ SENT] ${normalizedDomain}`);
    }

    /**
     * Record that supplier responded to an RFQ
     */
    async recordRfqResponse(domain: string, responseTimeHours?: number): Promise<void> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });

        if (!existing) return;

        const newResponseCount = existing.rfqsResponded + 1;
        const responseRate = existing.rfqsSent > 0 ? newResponseCount / existing.rfqsSent : 0;

        // Calculate running average response time
        let avgResponseTime = existing.avgResponseTime || 0;
        if (responseTimeHours) {
            if (avgResponseTime === 0) {
                avgResponseTime = responseTimeHours;
            } else {
                avgResponseTime = (avgResponseTime * existing.rfqsResponded + responseTimeHours) / newResponseCount;
            }
        }

        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: {
                rfqsResponded: { increment: 1 },
                lastResponseAt: new Date(),
                responseRate: responseRate,
                avgResponseTime: avgResponseTime
            }
        });

        this.logger.log(`[REGISTRY RFQ RESPONSE] ${normalizedDomain} | Rate: ${(responseRate * 100).toFixed(0)}%`);
    }

    /**
     * Blacklist a supplier
     */
    async blacklist(domain: string, reason: string): Promise<void> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: {
                isBlacklisted: true,
                blacklistReason: reason
            }
        }).catch(() => { });

        this.logger.log(`[REGISTRY BLACKLISTED] ${normalizedDomain} - ${reason}`);
    }

    /**
     * Verify a supplier (manually confirmed by user)
     */
    async verify(domain: string): Promise<void> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: { isVerified: true }
        }).catch(() => { });

        this.logger.log(`[REGISTRY VERIFIED] ${normalizedDomain}`);
    }

    /**
     * Link keywords to a company (for search optimization).
     */
    async linkKeywords(domain: string, newKeywords: string[]): Promise<void> {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain },
            select: { keywords: true }
        });

        const currentKeywords: string[] = existing?.keywords ? JSON.parse(existing.keywords) : [];
        const merged = [...new Set([...currentKeywords, ...newKeywords])];

        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: { keywords: JSON.stringify(merged) }
        });

        this.logger.debug(`Linked ${newKeywords.length} keywords to ${normalizedDomain}`);
    }

    /**
     * Get top suppliers by usage (most popular in the system)
     */
    async getTopSuppliers(limit: number = 100): Promise<CompanyRecord[]> {
        const records = await this.prisma.companyRegistry.findMany({
            where: {
                isActive: true,
                isBlacklisted: false,
                contactEmails: { not: null }
            },
            orderBy: [
                { usageCount: 'desc' },
                { dataQualityScore: 'desc' }
            ],
            take: limit
        });

        return records.map(record => ({
            ...record,
            explorerResult: record.explorerResult ? JSON.parse(record.explorerResult) : null,
            analystResult: record.analystResult ? JSON.parse(record.analystResult) : null,
            enrichmentResult: record.enrichmentResult ? JSON.parse(record.enrichmentResult) : null,
            auditorResult: record.auditorResult ? JSON.parse(record.auditorResult) : null,
            keywords: record.keywords ? JSON.parse(record.keywords) : []
        }));
    }

    /**
     * Get registry statistics.
     */
    async getStats(): Promise<{
        total: number;
        withEmails: number;
        verified: number;
        blacklisted: number;
        averageQuality: number;
    }> {
        const total = await this.prisma.companyRegistry.count();
        const withEmails = await this.prisma.companyRegistry.count({
            where: { contactEmails: { not: null } }
        });
        const verified = await this.prisma.companyRegistry.count({
            where: { isVerified: true }
        });
        const blacklisted = await this.prisma.companyRegistry.count({
            where: { isBlacklisted: true }
        });

        const avgResult = await this.prisma.companyRegistry.aggregate({
            _avg: { dataQualityScore: true }
        });

        return {
            total,
            withEmails,
            verified,
            blacklisted,
            averageQuality: avgResult._avg.dataQualityScore || 0
        };
    }
}
