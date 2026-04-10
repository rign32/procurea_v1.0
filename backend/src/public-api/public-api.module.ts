import { Module } from '@nestjs/common';
import { PublicApiV1Controller, ApiKeyManagementController } from './public-api.controller';
import { ApiKeyGuard } from './api-key.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PublicApiV1Controller, ApiKeyManagementController],
    providers: [ApiKeyGuard],
})
export class PublicApiModule {}
