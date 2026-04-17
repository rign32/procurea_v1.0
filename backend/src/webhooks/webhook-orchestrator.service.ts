import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EmailTriageService, TriageResult } from './email-triage.service';
import { OfferReplyMatcherService } from './offer-reply-matcher.service';
import { ResendInboundPayload } from './dto/resend-inbound-payload.dto';

/**
 * Orchestrates the full inbound-email pipeline:
 *   1. Dedup via ResendEventLog (idempotency)
 *   2. Match the email to an Offer (3-layer strategy)
 *   3. Classify via Gemini (FORWARD / STORE_ONLY / BLOCK)
 *   4. Persist an OfferReply row
 *   5. If FORWARD → email user with AI summary preamble
 *   6. Append to Offer.negotiationHistory
 */
@Injectable()
export class WebhookOrchestratorService {
    private readonly logger = new Logger(WebhookOrchestratorService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly matcher: OfferReplyMatcherService,
        private readonly triage: EmailTriageService,
        private readonly emailService: EmailService,
    ) {}

    async processInboundEmail(payload: ResendInboundPayload): Promise<void> {
        const email = payload?.data;
        if (!email || !email.email_id) {
            this.logger.warn(
                'Received inbound webhook with no data.email_id — skipping',
            );
            return;
        }

        // 1. Dedup
        const existing = await this.prisma.resendEventLog.findUnique({
            where: { eventId: email.email_id },
        });
        if (existing) {
            this.logger.log(
                `Skipping duplicate event ${email.email_id} (processed ${existing.processedAt.toISOString()})`,
            );
            return;
        }
        try {
            await this.prisma.resendEventLog.create({
                data: {
                    eventId: email.email_id,
                    eventType: payload.type || 'email.received',
                    payload: payload as any,
                },
            });
        } catch (err: any) {
            // Unique constraint race — another worker processed it
            this.logger.warn(
                `ResendEventLog insert failed (likely race): ${err?.message}`,
            );
            return;
        }

        // 2. Match Offer
        const offerRef = await this.matcher.matchOfferFromPayload(email);
        if (!offerRef) {
            this.logger.warn(
                `No offer match for inbound email ${email.email_id} from ${email.from}`,
            );
            return;
        }

        // 3. Load full context for classification
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerRef.id },
            include: {
                rfqRequest: { include: { owner: true } },
                supplier: true,
            },
        });
        if (!offer) {
            this.logger.warn(
                `Matched offer ${offerRef.id} disappeared between match and load`,
            );
            return;
        }

        // 4. Classify via Gemini
        const userLang = (offer.rfqRequest?.owner?.language ||
            'pl') as 'pl' | 'en' | 'de';
        const triageResult = await this.triage.classify({
            from: email.from,
            subject: email.subject || '',
            textBody: email.text || this.htmlToText(email.html || ''),
            htmlBody: email.html,
            supplierName: offer.supplier?.name || 'Unknown',
            rfqProductName: offer.rfqRequest?.productName || 'Unknown',
            userLanguage: userLang,
        });

        // 5. Persist OfferReply
        const fromEmail =
            this.matcher.parseEmailAddress(email.from) || email.from;
        const fromName = this.matcher.parseDisplayName(email.from);

        const reply = await this.prisma.offerReply.create({
            data: {
                offerId: offer.id,
                resendEmailId: email.email_id,
                fromAddress: fromEmail,
                fromName: fromName || undefined,
                subject: email.subject || '',
                textBody: email.text || null,
                htmlBody: email.html || null,
                headers: (email.headers || {}) as any,
                attachments: (email.attachments || null) as any,
                category: triageResult.category,
                aiAnalysis: triageResult as any,
                receivedAt: this.parseDate(email.created_at),
            },
        });

        // 6. Forward if appropriate
        if (triageResult.category === 'FORWARD') {
            try {
                await this.forwardToUser(reply.id, offer, triageResult);
            } catch (err: any) {
                this.logger.error(
                    `Failed to forward reply ${reply.id}: ${err?.message}`,
                );
            }
        } else {
            this.logger.log(
                `Reply ${reply.id} classified as ${triageResult.category} — not forwarding`,
            );
        }

        // 7. Append to negotiation history
        try {
            const history = Array.isArray(offer.negotiationHistory)
                ? (offer.negotiationHistory as any[])
                : [];
            history.push({
                action: 'supplier_reply',
                timestamp: new Date().toISOString(),
                category: triageResult.category,
                summary: triageResult.summary,
                extractedTerms: triageResult.extractedTerms,
                replyId: reply.id,
            });
            await this.prisma.offer.update({
                where: { id: offer.id },
                data: { negotiationHistory: history as any },
            });
        } catch (err: any) {
            this.logger.warn(
                `Failed to update negotiationHistory for offer ${offer.id}: ${err?.message}`,
            );
        }
    }

    private async forwardToUser(
        replyId: string,
        offer: any,
        triage: TriageResult,
    ): Promise<void> {
        const userEmail = offer.rfqRequest?.owner?.email;
        if (!userEmail) {
            this.logger.warn(
                `Offer ${offer.id} has no owner email — cannot forward`,
            );
            return;
        }

        const reply = await this.prisma.offerReply.findUnique({
            where: { id: replyId },
        });
        if (!reply) return;

        const rawLang = offer.rfqRequest?.owner?.language || 'pl';
        const lang = rawLang === 'en' ? 'en' : 'pl';

        const isQuote =
            triage.sentiment === 'positive' ||
            !!triage.extractedTerms?.price;
        const categoryBadge = isQuote
            ? lang === 'pl'
                ? 'WYCENA'
                : 'QUOTE'
            : lang === 'pl'
              ? 'WIADOMOŚĆ'
              : 'MESSAGE';

        const keyDataLines: string[] = [];
        if (triage.extractedTerms?.price) {
            keyDataLines.push(
                `${lang === 'pl' ? 'Cena' : 'Price'}: ${triage.extractedTerms.price} ${triage.extractedTerms.currency || ''}`.trim(),
            );
        }
        if (triage.extractedTerms?.leadTime) {
            keyDataLines.push(
                `${lang === 'pl' ? 'Lead time' : 'Lead time'}: ${triage.extractedTerms.leadTime} ${lang === 'pl' ? 'dni' : 'days'}`,
            );
        }
        if (triage.extractedTerms?.moq) {
            keyDataLines.push(`MOQ: ${triage.extractedTerms.moq}`);
        }

        const supplierName = offer.supplier?.name || 'supplier';
        const productName = offer.rfqRequest?.productName || 'RFQ';

        const preamble = `
<div style="border-left: 4px solid #0066cc; padding: 12px; margin-bottom: 20px; background: #f0f7ff; font-family: sans-serif;">
  <div style="font-weight: 600; margin-bottom: 6px;">${lang === 'pl' ? 'Odpowiedź od' : 'Reply from'} ${this.escapeHtml(supplierName)} — RFQ: ${this.escapeHtml(productName)}</div>
  <div style="margin-bottom: 4px;"><strong>${lang === 'pl' ? 'Typ' : 'Type'}:</strong> ${categoryBadge}</div>
  <div style="margin-bottom: 4px;"><strong>${lang === 'pl' ? 'Podsumowanie AI' : 'AI summary'}:</strong> ${this.escapeHtml(triage.summary || '')}</div>
  ${
      keyDataLines.length > 0
          ? `<div style="margin-top: 8px;"><strong>${lang === 'pl' ? 'Kluczowe dane' : 'Key data'}:</strong> ${keyDataLines.map((l) => this.escapeHtml(l)).join(' · ')}</div>`
          : ''
  }
</div>
<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
`;

        const bodyContent =
            reply.htmlBody ||
            `<pre style="white-space: pre-wrap; font-family: sans-serif;">${this.escapeHtml(reply.textBody || '')}</pre>`;
        const body = preamble + bodyContent;

        const subject = reply.subject?.startsWith('Re:')
            ? reply.subject
            : `Re: ${reply.subject || ''}`;

        const { sent } = await this.emailService.sendEmail({
            to: userEmail,
            subject,
            html: body,
            // When the user hits Reply in their inbox, the reply goes
            // straight back to the supplier, keeping the thread tight.
            replyTo: reply.fromAddress,
            locale: lang,
        });
        if (!sent) {
            this.logger.warn(`Failed to forward reply ${replyId} to ${userEmail}`);
        }

        await this.prisma.offerReply.update({
            where: { id: replyId },
            data: { forwardedAt: new Date(), forwardedTo: userEmail },
        });
    }

    private parseDate(iso: string | undefined): Date {
        if (!iso) return new Date();
        const d = new Date(iso);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    private escapeHtml(s: string): string {
        return (s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Minimal HTML→text fallback for when Resend omits `text`. */
    private htmlToText(html: string): string {
        if (!html) return '';
        return html
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+\n/g, '\n')
            .trim();
    }
}
