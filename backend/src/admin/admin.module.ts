import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SetupController } from './setup.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [EmailModule, AuthModule],
    controllers: [AdminController, SetupController],
    providers: [AdminService, AdminGuard],
    exports: [AdminService],
})
export class AdminModule { }
