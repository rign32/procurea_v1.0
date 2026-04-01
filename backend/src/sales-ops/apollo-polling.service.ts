import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ApolloApiService } from "./apollo-api.service";
import { SalesOpsService } from "./sales-ops.service";

@Injectable()
export class ApolloPollingService {
  private readonly logger = new Logger(ApolloPollingService.name);

  /** Set of Apollo contact IDs already processed — prevents duplicate leads. */
  private readonly processedContactIds = new Set<string>();

  constructor(
    private readonly apolloApi: ApolloApiService,
    private readonly salesOps: SalesOpsService,
  ) {}

  /**
   * Poll Apollo.io every 15 minutes for new email replies.
   * For each new reply, creates a lead in Attio + sends Slack notification.
   */
  @Cron("*/15 * * * *")
  async pollForReplies(): Promise<void> {
    if (!this.apolloApi.isEnabled) return;

    this.logger.log("Polling Apollo for new replies...");

    try {
      const campaigns = await this.apolloApi.getActiveCampaigns();
      const campaignsWithReplies = campaigns.filter(
        (c) => c.unique_replied > 0,
      );

      if (campaignsWithReplies.length === 0) {
        this.logger.log("No campaigns with replies found");
        return;
      }

      let newReplies = 0;

      for (const campaign of campaignsWithReplies) {
        const contacts = await this.apolloApi.getRepliedContacts(campaign.id);

        for (const contact of contacts) {
          if (this.processedContactIds.has(contact.id)) continue;

          this.logger.log(
            `New reply: ${contact.email} from campaign "${campaign.name}"`,
          );

          await this.salesOps.handleApolloReply({
            email: contact.email,
            first_name: contact.first_name,
            last_name: contact.last_name,
            company: contact.organization_name,
            company_domain: contact.organization?.domain,
            sequence_name: campaign.name,
          });

          this.processedContactIds.add(contact.id);
          newReplies++;
        }
      }

      this.logger.log(
        `Apollo poll complete: ${newReplies} new replies processed (${this.processedContactIds.size} total tracked)`,
      );
    } catch (error) {
      this.logger.error(`Apollo polling error: ${(error as Error).message}`);
    }
  }
}
