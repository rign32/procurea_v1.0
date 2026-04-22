import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

@Module({
    imports: [PrismaModule, EmailModule, PurchaseOrdersModule],
    controllers: [ContractsController],
    providers: [ContractsService],
})
export class ContractsModule {}
