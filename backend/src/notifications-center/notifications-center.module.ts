import { Module } from '@nestjs/common';
import { NotificationsCenterController } from './notifications-center.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsCenterController],
})
export class NotificationsCenterModule {}
