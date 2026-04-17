import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GeminiService } from '../common/services/gemini.service';
import { getLanguageForCountry } from '../common/normalize-country';

@Injectable()
export class SequenceSchedulerService {
    private readonly logger = new Logger(SequenceSchedulerService.name);

    /**
     * If set, dayOffset is treated as units of this many minutes instead of days.
     * Example: SEQUENCE_MINUTE_MULTIPLIER=10 → dayOffset=3 means 30 minutes.
     * Not set → dayOffset works as days (production mode).
     */
    private readonly minuteMultiplier: number | null;

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly geminiService: GeminiService,
    ) {
        const mult = process.env.SEQUENCE_MINUTE_MULTIPLIER;
        this.minuteMultiplier = mult ? parseInt(mult, 10) : null;

        if (this.minuteMultiplier) {
            this.logger.log(`Sequence scheduler: TEST MODE — dayOffset × ${this.minuteMultiplier} minutes`);
        }
    }

    /**
     * Calculate the due date for a step based on dayOffset and the configured mode.
     */
    private calculateDueDate(baseDate: Date, dayOffset: number): Date {
        const due = new Date(baseDate);
        if (this.minuteMultiplier) {
            due.setMinutes(due.getMinutes() + dayOffset * this.minuteMultiplier);
        } else {
            due.setDate(due.getDate() + dayOffset);
        }
        return due;
    }

    /**
     * Run every 5 minutes — check for pending sequence steps and contact rollouts.
     * In production with day-based offsets, this rarely sends anything.
     * In test mode with SEQUENCE_MINUTE_MULTIPLIER, catches short intervals.
     */
    @Cron('*/5 * * * *')
    async processSequences() {
        this.logger.debug('Sequence scheduler: checking for due steps...');

        try {
            // Find all PENDING offers that belong to campaigns with a sequence template
            const offers = await this.prisma.offer.findMany({
                where: {
                    status: 'PENDING',
                    rfqRequest: {
                        campaign: {
                            sequenceTemplateId: { not: null },
                        },
                    },
                },
                include: {
                    supplier: {
                        include: { contacts: true },
                    },
                    rfqRequest: {
                        include: {
                            campaign: {
                                include: {
                                    sequenceTemplate: {
                                        include: {
                                            steps: {
                                                orderBy: { dayOffset: 'asc' },
                                            },
                                        },
                                    },
                                },
                            },
                            owner: {
                                include: { organization: true },
                            },
                        },
                    },
                    sequenceExecutions: true,
                },
            });

            if (offers.length === 0) return;

            this.logger.log(`Found ${offers.length} pending offers with sequence templates`);

            let totalSent = 0;
            const now = new Date();

            for (const offer of offers) {
                const template = offer.rfqRequest?.campaign?.sequenceTemplate;
                if (!template?.steps) continue;

                // Phase 1: Roll out INITIAL step to additional contacts
                const rollSent = await this.rollOutContacts(offer, template, now);
                totalSent += rollSent;

                // Phase 2: Send follow-up steps (REMINDER, FINAL) to primary contact
                const followUpSent = await this.processFollowUps(offer, template, now);
                totalSent += followUpSent;
            }

            if (totalSent > 0) {
                this.logger.log(`Sequence scheduler: sent ${totalSent} emails this cycle`);
            }
        } catch (error) {
            this.logger.error('Sequence scheduler error:', error);
        }
    }

    /**
     * Phase 1: Roll out INITIAL step to additional contacts.
     * If a supplier has multiple emails, send INITIAL to one new contact per interval.
     * Interval: 1 day (or 1 × minuteMultiplier in test mode).
     */
    private async rollOutContacts(offer: any, template: any, now: Date): Promise<number> {
        const initialStep = template.steps.find((s: any) => s.dayOffset === 0);
        if (!initialStep) return 0;

        const allEmails = this.getSupplierEmails(offer.supplier);
        if (allEmails.length <= 1) return 0; // Only one contact, nothing to roll

        // Find which emails already received the INITIAL step
        const sentEmails = new Set(
            offer.sequenceExecutions
                .filter((e: any) => e.stepId === initialStep.id && e.status === 'SENT')
                .map((e: any) => e.recipientEmail)
                .filter(Boolean),
        );

        // Find the next unsent email
        const nextEmail = allEmails.find((email: string) => !sentEmails.has(email));
        if (!nextEmail) return 0; // All contacts already reached

        // Check timing: at least 1 day (or 1 × multiplier min) since last INITIAL send
        const lastInitialSend = offer.sequenceExecutions
            .filter((e: any) => e.stepId === initialStep.id && e.status === 'SENT')
            .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        [0];

        if (lastInitialSend) {
            const rollDueDate = this.calculateDueDate(new Date(lastInitialSend.sentAt), 1);
            if (now < rollDueDate) return 0; // Not yet time
        }

        // Send INITIAL to next contact
        const sent = await this.executeStep(offer, initialStep, nextEmail);
        return sent ? 1 : 0;
    }

    /**
     * Phase 2: Send follow-up steps (REMINDER, FINAL) to the primary contact.
     */
    private async processFollowUps(offer: any, template: any, now: Date): Promise<number> {
        let sent = 0;

        // Follow-up steps are those with dayOffset > 0
        const followUpSteps = template.steps.filter((s: any) => s.dayOffset > 0);

        for (const step of followUpSteps) {
            // Already sent to primary contact?
            const alreadySentToPrimary = offer.sequenceExecutions.some(
                (e: any) => e.stepId === step.id && e.status === 'SENT',
            );
            if (alreadySentToPrimary) continue;

            // Is this step due?
            const dueDate = this.calculateDueDate(new Date(offer.createdAt), step.dayOffset);
            if (now < dueDate) continue;

            // Send to primary contact (emails[0])
            const emails = this.getSupplierEmails(offer.supplier);
            if (emails.length === 0) continue;

            const didSend = await this.executeStep(offer, step, emails[0]);
            if (didSend) sent++;
        }

        return sent;
    }

    /**
     * Execute a sequence step: resolve vars, translate, build HTML, send email.
     * Includes 3 retries for transient failures.
     */
    private async executeStep(offer: any, step: any, recipientEmail: string): Promise<boolean> {
        const supplier = offer.supplier;
        const rfq = offer.rfqRequest;
        const MAX_RETRIES = 3;

        try {
            // Resolve template variables
            let subject = this.resolveVariables(step.subject, rfq, supplier, offer);
            let body = this.resolveVariables(step.bodySnippet, rfq, supplier, offer);

            // Translate to supplier's language
            const targetLang = getLanguageForCountry(supplier.country);
            let ctaText = 'Złóż ofertę';
            let linkFallbackText = 'Lub skopiuj link:';

            // Personalized subject: use locale-aware prefix for follow-ups
            const isFollowUp = step.dayOffset > 0;
            if (isFollowUp) {
                const subjectPrefix = this.getRfqSubjectPrefix(targetLang.code);
                subject = `Re: ${subjectPrefix}: ${rfq.productName}`;
            }

            // Personalized greeting
            const greeting = this.getGreeting(supplier, targetLang.code);

            // Specs highlights (only for INITIAL step, follow-ups are shorter)
            const specsHighlights = !isFollowUp ? this.buildSpecsHighlights(rfq, targetLang.code) : '';

            if (targetLang.code !== 'pl') {
                this.logger.log(`[SEQUENCE] Translating ${step.type} to ${targetLang.name} for ${supplier.name}`);
                const translated = await this.translateEmail(subject, body, targetLang);
                subject = translated.subject;
                body = translated.body;
                ctaText = translated.ctaText;
                linkFallbackText = translated.linkFallbackText || linkFallbackText;
            }

            // Build organization footer
            const organization = rfq.owner?.organization;
            const footerHtml = organization ? this.buildFooterHtml(organization) : '';

            const portalUrl = `${process.env.FRONTEND_URL || 'https://app.procurea.pl'}/offers/${offer.accessToken}`;

            // Build greeting HTML
            const greetingHtml = `<tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #374151; font-size: 15px; line-height: 1.75; padding: 0 0 16px 0;">${greeting}</td></tr>`;

            // Build specs HTML (only if non-empty)
            const specsHtml = specsHighlights
                ? `<tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #374151; font-size: 14px; line-height: 1.75; padding: 0 0 16px 0;"><div style="background: #F8FAFC; border-left: 3px solid #4F46E5; padding: 12px 16px; white-space: pre-line;">${specsHighlights}</div></td></tr>`
                : '';

            // Build body paragraphs
            const bodyParagraphs = body
                .split(/\n\s*\n/)
                .map(p => p.trim())
                .filter(Boolean)
                .map(p => `<tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #374151; font-size: 15px; line-height: 1.75; padding: 0 0 16px 0;">${p.replace(/\n/g, '<br>')}</td></tr>`)
                .join('');

            const orgName = organization?.name || '';

            const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #FFFFFF; -webkit-font-smoothing: antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF;">
<tr><td align="center" style="padding: 40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

  <!-- Brand accent top border -->
  <tr><td style="height: 3px; background: #4F46E5;"></td></tr>

  <!-- Header: wordmark + org -->
  <tr><td style="padding: 28px 0 20px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 18px; font-weight: 700; color: #4F46E5; letter-spacing: -0.3px;">Procurea</td>
        ${orgName ? `<td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #94A3B8;">${orgName}</td>` : ''}
      </tr>
    </table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>

  <!-- Body -->
  <tr><td style="padding: 28px 0 8px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${greetingHtml}
      ${specsHtml}
      ${bodyParagraphs}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td align="center" style="padding: 12px 0 14px 0;">
    <a href="${portalUrl}" style="display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 12px 36px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-weight: 600; font-size: 14px;">${ctaText}</a>
  </td></tr>

  <!-- Link fallback -->
  <tr><td align="center" style="padding: 0 0 28px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #94A3B8;">
    ${linkFallbackText} <a href="${portalUrl}" style="color: #6366F1; text-decoration: none; word-break: break-all;">${portalUrl}</a>
  </td></tr>

  <!-- Divider -->
  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>

  <!-- Organization footer -->
  ${footerHtml ? `<tr><td style="padding: 20px 0 0 0;">${footerHtml}</td></tr>` : ''}

  <!-- Copyright -->
  <tr><td style="padding: 16px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #D1D5DB;">&copy; ${new Date().getFullYear()} Procurea</td></tr>

</table>
</td></tr>
</table>
</body></html>`;

            // TRANSACTIONAL LOCK: Check if there's already an execution for this step + email, if not, create as PENDING
            try {
                await this.prisma.$transaction(async (tx) => {
                    const existing = await tx.sequenceExecution.findFirst({
                        where: {
                            offerId: offer.id,
                            stepId: step.id,
                            recipientEmail,
                            status: { in: ['SENT', 'PENDING'] } // Do not resend if already sent or currently being sent
                        }
                    });

                    if (existing) {
                        throw new Error("ALREADY_PROCESSED");
                    }

                    await tx.sequenceExecution.create({
                        data: {
                            offerId: offer.id,
                            stepId: step.id,
                            recipientEmail,
                            status: 'PENDING'
                        }
                    });
                });
            } catch (err: any) {
                if (err.message === "ALREADY_PROCESSED") {
                    this.logger.debug(`[SEQUENCE] Skipping ${step.type} for ${recipientEmail}: already processed or pending.`);
                    return false;
                }
                throw err;
            }

            let attempt = 0;
            let sent = false;
            let lastError: any = null;
            const replyDomain = supplier.country === 'PL' ? 'procurea.pl' : 'procurea.io';

            while (attempt < MAX_RETRIES && !sent) {
                try {
                    const result = await this.emailService.sendEmail({
                        to: recipientEmail,
                        subject,
                        html,
                        replyTo: `reply-${offer.id}@${replyDomain}`,
                    });
                    sent = result.sent;
                    if (!sent) throw new Error("Email service returned false");
                } catch (err: any) {
                    attempt++;
                    lastError = err;
                    this.logger.warn(`[SEQUENCE] Attempt ${attempt}/${MAX_RETRIES} failed for ${recipientEmail}: ${err.message}`);
                    if (attempt < MAX_RETRIES) {
                        // Wait backoff: 2s, 4s...
                        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                    }
                }
            }

            if (sent) {
                await this.updateExecutionStatus(offer.id, step.id, recipientEmail, 'SENT');
                this.logger.log(
                    `[SEQUENCE] Sent ${step.type} to ${supplier.name} (${recipientEmail}) for RFQ "${rfq.productName}"`,
                );
                return true;
            } else {
                this.logger.error(`[SEQUENCE] Failed to send ${step.type} to ${recipientEmail} after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
                await this.updateExecutionStatus(offer.id, step.id, recipientEmail, 'FAILED');
                return false;
            }
        } catch (error: any) {
            this.logger.error(`Failed to execute step ${step.id} for offer ${offer.id}:`, error);
            // If we failed *after* acquiring the PENDING lock, mark it FAILED
            if (error.message !== "ALREADY_PROCESSED") {
                await this.updateExecutionStatus(offer.id, step.id, recipientEmail, 'FAILED').catch(() => { });
            }
            return false;
        }
    }

    /**
     * Translate email subject and body to the target language using Gemini.
     */
    private async translateEmail(
        subject: string,
        body: string,
        targetLang: { code: string; name: string },
    ): Promise<{ subject: string; body: string; ctaText: string; linkFallbackText: string }> {
        try {
            const prompt = `Translate the following business email to ${targetLang.name}.
Keep the tone professional and natural - write as a native speaker would.
Do NOT translate company names, person names, or product names.
Also translate these UI strings:
- CTA button: "Złóż ofertę" (meaning "Submit your offer/quote")
- Link fallback: "Lub skopiuj link:" (meaning "Or copy this link:")

Subject: ${subject}

Body:
${body}

Respond ONLY with valid JSON (no markdown, no code blocks):
{"subject": "translated subject", "body": "translated body", "ctaText": "translated CTA", "linkFallbackText": "translated link fallback"}`;

            const response = await this.geminiService.generateContent(prompt);

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    subject: parsed.subject || subject,
                    body: parsed.body || body,
                    ctaText: parsed.ctaText || 'Submit Quote',
                    linkFallbackText: parsed.linkFallbackText || 'Or copy this link:',
                };
            }

            this.logger.warn(`[TRANSLATE] Failed to parse Gemini response, using original`);
            return { subject, body, ctaText: 'Submit Quote', linkFallbackText: 'Or copy this link:' };
        } catch (err: any) {
            this.logger.error(`[TRANSLATE] Translation failed: ${err.message}`);
            return { subject, body, ctaText: 'Submit Quote', linkFallbackText: 'Or copy this link:' };
        }
    }

    private async recordExecution(offerId: string, stepId: string, recipientEmail: string, status: string) {
        await this.prisma.sequenceExecution.create({
            data: { offerId, stepId, recipientEmail, status, sentAt: status === 'SENT' ? new Date() : null },
        });
    }

    private async updateExecutionStatus(offerId: string, stepId: string, recipientEmail: string, status: string) {
        // Find the PENDING record and update it
        const records = await this.prisma.sequenceExecution.findMany({
            where: { offerId, stepId, recipientEmail, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (records.length > 0) {
            await this.prisma.sequenceExecution.update({
                where: { id: records[0].id },
                data: { status, sentAt: status === 'SENT' ? new Date() : null }
            });
        }
    }

    private resolveVariables(template: string, rfq: any, supplier: any, offer: any): string {
        const owner = rfq.owner;
        const org = owner?.organization;

        return template
            .replace(/\{\{Product_Name\}\}/g, rfq.productName || '')
            .replace(/\{\{Supplier_Name\}\}/g, supplier.name || '')
            .replace(/\{\{Sender_Name\}\}/g, owner?.name || '')
            .replace(/\{\{Sender_Company\}\}/g, org?.name || '')
            .replace(/\{\{Quantity\}\}/g, String(rfq.quantity || ''))
            .replace(/\{\{Currency\}\}/g, rfq.currency || 'EUR');
    }

    private buildFooterHtml(org: any): string {
        if (!org.footerEnabled) return '';

        const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        const parts: string[] = [];

        const name = `${org.footerFirstName || ''} ${org.footerLastName || ''}`.trim();
        if (name) parts.push(`<span style="font-weight: 600; color: #374151;">${name}</span>`);
        if (org.footerPosition) parts.push(`<span style="color: #6B7280;">${org.footerPosition}</span>`);
        if (org.footerCompany) parts.push(`<span style="color: #6B7280;">${org.footerCompany}</span>`);

        const contact: string[] = [];
        if (org.footerEmail) contact.push(`<a href="mailto:${org.footerEmail}" style="color: #4F46E5; text-decoration: none;">${org.footerEmail}</a>`);
        if (org.footerPhone) contact.push(`<span style="color: #6B7280;">${org.footerPhone}</span>`);
        if (contact.length > 0) parts.push(contact.join(' &nbsp;·&nbsp; '));

        if (parts.length === 0) return '';

        return `<p style="font-family: ${font}; font-size: 13px; line-height: 1.8; margin: 0;">${parts.join('<br>')}</p>`;
    }

    // --- Email personalization helpers ---

    /**
     * Locale-aware RFQ subject prefix based on supplier language.
     */
    private getRfqSubjectPrefix(langCode: string): string {
        switch (langCode) {
            case 'pl': return 'Zapytanie ofertowe';
            case 'de': return 'Angebotsanfrage';
            case 'fr': return 'Demande de devis';
            case 'es': return 'Solicitud de cotización';
            case 'it': return 'Richiesta di offerta';
            case 'nl': return 'Offerteaanvraag';
            case 'cs': return 'Poptávka';
            case 'en': return 'Request for Quote';
            default: return 'RFQ';
        }
    }

    /**
     * Personalized greeting using decision-maker name and locale.
     */
    private getGreeting(supplier: { contacts?: { name?: string | null; isDecisionMaker?: boolean | null }[] }, langCode: string): string {
        const decisionMaker = supplier.contacts?.find((c: any) => c.isDecisionMaker) || supplier.contacts?.[0];
        const name = decisionMaker?.name;

        switch (langCode) {
            case 'pl':
                return name ? `Szanowny/a ${name},` : 'Szanowni Państwo,';
            case 'de':
                return name ? `Sehr geehrte/r ${name},` : 'Sehr geehrte Damen und Herren,';
            case 'fr':
                return name ? `Cher/Chère ${name},` : 'Madame, Monsieur,';
            case 'es':
                return name ? `Estimado/a ${name},` : 'Estimados señores,';
            case 'it':
                return name ? `Gentile ${name},` : 'Gentili Signori,';
            case 'nl':
                return name ? `Geachte ${name},` : 'Geachte heer/mevrouw,';
            case 'cs':
                return name ? `Vážený/á ${name},` : 'Vážení,';
            default:
                return name ? `Dear ${name},` : 'Dear Sir/Madam,';
        }
    }

    /**
     * Build specs highlights section from RFQ fields. Only includes non-empty values.
     */
    private buildSpecsHighlights(rfq: any, langCode: string): string {
        const labels = this.getSpecsLabels(langCode);
        const lines: string[] = [];

        if (rfq.material) lines.push(`${labels.material}: ${rfq.material}`);
        if (rfq.quantity) lines.push(`${labels.quantity}: ${rfq.quantity} ${rfq.unit || 'pcs'}`);
        if (rfq.incoterms) lines.push(`${labels.incoterms}: ${rfq.incoterms}`);
        if (rfq.desiredDeliveryDate) {
            const date = new Date(rfq.desiredDeliveryDate);
            lines.push(`${labels.delivery}: ${date.toISOString().split('T')[0]}`);
        }
        if (rfq.offerDeadline) {
            const date = new Date(rfq.offerDeadline);
            lines.push(`${labels.deadline}: ${date.toISOString().split('T')[0]}`);
        }
        if (rfq.partNumber) lines.push(`${labels.partNumber}: ${rfq.partNumber}`);

        if (lines.length === 0) return '';

        const header = labels.header;
        const bullets = lines.map(l => `• ${l}`).join('\n');
        return `${header}\n${bullets}`;
    }

    private getSpecsLabels(langCode: string): Record<string, string> {
        switch (langCode) {
            case 'pl':
                return { header: 'Kluczowe wymagania:', material: 'Materiał', quantity: 'Ilość', incoterms: 'Incoterms', delivery: 'Termin dostawy', deadline: 'Termin składania ofert', partNumber: 'Nr katalogowy' };
            case 'de':
                return { header: 'Wichtige Anforderungen:', material: 'Material', quantity: 'Menge', incoterms: 'Incoterms', delivery: 'Liefertermin', deadline: 'Angebotsfrist', partNumber: 'Teilenummer' };
            case 'fr':
                return { header: 'Exigences clés :', material: 'Matériau', quantity: 'Quantité', incoterms: 'Incoterms', delivery: 'Date de livraison', deadline: "Date limite de l'offre", partNumber: 'Réf. article' };
            case 'es':
                return { header: 'Requisitos clave:', material: 'Material', quantity: 'Cantidad', incoterms: 'Incoterms', delivery: 'Fecha de entrega', deadline: 'Fecha límite de oferta', partNumber: 'Nº de pieza' };
            case 'it':
                return { header: 'Requisiti chiave:', material: 'Materiale', quantity: 'Quantità', incoterms: 'Incoterms', delivery: 'Data di consegna', deadline: "Scadenza dell'offerta", partNumber: 'Cod. articolo' };
            default:
                return { header: 'Key requirements:', material: 'Material', quantity: 'Quantity', incoterms: 'Incoterms', delivery: 'Delivery by', deadline: 'Offer deadline', partNumber: 'Part number' };
        }
    }

    private getSupplierEmails(supplier: any): string[] {
        const contactEmails = supplier.contacts
            ?.map((c: any) => c.email)
            .filter(Boolean) || [];
        if (contactEmails.length > 0) return contactEmails;

        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        }
        return [];
    }
}
