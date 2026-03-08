import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailPreviewController } from './email-preview.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [EmailPreviewController],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
