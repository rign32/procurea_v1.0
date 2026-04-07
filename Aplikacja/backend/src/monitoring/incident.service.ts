import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ObservabilityService } from "../observability/observability.service";

interface ServiceCheckResult {
  serviceId: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTimeMs: number;
  message: string;
}

const SUGGESTED_ACTIONS: Record<string, string> = {
  database: "Sprawdź Cloud SQL instance w GCP console",
  gemini: "Sprawdź Gemini API quotas i klucz API",
  serper: "Sprawdź SERPER_API_KEY w GCP Secret Manager",
  resend: "Sprawdź RESEND_API_KEY i status konta Resend",
  app_pl: "Sprawdź Firebase Hosting i Cloud Functions (app.procurea.pl)",
  app_io: "Sprawdź Firebase Hosting i Cloud Functions (app.procurea.io)",
};

const SERVICE_LABELS: Record<string, string> = {
  database: "Database (PostgreSQL)",
  gemini: "Gemini API",
  serper: "Serper.dev API",
  resend: "Resend Email API",
  app_pl: "App PL (procurea.pl)",
  app_io: "App EN (procurea.io)",
};

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly observability: ObservabilityService,
  ) {}

  async processResults(
    services: Record<string, ServiceCheckResult>,
  ): Promise<void> {
    for (const [serviceId, result] of Object.entries(services)) {
      try {
        await this.processServiceResult(serviceId, result);
      } catch (err) {
        this.logger.error(
          `Failed to process incident for ${serviceId}: ${err.message}`,
        );
      }
    }
  }

  private async processServiceResult(
    serviceId: string,
    result: ServiceCheckResult,
  ): Promise<void> {
    const openIncident = await this.prisma.monitoringIncident.findFirst({
      where: { serviceId, status: "open" },
      orderBy: { startedAt: "desc" },
    });

    const isDown = result.status === "unhealthy" || result.status === "degraded";
    const label = SERVICE_LABELS[serviceId] || serviceId;

    if (!isDown && openIncident) {
      // Service recovered — close incident
      const now = new Date();
      const durationMs = now.getTime() - openIncident.startedAt.getTime();

      await this.prisma.monitoringIncident.update({
        where: { id: openIncident.id },
        data: { status: "resolved", resolvedAt: now, durationMs },
      });

      const durationStr = this.formatDuration(durationMs);

      // Send recovery notification via sendDigest (info severity skips Slack in recordEvent)
      await this.observability.sendDigest({
        icon: "🟢",
        title: `Service RECOVERED: ${label}`,
        fields: [
          { label: "Service", value: serviceId },
          { label: "Czas trwania awarii", value: durationStr },
          { label: "Dashboard", value: "https://admin.procurea.pl/status" },
        ],
        footer: `Monitoring • service_recovered • info`,
        channelId: undefined, // will use alerts channel if configured
      });

      this.logger.log(`Incident resolved for ${serviceId} (${durationStr})`);
    } else if (isDown && !openIncident) {
      // New incident — create and alert
      const severity =
        serviceId === "database" || result.status === "unhealthy"
          ? "critical"
          : "warning";

      await this.prisma.monitoringIncident.create({
        data: {
          serviceId,
          status: "open",
          severity,
          title: `Service DOWN: ${label}`,
          message: result.message,
          metadata: { responseTimeMs: result.responseTimeMs } as any,
        },
      });

      // Alert goes via recordEvent (severity >= warning → Slack automatically)
      await this.observability.recordEvent(
        "monitoring",
        "service_down",
        severity as any,
        {
          title: `Service DOWN: ${label}`,
          message: result.message,
          metadata: {
            serviceId,
            responseTimeMs: result.responseTimeMs,
            suggestedAction: SUGGESTED_ACTIONS[serviceId],
            dashboardUrl: "https://admin.procurea.pl/status",
          },
        },
      );

      this.logger.warn(`New incident opened for ${serviceId}`);
    } else if (isDown && openIncident) {
      // Ongoing incident — check if hourly reminder needed
      const now = new Date();
      const hoursSinceLastAlert =
        (now.getTime() - openIncident.lastAlertAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastAlert >= 1) {
        const durationMs = now.getTime() - openIncident.startedAt.getTime();
        const durationStr = this.formatDuration(durationMs);

        await this.prisma.monitoringIncident.update({
          where: { id: openIncident.id },
          data: { lastAlertAt: now },
        });

        await this.observability.sendDigest({
          icon: "🔶",
          title: `Reminder: ${label} nadal DOWN`,
          fields: [
            { label: "Service", value: serviceId },
            { label: "Down od", value: durationStr },
            { label: "Akcja", value: SUGGESTED_ACTIONS[serviceId] || "Sprawdź logi" },
            { label: "Dashboard", value: "https://admin.procurea.pl/status" },
          ],
          footer: `Monitoring • incident_reminder • ${openIncident.severity}`,
        });

        this.logger.warn(`Hourly reminder sent for ${serviceId}`);
      }
      // else: skip (deduplication)
    }
    // else: healthy and no open incident — nothing to do
  }

  async getOpenIncidents() {
    return this.prisma.monitoringIncident.findMany({
      where: { status: "open" },
      orderBy: { startedAt: "desc" },
    });
  }

  async getRecentIncidents(hours: number) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    return this.prisma.monitoringIncident.findMany({
      where: {
        OR: [
          { status: "open" },
          { resolvedAt: { gte: since } },
        ],
      },
      orderBy: { startedAt: "desc" },
    });
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMin = minutes % 60;
    if (hours < 24) return `${hours}h ${remainingMin}min`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
}
