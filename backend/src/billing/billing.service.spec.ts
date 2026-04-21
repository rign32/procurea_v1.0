const stripeMock: any = {
    taxRates: { list: jest.fn(), create: jest.fn() },
    customers: { create: jest.fn() },
    checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
    subscriptions: { retrieve: jest.fn(), update: jest.fn() },
    webhooks: { constructEvent: jest.fn() },
    billingPortal: { sessions: { create: jest.fn() } },
    invoices: { list: jest.fn(), createPreview: jest.fn() },
    creditNotes: { create: jest.fn() },
};

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => stripeMock);
});

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { SalesOpsService } from '../sales-ops/sales-ops.service';
import { ObservabilityService } from '../observability/observability.service';

function buildPrisma() {
    const tx = {
        user: { update: jest.fn(), findUnique: jest.fn() },
        organization: { update: jest.fn(), findUnique: jest.fn() },
        creditTransaction: { create: jest.fn() },
        orgCreditTransaction: { create: jest.fn() },
    };
    const prisma: any = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        organization: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        creditTransaction: {
            findFirst: jest.fn(),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
        },
        orgCreditTransaction: {
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
        },
        stripeEventLog: {
            findUnique: jest.fn(),
            create: jest.fn().mockResolvedValue({ id: 'evt' }),
        },
        $transaction: jest.fn(async (cb: any) => cb(tx)),
        _tx: tx,
    };
    return prisma;
}

function buildConfig(overrides: Record<string, string | undefined> = {}) {
    const defaults: Record<string, string | undefined> = {
        STRIPE_SECRET_KEY: 'sk_test_fake',
        STRIPE_WEBHOOK_SECRET: 'whsec_fake',
        STRIPE_UNLIMITED_PRICE_ID: 'price_pl_fake',
        STRIPE_UNLIMITED_PRICE_ID_USD: 'price_usd_fake',
        DATABASE_URL_STAGING: 'postgres://staging',
    };
    const values = { ...defaults, ...overrides };
    return { get: jest.fn((k: string) => values[k]) };
}

describe('BillingService', () => {
    let service: BillingService;
    let prisma: ReturnType<typeof buildPrisma>;
    let salesOps: any;
    let observability: any;

    beforeEach(async () => {
        jest.clearAllMocks();
        stripeMock.taxRates.list.mockResolvedValue({ data: [] });
        stripeMock.taxRates.create.mockResolvedValue({ id: 'txr_vat' });

        prisma = buildPrisma();
        salesOps = {
            handleStripeCheckout: jest.fn(),
            handleSubscriptionCreated: jest.fn(),
            handleSubscriptionDeleted: jest.fn(),
        };
        observability = { recordEvent: jest.fn().mockResolvedValue(undefined) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillingService,
                { provide: PrismaService, useValue: prisma },
                { provide: ConfigService, useValue: buildConfig() },
                { provide: SalesOpsService, useValue: salesOps },
                { provide: ObservabilityService, useValue: observability },
            ],
        }).compile();

        service = module.get<BillingService>(BillingService);
    });

    // ─────────────────────────────────────────────────────────────
    // createCreditCheckout
    // ─────────────────────────────────────────────────────────────

    describe('createCreditCheckout', () => {
        beforeEach(() => {
            prisma.user.findUnique.mockResolvedValue({
                stripeCustomerId: 'cus_123', email: 'x@y.com', language: 'pl',
            });
            stripeMock.checkout.sessions.create.mockResolvedValue({
                url: 'https://checkout.stripe.com/c/abc',
            });
        });

        it('rejects unknown pack', async () => {
            await expect(service.createCreditCheckout('u1', 'pack_999'))
                .rejects.toThrow(BadRequestException);
            expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('creates PLN session with VAT for Polish users', async () => {
            const res = await service.createCreditCheckout('u1', 'pack_10');

            expect(res.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
            const call = stripeMock.checkout.sessions.create.mock.calls[0][0];
            expect(call.customer).toBe('cus_123');
            expect(call.mode).toBe('payment');
            expect(call.line_items[0].price_data.currency).toBe('pln');
            expect(call.line_items[0].price_data.unit_amount).toBe(14900);
            expect(call.line_items[0].tax_rates).toEqual(['txr_vat']);
            expect(call.metadata).toMatchObject({
                userId: 'u1', packId: 'pack_10', credits: '10', type: 'credit_purchase',
            });
        });

        it('creates USD session with automatic_tax for English users', async () => {
            prisma.user.findUnique.mockResolvedValue({
                stripeCustomerId: 'cus_en', email: 'x@y.com', language: 'en',
            });

            await service.createCreditCheckout('u1', 'pack_25');

            const call = stripeMock.checkout.sessions.create.mock.calls[0][0];
            expect(call.line_items[0].price_data.currency).toBe('usd');
            expect(call.line_items[0].price_data.unit_amount).toBe(19900);
            expect(call.line_items[0].tax_rates).toBeUndefined();
            expect(call.automatic_tax).toEqual({ enabled: true });
            expect(call.locale).toBe('en');
        });

        it('creates Stripe customer if user has none', async () => {
            prisma.user.findUnique.mockResolvedValueOnce({
                stripeCustomerId: null, email: 'new@x.com', name: 'New', companyName: 'ACME',
            });
            prisma.user.findUnique.mockResolvedValueOnce({ language: 'pl' });
            stripeMock.customers.create.mockResolvedValue({ id: 'cus_new' });

            await service.createCreditCheckout('u1', 'pack_10');

            expect(stripeMock.customers.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'new@x.com', metadata: expect.objectContaining({ userId: 'u1' }),
            }));
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: { stripeCustomerId: 'cus_new' },
            }));
        });

        it('emits checkout_started conversion event', async () => {
            await service.createCreditCheckout('u1', 'pack_50');

            expect(observability.recordEvent).toHaveBeenCalledWith(
                'conversion', 'checkout_started', 'info',
                expect.objectContaining({
                    userId: 'u1',
                    metadata: expect.objectContaining({ packId: 'pack_50', credits: 50 }),
                }),
            );
        });
    });

    // ─────────────────────────────────────────────────────────────
    // verifyAndFulfillSession — idempotency + ownership
    // ─────────────────────────────────────────────────────────────

    describe('verifyAndFulfillSession', () => {
        it('throws on unknown session', async () => {
            stripeMock.checkout.sessions.retrieve.mockRejectedValue(new Error('nope'));
            await expect(service.verifyAndFulfillSession('u1', 'cs_bogus'))
                .rejects.toThrow(BadRequestException);
        });

        it('rejects session that belongs to different user', async () => {
            stripeMock.checkout.sessions.retrieve.mockResolvedValue({
                id: 'cs_1', metadata: { userId: 'OTHER_USER' }, payment_status: 'paid',
            });
            await expect(service.verifyAndFulfillSession('u1', 'cs_1'))
                .rejects.toThrow(BadRequestException);
        });

        it('returns fulfilled:false when not paid', async () => {
            stripeMock.checkout.sessions.retrieve.mockResolvedValue({
                id: 'cs_1', metadata: { userId: 'u1' }, payment_status: 'unpaid',
            });
            const res = await service.verifyAndFulfillSession('u1', 'cs_1');
            expect(res).toEqual({ fulfilled: false });
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('idempotent: already-processed session returns current credits without re-fulfilling', async () => {
            stripeMock.checkout.sessions.retrieve.mockResolvedValue({
                id: 'cs_1', metadata: { userId: 'u1', type: 'credit_purchase', credits: '10', packId: 'pack_10' },
                payment_status: 'paid',
            });
            prisma.creditTransaction.findFirst.mockResolvedValue({ id: 'txn-1' });
            prisma.user.findUnique.mockResolvedValue({ searchCredits: 45, plan: 'pay_as_you_go' });

            const res = await service.verifyAndFulfillSession('u1', 'cs_1');

            expect(res).toEqual({ fulfilled: true, credits: 45, plan: 'pay_as_you_go' });
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('fulfills paid credit session + increments credits + creates transaction', async () => {
            stripeMock.checkout.sessions.retrieve.mockResolvedValue({
                id: 'cs_ok',
                metadata: { userId: 'u1', type: 'credit_purchase', credits: '10', packId: 'pack_10' },
                payment_status: 'paid',
                amount_total: 14900,
                currency: 'pln',
            });
            prisma.creditTransaction.findFirst.mockResolvedValue(null);
            (prisma._tx.user.update as jest.Mock).mockResolvedValue({ searchCredits: 10 });
            prisma.user.findUnique.mockResolvedValueOnce({ email: 'x@y.com', name: 'X' });
            prisma.user.findUnique.mockResolvedValueOnce({ searchCredits: 10, plan: 'pay_as_you_go' });

            const res = await service.verifyAndFulfillSession('u1', 'cs_ok');

            expect(res).toEqual({ fulfilled: true, credits: 10, plan: 'pay_as_you_go' });
            expect(prisma._tx.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: expect.objectContaining({
                    searchCredits: { increment: 10 },
                    plan: 'pay_as_you_go',
                }),
            }));
            expect(prisma._tx.creditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ type: 'PURCHASE', stripeSessionId: 'cs_ok' }),
            }));
        });
    });

    // ─────────────────────────────────────────────────────────────
    // handleWebhook — signature + idempotency
    // ─────────────────────────────────────────────────────────────

    describe('handleWebhook', () => {
        it('rejects invalid signature', async () => {
            stripeMock.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('No signatures found');
            });

            await expect(service.handleWebhook(Buffer.from('{}'), 'sig'))
                .rejects.toThrow(BadRequestException);
        });

        it('skips already-processed event (idempotency)', async () => {
            stripeMock.webhooks.constructEvent.mockReturnValue({
                id: 'evt_123', type: 'checkout.session.completed',
                data: { object: {} },
            });
            prisma.stripeEventLog.findUnique.mockResolvedValue({
                id: 'evt_123', processedAt: new Date('2026-01-01'),
            });

            await service.handleWebhook(Buffer.from('{}'), 'sig');

            expect(prisma.stripeEventLog.create).not.toHaveBeenCalled();
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('records event log after processing', async () => {
            stripeMock.webhooks.constructEvent.mockReturnValue({
                id: 'evt_456', type: 'customer.subscription.updated',
                data: { object: { metadata: { userId: 'u1' }, status: 'active', cancel_at_period_end: false } },
            });
            prisma.stripeEventLog.findUnique.mockResolvedValue(null);

            await service.handleWebhook(Buffer.from('{}'), 'sig');

            expect(prisma.stripeEventLog.create).toHaveBeenCalledWith({
                data: { id: 'evt_456', type: 'customer.subscription.updated' },
            });
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: { subscriptionCancelAtPeriodEnd: false },
            }));
        });

        it('subscription deleted reverts user AND org to research plan', async () => {
            stripeMock.webhooks.constructEvent.mockReturnValue({
                id: 'evt_del', type: 'customer.subscription.deleted',
                data: { object: { metadata: { userId: 'u1', organizationId: 'org-1' } } },
            });
            prisma.stripeEventLog.findUnique.mockResolvedValue(null);
            prisma.user.findUnique.mockResolvedValue({ email: 'x@y.com', name: 'X' });

            await service.handleWebhook(Buffer.from('{}'), 'sig');

            expect(prisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'org-1' },
                data: expect.objectContaining({ plan: 'research', stripeSubscriptionId: null }),
            }));
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: expect.objectContaining({ plan: 'research', stripeSubscriptionId: null }),
            }));
            expect(salesOps.handleSubscriptionDeleted).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────────────────────
    // contributeCredits — personal → org wallet transfer
    // ─────────────────────────────────────────────────────────────

    describe('contributeCredits', () => {
        it('rejects non-positive amount', async () => {
            await expect(service.contributeCredits('u1', 0)).rejects.toThrow(BadRequestException);
            await expect(service.contributeCredits('u1', -5)).rejects.toThrow(BadRequestException);
        });

        it('rejects when user not in organization', async () => {
            prisma.user.findUnique.mockResolvedValue({ searchCredits: 10, organizationId: null });
            await expect(service.contributeCredits('u1', 5)).rejects.toThrow(BadRequestException);
        });

        it('rejects when personal credits insufficient', async () => {
            prisma.user.findUnique.mockResolvedValue({ searchCredits: 3, organizationId: 'org-1' });
            await expect(service.contributeCredits('u1', 5)).rejects.toThrow(BadRequestException);
        });

        it('transfers credits personal → org atomically', async () => {
            prisma.user.findUnique.mockResolvedValue({ searchCredits: 20, organizationId: 'org-1' });
            (prisma._tx.user.update as jest.Mock).mockResolvedValue({ searchCredits: 15 });
            (prisma._tx.organization.update as jest.Mock).mockResolvedValue({ searchCredits: 25 });

            const res = await service.contributeCredits('u1', 5);

            expect(res).toEqual({ personalCredits: 15, orgCredits: 25 });
            expect(prisma._tx.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { searchCredits: { decrement: 5 } },
            }));
            expect(prisma._tx.organization.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'org-1' },
                data: { searchCredits: { increment: 5 } },
            }));
            expect(prisma._tx.creditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ type: 'CONTRIBUTION', amount: -5 }),
            }));
            expect(prisma._tx.orgCreditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ type: 'CONTRIBUTION', amount: 5 }),
            }));
        });
    });

    // ─────────────────────────────────────────────────────────────
    // cancelSubscription
    // ─────────────────────────────────────────────────────────────

    describe('cancelSubscription', () => {
        it('rejects when no active subscription exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ stripeSubscriptionId: null, organizationId: null });
            await expect(service.cancelSubscription('u1')).rejects.toThrow(BadRequestException);
        });

        it('cancels org subscription when on unlimited plan', async () => {
            prisma.user.findUnique.mockResolvedValue({
                stripeSubscriptionId: null, organizationId: 'org-1',
            });
            prisma.organization.findUnique.mockResolvedValue({
                stripeSubscriptionId: 'sub_org', plan: 'unlimited',
            });

            const res = await service.cancelSubscription('u1');

            expect(stripeMock.subscriptions.update).toHaveBeenCalledWith('sub_org', {
                cancel_at_period_end: true,
            });
            expect(prisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'org-1' },
                data: { subscriptionCancelAtPeriodEnd: true },
            }));
            expect(res.cancelAtPeriodEnd).toBe(true);
        });

        it('falls back to user-level subscription if org has none', async () => {
            prisma.user.findUnique.mockResolvedValue({
                stripeSubscriptionId: 'sub_user', organizationId: null,
            });

            await service.cancelSubscription('u1');

            expect(stripeMock.subscriptions.update).toHaveBeenCalledWith('sub_user', {
                cancel_at_period_end: true,
            });
        });
    });

    // ─────────────────────────────────────────────────────────────
    // getUserBillingInfo — dual wallet (personal + org)
    // ─────────────────────────────────────────────────────────────

    describe('getUserBillingInfo', () => {
        it('org plan takes precedence over user plan', async () => {
            prisma.user.findUnique.mockResolvedValue({
                searchCredits: 5,
                plan: 'research',
                stripeCustomerId: 'cus_1',
                stripeSubscriptionId: null,
                subscriptionCancelAtPeriodEnd: false,
                trialCreditsUsed: true,
                organizationId: 'org-1',
            });
            prisma.organization.findUnique.mockResolvedValue({
                searchCredits: 42,
                plan: 'unlimited',
                stripeSubscriptionId: 'sub_1',
                subscriptionCancelAtPeriodEnd: false,
                trialCreditsUsed: true,
            });
            stripeMock.subscriptions.retrieve.mockResolvedValue({
                status: 'active',
                cancel_at_period_end: false,
                items: { data: [{ current_period_end: 1775000000 }] },
            });

            const res = await service.getUserBillingInfo('u1');

            expect(res.plan).toBe('unlimited');
            expect(res.personalCredits).toBe(5);
            expect(res.orgCredits).toBe(42);
            expect(res.searchCredits).toBe(47);
            expect(res.currentPeriodEnd).toBeTruthy();
        });

        it('syncs local state when Stripe subscription is canceled', async () => {
            prisma.user.findUnique.mockResolvedValue({
                searchCredits: 0, plan: 'unlimited',
                stripeCustomerId: 'cus_1',
                stripeSubscriptionId: 'sub_zombie',
                subscriptionCancelAtPeriodEnd: false,
                trialCreditsUsed: true,
                organizationId: 'org-1',
            });
            prisma.organization.findUnique.mockResolvedValue({
                searchCredits: 0, plan: 'unlimited',
                stripeSubscriptionId: 'sub_zombie',
                subscriptionCancelAtPeriodEnd: false,
                trialCreditsUsed: true,
            });
            stripeMock.subscriptions.retrieve.mockResolvedValue({
                status: 'canceled',
                cancel_at_period_end: false,
                items: { data: [] },
            });

            await service.getUserBillingInfo('u1');

            expect(prisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'org-1' },
                data: expect.objectContaining({ plan: 'research', stripeSubscriptionId: null }),
            }));
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: expect.objectContaining({ plan: 'research', stripeSubscriptionId: null }),
            }));
        });

        it('throws when user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.getUserBillingInfo('missing'))
                .rejects.toThrow(BadRequestException);
        });
    });
});
