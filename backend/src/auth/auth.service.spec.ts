import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RedisService } from './redis.service';
import { SmsService } from './sms.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let redisService: jest.Mocked<RedisService>;
    let emailService: jest.Mocked<EmailService>;
    let prismaService: jest.Mocked<PrismaService>;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        organizationId: 'org-123',
        onboardingCompleted: true,
        isPhoneVerified: true,
        companyName: 'Test Company',
        jobTitle: 'Developer',
        phone: '+48123456789',
        organization: { id: 'org-123', locations: [] }
    };

    beforeEach(async () => {
        jest.useFakeTimers();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        organization: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: SmsService,
                    useValue: {
                        sendOtp: jest.fn(),
                        verifyOtp: jest.fn(),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendMagicLink: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'JWT_SECRET') return 'test-secret';
                            return null;
                        }),
                    },
                },
                {
                    provide: RedisService,
                    useValue: {
                        setMagicCode: jest.fn(),
                        verifyAndDeleteMagicCode: jest.fn(),
                        setExchangeToken: jest.fn(),
                        getAndDeleteExchangeToken: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        redisService = module.get(RedisService);
        emailService = module.get(EmailService);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('startEmailLogin', () => {
        it('should generate magic code and send email for existing user', async () => {
            prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
            emailService.sendMagicLink = jest.fn().mockResolvedValue(true);
            redisService.setMagicCode = jest.fn().mockResolvedValue(undefined);

            const result = await service.startEmailLogin('test@example.com');

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('userId', mockUser.id);
            expect(redisService.setMagicCode).toHaveBeenCalledWith(
                'test@example.com',
                expect.any(String), // 6-digit code
                mockUser.id,
                600 // TTL
            );
            expect(emailService.sendMagicLink).toHaveBeenCalledWith(
                'test@example.com',
                expect.any(String)
            );
        });

        it('should create new user if not exists', async () => {
            prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
            prismaService.organization.create = jest.fn().mockResolvedValue({ id: 'new-org-123' });
            prismaService.user.create = jest.fn().mockResolvedValue({ ...mockUser, id: 'new-user-123' });
            emailService.sendMagicLink = jest.fn().mockResolvedValue(true);
            redisService.setMagicCode = jest.fn().mockResolvedValue(undefined);

            const result = await service.startEmailLogin('new@example.com');

            expect(result).toHaveProperty('message');
            expect(prismaService.user.create).toHaveBeenCalled();
        });
    });

    describe('verifyEmailCode', () => {
        it('should return user when code is valid', async () => {
            redisService.verifyAndDeleteMagicCode = jest.fn().mockResolvedValue(mockUser.id);
            prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

            const result = await service.verifyEmailCode('test@example.com', '123456');

            expect(result).toEqual(mockUser);
            expect(redisService.verifyAndDeleteMagicCode).toHaveBeenCalledWith('test@example.com', '123456');
        });

        it('should throw BadRequestException when code is invalid', async () => {
            redisService.verifyAndDeleteMagicCode = jest.fn().mockResolvedValue(null);

            await expect(service.verifyEmailCode('test@example.com', '000000'))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when user not found after code verification', async () => {
            redisService.verifyAndDeleteMagicCode = jest.fn().mockResolvedValue('non-existent-id');
            prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.verifyEmailCode('test@example.com', '123456'))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('generateExchangeToken', () => {
        it('should generate and store exchange token in Redis', async () => {
            redisService.setExchangeToken = jest.fn().mockResolvedValue(undefined);

            const token = await service.generateExchangeToken('user-123');

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(20);
            expect(redisService.setExchangeToken).toHaveBeenCalled();
        });
    });

    describe('validateExchangeToken', () => {
        it('should return userId for valid token', async () => {
            redisService.getAndDeleteExchangeToken = jest.fn().mockResolvedValue('user-123');

            const result = await service.validateExchangeToken('valid-token');

            expect(result).toBe('user-123');
        });

        it('should return null for invalid token', async () => {
            redisService.getAndDeleteExchangeToken = jest.fn().mockResolvedValue(null);

            const result = await service.validateExchangeToken('invalid-token');

            expect(result).toBeNull();
        });
    });
});
