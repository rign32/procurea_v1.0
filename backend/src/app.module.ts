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

import { FeedbackModule } from './feedback/feedback.module';
import { PostHogModule } from './posthog/posthog.module';
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
    FeedbackModule,
    PostHogModule,
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
