/**
 * Test data factories for E2E tests.
 * Creates realistic test records in the database.
 */
import { PrismaService } from '../../src/prisma/prisma.service';

let counter = 0;
function nextId() { return `test-${++counter}-${Date.now()}`; }

export async function createTestOrganization(prisma: PrismaService, overrides: any = {}) {
    return prisma.organization.create({
        data: {
            name: overrides.name || `Test Org ${nextId()}`,
            baseCurrency: overrides.baseCurrency || 'PLN',
            footerEnabled: overrides.footerEnabled ?? false,
            footerEmail: overrides.footerEmail || null,
            ...overrides,
        },
    });
}

export async function createTestUser(prisma: PrismaService, overrides: any = {}) {
    const orgId = overrides.organizationId;
    return prisma.user.create({
        data: {
            email: overrides.email || `user-${nextId()}@test.com`,
            name: overrides.name || 'Test User',
            provider: overrides.provider || 'email',
            providerId: overrides.providerId || nextId(),
            plan: overrides.plan || 'full',
            role: overrides.role || 'user',
            ...(orgId ? { organizationId: orgId } : {}),
            ...overrides,
        },
    });
}

export async function createTestCampaign(prisma: PrismaService, overrides: any = {}) {
    return prisma.campaign.create({
        data: {
            name: overrides.name || `Campaign ${nextId()}`,
            status: overrides.status || 'COMPLETED',
            stage: overrides.stage || 'DONE',
            userId: overrides.userId,
            ...overrides,
        },
    });
}

export async function createTestSupplier(prisma: PrismaService, campaignId: string, overrides: any = {}) {
    return prisma.supplier.create({
        data: {
            name: overrides.name || `Supplier ${nextId()}`,
            country: overrides.country || 'Poland',
            city: overrides.city || 'Warsaw',
            website: overrides.website || 'https://supplier.example.com',
            contactEmails: overrides.contactEmails || 'supplier@example.com',
            campaignId,
            ...overrides,
        },
    });
}

export async function createTestContact(prisma: PrismaService, supplierId: string, overrides: any = {}) {
    return prisma.contact.create({
        data: {
            name: overrides.name || 'Jan Kowalski',
            email: overrides.email || `contact-${nextId()}@supplier.com`,
            role: overrides.role || 'Sales Manager',
            supplierId,
            ...overrides,
        },
    });
}

export async function createTestRfq(prisma: PrismaService, overrides: any = {}) {
    return prisma.rfqRequest.create({
        data: {
            productName: overrides.productName || 'Aluminium Sheet 2mm',
            quantity: overrides.quantity || 1000,
            unit: overrides.unit || 'pcs',
            currency: overrides.currency || 'EUR',
            status: overrides.status || 'DRAFT',
            category: overrides.category || 'Metal',
            material: overrides.material || 'Aluminium 6061-T6',
            description: overrides.description || 'Standard aluminium sheet, 2mm thickness',
            targetPrice: overrides.targetPrice || 5.50,
            ownerId: overrides.ownerId,
            campaignId: overrides.campaignId || undefined,
            ...overrides,
        },
    });
}

export async function createTestOffer(prisma: PrismaService, rfqId: string, supplierId: string, overrides: any = {}) {
    return prisma.offer.create({
        data: {
            rfqRequestId: rfqId,
            supplierId,
            status: overrides.status || 'PENDING',
            price: overrides.price || 0,
            currency: overrides.currency || 'EUR',
            tokenExpiresAt: overrides.tokenExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ...overrides,
        },
    });
}

/**
 * Create a full test scenario: Org + User + Campaign + N Suppliers with Contacts + RFQ
 */
export async function createFullTestScenario(prisma: PrismaService, supplierCount = 3) {
    const org = await createTestOrganization(prisma);
    const user = await createTestUser(prisma, { organizationId: org.id });
    const campaign = await createTestCampaign(prisma, { userId: user.id });

    const suppliers: any[] = [];
    for (let i = 0; i < supplierCount; i++) {
        const supplier = await createTestSupplier(prisma, campaign.id, {
            name: `Test Supplier ${i + 1}`,
            country: ['Poland', 'Germany', 'Czech Republic'][i % 3],
            contactEmails: `supplier${i + 1}@example.com`,
        });
        await createTestContact(prisma, supplier.id, {
            email: `contact${i + 1}@supplier.com`,
        });
        suppliers.push(supplier);
    }

    const rfq = await createTestRfq(prisma, {
        ownerId: user.id,
        campaignId: campaign.id,
    });

    return { org, user, campaign, suppliers, rfq };
}
