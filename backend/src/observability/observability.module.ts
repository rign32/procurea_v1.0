import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesOpsModule } from '../sales-ops/sales-ops.module';
import { ObservabilityService } from './observability.service';
import { ObservabilitySchedulerService } from './observability-scheduler.service';
import { ObservabilityCronController } from './observability-cron.controller';

@Module({
    imports: [PrismaModule, SalesOpsModule],
    controllers: [ObservabilityCronController],
    providers: [ObservabilityService, ObservabilitySchedulerService],
    exports: [ObservabilityService],
})
export class ObservabilityModule {}
