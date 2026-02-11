"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CompanyRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRegistryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const STALE_THRESHOLD_DAYS = 30;
let CompanyRegistryService = CompanyRegistryService_1 = class CompanyRegistryService {
    logger = new common_1.Logger(CompanyRegistryService_1.name);
    prisma = new client_1.PrismaClient();
    extractDomain(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname.replace(/^www\./, '').toLowerCase();
        }
        catch {
            return url.toLowerCase();
        }
    }
    isStale(lastProcessedAt) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - STALE_THRESHOLD_DAYS);
        return lastProcessedAt < threshold;
    }
    calculateQualityScore(record) {
        let score = 0;
        if (record.name)
            score += 15;
        if (record.country)
            score += 10;
        if (record.city)
            score += 10;
        if (record.specialization)
            score += 10;
        if (record.certificates)
            score += 10;
        if (record.employeeCount)
            score += 10;
        if (record.contactEmails)
            score += 25;
        if (record.explorerResult)
            score += 5;
        if (record.enrichmentResult)
            score += 5;
        return Math.min(score, 100);
    }
    async getByDomain(domain) {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        const record = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });
        if (!record) {
            this.logger.debug(`[REGISTRY MISS] ${normalizedDomain}`);
            return null;
        }
        if (record.isBlacklisted) {
            this.logger.log(`[REGISTRY BLACKLISTED] ${normalizedDomain}`);
            return null;
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
    async getByUrl(url) {
        return this.getByDomain(this.extractDomain(url));
    }
    async getByName(companyName) {
        if (!companyName || companyName.length < 3)
            return null;
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
    async upsert(domain, data, campaignId) {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });
        const qualityScore = this.calculateQualityScore(data);
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
    async recordRfqSent(domain) {
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
    async recordRfqResponse(domain, responseTimeHours) {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain }
        });
        if (!existing)
            return;
        const newResponseCount = existing.rfqsResponded + 1;
        const responseRate = existing.rfqsSent > 0 ? newResponseCount / existing.rfqsSent : 0;
        let avgResponseTime = existing.avgResponseTime || 0;
        if (responseTimeHours) {
            if (avgResponseTime === 0) {
                avgResponseTime = responseTimeHours;
            }
            else {
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
    async blacklist(domain, reason) {
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
    async verify(domain) {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: { isVerified: true }
        }).catch(() => { });
        this.logger.log(`[REGISTRY VERIFIED] ${normalizedDomain}`);
    }
    async linkKeywords(domain, newKeywords) {
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
        const existing = await this.prisma.companyRegistry.findUnique({
            where: { domain: normalizedDomain },
            select: { keywords: true }
        });
        const currentKeywords = existing?.keywords ? JSON.parse(existing.keywords) : [];
        const merged = [...new Set([...currentKeywords, ...newKeywords])];
        await this.prisma.companyRegistry.update({
            where: { domain: normalizedDomain },
            data: { keywords: JSON.stringify(merged) }
        });
        this.logger.debug(`Linked ${newKeywords.length} keywords to ${normalizedDomain}`);
    }
    async getTopSuppliers(limit = 100) {
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
    async getStats() {
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
};
exports.CompanyRegistryService = CompanyRegistryService;
exports.CompanyRegistryService = CompanyRegistryService = CompanyRegistryService_1 = __decorate([
    (0, common_1.Injectable)()
], CompanyRegistryService);
//# sourceMappingURL=company-registry.service.js.map