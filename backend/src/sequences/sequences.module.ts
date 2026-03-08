import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController, CronController } from './sequences.controller';
import { SequenceSchedulerService } from './sequence-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, EmailModule],
    controllers: [SequencesController, CronController],
    providers: [SequencesService, SequenceSchedulerService],
    exports: [SequencesService],
})
export class SequencesModule { }
