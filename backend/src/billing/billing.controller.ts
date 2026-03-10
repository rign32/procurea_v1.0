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

    @Post('portal')
    @UseGuards(AuthGuard('jwt'))
    async createPortalSession(@Req() req) {
        const userId = req.user.userId || req.user.sub;
        return this.billingService.getPortalUrl(userId);
    }

    @Post('webhook')
    @SkipThrottle()
    async handleWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
        // express.raw() middleware sets req.body as Buffer for /billing/webhook
        const rawBody = Buffer.isBuffer(req.body) ? req.body : (req as any).rawBody;
        if (!rawBody) {
            throw new BadRequestException('Raw body not available for webhook verification');
        }
        await this.billingService.handleWebhook(rawBody, signature);
        return { received: true };
    }
}
