import {
    BadRequestException,
    Controller,
    Headers,
    Logger,
    Post,
    Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WebhookOrchestratorService } from './webhook-orchestrator.service';
import { ResendInboundPayload } from './dto/resend-inbound-payload.dto';

/**
 * Resend Inbound webhook endpoint.
 *
 * Flow:
 *   1. Verify HMAC signature (svix-style, same pattern as Stripe)
 *   2. Parse payload (the raw body was captured by express.raw in main.functions.ts)
 *   3. Hand off to orchestrator asynchronously — Resend only needs a 200 ACK
 *      and a long synchronous AI call would risk a webhook timeout/retry.
 *
 * Endpoint: POST /webhooks/resend/inbound
 *
 * Signature verification can be disabled via `RESEND_WEBHOOK_VERIFY_SIGNATURE=false`
 * for local/dev use. Default is ON — never disable on prod/staging.
 */
@Controller('webhooks/resend')
export class ResendInboundController {
    private readonly logger = new Logger(ResendInboundController.name);

    constructor(
        private readonly orchestrator: WebhookOrchestratorService,
        private readonly configService: ConfigService,
    ) {}

    @Post('inbound')
    @SkipThrottle({ default: true })
    async handleInbound(
        @Req() req: any,
        @Headers('svix-signature') svixSignature: string,
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('resend-signature') resendSignature: string,
    ) {
        const rawBody: Buffer | undefined = Buffer.isBuffer(req.body)
            ? req.body
            : (req as any).rawBody;

        if (!rawBody) {
            throw new BadRequestException(
                'Raw body not available for webhook verification',
            );
        }

        const verifyEnabled =
            (this.configService.get<string>(
                'RESEND_WEBHOOK_VERIFY_SIGNATURE',
            ) ?? 'true').toLowerCase() !== 'false';

        if (verifyEnabled) {
            const secret =
                this.configService.get<string>(
                    'RESEND_INBOUND_WEBHOOK_SECRET',
                ) ||
                this.configService.get<string>(
                    'RESEND_WEBHOOK_SECRET',
                );
            if (!secret) {
                this.logger.error(
                    'RESEND_INBOUND_WEBHOOK_SECRET not configured — refusing inbound webhook',
                );
                throw new BadRequestException('Webhook secret not configured');
            }

            const verified = this.verifySignature({
                rawBody,
                secret,
                svixSignature,
                svixId,
                svixTimestamp,
                resendSignature,
            });
            if (!verified) {
                this.logger.warn(
                    'Inbound webhook signature verification failed',
                );
                throw new BadRequestException(
                    'Invalid webhook signature',
                );
            }
        } else {
            this.logger.warn(
                'RESEND_WEBHOOK_VERIFY_SIGNATURE=false — accepting without HMAC verification (dev only)',
            );
        }

        let payload: ResendInboundPayload;
        try {
            payload = JSON.parse(rawBody.toString('utf8'));
        } catch (e: any) {
            throw new BadRequestException(
                `Invalid JSON body: ${e?.message}`,
            );
        }

        this.logger.log(
            `Resend inbound received: type=${payload?.type} email_id=${payload?.data?.email_id}`,
        );

        // Fire-and-forget: ACK immediately so Resend doesn't retry while we
        // run Gemini (can take seconds). Errors are logged inside the
        // orchestrator; idempotency via ResendEventLog prevents dupes even
        // if Resend retries before we finish writing.
        this.orchestrator.processInboundEmail(payload).catch((err) => {
            this.logger.error(
                `Inbound orchestration failed for ${payload?.data?.email_id}: ${err?.message}`,
                err?.stack,
            );
        });

        return { received: true };
    }

    /**
     * Resend uses Svix under the hood for webhook signing. The signature
     * format is: `v1,<base64(hmac-sha256(svix_id.svix_timestamp.body))>`
     * and the secret is prefixed with `whsec_`.
     *
     * We also accept a simpler raw HMAC in `resend-signature` header as a
     * fallback (matches what some Resend products emit).
     */
    private verifySignature(params: {
        rawBody: Buffer;
        secret: string;
        svixSignature?: string;
        svixId?: string;
        svixTimestamp?: string;
        resendSignature?: string;
    }): boolean {
        const { rawBody, secret, svixSignature, svixId, svixTimestamp, resendSignature } =
            params;

        // Path A: Svix-style signature
        if (svixSignature && svixId && svixTimestamp) {
            try {
                const cleanSecret = secret.startsWith('whsec_')
                    ? secret.slice('whsec_'.length)
                    : secret;
                const secretBytes = Buffer.from(cleanSecret, 'base64');
                const signedPayload = `${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`;
                const expected = crypto
                    .createHmac('sha256', secretBytes)
                    .update(signedPayload)
                    .digest('base64');

                // svixSignature can be space-separated list: "v1,abc v1,def"
                const candidates = svixSignature
                    .split(/\s+/)
                    .map((s) => s.replace(/^v1,/, ''));
                for (const cand of candidates) {
                    if (
                        cand.length === expected.length &&
                        crypto.timingSafeEqual(
                            Buffer.from(cand),
                            Buffer.from(expected),
                        )
                    ) {
                        return true;
                    }
                }
            } catch (e: any) {
                this.logger.warn(
                    `Svix signature verification error: ${e?.message}`,
                );
            }
        }

        // Path B: raw HMAC-SHA256 fallback
        if (resendSignature) {
            try {
                const expected = crypto
                    .createHmac('sha256', secret)
                    .update(rawBody)
                    .digest('hex');
                const provided = resendSignature.replace(/^sha256=/, '');
                if (
                    provided.length === expected.length &&
                    crypto.timingSafeEqual(
                        Buffer.from(provided),
                        Buffer.from(expected),
                    )
                ) {
                    return true;
                }
            } catch (e: any) {
                this.logger.warn(
                    `Raw HMAC verification error: ${e?.message}`,
                );
            }
        }

        return false;
    }
}
