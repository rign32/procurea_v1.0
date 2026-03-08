import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private configService;
    private prisma;
    private resend;
    private readonly logger;
    private readonly fromEmail;
    private readonly overrideEmail;
    constructor(configService: ConfigService, prisma: PrismaService);
    private getDebugRouting;
    sendMagicLink(email: string, code: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendNotificationEmail(email: string, subject: string, message: string): Promise<boolean>;
    sendEmail(options: {
        to: string;
        subject: string;
        html: string;
        organizationId?: string;
    }): Promise<boolean>;
    buildFooterHtml(org: {
        footerEnabled: boolean;
        footerFirstName?: string | null;
        footerLastName?: string | null;
        footerCompany?: string | null;
        footerPosition?: string | null;
        footerEmail?: string | null;
        footerPhone?: string | null;
    }): string;
    getFooterHtmlForOrg(organizationId: string): Promise<string>;
}
