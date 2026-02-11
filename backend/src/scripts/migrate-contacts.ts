
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateContacts() {
    console.log('Starting migration to structured Contact entities...');

    // Get all suppliers that have contactEmails but NO structured contacts yet
    // Limitation: we can't easily check 'no structured contacts' in one query without join loaded, 
    // so we'll just check all and skip if contacts exist
    const suppliers = await prisma.supplier.findMany({
        where: {
            NOT: { contactEmails: null }
        },
        include: {
            contacts: true
        }
    });

    console.log(`Found ${suppliers.length} suppliers with contact emails.`);
    let migratedCount = 0;

    for (const supplier of suppliers) {
        if (supplier.contacts && supplier.contacts.length > 0) {
            // Already has contacts, skipping to avoid duplicates
            continue;
        }

        try {
            const emailString = supplier.contactEmails || '';
            if (!emailString.trim()) continue;

            // Split by comma
            const emails = emailString.split(',').map(e => e.trim()).filter(e => e.length > 3 && e.includes('@'));

            if (emails.length === 0) continue;

            console.log(`Migrating ${emails.length} contacts for Supplier ${supplier.id} (${supplier.name})`);

            // Create contact entities
            await prisma.contact.createMany({
                data: emails.map(email => ({
                    supplierId: supplier.id,
                    email: email,
                    name: 'Unknown', // Placeholder
                    role: 'Generated from CSV',
                    isDecisionMaker: false
                }))
            });

            migratedCount++;
        } catch (e) {
            console.error(`\nError processing supplier ${supplier.id}: ${e.message}`);
        }
    }

    console.log(`\nMigration completed. Migrated contacts for ${migratedCount} suppliers.`);
}

migrateContacts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
