import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SalesOpsService } from '../sales-ops/sales-ops.service';
import { ObservabilityService } from '../observability/observability.service';
import Stripe from 'stripe';

const CREDIT_PACKS: Record<string, { credits: number; priceNet: number; label: string; priceNetUsd: number; labelEn: string }> = {
    pack_10: { credits: 10, priceNet: 14900, label: '10 wyszukiwań', priceNetUsd: 8900,  labelEn: '10 searches' },
    pack_25: { credits: 25, priceNet: 29900, label: '25 wyszukiwań', priceNetUsd: 19900, labelEn: '25 searches' },
    pack_50: { credits: 50, priceNet: 49900, label: '50 wyszukiwań', priceNetUsd: 29900, labelEn: '50 searches' },
};

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private stripe: Stripe | null = null;
    private vatTaxRateId: string | null = null;
    private portalConfigId: string | null = null;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        @Inject(forwardRef(() => SalesOpsService)) private salesOps: SalesOpsService,
        private observability: ObservabilityService,
    ) {
        // Production uses STRIPE_LIVE_SECRET_KEY, staging falls back to STRIPE_SECRET_KEY (sandbox)
        const isStaging = !!this.configService.get('DATABASE_URL_STAGING');
        const apiKey = isStaging
            ? this.configService.get<string>('STRIPE_SECRET_KEY')
            : (this.configService.get<string>('STRIPE_LIVE_SECRET_KEY') || this.configService.get<string>('STRIPE_SECRET_KEY'));

        if (apiKey) {
            this.stripe = new Stripe(apiKey);
            this.logger.log(`Stripe initialized (${isStaging ? 'sandbox' : 'live'})`);
        } else {
            this.logger.warn('STRIPE_SECRET_KEY not configured — billing disabled');
        }
    }

    private ensureStripe(): Stripe {
        if (!this.stripe) throw new BadRequestException('Płatności nie są skonfigurowane');
        return this.stripe;
    }

    // --- VAT Tax Rate ---

    private async getVatTaxRateId(): Promise<string> {
        if (this.vatTaxRateId) return this.vatTaxRateId;

        const stripe = this.ensureStripe();
        const existing = await stripe.taxRates.list({ limit: 50 });
        const polish23 = existing.data.find(
            tr => tr.percentage === 23 && tr.country === 'PL' && tr.active,
        );

        if (polish23) {
            this.vatTaxRateId = polish23.id;
            return polish23.id;
        }

        const taxRate = await stripe.taxRates.create({
            display_name: 'VAT',
            description: 'Polski VAT 23%',
            percentage: 23,
            country: 'PL',
            inclusive: false,
            jurisdiction: 'PL',
        });

        this.vatTaxRateId = taxRate.id;
        this.logger.log(`Created VAT tax rate: ${taxRate.id}`);
        return taxRate.id;
    }

    // --- Stripe Customer ---

    private async getOrCreateCustomer(userId: string): Promise<string> {
        const stripe = this.ensureStripe();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true, email: true, name: true, companyName: true },
        });

        if (!user) throw new BadRequestException('Użytkownik nie znaleziony');

        if (user.stripeCustomerId) return user.stripeCustomerId;

        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: { userId, companyName: user.companyName || '' },
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
        });

        this.logger.log(`Created Stripe customer ${customer.id} for user ${userId}`);
        return customer.id;
    }

    // --- Helpers ---

    private getFrontendUrl(lang?: string): string {
        // Staging detection: DATABASE_URL_STAGING is only set for apiStaging Cloud Function
        if (process.env.DATABASE_URL_STAGING) {
            return lang === 'en'
                ? 'https://procurea-app-staging-en.web.app'
                : 'https://procurea-app-staging.web.app';
        }
        if (lang === 'en') {
            return this.configService.get<string>('FRONTEND_URL_EN') || 'https://app.procurea.io';
        }
        return this.configService.get<string>('FRONTEND_URL') || 'https://app.procurea.pl';
    }

    private async getUserLanguage(userId: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { language: true },
        });
        return user?.language || 'pl';
    }

    // --- Checkout Sessions ---

    async createCreditCheckout(userId: string, packId: string): Promise<{ url: string }> {
        const pack = CREDIT_PACKS[packId];
        if (!pack) throw new BadRequestException(`Nieznany pakiet: ${packId}`);

        const stripe = this.ensureStripe();
        const customerId = await this.getOrCreateCustomer(userId);
        const lang = await this.getUserLanguage(userId);
        const isEn = lang === 'en';

        const frontendUrl = this.getFrontendUrl(lang);

        const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: isEn ? 'usd' : 'pln',
                product_data: {
                    name: isEn ? `Pack: ${pack.labelEn}` : `Pakiet: ${pack.label}`,
                    description: isEn
                        ? `${pack.credits} supplier ${pack.credits === 1 ? 'search' : 'searches'}`
                        : `${pack.credits} ${pack.credits === 1 ? 'wyszukiwanie dostawców' : 'wyszukiwań dostawców'}`,
                },
                unit_amount: isEn ? pack.priceNetUsd : pack.priceNet,
            },
            quantity: 1,
        };

        // Polish VAT for PLN payments, Stripe automatic tax for international (USD)
        if (!isEn) {
            const vatRateId = await this.getVatTaxRateId();
            lineItem.tax_rates = [vatRateId];
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            locale: isEn ? 'en' : 'pl',
            line_items: [lineItem],
            invoice_creation: { enabled: true },
            billing_address_collection: 'required',
            customer_update: { address: 'auto', name: 'auto' },
            ...(!isEn && {
                custom_fields: [{
                    key: 'nip',
                    label: { type: 'custom' as const, custom: 'NIP' },
                    type: 'text' as const,
                    optional: true,
                }],
            }),
            ...(isEn && { automatic_tax: { enabled: true } }),
            metadata: {
                userId,
                packId,
                credits: String(pack.credits),
                type: 'credit_purchase',
            },
            success_url: `${frontendUrl}/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/settings?billing=canceled`,
        });

        if (!session.url) throw new BadRequestException(isEn ? 'Failed to create checkout session' : 'Nie udało się utworzyć sesji płatności');

        this.observability.recordEvent('conversion', 'checkout_started', 'info', {
            title: `Checkout started: ${packId}`,
            userId,
            metadata: { packId, credits: pack.credits },
        }).catch(() => {});

        return { url: session.url };
    }

    async createSubscriptionCheckout(userId: string): Promise<{ url: string }> {
        const stripe = this.ensureStripe();
        const customerId = await this.getOrCreateCustomer(userId);
        const lang = await this.getUserLanguage(userId);
        const isEn = lang === 'en';

        // Check if org already has an active subscription
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });
        if (user?.organizationId) {
            const org = await this.prisma.organization.findUnique({
                where: { id: user.organizationId },
                select: { stripeSubscriptionId: true, plan: true },
            });
            if (org?.plan === 'unlimited' && org.stripeSubscriptionId) {
                throw new BadRequestException(isEn ? 'Your organization already has an active subscription' : 'Twoja organizacja ma już aktywną subskrypcję');
            }
        }

        // Production uses STRIPE_LIVE_PRICE_ID*, staging uses STRIPE_UNLIMITED_PRICE_ID*
        const isStaging = !!this.configService.get('DATABASE_URL_STAGING');
        const priceId = isEn
            ? (isStaging
                ? this.configService.get<string>('STRIPE_UNLIMITED_PRICE_ID_USD')
                : (this.configService.get<string>('STRIPE_LIVE_PRICE_ID_USD') || this.configService.get<string>('STRIPE_UNLIMITED_PRICE_ID_USD')))
            : (isStaging
                ? this.configService.get<string>('STRIPE_UNLIMITED_PRICE_ID')
                : (this.configService.get<string>('STRIPE_LIVE_PRICE_ID') || this.configService.get<string>('STRIPE_UNLIMITED_PRICE_ID')));
        if (!priceId) throw new BadRequestException(isEn ? 'Subscription not configured' : 'Subskrypcja nie jest skonfigurowana');

        const frontendUrl = this.getFrontendUrl(lang);

        const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price: priceId,
            quantity: 1,
        };

        if (!isEn) {
            const vatRateId = await this.getVatTaxRateId();
            lineItem.tax_rates = [vatRateId];
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            locale: isEn ? 'en' : 'pl',
            line_items: [lineItem],
            billing_address_collection: 'required',
            customer_update: { address: 'auto', name: 'auto' },
            ...(!isEn && {
                custom_fields: [{
                    key: 'nip',
                    label: { type: 'custom' as const, custom: 'NIP' },
                    type: 'text' as const,
                    optional: true,
                }],
            }),
            ...(isEn && { automatic_tax: { enabled: true } }),
            metadata: {
                userId,
                organizationId: user?.organizationId || '',
                type: 'unlimited_subscription',
            },
            subscription_data: {
                metadata: { userId, organizationId: user?.organizationId || '' },
            },
            success_url: `${frontendUrl}/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/settings?billing=canceled`,
        });

        if (!session.url) throw new BadRequestException('Nie udało się utworzyć sesji płatności');

        this.observability.recordEvent('conversion', 'checkout_started', 'info', {
            title: 'Checkout started: unlimited subscription',
            userId,
            metadata: { planId: 'unlimited' },
        }).catch(() => {});

        return { url: session.url };
    }

    // --- Verify & Fulfill (webhook-independent) ---

    async verifyAndFulfillSession(userId: string, sessionId: string): Promise<{ fulfilled: boolean; credits?: number; plan?: string }> {
        const stripe = this.ensureStripe();

        let session: Stripe.Checkout.Session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
        } catch {
            throw new BadRequestException('Invalid session ID');
        }

        // Ownership validation
        if (session.metadata?.userId !== userId) {
            throw new BadRequestException('Session does not belong to this user');
        }

        // Check payment status
        if (session.payment_status !== 'paid') {
            return { fulfilled: false };
        }

        // Idempotency: check if already processed
        const existing = await this.prisma.creditTransaction.findFirst({
            where: { stripeSessionId: session.id },
        });

        if (existing) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { searchCredits: true, plan: true },
            });
            return { fulfilled: true, credits: user?.searchCredits, plan: user?.plan };
        }

        // Fulfill using existing logic
        await this.handleCheckoutCompleted(session);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { searchCredits: true, plan: true },
        });

        this.logger.log(`Verified and fulfilled session ${sessionId} for user ${userId}`);
        return { fulfilled: true, credits: user?.searchCredits, plan: user?.plan };
    }

    // --- Webhook ---

    async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
        const stripe = this.ensureStripe();
        const isStaging = !!this.configService.get('DATABASE_URL_STAGING');
        const webhookSecret = isStaging
            ? this.configService.get<string>('STRIPE_WEBHOOK_SECRET')
            : (this.configService.get<string>('STRIPE_LIVE_WEBHOOK_SECRET') || this.configService.get<string>('STRIPE_WEBHOOK_SECRET'));
        if (!webhookSecret) throw new BadRequestException('Webhook secret not configured');

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException('Invalid webhook signature');
        }

        this.logger.log(`Webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const userId = session.metadata?.userId;
        const type = session.metadata?.type;
        if (!userId) {
            this.logger.warn('Checkout session without userId in metadata');
            return;
        }

        // Idempotency: check if already processed
        const existing = await this.prisma.creditTransaction.findFirst({
            where: { stripeSessionId: session.id },
        });
        if (existing) {
            this.logger.log(`Session ${session.id} already processed, skipping`);
            return;
        }

        if (type === 'credit_purchase') {
            const credits = parseInt(session.metadata?.credits || '0', 10);
            const packId = session.metadata?.packId || 'unknown';
            const pack = CREDIT_PACKS[packId];

            if (credits <= 0) {
                this.logger.warn(`Invalid credits count for session ${session.id}`);
                return;
            }

            await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.update({
                    where: { id: userId },
                    data: {
                        searchCredits: { increment: credits },
                        plan: 'pay_as_you_go',
                    },
                });

                await tx.creditTransaction.create({
                    data: {
                        userId,
                        amount: credits,
                        type: 'PURCHASE',
                        description: pack ? `Pakiet: ${pack.label}` : `${credits} kredytów`,
                        stripeSessionId: session.id,
                        balanceAfter: user.searchCredits,
                    },
                });
            });

            this.logger.log(`Added ${credits} credits to user ${userId} (session: ${session.id})`);

            // Sales Ops: notify Attio + Slack about credit purchase
            try {
                const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
                if (u) {
                    await this.salesOps.handleStripeCheckout({
                        email: u.email,
                        name: u.name || u.email,
                        amount: session.amount_total || 0,
                        currency: session.currency || 'pln',
                        plan: `${credits} credits`,
                    });
                }
            } catch (e) { this.logger.warn(`Sales ops notification failed: ${e.message}`); }

        } else if (type === 'unlimited_subscription') {
            const subscriptionId = session.subscription as string;
            const organizationId = session.metadata?.organizationId;

            // Subscription is org-wide
            if (organizationId) {
                await this.prisma.$transaction(async (tx) => {
                    await tx.organization.update({
                        where: { id: organizationId },
                        data: {
                            plan: 'unlimited',
                            stripeSubscriptionId: subscriptionId,
                            subscriptionCancelAtPeriodEnd: false,
                        },
                    });

                    // Also keep user-level plan in sync (backward compat)
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            plan: 'unlimited',
                            stripeSubscriptionId: subscriptionId,
                            subscriptionCancelAtPeriodEnd: false,
                        },
                    });

                    const org = await tx.organization.findUnique({
                        where: { id: organizationId },
                        select: { searchCredits: true },
                    });

                    await tx.orgCreditTransaction.create({
                        data: {
                            organizationId,
                            userId,
                            amount: 0,
                            type: 'SUBSCRIPTION_GRANT',
                            description: 'Subskrypcja: Bez limitu (org-wide)',
                            stripeSessionId: session.id,
                            balanceAfter: org?.searchCredits ?? 0,
                        },
                    });
                });

                this.logger.log(`Org ${organizationId} upgraded to unlimited plan by user ${userId}`);

                // Sales Ops: notify about subscription
                try {
                    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
                    if (u) {
                        await this.salesOps.handleSubscriptionCreated({
                            email: u.email,
                            name: u.name || u.email,
                            amount: session.amount_total || 0,
                            currency: session.currency || 'pln',
                            subscriptionId: subscriptionId,
                        });
                    }
                } catch (e) { this.logger.warn(`Sales ops notification failed: ${e.message}`); }

            } else {
                // Fallback: user without org (shouldn't happen, but safe)
                await this.prisma.$transaction(async (tx) => {
                    const user = await tx.user.update({
                        where: { id: userId },
                        data: {
                            plan: 'unlimited',
                            stripeSubscriptionId: subscriptionId,
                            subscriptionCancelAtPeriodEnd: false,
                        },
                    });

                    await tx.creditTransaction.create({
                        data: {
                            userId,
                            amount: 0,
                            type: 'SUBSCRIPTION_GRANT',
                            description: 'Subskrypcja: Bez limitu',
                            stripeSessionId: session.id,
                            balanceAfter: user.searchCredits,
                        },
                    });
                });

                this.logger.log(`User ${userId} upgraded to unlimited plan (no org)`);

                // Sales Ops: notify about subscription (no org)
                try {
                    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
                    if (u) {
                        await this.salesOps.handleSubscriptionCreated({
                            email: u.email,
                            name: u.name || u.email,
                            amount: session.amount_total || 0,
                            currency: session.currency || 'pln',
                            subscriptionId: subscriptionId,
                        });
                    }
                } catch (e) { this.logger.warn(`Sales ops notification failed: ${e.message}`); }
            }
        }
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata?.userId;
        const organizationId = subscription.metadata?.organizationId;
        if (!userId) {
            this.logger.warn('Subscription updated without userId in metadata');
            return;
        }

        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        const status = subscription.status;

        if (status === 'active') {
            // Update org-level if available
            if (organizationId) {
                await this.prisma.organization.update({
                    where: { id: organizationId },
                    data: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd },
                });
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd },
            });
            this.logger.log(`Subscription updated: cancel_at_period_end=${cancelAtPeriodEnd} (user: ${userId}, org: ${organizationId})`);
        } else if (status === 'past_due' || status === 'unpaid') {
            this.logger.warn(`Subscription status: ${status} (user: ${userId}, org: ${organizationId})`);
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata?.userId;
        const organizationId = subscription.metadata?.organizationId;
        if (!userId) {
            this.logger.warn('Subscription deleted without userId in metadata');
            return;
        }

        // Revert org-level
        if (organizationId) {
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: {
                    plan: 'research',
                    stripeSubscriptionId: null,
                    subscriptionCancelAtPeriodEnd: false,
                },
            });
        }

        // Revert user-level (backward compat)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'research',
                stripeSubscriptionId: null,
                subscriptionCancelAtPeriodEnd: false,
            },
        });

        this.logger.log(`Subscription canceled, reverted to research plan (user: ${userId}, org: ${organizationId})`);

        // Sales Ops: notify about cancellation
        try {
            const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
            if (u) {
                await this.salesOps.handleSubscriptionDeleted({ email: u.email, name: u.name || u.email });
            }
        } catch (e) { this.logger.warn(`Sales ops notification failed: ${e.message}`); }
    }

    // --- Billing Info ---

    async getUserBillingInfo(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                searchCredits: true,
                plan: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                subscriptionCancelAtPeriodEnd: true,
                trialCreditsUsed: true,
                organizationId: true,
            },
        });

        if (!user) throw new BadRequestException('Użytkownik nie znaleziony');

        // Fetch org data
        let org: { searchCredits: number; plan: string; stripeSubscriptionId: string | null; subscriptionCancelAtPeriodEnd: boolean; trialCreditsUsed: boolean } | null = null;
        if (user.organizationId) {
            org = await this.prisma.organization.findUnique({
                where: { id: user.organizationId },
                select: {
                    searchCredits: true,
                    plan: true,
                    stripeSubscriptionId: true,
                    subscriptionCancelAtPeriodEnd: true,
                    trialCreditsUsed: true,
                },
            });
        }

        // Effective plan and subscription (org takes precedence)
        const effectivePlan = org?.plan ?? user.plan;
        const effectiveSubId = org?.stripeSubscriptionId ?? user.stripeSubscriptionId;
        let cancelAtPeriodEnd = org?.subscriptionCancelAtPeriodEnd ?? user.subscriptionCancelAtPeriodEnd;
        let currentPeriodEnd: string | null = null;

        // Sync subscription status with Stripe on-demand
        if (effectiveSubId && this.stripe) {
            try {
                const sub = await this.stripe.subscriptions.retrieve(effectiveSubId) as Stripe.Subscription;
                const periodEndTs = sub.items?.data?.[0]?.current_period_end;
                if (periodEndTs) {
                    currentPeriodEnd = new Date(periodEndTs * 1000).toISOString();
                }
                cancelAtPeriodEnd = sub.cancel_at_period_end;

                if (sub.status === 'canceled' && effectivePlan === 'unlimited') {
                    // Sync: subscription canceled but local state still unlimited
                    if (user.organizationId && org) {
                        await this.prisma.organization.update({
                            where: { id: user.organizationId },
                            data: { plan: 'research', stripeSubscriptionId: null, subscriptionCancelAtPeriodEnd: false },
                        });
                    }
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { plan: 'research', stripeSubscriptionId: null, subscriptionCancelAtPeriodEnd: false },
                    });
                    this.logger.warn(`Synced user ${userId}: Stripe sub canceled but local was still unlimited`);
                } else if (cancelAtPeriodEnd !== (org?.subscriptionCancelAtPeriodEnd ?? user.subscriptionCancelAtPeriodEnd)) {
                    if (user.organizationId) {
                        await this.prisma.organization.update({
                            where: { id: user.organizationId },
                            data: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd },
                        });
                    }
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd },
                    });
                }
            } catch (err) {
                this.logger.warn(`Failed to verify subscription for user ${userId}: ${err.message}`);
            }
        }

        // Fetch both personal and org transactions
        const personalTransactions = await this.prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true, amount: true, type: true, description: true, createdAt: true, balanceAfter: true,
            },
        });

        let orgTransactions: any[] = [];
        if (user.organizationId) {
            orgTransactions = await this.prisma.orgCreditTransaction.findMany({
                where: { organizationId: user.organizationId },
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    id: true, amount: true, type: true, description: true, createdAt: true, balanceAfter: true,
                },
            });
        }

        // Merge and sort all transactions
        const allTransactions = [...personalTransactions.map(t => ({ ...t, source: 'personal' })), ...orgTransactions.map(t => ({ ...t, source: 'org' }))]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 30);

        return {
            // Two wallets
            personalCredits: user.searchCredits,
            orgCredits: org?.searchCredits ?? 0,
            // Legacy compat
            searchCredits: (user.searchCredits ?? 0) + (org?.searchCredits ?? 0),
            plan: effectivePlan,
            orgPlan: org?.plan ?? 'research',
            hasStripeCustomer: !!user.stripeCustomerId,
            trialCreditsUsed: org?.trialCreditsUsed ?? user.trialCreditsUsed,
            cancelAtPeriodEnd,
            currentPeriodEnd,
            recentTransactions: allTransactions,
        };
    }

    // --- Cancel Subscription ---

    async cancelSubscription(userId: string): Promise<{ canceledAt: string; cancelAtPeriodEnd: boolean }> {
        const stripe = this.ensureStripe();

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeSubscriptionId: true, plan: true, organizationId: true },
        });

        // Check org-level subscription first
        let subscriptionId = user?.stripeSubscriptionId;
        let orgId: string | null = null;

        if (user?.organizationId) {
            const org = await this.prisma.organization.findUnique({
                where: { id: user.organizationId },
                select: { stripeSubscriptionId: true, plan: true },
            });
            if (org?.stripeSubscriptionId && org.plan === 'unlimited') {
                subscriptionId = org.stripeSubscriptionId;
                orgId = user.organizationId;
            }
        }

        if (!subscriptionId) {
            throw new BadRequestException('No active subscription found');
        }

        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        if (orgId) {
            await this.prisma.organization.update({
                where: { id: orgId },
                data: { subscriptionCancelAtPeriodEnd: true },
            });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionCancelAtPeriodEnd: true },
        });

        this.logger.log(`Subscription cancellation requested (user: ${userId}, org: ${orgId})`);

        return {
            canceledAt: new Date().toISOString(),
            cancelAtPeriodEnd: true,
        };
    }

    // --- Contribute personal credits to org pool ---

    async contributeCredits(userId: string, amount: number): Promise<{ personalCredits: number; orgCredits: number }> {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { searchCredits: true, organizationId: true },
        });

        if (!user) throw new BadRequestException('User not found');
        if (!user.organizationId) throw new BadRequestException('You must be in an organization');
        if ((user.searchCredits ?? 0) < amount) throw new BadRequestException('Insufficient personal credits');

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { searchCredits: { decrement: amount } },
            });

            const updatedOrg = await tx.organization.update({
                where: { id: user.organizationId! },
                data: { searchCredits: { increment: amount } },
            });

            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount: -amount,
                    type: 'CONTRIBUTION',
                    description: `Contributed ${amount} credits to team pool`,
                    balanceAfter: updatedUser.searchCredits,
                },
            });

            await tx.orgCreditTransaction.create({
                data: {
                    organizationId: user.organizationId!,
                    userId,
                    amount,
                    type: 'CONTRIBUTION',
                    description: `Contribution from team member`,
                    balanceAfter: updatedOrg.searchCredits,
                },
            });

            return { personalCredits: updatedUser.searchCredits, orgCredits: updatedOrg.searchCredits };
        });

        this.logger.log(`User ${userId} contributed ${amount} credits to org pool`);
        return result;
    }

    // --- Customer Portal ---

    async getPortalUrl(userId: string): Promise<{ url: string }> {
        const stripe = this.ensureStripe();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true, language: true },
        });

        if (!user?.stripeCustomerId) {
            throw new BadRequestException('Brak konta Stripe. Dokonaj najpierw zakupu.');
        }

        const isEn = user.language === 'en';
        const frontendUrl = this.getFrontendUrl(user.language || 'pl');

        // Create portal config with name + address + tax_id editing (cached per instance)
        if (!this.portalConfigId) {
            const config = await stripe.billingPortal.configurations.create({
                features: {
                    customer_update: {
                        enabled: true,
                        allowed_updates: ['name', 'address', 'tax_id'],
                    },
                    invoice_history: { enabled: true },
                },
                business_profile: {
                    headline: isEn ? 'Manage billing data' : 'Zarządzaj danymi rozliczeniowymi',
                },
            });
            this.portalConfigId = config.id;
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${frontendUrl}/settings`,
            configuration: this.portalConfigId,
        });

        return { url: portalSession.url };
    }

    // --- Invoices ---

    async getInvoices(userId: string): Promise<{ invoices: Array<{
        id: string;
        number: string;
        date: string;
        amount: number;
        currency: string;
        status: string;
        pdfUrl: string | null;
        hostedUrl: string | null;
    }> }> {
        const stripe = this.ensureStripe();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true },
        });
        if (!user?.stripeCustomerId) return { invoices: [] };

        const invoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: 50,
        });

        return {
            invoices: invoices.data.map(inv => ({
                id: inv.id,
                number: inv.number || inv.id,
                date: new Date((inv.created || 0) * 1000).toISOString(),
                amount: inv.total || 0,
                currency: inv.currency || 'pln',
                status: inv.status || 'unknown',
                pdfUrl: inv.invoice_pdf || null,
                hostedUrl: inv.hosted_invoice_url || null,
            })),
        };
    }

    async correctInvoice(userId: string, invoiceId: string): Promise<{
        success: boolean;
        creditNoteId: string;
        newInvoiceId: string;
    }> {
        const stripe = this.ensureStripe();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true },
        });
        if (!user?.stripeCustomerId) {
            throw new BadRequestException('Brak konta Stripe');
        }

        // 1. Retrieve original invoice with line items
        const invoice = await stripe.invoices.retrieve(invoiceId, {
            expand: ['lines'],
        });

        // 2. Verify ownership
        if (invoice.customer !== user.stripeCustomerId) {
            throw new BadRequestException('Ta faktura nie należy do Twojego konta');
        }

        // 3. Only paid invoices can be corrected
        if (invoice.status !== 'paid') {
            throw new BadRequestException('Tylko opłacone faktury mogą być korygowane');
        }

        // 4. Check if already corrected (credit note exists)
        const existingNotes = await stripe.creditNotes.list({ invoice: invoiceId, limit: 1 });
        if (existingNotes.data.length > 0) {
            throw new BadRequestException('Ta faktura została już skorygowana');
        }

        // 5. Create credit note (credits amount to customer balance)
        const creditNote = await stripe.creditNotes.create({
            invoice: invoiceId,
            reason: 'order_change',
            credit_amount: invoice.amount_paid,
        });

        // 6. Create new invoice with current customer data
        const newInvoice = await stripe.invoices.create({
            customer: user.stripeCustomerId,
            auto_advance: false,
        });

        // 7. Copy line items from original invoice
        for (const line of invoice.lines?.data || []) {
            await stripe.invoiceItems.create({
                customer: user.stripeCustomerId,
                invoice: newInvoice.id,
                amount: line.amount,
                currency: line.currency,
                description: line.description || undefined,
            });
        }

        // 8. Finalize the new invoice
        await stripe.invoices.finalizeInvoice(newInvoice.id);

        // 9. Pay from customer balance (funded by credit note)
        await stripe.invoices.pay(newInvoice.id);

        this.logger.log(`Invoice corrected: ${invoiceId} → credit note ${creditNote.id} + new invoice ${newInvoice.id}`);

        return {
            success: true,
            creditNoteId: creditNote.id,
            newInvoiceId: newInvoice.id,
        };
    }

    async trackPlanView(userId: string, planId: string, source: string): Promise<{ ok: boolean }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true, plan: true },
        });

        this.observability.recordEvent('conversion', 'plan_viewed', 'info', {
            title: `Plan viewed: ${planId}`,
            userId,
            userEmail: user?.email,
            metadata: { planId, source, currentPlan: user?.plan },
        }).catch(() => {});

        return { ok: true };
    }
}
