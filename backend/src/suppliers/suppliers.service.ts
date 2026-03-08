import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

interface SupplierFilters {
    country?: string;
    minScore?: number;
    hasEmail?: boolean;
    search?: string;
    campaignId?: string;
    companyType?: string;
}

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: PrismaService) { }

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
        if (filters?.campaignId) {
            where.campaignId = filters.campaignId;
        }
        if (filters?.companyType) {
            if (filters.companyType === 'NEEDS_REVIEW') {
                where.needsManualClassification = true;
            } else {
                where.companyType = filters.companyType;
            }
        }

        // Organization isolation + campaign access permissions
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { organizationId: true, campaignAccess: true, role: true },
            });
            if (user?.organizationId) {
                if (user.campaignAccess === 'own' && user.role !== 'ADMIN') {
                    where.campaign = { rfqRequest: { ownerId: userId } };
                } else {
                    where.campaign = { rfqRequest: { owner: { organizationId: user.organizationId } } };
                }
            } else {
                where.campaign = { rfqRequest: { ownerId: userId } };
            }
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
