import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { HealthService } from "../common/services/health.service";
import { ObservabilityService } from "../observability/observability.service";
import { IncidentService } from "./incident.service";
import { Resend } from "resend";

interface ServiceCheckResult {
  serviceId: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTimeMs: number;
  message: string;
}

export interface SmokeTestResult {
  timestamp: Date;
  overallStatus: "healthy" | "degraded" | "unhealthy";
  services: Record<string, ServiceCheckResult>;
  durationMs: number;
}

@Injectable()
export class SmokeTestService {
  private readonly logger = new Logger(SmokeTestService.name);

  constructor(
    private readonly healthService: HealthService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly observability: ObservabilityService,
    private readonly incidentService: IncidentService,
  ) {}

  async runSmokeTests(): Promise<SmokeTestResult> {
    const startTime = Date.now();
    this.logger.log("Starting smoke tests...");

    const checks = await Promise.allSettled([
      this.checkApp("app_pl", "https://app.procurea.pl"),
      this.checkApp("app_io", "https://app.procurea.io"),
      this.checkGemini(),
      this.checkSerper(),
      this.checkDatabase(),
      this.checkResend(),
    ]);

    const services: Record<string, ServiceCheckResult> = {};
    for (const result of checks) {
      if (result.status === "fulfilled") {
        services[result.value.serviceId] = result.value;
      } else {
        // Promise.allSettled rejected — shouldn't happen with try/catch inside each check
        this.logger.error(`Smoke test check rejected: ${result.reason}`);
      }
    }

    const overallStatus = this.computeOverallStatus(services);
    const durationMs = Date.now() - startTime;

    const smokeResult: SmokeTestResult = {
      timestamp: new Date(),
      overallStatus,
      services,
      durationMs,
    };

    // Determine severity for observability event
    const severity = this.computeSeverity(services);

    // Persist to ObservabilityEvent
    try {
      await this.observability.recordEvent(
        "monitoring",
        "smoke_test",
        severity as any,
        {
          title: `Smoke Test: ${overallStatus}`,
          message: this.buildSummaryMessage(services),
          metadata: smokeResult as any,
        },
      );
    } catch (err) {
      this.logger.error(`Failed to record smoke test event: ${err.message}`);
    }

    // Process incident lifecycle
    try {
      await this.incidentService.processResults(services);
    } catch (err) {
      this.logger.error(`Failed to process incidents: ${err.message}`);
    }

    this.logger.log(
      `Smoke tests completed in ${durationMs}ms — ${overallStatus}`,
    );
    return smokeResult;
  }

  private async checkApp(
    serviceId: string,
    url: string,
  ): Promise<ServiceCheckResult> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - start;

      if (response.ok) {
        return {
          serviceId,
          status: "healthy",
          responseTimeMs,
          message: `HTTP ${response.status}`,
        };
      }
      return {
        serviceId,
        status: response.status >= 500 ? "unhealthy" : "degraded",
        responseTimeMs,
        message: `HTTP ${response.status}`,
      };
    } catch (err) {
      return {
        serviceId,
        status: "unhealthy",
        responseTimeMs: Date.now() - start,
        message: err.name === "AbortError" ? "Timeout (10s)" : err.message,
      };
    }
  }

  private async checkGemini(): Promise<ServiceCheckResult> {
    const start = Date.now();
    try {
      const health = await this.healthService.checkGeminiHealth(true);
      return {
        serviceId: "gemini",
        status: health.status,
        responseTimeMs: Date.now() - start,
        message: health.message || "OK",
      };
    } catch (err) {
      return {
        serviceId: "gemini",
        status: "unhealthy",
        responseTimeMs: Date.now() - start,
        message: err.message,
      };
    }
  }

  private async checkSerper(): Promise<ServiceCheckResult> {
    const start = Date.now();
    try {
      // Shallow check only — deep check costs $0.001 per call
      const health = await this.healthService.checkSerperHealth(false);
      return {
        serviceId: "serper",
        status: health.status,
        responseTimeMs: Date.now() - start,
        message: health.message || "OK",
      };
    } catch (err) {
      return {
        serviceId: "serper",
        status: "unhealthy",
        responseTimeMs: Date.now() - start,
        message: err.message,
      };
    }
  }

  private async checkDatabase(): Promise<ServiceCheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        serviceId: "database",
        status: "healthy",
        responseTimeMs: Date.now() - start,
        message: "OK",
      };
    } catch (err) {
      return {
        serviceId: "database",
        status: "unhealthy",
        responseTimeMs: Date.now() - start,
        message: err.message,
      };
    }
  }

  private async checkResend(): Promise<ServiceCheckResult> {
    const start = Date.now();
    const apiKey = this.configService.get<string>("RESEND_API_KEY");

    if (!apiKey) {
      return {
        serviceId: "resend",
        status: "unhealthy",
        responseTimeMs: Date.now() - start,
        message: "RESEND_API_KEY not configured",
      };
    }

    try {
      const resend = new Resend(apiKey);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await resend.apiKeys.list();
      clearTimeout(timeout);

      return {
        serviceId: "resend",
        status: "healthy",
        responseTimeMs: Date.now() - start,
        message: "OK",
      };
    } catch (err) {
      return {
        serviceId: "resend",
        status: err.message?.includes("401") ? "unhealthy" : "degraded",
        responseTimeMs: Date.now() - start,
        message: err.message,
      };
    }
  }

  private computeOverallStatus(
    services: Record<string, ServiceCheckResult>,
  ): "healthy" | "degraded" | "unhealthy" {
    const results = Object.values(services);
    const unhealthyCount = results.filter((r) => r.status === "unhealthy").length;
    const degradedCount = results.filter((r) => r.status === "degraded").length;

    if (unhealthyCount > 0) return "unhealthy";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  }

  private computeSeverity(
    services: Record<string, ServiceCheckResult>,
  ): "info" | "warning" | "critical" {
    const results = Object.values(services);
    const unhealthyCount = results.filter((r) => r.status === "unhealthy").length;
    const degradedCount = results.filter((r) => r.status === "degraded").length;
    const dbDown = services["database"]?.status === "unhealthy";

    if (unhealthyCount >= 2 || dbDown) return "critical";
    if (unhealthyCount > 0 || degradedCount > 0) return "warning";
    return "info";
  }

  private buildSummaryMessage(
    services: Record<string, ServiceCheckResult>,
  ): string {
    return Object.values(services)
      .filter((s) => s.status !== "healthy")
      .map((s) => `${s.serviceId}: ${s.status} (${s.message})`)
      .join(", ") || "All services healthy";
  }
}
