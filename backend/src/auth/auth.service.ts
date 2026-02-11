import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { EmailService } from '../email/email.service';
import { RedisService } from './redis.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    // In-memory fallback for exchange tokens (when Redis unavailable)
    // Maps exchangeToken -> { userId, expiresAt }
    private exchangeTokens = new Map<string, { userId: string; expiresAt: number }>();

    constructor(
        private prisma: PrismaService,
        private smsService: SmsService,
        private emailService: EmailService,
        private configService: ConfigService,
        private redisService: RedisService,
    ) {
        // Cleanup expired exchange tokens every 10 seconds (in-memory fallback only)
        setInterval(() => this.cleanupExpiredTokens(), 10000);
    }

    // --- EXCHANGE TOKEN MECHANISM ---
    // Generate a short-lived, single-use exchange token for cookie exchange
    async generateExchangeToken(userId: string): Promise<string> {
        const exchangeToken = crypto.randomBytes(32).toString('base64url');
        const ttlSeconds = 30; // 30 seconds

        // Try Redis first, fallback to in-memory
        if (this.redisService.isAvailable()) {
            await this.redisService.setExchangeToken(exchangeToken, userId, ttlSeconds);
            console.log(`[EXCHANGE TOKEN] Generated (Redis) for user ${userId}, expires in ${ttlSeconds}s`);
        } else {
            const expiresAt = Date.now() + (ttlSeconds * 1000);
            this.exchangeTokens.set(exchangeToken, { userId, expiresAt });
            console.log(`[EXCHANGE TOKEN] Generated (in-memory) for user ${userId}, expires in ${ttlSeconds}s`);
        }

        return exchangeToken;
    }

    // Validate and consume exchange token (single-use)
    async consumeExchangeToken(exchangeToken: string): Promise<string | null> {
        // Try Redis first
        if (this.redisService.isAvailable()) {
            const userId = await this.redisService.getAndDeleteExchangeToken(exchangeToken);
            if (userId) {
                console.log(`[EXCHANGE TOKEN] Token consumed (Redis) for user ${userId}`);
                return userId;
            }
            console.log(`[EXCHANGE TOKEN] Token not found or expired (Redis): ${exchangeToken.substring(0, 10)}...`);
            return null;
        }

        // Fallback to in-memory
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

        // Token is valid - consume it (delete to make it single-use)
        this.exchangeTokens.delete(exchangeToken);
        console.log(`[EXCHANGE TOKEN] Token consumed (in-memory) for user ${data.userId}`);

        return data.userId;
    }

    // Cleanup expired tokens (in-memory fallback only)
    private cleanupExpiredTokens(): void {
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

    // --- MOCK EMAILS (for now) ---
    private async mockSendEmail(email: string, subject: string, body: string) {
        console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | Body: ${body}`);
        return true;
    }

    // --- SSO & EMAIL LOGIN ---

    async getUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });
    }

    async validateUserByProvider(email: string, provider: string, ssoId?: string, name?: string): Promise<{ user: any; isNewUser: boolean }> {
        let user = await this.prisma.user.findUnique({
            where: { email },
        });

        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            // Create new user
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    ssoProvider: provider,
                    ssoId: ssoId,
                    role: 'USER',
                    onboardingCompleted: false, // Explicitly false for new users
                },
            });
        } else {
            // Update existing user with SSO info if missing
            if (!user.ssoProvider) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { ssoProvider: provider, ssoId: ssoId },
                });
            }
        }

        return { user, isNewUser };
    }

    async startEmailLogin(email: string) {
        const { user } = await this.validateUserByProvider(email, 'email');
        const magicCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store magic code in Redis (10 minute TTL)
        await this.redisService.setMagicCode(email, magicCode, user.id, 600);

        // Send real email via Resend
        await this.emailService.sendMagicLink(email, magicCode);

        // For development convenience, still log it
        console.log(`[DEV MAGIC CODE] To: ${email} | Code: ${magicCode}`);

        return { message: 'Magic link sent to your email', userId: user.id };
    }

    /**
     * Verify email magic code and return user if valid
     */
    async verifyEmailCode(email: string, code: string): Promise<any> {
        // Verify and consume the magic code
        const userId = await this.redisService.verifyAndDeleteMagicCode(email, code);

        if (!userId) {
            throw new BadRequestException('Invalid or expired verification code');
        }

        // Get user data
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    // --- PHONE VERIFICATION ---

    async initiatePhoneVerification(userId: string, phone: string) {
        // 1. Verify that the current user exists
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            throw new BadRequestException('User not found. Please log in again.');
        }

        // 2. Check if phone is already verified for ANOTHER user
        const existingUser = await this.prisma.user.findFirst({
            where: {
                phone: phone,
                isPhoneVerified: true,
                NOT: { id: userId },
            },
        });

        if (existingUser) {
            // If user has not completed onboarding, allow them to continue with the existing account
            if (!existingUser.onboardingCompleted) {
                throw new ConflictException({
                    message: 'Phone number already registered. Please use the existing account.',
                    code: 'PHONE_EXISTS_INCOMPLETE',
                    userId: existingUser.id,
                    maskedEmail: this.maskEmail(existingUser.email),
                });
            }

            throw new ConflictException({
                message: 'Phone number already in use',
                code: 'PHONE_EXISTS',
                maskedEmail: this.maskEmail(existingUser.email),
            });
        }

        // 3. Send OTP using Twilio Verify API
        // Twilio generates and manages the OTP code internally
        const verificationSid = await this.smsService.sendOtpCode(phone);

        // 4. Store pending phone (and verification SID for tracking if needed)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                pendingPhone: phone,
                // Note: verificationSid is optional for tracking, but Twilio Verify API
                // handles verification state internally, so we don't strictly need to store it
            },
        });

        return { message: 'OTP sent' };
    }

    async verifyPhone(userId: string, phone: string, code: string) {
        // Verify OTP using Twilio Verify API
        // In mock mode (no Twilio credentials), this will accept '123456'
        const isValid = await this.smsService.verifyOtpCode(phone, code);

        if (!isValid) {
            throw new BadRequestException('Invalid or expired verification code');
        }

        // Double check conflict before finalizing
        const existingUser = await this.prisma.user.findFirst({
            where: {
                phone: phone,
                isPhoneVerified: true,
                NOT: { id: userId },
            },
        });

        if (existingUser) {
            throw new ConflictException('Phone number was taken during verification');
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                phone: phone,
                pendingPhone: null,
                isPhoneVerified: true,
                phoneVerifiedAt: new Date(),
                // NOTE: We do NOT set onboardingCompleted here yet, user must finish profile steps.
            },
        });

        return user;
    }

    async completeOnboarding(userId: string, data: {
        firstName?: string;
        lastName?: string;
        companyName: string;
        jobTitle?: string;
        language?: string;
        locations?: { name: string; address: string }[];
        invites?: { email: string }[];
    }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (!user.isPhoneVerified) throw new BadRequestException('Phone not verified');

        // Create Organization
        const org = await this.prisma.organization.create({
            data: {
                name: data.companyName,
                users: { connect: { id: userId } },
                locations: {
                    create: data.locations || []
                }
            }
        });

        // Update User Profile
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.name, // Use existing name if not provided
                jobTitle: data.jobTitle,
                language: data.language || 'pl',
                companyName: data.companyName,
                organizationId: org.id,
                onboardingCompleted: true,
            },
        });

        // Handle Invites (Send emails via EmailService)
        if (data.invites && data.invites.length > 0) {
            for (const invite of data.invites) {
                // Determine name from email if needed, or leave it to the user upon joining
                // For now, we'll just send the email via emailService
                // Ensure emailService has sendInvitation method or similar generic mock
                // await this.emailService.sendInvitation(invite.email, user.name, org.name);
                console.log(`[MOCK INVITE] Sending invite to ${invite.email} for organization ${org.name}`);
            }
        }

        // Ensure default sequence template exists
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

    async sendAccountReminder(phone: string) {
        const user = await this.prisma.user.findFirst({
            where: { phone, isPhoneVerified: true },
        });

        if (user) {
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://app.procurea.pl';
            const message = `Konto Procurea powiązane z tym numerem: ${user.email}. Jeśli to nie Ty próbujesz się rejestrować, zmień hasło lub zabezpiecz konto: ${frontendUrl}/auth/settings`;
            await this.smsService.sendCustomSms(phone, message);
            return { message: 'Reminder sent' };
        }
        return { message: 'No account found' };
    }

    async updatePreferences(userId: string, preferences: any[]) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: JSON.stringify(preferences)
            }
        });
    }

    /**
     * Cancel registration - delete user who hasn't completed onboarding
     * Only allows deletion if onboardingCompleted is false
     */
    async cancelRegistration(userId: string): Promise<{ success: boolean; message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Only allow cancellation if onboarding is not completed
        if (user.onboardingCompleted) {
            throw new BadRequestException('Cannot cancel registration - onboarding already completed');
        }

        // Delete user (this will cascade delete related records based on Prisma schema)
        await this.prisma.user.delete({
            where: { id: userId }
        });

        console.log(`[AUTH] Registration cancelled for user ${userId} (${user.email})`);

        return { success: true, message: 'Registration cancelled successfully' };
    }

    private maskEmail(email: string) {
        const [name, domain] = email.split('@');
        if (name.length <= 2) return `${name}***@${domain}`;
        return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
    }

    // --- ADMIN: DELETE ALL USERS ---
    async deleteAllUsers() {
        try {
            console.log('[Auth] Deleting all users...');

            // First, count how many users exist
            const count = await this.prisma.user.count();
            console.log(`[Auth] Found ${count} users to delete`);

            if (count === 0) {
                return { success: true, count: 0, message: 'No users to delete' };
            }

            // Delete all users from database
            const result = await this.prisma.user.deleteMany({});

            console.log(`[Auth] Deleted ${result.count} users`);
            return { success: true, count: result.count, message: `Deleted ${result.count} users` };
        } catch (error) {
            console.error('[Auth] Error deleting users:', error);
            console.error('[Auth] Error details:', JSON.stringify(error, null, 2));
            throw new BadRequestException(`Failed to delete users: ${error.message}`);
        }
    }
}
