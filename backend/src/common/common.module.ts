import { Module, Global } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { GeminiService } from './services/gemini.service';
import { GoogleSearchService } from './services/google-search.service';
import { ErrorTrackingService } from './services/error-tracking.service';
import { HealthService } from './services/health.service';
import { DatabaseExplorerService } from './services/database-explorer.service';
import { ApiUsageService } from './services/api-usage.service';
import { HealthController } from './controllers/health.controller';
import { DatabaseExplorerController } from './controllers/database-explorer.controller';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
    imports: [EmailModule, AuthModule],
    controllers: [HealthController, DatabaseExplorerController],
    providers: [
        ApiUsageService,
        GeminiService,
        GoogleSearchService,
        ErrorTrackingService,
        HealthService,
        DatabaseExplorerService,
        NotificationService,
    ],
    exports: [
        ApiUsageService,
        GeminiService,
        GoogleSearchService,
        ErrorTrackingService,
        HealthService,
        DatabaseExplorerService,
        NotificationService,
    ],
})
export class CommonModule { }


