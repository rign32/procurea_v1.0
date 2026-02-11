"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const logs = await prisma.log.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20
    });
    console.log('--- DB LOGS ---');
    logs.forEach(l => {
        console.log(`[${l.timestamp.toISOString()}] ${l.message}`);
    });
    const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- RECENT CAMPAIGNS ---');
    console.log(campaigns);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=debug-db.js.map