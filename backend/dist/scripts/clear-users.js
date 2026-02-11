"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || "postgresql://postgres:Procurea2026!Secure@35.205.84.185:5432/fdcdb"
        }
    }
});
async function safeDelete(name, deleteFunc) {
    try {
        const result = await deleteFunc();
        console.log(`  - Deleted ${result.count} ${name}`);
        return result.count;
    }
    catch (error) {
        if (error.code === 'P2021') {
            console.log(`  - Skipped ${name} (table does not exist)`);
        }
        else {
            console.log(`  - Error deleting ${name}: ${error.message}`);
        }
        return 0;
    }
}
async function clearUsers() {
    console.log('🔄 Starting user cleanup...');
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, createdAt: true }
        });
        console.log(`\n📋 Found ${users.length} users:`);
        for (const u of users) {
            console.log(`  - ${u.email} (${u.name || 'no name'}) - created: ${u.createdAt}`);
        }
        if (users.length === 0) {
            console.log('\n✅ No users to delete.');
            return;
        }
        console.log('\n🗑️  Deleting related records...');
        await safeDelete('audit logs', () => prisma.auditLog.deleteMany({}));
        await safeDelete('AI interactions', () => prisma.aiInteraction.deleteMany({}));
        await safeDelete('API usage logs', () => prisma.apiUsageLog.deleteMany({}));
        await safeDelete('RFQ requests', () => prisma.rfqRequest.deleteMany({}));
        await safeDelete('organization locations', () => prisma.organizationLocation.deleteMany({}));
        await safeDelete('organizations', () => prisma.organization.deleteMany({}));
        await safeDelete('verification tokens', () => prisma.verificationToken.deleteMany({}));
        console.log('\n🗑️  Deleting users...');
        const usersDeleted = await prisma.user.deleteMany({});
        console.log(`  - Deleted ${usersDeleted.count} users`);
        console.log('\n✅ User cleanup completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
clearUsers();
//# sourceMappingURL=clear-users.js.map