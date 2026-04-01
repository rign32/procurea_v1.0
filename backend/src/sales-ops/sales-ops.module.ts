import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { SalesOpsController } from "./sales-ops.controller";
import { SalesOpsService } from "./sales-ops.service";
import { AttioService } from "./attio.service";
import { SlackNotificationsService } from "./slack-notifications.service";
import { ApolloApiService } from "./apollo-api.service";
import { ApolloPollingService } from "./apollo-polling.service";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SalesOpsController],
  providers: [
    SalesOpsService,
    AttioService,
    SlackNotificationsService,
    ApolloApiService,
    ApolloPollingService,
  ],
  exports: [SalesOpsService, SlackNotificationsService],
})
export class SalesOpsModule {}
