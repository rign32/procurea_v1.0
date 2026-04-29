import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SetupController } from './setup.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { LeadMagnetsController } from './lead-magnets/lead-magnets.controller';
import { LeadMagnetsService } from './lead-magnets/lead-magnets.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
    imports: [EmailModule, AuthModule, ObservabilityModule],
    controllers: [AdminController, SetupController, LeadMagnetsController],
    providers: [AdminService, AdminGuard, LeadMagnetsService],
    exports: [AdminService],
})
export class AdminModule { }
