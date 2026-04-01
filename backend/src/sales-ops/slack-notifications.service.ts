/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface SlackMessage {
  icon: string;
  title: string;
  fields: Array<{ label: string; value: string }>;
  color?: string;
  footer?: string;
}

@Injectable()
export class SlackNotificationsService {
  private readonly logger = new Logger(SlackNotificationsService.name);
  private readonly botToken: string;
  private readonly channelId: string;
  readonly alertsChannelId: string;

  get isEnabled(): boolean {
    return !!(this.botToken && this.channelId);
  }

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>("SLACK_BOT_TOKEN") || "";
    this.channelId = this.configService.get<string>("SLACK_CHANNEL_ID") || "";
    this.alertsChannelId =
      this.configService.get<string>("SLACK_ALERTS_CHANNEL_ID") || "";

    if (!this.botToken || !this.channelId) {
      this.logger.warn(
        "SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not configured — Slack notifications disabled",
      );
    } else {
      this.logger.log("Slack notifications initialized");
    }
  }

  private async send(
    message: SlackMessage,
    channelOverride?: string,
  ): Promise<boolean> {
    const channel = channelOverride || this.channelId;
    if (!this.botToken || !channel) {
      this.logger.warn(`Slack disabled, skipping: ${message.title}`);
      return false;
    }

    const fieldsText = message.fields
      .map((f) => `*${f.label}:* ${f.value}`)
      .join("\n");

    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        text: `${message.icon} ${message.title}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${message.icon} *${message.title}*`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: fieldsText,
            },
          },
          ...(message.footer
            ? [
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: message.footer,
                    },
                  ],
                },
              ]
            : []),
        ],
      }),
    });

    if (!res.ok) {
      this.logger.error(`Slack API error: ${res.status}`);
      return false;
    }

    const data = await res.json();
    if (!data.ok) {
      this.logger.error(`Slack API error: ${data.error}`);
      return false;
    }

    this.logger.log(`Slack notification sent: ${message.title}`);
    return true;
  }

  // --- Notification templates ---

  private attioFooter(
    attioOk: boolean | undefined,
    successMsg: string,
  ): string {
    if (attioOk === true) return `✅ ${successMsg}`;
    if (attioOk === false) return `⚠️ Attio: FAILED — deal nie zaktualizowany`;
    return successMsg;
  }

  async notifyApolloReply(
    email: string,
    name: string,
    sequenceName?: string,
    attioOk?: boolean,
  ): Promise<boolean> {
    return this.send({
      icon: "📤",
      title: "Apollo — Odpowiedź na sekwencję",
      fields: [
        { label: "Kontakt", value: name || email },
        { label: "Email", value: email },
        ...(sequenceName ? [{ label: "Sekwencja", value: sequenceName }] : []),
      ],
      footer: this.attioFooter(attioOk, "Attio: deal utworzony w etapie Outreach"),
    });
  }

  async notifyApolloOpen(email: string, name: string): Promise<boolean> {
    return this.send({
      icon: "👀",
      title: "Apollo — Email otwarty",
      fields: [
        { label: "Kontakt", value: name || email },
        { label: "Email", value: email },
      ],
    });
  }

  async notifyRegistration(
    email: string,
    name: string,
    company?: string,
    attioOk?: boolean,
    source?: string,
  ): Promise<boolean> {
    return this.send({
      icon: "🎉",
      title: "Nowa rejestracja na procurea.io",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        ...(company ? [{ label: "Firma", value: company }] : []),
        ...(source ? [{ label: "Źródło", value: source }] : []),
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap Rejestracja"),
    });
  }

  async notifyFeedback(
    email: string,
    name: string,
    npsScore?: number,
    campaignName?: string,
    attioOk?: boolean,
  ): Promise<boolean> {
    return this.send({
      icon: "📝",
      title: "Feedback — ankieta wypełniona",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        ...(npsScore != null
          ? [{ label: "NPS", value: `${npsScore}/10` }]
          : []),
        ...(campaignName ? [{ label: "Kampania", value: campaignName }] : []),
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap Feedback + notatka z odpowiedziami"),
    });
  }

  async notifyPayment(
    email: string,
    name: string,
    amount: number,
    currency: string,
    plan?: string,
    attioOk?: boolean,
  ): Promise<boolean> {
    const formatted = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
    }).format(amount / 100);
    return this.send({
      icon: "💰",
      title: "Stripe — Nowa płatność",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        { label: "Kwota", value: formatted },
        ...(plan ? [{ label: "Plan", value: plan }] : []),
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap Płatność"),
    });
  }

  async notifySubscriptionCreated(
    email: string,
    name: string,
    amount: number,
    currency: string,
    attioOk?: boolean,
  ): Promise<boolean> {
    const formatted = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
    }).format(amount / 100);
    return this.send({
      icon: "🏆",
      title: "Won — Nowa subskrypcja!",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        { label: "MRR", value: formatted },
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap Won 🎉"),
    });
  }

  async notifySubscriptionCanceled(
    email: string,
    name: string,
    attioOk?: boolean,
  ): Promise<boolean> {
    return this.send({
      icon: "❌",
      title: "Subskrypcja anulowana",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap Lost"),
    });
  }

  async notifyAiSourcingCompleted(
    email: string,
    name: string,
    campaignName: string,
    suppliersFound: number,
    elapsedSeconds: number,
    isTrialCredit: boolean,
    attioOk?: boolean,
  ): Promise<boolean> {
    return this.send({
      icon: "🔍",
      title: "AI Sourcing zakończony",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        { label: "Kampania", value: campaignName },
        { label: "Dostawcy", value: `${suppliersFound}` },
        { label: "Czas", value: `${Math.round(elapsedSeconds / 60)} min` },
        { label: "Kredyt", value: isTrialCredit ? "🆓 Trial" : "💳 Płatny" },
      ],
      footer: this.attioFooter(attioOk, "Attio: deal → etap AI Sourcing"),
    });
  }

  async notifyTrialExhausted(
    email: string,
    name: string,
    campaignName: string,
  ): Promise<boolean> {
    return this.send({
      icon: "🏁",
      title: "Trial credits wyczerpane",
      fields: [
        { label: "Użytkownik", value: name || email },
        { label: "Email", value: email },
        { label: "Ostatnia kampania", value: campaignName },
      ],
      footer: "Następny krok: konwersja na płatny plan",
    });
  }

  /**
   * Public method for sending observability alerts.
   * Supports optional channelId override (e.g., alerts vs sales channel).
   */
  async sendAlert(opts: {
    icon: string;
    title: string;
    fields: Array<{ label: string; value: string }>;
    color?: string;
    footer?: string;
    channelId?: string;
  }): Promise<boolean> {
    return this.send(
      {
        icon: opts.icon,
        title: opts.title,
        fields: opts.fields,
        color: opts.color,
        footer: opts.footer,
      },
      opts.channelId,
    );
  }
}
