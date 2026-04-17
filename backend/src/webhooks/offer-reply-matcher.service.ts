import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResendInboundEmail } from './dto/resend-inbound-payload.dto';

/**
 * Resolve which Offer an incoming email reply belongs to.
 *
 * Matching is done in three layers, in order of specificity:
 *   1. Unique address: `reply-{offerId}@procurea.{pl|io}` in the `to` field.
 *      This is what we put in `Reply-To` on outbound emails — deterministic.
 *   2. RFC 5322 threading: `In-Reply-To` / `References` headers map to
 *      `Offer.resendEmailId` (the Resend message id we saved when sending).
 *   3. Fallback: match the sender address against Supplier.contactEmails /
 *      Supplier.contacts[].email and pick the most recent open offer.
 *
 * Returns the matching `Offer.id` or `null` if no offer could be identified.
 */
@Injectable()
export class OfferReplyMatcherService {
    private readonly logger = new Logger(OfferReplyMatcherService.name);

    constructor(private readonly prisma: PrismaService) {}

    async matchOfferFromPayload(
        payload: ResendInboundEmail,
    ): Promise<{ id: string } | null> {
        // Layer 1: reply-{offerId}@procurea.{pl|io}
        for (const toAddr of payload.to || []) {
            const email = this.parseEmailAddress(toAddr) || toAddr;
            const match = email.match(
                /^reply-([a-f0-9-]{36})@procurea\.(pl|io)$/i,
            );
            if (match) {
                const offer = await this.prisma.offer.findUnique({
                    where: { id: match[1] },
                    select: { id: true },
                });
                if (offer) {
                    this.logger.log(
                        `Matched offer ${offer.id} via reply-alias (layer 1)`,
                    );
                    return offer;
                }
                this.logger.warn(
                    `Reply-alias points to unknown offer id=${match[1]}`,
                );
            }
        }

        // Layer 2: In-Reply-To / References → Offer.resendEmailId
        const inReplyTo = this.getHeader(payload.headers || {}, 'in-reply-to');
        const references = this.getHeader(payload.headers || {}, 'references');
        const candidateMessageIds: string[] = [];
        if (inReplyTo) {
            const cleaned = this.cleanMessageId(inReplyTo);
            if (cleaned) candidateMessageIds.push(cleaned);
        }
        if (references) {
            for (const r of references.split(/\s+/)) {
                const cleaned = this.cleanMessageId(r);
                if (cleaned) candidateMessageIds.push(cleaned);
            }
        }
        for (const mid of candidateMessageIds) {
            const offer = await this.prisma.offer.findFirst({
                where: { resendEmailId: mid },
                select: { id: true },
            });
            if (offer) {
                this.logger.log(
                    `Matched offer ${offer.id} via In-Reply-To=${mid} (layer 2)`,
                );
                return offer;
            }
        }

        // Layer 3: from address → supplier → most recent open offer
        const fromEmail = this.parseEmailAddress(payload.from);
        if (fromEmail) {
            const offer = await this.prisma.offer.findFirst({
                where: {
                    OR: [
                        {
                            supplier: {
                                contactEmails: { contains: fromEmail },
                            },
                        },
                        {
                            supplier: {
                                contacts: { some: { email: fromEmail } },
                            },
                        },
                    ],
                    status: {
                        in: [
                            'PENDING',
                            'VIEWED',
                            'SUBMITTED',
                            'COUNTER_OFFERED',
                        ],
                    },
                },
                orderBy: { createdAt: 'desc' },
                select: { id: true },
            });
            if (offer) {
                this.logger.log(
                    `Matched offer ${offer.id} via from=${fromEmail} (layer 3)`,
                );
                return offer;
            }
        }

        this.logger.warn(
            `No offer match: from=${payload.from} to=${(payload.to || []).join(',')} in-reply-to=${inReplyTo || 'none'}`,
        );
        return null;
    }

    /**
     * Case-insensitive header lookup. Resend sends headers in a normalized
     * object but different adapters use different casing (In-Reply-To vs
     * in-reply-to vs IN-REPLY-TO), so we walk the keys.
     */
    getHeader(
        headers: Record<string, string>,
        name: string,
    ): string | null {
        if (!headers) return null;
        const target = name.toLowerCase();
        for (const key of Object.keys(headers)) {
            if (key.toLowerCase() === target) {
                const v = headers[key];
                return typeof v === 'string' ? v : null;
            }
        }
        return null;
    }

    /** Strip surrounding `<...>` brackets around an RFC5322 Message-ID. */
    cleanMessageId(raw: string): string {
        if (!raw) return '';
        return raw.trim().replace(/^</, '').replace(/>$/, '').trim();
    }

    /**
     * Extract the email address from an RFC 5322 From field.
     * Handles `"Name" <email@host>`, `Name <email@host>`, `email@host`.
     */
    parseEmailAddress(fromField: string): string | null {
        if (!fromField) return null;
        const angle = fromField.match(/<([^>]+)>/);
        if (angle) return angle[1].trim().toLowerCase();
        const bare = fromField.match(/([^\s<>"']+@[^\s<>"']+)/);
        if (bare) return bare[1].trim().toLowerCase();
        return null;
    }

    /** Extract the display name (if any) from an RFC 5322 From field. */
    parseDisplayName(fromField: string): string | null {
        if (!fromField) return null;
        const angle = fromField.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/);
        if (angle) {
            const n = angle[1].trim();
            return n || null;
        }
        return null;
    }
}
