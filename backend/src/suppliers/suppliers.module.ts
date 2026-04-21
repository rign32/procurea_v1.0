import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { QualityScoreService } from './quality-score.service';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificateExpirySchedulerService } from './certificate-expiry-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [PrismaModule, EmailModule, CommonModule],
    controllers: [SuppliersController, CertificatesController],
    providers: [
        SuppliersService,
        QualityScoreService,
        CertificatesService,
        CertificateExpirySchedulerService,
    ],
    exports: [SuppliersService, QualityScoreService, CertificatesService],
})
export class SuppliersModule { }
