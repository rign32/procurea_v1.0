import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SalesOpsService } from './sales-ops.service';

@Controller('sales-ops')
@SkipThrottle()
export class SalesOpsController {
    private readonly logger = new Logger(SalesOpsController.name);

    constructor(private readonly salesOpsService: SalesOpsService) {}

    /**
     * Apollo reply webhook — lead responded to email sequence.
     * POST /sales-ops/webhooks/apollo/reply
     */
    @Post('webhooks/apollo/reply')
    async handleApolloReply(@Body() body: any) {
        this.logger.log(`Apollo reply webhook received`);
        try {
            await this.salesOpsService.handleApolloReply({
                email: body.email || body.contact?.email,
                first_name: body.first_name || body.contact?.first_name,
                last_name: body.last_name || body.contact?.last_name,
                company: body.company || body.contact?.organization_name,
                company_domain: body.company_domain || body.contact?.organization?.domain,
                sequence_name: body.sequence_name || body.emailer_campaign?.name,
            });
        } catch (error) {
            this.logger.error(`Apollo reply webhook error: ${error.message}`);
        }
        return { received: true };
    }

    /**
     * Apollo email open webhook — silent tracking.
     * POST /sales-ops/webhooks/apollo/open
     */
    @Post('webhooks/apollo/open')
    async handleApolloOpen(@Body() body: any) {
        try {
            await this.salesOpsService.handleApolloOpen({
                email: body.email || body.contact?.email,
                first_name: body.first_name || body.contact?.first_name,
                last_name: body.last_name || body.contact?.last_name,
            });
        } catch (error) {
            this.logger.error(`Apollo open webhook error: ${error.message}`);
        }
        return { received: true };
    }

    /**
     * Tally feedback webhook — user completed feedback survey.
     * POST /sales-ops/webhooks/tally/feedback
     *
     * Tally sends: { eventId, eventType, createdAt, data: { responseId, fields: [...] } }
     */
    @Post('webhooks/tally/feedback')
    async handleTallyFeedback(@Body() body: any) {
        this.logger.log(`Tally feedback webhook received`);
        try {
            // Parse Tally webhook format
            const fields = body.data?.fields || [];
            const answers: Record<string, string> = {};
            let email = '';
            let npsScore: number | undefined;
            let campaignName: string | undefined;

            for (const field of fields) {
                const label = field.label || field.key || '';
                const value = field.value ?? '';

                if (label.toLowerCase() === 'email' || field.key === 'email') {
                    email = typeof value === 'string' ? value : '';
                } else if (label.toLowerCase().includes('campaignname') || field.key === 'campaignName') {
                    campaignName = typeof value === 'string' ? value : '';
                } else if (label.toLowerCase().includes('nps') || label.toLowerCase().includes('ocen')) {
                    npsScore = typeof value === 'number' ? value : parseInt(value, 10) || undefined;
                    answers[label] = String(value);
                } else {
                    answers[label] = String(value);
                }
            }

            if (!email) {
                // Try hidden fields
                const hiddenFields = body.data?.hiddenFields || {};
                email = hiddenFields.email || hiddenFields.Email || '';
            }

            if (!campaignName) {
                const hiddenFields = body.data?.hiddenFields || {};
                campaignName = hiddenFields.campaignName || hiddenFields.CampaignName || '';
            }

            if (email) {
                await this.salesOpsService.handleTallyFeedback({
                    email,
                    campaignName,
                    npsScore,
                    answers,
                });
            } else {
                this.logger.warn('Tally webhook: no email found in payload');
            }
        } catch (error) {
            this.logger.error(`Tally feedback webhook error: ${error.message}`);
        }
        return { received: true };
    }
}
