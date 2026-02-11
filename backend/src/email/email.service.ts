import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend | null = null;
    private readonly logger = new Logger(EmailService.name);
    private readonly fromEmail: string;
    private readonly overrideEmail: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        // Use configured FROM_EMAIL or default to procurea.pl domain
        this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@procurea.pl';
        // Override disabled in production - only use for local testing
        this.overrideEmail = process.env.NODE_ENV === 'production' ? '' : (this.configService.get<string>('OVERRIDE_EMAIL') || '');

        if (apiKey) {
            this.resend = new Resend(apiKey);
            this.logger.log('Resend client initialized');
        } else {
            this.logger.warn('RESEND_API_KEY missing. Email service disabled.');
        }
    }

    private getDebugRouting(originalTo: string, originalSubject: string) {
        if (this.overrideEmail) {
            this.logger.log(`[EMAIL OVERRIDE] Redirecting email from ${originalTo} to ${this.overrideEmail}`);
            return {
                to: this.overrideEmail,
                subject: `[INTENDED FOR: ${originalTo}] ${originalSubject}`
            };
        }
        return { to: originalTo, subject: originalSubject };
    }

    async sendMagicLink(email: string, code: string): Promise<boolean> {
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
        } catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error);
            return false;
        }
    }

    async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
        if (!this.resend) return false;

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
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
            return false;
        }
    }


    async sendNotificationEmail(email: string, subject: string, message: string): Promise<boolean> {
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
        } catch (error) {
            this.logger.error(`Failed to send notification email to ${email}`, error);
            return false;
        }
    }

    async sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
            return true;
        }

        try {
            const { to, subject } = this.getDebugRouting(options.to, options.subject);
            await this.resend.emails.send({
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: options.html
            });
            this.logger.log(`Email sent to ${options.to}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            return false;
        }
    }
}
