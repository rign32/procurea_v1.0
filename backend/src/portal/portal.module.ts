import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { UploadsModule } from '../uploads/uploads.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
    imports: [PrismaModule, CommonModule, UploadsModule, SuppliersModule],
    controllers: [PortalController],
    providers: [PortalService],
})
export class PortalModule {}
