import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourcingModule } from './sourcing/sourcing.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RequestsModule } from './requests/requests.module';
import { SequencesModule } from './sequences/sequences.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrganizationModule } from './organization/organization.module';
import { PortalModule } from './portal/portal.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReportsModule } from './reports/reports.module';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuthMeLoggerMiddleware } from './common/middleware/auth-me-logger.middleware';

import { PostHogModule } from './posthog/posthog.module';
import { BillingModule } from './billing/billing.module';
import { SalesOpsModule } from './sales-ops/sales-ops.module';
import { ObservabilityModule } from './observability/observability.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { FeedbackModule } from './feedback/feedback.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { ScheduledReportsModule } from './scheduled-reports/scheduled-reports.module';
import { PublicApiModule } from './public-api/public-api.module';
import { RolesModule } from './roles/roles.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { DocumentsModule } from './documents/documents.module';
import { ContractsModule } from './contracts/contracts.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { NotificationsCenterModule } from './notifications-center/notifications-center.module';
import { LeadsModule } from './leads/leads.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,   // 60 seconds window
        limit: 60,    // 60 requests per minute per IP (global default)
      }],
    }),
    LoggerModule,
    CommonModule,
    SourcingModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    EmailModule,
    RequestsModule,
    SequencesModule,
    SuppliersModule,
    OrganizationModule,
    PortalModule,
    UploadsModule,
    ReportsModule,
    PostHogModule,
    BillingModule,
    SalesOpsModule,
    ObservabilityModule,
    MonitoringModule,
    FeedbackModule,
    CollaborationModule,
    ScheduledReportsModule,
    PublicApiModule,
    RolesModule,
    ApprovalsModule,
    DocumentsModule,
    ContractsModule,
    WorkspacesModule,
    NotificationsCenterModule,
    LeadsModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');

    consumer
      .apply(AuthMeLoggerMiddleware)
      .forRoutes('auth/me');
  }
}
