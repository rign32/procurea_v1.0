/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Controller, Post, Get, Query, Body, Headers, Logger, ForbiddenException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";
import { SalesOpsService } from "./sales-ops.service";
import { AttioService } from "./attio.service";
import { ResendAudiencesService } from "./resend-audiences.service";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "crypto";

@Controller("sales-ops")
export class SalesOpsController {
  private readonly logger = new Logger(SalesOpsController.name);

  constructor(
    private readonly salesOpsService: SalesOpsService,
    private readonly attioService: AttioService,
    private readonly resendAudiences: ResendAudiencesService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private verifyWebhookSecret(signature: string | undefined, body: any, secretEnvKey: string): void {
    const secret = this.configService.get<string>(secretEnvKey);
    if (!secret) return; // Skip verification if secret not configured
    if (!signature) {
      throw new ForbiddenException("Missing webhook signature");
    }
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");
    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      throw new ForbiddenException("Invalid webhook signature");
    }
  }

  /**
   * Diagnostic endpoint to test Attio API connectivity.
   * GET /sales-ops/test-attio?secret=STAGING_SECRET
   * Remove after verifying integration works.
   */
  @Get("test-attio")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async testAttio(@Query("secret") secret: string) {
    const stagingSecret = this.configService.get<string>("STAGING_SECRET");
    if (!secret || secret !== stagingSecret) {
      throw new ForbiddenException("Invalid secret");
    }

    const results: Record<string, any> = {
      attioEnabled: this.attioService.isEnabled,
    };

    // Test 1: Upsert Person
    const personId = await this.attioService.upsertPerson({
      email: "test-attio-diagnostic@procurea.pl",
      firstName: "Test",
      lastName: "Diagnostic",
    });
    results.person = personId;

    // Test 2: Upsert Company
    const companyId = await this.attioService.upsertCompany(
      "procurea.pl",
      "procurea.pl",
    );
    results.company = companyId;

    // Test 3: Create Deal (only if person was created)
    if (personId) {
      const dealId = await this.attioService.createDeal({
        name: "Test Diagnostic — DELETE ME",
        stage: "rejestracja",
        personRecordId: personId,
        companyRecordId: companyId || undefined,
        source: "Diagnostic",
      });
      results.deal = dealId;
    } else {
      results.deal = null;
      results.dealSkipped = "person upsert failed, cannot create deal";
    }

    return results;
  }

  /**
   * Backfill all existing users to Attio CRM.
   * GET /sales-ops/backfill-attio?secret=STAGING_SECRET
   * Creates Person + Company + Deal for each user that doesn't have a deal yet.
   * Remove after backfill is complete.
   */
  @Get("backfill-attio")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async backfillAttio(@Query("secret") secret: string) {
    const stagingSecret = this.configService.get<string>("STAGING_SECRET");
    if (!secret || secret !== stagingSecret) {
      throw new ForbiddenException("Invalid secret");
    }

    const users = await this.prisma.user.findMany({
      select: {
        email: true,
        name: true,
        companyName: true,
        language: true,
        organization: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const results: Array<{ email: string; status: string }> = [];

    for (const user of users) {
      try {
        const domain = user.email.split("@")[1];
        const nameParts = (user.name || "").split(" ");
        const company = user.organization?.name || user.companyName || undefined;

        await this.salesOpsService.handleRegistration({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          firstName: nameParts[0] || undefined,
          lastName: nameParts.slice(1).join(" ") || undefined,
          company,
          companyDomain: domain,
          language: user.language,
        });

        results.push({ email: user.email, status: "ok" });
        this.logger.log(`Backfill OK: ${user.email}`);
      } catch (e) {
        results.push({ email: user.email, status: `error: ${e.message}` });
        this.logger.error(`Backfill FAILED: ${user.email} — ${e.message}`);
      }
    }

    return {
      total: users.length,
      ok: results.filter((r) => r.status === "ok").length,
      failed: results.filter((r) => r.status !== "ok").length,
      details: results,
    };
  }

  /**
   * Sync all existing users to Resend Audiences (PL + EN segments).
   * GET /sales-ops/sync-resend-audiences?secret=STAGING_SECRET
   */
  @Get("sync-resend-audiences")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async syncResendAudiences(@Query("secret") secret: string) {
    const stagingSecret = this.configService.get<string>("STAGING_SECRET");
    if (!secret || secret !== stagingSecret) {
      throw new ForbiddenException("Invalid secret");
    }

    const users = await this.prisma.user.findMany({
      select: { email: true, name: true, language: true },
      orderBy: { createdAt: "asc" },
    });

    const result = await this.resendAudiences.syncAll(users);
    return {
      total: users.length,
      ...result,
    };
  }

  /**
   * Apollo reply webhook — lead responded to email sequence.
   * POST /sales-ops/webhooks/apollo/reply
   */
  @Post("webhooks/apollo/reply")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async handleApolloReply(
    @Headers("x-apollo-signature") signature: string,
    @Body() body: any,
  ) {
    this.verifyWebhookSecret(signature, body, "APOLLO_WEBHOOK_SECRET");
    this.logger.log(`Apollo reply webhook received`);
    try {
      await this.salesOpsService.handleApolloReply({
        email: body.email || body.contact?.email,
        first_name: body.first_name || body.contact?.first_name,
        last_name: body.last_name || body.contact?.last_name,
        company: body.company || body.contact?.organization_name,
        company_domain:
          body.company_domain || body.contact?.organization?.domain,
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
  @Post("webhooks/apollo/open")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async handleApolloOpen(
    @Headers("x-apollo-signature") signature: string,
    @Body() body: any,
  ) {
    this.verifyWebhookSecret(signature, body, "APOLLO_WEBHOOK_SECRET");
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
  @Post("webhooks/tally/feedback")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async handleTallyFeedback(@Body() body: any) {
    const tallySecret = this.configService.get<string>("TALLY_WEBHOOK_SECRET");
    if (tallySecret && body?.webhookSecret !== tallySecret) {
      throw new ForbiddenException("Invalid Tally webhook secret");
    }
    this.logger.log(`Tally feedback webhook received`);
    try {
      // Parse Tally webhook format
      const fields = body.data?.fields || [];
      const answers: Record<string, string> = {};
      let email = "";
      let npsScore: number | undefined;
      let campaignName: string | undefined;

      for (const field of fields) {
        const label = field.label || field.key || "";
        const value = field.value ?? "";

        if (label.toLowerCase() === "email" || field.key === "email") {
          email = typeof value === "string" ? value : "";
        } else if (
          label.toLowerCase().includes("campaignname") ||
          field.key === "campaignName"
        ) {
          campaignName = typeof value === "string" ? value : "";
        } else if (
          label.toLowerCase().includes("nps") ||
          label.toLowerCase().includes("ocen")
        ) {
          npsScore =
            typeof value === "number"
              ? value
              : parseInt(value, 10) || undefined;
          answers[label] = String(value);
        } else {
          answers[label] = String(value);
        }
      }

      if (!email) {
        // Try hidden fields
        const hiddenFields = body.data?.hiddenFields || {};
        email = hiddenFields.email || hiddenFields.Email || "";
      }

      if (!campaignName) {
        const hiddenFields = body.data?.hiddenFields || {};
        campaignName =
          hiddenFields.campaignName || hiddenFields.CampaignName || "";
      }

      if (email) {
        await this.salesOpsService.handleTallyFeedback({
          email,
          campaignName,
          npsScore,
          answers,
        });
      } else {
        this.logger.warn("Tally webhook: no email found in payload");
      }
    } catch (error) {
      this.logger.error(`Tally feedback webhook error: ${error.message}`);
    }
    return { received: true };
  }
}
