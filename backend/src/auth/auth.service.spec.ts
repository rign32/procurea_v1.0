import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from './redis.service';
import { SmsService } from './sms.service';
import { EmailService } from '../email/email.service';
import { SalesOpsService } from '../sales-ops/sales-ops.service';
import { ObservabilityService } from '../observability/observability.service';

type PrismaMock = any;

function buildPrismaMock(overrides: Partial<PrismaMock> = {}): PrismaMock {
    const txRunner = async (cb: any) => cb(prisma);
    const prisma: PrismaMock = {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        organization: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
        creditTransaction: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
        orgCreditTransaction: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
        sequenceTemplate: {
            findFirst: jest.fn().mockResolvedValue({ id: 'seq-1' }),
            create: jest.fn(),
        },
        userSharingPreference: {
            createMany: jest.fn(),
        },
        campaign: { create: jest.fn(), deleteMany: jest.fn() },
        supplier: { create: jest.fn(), deleteMany: jest.fn() },
        rfqRequest: { create: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn() },
        offer: { create: jest.fn(), deleteMany: jest.fn() },
        log: { createMany: jest.fn(), deleteMany: jest.fn() },
        refreshToken: { deleteMany: jest.fn() },
        organizationLocation: { deleteMany: jest.fn() },
        $transaction: jest.fn(txRunner),
        ...overrides,
    };
    return prisma;
}

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaMock;
    let redis: any;
    let email: any;
    let sms: any;
    let salesOps: any;
    let observability: any;

    beforeEach(async () => {
        jest.useFakeTimers();
        prisma = buildPrismaMock();
        redis = {
            isAvailable: jest.fn().mockReturnValue(false),
            setExchangeToken: jest.fn(),
            getAndDeleteExchangeToken: jest.fn(),
            setMagicCode: jest.fn(),
            verifyAndDeleteMagicCode: jest.fn(),
        };
        email = { sendMagicLink: jest.fn() };
        sms = { sendOtpCode: jest.fn(), verifyOtpCode: jest.fn(), sendCustomSms: jest.fn() };
        salesOps = { handleRegistration: jest.fn() };
        observability = { recordEvent: jest.fn().mockResolvedValue(undefined) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: RedisService, useValue: redis },
                { provide: SmsService, useValue: sms },
                { provide: EmailService, useValue: email },
                { provide: SalesOpsService, useValue: salesOps },
                { provide: ObservabilityService, useValue: observability },
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    // ─────────────────────────────────────────────────────────────
    // EXCHANGE TOKENS (Redis + in-memory fallback)
    // ─────────────────────────────────────────────────────────────

    describe('exchange tokens', () => {
        it('generates + consumes via in-memory when Redis unavailable', async () => {
            redis.isAvailable.mockReturnValue(false);
            const token = await service.generateExchangeToken('user-1');
            expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(redis.setExchangeToken).not.toHaveBeenCalled();

            const userId = await service.consumeExchangeToken(token);
            expect(userId).toBe('user-1');
        });

        it('token is single-use (second consume returns null)', async () => {
            const token = await service.generateExchangeToken('user-1');
            await service.consumeExchangeToken(token);
            const second = await service.consumeExchangeToken(token);
            expect(second).toBeNull();
        });

        it('in-memory token expires after 30s', async () => {
            const token = await service.generateExchangeToken('user-1');
            jest.advanceTimersByTime(31_000);
            const userId = await service.consumeExchangeToken(token);
            expect(userId).toBeNull();
        });

        it('uses Redis when available', async () => {
            redis.isAvailable.mockReturnValue(true);
            redis.getAndDeleteExchangeToken.mockResolvedValue('user-42');

            const token = await service.generateExchangeToken('user-42');
            expect(redis.setExchangeToken).toHaveBeenCalledWith(token, 'user-42', 30);

            const userId = await service.consumeExchangeToken('any-token');
            expect(userId).toBe('user-42');
            expect(redis.getAndDeleteExchangeToken).toHaveBeenCalledWith('any-token');
        });

        it('returns null on unknown token in Redis mode', async () => {
            redis.isAvailable.mockReturnValue(true);
            redis.getAndDeleteExchangeToken.mockResolvedValue(null);
            const userId = await service.consumeExchangeToken('bogus');
            expect(userId).toBeNull();
        });
    });

    // ─────────────────────────────────────────────────────────────
    // validateUserByProvider: 4 ścieżki rejestracji/logowania
    // ─────────────────────────────────────────────────────────────

    describe('validateUserByProvider', () => {
        it('public email (gmail) → personal trial, no org', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.organization.findFirst.mockResolvedValue(null);
            const created = { id: 'u1', email: 'jan@gmail.com', name: 'jan', searchCredits: 0, organizationId: null };
            prisma.user.create.mockResolvedValue(created);

            const result = await service.validateUserByProvider('jan@gmail.com', 'google', 'sso-1', 'Jan');

            expect(result.isNewUser).toBe(true);
            expect(prisma.organization.findFirst).not.toHaveBeenCalled();
            expect(prisma.organization.create).not.toHaveBeenCalled();
            expect(prisma.creditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ userId: 'u1', amount: 10, type: 'TRIAL_GRANT' }),
            }));
            expect(salesOps.handleRegistration).toHaveBeenCalled();
        });

        it('new corporate email — creates new org and transfers trial credits to org pool', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.organization.findFirst.mockResolvedValue(null);

            const createdUser = { id: 'u2', email: 'anna@acme.com', organizationId: null, searchCredits: 10 };
            prisma.user.create.mockResolvedValue(createdUser);
            prisma.organization.create.mockResolvedValue({ id: 'org-1', name: 'acme.com' });
            prisma.user.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValue({ ...createdUser, organizationId: 'org-1', searchCredits: 0 });
            prisma.organization.findUnique.mockResolvedValue({ searchCredits: 10 });

            const result = await service.validateUserByProvider('anna@acme.com', 'email');

            expect(result.isNewUser).toBe(true);
            expect(prisma.organization.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ domain: 'acme.com' }),
            }));
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(prisma.creditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ userId: 'u2', type: 'TRIAL_GRANT' }),
            }));
            expect(prisma.orgCreditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ organizationId: 'org-1', type: 'TRIAL_GRANT' }),
            }));
        });

        it('2nd user from paid-plan org → +3 org-credit bonus', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.organization.findFirst.mockResolvedValue({
                id: 'org-p', name: 'Paid Co', plan: 'pay_as_you_go', users: [{ id: 'existing-u' }],
            });
            prisma.user.create.mockResolvedValue({ id: 'new-u', email: 'marek@paid.com' });
            prisma.organization.findUnique.mockResolvedValue({ searchCredits: 23 });

            await service.validateUserByProvider('marek@paid.com', 'email');

            expect(prisma.orgCreditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    organizationId: 'org-p',
                    amount: 3,
                    type: 'MEMBER_BONUS',
                }),
            }));
            expect(prisma.userSharingPreference.createMany).toHaveBeenCalled();
        });

        it('2nd user from research (trial) org → no bonus', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.organization.findFirst.mockResolvedValue({
                id: 'org-r', name: 'Trial Co', plan: 'research', users: [],
            });
            prisma.user.create.mockResolvedValue({ id: 'new-u' });

            await service.validateUserByProvider('tom@trial.com', 'email');

            expect(prisma.orgCreditTransaction.create).not.toHaveBeenCalled();
        });

        it('existing user — returns without creating anything', async () => {
            const existing = { id: 'u9', email: 'jan@gmail.com', ssoProvider: 'google', language: 'pl' };
            prisma.user.findUnique.mockResolvedValue(existing);

            const result = await service.validateUserByProvider('jan@gmail.com', 'google');

            expect(result.isNewUser).toBe(false);
            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(prisma.organization.create).not.toHaveBeenCalled();
            expect(salesOps.handleRegistration).not.toHaveBeenCalled();
        });

        it('existing user — updates language when origin locale differs', async () => {
            const existing = { id: 'u9', email: 'jan@gmail.com', ssoProvider: 'email', language: 'pl' };
            prisma.user.findUnique.mockResolvedValue(existing);

            await service.validateUserByProvider('jan@gmail.com', 'email', undefined, undefined, 'en');

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u9' },
                data: { language: 'en' },
            }));
        });
    });

    // ─────────────────────────────────────────────────────────────
    // Email magic code flow
    // ─────────────────────────────────────────────────────────────

    describe('email magic code flow', () => {
        it('startEmailLogin sends magic code via email + stores in Redis', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@acme.com', language: 'pl' });

            const result = await service.startEmailLogin('test@acme.com', 'pl');

            expect(redis.setMagicCode).toHaveBeenCalledWith(
                'test@acme.com',
                expect.stringMatching(/^\d{6}$/),
                'u1',
                600,
            );
            expect(email.sendMagicLink).toHaveBeenCalledWith('test@acme.com', expect.stringMatching(/^\d{6}$/), 'pl');
            expect(result.userId).toBe('u1');
        });

        it('verifyEmailCode returns user on valid code + marks email verified', async () => {
            const user = { id: 'u1', email: 'test@acme.com', isEmailVerified: true, organization: null, rbacRole: null };
            redis.verifyAndDeleteMagicCode.mockResolvedValue('u1');
            prisma.user.update.mockResolvedValue(user);

            const result = await service.verifyEmailCode('test@acme.com', '123456');
            expect(result).toEqual(user);
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: expect.objectContaining({ isEmailVerified: true }),
            }));
        });

        it('verifyEmailCode throws on invalid code + emits observability warning', async () => {
            redis.verifyAndDeleteMagicCode.mockResolvedValue(null);
            await expect(service.verifyEmailCode('test@acme.com', 'wrong'))
                .rejects.toThrow(BadRequestException);
            expect(observability.recordEvent).toHaveBeenCalledWith(
                'auth', 'login_failed', 'warning',
                expect.objectContaining({ userEmail: 'test@acme.com' }),
            );
        });
    });

    // ─────────────────────────────────────────────────────────────
    // Phone verification
    // ─────────────────────────────────────────────────────────────

    describe('phone verification', () => {
        it('rejects phone already in use by fully-onboarded user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
            prisma.user.findFirst.mockResolvedValue({
                id: 'u2', email: 'other@x.com', isPhoneVerified: true, onboardingCompleted: true,
            });

            await expect(service.initiatePhoneVerification('u1', '+48500500500'))
                .rejects.toThrow(ConflictException);
            expect(sms.sendOtpCode).not.toHaveBeenCalled();
        });

        it('returns PHONE_EXISTS_INCOMPLETE hint for abandoned registrations', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
            prisma.user.findFirst.mockResolvedValue({
                id: 'u2', email: 'abandoned@x.com', isPhoneVerified: true, onboardingCompleted: false,
            });

            await expect(service.initiatePhoneVerification('u1', '+48500500500'))
                .rejects.toMatchObject({
                    response: expect.objectContaining({ code: 'PHONE_EXISTS_INCOMPLETE' }),
                });
        });

        it('sends OTP + stores pendingPhone on success', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
            prisma.user.findFirst.mockResolvedValue(null);
            sms.sendOtpCode.mockResolvedValue('vs-123');

            await service.initiatePhoneVerification('u1', '+48500500500');

            expect(sms.sendOtpCode).toHaveBeenCalledWith('+48500500500');
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'u1' },
                data: expect.objectContaining({ pendingPhone: '+48500500500' }),
            }));
        });

        it('verifyPhone rejects invalid code', async () => {
            sms.verifyOtpCode.mockResolvedValue(false);
            await expect(service.verifyPhone('u1', '+48500500500', 'wrong'))
                .rejects.toThrow(BadRequestException);
        });

        it('verifyPhone marks phone verified on valid code', async () => {
            sms.verifyOtpCode.mockResolvedValue(true);
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.user.update.mockResolvedValue({ id: 'u1', phone: '+48500500500', isPhoneVerified: true });

            const res = await service.verifyPhone('u1', '+48500500500', '123456');

            expect(res.isPhoneVerified).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ phone: '+48500500500', isPhoneVerified: true }),
            }));
        });
    });

    // ─────────────────────────────────────────────────────────────
    // autoLoginStaging — always-fresh refresh path (critical for staging)
    // ─────────────────────────────────────────────────────────────

    describe('autoLoginStaging', () => {
        it('creates user + org on first call (PL)', async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValue({ id: 'staging-pl' });
            prisma.organization.create.mockResolvedValue({ id: 'org-pl' });
            prisma.user.findUnique.mockResolvedValue({
                id: 'staging-pl',
                email: 'staging@procurea.dev',
                organization: { plan: 'research' },
            });

            const result = await service.autoLoginStaging('pl');

            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    email: 'staging@procurea.dev',
                    role: 'ADMIN',
                    searchCredits: 50,
                }),
            }));
            expect(prisma.organization.create).toHaveBeenCalled();
            expect(result.email).toBe('staging@procurea.dev');
        });

        it('creates EN staging user with pay_as_you_go plan', async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValue({ id: 'staging-en' });
            prisma.user.findUnique.mockResolvedValue({ id: 'staging-en' });

            await service.autoLoginStaging('en');

            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ email: 'staging-en@procurea.dev', language: 'en' }),
            }));
            expect(prisma.organization.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ plan: 'pay_as_you_go' }),
            }));
        });

        it('refreshes existing staging user — tops up credits to min 50', async () => {
            const existing = {
                id: 'staging-pl',
                organizationId: 'org-pl',
                searchCredits: 5,
                organization: { id: 'org-pl', plan: 'research', searchCredits: 0, domain: 'procurea.dev' },
            };
            prisma.user.findUnique.mockResolvedValueOnce(existing);
            prisma.user.findUnique.mockResolvedValue(existing);

            await service.autoLoginStaging('pl');

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'staging-pl' },
                data: expect.objectContaining({ searchCredits: 50, trialCreditsUsed: true }),
            }));
            expect(prisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'org-pl' },
                data: expect.objectContaining({ searchCredits: 50 }),
            }));
        });

        it('attaches org when staging user missing organizationId', async () => {
            const existing = {
                id: 'staging-pl', organizationId: null, searchCredits: 100, organization: null,
            };
            prisma.user.findUnique.mockResolvedValueOnce(existing);
            prisma.organization.create.mockResolvedValue({ id: 'new-org' });
            prisma.user.findUnique.mockResolvedValue(existing);

            await service.autoLoginStaging('pl');

            expect(prisma.organization.create).toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ organizationId: 'new-org' }),
            }));
        });
    });

    // ─────────────────────────────────────────────────────────────
    // cancelRegistration — business rule: only pre-onboarding
    // ─────────────────────────────────────────────────────────────

    describe('cancelRegistration', () => {
        it('deletes user who never completed onboarding', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'u1', email: 'x@acme.com', onboardingCompleted: false,
            });

            const res = await service.cancelRegistration('u1');

            expect(res.success).toBe(true);
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
        });

        it('refuses to cancel after onboarding complete', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'u1', email: 'x@acme.com', onboardingCompleted: true,
            });

            await expect(service.cancelRegistration('u1'))
                .rejects.toThrow(BadRequestException);
            expect(prisma.user.delete).not.toHaveBeenCalled();
        });

        it('throws if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.cancelRegistration('missing'))
                .rejects.toThrow(BadRequestException);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // updateProfile — phone uniqueness + already-verified phone strip
    // ─────────────────────────────────────────────────────────────

    describe('updateProfile', () => {
        it('strips phone from update when user already verified their phone', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', isPhoneVerified: true });
            prisma.user.update.mockResolvedValue({ id: 'u1' });

            await service.updateProfile('u1', { phone: '+48111222333', name: 'new' });

            const updateCall = prisma.user.update.mock.calls[0][0];
            expect(updateCall.data.phone).toBeUndefined();
            expect(updateCall.data.name).toBe('new');
        });

        it('rejects when phone is taken by another user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', isPhoneVerified: false });
            prisma.user.findFirst.mockResolvedValue({ id: 'u2' });

            await expect(service.updateProfile('u1', { phone: '+48111222333' }))
                .rejects.toThrow(ConflictException);
        });

        it('allows phone change when unique', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', isPhoneVerified: false });
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.user.update.mockResolvedValue({ id: 'u1', phone: '+48999888777' });

            const res = await service.updateProfile('u1', { phone: '+48999888777' });
            expect(res.phone).toBe('+48999888777');
        });
    });
});
