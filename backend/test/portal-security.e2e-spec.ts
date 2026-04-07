import request from 'supertest';
import { createTestApp, getAuthToken, cleanupTestData, TestContext } from './helpers/test-app';
import {
    createTestOrganization,
    createTestUser,
    createTestCampaign,
    createTestSupplier,
    createTestRfq,
    createTestOffer,
} from './helpers/factories';

describe('Portal Security (e2e)', () => {
    let ctx: TestContext;

    beforeAll(async () => {
        ctx = await createTestApp();
    });

    afterAll(async () => {
        await cleanupTestData(ctx.prisma);
        await ctx.app.close();
    });

    describe('Token validation', () => {
        it('should return 404 for non-existent token', async () => {
            await request(ctx.app.getHttpServer())
                .get('/portal/offers/non-existent-token-abc123')
                .expect(404);
        });

        it('should return 400 for expired token', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const user = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: user.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: user.id, campaignId: campaign.id });

            // Create offer with expired token
            const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, {
                tokenExpiresAt: expiredDate,
            });

            await request(ctx.app.getHttpServer())
                .get(`/portal/offers/${offer.accessToken}`)
                .expect(400);
        });

        it('should return 400 for submission with expired token', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const user = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: user.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: user.id, campaignId: campaign.id });

            const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, {
                status: 'VIEWED',
                tokenExpiresAt: expiredDate,
            });

            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${offer.accessToken}/submit`)
                .send({
                    currency: 'EUR',
                    priceTiers: [{ minQty: 1, unitPrice: 5.00 }],
                })
                .expect(400);
        });
    });

    describe('Offer status guards', () => {
        it('should prevent submission of already SUBMITTED offer', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const user = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: user.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: user.id, campaignId: campaign.id });

            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, {
                status: 'SUBMITTED',
                submittedAt: new Date(),
            });

            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${offer.accessToken}/submit`)
                .send({
                    currency: 'EUR',
                    priceTiers: [{ minQty: 1, unitPrice: 5.00 }],
                })
                .expect(400);
        });

        it('should prevent submission of ACCEPTED offer', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const user = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: user.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: user.id, campaignId: campaign.id });

            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, {
                status: 'ACCEPTED',
            });

            await request(ctx.app.getHttpServer())
                .post(`/portal/offers/${offer.accessToken}/submit`)
                .send({
                    currency: 'EUR',
                    priceTiers: [{ minQty: 1, unitPrice: 5.00 }],
                })
                .expect(400);
        });
    });

    describe('Ownership enforcement on offer actions', () => {
        it('should deny accept by non-owner', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const owner = await createTestUser(ctx.prisma, { organizationId: org.id });
            const attacker = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: owner.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: owner.id, campaignId: campaign.id });
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, { status: 'SUBMITTED' });

            const attackerToken = getAuthToken(ctx.jwtService, attacker.id);

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${offer.id}/accept`)
                .set('Authorization', `Bearer ${attackerToken}`)
                .expect(403);
        });

        it('should deny reject by non-owner', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const owner = await createTestUser(ctx.prisma, { organizationId: org.id });
            const attacker = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: owner.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: owner.id, campaignId: campaign.id });
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, { status: 'SUBMITTED' });

            const attackerToken = getAuthToken(ctx.jwtService, attacker.id);

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${offer.id}/reject`)
                .set('Authorization', `Bearer ${attackerToken}`)
                .send({ reason: 'Unauthorized attempt' })
                .expect(403);
        });

        it('should deny sending RFQ by non-owner', async () => {
            const org = await createTestOrganization(ctx.prisma);
            const owner = await createTestUser(ctx.prisma, { organizationId: org.id });
            const attacker = await createTestUser(ctx.prisma, { organizationId: org.id });
            const campaign = await createTestCampaign(ctx.prisma, { userId: owner.id });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: owner.id, campaignId: campaign.id });

            const attackerToken = getAuthToken(ctx.jwtService, attacker.id);

            await request(ctx.app.getHttpServer())
                .post(`/requests/${rfq.id}/send`)
                .set('Authorization', `Bearer ${attackerToken}`)
                .send({ supplierIds: [supplier.id] })
                .expect(403);
        });
    });

    describe('Offer status transition validation', () => {
        let userId: string;
        let authToken: string;

        beforeAll(async () => {
            const org = await createTestOrganization(ctx.prisma);
            const user = await createTestUser(ctx.prisma, { organizationId: org.id });
            userId = user.id;
            authToken = getAuthToken(ctx.jwtService, userId);
        });

        it('should reject shortlisting a PENDING offer', async () => {
            const campaign = await createTestCampaign(ctx.prisma, { userId });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, campaignId: campaign.id });
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, { status: 'PENDING' });

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${offer.id}/shortlist`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should reject accepting a PENDING offer', async () => {
            const campaign = await createTestCampaign(ctx.prisma, { userId });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, campaignId: campaign.id });
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, { status: 'PENDING' });

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${offer.id}/accept`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should reject accepting an already REJECTED offer', async () => {
            const campaign = await createTestCampaign(ctx.prisma, { userId });
            const supplier = await createTestSupplier(ctx.prisma, campaign.id);
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, campaignId: campaign.id });
            const offer = await createTestOffer(ctx.prisma, rfq.id, supplier.id, { status: 'REJECTED' });

            await request(ctx.app.getHttpServer())
                .post(`/requests/offers/${offer.id}/accept`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });

    describe('Portal translations', () => {
        it('should return translations for valid language code', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/portal/translations/pl')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('should reject invalid language code format', async () => {
            await request(ctx.app.getHttpServer())
                .get('/portal/translations/invalid')
                .expect(404);
        });
    });
});
