import {
  Controller,
  Post,
  Headers,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";
import { SmokeTestService } from "./smoke-test.service";
import * as crypto from "crypto";

@Controller("cron")
export class MonitoringCronController {
  constructor(
    private readonly smokeTestService: SmokeTestService,
    private readonly configService: ConfigService,
  ) {}

  @Post("smoke-tests")
  @SkipThrottle()
  async runSmokeTests(@Headers("x-cron-secret") secret: string) {
    const expectedSecret = this.configService.get<string>("CRON_SECRET");
    if (expectedSecret) {
      if (!secret) {
        throw new ForbiddenException("Missing cron secret");
      }
      const secretBuf = Buffer.from(secret, "utf8");
      const expectedBuf = Buffer.from(expectedSecret, "utf8");
      if (
        secretBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(secretBuf, expectedBuf)
      ) {
        throw new ForbiddenException("Invalid cron secret");
      }
    }

    const result = await this.smokeTestService.runSmokeTests();
    return { ok: true, status: result.overallStatus };
  }
}
