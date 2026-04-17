import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PoSyncService } from './po-sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
    imports: [PrismaModule, IntegrationsModule],
    controllers: [PurchaseOrdersController],
    providers: [PurchaseOrdersService, PoSyncService],
    exports: [PurchaseOrdersService, PoSyncService],
})
export class PurchaseOrdersModule {}
