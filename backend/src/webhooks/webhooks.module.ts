import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResendInboundController } from './resend-inbound.controller';
import { WebhookOrchestratorService } from './webhook-orchestrator.service';
import { EmailTriageService } from './email-triage.service';
import { OfferReplyMatcherService } from './offer-reply-matcher.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { RequestsModule } from '../requests/requests.module';

/**
 * Webhooks module — for now, only Resend Inbound.
 *
 * GeminiService is provided globally via CommonModule so we don't need
 * to re-import it here.
 */
@Module({
    imports: [ConfigModule, PrismaModule, EmailModule, RequestsModule],
    controllers: [ResendInboundController],
    providers: [
        WebhookOrchestratorService,
        EmailTriageService,
        OfferReplyMatcherService,
    ],
    exports: [EmailTriageService, OfferReplyMatcherService],
})
export class WebhooksModule {}
