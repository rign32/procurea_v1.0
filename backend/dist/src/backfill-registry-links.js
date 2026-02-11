"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function backfill() {
    console.log('Starting backfill of registryId for Suppliers...');
    const suppliers = await prisma.supplier.findMany({
        where: { registryId: null },
        take: 1000
    });
    console.log(`Found ${suppliers.length} suppliers to link.`);
    for (const supplier of suppliers) {
        try {
            const url = supplier.url || supplier.website;
            if (!url) {
                console.warn(`Skipping Supplier ${supplier.id} (${supplier.name}) - No URL`);
                continue;
            }
            const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            if (!domainMatch) {
                console.warn(`Skipping Supplier ${supplier.id} (${supplier.name}) - Invalid URL: ${url}`);
                continue;
            }
            const domain = domainMatch[1].toLowerCase();
            const registry = await prisma.companyRegistry.upsert({
                where: { domain },
                update: {},
                create: {
                    domain,
                    name: supplier.name,
                    country: supplier.country,
                    city: supplier.city,
                    specialization: supplier.specialization,
                    certificates: supplier.certificates,
                    employeeCount: supplier.employeeCount,
                    contactEmails: supplier.contactEmails,
                    dataQualityScore: 10,
                    usageCount: 1,
                    campaignsCount: 1,
                }
            });
            await prisma.supplier.update({
                where: { id: supplier.id },
                data: { registryId: registry.id }
            });
            process.stdout.write('.');
        }
        catch (e) {
            console.error(`\nError processing supplier ${supplier.id}: ${e.message}`);
        }
    }
    console.log('\nBackfill completed.');
}
backfill()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=backfill-registry-links.js.map