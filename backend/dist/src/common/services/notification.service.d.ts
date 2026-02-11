import { EmailService } from '../../email/email.service';
import { SmsService } from '../../auth/sms.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationService {
    private readonly emailService;
    private readonly smsService;
    private readonly prisma;
    private readonly logger;
    constructor(emailService: EmailService, smsService: SmsService, prisma: PrismaService);
    send(userId: string, event: string, payload: {
        subject: string;
        message: string;
        data?: any;
    }): Promise<void>;
}
