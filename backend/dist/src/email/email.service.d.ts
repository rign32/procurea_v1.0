import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private resend;
    private readonly logger;
    private readonly fromEmail;
    private readonly overrideEmail;
    constructor(configService: ConfigService);
    private getDebugRouting;
    sendMagicLink(email: string, code: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendNotificationEmail(email: string, subject: string, message: string): Promise<boolean>;
    sendEmail(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<boolean>;
}
