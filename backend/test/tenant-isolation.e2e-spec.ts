import request from 'supertest';
import { createTestApp, getAuthToken, cleanupTestData, TestContext } from './helpers/test-app';
import { createTestUser, createTestOrganization, createTestRfq, createTestCampaign, createTestSupplier } from './helpers/factories';

/**
 * Tenant Isolation E2E Tests
 *
 * Verifies that users in different organizations cannot see each other's data.
 * This is a critical security test covering the TenantContext service.
 */
describe('Tenant Isolation (e2e)', () => {
    let ctx: TestContext;

    // Org A: Alice
    let orgA: any;
    let alice: any;
    let aliceToken: string;

    // Org B: Bob
    let orgB: any;
    let bob: any;
    let bobToken: string;

    // Solo user without organization: Charlie
    let charlie: any;
    let charlieToken: string;

    beforeAll(async () => {
        ctx = await createTestApp();

        // Create two organizations
        orgA = await createTestOrganization(ctx.prisma, { name: 'Org Alpha' });
        orgB = await createTestOrganization(ctx.prisma, { name: 'Org Beta' });

        // Create users
        alice = await createTestUser(ctx.prisma, {
            email: 'alice@orgalpha.com',
            name: 'Alice',
            organizationId: orgA.id,
        });
        bob = await createTestUser(ctx.prisma, {
            email: 'bob@orgbeta.com',
            name: 'Bob',
            organizationId: orgB.id,
        });
        charlie = await createTestUser(ctx.prisma, {
            email: 'charlie@solo.com',
            name: 'Charlie',
            // No organization
        });

        aliceToken = getAuthToken(ctx.jwtService, alice.id, alice.email);
        bobToken = getAuthToken(ctx.jwtService, bob.id, bob.email);
        charlieToken = getAuthToken(ctx.jwtService, charlie.id, charlie.email);
    });

    afterAll(async () => {
        await cleanupTestData(ctx.prisma);
        // Clean up users and orgs
        await ctx.prisma.userSharingPreference.deleteMany({});
        await ctx.prisma.user.deleteMany({ where: { id: { in: [alice.id, bob.id, charlie.id] } } });
        await ctx.prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
        await ctx.app.close();
    });

    describe('RFQ isolation', () => {
        let aliceRfqId: string;
        let bobRfqId: string;

        beforeAll(async () => {
            // Alice creates an RFQ
            const res1 = await request(ctx.app.getHttpServer())
                .post('/requests')
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ productName: 'Alice Widget', quantity: 100, currency: 'USD' })
                .expect(201);
            aliceRfqId = res1.body.id;

            // Bob creates an RFQ
            const res2 = await request(ctx.app.getHttpServer())
                .post('/requests')
                .set('Authorization', `Bearer ${bobToken}`)
                .send({ productName: 'Bob Gadget', quantity: 200, currency: 'EUR' })
                .expect(201);
            bobRfqId = res2.body.id;
        });

        it('Alice should only see her own RFQs', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${aliceToken}`)
                .expect(200);

            const rfqNames = res.body.map((r: any) => r.productName);
            expect(rfqNames).toContain('Alice Widget');
            expect(rfqNames).not.toContain('Bob Gadget');
        });

        it('Bob should only see his own RFQs', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${bobToken}`)
                .expect(200);

            const rfqNames = res.body.map((r: any) => r.productName);
            expect(rfqNames).toContain('Bob Gadget');
            expect(rfqNames).not.toContain('Alice Widget');
        });

        it('Alice cannot access Bob RFQ by ID', async () => {
            await request(ctx.app.getHttpServer())
                .get(`/requests/${bobRfqId}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .expect(404);
        });
    });

    describe('Supplier isolation', () => {
        beforeAll(async () => {
            // Create campaigns with RFQ requests for supplier ownership
            const aliceRfq = await createTestRfq(ctx.prisma, {
                ownerId: alice.id,
                productName: 'Alice Supplier Test',
            });
            const aliceCampaign = await createTestCampaign(ctx.prisma, {
                name: 'Alice Campaign',
                rfqRequestId: aliceRfq.id,
            });
            await createTestSupplier(ctx.prisma, aliceCampaign.id, {
                name: 'Alpha Supplier Co',
                country: 'USA',
            });

            const bobRfq = await createTestRfq(ctx.prisma, {
                ownerId: bob.id,
                productName: 'Bob Supplier Test',
            });
            const bobCampaign = await createTestCampaign(ctx.prisma, {
                name: 'Bob Campaign',
                rfqRequestId: bobRfq.id,
            });
            await createTestSupplier(ctx.prisma, bobCampaign.id, {
                name: 'Beta Supplier Ltd',
                country: 'Germany',
            });
        });

        it('Alice should only see suppliers from her campaigns', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/suppliers')
                .set('Authorization', `Bearer ${aliceToken}`)
                .expect(200);

            const names = (res.body.suppliers || res.body).map?.((s: any) => s.name) || [];
            expect(names).toContain('Alpha Supplier Co');
            expect(names).not.toContain('Beta Supplier Ltd');
        });

        it('Bob should only see suppliers from his campaigns', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/suppliers')
                .set('Authorization', `Bearer ${bobToken}`)
                .expect(200);

            const names = (res.body.suppliers || res.body).map?.((s: any) => s.name) || [];
            expect(names).toContain('Beta Supplier Ltd');
            expect(names).not.toContain('Alpha Supplier Co');
        });
    });

    describe('Sharing preferences', () => {
        let aliceMate: any;
        let aliceMateToken: string;

        beforeAll(async () => {
            // Add a second user to Org A
            aliceMate = await createTestUser(ctx.prisma, {
                email: 'mate@orgalpha.com',
                name: 'Alice Mate',
                organizationId: orgA.id,
            });
            aliceMateToken = getAuthToken(ctx.jwtService, aliceMate.id, aliceMate.email);
        });

        afterAll(async () => {
            await ctx.prisma.userSharingPreference.deleteMany({
                where: { OR: [{ fromUserId: alice.id }, { toUserId: aliceMate.id }] },
            });
            await ctx.prisma.user.delete({ where: { id: aliceMate.id } });
        });

        it('Org mate without sharing enabled should NOT see Alice RFQs', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${aliceMateToken}`)
                .expect(200);

            const names = res.body.map((r: any) => r.productName);
            expect(names).not.toContain('Alice Widget');
        });

        it('After enabling sharing, org mate should see non-DRAFT RFQs', async () => {
            // Alice shares with mate
            await ctx.prisma.userSharingPreference.create({
                data: {
                    fromUserId: alice.id,
                    toUserId: aliceMate.id,
                    enabled: true,
                },
            });

            // Activate Alice's RFQ (DRAFT → ACTIVE)
            const aliceRfqs = await ctx.prisma.rfqRequest.findMany({
                where: { ownerId: alice.id },
            });
            if (aliceRfqs.length > 0) {
                await ctx.prisma.rfqRequest.update({
                    where: { id: aliceRfqs[0].id },
                    data: { status: 'ACTIVE' },
                });
            }

            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${aliceMateToken}`)
                .expect(200);

            const names = res.body.map((r: any) => r.productName);
            expect(names).toContain('Alice Widget');
        });
    });

    describe('Solo user isolation', () => {
        it('Charlie (no org) should see only his own data', async () => {
            // Create an RFQ for Charlie
            await request(ctx.app.getHttpServer())
                .post('/requests')
                .set('Authorization', `Bearer ${charlieToken}`)
                .send({ productName: 'Charlie Solo Item', quantity: 50, currency: 'AUD' })
                .expect(201);

            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${charlieToken}`)
                .expect(200);

            const names = res.body.map((r: any) => r.productName);
            expect(names).toContain('Charlie Solo Item');
            expect(names).not.toContain('Alice Widget');
            expect(names).not.toContain('Bob Gadget');
        });
    });
});
