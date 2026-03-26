import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('email')
export class EmailPreviewController {
    constructor(
        private readonly emailService: EmailService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * POST /email/preview
     * Renders email HTML without sending — same templates as production.
     */
    @Post('preview')
    @UseGuards(AuthGuard('jwt'))
    async preview(@Body() body: {
        stepId?: string;
        subject?: string;
        bodySnippet?: string;
        organizationId?: string;
        sampleData?: {
            productName?: string;
            senderName?: string;
            senderCompany?: string;
            supplierName?: string;
            quantity?: string;
            currency?: string;
        };
    }) {
        const sampleData = body.sampleData || {};

        // Resolve template variables
        let subject = body.subject || 'Zapytanie Ofertowe: {{Product_Name}}';
        let bodyText = body.bodySnippet || 'Dzień dobry,\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.';

        // If stepId provided, load from DB
        if (body.stepId) {
            const step = await this.prisma.sequenceStep.findUnique({
                where: { id: body.stepId },
            });
            if (step) {
                subject = step.subject;
                bodyText = step.bodySnippet;
            }
        }

        // Replace variables with sample data
        const variables: Record<string, string> = {
            '{{Product_Name}}': sampleData.productName || 'Tuleje mosiężne DIN 1850',
            '{{Sender_Name}}': sampleData.senderName || 'Jan Kowalski',
            '{{Sender_Company}}': sampleData.senderCompany || 'Procurea Sp. z o.o.',
            '{{Supplier_Name}}': sampleData.supplierName || 'Example Supplier GmbH',
            '{{Quantity}}': sampleData.quantity || '1000',
            '{{Currency}}': sampleData.currency || 'EUR',
        };

        for (const [key, value] of Object.entries(variables)) {
            subject = subject.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
            bodyText = bodyText.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        }

        // Build footer
        let footerHtml = '';
        if (body.organizationId) {
            footerHtml = await this.emailService.getFooterHtmlForOrg(body.organizationId);
        }

        const portalUrl = '#preview';
        const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

        // Build body paragraphs
        const bodyParagraphs = bodyText
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => `<tr><td style="font-family: ${font}; color: #374151; font-size: 15px; line-height: 1.75; padding: 0 0 16px 0;">${p.replace(/\n/g, '<br>')}</td></tr>`)
            .join('');

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #FFFFFF; -webkit-font-smoothing: antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF;">
<tr><td align="center" style="padding: 40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

  <tr><td style="height: 3px; background: #4F46E5;"></td></tr>

  <tr><td style="padding: 28px 0 20px 0; font-family: ${font}; font-size: 18px; font-weight: 700; color: #4F46E5; letter-spacing: -0.3px;">Procurea</td></tr>

  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>

  <tr><td style="padding: 28px 0 8px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${bodyParagraphs}
    </table>
  </td></tr>

  <tr><td align="center" style="padding: 12px 0 14px 0;">
    <a href="${portalUrl}" style="display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 12px 36px; text-decoration: none; border-radius: 6px; font-family: ${font}; font-weight: 600; font-size: 14px;">Złóż ofertę</a>
  </td></tr>

  <tr><td align="center" style="padding: 0 0 28px 0; font-family: ${font}; font-size: 11px; color: #94A3B8;">
    Lub skopiuj link: <a href="${portalUrl}" style="color: #6366F1; text-decoration: none;">${portalUrl}</a>
  </td></tr>

  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>

  ${footerHtml}

  <tr><td style="padding: 16px 0 0 0; font-family: ${font}; font-size: 11px; color: #D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>

</table>
</td></tr>
</table>
</body></html>`;

        return { subject, html };
    }
}
