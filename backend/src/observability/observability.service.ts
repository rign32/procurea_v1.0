/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SlackNotificationsService } from "../sales-ops/slack-notifications.service";

type EventCategory = "auth" | "conversion" | "campaign" | "error" | "monitoring";
type EventSeverity = "info" | "warning" | "error" | "critical";

interface RecordEventOptions {
  title: string;
  message?: string;
  userId?: string;
  userEmail?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}

const SEVERITY_ICONS: Record<EventSeverity, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "🚨",
  critical: "🔴",
};

const CATEGORY_ICONS: Record<string, string> = {
  registration_blocked: "⛔",
  login_failed: "🔐",
  registration_abandoned: "👻",
  trial_exhausted: "⏳",
  plan_viewed: "📊",
  checkout_started: "🛒",
  non_converting_reminder: "💡",
  low_supplier_count: "⚠️",
  pipeline_timeout: "⏰",
  pipeline_error: "🔴",
  pipeline_crash: "🔴",
  backend_error: "🚨",
  smoke_test: "🔍",
  service_down: "🔴",
  service_recovered: "🟢",
  incident_reminder: "🔶",
};

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slack: SlackNotificationsService,
  ) {}

  async recordEvent(
    category: EventCategory,
    type: string,
    severity: EventSeverity,
    options: RecordEventOptions,
  ): Promise<void> {
    try {
      // Save to database
      const event = await this.prisma.observabilityEvent.create({
        data: {
          category,
          type,
          severity,
          title: options.title,
          message: options.message,
          userId: options.userId,
          userEmail: options.userEmail,
          campaignId: options.campaignId,
          metadata: options.metadata ?? undefined,
          slackSent: false,
        },
      });

      // Send to Slack for warning+ severity
      if (severity !== "info") {
        const slackSent = await this.sendToSlack(
          category,
          type,
          severity,
          options,
        );
        if (slackSent) {
          await this.prisma.observabilityEvent
            .update({
              where: { id: event.id },
              data: { slackSent: true },
            })
            .catch(() => {}); // non-blocking
        }
      }

      this.logger.log(
        `[${severity.toUpperCase()}] ${category}/${type}: ${options.title}`,
      );
    } catch (err) {
      this.logger.error(`Failed to record observability event: ${err.message}`);
    }
  }

  private async sendToSlack(
    category: EventCategory,
    type: string,
    severity: EventSeverity,
    options: RecordEventOptions,
  ): Promise<boolean> {
    const icon = CATEGORY_ICONS[type] || SEVERITY_ICONS[severity];

    const fields: Array<{ label: string; value: string }> = [];
    if (options.userEmail)
      fields.push({ label: "Email", value: options.userEmail });
    if (options.userId)
      fields.push({ label: "User ID", value: options.userId });
    if (options.campaignId)
      fields.push({ label: "Campaign", value: options.campaignId });
    if (options.message)
      fields.push({
        label: "Szczegóły",
        value: options.message.substring(0, 300),
      });

    // Route to appropriate channel: campaign/error/monitoring → alerts, auth/conversion → sales
    const channelId =
      category === "campaign" || category === "error" || category === "monitoring"
        ? this.slack.alertsChannelId || undefined
        : undefined; // undefined = default sales channel

    return this.slack.sendAlert({
      icon,
      title: options.title,
      fields,
      footer: `Observability • ${category}/${type} • ${severity}`,
      channelId,
    });
  }

  /**
   * Send a batch summary to Slack (for daily digests).
   */
  async sendDigest(opts: {
    icon: string;
    title: string;
    fields: Array<{ label: string; value: string }>;
    footer?: string;
    channelId?: string;
  }): Promise<boolean> {
    return this.slack.sendAlert(opts);
  }

  /**
   * Query events for admin portal.
   */
  async getEvents(filters: {
    category?: string;
    severity?: string;
    type?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.severity) where.severity = filters.severity;
    if (filters.type) where.type = filters.type;

    const [events, total] = await Promise.all([
      this.prisma.observabilityEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit,
        skip: filters.offset,
      }),
      this.prisma.observabilityEvent.count({ where }),
    ]);

    return { events, total };
  }
}
