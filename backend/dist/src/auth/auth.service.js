"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const sms_service_1 = require("./sms.service");
const email_service_1 = require("../email/email.service");
const redis_service_1 = require("./redis.service");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    smsService;
    emailService;
    configService;
    redisService;
    exchangeTokens = new Map();
    constructor(prisma, smsService, emailService, configService, redisService) {
        this.prisma = prisma;
        this.smsService = smsService;
        this.emailService = emailService;
        this.configService = configService;
        this.redisService = redisService;
        setInterval(() => this.cleanupExpiredTokens(), 10000);
    }
    async generateExchangeToken(userId) {
        const exchangeToken = crypto.randomBytes(32).toString('base64url');
        const ttlSeconds = 30;
        if (this.redisService.isAvailable()) {
            await this.redisService.setExchangeToken(exchangeToken, userId, ttlSeconds);
            console.log(`[EXCHANGE TOKEN] Generated (Redis) for user ${userId}, expires in ${ttlSeconds}s`);
        }
        else {
            const expiresAt = Date.now() + (ttlSeconds * 1000);
            this.exchangeTokens.set(exchangeToken, { userId, expiresAt });
            console.log(`[EXCHANGE TOKEN] Generated (in-memory) for user ${userId}, expires in ${ttlSeconds}s`);
        }
        return exchangeToken;
    }
    async consumeExchangeToken(exchangeToken) {
        if (this.redisService.isAvailable()) {
            const userId = await this.redisService.getAndDeleteExchangeToken(exchangeToken);
            if (userId) {
                console.log(`[EXCHANGE TOKEN] Token consumed (Redis) for user ${userId}`);
                return userId;
            }
            console.log(`[EXCHANGE TOKEN] Token not found or expired (Redis): ${exchangeToken.substring(0, 10)}...`);
            return null;
        }
        const data = this.exchangeTokens.get(exchangeToken);
        if (!data) {
            console.log(`[EXCHANGE TOKEN] Token not found (in-memory): ${exchangeToken.substring(0, 10)}...`);
            return null;
        }
        if (Date.now() > data.expiresAt) {
            console.log(`[EXCHANGE TOKEN] Token expired (in-memory): ${exchangeToken.substring(0, 10)}...`);
            this.exchangeTokens.delete(exchangeToken);
            return null;
        }
        this.exchangeTokens.delete(exchangeToken);
        console.log(`[EXCHANGE TOKEN] Token consumed (in-memory) for user ${data.userId}`);
        return data.userId;
    }
    cleanupExpiredTokens() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [token, data] of this.exchangeTokens.entries()) {
            if (now > data.expiresAt) {
                this.exchangeTokens.delete(token);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`[EXCHANGE TOKEN] Cleaned up ${cleanedCount} expired in-memory tokens`);
        }
    }
    async mockSendEmail(email, subject, body) {
        console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | Body: ${body}`);
        return true;
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });
    }
    async validateUserByProvider(email, provider, ssoId, name) {
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    ssoProvider: provider,
                    ssoId: ssoId,
                    role: 'USER',
                    onboardingCompleted: false,
                },
            });
        }
        else {
            if (!user.ssoProvider) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { ssoProvider: provider, ssoId: ssoId },
                });
            }
        }
        return { user, isNewUser };
    }
    async startEmailLogin(email) {
        const { user } = await this.validateUserByProvider(email, 'email');
        const magicCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.redisService.setMagicCode(email, magicCode, user.id, 600);
        await this.emailService.sendMagicLink(email, magicCode);
        console.log(`[DEV MAGIC CODE] To: ${email} | Code: ${magicCode}`);
        return { message: 'Magic link sent to your email', userId: user.id };
    }
    async verifyEmailCode(email, code) {
        const userId = await this.redisService.verifyAndDeleteMagicCode(email, code);
        if (!userId) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async initiatePhoneVerification(userId, phone) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser) {
            throw new common_1.BadRequestException('User not found. Please log in again.');
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                phone: phone,
                isPhoneVerified: true,
                NOT: { id: userId },
            },
        });
        if (existingUser) {
            if (!existingUser.onboardingCompleted) {
                throw new common_1.ConflictException({
                    message: 'Phone number already registered. Please use the existing account.',
                    code: 'PHONE_EXISTS_INCOMPLETE',
                    userId: existingUser.id,
                    maskedEmail: this.maskEmail(existingUser.email),
                });
            }
            throw new common_1.ConflictException({
                message: 'Phone number already in use',
                code: 'PHONE_EXISTS',
                maskedEmail: this.maskEmail(existingUser.email),
            });
        }
        const verificationSid = await this.smsService.sendOtpCode(phone);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                pendingPhone: phone,
            },
        });
        return { message: 'OTP sent' };
    }
    async verifyPhone(userId, phone, code) {
        const isValid = await this.smsService.verifyOtpCode(phone, code);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                phone: phone,
                isPhoneVerified: true,
                NOT: { id: userId },
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Phone number was taken during verification');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                phone: phone,
                pendingPhone: null,
                isPhoneVerified: true,
                phoneVerifiedAt: new Date(),
            },
        });
        return user;
    }
    async completeOnboarding(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (!user.isPhoneVerified)
            throw new common_1.BadRequestException('Phone not verified');
        const org = await this.prisma.organization.create({
            data: {
                name: data.companyName,
                users: { connect: { id: userId } },
                locations: {
                    create: data.locations || []
                }
            }
        });
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.name,
                jobTitle: data.jobTitle,
                language: data.language || 'pl',
                companyName: data.companyName,
                organizationId: org.id,
                onboardingCompleted: true,
            },
        });
        if (data.invites && data.invites.length > 0) {
            for (const invite of data.invites) {
                console.log(`[MOCK INVITE] Sending invite to ${invite.email} for organization ${org.name}`);
            }
        }
        const existingSequence = await this.prisma.sequenceTemplate.findFirst({
            where: { isSystem: true },
        });
        if (!existingSequence) {
            await this.prisma.sequenceTemplate.create({
                data: {
                    name: 'Standardowa Sekwencja RFQ',
                    isSystem: true,
                    steps: {
                        create: [
                            {
                                dayOffset: 0,
                                type: 'INITIAL',
                                subject: 'Zapytanie Ofertowe: {{Product_Name}}',
                                bodySnippet: 'Dzień dobry,\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                            },
                            {
                                dayOffset: 3,
                                type: 'REMINDER',
                                subject: 'Przypomnienie: RFQ {{Product_Name}}',
                                bodySnippet: 'Dzień dobry,\n\nPrzypominamy o naszym zapytaniu ofertowym dotyczącym {{Product_Name}}.\n\nCzy planują Państwo złożyć ofertę?\n\nZ poważaniem,\n{{Sender_Name}}',
                            },
                            {
                                dayOffset: 7,
                                type: 'FINAL',
                                subject: 'Ostatnie przypomnienie: RFQ {{Product_Name}}',
                                bodySnippet: 'Dzień dobry,\n\nTo nasze ostatnie przypomnienie dotyczące zapytania na {{Product_Name}}.\n\nProsimy o odpowiedź do końca tygodnia.\n\nZ poważaniem,\n{{Sender_Name}}',
                            },
                        ],
                    },
                },
            });
            console.log('[ONBOARDING] Default sequence template created');
        }
        return updatedUser;
    }
    async sendAccountReminder(phone) {
        const user = await this.prisma.user.findFirst({
            where: { phone, isPhoneVerified: true },
        });
        if (user) {
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://app.procurea.pl';
            const message = `Konto Procurea powiązane z tym numerem: ${user.email}. Jeśli to nie Ty próbujesz się rejestrować, zmień hasło lub zabezpiecz konto: ${frontendUrl}/auth/settings`;
            await this.smsService.sendCustomSms(phone, message);
            return { message: 'Reminder sent' };
        }
        return { message: 'No account found' };
    }
    async updatePreferences(userId, preferences) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: JSON.stringify(preferences)
            }
        });
    }
    async cancelRegistration(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.onboardingCompleted) {
            throw new common_1.BadRequestException('Cannot cancel registration - onboarding already completed');
        }
        await this.prisma.user.delete({
            where: { id: userId }
        });
        console.log(`[AUTH] Registration cancelled for user ${userId} (${user.email})`);
        return { success: true, message: 'Registration cancelled successfully' };
    }
    maskEmail(email) {
        const [name, domain] = email.split('@');
        if (name.length <= 2)
            return `${name}***@${domain}`;
        return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
    }
    async updateProfile(userId, data) {
        if (data.phone) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    phone: data.phone,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Phone number already in use');
            }
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...data
            },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });
    }
    async deleteAllUsers() {
        try {
            console.log('[Auth] Deleting all users...');
            const count = await this.prisma.user.count();
            console.log(`[Auth] Found ${count} users to delete`);
            if (count === 0) {
                return { success: true, count: 0, message: 'No users to delete' };
            }
            const result = await this.prisma.user.deleteMany({});
            console.log(`[Auth] Deleted ${result.count} users`);
            return { success: true, count: result.count, message: `Deleted ${result.count} users` };
        }
        catch (error) {
            console.error('[Auth] Error deleting users:', error);
            console.error('[Auth] Error details:', JSON.stringify(error, null, 2));
            throw new common_1.BadRequestException(`Failed to delete users: ${error.message}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService,
        email_service_1.EmailService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map