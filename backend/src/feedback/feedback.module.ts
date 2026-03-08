import { Module } from '@nestjs/common';
import { FeedbackSchedulerService } from './feedback-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, EmailModule],
    providers: [FeedbackSchedulerService],
})
export class FeedbackModule {}
