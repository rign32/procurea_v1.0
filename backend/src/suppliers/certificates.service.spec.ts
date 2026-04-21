import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';

describe('CertificatesService', () => {
    let service: CertificatesService;
    let prisma: any;

    beforeEach(async () => {
        prisma = {
            supplier: { findUnique: jest.fn(), findMany: jest.fn() },
            supplierCertificate: {
                create: jest.fn(),
                update: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                updateMany: jest.fn(),
                delete: jest.fn(),
            },
        };

        const tenantContext: Partial<TenantContextService> = {
            resolve: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CertificatesService,
                { provide: PrismaService, useValue: prisma },
                { provide: TenantContextService, useValue: tenantContext },
            ],
        }).compile();

        service = module.get<CertificatesService>(CertificatesService);
    });

    describe('createInternal — source + reviewStatus defaults', () => {
        it('defaults source=MANUAL and reviewStatus=APPROVED when no source given', async () => {
            prisma.supplierCertificate.findFirst.mockResolvedValue(null);
            prisma.supplierCertificate.create.mockResolvedValue({ id: 'c1' });

            await service.createInternal('sup-1', {
                type: 'ISO_9001',
                code: '9001:2015',
                validUntil: '2027-06-01',
            });

            expect(prisma.supplierCertificate.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        source: 'MANUAL',
                        reviewStatus: 'APPROVED',
                    }),
                }),
            );
        });

        it('sets reviewStatus=PENDING when source=PORTAL', async () => {
            prisma.supplierCertificate.findFirst.mockResolvedValue(null);
            prisma.supplierCertificate.create.mockResolvedValue({ id: 'c1' });

            await service.createInternal('sup-1', {
                type: 'ISO_9001',
                code: '9001:2015',
                validUntil: '2027-06-01',
                source: 'PORTAL',
            });

            expect(prisma.supplierCertificate.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        source: 'PORTAL',
                        reviewStatus: 'PENDING',
                    }),
                }),
            );
        });

        it('rejects duplicate (supplier, type, code) combination', async () => {
            prisma.supplierCertificate.findFirst.mockResolvedValue({ id: 'existing' });

            await expect(
                service.createInternal('sup-1', {
                    type: 'ISO_9001',
                    code: '9001:2015',
                    validUntil: '2027-06-01',
                }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('rejects invalid validUntil date', async () => {
            prisma.supplierCertificate.findFirst.mockResolvedValue(null);

            await expect(
                service.createInternal('sup-1', {
                    type: 'ISO_9001',
                    code: '9001:2015',
                    validUntil: 'not-a-date',
                }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('approve / reject', () => {
        it('approve sets reviewStatus=APPROVED + reviewedById + clears notes', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue({ id: 'c1', supplierId: 'sup-1' });
            prisma.supplierCertificate.update.mockResolvedValue({ id: 'c1', reviewStatus: 'APPROVED' });

            await service.approve('sup-1', 'c1', 'user-42');

            expect(prisma.supplierCertificate.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'c1' },
                    data: expect.objectContaining({
                        reviewStatus: 'APPROVED',
                        reviewedById: 'user-42',
                        reviewNotes: null,
                    }),
                }),
            );
        });

        it('reject sets REJECTED + persists trimmed notes', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue({ id: 'c1', supplierId: 'sup-1' });
            prisma.supplierCertificate.update.mockResolvedValue({ id: 'c1' });

            await service.reject('sup-1', 'c1', 'user-42', '  bad scan  ');

            expect(prisma.supplierCertificate.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        reviewStatus: 'REJECTED',
                        reviewedById: 'user-42',
                        reviewNotes: 'bad scan',
                    }),
                }),
            );
        });

        it('reject with empty/whitespace notes stores null', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue({ id: 'c1', supplierId: 'sup-1' });
            prisma.supplierCertificate.update.mockResolvedValue({ id: 'c1' });

            await service.reject('sup-1', 'c1', 'user-42', '   ');

            expect(prisma.supplierCertificate.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ reviewNotes: null }),
                }),
            );
        });

        it('approve throws NotFound when cert does not exist', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue(null);
            await expect(service.approve('sup-1', 'nope', 'user-1')).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });

        it('reject throws NotFound when cert does not exist', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue(null);
            await expect(service.reject('sup-1', 'nope', 'user-1')).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });

        it('approve throws NotFound when cert belongs to a different supplier (URL tampering)', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue({
                id: 'c1',
                supplierId: 'sup-OTHER',
            });
            await expect(
                service.approve('sup-1', 'c1', 'user-1'),
            ).rejects.toBeInstanceOf(NotFoundException);
            expect(prisma.supplierCertificate.update).not.toHaveBeenCalled();
        });

        it('reject throws NotFound when cert belongs to a different supplier', async () => {
            prisma.supplierCertificate.findUnique.mockResolvedValue({
                id: 'c1',
                supplierId: 'sup-OTHER',
            });
            await expect(
                service.reject('sup-1', 'c1', 'user-1', 'nope'),
            ).rejects.toBeInstanceOf(NotFoundException);
            expect(prisma.supplierCertificate.update).not.toHaveBeenCalled();
        });
    });

    describe('findExpiringForAlert — review gate', () => {
        it('only queries APPROVED certs so PENDING/REJECTED do not spam alerts', async () => {
            prisma.supplierCertificate.findMany.mockResolvedValue([]);
            await service.findExpiringForAlert(90);

            expect(prisma.supplierCertificate.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ reviewStatus: 'APPROVED' }),
                }),
            );
        });
    });

    describe('summaryForSupplier — respects review status', () => {
        beforeEach(() => {
            prisma.supplierCertificate.findMany.mockResolvedValue([
                { id: '1', reviewStatus: 'APPROVED', status: 'ACTIVE', validUntil: new Date('2030-01-01') },
                { id: '2', reviewStatus: 'APPROVED', status: 'EXPIRING_SOON', validUntil: new Date('2026-05-01') },
                { id: '3', reviewStatus: 'PENDING', status: 'ACTIVE', validUntil: new Date('2030-01-01') },
                { id: '4', reviewStatus: 'PENDING', status: 'EXPIRED', validUntil: new Date('2020-01-01') },
                { id: '5', reviewStatus: 'REJECTED', status: 'ACTIVE', validUntil: new Date('2030-01-01') },
                { id: '6', reviewStatus: 'APPROVED', status: 'EXPIRED', validUntil: new Date('2020-01-01') },
            ]);
        });

        it('counts APPROVED certs by status and tallies pending/rejected separately', async () => {
            const summary = await service.summaryForSupplier('sup-1');

            expect(summary.ACTIVE).toBe(1); // only approved active
            expect(summary.EXPIRING_SOON).toBe(1);
            expect(summary.EXPIRED).toBe(1); // only approved expired
            expect(summary.pending).toBe(2); // 2 pending regardless of their status
            expect(summary.rejected).toBe(1);
        });
    });
});
