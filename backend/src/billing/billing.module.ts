import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesOpsModule } from '../sales-ops/sales-ops.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
    imports: [ConfigModule, PrismaModule, forwardRef(() => SalesOpsModule), ObservabilityModule],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule {}
