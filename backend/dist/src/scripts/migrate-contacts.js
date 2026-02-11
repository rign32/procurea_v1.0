"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migrateContacts() {
    console.log('Starting migration to structured Contact entities...');
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
            continue;
        }
        try {
            const emailString = supplier.contactEmails || '';
            if (!emailString.trim())
                continue;
            const emails = emailString.split(',').map(e => e.trim()).filter(e => e.length > 3 && e.includes('@'));
            if (emails.length === 0)
                continue;
            console.log(`Migrating ${emails.length} contacts for Supplier ${supplier.id} (${supplier.name})`);
            await prisma.contact.createMany({
                data: emails.map(email => ({
                    supplierId: supplier.id,
                    email: email,
                    name: 'Unknown',
                    role: 'Generated from CSV',
                    isDecisionMaker: false
                }))
            });
            migratedCount++;
        }
        catch (e) {
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
//# sourceMappingURL=migrate-contacts.js.map