import { Module, Global, forwardRef } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { GeminiService } from './services/gemini.service';
import { GoogleSearchService } from './services/google-search.service';
import { CurrencyService } from './services/currency.service';
import { ErrorTrackingService } from './services/error-tracking.service';
import { HealthService } from './services/health.service';
import { DatabaseExplorerService } from './services/database-explorer.service';
import { ApiUsageService } from './services/api-usage.service';
import { TranslationService } from './services/translation.service';
import { VatValidationService } from './services/vat-validation.service';
import { HealthController } from './controllers/health.controller';
import { DatabaseExplorerController } from './controllers/database-explorer.controller';
import { AdminGuard } from '../admin/admin.guard';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { ObservabilityModule } from '../observability/observability.module';

@Global()
@Module({
    imports: [EmailModule, AuthModule, forwardRef(() => ObservabilityModule)],
    controllers: [HealthController, DatabaseExplorerController],
    providers: [
        AdminGuard,
        ApiUsageService,
        CurrencyService,
        GeminiService,
        GoogleSearchService,
        ErrorTrackingService,
        HealthService,
        DatabaseExplorerService,
        NotificationService,
        TranslationService,
        VatValidationService,
    ],
    exports: [
        ApiUsageService,
        CurrencyService,
        GeminiService,
        GoogleSearchService,
        ErrorTrackingService,
        HealthService,
        DatabaseExplorerService,
        NotificationService,
        TranslationService,
        VatValidationService,
    ],
})
export class CommonModule { }


