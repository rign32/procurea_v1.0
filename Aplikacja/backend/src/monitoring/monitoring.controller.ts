import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../admin/admin.guard";
import { PrismaService } from "../prisma/prisma.service";
import { IncidentService } from "./incident.service";
import { SmokeTestResult } from "./smoke-test.service";

@Controller("monitoring")
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentService: IncidentService,
  ) {}

  @Get("status")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  async getStatus() {
    const latestEvent = await this.prisma.observabilityEvent.findFirst({
      where: { category: "monitoring", type: "smoke_test" },
      orderBy: { createdAt: "desc" },
    });

    const openIncidents = await this.incidentService.getOpenIncidents();

    return {
      lastCheck: latestEvent?.createdAt || null,
      result: (latestEvent?.metadata as unknown as SmokeTestResult) || null,
      openIncidents,
    };
  }

  @Get("history")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  async getHistory(@Query("hours") hours?: string) {
    const h = Math.min(parseInt(hours || "24", 10) || 24, 168); // max 7 days
    const since = new Date(Date.now() - h * 3600 * 1000);

    const events = await this.prisma.observabilityEvent.findMany({
      where: {
        category: "monitoring",
        type: "smoke_test",
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const incidents = await this.incidentService.getRecentIncidents(h);

    // Compute uptime per service
    const uptimeByService = this.computeUptime(events);

    return { events, incidents, uptimeByService };
  }

  @Get("incidents")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  async getIncidents(@Query("status") status?: string) {
    const where: any = {};
    if (status === "open" || status === "resolved") {
      where.status = status;
    }

    return this.prisma.monitoringIncident.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 50,
    });
  }

  private computeUptime(
    events: Array<{ metadata: any; createdAt: Date }>,
  ): Record<string, { uptimePercent: number; avgResponseTimeMs: number }> {
    const serviceStats: Record<
      string,
      { total: number; healthy: number; totalResponseTime: number; healthyCount: number }
    > = {};

    for (const event of events) {
      const result = event.metadata as unknown as SmokeTestResult;
      if (!result?.services) continue;

      for (const [serviceId, check] of Object.entries(result.services)) {
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = {
            total: 0,
            healthy: 0,
            totalResponseTime: 0,
            healthyCount: 0,
          };
        }
        const stats = serviceStats[serviceId];
        stats.total++;
        if (check.status === "healthy") {
          stats.healthy++;
          stats.totalResponseTime += check.responseTimeMs || 0;
          stats.healthyCount++;
        }
      }
    }

    const result: Record<
      string,
      { uptimePercent: number; avgResponseTimeMs: number }
    > = {};

    for (const [serviceId, stats] of Object.entries(serviceStats)) {
      result[serviceId] = {
        uptimePercent:
          stats.total > 0
            ? Math.round((stats.healthy / stats.total) * 10000) / 100
            : 0,
        avgResponseTimeMs:
          stats.healthyCount > 0
            ? Math.round(stats.totalResponseTime / stats.healthyCount)
            : 0,
      };
    }

    return result;
  }
}
