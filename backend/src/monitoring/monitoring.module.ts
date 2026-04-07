import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ObservabilityModule } from "../observability/observability.module";
import { SmokeTestService } from "./smoke-test.service";
import { IncidentService } from "./incident.service";
import { MonitoringCronController } from "./monitoring-cron.controller";
import { MonitoringController } from "./monitoring.controller";

@Module({
  imports: [PrismaModule, ObservabilityModule],
  controllers: [MonitoringCronController, MonitoringController],
  providers: [SmokeTestService, IncidentService],
  exports: [SmokeTestService, IncidentService],
})
export class MonitoringModule {}
