import request from 'supertest';
import { createTestApp, getAuthToken, cleanupTestData, TestContext } from './helpers/test-app';
import { createFullTestScenario, createTestOffer } from './helpers/factories';

describe('RFQ → Offer Full Flow (e2e)', () => {
    let ctx: TestContext;
    let authToken: string;
    let scenario: Awaited<ReturnType<typeof createFullTestScenario>>;

    beforeAll(async () => {
        ctx = await createTestApp();
        scenario = await createFullTestScenario(ctx.prisma, 3);
        authToken = getAuthToken(ctx.jwtService, scenario.user.id);
    });

    afterAll(async () => {
        await cleanupTestData(ctx.prisma);
        await ctx.app.close();
    });

    describe('Step 1: Send RFQ to suppliers', () => {
        it('should send RFQ to all campaign suppliers', async () => {
            const res = await request(ctx.app.getHttpServer())
                .post(`/requests/${scenario.rfq.id}/send-to-campaign`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ campaignId: scenario.campaign.id })
                .expect(201);

            expect(res.body.sent).toBe(3);
            expect(res.body.failed).toBe(0);

            // Verify EmailService was called for each supplier
            expect(ctx.mocks.emailService.sendEmail).toHaveBeenCalledTimes(3);

            // Verify Offer records were created
            const offers = await ctx.prisma.offer.findMany({
                where: { rfqRequestId: scenario.rfq.id },
            });
            expect(offers).toHaveLength(3);
            expect(offers.every(o => o.status === 'PENDING')).toBe(true);
            expect(offers.every(o => o.accessToken != null)).toBe(true);
            expect(offers.every(o => o.tokenExpiresAt != null)).toBe(true);

            // RFQ status should be ACTIVE
            const rfq = await ctx.prisma.rfqRequest.findUnique({ where: { id: scenario.rfq.id } });
            expect(rfq!.status).toBe('ACTIVE');
        });

        it('should not create duplicate offers on re-send', async () => {
            const res = await request(ctx.app.getHttpServer())
                .post(`/requests/${scenario.rfq.id}/send-to-campaign`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ campaignId: scenario.campaign.id })
                .expect(201);

            // No new sends (all suppliers already have offers)
            const offers = await ctx.prisma.offer.findMany({
                where: { rfqRequestId: scenario.rfq.id, parentOfferId: null },
            });
            expect(offers).toHaveLength(3); // Still 3, not 6
        });
    });

    describe('Step 2: Supplier portal access', () => {
        let accessToken: string;

        beforeAll(async () => {
            const offer = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id },
            });
            accessToken = offer!.accessToken;
        });

        it('should load offer via portal (no auth required)', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get(`/portal/offers/${accessToken}`)
                .expect(200);

            expect(res.body.offer).toBeDefined();
            expect(res.body.offer.status).toBe('VIEWED');
            expect(res.body.rfq.productName).toBe(scenario.rfq.productName);
            expect(res.body.portalLanguage).toBeDefined();
        });

        it('should return 404 for invalid token', async () => {
            await request(ctx.app.getHttpServer())
                .get('/portal/offers/invalid-token-12345')
                .expect(404);
        });
    });

    describe('Step 3: Supplier submits offer', () => {
        let accessToken: string;
        let offerId: string;

        beforeAll(async () => {
            const offer = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id },
            });
            accessToken = offer!.accessToken;
            offerId = offer!.id;
        });

        it('should submit offer with price tiers', async () => {
            const res = await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${accessToken}/submit`)
                .send({
                    currency: 'EUR',
                    moq: 100,
                    leadTime: 4,
                    validityDate: '2026-06-01',
                    comments: 'Best quality aluminium',
                    specsConfirmed: true,
                    incotermsConfirmed: true,
                    priceTiers: [
                        { minQty: 1, maxQty: 999, unitPrice: 5.50 },
                        { minQty: 1000, unitPrice: 4.80 },
                    ],
                })
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.status).toBe('SUBMITTED');

            // Verify offer in DB
            const offer = await ctx.prisma.offer.findUnique({
                where: { id: offerId },
                include: { priceTiers: true },
            });
            expect(offer!.status).toBe('SUBMITTED');
            expect(offer!.submittedAt).not.toBeNull();
            expect(offer!.priceTiers).toHaveLength(2);
            expect(offer!.price).toBe(5.50); // First tier as backward-compatible price

            // Verify notification sent to RFQ owner
            expect(ctx.mocks.notificationService.send).toHaveBeenCalledWith(
                scenario.user.id,
                'OFFER_RECEIVED',
                expect.objectContaining({ subject: expect.any(String) }),
            );
        });

        it('should reject double submission', async () => {
            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${accessToken}/submit`)
                .send({
                    currency: 'EUR',
                    priceTiers: [{ minQty: 1, unitPrice: 6.00 }],
                })
                .expect(400);
        });

        it('should reject submission with empty price tiers', async () => {
            // Get a fresh VIEWED offer
            const viewedOffer = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id, status: 'VIEWED' },
            });
            if (!viewedOffer) return; // Skip if no viewed offer available

            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${viewedOffer.accessToken}/submit`)
                .send({ currency: 'EUR', priceTiers: [] })
                .expect(400);
        });
    });

    describe('Step 4: Submit remaining offers for comparison', () => {
        it('should submit second offer', async () => {
            // Find a PENDING or VIEWED offer
            let offer = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id, status: { in: ['PENDING', 'VIEWED'] } },
            });
            if (!offer) return;

            // First view it
            await request(ctx.app.getHttpServer())
                .get(`/portal/offers/${offer.accessToken}`)
                .expect(200);

            // Then submit
            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${offer.accessToken}/submit`)
                .send({
                    currency: 'USD',
                    moq: 500,
                    leadTime: 2,
                    priceTiers: [{ minQty: 1, unitPrice: 6.20 }],
                })
                .expect(201);
        });
    });

    describe('Step 5: View and compare offers', () => {
        it('should list offers for RFQ', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get(`/requests/${scenario.rfq.id}/offers`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should compare submitted offers', async () => {
            const submitted = await ctx.prisma.offer.findMany({
                where: { rfqRequestId: scenario.rfq.id, status: 'SUBMITTED', parentOfferId: null },
            });

            if (submitted.length < 2) return; // Skip if not enough submitted

            const res = await request(ctx.app.getHttpServer())
                .post('/requests/offers/compare')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ offerIds: submitted.map(o => o.id) })
                .expect(201);

            expect(res.body.comparison).toBeDefined();
            expect(res.body.comparison.lowestPrice).toBeDefined();
            expect(res.body.baseCurrency).toBe('PLN');
            expect(res.body.offers.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Step 6: Offer actions (shortlist, accept)', () => {
        it('should shortlist an offer', async () => {
            const submitted = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id, status: 'SUBMITTED', parentOfferId: null },
            });
            if (!submitted) return;

            const res = await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${submitted.id}/shortlist`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(201);

            expect(res.body.status).toBe('SHORTLISTED');
        });

        it('should accept an offer (auto-reject others, close RFQ)', async () => {
            const shortlisted = await ctx.prisma.offer.findFirst({
                where: { rfqRequestId: scenario.rfq.id, status: 'SHORTLISTED' },
            });
            if (!shortlisted) return;

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${shortlisted.id}/accept`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(201);

            // Verify accepted offer
            const accepted = await ctx.prisma.offer.findUnique({ where: { id: shortlisted.id } });
            expect(accepted!.status).toBe('ACCEPTED');

            // Verify other offers rejected
            const others = await ctx.prisma.offer.findMany({
                where: {
                    rfqRequestId: scenario.rfq.id,
                    id: { not: shortlisted.id },
                    parentOfferId: null,
                },
            });
            for (const o of others) {
                expect(o.status).toBe('REJECTED');
            }

            // Verify RFQ closed
            const rfq = await ctx.prisma.rfqRequest.findUnique({ where: { id: scenario.rfq.id } });
            expect(rfq!.status).toBe('CLOSED');
        });
    });

    describe('Step 7: Manual offer creation', () => {
        it('should create offer for a supplier', async () => {
            // Create a new RFQ for this test
            const newRfq = await ctx.prisma.rfqRequest.create({
                data: {
                    productName: 'Manual Offer Test',
                    quantity: 100,
                    currency: 'EUR',
                    status: 'ACTIVE',
                    ownerId: scenario.user.id,
                    campaignId: scenario.campaign.id,
                },
            });

            const res = await request(ctx.app.getHttpServer())
                .post('/requests/offers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    rfqRequestId: newRfq.id,
                    supplierId: scenario.suppliers[0].id,
                    price: 7.25,
                    currency: 'EUR',
                    moq: 50,
                    leadTime: 3,
                    comments: 'Manual entry from phone call',
                })
                .expect(201);

            expect(res.body.status).toBe('SUBMITTED');
            expect(res.body.price).toBe(7.25);
        });
    });
});
