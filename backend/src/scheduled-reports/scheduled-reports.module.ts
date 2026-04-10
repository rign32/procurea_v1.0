import { Module } from '@nestjs/common';
import { ScheduledReportsController } from './scheduled-reports.controller';
import { ScheduledReportsService } from './scheduled-reports.service';
import { ReportsModule } from '../reports/reports.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [ReportsModule, EmailModule],
    controllers: [ScheduledReportsController],
    providers: [ScheduledReportsService],
})
export class ScheduledReportsModule {}
