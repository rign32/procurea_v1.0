import request from 'supertest';
import { createTestApp, getAuthToken, cleanupTestData, TestContext } from './helpers/test-app';
import { createTestUser, createTestOrganization, createTestRfq } from './helpers/factories';

describe('RFQ CRUD (e2e)', () => {
    let ctx: TestContext;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        ctx = await createTestApp();
        const org = await createTestOrganization(ctx.prisma);
        const user = await createTestUser(ctx.prisma, { organizationId: org.id });
        userId = user.id;
        authToken = getAuthToken(ctx.jwtService, userId);
    });

    afterAll(async () => {
        await cleanupTestData(ctx.prisma);
        await ctx.app.close();
    });

    describe('POST /requests', () => {
        it('should create an RFQ in DRAFT status', async () => {
            const res = await request(ctx.app.getHttpServer())
                .post('/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productName: 'Steel Bolt M8',
                    quantity: 5000,
                    unit: 'pcs',
                    currency: 'EUR',
                    category: 'Metal',
                    material: 'Stainless Steel 304',
                })
                .expect(201);

            expect(res.body.id).toBeDefined();
            expect(res.body.status).toBe('DRAFT');
            expect(res.body.ownerId).toBe(userId);
            expect(res.body.productName).toBe('Steel Bolt M8');
        });

        it('should reject RFQ without productName', async () => {
            await request(ctx.app.getHttpServer())
                .post('/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 100 })
                .expect(400);
        });

        it('should require authentication', async () => {
            await request(ctx.app.getHttpServer())
                .post('/requests')
                .send({ productName: 'Test', quantity: 1 })
                .expect(401);
        });
    });

    describe('GET /requests/:id', () => {
        it('should return RFQ for owner', async () => {
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId });

            const res = await request(ctx.app.getHttpServer())
                .get(`/requests/${rfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.id).toBe(rfq.id);
            expect(res.body.productName).toBe(rfq.productName);
        });

        it('should deny access to other user\'s RFQ', async () => {
            const otherUser = await createTestUser(ctx.prisma);
            const otherRfq = await createTestRfq(ctx.prisma, { ownerId: otherUser.id });

            await request(ctx.app.getHttpServer())
                .get(`/requests/${otherRfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);
        });
    });

    describe('PATCH /requests/:id', () => {
        it('should update status from DRAFT to ACTIVE', async () => {
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, status: 'DRAFT' });

            const res = await request(ctx.app.getHttpServer())
                .patch(`/requests/${rfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'ACTIVE' })
                .expect(200);

            expect(res.body.status).toBe('ACTIVE');
        });

        it('should reject invalid status transition DRAFT→CLOSED', async () => {
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, status: 'DRAFT' });

            await request(ctx.app.getHttpServer())
                .patch(`/requests/${rfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'CLOSED' })
                .expect(400);
        });

        it('should allow editing fields when DRAFT', async () => {
            const rfq = await createTestRfq(ctx.prisma, { ownerId: userId, status: 'DRAFT' });

            const res = await request(ctx.app.getHttpServer())
                .patch(`/requests/${rfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productName: 'Updated Product', targetPrice: '10.5' })
                .expect(200);

            expect(res.body.productName).toBe('Updated Product');
        });

        it('should deny update by other user', async () => {
            const otherUser = await createTestUser(ctx.prisma);
            const otherRfq = await createTestRfq(ctx.prisma, { ownerId: otherUser.id });

            await request(ctx.app.getHttpServer())
                .patch(`/requests/${otherRfq.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'ACTIVE' })
                .expect(403);
        });
    });

    describe('GET /requests', () => {
        it('should list only own RFQs (excluding other users)', async () => {
            // Create RFQs for our user
            await createTestRfq(ctx.prisma, { ownerId: userId, status: 'ACTIVE' });
            // Create RFQ for another user
            const otherUser = await createTestUser(ctx.prisma);
            await createTestRfq(ctx.prisma, { ownerId: otherUser.id, status: 'ACTIVE' });

            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.rfqs).toBeDefined();
            // All returned RFQs should belong to our user
            for (const rfq of res.body.rfqs) {
                expect(rfq.ownerId).toBe(userId);
            }
        });

        it('should include DRAFT RFQs for the owner', async () => {
            const draft = await createTestRfq(ctx.prisma, { ownerId: userId, status: 'DRAFT', productName: 'My Draft RFQ' });

            const res = await request(ctx.app.getHttpServer())
                .get('/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const foundDraft = res.body.rfqs.find((r: any) => r.id === draft.id);
            expect(foundDraft).toBeDefined();
            expect(foundDraft.status).toBe('DRAFT');
        });
    });

    describe('GET /requests/categories', () => {
        it('should return category list', async () => {
            const res = await request(ctx.app.getHttpServer())
                .get('/requests/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('label');
        });
    });
});
