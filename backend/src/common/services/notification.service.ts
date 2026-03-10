import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../auth/sms.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly prisma: PrismaService
    ) { }

    /**
     * Send a notification to a user, respecting their preferences.
     */
    async send(userId: string, event: string, payload: { subject: string; message: string; data?: any }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            this.logger.warn(`User ${userId} not found, skipping notification.`);
            return;
        }

        // Parse preferences
        let preferences: any[] = [];
        try {
            preferences = user.notificationPreferences ? JSON.parse(user.notificationPreferences) : [];
        } catch (e) {
            this.logger.error(`Failed to parse preferences for user ${userId}`, e);
        }

        // Find preference for this event
        const pref = preferences.find((p: any) => p.event === event);

        // Default to EMAIL ONLY if no preference set (safety fallback) or check standard defaults
        const channels = pref?.channels || { email: true, push: false, sms: false };

        this.logger.log(`Dispatching notification '${event}' to User ${userId} via [${Object.keys(channels).filter(k => channels[k]).join(',')}]`);

        // 1. Email
        if (channels.email) {
            // Check if we have a specific template for this event, otherwise generic
            await this.emailService.sendNotificationEmail(user.email, payload.subject, payload.message, user.language || 'pl');
        }

        // 2. SMS (Only if phone verified)
        if (channels.sms && user.phone && user.isPhoneVerified) {
            // Shorten message for SMS
            const smsBody = `${payload.subject}: ${payload.message}`.substring(0, 160);
            await this.smsService.sendCustomSms(user.phone, smsBody);
        }

        // 3. Push (Stub)
        if (channels.push) {
            // TODO: Implement Push
            this.logger.log(`[PUSH STUB] Sending push to ${userId}: ${payload.subject}`);
        }
    }
}
