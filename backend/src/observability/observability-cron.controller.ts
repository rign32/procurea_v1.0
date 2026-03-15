import { Controller, Post, Headers, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";
import { ObservabilitySchedulerService } from "./observability-scheduler.service";

@Controller("cron")
export class ObservabilityCronController {
  constructor(
    private readonly scheduler: ObservabilitySchedulerService,
    private readonly configService: ConfigService,
  ) {}

  @Post("observability/daily")
  @SkipThrottle()
  async dailyCheck(@Headers("x-cron-secret") secret: string) {
    const expectedSecret = this.configService.get<string>("CRON_SECRET");
    if (expectedSecret && secret !== expectedSecret) {
      throw new ForbiddenException("Invalid cron secret");
    }
    await this.scheduler.dailyChecks();
    return { ok: true };
  }
}
