import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
    private resend: Resend | null = null;
    private readonly logger = new Logger(EmailService.name);
    private readonly fromEmail: string;
    private readonly overrideEmail: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        // Use configured FROM_EMAIL or default to procurea.pl domain
        this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@procurea.pl';
        // Email override - only active in development (never on production)
        const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
        if (nodeEnv === 'production') {
            this.overrideEmail = '';
        } else {
            this.overrideEmail = this.configService.get<string>('OVERRIDE_EMAIL') || '';
        }

        if (apiKey) {
            this.resend = new Resend(apiKey);
            this.logger.log('Resend client initialized');
        } else {
            this.logger.warn('RESEND_API_KEY missing. Email service disabled.');
        }
    }

    // Locale-aware helpers
    private getFromEmailForLocale(locale?: string): string {
        if (locale === 'en') return 'noreply@procurea.io';
        return this.fromEmail; // noreply@procurea.pl
    }

    private getAppUrl(locale?: string): string {
        if (locale === 'en') return process.env.FRONTEND_URL_EN || 'https://app.procurea.io';
        return process.env.FRONTEND_URL || 'https://app.procurea.pl';
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

    async sendMagicLink(email: string, code: string, locale?: string): Promise<boolean> {
        if (!this.resend) {
            this.logger.warn(`[MOCK EMAIL] To: ${email} | Code: ${code} (Resend not configured)`);
            return false;
        }

        const isEn = locale === 'en';
        try {
            const { to, subject } = this.getDebugRouting(email, isEn ? 'Your Procurea login code' : 'Twój kod logowania do Procurea');
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to: to,
                subject: subject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${isEn ? 'Verification code' : 'Kod weryfikacyjny'}</p>
    <p style="margin:0 0 24px 0;">${isEn ? 'Use the code below to sign in to your account:' : 'Użyj poniższego kodu, aby zalogować się do swojego konta:'}</p>
  </td></tr>
  <tr><td align="center" style="padding:0 0 24px 0;">
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:20px 32px;display:inline-block;">
      <span style="font-family:${f};font-size:32px;font-weight:700;letter-spacing:8px;color:#4F46E5;">${code}</span>
    </div>
  </td></tr>
  <tr><td style="padding:0 0 28px 0;font-family:${f};font-size:13px;color:#94A3B8;text-align:center;">
    ${isEn ? 'This code expires in 10 minutes. If you did not request this code, please ignore this message.' : 'Kod wygasa za 10 minut. Jeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.'}
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`
            });
            this.logger.log(`Magic link sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error);
            return false;
        }
    }

    async sendWelcomeEmail(email: string, name: string, locale?: string): Promise<boolean> {
        if (!this.resend) return false;

        const isEn = locale === 'en';
        try {
            const { to, subject } = this.getDebugRouting(email, isEn ? 'Welcome to Procurea!' : 'Witaj w Procurea!');
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            const dashboardUrl = `${this.getAppUrl(locale)}/dashboard`;
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to: to,
                subject: subject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${isEn ? `Welcome, ${name}!` : `Witaj, ${name}!`}</p>
    <p style="margin:0 0 8px 0;">${isEn ? "We're glad to have you on board. Your Procurea account is ready." : 'Cieszymy się, że jesteś z nami. Twoje konto w Procurea jest już gotowe.'}</p>
    <p style="margin:0 0 0 0;">${isEn ? 'You can now create RFQs and search for new suppliers.' : 'Możesz teraz tworzyć zapytania ofertowe i wyszukiwać nowych dostawców.'}</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 0 28px 0;">
    <a href="${dashboardUrl}" style="display:inline-block;background:#4F46E5;color:#FFFFFF;padding:12px 36px;text-decoration:none;border-radius:6px;font-family:${f};font-weight:600;font-size:14px;">${isEn ? 'Go to Dashboard' : 'Przejdź do Pulpitu'}</a>
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`
            });
            this.logger.log(`Welcome email sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
            return false;
        }
    }


    async sendTrialEndedEmail(email: string, name: string | null, locale?: string): Promise<boolean> {
        if (!this.resend) return false;

        const isEn = locale === 'en';
        const displayName = name || email.split('@')[0];
        const billingUrl = `${this.getAppUrl(locale)}/settings?tab=billing`;
        try {
            const { to, subject } = this.getDebugRouting(
                email,
                isEn ? 'Your free trial has ended — upgrade to continue' : 'Okres próbny zakończony — wykup plan, aby kontynuować',
            );
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to: to,
                subject: subject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${isEn ? `Hi ${displayName},` : `Cześć ${displayName},`}</p>
    <p style="margin:0 0 12px 0;">${isEn
        ? "You've used all 10 free trial searches. Thank you for being part of our beta!"
        : 'Wykorzystałeś wszystkie 10 darmowych wyszukiwań. Dziękujemy za udział w beta testach!'}</p>
    <p style="margin:0 0 0 0;">${isEn
        ? 'To continue finding suppliers, upgrade your plan. Choose a pay-per-search pack or go unlimited.'
        : 'Aby kontynuować wyszukiwanie dostawców, wykup plan. Wybierz pakiet wyszukiwań lub plan bez limitu.'}</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 0 28px 0;">
    <a href="${billingUrl}" style="display:inline-block;background:#4F46E5;color:#FFFFFF;padding:12px 36px;text-decoration:none;border-radius:6px;font-family:${f};font-weight:600;font-size:14px;">${isEn ? 'View Plans' : 'Zobacz plany'}</a>
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`
            });
            this.logger.log(`Trial ended email sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send trial ended email to ${email}`, error);
            return false;
        }
    }

    async sendTeamInvite(email: string, inviterName: string, organizationName: string, locale?: string): Promise<boolean> {
        const loginUrl = `${this.getAppUrl(locale)}/login`;
        const isEn = locale === 'en';

        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] Team invite to: ${email} | Org: ${organizationName} | Inviter: ${inviterName}`);
            return true;
        }

        try {
            const { to, subject } = this.getDebugRouting(email, isEn
                ? `${inviterName} invites you to join ${organizationName} on Procurea`
                : `${inviterName} zaprasza Cię do ${organizationName} w Procurea`);
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to,
                subject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${isEn ? 'Team invitation' : 'Zaproszenie do zespołu'}</p>
    <p style="margin:0 0 8px 0;">${isEn
        ? `<strong>${inviterName}</strong> invites you to join <strong>${organizationName}</strong> on Procurea.`
        : `<strong>${inviterName}</strong> zaprasza Cię do dołączenia do organizacji <strong>${organizationName}</strong> w Procurea.`}</p>
    <p style="margin:0 0 0 0;">${isEn ? 'Click the button below to sign in and start working with your team.' : 'Kliknij poniższy przycisk, aby zalogować się i rozpocząć pracę ze swoim zespołem.'}</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 0 14px 0;">
    <a href="${loginUrl}" style="display:inline-block;background:#4F46E5;color:#FFFFFF;padding:12px 36px;text-decoration:none;border-radius:6px;font-family:${f};font-weight:600;font-size:14px;">${isEn ? 'Sign in to Procurea' : 'Zaloguj się do Procurea'}</a>
  </td></tr>
  <tr><td style="padding:0 0 28px 0;font-family:${f};font-size:13px;color:#94A3B8;text-align:center;">
    ${isEn ? "If you don't know the person who sent this invitation, please ignore this message." : 'Jeśli nie znasz osoby, która wysłała zaproszenie, zignoruj tę wiadomość.'}
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`,
            });
            this.logger.log(`Team invite sent to ${email} for org ${organizationName}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send team invite to ${email}`, error);
            return false;
        }
    }

    async sendNotificationEmail(email: string, subject: string, message: string, locale?: string): Promise<boolean> {
        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | Body: ${message}`);
            return true;
        }

        const isEn = locale === 'en';
        try {
            const { to, subject: routedSubject } = this.getDebugRouting(email, subject);
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to: to,
                subject: routedSubject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${subject}</p>
    <p style="margin:0 0 0 0;">${message}</p>
  </td></tr>
  <tr><td style="padding:16px 0 28px 0;font-family:${f};font-size:12px;color:#94A3B8;">
    ${isEn ? 'You received this message based on your notification settings in Procurea.' : 'Otrzymałeś tę wiadomość na podstawie ustawień powiadomień w Procurea.'}
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`
            });
            this.logger.log(`Notification email sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send notification email to ${email}`, error);
            return false;
        }
    }

    async sendEmail(options: { to: string; subject: string; html: string; organizationId?: string; locale?: string; replyTo?: string }): Promise<{ sent: boolean; emailId?: string }> {
        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
            return { sent: true };
        }

        try {
            // Inject organization footer if organizationId provided
            let finalHtml = options.html;
            if (options.organizationId) {
                const footerHtml = await this.getFooterHtmlForOrg(options.organizationId);
                if (footerHtml) {
                    // Insert footer table rows before the copyright row
                    finalHtml = finalHtml.replace(
                        /(<tr><td[^>]*padding:\s*16px 0[^>]*>[\s\S]*?©[\s\S]*?<\/td><\/tr>)/,
                        `${footerHtml}$1`,
                    );
                }
            }

            const { to, subject } = this.getDebugRouting(options.to, options.subject);

            // Inject debug banner when email is overridden
            if (this.overrideEmail && options.to !== this.overrideEmail) {
                const debugBannerRow = `<tr><td style="padding: 0 0 16px 0;"><div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 13px;"><strong style="color: #92400E;">DEBUG — Email Override Active</strong><br/><span style="color: #78350F;">Oryginalny odbiorca: <strong>${options.to}</strong></span></div></td></tr>`;
                // Insert banner after the brand accent row (3px indigo border)
                finalHtml = finalHtml.replace(
                    /(<tr><td[^>]*height:\s*3px[^>]*background:\s*#4F46E5[^>]*><\/td><\/tr>)/,
                    `$1${debugBannerRow}`,
                );
            }

            // Determine reply-to: explicit option > org footer email
            let replyTo = options.replyTo;
            if (!replyTo && options.organizationId) {
                try {
                    const org = await this.prisma.organization.findUnique({
                        where: { id: options.organizationId },
                        select: { footerEmail: true, footerEnabled: true },
                    });
                    if (org?.footerEnabled && org?.footerEmail) {
                        replyTo = org.footerEmail;
                    }
                } catch { /* ignore */ }
            }

            const { data, error } = await this.resend.emails.send({
                from: this.getFromEmailForLocale(options.locale),
                to: to,
                subject: subject,
                html: finalHtml,
                ...(replyTo && { reply_to: replyTo }),
            });
            if (error) {
                this.logger.error(`Resend API error for ${options.to}: ${error.message}`);
                return { sent: false };
            }
            this.logger.log(`Email sent to ${options.to} (id: ${data?.id})`);
            return { sent: true, emailId: data?.id };
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            return { sent: false };
        }
    }

    async sendFeedbackRequestEmail(
        email: string,
        campaignName: string,
        campaignId: string,
        locale?: string,
    ): Promise<boolean> {
        const isEn = locale === 'en';
        const tallyBaseUrl = isEn
            ? (process.env.TALLY_FEEDBACK_URL_EN || 'https://tally.so/r/ODPykk')
            : (process.env.TALLY_FEEDBACK_URL || 'https://tally.so/r/Ek117r');
        const surveyUrl = `${tallyBaseUrl}?campaignName=${encodeURIComponent(campaignName)}&campaignId=${campaignId}`;

        if (!this.resend) {
            this.logger.log(`[MOCK EMAIL] Feedback request to: ${email} | Campaign: ${campaignName} | URL: ${surveyUrl}`);
            return true;
        }

        try {
            const { to, subject } = this.getDebugRouting(email, isEn
                ? `Procurea — How would you rate "${campaignName}"?`
                : `Procurea - Jak oceniasz kampanię "${campaignName}"?`);
            const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            await this.resend.emails.send({
                from: this.getFromEmailForLocale(locale),
                to,
                subject,
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td style="height:3px;background:#4F46E5;"></td></tr>
  <tr><td style="padding:28px 0 20px 0;font-family:${f};font-size:18px;font-weight:700;color:#4F46E5;">Procurea</td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:28px 0 8px 0;font-family:${f};color:#374151;font-size:15px;line-height:1.75;">
    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:17px;">${isEn ? 'Your feedback matters to us' : 'Twoja opinia ma dla nas znaczenie'}</p>
    <p style="margin:0 0 12px 0;">${isEn
        ? `Your sourcing campaign <strong>${campaignName}</strong> has been completed.`
        : `Kampania sourcingowa <strong>${campaignName}</strong> została zakończona.`}</p>
    <p style="margin:0 0 12px 0;">${isEn
        ? "We'd love to hear your thoughts to help us continuously improve our tool. The short survey takes about 2 minutes."
        : 'Chcielibyśmy poznać Twoją opinię, aby nieustannie ulepszać nasze narzędzie. Wypełnienie krótkiej ankiety zajmie około 2 minuty.'}</p>
  </td></tr>
  <tr><td align="center" style="padding:12px 0 14px 0;">
    <a href="${surveyUrl}" style="display:inline-block;background:#4F46E5;color:#FFFFFF;padding:12px 36px;text-decoration:none;border-radius:6px;font-family:${f};font-weight:600;font-size:14px;">${isEn ? 'Rate this campaign' : 'Oceń kampanię'}</a>
  </td></tr>
  <tr><td style="padding:8px 0 28px 0;font-family:${f};font-size:13px;color:#94A3B8;text-align:center;">
    ${isEn ? 'Your response is very valuable and will help us better tailor Procurea to your needs.' : 'Twoja odpowiedź jest dla nas bardzo cenna i pomoże nam lepiej dostosować Procurea do Twoich potrzeb.'}
  </td></tr>
  <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
  <tr><td style="padding:16px 0 0 0;font-family:${f};font-size:11px;color:#D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>
</table></td></tr></table></body></html>`,
            });
            this.logger.log(`Feedback request email sent to ${email} for campaign "${campaignName}"`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send feedback email to ${email}`, error);
            return false;
        }
    }

    /**
     * Build HTML footer from Organization footer fields.
     */
    buildFooterHtml(org: {
        footerEnabled: boolean;
        footerFirstName?: string | null;
        footerLastName?: string | null;
        footerCompany?: string | null;
        footerPosition?: string | null;
        footerEmail?: string | null;
        footerPhone?: string | null;
    }): string {
        if (!org.footerEnabled) return '';

        const lines: string[] = [];
        if (org.footerFirstName || org.footerLastName) {
            lines.push(`<strong>${(org.footerFirstName || '')} ${(org.footerLastName || '')}</strong>`.trim());
        }
        if (org.footerPosition) lines.push(org.footerPosition);
        if (org.footerCompany) lines.push(org.footerCompany);
        if (org.footerEmail) lines.push(`<a href="mailto:${org.footerEmail}" style="color: #4F46E5; text-decoration: none;">${org.footerEmail}</a>`);
        if (org.footerPhone) lines.push(org.footerPhone);

        if (lines.length === 0) return '';

        const f = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        return `
            <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>
            <tr><td style="padding: 20px 0 0 0; font-family: ${f}; color: #64748B; font-size: 13px; line-height: 1.8;">
                ${lines.join('<br/>')}
            </td></tr>
        `;
    }

    /**
     * Fetch organization and build footer HTML.
     */
    async getFooterHtmlForOrg(organizationId: string): Promise<string> {
        try {
            const org = await this.prisma.organization.findUnique({
                where: { id: organizationId },
            });
            if (!org) return '';
            return this.buildFooterHtml(org);
        } catch {
            return '';
        }
    }
}
