import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourcingModule } from './sourcing/sourcing.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { RequestsModule } from './requests/requests.module';
import { SequencesModule } from './sequences/sequences.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrganizationModule } from './organization/organization.module';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuthMeLoggerMiddleware } from './common/middleware/auth-me-logger.middleware';

import { PostHogModule } from './posthog/posthog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PostHogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
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
