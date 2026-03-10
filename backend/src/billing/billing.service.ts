import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

const CREDIT_PACKS: Record<string, { credits: number; priceNet: number; label: string }> = {
    pack_1:  { credits: 1,  priceNet: 7000,  label: '1 wyszukiwanie' },
    pack_5:  { credits: 5,  priceNet: 24000, label: '5 wyszukiwań' },
    pack_20: { credits: 20, priceNet: 60000, label: '20 wyszukiwań' },
};

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private stripe: Stripe | null = null;
    private vatTaxRateId: string | null = null;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (apiKey) {
            this.stripe = new Stripe(apiKey);
            this.logger.log('Stripe initialized');
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

    private getFrontendUrl(): string {
        // Staging detection: DATABASE_URL_STAGING is only set for apiStaging Cloud Function
        if (process.env.DATABASE_URL_STAGING) {
            return 'https://staging.procurea.pl';
        }
        return this.configService.get<string>('FRONTEND_URL') || 'https://app.procurea.pl';
    }

    // --- Checkout Sessions ---

    async createCreditCheckout(userId: string, packId: string): Promise<{ url: string }> {
        const pack = CREDIT_PACKS[packId];
        if (!pack) throw new BadRequestException(`Nieznany pakiet: ${packId}`);

        const stripe = this.ensureStripe();
        const customerId = await this.getOrCreateCustomer(userId);
        const vatRateId = await this.getVatTaxRateId();

        const frontendUrl = this.getFrontendUrl();

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            locale: 'pl',
            line_items: [{
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: `Pakiet: ${pack.label}`,
                        description: `${pack.credits} ${pack.credits === 1 ? 'wyszukiwanie dostawców' : 'wyszukiwań dostawców'}`,
                    },
                    unit_amount: pack.priceNet,
                },
                quantity: 1,
                tax_rates: [vatRateId],
            }],
            invoice_creation: { enabled: true },
            metadata: {
                userId,
                packId,
                credits: String(pack.credits),
                type: 'credit_purchase',
            },
            success_url: `${frontendUrl}/settings?billing=success`,
            cancel_url: `${frontendUrl}/settings?billing=canceled`,
        });

        if (!session.url) throw new BadRequestException('Nie udało się utworzyć sesji płatności');
        return { url: session.url };
    }

    async createSubscriptionCheckout(userId: string): Promise<{ url: string }> {
        const stripe = this.ensureStripe();
        const customerId = await this.getOrCreateCustomer(userId);
        const vatRateId = await this.getVatTaxRateId();

        const priceId = this.configService.get<string>('STRIPE_UNLIMITED_PRICE_ID');
        if (!priceId) throw new BadRequestException('Subskrypcja nie jest skonfigurowana');

        const frontendUrl = this.getFrontendUrl();

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            locale: 'pl',
            line_items: [{
                price: priceId,
                quantity: 1,
                tax_rates: [vatRateId],
            }],
            metadata: {
                userId,
                type: 'unlimited_subscription',
            },
            subscription_data: {
                metadata: { userId },
            },
            success_url: `${frontendUrl}/settings?billing=success`,
            cancel_url: `${frontendUrl}/settings?billing=canceled`,
        });

        if (!session.url) throw new BadRequestException('Nie udało się utworzyć sesji płatności');
        return { url: session.url };
    }

    // --- Webhook ---

    async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
        const stripe = this.ensureStripe();
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
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

        } else if (type === 'unlimited_subscription') {
            const subscriptionId = session.subscription as string;

            await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.update({
                    where: { id: userId },
                    data: {
                        plan: 'unlimited',
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

            this.logger.log(`User ${userId} upgraded to unlimited plan (subscription: ${subscriptionId})`);
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata?.userId;
        if (!userId) {
            this.logger.warn('Subscription deleted without userId in metadata');
            return;
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { plan: 'research' },
        });

        this.logger.log(`User ${userId} subscription canceled, reverted to research plan`);
    }

    // --- Billing Info ---

    async getUserBillingInfo(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { searchCredits: true, plan: true, stripeCustomerId: true },
        });

        if (!user) throw new BadRequestException('Użytkownik nie znaleziony');

        const recentTransactions = await this.prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                amount: true,
                type: true,
                description: true,
                createdAt: true,
                balanceAfter: true,
            },
        });

        return {
            searchCredits: user.searchCredits,
            plan: user.plan,
            hasStripeCustomer: !!user.stripeCustomerId,
            recentTransactions,
        };
    }

    // --- Customer Portal ---

    async getPortalUrl(userId: string): Promise<{ url: string }> {
        const stripe = this.ensureStripe();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true },
        });

        if (!user?.stripeCustomerId) {
            throw new BadRequestException('Brak konta Stripe. Dokonaj najpierw zakupu.');
        }

        const frontendUrl = this.getFrontendUrl();

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${frontendUrl}/settings`,
        });

        return { url: portalSession.url };
    }
}
