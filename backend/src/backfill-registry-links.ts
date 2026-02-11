
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
    console.log('Starting backfill of registryId for Suppliers...');

    // Get all suppliers without registryId
    const suppliers = await prisma.supplier.findMany({
        where: { registryId: null },
        take: 1000 // Process in batches if huge, but fine for now
    });

    console.log(`Found ${suppliers.length} suppliers to link.`);

    for (const supplier of suppliers) {
        try {
            const url = supplier.url || supplier.website;
            if (!url) {
                console.warn(`Skipping Supplier ${supplier.id} (${supplier.name}) - No URL`);
                continue;
            }

            // Extract domain using regex (simplified)
            const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            if (!domainMatch) {
                console.warn(`Skipping Supplier ${supplier.id} (${supplier.name}) - Invalid URL: ${url}`);
                continue;
            }

            const domain = domainMatch[1].toLowerCase();

            // Find or create Registry entry
            // We use upsert to ensure it exists
            // Note: In real world, we might want to be more careful, but here we assume if it's a supplier, it deserves a registry entry
            const registry = await prisma.companyRegistry.upsert({
                where: { domain },
                update: {}, // No update if exists
                create: {
                    domain,
                    name: supplier.name,
                    country: supplier.country,
                    city: supplier.city,
                    specialization: supplier.specialization,
                    certificates: supplier.certificates,
                    employeeCount: supplier.employeeCount,
                    contactEmails: supplier.contactEmails,
                    dataQualityScore: 10, // Default low score until enriched
                    usageCount: 1,
                    campaignsCount: 1,
                }
            });

            // Update Supplier
            await prisma.supplier.update({
                where: { id: supplier.id },
                data: { registryId: registry.id }
            });

            process.stdout.write('.');
        } catch (e) {
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
