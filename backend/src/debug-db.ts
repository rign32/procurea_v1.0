
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
