import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { GeminiService } from '../common/services/gemini.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

describe('ContractsService — updateStatus + PO auto-gen', () => {
    let service: ContractsService;
    let prisma: any;
    let purchaseOrders: any;

    beforeEach(async () => {
        prisma = {
            contract: { findUnique: jest.fn(), update: jest.fn() },
            purchaseOrder: { findFirst: jest.fn() },
            user: { findUnique: jest.fn() },
        };
        purchaseOrders = {
            generateFromContract: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContractsService,
                { provide: PrismaService, useValue: prisma },
                { provide: TenantContextService, useValue: { resolve: jest.fn() } },
                { provide: GeminiService, useValue: {} },
                { provide: PurchaseOrdersService, useValue: purchaseOrders },
            ],
        }).compile();

        service = module.get<ContractsService>(ContractsService);
        // Bypass findOne (ownership check) for these unit tests
        jest.spyOn(service as any, 'findOne').mockImplementation(async (id: string) => ({
            id,
            status: 'UNDER_REVIEW',
        }));
    });

    it('generates DRAFT PO when contract transitions to SIGNED and none exists', async () => {
        prisma.purchaseOrder.findFirst.mockResolvedValue(null);
        prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'SIGNED' });
        purchaseOrders.generateFromContract.mockResolvedValue({
            id: 'po1',
            poNumber: 'PO-2026-0001',
        });

        await service.updateStatus('c1', 'user-42', 'SIGNED');

        expect(purchaseOrders.generateFromContract).toHaveBeenCalledWith('user-42', 'c1');
    });

    it('skips PO auto-gen when one already exists (idempotent)', async () => {
        prisma.purchaseOrder.findFirst.mockResolvedValue({ id: 'po-existing' });
        prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'SIGNED' });

        await service.updateStatus('c1', 'user-42', 'SIGNED');

        expect(purchaseOrders.generateFromContract).not.toHaveBeenCalled();
    });

    it('does NOT trigger PO auto-gen for non-SIGNED transitions', async () => {
        // UNDER_REVIEW → DRAFT
        (service as any).findOne.mockResolvedValueOnce({ id: 'c1', status: 'UNDER_REVIEW' });
        prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'DRAFT' });

        await service.updateStatus('c1', 'user-42', 'DRAFT');

        expect(prisma.purchaseOrder.findFirst).not.toHaveBeenCalled();
        expect(purchaseOrders.generateFromContract).not.toHaveBeenCalled();
    });

    it('swallows PO-generation errors — contract status transition still succeeds', async () => {
        prisma.purchaseOrder.findFirst.mockResolvedValue(null);
        prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'SIGNED' });
        purchaseOrders.generateFromContract.mockRejectedValue(new Error('boom'));

        const result = await service.updateStatus('c1', 'user-42', 'SIGNED');

        expect(result).toEqual({ id: 'c1', status: 'SIGNED' });
    });

    it('rejects illegal status transitions before touching PO', async () => {
        (service as any).findOne.mockResolvedValueOnce({ id: 'c1', status: 'DRAFT' });

        await expect(
            service.updateStatus('c1', 'user-42', 'ACTIVE'),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prisma.contract.update).not.toHaveBeenCalled();
        expect(purchaseOrders.generateFromContract).not.toHaveBeenCalled();
    });

    describe('expressSignAndPO', () => {
        beforeEach(() => {
            prisma.offer = { findUnique: jest.fn() };
            prisma.contract.findFirst = jest.fn();
            prisma.contract.create = jest.fn();
            prisma.purchaseOrder.findFirst = jest.fn();
        });

        it('rejects non-accepted offers', async () => {
            prisma.offer.findUnique.mockResolvedValue({
                id: 'off1',
                status: 'PENDING',
                rfqRequest: { ownerId: 'u1' },
                supplier: { name: 'Acme' },
            });
            await expect(
                service.expressSignAndPO('u1', 'off1'),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('creates SIGNED contract + DRAFT PO on first call', async () => {
            prisma.offer.findUnique.mockResolvedValue({
                id: 'off1',
                status: 'ACCEPTED',
                rfqRequest: { ownerId: 'u1', productName: 'Widgets' },
                supplier: { name: 'Acme' },
            });
            prisma.contract.findFirst.mockResolvedValue(null);
            prisma.user.findUnique.mockResolvedValue({ organizationId: 'org1' });
            prisma.contract.create.mockResolvedValue({ id: 'c1', status: 'SIGNED' });
            prisma.purchaseOrder.findFirst.mockResolvedValue(null);
            purchaseOrders.generateFromContract.mockResolvedValue({ id: 'po1' });

            const result = await service.expressSignAndPO('u1', 'off1');

            expect(prisma.contract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        offerId: 'off1',
                        status: 'SIGNED',
                        signedAt: expect.any(Date),
                    }),
                }),
            );
            expect(purchaseOrders.generateFromContract).toHaveBeenCalledWith('u1', 'c1');
            expect(result).toEqual({ contract: { id: 'c1', status: 'SIGNED' }, po: { id: 'po1' } });
        });

        it('reuses existing SIGNED contract + existing PO (idempotent)', async () => {
            prisma.offer.findUnique.mockResolvedValue({
                id: 'off1',
                status: 'ACCEPTED',
                rfqRequest: { ownerId: 'u1', productName: 'Widgets' },
                supplier: { name: 'Acme' },
            });
            prisma.contract.findFirst.mockResolvedValue({ id: 'c-existing', status: 'SIGNED' });
            prisma.purchaseOrder.findFirst.mockResolvedValue({ id: 'po-existing' });

            const result = await service.expressSignAndPO('u1', 'off1');

            expect(prisma.contract.create).not.toHaveBeenCalled();
            expect(purchaseOrders.generateFromContract).not.toHaveBeenCalled();
            expect(result).toEqual({
                contract: { id: 'c-existing', status: 'SIGNED' },
                po: { id: 'po-existing' },
            });
        });
    });
});
