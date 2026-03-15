import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ObservabilityService } from './observability.service';

@Injectable()
export class ObservabilitySchedulerService {
    private readonly logger = new Logger(ObservabilitySchedulerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly observability: ObservabilityService,
    ) {}

    /**
     * Daily check at 9:00 AM CET:
     * - Abandoned registrations (onboarding not completed within 24-48h)
     * - Non-converting users (viewed plans 2d/7d ago but didn't purchase)
     * - Daily plan-views digest
     */
    @Cron('0 9 * * *', { timeZone: 'Europe/Warsaw' })
    async dailyChecks(): Promise<void> {
        this.logger.log('Running daily observability checks...');
        await Promise.allSettled([
            this.checkAbandonedRegistrations(),
            this.checkNonConvertingUsers(),
            this.sendPlanViewsDigest(),
        ]);
        this.logger.log('Daily observability checks completed');
    }

    /**
     * Find users who registered 24-48h ago but never completed onboarding.
     */
    private async checkAbandonedRegistrations(): Promise<void> {
        const now = new Date();
        const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        const abandoned = await this.prisma.user.findMany({
            where: {
                onboardingCompleted: false,
                createdAt: { gte: h48ago, lte: h24ago },
            },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        if (abandoned.length === 0) return;

        const emailList = abandoned.map(u => u.email).join(', ');

        await this.observability.recordEvent('auth', 'registration_abandoned', 'warning', {
            title: `${abandoned.length} porzuconych rejestracji (ostatnie 24h)`,
            message: emailList,
            metadata: { count: abandoned.length, emails: abandoned.map(u => u.email) },
        });

        this.logger.log(`Found ${abandoned.length} abandoned registrations`);
    }

    /**
     * Find users who viewed plans 2 or 7 days ago but didn't purchase.
     */
    private async checkNonConvertingUsers(): Promise<void> {
        for (const daysAgo of [2, 7]) {
            const dateStart = new Date();
            dateStart.setDate(dateStart.getDate() - daysAgo);
            dateStart.setHours(0, 0, 0, 0);

            const dateEnd = new Date(dateStart);
            dateEnd.setHours(23, 59, 59, 999);

            // Find users who viewed plans on that day
            const planViews = await this.prisma.observabilityEvent.findMany({
                where: {
                    type: 'plan_viewed',
                    createdAt: { gte: dateStart, lte: dateEnd },
                    userId: { not: null },
                },
                select: { userId: true, userEmail: true },
                distinct: ['userId'],
            });

            if (planViews.length === 0) continue;

            const userIds = planViews.map(pv => pv.userId!);

            // Check which users have purchased since then
            const purchasers = await this.prisma.creditTransaction.findMany({
                where: {
                    userId: { in: userIds },
                    type: 'PURCHASE',
                    createdAt: { gte: dateStart },
                },
                select: { userId: true },
                distinct: ['userId'],
            });
            const purchaserSet = new Set(purchasers.map(p => p.userId));

            // Also check org-level purchases
            const orgPurchasers = await this.prisma.orgCreditTransaction.findMany({
                where: {
                    type: 'PURCHASE',
                    createdAt: { gte: dateStart },
                },
                select: { organizationId: true },
                distinct: ['organizationId'],
            });

            // Get org IDs for users
            if (orgPurchasers.length > 0) {
                const orgIds = orgPurchasers.map(o => o.organizationId);
                const usersInPurchasedOrgs = await this.prisma.user.findMany({
                    where: {
                        id: { in: userIds },
                        organizationId: { in: orgIds },
                    },
                    select: { id: true },
                });
                usersInPurchasedOrgs.forEach(u => purchaserSet.add(u.id));
            }

            const nonConverting = planViews.filter(pv => !purchaserSet.has(pv.userId!));

            if (nonConverting.length === 0) continue;

            const emailList = nonConverting.map(nc => nc.userEmail || nc.userId).join(', ');

            await this.observability.recordEvent('conversion', 'non_converting_reminder', 'warning', {
                title: `Przypomnienie: ${nonConverting.length} użytkowników przeglądało plany ${daysAgo} dni temu i nie kupiło`,
                message: emailList,
                metadata: { daysAgo, count: nonConverting.length, emails: nonConverting.map(nc => nc.userEmail) },
            });

            this.logger.log(`Non-converting reminder (${daysAgo}d): ${nonConverting.length} users`);
        }
    }

    /**
     * Daily digest: who viewed plans yesterday.
     */
    private async sendPlanViewsDigest(): Promise<void> {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const views = await this.prisma.observabilityEvent.findMany({
            where: {
                type: 'plan_viewed',
                createdAt: { gte: yesterday, lt: today },
            },
            select: { userEmail: true, metadata: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        if (views.length === 0) return;

        // Deduplicate by email
        const uniqueEmails = [...new Set(views.map(v => v.userEmail).filter(Boolean))];
        const planDetails = views.map(v => {
            const meta = v.metadata as any;
            return `${v.userEmail} → ${meta?.planId || '?'} (${meta?.source || '?'})`;
        }).join('\n');

        await this.observability.sendDigest({
            icon: '📊',
            title: `Daily digest: ${uniqueEmails.length} użytkowników przeglądało plany wczoraj`,
            fields: [
                { label: 'Użytkownicy', value: uniqueEmails.join(', ') },
                { label: 'Szczegóły', value: planDetails.substring(0, 300) },
            ],
            footer: `Observability • daily digest • ${views.length} total views`,
        });
    }
}
