import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AttioService } from "./attio.service";
import { SlackNotificationsService } from "./slack-notifications.service";

@Injectable()
export class SalesOpsService implements OnModuleInit {
  private readonly logger = new Logger(SalesOpsService.name);

  constructor(
    private readonly attio: AttioService,
    private readonly slack: SlackNotificationsService,
  ) {}

  onModuleInit() {
    const status = [
      `Attio: ${this.attio.isEnabled ? "✓" : "✗ DISABLED"}`,
      `Slack: ${this.slack.isEnabled ? "✓" : "✗ DISABLED"}`,
    ];
    this.logger.log(`SalesOps integrations: ${status.join(" | ")}`);
  }

  /**
   * Apollo reply webhook — lead responded to outreach sequence.
   * Creates person + company + deal in Attio (Outreach stage) + Slack notification.
   */
  async handleApolloReply(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    company_domain?: string;
    sequence_name?: string;
  }): Promise<void> {
    this.logger.log(`Apollo reply from: ${payload.email}`);

    const personId = await this.attio.upsertPerson({
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
    });

    let companyId: string | null = null;
    if (payload.company || payload.company_domain) {
      companyId = await this.attio.upsertCompany(
        payload.company || payload.company_domain || "",
        payload.company_domain,
      );
    }

    const dealId = await this.attio.createDeal({
      name: `${payload.first_name || ""} ${payload.last_name || ""} — ${payload.company || "Lead"}`.trim(),
      stage: "outreach",
      personRecordId: personId || undefined,
      companyRecordId: companyId || undefined,
      source: "Apollo Sequence",
      sekwencjaApollo: payload.sequence_name,
    });
    const attioOk = !!dealId;

    const name = [payload.first_name, payload.last_name]
      .filter(Boolean)
      .join(" ");
    await this.slack.notifyApolloReply(
      payload.email,
      name,
      payload.sequence_name,
      attioOk,
    );
  }

  /**
   * Apollo email opened — silent notification.
   */
  async handleApolloOpen(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
  }): Promise<void> {
    const name = [payload.first_name, payload.last_name]
      .filter(Boolean)
      .join(" ");
    await this.slack.notifyApolloOpen(payload.email, name);
  }

  /**
   * User registered on procurea.io.
   * Creates/updates person + deal in Attio (Rejestracja stage) + Slack notification.
   */
  async handleRegistration(payload: {
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    companyDomain?: string;
  }): Promise<void> {
    this.logger.log(`Registration: ${payload.email}`);

    const personId = await this.attio.upsertPerson({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });

    let companyId: string | null = null;
    if (payload.company || payload.companyDomain) {
      companyId = await this.attio.upsertCompany(
        payload.company || payload.companyDomain || "",
        payload.companyDomain,
      );
    }

    // Check if deal already exists (e.g., from Apollo outreach)
    let attioOk = false;
    const existingDeals = await this.attio.findDealsByEmail(payload.email);
    if (existingDeals.length > 0) {
      // Update existing deal to Rejestracja
      attioOk = await this.attio.updateDealStage(
        existingDeals[0].recordId,
        "rejestracja",
      );
    } else {
      // Create new deal
      const dealId = await this.attio.createDeal({
        name: `${payload.name} — Registration`,
        stage: "rejestracja",
        personRecordId: personId || undefined,
        companyRecordId: companyId || undefined,
        source: "Organic",
      });
      attioOk = !!dealId;
    }

    await this.slack.notifyRegistration(
      payload.email,
      payload.name,
      payload.company,
      attioOk,
    );
  }

  /**
   * Tally feedback webhook — user completed feedback survey.
   * Updates deal to Feedback stage + adds note with answers + Slack notification.
   */
  async handleTallyFeedback(payload: {
    email: string;
    campaignName?: string;
    npsScore?: number;
    answers?: Record<string, string>;
  }): Promise<void> {
    this.logger.log(`Tally feedback from: ${payload.email}`);

    let attioOk = false;
    const deals = await this.attio.findDealsByEmail(payload.email);
    if (deals.length > 0) {
      const dealId = deals[0].recordId;
      attioOk = await this.attio.updateDealStage(dealId, "feedback");

      // Add note with feedback answers
      if (payload.answers) {
        const noteContent = Object.entries(payload.answers)
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join("\n\n");
        await this.attio.addNote(
          dealId,
          "deals",
          `Feedback${payload.campaignName ? ` — ${payload.campaignName}` : ""}`,
          `NPS: ${payload.npsScore ?? "N/A"}\n\n${noteContent}`,
        );
      }
    }

    const name = payload.email.split("@")[0];
    await this.slack.notifyFeedback(
      payload.email,
      name,
      payload.npsScore,
      payload.campaignName,
      attioOk,
    );
  }

  /**
   * Stripe checkout completed — deal moves to Płatność stage.
   * Called from billing.service.ts after processing payment.
   */
  async handleStripeCheckout(payload: {
    email: string;
    name: string;
    amount: number;
    currency: string;
    plan?: string;
    subscriptionId?: string;
  }): Promise<void> {
    this.logger.log(
      `Stripe checkout: ${payload.email} — ${payload.amount} ${payload.currency}`,
    );

    let attioOk = false;
    const deals = await this.attio.findDealsByEmail(payload.email);
    if (deals.length > 0) {
      const dealId = deals[0].recordId;
      const extraValues: Record<string, any> = {};
      if (payload.amount) {
        extraValues.value = [
          {
            currency_value: payload.amount / 100,
            currency_code: payload.currency?.toUpperCase() || "USD",
          },
        ];
      }
      if (payload.subscriptionId) {
        extraValues.stripe_subscription_id = [
          { value: payload.subscriptionId },
        ];
      }
      attioOk = await this.attio.updateDealStage(dealId, "platnosc", extraValues);
    }

    await this.slack.notifyPayment(
      payload.email,
      payload.name,
      payload.amount,
      payload.currency,
      payload.plan,
      attioOk,
    );
  }

  /**
   * Stripe subscription created — deal moves to Won stage.
   */
  async handleSubscriptionCreated(payload: {
    email: string;
    name: string;
    amount: number;
    currency: string;
    subscriptionId: string;
  }): Promise<void> {
    this.logger.log(`Subscription created: ${payload.email}`);

    let attioOk = false;
    const deals = await this.attio.findDealsByEmail(payload.email);
    if (deals.length > 0) {
      attioOk = await this.attio.updateDealStage(deals[0].recordId, "won", {
        stripe_subscription_id: [{ value: payload.subscriptionId }],
        value: [
          {
            currency_value: payload.amount / 100,
            currency_code: payload.currency?.toUpperCase() || "USD",
          },
        ],
      });
    }

    await this.slack.notifySubscriptionCreated(
      payload.email,
      payload.name,
      payload.amount,
      payload.currency,
      attioOk,
    );
  }

  /**
   * Stripe subscription deleted — deal moves to Lost stage.
   */
  async handleSubscriptionDeleted(payload: {
    email: string;
    name: string;
  }): Promise<void> {
    this.logger.log(`Subscription canceled: ${payload.email}`);

    let attioOk = false;
    const deals = await this.attio.findDealsByEmail(payload.email);
    if (deals.length > 0) {
      attioOk = await this.attio.updateDealStage(deals[0].recordId, "lost");
    }

    await this.slack.notifySubscriptionCanceled(payload.email, payload.name, attioOk);
  }

  /**
   * AI Sourcing completed — deal moves to AI Sourcing stage.
   * Called from sourcing.service.ts after campaign finishes.
   */
  async handleAiSourcingCompleted(payload: {
    email: string;
    name: string;
    campaignName: string;
    suppliersFound: number;
    elapsedSeconds: number;
    isTrialCredit: boolean;
  }): Promise<void> {
    this.logger.log(
      `AI Sourcing completed: ${payload.email} — ${payload.campaignName}`,
    );

    let attioOk = false;
    const deals = await this.attio.findDealsByEmail(payload.email);
    if (deals.length > 0) {
      attioOk = await this.attio.updateDealStage(
        deals[0].recordId,
        "ai_sourcing",
      );
    }

    await this.slack.notifyAiSourcingCompleted(
      payload.email,
      payload.name,
      payload.campaignName,
      payload.suppliersFound,
      payload.elapsedSeconds,
      payload.isTrialCredit,
      attioOk,
    );
  }

  /**
   * Trial credits exhausted — observability notification only.
   */
  async handleTrialCreditsExhausted(payload: {
    email: string;
    name: string;
    campaignName: string;
  }): Promise<void> {
    this.logger.log(`Trial credits exhausted: ${payload.email}`);
    await this.slack.notifyTrialExhausted(
      payload.email,
      payload.name,
      payload.campaignName,
    );
  }
}
