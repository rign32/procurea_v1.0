import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

describe('EmailService', () => {
    let service: EmailService;
    let mockResend: any;

    beforeEach(async () => {
        // Mock the Resend client
        mockResend = {
            emails: {
                send: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'RESEND_API_KEY') return 'test-api-key';
                            if (key === 'FROM_EMAIL') return 'test@procurea.pl';
                            return null;
                        }),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: { organization: { findUnique: jest.fn() } },
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        // Inject mock Resend client
        (service as any).resend = mockResend;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendMagicLink', () => {
        it('should send magic link email successfully', async () => {
            mockResend.emails.send.mockResolvedValue({ id: 'email-123' });

            const result = await service.sendMagicLink('test@example.com', '123456');

            expect(result).toBe(true);
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'test@example.com',
                    subject: expect.stringContaining('Procurea'),
                    html: expect.stringContaining('123456'),
                })
            );
        });

        it('should include verification code in email HTML', async () => {
            mockResend.emails.send.mockResolvedValue({ id: 'email-123' });

            await service.sendMagicLink('test@example.com', '654321');

            const callArgs = mockResend.emails.send.mock.calls[0][0];
            expect(callArgs.html).toContain('654321');
        });

        it('should return false when email fails to send', async () => {
            mockResend.emails.send.mockRejectedValue(new Error('SMTP Error'));

            const result = await service.sendMagicLink('test@example.com', '123456');

            expect(result).toBe(false);
        });

        it('should return false when Resend is not configured', async () => {
            (service as any).resend = null;

            const result = await service.sendMagicLink('test@example.com', '123456');

            expect(result).toBe(false);
        });
    });

    describe('sendWelcomeEmail', () => {
        it('should send welcome email successfully', async () => {
            mockResend.emails.send.mockResolvedValue({ id: 'email-123' });

            const result = await service.sendWelcomeEmail('test@example.com', 'John Doe');

            expect(result).toBe(true);
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'test@example.com',
                })
            );
        });

        it('should return false when Resend is not configured', async () => {
            (service as any).resend = null;

            const result = await service.sendWelcomeEmail('test@example.com', 'John');

            expect(result).toBe(false);
        });
    });

    describe('Email Override (Debug Routing)', () => {
        beforeEach(() => {
            (service as any).overrideEmail = 'debug@test.com';
        });

        it('should redirect emails to override address when set', async () => {
            mockResend.emails.send.mockResolvedValue({ id: 'email-123' });

            await service.sendMagicLink('original@example.com', '123456');

            const callArgs = mockResend.emails.send.mock.calls[0][0];
            expect(callArgs.to).toBe('debug@test.com');
            expect(callArgs.subject).toContain('original@example.com');
        });
    });
});
