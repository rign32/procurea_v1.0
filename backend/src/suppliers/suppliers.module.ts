import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { QualityScoreService } from './quality-score.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SuppliersController],
    providers: [SuppliersService, QualityScoreService],
    exports: [SuppliersService, QualityScoreService],
})
export class SuppliersModule { }
