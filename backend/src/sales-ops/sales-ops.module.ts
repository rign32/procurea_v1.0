import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SalesOpsController } from './sales-ops.controller';
import { SalesOpsService } from './sales-ops.service';
import { AttioService } from './attio.service';
import { SlackNotificationsService } from './slack-notifications.service';

@Module({
    imports: [ConfigModule],
    controllers: [SalesOpsController],
    providers: [SalesOpsService, AttioService, SlackNotificationsService],
    exports: [SalesOpsService, SlackNotificationsService],
})
export class SalesOpsModule {}
