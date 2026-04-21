import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { CounterOfferAiService } from './counter-offer-ai.service';
import { WeightedRankingService } from './weighted-ranking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, CommonModule, EmailModule],
    controllers: [RequestsController],
    providers: [RequestsService, CounterOfferAiService, WeightedRankingService],
    exports: [RequestsService, CounterOfferAiService, WeightedRankingService],
})
export class RequestsModule { }
