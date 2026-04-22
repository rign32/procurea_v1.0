import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { VatValidationService } from '../common/services/vat-validation.service';
import { ScrapingService } from '../common/services/scraping.service';

describe('SuppliersService.verifyVat', () => {
    let service: SuppliersService;
    let prisma: any;
    let vatValidation: any;
    let scraping: any;

    beforeEach(async () => {
        prisma = {
            supplier: { findUnique: jest.fn(), update: jest.fn() },
            supplierCertificate: { updateMany: jest.fn() },
        };
        vatValidation = {
            extractVatFromContent: jest.fn(),
            validate: jest.fn(),
        };
        scraping = { fetchContent: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SuppliersService,
                { provide: PrismaService, useValue: prisma },
                { provide: TenantContextService, useValue: { resolve: jest.fn() } },
                { provide: VatValidationService, useValue: vatValidation },
                { provide: ScrapingService, useValue: scraping },
            ],
        }).compile();

        service = module.get<SuppliersService>(SuppliersService);
    });

    it('returns "no_website" when supplier has no VAT in stored data and no website to scrape', async () => {
        prisma.supplier.findUnique.mockResolvedValue({
            id: 'sup-1', website: null, url: null,
            explorerResult: null, analystResult: null, enrichmentResult: null, auditorResult: null,
        });

        const result = await service.verifyVat('sup-1');
        expect(result.status).toBe('no_website');
        expect(vatValidation.validate).not.toHaveBeenCalled();
    });

    it('uses stored agent VAT when present (no scrape needed)', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: JSON.stringify({ golden_record: { vat_id: 'PL1234567890' } }),
                explorerResult: null, analystResult: null, enrichmentResult: null,
            })
            .mockResolvedValueOnce({ metadata: null });
        vatValidation.extractVatFromContent.mockReturnValue({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue({ valid: true, name: 'Test Co', countryCode: 'PL' });

        const result = await service.verifyVat('sup-1');

        expect(scraping.fetchContent).not.toHaveBeenCalled();
        expect(result.status).toBe('verified');
        expect(result.registeredName).toBe('Test Co');
        expect(prisma.supplier.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'sup-1' } }),
        );
    });

    it('falls back to scraping homepage when stored data has no VAT', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: null, enrichmentResult: null, analystResult: null, explorerResult: null,
            })
            .mockResolvedValueOnce({ metadata: null });
        scraping.fetchContent.mockResolvedValue('... NIP: 123-456-78-90 ...');
        vatValidation.extractVatFromContent
            .mockReturnValueOnce({ countryCode: 'PL', vatNumber: '1234567890' })
            .mockReturnValueOnce({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue({ valid: true, name: 'Scraped Co', countryCode: 'PL' });

        const result = await service.verifyVat('sup-1');

        expect(scraping.fetchContent).toHaveBeenCalledWith('https://x.pl');
        expect(result.status).toBe('verified');
    });

    it('promotes PIPELINE certs to VERIFIED when VAT check succeeds', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: JSON.stringify({ golden_record: { vat_id: 'PL1234567890' } }),
                explorerResult: null, analystResult: null, enrichmentResult: null,
            })
            .mockResolvedValueOnce({ metadata: null });
        vatValidation.extractVatFromContent.mockReturnValue({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue({ valid: true, name: 'X', countryCode: 'PL' });

        await service.verifyVat('sup-1');

        expect(prisma.supplierCertificate.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    supplierId: 'sup-1',
                    source: 'PIPELINE',
                    verificationStatus: { not: 'VERIFIED' },
                }),
                data: { verificationStatus: 'VERIFIED' },
            }),
        );
    });

    it('does NOT promote certs when VIES returns invalid', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: JSON.stringify({ golden_record: { vat_id: 'PL1234567890' } }),
                explorerResult: null, analystResult: null, enrichmentResult: null,
            })
            .mockResolvedValueOnce({ metadata: null });
        vatValidation.extractVatFromContent.mockReturnValue({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue({ valid: false, countryCode: 'PL' });

        const result = await service.verifyVat('sup-1');

        expect(result.status).toBe('invalid');
        expect(prisma.supplierCertificate.updateMany).not.toHaveBeenCalled();
    });

    it('returns "api_unavailable" when VIES call fails', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: JSON.stringify({ golden_record: { vat_id: 'PL1234567890' } }),
                explorerResult: null, analystResult: null, enrichmentResult: null,
            });
        vatValidation.extractVatFromContent.mockReturnValue({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue(null); // VIES timeout/error

        const result = await service.verifyVat('sup-1');
        expect(result.status).toBe('api_unavailable');
        expect(prisma.supplier.update).not.toHaveBeenCalled();
    });

    it('merges VAT metadata into existing metadata blob (does not overwrite other fields)', async () => {
        prisma.supplier.findUnique
            .mockResolvedValueOnce({
                id: 'sup-1', website: 'https://x.pl', url: 'https://x.pl',
                auditorResult: JSON.stringify({ golden_record: { vat_id: 'PL1234567890' } }),
                explorerResult: null, analystResult: null, enrichmentResult: null,
            })
            .mockResolvedValueOnce({ metadata: '{"otherThing":"preserve-me"}' });
        vatValidation.extractVatFromContent.mockReturnValue({ countryCode: 'PL', vatNumber: '1234567890' });
        vatValidation.validate.mockResolvedValue({ valid: true, name: 'X', countryCode: 'PL' });

        await service.verifyVat('sup-1');

        const writtenMetadata = JSON.parse(prisma.supplier.update.mock.calls[0][0].data.metadata);
        expect(writtenMetadata.otherThing).toBe('preserve-me');
        expect(writtenMetadata.vat.vatVerified).toBe(true);
    });

    it('throws NotFound when supplier does not exist', async () => {
        prisma.supplier.findUnique.mockResolvedValue(null);
        await expect(service.verifyVat('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
});
