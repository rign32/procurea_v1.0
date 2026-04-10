import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import * as XLSX from 'xlsx';

interface SupplierFilters {
    country?: string;
    minScore?: number;
    hasEmail?: boolean;
    search?: string;
    campaignId?: string;
    campaignIds?: string;
    companyType?: string;
}

@Injectable()
export class SuppliersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    async findAll(filters?: SupplierFilters, userId?: string, pagination?: { page: number; pageSize: number }) {
        const where: any = { deletedAt: null };

        if (filters?.country) {
            where.country = filters.country;
        }
        if (filters?.minScore !== undefined) {
            where.analysisScore = { gte: filters.minScore };
        }
        if (filters?.hasEmail) {
            where.contactEmails = { not: null };
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { specialization: { contains: filters.search, mode: 'insensitive' } },
                { website: { contains: filters.search, mode: 'insensitive' } },
                { city: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.campaignIds) {
            where.campaignId = { in: filters.campaignIds.split(',').filter(Boolean) };
        } else if (filters?.campaignId) {
            where.campaignId = filters.campaignId;
        }
        if (filters?.companyType) {
            if (filters.companyType === 'NEEDS_REVIEW') {
                where.needsManualClassification = true;
            } else {
                where.companyType = filters.companyType;
            }
        }

        // Organization isolation + sharing-aware filtering (via TenantContext)
        if (userId) {
            const tenant = await this.tenantContext.resolve(userId);
            where.campaign = tenant.supplierCampaignFilter();
        }

        const page = pagination?.page || 1;
        const pageSize = Math.min(pagination?.pageSize || 100, 500);
        const skip = (page - 1) * pageSize;

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                include: {
                    campaign: true,
                    offers: true,
                    contacts: true,
                },
                orderBy: { name: 'asc' },
                skip,
                take: pageSize,
            }),
            this.prisma.supplier.count({ where }),
        ]);
        return { suppliers, total, page, pageSize };
    }

    async findOne(id: string) {
        return this.prisma.supplier.findUnique({
            where: { id },
            include: {
                campaign: true,
                offers: true,
                contacts: true,
                documentChunks: true,
            },
        });
    }

    async getPerformance(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            select: { registryId: true },
        });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        // Fetch CompanyRegistry metrics (if linked)
        let registry: {
            responseRate: number | null;
            avgResponseTime: number | null;
            rfqsSent: number;
            rfqsResponded: number;
            dataQualityScore: number | null;
            lastContactedAt: Date | null;
            lastResponseAt: Date | null;
        } | null = null;

        if (supplier.registryId) {
            registry = await this.prisma.companyRegistry.findUnique({
                where: { id: supplier.registryId },
                select: {
                    responseRate: true,
                    avgResponseTime: true,
                    rfqsSent: true,
                    rfqsResponded: true,
                    dataQualityScore: true,
                    lastContactedAt: true,
                    lastResponseAt: true,
                },
            });
        }

        // Aggregate offers for this supplier
        const offers = await this.prisma.offer.findMany({
            where: { supplierId: id },
            select: { status: true, price: true },
        });

        const totalOffers = offers.length;
        const acceptedCount = offers.filter(o => o.status === 'ACCEPTED').length;
        const rejectedCount = offers.filter(o => o.status === 'REJECTED').length;
        const submittedCount = offers.filter(o => o.status === 'SUBMITTED').length;
        const offersWithPrice = offers.filter(o => o.price != null);
        const avgPrice = offersWithPrice.length > 0
            ? offersWithPrice.reduce((sum, o) => sum + (o.price as number), 0) / offersWithPrice.length
            : null;
        const winRate = totalOffers > 0 ? acceptedCount / totalOffers : null;

        return {
            // Registry metrics
            responseRate: registry?.responseRate ?? null,
            avgResponseTime: registry?.avgResponseTime ?? null,
            rfqsSent: registry?.rfqsSent ?? 0,
            rfqsResponded: registry?.rfqsResponded ?? 0,
            dataQualityScore: registry?.dataQualityScore ?? null,
            lastContactedAt: registry?.lastContactedAt ?? null,
            lastResponseAt: registry?.lastResponseAt ?? null,
            // Offer metrics
            totalOffers,
            acceptedCount,
            rejectedCount,
            submittedCount,
            avgPrice,
            winRate,
        };
    }

    async updateNotes(id: string, body: { internalNotes?: string; internalTags?: string[] }) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        return this.prisma.supplier.update({
            where: { id },
            data: {
                internalNotes: body.internalNotes !== undefined ? body.internalNotes : undefined,
                internalTags: body.internalTags !== undefined ? body.internalTags : undefined,
            },
        });
    }

    async importSuppliers(file: any, campaignId: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
        const ext = file.originalname?.toLowerCase()?.split('.').pop();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            throw new BadRequestException('Unsupported file format. Use .xlsx, .xls or .csv');
        }

        // Verify campaign exists
        const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
            throw new BadRequestException('Campaign not found');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const [index, row] of rows.entries()) {
            try {
                // Support both English and Polish column headers
                const name = String(row['name'] || row['Name'] || row['Nazwa'] || row['nazwa'] || '').trim();
                const country = String(row['country'] || row['Country'] || row['Kraj'] || row['kraj'] || '').trim();
                const city = String(row['city'] || row['City'] || row['Miasto'] || row['miasto'] || '').trim();
                const website = String(row['website'] || row['Website'] || row['Strona WWW'] || row['strona'] || '').trim();
                const specialization = String(row['specialization'] || row['Specialization'] || row['Specjalizacja'] || row['specjalizacja'] || '').trim();
                const contactEmail = String(row['contactEmail'] || row['ContactEmail'] || row['Email'] || row['email'] || row['E-mail'] || '').trim();
                const contactName = String(row['contactName'] || row['ContactName'] || row['Kontakt'] || row['kontakt'] || '').trim();

                if (!name) {
                    skipped++;
                    continue;
                }

                // Build URL from website or name
                const url = website || `manual-import://${name.toLowerCase().replace(/\s+/g, '-')}`;

                await this.prisma.supplier.create({
                    data: {
                        campaignId,
                        url,
                        name,
                        country: country || null,
                        city: city || null,
                        website: website || null,
                        specialization: specialization || null,
                        contactEmails: contactEmail || null,
                        sourceType: 'SEARCH',
                        sourceAgent: 'CSV_IMPORT',
                    },
                });

                // If contact name or email provided, create a Contact record
                if (contactName || contactEmail) {
                    const supplier = await this.prisma.supplier.findFirst({
                        where: { campaignId, url },
                        orderBy: { id: 'desc' },
                    });
                    if (supplier) {
                        await this.prisma.contact.create({
                            data: {
                                supplierId: supplier.id,
                                name: contactName || null,
                                email: contactEmail || null,
                            },
                        });
                    }
                }

                imported++;
            } catch (err: any) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        }

        return { imported, skipped, errors };
    }

    async update(id: string, data: any) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }

    async exclude(id: string, reason?: string) {
        return this.prisma.supplier.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                analysisReason: reason || 'Wykluczony przez użytkownika',
            },
        });
    }

    async verify(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            select: { registryId: true },
        });
        if (supplier?.registryId) {
            await this.prisma.companyRegistry.update({
                where: { id: supplier.registryId },
                data: { isVerified: true },
            });
        }
        return { success: true };
    }

    async blacklist(id: string, reason?: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            select: { registryId: true },
        });
        if (supplier?.registryId) {
            await this.prisma.companyRegistry.update({
                where: { id: supplier.registryId },
                data: {
                    isBlacklisted: true,
                    blacklistReason: reason || 'Zablokowany przez użytkownika',
                },
            });
        }
        return { success: true };
    }

    async bulkExclude(ids: string[], reason?: string) {
        const result = await this.prisma.supplier.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: {
                deletedAt: new Date(),
                analysisReason: reason || 'Wykluczony przez użytkownika (bulk)',
            },
        });
        return { excluded: result.count };
    }

    async bulkBlacklist(ids: string[], reason?: string) {
        const suppliers = await this.prisma.supplier.findMany({
            where: { id: { in: ids } },
            select: { registryId: true },
        });
        const registryIds = suppliers.map(s => s.registryId).filter(Boolean) as string[];
        if (registryIds.length > 0) {
            await this.prisma.companyRegistry.updateMany({
                where: { id: { in: registryIds } },
                data: {
                    isBlacklisted: true,
                    blacklistReason: reason || 'Zablokowany przez użytkownika (bulk)',
                },
            });
        }
        return { blacklisted: registryIds.length };
    }

    async getBlacklist() {
        return this.prisma.companyRegistry.findMany({
            where: { isBlacklisted: true },
            orderBy: { lastProcessedAt: 'desc' },
        });
    }

    async removeFromBlacklist(registryId: string) {
        return this.prisma.companyRegistry.update({
            where: { id: registryId },
            data: { isBlacklisted: false, blacklistReason: null },
        });
    }

    async updateBlacklistReason(registryId: string, reason: string) {
        return this.prisma.companyRegistry.update({
            where: { id: registryId },
            data: { blacklistReason: reason },
        });
    }

    async getRecommendations(params: {
        productName?: string;
        category?: string;
        country?: string;
        limit?: number;
    }) {
        const { productName, category, country, limit = 10 } = params;

        const where: any = {
            isBlacklisted: false,
            isActive: true,
        };

        // Filter by country if provided
        if (country) {
            where.country = { equals: country, mode: 'insensitive' };
        }

        // Build OR conditions for text matching
        const textFilters: any[] = [];
        const keywords = [
            ...(productName ? productName.split(/[\s,;]+/).filter(k => k.length >= 3) : []),
            ...(category ? category.split(/[\s,;]+/).filter(k => k.length >= 3) : []),
        ];

        for (const keyword of keywords) {
            textFilters.push(
                { specialization: { contains: keyword, mode: 'insensitive' } },
                { name: { contains: keyword, mode: 'insensitive' } },
            );
        }

        if (textFilters.length > 0) {
            where.OR = textFilters;
        }

        // Fetch candidates from CompanyRegistry — grab more than needed for scoring
        const candidates = await this.prisma.companyRegistry.findMany({
            where,
            take: Math.min(limit * 5, 200),
            orderBy: [
                { lastAnalysisScore: 'desc' },
                { usageCount: 'desc' },
            ],
            select: {
                id: true,
                domain: true,
                name: true,
                country: true,
                city: true,
                specialization: true,
                certificates: true,
                lastAnalysisScore: true,
                dataQualityScore: true,
                responseRate: true,
                usageCount: true,
                campaignsCount: true,
                rfqsSent: true,
                rfqsResponded: true,
                isVerified: true,
                contactEmails: true,
                primaryEmail: true,
            },
        });

        // Score and rank candidates
        const lowerKeywords = keywords.map(k => k.toLowerCase());

        const scored = candidates.map(c => {
            // analysisScore: 0-10 scale -> normalize to 0-100
            const analysisNorm = c.lastAnalysisScore != null
                ? Math.min((c.lastAnalysisScore / 10) * 100, 100)
                : 30; // default for unscored

            // responseRate: 0-1 scale -> normalize to 0-100
            const responseNorm = c.responseRate != null
                ? Math.min(c.responseRate * 100, 100)
                : 50; // neutral default if no data

            // dataQualityScore: already 0-100
            const qualityNorm = c.dataQualityScore ?? 30;

            // Battle-tested: usageCount > 0 = 100, otherwise 0
            const battleTested = c.usageCount > 0 ? 100 : 0;

            // Weighted score
            const totalScore = Math.round(
                analysisNorm * 0.4 +
                responseNorm * 0.3 +
                qualityNorm * 0.2 +
                battleTested * 0.1
            );

            // Keyword relevance boost (up to +10 points)
            let relevanceBonus = 0;
            if (lowerKeywords.length > 0 && c.specialization) {
                const specLower = c.specialization.toLowerCase();
                const matchCount = lowerKeywords.filter(k => specLower.includes(k)).length;
                relevanceBonus = Math.min(Math.round((matchCount / lowerKeywords.length) * 10), 10);
            }

            const finalScore = Math.min(totalScore + relevanceBonus, 100);

            return {
                id: c.id,
                domain: c.domain,
                name: c.name,
                country: c.country,
                city: c.city,
                specialization: c.specialization,
                certificates: c.certificates,
                isVerified: c.isVerified,
                hasEmail: !!(c.contactEmails || c.primaryEmail),
                matchScore: finalScore,
                scoreBreakdown: {
                    analysisScore: Math.round(analysisNorm),
                    responseRate: Math.round(responseNorm),
                    dataQuality: Math.round(qualityNorm),
                    battleTested: Math.round(battleTested),
                    relevanceBonus,
                },
                stats: {
                    usageCount: c.usageCount,
                    campaignsCount: c.campaignsCount,
                    rfqsSent: c.rfqsSent,
                    rfqsResponded: c.rfqsResponded,
                    responseRate: c.responseRate,
                },
            };
        });

        // Sort by score descending, take top N
        scored.sort((a, b) => b.matchScore - a.matchScore);
        const results = scored.slice(0, limit);

        return {
            recommendations: results,
            total: scored.length,
            criteria: { productName, category, country, limit },
        };
    }

    async exportCSV(filters?: Omit<SupplierFilters, 'campaignId'>) {
        const { suppliers } = await this.findAll(filters);

        const header = 'Name,Country,City,Website,ContactEmails,Score,Specialization,Certificates';
        const rows = suppliers.map((s: any) => {
            const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
            return [
                esc(s.name), esc(s.country), esc(s.city), esc(s.website),
                esc(s.contactEmails), esc(s.analysisScore), esc(s.specialization), esc(s.certificates),
            ].join(',');
        });
        return [header, ...rows].join('\n');
    }

    // ===== BLACKLIST IMPORT =====

    async importBlacklist(file: any): Promise<{ imported: number; skipped: number; errors: string[] }> {
        const ext = file.originalname?.toLowerCase()?.split('.').pop();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            throw new BadRequestException('Nieobsługiwany format pliku. Użyj .xlsx, .xls lub .csv');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const row of rows) {
            try {
                const name = String(row['Company Name'] || row['Nazwa firmy'] || '').trim();
                const domain = String(row['Domain'] || row['Domena'] || '').trim().toLowerCase();
                const country = String(row['Country'] || row['Kraj'] || '').trim();
                const city = String(row['City'] || row['Miasto'] || '').trim();
                const reason = String(row['Reason'] || row['Powód'] || 'Import z pliku Excel').trim();

                if (!domain && !name) {
                    skipped++;
                    continue;
                }

                if (domain) {
                    await this.prisma.companyRegistry.upsert({
                        where: { domain },
                        update: {
                            isBlacklisted: true,
                            blacklistReason: reason,
                            name: name || undefined,
                            country: country || undefined,
                            city: city || undefined,
                        },
                        create: {
                            domain,
                            name: name || null,
                            country: country || null,
                            city: city || null,
                            isBlacklisted: true,
                            blacklistReason: reason,
                        },
                    });
                    imported++;
                } else {
                    const syntheticDomain = `manual-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
                    await this.prisma.companyRegistry.create({
                        data: {
                            domain: syntheticDomain,
                            name,
                            country: country || null,
                            city: city || null,
                            isBlacklisted: true,
                            blacklistReason: reason,
                        },
                    });
                    imported++;
                }
            } catch (err: any) {
                errors.push(`Wiersz "${row['Company Name'] || row['Nazwa firmy'] || '?'}": ${err.message}`);
            }
        }

        return { imported, skipped, errors };
    }

    generateBlacklistTemplate(): Buffer {
        const sampleData = [
            { 'Company Name': 'Walmart Inc.', Domain: 'walmart.com', Country: 'US', City: 'Bentonville', Reason: 'Poor quality history' },
            { 'Company Name': 'Amazon.com Inc.', Domain: 'amazon.com', Country: 'US', City: 'Seattle', Reason: 'Unreliable delivery' },
            { 'Company Name': 'Apple Inc.', Domain: 'apple.com', Country: 'US', City: 'Cupertino', Reason: 'Pricing issues' },
            { 'Company Name': 'ExxonMobil', Domain: 'exxonmobil.com', Country: 'US', City: 'Irving', Reason: 'Contract disputes' },
            { 'Company Name': 'Berkshire Hathaway', Domain: 'berkshirehathaway.com', Country: 'US', City: 'Omaha', Reason: 'Non-compliant' },
            { 'Company Name': 'UnitedHealth Group', Domain: 'unitedhealthgroup.com', Country: 'US', City: 'Minnetonka', Reason: 'Late deliveries' },
            { 'Company Name': 'Johnson & Johnson', Domain: 'jnj.com', Country: 'US', City: 'New Brunswick', Reason: 'Quality concerns' },
            { 'Company Name': 'JPMorgan Chase', Domain: 'jpmorganchase.com', Country: 'US', City: 'New York', Reason: 'Communication issues' },
            { 'Company Name': 'Visa Inc.', Domain: 'visa.com', Country: 'US', City: 'San Francisco', Reason: 'Price gouging' },
            { 'Company Name': 'Procter & Gamble', Domain: 'pg.com', Country: 'US', City: 'Cincinnati', Reason: 'Supply chain issues' },
            { 'Company Name': 'Mastercard', Domain: 'mastercard.com', Country: 'US', City: 'Purchase', Reason: 'Contractual breach' },
            { 'Company Name': 'Home Depot', Domain: 'homedepot.com', Country: 'US', City: 'Atlanta', Reason: 'Defective products' },
            { 'Company Name': 'Chevron Corp.', Domain: 'chevron.com', Country: 'US', City: 'San Ramon', Reason: 'Environmental violations' },
            { 'Company Name': 'Merck & Co.', Domain: 'merck.com', Country: 'US', City: 'Rahway', Reason: 'Regulatory issues' },
            { 'Company Name': 'AbbVie Inc.', Domain: 'abbvie.com', Country: 'US', City: 'North Chicago', Reason: 'Patent disputes' },
            { 'Company Name': 'Costco Wholesale', Domain: 'costco.com', Country: 'US', City: 'Issaquah', Reason: 'Minimum order issues' },
            { 'Company Name': 'Pfizer Inc.', Domain: 'pfizer.com', Country: 'US', City: 'New York', Reason: 'Compliance violations' },
            { 'Company Name': 'PepsiCo Inc.', Domain: 'pepsico.com', Country: 'US', City: 'Purchase', Reason: 'Packaging defects' },
            { 'Company Name': 'Cisco Systems', Domain: 'cisco.com', Country: 'US', City: 'San Jose', Reason: 'Warranty disputes' },
            { 'Company Name': 'Broadcom Inc.', Domain: 'broadcom.com', Country: 'US', City: 'San Jose', Reason: 'Lead time issues' },
            { 'Company Name': 'Tesla Inc.', Domain: 'tesla.com', Country: 'US', City: 'Austin', Reason: 'Inconsistent quality' },
            { 'Company Name': 'Oracle Corp.', Domain: 'oracle.com', Country: 'US', City: 'Austin', Reason: 'Licensing issues' },
            { 'Company Name': 'Nike Inc.', Domain: 'nike.com', Country: 'US', City: 'Beaverton', Reason: 'Labor practices' },
            { 'Company Name': 'McDonalds Corp.', Domain: 'mcdonalds.com', Country: 'US', City: 'Chicago', Reason: 'Sourcing conflicts' },
            { 'Company Name': 'Walt Disney Co.', Domain: 'disney.com', Country: 'US', City: 'Burbank', Reason: 'IP disputes' },
            { 'Company Name': 'Intel Corp.', Domain: 'intel.com', Country: 'US', City: 'Santa Clara', Reason: 'Chip shortage blame' },
            { 'Company Name': 'IBM Corp.', Domain: 'ibm.com', Country: 'US', City: 'Armonk', Reason: 'Service level failures' },
            { 'Company Name': 'Goldman Sachs', Domain: 'goldmansachs.com', Country: 'US', City: 'New York', Reason: 'Financial disputes' },
            { 'Company Name': 'Caterpillar Inc.', Domain: 'caterpillar.com', Country: 'US', City: 'Irving', Reason: 'Safety incidents' },
            { 'Company Name': '3M Company', Domain: '3m.com', Country: 'US', City: 'Saint Paul', Reason: 'Product recalls' },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        worksheet['!cols'] = [
            { wch: 25 },
            { wch: 28 },
            { wch: 10 },
            { wch: 18 },
            { wch: 30 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Blacklist');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    }
}
