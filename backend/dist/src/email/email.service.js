"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const prisma_service_1 = require("../prisma/prisma.service");
let EmailService = EmailService_1 = class EmailService {
    configService;
    prisma;
    resend = null;
    logger = new common_1.Logger(EmailService_1.name);
    fromEmail;
    overrideEmail;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.fromEmail = this.configService.get('FROM_EMAIL') || 'noreply@procurea.pl';
        this.overrideEmail = process.env.NODE_ENV === 'production' ? '' : (this.configService.get('OVERRIDE_EMAIL') || '');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
            this.logger.log('Resend client initialized');
        }
        else {
            this.logger.warn('RESEND_API_KEY missing. Email service disabled.');
        }
    }
    getDebugRouting(originalTo, originalSubject) {
        if (this.overrideEmail) {
            this.logger.log(`[EMAIL OVERRIDE] Redirecting email from ${originalTo} to ${this.overrideEmail}`);
            return {
                to: this.overrideEmail,
                subject: `[INTENDED FOR: ${originalTo}] ${originalSubject}`
            };
        }
        return { to: originalTo, subject: originalSubject };
    }
    async sendMagicLink(email, code) {
        if (!this.resend) {
            this.logger.warn(`[MOCK EMAIL] To: ${email} | Code: ${code} (Resend not configured)`);
            return false;
        }
        try {
            const { to, subject } = this.getDebugRouting(email, 'Twój kod logowania do Procurea');
            await this.resend.emails.send({
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: `
                    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Procurea</h1>
                        </div>
                        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                            <h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 22px;">Kod weryfikacyjny</h2>
                            <p style="color: #64748B; margin: 0 0 24px 0; line-height: 1.6;">
                                Użyj poniższego kodu, aby zalogować się do swojego konta:
                            </p>
                            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white;">${code}</span>
                            </div>
                            <p style="color: #94A3B8; font-size: 14px; margin: 0; text-align: center;">
                                Kod wygasa za 10 minut. Jeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                                &copy; ${new Date().getFullYear()} Procurea. Wszelkie prawa zastrzeżone.
                            </p>
                        </div>
                    </div>
                `
            });
            this.logger.log(`Magic link sent to ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error);
            return false;
        }
    }
    async sendWelcomeEmail(email, name) {
        if (!this.resend)
            return false;
        try {
            const { to, subject } = this.getDebugRouting(email, 'Welcome to Procurea!');
            await this.resend.emails.send({
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Welcome, ${name}!</h1>
                        <p>We are excited to have you on board.</p>
                        <p>You can now start creating RFQs and sourcing new suppliers.</p>
                        <br/>
                        <a href="https://app.procurea.pl/dashboard" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Przejdź do Pulpitu</a>
                    </div>
                `
            });
            this.logger.log(`Welcome email sent to ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
            return false;
        }
    }
    async sendNotificationEmail(email, subject, message) {
        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | Body: ${message}`);
            return true;
        }
        try {
            const { to, subject: routedSubject } = this.getDebugRouting(email, subject);
            await this.resend.emails.send({
                from: this.fromEmail,
                to: to,
                subject: routedSubject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>${subject}</h2>
                        <p>${message}</p>
                        <br/>
                        <p style="font-size: 12px; color: #888;">You received this email because of your notification settings in Procurea.</p>
                    </div>
                `
            });
            this.logger.log(`Notification email sent to ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification email to ${email}`, error);
            return false;
        }
    }
    async sendEmail(options) {
        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
            return true;
        }
        try {
            let finalHtml = options.html;
            if (options.organizationId) {
                const footerHtml = await this.getFooterHtmlForOrg(options.organizationId);
                if (footerHtml) {
                    finalHtml = finalHtml.replace(/(<div[^>]*text-align:\s*center[^>]*margin-top:\s*30px)/, `${footerHtml}$1`);
                }
            }
            const { to, subject } = this.getDebugRouting(options.to, options.subject);
            await this.resend.emails.send({
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: finalHtml,
            });
            this.logger.log(`Email sent to ${options.to}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            return false;
        }
    }
    buildFooterHtml(org) {
        if (!org.footerEnabled)
            return '';
        const lines = [];
        if (org.footerFirstName || org.footerLastName) {
            lines.push(`<strong>${(org.footerFirstName || '')} ${(org.footerLastName || '')}</strong>`.trim());
        }
        if (org.footerPosition)
            lines.push(org.footerPosition);
        if (org.footerCompany)
            lines.push(org.footerCompany);
        if (org.footerEmail)
            lines.push(`<a href="mailto:${org.footerEmail}" style="color: #4F46E5; text-decoration: none;">${org.footerEmail}</a>`);
        if (org.footerPhone)
            lines.push(org.footerPhone);
        if (lines.length === 0)
            return '';
        return `
            <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;">
                <p style="color: #64748B; font-size: 13px; line-height: 1.8; margin: 0;">
                    ${lines.join('<br/>')}
                </p>
            </div>
        `;
    }
    async getFooterHtmlForOrg(organizationId) {
        try {
            const org = await this.prisma.organization.findUnique({
                where: { id: organizationId },
            });
            if (!org)
                return '';
            return this.buildFooterHtml(org);
        }
        catch {
            return '';
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map