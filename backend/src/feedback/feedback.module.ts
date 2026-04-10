import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesOpsModule } from '../sales-ops/sales-ops.module';

@Module({
  imports: [PrismaModule, SalesOpsModule],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
