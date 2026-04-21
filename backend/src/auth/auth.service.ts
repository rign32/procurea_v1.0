import { Injectable, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { EmailService } from '../email/email.service';
import { SalesOpsService } from '../sales-ops/sales-ops.service';
import { ObservabilityService } from '../observability/observability.service';
import { RedisService } from './redis.service';
import { isBlockedEmailDomain } from './email-domain-blocklist';
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
        @Inject(forwardRef(() => SalesOpsService)) private salesOps: SalesOpsService,
        private observability: ObservabilityService,
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
                },
                rbacRole: {
                    select: { id: true, name: true, displayName: true, permissions: true }
                },
            }
        });
    }

    async validateUserByProvider(email: string, provider: string, ssoId?: string, name?: string, language?: string, utmData?: Record<string, string>): Promise<{ user: any; isNewUser: boolean }> {
        let user = await this.prisma.user.findUnique({
            where: { email },
        });

        let isNewUser = false;
        if (user) {
            // Auto-correct language on every login based on origin domain
            if (language && user.language !== language) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { language },
                });
                user = { ...user, language };
                console.log(`[AUTH] Updated language for ${email}: ${user.language} → ${language}`);
            }
        }
        if (!user) {
            isNewUser = true;

            // Auto-discovery: check if an org with this domain already exists
            // Skip for public/free email domains (gmail.com, etc.) — each such user is standalone
            const domain = email.split('@')[1];
            const isPublicDomain = isBlockedEmailDomain(email);
            const existingOrg = isPublicDomain ? null : await this.prisma.organization.findFirst({
                where: { domain },
                select: { id: true, name: true, plan: true, users: { select: { id: true } } },
            });

            if (existingOrg) {
                // 2nd+ user from same domain — join existing org
                const newUser = await this.prisma.user.create({
                    data: {
                        email,
                        name: name || email.split('@')[0],
                        ssoProvider: provider,
                        ssoId: ssoId,
                        role: 'USER',
                        organizationId: existingOrg.id,
                        searchCredits: 0, // No personal trial credits
                        onboardingCompleted: true,
                        ...(language ? { language } : {}),
                    },
                });
                user = newUser;

                // Add +3 credits to org shared pool — only for paid plans (not trial)
                if (existingOrg.plan && existingOrg.plan !== 'research') {
                    await this.prisma.$transaction(async (tx) => {
                        await tx.organization.update({
                            where: { id: existingOrg.id },
                            data: { searchCredits: { increment: 3 } },
                        });
                        const updatedOrg = await tx.organization.findUnique({
                            where: { id: existingOrg.id },
                            select: { searchCredits: true },
                        });
                        await tx.orgCreditTransaction.create({
                            data: {
                                organizationId: existingOrg.id,
                                userId: newUser.id,
                                amount: 3,
                                type: 'MEMBER_BONUS',
                                description: `New team member: ${email}`,
                                balanceAfter: updatedOrg?.searchCredits ?? 0,
                            },
                        });
                    });
                    console.log(`[AUTH] +3 bonus credits for paid org ${existingOrg.name}`);
                }

                // Create sharing preferences (disabled) for every existing member <-> new user
                const existingMembers = existingOrg.users.filter(u => u.id !== newUser.id);
                if (existingMembers.length > 0) {
                    const sharingPrefs = existingMembers.flatMap(member => [
                        { fromUserId: newUser.id, toUserId: member.id, enabled: false, updatedAt: new Date() },
                        { fromUserId: member.id, toUserId: newUser.id, enabled: false, updatedAt: new Date() },
                    ]);
                    await this.prisma.userSharingPreference.createMany({ data: sharingPrefs });
                }

                console.log(`[AUTH] Auto-discovered org ${existingOrg.name} for ${email} (plan: ${existingOrg.plan})`);
            } else if (isPublicDomain) {
                // Public email (gmail, etc.) — no org, personal credits only
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name: name || email.split('@')[0],
                        ssoProvider: provider,
                        ssoId: ssoId,
                        role: 'USER',
                        onboardingCompleted: true,
                        ...(language ? { language } : {}),
                    },
                });

                await this.prisma.creditTransaction.create({
                    data: {
                        userId: user.id,
                        amount: 10,
                        type: 'TRIAL_GRANT',
                        description: 'Trial — 10 free searches',
                        balanceAfter: 10,
                    },
                });

                console.log(`[AUTH] Public email ${email} — personal credits, no org`);
            } else {
                // First user from corporate domain — auto-create org
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name: name || email.split('@')[0],
                        ssoProvider: provider,
                        ssoId: ssoId,
                        role: 'USER',
                        onboardingCompleted: true,
                        ...(language ? { language } : {}),
                    },
                });

                // Race condition guard: check if org was created concurrently
                const existingDomainOrg = await this.prisma.organization.findFirst({
                    where: { domain },
                });

                let orgId: string;
                if (existingDomainOrg) {
                    orgId = existingDomainOrg.id;
                    console.log(`[AUTH] User ${email} joining existing org ${existingDomainOrg.name} (race condition)`);
                } else {
                    const org = await this.prisma.organization.create({
                        data: {
                            name: domain,
                            domain,
                            users: { connect: { id: user.id } },
                        },
                    });
                    orgId = org.id;
                    console.log(`[AUTH] Auto-created org "${domain}" for ${email}`);
                }

                // Connect user to org + transfer trial credits to org pool
                const userId = user.id;
                const userCredits = user.searchCredits || 10;
                await this.prisma.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { id: userId },
                        data: { organizationId: orgId, searchCredits: 0 },
                    });
                    await tx.organization.update({
                        where: { id: orgId },
                        data: { searchCredits: { increment: userCredits } },
                    });
                    await tx.creditTransaction.create({
                        data: {
                            userId,
                            amount: 10,
                            type: 'TRIAL_GRANT',
                            description: 'Trial — 10 free searches',
                            balanceAfter: 0,
                        },
                    });
                    const updatedOrg = await tx.organization.findUnique({
                        where: { id: orgId },
                        select: { searchCredits: true },
                    });
                    await tx.orgCreditTransaction.create({
                        data: {
                            organizationId: orgId,
                            userId,
                            amount: userCredits,
                            type: 'TRIAL_GRANT',
                            description: 'Trial — initial org credit pool',
                            balanceAfter: updatedOrg?.searchCredits ?? 0,
                        },
                    });
                });

                // Re-read user with updated org
                user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
            }

            // Ensure default sequence template exists for new users
            await this.ensureDefaultSequenceTemplate(language || 'pl');
        } else {
            // Update existing user with SSO info if missing
            if (!user.ssoProvider) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { ssoProvider: provider, ssoId: ssoId },
                });
            }
        }

        // Sales Ops: notify Attio + Slack about new registration
        if (isNewUser) {
            try {
                const domain = email.split('@')[1];
                await this.salesOps.handleRegistration({
                    email,
                    name: user!.name || email.split('@')[0],
                    firstName: name?.split(' ')[0],
                    lastName: name?.split(' ').slice(1).join(' '),
                    companyDomain: domain,
                    utmData,
                    language: user!.language,
                });
            } catch (e) {
                console.warn(`[AUTH] Sales ops registration notification failed: ${e.message}`);
            }
        }

        return { user, isNewUser };
    }

    async startEmailLogin(email: string, language?: string, utmData?: Record<string, string>) {
        const { user, isNewUser } = await this.validateUserByProvider(email, 'email', undefined, undefined, language, utmData);
        const magicCode = crypto.randomInt(100000, 999999).toString();

        // Store magic code in Redis (10 minute TTL)
        await this.redisService.setMagicCode(email, magicCode, user.id, 600);

        // Send real email via Resend (locale-aware)
        // Priority: request language (from frontend domain) > user's saved language > 'pl'
        const locale = language || user.language || 'pl';
        await this.emailService.sendMagicLink(email, magicCode, locale);

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
            this.observability.recordEvent('auth', 'login_failed', 'warning', {
                title: 'Nieudane logowanie — zły kod weryfikacji',
                userEmail: email,
            }).catch(() => {});
            throw new BadRequestException('Invalid or expired verification code');
        }

        // Get user data
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true }
                },
                rbacRole: {
                    select: { id: true, name: true, displayName: true, permissions: true }
                },
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

    private async ensureDefaultSequenceTemplate(language: string) {
        const existing = await this.prisma.sequenceTemplate.findFirst({
            where: { isSystem: true },
        });
        if (existing) return;

        const isEn = language === 'en';
        await this.prisma.sequenceTemplate.create({
            data: {
                name: isEn ? 'Standard RFQ Sequence' : 'Standardowa Sekwencja RFQ',
                isSystem: true,
                steps: {
                    create: [
                        {
                            dayOffset: 0,
                            type: 'INITIAL',
                            subject: isEn ? 'Request for Quotation: {{Product_Name}}' : 'Zapytanie Ofertowe: {{Product_Name}}',
                            bodySnippet: isEn
                                ? 'Dear Sir or Madam,\n\nWe would like to request a quotation for {{Product_Name}}.\n\nBest regards,\n{{Sender_Name}}\n{{Sender_Company}}'
                                : 'Dzień dobry,\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                        {
                            dayOffset: 3,
                            type: 'REMINDER',
                            subject: isEn ? 'Reminder: RFQ {{Product_Name}}' : 'Przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: isEn
                                ? 'Dear Sir or Madam,\n\nThis is a friendly reminder regarding our request for quotation for {{Product_Name}}.\n\nAre you planning to submit a quote?\n\nBest regards,\n{{Sender_Name}}'
                                : 'Dzień dobry,\n\nPrzypominamy o naszym zapytaniu ofertowym dotyczącym {{Product_Name}}.\n\nCzy planują Państwo złożyć ofertę?\n\nZ poważaniem,\n{{Sender_Name}}',
                        },
                        {
                            dayOffset: 7,
                            type: 'FINAL',
                            subject: isEn ? 'Final Reminder: RFQ {{Product_Name}}' : 'Ostatnie przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: isEn
                                ? 'Dear Sir or Madam,\n\nThis is our final reminder regarding the request for quotation for {{Product_Name}}.\n\nPlease respond by the end of the week.\n\nBest regards,\n{{Sender_Name}}'
                                : 'Dzień dobry,\n\nTo nasze ostatnie przypomnienie dotyczące zapytania na {{Product_Name}}.\n\nProsimy o odpowiedź do końca tygodnia.\n\nZ poważaniem,\n{{Sender_Name}}',
                        },
                    ],
                },
            },
        });
        console.log('[AUTH] Default sequence template created');
    }

    // DEPRECATED: beta — onboarding skipped at registration. Kept for backward compat.
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

        let orgId = user.organizationId;

        if (orgId) {
            // User already has an org (auto-discovered by domain) — shortened onboarding
            // Skip org creation, just update user profile
            console.log(`[ONBOARDING] User ${user.email} already in org ${orgId}, shortened flow`);
        } else if (isBlockedEmailDomain(user.email)) {
            // Public/free email domain (gmail.com, etc.) — NO org creation
            // Credits stay on user.searchCredits (personal wallet)
            console.log(`[ONBOARDING] Public email ${user.email} — skipping org creation, credits stay personal`);
        } else {
            const domain = user.email.split('@')[1];

            // Race condition fix: check if another user from same domain
            // already created an org (e.g. both registered before either onboarded)
            const existingDomainOrg = await this.prisma.organization.findFirst({
                where: { domain },
            });

            if (existingDomainOrg) {
                // Org already exists — join it instead of creating duplicate
                orgId = existingDomainOrg.id;
                console.log(`[ONBOARDING] User ${user.email} joining existing org ${existingDomainOrg.name} (domain: ${domain})`);
            } else {
                // First user from this domain — create org with locations
                const locationsToCreate = (data.locations || []).map((loc, i) => ({
                    ...loc,
                    isDefault: i === 0,
                }));
                const resolvedCompanyName = data.companyName || user.email.split('@')[0];
                const org = await this.prisma.organization.create({
                    data: {
                        name: resolvedCompanyName,
                        domain,
                        users: { connect: { id: userId } },
                        locations: {
                            create: locationsToCreate
                        }
                    }
                });
                orgId = org.id;

                // Transfer trial credits from user to org pool
                await this.prisma.$transaction(async (tx) => {
                    const userCredits = user.searchCredits || 10;
                    await tx.organization.update({
                        where: { id: org.id },
                        data: { searchCredits: userCredits },
                    });
                    await tx.user.update({
                        where: { id: userId },
                        data: { searchCredits: 0 },
                    });
                    await tx.orgCreditTransaction.create({
                        data: {
                            organizationId: org.id,
                            userId,
                            amount: userCredits,
                            type: 'TRIAL_GRANT',
                            description: 'Trial — initial org credit pool',
                            balanceAfter: userCredits,
                        },
                    });
                });

                console.log(`[ONBOARDING] Created org ${org.name} (domain: ${domain}) for ${user.email}`);
            }
        }

        // Update User Profile
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.name,
                jobTitle: data.jobTitle,
                language: data.language || 'pl',
                companyName: data.companyName || user.email.split('@')[0],
                organizationId: orgId,
                onboardingCompleted: true,
            },
        });

        // Ensure default sequence template exists
        await this.ensureDefaultSequenceTemplate(data.language || 'pl');

        return updatedUser;
    }

    async sendAccountReminder(phone: string) {
        const user = await this.prisma.user.findFirst({
            where: { phone, isPhoneVerified: true },
        });

        if (user) {
            const isEn = user.language === 'en';
            const frontendUrl = isEn
                ? (this.configService.get<string>('FRONTEND_URL_EN') || 'https://app.procurea.io')
                : (this.configService.get<string>('FRONTEND_URL') || 'https://app.procurea.pl');
            const message = isEn
                ? `A Procurea account is linked to this number: ${user.email}. If this wasn't you, please change your password or secure your account: ${frontendUrl}/auth/settings`
                : `Konto Procurea powiązane z tym numerem: ${user.email}. Jeśli to nie Ty próbujesz się rejestrować, zmień hasło lub zabezpiecz konto: ${frontendUrl}/auth/settings`;
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

    async acknowledgeTrialEnded(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { trialEndedAcknowledgedAt: new Date() },
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

    // --- USER PROFILE UPDATE ---
    async updateProfile(userId: string, data: { name?: string; phone?: string; jobTitle?: string; companyName?: string }) {
        // Strip phone from update if user's phone is already verified
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.isPhoneVerified && data.phone) {
            delete data.phone;
        }

        // Check phone uniqueness if changing
        if (data.phone) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    phone: data.phone,
                    NOT: { id: userId },
                },
            });

            if (existingUser) {
                throw new ConflictException('Phone number already in use');
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

    // --- STAGING AUTO-LOGIN ---
    async autoLoginStaging(language: string = 'pl'): Promise<any> {
        const isEnglish = language === 'en';
        const stagingEmail = isEnglish ? 'staging-en@procurea.dev' : 'staging@procurea.dev';
        const userName = isEnglish ? 'Staging Tester EN' : 'Staging Tester';
        const orgName = isEnglish ? 'Procurea Staging EN' : 'Procurea Staging';
        const locationAddress = isEnglish
            ? '123 Test Street, London, UK'
            : 'ul. Testowa 1, 00-001 Warszawa';

        const existing = await this.prisma.user.findUnique({
            where: { email: stagingEmail },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });

        if (existing) {
            // Always refresh staging user fields for testing
            await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    trialCreditsUsed: true,
                    searchCredits: Math.max(existing.searchCredits, 50),
                }
            });

            if (existing.organization) {
                const orgPlan = isEnglish ? 'pay_as_you_go' : (existing.organization.plan || 'research');
                await this.prisma.organization.update({
                    where: { id: existing.organization.id },
                    data: {
                        trialCreditsUsed: true,
                        searchCredits: Math.max(existing.organization.searchCredits ?? 0, 50),
                        plan: orgPlan,
                        domain: existing.organization.domain || 'procurea.dev',
                    }
                });
            }

            // Ensure staging user has an organization
            if (!existing.organizationId) {
                console.log(`[STAGING] Staging user (${language}) missing org, creating...`);
                const org = await this.prisma.organization.create({
                    data: {
                        name: orgName,
                        domain: 'procurea.dev',
                        searchCredits: 50,
                        trialCreditsUsed: true,
                        plan: isEnglish ? 'pay_as_you_go' : 'research',
                        locations: {
                            create: [{
                                name: 'HQ',
                                address: locationAddress,
                                isDefault: true,
                            }]
                        }
                    }
                });
                await this.prisma.user.update({
                    where: { id: existing.id },
                    data: { organizationId: org.id },
                });
                console.log(`[STAGING] Linked org ${org.id} to staging user (${language})`);
            }

            return this.prisma.user.findUnique({
                where: { id: existing.id },
                include: { organization: { include: { locations: true } }, rbacRole: { select: { id: true, name: true, displayName: true, permissions: true } } }
            });
        }

        // Create staging user with completed onboarding
        const created = await this.prisma.user.create({
            data: {
                email: stagingEmail,
                name: userName,
                role: 'ADMIN',
                ssoProvider: 'staging',
                isPhoneVerified: true,
                phoneVerifiedAt: new Date(),
                onboardingCompleted: true,
                companyName: orgName,
                jobTitle: 'QA Tester',
                language,
                searchCredits: 50,
                trialCreditsUsed: true, // Staging user sees billing
            },
        });

        await this.prisma.organization.create({
            data: {
                name: orgName,
                domain: 'procurea.dev',
                searchCredits: 50,
                trialCreditsUsed: true,
                plan: isEnglish ? 'pay_as_you_go' : 'research',
                users: { connect: { id: created.id } },
                locations: {
                    create: [{
                        name: 'HQ',
                        address: locationAddress,
                        isDefault: true,
                    }]
                }
            }
        });

        console.log(`[STAGING] Created staging user (${language}): ${stagingEmail}`);

        return this.prisma.user.findUnique({
            where: { id: created.id },
            include: {
                organization: {
                    include: { locations: true }
                },
                rbacRole: {
                    select: { id: true, name: true, displayName: true, permissions: true }
                },
            }
        });
    }

    // --- DEV AUTO-LOGIN (local development only) ---
    async autoLoginDev(): Promise<any> {
        const devEmail = 'dev@procurea.local';

        const existing = await this.prisma.user.findUnique({
            where: { email: devEmail },
            include: {
                organization: {
                    include: { locations: true }
                }
            }
        });

        if (existing) {
            await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    searchCredits: 9999,
                    trialCreditsUsed: true,
                    onboardingCompleted: true,
                    isPhoneVerified: true,
                    plan: 'full',
                }
            });

            if (existing.organization) {
                await this.prisma.organization.update({
                    where: { id: existing.organization.id },
                    data: {
                        searchCredits: 9999,
                        trialCreditsUsed: true,
                        plan: 'full',
                    }
                });
            }

            if (!existing.organizationId) {
                const org = await this.prisma.organization.create({
                    data: {
                        name: 'Procurea Dev',
                        domain: 'procurea.local',
                        searchCredits: 9999,
                        trialCreditsUsed: true,
                        plan: 'full',
                        locations: {
                            create: [{
                                name: 'HQ',
                                address: 'ul. Developerska 1, 00-001 Warszawa',
                                isDefault: true,
                            }]
                        }
                    }
                });
                await this.prisma.user.update({
                    where: { id: existing.id },
                    data: { organizationId: org.id },
                });
            }

            return this.prisma.user.findUnique({
                where: { id: existing.id },
                include: { organization: { include: { locations: true } }, rbacRole: { select: { id: true, name: true, displayName: true, permissions: true } } }
            });
        }

        const created = await this.prisma.user.create({
            data: {
                email: devEmail,
                name: 'Dev User',
                role: 'ADMIN',
                ssoProvider: 'dev',
                isPhoneVerified: true,
                phoneVerifiedAt: new Date(),
                onboardingCompleted: true,
                companyName: 'Procurea Dev',
                jobTitle: 'Developer',
                language: 'pl',
                searchCredits: 9999,
                trialCreditsUsed: true,
                plan: 'full',
            },
        });

        await this.prisma.organization.create({
            data: {
                name: 'Procurea Dev',
                domain: 'procurea.local',
                searchCredits: 9999,
                trialCreditsUsed: true,
                plan: 'full',
                users: { connect: { id: created.id } },
                locations: {
                    create: [{
                        name: 'HQ',
                        address: 'ul. Developerska 1, 00-001 Warszawa',
                        isDefault: true,
                    }]
                }
            }
        });

        console.log(`[DEV] Created dev user: ${devEmail}`);

        return this.prisma.user.findUnique({
            where: { id: created.id },
            include: {
                organization: {
                    include: { locations: true }
                },
                rbacRole: {
                    select: { id: true, name: true, displayName: true, permissions: true }
                },
            }
        });
    }

    // --- DEMO MODE ---

    /**
     * Create a temporary demo user with seeded data (campaign, suppliers, RFQ, offers).
     * Returns the user with organization included (same shape as autoLoginStaging).
     */
    async createDemoSession(): Promise<any> {
        const demoId = crypto.randomUUID();
        const demoEmail = `demo-${demoId}@demo.procurea.io`;

        // 1. Create organization
        const org = await this.prisma.organization.create({
            data: {
                name: 'Demo Corp',
                domain: 'demo.procurea.io',
                searchCredits: 99,
                trialCreditsUsed: false,
                plan: 'full',
                locations: {
                    create: [{
                        name: 'HQ',
                        address: 'ul. Demonstracyjna 1, 00-001 Warszawa',
                        isDefault: true,
                    }],
                },
            },
            include: { locations: true },
        });

        // 2. Create demo user
        const user = await this.prisma.user.create({
            data: {
                email: demoEmail,
                name: 'Demo User',
                role: 'USER',
                ssoProvider: 'demo',
                isPhoneVerified: true,
                phoneVerifiedAt: new Date(),
                onboardingCompleted: true,
                companyName: 'Demo Corp',
                jobTitle: 'Procurement Manager',
                language: 'pl',
                searchCredits: 0,
                trialCreditsUsed: false,
                plan: 'full',
                isDemo: true,
                organizationId: org.id,
            },
        });

        // 3. Create a completed campaign with sample suppliers
        const campaign = await this.prisma.campaign.create({
            data: {
                name: 'CNC Machining — Supplier Scouting',
                status: 'COMPLETED',
                stage: 'COMPLETED',
                language: 'pl',
                searchCriteria: JSON.stringify({
                    category: 'CNC Machining',
                    material: 'Aluminum 6061-T6',
                    region: 'EU',
                }),
            },
        });

        // Sample supplier data
        const supplierData = [
            {
                name: 'PrecisionParts GmbH',
                country: 'Germany',
                city: 'Stuttgart',
                website: 'https://precisionparts.de',
                url: 'https://precisionparts.de/cnc',
                specialization: 'CNC Milling & Turning',
                certificates: 'ISO 9001:2015, IATF 16949',
                employeeCount: '120',
                contactEmails: 'sales@precisionparts.de',
                analysisScore: 92,
                companyType: 'PRODUCENT',
            },
            {
                name: 'Pol-Metal Obrobka',
                country: 'Poland',
                city: 'Katowice',
                website: 'https://pol-metal.pl',
                url: 'https://pol-metal.pl/oferta',
                specialization: '5-axis CNC Machining',
                certificates: 'ISO 9001:2015, ISO 14001',
                employeeCount: '85',
                contactEmails: 'biuro@pol-metal.pl',
                analysisScore: 88,
                companyType: 'PRODUCENT',
            },
            {
                name: 'Alpine CNC Solutions',
                country: 'Austria',
                city: 'Graz',
                website: 'https://alpine-cnc.at',
                url: 'https://alpine-cnc.at/services',
                specialization: 'Precision Grinding & Milling',
                certificates: 'ISO 9001:2015, AS9100D',
                employeeCount: '200',
                contactEmails: 'info@alpine-cnc.at',
                analysisScore: 95,
                companyType: 'PRODUCENT',
            },
            {
                name: 'CzechTurn s.r.o.',
                country: 'Czech Republic',
                city: 'Brno',
                website: 'https://czechturn.cz',
                url: 'https://czechturn.cz/capabilities',
                specialization: 'CNC Turning, Anodizing',
                certificates: 'ISO 9001:2015',
                employeeCount: '45',
                contactEmails: 'obchod@czechturn.cz',
                analysisScore: 78,
                companyType: 'PRODUCENT',
            },
            {
                name: 'NordMetal AB',
                country: 'Sweden',
                city: 'Gothenburg',
                website: 'https://nordmetal.se',
                url: 'https://nordmetal.se/machining',
                specialization: 'High-precision CNC, Titanium',
                certificates: 'ISO 9001:2015, ISO 13485, NADCAP',
                employeeCount: '310',
                contactEmails: 'sales@nordmetal.se',
                analysisScore: 97,
                companyType: 'PRODUCENT',
            },
            {
                name: 'SilesiaTech Sp. z o.o.',
                country: 'Poland',
                city: 'Gliwice',
                website: 'https://silesiatech.pl',
                url: 'https://silesiatech.pl/cnc-frezowanie',
                specialization: 'CNC Milling, Surface Treatment',
                certificates: 'ISO 9001:2015',
                employeeCount: '65',
                contactEmails: 'kontakt@silesiatech.pl',
                analysisScore: 82,
                companyType: 'PRODUCENT',
            },
            {
                name: 'BavariaPräzision GmbH',
                country: 'Germany',
                city: 'Munich',
                website: 'https://bavariaprazision.de',
                url: 'https://bavariaprazision.de/leistungen',
                specialization: 'Micro-machining, 5-axis',
                certificates: 'ISO 9001:2015, IATF 16949, NADCAP',
                employeeCount: '175',
                contactEmails: 'anfrage@bavariaprazision.de',
                analysisScore: 93,
                companyType: 'PRODUCENT',
            },
        ];

        const createdSuppliers = await Promise.all(
            supplierData.map((s) =>
                this.prisma.supplier.create({
                    data: {
                        campaignId: campaign.id,
                        url: s.url,
                        name: s.name,
                        country: s.country,
                        city: s.city,
                        website: s.website,
                        specialization: s.specialization,
                        certificates: s.certificates,
                        employeeCount: s.employeeCount,
                        contactEmails: s.contactEmails,
                        analysisScore: s.analysisScore,
                        companyType: s.companyType,
                        companyTypeConfidence: 85,
                        sourceType: 'SEARCH',
                    },
                }),
            ),
        );

        // 4. Create RFQ with offers from the first 4 suppliers
        const rfq = await this.prisma.rfqRequest.create({
            data: {
                campaignId: campaign.id,
                ownerId: user.id,
                status: 'ACTIVE',
                publicId: 'RFQ-DEMO-001',
                productName: 'CNC Machined Housing — Aluminum 6061-T6',
                partNumber: 'DEMO-HSG-001',
                category: 'CNC Machining',
                material: 'Aluminum 6061-T6',
                description: 'Precision-machined housing for electronic enclosure. Tolerances: +/- 0.05mm. Surface finish Ra 1.6. Anodized.',
                targetPrice: 12.50,
                currency: 'EUR',
                quantity: 5000,
                eau: 20000,
                unit: 'pcs',
                incoterms: 'DDP',
                paymentTerms: 'Net 60',
                deliveryLocationId: org.locations[0]?.id,
                offerDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            },
        });

        // Create offers from first 4 suppliers with varied statuses
        const offerConfigs = [
            { supplierIdx: 0, status: 'SUBMITTED', price: 11.80, leadTime: 6, moq: 1000 },
            { supplierIdx: 1, status: 'SUBMITTED', price: 10.50, leadTime: 8, moq: 2000 },
            { supplierIdx: 2, status: 'SUBMITTED', price: 13.20, leadTime: 4, moq: 500 },
            { supplierIdx: 3, status: 'VIEWED', price: null, leadTime: null, moq: null },
        ];

        for (const oc of offerConfigs) {
            await this.prisma.offer.create({
                data: {
                    rfqRequestId: rfq.id,
                    supplierId: createdSuppliers[oc.supplierIdx].id,
                    status: oc.status,
                    price: oc.price,
                    currency: 'EUR',
                    leadTime: oc.leadTime,
                    moq: oc.moq,
                    incotermsConfirmed: oc.status === 'SUBMITTED',
                    specsConfirmed: oc.status === 'SUBMITTED',
                    viewedAt: new Date(),
                    submittedAt: oc.status === 'SUBMITTED' ? new Date() : undefined,
                },
            });
        }

        // 5. Add some campaign logs for realism
        const logMessages = [
            { message: 'Strategy generated: 3 countries, 12 search queries', severity: 'info' },
            { message: 'Scanning phase: 142 URLs collected from search results', severity: 'info' },
            { message: 'Screening: 89 URLs passed relevance filter', severity: 'info' },
            { message: 'Enrichment: 7 suppliers enriched with contact data', severity: 'info' },
            { message: 'Audit: 7 suppliers approved, 0 rejected', severity: 'info' },
            { message: 'Pipeline completed — 7 qualified suppliers found', severity: 'info' },
        ];
        await this.prisma.log.createMany({
            data: logMessages.map((l) => ({
                campaignId: campaign.id,
                message: l.message,
                severity: l.severity,
            })),
        });

        console.log(`[DEMO] Created demo session: ${demoEmail}, org: ${org.id}, campaign: ${campaign.id}`);

        // Return full user object with includes
        return this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                organization: { include: { locations: true } },
                rbacRole: { select: { id: true, name: true, displayName: true, permissions: true } },
            },
        });
    }

    /**
     * Cleanup demo users and all their associated data older than 24 hours.
     */
    async cleanupDemoSessions(): Promise<{ deletedUsers: number; deletedOrgs: number }> {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find demo users older than 24h
        const demoUsers = await this.prisma.user.findMany({
            where: {
                isDemo: true,
                createdAt: { lt: cutoff },
            },
            select: { id: true, email: true, organizationId: true },
        });

        if (demoUsers.length === 0) {
            return { deletedUsers: 0, deletedOrgs: 0 };
        }

        const userIds = demoUsers.map((u) => u.id);
        const orgIds = [...new Set(demoUsers.map((u) => u.organizationId).filter(Boolean))] as string[];

        // Find campaigns owned by these demo users' orgs (through RFQ ownership)
        // We need to find campaigns that have RFQs owned by demo users
        const ownedRfqs = await this.prisma.rfqRequest.findMany({
            where: { ownerId: { in: userIds } },
            select: { id: true, campaignId: true },
        });
        const campaignIds = [...new Set(ownedRfqs.map((r) => r.campaignId).filter(Boolean))] as string[];
        const rfqIds = ownedRfqs.map((r) => r.id);

        // Delete in correct order (respecting foreign key constraints)
        await this.prisma.$transaction(async (tx) => {
            // Offers -> Suppliers -> Logs -> Campaigns
            if (rfqIds.length > 0) {
                await tx.offer.deleteMany({ where: { rfqRequestId: { in: rfqIds } } });
                await tx.rfqRequest.deleteMany({ where: { id: { in: rfqIds } } });
            }
            if (campaignIds.length > 0) {
                await tx.supplier.deleteMany({ where: { campaignId: { in: campaignIds } } });
                await tx.log.deleteMany({ where: { campaignId: { in: campaignIds } } });
                await tx.campaign.deleteMany({ where: { id: { in: campaignIds } } });
            }
            // Refresh tokens, credit transactions
            await tx.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
            await tx.creditTransaction.deleteMany({ where: { userId: { in: userIds } } });
            // Users
            await tx.user.deleteMany({ where: { id: { in: userIds } } });
            // Orgs (only demo orgs with domain demo.procurea.io)
            if (orgIds.length > 0) {
                // Check no non-demo users remain in these orgs
                const remainingUsers = await tx.user.count({
                    where: { organizationId: { in: orgIds }, isDemo: false },
                });
                if (remainingUsers === 0) {
                    await tx.organizationLocation.deleteMany({ where: { organizationId: { in: orgIds } } });
                    await tx.orgCreditTransaction.deleteMany({ where: { organizationId: { in: orgIds } } });
                    await tx.organization.deleteMany({ where: { id: { in: orgIds } } });
                }
            }
        });

        console.log(`[DEMO] Cleanup: deleted ${demoUsers.length} demo users, ${orgIds.length} orgs`);
        return { deletedUsers: demoUsers.length, deletedOrgs: orgIds.length };
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
