import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './services/integrations.service';
import { SupplierMatchingService } from './services/supplier-matching.service';
import { MergeDevAdapter } from './adapters/merge-dev.adapter';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [IntegrationsController],
    providers: [IntegrationsService, SupplierMatchingService, MergeDevAdapter],
    exports: [IntegrationsService, SupplierMatchingService],
})
export class IntegrationsModule {}
