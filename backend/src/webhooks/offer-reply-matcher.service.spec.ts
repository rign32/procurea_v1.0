import { Test, TestingModule } from '@nestjs/testing';
import { OfferReplyMatcherService } from './offer-reply-matcher.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResendInboundEmail } from './dto/resend-inbound-payload.dto';

describe('OfferReplyMatcherService', () => {
    let service: OfferReplyMatcherService;
    let prismaMock: {
        offer: {
            findUnique: jest.Mock;
            findFirst: jest.Mock;
        };
    };

    const offerId = '11111111-1111-1111-1111-111111111111';

    const basePayload = (
        overrides: Partial<ResendInboundEmail> = {},
    ): ResendInboundEmail => ({
        email_id: 'email_123',
        created_at: new Date().toISOString(),
        from: 'Supplier Rep <rep@supplier.com>',
        to: ['inbound@procurea.pl'],
        message_id: '<msg-123@supplier.com>',
        subject: 'Re: RFQ',
        text: 'Hello',
        headers: {},
        ...overrides,
    });

    beforeEach(async () => {
        prismaMock = {
            offer: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
            },
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OfferReplyMatcherService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();
        service = module.get(OfferReplyMatcherService);
    });

    describe('helpers', () => {
        it('parseEmailAddress handles bare email', () => {
            expect(service.parseEmailAddress('rep@supplier.com')).toBe(
                'rep@supplier.com',
            );
        });

        it('parseEmailAddress handles Name <email> form', () => {
            expect(
                service.parseEmailAddress('John Doe <john@x.com>'),
            ).toBe('john@x.com');
        });

        it('parseEmailAddress handles quoted name form', () => {
            expect(
                service.parseEmailAddress('"Doe, John" <j@x.com>'),
            ).toBe('j@x.com');
        });

        it('getHeader is case-insensitive', () => {
            expect(
                service.getHeader(
                    { 'In-Reply-To': '<abc>' },
                    'in-reply-to',
                ),
            ).toBe('<abc>');
            expect(
                service.getHeader(
                    { 'IN-REPLY-TO': '<abc>' },
                    'In-Reply-To',
                ),
            ).toBe('<abc>');
        });

        it('cleanMessageId strips brackets', () => {
            expect(service.cleanMessageId('<abc@host>')).toBe('abc@host');
            expect(service.cleanMessageId('abc@host')).toBe('abc@host');
        });
    });

    describe('Layer 1: reply-alias', () => {
        it('matches reply-{offerId}@procurea.pl', async () => {
            prismaMock.offer.findUnique.mockResolvedValue({ id: offerId });
            const payload = basePayload({
                to: [`reply-${offerId}@procurea.pl`],
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
            expect(prismaMock.offer.findUnique).toHaveBeenCalledWith({
                where: { id: offerId },
                select: { id: true },
            });
        });

        it('matches reply-{offerId}@procurea.io', async () => {
            prismaMock.offer.findUnique.mockResolvedValue({ id: offerId });
            const payload = basePayload({
                to: [`reply-${offerId}@procurea.io`],
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
        });

        it('matches reply-alias wrapped in Name <addr> form', async () => {
            prismaMock.offer.findUnique.mockResolvedValue({ id: offerId });
            const payload = basePayload({
                to: [`Procurea <reply-${offerId}@procurea.pl>`],
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
        });
    });

    describe('Layer 2: In-Reply-To header', () => {
        it('matches via In-Reply-To to Offer.resendEmailId', async () => {
            prismaMock.offer.findUnique.mockResolvedValue(null);
            prismaMock.offer.findFirst
                .mockResolvedValueOnce({ id: offerId }) // layer 2 hit
                .mockResolvedValue(null);
            const payload = basePayload({
                to: ['generic@procurea.pl'],
                headers: { 'In-Reply-To': '<outbound-abc@resend.dev>' },
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
            expect(prismaMock.offer.findFirst).toHaveBeenCalledWith({
                where: { resendEmailId: 'outbound-abc@resend.dev' },
                select: { id: true },
            });
        });

        it('falls through References header when In-Reply-To misses', async () => {
            prismaMock.offer.findUnique.mockResolvedValue(null);
            prismaMock.offer.findFirst.mockImplementation(
                async ({ where }: any) => {
                    if (where.resendEmailId === 'second@host')
                        return { id: offerId };
                    return null;
                },
            );
            const payload = basePayload({
                to: ['generic@procurea.pl'],
                headers: {
                    'in-reply-to': '<first@host>',
                    references: '<first@host> <second@host>',
                },
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
        });
    });

    describe('Layer 3: from-address fallback', () => {
        it('matches via supplier contactEmails', async () => {
            prismaMock.offer.findUnique.mockResolvedValue(null);
            prismaMock.offer.findFirst.mockImplementation(
                async ({ where }: any) => {
                    if (
                        where.OR &&
                        where.status?.in?.includes('PENDING')
                    ) {
                        return { id: offerId };
                    }
                    return null;
                },
            );
            const payload = basePayload({
                to: ['inbound@procurea.pl'],
                from: '"Rep" <rep@supplier.com>',
                headers: {},
            });
            const match = await service.matchOfferFromPayload(payload);
            expect(match?.id).toBe(offerId);
        });

        it('returns null when no layer matches', async () => {
            prismaMock.offer.findUnique.mockResolvedValue(null);
            prismaMock.offer.findFirst.mockResolvedValue(null);
            const match = await service.matchOfferFromPayload(
                basePayload({
                    to: ['somewhere@procurea.pl'],
                    from: 'rep@supplier.com',
                    headers: {},
                }),
            );
            expect(match).toBeNull();
        });
    });
});
