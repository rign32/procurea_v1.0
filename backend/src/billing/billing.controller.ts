import { Controller, Post, Get, Body, Req, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get('info')
    @UseGuards(AuthGuard('jwt'))
    async getBillingInfo(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.getUserBillingInfo(userId);
    }

    @Post('checkout/credits')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { ttl: 60000, limit: 10 } })
    async createCreditCheckout(@Req() req, @Body() body: { packId: string }) {
        const userId = req.user.userId || req.user.sub;
        if (!body.packId) throw new BadRequestException('packId is required');
        return this.billingService.createCreditCheckout(userId, body.packId);
    }

    @Post('checkout/subscription')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async createSubscriptionCheckout(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.createSubscriptionCheckout(userId);
    }

    @Post('cancel-subscription')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async cancelSubscription(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.cancelSubscription(userId);
    }

    @Post('portal')
    @UseGuards(AuthGuard('jwt'))
    async createPortalSession(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.getPortalUrl(userId);
    }

    @Post('verify-session')
    @UseGuards(AuthGuard('jwt'))
    async verifySession(@Req() req, @Body() body: { sessionId: string }) {
        const userId = req.user.userId || req.user.sub;
        if (!body.sessionId) throw new BadRequestException('sessionId is required');
        return this.billingService.verifyAndFulfillSession(userId, body.sessionId);
    }

    @Post('contribute')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { ttl: 60000, limit: 10 } })
    async contributeCredits(@Req() req, @Body() body: { amount: number }) {
        const userId = req.user.userId || req.user.sub;
        if (!body.amount || body.amount <= 0) throw new BadRequestException('amount must be a positive number');
        return this.billingService.contributeCredits(userId, body.amount);
    }

    @Post('invoices/correct')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async correctInvoice(@Req() req, @Body() body: { invoiceId: string }) {
        const userId = req.user.userId || req.user.sub;
        if (!body.invoiceId) throw new BadRequestException('invoiceId is required');
        return this.billingService.correctInvoice(userId, body.invoiceId);
    }

    @Get('invoices')
    @UseGuards(AuthGuard('jwt'))
    async getInvoices(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.getInvoices(userId);
    }

    @Post('webhook')
    @SkipThrottle()
    async handleWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
        const bodyType = Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body;
        const hasRawBody = !!(req as any).rawBody;
        console.log(`[Webhook] Body type: ${bodyType}, size: ${req.body?.length ?? 'N/A'}, hasRawBody: ${hasRawBody}, sig: ${signature ? 'present' : 'missing'}`);

        const rawBody = Buffer.isBuffer(req.body) ? req.body : (req as any).rawBody;
        if (!rawBody) {
            throw new BadRequestException('Raw body not available for webhook verification');
        }
        await this.billingService.handleWebhook(rawBody, signature);
        return { received: true };
    }
}
