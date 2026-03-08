import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class FeedbackSchedulerService {
    private readonly logger = new Logger(FeedbackSchedulerService.name);
    private readonly FEEDBACK_DELAY_MINUTES = 10;

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    @Cron('*/5 * * * *')
    async checkAndSendFeedbackEmails() {
        try {
            const cutoffDate = new Date(
                Date.now() - this.FEEDBACK_DELAY_MINUTES * 60 * 1000,
            );

            const campaigns = await this.prisma.campaign.findMany({
                where: {
                    status: 'COMPLETED',
                    updatedAt: { lte: cutoffDate },
                    feedbackEmailSentAt: null,
                    deletedAt: null,
                },
                include: {
                    rfqRequest: {
                        include: {
                            owner: {
                                select: { email: true, name: true },
                            },
                        },
                    },
                },
            });

            if (campaigns.length === 0) return;

            this.logger.log(
                `Found ${campaigns.length} campaign(s) needing feedback emails`,
            );

            for (const campaign of campaigns) {
                const ownerEmail = campaign.rfqRequest?.owner?.email;

                if (!ownerEmail) {
                    this.logger.warn(
                        `Campaign ${campaign.id} has no owner email, skipping feedback`,
                    );
                    await this.prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { feedbackEmailSentAt: new Date() },
                    });
                    continue;
                }

                const sent = await this.emailService.sendFeedbackRequestEmail(
                    ownerEmail,
                    campaign.name,
                    campaign.id,
                );

                if (sent) {
                    await this.prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { feedbackEmailSentAt: new Date() },
                    });
                    this.logger.log(
                        `Feedback email sent for campaign "${campaign.name}" to ${ownerEmail}`,
                    );
                } else {
                    this.logger.warn(
                        `Failed to send feedback email for campaign ${campaign.id}, will retry`,
                    );
                }
            }
        } catch (error) {
            this.logger.error('Feedback scheduler error:', error);
        }
    }
}
